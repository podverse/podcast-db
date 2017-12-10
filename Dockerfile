FROM node
WORKDIR /tmp
COPY . .
RUN npm install
RUN ["chmod", "+x", "/tmp/scripts/addFeedsToBeParsedForMaxEpisodes.js"]
RUN ["chmod", "+x", "/tmp/scripts/addUnparsedFeedsToBeParsedForMaxEpisodes.js"]
RUN ["chmod", "+x", "/tmp/scripts/parseNextFeed.js"]
