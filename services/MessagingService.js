let socket = require('socket.io');
const {performance} = require('perf_hooks');

const nlpService = require('.././services/NLPService');

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
        nlpService.getChatbotResponse(data.message, client.id, data.chatbotId, (message, metadata) => {
            metadata.responseTime = performance.now() - startingTime;
            const response = {
                message,
                metadata
            }
            client.emit('message', response);
        });
    }

    handleDisconnect() {
        console.log('Disconnected');
    }
}

const messageService = new MessageService();
module.exports = messageService;