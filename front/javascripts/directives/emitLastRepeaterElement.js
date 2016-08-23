/**
 * Created by Shulgin Roman Konstantinovich on 19.03.16.
 */
define(['./module'], function (directives) {
    'use strict';
    directives.directive('emitLastRepeaterElement', function() {
        return function(scope) {
            if (scope.$last){
                scope.$emit('LastRepeaterElement');
            }
        };
    });
});