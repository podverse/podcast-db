const
    {parseFeed} = require('./tasks/feedParser.js'),
    {addFeedUrlsToSQSParsingQueue,
     parseNextFeedFromQueue,
     deleteSQSMessage} = require('./tasks/sqsQueue.js');

function addFeedUrlsToParsingQueue (params = {}) {
  addFeedUrlsToSQSParsingQueue(params);
}

function parseNextFeed () {
  parseNextFeedFromQueue()
    .then(arr => {

      if (arr && arr.length > 0) {

        console.log('Start parsing:', arr[0]);

        return parseFeed(arr[0], arr[1]) // feedUrl, params
          .then(() => {
            deleteSQSMessage(arr[2]); // receiptHandle
            parseNextFeed();
            return;
          })
          .catch(e => {
            // Message should eventually timeout in SQS queue and go to the
            // dead letter queue.
            console.log(e);
            parseNextFeed();
            return;
          })
      } else {
        return
      }

    })
    .catch(err => {
      console.log(err);
    })
}

module.exports = {
  addFeedUrlsToParsingQueue,
  parseNextFeed
}
