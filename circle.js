const Oompa = require('oompa');
const auth = require('./auth-client')();
const log = require('./log');
const tokenize = require('oompa-token');
const ensure = require('oompa-ensure');
const { debug } = require('./middleware');
const db = require('./db-client')(42001);

const SECRET = 'circle-circle';

const appSchema = {
  MAIN_REGISTER: (user) => {
    return auth.add(user).then(id => db.createTable(id));
  },
  MAIN_LOGIN: ({username, password}) => {
    return auth.get(username, password);
  },
  MAIN_SET: ({key, value, user}) => db.put(user.id, key, value),
  MAIN_DEL: ({key, user}) => db.del(user.id, key),
  MAIN_GET: ({key, user}) => db.findById(user.id, key),
};

const PORT = 43236;

const server = new Oompa(appSchema, () => Promise.all([
  db.ping(100),
  db.ping(100),
]));

server.use(debug);
server.use(ensure('MAIN_GET', 'token'));
server.use(ensure('MAIN_DEL', 'token'));
server.use(ensure('MAIN_SET', 'token'));
server.use(tokenize(SECRET, 'MAIN_LOGIN'));

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