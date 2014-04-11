'use strict';

// Replaces `http` and `www` from urls.
module.exports = function() {
  return function(input) {
    return input.replace(/.*?:\/\/|www./g, "");
  };
};
