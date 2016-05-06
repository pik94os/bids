/**
 * Created by pik on 06.05.16.
 */
define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('LotHeader',['$scope', '$stateParams', function($scope, $stateParams){
        $scope.open = $stateParams.open;
    }]).controller('Lot',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.open = $stateParams.open;
    }])
});