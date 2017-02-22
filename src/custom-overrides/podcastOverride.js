function podcastOverride(podcast) {

  if (podcast.xmlurl === 'https://www.rosicrucian.org/podcast/feed/') {
    podcast.title = 'The Rosicrucian Order, AMORC Podcasts';
  }

  return podcast;
}

module.exports = {
  podcastOverride: podcastOverride
}
