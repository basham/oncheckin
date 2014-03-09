'use strict';

angular.module('oncheckinApp')
  .factory('OnCompleteService', function ($q) {
    
    function OnCompleteFactory() {
      // All promises part of this grouping.
      var promises = [];

      this.handler = function() {
        // Create and store a deferred promise.
        var deferred = $q.defer();
        this.addPromise(deferred.promise);
        // Create a unique on complete handler using this deferred.
        return function(error) {
          if(error) {
            deferred.reject(error);
            return;
          }
          deferred.resolve();
        };
      };

      this.addPromise = function(promise) {
        promises.push(promise);
      };

      this.all = function() {
        return $q.all(promises);
      };
    };

    return OnCompleteFactory;
  });
