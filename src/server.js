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
		path: '/v1/engines/davinci-instruct-beta/completions',
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
			const title = RegExp('(?<=TITLE:\\s+).+$', 'm');
			const ingredients = RegExp('(?<=INGREDIENTS:\\s+)(\\s*\\d\\. .+)+', 'm');
			const instructions = RegExp('(?<=INSTRUCTIONS:\\s+)(\\s*\\d\\. .+)+', 'm');
			const listItem = RegExp('(?<=\\d\\. ).+', 'g');
			pres.on('data', (d) => {
				const presBody = d.toString();
				console.log(presBody);
				const presBodyJson = JSON.parse(presBody);
				cres.send(JSON.stringify(
					{
						title: (title.exec(presBodyJson.choices[0].text) || ['Mysterious Mystery Special'])[0],
						ingredients: ((ingredients.exec(presBodyJson.choices[0].text) || ["1. Ingredients not found... please retry."])[0]).match(listItem),
						instructions: ((instructions.exec(presBodyJson.choices[0].text) || ["1. Instructions not found... please retry."])[0]).match(listItem)
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
	const ingredientsArrayToPrompt = (ingredients) => ingredients.map((ingredient, index) => `${index === ingredients.length-1 && ingredients.length>1 ? "and " : ""}${ingredient}`).join(', ');
	const prompt = `Create a recipe that serves 4 people that uses up 6 oz leftover goulash, 1 medium leftover pork chop, 6 oz leftover enchilada, and 1 cup leftover pinto beans, that optionally includes water, garlic, and red pepper, and that can include other ingredients.

--BEGIN RECIPE--
TITLE:
Leftover goulash enchilada casserole

INGREDIENTS:
1. 6 oz leftover goulash
2. 1 medium leftover pork chop
3. 6 oz leftover enchilada
4. 1/2 small onion chopped
5. 1/2 small red bell pepper chopped
6. 2 whole cloves garlic chopped
7. 1/2 tsp red pepper flakes
8. 1/2 tsp cumin
9. 1/2 package corn chips
10. 1 cup leftover pinto beans
11. 1/2 cup salsa
12. 8 oz shredded cheddar cheese
13. 1/4 whole head lettuce
14. 1 whole tomato chopped
15. 1 whole avocado chopped
16. 1/2 cup sour cream

INSTRUCTIONS:
1. Pulse leftover goulash, pork chop, and leftover enchilada in a food processor until chunky.
2. Add chopped onion, chopped garlic, chopped red pepper, red pepper flakes, cumin and combine in mixture.
3. In a 9 x 13 inch pan, lightly coat in non stick spray and layer corn chips on the bottom.
4. Add a layer of leftover pinto beans, followed by the combined mixture, and cover with salsa.
5. Bake covered for 45 minuets until heated through.
6. Cover with corn chips and shredded cheddar cheese.  Bake uncovered for 10 minuets.
7. Top with lettuce, tomato, avocado, and sour cream to taste and serve.

"""
Create a recipe that serves 2 people that uses up ${ingredientsArrayToPrompt(ingredients.map(({food, amount, measurement}) => `${amount} ${measurement} ${food}`))}, that optionally includes ${ingredientsArrayToPrompt(additionalIngredients)}, and ${limitToProvided ? 'that can only use these ingredients.' : 'that can use other ingredients.'}`;
	console.log('writing request to openAI api.', prompt);
	preq.write(JSON.stringify({
		prompt,
		temperature: 0.5,
		max_tokens: 500,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
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
