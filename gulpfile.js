'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    runSequence = require('run-sequence'),
    serverFactory = require('spa-server');

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'public/',
        js: 'public/javascripts/',
        css: 'public/stylesheets/'
    },
    src: { //Пути откуда брать исходники
        html: ['front/**/*.html','!front/templates/**/_*.html','!front/bower_components/**/*.*'],
        js: 'front/javascripts/bootstrap.js',
        js_copy: ['front/bower_components/requirejs/require.js','front/javascripts/main.js'],
        style: 'front/stylesheets/main.scss',
        img: 'front/images/**/*.*',
    },
    watch:{
        html: 'front/**/*.html',
        js: 'front/javascripts/**/*.js',
        style: 'front/stylesheets/**/*.scss',
        img: 'front/images/**/*.*',
        fonts: 'front/fonts/**/*.*'
    }
};

gulp.task('sass', () => {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
});


gulp.task('webserver', () => {
    var server = serverFactory.create({
        path: './public',
        port: 8888
    });

    server.start();
});

gulp.task('watch', function(){
    watch(['./*.scss'], () => {
        gulp.start('sass');
    });
});

gulp.task('default',(cb) => {
    runSequence(['sass','webserver','watch'], cb);
});