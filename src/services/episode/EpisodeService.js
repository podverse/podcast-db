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

    if (typeof params.mediaUrl !== 'undefined' && params.mediaUrl.length > 0) {

      let mediaUrl = params.mediaUrl;

      return this.Model.findOne({
        where: {
          mediaUrl: mediaUrl,
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

    // Find an Episode by mediaUrl, and include its Podcast.
    if (typeof params.mediaUrl !== 'undefined' && params.mediaUrl.length > 0) {
      let mediaUrl = params.mediaUrl;
      params.sequelize = {
        where: {
          mediaUrl: mediaUrl
        },
        include: [Podcast]
      }
    } else if (params.includePodcastTitle) {
      params.sequelize.include = [{
        model: Podcast,
        attributes: ['title', 'imageUrl']
      }]
    }

    return super.find(params);
  }

  findOrCreateEpisode(episode, podcastId) {
    return this.Model.findOrCreate({
      where: {
        mediaUrl: episode.mediaUrl
      },
      defaults: Object.assign({}, episode, {
        podcastId: podcastId
      })
    })
    .then(() => {
      return this.Model.upsert({
        podcastId: podcastId,
        mediaUrl: episode.mediaUrl,
        imageUrl: episode.imageUrl,
        title: episode.title,
        summary: episode.summary,
        duration: episode.duration,
        link: episode.link,
        mediaBytes: episode.mediaBytes,
        mediaType: episode.mediaType,
        pubDate: episode.pubDate,
        isPublic: true,
      })
    })
    .catch(err => {
      console.log(episode.title);
      console.log(episode.mediaUrl);
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

  validateMediaUrl(mediaUrl, feedUrl) {
    let PodcastService = require('../podcast/PodcastService');
    PodcastService = new PodcastService();

    return PodcastService.findPodcastByFeedUrl(feedUrl)
      .then(podcast => {

        return this.find({
          sequelize: {
            where: {
              podcastId: podcast.id,
              mediaUrl: mediaUrl
            }
          }
        })
          .then(episodes => {

            if (episodes && episodes.length > 0) {
              return true;
            } else {
              return false;
            }
          })

      })
      .catch(e => {
        console.log('Error: Invalid media URL');
        console.log(mediaUrl);
        console.log(feedUrl);
        return false;
      });

  }

}

EpisodeService.prototype.update = undefined;
EpisodeService.prototype.remove = undefined;
EpisodeService.prototype.patch = undefined;

module.exports = EpisodeService;
