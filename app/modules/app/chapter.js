'use strict';

angular.module('oncheckinApp')
  .controller('AppChapterCtrl', function ($scope, $firebase, firebaseRef, Firebase, dateFilter, $modal, $stateParams, $state) {
    
    // Grab the list of chapters.
    var chapterRef = firebaseRef('chapters/' + $stateParams.id);
    var chaptersRef = firebaseRef('chapters');
    var eventsRef = firebaseRef('events');
    var participantsRef = firebaseRef('participants');

    // Initialize scope objects.
    $scope.chapter = $firebase(chapterRef);
    $scope.participants = $firebase(participantsRef);
    $scope.selectedParticipant = null;

    // Find all the events for each chapter.
    var chapterEventsRef = chapterRef.child('events');
    var eRef = Firebase.util.intersection(chapterEventsRef, eventsRef);
    $scope.chapterEvents = $firebase(eRef);

    // Find all the participants for each chapter.
    var chapterParticipantsRef = chapterRef.child('participants');
    var pRef = Firebase.util.intersection(chapterParticipantsRef, participantsRef);
    $scope.chapterParticipants = $firebase(pRef);

    $scope.selectParticipant = function() {
      console.log('woo', $scope.selectedParticipant);
    };

    function addEvent(model) {
      // Flatten the date object into a string.
      var date = dateFilter(model.date, 'yyyy-MM-dd');
      // Create the new event.
      var newEventRef = eventsRef.push({
        name: model.name,
        date: date,
        chapter: chapterRef.name()
      });
      // Set the priority.
      var priority = date;
      newEventRef.setPriority(priority);
      // Link the event to the chapter.
      chapterRef.child('events/' + newEventRef.name()).setWithPriority(true, priority);
      // Redirect to event view.
      $state.transitionTo('app.event', { id: newEventRef.name() });
    }

    $scope.openAddEventModal = function() {
      $modal
        .open({
          templateUrl: 'modules/modal/add-event.html',
          controller: 'ModalAddEventCtrl',
          resolve: {
            chapter: function() {
              return $scope.chapter;
            }
          }
        })
        .result.then(function(model) {
          addEvent(model);
        });
    };

    function addParticipant(model) {
      // Create the new participant.
      var newParticipantRef = participantsRef.push({
        firstName: model.firstName,
        lastName: model.lastName,
        alias: model.alias,
        chapter: chapterRef.name()
      });
      // Set the priority.
      var priority = [model.lastName, model.firstName].join(', ');
      newParticipantRef.setPriority(priority);
      // Link the participant to the chapter.
      chapterRef.child('participants/' + newParticipantRef.name()).setWithPriority(true, priority);
      // Redirect to participant view.
      $state.transitionTo('app.participant', { id: newParticipantRef.name() });
    }

    $scope.openAddParticipantModal = function() {
      $modal
        .open({
          templateUrl: 'modules/modal/add-participant.html',
          controller: 'ModalAddParticipantCtrl',
          resolve: {
            chapter: function() {
              return $scope.chapter;
            }
          }
        })
        .result.then(function(model) {
          addParticipant(model);
        });
    };

  });
