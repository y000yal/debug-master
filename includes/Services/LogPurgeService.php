<?php
/**
 * Log Purge Service for date-based log purging.
 *
 * @since 1.0.0
 * @package DebugMaster\Services
 */

namespace DebugMaster\Services;

/**
 * LogPurgeService class for purging logs by date criteria.
 *
 * @package DebugMaster
 */
class LogPurgeService {

	/**
	 * Debug log service instance.
	 *
	 * @var DebugLogService
	 */
	private DebugLogService $log_service;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->log_service = new DebugLogService();
	}

	/**
	 * Purge logs before a specific date.
	 *
	 * @param string $log_file_path Path to log file.
	 * @param string $before_date Date string (Y-m-d H:i:s).
	 * @return array Result with deleted count.
	 */
	public function purge_before_date( string $log_file_path, string $before_date ): array {
		if ( ! file_exists( $log_file_path ) || ! is_readable( $log_file_path ) ) {
			return array(
				'success' => false,
				'message' => __( 'Log file not found or not readable.', 'debug-master' ),
			);
		}

		$content     = file_get_contents( $log_file_path );
		$target_time = strtotime( $before_date );

		if ( false === $target_time ) {
			return array(
				'success' => false,
				'message' => __( 'Invalid date format.', 'debug-master' ),
			);
		}

		// Parse and filter entries.
		$entries = $this->log_service->get_processed_entries( $log_file_path, PHP_INT_MAX );
		$kept_entries = array();

		foreach ( $entries as $entry ) {
			// Get the latest occurrence timestamp.
			$latest_occurrence = end( $entry['occurrences'] );
			$entry_time        = $this->parse_timestamp( $latest_occurrence );

			if ( false !== $entry_time && $entry_time >= $target_time ) {
				// Keep this entry - reconstruct original log format.
				foreach ( $entry['occurrences'] as $occurrence ) {
					$kept_entries[] = '[' . $occurrence . '] ' . $entry['message'];
				}
			}
		}

		// Write back kept entries.
		$new_content = implode( "\n", $kept_entries );
		$result      = file_put_contents( $log_file_path, $new_content );

		if ( false !== $result ) {
			$deleted_count = count( $entries ) - count( $kept_entries );
			return array(
				'success'      => true,
				'message'      => sprintf(
					// translators: %d is the number of entries deleted.
					__( 'Deleted %d log entries.', 'debug-master' ),
					$deleted_count
				),
				'deleted_count' => $deleted_count,
			);
		}

		return array(
			'success' => false,
			'message' => __( 'Failed to write log file.', 'debug-master' ),
		);
	}

	/**
	 * Keep only logs from the last N days/weeks/months.
	 *
	 * @param string $log_file_path Path to log file.
	 * @param int    $number Number of periods.
	 * @param string $period Period type: 'days', 'weeks', 'months'.
	 * @return array Result with deleted count.
	 */
	public function keep_last_period( string $log_file_path, int $number, string $period = 'days' ): array {
		$valid_periods = array( 'days', 'weeks', 'months' );
		if ( ! in_array( $period, $valid_periods, true ) ) {
			return array(
				'success' => false,
				'message' => __( 'Invalid period type.', 'debug-master' ),
			);
		}

		$cutoff_date = $this->calculate_cutoff_date( $number, $period );
		return $this->purge_before_date( $log_file_path, $cutoff_date );
	}

	/**
	 * Calculate cutoff date based on period.
	 *
	 * @param int    $number Number of periods.
	 * @param string $period Period type.
	 * @return string
	 */
	private function calculate_cutoff_date( int $number, string $period ): string {
		$now = current_time( 'timestamp' );

		switch ( $period ) {
			case 'days':
				$cutoff = $now - ( $number * DAY_IN_SECONDS );
				break;
			case 'weeks':
				$cutoff = $now - ( $number * WEEK_IN_SECONDS );
				break;
			case 'months':
				$cutoff = $now - ( $number * MONTH_IN_SECONDS );
				break;
			default:
				$cutoff = $now;
		}

		return date( 'Y-m-d H:i:s', $cutoff );
	}

	/**
	 * Parse timestamp from log entry format.
	 *
	 * @param string $timestamp Timestamp string from log.
	 * @return int|false Returns timestamp as integer or false on failure.
	 */
	private function parse_timestamp( string $timestamp ) {
		// Handle various timestamp formats.
		$formats = array(
			'd-M-Y H:i:s T',
			'd-M-Y H:i:s',
			'Y-m-d H:i:s',
		);

		foreach ( $formats as $format ) {
			$parsed = date_create_from_format( $format, $timestamp );
			if ( false !== $parsed ) {
				return $parsed->getTimestamp();
			}
		}

		// Try strtotime as fallback.
		$parsed = strtotime( $timestamp );
		return false !== $parsed ? $parsed : false;
	}
}

