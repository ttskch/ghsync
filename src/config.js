'use strict';

if (!process.env.NODE_CONFIG_DIR) {
    process.env.NODE_CONFIG_DIR = (process.env.HOME || process.env.USERPROFILE) + '/.ghsync/config';
}

var Config = function (config) {
    this.config = config;
};

Config.prototype = {
    get: function (property) {
        try {
            return this.config.get(property);
        } catch (e) {
            throw new Error('Cannot get "' + property + '" from config. Please confirm schema of config. You can see the correct schema in "~/.ghsync/config/default.json.placeholder".');
        }
    }
};

module.exports = function (config) {
    if (config) {
        return new Config(config);
    } else {
        var baseConfig = require('config');
        return new Config(baseConfig);
    }
};
