'use strict';

var config = require('config');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var Notifier = function () {
};

Notifier.prototype = {
    sendmail: function (path, stdout, stderr) {
        var transporter = nodemailer.createTransport(smtpTransport(config.get('sendmail.smtp')));
        transporter.sendMail({
            from: config.get('sendmail.options.from'),
            to: config.get('sendmail.options.to'),
            subject: config.get('sendmail.options.subjectPrefix') + 'Error occurred in auto git-pull',
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
