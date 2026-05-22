import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';

export const BackToLogsButton: React.FC = () => {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			className="logmate-back-btn"
			onClick={ () => navigate( '/logs' ) }
			aria-label="Back to logs"
		>
			<CaretLeft size={ 16 } weight="bold" aria-hidden="true" />
			<span>Back to logs</span>
		</button>
	);
};
