'use strict';

process.env.NODE_CONFIG_DIR = require('path').resolve(__dirname + '/fixtures');
global.config = require('../src/config');

var rewire = require('rewire');
var path = require('path');

var autoPuller = rewire('../src/auto-puller');
var autoPull = autoPuller.autoPull;

describe('autoPull()', function () {

    var sendmailEnabled = true;

    beforeAll(function () {
        var mockNotifier = {
            sendmail: function (path, stdout, stderr) {
                console.log('sent');
            }
        };
        autoPuller.__set__('notifier', mockNotifier);
    });

    afterAll(function () {
        // FIXME: I don't know why this code is needed...
        delete require.cache[path.resolve(__dirname, '../src/notifier.js')];

        process.env.NODE_CONFIG_DIR = require('path').resolve(__dirname + '/fixtures');
        global.config = require('../src/config');
    });

    beforeEach(function () {
        global.config = {
            get: function (property) {
                if (property === 'repos') {
                    return [
                        { remote: 'remote1', local: 'local1' },
                        { remote: 'remote2', local: 'local2' },
                        { remote: 'remote3', local: 'local3' }
                    ];
                } else if (property === 'sendmail.enabled') {
                    return sendmailEnabled;
                }
            }
        };
    });

    it('should be passed correct git-pull command', function () {

        // to succeed.
        var spyExec = createSpyExec(true);

        var event = {
            payload: {
                repository: {
                    full_name: 'remote1'
                }
            }
        };

        autoPull(event);

        expect(spyExec).toHaveBeenCalledWith('cd local1 && git pull origin master --no-edit');
    });

    it('should turn global.hasError true after succeed exec git-pull command', function () {

        // to succeed.
        createSpyExec(true);

        var event = {
            payload: {
                repository: {
                    full_name: 'remote2'
                }
            }
        };

        global.hasError = true;

        autoPull(event);

        expect(global.hasError).toBe(false);
    });

    it('should turn global.hasError false after fail exec git-pull command', function () {

        // to occur error.
        createSpyExec(false);

        var event = {
            payload: {
                repository: {
                    full_name: 'remote3'
                }
            }
        };

        global.hasError = false;

        autoPull(event);

        expect(global.hasError).toBe(true);
    });

    it('should send email when git-pull command fail and config.sendmail.enabled is true', function () {

        // to occur error.
        createSpyExec(false);

        var event = {
            payload: {
                repository: {
                    full_name: 'remote1'
                }
            }
        };

        spyOn(console, 'log');

        autoPull(event);

        expect(console.log).toHaveBeenCalledWith('sent');
    });

    it('should not send email when git-pull command fail but config.sendmail.enabled is false', function () {

        // to occur error.
        createSpyExec(false);

        var event = {
            payload: {
                repository: {
                    full_name: 'remote2'
                }
            }
        };

        sendmailEnabled = false;

        spyOn(console, 'log');

        autoPull(event);

        expect(console.log).not.toHaveBeenCalledWith('sent');
    });

    it('should not send email when git-pull command succeed', function () {

        // to succeed.
        createSpyExec(true);

        var event = {
            payload: {
                repository: {
                    full_name: 'remote3'
                }
            }
        };

        sendmailEnabled = true;

        spyOn(console, 'log');

        autoPull(event);

        expect(console.log).not.toHaveBeenCalledWith('sent');
    });
});

function createSpyExec(toSucceed) {
    var spy = jasmine.createSpy('exec');

    var mockExec = function (cmd, callback) {
        spy(cmd);
        callback(toSucceed ? null : 'An error occurred', 'stdout', 'stderr');
    };

    autoPuller.__set__('exec', mockExec);

    return spy;
}
