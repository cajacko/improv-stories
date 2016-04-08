var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

/********************************************************
* DEFINE PROJECTS AND THEIR PATHS                       *
********************************************************/
var projectCssPath = './public/stylesheets/';
var projectJsPath = './public/javascripts/';

/********************************************************
* SASS                                                  *
********************************************************/
gulp.task('sass', function() {
    return gulp.src('./sass/import.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename('style.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(projectCssPath))
        .pipe(rename('style.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest(projectCssPath));
});

/********************************************************
* LIBRARY CSS                                           *
********************************************************/
gulp.task('libcss', function() {
    return gulp.src(['./node_modules/normalize.css/normalize.css', './node_modules/font-awesome/css/font-awesome.css'])
        .pipe(concat('lib.css'))
        .pipe(gulp.dest(projectCssPath))
        .pipe(rename('lib.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest(projectCssPath));
});

/********************************************************
* SCRIPTS                                               *
********************************************************/
gulp.task('scripts', function() {
    return browserify('./client_javascripts/import.js')
        .bundle() // Compile the js
        .pipe(source('script.js')) //Pass desired output filename to vinyl-source-stream
        .pipe(gulp.dest(projectJsPath)) // Output the file
        .pipe(buffer()) // convert from streaming to buffered vinyl file object
        .pipe(rename('script.min.js')) // Rename the minified version
        .pipe(uglify()) // Minify the file
        .pipe(gulp.dest(projectJsPath)); // Output the minified file
});

/********************************************************
* FONT AWESOME                                          *
********************************************************/
gulp.task('fonts', function() {
    gulp.src('./node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('./public/fonts/'));
});

/********************************************************
* INIT TASK                                             *
********************************************************/
gulp.task('init',['libcss', 'scripts', 'fonts']);

/********************************************************
* SETUP BROWSER SYNC                                    *
********************************************************/
gulp.task('browser-sync', ['nodemon'], function() {
    browserSync.init(null, {
        proxy: 'http://localhost:3000',
        files: ['public/**/*.*'],
        port: '5000'
    });
});

/********************************************************
* SETUP NODEMON                                         *
********************************************************/
gulp.task('nodemon', function(cb) {
    var started = false;

    return nodemon({
        script: './bin/www',
        env: {'NODE_ENV': 'development'},
        ignore: [
            './client_javascripts/**/*.js',
            './public/',
            './gulpfile.js'
        ]
    }).on('start', function() {
        if (!started) {
            cb();
            started = true;
        }
    });
});

/********************************************************
* WATCH TASKS                                           *
********************************************************/
gulp.task('watch', function() {
    gulp.watch(['./sass/**/*.scss'], ['sass']);
    gulp.watch(['./client_javascripts/**/*.js'], ['scripts']);
});

/********************************************************
* DEFAULT TASKS                                         *
********************************************************/
gulp.task('default',['watch', 'browser-sync']);
