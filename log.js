const chalk = require('chalk');

function getTimestamp() {
  const d = new Date();
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

function log(line, mod) {
  if (mod) return console.log(mod(line));
  console.log(`[${getTimestamp()}] ${line}`);
}

log.info = line => log(line, chalk.green);
log.debug = line => log(line, chalk.blue);
log.warn = line => log(line, chalk.yellow);
log.error = line => log(line, chalk.red);

module.exports = log;