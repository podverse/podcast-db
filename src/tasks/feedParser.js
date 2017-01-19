const
    FeedParser = require('feedparser'),
    request = require('request'),
    errors = require('feathers-errors'),
    sqlEngineFactory = require('../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../repositories/sequelize/models'),
    {deleteSQSMessage} = require('./sqsQueue'),
    {postgresUri} = require('../config');

let PodcastService = require('../services/podcast/PodcastService.js'),
    EpisodeService = require('../services/episode/EpisodeService.js');

PodcastService = new PodcastService();
EpisodeService = new EpisodeService();

const sqlEngine = new sqlEngineFactory({uri: postgresUri});
const Models = modelFactory(sqlEngine);

function parseFeedIfHasBeenUpdated (feedURL, params = {}) {

  return new Promise ((res, rej) => {

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
          // If the podcast's last pubDate or buildDate stored in the db is older than the
          // last buildDate or last pubDate in the feed's, then parse the full feed.
          // If the podcast doesn't exist, parse it.
          // If the podcast exists but doesn't have a pubDate or buildDate, parse it.
          if (!podcast || (podcast.lastBuildDate && parsedFeedObj.podcast.date > podcast.lastBuildDate) || (podcast.lastPubDate && parsedFeedObj.podcast.pubdate > podcast.lastPubDate) || (!podcast.lastBuildDate && !podcast.lastPubDate)) {
            parseFeed(feedURL, params)
              .then(fullParsedFeedObj => {
                saveParsedFeedToDatabase(fullParsedFeedObj, res, rej);
              })
              .catch(err => {
                console.log(parsedFeedObj.podcast.title);
                console.log(parsedFeedObj.podcast.xmlurl);
                rej(new errors.GeneralError(err));
              })
          } else {
            res();
          }
        });

    })
    .catch(err => {
      console.log(feedURL);
      rej(new errors.GeneralError(err));
    });

  });

}

function parseFeed (feedURL, params = {}) {

  return new Promise ((resolve, reject) => {

    const feedParser = new FeedParser([]),
          req = request(feedURL);

    req.on('response', function (response) {
      let stream = this;

      if (response.statusCode != 200) {
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

    req.on('error', function (e) {
      console.log(e);
      reject(e);
    });

    feedParser.on('end', done);

    function done () {
      if (!podcastObj.xmlurl) {
        podcastObj.xmlurl = feedURL;
      }

      parsedFeedObj.podcast = podcastObj;
      parsedFeedObj.episodes = episodeObjs;
      resolve(parsedFeedObj);
    }

  });

}

function saveParsedFeedToDatabase (parsedFeedObj, res, rej) {

  const {Episode, Podcast} = Models;

  let podcast = parsedFeedObj.podcast;
  let episodes = parsedFeedObj.episodes || [];

  // Reduce the episodes array to 2000 items, in case someone maliciously tries
  // to overload the database
  episodes = episodes.slice(0, 2000);

  return PodcastService.findOrCreatePodcast(podcast)
    .then(() => {

      return promiseChain = episodes.reduce((promise, ep) => {
        if (!ep.enclosures || !ep.enclosures[0] || !ep.enclosures[0].url) {
          return promise
        }
        return promise.then(() => {
          let prunedEpisode = pruneEpisode(ep);
          return EpisodeService.findOrCreateEpisode(prunedEpisode, podcast.id);
        })
        .catch(e => {
          console.log(ep.title);
          console.log(ep.enclosures[0].url);
          rej(new errors.GeneralError(e));
        });
      }, Promise.resolve());

    })
    .then(() => {
      res();
    })
    .catch((e) => {
      rej(new errors.GeneralError(e));
    })

}

function pruneEpisode(ep) {
  let prunedEpisode = {};

  if (ep.image && ep.image.url) { prunedEpisode.imageURL = ep.image.url }
  if (ep.title) { prunedEpisode.title = ep.title }
  if (ep.description) { prunedEpisode.summary = ep.description }
  if (ep.duration) { prunedEpisode.duration }
  if (ep.link) { prunedEpisode.link = ep.link }
  if (ep.enclosures && ep.enclosures[0]) {
    if (ep.enclosures[0].url) { prunedEpisode.mediaURL = ep.enclosures[0].url }
    if (ep.enclosures[0].length) { prunedEpisode.mediaBytes = ep.enclosures[0].length }
    if (ep.enclosures[0].type) { prunedEpisode.mediaType = ep.enclosures[0].type }
  }
  if (ep.pubDate) { prunedEpisode.pubDate = ep.pubdate }

  return prunedEpisode
}

module.exports = {
  parseFeed,
  parseFeedIfHasBeenUpdated,
  saveParsedFeedToDatabase
}
