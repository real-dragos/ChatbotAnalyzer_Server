let socket = require('socket.io');
const {performance} = require('perf_hooks');

const nlpService = require('./NLPService');
const dbService = require('./DatabaseService');

class MessageService {

    listen(server) {
        const io = socket.listen(server);
        io.on('connection', (client) => {
            console.log(`User with ID ${client.id} connected`);

            client.on('message', (data) => {
                this.handleMessage(data, client);
            })

            client.on('disconnect', () => {
                console.log(`Client with ID ${client.id} disconnected...`);
                this.handleDisconnect();
            })

            client.on('error', (err) => {
                console.log(`Received error from client with ID ${client.id}:`);
                console.log(err);
            })
        })
    }

    handleMessage(data, client) {
        const startingTime = performance.now();
        const {message, chatbotId, userId, context} = data;
        const inputMessage = message;
        dbService.addMessage(inputMessage, chatbotId, userId, (inputResult) =>{
            nlpService.getChatbotResponse(inputResult, context, client.id, chatbotId, (messageText, metadata) => {
                metadata.responseTime = performance.now() - startingTime;
                const outputMessage = {
                    id: '-1',
                    text: messageText,
                    ownerId: chatbotId,
                    timestamp: new Date()
                }
                dbService.addMessage(outputMessage, chatbotId, userId , (outputResult) => {
                    const response = {
                        input: inputResult,
                        output: outputResult,
                        metadata
                    }
                    client.emit('message', response);
                })
            });
        });
    }

    handleDisconnect() {
        console.log('Disconnected');
    }
}

const messageService = new MessageService();
module.exports = messageService;