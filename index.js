const circle = require('./client')();
let token;
circle.register({username: 'foo3', password: 'bar1'})
  .then(() => circle.login('foo3', 'bar1'))
  .then(t => token = t)
  .then(() => circle.set(token, 'myKey', { meow: 5 }))
  .then(() => circle.get(token, 'myKey'))
  .then(data => console.log(data))
  .catch(console.error);