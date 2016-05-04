define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('Main',['$scope','$http', '$rootScope', '$state', function($scope,$http,$rootScope,$state){
        $rootScope.$on('$viewContentLoaded',function(){
            $('content').css('min-height',($(window).height() - $('header').height() - $('footer').height())+'px');
        });
    }])
});