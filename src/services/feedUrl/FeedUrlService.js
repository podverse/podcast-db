const
    sqlEngine = require('../../repositories/sequelize/engineInstance.js'),
    modelFactory = require('../../repositories/sequelize/models'),
    SequelizeService = require('feathers-sequelize').Service,
    errors = require('feathers-errors');

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
        defaults: Object.assign({
          podcastId: podcastId
        }, feedUrl)
      })
      .then(() => {
        return this.Model.upsert({
          isAuthority: isAuthority,
          url: feedUrl,
          podcastId: podcastId
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
    });

  }

  findRelatedFeedUrlsByPodcastIds(podcastIds) {
    const query = {
      sequelize: {
        where: {
          podcastId: podcastIds
        }
      }
    };

    return this.find(query)
    .then(relatedUrls => {
      let relatedFeedUrls = [];

      for (let relatedUrl of relatedUrls) {
        relatedFeedUrls.push(relatedUrl.url);
      }

      return relatedFeedUrls;
    });
  }

  findAllRelatedFeedUrls(podcastIds, urls) {

    if ((!podcastIds && podcastIds.length < 1) && (!urls || (urls && urls.length < 1))) {

      return new Promise((resolve, reject) => {
        resolve([]);
      });

    } else {

      if (podcastIds.length > 0) {
        return this.findRelatedFeedUrlsByPodcastIds(podcastIds)
          .then(relatedFeedUrls => {
            return relatedFeedUrls;
          })
          .catch(e => {
            console.log('podcastIds', podcastIds);
            console.log('urls', urls);
            console.log(e);
          });
      } else {
        const query = {
          sequelize: {
            where: {
              url: urls
            }
          }
        };

        return this.find(query)
          .then(feedUrls => {
            if (feedUrls && feedUrls.length > 0) {

              let podcastIds = new Set();

              for (let feedUrl of feedUrls) {
                podcastIds.add(feedUrl.podcastId);
              }

              let podcastIdsArray = Array.from(podcastIds);

              return this.findRelatedFeedUrlsByPodcastIds(podcastIdsArray)
                .then(relatedFeedUrls => {
                  return relatedFeedUrls;
                });
            }
          })
          .catch(e => {
            console.log('podcastIds', podcastIds);
            console.log('urls', urls);
            console.log(e);
          });
      }

    }

  }

}

FeedUrlService.prototype.update = undefined;
FeedUrlService.prototype.remove = undefined;
FeedUrlService.prototype.patch = undefined;

module.exports = FeedUrlService;
