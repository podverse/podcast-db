sqlEngineFactory = require('./repositories/sequelize/engineFactory.js'),
modelFactory = require('./repositories/sequelize/models'),

const sqlEngine = new sqlEngineFactory({uri: 'postgres://postgres:password@127.0.0.1:5432/podverse'});
const Models = modelFactory(sqlEngine);
