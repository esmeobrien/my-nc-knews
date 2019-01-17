/*  eslint "max-len": 0,
"no-restricted-globals": 0,
*/

const connection = require('../db/connection');

exports.getTopics = (req, res, next) => {
  // Get request which selects all from the topics table i.e slug + description
  // making a connection with our topics table
  // selecting all from topics table
  connection('topics')
    .select('*')
    .then((topics) => {
      res.status(200).send(topics);
    })
    .catch(next);
};

exports.postTopics = (req, res, next) => {
  // Post request which accepts an object containing slug + description, slug must be unique
  // reponds with the posted topic object
  connection('topics')
    .returning('*')
    .insert(req.body)
    .then(([topic]) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.getAllArticlesForTopic = (req, res, next) => {
  // responds with an array of article objects for a given topic
  // responds with following queries limit, sort_by, p, sort_ascending

  const { topic } = req.params;
  const { limit = 10, sort_ascending, p = 1 } = req.query;
  let { sort_by } = req.query;
  let order_by = 'desc';
  if (sort_ascending === 'true') { order_by = 'asc'; }
  const validSortQueries = ['title', 'author', 'article_id', 'created_at', 'topic', 'votes', 'comment_count'];
  if (!validSortQueries.includes(sort_by)) sort_by = 'created_at';
  if (isNaN(limit)) return next({ status: 400, msg: 'invalid input syntax' });
  if (isNaN(p)) return next({ status: 400, msg: 'invalid input syntax' });

  return connection.select(
    'articles.title',
    'articles.username AS author',
    'articles.article_id',
    'articles.created_at',
    'articles.topic',
    'articles.votes',
  )
    .from('articles')
    .groupBy('articles.article_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .count('comments.comment_id AS comment_count')
    .where({ topic })
    .limit(limit)
    .offset(limit * (p - 1))
    .orderBy(sort_by, order_by)
    .then(articles => res.status(200).send({ articles }))
    .catch(next);
};


exports.addArticle = (req, res, next) => {
  // accepts an object containing a title,body, and a username property
  // repsonds with the posted article

  const newObj = { ...req.params, ...req.body };
  connection
    .insert(newObj)
    .into('articles')
    .returning('*')
    .then(([addedArticle]) => {
      res.status(201).send({ addedArticle });
    })
    .catch(next);
};
