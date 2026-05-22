import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../axios/api';
import { Settings } from '../types';
import { toast } from 'react-toastify';
import { LogPurgeSettings } from './LogPurgeSettings';
import { StatusIndicator } from './StatusIndicator';
import { Toggle } from './Toggle';
import { Spinner } from './Spinner';
import { Tooltip } from './Tooltip';
import { useToggleLogging } from '../hooks/useToggleLogging';
import { BackToLogsButton } from './BackToLogsButton';
import { SettingsSkeleton } from './SettingsSkeleton';
import {
	DEFAULT_AUTOREFRESH_INTERVAL_SECONDS,
	MAX_AUTOREFRESH_INTERVAL_SECONDS,
	MIN_AUTOREFRESH_INTERVAL_SECONDS,
	normalizeAutorefreshInterval,
} from '../constants/settings';

export const SettingsPanel: React.FC = () => {
	const queryClient = useQueryClient();
	const [ updatingSetting, setUpdatingSetting ] = React.useState< string | null >( null );
	const [ intervalInput, setIntervalInput ] = React.useState( String( DEFAULT_AUTOREFRESH_INTERVAL_SECONDS ) );

	const { data: settings, isPending } = useQuery< { data: Settings } >( {
		queryKey: [ 'settings' ],
		queryFn: async () => {
			const response = await api.get( '/settings' );
			return response.data;
		},
	} );

	const toggleLoggingMutation = useToggleLogging();

	const updateSettingsMutation = useMutation( {
		mutationFn: async ( updatedSettings: Partial< Settings > ) => {
			const response = await api.post( '/settings/update', updatedSettings );
			return response.data;
		},
		onSuccess: ( data, variables ) => {
			toast.success( data.message );
			setUpdatingSetting( null );
			// Optimistically update the settings in the cache immediately for instant UI updates.
			const cached = queryClient.getQueryData< { data: Settings } >( [ 'settings' ] );
			if ( cached?.data ) {
				queryClient.setQueryData< { data: Settings } >( [ 'settings' ], {
					data: {
						...cached.data,
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

	const handleIntervalSave = () => {
		if ( updateSettingsMutation.isPending || toggleLoggingMutation.isPending ) {
			return;
		}

		const parsed = parseInt( intervalInput, 10 );
		const normalized = normalizeAutorefreshInterval( Number.isNaN( parsed ) ? undefined : parsed );
		setIntervalInput( String( normalized ) );

		const currentInterval = normalizeAutorefreshInterval( settings?.data?.autorefresh_interval );
		if ( normalized === currentInterval ) {
			return;
		}

		setUpdatingSetting( 'autorefresh_interval' );
		updateSettingsMutation.mutate( { autorefresh_interval: normalized } );
	};

	const handleSettingUpdate = ( settingKey: keyof Settings, currentValue: string ) => {
		// Prevent multiple clicks if this specific setting is already updating
		if ( updatingSetting === settingKey || updateSettingsMutation.isPending || toggleLoggingMutation.isPending ) {
			return;
		}
		setUpdatingSetting( settingKey );
		updateSettingsMutation.mutate( {
			[ settingKey ]: currentValue === 'enabled' ? 'disabled' : 'enabled',
		} );
	};

	const savedInterval = normalizeAutorefreshInterval( settings?.data?.autorefresh_interval );

	React.useEffect( () => {
		setIntervalInput( String( savedInterval ) );
	}, [ savedInterval ] );

	if ( isPending ) {
		return <SettingsSkeleton />;
	}

	if ( ! settings?.data ) {
		return null;
	}

	const currentSettings = settings.data;
	const isLoggingEnabled = currentSettings.log_status === 'enabled';
	const isAutorefreshEnabled = currentSettings.autorefresh === 'enabled';

	return (
		<div className="logmate-screen">
			<div className="logmate-screen-toolbar">
				<BackToLogsButton />
			</div>
			<div className="logmate-settings">
				<div className="logmate-settings-section">
					<div className="logmate-setting-header">
						<StatusIndicator
							status={ currentSettings.log_status }
							onToggle={ () => toggleLoggingMutation.mutate() }
							loading={ toggleLoggingMutation.isPending }
						/>
					</div>
				</div>

				{ isLoggingEnabled && (
					<>
						<div className="logmate-settings-section">
							<div className="logmate-setting-item">
							<div className="logmate-setting-row">
								<div className="logmate-setting-label-wrapper">
									<label>Auto-refresh logs</label>
									<Tooltip 
										content="Automatically refresh logs on a custom interval to show new entries in real-time."
										position="right"
									/>
								</div>
								<div className="logmate-toggle-wrapper">
									<Toggle
										checked={ isAutorefreshEnabled }
										onChange={ () => handleSettingUpdate( 'autorefresh', currentSettings.autorefresh ) }
										disabled={ updatingSetting === 'autorefresh' || toggleLoggingMutation.isPending }
									/>
									{ updatingSetting === 'autorefresh' && (
										<div className="logmate-toggle-loader">
											<Spinner />
										</div>
									) }
								</div>
							</div>
							{ isAutorefreshEnabled && (
								<div className="logmate-setting-row logmate-setting-row-nested">
									<div className="logmate-setting-label-wrapper">
										<label htmlFor="logmate-autorefresh-interval">Refresh interval (seconds)</label>
										<Tooltip
											content={ `How often to reload logs (${ MIN_AUTOREFRESH_INTERVAL_SECONDS }–${ MAX_AUTOREFRESH_INTERVAL_SECONDS } seconds). Default is ${ DEFAULT_AUTOREFRESH_INTERVAL_SECONDS } seconds.` }
											position="right"
										/>
									</div>
									<div className="logmate-interval-control">
										<input
											id="logmate-autorefresh-interval"
											type="number"
											className="logmate-input logmate-interval-input"
											min={ MIN_AUTOREFRESH_INTERVAL_SECONDS }
											max={ MAX_AUTOREFRESH_INTERVAL_SECONDS }
											step={ 1 }
											value={ intervalInput }
											onChange={ ( event ) => setIntervalInput( event.target.value ) }
											onBlur={ handleIntervalSave }
											onKeyDown={ ( event ) => {
												if ( event.key === 'Enter' ) {
													event.currentTarget.blur();
												}
											} }
											disabled={ updatingSetting === 'autorefresh_interval' || toggleLoggingMutation.isPending }
										/>
										{ updatingSetting === 'autorefresh_interval' && (
											<span className="logmate-interval-spinner" aria-hidden="true">
												<Spinner />
											</span>
										) }
									</div>
								</div>
							) }
						</div>
						<div className="logmate-setting-item">
							<div className="logmate-setting-row">
								<div className="logmate-setting-label-wrapper">
									<label>Log JavaScript errors</label>
									<Tooltip 
										content="Capture and log JavaScript errors from the frontend to a separate log file."
										position="right"
									/>
								</div>
								<div className="logmate-toggle-wrapper">
									<Toggle
										checked={ currentSettings.js_error_logging === 'enabled' }
										onChange={ () => handleSettingUpdate( 'js_error_logging', currentSettings.js_error_logging ) }
										disabled={ updatingSetting === 'js_error_logging' || toggleLoggingMutation.isPending }
									/>
									{ updatingSetting === 'js_error_logging' && (
										<div className="logmate-toggle-loader">
											<Spinner />
										</div>
									) }
								</div>
							</div>
						</div>
						<div className="logmate-setting-item">
							<div className="logmate-setting-row">
								<div className="logmate-setting-label-wrapper">
									<label>Modify SCRIPT_DEBUG</label>
									<Tooltip 
										content="Controls SCRIPT_DEBUG in wp-config.php. Enables non-minified JS/CSS for easier debugging."
										position="right"
									/>
								</div>
								<div className="logmate-toggle-wrapper">
									<Toggle
										checked={ currentSettings.modify_script_debug === 'enabled' }
										onChange={ () => handleSettingUpdate( 'modify_script_debug', currentSettings.modify_script_debug ) }
										disabled={ updatingSetting === 'modify_script_debug' || toggleLoggingMutation.isPending }
									/>
									{ updatingSetting === 'modify_script_debug' && (
										<div className="logmate-toggle-loader">
											<Spinner />
										</div>
									) }
								</div>
							</div>
						</div>
						</div>

						<LogPurgeSettings />
					</>
				) }
			</div>
		</div>
	);
};

