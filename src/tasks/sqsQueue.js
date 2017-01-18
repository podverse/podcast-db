const
    sqlEngineFactory = require('../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../repositories/sequelize/models'),
    {parseFeedIfHasBeenUpdated} = require('./feedParser'),
    {postgresUri, queueUrl} = require('../config'),
    aws = require('aws-sdk');

const sqlEngine = new sqlEngineFactory({uri: postgresUri});
const Models = modelFactory(sqlEngine);

aws.config.update({region:'us-west-2'});
const sqs = new aws.SQS();

function addFeedUrlsToSQSParsingQueue (params = {}) {

  return new Promise((resolve, reject) => {
    purgeSQSFeedQueue(resolve, reject)
  })
  .then(() => {
    let {Podcast} = Models;

    return Podcast.findAll({
      attributes: ['feedURL']
    })
    .then(podcasts => {

      let feedUrls = [];
      for (podcast of podcasts) {
        feedUrls.push(podcast.feedURL);
      }

      // AWS SQS can has a max of 10 messages per batch message. This code breaks
      // the feedURLs into chunks of 10, then calls the send batch message
      // operation once for each of those chunks of 10.
      let entryChunks = [];
      let tempChunk = [];

      for (let [index, feedUrl] of feedUrls.entries()) {
        let entry = {
          Id: String(index),
          MessageBody: feedUrl,
          MessageAttributes: {
            'shouldParseRecentEpisodes': {
              DataType: 'Number',
              StringValue: params.shouldParseRecentEpisodes ? '1' : '0'
            },
            'shouldParseMaxEpisodes': {
              DataType: 'Number',
              StringValue: params.shouldParseMaxEpisodes ? '1' : '0'
            }
          }
        }

        tempChunk.push(entry);

        if ((index + 1) % 10 === 0  || index === feedUrls.length - 1) {
          entryChunks.push(tempChunk);
          tempChunk = [];
        }
      }

      for (entryChunk of entryChunks) {
        let chunkParams = {
          Entries: entryChunk,
          QueueUrl: queueUrl
        }

        sqs.sendMessageBatch(chunkParams, (err, data) => {
          if (err) {
            console.log(err, err.stack);
          } else {
            console.log(data);
          }
        });
      }

    })
  })
  .catch((err) => {
    console.log(err);
  })

}

function parseNextFeedFromQueue () {
  let params = {
    QueueUrl: queueUrl,
    MessageAttributeNames: ['All'],
    VisibilityTimeout: 300
  }

  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      console.log(err);
    }

    if (!data.Messages || data.Messages.length < 1) {
      console.log('No messages returned.')
      return;
    }

    let parseParams = {};
    let message = data.Messages[0];

    parseParams.ReceiptHandle = message.ReceiptHandle;

    if (message.MessageAttributes) {
      let msgAttrs = message.MessageAttributes;
      if (msgAttrs.shouldParseRecentEpisodes && msgAttrs.shouldParseRecentEpisodes.StringValue) {
        parseParams.shouldParseRecentEpisodes = parseInt(msgAttrs.shouldParseRecentEpisodes.StringValue) === 1 ? true : false;
      }
      if (msgAttrs.shouldParseMaxEpisodes && msgAttrs.shouldParseMaxEpisodes.StringValue) {
        parseParams.shouldParseMaxEpisodes = parseInt(msgAttrs.shouldParseMaxEpisodes.StringValue) === 1 ? true : false;
      }
    }

    let feedUrl = message.Body;

    parseFeedIfHasBeenUpdated(feedUrl, parseParams)
  })
}

function deleteSQSMessage (params = {}) {
  // If there is a ReceiptHandle, then the feed was parsed from SQS, and we
  // need to delete the SQS message.
  if (params.ReceiptHandle) {
    let sqsParams = {
      QueueUrl: queueUrl,
      ReceiptHandle: params.ReceiptHandle
    };

    sqs.deleteMessage(sqsParams, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    })
  }
}

function purgeSQSFeedQueue (resolve, reject) {
  let params = {
    QueueUrl: queueUrl
  };

  sqs.purgeQueue(params, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
}

module.exports = {
  addFeedUrlsToSQSParsingQueue,
  parseNextFeedFromQueue,
  deleteSQSMessage
}
