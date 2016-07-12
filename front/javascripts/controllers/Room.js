define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('RoomHeader',['ngSocket','$scope','$http', '$rootScope', '$stateParams', function(ngSocket,$scope,$http,$rootScope,$stateParams){
       // получение одного аукциона по ID
            ngSocket.emit('auction/room', {
                id: $stateParams.auctionId
            });

            ngSocket.on('room',function (data) {
                if(data.err){
                    return console.log(data);
                }
                var date = new Date(data.auction.date);
                $scope.countdown = (date.getTime() > Date.now()) ? 1 : 2;
                $scope.auction_number = data.auction.number;
                $scope.auction_name = data.auction.name;
                //console.log(data);
            })
        ngSocket.on('lotSelected', function (data) {
            $scope.lot_number = data.lot.number;

        });
    }]).controller('Room',['ngSocket','$scope','$http', '$rootScope', '$stateParams','$interval', function(ngSocket,$scope,$http,$rootScope,$stateParams,$interval){
            //init auction params
            $scope.auction_params =
                {
                    users_length: {
                        internet_users: 0,
                        hall_users: 0
                    },
                    users: [],
                    lots_length:  0,
                    lots: [],
                    lots_isPlayOuted: [],
                    lots_isPlayOutedPercent: 0
                };
            //init lot params
            var params = ['id', 'description', 'sellingPrice', 'estimateFrom', 'estimateTo'];
            var currentId = 0;
            $scope.current_lot =
                {
                    step : 1
                };
            $scope.bidPrice = 0;
            initLotParams($scope.current_lot, params, initObjFromArr(params,[0,"", 0, 0, 0]));

            //init time params
            $scope.time = 23;
            $scope.min = 59;
            $scope.sec = 59;

            ngSocket.on('room',function (data) {
                var date;
                if (data.err)
                    return console.log(data);

                date = new Date(data.auction.date);
                $scope.countdown = (date.getTime() > Date.now()) ? 1 : 2;
                $scope.auction_params.users = data.auction.users;
                console.log(data.auction.users)
                $scope.auction_params.users_length.internet_users = data.auction.users.length;
                $scope.auction_params.lots_length = data.auction.lots.length;
                $scope.auction_params.lots = data.auction.lots;
                $scope.auction_params.lots_isPlayOuted = data.auction.lots.map(function(e) { if(e.isPlayOut === true) return e });
                if ($scope.auction_params.lots_length != 0)
                $scope.auction_params.lots_isPlayOutedPercent = ($scope.auction_params.lots_isPlayOuted.length / $scope.auction_params.lots_length) * 100;
                console.log(($scope.auction_params.lots_isPlayOuted.length / $scope.auction_params.lots_length) * 100)

                //загружаем текущий разыгрываемый лот
                currentId = $scope.auction_params.lots.map(function(e) { return e.isPlayOut; }).indexOf(true);
                ngSocket.emit('auction/getLot', {
                    lotId: $scope.auction_params.lots[currentId].id
                });
            });

            ngSocket.on('lotSelected', function (data) {
                initLotParams($scope.current_lot, params, data.lot);
                $scope.current_lot.step = calcStep(data.lot.sellingPrice || data.lot.estimateFrom);
                $scope.bidPrice = data.lot.estimateFrom;
            });

            $scope.incrementBid = function () {
                $scope.bidPrice += Number($scope.current_lot.step);
            }

            $scope.decrementBid = function () {
                if ($scope.bidPrice > 0)
                    $scope.bidPrice -= Number($scope.current_lot.step);
            }

            $scope.formatBid = function () {
                var bid = $scope.bidPrice;
                bid = bid.replace(/[A-z, ]/g,'');
                $scope.bidPrice = Number(bid);
            }

            $scope.confirmLot = function () {
                ngSocket.emit('auction/confirmLot', {
                    lotId: $scope.current_lot.id,
                    bidPrice: $scope.bidPrice
                });
            };

            // переход на предыдущий лот
            $scope.goToPrevLot = function(){
                if (currentId > 0)
                    currentId -= 1;
                ngSocket.emit('auction/getLot', {
                    lotId: $scope.auction_params.lots[currentId].id
                });
            }

            // переход на следующий лот
            $scope.goToNextLot = function(){
                if (currentId < $scope.auction_params.lots_length - 1)
                    currentId += 1;
                ngSocket.emit('auction/getLot', {
                    lotId: $scope.auction_params.lots[currentId].id
                });
            }

            ngSocket.on('lotConfirmed', function (data) {
                console.log(data);
                if (data.err == 0){
                    $scope.confirm = data;
                    $scope.confirm.message ='Бид '+data.bid.price+' успешно добавлен';
                }
                $scope.confirm = data
            });

            var stop = $interval(function() {
                if(+$scope.ch >= 0 && +$scope.min >= 0 && +$scope.sec >= 0) {
                    if(+$scope.sec == 0 && $scope.min > 0) {
                        $scope.min -= 1;
                        $scope.sec = 59;
                    }
                    if(+$scope.min == 0 && $scope.ch > 0) {
                        $scope.ch -= 1;
                        $scope.min = 59;
                    }
                    if(+$scope.sec > 0){
                        $scope.sec -= 1;
                    }
                }
                if(+$scope.ch <= 0 && +$scope.min <= 0 && +$scope.sec <= 0){
                    $scope.stopFight();
                }
            }, 1000);

            $scope.stopFight = function() {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            };
            $scope.$on('$destroy', function() {
                $scope.stopFight();
            });
            $scope.popup = false;
            $scope.setPopup = function(index){
                $scope.popup = index;
            };

            function moveToTheRigh() {
                var countInFirstLine = 0;
                var lt = $('.lot-table:first-child');
                var childNum = 1;
                var i = 2;
                $('.lot-table.moveToTheRight').removeClass('moveToTheRight');
                while(childNum && lt.length){
                    lt = lt.next();
                    if(lt.position().top === $('.lot-table:first-child').position().top){
                        countInFirstLine++
                    }else{
                        lt = $('.lot-table:nth-child('+((countInFirstLine+2)*childNum - (2*childNum-(i++)))+')').addClass('moveToTheRight');
                        if(lt.length){
                            childNum+=2;
                        }else{
                            childNum = 0;
                        }
                    }
                }
            }
            $scope.$on('LastRepeaterElement', function(){
                moveToTheRigh();
            });
            $(window).resize( function(){
                moveToTheRigh();
            });
            $scope.roomName = $stateParams.auctionId;
            $scope.joinedRoom = false;
            $scope.joinRoom = function () {
                $scope.$broadcast('joinRoom');
            };
            $scope.leaveRoom = function () {
                $scope.$broadcast('leaveRoom');
            };
            setTimeout(function () {
                $scope.joinRoom();
            },2000);
        }])
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
            function calcStep(price){
                var step = 1;
                if (price <= 5){
                    step = 1;
                }
                if (5 < price &&  price <= 50){
                    step = 10;
                }
                if (50 < price && price <= 200){
                    step = 20;
                }
                if (200 < price && price <= 500){
                    step = 50;
                }
                if (500 < price && price <= 1000){
                    step = 100;
                }
                if (2000 < price && price <= 5000){
                    step = 500;
                }
                if (5000 < price && price <= 10000){
                    step = 1000;
                }
                if (10000 < price && price <= 20000){
                    step = 2000;
                }
                if (20000 < price && price <= 50000){
                    step = 5000;
                }
                if (50000 < price && price <= 100000){
                    step = 10000;
                }
                if (100000 < price && price <= 200000){
                    step = 20000;
                }
                if (200000 < price && price <= 500000){
                    step = 50000;
                }
                if (500000 < price && price <= 1000000){
                    step = 100000;
                }
                return step;
            }

});