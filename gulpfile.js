'use strict';

var connectLr         = require('connect-livereload'),
    express           = require('express'),
    app               = express(),
    expressPort       = 4000,
    expressRoot       = require('path').resolve('./.tmp'),
    gulp              = require('gulp'),
    liveReloadPort    = 35729,
    lrServer          = require('tiny-lr')(),
    permitIndexReload = true,
    plugins           = require('gulp-load-plugins')(),
    publicDir         = require('path').resolve('./dist'),
    source            = require('vinyl-source-stream'),
    watchify          = require('watchify'),
    browserify        = require('browserify');

var moduleName = require('./app/app.json').name;

function startExpress() {
  app.use(connectLr());
  app.use(express.static(expressRoot));
  app.listen(expressPort);
}

function startLiveReload() {
  lrServer.listen(liveReloadPort, function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

function notifyLivereload(fileName) {
  if (fileName !== 'index.html' || permitIndexReload) {
    lrServer.changed({ body: { files: [fileName] } });

    if (fileName === 'index.html') {
      permitIndexReload = false;
      setTimeout(function() { permitIndexReload = true; }, 5000);
    }
  }
}

//
// Clean up the previous build.
//
function clean(relativePath, cb) {
  plugins.util.log('Cleaning: ' + plugins.util.colors.blue(relativePath));

  gulp
    .src([(publicDir + relativePath), (expressRoot + relativePath)], {read: false})
    .pipe(plugins.rimraf({force: true}))
    .on('end', cb || function() {});
}

function scripts(cb) {
  var bundler = watchify('./app/modules/main.module.js');

  function rebundle() {
    clean('/scripts/app*.js', function() {
      plugins.util.log('Rebuilding application JS bundle');

      return bundler.bundle({ debug: true })
        .pipe(source('app.js'))
        .pipe(gulp.dest(expressRoot + '/scripts'))
        .pipe(plugins.streamify(plugins.uglify({ mangle: false })))
        .pipe(plugins.streamify(plugins.rev()))
        .pipe(plugins.streamify(plugins.size({ showFiles: true })))
        .pipe(gulp.dest(publicDir + '/scripts'))
        .on('end', cb || function() {})
        .on('error', plugins.util.log);
    });
  }

  bundler.on('update', rebundle);
  bundler.on('error', plugins.util.log);
  rebundle();
}

function styles(cb) {
  clean('/styles/main*.css', function() {
    plugins.util.log('Rebuilding application styles');

    gulp.src([
        'app/styles/main.less',
        'app/bower_components/normalize-css/normalize.css'
      ])
      .pipe(plugins.concat('main.css'))
      .pipe(plugins.plumber())
      .pipe(plugins.less({
        paths: ['app/bower_components'],
        sourceMap: false
        //includePaths: ['app/bower_components'],
        //sourceComments: 'map'
      }))
      .pipe(plugins.autoprefixer())
      .pipe(gulp.dest(expressRoot + '/styles'))
      .pipe(plugins.minifyCss())
      .pipe(plugins.streamify(plugins.rev()))
      .pipe(plugins.size({ showFiles: true }))
      .pipe(gulp.dest(publicDir + '/styles'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function templates(cb) {
  clean('/scripts/templates*.js', function() {
    plugins.util.log('Rebuilding templates');

    gulp.src('app/modules/**/*.html')
      .pipe(plugins.angularTemplatecache({
        module: moduleName
      }))
      //.pipe(plugins.streamify(plugins.rev()))
      .pipe(gulp.dest(expressRoot + '/scripts'))
      .pipe(plugins.streamify(plugins.rev()))
      .pipe(gulp.dest(publicDir + '/scripts'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function shims(cb) {
  clean('/scripts/shims*.js', function() {
    plugins.util.log('Rebuilding shims JS bundle');

    var bc = 'app/bower_components/';
    gulp.src([
        bc + 'es5-shim/es5-shim.js',
        bc + 'json3/lib/json3.min.js'
      ])
      .pipe(plugins.concat('shims.js'))
      .pipe(plugins.streamify(plugins.uglify({ mangle: false })))
      .pipe(plugins.streamify(plugins.rev()))
      .pipe(plugins.size({ showFiles: true }))
      .pipe(gulp.dest(expressRoot + '/scripts'))
      .pipe(gulp.dest(publicDir + '/scripts'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function vendor(cb) {
  clean('/scripts/vendor*.js', function() {
    plugins.util.log('Rebuilding vendor JS bundle');

    var bc = 'app/bower_components/';
    gulp.src([
        bc + 'angular/angular.min.js',
        bc + 'angular-resource/angular-resource.js',
        bc + 'angular-cookies/angular-cookies.min.js',
        bc + 'angular-sanitize/angular-sanitize.min.js',
        bc + 'angular-route/angular-route.min.js',
        bc + 'firebase/firebase.js',
        bc + 'angular-mocks/angular-mocks.js',
        bc + 'firebase-simple-login/firebase-simple-login.js',
        bc + 'angularfire/angularfire.min.js',
        bc + 'angular-ui-router/release/angular-ui-router.min.js',
        bc + 'underscore/underscore.js',
        bc + 'angular-underscore/angular-underscore.min.js',
        bc + 'angular-bootstrap/ui-bootstrap.min.js',
        bc + 'angular-bootstrap/ui-bootstrap-tpls.min.js',
        bc + 'moment/min/moment.min.js',
        bc + 'angular-moment/angular-moment.min.js',
        bc + 'firebase-util/firebase-util.min.js',
        bc + 'fastclick/lib/fastclick.js'
      ])
      .pipe(plugins.concat('vendor.js'))
      .pipe(plugins.streamify(plugins.uglify({ mangle: false })))
      .pipe(plugins.streamify(plugins.rev()))
      .pipe(plugins.size({ showFiles: true }))
      .pipe(gulp.dest(expressRoot + '/scripts'))
      .pipe(gulp.dest(publicDir + '/scripts'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function images(cb) {
  clean('/images', function() {
    plugins.util.log('Minifying images');

    gulp.src('app/images/**/*.*')
      .pipe(plugins.imagemin())
      .pipe(plugins.size({ showFiles: true }))
      .pipe(gulp.dest(expressRoot + '/images'))
      .pipe(gulp.dest(publicDir + '/images'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function fonts(cb) {
  clean('/styles/fonts/icons', function() {
    plugins.util.log('Copying fonts');

    gulp.src('app/styles/fonts/icons/*.*')
      .pipe(gulp.dest(publicDir + '/styles/fonts/icons'))
      .pipe(gulp.dest(expressRoot + '/styles/fonts/icons'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

//
// Injects <script> into index.html.
//
// `<!-- inject:app:js --><!-- endinject -->`
//
function indexHtml(cb) {
  plugins.util.log('Rebuilding index.html');

  function inject(glob, path, tag) {
    return plugins.inject(
      gulp.src(glob, {
        cwd: path
      }), {
        starttag: '<!-- inject:' + tag + ':{{ext}} -->'
      }
    );
  }

  function buildIndex(path, cb) {
    gulp.src('app/index.html')
      .pipe(inject('./styles/main*.css', path, 'app-style'))
      .pipe(inject('./scripts/shim*.js', path, 'shim'))
      .pipe(inject('./scripts/vendor*.js', path, 'vendor'))
      .pipe(inject('./scripts/app*.js', path, 'app'))
      .pipe(inject('./scripts/templates*.js', path, 'templates'))
      .pipe(gulp.dest(path))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  }

  buildIndex(expressRoot, cb || function(){});
  buildIndex(publicDir, function(){});
}

gulp.task('vendor', function () {
  vendor(indexHtml);
});

gulp.task('default', function () {
  startExpress();
  startLiveReload();
  fonts();
  images();
  vendor(indexHtml);
  styles(indexHtml);
  templates(indexHtml);
  shims(indexHtml);
  scripts(function() {
    indexHtml(function() {
      notifyLivereload('index.html');
    });
  });

  gulp.watch('app/scripts/shims.js', function() {
    shims(function() {
      indexHtml(function() {
        notifyLivereload('index.html');
      });
    });
  });

  gulp.watch(['app/styles/**/*', '!app/styles/fonts/**/*'], function() {
    styles(function() {
      indexHtml(function() {
        notifyLivereload('styles/main.css');
      });
    });
  });

  gulp.watch('app/styles/fonts/**/*', function() {
    fonts(function() {
      styles(function() {
        indexHtml(function() {
          notifyLivereload('styles/app.css');
        });
      });
    });
  });

  gulp.watch('app/images/**/*', function() {
    images(function() {
      indexHtml(function() {
        notifyLivereload('index.html');
      });
    });
  });

  gulp.watch('app/modules/**/*.html', function() {
    templates(function() {
      indexHtml(function() {
        notifyLivereload('index.html');
      });
    });
  });

  gulp.watch('app/index.html', function() {
    indexHtml(function() {
      notifyLivereload('index.html');
    });
  });
});
