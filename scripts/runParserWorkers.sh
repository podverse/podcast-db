for i in {1..10}; do docker run -d --rm -e AWS_ACCESS_KEY_ID='' -e AWS_SECRET_ACCESS_KEY='' -e queueUrl='' -e postgresUri='' --name podcast_db_dev_$i podcast_db_dev /tmp/scripts/parseNextFeed.js; done
