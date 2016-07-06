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
            //Страница редактирования аукциона, главная аукциона, любимые лоты
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
            //Страница редактирования и просмотра любого лота
            .state('lot', {
                url: '/lot?open&tab',
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
            //Комната торгов
            .state('room', {
                url: '/room?countdown',
                views:{
                    '': {
                        templateUrl: "/templates/room/list.html",
                        controller: 'Room'
                    },
                    'header':{
                        templateUrl: "/templates/room/header.html",
                        controller: 'RoomHeader'
                    }
                }
            })
            //Календарь
            .state('calendar', {
                url: '/calendar',
                views:{
                    '': {
                        templateUrl: "/templates/calendar/list.html",
                        controller: 'Calendar'
                    },
                    'header':{
                        templateUrl: "/templates/calendar/header.html",
                        controller: 'CalendarHeader'
                    }
                }
            })
            //Страница ведущего
            .state('page-leading', {
                url: '/page-leading?countdown',
                views:{
                    '': {
                        templateUrl: "/templates/page-leading/list.html",
                        controller: 'PageLeading'
                    },
                    'header':{
                        templateUrl: "/templates/page-leading/header.html"
                    }
                }
            })

            //Страница аукциона для ведущего
            .state('auction-leading', {
                url: '/auction-leading',
                views:{
                    '': {
                        templateUrl: "/templates/auction-leading/list.html"
                        // controller: 'AuctionLeading'
                    },
                    'header':{
                        templateUrl: "/templates/auction-leading/header.html"
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