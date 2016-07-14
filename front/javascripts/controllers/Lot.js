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

        function initStep() {
            var price = $scope.lot.estimateFrom;
            var step = 1;
            if (price <= 5) {
                step = 1;
            }
            if (5 < price && price <= 50) {
                step = 5;
            }
            if (50 < price && price <= 200) {
                step = 10;
            }
            if (200 < price && price <= 500) {
                step = 20;
            }
            if (500 < price && price <= 1000) {
                step = 50;
            }
            if (1000 < price && price <= 2000) {
                step = 100;
            }
            if (2000 < price && price <= 5000) {
                step = 200;
            }
            if (5000 < price && price <= 10000) {
                step = 500;
            }
            if (10000 < price && price <= 20000) {
                step = 1000;
            }
            if (20000 < price && price <= 50000) {
                step = 2000;
            }
            if (50000 < price && price <= 100000) {
                step = 5000;
            }
            if (100000 < price && price <= 200000) {
                step = 10000;
            }
            if (200000 < price && price <= 500000) {
                step = 20000;
            }
            if (500000 < price && price <= 1000000) {
                step = 50000;
            }
            $scope.step = step;
        }
        $scope.lastPhotos = function () {
            var t = $('.gallery .small-photo:last-child');
            t.detach().prependTo('.gallery');
        };
        $scope.firstPhotos = function () {
            var t = $('.gallery .small-photo:first-child');
            t.detach().appendTo('.gallery');
        };

        $scope.maxEstimate2 = function () {
            $scope.bidPrice = $scope.estimateTo;
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