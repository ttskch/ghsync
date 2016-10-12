'use strict';

var config = require('config');
var http = require('http');
var handler = require('github-webhook-handler')({path: '/', secret: process.env.WEBHOOK_SECRET});
var exec = require('child_process').exec;
var chokidar = require('chokidar');
var _ = require('lodash');

// auto pull.

http.createServer(function (req, res) {
    handler(req, res, function (err) {
        res.statusCode = 404;
        res.end('no such location');
    });
}).listen(process.env.WEBHOOK_PORT || 4949);

handler.on('push', function (event) {
    _.forEach(config.get('repos'), function (path, repo) {
        if (event.payload.repository.full_name === repo) {
            var cmd = 'cd ' + path + ' && git pull origin master --no-edit';
            exec(cmd);
            console.log(cmd);
        }
    });
});

// auto push.

var watchers = {};

_.values(config.get('repos')).forEach(function (path) {
    watchers[path] = chokidar.watch(path, {
        ignored: /[\/\\]\./,
        awaitWriteFinish: true
    });
});

_.forEach(watchers, function (watcher, rootPath) {
    watcher
        .on('ready', function () {
            var cmd = 'cd ' + rootPath + ' && git add . && git commit -m "Automatically committed" && git pull origin master --no-edit && git push origin master';
            watcher
                .on('all', function (event, path) {
                    setTimeout(function () {
                        if (cmd) {
                            exec(cmd);
                            console.log(cmd);
                            cmd = '';
                        }
                    }, 1000 * (process.env.PUSH_INTERVAL_SEC || 30));
                    console.log(event, path);
                })
            ;
        })
    ;
});
