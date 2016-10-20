#!/usr/bin/env node

'use strict';

var meow = require('meow');
var ghsync = require('./app');

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
