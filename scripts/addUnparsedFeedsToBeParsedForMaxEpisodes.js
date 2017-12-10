#!/usr/local/bin/node
let path = require('path');

let params = {};
params.onlyParseUnparsed = true;

require(path.join(__dirname, '../src/', 'main.js')).addFeedUrlsToParsingQueue(params);
