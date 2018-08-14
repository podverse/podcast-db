const importModels = require('sequelize-import');

module.exports = function (sequelizeEngine) {

  // Load all the models
  const models = importModels(__dirname, sequelizeEngine, {
    exclude: ['index.js']
  });

  // Now relate them
  // ---------------

  const { Podcast, Episode, FeedUrl } = models;

  Podcast.hasMany(Episode, { foreignKeyConstraint: true });

  Episode.belongsTo(Podcast, {
    foreignKey: { allowNull: false },
    foreignKeyConstraint: true
  });

  Podcast.hasMany(FeedUrl, { foreignKeyConstraint: true });

  FeedUrl.belongsTo(Podcast, {
    foreignKey: { allowNull: false },
    foreignKeyConstraint: true
  });

  return models;
};
