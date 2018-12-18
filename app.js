const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const apiRouter = require('./routers/apiRouter');

app.use(bodyParser.json());
app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send(err);
});

module.exports = app;
