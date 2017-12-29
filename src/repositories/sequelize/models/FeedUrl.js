var shortid = require('shortid');

'use strict';

module.exports = function(sequelize, DataTypes) {

  const feedUrl = sequelize.define('feedUrl', {

    url: {
      type: DataTypes.TEXT,
      primaryKey: true,
      validation: {
        isUrl: true
      }
    },

    isAuthority: DataTypes.BOOLEAN

  }, {
      updatedAt: 'lastUpdated',
      createdAt: 'dateCreated'
  });

  return feedUrl;

};
