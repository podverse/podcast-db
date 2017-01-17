#!/usr/local/bin/node
let path = require('path');

let params = {};
params.shouldParseMaxEpisodes = true;
require(path.join(__dirname, '../src/tasks/', 'sqsQueue.js')).addFeedUrlsToSQSParsingQueue(params);
