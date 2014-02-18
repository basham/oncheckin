'use strict';

angular.module('oncheckinApp')
  .controller('AppChaptersCtrl', function ($scope, $firebase, firebaseRef) {
    
    // Grab the list of chapters.
    var chaptersRef = firebaseRef('chapters');

    // Initialize scope objects.
    $scope.chapters = $firebase(chaptersRef);
    $scope.events = {};

    // Iterate through each chapter once the data is available.
    chaptersRef.once('value', function(chaptersSnap) {
      chaptersSnap.forEach(function(chapterSnap) {
        // Grab and store the data for each event.
        chapterSnap.child('events').forEach(function(eventSnap) {
          var eventId = eventSnap.name();
          var eventRef = firebaseRef('events/' + eventId);
          $scope.events[eventId] = $firebase(eventRef);
        });
      });
    });

  });
