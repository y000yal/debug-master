import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../axios/api';
import { toast } from 'react-toastify';
import { Trash } from '@phosphor-icons/react';

export const LogPurgeSettings: React.FC = () => {
	const queryClient = useQueryClient();
	const [ purgeType, setPurgeType ] = useState< 'before' | 'keep' >( 'keep' );
	const [ logType, setLogType ] = useState< 'all' | 'php' | 'js' >( 'all' );
	const [ beforeDate, setBeforeDate ] = useState( '' );
	const [ keepNumber, setKeepNumber ] = useState( 7 );
	const [ keepPeriod, setKeepPeriod ] = useState< 'days' | 'weeks' | 'months' >( 'days' );

	const purgeMutation = useMutation( {
		mutationFn: async ( data: any ) => {
			if ( purgeType === 'before' ) {
				const response = await api.post( '/purge/before-date', { 
					before_date: data.beforeDate,
					log_type: logType,
				} );
				return response.data;
			} else {
				const response = await api.post( '/purge/keep-last', {
					number: data.number,
					period: data.period,
					log_type: logType,
				} );
				return response.data;
			}
		},
		onSuccess: ( data ) => {
			toast.success( data.message || 'Logs purged successfully' );
			queryClient.invalidateQueries( { queryKey: [ 'logs' ] } );
		},
		onError: () => {
			toast.error( 'Failed to purge logs' );
		},
	} );

	const handlePurge = () => {
		if ( purgeType === 'before' && ! beforeDate ) {
			toast.error( 'Please select a date' );
			return;
		}

		if ( purgeType === 'keep' && keepNumber <= 0 ) {
			toast.error( 'Please enter a valid number' );
			return;
		}

		if ( ! window.confirm( 'Are you sure you want to purge logs? This action cannot be undone.' ) ) {
			return;
		}

		if ( purgeType === 'before' ) {
			purgeMutation.mutate( { beforeDate } );
		} else {
			purgeMutation.mutate( { number: keepNumber, period: keepPeriod } );
		}
	};

	return (
		<div className="debug-master-settings-section">
			<div className="debug-master-setting-item">
				<label>Purge Log Type:</label>
				<select 
					className="debug-master-select"
					value={ logType } 
					onChange={ ( e ) => setLogType( e.target.value as 'all' | 'php' | 'js' ) }
				>
					<option value="all">All Logs</option>
					<option value="php">PHP Logs Only</option>
					<option value="js">JavaScript Logs Only</option>
				</select>
			</div>
			<div className="debug-master-purge-options">
				<div className="debug-master-radio-group">
					<label className="debug-master-radio-label">
						<input
							type="radio"
							className="debug-master-radio"
							value="keep"
							checked={ purgeType === 'keep' }
							onChange={ ( e ) => setPurgeType( e.target.value as 'keep' ) }
						/>
						<span>Keep only logs from last</span>
					</label>
					{ purgeType === 'keep' && (
						<div className="debug-master-purge-inputs">
							<input
								type="number"
								className="debug-master-input"
								min="1"
								value={ keepNumber }
								onChange={ ( e ) => setKeepNumber( parseInt( e.target.value, 10 ) ) }
							/>
							<select 
								className="debug-master-select"
								value={ keepPeriod } 
								onChange={ ( e ) => setKeepPeriod( e.target.value as any ) }
							>
								<option value="days">Days</option>
								<option value="weeks">Weeks</option>
								<option value="months">Months</option>
							</select>
						</div>
					) }
				</div>

				<div className="debug-master-radio-group">
					<label className="debug-master-radio-label">
						<input
							type="radio"
							className="debug-master-radio"
							value="before"
							checked={ purgeType === 'before' }
							onChange={ ( e ) => setPurgeType( e.target.value as 'before' ) }
						/>
						<span>Delete logs before date</span>
					</label>
					{ purgeType === 'before' && (
						<div className="debug-master-purge-inputs">
							<input
								type="datetime-local"
								className="debug-master-input debug-master-datetime-input"
								value={ beforeDate }
								onChange={ ( e ) => setBeforeDate( e.target.value ) }
							/>
						</div>
					) }
				</div>
			</div>

			<button
				onClick={ handlePurge }
				disabled={ purgeMutation.isPending }
				className="debug-master-btn debug-master-btn-danger"
			>
				<Trash size={ 16 } />
				{ purgeMutation.isPending ? 'Purging...' : 'Purge Logs' }
			</button>
		</div>
	);
};

