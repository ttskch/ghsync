'use strict';

var chokidar = require('chokidar');
var path = require('path');
var exec = require('child_process').exec;
var _ = require('lodash');

module.exports.autoPush = function () {

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
