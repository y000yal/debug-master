<?php
/**
 * Helper functions for LogMate plugin.
 *
 * @package LogMate
 */

defined( 'ABSPATH' ) || exit;

/**
 * Whether Composer dependencies (vendor/autoload.php) are installed.
 *
 * @return bool
 */
function logmate_is_composer_installed(): bool {
	return file_exists( dirname( __DIR__ ) . '/vendor/autoload.php' );
}

/**
 * Admin notice when Composer dependencies are missing.
 *
 * @return void
 */
function logmate_composer_missing_admin_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	$plugin_dir = plugin_dir_path( dirname( __DIR__ ) . '/logmate.php' );
	$command    = 'cd ' . $plugin_dir . ' && composer install';

	printf(
		'<div class="notice notice-error"><p><strong>%1$s</strong> %2$s</p><p><code>%3$s</code></p></div>',
		esc_html__( 'LogMate:', 'logmate' ),
		esc_html__(
			'Composer dependencies are not installed. Run the following command in the plugin directory, then try activating the plugin again.',
			'logmate'
		),
		esc_html( $command )
	);
}

/**
 * Get main instance of LogMate.
 *
 * @return LogMate
 */
function logmate_get_instance(): LogMate {
	return LogMate::instance();
}

/**
 * Initialize WP_Filesystem and return the filesystem object.
 *
 * @return WP_Filesystem_Base|false Filesystem object or false on failure.
 */
function logmate_get_filesystem() {
	global $wp_filesystem;

	if ( ! function_exists( 'WP_Filesystem' ) ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
	}

	$credentials = request_filesystem_credentials( '', '', false, false, null );
	if ( false === $credentials ) {
		return false;
	}

	if ( ! WP_Filesystem( $credentials ) ) {
		return false;
	}

	return $wp_filesystem;
}
