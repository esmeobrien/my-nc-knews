const express = require('express');
const cors = require('cors');

const app = express();
const bodyParser = require('body-parser');
const apiRouter = require('./routers/apiRouter');
const {
  handle400, handle404, handle500, handle405, handle422,
} = require('./errors/index');

app.use(cors());

app.use(bodyParser.json());
app.use('/api', apiRouter);


app.use('/*', (req, res, next) => {
  res.status(404).send({ msg: 'page is not found' });
});

app.use(handle404);
app.use(handle422);
app.use(handle400);
app.use(handle405);
app.use(handle500);

module.exports = app;
