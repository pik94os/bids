/**
 * Created by pik on 25.04.16.
 */
define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('Lk',['$scope','$http', '$rootScope', '$stateParams', 'ngSocket', function($scope,$http,$rootScope,$stateParams, ngSocket){
        $scope.tab = $stateParams.tab;
        ngSocket.emit ('getUserInfo', {});
        ngSocket.on('userInfo', function (data) {
            if(data.err!=undefined && data.err==0){
                $scope.currentUserInfo = data.doc;
            }else{
                $scope.auth = null;
            }
        });
    }])
});