const
    sqlEngine = require('../repositories/sequelize/engineInstance.js'),
    modelFactory = require('../repositories/sequelize/models'),
    {postgresUri, queueUrl, awsRegion} = require('../config'),
    aws = require('aws-sdk');

const Models = modelFactory(sqlEngine);

aws.config.update({region: awsRegion});
const sqs = new aws.SQS();

function addFeedUrlsToSQSParsingQueue(params = {}) {

  return new Promise((resolve, reject) => {
    purgeSQSFeedQueue(resolve, reject)
  })
    .then(() => {
      let {FeedUrl} = Models;

      let queryObj = {
        attributes: ['url'],
        where: {
          isAuthority: true
        }
      };

      return FeedUrl.findAll(queryObj)
        .then(feedUrls => {

          let urls = [];
          for (feedUrl of feedUrls) {
            urls.push(feedUrl.url);
          }

          // AWS SQS has a max of 10 messages per batch message. This code breaks
          // the feedUrls into chunks of 10, then calls the send batch message
          // operation once for each of those chunks of 10.
          let entryChunks = [];
          let tempChunk = [];

          for (let [index, feedUrl] of urls.entries()) {
            let entry = {
              Id: String(index),
              MessageBody: feedUrl
            }

            tempChunk.push(entry);

            if ((index + 1) % 10 === 0 || index === urls.length - 1) {
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
              }
            });
          }

        })
    })
    .catch((err) => {
      console.log(err);
    });

}

function parseNextFeedFromQueue () {

  return new Promise((resolve, reject) => {
    let params = {
      QueueUrl: queueUrl,
      MessageAttributeNames: ['All'],
      VisibilityTimeout: 300
    }

    sqs.receiveMessage(params, (err, data) => {

      console.log(err);

      if (err) {
        reject(err);
        return;
      }

      if (!data.Messages || data.Messages.length < 1) {
        console.log('no messages!');
        reject('No messages returned.');
        return;
      }

      let parseParams = {};
      let message = data.Messages[0];
      let receiptHandle = message.ReceiptHandle;

      let feedUrl = message.Body;

      resolve([feedUrl, parseParams, receiptHandle])
    });

  });
}

function deleteSQSMessage (receiptHandle) {
  if (receiptHandle) {
    let params = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle
    };

    sqs.deleteMessage(params, (err, data) => {
      if (err) {
        console.log(err);
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
      return;
    }

    resolve();
  });
}

module.exports = {
  addFeedUrlsToSQSParsingQueue,
  parseNextFeedFromQueue,
  deleteSQSMessage
}
