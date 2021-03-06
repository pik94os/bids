/**
 * Created by pik on 25.04.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('Lk', ['$scope', '$sessionStorage', '$state', '$rootScope', '$stateParams', 'ngSocket', function ($scope, $sessionStorage, $state, $rootScope, $stateParams, ngSocket) {

        // ngSocket.emit('mailer', {});

        $scope.tab = $stateParams.tab;

        $scope.tempUserInfo = JSON.parse(JSON.stringify($scope.currentUserInfo));
        if ($scope.currentUserInfo.roleId == 3) {
            ngSocket.emit('auction/list', {});
        }

        ngSocket.on('userInfo', function (data) {
            if (data.err != undefined && data.err == 0) {
                $scope.tempUserInfo = JSON.parse(JSON.stringify(data.doc));
                if (data.doc.roleId == 3) {
                    ngSocket.emit('auction/list', {});
                }
            }
        });

        $scope.myDate = function (d) {
            var date = d.split('T')[0].split('-');
            var t = d.split('T')[1].split(':');
            var time = t[0] + ':' + t[1];
            d = date[2] + '.' + date[1] + '.' + date[0];
            return d + ' в ' + time;
        };

        ngSocket.on('auctionCreated', function (result) {
            if (result.err) {
                alert(result.message);
            } else {
                $state.go('auction', {auctionId: result.auction.id});
            }
        });

        ngSocket.on('auctionEdited', function (result) {

            if (result.err) {
                alert(result.message);
            }
            if (result.auction.isDelete == false) {

                $state.go('auction', {auctionId: result.auction.id});
            } else {
                // $state.go('lk?tab=auctions');
                window.location.reload();
                // $scope.$apply();
            }

        });

        // редактирование пользователя
        $scope.editUser = function () {
            ngSocket.emit('editUser', $scope.tempUserInfo);
        };
        ngSocket.on('userChanged', function (data) {
            if (data.err) {
                alert(data.message);
            } else {
                alert('Сохранено');
                ngSocket.emit('getUserInfo', {});
            }
        });

        ngSocket.on('auctionList', function (data) {
            $scope.auctionList = JSON.parse(JSON.stringify(data.auctionList));
            if ($stateParams.tab === 'historyOfAuctions') {
                // $scope.sellingStatistics.delete();
                // if (!sellingStatistics){
                data.auctionList.forEach(function (i) {
                    ngSocket.emit('auction/getSellingStatistics', {auctionId: i.id, isSold: true});
                });
                // }
            // вывод статистики в личном кабинете аукционного дома
            // if ($stateParams.tab === 'historyOfAuctions' && $scope.currentUserInfo.id) {

                ngSocket.on('catchSellingStatistics', function (result) {
                    $scope.sellingStatisticsHouse = [];

                        result.sellingStatistics.forEach(function (r) {
                            // console.log(r)
                            $scope.sellingStatisticsHouse.push(r);
                        });


                });
            // }
            }
        });

        // вывод статистики в личном кабинете покупателя
        if ($stateParams.tab === 'historyOfAuctionsCustomer' && $scope.currentUserInfo.id) {
            ngSocket.emit('auction/getSellingStatistics', {userId: +$scope.currentUserInfo.id, isSold: true});
            ngSocket.on('catchSellingStatistics', function (result) {
                $scope.sellingStatistics = [];
                result.sellingStatistics.result.forEach(function (i) {
                    $scope.sellingStatistics.unshift(i);
                });
            });
        }

        // вывод статистики в личном кабинете ведущего
        if ($stateParams.tab === 'resultsOfAuctionsLeader') {
            ngSocket.emit('auction/list', {forLeader: true});
            ngSocket.on('auctionListForLeader', function (result) {
                $scope.auctionListForLeader = result.auctionList;
                result.auctionList.forEach(function (item, i) {
                });
                console.log($scope.auctionListForLeader);
                // result.auctionList.forEach(function (i) {
                //     console.log('>>>>>>>>>>>>>>>');
                //     console.log(i);
                //     ngSocket.emit('auction/getSellingStatistics', {auctionId: i.id, isSold: true});
                //     ngSocket.emit('user/getUserAuction', {auctionId: i.id});
                // });
                
            });
            $scope.getAuctionSellingStatistics = function (req) {
                ngSocket.emit('auction/getSellingStatistics', {auctionId: req, isSold: true});
                // ngSocket.emit('user/getUserAuction', {auctionId: req});
                delete $scope.sellingStatistics;
            };
            // ngSocket.on('catchUserAuction', function (result) {$scope.userAuction = result.userAuction;});
            ngSocket.on('catchSellingStatistics', function (result) {
                if(result.err) {
                    alert(result.message)
                }
                    $scope.sellingStatistics = [];
                    result.sellingStatistics.forEach(function (item) {
                        $scope.sellingStatistics.unshift(item);
                    });
            });
        }
    }])
});