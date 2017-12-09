FROM node
WORKDIR /tmp
COPY package*.json ./
RUN npm install
COPY . .
RUN ["chmod", "+x", "/tmp/scripts/addFeedsToBeParsedForMaxEpisodes.js"]
RUN ["chmod", "+x", "/tmp/scripts/parseNextFeed.js"]
