var gulp = require('gulp');

gulp.task('copy', function() {
  return gulp.src('./src/{.htaccess,*.txt,404*}')
    .pipe(gulp.dest('./dist'));
});
