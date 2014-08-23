var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

function task() {
  return browserify({
      entries: './src/modules/main.module.js',
      debug: true
    })
    //.transform('uglifyify')
    .bundle()
    .pipe(source('bundle.js'))
}

gulp.task('browserify', task);

module.exports = task;
