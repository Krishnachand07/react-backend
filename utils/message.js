const moment = require("moment");

function messageformat(user, text) {
  return {
    user,
    text,
    time: moment().format("h:mm a"),
  };
}

module.exports = messageformat; 
