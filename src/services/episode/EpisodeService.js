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

      return this.Model.findOne({
        where: {
          mediaURL: mediaURL,
        },
        include: [Podcast]
      }).then(episode => {
        return episode;
      });
    } else {
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
    } else if (params.includePodcastTitle) {
      params.sequelize.include = [{
        model: Podcast,
        attributes: ['title', 'imageURL']
      }]
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
        pubDate: episode.pubDate,
        isPublic: true
      })
    })
    .catch(err => {
      console.log(episode.title);
      console.log(episode.mediaURL);
      console.log(err);
    })
  }

  setAllEpisodesToNotPublic(podcastId) {
    return this.Model.update(
      { isPublic: false },
      { where: { podcastId: podcastId } }
    )
    .catch(err => {
      console.log(podcastId);
      console.log(err);
    })
  }

}

EpisodeService.prototype.update = undefined;
EpisodeService.prototype.remove = undefined;
EpisodeService.prototype.patch = undefined;

module.exports = EpisodeService;
