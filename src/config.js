let config = {};

if (process.env.NODE_ENV === 'test_db') {
  config.postgresUri = 'postgres://postgres:password@127.0.0.1:4443/postgres';
} else {
  config.postgresUri = 'postgres://postgres:password@127.0.0.1:5432/podverse';
}

module.exports = config;
