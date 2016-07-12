define(['./module'], function (filters) {
    'use strict';
    filters.filter('htmlToPlaintext', function() {
        return function(text) {
            return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
        };
    });
});