/** * Created by andrey on 05.07.16.0 */


define(['./module','jquery'],function(controllers,$){
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
                if(+((new Date(date)) - curDate) > 0 && +(new Date(date)) - curDate < 86400000) {
                    return true;
                }
            };
            $scope.auctions.forEach(function(auction,index){
                      stop[index] = $interval(function() {
                          var date = new Date(auction.date);
                          var razn = +date - new Date();
                          if(razn >= 0) {
                              $scope.ch[index]  = Math.floor( razn / 1000 / 60 / 60 );// вычисляем часы
                              $scope.min[index] = Math.floor((razn - ($scope.ch[index] * 1000 * 60 * 60 )) / 1000 / 60);// вычисляем минуты
                              $scope.sec[index] = Math.floor((razn - ($scope.ch[index] * 1000 * 60 * 60 ) - ( $scope.min[index] * 1000 * 60 )) / 1000 );// вычисляем секунды
                              if(+$scope.ch[index] <= 0 && +$scope.min[index] <= 0 && +$scope.sec[index] <= 0){
                                  $interval.cancel(stop[index]);
                                  stop[index] = null;
                                  ngSocket.emit('auction/list', {public: true});
                              }
                          }
                    }, 1000);
            });
        });

        $scope.stopFight = function(index) {
            if (angular.isDefined(stop[index])) {
                $interval.cancel(stop[index]);
                stop[index] = null;
            }
        };

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