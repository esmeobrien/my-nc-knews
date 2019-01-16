const articlesRouter = require('express').Router();
const { handle405 } = require('../errors');

const {
  getAllArticles, fetchArticleById, updateArticleVotes,
} = require('../controllers/articles');

articlesRouter
  .route('/')
  .get(getAllArticles)
  .all(handle405);

articlesRouter
  .route('/:article_id')
  .get(fetchArticleById)
  .patch(updateArticleVotes)
  .all(handle405); // if it hits this due to being the incorrect request it will go to the handle 405 function in errors

module.exports = articlesRouter;
