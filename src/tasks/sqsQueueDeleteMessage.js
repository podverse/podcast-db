const
  aws = require('aws-sdk'),
  {queueUrl} = require('../config');

aws.config.update({region:'us-west-2'});
const sqs = new aws.SQS();

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

module.exports = {
  deleteSQSMessage
}
