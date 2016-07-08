/**
 * Created by pik on 25.04.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('Lk', ['$scope', '$http', '$rootScope', '$stateParams', 'ngSocket', function ($scope, $http, $rootScope, $stateParams, ngSocket) {
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

        ngSocket.on('auctionCreated', function (result) {
            ngSocket.emit('auction/list',{});
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