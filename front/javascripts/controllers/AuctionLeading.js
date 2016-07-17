define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionLeading',['$state','$scope','$http', '$rootScope', '$stateParams', 'ngSocket', function($state,$scope,$http,$rootScope,$stateParams, ngSocket){
        $scope.dateStart = '';
        $scope.numberLot = "";
        $scope.cleanLot = true;
        $scope.hasStream = true;
        $scope.isBroadcasting = '';
        $scope.prepare = function prepare() {
            $scope.initPlayer();
        };
        $scope.videoName = 'video:' + Date.now();

        $scope.initPlayer = function () {
            var f = $scope.f = Flashphoner.getInstance();
            //счетчик ошибок перезапуска
            var ErrCounter = 0;

            f.addListener(WCSEvent.ConnectionStatusEvent, function () {
                //После инициализации
                //опубликовать поток с вебки ведущего
                $scope.f.publishStream({
                    name:  $scope.videoName,
                    record: false
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
                    case StreamStatus.Failed:
                        setTimeout(function () {
                            $scope.videoName = 'video:' + Date.now();
                            //опубликовать поток с вебки ведущего
                            $scope.f.publishStream({
                                name:  $scope.videoName,
                                record: false
                            });
                            ngSocket.emit('video/newVideo', {auctionId: +$stateParams.auctionId, name:$scope.videoName});
                        },1000*(ErrCounter++));
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
                port = "8080";
            } else {
                proto = "wss://art-bid.ru";
                port = "8443";
            }

            url = proto + ":" + port;
            f.init(configuration);
            // $scope.f.getAccessToAudioAndVideo();
            f.connect({urlServer: url, appKey: 'defaultApp'});
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
            ngSocket.emit('video/newVideo', {
                auctionId: +$stateParams.auctionId,
                name: $scope.videoName
            });
            ngSocket.emit('auction/startAuction', {id: +$scope.lotId});
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
            $scope.startAuction = true;

        });
        ngSocket.on('catchAuction', function (data) {
            if(data.err) {
                alert(data.message);
            }
            $scope.dateAuction = data.data.date;
            if(new Date(data.data.date) <= new Date()) {

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
            $scope.auctionOn = auction.auction.start ? 1 : 0
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
            ngSocket.emit('auction/getListBids', {auctionId: $stateParams.auctionId});
            $scope.price = data.bid.price;
            $scope.userNumber = data.bid.userId;
            $scope.userData = data.userName.firstName + ' ' + data.userName.lastName + ' ' + data.userName.patronymic;
        });
        $scope.dateStartAuction = function () {
            var date_arr_new = $scope.dateStart.split('.');
            $scope.date = date_arr_new[2] + '-' + date_arr_new[1] + '-' + date_arr_new[0] + 'T00:00:00';
            ngSocket.emit('auction/updateAuction', {
                date: $scope.date,
                id: +$stateParams.auctionId
            });
            $scope.dateStart = '';
        };

        ngSocket.emit('auction/getListBids', {auctionId: $stateParams.auctionId});

        ngSocket.on('bidList', function (bid) {
            if(bid.err) {
                alert(bid.message);
            }
            $scope.bids = bid.bids;
            console.log(bid);
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