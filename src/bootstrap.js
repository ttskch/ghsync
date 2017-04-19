'use strict';

global.hasError = false;

var config = require('config');
var fs = require('fs');
var http = require('http');

var init = require('./init');
var autoPull = require('./auto-puller').autoPull;
var autoPush = require('./auto-pusher').autoPush;

module.exports = function (action, flags, showHelp) {
    switch (String(action).toLowerCase()) {
        case 'init':
            init();
            break;

        case 'run':
            if (!fs.existsSync(process.env.NODE_CONFIG_DIR + '/default.yml')) {
                console.log('[ERROR] First, run `ghsync init` and edit ~/.config/ghsync/default.yml.');
                return;
            }

            var handler = require('github-webhook-handler')({path: '/', secret: config.get('webhook.secret')});

            // auto pull.
            http.createServer(function (req, res) {
                handler(req, res, function (err) {
                    res.statusCode = 404;
                    res.end('no such location');
                });
            }).listen(config.get('webhook.port') || 4949);
            handler.on('push', autoPull);

            // auto push.
            autoPush();

            break;

        default:
            showHelp();
            break;
    }
};
