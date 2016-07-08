define(['./module','jquery'],function(controllers,$){
    'use strict';

    controllers.controller('Main',['$sessionStorage','$scope','$http', '$rootScope', '$state', '$stateParams', 'ngSocket', 'FileUploader', function($sessionStorage, $scope, $http, $rootScope, $state, $stateParams, ngSocket, FileUploader){
        ngSocket.emit ('getUserInfo', {});
        $scope.currentUserInfo=JSON.parse(JSON.stringify($sessionStorage.auth));
        console.log($sessionStorage);
        ngSocket.on('userInfo', function (data) {
            if(data.err!=undefined && data.err==0){
                $scope.currentUserInfo = JSON.parse(JSON.stringify(data.doc));
            }else{
                $scope.auth = null;
                $scope.currentUserInfo.id = null;
            }
        });

        $rootScope.$on('$viewContentLoaded',function(){
            $('content').css('min-height',($(window).height() - $('header').height() - $('footer').height())+'px');
        });
        $scope.regUserData = {};
        $scope.loginUserData = {};
        $scope.createUser = function (role) {
            var roleOfNewUser;
            if (role == 4) roleOfNewUser = 4;
            if (role == 3) roleOfNewUser = 3;
            if ($scope.regUserData.password == $scope.regUserData.confirmationPassword && $scope.regUserData.confirmationCode==123 && $scope.regUserData.acceptTerms == true){
                $http.post('/api/users/reg',{
                    username: $scope.regUserData.username,
                    firstName: $scope.regUserData.firstName,
                    lastName: $scope.regUserData.lastName,
                    patronymic: $scope.regUserData.patronymic,
                    email: $scope.regUserData.email,
                    phone: $scope.regUserData.phone,
                    confirmationCode: $scope.regUserData.confirmationCode,
                    password: $scope.regUserData.password,
                    acceptTerms: $scope.regUserData.acceptTerms,
                    receiveMessages: $scope.regUserData.receiveMessages,
                    roleId: roleOfNewUser
                }, {}).then(function (result) {
                    window.location.reload();
                })
            } else alert("Заполните все необходимые поля");

        };

        $scope.login = function () {
            $http.post('/api/users/login', {
                username: $scope.loginUserData.username,
                password: $scope.loginUserData.password
            }, {}).then(function (result) {
                window.location.reload();
            })
        };
        $scope.logout = function () {
            $http.get('/api/users/logout', {

            }, {}).then(function (result) {
                window.location.reload();
            })
        };
        // создание аукциона
        $scope.newAuction = {};
        $scope.createAuction = function () {
            ngSocket.emit('auction/create', {
                name: $scope.newAuction.nameAuction,
                number: $scope.newAuction.numberAuction,
                date:  $scope.newAuction.date,
                userId: $scope.currentUserInfo.id
            });
        };
        ngSocket.on('auctionCreated', function (result) {
            
        });

        // импорт лотов из CSV
        $scope.CSVParsedFile={};
        var uploader = $scope.uploader = new FileUploader({
            url: '/api/upload/lotCSV',
            autoUpload: true,
            removeAfterUpload: true,
            queueLimit: 1
        });

        // FILTERS for CSV

        uploader.filters.push({
            name: 'customFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 10;
            }
        });

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
            alert('Файл загружен');
            $scope.CSVParsedFile = response;
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);

        $scope.createNewLotFromCSV = function () {
            var data = {
                CSVParsedFile: $scope.CSVParsedFile,
                auctionId: $stateParams.auctionId
            };
            ngSocket.emit('createNewLotFromCSV', data);
        };

        ngSocket.on('createCSVReport', function (result) {
            // $scope.countOfRenewedRows = result.renewedRows;
            // $scope.countOfCreatedRows = result.createdRows;
            // alert('Строки созданы');
        });

        $scope.goToPageHeader = function () {
            if ( $scope.currentUserInfo.roleId === 5 ) {
                $state.go('page-leading');
            } else {
                $state.go('lk');
            }
        };
    }])
});