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
  });
});
