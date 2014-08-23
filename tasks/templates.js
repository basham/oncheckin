var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var templateCache = require('gulp-angular-templatecache');
var browserSync = require('browser-sync');

var moduleName = require('../src/app.json').name;

function task() {
  return gulp.src('./src/modules/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(templateCache({
      module: moduleName
    }))
    .pipe(browserSync.reload({
      stream: true
    }));
}

gulp.task('templates', task);

module.exports = task;
