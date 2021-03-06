/**
 * Created by pik on 06.05.16.
 */
define(['./module', 'jquery'], function (controllers, $) {
    'use strict';
    controllers.controller('LotHeader', ['$state', '$scope', '$stateParams', 'ngSocket', function ($state, $scope, $stateParams, ngSocket) {
        var lotArr = new Array();
        var currentId = 1;
        $scope.open = ($stateParams.lotId) ? 1 : 0;
        if ($scope.open) {
            ngSocket.emit('auction/getLot', {
                lotId: $stateParams.lotId
            });
        }

        // получение списка айдишников лотов
        ngSocket.on('lotList', function (data) {
            lotArr = data.lotList;
            currentId = lotArr.map(function (e) {
                return e.id;
            }).indexOf($scope.lotId);
        });


        ngSocket.on('lotSelected', function (data) {
            $scope.lot = JSON.parse(JSON.stringify(data.lot));
            $scope.lotId = $scope.lot.id;
            $scope.isPlayOut = $scope.lot.isPlayOut;
            $scope.open = ($scope.lot.isSold || $scope.lot.isCl) ? 2 : 1;
            ngSocket.emit('auction/getLotList', {
                auctionId: $scope.lot.auctionId,
                selectLot: true
            });
        });

        // переход на предыдущий лот
        $scope.goToPrevLot = function () {
            if (currentId > 0)
                currentId -= 1;
            $state.go('lot', {
                lotId: lotArr[currentId].id
            });
        };

        // переход на следующий лот
        $scope.goToNextLot = function () {
            if (currentId < lotArr.length - 1)
                currentId += 1;
            $state.go('lot', {
                lotId: lotArr[currentId].id
            });
        }
    }]).controller('Lot', ['$anchorScroll', '$scope', '$http', '$rootScope', '$stateParams', 'ngSocket', 'FileUploader', '$state', function ($anchorScroll, $scope, $http, $rootScope, $stateParams, ngSocket, FileUploader, $state) {
        $scope.open = ($stateParams.lotId) ? 1 : 0;
        $scope.tab = $stateParams.tab;
        $scope.bidPrice = 0;
        $scope.step = 1;
        $scope.lot = {};
        $scope.confirm = {err: null, message: null};
        $scope.sellingPrice = null;

        //инициализация параметров лота
        var params = ['description', 'sellingPrice', 'estimateFrom', 'estimateTo'];
        initLotParams($scope, params, initObjFromArr(params, ["", 0, 0, 0]));

        // создание лота
        $scope.createLot = function () {
            ngSocket.emit('auction/createLot', {
                number: $stateParams.number,
                description: $scope.description,
                estimateFrom: $scope.estimateFrom,
                estimateTo: $scope.estimateTo,
                sellingPrice: $scope.sellingPrice,
                auctionId: $stateParams.auctionId,
                year: $stateParams.year,
                titlePicId: $stateParams.titlePicId
            });
        };
        ngSocket.on('catchAuction', function (data) {
            if (data.err) {
                alert(data.message)
            }
            $scope.bidPrice = data.data.start && $scope.bids.length ? $scope.sellingPrice + calcStep($scope.sellingPrice) : $scope.estimateFrom;
        });
        // подтверждение бида
        $scope.confirmLot = function () {
            if ($scope.$state.current.name === 'lot') {
                ngSocket.emit('userAuction', {auctionId: $scope.auctionId});
            }
            if ($scope.bidPrice >= $scope.estimateFrom) {
                ngSocket.emit('auction/confirmLot', {
                    lotId: +$stateParams.lotId,
                    bidPrice: +$scope.bidPrice,
                    auctionId: $scope.auctionId
                });
            } else {
                $scope.confirm.err = 1;
                $scope.confirm.message = 'Бид ниже минимальной цены'
            }
        };

        ngSocket.on('auctionState', function (data) {
            if (data.oldLotId == $scope.lot.id || data.lotId == $scope.lot.id) {
                ngSocket.emit('auction/getLot', {
                    lotId: $stateParams.lotId
                });
            }
        });

        ngSocket.on('lotConfirmed', function (data) {
            if (data.err == 0) {
                $scope.confirm = data;
                if (data.userName !== undefined && data.userName) {
                    $scope.confirm.message = null;
                    $scope.confirm.err = null;
                } else {
                    $scope.confirm.message = 'Бид ' + data.bid.price + ' успешно добавлен';
                }
            } else {
                $scope.confirm = data
            }
            $scope.sellingPrice = data.bid.price;
            $scope.bidPrice = $scope.sellingPrice + calcStep($scope.sellingPrice);
        });

        ngSocket.on('lotSelected', function (data) {
            if (data.lot.sellingPrice === data.lot.estimateFrom) {
                $scope.sellingPrice = data.lot.estimateFrom;
            } else {
                $scope.sellingPrice = data.lot.sellingPrice;
            }
            $scope.bids = data.bids;
            ngSocket.emit('auction/getAuction', {id: data.lot.auctionId});
            if ($stateParams.lotId && $scope.$state.current.name === 'createlot' || $scope.$state.current.name === 'editlot') {
                $scope.saveEditedLot = true;
                $scope.newLotDescriptionPrev = data.lot.descriptionPrev;
                $scope.newLotNumber = data.lot.number;
                $scope.newLotEstimateFrom = data.lot.estimateFrom;
                $scope.newLotEstimateTo = data.lot.estimateTo;
                $scope.newLotYear = data.lot.year;

                $scope.editLot = function (save) {
                    $scope.lotToEditId = $stateParams.lotId;
                    if (save) {
                        $state.go('auction', {auctionId: $stateParams.auctionId})
                    } else {
                        $state.go('createlot', {auctionId: $stateParams.auctionId, lotId: $stateParams.lotId});
                        $scope.editLotSaved = true;
                    }
                    ngSocket.emit('auction/editLot', {
                        id: $stateParams.lotId,
                        descriptionPrev: $scope.newLotDescriptionPrev,
                        number: $scope.newLotNumber,
                        estimateFrom: $scope.newLotEstimateFrom,
                        estimateTo: $scope.newLotEstimateTo,
                        year: $scope.newLotYear
                    });
                }
            }
            console.log(data);
            $scope.estimateFrom = data.lot.estimateFrom;
            console.log($scope.sellingPrice, 'lot');
            ngSocket.emit('auction/getPictureList', {lotId: data.lot.id});
            $scope.lot = JSON.parse(JSON.stringify(data.lot));
            $scope.lotId = $scope.lot.id;
            $scope.descriptionArr = $scope.lot.description !== null ? $scope.deleteTegP($scope.lot.description) : $scope.lot.description;
            $scope.descriptionPrevArr = $scope.lot.descriptionPrev !== null ? $scope.deleteTegP($scope.lot.descriptionPrev) : $scope.lot.descriptionPrev;
            $scope.isPlayOut = $scope.lot.isPlayOut;
            $scope.open = ($scope.lot.isSold || $scope.lot.isCl) ? 2 : 1;
            //$scope.bidPrice = 0;
            $scope.auctionId = data.lot.auctionId;
            $scope.$apply();
            initLotParams($scope, params, $scope.lot);
            calcStep();

        });

        ngSocket.on('lotEdited', function (data) {
            // var lotEdited = true;
            singleLotPicUploader.uploadAll();
            topLotPicUploader.uploadAll();
            // alert("asdasdasd");
        });

        // удаление картинки лота из галереи
        $scope.deleteLotPic = function (picId, picStatus) {
            ngSocket.emit('auction/editLot', {
                id: $stateParams.lotId,
                picId: picId,
                picStatus: picStatus,
                isArchive: true
            });
        };
        ngSocket.on('lotPicDeleted', function (result) {
            if (result.picStatus == 'titlePic'){delete $scope.bigPhoto;}
            if (result.picStatus == 'gallery'){delete $scope.gallery;}
            ngSocket.emit('auction/getPictureList', {lotId: $stateParams.lotId});
        });


        // создание нового лота вручную
        $scope.createNewLot = function (t) {
            ngSocket.emit('auction/createLot', {
                number: $scope.newLotNumber,
                descriptionPrev: '<p>' + $scope.newLotDescriptionPrev + '</p>',
                description: '<p>' + $scope.newLotDescription + '</p>',
                estimateFrom: $scope.newLotEstimateFrom,
                estimateTo: $scope.newLotEstimateTo,
                sellingPrice: $scope.newLotSellingPrice,
                auctionId: $stateParams.auctionId,
                year: $scope.newLotYear,
                titlePicId: null
            });
            $scope.afterSaveLotAction = t;
        };

        ngSocket.on('lotCreated', function (data) {
            if (data.lotExist) {
                $scope.lotExist = data.lotExist;
                // alert('Лот с номером ' + data.lotExist + ' уже существует');
            }
            if (data.newLot) {
                $scope.newLotSaved = true;
                $scope.newLotInfo = data;
                var pictLoaded = true;
                var pictAddedSingle = false;
                var picturesAddedTop = false;
                topLotPicUploader.onCompleteAll = function () {
                    if (pictLoaded && $scope.afterSaveLotAction == 'saveAndCreateNew') {
                        location.reload();
                        alert('Новый лот № ' + data.newLot.lot.number + ' создан. Фотографии лота загружены в базу');
                    }
                    if (pictLoaded && $scope.afterSaveLotAction == 'saveAndGoBack') {
                        $state.go('lk', {});
                        alert('Новый лот № ' + data.newLot.lot.number + ' создан. Фотографии лота загружены в базу');
                    }
                    ;
                    pictLoaded = true;
                }
                singleLotPicUploader.onCompleteAll = function () {
                    if (pictLoaded && $scope.afterSaveLotAction == 'saveAndCreateNew') {
                        $state.go('createLot', {'auctionId': $scope.auctionId});
                    }
                    if (pictLoaded && $scope.afterSaveLotAction == 'saveAndGoBack') {
                        $state.go('lk', {});
                    };
                    pictLoaded = true;
                }
                singleLotPicUploader.onAfterAddingAll = function (addedFileItems) {
                    console.info('onAfterAddingAll', addedFileItems);
                    if (picturesAddedTop == true)
                        pictLoaded = false;
                    pictAddedSingle = true;
                    $scope.picturesAdded = true;
                    $scope.CSVAddedInBase = false;
                };
                topLotPicUploader.onAfterAddingAll = function (addedFileItems) {
                    console.info('onAfterAddingAll', addedFileItems);
                    if (picturesAddedSingle == true)
                        pictLoaded = false;
                    picturesAddedTop = true;
                };
                singleLotPicUploader.uploadAll();
                topLotPicUploader.uploadAll();
            }
        });

        // загрузка главной картинки лота на сервер
        // angular-file-upload
        // https://github.com/nervgh/angular-file-upload/wiki/Module-API#directives
        var topLotPicUploader = $scope.topLotPicUploader = new FileUploader({
            url: '/api/upload/lotPic',
            queueLimit: 1,
            // autoUpload: true,
            withCredentials: true
            //removeAfterUpload: true
        });

        // CALLBACKS

        topLotPicUploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
            var newTopLotPicture = {
                topPic: true,
                originalName: response.uploadFile.path.split('/')[4],
                fileName: response.uploadFile.path.split('/')[4],
                // lotId: $scope.newLotInfo.newLot.lot.id
            };
            if ($scope.lotToEditId){
                newTopLotPicture.lotId = $scope.lotToEditId;
            }
            if (!$scope.lotToEditId){
                newTopLotPicture.lotId = $scope.newLotInfo.newLot.lot.id;
            }

            ngSocket.emit('auction/createLotPicture', newTopLotPicture);
        };

        console.info('lotPicUploader', topLotPicUploader);

        // загрузка галереи картинок лота на сервер
        // angular-file-upload
        // https://github.com/nervgh/angular-file-upload/wiki/Module-API#directives
        var singleLotPicUploader = $scope.singleLotPicUploader = new FileUploader({
            url: '/api/upload/lotPic',
            // queueLimit: 1,
            // autoUpload: true,
            withCredentials: true
            //removeAfterUpload: true
        });

        // FILTERS

        // lotPicUploader.filters.push({
        //     name: 'customFilter',
        //     fn: function(item /*{File|FileLikeObject}*/, options) {
        //         // return this.queue.length < 10;
        //     }
        // });

        // CALLBACKS

        singleLotPicUploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        singleLotPicUploader.onAfterAddingFile = function (fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        singleLotPicUploader.onBeforeUploadItem = function (item) {
            console.info('onBeforeUploadItem', item);
        };
        singleLotPicUploader.onProgressItem = function (fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        singleLotPicUploader.onProgressAll = function (progress) {
            console.info('onProgressAll', progress);
        };
        // $scope.uploadedPics = [];
        singleLotPicUploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
            // alert('Файлы загружены');
            ngSocket.on('pictureUpdatedReport', function (result) {
                $scope.successFileUpload = result.pictureRow;
            });
            var newLotPicture = {
                originalName: response.uploadFile.path.split('/')[4],
                fileName: response.uploadFile.path.split('/')[4],
                // fileName: fileItem.uploadFile.path,
                // lotId: $scope.newLotInfo.newLot.lot.id
            };
            if ($scope.lotToEditId){
                newLotPicture.lotId = $scope.lotToEditId;
            }
            if (!$scope.lotToEditId){
                newLotPicture.lotId = $scope.newLotInfo.newLot.lot.id;
            }
            ngSocket.emit('auction/createLotPicture', newLotPicture);
        };
        singleLotPicUploader.onErrorItem = function (fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        singleLotPicUploader.onCancelItem = function (fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        singleLotPicUploader.onCompleteItem = function (fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
            $scope.completeItem = response;
        };
        singleLotPicUploader.onCompleteAll = function () {
            console.info('onCompleteAll');
            // alert('Файлы загружены');
        };

        console.info('lotPicUploader', singleLotPicUploader);

        $scope.gallery = {};
        ngSocket.on('pictureList', function (data) {
            $scope.gallery = {};
            data.pictureList.forEach(function (row) {
                $scope.gallery[row.id] = row;
            });
            $scope.bigPhoto = $scope.gallery[$scope.lot.titlePicId].fileName;
            $scope.bigPhotoInfo = $scope.gallery[$scope.lot.titlePicId];
        });
        $scope.setBigPhoto = function (ph) {
            $scope.bigPhoto = ph;
        };
        $scope.incrementBid = function () {
            var step = calcStep($scope.bidPrice);
            $scope.bidPrice += Number(step);
            if ($scope.bidPrice < (+$scope.sellingPrice + step)) {
                $scope.minus = false;
            } else {
                $scope.minus = true;
            }
        };

        $scope.decrementBid = function () {
            var step = calcStep($scope.bidPrice - calcStep($scope.bidPrice));
            if ($scope.bidPrice > 0)
                $scope.bidPrice -= Number(step);

            if ($scope.bidPrice < (+$scope.sellingPrice + step)) {
                $scope.minus = false;
            } else {
                $scope.minus = true;
            }
        };

        $scope.formatBid = function () {
            var bid = $scope.bidPrice + '';
            bid = bid.replace(/[^0-9]/g, '');
            $scope.bidPrice = Number(bid);
            var step = calcStep($scope.bidPrice);
            if ($scope.bidPrice < (+$scope.lot.estimateFrom + step)) {
                $scope.minus = false;
            } else {
                $scope.minus = true;
            }
        };

        function calcStep(price) {
            var step = 1;
            if (price < 5) {
                return step = 1;
            }
            if (5 <= price && price < 50) {
                return step = 5;
            }
            if (50 <= price && price < 200) {
                return step = 10;
            }
            if (200 <= price && price < 500) {
                return step = 20;
            }
            if (500 <= price && price < 1000) {
                return step = 50;
            }
            if (1000 <= price && price < 2000) {
                return step = 100;
            }
            if (2000 <= price && price < 5000) {
                return step = 200;
            }
            if (5000 <= price && price < 10000) {
                return step = 500;
            }
            if (10000 <= price && price < 20000) {
                return step = 1000;
            }
            if (20000 <= price && price < 50000) {
                return step = 2000;
            }
            if (50000 <= price && price < 100000) {
                return step = 5000;
            }
            if (100000 <= price && price < 200000) {
                return step = 10000;
            }
            if (200000 <= price && price < 500000) {
                return step = 20000;
            }
            if (500000 <= price && price < 1000000) {
                return step = 50000;
            } else {
                step = 100000;
            }
            return step;
        }

        $scope.lastPhotos = function () {
            var t = $('.gallery .small-photo:last-child');
            t.detach().prependTo('.gallery');
        };
        $scope.firstPhotos = function () {
            var t = $('.gallery .small-photo:first-child');
            t.detach().appendTo('.gallery');
        };

        $scope.maxEstimate2 = function () {
            $scope.bidPrice = $scope.estimateTo;
        };

    }]);

    function initLotParams(scope, params, values) {
        params.forEach(function (item, i) {
            scope[item] = values[item]
        });
    }

    function initObjFromArr(params, arr) {
        var obj = new Object();
        params.forEach(function (item, i) {
            obj[item] = arr[i]
        });
        return obj;
    }
});