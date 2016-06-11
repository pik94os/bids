'use strict';

const gulp = require('gulp'),
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
    server = require('gulp-express');
    // serverFactory = require('spa-server');

const path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'public/',
        js: 'public/javascripts/',
        components_dev: 'public/components/',
        css: 'public/stylesheets/',
        img: 'public/images/',
        fonts: 'public/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: ['front/**/*.html','!front/templates/**/_*.html','!front/components/**/*.*'],
        js: 'front/javascripts/bootstrap.js',
        js_copy: ['front/components/requirejs/require.js','front/javascripts/production/main.js'],
        js_dev: ['front/components/requirejs/require.js', 'front/javascripts/**/*.js', '!front/javascripts/production/main.js'],
        components_dev: 'front/components/**/*.*',
        style: 'front/stylesheets/main.scss',
        img: 'front/images/**/*.*',
        fonts: ['front/fonts/**/*.*','front/components/bootstrap-sass/assets/fonts/**/*.*']
    },
    watch:{
        html: 'front/**/*.html',
        js: 'front/javascripts/**/*.js',
        style: 'front/stylesheets/**/*.scss',
        img: 'front/images/**/*.*',
        fonts: 'front/fonts/**/*.*',
        server: 'app/**/*.js'
    }
};

let options = {
    cwd: undefined
};
options.env = process.env;
options.env.NODE_ENV = 'development';

gulp.task('server', function () {
    server.stop();
    server.run(['app/bin/www'],options,false);
});

gulp.task('sass', () => {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write({includeContent: false}))
        .pipe(gulp.dest(path.build.css))
});


// gulp.task('webserver', () => {
//     var server = serverFactory.create({
//         path: './public',
//         port: normalizePort(process.env.PORT || '8888'),
// 		fallback: '/index.html'
//     });
//
//     server.start();
// });


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
                'uiSocket': '../components/angular-socket-io/socket.min',
                'uiStorage': '../components/ngstorage/ngStorage.min',
                'jquery': '../components/jquery/dist/jquery.min',
                'bstrap': '../components/bootstrap-sass/assets/javascripts/bootstrap.min',
                'localForage': '../components/localforage/dist/localforage.min',
                'angular-localForage': '../components/angular-localforage/dist/angular-localForage.min',
                'angular-svg-round-progressbar': '../components/angular-svg-round-progressbar/build/roundProgress.min',
                'io': './libs/socket.io-1.4.5'
            },
            // angular не поддерживает AMD из коробки, поэтому экспортируем перменную angular в глобальную область
            shim: {
                'io': {
                    exports: 'io'
                },
                'angular': {
                    deps: [],
                    exports: 'angular'
                },
                'jquery': {
                    deps: [],
                    exports: 'jquery'
                },
                'uiRouter' : ['angular'],
                'angular-localForage' : ['angular','localForage'],
                'uiSocket':['angular'],
                'uiStorage':['angular'],
                "bstrap" : ['jquery'],
                'angular-svg-round-progressbar' : ['angular']
            }
        }))
});

gulp.task("js_copy", () => {
    gulp.src(path.src.js_copy)
        .pipe(gulp.dest(path.build.js))
});

gulp.task("js_dev", () => {
    gulp.src(path.src.components_dev)
        .pipe(gulp.dest(path.build.components_dev))
    gulp.src(path.src.js_dev)
        .pipe(gulp.dest(path.build.js));
});

gulp.task('watch', () => {
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
    watch([path.watch.js], () => {
        gulp.start('js_dev');
    });
    watch([path.watch.server], () => {
        gulp.start('server');
    });
});

gulp.task('start',(cb) => {    
    runSequence(['js', 'js_copy', 'universal'], cb);
});

gulp.task('universal',(cb) => {
    runSequence(['fonts', 'sass', 'image', 'html'], cb);
});

gulp.task('default',(cb) => {
    runSequence(['js_dev','universal','server','watch'], cb);
});