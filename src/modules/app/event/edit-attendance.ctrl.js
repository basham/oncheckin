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

  $scope.order = '-approximateAttendanceCount';

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
    // Add an appoximation of the number of attendances of a participant
    // to provide more meaningful sort order in typeahead component.
    // This is an approximate count because this isn't taking into account
    // that there could be overlap between the attendance values.
    pRef.once('value', function(participants) {
      var a = [];
      participants.forEach(function(p) {
        p = p.val();
        var aCount = p.recordedAttendanceCount || 0;
        var bCount = Object.keys(p.attendances || {}).length;
        p.approximateAttendanceCount = aCount + bCount;
        a.push(p);
      });
      $scope.participants = a;
    });
  });

};
