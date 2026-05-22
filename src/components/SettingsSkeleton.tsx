import React from 'react';
import { BackToLogsButton } from './BackToLogsButton';

interface SkeletonBlockProps {
	width: string | number;
	height?: number;
	variant?: 'line' | 'badge' | 'toggle' | 'input' | 'select' | 'button';
}

const SkeletonBlock: React.FC< SkeletonBlockProps > = ( {
	width,
	height = 14,
	variant = 'line',
} ) => {
	const heights: Record< NonNullable< SkeletonBlockProps['variant'] >, number > = {
		line: height,
		badge: 24,
		toggle: 20,
		input: 32,
		select: 32,
		button: 38,
	};

	const blockHeight = heights[ variant ];

	return (
		<span
			className={ `logmate-skeleton-block logmate-skeleton-block--${ variant }` }
			style={ { width, height: blockHeight } }
			aria-hidden="true"
		/>
	);
};

interface SkeletonSettingRowProps {
	labelWidth?: string | number;
	nested?: boolean;
	control?: 'toggle' | 'select' | 'input';
}

const SkeletonSettingRow: React.FC< SkeletonSettingRowProps > = ( {
	labelWidth = 160,
	nested = false,
	control = 'toggle',
} ) => (
	<div className={ `logmate-setting-row${ nested ? ' logmate-setting-row-nested' : '' }` }>
		<div className="logmate-setting-label-wrapper">
			<SkeletonBlock width={ labelWidth } height={ 14 } />
		</div>
		<div className="logmate-skeleton-control">
			{ control === 'toggle' && <SkeletonBlock width={ 36 } variant="toggle" /> }
			{ control === 'select' && <SkeletonBlock width={ 120 } variant="select" /> }
			{ control === 'input' && <SkeletonBlock width={ 68 } variant="input" /> }
		</div>
	</div>
);

export const SettingsSkeleton: React.FC = () => {
	return (
		<div className="logmate-screen">
			<div className="logmate-screen-toolbar">
				<BackToLogsButton />
			</div>
			<div
				className="logmate-settings logmate-settings-skeleton"
				aria-busy="true"
				aria-label="Loading settings"
			>
				<div className="logmate-settings-section">
					<div className="logmate-setting-header">
						<div className="logmate-setting-row">
							<div className="status-info">
								<div className="logmate-setting-label-wrapper">
									<SkeletonBlock width={ 72 } variant="badge" />
								</div>
							</div>
							<div className="logmate-toggle-wrapper">
								<SkeletonBlock width={ 36 } variant="toggle" />
							</div>
						</div>
					</div>
				</div>

				<div className="logmate-settings-section">
					<div className="logmate-setting-item">
						<SkeletonSettingRow labelWidth={ 130 } />
						<SkeletonSettingRow labelWidth={ 200 } nested control="input" />
					</div>
					<div className="logmate-setting-item">
						<SkeletonSettingRow labelWidth={ 170 } />
					</div>
					<div className="logmate-setting-item">
						<SkeletonSettingRow labelWidth={ 150 } />
					</div>
				</div>

				<div className="logmate-settings-section">
					<div className="logmate-setting-item">
						<SkeletonSettingRow labelWidth={ 110 } control="select" />
					</div>
					<div className="logmate-setting-item">
						<SkeletonSettingRow labelWidth={ 180 } />
					</div>
					<div className="logmate-setting-item">
						<SkeletonSettingRow labelWidth={ 165 } />
					</div>
					<div className="logmate-skeleton-purge-action">
						<SkeletonBlock width={ 120 } variant="button" />
					</div>
				</div>
			</div>
		</div>
	);
};
