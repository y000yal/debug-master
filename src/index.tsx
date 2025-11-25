import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from './App';

let root: Root | null = null;

const render = () => {
	const container = document.getElementById( 'debug-master-admin-app' );
	if ( container ) {
		if ( ! root ) {
			root = createRoot( container );
		}
		root.render( React.createElement( App ) );
	}
};

render();

// Enable Hot Module Replacement (HMR) in development.
if ( module.hot ) {
	module.hot.accept( './App', () => {
		// Re-render the app when App component changes.
		render();
	} );
}

