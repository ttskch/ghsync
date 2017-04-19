'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function () {
    if (!fs.existsSync(process.env.NODE_CONFIG_DIR)) {
        fs.mkdirSync(process.env.NODE_CONFIG_DIR);
    }
    var sourcePath = path.resolve(__dirname, '../config/default.yml.placeholder');
    fs.createReadStream(sourcePath).pipe(fs.createWriteStream(process.env.NODE_CONFIG_DIR + '/default.yml'));
};
