const Client = require('node-rest-client').Client;
const client = new Client();
const constants = require('../constants');

class RasaChatbot {

    async getResponse(message, handleResponse) {
        try {
            let responseMessage;
            let metadata = {};
            const args = {
                data: { text: message.text },
                headers: { "Content-Type": "application/json" }
            }

            client.post(constants.rasaModelUrl, args, (data) => {
                if (!data) {
                    throw `The intent identificaiton process failed for message: ${args.data.message}`;
                }
                if (Buffer.isBuffer(data)) {
                    data = JSON.parse(data);
                }
                metadata.confidence = data.intent.confidence;
                metadata.intent = data.intent.name;

                const args = {
                    data: { message: message.text },
                    headers: { "Content-Type": "application/json" }
                }
                client.post(constants.rasaResponseUrl, args, (data) => {
                    responseMessage = data[0].text;
                    handleResponse(responseMessage, metadata);
                });
            })
        }
        catch (exception) {
            console.log("Exception in Rasa Implementation", exception)
        }
    }
}

const rasaChatbot = new RasaChatbot();
module.exports = rasaChatbot;