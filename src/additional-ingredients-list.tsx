import React, {useCallback, useRef, useState} from 'react';
import {map, reject, uniq} from 'lodash';

import Grid from '@material-ui/core/Grid';
import {Fab, FormControl, TextField, Chip} from '@material-ui/core';
import {Add} from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Props {
	ingredients: string[];
	onChange: (ingredients: string[]) => void;
}

export const AdditionalIngredientList = ({ingredients, onChange}: Props) => {
	const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
	const [autocompleteLimiter, setAutocompleteLimiter] = useState<number>();
	const [additionalIngredientValue, setAdditionalIngredientValue] = useState<string>('');
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
				setAdditionalIngredientValue('');

				onChange(
					uniq([...ingredients, newChip.toLowerCase()]),
				);
			}
		},
		[ingredients, onChange],
	);
	const handleAutoComplete = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const food = event.target.value;
			if (food.length <= 200) {
				setAdditionalIngredientValue(food);
				if (food.length >= 3) {
					if (autocompleteLimiter !== undefined) {
						clearTimeout(autocompleteLimiter);
					}

					setAutocompleteLimiter(
						window.setTimeout(() => {
							fetch('/api/ingredient-autocomplete', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(
									{
										input: food,
									},
								),
							})
								.then(async response => response.json())
								.then((response: {autocompleteOpts: string[]}) => {
									setAutocompleteOptions(response?.autocompleteOpts);
									setAutocompleteLimiter(undefined);
								})
								.catch(error => {
									console.error(error);
								});
						}, 1000),
					);
				}
			}
		},
		[autocompleteLimiter, setAutocompleteLimiter, setAutocompleteOptions, setAdditionalIngredientValue],
	);

	return <>
		<Grid item xs={12}>
			{map(ingredients, (ingredient, index) => <Chip key={ingredient} className="additional-ingredient" label={ingredient} onDelete={() => {
				handleDelete(index);
			}} />)}
		</Grid>
		<Grid item xs={6}>
			<FormControl className="additional-ingredient-input">
				<Autocomplete
					key={ingredients.length}
					filterOptions={options => options}
					freeSolo
					options={autocompleteOptions}
					renderInput={parameters => <TextField {...parameters} inputRef={addInputRef} id="additional-ingredient" label="Ingredient" value={additionalIngredientValue} onChange={handleAutoComplete} />}
				/>
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
