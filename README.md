# podcast_db

Parses podcast feeds by feed URL and saves them in a database.

## Setup

`npm install`

## Migrate Database

`npm run migrate`

## Add podcasts to local database

### Add/update a podcast and all of its episodes

```
node -e 'let params = {}; params.shouldParseMaxEpisodes = true; require("./src/tasks/feedParser.js").parseFeedIfHasBeenUpdated("<podcast feed url>")'
```

### Add/update a podcast and all of its episodes only if a new episode is found

Note: Right now the parser only checks the first episode in the feed is to determine if a new episode is available or not.

```
node -e 'let params = {}; params.shouldParseRecentEpisodes = true; require("./src/tasks/feedParser.js").parseFeedIfHasBeenUpdated("<podcast feed url>")'
```

## Trying to reduce redundant parsing

If you run parseFeedIfHasBeenUpdated with param shouldParseRecentEpisodes = true OR shouldParseMaxEpisodes = true, then recent episodes will be parsed and saved ONLY IF:

1) the parsed podcast's lastBuildDate is more recent than the saved podcast's lastBuildDate
2) the parsed podcast's lastPubDate is more recent than the saved podcast's lastPubDate
3) the saved podcast does not have a lastBuildDate or a lastPubDate.

Otherwise parsing is complete, and the podcast is not updated in the database.

## Docker / AWS Commands

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
