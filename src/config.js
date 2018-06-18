
const isCi = require('is-ci');

const dbConfig = {
  host: process.env.DB_HOST || 'podverse_db',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_DATABASE || 'podverse_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  dialect: process.env.DB_DIALECT || 'postgres'
};

const queueUrl = process.env.QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/088242326555/podcast_db_to_be_parsed_dev';
const awsRegion = 'us-east-1';

module.exports = {
  dbConfig,
  queueUrl,
  awsRegion
}
