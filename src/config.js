let config = {};
const isCi = require('is-ci');

if (process.env.NODE_ENV === 'test_db' && !isCi) {
  config.postgresUri = 'postgres://postgres:password@127.0.0.1:4443/postgres';
} else if (isCi) {
  config.posgresUri = 'postgres://postgres:password@127.0.0.1:5432/postgres';
} else {
  config.postgresUri = process.env.postgresUri || 'postgres://postgres:password@127.0.0.1:5432/postgres';
}

config.queueUrl = process.env.queueUrl || '';

module.exports = config;
