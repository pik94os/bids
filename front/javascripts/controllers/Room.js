define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('RoomHeader',['ngSocket','$scope','$state','$http', '$rootScope', '$stateParams', function(ngSocket,$scope,$state,$http,$rootScope,$stateParams){
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
                if(data.auction.isClose) {
                    $scope.countdown = 3;
                }
                $scope.auction_number = data.auction.number;
                $scope.auction_name = data.auction.name;
                $scope.auction_id = data.auction.id;
            });
        ngSocket.on('lotSelected', function (data) {
            $scope.lot_number = data.lot.number;
        });


        ngSocket.on('stopAuction', function () {
            $scope.countdown =  3;
        });

        ngSocket.on('auctionRun', function () {
            $scope.countdown =  2;
        });
        ngSocket.on('auctionDate', function () {
            $scope.countdown = 1;
        });
    }]).controller('Room',['ngSocket','$scope','$http', '$rootScope', '$stateParams','$interval', function(ngSocket,$scope,$http,$rootScope,$stateParams,$interval){
        //Init WCS JavaScript API
        var f;
        var timer;
        var useNativeResolution = true;
        var streamStatus;
// This element will be used for playing video (canvas or video)
        var $videoElement;
        var init={
            room : false,
            html : false
        };
//
        var isIE = false;
        var isMobile = false;
        var mediaProvider;
        var replay = true;
        var reinit = false;
        var playerHeight = 106;
        var playerWidth = 130;
        var lastStream;
        var lastVolumeValue = 100;
// swfobject params
        var pparams = {};
        pparams.bgcolor = "696969";
        pparams.wmode = "opaque";

        ngSocket.on('lotSelected', function (data) {
            $scope.lot_number = data.lot.number;
        });

        /**
         *
         * @param item
         * @returns {boolean}
         */
        $scope.filterActive = function(item) {
            return !(item.isCl || item.isSold);
        };

        ngSocket.on('lotSelected', function (data) {
            $scope.lot_number = data.lot.number;
        });

        ngSocket.emit('auction/getChatMessages', {auctionId: +$stateParams.auctionId});
        
        $scope.changeClassVideoWindow = function () {
            $scope.aaa = !$scope.aaa;
        };
        $scope.changeClassLot = function () {
            $scope.classLot = !$scope.classLot;
        };

        ngSocket.on('stopAuction', function () {
            $scope.countdown =  3;
            $scope.stopTimer();
        });

        ngSocket.on('auctionDate', function () {
            $scope.countdown = 1;
            $scope.auctionNewDate = true;
        });

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
                lotsToShow: [],
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
            
        //init slideshow
        $interval(function () {
            if ($scope.current_lot.lot_pictures.length > $scope.current_lot.currentPic)
                    $scope.current_lot.currentPic += 1;
            if ($scope.current_lot.currentPic == $scope.current_lot.lot_pictures.length)
                    $scope.current_lot.currentPic = $scope.current_lot.currentPicReserve
        }, 5000);

        /*$scope.lastPhotos = function () {
            var t = $('.gallery-carousel .pull-left:last-child');
            t.detach().prependTo('.gallery-carousel');
        };
        $scope.firstPhotos = function () {
            var t = $('.gallery-carousel .pull-left:first-child');
            t.detach().appendTo('.gallery-carousel');
        };*/

        $scope.nextItem = function () {
            $scope.auction_params.lotsToShow.shift();
            var index = ($scope.auction_params.lots.indexOf($scope.auction_params.lotsToShow[3]) + 1)
                % $scope.auction_params.lots.length;
            $scope.auction_params.lotsToShow.push($scope.auction_params.lots[index]);
        };

        $scope.prevItem = function () {
            $scope.auction_params.lotsToShow.pop();
            var index = (($scope.auction_params.lots.indexOf($scope.auction_params.lotsToShow[0]) - 1)
                + $scope.auction_params.lots.length) % $scope.auction_params.lots.length;
            $scope.auction_params.lotsToShow.unshift($scope.auction_params.lots[index]);
        };

        ngSocket.on('newUserRoom', function () {
            ngSocket.emit('auction/room', {
                id: $stateParams.auctionId
            });
        });

            ngSocket.on('room',function (data) {
                // $scope.t = Date.now() - new Date(data.auction.start);
                $scope.t = new Date(srvTime()) - new Date(data.auction.start);
                var date;
                date = new Date(data.auction.date);
                $scope.auctionTime = data.auction.start;
                console.log($scope.auctionTime);
                $scope.countdown = (data.auction.start) ? 2 : 1;
                if(data.auction.isClose) {
                    $scope.countdown = 3;
                    if($scope.auctionNewDate) {
                        $scope.countdown = 1;
                    }
                }
                $scope.user_number = {};
                data.auction.users.forEach(function (user) {
                    $scope.user_number[user.id] = user.auction_user.number
                });
                ngSocket.on('auctionCurrentUserNumber', function (data) {
                    $scope.userCurrentNumber = data.info.number;
                });

                $scope.auction_params.users = data.auction.users;
                $scope.auction_params.users_length.internet_users = data.auction.users.length;
                $scope.auction_params.users_number = data.auction.users.map(function(e) { return e.id });
                $scope.auction_params.current_user = data.authUser;
                $scope.videoName = data.auction.webcam;
                init.room = true;
                if(init.room && init.html){
                    $scope.initPlayer();
                }

                
                //таймер
                //инициализация лотов аукциона
                $scope.auction_params.lots_length = data.auction.lots.length;
                $scope.auction_params.lots = data.auction.lots;

                $scope.auction_params.lots.sort(function (a, b) {
                    if (+(a.isCl || a.isSold) > (+(b.isCl || b.isSold))) return 1;
                    if (+(a.isCl || a.isSold) < (+(b.isCl || b.isSold))) return -1;
                    if (a.number > b.number) return 1;
                    if (a.number < b.number) return -1;
                    return 0;
                });

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
                    if (e.isSold || e.isCl) {
                        return $scope.auction_params.lots_isPlayOuted.push(e)
                    }
                });
                $scope.auction_params.lots_isPlayOutedLength = $scope.auction_params.lots_isPlayOuted.length;
                if ($scope.auction_params.lots_length != 0)
                    $scope.auction_params.lots_isPlayOutedPercent = (($scope.auction_params.lots_isPlayOuted.length / $scope.auction_params.lots_length) * 100).toFixed();
                $scope.aa = true;
                $scope.auctionDate = data.auction.date;
                //инициализируем прогрес бар
                //$scope.auction_params.progress_bar_class = {'width': 'calc('+$scope.auction_params.lots_isPlayOutedPercent+'% - 210px)'};
                
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
                var date = new Date(data.auction.date);
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
                            ngSocket.on('auctionRun', function () {
                                $scope.countdown =  2;
                            });
                        }
                    }, 1000);
                } else {
                    $scope.timer.ch = $scope.timer.days = $scope.timer.min = $scope.timer.sec = 0;
                }

                ngSocket.on('auctionRun', function (lot) {
                    $scope.countdown =  2;
                    console.log(lot);
                    ngSocket.emit('startAuction', {id: $scope.lotId});
                    ngSocket.emit('auction/room', {id: $stateParams.auctionId})                
                });

                $scope.min = Math.floor($scope.t / 1000 / 60);
                $scope.sec = Math.floor($scope.t / 1000) - $scope.min * 60;
                if ($scope.sec < 10) {
                    $scope.sec = '0' + $scope.sec;
                }
                $scope.$apply();

                var stopTime = $interval(function () {
                    $scope.sec++;
                    if($scope.sec == 60) {
                        $scope.min ++;
                        $scope.sec = 0;
                    }
                }, 1000);

                $scope.stopTimer = function () {
                    if (angular.isDefined(stopTime)) {
                        $interval.cancel(stopTime);
                        stopTime = undefined;
                    }
                } ;

                $scope.stopFight = function() {
                    if (angular.isDefined(stop)) {
                        $interval.cancel(stop);
                        stop = undefined;
                    }
                };
                $scope.$on('$destroy', function() {
                    $scope.stopFight();
                    $scope.stopTimer();
                });

                // чупачупс с классом I
                $scope.classOfLotI = false;
                $scope.auction_params.users.forEach(function(item,i) {
                    if (+item.auction_user.number === i+1) {
                        $scope.classOfLotI = true;
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
                $scope.current_lot.step = data.lot.sellingPrice ? calcStep(data.lot.sellingPrice) : data.lot.estimateFrom;
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
                } else {}

                if(data.bids !== undefined && data.bids.length) {
                    var tempPrice = 0;
                    var tempDate = $scope.auctionTime;
                    data.bids.forEach(function (item) {
                        if(item.createdAt > tempDate){
                            tempDate = item.createdAt;
                            if(item.price > tempPrice) {
                                tempPrice = item.price;
                                $scope.itemBid = item;
                            }
                        }
                    });
                    if($scope.itemBid) {
                        if(new Date($scope.itemBid.createdAt) > new Date($scope.auctionTime)) {
                            $scope.userNumber = $scope.user_number[$scope.itemBid.userId];
                        }
                    }
                    ngSocket.emit('userAuction', {auctionId: $stateParams.auctionId, lotConfirmed: true, userId: data.bids[0].userId});
                }

                //TODO: странная штука не удалять
                // else {
                //
                //     $scope.bidPrice = +$scope.current_lot.sellingPrice;
                //     $scope.$apply();
                //
                // }
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
                $scope.current_lot.bids = data.bids;
                $scope.estimateToMax = $scope.current_lot.sellingPrice < $scope.estimateTo ? 1 : 0;

                /* var item = $scope.auction_params.lots.find(function (lot) {
                    return lot.number === $scope.lot_number;
                });
                var index = $scope.auction_params.lots.indexOf(item); */

                $scope.auction_params.lotsToShow = $scope.auction_params.lots.slice(0, 5);

            });

        $scope.maxEstimate = function () {
            $scope.bidPrice = $scope.current_lot.estimateTo;
        };


            $scope.incrementBid = function () {
                var step = calcStep($scope.bidPrice);
                $scope.bidPrice += Number(step);
            }

            $scope.decrementBid = function () {
                var step = calcStep($scope.bidPrice - calcStep($scope.bidPrice));
                if ($scope.bidPrice > 0)
                    $scope.bidPrice -= Number(step);
            }
        

        $scope.getPicById = function (id) {
            var idPic = $scope.auction_params.lot_pictures.map(function (e) {
                    return e.id;
            }).indexOf(id);
            return $scope.auction_params.lot_pictures[idPic];
        }
        // $scope.getUserNumber = function (id) {
        //     var userNum = $scope.auction_params.users.map(function (e) {
        //             return e.id;
        //         }).indexOf(id) + 1;
        //     return userNum;
        // }
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
                    bidPrice: $scope.bidPrice,
                    auctionId: $stateParams.auctionId
                });
            };

        // пропадание/появление кнопки сделать ставку
        $scope.setButtonTimeout = function () {
            $scope.btnHide = true;
            setTimeout(function () {
                $scope.btnHide=false;
            }, 1500)
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
                ngSocket.emit('auction/getSellingStatistics', {auctionId: +$stateParams.auctionId});
                if (currentId < $scope.auction_params.lots_length - 1)
                    currentId += 1;
                ngSocket.emit('auction/getLot', {
                    lotId: $scope.auction_params.lots[currentId].id
                });
            };

        // получение статистики
        if (!$scope.sellingStatistics){
            ngSocket.emit('auction/getSellingStatistics', {auctionId: +$stateParams.auctionId});
        }
        delete $scope.sellingStatistics;
        ngSocket.on('catchSellingStatistics', function (result) {
            if(result.err) {
                alert(result.message)
            }
            $scope.sellingStatistics = [];
            result.sellingStatistics.forEach(function (i) {
                i.createdAt = new Date(i.createdAt).getHours() + ':' + new Date(i.createdAt).getMinutes();
                $scope.sellingStatistics.unshift(i);
            });
        });
        ngSocket.emit('confirmLot', {lotId: $stateParams.auctionId});
        ngSocket.on('lotConfirmed', function (data) {
            ngSocket.emit('auction/getListBids', {auctionId: $stateParams.auctionId, lotId: $scope.lotId});
            if (data.err) {
                alert(data.message);
            }
            if(data.bid){
                $scope.userNumber = $scope.user_number[data.bid.userId];
            }
            ngSocket.emit('userAuction', {auctionId: $stateParams.auctionId, lotConfirmed: true, userId: data.bid.userId});
            $scope.setButtonTimeout();
            // $scope.userNumber = data.bid.userId;
            //$scope.userNumber = $scope.getUserNumber(data.bid.userId)+1;
            if (data.err == 0) {
                    $scope.confirm = data;
                    $scope.confirm.message ='Бид '+data.bid.price+' успешно добавлен';
                    $scope.current_lot.sellingPrice = data.bid.price;
                    $scope.bidPrice = $scope.current_lot.sellingPrice + calcStep($scope.current_lot.sellingPrice);
                    $scope.timeoutRedBidUser = true;
                    $scope.timeoutBidUser = true;
                setTimeout(function () {
                        $scope.timeoutRedBidUser = false;
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
            date = new Date(Date.parse(data.date + '+0000'));
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

        /*$scope.timer = {};
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
            }, 1000);*/

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
            ngSocket.emit('userAuction', {auctionId: $stateParams.auctionId});


            //обновить список проданных и закрытых лотов
            if ((typeof data.oldLot.isSold != 'undefined' && data.oldLot.isSold) || (typeof data.oldLot.isCl != 'undefined' && data.oldLot.isCl)) {
                $scope.auction_params.lots_isPlayOuted.push(data.oldLot);
            } else {
                $scope.auction_params.lots_isPlayOuted.splice($scope.auction_params.lots_isPlayOuted.indexOf(data.oldLot), 1);
            }
            $scope.auction_params.lots_isPlayOutedLength = $scope.auction_params.lots_isPlayOuted.length;
            if ($scope.auction_params.lots_length != 0)
                $scope.auction_params.lots_isPlayOutedPercent = (($scope.auction_params.lots_isPlayOuted.length / $scope.auction_params.lots_length) * 100).toFixed();

            //Обновить auction_params.lots
            for (var lot in $scope.auction_params.lots) {
                if ($scope.auction_params.lots[lot].id === data.oldLotId) {
                    if (!(typeof data.oldLot.isCl === "undefined")) {
                        $scope.auction_params.lots[lot].isCl = data.oldLot.isCl;
                    }
                    if (!(typeof data.oldLot.isSold === "undefined")) {
                        $scope.auction_params.lots[lot].isSold = data.oldLot.isSold;
                    }
                }
            }
            $scope.auction_params.lots.sort(function (a, b) {
                if (+(a.isCl || a.isSold) > (+(b.isCl || b.isSold))) return 1;
                if (+(a.isCl || a.isSold) < (+(b.isCl || b.isSold))) return -1;
                if (a.number > b.number) return 1;
                if (a.number < b.number) return -1;
                return 0;
            });

            //Обновить auction_params.lotsToShow

            $scope.auction_params.lotsToShow = $scope.auction_params.lots.slice(0, 5);

            $scope.userNumber = '';
            $scope.bidPrice = +data.lot.sellingPrice + calcStep(+data.lot.sellingPrice);
            $scope.numberLot = data.lot.number;
            ngSocket.emit('auction/getSellingStatistics', {auctionId: +$stateParams.auctionId});

        });
        $scope.swap = false;

        $scope.soundOnOff = function () { // Переключаем состояние "звук включен/выключен"
            $scope.classSoundOnOff =! $scope.classSoundOnOff;
            if (!$scope.classSoundOnOff) {
                setVolume(100);
                console.log('Sound on');
            } else {
                setVolume(0);
                console.log('Sound off');
            }
        };

        $scope.initPlayer = function (){
            if(!$scope.videoName || !($scope.videoName.indexOf('video:')+1) || (!$scope.f==undefined && $scope.f)) {
                return false
            }
            f = $scope.f = Flashphoner.getInstance();
            //счетчик ошибок перезапуска
            var ErrCounter = 0;

            f.addListener(WCSEvent.ErrorStatusEvent, errorEvent);
            f.addListener(WCSEvent.ConnectionStatusEvent, connectionStatusListener);
            f.addListener(WCSEvent.StreamStatusEvent, function (event) {
                switch (event.status) {
                    //Если возникли ошибки
                    case StreamStatus.Failed:
                        break;
                }
            });
            cleanInstance();
            var proto;
            var url;
            var port;
            if (window.location.protocol == "http:") {
                proto = "ws://78.24.218.251";
                port = "8282";
            } else {
                proto = "wss://art-bid.ru";
                port = "8443";
            }
            url = proto + ":" + port;
            //TODO: Сделать автоматический выбор способа вещания

            if(supports_video()){
                initVideoRTC(url);
            }else if(supports_flash()){
                initFlashRTMP(url)
            }else{
                initCanvasPlayer(url);
            }
        };
        ngSocket.on('webcam',function (data) {
            console.log(data.name);
            $scope.f.stopStream({name: $scope.videoName});
            if(data.name!==$scope.videoName){
                $scope.f.playStream({name: data.name, remoteMediaElementId: 'remoteVideo'});
            }
            $scope.videoName = data.name;
        });

        setTimeout(function(){
            init.html = true;
            if(init.html && init.room){

                $scope.initPlayer();
            }
        },2000);


        /**
         * Для видео
         */
// Init Flash
        function initFlashRTMP(url) {
            mediaProvider = MediaProvider.Flash;
            $("#videoCanvas").hide();
            $("#remoteVideo").hide();
            $videoElement = $("#flashVideoWrapper");
            $videoElement.show();

            var configuration = new Configuration();
            configuration.remoteMediaElementId = 'remoteVideo';
            configuration.elementIdForSWF = "flashVideoDiv";
            configuration.pathToSWF = "/images/swf/MediaManager.swf";
            configuration.forceFlashForWebRTCBrowser = true;
            configuration.swfParams = pparams;

            f.init(configuration);
            f.connect({width:0,height:0,urlServer: url, appKey: 'defaultApp'});
        }

// Init WebRTC
        function initVideoRTC(url) {
            mediaProvider = MediaProvider.WebRTC;
            $("#flashVideoWrapper").hide();
            $("#videoCanvas").hide();
            $("#remoteVideo").show();

            var configuration = new Configuration();
            configuration.remoteMediaElementId = 'remoteVideo';
            // (видеовидео) уменьшаем размер картинки для уменьшения потока
            f.init(configuration);

            document.getElementById('flashVideoWrapper').style.visibility = "hidden";
            document.getElementById('flashVideoDiv').style.visibility = "hidden";
            document.getElementById('remoteVideo').style.visibility = "visible";
            $videoElement = $("#remoteVideo");

            f.connect({urlServer: url, appKey: 'defaultApp', width: 0, height: 0});
        }

// Init WebSocket
        function initCanvasPlayer(url) {
            mediaProvider = MediaProvider.WSPlayer;
            $("#flashVideoWrapper").hide();
            $("#remoteVideo").hide();
            $videoElement = $("#videoCanvas");

            $videoElement.show();

            var configuration = new Configuration();
            configuration.wsPlayerCanvas = $videoElement[0];
            configuration.wsPlayerReceiverPath = "/javascripts/libs/flashphoner/WSReceiver.js";
            configuration.videoWidth=playerWidth;
            configuration.videoHeight=playerHeight;
            $scope.f.init(configuration);
            $scope.f.connect({
                urlServer: url,
                appKey: 'defaultApp',
                useWsTunnel: true,
                useBase64BinaryEncoding: false,
                width: playerWidth,
                height: playerHeight
            });
        }

// Disconnect
        function disconnect() {
            f.disconnect();
        }
///////////////////////////////////
///////////// Controls ////////////
///////////////////////////////////

//Play stream
        function playStream(width,height) {
            trace("Play stream " + $scope.videoName);
            if (lastStream != $scope.videoName) {
                useNativeResolution = true;
            }
            lastStream = $scope.videoName;
            var stream = new Stream();
            stream.name = $scope.videoName;
            stream.hasVideo = true;
            stream.mediaProvider = mediaProvider;
            if (width != null && height != null) {
                trace("Request for stream with resolution - " + width + "x" + height);
                useNativeResolution = false;
                stream.width = width;
                stream.height = height;
                f.playStream(stream);
            } else {
                if(mediaProvider == MediaProvider.WSPlayer){
                    stream.width = playerWidth;
                    stream.height = playerHeight;
                }
                stream.width = 0;
                stream.height = 0;
                f.playStream(stream);
            }
        }

//Stop stream playback
        function stopStream(reinit) {
            var streamName = field("playStream");
            f.stopStream({name: streamName});
            if (reinit) {
                $("#playButton").hide();
                $("#waiting").show();
            } else {
                $("#playButton").show();
                $("#waiting").hide();
            }

            clearInterval(timer);
            timer = null;
        }
///////////////////////////////////
///////////// Listeners ///////////
///////////////////////////////////

//Connection Status
        function connectionStatusListener(event) {
            trace(event.status);
            if (event.status == ConnectionStatus.Established) {
                trace('Connection has been established. You can start a new call.');
                // replay stream on connect
                if (replay) {
                    if (mediaProvider == MediaProvider.Flash) {
                        replay = false;
                        // Wait for FlashAPI loading
                        setTimeout(function () {
                            var waitForFlashInit = setInterval(function () {
                                if (isFlashphonerAPILoaded) {
                                    clearInterval(waitForFlashInit);
                                    setTimeout(playStream, 2000);
                                } else {
                                    setInterval(waitForFlashInit, 1000);
                                }
                            }, 1000);
                        }, 3000);
                    } else {
                        playStream();
                    }
                }
            } else if (event.status == ConnectionStatus.Failed) {
                $("#playStatus").show().text("Connection failed!");
                $("#playButton").show();
                $("#waiting").hide();
            } else if (event.status == ConnectionStatus.Disconnected && reinit) {
                setTimeout(initPlayer,2000);
            }
        }

//Connection Status
        function streamStatusListener(event) {
            trace("streamStatusListener >> " + event.status);
            streamStatus = event.status;
            switch (event.status) {
                case StreamStatus.Playing:
                    onPlayActions();
                    break;
                case StreamStatus.Stoped:
                    onStopActions();
                    break;
                case StreamStatus.Failed:
                    onFailedActions();
                    break;
                default:
                    break;
            }
        }

//Error
        function errorEvent(event) {
            trace(event.info);
        }

///////////////////////////////////

        function cleanInstance() {
            isFlashphonerAPILoaded = false;
            f.wsPlayerMediaManager = undefined;
            f.flashMediaManager = undefined;
            f.userData = undefined;
        }

///////////////////////////////////
///////////// Actions /////////////
///////////////////////////////////

        function onPlayActions() {
            $("#playStatus").hide();
            $("#playButton").hide();
            $("#waiting").hide();

            $("#playStream").css('background','#EEEEEE').hide().prop('disabled',true);
            $("#footer").css('background','#EEEEEE').hide();
            $("#player").
            css('background','dimgray').
            mouseenter(function(e) {
                $("#footer").show();
                $("#playStream").show();
            }).
            mouseleave(function(e) {
                if ($(e.target).attr('id') == 'proto')
                    return;
                $("#footer").hide();
                $("#playStream").hide();
            });
            if (isMobile) {
                $("#player").click(function(e) {
                    var target = $(e.target);
                    if ((target.is($videoElement) || target.is("#player")) && typeof target != 'undefined') {
                        if ($("#footer").is(':visible') && $("#playStream").is(':visible')) {
                            $("#footer").hide();
                            $("#playStream").hide();
                        } else {
                            $("#footer").show();
                            $("#playStream").show();
                        }
                    }
                });
            }
            $("#timer").text("00:00:00");
            if (!timer)
                timer = setInterval(startCallTimer, 1000);
            if ($("#playStream").val().indexOf("rtsp://") != -1) {
                if (detectBrowser() == "Safari" || detectBrowser() == "iOS") {
                    $("#proto option[value='HLS']").prop('disabled', true);
                } else {
                    $("#proto option[value='HLS']").hide();
                }
            } else {
                if (detectBrowser() == "Safari" || detectBrowser() == "iOS") {
                    $("#proto option[value='HLS']").removeProp('disabled');
                } else {
                    $("#proto option[value='RTMP']").show();
                }
            }
        }

        function onStopActions() {
            if (replay) {
                disconnect();
            }
        }

        function onFailedActions() {
            $("#playStream").removeProp('disabled');
            $("#playStatus").show().text("Playback failed!").removeClass().attr("class","text-danger");
            $("#playButton").show();
            $("#waiting").hide();
        }

///////////////////////////////////
///////////// Other ///////////////
///////////////////////////////////

        function startCallTimer() {
            var $t = $("#timer");
            var arr = $t.text().split(":");
            var h = arr[0];
            var m = arr[1];
            var s = arr[2];

            if (s == '00') s = 0;

            if (s == 59) {
                if (m == 59) {
                    h++;
                    m = 0;
                    if (h < 10) h = "0" + h;
                }
                m++;
                if (m < 10) m = "0" + m;
                s = 0;
            }
            else s++;
            if (s < 10) s = "0" + s;

            $t.text(h + ":" + m + ":" + s);
        }

        function setVolume(value) {
            lastVolumeValue = value;
            f.setVolumeOnStreaming(mediaProvider, value);
        }

        function fullScreenMode() {
            var video;
            if (mediaProvider == MediaProvider.WebRTC) {
                video = $('#remoteVideo')[0];
            } else if (mediaProvider == MediaProvider.WSPlayer) {
                video = $('#videoCanvas')[0];
            } else {
                video = $('#flashVideoWrapper')[0];
            }

            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            }
        }
// Hide unsupported technologies
        function hideProto() {
            switch (detectBrowser()) {
                case "IE":
                    isIE = true;
                    $("#proto").find('option').not("option[value='RTMP'],option[value='RTMFP']").remove();
                    $("#proto option[value='RTMP']").attr('selected','selected');
                    break;
                case "Firefox":
                    $("#proto").find('option').not("option[value='WebRTC'],option[value='RTMP'],option[value='RTMFP']").hide();
                    $("#proto option[value='WebRTC']").attr('selected','selected');
                    break;
                case "Chrome":
                    break;
                case "Android":
                    isMobile = true;
                    $("#proto").find('option').not("option[value='WebRTC'],option[value='HLS']").hide();
                    $("#proto option[value='WebRTC']").attr('selected','selected');
                    break;
                case "iOS":
                    isMobile = true;
                case "Safari":
                    $("#proto").find('option').not("option[value='WebSocket'],option[value='HLS']").remove();
                    $("#flashVideoWrapper").remove();
                    $("#flashVideoDiv").remove();
                    $("#proto option[value='WebSocket']").attr('selected','selected');
                    swfobject = undefined;
                    break;
            }
        }

        function trace(message) {
            console.log("> " + message);
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
    /**
     * Рассчитывает шаг изменения цены
     * @param price - текущая цена
     * @returns step - шаг изменения цены
     */
    function calcStep(price) {
        var step = 1;
        if (price < 5) {
            return step = 1;
        }
        if (5 <= price && price < 50) {
            return step = 5;
        }
        if (50 <= price && price < 200) {
            return step = 10;
        }
        if (200 <= price && price < 500) {
            return step = 20;
        }
        if (500 <= price && price < 1000) {
            return step = 50;
        }
        if (1000 <= price && price < 2000) {
            return step = 100;
        }
        if (2000 <= price && price < 5000) {
            return step = 200;
        }
        if (5000 <= price && price < 10000) {
            return step = 500;
        }
        if (10000 <= price && price < 20000) {
            return step = 1000;
        }
        if (20000 <= price && price < 50000) {
            return step = 2000;
        }
        if (50000 <= price && price < 100000) {
            return step = 5000;
        }
        if (100000 <= price && price < 200000) {
            return step = 10000;
        }
        if (200000 <= price && price < 500000) {
            return step = 20000;
        }
        if (500000 <= price && price < 1000000) {
            return step = 50000;
        } else {
            step = 100000;
        }
        return step;
    }


    var xmlHttp;

    /**
     * Возвращает серверное время по AJAX запросу
     * @returns {string} - серверное время в стороковом формате
     */
    function srvTime(){
        try {
            //FF, Opera, Safari, Chrome
            xmlHttp = new XMLHttpRequest();
        }
        catch (err1) {
            //IE
            try {
                xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
            }
            catch (err2) {
                try {
                    xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
                }
                catch (eerr3) {
                    //AJAX not supported, use CPU time.
                    alert("AJAX not supported");
                }
            }
        }
        xmlHttp.open('HEAD',window.location.href.toString(),false);
        xmlHttp.setRequestHeader("Content-Type", "text/html");
        xmlHttp.send('');
        return xmlHttp.getResponseHeader("Date");
    }

    function supports_video() {
        return !!document.createElement('video').canPlayType;
    }

    function supports_flash() {
        return ((typeof navigator.plugins !== "undefined" && typeof navigator.plugins["Shockwave Flash"] === "object") || (window.ActiveXObject && (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) !== false));
    }

});