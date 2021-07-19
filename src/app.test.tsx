import React from 'react';
import {render, screen} from '@testing-library/react';
import App from './app';

test('renders the "Get started!" link on the intro screen', () => {
	render(<App />);
	const linkElement = screen.getByText(/get started!/i);
	expect(linkElement).toBeInTheDocument();
});
