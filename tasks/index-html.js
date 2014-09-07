var gulp = require('gulp');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var merge = require('merge-stream');
var filter = require('gulp-filter');

var styles = require('./styles');

var icons = require('./icons');

gulp.task('index-html', function() {
  /*
  //var assets = gulp.src('./dist/assets/*')
  var assets = merge(styles())
    .pipe(rev())
    .pipe(gulp.dest('./dist/assets'));

  var index = gulp.src('./src/index.html');

  return merge(assets, index)
    .pipe(revReplace())
    .pipe(filter('*.html'))
    .pipe(gulp.dest('./dist'));
  */

  return gulp.src('./src/index.html')
    .pipe(icons.inject())
    .pipe(gulp.dest('./dist'));
});
