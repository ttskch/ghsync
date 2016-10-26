'use strict';

var mock = require('mock-require');
var path = require('path');

describe('autoPull()', function () {

    var sendmailEnabled = true;

    beforeAll(function () {
        var mockNotifier = {
            sendmail: function (path, stdout, stderr) {
                console.log('sent');
            }
        };
        mock('../src/notifier', mockNotifier);
    });

    afterAll(function () {
        mock.stop('../src/notifier');
        delete require.cache[path.resolve(__dirname, '../src/notifier.js')];
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

    afterEach(function () {
        mock.stop('child_process');
        delete require.cache[path.resolve(__dirname, '../src/auto-puller.js')];
    });

    it('should be passed correct git-pull command', function () {

        // to succeed.
        var spyExec = generateMockChildProcess(true);
        var autoPull = require('../src/auto-puller').autoPull;

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
        generateMockChildProcess(true);
        var autoPull = require('../src/auto-puller').autoPull;

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
        generateMockChildProcess(false);
        var autoPull = require('../src/auto-puller').autoPull;

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
        generateMockChildProcess(false);
        var autoPull = require('../src/auto-puller').autoPull;

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
        generateMockChildProcess(false);
        var autoPull = require('../src/auto-puller').autoPull;

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
        generateMockChildProcess(true);
        var autoPull = require('../src/auto-puller').autoPull;

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

function generateMockChildProcess(toSucceed) {
    var spy = jasmine.createSpy('exec');

    var mockChildProcess = {
        exec: function (cmd, callback) {
            spy(cmd);
            callback(toSucceed ? null : 'An error occurred', 'stdout', 'stderr');
        }
    };

    mock('child_process', mockChildProcess);

    return spy;
}
