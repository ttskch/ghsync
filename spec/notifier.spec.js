'use strict';

var rewire = require('rewire');
var path = require('path');

var notifier = rewire('../src/notifier');

describe('sendmail()', function () {

    beforeAll(function () {
        notifier.__set__({
            config: {
                get: function (property) {
                    if (property === 'sendmail.options.from') {
                        return 'from';
                    } else if (property === 'sendmail.options.to') {
                        return 'to';
                    } else if (property === 'sendmail.options.subjectPrefix') {
                        return 'subjectPrefix'
                    }
                }
            }
        });
    });

    it('should call sendMail() method of transporter correctly', function () {

        // to succeed.
        var spyTransporterSendMail = createSpyTransporterSendMail(true);

        notifier.sendmail('path', 'stdout', 'stderr');

        expect(spyTransporterSendMail).toHaveBeenCalledWith({
            from: jasmine.any(String),
            to: jasmine.any(String),
            subject: jasmine.any(String),
            text: jasmine.any(String)
        }, jasmine.any(Function));
    });

    it('should invoke callback after sendMail() succeeded', function (done) {

        // to succeed.
        createSpyTransporterSendMail(true);

        spyOn(console, 'log');

        notifier.sendmail('path', 'stdout', 'stderr');

        setTimeout(function () {
            expect(console.log).toHaveBeenCalledWith('email notification sent');
            done();
        }, 100);
    });

    it('should invoke callback after sendMail() caused error', function (done) {

        // to cause error.
        createSpyTransporterSendMail(false);

        spyOn(console, 'log');

        notifier.sendmail('path', 'stdout', 'stderr');

        setTimeout(function () {
            expect(console.log).toHaveBeenCalledWith('An error occurred');
            done();
        }, 100);
    });
});

function createSpyTransporterSendMail(toSucceed) {
    var spy = jasmine.createSpy('transporter.sendMail');

    notifier.__set__('nodemailer', {
        createTransport: function () {
            return {
                sendMail: function (options, callback) {
                    spy(options, callback);
                    callback(toSucceed ? null : 'An error occurred', 'res');
                }
            };
        }
    });

    return spy;
}
