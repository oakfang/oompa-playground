const Oompa = require('oompa');
const auth = require('./auth-client')();
const log = require('./log');
const { authenticated, tokenize, debug } = require('./middleware');
const ping = require('./pinger');
const db = require('./db-client')(42001);

const SECRET = 'circle-circle';

const appSchema = {
  MAIN_REGISTER: (user) => {
    return auth.add(user).then(id => db.createTable(id));
  },
  MAIN_LOGIN: ({username, password}) => {
    return auth.get(username, password);
  },
  MAIN_SET: ({key, value, auth}) => db.put(auth.id, key, value),
  MAIN_DEL: ({key, auth}) => db.del(auth.id, key),
  MAIN_GET: ({key, auth}) => db.findById(auth.id, key),
};

const PORT = 43236;

const server = new Oompa(appSchema, () => Promise.all([
  ping(db, 100),
  ping(auth, 100),
]));

server.use(debug);
server.use(tokenize(auth, SECRET, 'MAIN_LOGIN'));
server.use(authenticated(auth, new Set([
  'MAIN_SET',
  'MAIN_DEL',
  'MAIN_GET',
])));

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