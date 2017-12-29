const importModels = require('sequelize-import');

module.exports = function (sequelizeEngine) {

  // Load all the models
  const models = importModels(__dirname, sequelizeEngine, {
    exclude: ['index.js']
  });

  // Now relate them
  // ---------------

  const {Podcast, Episode, FeedUrl} = models;

  Podcast.hasMany(Episode);

  Episode.belongsTo(Podcast, {
    foreignKey: { allowNull: false }
  });

  Podcast.hasMany(FeedUrl);

  FeedUrl.belongsTo(Podcast, {
    foreignKey: { allowNull: false }
  });

  return models;
};
