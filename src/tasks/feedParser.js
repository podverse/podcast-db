const
    FeedParser = require('feedparser'),
    present = require('present'),
    {logTime} = require('../helpers.js'),
    request = require('request'),
    errors = require('feathers-errors'),
    sqlEngineFactory = require('../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../repositories/sequelize/models'),
    {deleteSQSMessage} = require('./sqsQueue'),
    {postgresUri} = require('../config'),
    {podcastOverride} = require('../custom-overrides/podcastOverride'),
    _ = require('lodash');

let PodcastService = require('../services/podcast/PodcastService.js'),
    EpisodeService = require('../services/episode/EpisodeService.js'),
    FeedUrlService = require('../services/feedUrl/FeedUrlService.js');

PodcastService = new PodcastService();
EpisodeService = new EpisodeService();
FeedUrlService = new FeedUrlService();

const sqlEngine = new sqlEngineFactory({uri: postgresUri});
const Models = modelFactory(sqlEngine);

function parseFeed (feedUrl, params = {}) {

  return new Promise ((resolve, reject) => {

    let time = present();

    time = logTime('In parseFeed', time);

    let jsonString = '',
    parsedEpisodes = [],
    parsedPodcast = {};

    var options = {
      headers: {'user-agent': 'node.js'}
    }

    const feedParser = new FeedParser([]),
          req = request(feedUrl, options);

    req.on('response', function (response) {
      time = logTime('In parseFeed on request response', time);

      let stream = this;

      if (response.statusCode != 200) {
        console.log('feedUrl with failing status code ', feedUrl)
        return this.emit('error', new errors.GeneralError('Bad status code'));
      }

      stream.pipe(feedParser);
    });

    feedParser.on('meta', function (meta) {
      time = logTime('In parseFeed feedParser on meta', time);

      if (!meta) {
        stream.emit('error');
      }

      parsedPodcast = meta;
    });

    feedParser.on('readable', function () {
      let stream = this,
          item;

      while (item = stream.read()) {
        parsedEpisodes.push(item);

        if (parsedEpisodes.length >= 10000) {
          stream.emit('end');
        }
      }

    });

    req.on('error', function (e) {
      time = logTime('In parseFeed req on error', time);

      console.log('feedUrl', feedUrl);
      console.log(e);
      reject(e);
    });

    feedParser.on('error', function (e) {
      time = logTime('In parseFeed feedParser on error', time);
      console.log(e);
      reject(e);
    });

    feedParser.on('end', function () {
      time = logTime('In parseFeed feedParser on end', time);
      done();
    });

    function done () {

      // TODO: Don't assume that the most recent episode is in the 0 position of
      // the array. Instead find the title based on episode with the most recent
      // pubDate.
      if (parsedEpisodes.length > 0) {
        parsedPodcast.lastEpisodeTitle = parsedEpisodes[0].title;
      }

      parsedPodcast.totalAvailableEpisodes = parsedEpisodes.length;

      saveParsedFeedToDatabase(parsedPodcast, parsedEpisodes, feedUrl, resolve, reject);

    }

  });

}

// TODO: if a feedUrl does not already have a podcast associated with it AND
//       it has isAuthority == true...
function saveParsedFeedToDatabase (parsedPodcast, parsedEpisodes, feedUrl, resolve, reject) {

  let time = present();

  time = logTime('In saveParsedFeedToDatabase', time);

  const {Episode, Podcast} = Models;

  // Reduce the episodes array to 10000 items, in case someone maliciously tries
  // to overload the database
  parsedEpisodes = parsedEpisodes.slice(0, 10000);

  // Override fields as needed for specific podcasts
  parsedPodcast = podcastOverride(parsedPodcast);

  return PodcastService.findOrCreatePodcastFromParsing(parsedPodcast)
    .then(podcastId => {

      time = logTime('In PodcastService.findOrCreatePodcastFromParsing then', time);

      return FeedUrlService.findOrCreateFeedUrl(feedUrl, podcastId, true)
        .then(() => {

          time = logTime('In FeedUrlService.findOrCreateFeedUrl then', time);

          return EpisodeService.setAllEpisodesToNotPublic(podcastId)
            .then(() => {

              time = logTime('In EpisodeService.setAllEpisodesToNotPublic then', time);

              return promiseChain = parsedEpisodes.reduce((promise, ep) => {
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
                  return EpisodeService.findOrCreateEpisode(prunedEpisode, podcastId);
                })
                .catch(e => {
                  console.log('create episode failed');
                  console.log('ep.title', ep.title);
                  console.log('ep.enclosures[0].url', ep.enclosures[0].url);
                  reject(new errors.GeneralError(e));
                });
              }, Promise.resolve());
            });
        })

    })
    .then(() => {
      time = logTime('Parsed successfully', time);
      console.log(parsedPodcast.title);
      console.log(feedUrl);
      resolve();
    })
    .catch((e) => {
      time = logTime('In saveParsedFeedToDatabase catch', time);
      reject(new errors.GeneralError(e));
    })

}

function pruneEpisode(ep) {
  let prunedEpisode = {};

  if (ep.image && ep.image.url) { prunedEpisode.imageUrl = ep.image.url }
  if (ep.title) { prunedEpisode.title = ep.title }
  if (ep.description) { prunedEpisode.summary = ep.description }
  if (ep.duration) { prunedEpisode.duration }
  if (ep.link) { prunedEpisode.link = ep.link }
  if (ep.enclosures && ep.enclosures[0]) {
    if (ep.enclosures[0].url) { prunedEpisode.mediaUrl = ep.enclosures[0].url }
    if (ep.enclosures[0].length) { prunedEpisode.mediaBytes = ep.enclosures[0].length }
    if (ep.enclosures[0].type) { prunedEpisode.mediaType = ep.enclosures[0].type }
  }
  if (ep.pubDate) { prunedEpisode.pubDate = ep.pubdate }

  return prunedEpisode
}

module.exports = {
  parseFeed,
  saveParsedFeedToDatabase
}
