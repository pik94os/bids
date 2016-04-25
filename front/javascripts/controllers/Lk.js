/**
 * Created by pik on 25.04.16.
 */
define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('Lk',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.tab = $stateParams.tab;
    }])
});