define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('FrontPage',['$localForage','$stateParams','$scope','$http', '$rootScope', '$state', 'ngSocket',
        function($localForage,$stateParams,$scope,$http,$rootScope,$state, ngSocket){
        if($stateParams.dev!=undefined){
            if(+$stateParams.dev===0){
                $localForage.setItem('zaglushka',null).then(function() {
                    $('body').removeClass('dev');
                });
            }else{
                $localForage.setItem('zaglushka',true).then(function() {
                    $('body').addClass('dev');
                });
            }
        }else{
            $localForage.getItem('zaglushka').then(function(data) {
                data
                    ?$('body').addClass('dev')
                    :$('body').removeClass('dev');
            });
        }
        $scope.auctionIn = function (data) {
            $rootScope.selectedAuctionInMainId = data;
        };

        ngSocket.emit('user/getUserAuction', {
            userId: $scope.currentUserInfo.id
        });
        ngSocket.on('catchUserAuction', function (data) {
            $scope.userAuction = data.userAuction;
        });

        $scope.checkUserReg = function (auctionId) {
            if ($scope.userAuction) {
                var result = $scope.userAuction.find(function (item) {
                    return (item.userId == $scope.currentUserInfo.id) && (item.auctionId == auctionId)
                });
                return result;
            } else {
                return false;
            }
        };
            $scope.archiveAuction = function (data) {
                $scope.archive = data ? 'скрыть' : 'показать'
            };

        ngSocket.emit('auction/list',{'public':true});
        ngSocket.on('auctionList',function (data) {
            if(data.err){
                alert(data.message);
            }
            
            if(+$scope.currentUserInfo.id){
                $scope.notRegistr = true;
            }
            $scope.archive = 'показать';
            $scope.tempUserInfo=$scope.currentUserInfo;
            $scope.myDate = function (d) {
                var date = d.split('T')[0].split('-');
                var t = d.split('T')[1].split(':');
                var time = t[0]+':'+t[1];
                d = date[2]+'.'+date[1]+'.'+date[0];
                return d + ' в ' + time;
            };
            $scope.auctionList = []; //JSON.parse(JSON.stringify(data.auctionList));
            $scope.auctionListIsArchive = [];
            data.auctionList.forEach(function (item) {
                 if(!item.isArchive) {
                    if(Date.now() < item.date && item.date < (Date.now() + 86400000)) {
                        $scope.auctionList.unshift(item);
                    } else {
                        $scope.auctionList.push(item);
                    }
                } else {
                    $scope.auctionListIsArchive.push(item)
                }
            });
        });
        
        $scope.hidedBtns = [];
        $scope.hideBtnSet = function (id) {
            $scope.hidedBtns.push(id);
        };

        // $scope.hideBtnSet = function (id) {
        //     $scope.buttonHide = true;
        //     setTimeout (function () {
        //         $scope.buttonHide = false;
        //         $scope.indexBtn = id;
        //         $scope.$apply();
        //     },2000);
        //
        //     console.log('>>>>>>>>>>>>>>>>>'+id)
        // };



    }])
});