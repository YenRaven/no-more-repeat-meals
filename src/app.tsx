import React, {useState} from 'react';
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';
import {FormControlLabel, Checkbox, Grid, Fab} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import img1 from './assets/title-images/food-576547.svg';
import img2 from './assets/title-images/food-576600.svg';
import img3 from './assets/title-images/food-576689.svg';
import img4 from './assets/title-images/pancakes-575795.svg';

import {IngredientList} from './ingredient-list';
import {IngredientProps} from './ingredient';
import {AdditionalIngredientList} from './additional-ingredients-list';

import './app.css';
import {RecipeView} from './recipe-view';
import {Faq} from './faq';
import {Donate} from './donate';
function App() {
	const [ingredients, setIngredients] = useState<IngredientProps[]>([]);
	const [additionalIngredients, setAdditionalIngredients] = useState<string[]>([]);
	const [limitToProvided, setLimitToProvided] = useState(false);
	return (
		<Router>
			<div className="App">
				<header>
					<h1><i>No More</i> Repeat Meals!</h1>
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
									label="Try to use only my provided ingredients."
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
								<Link className="App-link" to="/recipe">
									<Fab variant="extended">
										Go!
										<NavigateNextIcon />
									</Fab>
								</Link>
							</Grid>
						</Grid>
					</Route>
					<Route path="/recipe">
						<Grid className="ingredient-list" container spacing={3}>
							<RecipeView
								ingredients={ingredients}
								additionalIngredients={additionalIngredients}
								limitToProvided={limitToProvided}
							/>
						</Grid>
					</Route>
					<Route path="/faq" component={Faq} />
					<Route path="/donate" component={Donate} />
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
							<p className="tagline">
								Reduce your carbon footprint and use up your leftovers with brand new recipes!
							</p>
							<Link className="App-link" to="/get-started">
								<Fab variant="extended">
									Get started!
									<NavigateNextIcon />
								</Fab>
							</Link>
						</header>
					</Route>
				</Switch>
				<div className="footer"><Link to="/get-started">Get Started</Link> - <Link to="/faq">FAQ</Link> - <Link to="/donate">Donate</Link></div>
				<div className="disclaimer">Your access and use of this services is at your own risk. By continuing to use this site, you agree that services are provided to you on an "AS IS" and "AS AVAILABLE" basis. The site owner provides no warranty and disclaims all responsibility and liability for any damages that may result from access or use of the services provided or any content. Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions.</div>
			</div>
		</Router>
	);
}

export default App;
