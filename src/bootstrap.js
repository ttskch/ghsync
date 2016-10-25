'use strict';

global.config = require('./config')();
global.hasError = false;

var http = require('http');
var handler = require('github-webhook-handler')({path: '/', secret: config.get('webhook.secret')});

var autoPull = require('./auto-puller').autoPull;
var autoPush = require('./auto-pusher').autoPush;

module.exports = function (action, flags, showHelp) {

    if (!action || action.toLowerCase() !== 'run') {
        showHelp();
    }

    // auto pull.

    http.createServer(function (req, res) {
        handler(req, res, function (err) {
            res.statusCode = 404;
            res.end('no such location');
        });
    }).listen(global.config.get('webhook.port') || 4949);

    handler.on('push', autoPull);

    // auto push.

    autoPush();
};
