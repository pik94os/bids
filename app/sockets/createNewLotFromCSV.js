/**
 * Created by piligrim on 07.07.16.
 */
'use strict';

const Lot = require('../models/').Lot;
const LotPicture = require('../models/').LotPicture;

module.exports = function (socket, data) {

    data.CSVParsedFile.forEach(function (row) {

        Lot.findById(row.id).then(function (result) {
            // если лот уже существует
            if (result) {
                result.auctionId = +data.auctionId;
                result.isArchive = false;

                if (row.lotNumber) {
                    result.number = +row.lotNumber.split('№')[1];
                }
                if (row.description) {
                    var descriptionSplitted = row.description.split('@');
                    if (descriptionSplitted.length == 1){
                        result.description = row.description
                    }
                    if (descriptionSplitted.length > 1) {
                        result.descriptionPrev = descriptionSplitted[0];
                        result.description = descriptionSplitted[0] + descriptionSplitted[1];
                    }
                }
                if (row.estimate) {
                    result.estimateFrom = +row.estimate.split('-')[0];
                    result.estimateTo = +row.estimate.split('-')[1];
                }
                if (row.sellingPrice) {
                    result.sellingPrice = parseInt(row.sellingPrice);
                }
                if (row.year) {
                    result.year = +row.year;
                }
                // if (row.titlePic) {
                //     result.year = +row.year;
                // }
                result.save().then(function () {
                    // добавление картинок

                    // if (row.titlePic){
                    //     // if (){
                    //     //
                    //     // }
                    //     LotPicture.update({
                    //         originalName : row.titlePic
                    //     },{
                    //         where: {lotId: row.id}
                    //     })
                    // }
                    //
                    // // парсинг и добавление в галерею
                    // if (row.gallery){
                    //     let galleryPicOriginalNameArr = row.gallery.split(';');
                    //     galleryPicOriginalNameArr.forEach(function (nextPicName) {
                    //         if (nextPicName) {
                    //             LotPicture.create({
                    //                 originalName: nextPicName,
                    //                 lotId: parseInt(row.id),
                    //                 isArchive: false
                    //             });
                    //             LotPicture.update({
                    //                 titlePicId : createdRow.id
                    //             },{
                    //                 where: {id: createdRow.lotId}
                    //             })
                    //         }
                    //     });
                    // }
                });
            }

            // если лот не существует
            if (!result) {
                let _lotData = {
                    id: null,
                    number: null,
                    description: null,
                    estimateFrom: null,
                    estimateTo: null,
                    sellingPrice: null,
                    year: null,
                    auctionId: +data.auctionId,
                    isArchive: false
                };
                if (row.id) {
                    _lotData.id = +row.id;
                }
                if (row.lotNumber) {
                    _lotData.number = +row.lotNumber.split('№')[1]
                }
                if (row.description) {
                    var descriptionSplitted = row.description.split('@');
                    if (descriptionSplitted.length == 1){
                        _lotData.description = row.description
                    }
                    if (descriptionSplitted.length > 1) {
                        _lotData.descriptionPrev = descriptionSplitted[0];
                        _lotData.description = descriptionSplitted[0] + descriptionSplitted[1];
                    }
                }
                if (row.estimate) {
                    _lotData.estimateFrom = +row.estimate.split('-')[0];
                    _lotData.estimateTo = +row.estimate.split('-')[1];
                }
                if (row.sellingPrice) {
                    _lotData.sellingPrice = parseInt(row.sellingPrice)
                }
                if (row.year) {
                    _lotData.year = +row.year
                }

                Lot.create(_lotData).then(function (lot) {
                    socket.emit('createCSVReport', {
                        'err': 0
                        // newUser: {
                        //     userId : user.id,
                        //     username: user.username
                        // }
                    });
                }).catch(function (err) {
                    socket.emit('createCSVReport',
                        {err: 1, message: err.message}
                    );
                }).then(function () {
                    // добавление картинок
                    // добавление титульной картинки
                    if (row.titlePic){

                        let createTitlePic = {
                            originalName: row.titlePic,
                            lotId: parseInt(row.id),
                            isArchive: false
                        };

                        LotPicture.create(createTitlePic).then(function (createdRow) {
                            Lot.update({
                                titlePicId : createdRow.id
                            },{
                                where: {id: createdRow.lotId}
                            })
                        });

                    }
                    // парсинг и добавление в галерею
                    if (row.gallery){
                        let galleryPicOriginalNameArr = row.gallery.split(';');
                        galleryPicOriginalNameArr.forEach(function (nextPicName) {
                            if (nextPicName) {
                                LotPicture.create({
                                    originalName: nextPicName,
                                    lotId: parseInt(row.id),
                                    isArchive: false
                                });
                            }
                        });
                    }
                });
            }
        });
    });
};