'use strict';

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var Notifier = function (config) {
    this.config = config;
    this.transporter = nodemailer.createTransport(smtpTransport(this.config.get('sendmail.smtp')));
};

Notifier.prototype = {
    sendmail: function (path, stdout, stderr) {
        this.transporter.sendMail({
            from: this.config.get('sendmail.options.from'),
            to: this.config.get('sendmail.options.to'),
            subject: this.config.get('sendmail.options.subjectPrefix') + 'Error occurred in auto git-pull',
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

module.exports = function (config) {
    return new Notifier(config);
};
