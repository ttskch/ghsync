'use strict';

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport(global.config.get('sendmail.smtp')));

var Notifier = function () {
};

Notifier.prototype = {
    sendmail: function (path, stdout, stderr) {
        transporter.sendMail({
            from: global.config.get('sendmail.options.from'),
            to: global.config.get('sendmail.options.to'),
            subject: global.config.get('sendmail.options.subjectPrefix') + 'Error occurred in auto git-pull',
            text: '[path]\n' + path + '\n\n[stdout]\n' + stdout.trim() + '\n\n[stderr]\n' + stderr
        }, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log('email notification sent');
            }
        });
    }
};

module.exports = new Notifier();
