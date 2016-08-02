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
            }
            $state.go('auction', {auctionId: result.auction.id});
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
                data.auctionList.forEach(function (i) {
                    ngSocket.emit('auction/getSellingStatistics', {auctionId: i.id});
                });
            }
            // вывод статистики в личном кабинете дома
            if ($stateParams.tab === 'historyOfAuctions' && $scope.currentUserInfo.id) {
                $scope.sellingStatisticsHouse = [];
                ngSocket.on('catchSellingStatistics', function (result) {
                    result.sellingStatistics.forEach(function (r) {
                        // console.log(r)
                        $scope.sellingStatisticsHouse.push(r);
                    });
                });
            }
        });

        // вывод статистики в личном кабинете покупателя
        if ($stateParams.tab === 'historyOfAuctionsCustomer' && $scope.currentUserInfo.id) {
            ngSocket.emit('auction/getSellingStatistics', {userId: +$scope.currentUserInfo.id});
            ngSocket.on('catchSellingStatistics', function (result) {
                $scope.sellingStatistics = [];
                result.sellingStatistics.forEach(function (i) {
                    $scope.sellingStatistics.unshift(i);
                });
            });
        }
    }])
});