define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionHeader',['$scope', '$stateParams', function($scope, $stateParams){
        $scope.open = $stateParams.open;
    }]).controller('Auction',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.open = $stateParams.open;
        $scope.contactsShow= false;
        $scope.showContacts = function () {
            $scope.contactsShow= true;
        }
        $scope.hideContacts = function () {
            $scope.contactsShow= false;
        }
    }])
});