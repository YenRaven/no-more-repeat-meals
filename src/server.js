const fs = require('fs');
const path = require('path');
const https = require('https');

const _ = require('lodash');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.DEV_PORT || 3001;
const localhost = process.env.LOCALHOST || 'localhost';

app.post('/api/request-recipe', (creq, cres) => {
	const proxy = 'api.openai.com';
	const options = {
		// Host to forward to
		host: proxy,
		// Port to forward to
		protocol: 'https:',
		port: 443,
		// Path to forward to
		path: '/v1/engines/davinci/completions',
		// Request method
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + process.env.API_KEY,
		},
	};

	const preq = https
		.request(options, pres => {
			// Set encoding
			cres.writeHead(pres.statusCode, pres.headers);
			pres.pipe(cres, {end: true});
		})
		.on('error', e => {
			// We got an error, return 500 error to client and log error
			console.log(e.message);
			if (!cres.headersSent) {
				cres.writeHead(500);
			}

			cres.end();
		});

	const {ingredients, additionalIngredients, limitToProvided} = JSON.stringify(creq.body);
	const prompt = `I will find or invent recipes that must use all of the ingredients in the "I MUST USE ALL OF THESE INGREDIENTS:" list and optionally use a few additional ingredients that compliment each other from the "I ALSO HAVE THESE INGREDIENTS I COULD USE:" list with the goal of creating a recipe with "SERVES:" servings. If a "LIMIT RECIPES TO ONLY USE THE INGREDIENTS I HAVE" instruction is provided I will limit the recipe to only use the provided ingredients otherwise if the "DO NOT LIMIT RECIPE TO USE ONLY THESE INGREDIENTS" instruction is present, I can include other ingredients that were not provided. I will output a series of instruction steps for my created recipe in "RECIPE INSTRUCTIONS:" lists. I will build a "RECIPE INGREDIENTS:" list from only the ingredients used in "RECIPE INSTRUCTIONS:" steps. I will output a creative title for the "RECIPE INSTRUCTIONS:" in the "RECIPE TITLE:" value.
	"""
	I MUST USE ALL OF THESE INGREDIENTS: Potatoes - 2 pounds, Celery - 1 stalk, Carrot - 1 whole
	I ALSO HAVE THESE INGREDIENTS I COULD USE: Milk, Eggs, Ground Chuck, Onion, Bacon, White Bread, Pimento, Parsley, Flour, Sugar, Pickles, Water
	DO NOT LIMIT RECIPE TO USE ONLY THESE INGREDIENTS
	SERVES: 8
	--BEGIN RECIPE--
	RECIPE INSTRUCTIONS:
	1. Bring a large pot of salted water to a boil. Add potatoes and cook until tender but still firm, about 15 minutes. Drain, cool and chop.
	2. In a large bowl, combine the potatoes, mayonnaise, minced pickle, sugar, onion, mustard, vinegar, celery, pimentos, carrot, parsley, pepper and salt. Mix well, chill and serve.
	RECIPE INGREDIENTS:
	1. 2 pounds of Potatoes
	2. 1 cup Mayonnaise
	3. 4 teaspoons diced Pickle
	4. 4 teaspoons White Sugar
	5. 2 teaspoons chopped White Onion
	6. 2 teaspoons Prepared Mustard
	7. 1 teaspoon White Wine Vinegar
	8. 1 stalk minced Celery
	9. 1 teaspoon minced Pimento
	10. 1 shredded Carrot
	11. 1/4 teaspoon dried Parsley
	12. 1/4 teaspoon ground Black Pepper
	13. Salt to taste
	RECIPE TITLE: Potato Salad
	"""
	I MUST USE ALL OF THESE INGREDIENTS: Mashed Potatoes - 4 cups, Carrots - 1/2 package
	I ALSO HAVE THESE INGREDIENTS I COULD USE: Milk, Eggs, Flour, Beef Chuck, Mustard, Catsup, Salt, Ground Black Pepper, Vodka, Beef Broth, White Onion, Garlic Cloves, Fresh Rosemary, Chicken, Hamburger, Water
	LIMIT RECIPE TO ONLY USE INGREDIENTS I HAVE
	SERVES: 4
	--BEGIN RECIPE--
	RECIPE INSTRUCTIONS:
	1. Season beef chuck with salt and black pepper; sear in a large, deep skillet or Dutch oven over medium heat until browned, about 10 minutes per side.
	2. Pour beef broth into the skillet with roast. Arrange onion wedges and garlic cloves around the meat. Spread carrots atop roast and place sprig of rosemary atop carrots. Turn heat to medium-low and simmer until tender, about 6 hours.
	3. Move the mashed potatoes to a covered dish and heat them in the microwave at half-power for five minutes, stirring occasionally.
	4. Remove 1 or 2 cloves of garlic from skillet and mash cloves on top of the roast; serve with mashed potatoes.
	RECIPE INGREDIENTS:
	1. 3 pounds Beef Chuck
	2. Salt to taste
	3. Ground Black Pepper to taste
	4. 3 cups Beef Broth
	5. 1/2 White Onion cut into wedges
	6. 2 1/2 Garlic Cloves
	7. 1/2 package Carrots, peeled and chopped
	8. 1/2 sprig Fresh Rosemary
	9. 4 cups Mashed Potatoes
	RECIPE TITLE: Pot Roast with Mashed Potatoes
	"""
	I MUST USE ALL OF THESE INGREDIENTS: ${ingredients.map(({food, amount, unit}) => `${food} - ${amount} ${unit}`).join(', ')}
	I ALSO HAVE THESE INGREDIENTS I COULD USE: ${additionalIngredients.join(', ')}, Water
	${limitToProvided ? 'LIMIT RECIPE TO ONLY USE INGREDIENTS I HAVE' : 'DO NOT LIMIT RECIPE TO USE ONLY THESE INGREDIENTS'}
	SERVES: 2`;

	preq.write(JSON.stringify({
		prompt,
		temperature: 0.7,
		max_tokens: 500,
		top_p: 0.3,
		frequency_penalty: 0.05,
		presence_penalty: 0.05,
		stop: ['\n"""'],
	}));
	creq.pipe(preq, {end: true});
});

const privateKey = fs.readFileSync(path.join(__dirname, 'server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'server.cert'), 'utf8');

const credentials = {key: privateKey, cert: certificate};

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, error => {
	if (error) {
		console.error(error);
	} else {
		console.info('==> ??  Listening on port %s. Open up https://%s:%s/ in your browser.', port, localhost, port);
	}
});
