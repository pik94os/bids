/**
 * Created by pik on 06.05.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('LotHeader', ['$scope', '$stateParams', 'ngSocket', function ($scope, $stateParams, ngSocket) {
        $scope.open = 1//+$stateParams.open;
        var lotArr = new Array();
        var currentId = 1;

        // получение одного лота по ID
        ngSocket.emit('auction/getLotList', {
                auctionId: $stateParams.auctionId
            });

        ngSocket.on('lotList', function (data) {
            lotArr = data.lotList;
                ngSocket.emit('auction/getLot', {
                    lotId: lotArr[currentId].id
                });

        });

        ngSocket.on('lotSelected', function (data) {
            $scope.lot = JSON.parse(JSON.stringify(data.lot))
            $scope.lotId = $scope.lot.id;
            $scope.isPlayOut = $scope.lot.isPlayOut;
            $scope.open = ($scope.lot.isSold) ? 2 : 1;
        });

        // переход на предыдущий лот
        $scope.goToPrevLot = function(){
            if (currentId > 0)
                currentId -= 1;
                    ngSocket.emit('auction/getLot', {
                        lotId: lotArr[currentId].id
                    });
        }

        // переход на следующий лот
        $scope.goToNextLot = function(){
            if (currentId < lotArr.length - 1)
                currentId += 1;
                    ngSocket.emit('auction/getLot', {
                         lotId: lotArr[currentId].id
                    });
        }
    }]).controller('Lot', ['$scope', '$http', '$rootScope', '$stateParams', 'ngSocket', function ($scope, $http, $rootScope, $stateParams, ngSocket) {
        $scope.open = 1;
        $scope.tab = $stateParams.tab;
        $scope.bidPrice = 0;
        $scope.step = 1;

        // создание лота
        $scope.editLot = function () {
                ngSocket.emit('createLot', {
                    number: $scope.number,
                    description: $scope.description,
                    estimateFrom: $scope.estimateFrom,
                    estimateTo: $scope.estimateTo,
                    sellingPrice: $scope.sellingPrice
                });
        }
        // подтверждение бида
        $scope.confirmLot = function () {
            //$scope.userId = 1;
            //$scope.lotId = 1;
            console.log($scope.lotId, $scope.bidPrice, $scope.userId);
                ngSocket.emit('auction/confirmLot', {
                    lotId: $scope.lotId,
                    bidPrice: $scope.bidPrice,
                    userId: $scope.userId
                });
        }

        ngSocket.on('lotConfirmed', function (data) {
           console.log(data);
            });

        ngSocket.on('lotSelected', function (data) {
                $scope.lot = JSON.parse(JSON.stringify(data.lot));
                $scope.lotId = $scope.lot.id;
                $scope.isPlayOut = $scope.lot.isPlayOut;
                $scope.open = ($scope.lot.isSold) ? 2 : 1;
                initStep();
            });

        $scope.incrementBid = function () {
            $scope.bidPrice += Number($scope.step);
        }

        $scope.decrementBid = function () {
            if ($scope.bidPrice > 0)
                $scope.bidPrice -= Number($scope.step);
        }

        $scope.formatBid = function () {
            var bid = $scope.Price;
                bid = bid.replace(/[A-z, ]/g,'');
                $scope.bidPrice = Number(bid);
        }

            function initStep(){
                if ($scope.lot.estimateFrom <= 5){
                    $scope.step = 1;
                }
                if (5 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 50){
                    $scope.step = 10;
                }
                if (50 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 200){
                    $scope.step = 20;
                }
                if (200 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 500){
                    $scope.step = 50;
                }
                if (500 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 1000){
                    $scope.step = 100;
                }
                if (2000 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 5000){
                    $scope.step = 500;
                }
                if (5000 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 10000){
                    $scope.step = 1000;
                }
                if (10000 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 20000){
                    $scope.step = 2000;
                }
                if (20000 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 50000){
                    $scope.step = 5000;
                }
                if (50000 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 100000){
                    $scope.step = 10000;
                }
                if (100000 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 200000){
                    $scope.step = 20000;
                }
                if (200000 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 500000){
                    $scope.step = 50000;
                }
                if (500000 < $scope.lot.estimateFrom &&  $scope.lot.estimateFrom <= 1000000){
                    $scope.step = 100000;
                }
            }

    }])
});