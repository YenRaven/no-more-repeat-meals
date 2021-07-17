import {Grid} from '@material-ui/core';
import React from 'react';
import {Link} from 'react-router-dom';

export const Faq = () => <Grid className="ingredient-list" container spacing={3}>
	<Grid item xs={12}><h2>Frequently Asked Questions</h2></Grid>
	<Grid item xs={12}>
		<h3>What is this for?</h3>
		<p>This site is meant to help us get creative with our leftovers and soon to spoil foods so we can avoid the repeat leftover meals and reduce our carbon footprint.</p>
	</Grid>
	<Grid item xs={12}>
		<h3>Why is this important?</h3>
		<p>Globally, wasted food accounts for about 8 percent of all greenhouse gas emissions. The environmental consequences of producing food that no one eats are massive. When we are forced to throw away food we are not only causing greenhouse gasses to be released by the decomposing food in a landfill but also wasting all the energy and fuel used to produce and transport that food to our tables.</p>
	</Grid>
	<Grid item xs={12}>
		<h3>How does it work?</h3>
		<p>We use advanced artificial intelligence to act as your own personal cheff! We provide your ingredients to the AI and ask it to invent a recipe for you every time. This means you don't have to worry about the symantics of what you provide to our app to get back a recipe, just fill out our easy to follow forms with what you must use and what you have available to use and the AI will do the rest giving you a unique new recipe to try out!</p>
	</Grid>
	<Grid item xs={12}>
		<h3>Do I have to create an account?</h3>
		<p>No! We take privacy seriously and do not require you to provide any personal information to use our service.</p>
	</Grid>
	<Grid item xs={12}>
		<h3>Is it free?</h3>
		<p>We ask that you <Link to="/donate">consider donating</Link> if you like the service. We hope to provide this service for free so as many people as possible can start reducing thier food waste, but the site is not free to run. We rely on generous contributions from our users to keep the site up and running and free to everyone. Thank you so much!</p>
	</Grid>
</Grid>;
