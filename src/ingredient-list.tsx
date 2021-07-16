import React, {useCallback} from 'react';
import {map, reject} from 'lodash';

import Grid from '@material-ui/core/Grid';
import {Fab, FormControl} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import {Ingredient, IngredientProps} from './ingredient';

interface Props{
	ingredients: IngredientProps[];
	onChange: (ingredients: IngredientProps[]) => void;
}

export const IngredientList = ({ingredients, onChange}: Props) => {
	const handleChange = useCallback(
		(ingredient: IngredientProps, index: number) => {
			const newIngredients = [...ingredients];
			newIngredients[index] = ingredient;
			onChange(newIngredients);
		},
		[ingredients, onChange],
	);

	const handleDelete = useCallback(
		(index: number) => {
			onChange(
				reject(
					ingredients,
					(ingredient, n) => n === index,
				),
			);
		},
		[ingredients, onChange],
	);
	return <>
		{map(
			map(
				ingredients,
				(ingredient, index) => ({
					...ingredient,
					onChange: (ingredient: IngredientProps) => {
						handleChange(ingredient, index);
					},
				}),
			),
			(ingredient, index) => <React.Fragment key={index}>
				<Ingredient key={index} {...ingredient} />
				<Grid item xs={2} sm={1}>
					<FormControl>
						<Fab
							onClick={() => {
								handleDelete(index);
							}}
							size="small"
							color="secondary"
							aria-label="delete"
						>
							<DeleteIcon fontSize="small" />
						</Fab>
					</FormControl>
				</Grid>
			</React.Fragment>,
		)}
		<Ingredient key={ingredients.length} onChange={ingredient => {
			handleChange(ingredient, ingredients.length);
		}} />
	</>;
};
