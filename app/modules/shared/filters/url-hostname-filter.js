'use strict';

// Replaces `http` and `www` from urls.
angular.module('oncheckinApp')
  .filter('urlHostname', function () {
    return function(input) {
      return input.replace(/.*?:\/\/|www./g, "");
    };
  });
