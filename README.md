# nuance-nodejs
A simple Nuance HTTP Client for NodeJS.

## Installation
Download the source or use NPM:
```
npm install nuance --save
```

##Usage
First, you need to create a new Nuance instance:
```javascript
var Nuance = require("nuance");
var nuance = new Nuance();
```

The next step is loading the file:
```javascript
nuance.loadFile(path, function(fileLoaded){
	if(fileLoaded){
		//continue
	}
	else{
		//Could not read the file, do something here
	}
});
```

After the file has been loaded successfully, we may procceed with sending the request:
```javascript
nuance.sendRequest(language, id, additionalHeaders, function(response){
	console.log(response);
});
```

language = The language code (for example: "eng-USA").

id = The user's identifier - you should send here a random generated string for each user.

additionalHeaders = An object containing more headers than the default headers

response = If successfull, returns an array with whatever Nuance analyzed. If not successfull - returns the whole response object so you can debug the problem.

A whole code should look like this:
```javascript
var Nuance = require("nuance");

var nuance = new Nuance();

nuance.loadFile(path, function(fileLoaded){
	if(fileLoaded){
		nuance.sendRequest(language, id, additionalHeaders, function(response){
			if(typeof response === 'array'){
				console.log(response);
			}
			else{
				//An error occurred
				console.log(response);
			}
		});
	}
	else{
		//The file probably doesn't exist
	}
});
```

##Notes
1. If you receive error 500 with AUDIO_INFO - the headers you had sent are probably wrong.
2. Please make sure you are sending the right headers with the right language.
3. Feel free to modify the default headers in the index.js file, at the moment they are set to handle AMR files.
4. You may replace the default headers by suppling additionalHeaders, so you don't have to change the default headers in the index.js file.
5. You need to supply apiKey and appID in the index.js file.