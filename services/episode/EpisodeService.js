const
    sqlEngineFactory = require('../../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../../repositories/sequelize/models'),
    SequelizeService = require('feathers-sequelize').Service,
    errors = require('feathers-errors');

class EpisodeService extends SequelizeService {

  constructor () {
    // TODO: I DON'T THINK THIS SHOULD BE HARDCODED HERE...
    const sqlEngine = new sqlEngineFactory({uri: 'postgres://postgres:password@127.0.0.1:5432/podverse'});
    const Models = modelFactory(sqlEngine);

    super({
      Model: Models.Episode
    });
    this.Models = Models;
  }

  get (id, params={}) {
    const {Podcast} = this.Models;

    // Retrieve podcast and its episode ids and titles only
    params.sequelize = {
      include: [Podcast]
    }

    return super.get(id, params);
  }

}

EpisodeService.prototype.find = undefined;
EpisodeService.prototype.create = undefined;
EpisodeService.prototype.update = undefined;
EpisodeService.prototype.remove = undefined;
EpisodeService.prototype.patch = undefined;

module.exports = EpisodeService;
