import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../axios/api';
import { LogsTable } from '../components/LogsTable';
import { LogEntry, LogsResponse, Settings } from '../types';
import { Spinner } from '../components/Spinner';

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

	// Memoize autorefreshEnabled to ensure it updates when settingsData changes.
	const autorefreshEnabled = useMemo( () => {
		return settingsData?.data?.autorefresh === 'enabled';
	}, [ settingsData?.data?.autorefresh ] );
	
	const { data, isLoading, error, refetch, isFetching } = useQuery< LogsResponse >( {
		queryKey: [ 'logs', logType ],
		queryFn: async () => {
			const response = await api.get( '/logs', {
				params: { type: logType },
			} );
			return response.data;
		},
		refetchInterval: false, // Disable automatic refetch, we'll handle it manually.
	} );

	// Auto-refresh logs every 10 seconds if enabled.
	useEffect( () => {
		// Early return if settings not loaded yet.
		if ( settingsData === undefined ) {
			return;
		}

		let intervalId: NodeJS.Timeout | null = null;

		if ( autorefreshEnabled ) {
			// Set up interval to refetch logs every 10 seconds.
			intervalId = setInterval( () => {
				refetch();
			}, 10000 ); // 10 seconds
		}

		// Cleanup interval on unmount or when setting changes.
		return () => {
			if ( intervalId ) {
				clearInterval( intervalId );
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ autorefreshEnabled ] ); // Only depend on autorefreshEnabled, refetch is stable from React Query

	return (
		<div className="debug-master-screen">
			{ error ? (
				<div className="debug-master-error">
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

