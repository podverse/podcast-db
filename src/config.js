
const isCi = require('is-ci');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_DATABASE || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: process.env.DB_LOGGING || false
};

const queueUrl = process.env.AWS_QUEUE_URL;
const awsRegion = process.env.AWS_REGION;

module.exports = {
  dbConfig,
  queueUrl,
  awsRegion
}
