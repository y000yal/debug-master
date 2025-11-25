import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { LogsScreen } from '../../screens/Logs';
import { SettingsScreen } from '../../screens/Settings';
import { SystemInfoScreen } from '../../screens/SystemInfo';

export const Router: React.FC = () => {
	return (
		<Routes>
			<Route path="/" element={ <MainLayout /> }>
				<Route index element={ <Navigate to="/logs" replace /> } />
				<Route path="logs" element={ <LogsScreen /> } />
				<Route path="settings" element={ <SettingsScreen /> } />
				<Route path="system-info" element={ <SystemInfoScreen /> } />
			</Route>
		</Routes>
	);
};

