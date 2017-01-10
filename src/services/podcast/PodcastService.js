const
    sqlEngineFactory = require('../../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../../repositories/sequelize/models'),
    SequelizeService = require('feathers-sequelize').Service,
    errors = require('feathers-errors'),
    {postgresUri} = require('../../config');


class PodcastService extends SequelizeService {

  constructor () {
    const sqlEngine = new sqlEngineFactory({uri: postgresUri});
    const Models = modelFactory(sqlEngine);

    super({
      Model: Models.Podcast
    });
    this.Models = Models;
  }

  get (id, params={}) {
    const {Episode} = this.Models;

    if (typeof params.feedURL !== 'undefined' && params.feedURL.length > 0) {

      params.sequelize = {
        attributes: ['id', 'feedURL', 'title'],
        where: {
          feedURL: params.feedURL
        },
        include: [{
          model: Episode,
          attributes: ['id', 'title', 'mediaURL', 'pubDate']
        }]
      }

      return this.Model.findOne({
        where: {
          feedURL: params.feedURL,
        }
      }).then(podcast => {
        return podcast;
      });

    } else {
      // Retrieve podcast and its episode ids and titles only
      params.sequelize = {
        include: [{
          model: Episode,
          attributes: ['id', 'title', 'mediaURL', 'pubDate']
        }]
      }

      return super.get(id, params);
    }

  }

  find (params={}) {
    const {Episode} = this.Models;

    // Fuzzy match search for podcasts by title
    if (typeof params.query !== 'undefined' && typeof params.query.title !== 'undefined' && params.query.title.length > 0) {
      let title = params.query.title || '';
      params.sequelize = {
        attributes: ['id', 'feedURL', 'title'],
        where: ['title ILIKE ?', '%' + title + '%']
      }
    // Search for podcast by feedURL
    } else if (typeof params.query !== 'undefined' && typeof params.query.feedURL !== 'undefined' && params.query.feedURL.length > 0) {
      params.sequelize = {
        attributes: ['id', 'feedURL', 'title'],
        where: {
          feedURL: params.query.feedURL
        }
      }
    }

    return super.find(params);
  }

}

PodcastService.prototype.update = undefined;
PodcastService.prototype.remove = undefined;
PodcastService.prototype.patch = undefined;

module.exports = PodcastService;
