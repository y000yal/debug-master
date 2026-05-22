import React from 'react';
import { Link } from 'react-router-dom';
import { Toggle } from './Toggle';
import { useToggleLogging } from '../hooks/useToggleLogging';

interface LoggingDisabledNoticeProps {
	logStatus: string;
}

export const LoggingDisabledNotice: React.FC< LoggingDisabledNoticeProps > = ( { logStatus } ) => {
	const toggleLoggingMutation = useToggleLogging();
	const isEnabling = toggleLoggingMutation.isPending;

	if ( logStatus === 'enabled' ) {
		return null;
	}

	return (
		<div
			className="logmate-disabled-notice"
			role="alert"
			aria-busy={ isEnabling }
		>
			<p className="logmate-disabled-notice-text">
				Debug logging is off. Enable to view logs, or open{ ' ' }
				<Link to="/settings">Settings</Link>.
			</p>
			<div className="logmate-disabled-notice-action">
				<span className="logmate-disabled-notice-action-label">Enable</span>
				<div className="logmate-disabled-notice-toggle">
					<Toggle
						checked={ false }
						onChange={ () => toggleLoggingMutation.mutate() }
						disabled={ isEnabling }
					/>
					{ isEnabling && (
						<span className="logmate-disabled-notice-spinner" aria-hidden="true">
							<span className="spinner" />
						</span>
					) }
				</div>
			</div>
		</div>
	);
};
