'use strict';

angular.module('oncheckinApp')
  .controller('AppChaptersCtrl', function ($scope, $firebase, firebaseRef) {
    
    // Grab the list of chapters.
    var chaptersRef = firebaseRef('chapters');
    var eventsRef = firebaseRef('events');

    // Initialize scope objects.
    $scope.chapters = $firebase(chaptersRef);
    $scope.events = {};

    $scope.addEvent = function(chapterKey) {
      var chapterRef = firebaseRef('chapters/' + chapterKey);
      var newEventRef = eventsRef.push({
        name: 'Hash',
        date: (new Date()).toString(),
        chapter: chapterRef.name()
      });
      chapterRef.child('events/' + newEventRef.name()).set(true);
    };

    $scope.removeEvent = function(eventKey, chapterKey) {
      firebaseRef('chapters/' + chapterKey + '/events/' + eventKey).remove();
      firebaseRef('events/' + eventKey).remove();
    };

    // Iterate through each chapter once the data is available.
    chaptersRef.on('value', function(chaptersSnap) {
      chaptersSnap.forEach(function(chapterSnap) {
        // Grab and store the data for each event.
        chapterSnap.child('events').forEach(function(eventSnap) {
          var eventId = eventSnap.name();
          // Create the reference only if it's not already initialized.
          if( angular.isUndefined($scope.events[eventId]) ) {
            var eventRef = firebaseRef('events/' + eventId);
            $scope.events[eventId] = $firebase(eventRef);
          }
        });
      });
    });

  });
