import React from 'react';
import { BackToLogsButton } from './BackToLogsButton';

interface SkeletonLineProps {
	width?: string | number;
	height?: number;
}

const SkeletonLine: React.FC< SkeletonLineProps > = ( { width = '100%', height = 14 } ) => (
	<div className="logmate-skeleton">
		<div className="logmate-skeleton-line" style={ { width, height } } />
	</div>
);

interface SkeletonStatProps {
	valueWidth?: string | number;
}

const SkeletonStat: React.FC< SkeletonStatProps > = ( { valueWidth = '72%' } ) => (
	<div className="logmate-stat-item">
		<SkeletonLine width="42%" height={ 10 } />
		<SkeletonLine width={ valueWidth } height={ 16 } />
	</div>
);

interface SkeletonCardProps {
	large?: boolean;
	titleWidth?: string | number;
	children: React.ReactNode;
}

const SkeletonCard: React.FC< SkeletonCardProps > = ( { large, titleWidth = 120, children } ) => (
	<div className={ `logmate-mosaic-card${ large ? ' logmate-card-large' : '' }` }>
		<div className="logmate-card-header">
			<SkeletonLine width={ titleWidth } height={ 16 } />
		</div>
		<div className="logmate-card-content">{ children }</div>
	</div>
);

export const SystemInfoSkeleton: React.FC = () => {
	return (
		<div className="logmate-screen">
			<div className="logmate-screen-toolbar">
				<BackToLogsButton />
			</div>
			<div className="logmate-system-info-mosaic logmate-system-info-skeleton" aria-busy="true" aria-label="Loading system information">
				<SkeletonCard large titleWidth={ 160 }>
					<div className="logmate-stat-grid">
						{ Array.from( { length: 6 } ).map( ( _, index ) => (
							<SkeletonStat key={ `php-stat-${ index }` } valueWidth={ index % 2 === 0 ? '65%' : '48%' } />
						) ) }
					</div>
				</SkeletonCard>

				<SkeletonCard titleWidth={ 100 }>
					{ Array.from( { length: 3 } ).map( ( _, index ) => (
						<SkeletonStat key={ `wp-stat-${ index }` } valueWidth={ '58%' } />
					) ) }
				</SkeletonCard>

				<SkeletonCard titleWidth={ 72 }>
					{ Array.from( { length: 3 } ).map( ( _, index ) => (
						<SkeletonStat key={ `theme-stat-${ index }` } valueWidth={ index === 0 ? '85%' : '40%' } />
					) ) }
				</SkeletonCard>

				<SkeletonCard large titleWidth={ 110 }>
					{ Array.from( { length: 3 } ).map( ( _, index ) => (
						<SkeletonStat key={ `debug-stat-${ index }` } valueWidth="36%" />
					) ) }
					<SkeletonStat valueWidth="95%" />
					<SkeletonStat valueWidth="88%" />
				</SkeletonCard>

				<SkeletonCard large titleWidth={ 150 }>
					<div className="logmate-stat-grid">
						{ Array.from( { length: 6 } ).map( ( _, index ) => (
							<SkeletonStat key={ `server-stat-${ index }` } valueWidth={ index % 2 === 0 ? '70%' : '52%' } />
						) ) }
					</div>
				</SkeletonCard>

				<SkeletonCard titleWidth={ 100 }>
					<div className="logmate-plugins-list">
						{ Array.from( { length: 5 } ).map( ( _, index ) => (
							<div key={ `plugin-skeleton-${ index }` } className="logmate-plugin-item logmate-plugin-item-skeleton">
								<SkeletonLine width={ `${ 55 + ( index % 3 ) * 12 }%` } height={ 14 } />
								<SkeletonLine width={ 48 } height={ 12 } />
							</div>
						) ) }
					</div>
				</SkeletonCard>
			</div>
		</div>
	);
};
