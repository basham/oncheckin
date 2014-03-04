'use strict';

angular.module('oncheckinApp')
  .controller('AppEventCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams) {
    
    // Grab the event.
    var eventRef = firebaseRef('events/' + $stateParams.id);

    eventRef.once('value', function(snap) {
      var chapterRef = firebaseRef('chapters/' + snap.val().chapter);
      $scope.chapter = $firebase(chapterRef);
    });

    // Initialize scope objects.
    $scope.event = $firebase(eventRef);

  });
