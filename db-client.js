const OompaClient = require('oompa/client');

const methods = {
  createTable: {
    type: 'CREATE_TABLE',
    factory: (name) => ({name}),
  },
  findAll: {
    type: 'SELECT',
    factory: (table, query) => ({table, query: {
      method: 'filter',
      filter: query,
    }}),
  },
  findOne: {
    type: 'SELECT',
    factory: (table, query) => ({table, query: {
      method: 'find',
      filter: query,
    }}),
  },
  findById: {
    type: 'SELECT',
    factory: (table, id) => ({table, query: {
      method: 'get',
      filter: id,
    }}),
  },
  del: {
    type: 'DELETE',
    factory: (table, key) => ({table, key}),
  },
  updateOne: {
    type: 'UPDATE',
    factory: (table, query, changes) => ({table, changes, query: {
      method: 'find',
      filter: query,
    }}),
  },
  updateById: {
    type: 'UPDATE',
    factory: (table, id, changes) => ({table, changes, query: {
      method: 'get',
      filter: id,
    }}),
  },
  put: {
    type: 'UPDATE',
    factory: (table, id, changes) => ({table, changes, setBy: id}),
  },
  updateAll: {
    type: 'UPDATE',
    factory: (table, query, changes) => ({table, changes, query: {
      method: 'filter',
      filter: query,
    }}),
  },
  create: {
    type: 'INSERT',
    factory: (table, entity, identifier, explicitId) =>
      ({table, entity, identifier, explicitId}),
  },
  ping: {
    type: 'PING',
    factory: () => null,
  },
};

module.exports = (port) => new OompaClient(`ws://localhost:${port}`,
                                           methods);