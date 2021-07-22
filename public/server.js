const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const _ = require('lodash');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.DEV_PORT || 3000;
const localhost = process.env.LOCALHOST || 'localhost';

const openAIContentFilter = (textToClasify) => {
	return new Promise((resolve, reject) => {
		console.log('Attempting to connect to openAI api!');
		const proxy = 'api.openai.com';
		const options = {
			// Host to forward to
			host: proxy,
			// Port to forward to
			protocol: 'https:',
			port: 443,
			// Path to forward to
			path: '/v1/engines/content-filter-alpha-c4/completions',
			// Request method
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + process.env.API_KEY,
			},
		};
		const preq = https
			.request(options, pres => {
				pres.on('data', (d) => {
					const presBody = d.toString();
					console.log(presBody);
					const presBodyJson = JSON.parse(presBody);
					let outputLabel = presBodyJson["choices"][0]["text"];
					const toxicThreshold = -0.355;
					let logprobs;
					switch(outputLabel){
						case "2":
							// If the model returns "2", return its confidence in 2 or other output-labels
							logprobs = presBodyJson["choices"][0]["logprobs"]["top_logprobs"][0]
						
							// If the model is not sufficiently confident in "2",
							// choose the most probable of "0" or "1"
							// Guaranteed to have a confidence for 2 since this was the selected token.
							if (logprobs["2"] < toxicThreshold){
								const logprob0 = logprobs["0"];
								const logprob1 = logprobs["1"];
						
								// If both "0" and "1" have probabilities, set the output label
								// to whichever is most probable
								if(logprob0 && logprob1){
									if(logprob0 >= logprob1){
										outputLabel = "0"
									}else{
										outputLabel = "1"
									}
								}else if(logprob0){
									outputLabel = "0";
								}else if(logprob1){
									outputLabel = "1"
								}
							}
							resolve(outputLabel);
						break;
						case "0":
						case "1":
							resolve(outputLabel);
						break;
						default:
							resolve("2");
						break;
					}
				});
			})
			.on('error', e => {
				reject(e);
			});
		console.log('Getting data from request body...', textToClasify);
		const prompt = `<|endoftext|>${textToClasify}
--
Label:`;
		console.log('writing request to openAI api.', prompt);
		preq.write(JSON.stringify({
			prompt,
			temperature: 0,
			max_tokens: 1,
			top_p: 0,
			logprobs: 10,
			stop: ['\n"""'],
		}));
		preq.end();
	})
}

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
				openAIContentFilter(presBodyJson.choices[0].text).then((res) => {
					if(res !== "2"){
						cres.send(JSON.stringify(
							{
								autocompleteOpts: _.uniq(presBodyJson.choices[0].text.match(autocompleteOptions))
							}
						));
					}else{
						cres.send(JSON.stringify(
							{
								autocompleteOpts: []
							}
						));
					}
				})
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
	if(input.length<=200){
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
	}else{
		console.log('Request rejected due to length.')
	}
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
				openAIContentFilter(presBodyJson.choices[0].text).then((res) => {
					if(res !== "2"){
						cres.send(JSON.stringify(
							{
								title: (title.exec(presBodyJson.choices[0].text) || ['Mysterious Mystery Special'])[0],
								ingredients: ((ingredients.exec(presBodyJson.choices[0].text) || ["1. Ingredients not found... please retry."])[0]).match(listItem),
								instructions: ((instructions.exec(presBodyJson.choices[0].text) || ["1. Instructions not found... please retry."])[0]).match(listItem)
							}
						));
					}else{
						cres.send(JSON.stringify({
							title: "Oops!",
							ingredients: [],
							instructions: ["Something went wrong with this request! Please go back and make sure all you ingredients are correct."]	
						}));
					}
				});
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
	const ingredientsArrayToPrompt = (ingredients) => ingredients.map((ingredient, index) => `${index === ingredients.length-1 && ingredients.length>1 ? "and " : ""}${ingredient.toLowerCase()}`).join(', ');
	const prompt = `Create a recipe that serves 4 people that uses up 6 large eggs, and 8 oz leftover spaghetti, that optionally includes water, cherry tomatoes, and red pepper, and that can include other ingredients.
--BEGIN RECIPE--
TITLE:
Pasta Frittata

INGREDIENTS:
1. 6 large eggs
2. 1/4 cup half-and-half
3. 1/4 tsp salt
4. 2 tbsp olive oil
5. 8 oz leftover spaghetti
1/2 cup halved cherry tomatoes
1/2 cup shredded mozzarella and Parmesan cheese

INSTRUCTIONS:
1. Heat the oven to 375°F. Whisk together the eggs, half-and-half, and salt and set aside.
2. Warm the olive oil in a 10-inch oven-safe skillet over medium-high heat. When the oil is hot, add the pasta and quickly reheat, tossing to keep the pasta from browning and coating the noodles with the oil.
3. Pour the egg mixture into the pan and shake the pan to settle the egg around the pasta. Continue to cook — placing the tomatoes on top and sprinkling with the cheese — until the egg is beginning to set around the edge of the pan, about 5 minutes.
4. Transfer the frittata to the oven and bake until the egg is set and the cheese is melted, 18 to 20 minutes.
"""
Create a recipe that serves 2 people that uses up ${ingredientsArrayToPrompt(ingredients.map(({food, amount, measurement}) => `${amount} ${measurement} ${food}`))}, that optionally includes ${ingredientsArrayToPrompt(['water', ...additionalIngredients])}, and ${limitToProvided ? 'that can only use these ingredients.' : 'that can use other ingredients.'}
--BEGIN RECIPE--`;
	if(prompt.length <= 4000){
		console.log('writing request to openAI api.', prompt);
		preq.write(JSON.stringify({
			prompt,
			temperature: 0.5,
			max_tokens: 200,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
			stop: ['\n"""'],
		}));
		creq.pipe(preq, {end: true});
	}else{
		console.log('rejected prompt too long.');
	}
});

app.use(express.static('build', {index: false}));

app.use('/', (req, res) => {
	res.sendFile(path.join(__dirname,'./index.html'));
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
		console.info('==> ??  Listening on port %s. Open up http://%s:%s/ in your browser.', port, localhost, port);
	}
});
