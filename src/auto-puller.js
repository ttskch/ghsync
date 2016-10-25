'use strict';

var exec = require('child_process').exec;
var notifier = require('./notifier');

module.exports.autoPull = function (event) {
    
    global.config.get('repos').forEach(function (repo) {
        if (event.payload.repository.full_name === repo.remote) {
            var cmd = 'cd ' + repo.local + ' && git pull origin master --no-edit';
            console.log(cmd);
            exec(cmd, function (err, stdout, stderr) {
                console.log(stdout);
                if (err) {
                    global.hasError = true;
                    console.log(stderr);

                    if (global.config.get('sendmail.enabled')) {
                        notifier.sendmail(repo.local, stdout, stderr);
                    }
                } else {
                    global.hasError = false;
                }
            });
        }
    });
};
