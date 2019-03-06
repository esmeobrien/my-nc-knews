const apiRouter = require('express').Router();
const topicsRouter = require('./topicsRouter');
const articlesRouter = require('./articlesRouter.js');
const usersRouter = require('./usersRouter.js');
const { endpoints } = require('../endpoints');

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/users', usersRouter);

apiRouter.get('/', (req, res) => {
  res.status(200).send(endpoints);
});


module.exports = apiRouter;
