const
    {configureDatabaseModels, createTestPodcastAndEpisode} = require('../helpers.js'),
    PodcastService = require('../../src/services/podcast/PodcastService.js');

describe('PodcastService', function () {

  configureDatabaseModels(function (Models) {
    this.Models = Models;
  });

  beforeEach(function () {
    this.podcastSvc = new PodcastService();
  });

  it('should go', function () {
    expect(this.podcastSvc).to.be.ok;
  });

  it('should be able to get a podcast by ID', function (done) {

    this.Models.Podcast
      .create({feedURL: 'http://example.com/rss'})
      .then(podcast => {

        this.podcastSvc.get(podcast.id, {})
          .then(podcast => {
            expect(podcast).to.exist;
            done();
          });
      });

  });

  it('should be able to fuzzy match find a podcast by title', function (done) {

    this.Models.Podcast
      .create({
        feedURL: 'http://example.com/rss',
        title: 'Some kind of title'
      })
      .then(podcast => {
        this.podcastSvc.find({query: {title: 'kind of'}})
          .then(podcasts => {
            expect(podcasts[0].title).to.equal('Some kind of title');
            done();
          });
      });

  });

  it.only('should be able to retrieve all podcasts with expected attributes', function (done) {

    this.Models.Podcast.create({
        feedURL: 'http://example.com/rss',
        title: 'Some kind of title',
        imageURL: 'http://example.com/img'
      })
      .then(() =>{
        this.Models.Podcast.create({
          feedURL: 'http://example.com/rss2',
          imageURL: 'http://example.com/img2'
        })
        .then(() =>{
          this.Models.Podcast.create({
            feedURL: 'http://example.com/rss3',
            imageURL: 'http://example.com/img3'
          })
          .then(() => {
            this.podcastSvc.retrieveAllPodcasts()
              .then(podcasts => {
                expect(podcasts.length).to.equal(3);
                expect(podcasts[0].id).to.exist;
                expect(podcasts[0].title).to.exist;
                expect(podcasts[0].imageURL).to.exist;
                done();
              });
          })
          .catch(e => {
            console.log(e);
          })

        })
      })
  });

});
