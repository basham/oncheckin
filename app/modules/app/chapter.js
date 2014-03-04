'use strict';

angular.module('oncheckinApp')
  .controller('AppChapterCtrl', function ($scope, $firebase, firebaseRef, Firebase, dateFilter, hashNameFilter, $modal, $stateParams) {
    
    // Grab the list of chapters.
    var chapterRef = firebaseRef('chapters/' + $stateParams.id);
    var chaptersRef = firebaseRef('chapters');
    var eventsRef = firebaseRef('events');
    var participantsRef = firebaseRef('participants');


    // Initialize scope objects.
    $scope.chapters = $firebase(chaptersRef);
    $scope.eventsByChapter = {};
    $scope.participantsByChapter = {};
    $scope.newEvent = { name: 'Hash', date: new Date() };
    $scope.newParticipant = { firstName: '', lastName: '', alias: '' };

    $scope.participants = $firebase(participantsRef);
    $scope.selectedParticipant = null;
    $scope.chapter = $firebase(chapterRef);

    // Find all the events for each chapter.
    var chapterEventsRef = chapterRef.child('events');
    var eRef = Firebase.util.intersection(chapterEventsRef, eventsRef);
    $scope.chapterEvents = $firebase(eRef);

    // Find all the participants for each chapter.
    var chapterParticipantsRef = chapterRef.child('participants');
    var pRef = Firebase.util.intersection(chapterParticipantsRef, participantsRef);
    $scope.chapterParticipants = $firebase(pRef);

    $scope.removeEvent = function(eventKey, chapterKey) {
      firebaseRef('chapters/' + chapterKey + '/events/' + eventKey).remove();
      firebaseRef('events/' + eventKey).remove();
    };

    $scope.addParticipant = function(chapterKey) {
      // Grab ref to the chapter.
      var chapterRef = firebaseRef('chapters/' + chapterKey);
      // Create the new participant.
      var newParticipantRef = participantsRef.push({
        firstName: $scope.newParticipant.firstName,
        lastName: $scope.newParticipant.lastName,
        alias: $scope.newParticipant.alias,
        chapter: chapterRef.name()
      });
      // Set the priority.
      var priority = [$scope.newParticipant.lastName, $scope.newParticipant.firstName].join(', ');
      newParticipantRef.setPriority(priority);
      // Link the participant to the chapter.
      chapterRef.child('participants/' + newParticipantRef.name()).setWithPriority(true, priority);
    };

    $scope.removeParticipant = function(participantKey, chapterKey) {
      firebaseRef('chapters/' + chapterKey + '/participants/' + participantKey).remove();
      firebaseRef('participants/' + participantKey).remove();
    };

    $scope.$watch('newParticipant.firstName', function() {
      $scope.newParticipant.suggestedAlias = hashNameFilter($scope.newParticipant);
    });

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
    }

    $scope.openNewEventModal = function() {
      $modal
        .open({
          templateUrl: 'modules/modal/new-event.html',
          controller: 'ModalNewEventCtrl',
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

  });