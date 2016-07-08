const jwt = require('jsonwebtoken');
const log = require('./log');

module.exports.debug = (request, next) => {
  log.debug(JSON.stringify(request));
  return next(request);
};

module.exports.tokenize = (auth, secret, loginTask) => {
  return (request, next) => {
    if (request.type === loginTask) {
      return next(request).then(() => jwt.sign(request.payload, secret));
    }
    if ('token' in request.payload) {
      const token = request.payload.token;
      const auth = jwt.verify(token, secret);
      request.payload.auth = auth;
      return next(request);
    }
    return next(request);
  };
};

module.exports.authenticated = (auth, protectedTasks) => (request, next) => {
  if (!protectedTasks.has(request.type)) return next(request);
  const { username, password } = request.payload.auth;
  return auth.get(username, password).then(user => {
    request.payload.auth = user;
    return next(request);
  });
};

module.exports.cache = (hashers) => {
  const _c = Object.keys(hashers).reduce((cs, t) => {
    cs[t] = {};
    return cs;
  }, {});
  return (request, next) => {
    if (request.type in hashers) {
      const url = hashers[request.type](request.payload);
      if (url in _c[request.type]) {
        return _c[request.type][url];
      }
      return next(request).then(value => {
        _c[request.type][url] = value;
        return value;
      });
    }
    return next(request);
  };
};