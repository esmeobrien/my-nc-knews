const knex = require('knex');

const ENV = process.env.NODE_ENV || 'development';
const config = require('../knexfile')[ENV]; // [ENV] Takes it to the correct environment

const connection = knex(config);
module.exports = connection;

// we dont know whether its test or environment
// so we do const ENV = process.env.NODE_ENV || 'development'; which defaults to environment
// if we console log connection we have a list of functions so we want to export that
