'use strict';

angular.module('oncheckinApp')
  .controller('AppEventCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams, $state, $modal, $q) {
    
    // Grab the event.
    var eventRef = firebaseRef('events').child($stateParams.id);
    var participantsRef = firebaseRef('participants');
    var attendancesRef = firebaseRef('attendances');

    // Initialize scope objects.
    $scope.event = $firebase(eventRef);

    // Join the event's attendance and participant data.
    var eventAttendancesRef = eventRef.child('attendances');
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

    eventRef.once('value', function(snap) {
      var chapterId = snap.val().chapter;
      var chapterRef = firebaseRef('chapters').child(chapterId);
      $scope.chapter = $firebase(chapterRef);

      // Find all the participants for each chapter.
      var chapterParticipantsRef = chapterRef.child('participants');
      var pRef = Firebase.util.intersection(chapterParticipantsRef, participantsRef);
      $scope.participants = $firebase(pRef);

      $scope.removeEvent = function() {
        $modal
          .open({
            templateUrl: 'modules/modal/remove-event.html',
            controller: 'ModalRemoveEventCtrl',
            resolve: {
              event: function() {
                return $scope.event;
              }
            }
          })
          .result.then(function(model) {
            // Redirect to the chapter view once the event is removed.
            removeEvent(eventRef.name()).then(function() {
              $state.transitionTo('app.chapter', { id: chapterId });
            });
          });
      };
    });

    function removeEvent(id) {

      var onForeignKeysComplete = new OnCompleteFactory();
      var onComplete = new OnCompleteFactory();
      var onCompleteHandler = onComplete.handler();

      // Get the event record.
      var ref = firebaseRef('events').child(id);
      ref.once('value', function(snap) {
        // Get foreign keys.
        var chapterId = snap.val().chapter;

        // Remove participant reference.
        var chapterRef = firebaseRef('chapters').child(chapterId);
        chapterRef.child('events').child(id).remove(onForeignKeysComplete.handler());

        // Remove all event attendances.
        snap.child('attendances').forEach(function(attendanceSnap) {
          var attendanceId = attendanceSnap.name();
          var promise = removeAttendance(attendanceId);
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

    $scope.selectParticipant = function() {
      addAttendance($scope.selectedParticipant.$id, eventRef.name());
      // Clear typeahead selection.
      $scope.selectedParticipant = null;
    };

    function addAttendance(participantId, eventId) {
      // Get attendance reference.
      var attendancesRef = firebaseRef('attendances');
      // Create attendance.
      var isHost = false;
      var newAttendanceRef = attendancesRef.push({
        event: eventId,
        participant: participantId,
        host: isHost
      });
      var id = newAttendanceRef.name();
      // Set priority to host. Priority can't be boolean.
      var priority = isHost ? 1 : 0;
      newAttendanceRef.setPriority(priority);
      // Add event reference.
      var eventRef = firebaseRef('events').child(eventId);
      eventRef.child('attendances').child(id).setWithPriority(true, priority);
      // Add participant reference.
      var participantRef = firebaseRef('participants').child(participantId);
      participantRef.child('attendances').child(id).setWithPriority(true, priority);
    }

    $scope.setHost = function(attendance, value) {
      var attendanceRef = firebaseRef('attendances').child(attendance.$id);
      attendanceRef.child('host').set(value);
    };

    $scope.removeAttendance = function(attendance) {
      removeAttendance(attendance.$id);
    };

    function OnCompleteFactory() {
      // All promises part of this grouping.
      var promises = [];

      this.handler = function() {
        // Create and store a deferred promise.
        var deferred = $q.defer();
        this.addPromise(deferred.promise);
        // Create a unique on complete handler using this deferred.
        return function(error) {
          if(error) {
            deferred.reject(error);
            return;
          }
          deferred.resolve();
        };
      };

      this.addPromise = function(promise) {
        promises.push(promise);
      };

      this.all = function() {
        return $q.all(promises);
      };
    };

    function removeAttendance(id) {

      var onForeignKeysComplete = new OnCompleteFactory();
      var onComplete = new OnCompleteFactory();
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
    };

  });
