<?php
/**
 * Migrates existing debug log files into the LogMate log path when logging is enabled.
 *
 * @package LogMate\Services
 */

namespace LogMate\Services;

/**
 * Copies legacy debug.log content into the plugin-managed log file on enable.
 *
 * @package LogMate
 */
class DebugLogMigrationService {

	/**
	 * Wp-config service instance.
	 *
	 * @var WpConfigService
	 */
	private WpConfigService $wp_config_service;

	/**
	 * Constructor.
	 *
	 * @param WpConfigService|null $wp_config_service Optional wp-config service.
	 */
	public function __construct( ?WpConfigService $wp_config_service = null ) {
		$this->wp_config_service = $wp_config_service ?? new WpConfigService();
	}

	/**
	 * Append content from existing debug log files into the target log path.
	 *
	 * @param string $target_path Absolute path to the LogMate PHP log file.
	 * @return array{ migrated: bool, bytes: int, sources: string[] }
	 */
	public function migrate_existing_logs_to( string $target_path ): array {
		$target_path = $this->resolve_absolute_path( $target_path );
		$result      = array(
			'migrated' => false,
			'bytes'    => 0,
			'sources'  => array(),
		);

		$this->ensure_log_file_exists( $target_path );

		$sources = $this->collect_source_paths( $target_path );
		if ( empty( $sources ) ) {
			return $result;
		}

		$filesystem     = logmate_get_filesystem();
		$target_content = $this->read_file( $target_path, $filesystem );
		$append_buffer  = '';

		foreach ( $sources as $source_path ) {
			$source_content = $this->read_file( $source_path, $filesystem );
			if ( '' === $source_content ) {
				continue;
			}

			// Skip if target already contains this source body (avoid duplicate migration).
			if ( '' !== $target_content && str_contains( $target_content, $source_content ) ) {
				continue;
			}
			if ( '' !== $append_buffer && str_contains( $append_buffer, $source_content ) ) {
				continue;
			}

			if ( '' !== $append_buffer ) {
				$append_buffer .= PHP_EOL;
			}

			$append_buffer .= $source_content;
			$result['sources'][] = $source_path;
		}

		if ( '' === $append_buffer ) {
			return $result;
		}

		$payload = $append_buffer;
		if ( '' !== $target_content ) {
			$payload = rtrim( $target_content ) . PHP_EOL . PHP_EOL . ltrim( $append_buffer );
		}

		if ( ! $this->write_file( $target_path, $payload, $filesystem ) ) {
			return array(
				'migrated' => false,
				'bytes'    => 0,
				'sources'  => array(),
			);
		}

		$result['migrated'] = true;
		$result['bytes']    = strlen( $append_buffer );

		return $result;
	}

	/**
	 * Collect readable log file paths that may hold pre-enable debug output.
	 *
	 * @param string $target_path Target log path to exclude.
	 * @return string[]
	 */
	private function collect_source_paths( string $target_path ): array {
		$candidates = array();

		$config_log_path = $this->wp_config_service->get_wp_debug_log_path_from_config();
		if ( null !== $config_log_path ) {
			$candidates[] = $config_log_path;
		}

		$candidates[] = WP_CONTENT_DIR . '/debug.log';

		$ini_log = ini_get( 'error_log' );
		if ( is_string( $ini_log ) && '' !== $ini_log && $this->looks_like_file_path( $ini_log ) ) {
			$candidates[] = $ini_log;
		}

		$normalized_target = $this->normalize_path_for_compare( $target_path );
		$unique            = array();

		foreach ( $candidates as $candidate ) {
			$absolute = $this->resolve_absolute_path( $candidate );
			$key      = $this->normalize_path_for_compare( $absolute );

			if ( isset( $unique[ $key ] ) || $key === $normalized_target ) {
				continue;
			}

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_readable
			if ( ! is_readable( $absolute ) || ! is_file( $absolute ) ) {
				continue;
			}

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_filesize
			if ( filesize( $absolute ) < 1 ) {
				continue;
			}

			$unique[ $key ] = $absolute;
		}

		return array_values( $unique );
	}

	/**
	 * Resolve a log path to an absolute filesystem path.
	 *
	 * @param string $path Log path.
	 * @return string
	 */
	private function resolve_absolute_path( string $path ): string {
		$path = wp_normalize_path( trim( $path ) );

		if ( $this->wp_config_service->is_absolute_path( $path ) ) {
			return $path;
		}

		return wp_normalize_path( ABSPATH . ltrim( $path, '/' ) );
	}

	/**
	 * Normalize a path for duplicate comparison.
	 *
	 * @param string $path Filesystem path.
	 * @return string
	 */
	private function normalize_path_for_compare( string $path ): string {
		$path = wp_normalize_path( strtolower( $path ) );

		// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		$real = @realpath( $path );
		if ( false !== $real ) {
			return wp_normalize_path( strtolower( $real ) );
		}

		return $path;
	}

	/**
	 * Whether a string looks like a filesystem path (not stderr/stdout).
	 *
	 * @param string $value ini error_log value.
	 * @return bool
	 */
	private function looks_like_file_path( string $value ): bool {
		if ( in_array( strtolower( $value ), array( 'syslog', 'stderr', 'stdout' ), true ) ) {
			return false;
		}

		return str_contains( $value, '/' ) || str_contains( $value, '\\' ) || preg_match( '/^[A-Za-z]:/', $value );
	}

	/**
	 * Ensure the target log file exists before writing.
	 *
	 * @param string $path Log file path.
	 * @return void
	 */
	private function ensure_log_file_exists( string $path ): void {
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_file
		if ( is_file( $path ) ) {
			return;
		}

		$dir = dirname( $path );
		if ( ! is_dir( $dir ) ) {
			wp_mkdir_p( $dir );
		}

		$filesystem = logmate_get_filesystem();
		if ( $filesystem ) {
			$filesystem->put_contents( $path, '', FS_CHMOD_FILE );
			return;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $path, '' );
	}

	/**
	 * Read a log file.
	 *
	 * @param string                   $path Log file path.
	 * @param \WP_Filesystem_Base|bool $filesystem Optional filesystem.
	 * @return string
	 */
	private function read_file( string $path, $filesystem ): string {
		if ( $filesystem && $filesystem->is_readable( $path ) ) {
			$content = $filesystem->get_contents( $path );
			return is_string( $content ) ? $content : '';
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_readable, WordPress.WP.AlternativeFunctions.file_system_operations_file_get_contents
		if ( is_readable( $path ) ) {
			$content = file_get_contents( $path );
			return is_string( $content ) ? $content : '';
		}

		return '';
	}

	/**
	 * Write a log file.
	 *
	 * @param string                   $path Log file path.
	 * @param string                   $content File content.
	 * @param \WP_Filesystem_Base|bool $filesystem Optional filesystem.
	 * @return bool
	 */
	private function write_file( string $path, string $content, $filesystem ): bool {
		if ( $filesystem ) {
			return (bool) $filesystem->put_contents( $path, $content, FS_CHMOD_FILE );
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		return false !== file_put_contents( $path, $content );
	}
}
