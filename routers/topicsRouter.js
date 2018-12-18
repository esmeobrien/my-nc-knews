const topicsRouter = require('express').Router();
const { getTopics } = require('../controllers/topics');

topicsRouter.get('/', getTopics);

module.exports = topicsRouter;
