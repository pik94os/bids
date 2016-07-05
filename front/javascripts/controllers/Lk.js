/**
 * Created by pik on 25.04.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('Lk', ['$scope', '$http', '$rootScope', '$stateParams', 'ngSocket', function ($scope, $http, $rootScope, $stateParams, ngSocket) {
        $scope.tab = $stateParams.tab;

        // получение информации о залогиненом пользователе
        ngSocket.emit('getUserInfo', {});
        ngSocket.on('userInfo', function (data) {
            if (data.err != undefined && data.err == 0) {
                $scope.currentUserInfo = data.doc;
            } else {
                $scope.auth = null;
            }
        });

        // редактирование пользователя
        var userChanges = {
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
        };

        $scope.changeUser = function () {
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
        ngSocket.on('userChanged', function (data) {
        });
    }])
});