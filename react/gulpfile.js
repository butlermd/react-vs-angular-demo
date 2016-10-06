'use strict';

var gulp = require('gulp');
var del = require('del');
require('babel-core/register')

// Load plugins
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream'),

  sourceFile = './app/scripts/app.js',

  destFolder = './dist/scripts',
  destFileName = 'app.js';

var less = require('gulp-less');

var babelify = require('babelify');
var exorcist = require('exorcist');
var buffer = require('vinyl-buffer');
var path = require('path');
var transform = require('vinyl-transform');
var mapFileName = '/app/scripts/app.js.map';

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var mocha = require('gulp-mocha');
var chai = require('chai');

// Styles
gulp.task('styles', ['less', 'moveCss']);

gulp.task('moveCss', ['clean'], function () {
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  gulp.src(['./app/styles/**/*.css'], {base: './app/styles/'})
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('less', function () {
  var injectFiles = gulp.src('../node_modules/bootstrap-less/bootstrap/index.less', {read: false});

  var injectOptions = {
    // transform: function (filePath) {
    //   filePath = filePath.replace(conf.paths.src + '/app/', '');
    //   return '@import "' + filePath + '";';
    // },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };

  return gulp.src('./app/styles/*.less')
    .pipe($.inject(injectFiles, injectOptions))
    .pipe(less({
      paths: [
        '.',
        // '../node_modules/bootstrap-less/bootstrap/index.less'
      ],
      relativeUrls : true
    }))
    .pipe(gulp.dest('dist/styles'));
});

var bundler = watchify(browserify({
  entries: [sourceFile],
  debug: true,
  insertGlobals: true,
  cache: {},
  packageCache: {},
  fullPaths: true
}));

bundler.transform(babelify.configure({
  sourceMapRelative: 'src'
}));

bundler.on('update', rebundle);
bundler.on('log', $.util.log);

function rebundle() {
  return bundler.bundle()
  // log errors if they happen
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(exorcist(mapFileName))
    .pipe(source(destFileName))
    .pipe(buffer())
    .pipe(gulp.dest(destFolder))
    .on('end', function () {
      reload();
    });
}
function bundle() {
  return bundler.bundle()
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(exorcist(mapFileName))
    .pipe(source(destFileName))
    .pipe(buffer())
    .pipe(gulp.dest(destFolder));
}

// Scripts
gulp.task('scripts', rebundle);

gulp.task('buildScripts', () => bundle());

gulp.task('test', function () {
  var jsdom = require('jsdom').jsdom;

  global.document = jsdom('');
  global.window = document.defaultView;
  global.navigator = {userAgent: 'node.js'};
  Object.keys(document.defaultView).forEach((property) => {
    if (typeof global[property] === 'undefined') {
      global[property] = document.defaultView[property];
    }
  });

  let enzyme = require('enzyme');

  return gulp.src(['app/scripts/**/*-spec.js'], {read: false})
    .pipe(mocha({
      reporter: 'spec',
      globals: {
        expect: chai.expect,
        should: chai.should,
        mount: enzyme.mount,
        shallow: enzyme.shallow
      }
    }))
});

// HTML
gulp.task('html', function () {
  return gulp.src('app/*.html')
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

// Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

// Fonts
gulp.task('fonts', function () {

  return gulp.src(['app/fonts/**/*'], {read: false})
    .pipe(gulp.dest('dist/fonts'));

});

// Clean
gulp.task('clean', function (cb) {
  $.cache.clearAll();
  cb(del.sync(['dist/styles', 'dist/scripts', 'dist/images']));
});

// Bundle
gulp.task('bundle', ['styles', 'scripts', 'bower'], function () {
  return gulp.src('./app/*.html')
    .pipe($.useref.assets())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('buildBundle', ['styles', 'buildScripts', 'moveLibraries', 'bower'], function () {
  return gulp.src('./app/*.html')
    .pipe($.useref.assets())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

// Move JS Files and Libraries
gulp.task('moveLibraries', ['clean'], function () {
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  gulp.src(['./app/scripts/**/*.js', './app/scripts/**/*.js.map'
  ], {base: './app/scripts/'})
    .pipe(gulp.dest('dist/scripts'));
});

// Bower helper
gulp.task('bower', function () {
  gulp.src('app/bower_components/**/*.js', {
    base: 'app/bower_components'
  })
    .pipe(gulp.dest('dist/bower_components/'));

});

gulp.task('json', function () {
  gulp.src('app/scripts/json/**/*.json', {
    base: 'app/scripts'
  })
    .pipe(gulp.dest('dist/scripts/'));
});

// Robots.txt and favicon.ico
gulp.task('extras', function () {
  return gulp.src(['app/*.txt', 'app/*.ico'])
    .pipe(gulp.dest('dist/'))
    .pipe($.size());
});

// Watch
gulp.task('watch', ['html', 'fonts', 'bundle'], function () {

  browserSync({
    notify: false,
    logPrefix: 'BS',
    port: 3020,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['dist', 'app'],
    //proxy: {
    //  target: 'http://www.localhost:3001',
    //  ws: true
    //}
  });

  // Watch .json files
  gulp.watch('app/scripts/**/*.json', ['json']);

  // Watch .html files
  gulp.watch('app/*.html', ['html']);

  gulp.watch(['app/styles/**/*.less', 'app/styles/**/*.css'], ['styles', 'scripts', reload]);

  // Watch image files
  gulp.watch('app/images/**/*', reload);
});

// Build
gulp.task('build', ['html', 'buildBundle', 'images', 'fonts', 'extras'], function () {
  gulp.src('dist/scripts/app.js')
    .pipe($.uglify())
    .pipe($.stripDebug())
    .pipe(gulp.dest('dist/scripts'));
});

// Default task
gulp.task('default', ['clean', 'build']);
