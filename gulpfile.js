'use strict';
 
var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    rename          = require('gulp-rename'),
    minifyCss       = require('gulp-minify-css'),
    uglify          = require('gulp-uglify'),
    concat          = require('gulp-concat'),
    fs              = require('fs'),
    browserSync     = require('browser-sync'),
    nodemon         = require('gulp-nodemon'),
    autoprefixer    = require('gulp-autoprefixer');

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
    gulp.task('libcss', function () {
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
        var projectScriptDir = './javascripts/';

        fs.readFile(projectScriptDir + 'import.json', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }

            data = JSON.parse(data)["import"];

            var jsImport = [];

            for(var i in data) {
                var path = data[i];

                var res = path.split("/");

                if(res.length > 1) {
                    res[res.length - 1] = '_' + res[res.length - 1];

                    path = res.join("/");
                } else {
                    path = '_' + path;
                }

                jsImport.push(projectScriptDir + path + '.js');
            }
        
            return gulp.src(jsImport)
                .pipe(concat('script.js'))
                .pipe(gulp.dest(projectJsPath))
                .pipe(rename('script.min.js'))
                .pipe(uglify())
                .pipe(gulp.dest(projectJsPath));
        });
    });

/********************************************************
* LIBRARY SCRIPTS                                       *
********************************************************/
    gulp.task('libscripts', function() {
        return gulp.src(['./node_modules/jquery/dist//jquery.js'])
            .pipe(concat('lib.js'))
            .pipe(gulp.dest(projectJsPath))
            .pipe(rename('lib.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest(projectJsPath));
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
    gulp.task('init',['libcss', 'libscripts', 'fonts']);

/********************************************************
* SETUP BROWSER SYNC                                    *
********************************************************/
    gulp.task('browser-sync', ['nodemon'], function() {
        browserSync.init(null, {
            proxy: "http://localhost:3000",
            files: ["public/**/*.*"],
            port: "5000"
        });
    });

/********************************************************
* SETUP NODEMON                                         *
********************************************************/
    gulp.task('nodemon', function (cb) {       
        var started = false;
        
        return nodemon({
            script: './bin/www',
            env: { 'NODE_ENV': 'development' }
        }).on('start', function () {
            if (!started) {
                cb();
                started = true; 
            }  
        });
    });

/********************************************************
* WATCH TASKS                                           *
********************************************************/
    gulp.task('watch', function () {
        gulp.watch(['./sass/**/*.scss'], ['sass']);
        gulp.watch(['./javascripts/**/*.js'], ['scripts']);
    });

/********************************************************
* DEFAULT TASKS                                         *
********************************************************/
    gulp.task('default',['watch', 'browser-sync']);