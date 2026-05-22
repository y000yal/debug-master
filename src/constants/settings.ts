export const DEFAULT_AUTOREFRESH_INTERVAL_SECONDS = 10;
export const MIN_AUTOREFRESH_INTERVAL_SECONDS = 3;
export const MAX_AUTOREFRESH_INTERVAL_SECONDS = 300;

export function normalizeAutorefreshInterval( seconds: number | undefined ): number {
	const value = seconds ?? DEFAULT_AUTOREFRESH_INTERVAL_SECONDS;
	return Math.min(
		MAX_AUTOREFRESH_INTERVAL_SECONDS,
		Math.max( MIN_AUTOREFRESH_INTERVAL_SECONDS, value )
	);
}
