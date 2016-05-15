/**
 * Created by Роман on 07.12.2014.
 */
define([
    'angular',
    'uiRouter',
    'angular-svg-round-progressbar',
    './controllers/index',
    './filters/index',
    './directives/index'
], function (ng) {
    'use strict';

    return ng.module('app', [
        'ui.router',
        'angular-svg-round-progressbar',
        'app.controllers',
        'app.filters',
        'app.directives'
    ]);
});