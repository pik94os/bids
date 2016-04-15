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
        css: 'public/stylesheets/',
        img: 'public/images/',
        fonts: 'public/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: ['front/**/*.html','!front/templates/**/_*.html','!front/bower_components/**/*.*'],
        js: 'front/javascripts/bootstrap.js',
        js_copy: ['front/bower_components/requirejs/require.js','front/javascripts/main.js'],
        style: 'front/stylesheets/main.scss',
        img: 'front/images/**/*.*',
        fonts: 'front/fonts/**/*.*'
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



gulp.task('image',() => {
    return gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.build.img));
});

gulp.task('html',() => {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        // .pipe(include())//Объединим с шаблонами
        // .pipe(htmlmin({collapseWhitespace: true}))//минимизируем
        .pipe(gulp.dest(path.build.html)); //Выплюнем их в папку build
});

gulp.task('watch', function(){
    watch([path.watch.html], () => {
        gulp.start('html');
    });
    watch([path.watch.style], () => {
        gulp.start('sass');
    });
    watch([path.watch.img], () => {
        gulp.start('image');
    });
});

gulp.task('default',(cb) => {
    runSequence(['sass', 'html','webserver','watch'], cb);
});