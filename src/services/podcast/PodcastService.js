const
    sqlEngineFactory = require('../../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../../repositories/sequelize/models'),
    SequelizeService = require('feathers-sequelize').Service,
    errors = require('feathers-errors'),
    {postgresUri} = require('../../config');

const sqlEngine = new sqlEngineFactory({uri: postgresUri});
const Models = modelFactory(sqlEngine);

class PodcastService extends SequelizeService {

  constructor () {
    super({
      Model: Models.Podcast
    });
    this.Models = Models;
  }

  get (id, params={}) {
    const {Episode} = this.Models;

    if (typeof params.feedURL !== 'undefined' && params.feedURL.length > 0) {

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
          attributes: ['id', 'title', 'mediaURL', 'pubDate', 'summary', 'isPublic']
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
      return super.find(params);

    }
    // Search for podcast by feedURL
    else if (typeof params.query !== 'undefined' && typeof params.query.feedURL !== 'undefined' && params.query.feedURL.length > 0) {
      params.sequelize = {
        attributes: ['id', 'feedURL', 'title'],
        where: {
          feedURL: params.query.feedURL
        }
      }
      return super.find(params);
    }
    else {
      // TODO: how do we show a 404 not found page here when the user navs to /podcasts/?
      throw new errors.GeneralError('A parameter must be provided to the Podcast find service.');
    }
  }

  findOrCreatePodcast (podcast) {
    return this.Model.findOrCreate({
      where: {
        feedURL: podcast.xmlurl
      }
    })
    .then((podcastArray) => {
      podcast.id = podcastArray[0].id;

      return this.Model.upsert({
        feedURL: podcast.xmlurl,
        imageURL: podcast.image.url,
        summary: podcast.description,
        title: podcast.title,
        author: podcast.author,
        lastBuildDate: podcast.date,
        lastPubDate: podcast.pubdate,
        lastEpisodeTitle: podcast.lastEpisodeTitle,
        totalAvailableEpisodes: podcast.totalAvailableEpisodes
      })
      .then(() => {
        return podcast.id;
      });
    })
    .catch(err => {
      console.log(err);
      console.log(podcast.title);
      console.log(podcast.xmlurl);
    })
  }

  retrieveAllPodcasts () {
    return sqlEngine.query(`
      SELECT p.title, p."imageURL", p.id, p."lastEpisodeTitle", p."totalAvailableEpisodes", (
        SELECT MAX("pubDate") FROM episodes WHERE "podcastId"=p.id
      ) AS "lastEpisodePubDate"
      FROM podcasts p;
    `, { type: sqlEngine.QueryTypes.SELECT });
  }

}

PodcastService.prototype.update = undefined;
PodcastService.prototype.remove = undefined;
PodcastService.prototype.patch = undefined;

module.exports = PodcastService;
