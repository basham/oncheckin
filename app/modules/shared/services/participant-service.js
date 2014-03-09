'use strict';

angular.module('oncheckinApp')
  .factory('participantService', function (firebaseRef, OnCompleteService, attendanceService) {
    
    function add(chapterId, model) {
      // Create the new participant.
      var ref = firebaseRef('participants').push({
        firstName: model.firstName,
        lastName: model.lastName,
        alias: model.alias,
        chapter: chapterId
      });
      var id = ref.name();
      // Set the priority.
      var priority = [model.lastName, model.firstName].join(', ');
      ref.setPriority(priority);
      // Link the participant to the chapter.
      var chapterRef = firebaseRef('chapters').child(chapterId);
      chapterRef.child('participants').child(id).setWithPriority(true, priority);

      return ref;
    }

    function remove(id) {

      var onForeignKeysComplete = new OnCompleteService();
      var onComplete = new OnCompleteService();
      var onCompleteHandler = onComplete.handler();

      // Get the event record.
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

    return {
      add: function(chapterId, model) {
        return add(chapterId, model);
      },
      remove: function(id) {
        return remove(id);
      }
    };
  });
