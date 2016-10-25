'use strict';

if (!process.env.NODE_CONFIG_DIR) {
    process.env.NODE_CONFIG_DIR = (process.env.HOME || process.env.USERPROFILE) + '/.ghsync/config';
}
var baseConfig = require('config');

var Config = function () {
};

Config.prototype = {
    get: function (property) {
        try {
            return baseConfig.get(property);
        } catch (e) {
            throw new Error('Cannot get "' + property + '" from config. Please confirm schema of config. You can see the correct schema in "~/.ghsync/config/default.json.placeholder".');
        }
    }
};

module.exports = new Config();
