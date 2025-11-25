import React from 'react';
import { Toggle } from './Toggle';
import { Spinner } from './Spinner';

interface StatusIndicatorProps {
	status: string;
	onToggle: () => void;
	loading?: boolean;
}

export const StatusIndicator: React.FC< StatusIndicatorProps > = ( { status, onToggle, loading } ) => {
	const isEnabled = status === 'enabled';

	return (
		<div className="debug-master-setting-row">
			<div className="status-info">
				<span className={ `status-badge ${ isEnabled ? 'enabled' : 'disabled' }` }>
					{ isEnabled ? 'Enabled' : 'Disabled' }
				</span>
			</div>
			<div className="debug-master-toggle-wrapper">
				{ loading && (
					<div className="debug-master-toggle-loader">
						<Spinner />
					</div>
				) }
			<Toggle checked={ isEnabled } onChange={ onToggle } disabled={ loading } />
			</div>
		</div>
	);
};

