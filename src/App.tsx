import React, {useState} from 'react';
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';

import img1 from './title-images/food-576547.svg';
import img2 from './title-images/food-576600.svg';
import img3 from './title-images/food-576689.svg';
import img4 from './title-images/pancakes-575795.svg';

import './app.css';
import {IngredientList} from './ingredient-list';

import {IngredientProps} from './ingredient';

function App() {
	const [ingredients, setIngredients] = useState<IngredientProps[]>([]);
	return (
		<Router>
			<div className="App">
				<header>
					<h1>No More Repeat Meals!</h1>
				</header>
				<Switch>
					<Route path="/get-started">
						<IngredientList ingredients={ingredients} onChange={ingredients => {
							setIngredients(ingredients);
						}} />
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
