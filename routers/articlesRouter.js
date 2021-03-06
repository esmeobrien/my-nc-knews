const articlesRouter = require('express').Router();
const { handle405 } = require('../errors');

const {
  getAllArticles, fetchArticleById, updateArticleVotes, deleteArticleById, fetchCommentsByArticleID, addComment, updateVotes, deleteComment,
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

articlesRouter
  .route('/:article_id/comments')
  .get(fetchCommentsByArticleID)
  .post(addComment);

articlesRouter
  .route('/:article_id/comments/:comment_id')
  .patch(updateVotes)
  .delete(deleteComment)
  .all(handle405);


module.exports = articlesRouter;
