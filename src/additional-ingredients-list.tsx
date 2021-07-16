import React, {useCallback, useRef} from 'react';
import {map, reject, uniq} from 'lodash';

import Grid from '@material-ui/core/Grid';
import {Fab, FormControl, TextField, Chip} from '@material-ui/core';
import {Add} from '@material-ui/icons';

interface Props {
	ingredients: string[];
	onChange: (ingredients: string[]) => void;
}

export const AdditionalIngredientList = ({ingredients, onChange}: Props) => {
	const addInputRef = useRef<HTMLInputElement>(null);
	const handleDelete = useCallback(
		index => {
			onChange(
				reject(ingredients, (ingredient, n) => n === index),
			);
		},
		[ingredients, onChange],
	);
	const handleAdd = useCallback(
		() => {
			const newChip = addInputRef.current ? addInputRef.current?.value : '';
			if (newChip !== '') {
				if (addInputRef.current) {
					addInputRef.current.value = '';
				}

				onChange(
					uniq([...ingredients, newChip.toLowerCase()]),
				);
			}
		},
		[ingredients, onChange],
	);
	return <>
		<Grid item xs={12}>
			{map(ingredients, (ingredient, index) => <Chip key={ingredient} className="additional-ingredient" label={ingredient} onDelete={() => {
				handleDelete(index);
			}} />)}
		</Grid>
		<Grid item xs={6}>
			<FormControl className="additional-ingredient-input">
				<TextField inputRef={addInputRef} id="additional-ingredient" label="Ingredient" />
			</FormControl>
		</Grid>
		<Grid item xs={6}>
			<Fab
				onClick={() => {
					handleAdd();
				}}
				size="small"
				color="secondary"
				aria-label="add"
				variant="extended"
			>
				<Add fontSize="small" /> Add
			</Fab>
		</Grid>
	</>;
};
