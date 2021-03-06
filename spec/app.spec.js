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
    it('status = 405 handles invalid requests', () => request
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

    // Error Handling
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
    it('status = 405 if user tries to send a method that isnt get/post eg delete', () => request
      .delete('/api/topics/mitch/articles')
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method is not allowed!');
      }));
    it('status = 405 if user tries to send a method that isnt get/post eg patch', () => request
      .patch('/api/topics/mitch/articles')
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method is not allowed!');
      }));
    it('status = 405 if user tries to send a method that isnt get/post eg put', () => request
      .put('/api/topics/mitch/articles')
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

    // Test for Limit Query
    it('GET = status 200 has a length is equal to limit query set', () => request
      .get('/api/articles?limit=4')
      .expect(200).then((res) => {
        expect(res.body.articles).to.have.length(4);
      }));

    // Test for sort by created_at
    it('GET = status 200 articles sorted by default of column created_at', () => request
      .get('/api/articles')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));

    // Test for sort by for title
    it('GET = status 200 articles sorted by chosen column', () => request
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Z');
      }));

    // Test for sorting in ascending order
    it('GET = status 200 articles sorted by default column and user chosen order of sort', () => request
      .get('/api/articles?sort_ascending=true')
      .expect(200).then((res) => {
        expect(res.body.articles[0].title).to.equal('Moustache');
      }));

    // Test for sorting by title and in ascending order
    it('GET = status 200 articles sorted by chosen column and order of sort', () => request
      .get('/api/articles?sort_by=title&sort_ascending=true')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('A');
      }));

    // Test for selecting a given page
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

    // Error Handling
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
        expect(res.body.articles[0].topic).to.equal('mitch');
        expect(res.body.articles[0].body).to.equal('I find this existence challenging');
      }));

    // Error handling for get request
    it('GET status: 404 if given non existant article id', () => request
      .get('/api/articles/677')
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

    // Patch Request for Articles
    it('PATCH status = 202, accepts an object and vote is increased if integer is positve', () => request
      .patch('/api/articles/1')
      .send({ inc_votes: 20 })
      .expect(202)
      .then((res) => {
        expect(res.body.article.title).to.equal('Living in the shadow of a great man');
        expect(res.body.article.votes).to.equal(120);
      }));

    // Delete Request for Articles
    it('DELETE status = 204, deletes the given article by `article_id`', () => request
      .delete('/api/articles/5')
      .expect(204)
      .then((res) => {
        expect(res.body).to.eql({}); // should respond with an empty object
      })
      .then(() => request.get('/api/articles/5').expect(404)));

    // Error Handing

    it('Status = 405 handles invalid requests', () => request
      .put('/api/articles/1')
      .send({ dogs: 'shiba' })
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method is not allowed!');
      }));
    it('Status = 405 handles invalid requests', () => request
      .post('/api/articles/1')
      .send({ dogs: 'shiba' })
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method is not allowed!');
      }));
  });
  // Tests for comments

  describe('/articles/:article_id/comments', () => {
    it('GET status = 200 responds with an array of comment objects', () => request
      .get('/api/articles/1/comments')
      .expect(200)
      .then((res) => {
        expect(res.body.comments).to.be.an('array');
        expect(res.body.comments[0]).to.have.all.keys(
          'comment_id',
          'author',
          'votes',
          'created_at',
          'body',
        );
        expect(res.body.comments).to.have.length(10);
        expect(res.body.comments[0].body).to.equal('The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.');
        expect(res.body.comments[0].author).to.equal('butter_bridge');
      }));
    it('GET status = 200, length of comments is equal to the limit amount selected', () => request
      .get('/api/articles/1/comments?limit=5')
      .expect(200).then((res) => {
        expect(res.body.comments).to.have.length(5);
      }));

    // error handling for limit query
    it('GET status = 400 when invlaid syntax is used in the limit query', () => request
      .get('/api/articles/1/comments?limit=dogs')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input syntax for type integer');
      }));

    // page query test
    it('GET status = 200 returns articles on page selected', () => request
      .get('/api/articles/1/comments?p=2')
      .expect(200)
      .then((res) => {
        expect(res.body.comments[0].comment_id).to.equal(12);
      }));

    // error handling for page query
    it('GET status = 400 when invalid syntax is used in page query', () => request
      .get('/api/articles/1/comments?p=watermelon')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input syntax for type integer');
      }));

    // sort by tests
    it('GET status = 200 articles sorted by whichever column chosen', () => request
      .get('/api/articles/1/comments?sort_by=comment_id')
      .expect(200)
      .then((res) => {
        expect(res.body.comments[0].comment_id).to.equal(2);
        expect(res.body.comments[3].comment_id).to.equal(5);
      }));

    // sort by test for chosen column and also order of sort
    it('GET status = 200 articles are sorted by order of sort and chosen column', () => request
      .get('/api/articles/1/comments?sort_ascending=true')
      .expect(200)
      .then((res) => {
        expect(res.body.comments[3].comment_id).to.equal(11);
        expect(res.body.comments[1].comment_id).to.equal(13);
      }));

    // sort by test for invalid inputs
    it('GET status = 200 if invalid sort is given, articles are sorted by default of created_at column', () => request
      .get('/api/articles/1/comments?sort_by=mango')
      .expect(200)
      .then((res) => {
        expect(res.body.comments[0].comment_id).to.equal(2);
        expect(res.body.comments[3].comment_id).to.equal(5);
      }));

    // Tests for Post Requests for comments
    it('POST status = 201 returns posted comment as an object', () => {
      const newPost = {
        body: 'lalala',
        username: 'butter_bridge',
      };
      return request
        .post('/api/articles/7/comments')
        .expect(201)
        .send(newPost)
        .then((res) => {
          expect(res.body.comment.username).to.eql('butter_bridge');
          expect(res.body.comment.body).to.eql('lalala');
        });
    });

    // Tests for my patch request for comments
    describe('/articles/:article_id/comments/:comment_id', () => {
      it('PATCH status = 202 if a postive integer is given, takes an object and increases the comment votes ', () => request
        .patch('/api/articles/1/comments/2')
        .send({ inc_votes: 10 })
        .expect(202)
        .then((res) => {
          expect(res.body.commentVotes[0].comment_id).to.equal(2);
          expect(res.body.commentVotes[0].votes).to.equal(24);
        }));

      // Tests for my delete request for comments
      it('DELETE status 204 = removes given article by article id', () => request
        .delete('/api/articles/1/comments/7')
        .expect(204)
        .then((res) => {
          expect(res.body).to.eql({});
        }));
    });
  });

  // USER TESTS

  describe('/users', () => {
    it('GET status = 200 responds with an array of user objects', () => request
      .get('/api/users')
      .expect(200)
      .then((res) => {
        expect(res.body.users).to.be.an('array');
        expect(res.body.users[0]).to.have.all.keys(
          'name',
          'username',
          'avatar_url',
        );
        expect(res.body.users).to.have.length(3);
        expect(res.body.users[1].name).to.equal('sam');
        expect(res.body.users[2].username).to.equal('rogersop');
      }));
    it('Status = 405 handles invalid requests', () => request
      .put('/api/articles/1')
      .send({ animals: 'llama' })
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method is not allowed!');
      }));
    it('Status = 405 handles invalid requests', () => request
      .post('/api/users')
      .send({ dogs: 'pugs' })
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method is not allowed!');
      }));
  });
  // USER/:USERNAME TEST

  describe('/users/:username', () => {
    it('GET status = 200 responds with an array of user objects', () => request
      .get('/api/users/rogersop')
      .expect(200)
      .then((res) => {
        expect(res.body.user).to.have.all.keys(
          'username',
          'avatar_url',
          'name',
        );
        expect(res.body.user).to.eql({
          username: 'rogersop',
          avatar_url: 'https://avatars2.githubusercontent.com/u/24394918?s=400&v=4',
          name: 'paul',
        });
      }));
  });
});
