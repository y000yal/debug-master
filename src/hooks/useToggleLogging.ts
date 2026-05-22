import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../axios/api';
import { Settings } from '../types';
import { toast } from 'react-toastify';

export function useToggleLogging() {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async () => {
			const response = await api.post( '/settings/toggle-logging' );
			return response.data;
		},
		onSuccess: ( data ) => {
			toast.success( data.message );
			const cached = queryClient.getQueryData< { data: Settings } >( [ 'settings' ] );
			if ( cached?.data ) {
				const newStatus = cached.data.log_status === 'enabled' ? 'disabled' : 'enabled';
				queryClient.setQueryData< { data: Settings } >( [ 'settings' ], {
					data: { ...cached.data, log_status: newStatus },
				} );
			}
			queryClient.invalidateQueries( { queryKey: [ 'settings' ] } );
			queryClient.invalidateQueries( { queryKey: [ 'logs' ] } );
		},
		onError: () => {
			toast.error( 'Failed to toggle logging' );
		},
	} );
}
