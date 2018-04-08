for ((i = 1; i <= 10; i++))
  do docker stop feed_parser_worker$i;
  docker rm feed_parser_worker$i;
  docker run -d --rm -e AWS_ACCESS_KEY_ID='' -e AWS_SECRET_ACCESS_KEY='' -e queueUrl='' -e postgresUri='' --name podcast_db_dev_$i podcast_db_dev /tmp/scripts/parseNextFeed.js
done