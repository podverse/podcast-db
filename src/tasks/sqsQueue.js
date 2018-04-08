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
      let {FeedUrl, Podcast} = Models;

      let queryObj = {
        attributes: ['url'],
        include: Podcast,
        where: {
          isAuthority: true
        }
      };

      return FeedUrl.findAll(queryObj)
        .then(feedUrls => {

          let attributes = [];

          for (feedUrl of feedUrls) {
            let attribute = {
              "feedUrl": {
                DataType: "String",
                StringValue: feedUrl.url
              },
              "podcastId": {
                DataType: "String",
                StringValue: feedUrl.podcast.id
              }
            }

            attributes.push(attribute);
          }

          // AWS SQS has a max of 10 messages per batch message. This code breaks
          // the feedUrls into chunks of 10, then calls the send batch message
          // operation once for each of those chunks of 10.
          let entryChunks = [];
          let tempChunk = [];

          for (let [index, attr] of attributes.entries()) {
            let entry = {
              Id: String(index),
              MessageAttributes: attr,
              MessageBody: 'required message body – podverse rules'
            }

            tempChunk.push(entry);

            if ((index + 1) % 10 === 0 || index === attributes.length - 1) {
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

      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      if (!data.Messages || data.Messages.length < 1) {
        console.log('no messages!');
        reject('No messages returned.');
        return;
      }

      let message = data.Messages[0];
      let receiptHandle = message.ReceiptHandle;

      let attributes = message.MessageAttributes;
      let feedUrl = attributes.feedUrl.StringValue;
      let podcastId = attributes.podcastId.StringValue;

      resolve([feedUrl, podcastId, receiptHandle])
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
