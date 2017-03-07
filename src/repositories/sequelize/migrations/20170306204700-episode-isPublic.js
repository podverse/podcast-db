const {readFileSync} = require('fs');

module.exports = {
  up: function (queryInterface, Sequelize) {

    queryInterface.addColumn(
      'episodes',
      'isPublic',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )

  },

  down: function (queryInterface) {
    return queryInterface.dropAllTables();
  }
};
