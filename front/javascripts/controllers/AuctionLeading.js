define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionLeading',['$state','$scope','$http', '$rootScope', '$stateParams', 'ngSocket', function($state,$scope,$http,$rootScope,$stateParams, ngSocket){
        $scope.numberLot = "";
        $scope.cleanLot = true;
        $scope.hasStream = true;
        $scope.roomName = 'jhcde36yhn099illl"km./;hg' + $stateParams.auctionId + window.location.host + window.location.host;
        $scope.isBroadcasting = '';
        $scope.prepare = function prepare() {
            $scope.$broadcast('prepare');
        };
        $scope.sendFilter = function (e) {
            if (e.keyCode === 13) {
                ngSocket.emit('auction/getLotList', {
                    auctionId: $stateParams.auctionId,
                    numberLot: +$scope.numberLot,
                    lotId: $scope.lotId
                });
                $scope.numberLot = "";
                setTimeout(function () {
                    ngSocket.emit('auction/updateLot', {
                        lotId: +$scope.lotId,
                        isPlayOut: true,
                        isCl: false
                    });
                }, 1000);

            }
        };
        $scope.start = function start() {
            ngSocket.emit('auction/startAuction', {id: +$scope.lotId});
            $scope.$broadcast('start');
        };
        $scope.reloadPage = function reloadPage() {
            window.location.reload();
        };

        ngSocket.emit('auction/getLotList', {
            auctionId: $stateParams.auctionId,
            lot: true
        });
        $scope.soldLot = false;

        ngSocket.on('lotConfirmed', function (data) {
            if(data.err) {
                alert(data.message);
            }
            $scope.soldLot = true;
        });
        ngSocket.on('catchAuction', function (data) {
            if(data.err) {
                alert(data.message);
            }
            $scope.dateAuction = data.data.date;
            if(new Date(data.data.date) <= new Date()) {
                $scope.startAuction = true;
                ngSocket.emit('auction/updateLot', {
                    lotId: +$scope.lotId,
                    isPlayOut: true
                });
            }
        });
        function setLotInfo(lot) {
            $scope.lotList = lot;
            if(lot.descriptionPrev !== null) {
                $scope.descriptionPrevArr = $scope.deleteTegP(lot.descriptionPrev);
            }
            $scope.soldLot = lot.sellingPrice ? true : false;
            $scope.lotImage = lot.lot_pictures;
            $scope.lotId = lot.id;
        }

        ngSocket.emit('auction/room', {id: $stateParams.auctionId, userAuction: true});

        ngSocket.on('lotList', function (data) {
            setLotInfo(data.lotList[0]);
        });
        ngSocket.on('room', function (auction) {
            $scope.users = auction.auction.users;
        });


        $scope.getUserNumber = function (id) {
            var userNum = $scope.users.map(function (e) {
                    return e.id;
                }).indexOf(id) + 1;
            return userNum;
        };

        ngSocket.emit('auction/getAuction', {id: $stateParams.auctionId});

        $scope.sold = function (isSold, isClean) {
            $scope.cleanLot = false;
            ngSocket.emit('auction/updateLot', {
                    lotId: +$scope.lotId,
                    isSold: isSold,
                    isCl: isClean,
                    auctionId: $stateParams.auctionId
                });
        };

        ngSocket.on('lotConfirmed', function (data) {
            $scope.price = data.bid.price;
            $scope.priceNext = $scope.price + calcStep(data.bid.price);
            $scope.userNumber = data.bid.creatorId;
            $scope.userData = data.userName.firstName + ' ' + data.userName.lastName + ' ' + data.userName.patronymic;
        });



        ngSocket.on('auctionState', function (data) {
            console.log(data);
            setLotInfo(data.lot);
            $scope.soldLot = data.lot.sellingPrice ? true : false;
            setTimeout(function () {
                $scope.cleanLot = true;
                 $scope.$apply();
            }, 1000);
        });


        //вычисление шага для цены продажи (не доделано)
        function calcStep(price){
            var step = 1;
            if (price <= 5){
                return step = 1;
            }
            if (5 < price && price <= 50) {
                return step = 5;
            }
            if (50 < price && price <= 200){
                return step = 10;
            }
            if (200 < price && price <= 500){
                return step = 20;
            }
            if (500 < price && price <= 1000){
                return step = 50;
            }
            if (1000 < price && price <= 2000) {
                return step = 100;
            }
            if (2000 < price && price <= 5000){
                return step = 200;
            }
            if (5000 < price && price <= 10000){
                return step = 500;
            }
            if (10000 < price && price <= 20000){
                return step = 1000;
            }
            if (20000 < price && price <= 50000){
                return step = 2000;
            }
            if (50000 < price && price <= 100000){
                return step = 5000;
            }
            if (100000 < price && price <= 200000){
                return step = 10000;
            }
            if (200000 < price && price <= 500000){
                return step = 20000;
            }
            if (500000 < price && price <= 1000000){
                return step = 50000;
            } else {
                step = 10000;
            }
            return step;
        }
    }])
});