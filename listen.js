/* eslint "no-console": 0 */
const app = require('./app');

app.listen(9090, (err) => {
  if (err) console.log(err);
  else console.log('server listening on  9090');
});
