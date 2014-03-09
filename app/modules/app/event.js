'use strict';

angular.module('oncheckinApp')
  .controller('AppEventCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams) {
    
    // Get the event.
    var eventId = $stateParams.id;
    var eventRef = firebaseRef('events').child(eventId);

    // Initialize scope objects.
    $scope.event = $firebase(eventRef);
    $scope.eventId = eventId;

    // Join the event's attendance and participant data.
    var eventAttendancesRef = eventRef.child('attendances');
    var attendancesRef = firebaseRef('attendances');
    var participantsRef = firebaseRef('participants');
    var participantAttendancesRef = Firebase.util.intersection(
      eventAttendancesRef,
      {
        ref: attendancesRef,
        keyMap: {
          host: 'host',
          participant: participantsRef
        }
      });
    $scope.attendances = $firebase(participantAttendancesRef);

  });
