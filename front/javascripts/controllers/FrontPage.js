define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('FrontPage',['$scope','$http', '$rootScope', '$state', 'ngSocket', function($scope,$http,$rootScope,$state, ngSocket){
        ngSocket.emit('auction/list',{'public':true});
        ngSocket.on('auctionList',function (data) {
            if(data.err){
                alert(data.message);
            }
            $scope.tempUserInfo=$scope.currentUserInfo;
            $scope.myDate = function (d) {
                var date = d.split('T')[0].split('-');
                var t = d.split('T')[1].split(':');
                var time = t[0]+':'+t[1];
                d = date[2]+'.'+date[1]+'.'+date[0];
                return d + ' в ' + time;
            };
            $scope.auctionList = JSON.parse(JSON.stringify(data.auctionList));
        })
    }])
});