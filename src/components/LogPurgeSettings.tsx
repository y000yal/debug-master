import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../axios/api';
import { toast } from 'react-toastify';
import { Trash, Warning } from '@phosphor-icons/react';
import { Modal } from './Modal';
import { Tooltip } from './Tooltip';
import { Toggle } from './Toggle';

export const LogPurgeSettings: React.FC = () => {
	const queryClient = useQueryClient();
	const [ purgeType, setPurgeType ] = useState< 'before' | 'keep' >( 'keep' );
	const [ logType, setLogType ] = useState< 'all' | 'php' | 'js' >( 'all' );
	const [ beforeDate, setBeforeDate ] = useState( '' );
	const [ keepNumber, setKeepNumber ] = useState( 7 );
	const [ keepPeriod, setKeepPeriod ] = useState< 'days' | 'weeks' | 'months' >( 'days' );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

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

	const handlePurgeClick = () => {
		if ( purgeType === 'before' && ! beforeDate ) {
			toast.error( 'Please select a date' );
			return;
		}

		if ( purgeType === 'keep' && keepNumber <= 0 ) {
			toast.error( 'Please enter a valid number' );
			return;
		}

		setIsModalOpen( true );
	};

	const handlePurgeConfirm = () => {
		if ( purgeType === 'before' ) {
			purgeMutation.mutate( { beforeDate } );
		} else {
			purgeMutation.mutate( { number: keepNumber, period: keepPeriod } );
		}
		setIsModalOpen( false );
	};

	const getPurgeSummary = () => {
		const logTypeText = logType === 'all' ? 'all logs' : logType === 'php' ? 'PHP logs' : 'JavaScript logs';
		
		if ( purgeType === 'before' ) {
			const dateObj = new Date( beforeDate );
			const formattedDate = dateObj.toLocaleDateString( 'en-US', { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			} );
			return `Delete all ${ logTypeText } before ${ formattedDate }`;
		} else {
			const periodText = keepPeriod === 'days' ? 'day(s)' : keepPeriod === 'weeks' ? 'week(s)' : 'month(s)';
			return `Keep only the last ${ keepNumber } ${ periodText } of ${ logTypeText }`;
		}
	};

	return (
		<>
			<div className="debug-master-settings-section">
				<div className="debug-master-setting-item">
					<div className="debug-master-setting-row">
						<div className="debug-master-setting-label-wrapper">
							<label>Purge Log Type</label>
							<Tooltip 
								content="Choose which log files to purge: All, PHP only, or JavaScript only."
								position="right"
							/>
						</div>
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
				</div>
				
				<div className="debug-master-setting-item">
					<div className="debug-master-setting-row">
						<div className="debug-master-setting-label-wrapper">
							<label>Keep only logs from last</label>
							<Tooltip 
								content="Delete log entries older than the specified time period to manage file size."
								position="right"
							/>
						</div>
						<div className="debug-master-toggle-wrapper debug-master-toggle-wrapper-column">
							<Toggle
								checked={ purgeType === 'keep' }
								onChange={ () => setPurgeType( purgeType === 'keep' ? 'before' : 'keep' ) }
							/>
							{ purgeType === 'keep' && (
								<div className="debug-master-purge-inputs">
									<input
										type="number"
										className="debug-master-input"
										min="1"
										value={ keepNumber }
										onChange={ ( e ) => setKeepNumber( parseInt( e.target.value, 10 ) || 1 ) }
									/>
									<select 
										className="debug-master-select"
										value={ keepPeriod } 
										onChange={ ( e ) => setKeepPeriod( e.target.value as 'days' | 'weeks' | 'months' ) }
									>
										<option value="days">Days</option>
										<option value="weeks">Weeks</option>
										<option value="months">Months</option>
									</select>
								</div>
							) }
						</div>
					</div>
				</div>

				<div className="debug-master-setting-item">
					<div className="debug-master-setting-row">
						<div className="debug-master-setting-label-wrapper">
							<label>Delete logs before date</label>
							<Tooltip 
								content="Permanently delete all log entries before the selected date and time."
								position="right"
							/>
						</div>
						<div className="debug-master-toggle-wrapper debug-master-toggle-wrapper-column">
							<Toggle
								checked={ purgeType === 'before' }
								onChange={ () => setPurgeType( purgeType === 'before' ? 'keep' : 'before' ) }
							/>
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
				</div>

				<button
					onClick={ handlePurgeClick }
					disabled={ purgeMutation.isPending }
					className="debug-master-btn debug-master-btn-danger"
				>
					<Trash size={ 16 } />
					{ purgeMutation.isPending ? 'Purging...' : 'Purge Logs' }
				</button>
			</div>

			<Modal
				isOpen={ isModalOpen }
				onClose={ () => setIsModalOpen( false ) }
				onConfirm={ handlePurgeConfirm }
				title="Confirm Purge Logs"
				confirmText="Purge Logs"
				cancelText="Cancel"
				confirmButtonClass="debug-master-btn-danger"
				disabled={ purgeMutation.isPending }
			>
				<div className="debug-master-purge-confirm-content">
					<div className="debug-master-purge-warning">
						<Warning size={ 24 } weight="fill" />
						<p className="debug-master-purge-warning-text">
							Are you sure you want to purge logs? This action cannot be undone.
						</p>
					</div>
					<div className="debug-master-purge-summary">
						<p className="debug-master-purge-summary-label">Summary:</p>
						<p className="debug-master-purge-summary-text">{ getPurgeSummary() }</p>
					</div>
				</div>
			</Modal>
		</>
	);
};

