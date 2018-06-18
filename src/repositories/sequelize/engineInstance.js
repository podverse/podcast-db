const sqlEngineFactory = require('./engineFactory'),
      {dbConfig} = require('../../config');

const sqlEngine = new sqlEngineFactory(dbConfig);

module.exports = sqlEngine;
