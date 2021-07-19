import React from 'react';
import {Grid} from '@material-ui/core';
import bitcoin from './assets/bitcoin.svg';
import btcAddr from './assets/nomorerepeatmeals-btc.png';

export const Donate = () => <Grid className="ingredient-list" container spacing={3}>
	<Grid item xs={12}><h2>Thank you for considering supporting our porjects!</h2></Grid>
	<Grid item xs={12}>
		<p>If you like our service please consider supporting us through one of the options below. We rely on generous contributions from our users to keep the site up and running and free to everyone. Thank you so much!</p>
	</Grid>
	<Grid item xs={6}>
		<a
			style={{
				alignItems: 'center',
				backfaceVisibility: 'hidden',
				backgroundColor: 'rgb(255, 66, 77)',
				borderRadius: '9999px',
				border: '1px solid rgb(255, 66, 77)',
				boxSizing: 'border-box',
				cursor: 'pointer',
				display: 'inline-flex',
				fontWeight: 500,
				height: 'unset',
				justifyContent: 'center',
				padding: '0.46875rem 1rem',
				position: 'relative',
				pointerEvents: 'unset',
				textAlign: 'center',
				textDecoration: 'none',
				textTransform: 'none',
				transition: 'all 300ms cubic-bezier(0.19, 1, 0.22, 1) 0s',
				userSelect: 'none',
				whiteSpace: 'unset',
				width: '100%',
				color: 'rgb(255, 255, 255)',
				fontSize: '0.875rem',
			}}
			href="https://www.patreon.com/bePatron?u=58711721"
			data-patreon-widget-type="become-patron-button"
		>
			<svg style={{
				width: '1em',
				height: '1em',
				fill: 'white',
			}}
			viewBox="0 0 569 546"
			xmlns="http://www.w3.org/2000/svg"
			>
				<g><circle cx="362.589996" cy="204.589996" data-fill="1" id="Oval" r="204.589996"></circle><rect data-fill="2" height="545.799988" id="Rectangle" width="100" x="0" y="0"></rect></g>
			</svg>&nbsp; Become a Patron!
		</a>
	</Grid>
	<Grid className="btc-addr" item xs={6}><img src={bitcoin} alt="bitcoin"/><img src={btcAddr} alt="bitcoin address"/></Grid>
	<Grid item xs={6}>More options coming soon!</Grid>
</Grid>;
