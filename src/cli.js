#!/usr/bin/env node

'use strict';

if (!process.env.NODE_CONFIG_DIR) {
    process.env.NODE_CONFIG_DIR = (process.env.HOME || process.env.USERPROFILE) + '/.config/ghsync';
}

var meow = require('meow');
var ghsync = require('./bootstrap');

var cli = meow(
    'Usage:\n' +
    '  $ ghsync run\n' +
    '\n' +
    'Options:\n' +
    '  -h, --help     Display this help message.\n' +
    '  -v, --version  Display current version.\n'
    , {
        alias: {
            h: 'help',
            v: 'version'
        }
    }
);

ghsync(cli.input[0], cli.flags, cli.showHelp);
