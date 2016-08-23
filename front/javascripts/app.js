/**
 * Created by Роман on 07.12.2014.
 */
define([
    'angular',
    'uiRouter',
    'uiSocket',
    'uiStorage',
    'angular-localForage',
    'angular-svg-round-progressbar',
    './controllers/index',
    './filters/index',
    './factories/index',
    './directives/index',
    './services/index',
    'angularFileUpload'
], function (ng) {
    'use strict';

    return ng.module('app', [
        'ui.router',
        'btford.socket-io',
        'ngStorage',
        'LocalForageModule',
        'angular-svg-round-progressbar',
        'app.controllers',
        'app.filters',
        'app.factories',
        'app.directives',
        'app.services',
        'angularFileUpload'
    ]).run([
        '$rootScope', '$state', '$stateParams', '$sessionStorage', 'SessionService','ngSocket',
        function ($rootScope, $state, $stateParams, $sessionStorage, SessionService, ngSocket) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.auth = null;
            ngSocket.on('userInfo', function (data) {
                if(data.err!=undefined && data.err==0){
                    $sessionStorage.auth = data.doc;
                }else{
                    $sessionStorage.auth = null;
                }
            });
            // Здесь мы будем проверять авторизацию
            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    SessionService.checkAccess(event, toState, toParams, fromState, fromParams);
                }
            );
        }
    ]);
});