var fs = require("fs");
var express = require("express");
var app = express();
var Nuance = require("nuance");

app.listen(3000, function(){
    console.log("Server is running at port 3000.");

    app.get("/", function(){
        var appID = ""; //Your appID.
        var appKey = ""; //Your appKey.
        var nuance = new Nuance(appID, appKey);

        //Sends a TTS (text-to-speech) request to Nuance.
        nuance.sendTTSRequest({
            "text": "hello world",
            "output": "testFile.wav",
            "outputFormat": "wav",
            "language": "en_US",
            "voice": "Tom",
            "identifier": "randomIdentifierStringHere",
            "success": function(){
                console.log("The file was saved.");
            },
            "error": function(response){
                console.log("An error was occurred");
                console.log(response);
            }
        });

        //Sends a dictation (speech-to-text) request to Nuance.
        nuance.sendDictationRequest({
            "identifier": "randomIdentifierStringHere",
            "language": "en-US",
            "path": "audio.amr",
            "success": function(resp){
                console.log(resp);
            },
            "error": function(resp){
                console.log("An error was occurred.");
                console.log(resp);
            }
        });
    });
});