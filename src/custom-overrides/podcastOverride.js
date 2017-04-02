function podcastOverride(podcast) {

  if (podcast.xmlurl === 'https://www.rosicrucian.org/podcast/feed/') {
    podcast.title = 'The Rosicrucian Order, AMORC Podcasts';
    podcast.imageURL = 'http://is4.mzstatic.com/image/thumb/Music6/v4/7a/49/7f/7a497f92-4e9e-9d8f-2bda-841833894a34/source/600x600bb.jpg';
  }

  if (podcast.xmlurl === 'http://theartofcharmpodcast.theartofcharm.libsynpro.com/rss') {
    podcast.title = 'The Art of Charm';
  }

  return podcast;
}

module.exports = {
  podcastOverride: podcastOverride
}
