'use strict';

global.config = require('./config')();
global.hasError = false;

var http = require('http');
var handler = require('github-webhook-handler')({path: '/', secret: config.get('webhook.secret')});
var exec = require('child_process').exec;
var chokidar = require('chokidar');
var path = require('path');
var _ = require('lodash');

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

    var autoPull = require('./auto-puller').pull;
    handler.on('push', autoPull);

    // auto push.

    var watchers = {};

    global.config.get('repos').forEach(function (repo) {
        watchers[repo.local] = chokidar.watch(repo.local, {
            ignored: [/[\/\\]\./].concat(repo.ignores.map(function (v) {
                return path.resolve(repo.local, v);
            })),
            awaitWriteFinish: true
        });
    });

    _.forEach(watchers, function (watcher, rootPath) {
        watcher
            .on('ready', function () {
                var cmd = 'cd ' + rootPath + ' && git pull origin master --no-edit && git add . && git commit -m "Automatically committed" && git push origin master';
                var count = 0;
                watcher
                    .on('all', function (event, path) {
                        // if some errors is occurring on local repo, do nothing.
                        if (global.hasError) {
                            return;
                        }

                        // cmd will be executed only once after the last event.
                        count++;
                        console.log('stacked events:', count);

                        setTimeout(function () {
                            count--;
                            console.log('stacked events:', count);

                            if (count === 0) {
                                console.log(cmd);
                                exec(cmd, function (err, stdout, stderr) {
                                    console.log(stdout);
                                    if (err) {
                                        console.log(stderr);
                                    }
                                });
                            }
                        }, 1000 * (global.config.get('commitInterval') || 30));
                        console.log(event, path);
                    })
                ;
            })
        ;
    });
};
