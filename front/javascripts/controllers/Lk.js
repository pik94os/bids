/**
 * Created by pik on 25.04.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('Lk', ['$scope', '$state', '$rootScope', '$stateParams', 'ngSocket', function ($scope, $state, $rootScope, $stateParams, ngSocket) {
        $scope.tab = $stateParams.tab;
        
        $scope.tempUserInfo = JSON.parse(JSON.stringify($scope.currentUserInfo));
        if($scope.currentUserInfo.roleId==3){
            ngSocket.emit('auction/list',{});
        }

        ngSocket.on('userInfo', function (data) {
            if(data.err!=undefined && data.err==0) {
                $scope.tempUserInfo = JSON.parse(JSON.stringify(data.doc));
                if(data.doc.roleId==3){
                    ngSocket.emit('auction/list',{});
                }
            }
        });

        $scope.myDate = function (d) {
            var date = d.split('T')[0].split('-');
            var t = d.split('T')[1].split(':');
            var time = t[0]+':'+t[1];
            d = date[2]+'.'+date[1]+'.'+date[0];
            return d + ' в ' + time;
        };

        ngSocket.on('auctionCreated', function (result) {
            if(result.err){
                alert(data.message);
            }
            $state.go('auction',{auctionId:1});
        });


        // редактирование пользователя
        $scope.editUser = function () {
            ngSocket.emit('editUser', $scope.tempUserInfo);
        };
        ngSocket.on('userChanged', function (data) {
            if(data.err){
                alert(data.message);
            }else{
                alert('Сохранено');
                ngSocket.emit('getUserInfo',{});
            }
        });

        ngSocket.on('auctionList', function (data) {
            $scope.auctionList = JSON.parse(JSON.stringify(data.auctionList));
        });

        
    }])
});