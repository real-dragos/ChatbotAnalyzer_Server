const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connectionString = 'mongodb://localhost/chatbotDB';
let User, Chatbot, Intent;

class DatabaseService {
    constructor() {
        mongoose.connect(connectionString, {
            useNewUrlParser:
                true, useUnifiedTopology: true
        });
        initializeModels();
    }

    getUsers() {
        return User.find({}).select('name email');
    }

    getUserByName(name) {
        return User.findOne({ name: name }).select('name email');
    }

    getChatbots() {
        return Chatbot.find({}).select('name description vocabularySize intentsSize imageUrl');
    }

    getMessages(chatbotId, userId) {
        return Chatbot.findOne({ _id: chatbotId, 'chats.userId': userId }, { 'chats.messages': { $slice: -10 } }).select('chats.messages')
    }

    getIntents() {
        return Intent.find({});
    }

    getIntentPatterns(tag) {
        return Intent.findOne({tag: tag}).select('patterns');
    }


    addMessage(message, chatbotId, userId, callback) {
        Chatbot.findOne({ _id: chatbotId, 'chats.userId': userId })
            .then((chatbot) => {
                chatbot.chats[0].messages.push(message);
                chatbot.save();
                const [result] = chatbot.chats[0].messages.slice(-1);
                callback(result)
            });
    }
}

function initializeModels() {
    // user
    const userSchema = new Schema({
        name: String,
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    })
    User = mongoose.model('users', userSchema);
    // chatbot
    const chatbotSchema = new Schema({
        name: { type: String, required: true, unique: true },
        description: String,
        vocabularySize: Number,
        intentsSize: Number,
        imageUrl: String,
        chats: [{
            userId: { type: Schema.Types.ObjectId },
            messages: [{
                ownerId: String,
                text: String,
                timestamp: Date
            }]
        }]
    })
    Chatbot = mongoose.model('chatbots', chatbotSchema);
    const intentSchema = new Schema({
        tag: { type: String, required: true, unique: true },
        patterns: [String],
        responses: [String],
        context: [String],
        attachments: {
            links: [String],
            images: [String],
            files: [String]
        }
    })
    Intent = mongoose.model('intents', intentSchema);
}

const dbService = new DatabaseService();

module.exports = dbService;