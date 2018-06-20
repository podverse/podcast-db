FROM node
WORKDIR /tmp
COPY . .
RUN npm install && npm install -g mocha
RUN ["chmod", "+x", "/tmp/scripts/addFeedsToBeParsedForMaxEpisodes.js"]
RUN ["chmod", "+x", "/tmp/scripts/addUnparsedFeedsToBeParsedForMaxEpisodes.js"]
RUN ["chmod", "+x", "/tmp/scripts/parseNextFeed.js"]
RUN ["chmod", "+x", "/tmp/scripts/test.js"]
