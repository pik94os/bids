define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionLeading',['$state','$scope','$http', '$rootScope', '$stateParams', 'ngSocket', function($state,$scope,$http,$rootScope,$stateParams, ngSocket){
        var currentId = 1;
        $scope.hasStream = true;
        $scope.roomName =  $stateParams.auctionId;
        $scope.isBroadcasting = '';
        $scope.prepare = function prepare() {
            $scope.$broadcast('prepare');
        };
        $scope.start = function start() {
            $scope.$broadcast('start');
        };

        ngSocket.emit('auction/getLotList', {
            auctionId: $stateParams.auctionId
        });


        ngSocket.on('lotList', function (data) {
            $scope.lotList = data.lotList[0];
            $scope.descriptionPrevArr = $scope.deleteTegP(data.lotList[0].descriptionPrev);
            $scope.lotImage = data.lotList[0].lot_pictures;
            $scope.lotId = data.lotList[0].id;
        });
        ngSocket.emit('auction/getAuction', {id: $stateParams.auctionId});

        ngSocket.emit('auction/getLotList', {
            auctionId: $stateParams.auctionId
        });
        ngSocket.on('isSoldAndIsClean', function (data) {
            console.log(data);
        });
        ngSocket.on('catchAuction', function (data) {

        });

        ngSocket.emit('auction/getAuction', {id: $stateParams.auctionId});
        $scope.sold = function (isSold, isClean) {
            ngSocket.emit('auction/updateLot', {
                lotId: +$scope.lotId,
                isSold: isSold,
                isClean: isClean,
                auctionId: $stateParams.auctionId
            });
            ngSocket.emit('auction/getLotList', {
                auctionId: $stateParams.auctionId
            });
        };


        
        // вычисление шага для цены продажи (не доделано)
        // function calcStep(price){
        //     var step = 1;
        //     if (price <= 5){
        //         step = 1;
        //     }
        //     if (5 < price &&  price <= 50){
        //         step = 10;
        //     }
        //     if (50 < price && price <= 200){
        //         step = 20;
        //     }
        //     if (200 < price && price <= 500){
        //         step = 50;
        //     }
        //     if (500 < price && price <= 1000){
        //         step = 100;
        //     }
        //     if (2000 < price && price <= 5000){
        //         step = 500;
        //     }
        //     if (5000 < price && price <= 10000){
        //         step = 1000;
        //     }
        //     if (10000 < price && price <= 20000){
        //         step = 2000;
        //     }
        //     if (20000 < price && price <= 50000){
        //         step = 5000;
        //     }
        //     if (50000 < price && price <= 100000){
        //         step = 10000;
        //     }
        //     if (100000 < price && price <= 200000){
        //         step = 20000;
        //     }
        //     if (200000 < price && price <= 500000){
        //         step = 50000;
        //     }
        //     if (500000 < price && price <= 1000000){
        //         step = 100000;
        //     }
        //     return step;
        // }
    }])
});