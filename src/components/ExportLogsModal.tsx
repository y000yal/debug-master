import React, { useState, useEffect } from 'react';
import { X, Download } from '@phosphor-icons/react';
import api from '../axios/api';
import { toast } from 'react-toastify';

interface ExportLogsModalProps {
	isOpen: boolean;
	onClose: () => void;
	logType: 'all' | 'php' | 'js';
}

export const ExportLogsModal: React.FC<ExportLogsModalProps> = ({
	isOpen,
	onClose,
	logType,
}) => {
	const [exportType, setExportType] = useState<'date-range' | 'entire-file'>('date-range');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [isExporting, setIsExporting] = useState(false);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	const handleExport = async () => {
		if (exportType === 'date-range' && (!startDate || !endDate)) {
			toast.error('Please select both start and end dates');
			return;
		}

		if (exportType === 'date-range' && new Date(startDate) > new Date(endDate)) {
			toast.error('Start date must be before end date');
			return;
		}

		setIsExporting(true);

		try {
			const params: any = {
				type: logType,
				export_type: exportType,
			};

			if (exportType === 'date-range') {
				params.start_date = startDate;
				params.end_date = endDate;
			}

			const response = await api.get('/logs/export', {
				params,
				responseType: 'blob',
			});

			// Create a blob URL and trigger download
			const blob = new Blob([response.data], { type: 'text/plain' });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			
			const logTypeText = logType === 'all' ? 'all' : logType === 'php' ? 'php' : 'js';
			const dateSuffix = exportType === 'date-range' 
				? `_${startDate}_to_${endDate}` 
				: '_entire';
			link.download = `debug-logs-${logTypeText}${dateSuffix}.txt`;
			
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.success('Logs exported successfully');
			onClose();
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to export logs');
		} finally {
			setIsExporting(false);
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="debug-master-modal-overlay" onClick={onClose}>
			<div className="debug-master-modal" onClick={(e) => e.stopPropagation()}>
				<div className="debug-master-modal-header">
					<h2>Export Logs</h2>
					<button className="debug-master-modal-close" onClick={onClose}>
						<X size={20} />
					</button>
				</div>
				<div className="debug-master-modal-body">
					<div className="debug-master-export-options">
						<div className="debug-master-radio-group">
							<label className="debug-master-radio-label">
								<input
									type="radio"
									name="exportType"
									value="date-range"
									checked={exportType === 'date-range'}
									onChange={(e) => setExportType(e.target.value as 'date-range')}
									className="debug-master-radio"
								/>
								<span>Export by Date Range</span>
							</label>
							{exportType === 'date-range' && (
								<div className="debug-master-date-range-inputs">
									<div className="debug-master-date-input-group">
										<label>Start Date</label>
										<input
											type="date"
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
											className="debug-master-input debug-master-datetime-input"
										/>
									</div>
									<div className="debug-master-date-input-group">
										<label>End Date</label>
										<input
											type="date"
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
											className="debug-master-input debug-master-datetime-input"
										/>
									</div>
								</div>
							)}
						</div>
						<div className="debug-master-radio-group">
							<label className="debug-master-radio-label">
								<input
									type="radio"
									name="exportType"
									value="entire-file"
									checked={exportType === 'entire-file'}
									onChange={(e) => setExportType(e.target.value as 'entire-file')}
									className="debug-master-radio"
								/>
								<span>Export Entire File</span>
							</label>
						</div>
					</div>
				</div>
				<div className="debug-master-modal-footer">
					<button
						className="debug-master-btn debug-master-btn-secondary"
						onClick={onClose}
						disabled={isExporting}
					>
						Cancel
					</button>
					<button
						className="debug-master-btn debug-master-btn-primary"
						onClick={handleExport}
						disabled={isExporting}
					>
						<Download size={18} />
						{isExporting ? 'Exporting...' : 'Export Logs'}
					</button>
				</div>
			</div>
		</div>
	);
};

