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
