<?php
/**
 * WordPress Config Service for managing wp-config.php.
 *
 * @since 1.0.0
 * @package DebugMaster\Services
 */

namespace DebugMaster\Services;

/**
 * WpConfigService class for managing wp-config.php modifications.
 *
 * @package DebugMaster
 */
class WpConfigService {

	/**
	 * Path to wp-config.php file.
	 *
	 * @var string
	 */
	private string $wp_config_path;

	/**
	 * Original wp-config.php content backup.
	 *
	 * @var string|null
	 */
	private ?string $original_content = null;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->wp_config_path = $this->locate_wp_config();
	}

	/**
	 * Locate wp-config.php file.
	 *
	 * @return string
	 */
	private function locate_wp_config(): string {
		$config_path = ABSPATH . 'wp-config.php';

		if ( ! file_exists( $config_path ) ) {
			$config_path = dirname( ABSPATH ) . '/wp-config.php';
		}

		return $config_path;
	}

	/**
	 * Store original wp-config.php state.
	 *
	 * @return bool
	 */
	public function store_original_state(): bool {
		if ( ! file_exists( $this->wp_config_path ) ) {
			return false;
		}

		$this->original_content = file_get_contents( $this->wp_config_path );
		update_option( 'debugm_wp_config_backup', $this->original_content, false );

		return true;
	}

	/**
	 * Restore original wp-config.php state.
	 *
	 * @return bool
	 */
	public function restore_original_state(): bool {
		if ( ! file_exists( $this->wp_config_path ) ) {
			return false;
		}

		$backup = get_option( 'debugm_wp_config_backup' );

		if ( empty( $backup ) ) {
			// If no backup, remove our constants.
			return $this->remove_debug_constants();
		}

		// Restore from backup.
		$result = file_put_contents( $this->wp_config_path, $backup );

		if ( false !== $result ) {
			delete_option( 'debugm_wp_config_backup' );
			return true;
		}

		return false;
	}

	/**
	 * Remove debug constants from wp-config.php.
	 *
	 * @return bool
	 */
	private function remove_debug_constants(): bool {
		if ( ! file_exists( $this->wp_config_path ) ) {
			return false;
		}

		$content = file_get_contents( $this->wp_config_path );

		// Remove our debug constants.
		$patterns = array(
			"/define\s*\(\s*['\"]WP_DEBUG['\"]\s*,\s*true\s*\);\s*/i",
			"/define\s*\(\s*['\"]WP_DEBUG_LOG['\"].*?\);\s*/i",
			"/define\s*\(\s*['\"]WP_DEBUG_DISPLAY['\"].*?\);\s*/i",
		);

		foreach ( $patterns as $pattern ) {
			$content = preg_replace( $pattern, '', $content );
		}

		return false !== file_put_contents( $this->wp_config_path, $content );
	}

	/**
	 * Update or add debug constant in wp-config.php.
	 *
	 * @param string $constant_name Constant name.
	 * @param mixed  $value Constant value.
	 * @return bool
	 */
	public function update_constant( string $constant_name, $value ): bool {
		if ( ! file_exists( $this->wp_config_path ) ) {
			return false;
		}

		$content = file_get_contents( $this->wp_config_path );

		// Format the value - handle strings, booleans, and ensure absolute paths.
		if ( is_bool( $value ) ) {
			$formatted_value = $value ? 'true' : 'false';
		} elseif ( is_string( $value ) && ! empty( $value ) ) {
			// Ensure absolute path for log files.
			if ( 'WP_DEBUG_LOG' === $constant_name && ! $this->is_absolute_path( $value ) ) {
				$value = ABSPATH . $value;
			}
			$formatted_value = "'" . addslashes( $value ) . "'";
		} else {
			$formatted_value = "'" . addslashes( (string) $value ) . "'";
		}

		$new_constant = "define( '" . $constant_name . "', " . $formatted_value . " );";

		// Pattern to match define() calls, including those inside if blocks.
		// This pattern matches: define( 'CONSTANT_NAME', ... );
		// Match any value (true, false, or string) up to the semicolon.
		// Pattern to match define() calls - matches the entire define statement.
		// This handles: define( 'CONSTANT', true ); or define( 'CONSTANT', 'value' );
		$pattern = "/define\s*\(\s*['\"]" . preg_quote( $constant_name, '/' ) . "['\"]\s*,\s*[^;)]+\)\s*;/i";

		if ( preg_match( $pattern, $content, $matches ) ) {
			// Update existing constant.
			$content = preg_replace( $pattern, $new_constant, $content );
		} else {
			// Add new constant before "That's all, stop editing!" comment.
			$stop_editing = "/* That's all, stop editing!";
			if ( strpos( $content, $stop_editing ) !== false ) {
				$content = str_replace( $stop_editing, $new_constant . "\n\n" . $stop_editing, $content );
			} else {
				$content .= "\n" . $new_constant . "\n";
			}
		}

		return false !== file_put_contents( $this->wp_config_path, $content );
	}

	/**
	 * Check if a path is absolute.
	 *
	 * @param string $path Path to check.
	 * @return bool
	 */
	public function is_absolute_path( string $path ): bool {
		// Windows absolute path (C:\ or \\server).
		if ( preg_match( '/^[A-Z]:\\\\/i', $path ) || preg_match( '/^\\\\/', $path ) ) {
			return true;
		}
		// Unix absolute path.
		return '/' === $path[0];
	}

	/**
	 * Enable debug logging.
	 *
	 * @param string $log_file_path Path to log file.
	 * @param bool   $modify_script_debug Whether to modify SCRIPT_DEBUG.
	 * @return bool
	 */
	public function enable_debug_logging( string $log_file_path, bool $modify_script_debug = true ): bool {
		$results = array();

		$results[] = $this->update_constant( 'WP_DEBUG', true );
		$results[] = $this->update_constant( 'WP_DEBUG_LOG', $log_file_path );
		$results[] = $this->update_constant( 'WP_DEBUG_DISPLAY', false );

		if ( $modify_script_debug ) {
			$results[] = $this->update_constant( 'SCRIPT_DEBUG', true );
		}

		return ! in_array( false, $results, true );
	}

	/**
	 * Disable debug logging.
	 *
	 * @return bool
	 */
	public function disable_debug_logging(): bool {
		// On deactivation, we restore original state.
		return $this->restore_original_state();
	}
}

