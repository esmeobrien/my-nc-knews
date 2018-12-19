process.env.NODE_ENV = 'test';

const app = require('../app');
const connection = require('../db/connection');
const { expect } = require('chai');
const request = require('supertest')(app);

describe('/api', () => {
  beforeEach(() => connection.migrate.rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());

  describe('/topics', () => {
    it('GET - returns status 200 and responds with an array of topic objects', () => request
      .get('/api/topics')
      .expect(200)
      .then((res) => {
        expect(res.body).to.be.an('array');
        expect(res.body[0]).to.have.all.keys('slug', 'description');
      }));

    it('POST - returns status 201 and allows a post of an object which contains a slug and description property, the slug must be unique and responds with the posted topic object', () => {
      const topic = { description: 'Code is love, code is life', slug: 'coding' };
      return request
        .post('/api/topics')
        .expect(201)
        .send(topic)
        .then((res) => {
          expect(res.body.topic.description).to.eql(topic.description);
          expect(res.body.topic.slug).to.eql(topic.slug);
        });
    });
  });
});
