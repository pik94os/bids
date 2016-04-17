/**
 * Created by Роман on 07.12.2014.
 */
define([
    'require',
    'angular',
    'app',
    'domReady',
    'routes'
], function (require, angular) {
    'use strict';

    require(['domReady!'], function (document) {
        angular.bootstrap(document, ['app']);
    });
});