define(['./app'], function (app) {
    'use strict';
    return app.config(function($stateProvider, $urlRouterProvider, $locationProvider ) {
        // Любые неопределенные url перенаправлять на /err404
        $urlRouterProvider.otherwise("/err404");
        $stateProvider
            //Стартовая страница
            .state('account', {
                url: "/",
                views:{
                    '': {
                        templateUrl: "/templates/front-page/list.html",
                        controller: 'FrontPage'
                    },
                    'header':{
                        templateUrl: "/templates/front-page/header.html",
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