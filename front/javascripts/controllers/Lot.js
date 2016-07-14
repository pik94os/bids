/**
 * Created by pik on 06.05.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('LotHeader', ['$state','$scope', '$stateParams', 'ngSocket', function ($state,$scope, $stateParams, ngSocket) {
        var lotArr = new Array();
        var currentId = 1;
        $scope.open = ($stateParams.lotId) ? 1 : 0;
        
        // получение одного лота по ID
        ngSocket.emit('auction/getLot', {
                lotId: $stateParams.lotId
            });
        // получение списка айдишников лотов
        ngSocket.on('lotList', function (data) {
            lotArr = data.lotList;
            currentId = lotArr.map(function(e) { return e.id; }).indexOf($scope.lotId);
        });

        ngSocket.on('lotSelected', function (data) {
            console.log(data);
            $scope.lot = JSON.parse(JSON.stringify(data.lot));
            $scope.lotId = $scope.lot.id;
            $scope.isPlayOut = $scope.lot.isPlayOut;
            $scope.open = ($scope.lot.isSold) ? 2 : 1;
            ngSocket.emit('auction/getLotList', {
                auctionId: $scope.lot.auctionId
            });
        });

        // переход на предыдущий лот
        $scope.goToPrevLot = function(){
            if (currentId > 0)
                currentId -= 1;
            $state.go('lot', {
                lotId: lotArr[currentId].id
            });
        };

        // переход на следующий лот
        $scope.goToNextLot = function(){
            if (currentId < lotArr.length - 1)
                currentId += 1;
                    $state.go('lot', {
                         lotId: lotArr[currentId].id
                    });
        }
    }]).controller('Lot', ['$anchorScroll','$scope', '$http', '$rootScope', '$stateParams', 'ngSocket', function ($anchorScroll,$scope, $http, $rootScope, $stateParams, ngSocket) {
        $scope.open = ($stateParams.lotId) ? 1 : 0;
        $scope.tab = $stateParams.tab;
        $scope.bidPrice = 0;
        $scope.step = 1;
        $scope.confirm = {err: null, message: null};
        //инициализация параметров лота
        var params = ['description', 'sellingPrice', 'estimateFrom', 'estimateTo'];
            initLotParams($scope, params, initObjFromArr(params,["", 0, 0, 0]));

        // создание лота
        $scope.createLot = function () {
                ngSocket.emit('auction/createLot', {
                    number: $stateParams.number,
                    description: $scope.description,
                    estimateFrom: $scope.estimateFrom,
                    estimateTo: $scope.estimateTo,
                    sellingPrice: $scope.sellingPrice,
                    auctionId: $stateParams.auctionId,
                    year: $stateParams.year,
                    titlePicId: $stateParams.titlePicId
                });
        };
        // подтверждение бида
        $scope.confirmLot = function () {
            //$scope.userId = 1;
            //$scope.lotId = 1;
            console.log($scope.lotId, $scope.bidPrice);
                ngSocket.emit('auction/confirmLot', {
                    lotId: $scope.lotId,
                    bidPrice: $scope.bidPrice
                });
        };

        ngSocket.on('lotConfirmed', function (data) {
           console.log(data);
            if (data.err == 0){
                $scope.confirm = data;
                $scope.confirm.message ='Бид '+data.bid.price+' успешно добавлен';
            }
            $scope.confirm = data
        });

        ngSocket.on('lotSelected', function (data) {
            ngSocket.emit('auction/getPictureList', {lotId:data.lot.id});
            $scope.lot = JSON.parse(JSON.stringify(data.lot));
            $scope.lotId = $scope.lot.id;
            $scope.descriptionArr = $scope.deleteTegP($scope.lot.description);
            $scope.descriptionPrevArr = $scope.deleteTegP($scope.lot.descriptionPrev);
            $scope.isPlayOut = $scope.lot.isPlayOut;
            $scope.open = ($scope.lot.isSold) ? 2 : 1;
            $scope.bidPrice =  $scope.lot.estimateFrom;
            initLotParams($scope, params, $scope.lot);
            initStep();
        });
        ngSocket.on('lotCreated', function (data) {
                ngSocket.emit('auction/getLot', {
                    lotId: data.newLot.lot.id
            });

        });
        $scope.gallery = {};
        ngSocket.on('pictureList', function (data) {
            $scope.gallery = {};
            data.pictureList.forEach(function (row) {
                $scope.gallery[row.id]=row;
            });
            $scope.bigPhoto=$scope.gallery[$scope.lot.titlePicId].fileName;
        });
        $scope.setBigPhoto=function (ph) {
            $scope.bigPhoto=ph;
        };
        $scope.incrementBid = function () {
            $scope.bidPrice += Number($scope.step);

            if($scope.bidPrice <(+$scope.lot.estimateFrom + $scope.step)) {
                $scope.minus = false;
            } else {
                $scope.minus = true;
            }
        };

        $scope.decrementBid = function () {
            if ($scope.bidPrice > 0)
                $scope.bidPrice -= Number($scope.step);

            if($scope.bidPrice <(+$scope.lot.estimateFrom + $scope.step)) {
                $scope.minus = false;
            } else {
                $scope.minus = true;
            }
        };

        $scope.formatBid = function () {
            var bid = $scope.bidPrice;
                bid = bid.replace(/[A-z, ]/g,'');
                $scope.bidPrice = Number(bid);
            if($scope.bidPrice <(+$scope.lot.estimateFrom + $scope.step)) {
                $scope.minus = false;
            } else {
                $scope.minus = true;
            }
        };
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
                if (1000 < $scope.lot.estimateFrom && $scope.lot.estimateFrom <= 2000) {
                    $scope.step = 200;
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
        $scope.lastPhotos = function () {
            var t = $('.gallery .small-photo:last-child');
            t.detach().prependTo('.gallery');
        };
        $scope.firstPhotos = function () {
            var t = $('.gallery .small-photo:first-child');
            t.detach().appendTo('.gallery');
        };
    }]);
    function initLotParams(scope, params, values){
        params.forEach(function(item, i) {
              scope[item] = values[item]
        });
    }
    function initObjFromArr(params, arr){
        var obj = new Object();
            params.forEach(function(item, i) {
                obj[item] = arr[i]
            });
        return obj;
    }
});