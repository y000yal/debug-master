export interface LogEntry {
	id: string;
	type: string;
	message: string;
	source: string;
	occurrences: string[];
	count: number;
	log_type?: 'php' | 'js';
}

export interface Settings {
	log_status: string;
	autorefresh: string;
	js_error_logging: string;
	modify_script_debug: string;
	process_non_utc_timezones: string;
	log_file_path: string;
	js_log_file_path: string;
}

export interface LogsResponse {
	data: LogEntry[];
	file_size: string;
	count: number;
	php_count?: number;
	js_count?: number;
}

export interface PurgeRequest {
	before_date?: string;
	number?: number;
	period?: 'days' | 'weeks' | 'months';
}

