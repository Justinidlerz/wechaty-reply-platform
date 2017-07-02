const mongoose = require('mongoose');

const AutoReplySchema = mongoose.Schema({
    types: {
        default: 1,
        type: Number
    },
    content: String,
    reply: String,
    create: Date
})

mongoose.model('AutoReply', AutoReplySchema);