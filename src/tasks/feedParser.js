const
    FeedParser = require('feedparser'),
    request = require('request'),
    errors = require('feathers-errors'),
    sqlEngineFactory = require('../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../repositories/sequelize/models'),
    {deleteSQSMessage} = require('./sqsQueue'),
    {postgresUri} = require('../config'),
    {podcastOverride} = require('../custom-overrides/podcastOverride'),
    _ = require('lodash');

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
          parseFeed(feedURL, params)
            .then(fullParsedFeedObj => {
              saveParsedFeedToDatabase(fullParsedFeedObj, res, rej);
            })
            .catch(err => {
              console.log(parsedFeedObj.podcast.title);
              console.log(feedURL);
              rej(new errors.GeneralError(err));
            })
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

    var options = {
      method: 'GET',
      headers: {'user-agent': 'node.js'}
    }

    const feedParser = new FeedParser([]),
          req = request(feedURL, options);

    req.on('response', function (response) {
      let stream = this;

      if (response.statusCode != 200) {
        console.log('feedURL with failing status code ', feedURL)
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

          if (episodeObjs.length >= 10000) {
            stream.emit('end');
          }
        }

      });
    }

    req.on('error', function (e) {
      console.log('feedURL', feedURL);
      console.log(e);
      reject(e);
    });

    feedParser.on('end', done);

    function done () {

      // Always use the feedURL we provide. We use feedURLs as the (flawed) unique id
      // of podcasts, so we want to avoid changing the feedURL of a podcast
      // unless we explicitly tell it to.
      podcastObj.xmlurl = feedURL;

      // TODO: Don't assume that the most recent episode is in the 0 position of
      // the array. Instead find the title based on episode with the most recent
      // pubDate.
      if (episodeObjs.length > 0) {
        podcastObj.lastEpisodeTitle = episodeObjs[0].title;
      }

      podcastObj.totalAvailableEpisodes = episodeObjs.length;

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

  // Reduce the episodes array to 10000 items, in case someone maliciously tries
  // to overload the database
  episodes = episodes.slice(0, 10000);

  // Override fields as needed for specific podcasts
  podcast = podcastOverride(podcast);

  return PodcastService.findOrCreatePodcast(podcast)
    .then(podcastId => {

      return EpisodeService.setAllEpisodesToNotPublic(podcastId)
        .then(() => {

          return promiseChain = episodes.reduce((promise, ep) => {
            if (!ep.enclosures || !ep.enclosures[0] || !ep.enclosures[0].url) {
              return promise
            }

            // NOTE: in rare cases a podcast feed may have multiple enclosures. The
            // check below looks for the first enclosure with a type that contains
            // the string 'audio', then uses that. Else do not save the episode.
            // Example: History on Fire (http://feeds.podtrac.com/xUnmFXZLuavF)
            if (ep.enclosures.length > 1) {
              let audioEnclosure = _.find(ep.enclosures, function (enclosure) {
                if (enclosure.type && (enclosure.type.indexOf('audio') > -1)) {
                  return enclosure
                }
              });
              ep.enclosures = [];
              ep.enclosures.push(audioEnclosure);
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
        });
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
