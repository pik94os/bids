define(['./module'], function (filters) {
    'use strict';
    filters.filter('GetStop', function(){
        return function(str,from,to) {
            return str.indexOf('1', from)+1 && str.indexOf('1', from)<=to && str.lastIndexOf('1')>to
        }
    });
});