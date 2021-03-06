var shortid = require('shortid');

'use strict';

module.exports = function(sequelize, DataTypes) {

  // You could call this a clip or you could call it an episode.
  // Podverse assumes if startTime && endTime are null, then it
  // is referencing the entire episode.

  const episode = sequelize.define('episode', {

    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: function () {
        return shortid.generate();
      }
    },

    mediaUrl: {
      type: DataTypes.TEXT,
      validation: {
        isUrl: true
      },
      unique: true
    },

    imageUrl: {
      type: DataTypes.TEXT,
      validate: {
        isUrl: true
      }
    },

    title: DataTypes.TEXT,

    summary: DataTypes.TEXT,

    duration: DataTypes.INTEGER,

    link: { // provided by the <link> field in podcast RSS feeds for episodes
      type: DataTypes.TEXT,
      validation: {
        isUrl: true
      }
    },

    mediaBytes: DataTypes.INTEGER, // TODO: do we need to ensure this is a positive integer?

    mediaType: DataTypes.TEXT,

    pubDate: DataTypes.DATE,

    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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

  return episode;
};
