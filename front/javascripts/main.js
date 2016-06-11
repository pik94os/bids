/**
 * Created by Роман on 07.12.2014.
 */
require.config({
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
    },
    deps: ['./bootstrap']
});