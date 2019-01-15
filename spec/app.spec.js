process.env.NODE_ENV = 'test';
const app = require('../app');
const connection = require('../db/connection');
const { expect } = require('chai'); // require in chai
const request = require('supertest')(app); // require in supertest the call it with my app


describe('/api', () => {
  beforeEach(() => connection.migrate.rollback() // mocha hook
    .then(() => connection.migrate.latest()) // exectute latest script we have in our database
    .then(() => connection.seed.run())); // runs the seed
  after(() => connection.destroy()); // destory connection so we have new data every time we run it
  // test for get request
  it('GET - returns status 404 if the client enters an endpoint that does not exist', () => { // implimenting the error handling for /api
    request
      .get('/api/bobRoss') // giving a get request with an endpoint that doesnt exist
      .expect(404) // page is not found error
      .then((res) => {
        expect(res.body.msg).to.equal('page is not found'); // response message will be that the page is not found
      });
  });


  describe('/topics', () => {
    // test for get request
    it('GET - returns status 200 and responds with an array of topic objects', () => request
      .get('/api/topics')
      .expect(200)
      .then((res) => {
        expect(res.body).to.be.an('array');
        expect(res.body[0]).to.have.all.keys('description', 'slug');
        expect(res.body).to.have.length(2);
        expect(res.body[1].slug).to.equal('cats');
      }));
    // test for post request
    it('POST - returns status 201 and allows a post of an object which contains a slug and description property, the slug must be unique and responds with the posted topic object', () => {
      const topic = { description: 'Hey good looking, what you got cooking?', slug: 'cooking' };
      return request
        .post('/api/topics')
        .expect(201)
        .send(topic)
        .then((res) => {
          expect(res.body.topic.slug).to.eql(topic.slug);
          expect(res.body.topic.description).to.eql(topic.description);
        });
    });

    // Error handling for a post request!
    it('POST status = 400 if client provides an invalid input', () => request
      .post('/api/topics')
      .send({ doggos: 'give me all the puppies' })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input');
      }));
    it('POST status = 422 if the input provided is a slug that is not unique', () => {
      const topic = {
        description: 'Not dogs',
        slug: 'cats',
      };
      return request
        .post('/api/topics')
        .send(topic)
        .expect(422)
        .then((res) => {
          expect(res.body.msg).to.equal('duplicate key value violates unique constraint');
        });
    });

    // overall error handling- if not get or post request
    it('status = 405 if input method chosen is not get or a post', () => request
      .patch('/api/topics')
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method is not allowed!');
      }));
  });


  describe('/:topic/articles', () => {
    it('GET status = 200 returns an array of articles for a given topic with correct keys', () => request
      .get('/api/topics/mitch/articles').expect(200)
      .then(({ body }) => {
        expect(body.articles).to.have.length(10);
        expect(body.articles[0]).to.have.all.keys(
          'author',
          'title',
          'article_id',
          'votes',
          'comment_count',
          'created_at',
          'topic',
        );
      }));
    it('GET status = 200 if length is equal to limit query set', () => request
      .get('/api/topics/mitch/articles?limit=7')
      .expect(200)
      .then((res) => {
        expect(res.body.articles).to.have.length(7);
      }));
    it('GET status = 200 sorts articles by any valid column', () => request
      .get('/api/topics/mitch/articles?maxResult&sort_by=title')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Z');
      }));
    it('GET status: 200 articles sorted by chosen column', () => request
      .get('/api/topics/mitch/articles?sort_by=author')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].author).to.equal('rogersop');
      }));
    it('GET status =200 articles sorted by default even if column created_at has invalid sort is given', () => request
      .get('/api/topics/mitch/articles?sort_by=bobRoss')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[3].title).to.equal('Student SUES Mitch!');
      }));
    it('GET status = 200 articles sorted by whichever chosen column', () => request
      .get('/api/topics/mitch/articles?sort_by=title')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[9].title).to.equal('Am I a cat?');
      }));
    it('GET status = 200 articles are sorted by default', () => request
      .get('/api/topics/mitch/articles')
      .expect(200).then((res) => {
        expect(res.body.articles[1].title).to.equal('Sony Vaio; or, The Laptop');
      }));
    it('GET status = 200 articles sorted by chosen column', () => request
      .get('/api/topics/mitch/articles?sort_by=author')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].author).to.equal('rogersop');
      }));
    it('GET status: 200 articles sorted by chosen column and order of sort', () => request
      .get('/api/topics/mitch/articles?sort_by=title&sort_ascending=true')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('A');
      }));
    it('GET status: 200 sorts articles by any valid column', () => request
      .get('/api/topics/mitch/articles?maxResult&sort_by=title')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Z');
      }));

    // error handling
    it('GET status = 400 if invalid syntax is used in the limit query', () => request
      .get('/api/topics/cats/articles?limit=memes')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input syntax');
      }));
    it('GET status = 400 if invalid syntax is used in the p query', () => request
      .get('/api/topics/cats/articles?p=memes')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input syntax');
      }));
    it('GET status = 404 if given a topic that doesnt exist', () => request
      .get('/api/topics/moreMemes')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).to.equal('page is not found');
      }));
    it('status = 405 if user tries to send a method that isnt get/post', () => request
      .delete('/api/topics/mitch/articles')
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method is not allowed!');
      }));
  });


  describe('/articles', () => {
    it('GET status = 200 responds with an array of article objects with the correct properties & keys', () => request
      .get('/api/articles')
      .expect(200)
      .then((res) => {
        expect(res.body.articles).to.be.an('array');
        expect(res.body.articles[0]).to.have.all.keys(
          'author',
          'article_id',
          'body',
          'title',
          'votes',
          'topic',
          'comment_count',
          'created_at',
        );
        expect(res.body.articles[0].topic).to.equal('mitch');
        expect(res.body.articles[2].title).to.equal('Eight pug gifs that remind me of mitch');
        expect(res.body.articles).to.have.length(10);
      }));
    it('GET = status 200 has a length is equal to limit query set', () => request
      .get('/api/articles?limit=4')
      .expect(200).then((res) => {
        expect(res.body.articles).to.have.length(4);
      }));
    it('GET = status 200 articles sorted by default of column created_at', () => request
      .get('/api/articles')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));
    it('GET = status 200 articles sorted by chosen column', () => request
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Z');
      }));
    it('GET = status 200 articles sorted by default column and user chosen order of sort', () => request
      .get('/api/articles?sort_ascending=true')
      .expect(200).then((res) => {
        expect(res.body.articles[0].title).to.equal('Moustache');
      }));
    it('GET = status 200 articles sorted by chosen column and order of sort', () => request
      .get('/api/articles?sort_by=title&sort_ascending=true')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('A');
      }));
    it('GET = status 200 and articles on a given page', () => request
      .get('/api/articles?p=1')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));
    it('GET = status 200 and articles sorted by default column and default order of sort when given invalid sort value', () => request
      .get('/api/articles?sort_ascending=moustaches')
      .expect(200).then((res) => {
        expect(res.body.articles[7].title).to.equal('Does Mitch predate civilisation?');
      }));

    // error handling
    it('GET status = 400 when invalid syntax is used in the limit query', () => request
      .get('/api/articles?limit=puppies')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input syntax for type integer');
      }));
    it('GET status = 400 when invalid syntax is used in the p query', () => request
      .get('/api/articles?p=puppies')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input syntax for type integer');
      }));
  });


  describe('/articles/:article_id', () => {
    // Get Request
    it('GET status = 200 responds with an array of article objects with correct properties and keys', () => request
      .get('/api/articles/1')
      .expect(200)
      .then((res) => {
        expect(res.body.articles).to.be.an('array');
        expect(res.body.articles[0]).to.have.all.keys(
          'article_id',
          'author',
          'title',
          'votes',
          'topic',
          'body',
          'comment_count',
          'created_at',
        );
        expect(res.body.articles[0].topic).to.eql('mitch');
        expect(res.body.articles[0].body).to.equal('I find this existence challenging');
      }));
    // Error handling for get request
    it('GET status: 404 if given non existant article id', () => request
      .get('/api/articles/6788877')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).to.equal('page is not found');
      }));
    it('GET status: 400 invalid syntax is used for article id', () => request
      .get('/api/articles/grapes')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input syntax for type integer');
      }));
  });
});
