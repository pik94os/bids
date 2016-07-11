define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('RoomHeader',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        $scope.countdown = $stateParams.countdown;
    }]).controller('Room',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
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

        var masImages = ["/images/FOR_DEV/lg_book.png", "/images/FOR_DEV/sm_book.png"];
        $scope.currentImage = masImages[0];
        var iij = -1;
        setInterval(function () {
            iij = (iij==masImages.length)?0:iij + 1;
            $scope.currentImage = masImages[iij];
            $scope.$apply();
        }, 2000);

    }])
});