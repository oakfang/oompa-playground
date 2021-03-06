const Oompa = require('oompa');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;
const log = require('./log');
const cache = require('oompa-cache');
const db = require('./db-client')(42000);

const appSchema = {
  AUTH_ADD: user => {
    user.id = uuid();
    return db.create('users', jwt.sign(user, user.password),
                     'username', user.username).then(() => user.id);
  },
  AUTH_GET: ({username, password}) => {
    return db.findById('users', username).then(user => {
      if (!user) throw new Error('No such user');
      return jwt.verify(user, password);
    });
  },
  AUTH_UPDATE: (data) => {
    const {username, password, changes} = data;
    return db.findById('users', username).then(user => {
      if (!user) throw new Error('No such user');
      data[cache.invalidate].AUTH_GET(`${username}:-:${password}`);
      return jwt.verify(user, password);
    }).then(data => {
      const user = Object.assign({}, data, changes);
      return db.put('users', data.username, jwt.sign(user, user.password));
    });
  },
};

const PORT = 43234;

const server = new Oompa(appSchema, () => db.ping(100));
server.use(cache('AUTH_GET', Infinity, ({username, password}) => `${username}:-:${password}`));

db.on('reconnected', () => db.createTable('users'));

db.createTable('users').then(() => {
  server
    .on('connection',
        () => log.info('Connection created'))
    .on('terminated',
        () => log.info('Connection terminated'))
    .on('error',
        err => log.error(`Server error: ${err}`))
    .on('reply',
        ({type, id}) => log.debug(`[${type}] for request #${id}`))
    .on('stale',
        ({type, id}) => log.warn(`[${type}] for stale request #${id}`))
    .listen(PORT).then(() => log.info(`Listening on port ${PORT}`));
});