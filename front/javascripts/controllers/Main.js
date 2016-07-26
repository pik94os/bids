define(['./module', 'jquery'], function (controllers, $) {
    'use strict';

    controllers.controller('Main', ['$sessionStorage', '$scope', '$http', '$rootScope', '$state', '$stateParams', 'ngSocket', 'FileUploader', function ($sessionStorage, $scope, $http, $rootScope, $state, $stateParams, ngSocket, FileUploader) {

        ngSocket.emit('getUserInfo', {});
        $scope.isAD = true;
        $scope.setIsAD = function () {
            $scope.isAD = true;
        };
        $scope.selectedAuctionInMain = {
            id: 0,
            setId: function (id) {
                this.id = id
            },
            number: null,
            date: null
        };

        $scope.regist = function (auctionId, auctionDate) {
            $scope.hideRegButton = true;
            if (+$scope.currentUserInfo.id) {
                ngSocket.emit('userAuction', {auctionId: +auctionId});
                $scope.selectedAuctionInMain.date = auctionDate;
                $scope.selectedAuctionInMain.id = auctionId;
            }
        };
        ngSocket.on('auctionUserStop', function (data) {
            // $('#regUserAuctionStop').modal('show');
        });

        ngSocket.on('auctionUser', function (data) {
            if (data.err) {
                alert(data.message)
            }
            // $('#regUserAuction').modal('show');
        });

        if ($sessionStorage.auth) {
            $scope.currentUserInfo = JSON.parse(JSON.stringify($sessionStorage.auth));
        }
        ngSocket.on('userInfo', function (data) {
            if (data.err != undefined && data.err == 0) {
                $scope.currentUserInfo = JSON.parse(JSON.stringify(data.doc));
            } else {
                $scope.auth = null;
                $scope.currentUserInfo.id = null;
            }
        });

        $rootScope.$on('$viewContentLoaded', function () {
            $('content').css('min-height', ($(window).height() - $('header').height() - $('footer').height()) + 'px');
        });

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            if (toState.data != undefined && toState.data.noAD) {
                $scope.isAD = false;
            } else {
                $scope.isAD = true;
            }

        });
        $scope.regUserData = {};
        $scope.loginUserData = {};
        $scope.createUser = function (role) {
            var roleOfNewUser;
            if (role == 4) roleOfNewUser = 4;
            if (role == 3) roleOfNewUser = 3;
            if ($scope.regUserData.password == $scope.regUserData.confirmationPassword
                && $scope.regUserData.firstName
                && $scope.regUserData.lastName
                && $scope.regUserData.email
                && $scope.regUserData.phone
            ) {
                $http.post('/api/users/reg', {
                    username: $scope.regUserData.username,
                    firstName: $scope.regUserData.firstName,
                    lastName: $scope.regUserData.lastName,
                    patronymic: $scope.regUserData.patronymic ? $scope.regUserData.patronymic : '',
                    email: $scope.regUserData.email,
                    phone: $scope.regUserData.phone,
                    // confirmationCode: $scope.regUserData.confirmationCode,
                    confirmationCode: null,
                    password: $scope.regUserData.password,
                    acceptTerms: true,
                    receiveMessages: $scope.regUserData.receiveMessages,
                    roleId: roleOfNewUser,
                    auctionId: (+$scope.selectedAuctionInMain.id)
                }, {}).then(function (result) {
                    window.location.reload();
                })
            } else alert("Заполните все необходимые поля");

        };

        $scope.login = function () {
            $http.post('/api/users/login', {
                username: $scope.loginUserData.username.toUpperCase(),
                password: $scope.loginUserData.password
            }, {}).then(function (result) {
                window.location.reload();
            })
        };
        $scope.logout = function () {
            $http.get('/api/users/logout', {}, {}).then(function (result) {
                window.location.reload();
            })
        };
        // создание аукциона
        $scope.newAuction = {};
        $scope.createAuction = function () {
            ngSocket.emit('auction/create', {
                name: $scope.newAuction.nameAuction,
                number: $scope.newAuction.numberAuction,
                date: $scope.newAuction.date,
                userId: $scope.currentUserInfo.id
            });
        };

        // редактирование аукциона
        $scope.newAuction = {};
        $scope.editAuction = function (param, auctionId) {
            ngSocket.emit('auction/create', {
                name: $scope.editedAuction.nameAuction,
                number: $scope.editedAuction.numberAuction,
                date: $scope.editedAuction.date,
                userId: $scope.currentUserInfo.id,
                editId: auctionId,
                // editId: +$scope.auctionIdForEdit.id,
                isDelete: param
            });
        };

        $scope.auctionIdForEdit = {};
        $scope.getAuctionForEdit = function (data) {
            $scope.auctionIdForEdit.id = +data;
            if ($scope.auctionIdForEdit.id){
                // получение аукциона для модального окна редактирования аукциона
                ngSocket.emit('auction/getAuction', {id: $scope.auctionIdForEdit.id});
                $scope.$apply();
            }
        };
        ngSocket.on('catchAuction', function (data) {
            $scope.auctionForEdit = data;

            if ($scope.auctionForEdit){
                $scope.editedAuction = {
                    nameAuction: $scope.auctionForEdit.data.name,
                    numberAuction: $scope.auctionForEdit.data.number,
                    placeAuction: $scope.auctionForEdit.data.place
                };
                $scope.editedAuction.date = [
                    +$scope.auctionForEdit.data.date.split('T')[0].split('-')[2],
                    +$scope.auctionForEdit.data.date.split('T')[0].split('-')[1],
                    +$scope.auctionForEdit.data.date.split('T')[0].split('-')[0],
                    +$scope.auctionForEdit.data.date.split('T')[1].split(':')[0],
                    +$scope.auctionForEdit.data.date.split('T')[1].split(':')[1]
                ];
            }
        });

        // $scope.clearAuction = function () {
        //     $('#create-auction input[type=text]').each(function () {
        //         $(this).val('');
        //     })
        // };

        // парсинг CSV и затем сохранение фоток в базу
        $scope.addPicPromisesArr = [];
        $scope.parseCSVAndSavePictures = function () {
            $scope.createNewLotFromCSV().then(function () {
                lotPicUploader()
            });
        };

        // импорт лотов из CSV
        $scope.CSVParsedFile = {};
        var uploader = $scope.uploader = new FileUploader({
            url: '/api/upload/lotCSV',
            autoUpload: true,
            removeAfterUpload: true,
            queueLimit: 1
        });

        // FILTERS for CSV

        uploader.filters.push({
            name: 'customFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 10;
            }
        });

        // CALLBACKS
        $scope.CSVAdded = false;
        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function (fileItem) {
            console.info('onAfterAddingFile', fileItem);
            // addPicPromisesArr.push(
            //     new Promise(
            //         lotPicUploader()
            //     )
            // )
        };
        uploader.onAfterAddingAll = function (addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
            $scope.CSVAdded = true;
        };
        uploader.onBeforeUploadItem = function (item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function (fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function (progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
            // alert('Файл загружен');
            $scope.CSVParsedFile = response;
        };
        uploader.onErrorItem = function (fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function (fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function () {
            console.info('onCompleteAll');
            // alert('Файл загружен в базу');
        };

        console.info('uploader', uploader);

        $scope.addLotBtn = true;
        $scope.createNewLotFromCSV = function () {
            $scope.addLotBtn = false;
            var data = {
                CSVParsedFile: $scope.CSVParsedFile,
                auctionId: $stateParams.auctionId
            };
            ngSocket.emit('createNewLotFromCSV', data);
        };

        // $scope.CSVAddedInBaseProgress = 0;
        $scope.rowsCreated = 0;
        ngSocket.on('createCSVReport', function (result) {
            // $scope.countOfRenewedRows = result.renewedRows;
            // $scope.countOfCreatedRows = result.createdRows;
            // alert('Строки созданы');
            $scope.fileAddedInBase = result;
            $scope.rowsCreated++;
        });

        // отчет о записях в базу картинок из CSV
        $scope.countReportPic = 0;
        ngSocket.on('createCSVPicturesReport', function (result) {
            $scope.pictureRowAddedFromCSV = result;
            $scope.countReportPic++;
            // $scope.countOfgalleryPicArr = result.countArr;
        });

        // загрузка картинок на сервер
        // angular-file-upload
        // https://github.com/nervgh/angular-file-upload/wiki/Module-API#directives
        var lotPicUploader = $scope.lotPicUploader = new FileUploader({
            url: '/api/upload/lotPic',
            // queueLimit: 1,
            // autoUpload: true,
            removeAfterUpload: true
        });

        // FILTERS

        // lotPicUploader.filters.push({
        //     name: 'customFilter',
        //     fn: function(item /*{File|FileLikeObject}*/, options) {
        //         // return this.queue.length < 10;
        //     }
        // });

        // CALLBACKS

        lotPicUploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        lotPicUploader.onAfterAddingFile = function (fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        lotPicUploader.onAfterAddingAll = function (addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
            $scope.picturesAdded = true;
            $scope.CSVAddedInBase = false;
        };
        lotPicUploader.onBeforeUploadItem = function (item) {
            console.info('onBeforeUploadItem', item);
        };
        lotPicUploader.onProgressItem = function (fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        lotPicUploader.onProgressAll = function (progress) {
            console.info('onProgressAll', progress);
        };
        lotPicUploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
            // alert('Файлы загружены');
            $scope.addedPic = response;
            console.log('>>>>>>>>>>>');
        };
        lotPicUploader.onErrorItem = function (fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        lotPicUploader.onCancelItem = function (fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        lotPicUploader.onCompleteItem = function (fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        lotPicUploader.onCompleteAll = function () {
            console.info('onCompleteAll');
            // alert('Файлы загружены');
        };

        console.info('lotPicUploader', lotPicUploader);

        ngSocket.on('pictureUpdatedReport', function (result) {
            $scope.pictureUpdatedName = result;
        });

        // Проверка роли : от 1до4 и 5-ая роль
        $scope.goToPageHeader = function () {
            if ($scope.currentUserInfo.roleId === 5) {
                $state.go('page-leading');
            }
            if ($scope.currentUserInfo.roleId === 2) {
                $state.go('admin');
            } else {
                $state.go('lk');
            }
        };


        // кнопка наверх начало
        var scrollUp = document.getElementById('scrollup'); // найти элемент
        scrollUp.style.display = 'none';
        $scope.buttonUp = function () {

            scrollUp.onmouseover = function () { // добавить прозрачность
                scrollUp.style.opacity = 0.3;
                scrollUp.style.filter = 'alpha(opacity=30)';
            };

            scrollUp.onmouseout = function () { //убрать прозрачность
                scrollUp.style.opacity = 0.5;
                scrollUp.style.filter = 'alpha(opacity=50)';
            };

            scrollUp.onclick = function () { //обработка клика
                $('body,html').animate({scrollTop: 0}, 800);
            };
        };

        // show button
        window.onscroll = function () { // при скролле показывать и прятать блок

            if (window.pageYOffset > 75) {
                scrollUp.style.display = 'block';
            } else {
                scrollUp.style.display = 'none';
            }
        };
        // кнопка наверх конец

        // удаление <p></p> из текста и удаление @ нач
        $scope.deleteTegP = function (text) {
            var mas = [];
            while (text !== undefined && text && text.indexOf("<p>") + 1) {
                var text1 = text.substring(text.indexOf("<p>") + 3, text.indexOf("</p>"));

                text = text.substring(text.indexOf("</p>") + 3, text.length);
                mas.push(text1);
            }

            return mas;
        };
        // удаление <p></p> из текста и удаление @ кон

        // функционал чата на странице ведущего
        // socket.join('lesson:' + +$stateParams.auctionId);
        
        $scope.chat = {};
        $scope.chat.message = '';
        $scope.chat.messages = [];

        // ngSocket.emit('auction/getChatMessages', {auctionId: +$stateParams.auctionId});
        ngSocket.on('chatMessagesList', function (result) {
            // $scope.chatMessagesArr = result.resp;
            // console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
            // console.log(result.chatMessagesList);
            result.chatMessagesList.forEach(function (i) {
                $scope.chat.messages.push(i);
            });
        });
        
        $scope.chat.keyUp = function (e) {
            if (e.keyCode === 13) {
                if ($scope.chat.message) {
                    $scope.chat.addMessage();
                    return null;
                }
                $scope.chat.message = '';
            }
        };

        $scope.chat.addMessage = function () {
            if ($scope.chat.message) {
                ngSocket.emit('auction/pasteChatMessage', {
                    userId: +$scope.currentUserInfo.id,
                    auctionId: +$stateParams.auctionId,
                    chatMessage: $scope.chat.message
                });
            }
            $scope.chat.message = '';
        };

        ngSocket.on('catchMessageRow', function (result) {
            if (!result.err) {
                // $scope.chat.messages.push({time: new Date(result.time), text:result.message, username:result.userId});
                // if ($scope.chat.messages[$scope.chat.messages.length - 1].createdAt !== result.message.createdAt) {
                $scope.chat.messages.unshift({
                    createdAt: result.message.createdAt,
                    message: result.message.message,
                    user: result.user
                });
            }
        });

        ngSocket.on('chatMessagesList', function (result) {
            $scope.chatMessagesArr = result.resp;
        });

        $rootScope.$on('$viewContentLoaded', function () {
            if ($scope.$state.current.name === 'auction-leading') {
                $scope.hideHeaderAuctionLeading = true;
            }
        });

    }])
});