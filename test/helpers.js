const
    SqlEngine = require('../src/repositories/sequelize/engineFactory'),
    registerModels = require('../src/repositories/sequelize/models');


function configureDatabaseModels (resolve) {

  beforeEach(function (done) {
    // TODO: how can we test PostgreSQL instead of memory?
    this._sqlEngine = new SqlEngine({storagePath: ':memory:'});
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

function createTestPodcastAndEpisode (Models) {

  const {Podcast, Episode} = Models;

  return Podcast.findOrCreate({
    where: {
      'feedURL': 'http://example.com/test333'
    },
    defaults: {
      'feedURL': 'http://example.com/test333',
      'title': 'Most interesting podcast in the world'
    }
  })
    .then(podcasts => {

      return Promise.all([
        Promise.resolve(podcasts),
        Episode.findOrCreate({
          where: {
            mediaURL: 'http://example.com/test999'
          },
          defaults: Object.assign({}, {}, {
            feedURL: 'http://example.com/test999',
            title: 'Best episode in the history of time',
            podcastId: podcasts[0].id
          })
        })
      ]);
    });
}

module.exports = {
  configureDatabaseModels,
  createTestPodcastAndEpisode
}
