import React, {useCallback} from 'react';
import {map} from 'lodash';

import Grid from '@material-ui/core/Grid';
import {Ingredient, IngredientProps} from './ingredient';

interface Props{
	ingredients: IngredientProps[];
	onChange: (ingredients: IngredientProps[]) => void;
}

export const IngredientList = ({ingredients, onChange}: Props) => {
	const handleChange = useCallback((ingredient: IngredientProps, index: number) => {
		const newIngredients = [...ingredients];
		newIngredients[index] = ingredient;
		onChange(newIngredients);
	}, [ingredients, onChange]);
	return <div className="ingredient-list">
		<Grid container spacing={3}>
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
				(ingredient, index) => <Ingredient key={index} {...ingredient} />,
			)}
			<Ingredient key={ingredients.length} onChange={ingredient => {
				handleChange(ingredient, ingredients.length);
			}} />
		</Grid>
	</div>;
};
