import React, {useCallback, useRef} from 'react';
import {map, reject, uniq} from 'lodash';

import Grid from '@material-ui/core/Grid';
import {Fab} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import {Link} from 'react-router-dom';

export const RecipeView = ({}) => <>
	<Grid item xs={12}>
		<h2>Pot Roast with Mashed Potatoes</h2>
	</Grid>
	<Grid className="recipe-row" item xs={12}>
		<h3>Ingredients</h3>
		<ul>
			<li>3 pounds Beef Chuck</li>
			<li>Salt to taste</li>
			<li>Ground Black Pepper to taste</li>
			<li>3 cups Beef Broth</li>
			<li>1/2 White Onion cut into wedges</li>
			<li>2 1/2 Garlic Cloves</li>
			<li>1/2 package Carrots, peeled and chopped</li>
			<li>1/2 sprig Fresh Rosemary</li>
			<li>4 cups Mashed Potatoes</li>
		</ul>
	</Grid>
	<Grid className="recipe-row" item xs={12}>
		<h3>Instructions</h3>
		<ol>
			<li>Season beef chuck with salt and black pepper; sear in a large, deep skillet or Dutch oven over medium heat until browned, about 10 minutes per side.</li>
			<li>Pour beef broth into the skillet with roast. Arrange onion wedges and garlic cloves around the meat. Spread carrots atop roast and place sprig of rosemary atop carrots. Turn heat to medium-low and simmer until tender, about 6 hours.</li>
			<li>Move the mashed potatoes to a covered dish and heat them in the microwave at half-power for five minutes, stirring occasionally.</li>
			<li>Remove 1 or 2 cloves of garlic from skillet and mash cloves on top of the roast; serve with mashed potatoes.</li>
		</ol>
	</Grid>
	<Grid className="recipe-btn" item xs={6}>
		<Link className="App-link" to="/get-started">
			<Fab variant="extended"><NavigateBeforeIcon fontSize="small"/> Back</Fab>
		</Link>
	</Grid>
	<Grid className="recipe-btn" item xs={6}><Fab variant="extended"><RefreshIcon fontSize="small" /> Retry</Fab></Grid>
</>;
