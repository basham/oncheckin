'use strict';

module.exports = function($scope, firebaseRef, $firebase, Firebase, $stateParams, attendanceService) {

  // Get the event.
  var eventId = $stateParams.id;
  var eventRef = firebaseRef('events').child(eventId);

  // Initialize scope objects.
  $scope.selected = {
    participant: null
  };

  function hasStringMatch(source, input) {
    return source.search(new RegExp(input, 'i')) >= 0
  }

  $scope.filterParticipants = function(value) {
    return function(item) {
      // Retain those matching a name.
      var hasAliasMatch = hasStringMatch(item.alias, value);
      var hasFirstNameMatch = hasStringMatch(item.firstName, value);
      var hasLastNameMatch = hasStringMatch(item.lastName, value);
      if(!(hasAliasMatch || hasFirstNameMatch || hasLastNameMatch)) {
        return false;
      };
      // Retain those who are not already attending.
      var isAttending = false;
      $scope.participantAttendancesRef.once('value', function(snap) {
        snap.forEach(function(s) {
          var val = s.val();
          var match = val['.id:participant'] === item.$id;
          isAttending = match ? true : isAttending;
        });
      });
      if(isAttending) {
        return false;
      }

      return true;
    };
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

};
