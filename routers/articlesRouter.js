const articlesRouter = require('express').Router();
const { handle405 } = require('../errors');

const {
  getAllArticles, fetchArticleById, updateArticleVotes, deleteArticleById,
} = require('../controllers/articles');

articlesRouter
  .route('/')
  .get(getAllArticles)
  .all(handle405); // if it hits this due to being the incorrect request it will go to the handle 405 function in errors

articlesRouter
  .route('/:article_id')
  .get(fetchArticleById)
  .patch(updateArticleVotes)
  .delete(deleteArticleById)
  .all(handle405);

module.exports = articlesRouter;
