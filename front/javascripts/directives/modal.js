/**
 * Created by pik on 20.04.16.
 */
define(['./module'], function (directives) {
    'use strict';
    directives.directive('modal', function() {
        return  {
            scope: {
                title: '@',
                width: '@',
                data: '='
            },
            restrict: 'E',
            templateUrl: '/templates/modal.html',
            replace: true,
            transclude: true
        };
    });
});