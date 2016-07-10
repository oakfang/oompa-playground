const OompaClient = require('oompa/client');

const url = 'ws://localhost:43234';
const methods = {
  add: {
    type: 'AUTH_ADD',
    factory: (user) => user,
  },
  get: {
    type: 'AUTH_GET',
    factory: (username, password) => ({username, password}),
  },
  update: {
    type: 'AUTH_UPDATE',
    factory: (username, password, changes) => ({username, password, changes}),
  },
};

module.exports = () => new OompaClient(url, methods);