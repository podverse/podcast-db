const {readFileSync} = require('fs');

module.exports = {
  up: function (queryInterface, Sequelize) {

    queryInterface.addColumn(
      'podcasts',
      'lastEpisodeTitle',
      {
        type: Sequelize.TEXT
      }
    );

    queryInterface.addColumn(
      'podcasts',
      'totalAvailableEpisodes',
      {
        type: Sequelize.INTEGER
      }
    );

  },

  down: function (queryInterface) {
    return queryInterface.dropAllTables();
  }
};
