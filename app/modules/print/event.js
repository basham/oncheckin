'use strict';

module.exports = function($scope, $firebase, firebaseRef, Firebase, $stateParams, participantService, $q, pageTitleService) {

  // Get the event.
  var eventId = $stateParams.id;
  var eventRef = firebaseRef('events').child(eventId);

  // Initialize scope objects.
  $scope.event = $firebase(eventRef);
  $scope.eventId = eventId;

  // Promise to send the page title.
  var titleDeferred = pageTitleService.defer('print.event');

  // Resolve the promised page title.
  eventRef.once('value', function(snap) {
    var eventName = snap.val().name;
    titleDeferred.resolve(['Roster', eventName]);
  });

  var filterPriority = {
    all: '',
    attending: '!0'
  };
  $scope.filterPriority = filterPriority.all;
  $scope.order = [
    '-priority',
    '-records.attendanceCount',
    '-records.hostCount',
    '-records.date',
    'lastName',
    'firstName'
  ];

  $scope.signinMark = function(priority) {
    if( priority === 2 ) {
      return 'HARE';
    }
    if( priority == 1 ) {
      return 'X';
    }
    return '';
  };

  $scope.isAnniversary = function(n) {
    if( n % 5 === 0 || n === 69 || n === 6 ) {
      return true;
    }
    return false;
  };

  var participantsDeferred = $q.defer();
  var attendancesDeferred = $q.defer();
  var attendanceRecordsDeferred = $q.defer();
  var rosterPromises = [
    participantsDeferred.promise,
    attendancesDeferred.promise,
    attendanceRecordsDeferred.promise
  ];
  $q.all(rosterPromises).then(function(resolved) {
    var participants = resolved[0];
    var attendances = resolved[1];
    var attendanceRecords = resolved[2];
    var arr = [];
    angular.forEach(participants, function(participant, pId) {
      // Assign other data to this record.
      participant.$id = pId;
      participant.attendance = attendances[pId];
      participant.records = attendanceRecords[pId].attendance;
      // Priority is a helper for sorting.
      // If there's no attendance record for this event, priority is `0`.
      // Increment priority if attending or hosting.
      participant.priority = 0;
      if( participant.attendance ) {
        participant.priority++;
        if( participant.attendance.host ) {
          participant.priority++;
        }
      }
      arr.push(participant);
    });
    $scope.participants = arr;
  });

  // Join the event's attendance and participant data.
  var eventAttendancesRef = eventRef.child('attendances');
  var attendancesRef = firebaseRef('attendances');
  var participantAttendancesRef = Firebase.util.intersection(eventAttendancesRef, attendancesRef);

  participantAttendancesRef.once('value', function(snap) {
    // Index the records according to the participant id.
    var attendances = {};
    snap.forEach(function(s) {
      var val = s.val();
      var pId = val.participant;
      attendances[pId] = val;
    });
    attendancesDeferred.resolve(attendances);
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
    pRef.once('value', function(participantsSnap) {
      participantsDeferred.resolve(participantsSnap.val());
    });

    chapterParticipantsRef.once('value', function(snap) {
      // Create a deferred group for all the attendance records.
      var promises = [];
      snap.forEach(function(participant) {
        var pId = participant.name();
        var deferred = $q.defer();
        promises.push(deferred.promise);
        // Once the record is generated.
        participantService.getLatestAttendance(pId, date).then(function(attendance) {
          // Resolve the promise.
          deferred.resolve({
            participantId: pId,
            attendance: attendance
          });
        });
      });
      // Resolve the parent promise.
      $q.all(promises).then(function(resolved) {
        // Index the records according to the participant id.
        var records = {};
        angular.forEach(resolved, function(record) {
          records[record.participantId] = record;
        });
        attendanceRecordsDeferred.resolve(records);
      });
    });
  });

};
