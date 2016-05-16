define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('CalendarHeader',['$scope', '$stateParams', function($scope, $stateParams){
        $scope.open = $stateParams.open;
    }]).controller('Calendar',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.open = $stateParams.open;
    }])
});