import React from 'react';
import {useQuery} from '@tanstack/react-query';
import api from '../axios/api';
import {Spinner} from '../components/Spinner';

interface SystemInfo {
    php: {
        version: string;
        memory_limit: string;
        max_execution_time: string;
        upload_max_filesize: string;
        post_max_size: string;
        max_input_vars: string;
    };
    wordpress: {
        version: string;
        memory_limit: string;
        max_memory_limit: string;
    };
    server: {
        software: string;
        os: string;
        db_version: string;
        db_charset: string;
        db_collate: string;
        db_extension: string;
    };
    plugins: Array<{
        name: string;
        version: string;
        active: boolean;
    }>;
    theme: {
        name: string;
        version: string;
        author: string;
    };
    debug_logs: {
        php_log_size: string;
        js_log_size: string;
        total_size: string;
        php_log_path: string;
        js_log_path: string;
        php_log_exists: boolean;
        js_log_exists: boolean;
    };
}

export const SystemInfoScreen: React.FC = () => {
    const {data, isLoading, error} = useQuery<{ data: SystemInfo }>({
        queryKey: ['system-info'],
        queryFn: async () => {
            const response = await api.get('/system-info');
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="debug-master-screen">
                <Spinner/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="debug-master-screen">
                <div className="debug-master-error">
                    Error loading system information. Please try again.
                </div>
            </div>
        );
    }

    const systemInfo = data?.data;

    if (!systemInfo) {
        return null;
    }

    return (
        <div className="debug-master-screen">
            <div className="debug-master-system-info-mosaic">

                {/* PHP Card */}
                <div className="debug-master-mosaic-card debug-master-card-large">
                    <div className="debug-master-card-header">
                        <h2>PHP Configurations</h2>
                    </div>
                    <div className="debug-master-card-content">
                        <div className="debug-master-stat-grid">
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">Version</span>
                                <span className="debug-master-stat-value">{systemInfo.php.version}</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">Memory Limit</span>
                                <span className="debug-master-stat-value">{systemInfo.php.memory_limit}</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">Max Execution</span>
                                <span className="debug-master-stat-value">{systemInfo.php.max_execution_time}s</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">Upload Max</span>
                                <span className="debug-master-stat-value">{systemInfo.php.upload_max_filesize}</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">Post Max</span>
                                <span className="debug-master-stat-value">{systemInfo.php.post_max_size}</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">Max Input Vars</span>
                                <span className="debug-master-stat-value">{systemInfo.php.max_input_vars}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WordPress Card */}
                <div className="debug-master-mosaic-card">
                    <div className="debug-master-card-header">
                        <h2>WordPress</h2>
                    </div>
                    <div className="debug-master-card-content">
                        <div className="debug-master-stat-item">
                            <span className="debug-master-stat-label">Version</span>
                            <span className="debug-master-stat-value">{systemInfo.wordpress.version}</span>
                        </div>
                        <div className="debug-master-stat-item">
                            <span className="debug-master-stat-label">Memory Limit</span>
                            <span className="debug-master-stat-value">{systemInfo.wordpress.memory_limit}</span>
                        </div>
                        <div className="debug-master-stat-item">
                            <span className="debug-master-stat-label">Max Memory</span>
                            <span className="debug-master-stat-value">{systemInfo.wordpress.max_memory_limit}</span>
                        </div>
                    </div>
                </div>

                {/* Theme Card */}
                <div className="debug-master-mosaic-card">
                    <div className="debug-master-card-header">
                        <h2>Theme</h2>
                    </div>
                    <div className="debug-master-card-content">
                        <div className="debug-master-stat-item">
                            <span className="debug-master-stat-label">Name</span>
                            <span className="debug-master-stat-value">{systemInfo.theme.name}</span>
                        </div>
                        <div className="debug-master-stat-item">
                            <span className="debug-master-stat-label">Version</span>
                            <span className="debug-master-stat-value">{systemInfo.theme.version}</span>
                        </div>
                        <div className="debug-master-stat-item">
                            <span className="debug-master-stat-label">Author</span>
                            <span className="debug-master-stat-value">{systemInfo.theme.author}</span>
                        </div>
                    </div>
                </div>
                {/* Debug Logs Card */}
                <div className="debug-master-mosaic-card debug-master-card-large">
                    <div className="debug-master-card-header">
                        <h2>Debug Logs</h2>
                    </div>
                    <div className="debug-master-card-content">
                        <div className="debug-master-stat-item">
                            <span className="debug-master-stat-label">Total Size</span>
                            <span className="debug-master-stat-value">{systemInfo.debug_logs.total_size}</span>
                        </div>
                        <div className="debug-master-stat-item">
                            <span className="debug-master-stat-label">PHP Log</span>
                            <span className="debug-master-stat-value">{systemInfo.debug_logs.php_log_size}</span>
                        </div>
                        <div className="debug-master-stat-item">
                            <span className="debug-master-stat-label">JS Log</span>
                            <span className="debug-master-stat-value">{systemInfo.debug_logs.js_log_size}</span>
                        </div>
                        {systemInfo.debug_logs.php_log_exists && (
                            <div className="debug-master-stat-item debug-master-stat-fullwidth">
                                <span className="debug-master-stat-label">PHP Path</span>
                                <span className="debug-master-stat-value debug-master-stat-path">
                                    {systemInfo.debug_logs.php_log_path}
                                </span>
                            </div>
                        )}
                        {systemInfo.debug_logs.js_log_exists && (
                            <div className="debug-master-stat-item debug-master-stat-fullwidth">
                                <span className="debug-master-stat-label">JS Path</span>
                                <span className="debug-master-stat-value debug-master-stat-path">
                                    {systemInfo.debug_logs.js_log_path}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Server & Database Card */}
                <div className="debug-master-mosaic-card debug-master-card-large">
                    <div className="debug-master-card-header">
                        <h2>Server & Database</h2>
                    </div>
                    <div className="debug-master-card-content">
                        <div className="debug-master-stat-grid">
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">Softwares</span>
                                <span className="debug-master-stat-value">{systemInfo.server.software}</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">OS</span>
                                <span className="debug-master-stat-value">{systemInfo.server.os}</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">DB Version</span>
                                <span className="debug-master-stat-value">{systemInfo.server.db_version}</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">DB Extension</span>
                                <span className="debug-master-stat-value">{systemInfo.server.db_extension}</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">Charset</span>
                                <span className="debug-master-stat-value">{systemInfo.server.db_charset}</span>
                            </div>
                            <div className="debug-master-stat-item">
                                <span className="debug-master-stat-label">Collation</span>
                                <span className="debug-master-stat-value">{systemInfo.server.db_collate}</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Plugins Card */}
                <div className="debug-master-mosaic-card ">
                    <div className="debug-master-card-header">
                        <h2>Plugins ({systemInfo.plugins.length})</h2>
                    </div>
                    <div className="debug-master-card-content">
                        <div className="debug-master-plugins-list">
                            {systemInfo.plugins.map((plugin, index) => (
                                <div
                                    key={index}
                                    className={`debug-master-plugin-item ${plugin.active ? 'active' : ''}`}
                                >
                                    <div className="debug-master-plugin-name">
                                        {plugin.name}
                                        {plugin.active && (
                                            <span className="debug-master-plugin-badge">Active</span>
                                        )}
                                    </div>
                                    <div className="debug-master-plugin-version">v{plugin.version}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

