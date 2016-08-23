define(['./module'], function (filters) {
    'use strict';
    filters.filter('dateTimeFilter', function(){
        return function(str) {
            var options = {
                // era: 'long',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                // weekday: 'long',
                timezone: 'UTC',
                hour: 'numeric',
                minute: 'numeric'
                // second: 'numeric'
            };
            return new Date(str).toLocaleString('ru', options)
        }
    });
});