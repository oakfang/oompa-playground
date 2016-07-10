const low = require('lowdb');
const Oompa = require('oompa');
const log = require('./log');
const { debug } = require('./middleware');

const [stringPort, DB_FILE] = process.argv.slice(2);
const PORT = +stringPort;
const DB = low(DB_FILE);

const appSchema = {
  CREATE_TABLE: ({name}) => {
    if (DB.get(name).value()) return true;
    return DB.set(name, {}).value();
  },
  SELECT: ({query, table}) => {
    return DB.get(table)[query.method](query.filter).value();
  },
  INSERT: ({entity, table, identifier, explicitId}) => {
    identifier = identifier || 'id';
    explicitId = explicitId === undefined ? entity[indentifier] : explicitId;
    if (DB.get(table).has(explicitId).value()) {
      throw new Error('Unique consraint violated');
    }
    return DB.get(table).set(explicitId, entity);
  },
  UPDATE: ({query, changes, table, setBy}) => {
    if (setBy) {
      DB.set(`${table}.${setBy}`, changes).value();
      return changes;
    }
    const result = DB.get(table)[query.method](query.filter).value();
    if (Array.isArray(result)) {
      return result.forEach(ent => Object.assign(ent, changes));
    }
    if (result && !setBy) {
      return Object.assign(ent, changes);
    }
    return null;
  },
  DELETE: ({key, table}) => {
    return DB.unset(`${table}.${setBy}`).value();
  },
};

const server = new Oompa(appSchema);
server.use(debug);

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