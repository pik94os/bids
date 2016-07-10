define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('AuctionHeader',['$scope', '$stateParams', function($scope, $stateParams){
        $scope.open = +$stateParams.auctionId?$stateParams.open:2;
    }]).controller('Auction',['$scope','$http', '$rootScope', '$stateParams', 'ngSocket', 'FileUploader', function($scope,$http,$rootScope,$stateParams,ngSocket,FileUploader){
        $scope.open = +$stateParams.auctionId?$stateParams.open:2;
        $scope.contactsShow= false;
        $scope.showContacts = function () {
            $scope.contactsShow= true;
        };
        $scope.hideContacts = function () {
            $scope.contactsShow= false;
        };

        // получение списка лотов выбранного аукциона
        ngSocket.emit('auction/getLotList', {
            auctionId: $stateParams.auctionId
        });
        ngSocket.on('lotList', function (data) {
            $scope.lotList = JSON.parse(JSON.stringify(data.lotList));
            $scope.listPics = JSON.parse(JSON.stringify(data.listPics));
            // $scope.lotList = data;
        });

// // импорт лотов из CSV
// //         $scope.CSVParsedFile={};
//         var uploader = $scope.uploader = new FileUploader({
//             url: '/api/upload/lotCSV',
//             autoUpload: true,
//             removeAfterUpload: true,
//             queueLimit: 1
//         });
//
//         // FILTERS for CSV
//
//         uploader.filters.push({
//             name: 'customFilter',
//             fn: function(item /*{File|FileLikeObject}*/, options) {
//                 return this.queue.length < 10;
//             }
//         });
//
//         // CALLBACKS
//
//         uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
//             console.info('onWhenAddingFileFailed', item, filter, options);
//         };
//         uploader.onAfterAddingFile = function(fileItem) {
//             console.info('onAfterAddingFile', fileItem);
//         };
//         uploader.onAfterAddingAll = function(addedFileItems) {
//             console.info('onAfterAddingAll', addedFileItems);
//         };
//         uploader.onBeforeUploadItem = function(item) {
//             console.info('onBeforeUploadItem', item);
//         };
//         uploader.onProgressItem = function(fileItem, progress) {
//             console.info('onProgressItem', fileItem, progress);
//         };
//         uploader.onProgressAll = function(progress) {
//             console.info('onProgressAll', progress);
//         };
//         uploader.onSuccessItem = function(fileItem, response, status, headers) {
//             console.info('onSuccessItem', fileItem, response, status, headers);
//             alert('Файл загружен');
//             $scope.CSVParsedFile = response;
//         };
//         uploader.onErrorItem = function(fileItem, response, status, headers) {
//             console.info('onErrorItem', fileItem, response, status, headers);
//         };
//         uploader.onCancelItem = function(fileItem, response, status, headers) {
//             console.info('onCancelItem', fileItem, response, status, headers);
//         };
//         uploader.onCompleteItem = function(fileItem, response, status, headers) {
//             console.info('onCompleteItem', fileItem, response, status, headers);
//         };
//         uploader.onCompleteAll = function() {
//             console.info('onCompleteAll');
//         };
//
//         console.info('uploader', uploader);
    }]);
});