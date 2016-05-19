define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('RoomHeader',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.countdown = $stateParams.countdown;
    }]).controller('Room',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.countdown = $stateParams.countdown;
    }])
});