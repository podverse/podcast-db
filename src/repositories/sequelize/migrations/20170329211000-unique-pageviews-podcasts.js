const {readFileSync} = require('fs');

module.exports = {
  up: function (queryInterface, Sequelize) {

    queryInterface.addColumn(
      'podcasts',
      'pastHourTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

    queryInterface.addColumn(
      'podcasts',
      'pastDayTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

    queryInterface.addColumn(
      'podcasts',
      'pastWeekTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

    queryInterface.addColumn(
      'podcasts',
      'pastMonthTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

    queryInterface.addColumn(
      'podcasts',
      'pastYearTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

    queryInterface.addColumn(
      'podcasts',
      'allTimeTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

  },

  down: function (queryInterface) {
    return queryInterface.dropAllTables();
  }
};
