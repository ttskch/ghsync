'use strict';

var rewire = require('rewire');

var autoPuller = rewire('../src/auto-puller');
var autoPull = autoPuller.autoPull;

describe('autoPull()', function () {

    beforeAll(function () {
        autoPuller.__set__('notifier', {
            sendmail: function (path, stdout, stderr) {
                console.log('called');
            }
        });
    });

    beforeEach(function () {
        autoPuller.__set__('config', {
            get: function (property) {
                if (property === 'repos') {
                    return [
                        { remote: 'remote1', local: 'local1' },
                        { remote: 'remote2', local: 'local2' },
                        { remote: 'remote3', local: 'local3' }
                    ];
                }
            }
        });
    });

    it('should exec correct git-pull command', function () {

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

        expect(spyExec).toHaveBeenCalledWith('git pull origin master --no-edit', {cwd: 'local1'});
    });

    it('should turn global.hasError false after succeed exec git-pull command', function () {

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

    it('should turn global.hasError true after fail exec git-pull command', function () {

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

    it('should call email notifier when git-pull command fail', function () {

        // to succeed.
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

        expect(console.log).toHaveBeenCalledWith('called');
    });

    it('should not call email notifier when git-pull command succeed', function () {

        // to succeed.
        createSpyExec(true);

        var event = {
            payload: {
                repository: {
                    full_name: 'remote2'
                }
            }
        };

        spyOn(console, 'log');

        autoPull(event);

        expect(console.log).not.toHaveBeenCalledWith('called');
    });
});

function createSpyExec(toSucceed) {
    var spy = jasmine.createSpy('exec');

    var mockExec = function (cmd, options, callback) {
        spy(cmd, options);
        callback(toSucceed ? null : 'An error occurred', 'stdout', 'stderr');
    };

    autoPuller.__set__('exec', mockExec);

    return spy;
}
