import React, { useId } from 'react';
import { Info } from '@phosphor-icons/react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface TooltipProps {
	content: string;
	children?: React.ReactNode;
	position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
	content, 
	children,
	position = 'top' 
}) => {
	const tooltipId = useId();

	return (
		<div className="debug-master-tooltip-wrapper">
			{children ? (
				<div
					data-tooltip-id={tooltipId}
					className="debug-master-tooltip-trigger"
				>
					{children}
				</div>
			) : (
				<button
					type="button"
					data-tooltip-id={tooltipId}
					className="debug-master-tooltip-icon"
					aria-label="Information"
				>
					<Info size={16} />
				</button>
			)}
			<ReactTooltip
				id={tooltipId}
				place={position}
				content={content}
				className="debug-master-react-tooltip"
			/>
		</div>
	);
};

