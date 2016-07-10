define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('RoomHeader',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.countdown = +$stateParams.countdown-1?2:1;
    }]).controller('Room',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.countdown = +$stateParams.countdown-1?2:1;
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