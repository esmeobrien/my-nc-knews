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
      if (articles.length === 0) return Promise.reject({ status: 404, msg: 'error page not found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
};
