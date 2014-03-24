'use strict';

angular.module('oncheckinApp')
  .controller('AppEventCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams, pageTitleService) {

    // Get the event.
    var eventId = $stateParams.id;
    var eventRef = firebaseRef('events').child(eventId);

    // Initialize scope objects.
    $scope.event = $firebase(eventRef);
    $scope.eventId = eventId;

    // Promise to send the page title.
    var titleDeferred = pageTitleService.defer('app.event');

    // Resolve the promised page title.
    eventRef.once('value', function(snap) {
      var eventName = snap.val().name;
      titleDeferred.resolve(eventName);
    });

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

    // Get the chapter record.
    eventRef.once('value', function(snap) {
      var chapterId = snap.val().chapter;
      var chapterRef = firebaseRef('chapters').child(chapterId);
      $scope.chapter = $firebase(chapterRef);
    });

  });
