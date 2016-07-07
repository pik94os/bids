/**
 * Created by pik on 06.05.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('LotHeader', ['$scope', '$stateParams', 'ngSocket', function ($scope, $stateParams, ngSocket) {
        $scope.open = +$stateParams.open;

        // получение одного лота по ID
        ngSocket.emit('auction/getLot', {
            lotId: $stateParams.lotId
        });
        ngSocket.on('lotSelected', function (data) {
            $scope.lot = JSON.parse(JSON.stringify(data.lot));
        });

    }]).controller('Lot', ['$scope', '$http', '$rootScope', '$stateParams', 'ngSocket', function ($scope, $http, $rootScope, $stateParams, ngSocket) {
        $scope.open = +$stateParams.open;
        $scope.tab = $stateParams.tab;

        // получение одного лота по ID
        ngSocket.on('lotSelected', function (data) {
            $scope.lot = JSON.parse(JSON.stringify(data.lot));
        });

    }])
});