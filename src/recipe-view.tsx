import React, {useCallback, useEffect, useRef, useState} from 'react';
import {map, reject, uniq} from 'lodash';

import Grid from '@material-ui/core/Grid';
import {Backdrop, CircularProgress, Fab, makeStyles} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import {Link} from 'react-router-dom';
import {IngredientProps} from './ingredient';

interface Props {
	ingredients: IngredientProps[];
	additionalIngredients: string[];
	limitToProvided: boolean;
}

interface RecipeData {
	title: string;
	ingredients: string[];
	instructions: string[];
}

export const RecipeView = ({ingredients, additionalIngredients, limitToProvided}: Props) => {
	const [loading, setLoading] = useState(true);
	const [recipeData, setRecipeData] = useState<RecipeData>({
		title: '',
		ingredients: [],
		instructions: [],
	});
	const getRecipe = useCallback(() => {
		setLoading(true);
		fetch('/api/request-recipe-test', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(
				{
					ingredients,
					additionalIngredients,
					limitToProvided,
				},
			),
		})
			.then(async response => response.json())
			.then(response => {
				setRecipeData(response);
				setLoading(false);
			})
			.catch(error => {
				console.error(error);
			});
	}, [ingredients, additionalIngredients, limitToProvided]);
	useEffect(() => {
		getRecipe();
	}, [getRecipe]);

	const useStyles = makeStyles(theme => ({
		backdrop: {
			zIndex: theme.zIndex.drawer + 1,
			color: '#fff',
		},
	}));
	const classes = useStyles();

	return <>
		<Backdrop className={classes.backdrop} open={loading}>
			<CircularProgress color="secondary" />
		</Backdrop>
		<Grid item xs={12}>
			<h2>{recipeData.title}</h2>
		</Grid>
		<Grid className="recipe-row ingredients" item xs={12}>
			<h3>Ingredients</h3>
			<ul>
				{recipeData.ingredients.map(ingredient => <li>{ingredient}</li>)}
			</ul>
		</Grid>
		<Grid className="recipe-row instructions" item xs={12}>
			<h3>Instructions</h3>
			<ol>
				{recipeData.instructions.map(instruction => <li>{instruction}</li>)}
			</ol>
		</Grid>
		<Grid className="recipe-btn" item xs={6}>
			<Link className="App-link" to="/get-started">
				<Fab variant="extended"><NavigateBeforeIcon fontSize="small"/> Back</Fab>
			</Link>
		</Grid>
		<Grid className="recipe-btn" item xs={6}><Fab onClick={() => {
			getRecipe();
		}} variant="extended"><RefreshIcon fontSize="small" /> Retry</Fab></Grid>
	</>;
};
