define(['./app'], function (app) {
    'use strict';
    return app.config(function($stateProvider, $urlRouterProvider, $locationProvider ) {
        // Любые неопределенные url перенаправлять на /err404
        $urlRouterProvider.otherwise("/err404");
        $stateProvider
            //Стартовая страница
            .state('front-page', {
                url: "/",
                views:{
                    '': {
                        templateUrl: "/templates/front-page/list.html",
                        controller: 'FrontPage'
                    },
                    'header':{
                        templateUrl: "/templates/front-page/header.html"
                    }
                }
            })
            //Личный кабинет
            .state('lk', {
                url: "/lk?tab",
                views:{
                    '': {
                        templateUrl: "/templates/lk/list.html",
                        controller: 'Lk'
                    },
                    'header':{
                        templateUrl: "/templates/lk/header.html"
                    }
                }
            })
            .state('auction', {
                url: '/auction?open',
                views:{
                    '': {
                        templateUrl: "/templates/auction/list.html",
                        controller: 'Auction'
                    },
                    'header':{
                        templateUrl: "/templates/auction/header.html",
                        controller: 'AuctionHeader'
                    }
                }
            })
            .state('lot', {
                url: '/lot',
                views:{
                    '': {
                        templateUrl: "/templates/lot/list.html",
                        controller: 'Lot'
                    },
                    'header':{
                        templateUrl: "/templates/lot/header.html",
                        controller: 'LotHeader'
                    }
                }
            })
            .state('room', {
                url: '/room',
                views:{
                    '': {
                        templateUrl: "/templates/room/list.html"
                    },
                    'header':{
                        templateUrl: "/templates/room/header.html"
                    }
                }
            })
            //Ошибка 404
            .state('err_404', {
                url: "/err404",
                templateUrl: "/templates/err404.html"
            });
        //Включаем красивые url(требуется html5)
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });
});