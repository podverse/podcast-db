let config = {};
const isCi = require('is-ci');

config.postgresUri = process.env.postgresUri || 'postgres://postgres:password@127.0.0.1:5432/postgres';

config.queueUrl = process.env.queueUrl || '';

module.exports = config;
