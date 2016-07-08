define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('FrontPage',['$scope','$http', '$rootScope', '$state', 'ngSocket', function($scope,$http,$rootScope,$state, ngSocket){
        ngSocket.emit('auction/list',{'public':true});
        ngSocket.on('auctionList',function (data) {
            if(data.err){
                alert(data.message);
            }
            $scope.tempUserInfo=$scope.currentUserInfo;

            $scope.auctionList = JSON.parse(JSON.stringify(data.auctionList));
        })
    }])
});