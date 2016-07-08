define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionHeader',['$scope', '$stateParams', function($scope, $stateParams){
        $scope.open = $stateParams.open;
    }]).controller('Auction',['$scope','$http', '$rootScope', '$stateParams', 'ngSocket', 'FileUploader', function($scope,$http,$rootScope,$stateParams,ngSocket,FileUploader){
        $scope.open = $stateParams.open;
        $scope.contactsShow= false;
        $scope.showContacts = function () {
            $scope.contactsShow= true;
        }
        $scope.hideContacts = function () {
            $scope.contactsShow= false;
        }

        // получение списка лотов выбранного аукциона
        ngSocket.emit('auction/getLotList', {
            auctionId: $stateParams.auctionId
        });
        ngSocket.on('lotList', function (data) {
            $scope.lotList = JSON.parse(JSON.stringify(data.lotList));
        });


    }]);
});