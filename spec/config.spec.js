'use strict';

process.env.NODE_CONFIG_DIR = require('path').resolve(__dirname + '/fixtures');
var config = require('../src/config');

describe('get()', function () {
    it('should return correct value', function () {
        expect(config.get('repos')[0]['remote']).toBe('owner/repo');
        expect(config.get('webhook.port')).toBe(4949);
        expect(config.get('sendmail.smtp.secure')).toBe(true);
    });

    it('should throw correct error when undefined property is requested', function () {
        var msg = 'Cannot get "PROPERTY" from config. Please confirm schema of config. You can see the correct schema in "~/.ghsync/config/default.json.placeholder".';
        expect(function () { config.get('undefined'); }).toThrowError(msg.replace(/PROPERTY/, 'undefined'));
        expect(function () { config.get('webhook.undefined'); }).toThrowError(msg.replace(/PROPERTY/, 'webhook.undefined'));
        expect(function () { config.get('sendmail.smtp.auth.passs'); }).toThrowError(msg.replace(/PROPERTY/, 'sendmail.smtp.auth.passs'));
    });
});
