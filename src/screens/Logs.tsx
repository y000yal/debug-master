import React, { useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../axios/api';
import { LogsTable } from '../components/LogsTable';
import { LoggingDisabledNotice } from '../components/LoggingDisabledNotice';
import { LogsResponse, Settings } from '../types';
import { normalizeAutorefreshInterval } from '../constants/settings';

export const LogsScreen: React.FC = () => {
	const [ logType, setLogType ] = React.useState< 'all' | 'php' | 'js' >( 'all' );
	
	// Fetch settings to check autorefresh status.
	const { data: settingsData } = useQuery< { data: Settings } >( {
		queryKey: [ 'settings' ],
		queryFn: async () => {
			const response = await api.get( '/settings' );
			return response.data;
		},
		refetchOnWindowFocus: true,
	} );

	// Memoize logStatusEnabled to check if logging is enabled.
	const logStatusEnabled = useMemo( () => {
		return settingsData?.data?.log_status === 'enabled';
	}, [ settingsData?.data?.log_status ] );

	// Memoize autorefreshEnabled to ensure it updates when settingsData changes.
	const autorefreshEnabled = useMemo( () => {
		return settingsData?.data?.autorefresh === 'enabled';
	}, [ settingsData?.data?.autorefresh ] );

	const autorefreshIntervalMs = useMemo( () => {
		const seconds = normalizeAutorefreshInterval( settingsData?.data?.autorefresh_interval );
		return seconds * 1000;
	}, [ settingsData?.data?.autorefresh_interval ] );
	
	const { data, isLoading, error, refetch: refetchLogs, isFetching } = useQuery< LogsResponse >( {
		queryKey: [ 'logs', logType ],
		queryFn: async () => {
			const response = await api.get( '/logs', {
				params: { type: logType },
			} );
			return response.data;
		},
		enabled: logStatusEnabled === true, // Only fetch logs when logging is enabled.
		refetchInterval: false, // Disable automatic refetch, we'll handle it manually.
		retry: logStatusEnabled === true ? 1 : false, // Only retry if logging is enabled.
	} );

	// Wrapper function to ensure refetch only happens when logging is enabled.
	const refetch = useCallback( () => {
		if ( logStatusEnabled === true ) {
			refetchLogs();
		}
	}, [ logStatusEnabled, refetchLogs ] );

	// Auto-refresh logs every 10 seconds if enabled.
	useEffect( () => {
		// Early return if settings not loaded yet.
		if ( settingsData === undefined ) {
			return;
		}

		// Don't set up auto-refresh if logging is disabled.
		if ( ! logStatusEnabled ) {
			return;
		}

		let intervalId: NodeJS.Timeout | null = null;

		if ( autorefreshEnabled ) {
			intervalId = setInterval( () => {
				refetch();
			}, autorefreshIntervalMs );
		}

		// Cleanup interval on unmount or when setting changes.
		return () => {
			if ( intervalId ) {
				clearInterval( intervalId );
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ autorefreshEnabled, autorefreshIntervalMs, logStatusEnabled, refetch ] );

	return (
		<div className="logmate-screen">
			{ settingsData?.data && (
				<LoggingDisabledNotice logStatus={ settingsData.data.log_status } />
			) }
			{ error ? (
				<div className="logmate-error">
					Error loading logs. Please try again.
				</div>
			) : (
				<LogsTable
					entries={ data?.data || [] }
					onRefresh={ refetch }
					logType={ logType }
					setLogType={ setLogType }
					isLoading={ isLoading }
					isFetching={ isFetching }
				/>
			) }
		</div>
	);
};

