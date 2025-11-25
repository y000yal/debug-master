import React, { useEffect } from 'react';
import { X } from '@phosphor-icons/react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmButtonClass?: string;
}

export const Modal: React.FC<ModalProps> = ( {
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	confirmButtonClass = 'debug-master-btn-danger',
} ) => {
	useEffect( () => {
		if ( isOpen ) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [ isOpen ] );

	useEffect( () => {
		const handleEscape = ( e: KeyboardEvent ) => {
			if ( e.key === 'Escape' && isOpen ) {
				onClose();
			}
		};

		document.addEventListener( 'keydown', handleEscape );
		return () => {
			document.removeEventListener( 'keydown', handleEscape );
		};
	}, [ isOpen, onClose ] );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<div className="debug-master-modal-overlay" onClick={ onClose }>
			<div className="debug-master-modal" onClick={ ( e ) => e.stopPropagation() }>
				<div className="debug-master-modal-header">
					<h2>{ title }</h2>
					<button className="debug-master-modal-close" onClick={ onClose }>
						<X size={ 20 } />
					</button>
				</div>
				<div className="debug-master-modal-body">
					<p>{ message }</p>
				</div>
				<div className="debug-master-modal-footer">
					<button
						className="debug-master-btn debug-master-btn-secondary"
						onClick={ onClose }
					>
						{ cancelText }
					</button>
					<button
						className={ `debug-master-btn ${ confirmButtonClass }` }
						onClick={ onConfirm }
					>
						{ confirmText }
					</button>
				</div>
			</div>
		</div>
	);
};

