'use strict';

var config = require('config');
var http = require('http');
var handler = require('github-webhook-handler')({path: '/', secret: config.webhook.secret});
var exec = require('child_process').exec;
var chokidar = require('chokidar');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport(config.sendmail.smtp));
var _ = require('lodash');

var hasError = false;

// auto pull.

http.createServer(function (req, res) {
    handler(req, res, function (err) {
        res.statusCode = 404;
        res.end('no such location');
    });
}).listen(config.webhook.port || 4949);

handler.on('push', function (event) {
    _.forEach(config.get('repos'), function (path, repo) {
        if (event.payload.repository.full_name === repo) {
            var cmd = 'cd ' + path + ' && git pull origin master --no-edit';
            console.log(cmd);
            exec(cmd, function (err, stdout, stderr) {
                console.log(stdout);
                if (err) {
                    hasError = true;
                    console.log(stderr);

                    if (config.sendmail.enabled) {
                        sendmail(path, stdout, stderr);
                    }
                } else {
                    hasError = false;
                }
            });
        }
    });
});

function sendmail(path, stdout, stderr) {
    transporter.sendMail({
        from: config.sendmail.options.from,
        to: config.sendmail.options.to,
        subject: config.sendmail.options.subject_prefix + 'Error occurred in auto git-pull',
        text: '[path]\n' + path + '\n\n[stdout]\n' + stdout.trim() + '\n\n[stderr]\n' + stderr
    }, function (err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log('email notification sent');
        }
    });
}

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
            var count = 0;
            watcher
                .on('all', function (event, path) {
                    // cmd will be executed only once after the last event.
                    count++;
                    console.log('stacked events:', count);

                    setTimeout(function () {
                        count--;
                        console.log('stacked events:', count);

                        if (count === 0) {
                            // if some errors is occurring on local repo, don't auto push.
                            if (hasError) {
                                return;
                            }

                            console.log(cmd);
                            exec(cmd, function (err, stdout, stderr) {
                                console.log(stdout);
                                if (err) {
                                    console.log(stderr, err);
                                }
                            });
                        }
                    }, 1000 * (config.commit_interval || 30));
                    console.log(event, path);
                })
            ;
        })
    ;
});
