'use strict';

angular.module('oncheckinApp')
  .factory('participantService', function (firebaseRef, OnCompleteService, attendanceService, dateFilter, $firebase, orderByPriorityFilter, $q) {

    function add(chapterId, model) {
      // Create the new participant.
      var ref = firebaseRef('participants').push({
        firstName: model.firstName,
        lastName: model.lastName,
        alias: model.alias,
        chapter: chapterId
      });
      var id = ref.name();
      // Priority based on number of attendances.
      var priority = 0;
      // Link the participant to the chapter.
      var chapterRef = firebaseRef('chapters').child(chapterId);
      chapterRef.child('participants').child(id).setWithPriority(true, priority);

      return ref;
    }

    function positiveIntOrZero(n) {
      n = parseInt(n);
      return n > 0 ? n : 0;
    }

    function getLatestAttendance(id, maxDate) {
      var deferred = $q.defer();
      // Get the record.
      var ref = firebaseRef('participants').child(id);
      ref.once('value', function(snap) {
        // Primary data.
        var latest = null;
        var attendanceCount = 0;
        var hostCount = 0;
        // Legacy attendance data.
        var recordedAttendanceCount = snap.child('recordedAttendanceCount').val();
        var recordedHostCount = snap.child('recordedHostCount').val();
        var recordedLastAttendanceDate = snap.child('recordedLastAttendanceDate').val();
        // Accomodate missing legacy data.
        recordedAttendanceCount = positiveIntOrZero(recordedAttendanceCount);
        recordedHostCount = positiveIntOrZero(recordedHostCount);
        // Check for if legacy data should be accomodated.
        var hasLegacy = recordedLastAttendanceDate !== null;
        // Loop through attendances.
        snap.child('attendances').forEach(function(attendance) {
          // Get details about this attendance.
          var date = attendance.getPriority();
          var isHost = attendance.val().host;
          // Ensure the date is a string.
          // Assuming this is a date.
          if(!angular.isString(date)) {
            return;
          }
          // If this attendance occured before the use of this system,
          // then we're starting to back-fill data. Accomodate it in the counts.
          if(hasLegacy && date < recordedLastAttendanceDate) {
            recordedAttendanceCount--;
            if(isHost) {
              recordedHostCount--;
            }
          }
          // Ensure the date is earlier than the maxDate.
          if(date >= maxDate) {
            return;
          }
          // Increment the attendance count.
          attendanceCount++;
          // Increment the host count.
          if(isHost) {
            hostCount++;
          }
          // Check to see if this date is a better match than a prior date.
          if(latest === null || latest.getPriority() < date) {
            latest = attendance;
          }
        });
        // Resolve the promise with these attendance calculations.
        deferred.resolve({
          attendanceCount: attendanceCount + recordedAttendanceCount,
          hostCount: hostCount + recordedHostCount,
          date: latest ? latest.getPriority() : null,
          attendance: latest ? latest.name() : null,
          event: latest ? latest.val().event : null
        });
      });

      return deferred.promise;
    }

    function remove(id) {

      var onForeignKeysComplete = new OnCompleteService();
      var onComplete = new OnCompleteService();
      var onCompleteHandler = onComplete.handler();

      // Get the record.
      var ref = firebaseRef('participants').child(id);
      ref.once('value', function(snap) {
        // Get foreign keys.
        var chapterId = snap.val().chapter;

        // Remove participant reference.
        var chapterRef = firebaseRef('chapters').child(chapterId);
        chapterRef.child('participants').child(id).remove(onForeignKeysComplete.handler());

        // Remove all event attendances.
        snap.child('attendances').forEach(function(attendanceSnap) {
          var attendanceId = attendanceSnap.name();
          var promise = attendanceService.remove(attendanceId);
          onForeignKeysComplete.addPromise(promise);
        });

        // Remove the event record only after
        // the foreign references have been successfully removed.
        onForeignKeysComplete.all().then(function() {
          ref.remove(onCompleteHandler);
        });
      });

      return onComplete.all();
    }

    function updatePriority(id) {

      var onComplete = new OnCompleteService();
      var handlerA = onComplete.handler();
      var handlerB = onComplete.handler();

      var ref = firebaseRef('participants').child(id);
      ref.once('value', function(snap) {
        // Get foreign keys.
        var chapterId = snap.val().chapter;

        var attendanceCount = snap.child('attendances').numChildren();

        ref.setPriority(attendanceCount, handlerA);

        var chapterRef = firebaseRef('chapters').child(chapterId);
        // BUG: For whatever reason, `setPriority` is erroring, with no decent explanation.
        chapterRef.child('participants').child(id).setWithPriority(true, attendanceCount, handlerB);
      });

      return onComplete.all();
    }

    function updateProfile(id, model) {
      // Initiate deferred handlers.
      var onComplete = new OnCompleteService();
      // Update the record with the model and priority.
      var ref = firebaseRef('participants').child(id);
      ref.child('firstName').set(model.firstName, onComplete.handler());
      ref.child('lastName').set(model.lastName, onComplete.handler());
      ref.child('alias').set(model.alias, onComplete.handler());

      return onComplete.all();
    }

    function updateHistory(id, model) {
      // Initiate deferred handlers.
      var onComplete = new OnCompleteService();
      // Update the record with the model and priority.
      var ref = firebaseRef('participants').child(id);
      ref.child('recordedAttendanceCount').set(model.recordedAttendanceCount, onComplete.handler());
      ref.child('recordedHostCount').set(model.recordedHostCount, onComplete.handler());
      ref.child('recordedLastAttendanceDate').set(model.recordedLastAttendanceDate, onComplete.handler());

      onComplete.addPromise( updatePriority(id) );

      return onComplete.all();
    }

    return {
      add: function(chapterId, model) {
        return add(chapterId, model);
      },
      getLatestAttendance: function(id, maxDate) {
        return getLatestAttendance(id, maxDate);
      },
      remove: function(id) {
        return remove(id);
      },
      updateProfile: function(id, model) {
        return updateProfile(id, model);
      },
      updateHistory: function(id, model) {
        return updateHistory(id, model);
      }
    };
  });
