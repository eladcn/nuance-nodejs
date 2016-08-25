var fs = require("fs");
var https = require('https');
var unirest = require("unirest");

/**
 * A Nuance HTTP client for NodeJS.
 *
 * @constructor
 * @author Elad Cohen
 * @version 1.1.0
 */
var Nuance = function(appID, appKey){
    var self = this;

    var dictationURL = "https://dictation.nuancemobility.net:443/NMDPAsrCmdServlet/dictation";
    var ttsURL = "https://tts.nuancemobility.net/NMDPTTSCmdServlet/tts";

    var fileContent;

    /**
     * Change these headers to the headers that apply to you (if needed), or add additionalHeaders to the
     * sendDictationRequest method.
     * You may also use the setDictationHeaders method instead.
     */
    var dictationHeaders = {
        "Content-Type": "audio/amr",
        "Accept": "text/plain",
        "Accept-Topic": "Dictation"
    };

    /**
     * Sends a TTS request to Nuance's service.
     * The options may include:
     * identifier - Required - A unique identifier for the user who sent request.
     * text - Required - The text that you want to convert to speech (for example: "hello world").
     * output - Required - The output file (for example: "speech.wav").
     * outputFormat - Required - The codec you would like to use (for example: "wav").
     * language - Required if voice was not supplied - The language you want to use (for example: "en_US").
     * voice - Required if language was not supplied - The voice you want to use (for example: "Tom").
     * success - Optional - The callback function to be called after the file was written.
     *
     * @param options
     */
    self.sendTTSRequest = function(options){
        if(!appID || !appKey){
            if(typeof options.error === "function"){
                options.error("Invalid appID or appKey.");
            }

            return;
        }

        if(!options || !options.text || !options.identifier || !options.output || !options.outputFormat || (!options.language && !options.voice)){
            if(typeof options.error === "function"){
                options.error("Invalid options.");
            }

            return;
        }

        ttsURL += "?appId=" + appID + "&appKey=" + appKey + "&id=" + options.identifier;

        if(options.voice){
            ttsURL += "&voice=" + options.voice;
        }
        else if(options.language){
            ttsURL += "&ttsLang=" + options.language;
        }

        ttsURL += "&text=" + encodeURIComponent(options.text) + "&codec=" + options.outputFormat;

        var file = fs.createWriteStream(options.output);
        https.get(ttsURL, function(response) {
            if(response.statusCode && response.statusCode != 200){
                if(typeof options.error === "function"){
                    options.error(response);
                }
            }
            else{
                response.pipe(file);

                if(typeof options.success === "function"){
                    options.success();
                }
            }
        });
    };

    /**
     * Sends the request and returns the string of the analyzed audio file.
     * The options may include:
     * identifier - Required - A unique identifier for the user who sent request.
     * language - Required - The language the audio file was recorded with.
     * path - Required - The audio file's path.
     * additionalHeaders - Optional - Additional headers.
     * success - Required - The callback function to be called after the file was written.
     * error - Optional - The callback function to be called if an error was occurred.
     *
     * @param options
     */
    self.sendDictationRequest = function(options){
        if(!appID || !appKey){
            if(typeof options.error === "function"){
                options.error("Invalid appID or appKey.");
            }

            return;
        }

        if(!options || !options.language || !options.identifier || (!fileContent && !options.path) || typeof options.success !== 'function'){
            if(typeof options.error === "function"){
                options.error("Invalid options.");
            }

            return;
        }

        dictationHeaders["Accept-Language"] = options.language;
        dictationHeaders["Content-Language"] = options.language;

        if(typeof options.additionalHeaders === 'object'){
            dictationHeaders = mergeAssociativeArrays(dictationHeaders, options.additionalHeaders);
        }

        dictationURL += "?appId=" + appID + "&appKey=" + appKey + "&id=" + options.identifier;

        if(options.path){
            fs.readFile(options.path, [], function(err, data){
                if(!err){
                    fileContent = data;
                    dictationHeaders["Content-Length"] = fileContent.length;

                    sendUnirestRequest(dictationURL, dictationHeaders, fileContent,
                        function(response){
                            options.success(response.split("\n"));
                        },
                        function(response){
                            if(typeof options.error === "function"){
                                options.error(response);
                            }
                        }
                    );
                }
                else if(typeof options.error === "function"){
                    options.error(err);
                }
            });
        }
        else{
            sendUnirestRequest(dictationURL, dictationHeaders, fileContent,
                function(response){
                    options.success(response.split("\n"));
                },
                function(response){
                    if(typeof options.error === "function"){
                        options.error(response);
                    }
                }
            );
        }
    };

    /**
     * Sends the request and returns the string of the analyzed audio file.
     *
     * @param language The language the audio file was recorded with.
     * @param identifier A unique identifier for the user who uploaded the audio file.
     * @param additionalHeaders Additional headers - optional.
     * @param callback The callback function that the result will be sent to.
     * @deprecated Use the sendDictationRequest method instead.
     */
    self.sendRequest = function(language, identifier, additionalHeaders, callback){
        self.sendDictationRequest({
            "language": language,
            "identifier": identifier,
            "additionalHeaders": additionalHeaders,
            "success": function(resp){
                callback(undefined, resp);
            },
            "error": function(resp){
                callback(resp);
            }
        });
    };

    /**
     * Sets the instance's audio file content using the file's path that will be sent to Nuance.
     *
     * @param path The path to the file.
     * @param callback The callback we'd like to call when done loading.
     * @deprecated Use sendDictationRequest with the "path" parameter instead.
     */
    self.loadFile = function(path, callback){
        if(!path){
            if(typeof callback === "function"){
                callback(false);
            }

            return;
        }

        fs.readFile(path, [], function(err, data){
            if(!err){
                fileContent = data;
                dictationHeaders["Content-Length"] = fileContent.length;
            }

            if(typeof callback === "function"){
                callback(!err);
            }
        });
    };

    /**
     * Sets the instance's file content.
     * This function should be used only if you already have the file's content that have been read using the
     * fs.readFile function. If you don't have the file's content, please use the loadFile funciton.
     *
     * @param value - Required - The file's content.
     */
    self.setFileContent = function(value){
        fileContent = value;
        dictationHeaders["Content-Length"] = fileContent.length;
    };

    /**
     * Sets the dictation headers that will be sent to the Nuance's dictation service.
     *
     * @param headers
     */
    self.setDictationHeaders = function(headers){
        if(typeof headers !== "object"){
            return;
        }

        dictationHeaders = headers;
    };

    /**
     * Sends a unirest request.
     *
     * @param url
     * @param headers
     * @param body
     * @param successCallback
     * @param errorCallback
     */
    function sendUnirestRequest(url, headers, body, successCallback, errorCallback){
        unirest.post(url)
            .headers(headers)
            .send(body)
            .end(function(response){
                if(response["code"] === 200){
                    response = response["body"];

                    if(typeof successCallback === "function"){
                        successCallback(response);
                    }
                }
                else if(typeof errorCallback === "function"){
                    errorCallback(response);
                }
            });
    }

    /**
     * Merges 2 associative arrays into one.
     *
     * @param array1 The array we store the results into.
     * @param array2 The array we add results from.
     * @returns {*}
     */
    function mergeAssociativeArrays(array1, array2){
        for(var property in array2) {
            if(array2.hasOwnProperty(property)){
                array1[property] = array2[property];
            }
        }

        return array1;
    }
};

module.exports = Nuance;