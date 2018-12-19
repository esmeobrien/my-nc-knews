const topicsRouter = require('express').Router();
const { getTopics, postTopics } = require('../controllers/topics');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(postTopics);

module.exports = topicsRouter;
