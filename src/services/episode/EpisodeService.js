const
    sqlEngineFactory = require('../../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../../repositories/sequelize/models'),
    SequelizeService = require('feathers-sequelize').Service,
    errors = require('feathers-errors'),
    {postgresUri} = require('../../config');

const sqlEngine = new sqlEngineFactory({uri: postgresUri});
const Models = modelFactory(sqlEngine);

class EpisodeService extends SequelizeService {

  constructor () {
    super({
      Model: Models.Episode
    });
    this.Models = Models;
  }

  get (id, params={}) {
    const {Podcast} = this.Models;

    if (typeof params.mediaURL !== 'undefined' && params.mediaURL.length > 0) {
      let mediaURL = params.mediaURL;

      // Snowflake to handle decoding The Adam Carolla Podcast mediaURL format.
      // The 'ad_params=zones=' seems to cause everything after the second = sign
      // to be encoded. This snowflake might be needed for all castfire.com feeds.
      if (mediaURL.indexOf('ad_params=zones') > -1) {
        let firstPartOfUrl = mediaURL.substr(0, mediaURL.indexOf('ad_params=zones') + 10);
        let lastPartOfUrl = encodeURIComponent(mediaURL.substr(mediaURL.indexOf('ad_params=zones') + 10));
        mediaURL = firstPartOfUrl + lastPartOfUrl;
      }

      return this.Model.findOne({
        where: {
          mediaURL: mediaURL,
        },
        attributes: ['id']
      }).then(episode => {
        return episode;
      });
    } else {
      // Retrieve podcast and its episode ids and titles only
      params.sequelize = {
        include: [Podcast]
      }

      return super.get(id, params);
    }

  }

  find (params={}) {
    const {Podcast} = this.Models;

    // Find an Episode by mediaURL, and include its Podcast.
    if (typeof params.mediaURL !== 'undefined' && params.mediaURL.length > 0) {
      let mediaURL = params.mediaURL;
      params.sequelize = {
        where: {
          mediaURL: mediaURL
        },
        include: [Podcast]
      }
    }

    return super.find(params);
  }

  findOrCreateEpisode(episode, podcastId) {
    return this.Model.findOrCreate({
      where: {
        mediaURL: episode.mediaURL
      },
      defaults: Object.assign({}, episode, {
        podcastId: podcastId
      })
    })
    .then(() => {
      return this.Model.upsert({
        mediaURL: episode.mediaURL,
        imageURL: episode.imageURL,
        title: episode.title,
        summary: episode.summary,
        duration: episode.duration,
        link: episode.link,
        mediaBytes: episode.mediaBytes,
        mediaType: episode.mediaType,
        pubDate: episode.pubDate
      })
    })
    .catch(err => {
      console.log(err);
      console.log(episode.title);
      console.log(episode.mediaURL);
    })
  }

}

EpisodeService.prototype.update = undefined;
EpisodeService.prototype.remove = undefined;
EpisodeService.prototype.patch = undefined;

module.exports = EpisodeService;
