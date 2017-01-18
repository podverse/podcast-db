#!/usr/local/bin/node
let path = require('path');

require(path.join(__dirname, '../src/', 'main.js')).parseNextFeed();
