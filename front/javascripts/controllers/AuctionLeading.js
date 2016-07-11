define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionLeading',['$scope','$http', '$rootScope', '$stateParams', 'ngSocket', function($scope,$http,$rootScope,$stateParams, ngSocket){
        $scope.hasStream = true;
        $scope.roomName =  $stateParams.auctionId;
        $scope.isBroadcasting = '';
        $scope.prepare = function prepare() {
            $scope.$broadcast('prepare');
        };
        $scope.start = function start() {
            $scope.$broadcast('start');
        };

        // получение одного лота по ID
        ngSocket.emit('auction/getLot', {
            lotId: $stateParams.lotId
        });
        ngSocket.on('lotSelected', function (data) {
            console.log(data)
            $scope.lot = JSON.parse(JSON.stringify(data.lot))
            $scope.lotId = $scope.lot.id;
            $scope.isPlayOut = $scope.lot.isPlayOut;
            $scope.open = ($scope.lot.isSold) ? 2 : 1;
            ngSocket.emit('auction/getLotList', {
                auctionId: $scope.lot.auctionId
            });
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