var shortid = require('shortid');

'use strict';

module.exports = function(sequelize, DataTypes) {

  const podcast = sequelize.define('podcast', {

    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: function () {
        return shortid.generate();
      }
    },

    imageUrl: {
      type: DataTypes.TEXT,
      validate: {
        isUrl: true
      }
    },

    summary: DataTypes.TEXT,

    title: DataTypes.TEXT,

    author: DataTypes.TEXT,

    lastBuildDate: DataTypes.DATE,

    lastPubDate: DataTypes.DATE,

    lastEpisodeTitle: DataTypes.TEXT,

    totalAvailableEpisodes: DataTypes.INTEGER,

    categories: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },

    pastHourTotalUniquePageviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    pastDayTotalUniquePageviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    pastWeekTotalUniquePageviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    pastMonthTotalUniquePageviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    pastYearTotalUniquePageviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    allTimeTotalUniquePageviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }

  }, {
      updatedAt: 'lastUpdated',
      createdAt: 'dateCreated'
  });

  return podcast;
};
