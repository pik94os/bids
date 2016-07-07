define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('Main',['$scope','$http', '$rootScope', '$state', '$stateParams', 'ngSocket', function($scope, $http, $rootScope, $state, $stateParams, ngSocket){

        // $rootScope.user = {
        //     id: $sessionStorage.user_id,
        //     firstName: $sessionStorage.firstName,
        //     lastName: $sessionStorage.lastName,
        //     patronymic: $sessionStorage.patronymic
        // };

        ngSocket.emit ('getUserInfo', {});
        ngSocket.on('userInfo', function (data) {
            if(data.err!=undefined && data.err==0){
                $scope.currentUserInfo = data.doc;
            }else{
                $scope.auth = null;
            }
        });

        $rootScope.$on('$viewContentLoaded',function(){
            $('content').css('min-height',($(window).height() - $('header').height() - $('footer').height())+'px');
        });
        $scope.regUserData = {};
        $scope.loginUserData = {};
        $scope.createUser = function (role) {
            if (role = 4) var roleOfNewUser = 4;
            if (role = 3) var roleOfNewUser = 3;
            if ($scope.regUserData.password == $scope.regUserData.confirmationPassword && $scope.regUserData.confirmationCode==123 && $scope.regUserData.acceptTerms == true){
                $http.post('/api/users/reg',{
                    username: $scope.regUserData.username,
                    firstName: $scope.regUserData.firstName,
                    lastName: $scope.regUserData.lastName,
                    patronymic: $scope.regUserData.patronymic,
                    email: $scope.regUserData.email,
                    phone: $scope.regUserData.phone,
                    confirmationCode: $scope.regUserData.confirmationCode,
                    password: $scope.regUserData.password,
                    acceptTerms: $scope.regUserData.acceptTerms,
                    receiveMessages: $scope.regUserData.receiveMessages,
                    roleId: roleOfNewUser
                }, {}).then(function (result) {
                    window.location.reload();
                })
            } else alert("Заполните все необходимые поля");

        };

        $scope.login = function () {
            $http.post('/api/users/login', {
                username: $scope.loginUserData.username,
                password: $scope.loginUserData.password
            }, {}).then(function (result) {
                window.location.reload();
            })
        }
        $scope.logout = function () {
            $http.get('/api/users/logout', {

            }, {}).then(function (result) {
                window.location.reload();
            })
        }
        // создание аукциона
        $scope.newAuction = {};
        $scope.createAuction = function () {
            ngSocket.emit('auction/create', {
                name: $scope.newAuction.nameAuction,
                number: $scope.newAuction.numberAuction,
                date:  $scope.newAuction.date,
                userId: $scope.currentUserInfo.id
            });
        };
        ngSocket.on('auctionCreated', function (data) {
            window.location.reload();
        });
    }])
});