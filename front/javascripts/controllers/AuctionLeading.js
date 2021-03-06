define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('AuctionLeading', ['$state', '$scope', '$http', '$rootScope', '$stateParams', 'ngSocket', function ($state, $scope, $http, $rootScope, $stateParams, ngSocket) {
        $scope.dateStart = '';
        $scope.timeStart = '';
        $scope.numberLot = "";
        $scope.cleanLot = true;
        $scope.soldLot = true;
        $scope.hasStream = true;
        $scope.isBroadcasting = '';
        $scope.prepare = function prepare() {
            $scope.initPlayer();
        };
        $scope.videoName = 'video:' + Date.now();

        $scope.lots = [];
        $scope.closedLots = [];
        ngSocket.on('room', function (data) {
            if (data.err) {
                return console.log(data);
            }
            $scope.auctionStart = data.auction.start;
            $scope.users = data.auction.users;
            $scope.user_number = {};
            $scope.users.forEach(function (user) {
                $scope.user_number[user.id] = user.auction_user.number
            });
            $scope.auctionOn = data.auction.start||!$scope.fuckStop ? 1 : 0;
            if(data.auction.start !== null) {
                ngSocket.emit('auction/getListBids', {auctionId: $stateParams.auctionId, lotId: +$scope.lotId});
            } else if(data.auction.start === null && !$scope.fuckStop) {
                $scope.auctionStart = new Date();
                ngSocket.emit('auction/getListBids', {auctionId: $stateParams.auctionId, lotId: +$scope.lotId});
                console.log(data.auction.start,'||', $scope.fuckStop,'||',$scope.auctionStart)
            }
            $scope.lots = data.auction.lots;
            $scope.lots.forEach(function (lot) {
                if (lot.isCl) {
                    $scope.closedLots.push(lot.number);
                }
            });
            console.log($scope.closedLots);
        });


        ngSocket.on('bidList', function (bid) {
            if (bid.err) {
                alert(bid.message);
            }
            $scope.isBids = true;
            $scope.extramuralBid = false;
            if (bid.bids.length) {
                var tempPrice = 0;
                var tempDate = new Date(bid.bids[0].createdAt);
                bid.bids.forEach(function (item) {
                    if (new Date(item.createdAt) < new Date($scope.auctionStart === null ?  new Date() : $scope.auctionStart)) {
                        if (+item.price > +tempPrice) {
                            tempDate = new Date(item.createdAt);
                            tempPrice = +item.price;
                            $scope.extramuralBid = item;
                        }
                    }
                });
                ngSocket.emit('userAuction', {
                    auctionId: $stateParams.auctionId,
                    lotConfirmed: true,
                    userId: bid.bids[0].userId
                });
                $scope.numberExtramuralBid = $scope.user_number[$scope.extramuralBid.userId];
                $scope.sellingExtramuralBid = $scope.extramuralBid.userId === bid.bids[0].userId ? 1 : 0;
            }
            if (bid.bids.length && $scope.auctionStart && new Date(bid.bids[0].createdAt) > new Date($scope.auctionStart)) {
                $scope.userData = bid.bids[0].user.firstName + ' ' + bid.bids[0].user.lastName + ' ' + bid.bids[0].user.patronymic;
                $scope.bids = bid.bids;
                $scope.priceBidFrom = bid.bids[0].price + calcStep(bid.bids[0].price);
                $scope.price = bid.bids[0].price;

            } else {
                $scope.priceBidFrom = $scope.lotList.estimateFrom;
            }
            $scope.confirmLot = function () {
                ngSocket.emit('auction/confirmLot', {
                    lotId: $scope.lotId,
                    bidPrice: $scope.priceBidFrom,
                    auctionId: $stateParams.auctionId,
                    extramuralBid: true,
                    userId: $scope.extramuralBid.userId
                });

            };
        });





        // функционал чата на странице ведущего
        // socket.join('lesson:' + +$stateParams.auctionId);
        ngSocket.emit('auction/getChatMessages', {auctionId: +$stateParams.auctionId});

        $scope.chat = {};
        $scope.chat.message = '';
        $scope.chat.messages = [];

        // ngSocket.emit('auction/getChatMessages', {auctionId: +$stateParams.auctionId});
        ngSocket.on('chatMessagesList', function (result) {
            result.chatMessagesList.forEach(function (i) {
                $scope.chat.messages.push(i);
            });
        });

        ngSocket.on('changeUserState', function () {
            ngSocket.emit('auction/room', {id: $stateParams.auctionId, userAuction: true});
        });

        $scope.chat.keyUp = function (e) {
            if (e.keyCode === 13) {
                if ($scope.chat.message) {
                    $scope.chat.addMessage();
                    return null;
                }
                $scope.chat.message = '';
            }
        };

        ngSocket.on('lotSelected', function (data) {
            $scope.estimateFrom = data.lot.estimateFrom;
            $scope.estimateTo = data.lot.estimateTo;
        });


        $scope.chat.addMessage = function () {
            if ($scope.chat.message) {
                ngSocket.emit('auction/pasteChatMessage', {
                    userId: +$scope.currentUserInfo.id,
                    auctionId: +$stateParams.auctionId,
                    chatMessage: $scope.chat.message
                });
            }
            $scope.chat.message = '';
        };

        ngSocket.on('catchMessageRow', function (result) {
            if (!result.err) {
                // $scope.chat.messages.push({time: new Date(result.time), text:result.message, username:result.userId});
                // if ($scope.chat.messages[$scope.chat.messages.length - 1].createdAt !== result.message.createdAt) {
                $scope.chat.messages.unshift({
                    createdAt: result.message.createdAt,
                    message: result.message.message,
                    user: result.user
                });
            }
        });

        ngSocket.on('chatMessagesList', function (result) {
            $scope.chatMessagesArr = result.resp;
        });

        $scope.initPlayer = function () {
            var f = $scope.f = Flashphoner.getInstance();
            //счетчик ошибок перезапуска
            var ErrCounter = 0;

            f.addListener(WCSEvent.ConnectionStatusEvent, function () {
                //После инициализаци2016-08-08 19:21:27.080000и
                //опубликовать поток с вебки ведущего
                $scope.f.publishStream({
                    name: $scope.videoName,
                    record: false
                    //(видеовидео)уменьшаем битрейт
                    // record: record, bitrate:300
                });
            });


            f.addListener(WCSEvent.StreamStatusEvent, function (event) {
                switch (event.status) {
                    //если поток опубликовался
                    case StreamStatus.Publishing:
                        //отправить слушателям ссылку на поток
                        ngSocket.emit('callTeacher', {auctionId: $stateParams.auctionId, name: event.name});
                        break;
                    //Если возникли ошибки
                    // убрал обработку ошибок
                    case StreamStatus.Failed:
                        setTimeout(function () {
                            $scope.videoName = 'video:' + Date.now();
                            //опубликовать поток с вебки ведущего
                            $scope.f.publishStream({
                                name: $scope.videoName,
                                // record: false
                                //(видеовидео)уменьшаем битрейт
                                record: record, bitrate: 300
                            });
                            ngSocket.emit('video/newVideo', {
                                auctionId: +$stateParams.auctionId,
                                name: $scope.videoName
                            });
                        }, 1000 * (ErrCounter++));
                        break;
                }
            });
            var configuration = new Configuration();
            configuration.remoteMediaElementId = 'remoteVideo';
            configuration.localMediaElementId = 'localVideo';
            configuration.elementIdForSWF = "flashVideoDiv";
            // (видеовидео) уменьшаем размер картинки для уменьшения потока
            configuration.videoWidth = 176;
            configuration.videoHeight = 144;
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
            f.init(configuration);
            // $scope.f.getAccessToAudioAndVideo();
            f.connect({width: 0, height: 0, urlServer: url, appKey: 'defaultApp'});
        };

        //TODO: по возможности исправить связывание с моделью
        $scope.sendFilter = function (numberLot) {
            ngSocket.emit('auction/getLotList', {
                auctionId: $stateParams.auctionId,
                numberLot: numberLot,
                lotId: $scope.lotId
            });
            $scope.price = false;
            this.numberLot = '';
            ngSocket.emit('auction/updateLot', {
                lotId: +$scope.lotId,
                isPlayOut: false,
                auctionId: $stateParams.auctionId
            });
            setTimeout(function () {
                ngSocket.emit('auction/updateLot', {
                    lotId: +$scope.lotId,
                    isPlayOut: true,
                    isCl: false,
                    auctionId: $stateParams.auctionId
                });
            }, 500);
        };

        $scope.start = function start() {
            ngSocket.emit('video/newVideo', {
                auctionId: +$stateParams.auctionId,
                name: $scope.videoName
            });
            if(!$scope.startAuction) {
                ngSocket.emit('auction/startAuction', {id: +$scope.lotId});
            }
            ngSocket.emit('auction/room', {id: $stateParams.auctionId, userAuction: true});
            $scope.fuckStop = false;
        };
        $scope.reloadPage = function reloadPage() {
            ngSocket.emit('auction/sendStatisticByEmail', {auctionId: +$stateParams.auctionId});
            ngSocket.emit('auction/auctionStop', {id: +$stateParams.auctionId});
        };

        ngSocket.on('catchSellingStatisticsEmail', function (result) {
            $scope.mailStatistics = result;
        });

        ngSocket.on('stopAuction', function (stop) {
            if ($scope.f !== undefined) {
                $scope.f.unPublishStream({name: $scope.videoName});
            }
        });
        ngSocket.on('auctionRun', function () {
            $scope.startAuction = true;
            ngSocket.emit('auction/room', {id: $stateParams.auctionId, userAuction: true});
        });
        ngSocket.emit('auction/getLotList', {
            auctionId: $stateParams.auctionId,
            lot: true
        });

        ngSocket.emit('auction/getSellingStatistics', {auctionId: +$stateParams.auctionId});
        $scope.sellingStatistics = [];


        ngSocket.on('catchSellingStatistics', function (result) {
            result.sellingStatistics.forEach(function (i) {
                i.createdAt = new Date(i.createdAt).getHours() + ':' + new Date(i.createdAt).getMinutes();
                $scope.sellingStatistics.unshift(i);
            });
        });

        ngSocket.emit('auction/getAuction', {id: $stateParams.auctionId});

        ngSocket.on('catchAuction', function (data) {
            if (data.err) {
                alert(data.message);
            }
            $scope.dateAuction = data.data.date;
            if (new Date(data.data.date) <= new Date()) {
                ngSocket.emit('auction/updateLot', {
                    lotId: +$scope.lotId,
                    isPlayOut: true
                });
            }
            if (data.data.start === null) {
                $scope.fuckStop = true
            } else if (data.data.start) {
                $scope.fuckStop = false
            }


        });
        function setLotInfo(lot) {
            $scope.descriptionPrevArr = [];
            $scope.lotList = lot;
            if (lot && lot.descriptionPrev !== undefined) {
                $scope.descriptionPrevArr = $scope.deleteTegP(lot.descriptionPrev);
            }
            if (lot.lot_pictures == undefined) {
                $scope.lotImage = [];
            } else {
                $scope.lotImage = [];
                lot.lot_pictures.forEach(function (item) {
                    if (item.fileName !== null && !$scope.lotImage.length) {
                        $scope.lotImage.push(item.fileName);
                    }
                });
            }
            $scope.lotId = lot.id;
            $scope.lotIdSelect = lot.id;
            ngSocket.emit('auction/getListBids', {auctionId: $stateParams.auctionId, lotId: $scope.lotId});
        }
        ngSocket.emit('auction/room', {id: $stateParams.auctionId, userAuction: true});
        ngSocket.on('lotList', function (data) {
            setLotInfo(data.lotList[0]);
            ngSocket.emit('auction/getLot', {lotId: +$scope.lotId});
        });
        ngSocket.on('auctionUserStop', function (data) {
            $scope.userNumber = data.info.number;
        });
        $scope.getUserNumber = function (id) {
            var userNum = $scope.users.map(function (e) {
                    return e.id;
                }).indexOf(id) + 1;
            return userNum;
        };
        $scope.sold = function (isSold, isClean) {
            $scope.cleanLot = false;
            $scope.soldLot = false;
            $scope.bids = '';
            ngSocket.emit('auction/updateLot', {
                lotId: +$scope.lotId,
                isSold: isSold,
                isCl: isClean,
                auctionId: $stateParams.auctionId,
                lastBid: $scope.lastBid
            });
            // запись статистики проданного лота в таблицу статистики

            var _SellingStatisticsData = {
                userId: $scope.realUserId,
                firstName: $scope.userfirstName,
                lastName: $scope.userlastName,
                patronymic: $scope.userpatronymic,

                lotId: $scope.lotId,
                lotNumber: $scope.lotList.number,
                price: $scope.price,
                auctionId: $stateParams.auctionId,

                isSold: isSold,
                isCl: isClean
            };

            // if ($scope.price > 0 && !isClean){
            //     ngSocket.emit('auction/createSellingStatistics', _SellingStatisticsData);
            // } else {
            //
            // }
            ngSocket.emit('auction/createSellingStatistics', _SellingStatisticsData);

            ngSocket.on('sellingStatisticsCreated', function (result) {
                $scope.sellingStatisticsResult = result;
                $scope.price = false;
            });
        };

        ngSocket.on('lotConfirmed', function (data) {
            $scope.startAuction = true;
            ngSocket.emit('auction/getSellingStatistics', {auctionId: +$stateParams.auctionId});
            $scope.isBids = false;
            ngSocket.emit('auction/getListBids', {auctionId: $stateParams.auctionId, lotId: $scope.lotId});
            $scope.price = data.bid.price;
            $scope.priceBidFrom = data.bid.price + calcStep(data.bid.price);
            $scope.priceNext = $scope.price + calcStep(data.bid.price);
            if(data.userName !== undefined) {
                $scope.userData = data.userName.firstName + ' ' + data.userName.lastName + ' ' + data.userName.patronymic;
                $scope.userfirstName = data.userName.firstName;
                $scope.userlastName = data.userName.lastName;
                $scope.userpatronymic = data.userName.patronymic;
            }
            $scope.realUserId = data.bid.userId;
        });

        $scope.dateStartAuction = function () {
            var date_arr_new = this.dateStart.split('.');
            var time_arr_new = this.timeStart.split(':');
            var date = +new Date(date_arr_new[2],date_arr_new[1]-1,date_arr_new[0],time_arr_new[0],time_arr_new[1]);
            ngSocket.emit('auction/updateAuction', {
                date: +date,
                id: +$stateParams.auctionId
            });
            $scope.timeStart = '';
            $scope.dateStart = '';
        };

        //обновление списка пользователей при регистрации на аук
        ngSocket.emit('userAuction', {auctionId: $stateParams.auctionId});
        ngSocket.on('newUserRoom', function () {
            ngSocket.emit('auction/room', {id: $stateParams.auctionId, userAuction: true});
        });

        ngSocket.on('auctionState', function (data) {
            setLotInfo(data.lot);
            setTimeout(function () {
                $scope.cleanLot = true;
                $scope.soldLot = true;
                $scope.$apply();
            }, 1000);
            ngSocket.emit('auction/getListBids', {auctionId: $stateParams.auctionId, lotId: $scope.lotId});
            ngSocket.emit('auction/getLot', {lotId: +$scope.lotId});
            for (var lot in $scope.lots) {
                if ($scope.lots[lot].id === data.oldLotId) {
                    if (!(typeof data.oldLot.isCl === "undefined")) {
                        $scope.lots[lot].isCl = data.oldLot.isCl;
                    }
                    if (!(typeof data.oldLot.isSold === "undefined")) {
                        $scope.lots[lot].isSold = data.oldLot.isSold;
                    }
                }
            }

            $scope.closedLots = [];
            $scope.lots.forEach(function (lot) {
                if (lot.isCl) {
                    $scope.closedLots.push(lot.number);
                }
            });
        });


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
    }])
});