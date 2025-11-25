/**
 * Public JavaScript for Debug Master - Captures JavaScript errors.
 *
 * @package DebugMaster
 */

(function() {
	'use strict';


	// Wait for DebugMasterData to be available (WordPress localizes scripts).
	function initErrorLogging() {
		// Check if DebugMasterData is available and JS error logging is enabled.
		if ( typeof DebugMasterData === 'undefined' ) {
			console.log('[Debug Master] DebugMasterData not available yet, retrying...');
			setTimeout(initErrorLogging, 100);
			return;
		}

		if ( ! DebugMasterData.jsErrorLogging || DebugMasterData.jsErrorLogging.status !== 'enabled' ) {
			console.log('[Debug Master] JS error logging not enabled', DebugMasterData);
			return;
		}

		console.log('[Debug Master] JS error logging initialized', DebugMasterData.jsErrorLogging);

		// Log javascript errors in the front end via XHR
		// Code source: https://plugins.svn.wordpress.org/javascript-error-reporting-client/tags/1.0.3/public/js/jerc.js
		
		window.onerror = function(msg, url, lineNo, columnNo, error) {
			console.log('[Debug Master] Error caught:', msg, url, lineNo, columnNo);
			var data = {
				nonce: DebugMasterData.nonce,
				message: msg,
				script: url,
				lineNo: lineNo,
				columnNo: columnNo,
				pageUrl: window.location.pathname + window.location.search,
				type: 'front end'
			};

			var xhr = new XMLHttpRequest();
			xhr.open("POST", DebugMasterData.jsErrorLogging.url);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.setRequestHeader('X-WP-Nonce', DebugMasterData.nonce);
			
			xhr.onload = function() {
				console.log('[Debug Master] Error logged successfully:', xhr.status, xhr.responseText);
			};
			
			xhr.onerror = function() {
				console.error('[Debug Master] Failed to log error:', xhr.status, xhr.statusText);
			};
			
			xhr.send(JSON.stringify(data));
			return false;
		};

		// Also catch unhandled promise rejections
		window.addEventListener('unhandledrejection', function(event) {
			var data = {
				nonce: DebugMasterData.nonce,
				message: event.reason ? (event.reason.message || event.reason.toString()) : 'Unhandled Promise Rejection',
				script: window.location.href,
				lineNo: 0,
				columnNo: 0,
				pageUrl: window.location.pathname + window.location.search,
				type: 'promise rejection'
			};

			var xhr = new XMLHttpRequest();
			xhr.open("POST", DebugMasterData.jsErrorLogging.url);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.setRequestHeader('X-WP-Nonce', DebugMasterData.nonce);
			xhr.onload = function() {
				console.log('[Debug Master] Promise rejection logged successfully:', xhr.status, xhr.responseText);
			};
			
			xhr.onerror = function() {
				console.error('[Debug Master] Failed to log promise rejection:', xhr.status, xhr.statusText);
			};
			
			xhr.send(JSON.stringify(data));
		});


		// Expose a manual test function to window for debugging
		window.debugMasterTestError = function() {
			console.log('[Debug Master] Manual test error triggered');
			throw new Error('Debug Master Manual Test Error');
		};

		// Expose a manual test function to log an object
		window.debugMasterTestObject = function() {
			var testObject = {
				name: 'Manual Test Object',
				timestamp: new Date().toISOString(),
				message: 'This is a manually triggered object log test'
			};

			var data = {
				nonce: DebugMasterData.nonce,
				message: 'Manual Object Test: ' + JSON.stringify(testObject, null, 2),
				script: window.location.href,
				lineNo: 0,
				columnNo: 0,
				pageUrl: window.location.pathname + window.location.search,
				type: 'manual object test'
			};

			var xhr = new XMLHttpRequest();
			xhr.open("POST", DebugMasterData.jsErrorLogging.url);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.setRequestHeader('X-WP-Nonce', DebugMasterData.nonce);
			xhr.onload = function() {
				console.log('[Debug Master] Manual object test logged successfully:', xhr.status, xhr.responseText);
			};
			xhr.onerror = function() {
				console.error('[Debug Master] Failed to log manual object test:', xhr.status, xhr.statusText);
			};
			xhr.send(JSON.stringify(data));
		};

		console.log('[Debug Master] Manual tests available: Run debugMasterTestError() or debugMasterTestObject() in console');
	}

	// Start initialization when DOM is ready or immediately if already ready.
	if ( document.readyState === 'loading' ) {
		document.addEventListener('DOMContentLoaded', initErrorLogging);
	} else {
		initErrorLogging();
	}

})();
