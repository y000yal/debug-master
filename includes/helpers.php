<?php
/**
 * Helper functions for Debug Master plugin.
 *
 * @package DebugMaster
 */

defined( 'ABSPATH' ) || exit;

/**
 * Get main instance of DebugMaster.
 *
 * @return DebugMaster
 */
function debugm_get_instance(): DebugMaster {
	return DebugMaster::instance();
}
