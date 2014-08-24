var gulp = require('gulp');
var bower = require('main-bower-files');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var gzip = require('gulp-gzip');

gulp.task('vendor', function() {
  return gulp.src(bower({
      filter: /\.js$/i,
      debugging: true
    }), {
      base: './bower_components'
    })
    //.pipe(uglify())
    .pipe(concat('vendor.js'))
    //.pipe(gzip())
    .pipe(gulp.dest('./dist/assets'));
});
