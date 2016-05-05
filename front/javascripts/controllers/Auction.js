define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionHeader',['$scope', '$stateParams', function($scope, $stateParams){
        $scope.open = $stateParams.open;
    }]).controller('Auction',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.open = $stateParams.open;
    }])
});