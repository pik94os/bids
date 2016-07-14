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
                $scope.auction_id = data.auction.id;
                //console.log(data);
            });
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
                    users_number: ["1"],
                    lots_length:  0,
                    lots: [],
                    lots_isPlayOuted: [],
                    lots_isPlayOutedPercent: 0,
                    lot_pictures: [],
                    progress_bar_class: {'width': 'calc('+this.lots_isPlayOutedPercent+'% - 210px)'}
                };

            //init lot params
            var params = ['id', 'description', 'sellingPrice', 'estimateFrom', 'estimateTo', 'titlePicId'];
            var currentId = 0;
            $scope.current_lot =
                {
                    step: 1,
                    bids: []
                };
            $scope.bidPrice = 0;
        $scope.current_lot.currentPic = 0;
            initLotParams($scope.current_lot, params, initObjFromArr(params,[0,"", 0, 0, 0, 0]));

        $interval(function () {
            if ($scope.current_lot.lot_pictures.length > $scope.current_lot.currentPic)
                $scope.current_lot.currentPic += 1;
            if ($scope.current_lot.currentPic == $scope.current_lot.lot_pictures.length)
                $scope.current_lot.currentPic = 0
        }, 5000);

        $scope.lastPhotos = function () {
            var t = $('.gallery-carousel .pull-left:last-child');
            t.detach().prependTo('.gallery-carousel');
        };
        $scope.firstPhotos = function () {
            var t = $('.gallery-carousel .pull-left:first-child');
            t.detach().appendTo('.gallery-carousel');
        };

            ngSocket.on('room',function (data) {
                var date;
                if (data.err)
                    return console.log(data);

                date = new Date(data.auction.date);
                $scope.countdown = (date.getTime() > Date.now()) ? 1 : 2;
                $scope.auction_params.users = data.auction.users;
                $scope.auction_params.users_length.internet_users = data.auction.users.length;
                $scope.auction_params.users_number = data.auction.users.map(function(e) { return e.id });
                $scope.auction_params.lots_length = data.auction.lots.length;
                $scope.auction_params.lots = data.auction.lots;

                if (data.lotPictures != undefined)
                    $scope.auction_params.lot_pictures = data.lotPictures;


                //находим количество пройденных лотов
                data.auction.lots.map(function (e) {
                    if (e.isSold == true) {
                        return $scope.auction_params.lots_isPlayOuted.push(e)
                    }
                });
                if ($scope.auction_params.lots_length != 0)
                    $scope.auction_params.lots_isPlayOutedPercent = (($scope.auction_params.lots_isPlayOuted.length / $scope.auction_params.lots_length) * 100).toFixed();
                console.log($scope.auction_params.lots_isPlayOuted, $scope.auction_params.lots_length)

                $scope.auctionDate = data.auction.date;
                //инициализируем прогрес бар
                $scope.auction_params.progress_bar_class = {'width': 'calc('+$scope.auction_params.lots_isPlayOutedPercent+'% - 210px)'}

                //загружаем текущий разыгрываемый лот
                currentId = $scope.auction_params.lots.map(function(e) { return e.isPlayOut; }).indexOf(true);
                if($scope.auction_params.lots[currentId]!==undefined){
                    ngSocket.emit('auction/getLot', {
                        lotId: $scope.auction_params.lots[currentId].id
                    });
                } else {
                    console.log('lot[' + currentId + '] not found!');
                }
                var curDate = new Date();
                $scope.showProgress = function (date) {
                    // 24 часа - 86400000 милисекунд
                    if(+(new Date(date)) - +curDate < 86400000) {
                        return true;
                    }
                };
                var date = new Date($scope.auctionDate);
                var razn = +date - +curDate;
                $scope.timer = {};
                $scope.timer.days  = Math.floor( razn / 1000 / 60 / 60 /24 );// вычисляем дни
                razn -= $scope.timer.days*1000*60*60*24;
                $scope.timer.ch  = Math.floor( razn / 1000 / 60 / 60 );// вычисляем часы
                razn -= $scope.timer.ch * 1000 * 60 * 60;
                $scope.timer.min = Math.floor(razn / 1000 / 60);// вычисляем минуты
                razn -= $scope.timer.min * 1000 * 60;
                $scope.timer.sec = Math.floor(razn  / 1000 );// вычисляем секунды

                var stop = $interval(function() {
                    if(+$scope.timer.days >= 0 || +$scope.timer.ch >= 0 || +$scope.timer.min >= 0 || +$scope.timer.sec >= 0) {
                        if(+$scope.timer.ch == 0 && $scope.timer.days > 0) {
                            $scope.timer.days -= 1;
                            $scope.timer.ch = 23;
                        }
                        if(+$scope.timer.sec == 0 && $scope.timer.min > 0) {
                            $scope.timer.min -= 1;
                            $scope.timer.sec = 59;
                        }
                        if(+$scope.timer.min == 0 && $scope.timer.ch > 0) {
                            $scope.timer.ch -= 1;
                            $scope.timer.min = 59;
                        }
                        
                    }
                    if(+$scope.timer.days <= 0 && +$scope.timer.ch <= 0 && +$scope.timer.min <= 0 && +$scope.timer.sec <= 0){
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


            });

            ngSocket.on('lotSelected', function (data) {
                initLotParams($scope.current_lot, params, data.lot);
                $scope.current_lot.step = calcStep(data.lot.sellingPrice || data.lot.estimateFrom);
                if($scope.bidPrice < $scope.current_lot.sellingPrice)
                {
                    $scope.bidPrice = $scope.current_lot.sellingPrice + calcStep(data.lot.estimateFrom)
                } else {
                    $scope.bidPrice = data.lot.estimateFrom + calcStep(data.lot.estimateFrom);
                    $scope.current_lot.sellingPrice = data.lot.estimateFrom;
                    $scope.$apply();
                }
                console.log(data.lot.estimateFrom);
                $scope.current_lot.lot_pictures = data.lotPictures;
                $scope.current_lot.bids = data.bids;
                console.log($scope.current_lot);
            });

        $scope.maxEstimate = function () {
            $scope.bidPrice = $scope.current_lot.estimateTo;
        }

            $scope.incrementBid = function () {
                $scope.bidPrice += Number($scope.current_lot.step);
            }

            $scope.decrementBid = function () {
                if ($scope.bidPrice > 0)
                    $scope.bidPrice -= Number($scope.current_lot.step);
            }

        $scope.getPicById = function (id) {
            var idPic = $scope.auction_params.lot_pictures.map(function (e) {
                return e.id;
            }).indexOf(id);
            return $scope.auction_params.lot_pictures[idPic];
        }
        $scope.getUserNumber = function (id) {
            var userNum = $scope.auction_params.users.map(function (e) {
                    return e.id;
                }).indexOf(id) + 1;
            console.log('userNum', userNum)
            return userNum;
        }

        //форматирование цены
            $scope.formatBid = function () {
                var bid = $scope.bidPrice;
                bid = bid.replace(/[A-z, ]/g,'');
                $scope.bidPrice = Number(bid);
                
            }
        //подтвердить лот
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
            };

            // переход на следующий лот
            $scope.goToNextLot = function(){
                if (currentId < $scope.auction_params.lots_length - 1)
                    currentId += 1;
                ngSocket.emit('auction/getLot', {
                    lotId: $scope.auction_params.lots[currentId].id
                });
            };


        ngSocket.on('lotConfirmed', function (data) {
                console.log(data);
                if (data.err == 0){
                    $scope.confirm = data;
                    $scope.confirm.message ='Бид '+data.bid.price+' успешно добавлен';
                    $scope.current_lot.sellingPrice = data.bid.price;
                    $scope.bidPrice += calcStep($scope.current_lot.sellingPrice)
                }
                $scope.confirm = data
            });

            var curDate = new Date();
        $scope.showProgress = function (date) {
            // 24 часа - 86400000 милисекунд
            if(+(new Date(date)) - +curDate < 86400000) {
                return true;
            }
        };
        var date = new Date($scope.auctionDate);
        var razn = +date - +curDate;
        $scope.timer = {};
        $scope.timer.days  = Math.floor( razn / 1000 / 60 / 60 /24 );// вычисляем дни
        razn -= $scope.timer.days*1000*60*60*24;
        $scope.timer.ch  = Math.floor( razn / 1000 / 60 / 60 );// вычисляем часы
        razn -= $scope.timer.ch * 1000 * 60 * 60;
        $scope.timer.min = Math.floor(razn / 1000 / 60);// вычисляем минуты
        razn -= $scope.timer.min * 1000 * 60;
        $scope.timer.sec = Math.floor(razn  / 1000 );// вычисляем секунды

            var stop = $interval(function() {
                if(+$scope.timer.days >= 0 || +$scope.timer.ch >= 0 || +$scope.timer.min >= 0 || +$scope.timer.sec >= 0) {
                    if(+$scope.timer.ch == 0 && $scope.timer.days > 0) {
                        $scope.timer.days -= 1;
                        $scope.timer.ch = 23;
                    }
                    if(+$scope.timer.sec == 0 && $scope.timer.min > 0) {
                        $scope.timer.min -= 1;
                        $scope.timer.sec = 59;
                    }
                    if(+$scope.timer.min == 0 && $scope.timer.ch > 0) {
                        $scope.timer.ch -= 1;
                        $scope.timer.min = 59;
                    }
                    if(+$scope.timer.sec > 0){
                        $scope.timer.sec -= 1;
                    }
                }
                if(+$scope.timer.days <= 0 && +$scope.timer.ch <= 0 && +$scope.timer.min <= 0 && +$scope.timer.sec <= 0){
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
        //ngSocket.emit('getAuction', {id: $stateParams.auctionId});

        ngSocket.on('auctionState', function (data) {
            ngSocket.emit('auction/getLot', {
                lotId: +data.lotId
            });
        });
            /*$scope.$on('LastRepeaterElement', function(){
                moveToTheRigh();
            });
            $(window).resize( function(){
                moveToTheRigh();
            });*/

        $scope.roomName = 'jhcde36yhn099illl"km./;hg' + $stateParams.auctionId + window.location.host + window.location.host;
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
        $scope.swap = false;
        $scope.popo = function () {$scope.swap = !$scope.swap;}
        
        $scope.soundOnOff = function () { // Переключаем состояние "звук включен/выключен"
            var video = $("#remotes video")[0];
            if (video.muted) {
                video.muted = false;
            } else {
                video.muted = true;
            }
        }


    }]);
            function initLotParams(scope, params, values){
                params.forEach(function(item, i){
                    if(values[item]!=undefined){
                        scope[item] = values[item]
                    }
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
                    step = 5;
                }
                if (50 < price && price <= 200){
                    step = 10;
                }
                if (200 < price && price <= 500){
                    step = 20;
                }
                if (500 < price && price <= 1000){
                    step = 50;
                }
                if (1000 < price && price <= 2000) {
                    step = 100;
                }
                if (2000 < price && price <= 5000){
                    step = 200;
                }
                if (5000 < price && price <= 10000){
                    step = 500;
                }
                if (10000 < price && price <= 20000){
                    step = 1000;
                }
                if (20000 < price && price <= 50000){
                    step = 2000;
                }
                if (50000 < price && price <= 100000){
                    step = 5000;
                }
                if (100000 < price && price <= 200000){
                    step = 10000;
                }
                if (200000 < price && price <= 500000){
                    step = 20000;
                }
                if (500000 < price && price <= 1000000){
                    step = 50000;
                }
                return step;
            }

});