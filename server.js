const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const messageService = require('./services/MessagingService');
const dbService = require('./services/DatabaseService');

const port = process.env.PORT || 5000;

"use strict";
const app = express();
app.use(cors());
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

function sendResult(res){
    return (err, result) => {
        if(err) throw err;
        res.send(result);
    }
}

app.get('/chatbots', (_req, res) => {
    dbService.getChatbots().exec(sendResult(res))
})

app.get('/users', (req, res) => {
    const name = req.query.name;
    if(name) dbService.getUserByName(name).exec(sendResult(res));
    else dbService.getUsers().exec(sendResult(res));
})

app.get('/messages', (req, res) => {
    const userId = req.query.userId;
    const chatbotId = req.query.chatbotId;
    if(!userId || !chatbotId) res.status(400).send("The query is invalid");
    else dbService.getMessages(chatbotId, userId).exec(sendResult(res));
})

app.get('/patterns', (req, res) => {
    const tag = req.query.tag;
    if(!tag) res.status(400).send("No tag was provided")
    else dbService.getIntentPatterns(tag).exec(sendResult(res));
})

// app.post('/messages', (req, res) => {
//     const userId = req.body.userId;
//     const chatbotId = req.body.chatbotId;
//     const message = req.body.message;
//     if(!userId || !chatbotId) res.status(400).send("Invalid request");
//     else dbService.addMessage(res, {ownerId: userId, text: message, timestamp: new Date()}, chatbotId, userId);
// });

const server = app.listen(port, function(){
    console.log(`listening to request at localhost: ${port}`);
});

// websockets
messageService.listen(server);






