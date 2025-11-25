import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../axios/api';
import { Settings } from '../types';
import { toast } from 'react-toastify';
import { LogPurgeSettings } from './LogPurgeSettings';
import { StatusIndicator } from './StatusIndicator';
import { Toggle } from './Toggle';
import { Spinner } from './Spinner';

export const SettingsPanel: React.FC = () => {
	const queryClient = useQueryClient();
	const [ updatingSetting, setUpdatingSetting ] = React.useState< string | null >( null );

	const { data: settings, isLoading } = useQuery< { data: Settings } >( {
		queryKey: [ 'settings' ],
		queryFn: async () => {
			const response = await api.get( '/settings' );
			return response.data;
		},
	} );

	const toggleLoggingMutation = useMutation( {
		mutationFn: async () => {
			const response = await api.post( '/settings/toggle-logging' );
			return response.data;
		},
		onSuccess: ( data ) => {
			toast.success( data.message );
			queryClient.invalidateQueries( { queryKey: [ 'settings' ] } );
		},
		onError: () => {
			toast.error( 'Failed to toggle logging' );
		},
	} );

	const updateSettingsMutation = useMutation( {
		mutationFn: async ( updatedSettings: Partial< Settings > ) => {
			const response = await api.post( '/settings/update', updatedSettings );
			return response.data;
		},
		onSuccess: ( data, variables ) => {
			toast.success( data.message );
			setUpdatingSetting( null );
			// Optimistically update the settings in the cache immediately for instant UI updates.
			const currentSettings = queryClient.getQueryData< { data: Settings } >( [ 'settings' ] );
			if ( currentSettings ) {
				queryClient.setQueryData< { data: Settings } >( [ 'settings' ], {
					data: {
						...currentSettings.data,
						...variables,
					},
				} );
			}
			// Refetch in the background to ensure we have the latest from server.
			queryClient.refetchQueries( { queryKey: [ 'settings' ] } );
		},
		onError: () => {
			toast.error( 'Failed to update settings' );
			setUpdatingSetting( null );
		},
	} );

	const handleSettingUpdate = ( settingKey: keyof Settings, currentValue: string ) => {
		setUpdatingSetting( settingKey );
		updateSettingsMutation.mutate( {
			[ settingKey ]: currentValue === 'enabled' ? 'disabled' : 'enabled',
		} );
	};

	if ( isLoading || ! settings ) {
		return (
			<div className="debug-master-screen">
				<Spinner />
			</div>
		);
	}

	const currentSettings = settings.data;

	return (
		<div className="debug-master-screen">
			<div className="debug-master-settings">
				<div className="debug-master-settings-section">
					<StatusIndicator
						status={ currentSettings.log_status }
						onToggle={ () => toggleLoggingMutation.mutate() }
						loading={ toggleLoggingMutation.isPending }
					/>
				</div>

				<div className="debug-master-settings-section">
					<div className="debug-master-setting-item">
					<div className="debug-master-setting-row">
						<label>Auto-refresh logs</label>
						<div className="debug-master-toggle-wrapper">
							{ updatingSetting === 'autorefresh' && (
								<div className="debug-master-toggle-loader">
									<Spinner />
								</div>
							) }
							<Toggle
								checked={ currentSettings.autorefresh === 'enabled' }
								onChange={ () => handleSettingUpdate( 'autorefresh', currentSettings.autorefresh ) }
								disabled={ updatingSetting === 'autorefresh' }
							/>
						</div>
					</div>
				</div>
				<div className="debug-master-setting-item">
					<div className="debug-master-setting-row">
						<label>Log JavaScript errors</label>
						<div className="debug-master-toggle-wrapper">
							{ updatingSetting === 'js_error_logging' && (
								<div className="debug-master-toggle-loader">
									<Spinner />
								</div>
							) }
							<Toggle
								checked={ currentSettings.js_error_logging === 'enabled' }
								onChange={ () => handleSettingUpdate( 'js_error_logging', currentSettings.js_error_logging ) }
								disabled={ updatingSetting === 'js_error_logging' }
							/>
						</div>
					</div>
				</div>
				<div className="debug-master-setting-item">
					<div className="debug-master-setting-row">
						<label>Modify SCRIPT_DEBUG</label>
						<div className="debug-master-toggle-wrapper">
							{ updatingSetting === 'modify_script_debug' && (
								<div className="debug-master-toggle-loader">
									<Spinner />
								</div>
							) }
							<Toggle
								checked={ currentSettings.modify_script_debug === 'enabled' }
								onChange={ () => handleSettingUpdate( 'modify_script_debug', currentSettings.modify_script_debug ) }
								disabled={ updatingSetting === 'modify_script_debug' }
							/>
						</div>
					</div>
				</div>
				</div>

				<div className="debug-master-settings-section">
					<div className="debug-master-setting-item">
						<label>PHP Log File Path:</label>
						<code className="debug-master-file-path">{ currentSettings.log_file_path || 'Not set' }</code>
					</div>
					<div className="debug-master-setting-item">
						<label>JavaScript Log File Path:</label>
						<code className="debug-master-file-path">{ currentSettings.js_log_file_path || 'Not set' }</code>
					</div>
				</div>

				<LogPurgeSettings />
			</div>
		</div>
	);
};

