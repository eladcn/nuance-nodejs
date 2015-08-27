var fs = require("fs");
var unirest = require("unirest");

/**
 * Module Nuance:
 * A Nuance HTTP client for NodeJS.
 *
 * @constructor
 * @author Elad Cohen
 */
var Nuance = function(){
    var self = this;

    var url = "https://dictation.nuancemobility.net:443/NMDPAsrCmdServlet/dictation";
    var appID = ""; //Your appID
    var appKey = ""; //Your appKey

    var fileContent;
    var headers = {
        "Content-Type": "audio/amr",
        "Accept": "text/plain",
        "Accept-Topic": "Dictation"
    }; //Change these headers to the headers that apply to you if needed or add additionalHeaders to the sendRequest function

    /**
     * Sends the request and returns the string of the analyzed audio file.
     *
     * @param language The language the audio file was recorded with.
     * @param identifier A unique identifier for the user who uploaded the audio file.
     * @param additionalHeaders Additional headers - optional.
     * @param callback The callback function that the result will be sent to.
     */
    self.sendRequest = function(language, identifier, additionalHeaders, callback){
        if(!language || typeof callback !== 'function' || !identifier ||  !fileContent){
            return;
        }

        headers["Accept-Language"] = language;

        if(typeof additionalHeaders === 'object'){
            headers = mergeAssociativeArrays(headers, additionalHeaders);
        }

        url += "?appId=" + appID + "&appKey=" + appKey + "&id=" + identifier;

        unirest.post(url)
            .headers(headers)
            .send(fileContent)
            .end(function(response){
                var error;

                if(response["code"] === 200){
                    response = response["body"].split("\n");
                }
                else{
                    error = response;
                    response = undefined;
                }

                callback(error, response);
            });
    };

    /**
     * Returns a file's content.
     *
     * @param path The path to the file.
     * @param callback The callback we'd like to call when done loading
     */
    self.loadFile = function(path, callback){
        if(!path){
            if(typeof callback === 'function'){
                callback(false);
            }

            return;
        }

        fs.readFile(path,[], function(err, data){
            if(!err){
                fileContent = data;
                headers["Content-Length"] = fileContent.length;
            }

            if(typeof callback === 'function'){
                callback(!err);
            }
        });
    };

    /**
     * Sets the instance's file content.
     * This function should be used only if you already have the file's content that have been read using the
     * fs.readFile function. If you don't have the file's content, please use the loadFile funciton.
     *
     * @param value
     */
    self.setFileContent = function(value){
        fileContent = value;
        headers["Content-Length"] = fileContent.length;
    };

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
    };
};

module.exports = Nuance;