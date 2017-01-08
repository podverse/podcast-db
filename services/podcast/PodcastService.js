const
    sqlEngineFactory = require('../../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../../repositories/sequelize/models'),
    SequelizeService = require('feathers-sequelize').Service,
    {locator} = require('locator.js'),
    errors = require('feathers-errors');


class PodcastService extends SequelizeService {

  constructor () {
    // TODO: I DON'T THINK THIS SHOULD BE HARDCODED HERE...
    const sqlEngine = new sqlEngineFactory({uri: 'postgres://postgres:password@127.0.0.1:5432/podverse'});
    const Models = modelFactory(sqlEngine);

    super({
      Model: Models.Podcast
    });
    this.Models = Models;
  }

  get (id, params={}) {
    const {Episode} = this.Models;

    // Retrieve podcast and its episode ids and titles only
    params.sequelize = {
      include: [{
        model: Episode,
        attributes: ['id', 'title', 'mediaURL', 'pubDate']
      }]
    }

    return super.get(id, params);
  }

  find (params={}) {
    const {Episode} = this.Models;

    // Fuzzy match search for podcasts by title
    if (typeof params.query !== 'undefined' && typeof params.query.title !== 'undefined' && params.query.title.length > 0) {
      params.sequelize = {
        attributes: ['id', 'feedURL', 'title'],
        where: {
          title: {
            $like: '%' + params.query.title + '%'
          }
        }
      }
    // Search for podcast by feedURL
    } else if (typeof params.query !== 'undefined' && typeof params.query.feedURL !== 'undefined' && params.query.feedURL.length > 0) {
      params.sequelize = {
        attributes: ['id', 'feedURL', 'title'],
        where: {
          feedURL: params.query.feedURL
        }
      }
    } else {
      throw new errors.GeneralError(`You must provide a search query.`)
    }

    return super.find(params);
  }

}

PodcastService.prototype.update = undefined;
PodcastService.prototype.remove = undefined;
PodcastService.prototype.patch = undefined;

module.exports = PodcastService;
