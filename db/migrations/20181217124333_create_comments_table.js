exports.up = function (knex, Promise) {
  return knex.schema.createTable('comments', (commentTable) => {
    commentTable.increments('comment_id').primary();
    commentTable.integer('article_id').references('articles.article_id');
    commentTable.integer('votes').defaultTo(0);
    commentTable.timestamp('created at').defaultTo(knex.fn.now());
    commentTable.string('body');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('comments');
};
