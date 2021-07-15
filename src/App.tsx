import React, {useState} from 'react';
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';
import {FormControlLabel, Checkbox, Grid, Fab} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import img1 from './title-images/food-576547.svg';
import img2 from './title-images/food-576600.svg';
import img3 from './title-images/food-576689.svg';
import img4 from './title-images/pancakes-575795.svg';

import {IngredientList} from './ingredient-list';
import {IngredientProps} from './ingredient';
import {AdditionalIngredientList} from './additional-ingredients-list';

import './app.css';
function App() {
	const [ingredients, setIngredients] = useState<IngredientProps[]>([]);
	const [additionalIngredients, setAdditionalIngredients] = useState<string[]>([]);
	const [limitToProvided, setLimitToProvided] = useState(false);
	return (
		<Router>
			<div className="App">
				<header>
					<h1>No More Repeat Meals!</h1>
				</header>
				<Switch>
					<Route path="/get-started">
						<Grid className="ingredient-list" container spacing={3}>
							<Grid item xs={12}>
								<h2>I need to use these...</h2>
							</Grid>
							<IngredientList ingredients={ingredients} onChange={ingredients => {
								setIngredients(ingredients);
							}} />
							<Grid item xs={12}>
								<h2>I also have these I could use...</h2>
							</Grid>
							<AdditionalIngredientList ingredients={additionalIngredients} onChange={ingredients => {
								setAdditionalIngredients(ingredients);
							}} />
							<Grid item xs={12}>
								<FormControlLabel
									label="Try and only use provided ingredients."
									control={
										<Checkbox
											checked={limitToProvided}
											onChange={event => {
												setLimitToProvided(event.target.checked);
											}}
											name="limitToProvided"
											color="primary"
										/>
									}
								/>
							</Grid>
							<Grid className="submit-button-wrapper" item xs={12}>
								<Fab variant="extended">
									Go!
									<NavigateNextIcon />
								</Fab>
							</Grid>
						</Grid>
					</Route>
					<Route path="/">
						<header className="App-header">
							<div className="title-images-wrapper">
								<div className="title-images">
									<div className="title-image"><img src={img1} className="App-logo" alt="food" /></div>
									<div className="title-image"><img src={img2} className="App-logo" alt="food" /></div>
									<div className="title-image"><img src={img3} className="App-logo" alt="food" /></div>
									<div className="title-image"><img src={img4} className="App-logo" alt="food" /></div>
									<div className="title-image"><img src={img1} className="App-logo" alt="food" /></div>
								</div>
							</div>
							<p>
								Reduce your carbon footprint and use up your leftovers with brand new recipes!
							</p>
							<Link className="App-link" to="/get-started">Get started!</Link>
						</header>
					</Route>
				</Switch>
			</div>
		</Router>
	);
}

export default App;
