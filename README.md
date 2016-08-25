# nuance-nodejs
A simple Nuance HTTP Client for NodeJS.

## Installation
Use NPM:
```
npm install nuance --save
```

##Usage
First, you need to create a new Nuance instance:
```javascript
var Nuance = require("nuance");
var nuance = new Nuance(appID, appKey);
```

If you'd like to send a Text-To-Speech request, use the method sendTTSRequest as follow:
```javascript
nuance.sendTTSRequest({
	"text": "hello world", //The text you would like to convert to speech.
	"output": "testFile.wav", //The output file.
	"outputFormat": "wav", //The codec you would like to use.
	"language": "en_US", //The language code (please refer to Nuance's documentation for more info).
	"voice": "Tom", //The voice you would like to use (please refer to Nuance's documentation for more info).
	"identifier": "randomIdentifierStringHere", //The user identifier (please refer to Nuance's documentation for more info).
	"success": function(){ //The success callback function.
		console.log("The file was saved.");
	},
	"error": function(response){ //The error callback function - returns the response from Nuance that you can debug.
		console.log("An error was occurred");
		console.log(response);
	}
});
```

If you'd like to send a Dictation request (Speech-To-Text), use the method sendDictationRequest as follow:
```javascript
nuance.sendDictationRequest({
	"identifier": "randomIdentifierStringHere", //The user identifier (please refer to Nuance's documentation for more info).
	"language": "en-US", //The language code (please refer to Nuance's documentation for more info).
	"path": "audio.amr", //The path to the file you would like to send to Nuance.
	"additionalHeaders": {}, //If you'd like to supply more headers or replace the default headers, supply them here.
	"success": function(resp){ //The success callback function.
		console.log(resp);
	},
	"error": function(resp){ //The error callback function - returns the response from Nuance that you can debug.
		console.log("An error was occurred.");
		console.log(resp);
	}
});
```

##Notes
1. If you receive error 500 with AUDIO_INFO - the headers you sent are probably wrong.
2. Please make sure you are sending the right headers with the right language.
3. Feel free to modify the default dictationHeaders in the nuance.js file, at the moment they are set to handle AMR files.
4. You may also replace the default dictationHeaders by suppling additionalHeaders in the sendDictationRequest options, so you don't have to change the default headers in the nuance.js file.