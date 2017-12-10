var shortid = require('shortid');

'use strict';

module.exports = function(sequelize, DataTypes) {

  const feedUrl = sequelize.define('feedUrl', {

    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: function () {
        return shortid.generate();
      }
    },

    url: {
      type: DataTypes.TEXT,
      allowNull: false,
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
