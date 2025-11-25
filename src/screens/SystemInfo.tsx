import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../axios/api';
import { Spinner } from '../components/Spinner';

interface SystemInfo {
	php: {
		version: string;
		memory_limit: string;
		max_execution_time: string;
		upload_max_filesize: string;
		post_max_size: string;
		max_input_vars: string;
	};
	mysql: {
		version: string;
	};
	wordpress: {
		version: string;
		memory_limit: string;
		max_memory_limit: string;
	};
	server: {
		software: string;
		os: string;
	};
	plugins: Array<{
		name: string;
		version: string;
		active: boolean;
	}>;
	theme: {
		name: string;
		version: string;
		author: string;
	};
	debug_logs: {
		php_log_size: string;
		js_log_size: string;
		total_size: string;
		php_log_path: string;
		js_log_path: string;
	};
}

export const SystemInfoScreen: React.FC = () => {
	const { data, isLoading, error } = useQuery< { data: SystemInfo } >( {
		queryKey: [ 'system-info' ],
		queryFn: async () => {
			const response = await api.get( '/system-info' );
			return response.data;
		},
	} );

	if ( isLoading ) {
		return (
			<div className="debug-master-screen">
				<Spinner />
			</div>
		);
	}

	if ( error ) {
		return (
			<div className="debug-master-screen">
				<div className="debug-master-error">
					Error loading system information. Please try again.
				</div>
			</div>
		);
	}

	const systemInfo = data?.data;

	if ( ! systemInfo ) {
		return null;
	}

	return (
		<div className="debug-master-screen">
			<div className="debug-master-system-info">
				<div className="debug-master-info-section">
					<h2>PHP Information</h2>
					<div className="debug-master-info-grid">
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Version</span>
							<span className="debug-master-info-value">{ systemInfo.php.version }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Memory Limit</span>
							<span className="debug-master-info-value">{ systemInfo.php.memory_limit }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Max Execution Time</span>
							<span className="debug-master-info-value">{ systemInfo.php.max_execution_time }s</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Upload Max Filesize</span>
							<span className="debug-master-info-value">{ systemInfo.php.upload_max_filesize }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Post Max Size</span>
							<span className="debug-master-info-value">{ systemInfo.php.post_max_size }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Max Input Vars</span>
							<span className="debug-master-info-value">{ systemInfo.php.max_input_vars }</span>
						</div>
					</div>
				</div>

				<div className="debug-master-info-section">
					<h2>MySQL Information</h2>
					<div className="debug-master-info-grid">
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Version</span>
							<span className="debug-master-info-value">{ systemInfo.mysql.version }</span>
						</div>
					</div>
				</div>

				<div className="debug-master-info-section">
					<h2>WordPress Information</h2>
					<div className="debug-master-info-grid">
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Version</span>
							<span className="debug-master-info-value">{ systemInfo.wordpress.version }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Memory Limit</span>
							<span className="debug-master-info-value">{ systemInfo.wordpress.memory_limit }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Max Memory Limit</span>
							<span className="debug-master-info-value">{ systemInfo.wordpress.max_memory_limit }</span>
						</div>
					</div>
				</div>

				<div className="debug-master-info-section">
					<h2>Server Information</h2>
					<div className="debug-master-info-grid">
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Software</span>
							<span className="debug-master-info-value">{ systemInfo.server.software }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Operating System</span>
							<span className="debug-master-info-value">{ systemInfo.server.os }</span>
						</div>
					</div>
				</div>

				<div className="debug-master-info-section">
					<h2>Active Theme</h2>
					<div className="debug-master-info-grid">
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Name</span>
							<span className="debug-master-info-value">{ systemInfo.theme.name }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Version</span>
							<span className="debug-master-info-value">{ systemInfo.theme.version }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Author</span>
							<span className="debug-master-info-value">{ systemInfo.theme.author }</span>
						</div>
					</div>
				</div>

				<div className="debug-master-info-section">
					<h2>Debug Logs</h2>
					<div className="debug-master-info-grid">
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">Total Size</span>
							<span className="debug-master-info-value">{ systemInfo.debug_logs.total_size }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">PHP Log Size</span>
							<span className="debug-master-info-value">{ systemInfo.debug_logs.php_log_size }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">JavaScript Log Size</span>
							<span className="debug-master-info-value">{ systemInfo.debug_logs.js_log_size }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">PHP Log Path</span>
							<span className="debug-master-info-value" style={ { wordBreak: 'break-all' } }>{ systemInfo.debug_logs.php_log_path || 'Not set' }</span>
						</div>
						<div className="debug-master-info-item">
							<span className="debug-master-info-label">JS Log Path</span>
							<span className="debug-master-info-value" style={ { wordBreak: 'break-all' } }>{ systemInfo.debug_logs.js_log_path || 'Not set' }</span>
						</div>
					</div>
				</div>

				<div className="debug-master-info-section">
					<h2>Installed Plugins ({ systemInfo.plugins.length })</h2>
					<div className="debug-master-plugins-list">
						{ systemInfo.plugins.map( ( plugin, index ) => (
							<div
								key={ index }
								className={ `debug-master-plugin-item ${ plugin.active ? 'active' : '' }` }
							>
								<div className="debug-master-plugin-name">
									{ plugin.name }
									{ plugin.active && (
										<span className="debug-master-plugin-badge">Active</span>
									) }
								</div>
								<div className="debug-master-plugin-version">v{ plugin.version }</div>
							</div>
						) ) }
					</div>
				</div>
			</div>
		</div>
	);
};

