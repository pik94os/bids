/**
 * Created by piligrim on 07.07.16.
 */
'use strict';

const Lot = require('../models/').Lot;

module.exports = function (socket, data) {
    // console.log(data);
    // let where = {
    //     // isArchive: false,
    //     username: {$in: usernameCSVArray}
    // };

    // let idCSVArray = [];
    // data.CSVParsedFile.forEach(function (row) {
    //     idCSVArray.push(+row.id);
    // });
    // let where = {
    //     // isArchive: false,
    //     id: {$in: idCSVArray}
    // };

    // let _lotData = {};
    // let _lotData = {
    //     id: +row.id,
    //     number: +row.lotNumber.split('№')[1],
    //     description: row.description,
    //     estimateFrom: +row.estimate.split('-')[0],
    //     estimateTo: +row.estimate.split('-')[1],
    //     sellingPrice: parseInt(row.sellingPrice),
    //     year: +row.year,
    //     auctionId: +data.auctionId,
    //     isArchive: false
    // };
    // if (row.sellingPrice){
    //     _lotData.sellingPrice = parseInt(row.sellingPrice);
    // }
        let toSaveArr = [];


        data.CSVParsedFile.forEach(function (row) {
            // console.log('--------'+row.id);

            Lot.findById(row.id).then(function (result) {
                // console.log('++++++'+result.id);
                // console.log(result.id + '<<<<<<>>>>>>' + row.id);

                if (result){
                    result.auctionId = +data.auctionId;
                    result.isArchive = false;

                    if (row.lotNumber) {
                        result.number = +row.lotNumber.split('№')[1];
                    }
                    if (row.description) {
                        result.description = row.description;
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
                    // console.log('>>>>>>>>>>'+result);
                    // Lot.save(tosave);
                    // toSaveArr.push(tosave);
                    result.save();
                }
                if (!result){
                    console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
                    let _lotData = {
                            id: +row.id,
                            number: +row.lotNumber.split('№')[1],
                            description: row.description,
                            estimateFrom: +row.estimate.split('-')[0],
                            estimateTo: +row.estimate.split('-')[1],
                            sellingPrice: parseInt(row.sellingPrice),
                            year: +row.year,
                            auctionId: +data.auctionId,
                            isArchive: false
                        };
                    Lot.create(_lotData);
                }
                    
            });

        });

    // Lot.create(_lotData)
    //     .then(function (lot) {
    //         // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>');
    //         socket.emit('createCSVReport', {
    //             'err': 0,
    //             // newUser: {
    //             //     userId : user.id,
    //             //     username: user.username
    //             // }
    //         });
    //     }).catch(function (err) {
    //     socket.emit('createCSVReport',
    //         {err: 1, message: err.message}
    //     );
    // });


};