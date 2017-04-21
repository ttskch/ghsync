'use strict';

var rewire = require('rewire');

var autoPusher = rewire('../src/auto-pusher');
var spies = initAutoPusher();
var autoPush = autoPusher.autoPush;

describe('autoPush()', function () {

    var commitInterval = 0.1;

    beforeEach(function () {
        autoPusher.__set__('config', {
            get: function (property) {
                if (property === 'repos') {
                    return [
                        { local: 'local1', ignores: [] },
                        { local: 'local2', ignores: ['ignore2'] },
                        { local: 'local3', ignores: ['ignore3.1', /ignore3.2/] }
                    ];
                } else if (property === 'commitInterval') {
                    return commitInterval;
                }
            }
        });
    });

    afterAll(function () {
        global.hasError = false;
    });

    it('should generate chokidar watchers correctly', function () {
        autoPush();

        expect(spies.chokidar.watch).toHaveBeenCalledTimes(3);
        expect(spies.chokidar.watch).toHaveBeenCalledWith('local1', jasmine.objectContaining({ ignored: [/[\/\\]\./, '.git'] }));
        expect(spies.chokidar.watch).toHaveBeenCalledWith('local2', jasmine.objectContaining({ ignored: [/[\/\\]\./, '.git', 'ignore2'] }));
        expect(spies.chokidar.watch).toHaveBeenCalledWith('local3', jasmine.objectContaining({ ignored: [/[\/\\]\./, '.git', 'ignore3.1', /ignore3.2/] }));
    });

    it('should watch all events correctly', function () {
        autoPush();

        expect(spies.watcher.on).toHaveBeenCalledWith('ready', jasmine.any(Function));
        expect(spies.watcher.on).toHaveBeenCalledWith('all', jasmine.any(Function));
    });

    it('should decrease event count and call exec with correct command', function (done) {
        // jasmine.clock().install();

        spyOn(console, 'log').and.callThrough();

        autoPush();

        expect(console.log).toHaveBeenCalledWith('stacked events:', 1);

        // jasmine.clock().tick(1000 * commitInterval + 1);

        // FIXME: I don't know why but jasmine.clock() doesn't work for setTimeout in callback especially in mock by rewire...
        // see https://github.com/jhnns/rewire/issues/101
        setTimeout(function () {
            expect(console.log).toHaveBeenCalledWith('stacked events:', 0);

            var cmd = 'git pull origin master --no-edit && git add . && git commit -m "Automatically committed" && git push origin master';
            expect(spies.exec).toHaveBeenCalledWith(cmd, {cwd: 'local1'}, jasmine.any(Function));
            expect(spies.exec).toHaveBeenCalledWith(cmd, {cwd: 'local2'}, jasmine.any(Function));
            expect(spies.exec).toHaveBeenCalledWith(cmd, {cwd: 'local3'}, jasmine.any(Function));

            done();
        }, 1000 * commitInterval + 1);

        // jasmine.clock().uninstall();
    });

    it('should not stack event when some errors are occurring', function () {
        global.hasError = true;

        spyOn(console, 'log');

        autoPush();

        expect(console.log).not.toHaveBeenCalledWith('stacked events:', 1);
    });
});

function initAutoPusher() {

    var spies = {
        chokidar: {
            watch: jasmine.createSpy('chokidar.watch')
        },
        watcher: {
            on: jasmine.createSpy('watcher.on')
        },
        exec: jasmine.createSpy('exec')
    };

    var mockChokidar = {
        watch: function (path, options) {
            spies.chokidar.watch(path, options);
            return {
                on: function (eventName, callback) {
                    spies.watcher.on(eventName, callback);
                    callback();
               }
            };
        }
    };

    var mockPath = {
        resolve: function (base, path) {
            return path;
        }
    };

    autoPusher.__set__({
        chokidar: mockChokidar,
        path: mockPath,
        exec: spies.exec
    });

    return spies;
}
