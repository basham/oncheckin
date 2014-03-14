'use strict';

angular.module('oncheckinApp')
  .controller('PrintEventCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams, participantService) {

    // Get the event.
    var eventId = $stateParams.id;
    var eventRef = firebaseRef('events').child(eventId);

    // Initialize scope objects.
    $scope.event = $firebase(eventRef);
    $scope.eventId = eventId;

    $scope.attendanceByParticipantId = [];
    $scope.latestAttendanceDateByParticipantId = [];

    // Join the event's attendance and participant data.
    var eventAttendancesRef = eventRef.child('attendances');
    var attendancesRef = firebaseRef('attendances');
    var participantAttendancesRef = Firebase.util.intersection(eventAttendancesRef, attendancesRef);

    participantAttendancesRef.once('value', function(snap) {
      snap.forEach(function(s) {
        var val = s.val();
        var pId = val.participant;
        $scope.attendanceByParticipantId[pId] = val;
      });
    });

    // Get the chapter record.
    eventRef.once('value', function(snap) {
      var value = snap.val();
      var date = value.date;
      var chapterId = value.chapter;
      var chapterRef = firebaseRef('chapters').child(chapterId);
      $scope.chapter = $firebase(chapterRef);

      var chapterParticipantsRef = firebaseRef('chapters').child(chapterId).child('participants');

      var participantsRef = firebaseRef('participants');
      var pRef = Firebase.util.intersection(chapterParticipantsRef, participantsRef);
      $scope.participants = $firebase(pRef);

      chapterParticipantsRef.once('value', function(snap) {
        snap.forEach(function(participant) {
          var pId = participant.name();
          participantService.getLatestAttendance(pId, date).then(function(attendance) {
            $scope.latestAttendanceDateByParticipantId[pId] = attendance.getPriority();
          });
        });
      });
    });

  });
