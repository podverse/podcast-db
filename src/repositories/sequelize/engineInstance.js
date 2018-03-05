const sqlEngineFactory = require('./engineFactory'),
      {postgresUri} = require('../../config');

const sqlEngine = new sqlEngineFactory({uri: postgresUri});

module.exports = sqlEngine;
