const
    FeedParser = require('feedparser'),
    request = require('request'),
    errors = require('feathers-errors'),
    sqlEngineFactory = require('../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../repositories/sequelize/models'),
    {postgresUri, queueUrl} = require('../config'),
    aws = require('aws-sdk');


const sqlEngine = new sqlEngineFactory({uri: postgresUri});
const Models = modelFactory(sqlEngine);

aws.config.update({region:'us-west-2'});
const sqs = new aws.SQS();

function addFeedUrlsToSQSParsingQueue (params = {}) {

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

function purgeSQSFeedQueue () {
  let params = {
    QueueUrl: queueUrl
  };

  sqs.purgeQueue(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
}

// If the podcast's last pubDate or buildDate stored in the db is older than the lastBuildDate
// in the feed, then parse the full feed. If the podcast doesn't exist, parse it.
// If the podcast exists but doesn't have a pubDate or buildDate, parse it.
function parseFeedIfHasBeenUpdated (feedURL, params = {}) {
  let {Podcast} = Models;

  return Podcast.findOne({
    where: {
      feedURL: feedURL
    },
    attributes: ['lastBuildDate', 'lastPubDate']
  })
  .then(podcast => {
    parseFeed(feedURL) // Without params, parseFeed will return podcast info but will not parse episodes
      .then(parsedFeedObj => {
        if (!podcast || (podcast.lastBuildDate && parsedFeedObj.podcast.date > podcast.lastBuildDate) || (podcast.lastPubDate && parsedFeedObj.podcast.pubdate > podcast.lastPubDate) || (!podcast.lastBuildDate && !podcast.lastPubDate)) {
          parseFeed(feedURL, params)
            .then(fullParsedFeedObj => {
              saveParsedFeedToDatabase(fullParsedFeedObj, params);
            })
            .catch(err => {
              throw new errors.GeneralError(err);
            })
        } else {
          deleteSQSMessage(params);
        }
      });

  })

}

function parseFeed (feedURL, params = {}) {

  return new Promise ((res, rej) => {

    const feedParser = new FeedParser([]),
          req = request(feedURL);

    req.on('error', function (e) {
      console.log(e);
      rej(e);
    });

    req.on('response', function (res) {
      let stream = this;

      if (res.statusCode != 200) {
        return this.emit('error', new errors.GeneralError('Bad status code'));
      }

      stream.pipe(feedParser);
    });

    let jsonString = '',
        episodeObjs = [],
        podcastObj = {},
        parsedFeedObj = {};

    feedParser.on('meta', function (meta) {
      podcastObj = meta;

      if (!params.shouldParseRecentEpisodes && !params.shouldParseMaxEpisodes) {
        done();
      }

    });

    if (params.shouldParseRecentEpisodes) {
      feedParser.on('readable', function () {
        let stream = this,
            item;

        while (item = stream.read()) {
          episodeObjs.push(item);

          if (episodeObjs.length >= 10) {
            stream.emit('end');
          }
        }

      });
    } else if (params.shouldParseMaxEpisodes) {
      feedParser.on('readable', function () {
        let stream = this,
            item;

        while (item = stream.read()) {
          episodeObjs.push(item);

          if (episodeObjs.length >= 1000) {
            stream.emit('end');
          }
        }

      });
    }

    feedParser.on('error', done);
    feedParser.on('end', done);

    function done (e) {
      if (e) {
        console.log(e);
        rej(e);
      }

      if (!podcastObj.xmlurl) {
        podcastObj.xmlurl = feedURL;
      }

      parsedFeedObj.podcast = podcastObj;
      parsedFeedObj.episodes = episodeObjs;
      res(parsedFeedObj);
    }

  });

}

function saveParsedFeedToDatabase (parsedFeedObj, params = {}) {
  const {Episode, Podcast} = Models;

  let podcast = parsedFeedObj.podcast;
  let episodes = parsedFeedObj.episodes || [];

  // Reduce the episodes array to 2000 items, in case someone maliciously tries
  // to overload the database
  episodes = episodes.slice(0, 2000);

  return Podcast.findOrCreate({
    where: {
      feedURL: podcast.xmlurl
    }
  })
  .then((podcastArray) => {
    podcast.id = podcastArray[0].id;

    return Podcast.upsert({
      feedURL: podcast.xmlurl,
      imageURL: podcast.image.url, // node-feedparser supports image, itunes:image media:image, etc.,
      summary: podcast.description,
      title: podcast.title,
      author: podcast.author,
      lastBuildDate: podcast.date,
      lastPubDate: podcast.pubdate
    });
  })
  .then(() => {

    return promiseChain = episodes.reduce((promise, ep) => {

      if (!ep.enclosures || !ep.enclosures[0] || !ep.enclosures[0].url) {
        return promise
      }

      return promise.then(() => {
        return Episode.findOrCreate({
          where: {
            mediaURL: ep.enclosures[0].url
          },
          defaults: Object.assign({}, pruneEpisode(ep), {
            podcastId: podcast.id
          })
        })
        .then(() => {
          let prunedEpisode = pruneEpisode(ep);
          return Episode.upsert({
            mediaURL: ep.enclosures[0].url,
            imageURL: prunedEpisode.imageURL,
            title: prunedEpisode.title,
            summary: prunedEpisode.summary,
            duration: prunedEpisode.duration,
            link: prunedEpisode.link,
            mediaBytes: prunedEpisode.mediaBytes,
            mediaType: prunedEpisode.mediaType,
            pubDate: prunedEpisode.pubDate
          })
        })
      })
      .catch(e => {
        throw new errors.GeneralError(e);
      });
    }, Promise.resolve());

  })
  .catch((e) => {
    throw new errors.GeneralError(e);
  })
  .finally(() => {
    deleteSQSMessage(params)
  });

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

function pruneEpisode(ep) {
  let prunedEpisode = {};

  if (ep.image && ep.image.url) { prunedEpisode.imageURL = ep.image.url }
  if (ep.title) { prunedEpisode.title = ep.title }
  if (ep.description) { prunedEpisode.summary = ep.description }
  if (ep.duration) { prunedEpisode.duration }
  if (ep.link) { prunedEpisode.link = ep.link }
  if (ep.enclosures && ep.enclosures[0]) {
    if (ep.enclosures[0].length) { prunedEpisode.mediaBytes = ep.enclosures[0].length }
    if (ep.enclosures[0].type) { prunedEpisode.mediaType = ep.enclosures[0].type }
  }
  if (ep.pubDate) { prunedEpisode.pubDate = ep.pubdate }

  return prunedEpisode
}

module.exports = {
  addFeedUrlsToSQSParsingQueue,
  parseNextFeedFromQueue,
  purgeSQSFeedQueue,
  parseFeed,
  parseFeedIfHasBeenUpdated,
  saveParsedFeedToDatabase
}
