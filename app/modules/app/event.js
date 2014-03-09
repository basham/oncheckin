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

    var chapterJoinRef

    eventRef.once('value', function(snap) {
      var chapterRef = firebaseRef('chapters').child(snap.val().chapter);
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
            removeEvent(chapterRef);
          });
      };
    });

    function removeEvent(chapterRef) {
      chapterRef.child('events').child(eventRef.name()).remove();
      eventRef.remove();
      $state.transitionTo('app.chapter', { id: chapterRef.name() });
    }

    $scope.selectParticipant = function() {
      addAttendance($scope.selectedParticipant);
    };

    function addAttendance(participant) {
      // Get attendance reference.
      var attendancesRef = firebaseRef('attendances');
      var participantRef = firebaseRef('participants').child(participant.$id);
      // Create attendance.
      var isHost = false;
      var newAttendanceRef = attendancesRef.push({
        event: eventRef.name(),
        participant: participantRef.name(),
        host: isHost
      });
      // Set priority to host. Priority can't be boolean.
      var priority = isHost ? 1 : 0;
      newAttendanceRef.setPriority(priority);
      // Add foreign references.
      eventRef.child('attendances').child(newAttendanceRef.name()).setWithPriority(true, priority);
      participantRef.child('attendances').child(newAttendanceRef.name()).setWithPriority(true, priority);
      // Clear typeahead selection.
      $scope.selectedParticipant = null;
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
        promises.push(deferred.promise);
        // Create a unique on complete handler using this deferred.
        return function(error) {
          if(error) {
            deferred.reject(error);
            return;
          }
          deferred.resolve();
        };
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
