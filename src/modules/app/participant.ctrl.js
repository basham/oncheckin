'use strict';

module.exports = function($scope, $firebase, firebaseRef, Firebase, $stateParams, $state, $modal, participantService, pageTitleService, hashNameFilter) {

  // Get the participant record.
  var participantId = $stateParams.id;
  var participantRef = firebaseRef('participants').child(participantId);

  // Initialize scope objects.
  $scope.participantId = participantId;
  $scope.participant = $firebase(participantRef);

  // Promise to send the page title.
  var titleDeferred = pageTitleService.defer('app.participant');

  // Resolve the promised page title.
  participantRef.once('value', function(snap) {
    var alias = hashNameFilter(snap.val());
    titleDeferred.resolve(alias);
  });

  // Join the event's attendance and participant data.
  var participantAttendancesRef = participantRef.child('attendances');
  var attendancesRef = firebaseRef('attendances');
  var eventsRef = firebaseRef('events');
  var participantAttendancesEventsRef = Firebase.util.intersection(
    attendancesRef,
    {
      ref: participantAttendancesRef,
      keyMap: {
        host: 'host',
        event: eventsRef
      }
    });
  $scope.attendances = $firebase(participantAttendancesEventsRef);

  function diffDays(d1, d2) {
    // Convert strings to dates.
    var a = new Date(d1);
    var b = new Date(d2);
    // Calculate diff in days.
    return (a - b) / (1000 * 60 * 60 * 24);
  };

  participantAttendancesEventsRef.once('value', function(snap) {
    var count = 0;
    angular.forEach(snap.val(), function(attendance) {
      var d1 = Date.now();
      var d2 = new Date(attendance.event.date);
      if(diffDays(d1, d2) < 365) {
        count++;
      }
    });
    $scope.attendanceCountOverLastYear = count;
  });

  participantRef.once('value', function(snap) {
    var chapterId = snap.val().chapter;
    var chapterRef = firebaseRef('chapters').child(chapterId);
    $scope.chapter = $firebase(chapterRef);

    $scope.removeParticipant = function() {
      $modal
        .open({
          templateUrl: 'modules/modal/remove-participant.html',
          controller: 'ModalRemoveParticipantCtrl',
          resolve: {
            participant: function() {
              return $scope.participant;
            }
          }
        })
        .result.then(function(model) {
          // Redirect to the chapter view once the participant is removed.
          participantService.remove(participantId).then(function() {
            $state.transitionTo('app.chapter', { id: chapterId });
          });
        });
    };
  });

  participantService.getLatestAttendance(participantId).then(function(attendance) {
    $scope.attendanceRecord = attendance;
  });

};
