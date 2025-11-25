<?php
/**
 * Debug Log Controller for Debug Master plugin.
 *
 * @package DebugMaster
 */

namespace DebugMaster\Controllers;

use DebugMaster\Controllers\Controller as BaseController;
use DebugMaster\Services\DebugLogService;
use WP_Rest_Request;
use WP_REST_Response;

/**
 * Debug Log Controller for managing log entries.
 *
 * @package DebugMaster
 */
class DebugLogController extends BaseController {

	/**
	 * Debug log service instance.
	 *
	 * @var DebugLogService
	 */
	protected DebugLogService $log_service;

	/**
	 * Constructor for DebugLogController.
	 */
	public function __construct() {
		$this->log_service = new DebugLogService();
	}

	/**
	 * Get all log entries.
	 *
	 * @param WP_Rest_Request $request The REST request object.
	 * @return WP_REST_Response Response containing logs data.
	 */
	public function index( WP_Rest_Request $request ): WP_REST_Response {
		$log_type = $request->get_param( 'type' ); // 'php', 'js', or 'all'
		
		$php_log_file_path = get_option( 'debugm_log_file_path', '' );
		$js_log_file_path  = get_option( 'debugm_js_log_file_path', '' );

		$all_entries = array();
		$total_file_size_bytes = 0;
		$php_count = 0;
		$js_count = 0;

		// Get PHP logs.
		if ( ( 'all' === $log_type || 'php' === $log_type || empty( $log_type ) ) && ! empty( $php_log_file_path ) && file_exists( $php_log_file_path ) ) {
			$php_entries = $this->log_service->get_processed_entries( $php_log_file_path );
			$php_count = count( $php_entries );
			$total_file_size_bytes += filesize( $php_log_file_path );
			
			// Mark entries as PHP type.
			foreach ( $php_entries as $key => $entry ) {
				$php_entries[ $key ]['log_type'] = 'php';
			}
			$all_entries = array_merge( $all_entries, $php_entries );
		}

		// Get JS logs.
		if ( ( 'all' === $log_type || 'js' === $log_type || empty( $log_type ) ) && ! empty( $js_log_file_path ) && file_exists( $js_log_file_path ) ) {
			$js_entries = $this->log_service->get_processed_entries( $js_log_file_path );
			$js_count = count( $js_entries );
			$total_file_size_bytes += filesize( $js_log_file_path );
			
			// Mark entries as JS type.
			foreach ( $js_entries as $key => $entry ) {
				$js_entries[ $key ]['log_type'] = 'js';
			}
			$all_entries = array_merge( $all_entries, $js_entries );
		}

		// Sort by timestamp (most recent first).
		usort( $all_entries, function( $a, $b ) {
			$a_latest = ! empty( $a['occurrences'] ) ? end( $a['occurrences'] ) : '';
			$b_latest = ! empty( $b['occurrences'] ) ? end( $b['occurrences'] ) : '';
			return strcmp( $b_latest, $a_latest );
		} );

		return $this->response(
			array(
				'data'      => $all_entries,
				'file_size' => size_format( $total_file_size_bytes ),
				'count'     => count( $all_entries ),
				'php_count' => $php_count,
				'js_count'  => $js_count,
			),
			200
		);
	}

	/**
	 * Clear log file.
	 *
	 * @param WP_Rest_Request $request The REST request object.
	 * @return WP_REST_Response Response containing result.
	 */
	public function clear( WP_Rest_Request $request ): WP_REST_Response {
		$log_type = $request->get_param( 'type' ); // 'php', 'js', or 'all'
		
		if ( empty( $log_type ) ) {
			$log_type = 'all';
		}

		$cleared = false;
		$messages = array();

		// Clear PHP logs.
		if ( 'all' === $log_type || 'php' === $log_type ) {
			$php_log_file_path = get_option( 'debugm_log_file_path', '' );
			if ( ! empty( $php_log_file_path ) ) {
				$cleared_php = $this->log_service->clear_log_file( $php_log_file_path );
				if ( $cleared_php ) {
					$cleared = true;
					$messages[] = __( 'PHP log file cleared successfully.', 'debug-master' );
				}
			}
		}

		// Clear JS logs.
		if ( 'all' === $log_type || 'js' === $log_type ) {
			$js_log_file_path = get_option( 'debugm_js_log_file_path', '' );
			if ( ! empty( $js_log_file_path ) ) {
				$cleared_js = $this->log_service->clear_log_file( $js_log_file_path );
				if ( $cleared_js ) {
					$cleared = true;
					$messages[] = __( 'JavaScript log file cleared successfully.', 'debug-master' );
				}
			}
		}

		if ( $cleared ) {
			return $this->response(
				array(
					'success' => true,
					'message' => implode( ' ', $messages ),
				),
				200
			);
		}

		return $this->response(
			array(
				'success' => false,
				'message' => __( 'Failed to clear log file(s).', 'debug-master' ),
			),
			500
		);
	}

	/**
	 * Log JavaScript error.
	 *
	 * @param WP_Rest_Request $request The REST request object.
	 * @return WP_REST_Response Response containing result.
	 */
	public function log_js_error( WP_Rest_Request $request ): WP_REST_Response {
		// Check if JS error logging is enabled.
		$js_error_logging = get_option( 'debugm_js_error_logging', 'enabled' );
		if ( 'enabled' !== $js_error_logging ) {
			return $this->response(
				array(
					'success' => false,
					'message' => __( 'JavaScript error logging is disabled.', 'debug-master' ),
				),
				403
			);
		}

		// Verify nonce.
		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return $this->response(
				array(
					'success' => false,
					'message' => __( 'Invalid nonce.', 'debug-master' ),
				),
				403
			);
		}

		$params = $request->get_json_params();

		// Validate required fields.
		if ( ! isset( $params['message'] ) || ! isset( $params['script'] ) ) {
			return $this->response(
				array(
					'success' => false,
					'message' => __( 'Missing required fields.', 'debug-master' ),
				),
				400
			);
		}

		// Sanitize input data.
		$message     = sanitize_text_field( $params['message'] );
		$script      = sanitize_text_field( $params['script'] );
		$line_no     = isset( $params['lineNo'] ) ? absint( $params['lineNo'] ) : 0;
		$column_no   = isset( $params['columnNo'] ) ? absint( $params['columnNo'] ) : 0;
		$page_url    = isset( $params['pageUrl'] ) ? sanitize_text_field( $params['pageUrl'] ) : '';
		$error_type  = isset( $params['type'] ) ? sanitize_text_field( $params['type'] ) : 'front end';

		// Get JS log file path.
		$js_log_file_path = get_option( 'debugm_js_log_file_path', '' );
		
		if ( empty( $js_log_file_path ) ) {
			return $this->response(
				array(
					'success' => false,
					'message' => __( 'JavaScript log file path not configured.', 'debug-master' ),
				),
				400
			);
		}

		// Build error message with WordPress-style timestamp format.
		// Format: [DD-MMM-YYYY HH:MM:SS UTC] to match WordPress debug.log format.
		$timestamp = current_time( 'd-M-Y H:i:s' ) . ' UTC';
		$error_message = sprintf(
			'[%s] JavaScript Error: %s in %s on line %d column %d at %s%s',
			$timestamp,
			$message,
			$script,
			$line_no,
			$column_no,
			get_site_url(),
			$page_url
		);

		// Write directly to JS log file.
		$written = file_put_contents( $js_log_file_path, $error_message . PHP_EOL, FILE_APPEND );

		if ( false === $written ) {
			return $this->response(
				array(
					'success' => false,
					'message' => __( 'Failed to write to JavaScript log file.', 'debug-master' ),
				),
				500
			);
		}

		return $this->response(
			array(
				'success' => true,
				'message' => __( 'JavaScript error logged successfully.', 'debug-master' ),
			),
			200
		);
	}
}

