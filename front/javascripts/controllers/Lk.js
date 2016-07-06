/**
 * Created by pik on 25.04.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('Lk', ['$scope', '$http', '$rootScope', '$stateParams', 'ngSocket', function ($scope, $http, $rootScope, $stateParams, ngSocket) {
        $scope.tab = $stateParams.tab;

        // получение информации о залогиненом пользователе
        ngSocket.on('userInfo', function (data) {
            if (data.err != undefined && data.err == 0) {
                $scope.currentUserInfo = JSON.parse(JSON.stringify(data.doc));
                // получение списка аукционов созданных текущим залогинившимся пользователем
                ngSocket.emit('auction/list', {
                    userId: $scope.currentUserInfo.id
                });
            } else {
                $scope.auth = null;
            }
        });
        // $scope.$on('$viewContentLoading',function () {
        //     ngSocket.emit('auction/list', {});
        //     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>ok');
        // });




        // редактирование пользователя
        $scope.editUser = function () {
            ngSocket.emit('editUser', {
                id: $scope.currentUserInfo.id,
                // поля пользователя
                username: $scope.username,
                firstName: $scope.firstName,
                lastName: $scope.lastName,
                patronymic: $scope.patronymic,
                email: $scope.email,
                phone: $scope.phone,
                confirmationCode: $scope.confirmationCode,
                password: $scope.password,

                // поля аукционного дома
                index: $scope.index,
                country: $scope.country,
                city: $scope.city,
                street: $scope.street,
                house: $scope.house,
                office: $scope.office,

                // поля кредитной карты
                typeOfCard: $scope.typeOfCard,
                numberOfCard: $scope.numberOfCard,
                nameOfCardHolder: $scope.nameOfCardHolder,
                month: $scope.month,
                year: $scope.year,
                cardCode: $scope.cardCode,

                // прочее
                acceptTerms: $scope.acceptTerms,
                receiveMessages: $scope.receiveMessages
            });
        };
        ngSocket.on('userChanged', function (data) {});

        ngSocket.on('auctionList', function (data) {
            $scope.auctionList = JSON.parse(JSON.stringify(data.auctionList));
        });

        
    }])
});