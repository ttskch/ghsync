#!/usr/bin/env node

'use strict';

if (!process.env.NODE_CONFIG_DIR) {
    process.env.NODE_CONFIG_DIR = (process.env.HOME || process.env.USERPROFILE) + '/.config/ghsync';
}

var meow = require('meow');
var ghsync = require('./bootstrap');

var cli = meow(
    'Usage:\n' +
    '  $ ghsync init    Initialize config file.\n' +
    '  $ ghsync run     Start syncing.\n' +
    '\n' +
    'Options:\n' +
    '  -h, --help     Display this help message.\n' +
    '  -v, --version  Display current version.\n' +
    '\n' +
    'Configure:\n' +
    '  run `ghsync init` and edit ~/.config/ghsync/default.yml.\n'
    , {
        alias: {
            h: 'help',
            v: 'version'
        }
    }
);

ghsync(cli.input[0], cli.flags, cli.showHelp);
