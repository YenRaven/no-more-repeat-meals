import React, {useCallback, useEffect, useRef} from 'react';
import {TextField, Select, MenuItem} from '@material-ui/core';

import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

export interface IngredientProps {
	food?: string;
	amount?: string;
	measurement?: string;
}

type Props = IngredientProps & {
	onChange: (ingredientProps: IngredientProps) => void;
};

export const Ingredient = ({food, amount, measurement, onChange}: Props) => {
	const handleFoodChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		onChange({food: event.target.value, amount, measurement});
	}, [amount, measurement, onChange]);
	const handleAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		if (/^\d*\s?\d*\/?\.?\d*$/.test(event.target.value)) {
			onChange({food, amount: event.target.value, measurement});
		}
	}, [food, measurement, onChange]);
	const handleMeasurementChange = useCallback((event: React.ChangeEvent<{
		name?: string | undefined;
		value: unknown;
	}>) => {
		onChange({food, amount, measurement: String(event.target.value)});
	}, [food, amount, onChange]);

	const foodInput = useRef<HTMLInputElement>(null);
	const amountInput = useRef<HTMLInputElement>(null);

	const previousProps = useRef<IngredientProps>({});

	useEffect(() => {
		if (food !== previousProps.current?.food) {
			foodInput.current?.focus();
			previousProps.current.food = food;
		}
	}, [food, foodInput]);

	useEffect(() => {
		if (amount !== previousProps.current.amount) {
			amountInput.current?.focus();
			previousProps.current.amount = amount;
		}
	}, [amount, amountInput]);

	return <>
		<Grid item xs={6}>
			<FormControl className="food-control">
				<TextField inputRef={foodInput} id="food" label="Ingredient" value={food} onChange={handleFoodChange} autoFocus />
			</FormControl>
		</Grid>
		<Grid item xs={2}>
			<FormControl className="amount-control">
				<TextField inputRef={amountInput} id="amount" label="Quantity" value={amount} onChange={handleAmountChange} />
			</FormControl>
		</Grid>
		<Grid item xs={3}>
			<FormControl className="measurement-control">
				<InputLabel id="measurement-label">Unit</InputLabel>
				<Select id="measurement" labelId="measurement-label" value={measurement} onChange={handleMeasurementChange}>
					<MenuItem value="whole">whole</MenuItem>
					<MenuItem value="oz">oz</MenuItem>
					<MenuItem value="fl oz">fl oz</MenuItem>
					<MenuItem value="lb">lb</MenuItem>
					<MenuItem value="g">g</MenuItem>
					<MenuItem value="mg">mg</MenuItem>
					<MenuItem value="kg">kg</MenuItem>
					<MenuItem value="tsp">teaspoons</MenuItem>
					<MenuItem value="tbsp">tablespoons</MenuItem>
					<MenuItem value="cup">cups</MenuItem>
					<MenuItem value="pint">pints</MenuItem>
					<MenuItem value="quart">quarts</MenuItem>
					<MenuItem value="gallon">gallons</MenuItem>
					<MenuItem value="ml">ml</MenuItem>
					<MenuItem value="L">liter</MenuItem>
					<MenuItem value="dL">deciliter</MenuItem>
					<MenuItem value="mm">mm</MenuItem>
					<MenuItem value="cm">cm</MenuItem>
					<MenuItem value="m">m</MenuItem>
					<MenuItem value="in">inch</MenuItem>
					<MenuItem value="package">package</MenuItem>
					<MenuItem value="stalk">stalk</MenuItem>
				</Select>
			</FormControl>
		</Grid>
	</>;
};
