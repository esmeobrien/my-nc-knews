
const endpoints = {
  '/api': 'GET which returns status 404 if the client enters an endpoint that does not exist',
  '/api/topics': 'GET which responds with an array of topic objects & POST which allows a post of an object which contains a slug and description property',
  '/api/topics/:topic/articles': 'GET which returns an array of articles for a given topic with correct keys & POST which responds with a posted article',
  '/api/articles': 'GET responds with an array of article objects',
  '/api/articles/:article_id': 'GET responds with an array of article objects & PATCH accepts an object and vote is increased if integer if positve & DELETE deletes the given article by `article_id`',
  '/api/articles/:article_id/comments': 'GET responds with an array of comment objects & POST returns posted comment as an object',
  '/api/articles/:article_id/comments/:comment_id': 'PATCH if a postive integer is given, takes an object and increases the comment votes & DELETE removes given article by article id',
  '/api/users': 'GET responds with an array of user objects',
  '/api/users/:username': 'GET responds with an array of user objects',
};


export default endpoints;
