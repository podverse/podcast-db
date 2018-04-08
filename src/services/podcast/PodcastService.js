const
    sqlEngine = require('../../repositories/sequelize/engineInstance.js'),
    modelFactory = require('../../repositories/sequelize/models'),
    SequelizeService = require('feathers-sequelize').Service,
    errors = require('feathers-errors'),
    {postgresUri} = require('../../config'), 
    shortid = require('shortid');

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

    if (!params.excludeEpisodes) {
      params.sequelize = {
        include: [{
          model: Episode,
          attributes: ['id', 'title', 'mediaUrl', 'pubDate', 'summary', 'isPublic', 'duration']
        }]
      }
    }

    return super.get(id, params);

  }

  find (params={}) {
    const {FeedUrl} = this.Models;

    // Fuzzy match search for podcasts by title
    if (typeof params.query !== 'undefined' && typeof params.query.title !== 'undefined' && params.query.title.length > 0) {
      let title = params.query.title || '';
      params.sequelize = {
        attributes: ['id', 'title', 'categories', 'imageUrl', 'author', 'lastPubDate', 'lastEpisodeTitle'],
        where: ['title ILIKE ?', '%' + title + '%'],
        include: [{
          model: FeedUrl,
          attributes: ['url'],
          where: {
            isAuthority: true
          },
          required: false
        }]
      }
      return super.find(params);
    }
    else {
      // TODO: how do we show a 404 not found page here when the user navs to /podcasts/?
      throw new errors.GeneralError('A parameter must be provided to the Podcast find service.');
    }
  }

  findOrCreatePodcastFromParsing (parsedPodcast, podcastId) {
    
    let podcast = parsedPodcast;

    return this.Model.findOrCreate({
      where: {
        id: podcastId
      },
      default: {
        id: shortid.generate(),
        title: podcast.title
      }
    })
    .then((podcastArray) => {
      podcast.id = podcastArray[0].id;

      return this.Model.upsert({
        id: podcast.id,
        imageUrl: podcast.image.url,
        summary: podcast.description,
        title: podcast.title,
        author: podcast.author,
        lastBuildDate: podcast.date,
        lastPubDate: podcast.pubdate,
        lastEpisodeTitle: podcast.lastEpisodeTitle,
        totalAvailableEpisodes: podcast.totalAvailableEpisodes,
        categories: podcast.categories
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
      SELECT p.title, p."imageUrl", p.id, p."lastEpisodeTitle", p."totalAvailableEpisodes", (
        SELECT MAX("pubDate") FROM episodes WHERE "podcastId"=p.id
      ) AS "lastEpisodePubDate"
      FROM podcasts p;
    `, { type: sqlEngine.QueryTypes.SELECT });
  }

  findPodcastByFeedUrl(url) {
    const {FeedUrl} = this.Models;

    return FeedUrl.find({
      where: {
        url: url
      }
    })
    .then(feedUrl => {

      if (feedUrl && feedUrl.podcastId) {

        return this.get(feedUrl.podcastId)
        .then(podcast => {
          return podcast
        })

      } else {
        throw new errors.GeneralError('FeedUrl not found');
      }
    })
  }

}

PodcastService.prototype.update = undefined;
PodcastService.prototype.remove = undefined;
PodcastService.prototype.patch = undefined;

module.exports = PodcastService;
