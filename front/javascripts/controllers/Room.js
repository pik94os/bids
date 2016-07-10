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
    }]).controller('Room',['ngSocket','$scope','$http', '$rootScope', '$stateParams', function(ngSocket,$scope,$http,$rootScope,$stateParams){
        ngSocket.on('room',function (data) {
            if(data.err){
                return alert(data.message);
            }
            var date = new Date(data.auction.date);
            $scope.countdown = (date.getTime() > Date.now())?1:2;
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