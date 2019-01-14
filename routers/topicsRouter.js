const topicsRouter = require('express').Router();
const {
  getTopics, postTopics, getAllArticlesForTopic, addArticle,
} = require('../controllers/topics');
const { handle405 } = require('../errors/index.js');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(postTopics)
  .all(handle405);

topicsRouter
  .route('/:topic/articles')
  .get(getAllArticlesForTopic)
  .post(addArticle)
  .all(handle405);

module.exports = topicsRouter;
