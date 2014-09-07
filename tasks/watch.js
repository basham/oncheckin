var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('watch', ['browser-sync'], function() {
  gulp.watch('src/**/*.{css,less}', ['styles']);
  gulp.watch('src/**/*.{js,json}', ['scripts', browserSync.reload]);
  gulp.watch('src/modules/**/*.html', ['build-html', browserSync.reload]);
  gulp.watch('src/{.htaccess,*.txt,404*}', ['copy', browserSync.reload]);
  gulp.watch('src/index.html', ['index-html', browserSync.reload]);
});
