const connection = require('../db/connection');

exports.getTopics = (req, res, next) => { // first get request which selects all from the table
  connection('topics')
    .select('*')
    .then((topics) => {
      res.status(200).send(topics);
    })
    .catch(next);
};

exports.postTopics = (req, res, next) => {
  connection('topics')
    .returning('*')
    .insert(req.body)
    .then(([topic]) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.getAllArticlesOnTopic = (req, res, next) => {
  const { topic } = req.params;
  return connection.select(
    'articles.title',
    'articles.topic',
    'articles.username AS author',
    'articles.article_id',
    'articles.created_at',
    'articles.votes',
  )
    .from('articles')
    .groupBy('articles.article_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .leftJoin('users', 'users.username', '=', 'articles.username')
    .count('comments.comment_id AS comment_count')
    .where({ topic })
    .then(articles => res.status(200).send({ articles }));
};
