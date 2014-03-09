'use strict';

angular.module('oncheckinApp')
  .controller('AppEventEditAttendanceCtrl', function ($scope, firebaseRef, $firebase, Firebase, $stateParams, attendanceService) {
    
    // Get the event.
    var eventId = $stateParams.id;
    var eventRef = firebaseRef('events').child(eventId);

    // Initialize scope objects.
    $scope.selected = {
      participant: null
    };

    $scope.selectParticipant = function() {
      attendanceService.add($scope.selected.participant.$id, eventId);
      // Clear typeahead selection.
      $scope.selected.participant = null;
    };

    $scope.setHost = function(attendance, value) {
      attendanceService.setHost(attendance.$id, value);
    };

    $scope.removeAttendance = function(attendance) {
      attendanceService.remove(attendance.$id);
    };

    eventRef.once('value', function(snap) {
      var chapterId = snap.val().chapter;
      // Find all the participants for each chapter.
      var chapterParticipantsRef = firebaseRef('chapters').child(chapterId).child('participants');
      var participantsRef = firebaseRef('participants');
      var pRef = Firebase.util.intersection(chapterParticipantsRef, participantsRef);
      $scope.participants = $firebase(pRef);
    });

  });
