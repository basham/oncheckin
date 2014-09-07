var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('build-html', function(callback) {
  runSequence('scripts', 'index-html', callback);
});
