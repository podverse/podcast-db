const present = require('present');

function logTime(message, previousTime) {
  console.log(`${message}:`);

  let currentTime = present();
  let elapsedTime = currentTime - previousTime;

  console.log(`Elapsed Time: ${elapsedTime}`);

  return currentTime;
}

module.exports = {
  logTime: logTime
}
