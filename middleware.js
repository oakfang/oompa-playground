const jwt = require('jsonwebtoken');
const log = require('./log');

module.exports.debug = (request, next) => {
  log.debug(JSON.stringify(request));
  return next(request);
};