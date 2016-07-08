module.exports = (service, timeput) => () => {
  return new Promise((resolve, reject) => {
    const timeoutError = setTimeout(() => reject(new Error('Timeout error')), timeout);
    service.ping().then(() => {
      clearTimeout(timeoutError);
      resolve();
    }).catch(reject);
  })
};