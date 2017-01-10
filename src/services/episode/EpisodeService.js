const
    sqlEngineFactory = require('../../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../../repositories/sequelize/models'),
    SequelizeService = require('feathers-sequelize').Service,
    errors = require('feathers-errors'),
    {postgresUri} = require('../../config');

class EpisodeService extends SequelizeService {

  constructor () {
    const sqlEngine = new sqlEngineFactory({uri: postgresUri});
    const Models = modelFactory(sqlEngine);

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

}

EpisodeService.prototype.create = undefined;
EpisodeService.prototype.update = undefined;
EpisodeService.prototype.remove = undefined;
EpisodeService.prototype.patch = undefined;

module.exports = EpisodeService;
