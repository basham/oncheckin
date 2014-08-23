var gulp = require('gulp');
var merge = require('merge-stream');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var gzip = require('gulp-gzip');

var browserify = require('./browserify');
var templates = require('./templates');

gulp.task('scripts', function() {
  return merge(browserify(), templates())
    // Buffer until gulp-concat supports streams.
    // https://github.com/wearefractal/gulp-concat/issues/38
    .pipe(buffer())
    .pipe(concat('scripts.js'))
    //.pipe(gzip())
    .pipe(gulp.dest('./dist/assets'));
});
