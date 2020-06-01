const dialogflowChatbot = require('../chatbots/DialogflowChatbot');
const customChatbot = require('../chatbots/CustomChatbot');
const rasaChatbot = require('../chatbots/RasaChatbot');

class NLPService{

    chatbots = {
        custom: "5e3e909981992a47f425a327",
        dialogflow: "5e3e985abd922e47f4f80693",
        rasa: "5e3e9832bd922e47f4f80692"
    }

    getChatbotResponse(message, context, clientId, chatbotId, handleResponse){
        switch(chatbotId){
            case this.chatbots.custom:
                customChatbot.getResponse(message, context, handleResponse);
                break;
            case this.chatbots.dialogflow:
                dialogflowChatbot.getResponse(message, clientId)
                .then((result) => handleResponse(result.message, result.metadata))
                .catch((error) => console.log(error));
                break;
            case this.chatbots.rasa:
                handleResponse("Rasa", {});
                break;
            default:
                this.noChatbotFoundHandler(handleResponse)
        }
    }

    responseHandler(data){
        return data;
    }

    noChatbotFoundHandler(callback){
        callback("No valid chatbot", {})
    }

}

const nlpService = new NLPService();
module.exports = nlpService;