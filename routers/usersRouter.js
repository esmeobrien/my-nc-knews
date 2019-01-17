const usersRouter = require('express').Router();
const { getUsers, getSpecificUser } = require('../controllers/users.js');
const { handle405 } = require('../errors/index.js');

usersRouter
  .route('/')
  .get(getUsers)
  .all(handle405);

usersRouter
  .route('/:username')
  .get(getSpecificUser)
  .all(handle405);

module.exports = usersRouter;
