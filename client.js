const OompaClient = require('oompa/client');

const url = 'ws://localhost:43236';
const methods = {
  register: {
    type: 'MAIN_REGISTER',
    factory: (user) => user,
  },
  login: {
    type: 'MAIN_LOGIN',
    factory: (username, password) => ({username, password}),
  },
  get: {
    type: 'MAIN_GET',
    factory: (token, key) => ({token, key}),
  },
  set: {
    type: 'MAIN_SET',
    factory: (token, key, value) => ({token, key, value}),
  },
  del: {
    type: 'MAIN_DEL',
    factory: (token, key) => ({token, key}),
  },
};

module.exports = () => new OompaClient(url, methods);