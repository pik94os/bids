define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionLeading',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.hasStream = true;
        $scope.roomName =  $stateParams.auctionId;
        $scope.isBroadcasting = '';
        $scope.prepare = function prepare() {
            $scope.$broadcast('prepare');
        };
        $scope.start = function start() {
            $scope.$broadcast('start');
        };
    }])
});