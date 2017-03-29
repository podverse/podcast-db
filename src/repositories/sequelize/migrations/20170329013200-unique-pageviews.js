const {readFileSync} = require('fs');

module.exports = {
  up: function (queryInterface, Sequelize) {

    queryInterface.addColumn(
      'episodes',
      'pastHourTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );


    queryInterface.addColumn(
      'episodes',
      'pastDayTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

    queryInterface.addColumn(
      'episodes',
      'pastWeekTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

    queryInterface.addColumn(
      'episodes',
      'pastMonthTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

    queryInterface.addColumn(
      'episodes',
      'pastYearTotalUniquePageviews',
      {
        type: Sequelize.INTEGER
      }
    );

    queryInterface.addColumn(
      'episodes',
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
