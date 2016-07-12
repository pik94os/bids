/** * Created by andrey on 05.07.16.0 */


define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('PageLeading',['$scope','$http', '$rootScope', '$stateParams','ngSocket','$interval', function($scope,$http,$rootScope,$stateParams,ngSocket,$interval){

        ngSocket.emit('auction/list', {public: true});
        ngSocket.on('auctionList', function (data) {
            if(data.err) {
                alert(data.message)
            }
            $scope.auctions = data.auctionList;
            var stop = [];
            $scope.ch = [];
            $scope.min = [];
            $scope.sec = [];
            var curDate = new Date();
            $scope.showProgress = function (date) {
                // 24 часа - 86400000 милисекунд
                if(+(new Date(date)) - +curDate < 86400000) {
                    return true;
                }
            };
            $scope.auctions.forEach(function(auction,index){
                var date = new Date(auction.date);
                var razn = +date - +curDate;
                if ( razn < 86400000 ) {
                    $scope.ch[index]  = Math.floor( razn / 1000 / 60 / 60 );// вычисляем часы
                    $scope.min[index] = Math.floor((razn - ($scope.ch[index] * 1000 * 60 * 60 )) / 1000 / 60);// вычисляем минуты
                    $scope.sec[index] = Math.floor((razn - ($scope.ch[index] * 1000 * 60 * 60 ) - ( $scope.min[index] * 1000 * 60 )) / 1000 );// вычисляем секунды
                    stop[index] = $interval(function() {
                        if(+$scope.ch[index] >= 0 && +$scope.min[index] >= 0 && +$scope.sec[index] >= 0) {
                            if(+$scope.sec[index] == 0 && $scope.min[index] > 0) {
                                $scope.min[index] -= 1;
                                $scope.sec[index] = 59;
                            }
                            if(+$scope.min[index] == 0 && $scope.ch[index] > 0) {
                                $scope.ch[index] -= 1;
                                $scope.min[index] = 59;
                            }
                            if(+$scope.sec[index]>0){
                                $scope.sec[index] -= 1;
                            }
                        }
                        if(+$scope.ch[index] <= 0 && +$scope.min[index] <= 0 && +$scope.sec[index] <= 0){
                            $scope.stopFight(index);
                        }
                    }, 1000);
                }
            });
        });

        $scope.stopFight = function(index) {
            if (angular.isDefined(stop[index])) {
                $interval.cancel(stop[index]);
                stop[index] = null;
            }
        };
        // $scope.ch = 23;
        // $scope.min = 59;
        // $scope.sec = 59;
        // var stop = $interval(function() {
        //     if(+$scope.ch >= 0 && +$scope.min >= 0 && +$scope.sec >= 0) {
        //         if(+$scope.sec == 0 && $scope.min > 0) {
        //             $scope.min -= 1;
        //             $scope.sec = 59;
        //         }
        //         if(+$scope.min == 0 && $scope.ch > 0) {
        //             $scope.ch -= 1;
        //             $scope.min = 59;
        //         }
        //         if(+$scope.sec>0){
        //             $scope.sec -= 1;
        //         }
        //     }
        //     if(+$scope.ch <= 0 && +$scope.min <= 0 && +$scope.sec <= 0){
        //         $scope.stopFight();
        //     }
        // }, 1000);
        //
        // $scope.stopFight = function() {
        //     if (angular.isDefined(stop)) {
        //         $interval.cancel(stop);
        //         stop = undefined;
        //     }
        // };
        // $scope.$on('$destroy', function() {
        //     $scope.stopFight();
        // });

        $scope.countdown = $stateParams.countdown;
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