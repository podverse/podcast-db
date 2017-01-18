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
      return this.Model.findOne({
        where: {
          mediaURL: params.mediaURL,
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

EpisodeService.prototype.create = undefined;
EpisodeService.prototype.update = undefined;
EpisodeService.prototype.remove = undefined;
EpisodeService.prototype.patch = undefined;

module.exports = EpisodeService;
