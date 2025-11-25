import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Declare global DebugMasterData object.
declare const DebugMasterData: { nonce: string; restUrl: string };

// Create axios instance.
const api: AxiosInstance = axios.create( {
	baseURL: DebugMasterData.restUrl,
} );

// Request interceptor to add nonce.
api.interceptors.request.use(
	( config: InternalAxiosRequestConfig ): InternalAxiosRequestConfig => {
		config.headers[ 'X-WP-Nonce' ] = DebugMasterData.nonce;
		return config;
	},
	( error ) => Promise.reject( error )
);

export default api;

