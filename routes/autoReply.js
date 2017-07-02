const { wrap: async } = require('co');
const only = require('only');
const mongoose = require('mongoose');
const AutoReply = mongoose.model('AutoReply');
const express = require('express');
const match = require('../match');
const Router = express.Router;
const api = new Router();

api.get('/', async(function *(req, res) {
    try {
        const docs = yield AutoReply.find({}, null, {
            lean: true
        });
        res.send({
            docs
        });
    } catch (err) {
        res.status(500).send({ msg: '服务器异常' });
    }
}));

api.param('id', async(function *(req, res, next, id) {
    try {
        const doc = yield AutoReply.findById(id);
        if (!doc) {
            return res.status(404).send({ msg: '找不到id' });
        }
        req.doc = doc;
        next();
    } catch (err) {
        res.status(500).send({ msg: '服务器异常' });
    }
}));

api.delete('/:id', async(function * (req, res) {
    try {
        yield req.doc.remove();
        match.updateMatch();
        res.send({});
    } catch (err) {
        res.status(500).send({ msg: '服务器异常' });   
    }
}))

api.post('/', async(function * (req, res) {
    try {
       const autoReply = new AutoReply();
       const doc = only(req.body, ['content', 'types', 'reply']);
       Object.assign(autoReply, doc);
       yield autoReply.save();
       match.updateMatch();
       res.send({});
    } catch (err) {
        res.status(500).send({ msg: '服务器异常' });   
    }
}))

api.get('/:id', async(function *(req, res) {
    res.send({
        doc: req.doc
    });
}));

api.patch('/:id', async(function *(req, res) {
    try {
        const doc = only(req.body, ['content', 'types', 'reply']);
        Object.assign(req.doc, doc);
        yield req.doc.save();
        match.updateMatch();
        res.send();
    } catch (err) {
        res.status(500).send({ msg: '服务器异常' });   
    }
}));

module.exports = api;