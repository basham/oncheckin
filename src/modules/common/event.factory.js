'use strict';

module.exports = function(firebaseRef, OnCompleteService, attendanceService, dateFilter) {

  function add(chapterId, model) {
    // Flatten the date object into a string.
    var date = dateFilter(model.date, 'yyyy-MM-dd');
    // Create the new event.
    var ref = firebaseRef('events').push({
      name: model.name,
      date: date,
      chapter: chapterId
    });
    var id = ref.name();
    // Set the priority.
    var priority = date;
    ref.setPriority(priority);
    // Link the event to the chapter.
    var chapterRef = firebaseRef('chapters').child(chapterId);
    chapterRef.child('events').child(id).setWithPriority(true, priority);

    return ref;
  }

  function remove(id) {

    var onForeignKeysComplete = new OnCompleteService();
    var onComplete = new OnCompleteService();
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

  function update(id, model) {
    // Initiate deferred handlers.
    var onComplete = new OnCompleteService();
    // Flatten the date object into a string.
    var date = dateFilter(model.date, 'yyyy-MM-dd');
    // Set the priority.
    var priority = date;
    // Update the event with the model and priority.
    var ref = firebaseRef('events').child(id);
    ref.setPriority(priority, onComplete.handler());
    ref.child('name').set(model.name, onComplete.handler());
    ref.child('date').set(date, onComplete.handler());

    return onComplete.all();
  }

  return {
    add: add,
    remove: remove,
    update: update
  };
};
