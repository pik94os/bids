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
                },
                data:{
                    noAD:true
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
                },
                data:{
                    noAD:true
                }
            })
            //Страница редактирования аукциона, главная аукциона, любимые лоты
            .state('auction', {
                url: '/auction?open&auctionId',
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
                url: '/lot?auctionId&lotId&year&titlePicId',
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
            //Страница создания лота вручную
            .state('createlot', {
                url: '/createlot?auctionId',
                views:{
                    '': {
                        templateUrl: "/templates/lot/createlot.html",
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
                url: '/room?auctionId',
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
                },
                data:{
                    noAD:true
                }
            })
            //Страница ведущего
            .state('page-leading', {
                url: '/page-leading',
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

            //Страница О нас
            .state('about-us', {
                url: '/about-us',
                views:{
                    '': {
                        templateUrl: "/templates/about-us/list.html"
                    },
                    'header':{
                        templateUrl: "/templates/about-us/header.html"
                    }
                },
                data:{
                    noAD:true
                }
            })

            //Страница Контакты
            .state('contacts', {
                url: '/contacts',
                views:{
                    '': {
                        templateUrl: "/templates/contacts/list.html"
                    },
                    'header':{
                        templateUrl: "/templates/contacts/header.html"
                    }
                },
                data:{
                    noAD:true
                }
            })

            //Страница аукциона для ведущего
            .state('auction-leading', {
                url: '/auction-leading?auctionId',
                views:{
                    '': {
                        templateUrl: "/templates/auction-leading/list.html",
                        controller: 'AuctionLeading'
                    },
                    'header':{
                        templateUrl: "/templates/auction-leading/header.html"
                    }
                }
            })

            //Страница информация
            .state('information', {
                url: '/information',
                views:{
                    '': {
                        templateUrl: "/templates/information/list.html"
                    },
                    'header':{
                        templateUrl: "/templates/information/header.html"
                    }
                }
            })

            //Страница аукционы
            .state('auctions', {
                url: '/auctions',
                views:{
                    '': {
                        templateUrl: "/templates/auctions/list.html",
                        controller: 'FrontPage'
                    },
                    'header':{
                        templateUrl: "/templates/auctions/header.html"
                    }
                }
            })

            //Страница админ
            .state('admin', {
                url: '/admin?tab',
                views:{
                    '': {
                        templateUrl: "/templates/admin/list.html",
                        controller: 'Admin'
                    },
                    'header':{
                        templateUrl: "/templates/admin/header.html"
                    }
                }
            })

            //Ошибка 404
            .state('err_404', {
                url: "/err404",
                templateUrl: "/templates/err404.html",
                data:{
                    noAD:true
                }
            });
        //Включаем красивые url(требуется html5)
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });
});