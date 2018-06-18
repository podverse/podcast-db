const
    SqlEngine = require('../src/repositories/sequelize/engineFactory'),
    registerModels = require('../src/repositories/sequelize/models'),
    {dbConfig} = require('../src/config');


function configureDatabaseModels (resolve) {

  beforeEach(function (done) {
    this._sqlEngine = new SqlEngine(dbConfig);
    const Models = registerModels(this._sqlEngine);

    this._sqlEngine.sync()
      .then(() => {
        resolve.apply(this, [Models]);
        done();
      });
  });

  afterEach(function (done) {
    this._sqlEngine.drop()
      .then(() => done());
  });
}

function createTestPodcastFeedUrlAndEpisode (Models) {

  const {Podcast, FeedUrl, Episode} = Models;

  return Podcast.findOrCreate({
    where: {
      'title': 'Most interesting podcast in the world'
    },
    default: {
      'title': 'Most interesting podcast in the world'
    }
  })
    .then(podcasts => {
      let podcast = podcasts[0];

      return Promise.all([
        podcasts,
        Episode.findOrCreate({
          where: {
            mediaUrl: 'http://example.com/test999'
          },
          default: {
            mediaUrl: 'http://example.com/test999',
            title: 'Best episode in the history of time',
            podcastId: podcast.id
          }
        }),
        FeedUrl.findOrCreate({
          where: {
            url: 'http://example.com/test333'
          },
          default: {
            url: 'http://example.com/test333',
            isAuthority: true,
            podcastId: podcast.id
          }
        })
      ])

    });

}

module.exports = {
  configureDatabaseModels,
  createTestPodcastFeedUrlAndEpisode
}
