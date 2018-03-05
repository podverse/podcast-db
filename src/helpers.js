const present = require('present');

function logTime(message, previousTime) {
  if (process.env.includeTimeLogging) {
    console.log(`${message}:`);

    let currentTime = present();
    let elapsedTime = currentTime - previousTime;

    console.log(`Elapsed Time: ${elapsedTime}`);

    return currentTime;
  }
}

module.exports = {
  logTime: logTime
}
