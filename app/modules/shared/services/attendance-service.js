'use strict';

angular.module('oncheckinApp')
  .factory('attendanceService', function (firebaseRef, OnCompleteService) {

    function add(participantId, eventId) {
      // Get attendance reference.
      var attendancesRef = firebaseRef('attendances');
      // Create attendance.
      var isHost = false;
      var ref = attendancesRef.push({
        event: eventId,
        participant: participantId,
        host: isHost
      });
      var id = ref.name();
      // Set priority to host. Priority can't be boolean.
      // Lower number is prioritized higher.
      var priority = isHost ? 0 : 1;
      // Add event reference.
      var eventRef = firebaseRef('events').child(eventId);
      eventRef.child('attendances').child(id).setWithPriority(true, priority);
      // Add participant reference. Priority based on event date.
      eventRef.once('value', function(snap) {
        var date = snap.val().date;
        var participantRef = firebaseRef('participants').child(participantId);
        participantRef.child('attendances').child(id).setWithPriority(true, date);
      });

      return ref;
    }

    function remove(id) {

      var onForeignKeysComplete = new OnCompleteService();
      var onComplete = new OnCompleteService();
      var onCompleteHandler = onComplete.handler();

      // Get the attendance record.
      var ref = firebaseRef('attendances').child(id);
      ref.once('value', function(snap) {
        // Get foreign keys.
        var value = snap.val();
        var participantId = value.participant;
        var eventId = value.event;

        // Remove participant reference.
        var participantRef = firebaseRef('participants').child(participantId);
        participantRef.child('attendances').child(id).remove(onForeignKeysComplete.handler());

        // Remove event reference.
        var eventRef = firebaseRef('events').child(eventId);
        eventRef.child('attendances').child(id).remove(onForeignKeysComplete.handler());

        // Remove the attendance record only after
        // the foreign references have been successfully removed.
        onForeignKeysComplete.all().then(function() {
          ref.remove(onCompleteHandler);
        });
      });

      return onComplete.all();
    }

    function setHost(id, value) {
      var attendanceRef = firebaseRef('attendances').child(id);
      attendanceRef.child('host').set(value);
    }

    return {
      add: function(participantId, eventId) {
        return add(participantId, eventId);
      },
      remove: function(id) {
        return remove(id);
      },
      setHost: function(id, value) {
        setHost(id, value);
      }
    };
  });
