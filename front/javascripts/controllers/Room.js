define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('RoomHeader',['ngSocket','$scope','$http', '$rootScope', '$stateParams', function(ngSocket,$scope,$http,$rootScope,$stateParams){
        // получение одного аукциона по ID
        ngSocket.emit('auction/room', {
            id: $stateParams.auctionId
        });
        ngSocket.on('room',function (data) {
            if(data.err){
                return alert(data.message);
            }
            var date = new Date(data.auction.date);
            $scope.countdown = (date.getTime() > Date.now())?1:2;
        })
    }]).controller('Room',['ngSocket','$scope','$http', '$rootScope', '$stateParams','$interval', function(ngSocket,$scope,$http,$rootScope,$stateParams,$interval){
        ngSocket.on('room',function (data) {
            if(data.err){
                return alert(data.message);
            }
            var date = new Date(data.auction.date);
            $scope.countdown = (date.getTime() > Date.now())?1:2;
        });
        $scope.ch = 23;
        $scope.min = 59;
        $scope.sec = 59;
        var stop = $interval(function() {
            if(+$scope.ch >= 0 && +$scope.min >= 0 && +$scope.sec >= 0) {
                if(+$scope.sec == 0 && $scope.min > 0) {
                    $scope.min -= 1;
                    $scope.sec = 59;
                }
                if(+$scope.min == 0 && $scope.ch > 0) {
                    $scope.ch -= 1;
                    $scope.min = 59;
                }
                if(+$scope.sec>0){
                    $scope.sec -= 1;
                }
            }
            if(+$scope.ch <= 0 && +$scope.min <= 0 && +$scope.sec <= 0){
                $scope.stopFight();
            }
        }, 1000);
        
        $scope.stopFight = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };
        $scope.$on('$destroy', function() {
            $scope.stopFight();
        });
        $scope.popup = false;
        $scope.setPopup = function(index){
            $scope.popup = index;
        };
        function moveToTheRigh() {
            var countInFirstLine = 0;
            var lt = $('.lot-table:first-child');
            var childNum = 1;
            var i=2;
            $('.lot-table.moveToTheRight').removeClass('moveToTheRight');
            while(childNum && lt.length){
                lt = lt.next();
                if(lt.position().top === $('.lot-table:first-child').position().top){
                    countInFirstLine++
                }else{
                    lt = $('.lot-table:nth-child('+((countInFirstLine+2)*childNum - (2*childNum-(i++)))+')').addClass('moveToTheRight');
                    if(lt.length){
                        childNum+=2;
                    }else{
                        childNum = 0;
                    }
                }
            }
        }
        $scope.$on('LastRepeaterElement', function(){
            moveToTheRigh();
        });
        $(window).resize( function(){
            moveToTheRigh();
        });
    }])
});