#!/usr/local/bin/node
let path = require('path');

let params = {};
params.shouldParseRecentEpisodes = true;
require(path.join(__dirname, '../src/tasks/', 'feedParser.js')).addFeedUrlsToSQSParsingQueue(params);
