const circle = require('./client')();
let token;
circle.login('foo', 'bar')
  .then(user => token = user.token)
  .then(() => circle.set(token, 'myKey', { meow: 8 }))
  .then(() => circle.get(token, 'myKey'))
  .then(data => console.log(data.meow))
  .catch(console.error);