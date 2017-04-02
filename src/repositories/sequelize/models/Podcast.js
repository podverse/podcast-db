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

    feedURL: {
      type: DataTypes.TEXT,
      validate: {
        isUrl: true
      },
      unique: true
    },

    imageURL: {
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
    }

  }, {
      updatedAt: 'lastUpdated',
      createdAt: 'dateCreated'
  });

  return podcast;
};
