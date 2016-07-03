define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('Main',['$scope','$http', '$rootScope', '$state', function($scope,$http,$rootScope,$state){
        $rootScope.$on('$viewContentLoaded',function(){
            $('content').css('min-height',($(window).height() - $('header').height() - $('footer').height())+'px');
        });
        $scope.regUserData = {};
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

                })
            } else alert("AAAAAAAAAAAAA!!!!111");

        };

        $scope.authorization = function () {
            $http.post('/api/users/login', {
                username: $scope.regUserData.authEmail,
                password: $scope.regUserData.authPassword,
                roleId: 4
            }, {}).then(function (result) {

            })
        }
    }])
});