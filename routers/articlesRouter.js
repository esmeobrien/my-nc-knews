const articlesRouter = require('express').Router();
const { handle405 } = require('../errors');

const {
  getAllArticles, fetchArticleById,
} = require('../controllers/articles');

articlesRouter
  .route('/')
  .get(getAllArticles)
  .all(handle405);

articlesRouter
  .route('/:article_id')
  .get(fetchArticleById);

module.exports = articlesRouter;
