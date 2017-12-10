# podcast_db

Parses podcast feeds by feed URL and saves them in a database.

## Setup

`npm install`

## Migrate database

`npm run migrate`

## Add podcasts to local database

### Add/update a podcast and all of its episodes

```
node -e 'require("./src/tasks/feedParser.js").parseFeed("<podcast feed url>")'
```

## Docker / AWS commands

Note: This implementation depends on AWS at the moment. Ideally it should be more platform agnostic.

### Build the podcast_db Docker image

```
docker build -t podcast_db .
```

### Add all feeds to the queue to be parsed for max episodes

```
docker run -e AWS_ACCESS_KEY_ID='<access key>' -e AWS_SECRET_ACCESS_KEY='<secret key>' -e queueUrl='<sqs queue url>' -e postgresUri='<postgres url>' podcast_db /tmp/scripts/addFeedsToBeParsedForMaxEpisodes.js
```

### Add all feeds to the queue to be parsed for max episodes only if a new episode is found

```
docker run -e AWS_ACCESS_KEY_ID='<access key>' -e AWS_SECRET_ACCESS_KEY='<secret key>' -e queueUrl='<sqs queue url>' -e postgresUri='<postgres url>' podcast_db /tmp/scripts/addFeedsToBeParsedForRecentEpisodes.js
```

### Add only feeds that have not been parsed to the queue to be parsed for max episodes

```
docker run -e AWS_ACCESS_KEY_ID='<access key>' -e AWS_SECRET_ACCESS_KEY='<secret key>' -e queueUrl='<sqs queue url>' -e postgresUri='<postgres url>' podcast_db /tmp/scripts/addUnparsedFeedsToBeParsedForMaxEpisodes.js
```

### Parse next podcast feed from queue

```
docker run -e AWS_ACCESS_KEY_ID='<access key>' -e AWS_SECRET_ACCESS_KEY='<secret key>' -e queueUrl='<sqs queue url>' -e postgresUri='<postgres url>' podcast_db /tmp/scripts/parseNextFeed.js
```
