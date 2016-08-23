define(['./module'], function (filters) {
    'use strict';
    filters.filter('toLocaleString', function () {
        return function (str) {
            return (parseInt(str)).toLocaleString() || str
        }
    });
});