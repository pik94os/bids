/**
 * Created by pik on 25.04.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('Lk', ['$scope', '$sessionStorage', '$state', '$rootScope', '$stateParams', 'ngSocket', function ($scope, $sessionStorage, $state, $rootScope, $stateParams, ngSocket) {

        // // запрос статистики продаж
        // if ($scope.currentUserInfo.id){
        //     ngSocket.emit('auction/getSellingStatistics', {userId: +$scope.currentUserInfo.id});
        // }
        // $scope.sellingStatistics = {};
        // $scope.sellingStatistics.sellingData = [];
        // ngSocket.on('catchSellingStatistics', function (result) {
        //     // $scope.sellingStatistics = result.sellingStatistics;
        //     result.sellingStatistics.forEach(function (i) {
        //         ngSocket.emit('auction/getAuction', {id: i.auctionId});
        //         ngSocket.on('catchAuction', function (result) {
        //             $scope.auction = result;
        //         });
        //             ngSocket.emit('getUser', {userId: 3});
        //         ngSocket.on('userSelected', function (result) {
        //             $scope.userFinded = result;
        //         });
        //         $scope.sellingStatistics.user = $scope.userFinded;
        //         i.createdAt = new Date(i.createdAt).getDate() + '.' + new Date(i.createdAt).getUTCMonth() + '.' + new Date(i.createdAt).getFullYear() + ' / ' + new Date(i.createdAt).getHours() + ':' + new Date(i.createdAt).getMinutes() + ':' + new Date(i.createdAt).getSeconds();
        //         $scope.sellingStatistics.sellingData.unshift(i);
        //     });
        // });


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
        });
        $scope.sellingStatistics = [];
            if ($scope.currentUserInfo.id) {
                ngSocket.emit('auction/getSellingStatistics', {userId: +$scope.currentUserInfo.id});
            }
        // запрос статистики продаж
        // $scope.getStatistics = function () {
        //     if ($scope.currentUserInfo.id) {
        //         ngSocket.emit('auction/getSellingStatistics', {userId: +$scope.currentUserInfo.id});
        //     }
        //
        // };

        ngSocket.on('catchSellingStatistics', function (result) {
            // $scope.sellingStatistics = result.sellingStatistics;
            result.sellingStatistics.forEach(function (i) {
                // i.createdAt = new Date(i.createdAt).getDate() + '.' + new Date(i.createdAt).getUTCMonth() + '.' + new Date(i.createdAt).getFullYear() + ' / ' + new Date(i.createdAt).getHours() + ':' + new Date(i.createdAt).getMinutes() + ':' + new Date(i.createdAt).getSeconds();
                i.createdAt = i.createdAt.split('T')[0].split('-')[2] + '.' + i.createdAt.split('T')[0].split('-')[1] + '.' + i.createdAt.split('T')[0].split('-')[0] + ' / ' + new Date(i.createdAt).getHours() + ':' + new Date(i.createdAt).getMinutes() + ':' + new Date(i.createdAt).getSeconds();
                // i.createdAt = i.createdAt.split('T')[0].split('-')[2] + '.' + i.createdAt.split('T')[0].split('-')[1] + '.' + i.createdAt.split('T')[0].split('-')[0] + ' / ' + i.createdAt.split('T')[1].split('.')[0];
                $scope.sellingStatistics.unshift(i);
            });
        });

    }])
});