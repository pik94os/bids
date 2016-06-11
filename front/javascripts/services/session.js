/**
 * Created by pik on 04.03.16.
 */
define(['./module'],function (services) {
    services.service('SessionService', [
        '$injector',
        function($injector) {
            "use strict";

            this.checkAccess = function(event, toState, toParams, fromState, fromParams) {
                /*var $scope = $injector.get('$rootScope'),
                    $sessionStorage = $injector.get('$sessionStorage');

                var shouldLogin = (toState.data.noLogin == undefined || !toState.data.noLogin);
                // NOT authenticated - wants any private stuff
                if(shouldLogin){
                    if ($sessionStorage.auth!=undefined && $sessionStorage.auth && +$sessionStorage.auth.login) {
                        $scope.$root.auth = +$sessionStorage.auth.login;
                        if($sessionStorage.role){
                            $scope.$root.role = +$sessionStorage.role;
                        }
                    } else if(toState.name !== 'home'){
                        $scope.$state.go('home');
                        event.preventDefault();
                        return false;
                    }
                }*/
            };
        }
    ]);
});