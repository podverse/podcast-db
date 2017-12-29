const
    sqlEngineFactory = require('../../repositories/sequelize/engineFactory.js'),
    modelFactory = require('../../repositories/sequelize/models'),
    SequelizeService = require('feathers-sequelize').Service,
    errors = require('feathers-errors'),
    {postgresUri} = require('../../config');

const sqlEngine = new sqlEngineFactory({uri: postgresUri});
const Models = modelFactory(sqlEngine);

class FeedUrlService extends SequelizeService {

  constructor () {
    super({
      Model: Models.FeedUrl
    });
    this.Models = Models;
  }

  findOrCreateFeedUrl(feedUrl, podcastId, isAuthority) {

    return this.setFeedUrlsToIsAuthorityFalse(feedUrl, podcastId)
    .then(() => {

      return this.Model.findOrCreate({
        where: {
          url: feedUrl
        },
        defaults: Object.assign({}, feedUrl, {
          podcastId: podcastId
        })
      })
      .then(() => {
        return this.Model.upsert({
          isAuthority: isAuthority,
          url: feedUrl
        })
      })

    })
    .catch(err => {
      console.log(feedUrl);
      console.log(podcastId);
      console.log(isAuthority);
      console.log(err);
    })
  }

  setFeedUrlsToIsAuthorityFalse(feedUrl, podcastId) {
    return this.Model.update(
      { isAuthority: false },
      {
        where: {
          podcastId: podcastId,
          $and: {
            $not: {
              url: feedUrl
            }
          }
        }
      }
    )
    .catch(err => {
      console.log(podcastId);
      console.log(feedUrl);
      console.log(err);
    })
  }

  findPodcastAuthorityFeedUrl(podcastId) {

    return this.find({
      sequelize: {
        where: {
          podcastId: podcastId,
          isAuthority: true
        }
      }
    })
    .then(feedUrls => {
      if (feedUrls && feedUrls.length > 0) {
        return feedUrls[0].url;
      } else {
        throw new errors.GeneralError('FeedUrl not found');
      }
    })
    .catch(e => {
      console.log(podcastId);
      console.log(e);
    })
  }

}

FeedUrlService.prototype.update = undefined;
FeedUrlService.prototype.remove = undefined;
FeedUrlService.prototype.patch = undefined;

module.exports = FeedUrlService;
