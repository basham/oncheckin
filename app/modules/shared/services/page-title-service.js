'use strict';

angular.module('oncheckinApp')
  .factory('pageTitleService', function ($state, $q, $rootScope, config) {

    // Defer contributing to the page title.
    function defer(stateName) {
      // Create the deferrer.
      var deferred = $q.defer();
      // Get the indicated state.
      var state = $state.get(stateName);
      // Create the data object if nonexistent.
      if( angular.isUndefined(state.data) ) {
        state.data = {};
      }
      // Assign the promise to the state's title.
      state.data.title = deferred.promise;
      // Update the page title.
      update();
      // Return the deferred, to be resolved elsewhere.
      return deferred;
    }

    // Update the page title according to the current state.
    function update() {
      // Get the current state.
      var state = $state.current;
      // Array of all titles, be them strings or promises.
      var promises = [];
      // Get all parts of the state name
      // and use it to loop through its ancestory.
      var partsA = state.name.split('.');
      var partsB = [];
      // Find all possible state titles.
      while( partsA.length ) {
        // Cycle through from upmost state to child.
        partsB.push(partsA.shift());
        // Get the state data.
        var stateName = partsB.join('.');
        var data = $state.get(stateName).data;
        // Ignore states without a title.
        if( angular.isUndefined(data) || angular.isUndefined(data.title) ) {
          continue;
        }
        // Queue the titles, decendent to ancestor.
        promises.unshift(data.title);
      }
      // Use the default page title if there's no alternative.
      if( promises.length === 0 ) {
        promises.push(config.defaultPageTitle);
      }
      // Update the page title
      $q.all(promises).then(function(res) {
        // Destination array.
        var arr = [];
        // Inspect each returned title part.
        angular.forEach(res, function(value) {
          // Concat or add to the array, depending on the object type.
          // Ignore anything not an array or string.
          if( angular.isArray(value) ) {
            arr = arr.concat(value);
          }
          else if( angular.isString(value) ) {
            arr.push(value);
          }
        });
        // Complete the title by joining all the parts.
        $rootScope.pageTitle = arr.join(config.pageTitleDelimiter);
      });
    }

    return {
      defer: defer,
      update: update
    };
  });
