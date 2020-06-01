const Client = require('node-rest-client').Client;
const client = new Client();
const constants = require('../constants');
const dbService = require('../services/DatabaseService');
const { getRandomInt } = require('../util/util');

class CustomChatbot {

    constructor() {
        dbService.getIntents().exec((err, result) => {
            if (err) throw err;
            this.intents = result;
        })
    }

    async getResponse(message, handleResponse) {
        try {
            let responseMessage;
            let metadata = {};
            console.log(message);
            if (!message.context) {
                // no context
                const args = {
                    data: { sentence: message.text },
                    headers: { "Content-Type": "application/json" }
                }

                client.post(constants.modelUrl, args, (data) => {
                    if (!data) {
                        throw `The intent identificaiton process failed for message: ${args.data.message}`
                    }
                    if (Buffer.isBuffer(data)) {
                        data = JSON.parse(data);
                    }
                    metadata.confidence = data[1];
                    metadata.intent = data[0];
                    for (let i = 0; i < this.intents.length; i++) {
                        const intent = this.intents[i];
                        if (intent.tag === data[0]) {
                            responseMessage = intent.responses[getRandomInt(0, intent.responses.length - 1)]
                            metadata.context = intent.context[0];
                            break;
                        }
                    };
                    handleResponse(responseMessage, metadata); 
                })
            }
            else {
                // with context
                for (let i = 0; i < this.intents.length; i++) {
                    const intent = this.intents[i];
                    if (intent.tag === message.context) {
                        responseMessage = intent.responses[getRandomInt(0, intent.responses.length - 1)]
                        metadata.context = intent.context[0];
                        metadata.confidence = 1;
                        break;
                    }
                };
                handleResponse(responseMessage, metadata); 
            }           
        }
        catch (exception) {
            console.log("Exception in Custom Implementation", exception)
        }
    }
}

const customChatbot = new CustomChatbot();
module.exports = customChatbot;