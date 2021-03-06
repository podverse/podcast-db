const feedParser = require('../../src/tasks/feedParser.js'),
      fs = require('fs'),
      express = require('express'),
      {configureDatabaseModels} = require('../helpers.js');

xdescribe('feedParser', function () {

  configureDatabaseModels(function (Models) {
    this.Models = Models;
  });

  before(function (done) {

    this.timeout = 5*1000; // allow 5 seconds before timeout

    this.app = express();

    this.server = this.app.listen(1234, done)

    this.app
      .get('/localFeed', (req, res) => {
        fs.readFile(__dirname + '/../assets/rogan-example-rss.xml', 'utf8', function(err, data) {
          if (err) {
            return console.log(err);
          }
          res.status(200).send(data);
        })
      });
  });

  after(function (done) {
    this.server.close(done);
  });

  describe('parseFeed function', function () {

    describe('when an invalid RSS Url is provided', function () {

      beforeEach(function (done) {
        feedParser.parseFeed('http://www.podverse.fm/fakepage', 'someid123')
          .then(done)
          .catch(err => {
            this.err = err;
            done();
          });
      });

      it('should reject with bad status code', function () {
        expect(this.err.message).to.equal('Bad status code');
      });

    });

    describe('when a valid RSS Url is provided', function () {

      beforeEach(function (done) {
        feedParser.parseFeed('http://localhost:1234/localFeed', 'someid123')
          .then(done)
          .catch(done);
      });

      // it.only('should return a parsed feed object', function () {
      //   expect(this.parsedFeedObj).to.exist;
      // });
      //
      // it('parsed feed object should have a podcast title', function () {
      //   expect(this.parsedFeedObj.podcast.title).to.equal('The Joe Rogan Experience');
      // });
      //
      // it('parsed feed object should have an xmlurl', function () {
      //   expect(this.parsedFeedObj.podcast.xmlurl).to.exist;
      // });

      describe('after a feed is successfully parsed and saveParsedFeedToDatabase is called', function () {

        beforeEach(function (done) {
          let resolve = () => { return };
          let reject = () => { return };

          this.Models.Podcast.findOne({where: {title: 'The Joe Rogan Experience'}})
          .then(podcast => {
            this.podcast = podcast;
            this.podcastId = podcast.id;
          })
          .then(() => {
            this.Models.Episode.findAll({where: {podcastId: this.podcastId}})
              .then(episodes => {
                this.episodes = episodes;
                done();
              });
          });

        });

        it('the podcast is saved', function () {
          expect(this.podcast).to.exist;
        });

        it(`the podcast's episodes are saved`, function () {
          expect(this.episodes.length).to.equal(3);
        });

      });


    });

  });

});
