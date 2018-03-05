const
    present = require('present'),
    {logTime} = require('./helpers.js'),
    {parseFeed} = require('./tasks/feedParser.js'),
    {addFeedUrlsToSQSParsingQueue, parseNextFeedFromQueue,
      deleteSQSMessage} = require('./tasks/sqsQueue.js');

function addFeedUrlsToParsingQueue (params = {}) {
  addFeedUrlsToSQSParsingQueue(params);
}

function parseNextFeed () {

  let time = present();

  time = logTime('Start parseNextFeed', time);

  parseNextFeedFromQueue()
    .then(arr => {

      time = logTime('In parseNextFeedFromQueue then', time);

      if (arr && arr.length > 0) {

        console.log('Begin parsing:', arr[0]);

        parseFeed(arr[0], arr[1]) // feedUrl, params
          .then(() => {

            time = logTime('In parseFeed then', time);

            deleteSQSMessage(arr[2]); // receiptHandle
            parseNextFeed();
            return;
          })
          .catch(e => {
            time = logTime('In parseFeed catch', time);

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
      return;
    })
}

module.exports = {
  addFeedUrlsToParsingQueue,
  parseNextFeed
}
