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
    include = require("gulp-include"),
    htmlmin = require('gulp-htmlmin'),
    rjs = require('./r'),
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
        html: ['front/**/*.html','!front/templates/**/_*.html','!front/components/**/*.*'],
        js: 'front/javascripts/bootstrap.js',
        js_copy: ['front/components/requirejs/require.js','front/javascripts/main.js'],
        style: 'front/stylesheets/main.scss',
        img: 'front/images/**/*.*',
        fonts: ['front/fonts/**/*.*','front/components/bootstrap-sass/assets/fonts/**/*.*']
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


gulp.task('fonts',() => {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
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
        .pipe(include())//Объединим с шаблонами
        .pipe(htmlmin({collapseWhitespace: true}))//минимизируем
        .pipe(gulp.dest(path.build.html)); //Выплюнем их в папку build
});

gulp.task("js", () => {
    gulp.src(path.src.js)
        .pipe(rjs({
            baseUrl:'front/javascripts/',
            outPath:'public/javascripts/',
            paths: {
                'domReady': '../components/domReady/domReady',
                'angular': '../components/angular/angular.min',
                'uiRouter': '../components/angular-ui-router/release/angular-ui-router.min',
                'jquery': '../components/jquery/dist/jquery.min',
                'bstrap': '../components/bootstrap-sass/assets/javascripts/bootstrap.min'
            },
            // angular не поддерживает AMD из коробки, поэтому экспортируем перменную angular в глобальную область
            shim: {
                'angular': {
                    deps: [],
                    exports: 'angular'
                },
                'uiRouter':{
                    deps: ['angular']
                },
                "bstrap" : {
                    "deps" :['jquery']
                }
            }
        }))
});

gulp.task("js_copy", () => {
    gulp.src(path.src.js_copy)
        .pipe(gulp.dest(path.build.js))
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
    watch([path.watch.fonts], () => {
        gulp.start('fonts');
    });
});

gulp.task('start',(cb) => {
    runSequence(['fonts', 'js', 'js_copy', 'sass', 'image', 'html'], cb);
});

gulp.task('default',(cb) => {
    runSequence(['start','webserver','watch'], cb);
});