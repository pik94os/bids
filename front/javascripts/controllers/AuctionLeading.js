define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionLeading',['$state','$scope','$http', '$rootScope', '$stateParams', 'ngSocket', function($state,$scope,$http,$rootScope,$stateParams, ngSocket){
        $scope.hasStream = true;
        $scope.roomName =  $stateParams.auctionId;
        $scope.isBroadcasting = '';
        $scope.prepare = function prepare() {
            $scope.$broadcast('prepare');
        };
        $scope.start = function start() {
            $scope.$broadcast('start');
        };
        $scope.reloadPage = function reloadPage() {
            window.location.reload()
        };

        ngSocket.emit('auction/getLotList', {
            auctionId: $stateParams.auctionId,
            lot: true
        });
        ngSocket.on('catchAuction', function (data) {
            if(data.err) {
                alert(data.message);
            }
            $scope.dateAuction = data.data.date;
            if(new Date(data.data.date) <= new Date()) {$scope.startAuction = true}
        });
        function setLotInfo(lot) {
            $scope.lotList = lot;
            if(lot.descriptionPrev !== null) {
                $scope.descriptionPrevArr = $scope.deleteTegP(lot.descriptionPrev);
            }
            if(new Date($scope.dateAuction) <= new Date()) {
                ngSocket.emit('auction/updateLot', {
                    isPlayOut: true,
                    isSold: false,
                    isCl: false
                });
            }
            $scope.lotImage = lot.lot_pictures;
            $scope.lotId = lot.id;
            ngSocket.emit('auction/room', {id: $stateParams.auctionId, userAuction: true});
            
        }
        ngSocket.on('lotList', function (data) {
            setLotInfo(data.lotList[0]);
        });



        ngSocket.on('room', function (auction) {
            $scope.users = auction.auction.users;
        });


        ngSocket.emit('auction/getAuction', {id: $stateParams.auctionId});
        $scope.sold = function (isSold, isClean) {
                ngSocket.emit('auction/updateLot', {
                    lotId: +$scope.lotId,
                    isSold: isSold,
                    isCl: isClean,
                    auctionId: $stateParams.auctionId
                });
        };
        ngSocket.on('auctionState', function (data) {
            setLotInfo(data.lot);
        });

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