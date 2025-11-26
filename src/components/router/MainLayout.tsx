import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bug, Gear, List, X, Info } from '@phosphor-icons/react';

export const MainLayout: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );
	const menuRef = useRef< HTMLDivElement >( null );

	// Close menu when clicking outside
	useEffect( () => {
		const handleClickOutside = ( event: MouseEvent ) => {
			const target = event.target as Node;
			const menuContainer = document.querySelector( '.debug-master-menu-container' );
			
			if ( 
				menuRef.current && 
				! menuRef.current.contains( target ) &&
				menuContainer &&
				! menuContainer.contains( target )
			) {
				setIsMenuOpen( false );
			}
		};

		if ( isMenuOpen ) {
			document.addEventListener( 'mousedown', handleClickOutside );
		}

		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [ isMenuOpen ] );

	// Close menu when route changes
	useEffect( () => {
		setIsMenuOpen( false );
	}, [ location.pathname ] );

	const handleNavClick = ( path: string ) => {
		navigate( path );
		setIsMenuOpen( false );
	};

	const handleToggleClick = ( e: React.MouseEvent<HTMLButtonElement> ) => {
		e.stopPropagation();
		setIsMenuOpen( ! isMenuOpen );
	};

	return (
		<div className="debug-master-app">
			<div className="debug-master-menu-container">
				<button
					className="debug-master-floating-menu-toggle"
					onClick={ handleToggleClick }
					aria-label="Toggle menu"
					type="button"
				>
					{ isMenuOpen ? <X size={ 22 } /> : <List size={ 22 } /> }
				</button>
				{ isMenuOpen && (
					<div className="debug-master-dropdown-menu" ref={ menuRef }>
						<button
							onClick={ () => handleNavClick( '/logs' ) }
							className={ `debug-master-dropdown-item ${ location.pathname === '/logs' ? 'active' : '' }` }
						>
							<Bug size={ 18 } />
							<span>Logs</span>
						</button>
						<button
							onClick={ () => handleNavClick( '/settings' ) }
							className={ `debug-master-dropdown-item ${ location.pathname === '/settings' ? 'active' : '' }` }
						>
							<Gear size={ 18 } />
							<span>Settings</span>
						</button>
						<button
							onClick={ () => handleNavClick( '/system-info' ) }
							className={ `debug-master-dropdown-item ${ location.pathname === '/system-info' ? 'active' : '' }` }
						>
							<Info size={ 18 } />
							<span>System Info</span>
						</button>
					</div>
				) }
			</div>
			<div className="debug-master-content">
				<Outlet />
			</div>
		</div>
	);
};

