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
                // ngSocket.on('countDown', function () {
                //     $scope.countdown = 3
                // });
                $scope.countdown = (data.auction.start) ? 2 : 1;
                $scope.auction_number = data.auction.number;
                $scope.auction_name = data.auction.name;
                $scope.auction_id = data.auction.id;
            });
        ngSocket.on('lotSelected', function (data) {
            $scope.lot_number = data.lot.number;
        });

        ngSocket.on('auctionRun', function () {
            $scope.countdown =  2;
        });
    }]).controller('Room',['ngSocket','$scope','$http', '$rootScope', '$stateParams','$interval', function(ngSocket,$scope,$http,$rootScope,$stateParams,$interval){
        ngSocket.emit('auction/getChatMessages', {auctionId: +$stateParams.auctionId});

        $scope.changeClassVideoWindow = function () {
            $scope.aaa = !$scope.aaa;
        };
        $scope.changeClassLot = function () {
            $scope.classLot = !$scope.classLot;
        };
        //init auction params
        $scope.auction_params = {
                users_length: {
                    internet_users: 0,
                    hall_users: 0
                },
                users: [],
                users_number: ["1"],
                current_user: null,
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
        $scope.current_lot.currentPicReserve = 0;
            initLotParams($scope.current_lot, params, initObjFromArr(params,[0,"", 0, 0, 0, 0]));


        $scope.lastPhotos = function () {
            var t = $('.gallery-carousel .pull-left:last-child');
            t.detach().prependTo('.gallery-carousel');
        };
        $scope.firstPhotos = function () {
            var t = $('.gallery-carousel .pull-left:first-child');
            t.detach().appendTo('.gallery-carousel');
        };


        ngSocket.on('auctionRun', function () {
            $scope.countdown =  2;
        });
            ngSocket.on('room',function (data) {
                var date;
                if (data.err)
                date = new Date(data.auction.date);
                $scope.countdown = (data.auction.start) ? 2 : 1;
                $scope.auction_params.users = data.auction.users;
                $scope.auction_params.users_length.internet_users = data.auction.users.length;
                $scope.auction_params.users_number = data.auction.users.map(function(e) { return e.id });
                $scope.auction_params.current_user = data.authUser;
                $scope.videoName = data.auction.webcam;
                $scope.initPlayer();

                //инициализация лотов аукциона
                $scope.auction_params.lots_length = data.auction.lots.length;
                $scope.auction_params.lots = data.auction.lots;
                $scope.auction_params.lot_pictures = [];
                if (data.lotPictures != undefined && data.lotPictures.length){
                    data.lotPictures.forEach(function (pic) {
                        if(pic.fileName){
                            $scope.auction_params.lot_pictures.push(pic);
                            if(!$scope.auction_params.lot_pictures[0].fileName){
                                $scope.current_lot.currentPicReserve = pic.fileName;
                                $scope.current_lot.currentPic = pic.fileName;
                            }
                        }
                    })
                }

                //находим количество пройденных лотов
                data.auction.lots.map(function (e) {
                    if (e.isSold == true) {
                        return $scope.auction_params.lots_isPlayOuted.push(e)
                    }
                });
                if ($scope.auction_params.lots_length != 0)
                    $scope.auction_params.lots_isPlayOutedPercent = (($scope.auction_params.lots_isPlayOuted.length / $scope.auction_params.lots_length) * 100).toFixed();
                $scope.auctionDate = data.auction.date;
                //инициализируем прогрес бар
                $scope.auction_params.progress_bar_class = {'width': 'calc('+$scope.auction_params.lots_isPlayOutedPercent+'% - 210px)'}

                //загружаем текущий разыгрываемый лот
                currentId = $scope.auction_params.lots.map(function(e) { return e.isPlayOut; }).indexOf(true);
                if ($scope.auction_params.lots[currentId] !== undefined) {
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

                var stop;

                if(date.getTime() > Date.now()){
                    stop = $interval(function() {
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
                }else{
                    $scope.timer.ch = $scope.timer.days = $scope.timer.min = $scope.timer.sec = 0;
                }

                $scope.stopFight = function() {
                    if (angular.isDefined(stop)) {
                        $interval.cancel(stop);
                        stop = undefined;
                    }
                };
                $scope.$on('$destroy', function() {
                    $scope.stopFight();
                });

                // чупачупс с классом I
                $scope.classOfLotI = false;
                $scope.auction_params.users_number.forEach(function(item,i) {
                    if ( +item === +$scope.currentUserInfo.id ) {
                        $scope.classOfLotI = i;
                    }
                });
                // чупачупс с классом red ставка
                $scope.redBid = false;
                // $scope.auction_params.users_number.forEach(function(item,i) {
                //     if ( +item === +$scope.currentUserInfo.id ) {
                //         $scope.redBid = i;
                //     }
                // });

            });

            ngSocket.on('lotSelected', function (data) {
                initLotParams($scope.current_lot, params, data.lot);
                $scope.current_lot.step = data.lot.sellingPrice?calcStep(data.lot.sellingPrice):data.lot.estimateFrom;
                $scope.estimateTo = data.lot.estimateTo;
                if(data.lot.sellingPrice !== null) {
                    $scope.current_lot.sellingPrice = data.lot.sellingPrice;
                }
                if($scope.current_lot.sellingPrice === data.lot.estimateFrom) {
                    $scope.bidPrice = data.lot.estimateFrom
                }
                if($scope.bidPrice < $scope.current_lot.sellingPrice)
                {
                    $scope.bidPrice = +$scope.current_lot.sellingPrice + calcStep(+$scope.current_lot.sellingPrice);
                    $scope.$apply();
                }
                else {
                    $scope.bidPrice = +$scope.current_lot.sellingPrice;
                    $scope.$apply();

                }
                //$scope.current_lot.sellingPrice = data.lot.estimateFrom;

                $scope.current_lot.lot_pictures = [];
                if (data.lotPictures != undefined && data.lotPictures.length){
                    data.lotPictures.forEach(function (pic,incr) {
                        if(pic.fileName){
                            $scope.current_lot.lot_pictures.push(pic);
                            if(!$scope.current_lot.lot_pictures[0].fileName){
                                $scope.current_lot.currentPicReserve = incr;
                                $scope.current_lot.currentPic = incr;
                            }
                        }
                    })
                }

                $interval(function () {
                    if ($scope.current_lot.lot_pictures.length > $scope.current_lot.currentPic)
                        $scope.current_lot.currentPic += 1;
                    if ($scope.current_lot.currentPic == $scope.current_lot.lot_pictures.length)
                        $scope.current_lot.currentPic = $scope.current_lot.currentPicReserve
                }, 5000);
                $scope.current_lot.bids = data.bids;
                $scope.estimateToMax = $scope.current_lot.sellingPrice < $scope.estimateTo ? 1 : 0;
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
            ngSocket.emit('auction/getListBids', {auctionId: $stateParams.auctionId, lotId: $scope.lotId});
            // $scope.price = data.bid.price;
            // $scope.priceNext = $scope.price + calcStep(data.bid.price);
            // $scope.userNumber = data.bid.userId;
            // $scope.userData = data.userName.firstName + ' ' + data.userName.lastName + ' ' + data.userName.patronymic;
            if (data.err) {
                alert(data.message);
            }
            $scope.userNumber = data.bid.userId;
            if (data.err == 0) {
                    $scope.confirm = data;
                    $scope.confirm.message ='Бид '+data.bid.price+' успешно добавлен';
                    $scope.current_lot.sellingPrice = data.bid.price;
                    $scope.bidPrice = $scope.current_lot.sellingPrice + calcStep($scope.current_lot.sellingPrice);
                    $scope.timeoutBidUser = true;
                    $scope.timeoutRedBidUser = true;
                    setTimeout(function () {
                        $scope.timeoutRedBidUser = false
                    }, 3000);
                }
                $scope.confirm = data;
            $scope.estimateToMax = $scope.current_lot.sellingPrice > $scope.estimateTo ? 0 : 1;
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
        ngSocket.on('auctionDate', function (data) {
            $scope.stopFight();
            date = new Date(data.date);
            razn = +date - +curDate;
            $scope.startTime = true;
            //$scope.stopFight();

            $scope.timer = {};
            $scope.timer.days  = Math.floor( razn / 1000 / 60 / 60 /24 );// вычисляем дни
            razn -= $scope.timer.days*1000*60*60*24;
            $scope.timer.ch  = Math.floor( razn / 1000 / 60 / 60 );// вычисляем часы
            razn -= $scope.timer.ch * 1000 * 60 * 60;
            $scope.timer.min = Math.floor(razn / 1000 / 60);// вычисляем минуты
            razn -= $scope.timer.min * 1000 * 60;
            $scope.timer.sec = Math.floor(razn  / 1000 );// вычисляем секунды
            $scope.$apply();
        });
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

        ngSocket.emit('getAuction', {id: $stateParams.auctionId});

        ngSocket.on('auctionState', function (data) {
            ngSocket.emit('auction/getLot', {
                lotId: +data.lotId
            });
            $scope.userNumber = '';
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
                $scope.initPlayer
            },2000);
        $scope.swap = false;

        $scope.soundOnOff = function () { // Переключаем состояние "звук включен/выключен"
            var video = $("#remoteVideo")[0];
            $scope.classSoundOnOff =! $scope.classSoundOnOff;
            if (video.muted) {
                video.muted = false;
                console.log('Sound off');
            } else {
                video.muted = true;
                console.log('Sound on');
            }
        };

        $scope.initPlayer = function (){
            if(!$scope.videoName || !($scope.videoName.indexOf('video:')+1) || (!$scope.f==undefined && $scope.f)) {
                return false
            }
            var f = $scope.f = Flashphoner.getInstance();
            //счетчик ошибок перезапуска
            var ErrCounter = 0;

            f.addListener(WCSEvent.ConnectionStatusEvent, function () {
                //После инициализации
                //опубликовать поток с вебки ведущего
                console.log($scope.videoName);
                $scope.f.playStream({
                    name:  $scope.videoName,
                    remoteMediaElementId: 'remoteVideo'
                });
            });


            f.addListener(WCSEvent.StreamStatusEvent, function (event) {
                switch (event.status) {
                    //Если возникли ошибки
                    case StreamStatus.Failed:
                        break;
                }
            });
            var configuration = new Configuration();
            configuration.remoteMediaElementId = 'remoteVideo';
            configuration.localMediaElementId = 'localVideo';
            configuration.elementIdForSWF = "flashVideoDiv";
            var proto;
            var url;
            var port;
            if (window.location.protocol == "http:") {
                proto = "ws://188.120.226.71";
                port = "8282";
            } else {
                proto = "wss://art-bid.ru";
                port = "8443";
            }

            url = proto + ":" + port;
            f.init(configuration);
            // $scope.f.getAccessToAudioAndVideo();
            f.connect({width:0,height:0,urlServer: url, appKey: 'defaultApp'});
        };
        ngSocket.on('webcam',function (data) {
            console.log(data.name);
            $scope.f.stopStream({name: $scope.videoName});
            if(data.name!==$scope.videoName){
                $scope.f.playStream({name: data.name, remoteMediaElementId: 'remoteVideo'});
            }
            $scope.videoName = data.name;
        });

        $(function () {
            $scope.initPlayer();
        });

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
                    step = 100000;
                }
                return step;
            }
});