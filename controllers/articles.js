const connection = require('../db/connection');

exports.getAllArticles = (req, res, next) => {
  // responds with an array of article objects
  // each article should have correct properties

  const { limit = 10, sort_ascending, p = 1 } = req.query;
  let { sort_by } = req.query;
  let order_by = 'desc';
  if (sort_ascending === 'true') { order_by = 'asc'; }
  const sortedQueries = ['title', 'author', 'article_id', 'created_at', 'topic', 'votes', 'comment_count'];

  if (!sortedQueries.includes(sort_by)) sort_by = 'created_at';
  if (isNaN(limit)) return next({ status: 400, msg: 'invalid input syntax for type integer' });
  if (isNaN(p)) return next({ status: 400, msg: 'invalid input syntax for type integer' });

  return connection.select(
    'articles.username AS author',
    'articles.title',
    'articles.article_id',
    'articles.votes',
    'articles.body',
    'articles.created_at',
    'articles.topic',
  )
    .from('comments')
    .rightJoin('articles', 'articles.article_id', '=', 'comments.article_id')
    .count('comments.article_id AS comment_count')
    .groupBy('articles.article_id')
    .limit(limit)
    .offset(limit * (p - 1))
    .orderBy(sort_by, order_by)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.fetchArticleById = (req, res, next) => {
  // responds with an article object
  // each article should have

  const { article_id } = req.params;

  connection('articles')
    .select(
      'users.username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
      'articles.body',
    )
    .join('users', 'articles.username', 'users.username')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .count('comments.article_id AS comment_count')
    .where('articles.article_id', article_id)
    .groupBy('articles.article_id', 'users.username')
    .then((articles) => {
      if (articles.length === 0) return Promise.reject({ status: 404, msg: 'page is not found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
};

exports.updateArticleVotes = (req, res, next) => {
// accepts an object in the form `{ inc_votes: newVote }`
// indicate how much the `votes` property in the database should be updated by
// E.g `{ inc_votes : 1 }` would increment the current article's vote property by 1
// `{ inc_votes : -100 }` would decrement the current article's vote property by 100

  const { article_id } = req.params;
  const { inc_votes } = req.body;

  connection('articles')
    .returning('*')
    .increment('votes', inc_votes)
    .where('article_id', '=', article_id)
    .then(([article]) => {
      if (article.length === 0) return Promise.reject({ status: 404, msg: 'page not found' });
      return res.status(202).send({ article });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  // should delete the given article by `article_id`
  // should respond with an empty object

  const { article_id } = req.params;

  connection('articles')
    .returning('*')
    .where('articles.article_id', '=', `${article_id}`)
    .del()
    .then((article) => {
      if (article.length === 0) return Promise.reject({ status: 404, msg: 'page not found' });
      return res.status(204).send({});
    })
    .catch(err => console.log(err) || next(err));
};


exports.fetchCommentsByArticleID = (req, res, next) => {
  const { article_id } = req.params;
  const { limit: maxResult = 10, sort_ascending, p = 1 } = req.query;
  let { sort_by } = req.query;
  let order_by = 'desc';
  if (sort_ascending === 'true') { order_by = 'asc'; }
  const validSortQueries = ['title', 'author', 'article_id', 'created_at', 'topic', 'votes', 'comment_count'];
  if (!validSortQueries.includes(sort_by)) sort_by = 'created_at';
  if (isNaN(p)) return next({ status: 400, msg: 'invalid input syntax for type integer' });
  if (isNaN(maxResult)) return next({ status: 400, msg: 'invalid input syntax for type integer' });

  return connection('comments')
    .select(
      'comments.comment_id',
      'comments.votes',
      'comments.created_at',
      'users.username AS author',
      'comments.body',
    )
    .join('users', 'users.username', '=', 'comments.username')
    .where('article_id', article_id)
    .limit(maxResult)
    .offset(maxResult * (p - 1))
    .orderBy(sort_by, order_by)
    .then((comments) => {
      console.log(comments);
      if (comments.length === 0) return Promise.reject({ status: 404, msg: 'page not found' });
      return res.status(200).send({ comments });
    })
    .catch(next);
};

exports.addComment = (req, res, next) => {
  const newComment = { ...req.params, ...req.body };

  connection
    .returning('*')
    .insert(newComment)
    .into('comments')
    .then(([comment]) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { article_id } = req.params;

  return connection('comments')
    .where('comment_id', comment_id)
    .where('article_id', article_id)
    .del()
    .then((comment) => {
      if (comment === 0) return Promise.reject({ status: 404, msg: 'page not found' });
      return res.status(204).send({});
    })
    .catch(next);
};

exports.updateVotes = (req, res, next) => {
  const { inc_votes } = req.body;
  const { comment_id } = req.params;

  connection('comments').where('comment_id', '=', comment_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((commentVotes) => {
      if (commentVotes.length === 0) return next({ status: 404, msg: 'page not found' });
      return res.status(202).send({ commentVotes });
    })
    .catch(next);
};
