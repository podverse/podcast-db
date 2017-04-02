const {readFileSync} = require('fs');

module.exports = {
  up: function (queryInterface, Sequelize) {

    queryInterface.addColumn(
      'podcasts',
      'categories',
      {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      }
    );

  },

  down: function (queryInterface) {
    return queryInterface.dropAllTables();
  }
};
