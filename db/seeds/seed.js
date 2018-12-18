const { makeArticle, makeComments } = require('../utils'); // require in functions made in my utils file
const {
  topicData, userData, articleData, commentData,
} = require('../data'); // require in the pre made data

exports.seed = function (knex, Promise) {
  return knex('topics')
    .del()
    .then(() => knex('topics')
      .insert(topicData)
      .returning('*'))
    .then(() => knex('users')
      .del()
      .then(() => knex('users')
        .insert(userData)
        .returning('*')))
    .then(() => {
      const articleFormatted = makeArticle(articleData);
      return knex('articles')
        .insert(articleFormatted)
        .returning(['article_id', 'title']);
    })
    .then((articleInfo) => {
      const commentsFormatted = makeComments(commentData, articleInfo);
      return knex('comments')
        .insert(commentsFormatted)
        .returning('*');
    });
};
