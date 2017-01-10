let config = {};
const isCi = require('is-ci');

if (process.env.NODE_ENV === 'test_db' && !isCi) {
  config.postgresUri = 'postgres://postgres:password@127.0.0.1:4443/postgres';
} else {
  config.postgresUri = 'postgres://postgres:password@127.0.0.1:5432/postgres';
}

module.exports = config;
