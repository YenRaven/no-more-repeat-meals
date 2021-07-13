import React from 'react';
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';
import logo from './logo.svg';
import './app.css';

function App() {
	return (
		<Router>
			<div className="App">
				<Switch>
					<Route path="/get-started">
						<p>Coming soon!</p>
					</Route>
					<Route path="/">
						<header className="App-header">
							<img src={logo} className="App-logo" alt="logo" />
							<p>
								Reduce your carbon footprint and use up your leftovers with brand new recipes!
							</p>
							<Link to="/get-started">Get started!</Link>
						</header>
					</Route>
				</Switch>
			</div>
		</Router>
	);
}

export default App;
