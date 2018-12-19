const topicsRouter = require('express').Router();
const { getTopics, postTopics, getAllArticlesOnTopic } = require('../controllers/topics');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(postTopics);

topicsRouter
  .route('/:topic/articles')
  .get(getAllArticlesOnTopic);

module.exports = topicsRouter;
