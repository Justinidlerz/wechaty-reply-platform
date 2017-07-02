const { wrap: async } = require('co');
const mongoose = require('mongoose');
const AutoReply = mongoose.model('AutoReply');
let caches = [];

exports.updateMatch = async(function *() {
    caches = yield AutoReply.find({}, null, {
        lean: true,
        select: 'types content reply'
    });
    return caches;
})

exports.getMatch = async(function *() {
    if (!caches.length) {
        return yield exports.updateMatch();    
    } else {
        return caches;
    }
});