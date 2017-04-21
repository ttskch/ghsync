'use strict';

var config = require('config');
var exec = require('child_process').exec;
var notifier = require('./notifier');

module.exports.autoPull = function (event) {
    config.get('repos').forEach(function (repo) {
        if (event.payload.repository.full_name === repo.remote) {
            var cmd = 'git pull origin master --no-edit';
            console.log(cmd, repo.local);
            exec(cmd, {cwd: repo.local}, function (err, stdout, stderr) {
                console.log(stdout);
                if (err) {
                    global.hasError = true;
                    console.log(stderr);

                    if (config.get('sendmail.enabled')) {
                        notifier.sendmail(repo.local, stdout, stderr);
                    }
                } else {
                    global.hasError = false;
                }
            });
        }
    });
};
