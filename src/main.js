const
    {parseFeedIfHasBeenUpdated} = require('./tasks/feedParser.js'),
    {addFeedUrlsToSQSParsingQueue,
     parseNextFeedFromQueue,
     deleteSQSMessage} = require('./tasks/sqsQueue.js');

function addFeedUrlsToParsingQueue (params = {}) {
  addFeedUrlsToSQSParsingQueue(params);
}

function parseNextFeed () {
  parseNextFeedFromQueue()
    .then(arr => {
      return parseFeedIfHasBeenUpdated(arr[0], arr[1]) // feedURL, params
        .then(() => {
          deleteSQSMessage(arr[2]); // receiptHandle
        })
    })
    .catch(err => {
      console.log(err);
    })
}

module.exports = {
  addFeedUrlsToParsingQueue,
  parseNextFeed
}
