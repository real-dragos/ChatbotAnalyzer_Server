const dialogflow = require('dialogflow');

const projectId = process.env.DIALOGFLOW_PROJECT_ID;

class DialogflowChatbot {

    constructor() {
        this.sessionClient = new dialogflow.SessionsClient();
    }

    async getResponse(message, sessionId) {
        const sessionPath = this.sessionClient.sessionPath(projectId, sessionId);
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: message.text,
                    languageCode: 'en-US'
                }
            }
        };
        try {
            const responses = await this.sessionClient.detectIntent(request);
            const result = responses[0].queryResult;
            const responseMessage = result.fulfillmentMessages[0].text ? result.fulfillmentMessages[0].text.text[0] : result.fulfillmentMessages[0].payload.fields.text.stringValue;
            const confidence = result.intentDetectionConfidence;
            const intent = result.intent && result.intent.displayName;
            const context = result.outputContexts[0];
            return {
                message: responseMessage,
                metadata: {
                    confidence,
                    intent,
                    context
                }
            }
        }
        catch (exception) {
            console.log("Exception in DialogflowService: ", exception)
        }
    }
}

const dialogflowChatbot = new DialogflowChatbot();
module.exports = dialogflowChatbot;
