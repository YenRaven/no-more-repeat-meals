const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const _ = require('lodash');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.DEV_PORT || 3001;
const localhost = process.env.LOCALHOST || 'localhost';

app.use(bodyParser.json({limit: '6mb', extended: true}));

app.use('/api/ingredient-autocomplete-test', (req, res) => {
	setTimeout(()=>{
		const testData = `{"id": "cmpl-3MAHN2JxjWQQyaZ0BOf1CyDeTu8tJ", "object": "text_completion", "created": 1626411741, "model": "babbage:2020-05-03", "choices": [{"text": "hamburger, ham steak, ham cubes, spiral cut ham, diced ham, baked ham, virginia ham, honey ham, ham lunchmeat", "index": 0, "logprobs": null, "finish_reason": "stop"}]}`
		
		const autocompleteOptions = RegExp('(?:[a-zA-Z]+ ?)+', 'g');

		const presBodyJson = JSON.parse(testData);
		res.send(JSON.stringify(
			{
				autocompleteOpts: presBodyJson.choices[0].text.match(autocompleteOptions)
			}
		))
	},500);
});

app.use('/api/request-recipe-test', (req, res) => {
	setTimeout(()=>{
		const testData = `{"id": "cmpl-3MAHN2JxjWQQyaZ0BOf1CyDeTu8tJ", "object": "text_completion", "created": 1626411741, "model": "davinci:2020-05-03", "choices": [{"text": "\\n--BEGIN RECIPE--\\nRECIPE INSTRUCTIONS:\\n1. In a large bowl, combine the hamburger, eggs, milk, salt, pepper, flour and mayonnaise. Mix well.\\n2. In a large skillet, brown the hamburger mixture over medium heat.\\n3. Add the noodles and water to the skillet and cook until the noodles are tender, about 10 minutes.\\nRECIPE INGREDIENTS:\\n1. 1 pound Hamburger\\n2. 2 Eggs\\n3. 1/4 cup Milk\\n4. 1 teaspoon Salt\\n5. 1/4 teaspoon Ground Black Pepper\\n6. 1/4 cup Flour\\n7. 1/4 cup Mayonnaise\\n8. 1 package Noodles\\n9. 1 cup Water\\nRECIPE TITLE: Hamburger Noodle Casserole", "index": 0, "logprobs": null, "finish_reason": "stop"}]}`;

		const title = RegExp('(?<=RECIPE TITLE: ).+$');
		const ingredients = RegExp('(?<=RECIPE INGREDIENTS:\\s+)(\\s*\\d\\. .+)+', 'm');
		const instructions = RegExp('(?<=RECIPE INSTRUCTIONS:\\s+)(\\s*\\d\\. .+)+', 'm');
		const listItem = RegExp('(?<=\\d\\. ).+', 'g');

		const presBodyJson = JSON.parse(testData);
		res.send(JSON.stringify(
			{
				title: title.exec(presBodyJson.choices[0].text)[0],
				ingredients: (ingredients.exec(presBodyJson.choices[0].text)[0]).match(listItem),
				instructions: (instructions.exec(presBodyJson.choices[0].text)[0]).match(listItem)
			}
		));
	}, 3000)
})

app.use('/api/ingredient-autocomplete', (creq, cres) => {
	console.log('Attempting to connect to openAI api!');
	const proxy = 'api.openai.com';
	const options = {
		// Host to forward to
		host: proxy,
		// Port to forward to
		protocol: 'https:',
		port: 443,
		// Path to forward to
		path: '/v1/engines/babbage/completions',
		// Request method
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + process.env.API_KEY,
		},
	};
	const preq = https
		.request(options, pres => {
			const autocompleteOptions = RegExp('(?:[a-zA-Z]+ ?)+', 'g');
			pres.on('data', (d) => {
				const presBody = d.toString();
				console.log(presBody);
				const presBodyJson = JSON.parse(presBody);
				cres.send(JSON.stringify(
					{
						autocompleteOpts: presBodyJson.choices[0].text.match(autocompleteOptions)
					}
				));
			});
		})
		.on('error', e => {
			// We got an error, return 500 error to client and log error
			console.log(e.message);
			if (!cres.headersSent) {
				cres.writeHead(500);
			}

			cres.end();
		});
	console.log('Getting data from request body...', creq.body);
	const {input} = creq.body;
	const prompt = `Input: ham
Autocomplete ingredient options: hamburger, ham steak, ham cubes, spiral cut ham, diced ham, baked ham, virginia ham, honey ham, ham lunchmeat
Input: beef
Autocomplete ingredient options: beef fillet, beef steak, beef cubes, beef lunchmeat
Input: car
Autocomplete ingredient options: carrots, cranberries, craisins, crab
Input: grou
Autocomplete ingredient options: ground beef, ground chuck
Input: bro
Autocomplete ingredient options: broth, broccoli, brussels sprouts, bruschetta, brie
Input: ${input.toLowerCase()}
Autocomplete ingredient options:`;
	console.log('writing request to openAI api.', prompt);
	preq.write(JSON.stringify({
		prompt,
		"temperature": 0,
		"max_tokens": 20,
		"top_p": 0.7,
		"frequency_penalty": 0.3,
		"presence_penalty": 0.05,
		"stop": ["\n"]
	}));
	creq.pipe(preq, {end: true});
});

app.use('/api/request-recipe', (creq, cres) => {
	console.log('Attempting to connect to openAI api!');
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
			'Authorization': 'Bearer ' + process.env.API_KEY,
		},
	};
	const preq = https
		.request(options, pres => {
			// Set encoding
			const title = RegExp('(?<=RECIPE TITLE: ).+$');
			const ingredients = RegExp('(?<=RECIPE INGREDIENTS:\\s+)(\\s*\\d\\. .+)+', 'm');
			const instructions = RegExp('(?<=RECIPE INSTRUCTIONS:\\s+)(\\s*\\d\\. .+)+', 'm');
			const listItem = RegExp('(?<=\\d\\. ).+', 'g');
			pres.on('data', (d) => {
				const presBody = d.toString();
				console.log(presBody);
				const presBodyJson = JSON.parse(presBody);
				cres.send(JSON.stringify(
					{
						title: title.exec(presBodyJson.choices[0].text)[0],
						ingredients: (ingredients.exec(presBodyJson.choices[0].text)[0]).match(listItem),
						instructions: (instructions.exec(presBodyJson.choices[0].text)[0]).match(listItem)
					}
				));
			});
		})
		.on('error', e => {
			// We got an error, return 500 error to client and log error
			console.log(e.message);
			if (!cres.headersSent) {
				cres.writeHead(500);
			}

			cres.end();
		});
	console.log('Getting data from request body...', creq.body);
	const {ingredients, additionalIngredients, limitToProvided} = creq.body;
	const prompt = `I will find or invent recipes that must use all of the ingredients in the "I MUST USE ALL OF THESE INGREDIENTS:" list and optionally use a few additional ingredients that compliment the ingredients I must use from the "I ALSO HAVE THESE INGREDIENTS I COULD USE:" list with the goal of creating a recipe that serves "SERVES:" people. If I specify that I must "LIMIT RECIPES TO ONLY USE THE INGREDIENTS I HAVE", I will limit the recipe to only use the ingredients I have provided otherwise if I specify that I can "USE OTHER INGREDIENTS IN RECIPE", I can include other ingredients that were not provided. I will output a series of instruction steps for my created recipe in "RECIPE INSTRUCTIONS:" lists. I will build a "RECIPE INGREDIENTS:" list from only the ingredients used in the instruction steps. I will output a creative title for the recipe in the "RECIPE TITLE:" value.
"""
I MUST USE ALL OF THESE INGREDIENTS: 2 lb potatoes, 1 stalk celery, 1 whole carrot
I ALSO HAVE THESE INGREDIENTS I COULD USE: ground chuck, onion, water
USE OTHER INGREDIENTS IN RECIPE
SERVES: 8
--BEGIN RECIPE--
RECIPE INSTRUCTIONS:
1. Bring a large pot of salted water to a boil. Add potatoes and cook until tender but still firm, about 15 minutes. Drain, cool and chop.
2. In a large bowl, combine the potatoes, mayonnaise, minced pickle, sugar, onion, mustard, vinegar, celery, pimentos, carrot, parsley, pepper and salt. Mix well, chill and serve.
RECIPE INGREDIENTS:
1. 2 pounds of potatoes
2. 1 cup mayonnaise
3. 4 teaspoons diced pickle
4. 4 teaspoons white sugar
5. 2 teaspoons chopped white onion
6. 2 teaspoons prepared mustard
7. 1 teaspoon white wine vinegar
8. 1 stalk minced celery
9. 1 teaspoon minced pimento
10. 1 shredded carrot
11. 1/4 teaspoon dried parsley
12. 1/4 teaspoon ground black pepper
13. salt to taste
RECIPE TITLE: Potato Salad
"""
I MUST USE ALL OF THESE INGREDIENTS: 4 cups mashed potatoes, 1/2 package carrots
I ALSO HAVE THESE INGREDIENTS I COULD USE: milk, eggs, flour, beef chuck, mustard, catsup, salt, ground black pepper, vodka, beef broth, white onion, garlic cloves, fresh rosemary, chicken, hamburger, water
LIMIT RECIPE TO ONLY USE INGREDIENTS I HAVE
SERVES: 4
--BEGIN RECIPE--
RECIPE INSTRUCTIONS:
1. Season beef chuck with salt and black pepper; sear in a large, deep skillet or Dutch oven over medium heat until browned, about 10 minutes per side.
2. Pour beef broth into the skillet with roast. Arrange onion wedges and garlic cloves around the meat. Spread carrots atop roast and place sprig of rosemary atop carrots. Turn heat to medium-low and simmer until tender, about 6 hours.
3. Move the mashed potatoes to a covered dish and heat them in the microwave at half-power for five minutes, stirring occasionally.
4. Remove 1 or 2 cloves of garlic from skillet and mash cloves on top of the roast; serve with mashed potatoes.
RECIPE INGREDIENTS:
1. 3 pounds beef chuck
2. salt to taste
3. ground black pepper to taste
4. 3 cups beef broth
5. 1/2 white onion cut into wedges
6. 2 1/2 garlic cloves
7. 1/2 package carrots, peeled and chopped
8. 1/2 sprig fresh rosemary
9. 4 cups mashed potatoes
RECIPE TITLE: Pot Roast with Mashed Potatoes
"""
I MUST USE ALL OF THESE INGREDIENTS: ${ingredients.map(({food, amount, unit}) => `${amount} ${unit} ${food}`).join(', ')}
I ALSO HAVE THESE INGREDIENTS I COULD USE: ${additionalIngredients.join(', ')}, Water
${limitToProvided ? 'LIMIT RECIPE TO ONLY USE INGREDIENTS I HAVE' : 'USE OTHER INGREDIENTS IN RECIPE'}
SERVES: 2`;
	console.log('writing request to openAI api.');
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

// const privateKey = fs.readFileSync(path.join(__dirname, 'server.key'), 'utf8');
// const certificate = fs.readFileSync(path.join(__dirname, 'server.cert'), 'utf8');

// const credentials = {key: privateKey, cert: certificate};

//const httpsServer = https.createServer(credentials, app);
const httpsServer = http.createServer(app);

httpsServer.listen(port, error => {
	if (error) {
		console.error(error);
	} else {
		console.info('==> ??  Listening on port %s. Open up https://%s:%s/ in your browser.', port, localhost, port);
	}
});
