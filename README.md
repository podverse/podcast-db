*NOTE: To make the AWS SQS Queue work, you will have to provide a SQS QueueUrl in the config file*

---

*To add a podcast and all of its episodes to the DB from the command line:*

````
node -e 'let params = {}; params.shouldParseMaxEpisodes = true; require("./src/tasks/feedParser.js").parseFeedIfHasBeenUpdated("<PODCAST FEED URL>")'
````

NOTE: If you run parseFeedIfHasBeenUpdated with param shouldParseRecentEpisodes = true OR shouldParseMaxEpisodes = true, then recent episodes will be parsed and saved ONLY IF 1) the parsed podcast's lastBuildDate is more recent than the saved podcast's lastBuildDate, 2) the parsed podcast's lastPubDate is more recent than the saved podcast's lastPubDate, 3) the saved podcast does not have a lastBuildDate or a lastPubDate.

---

*Sample CRON job*

Do a parse for only recent episodes every 12 hours.
Do a max parse (with a limit of ~1000 episodes) once a week.
Always run the parseNextFeedFromQueue script every 5 minutes.

````
00 */12 * * 1-6 /usr/local/bin/node /Users/mitch/repos/podcast-db/scripts/addFeedsToBeParsedForRecentEpisodes.js
* 0 * * 7 /usr/local/bin/node /Users/mitch/repos/podcast-db/scripts/addFeedsToBeParsedForMaxEpisodes.js
* 12 * * 7 /usr/local/bin/node /Users/mitch/repos/podcast-db/scripts/addFeedsToBeParsedForRecentEpisodes.js
*/5 * * * * /usr/local/bin/node /Users/mitch/repos/podcast-db/scripts/parseNextFeedFromQueue.js
````

## Migrate DB

`npm run migrate`