/**
 * Created by piligrim on 19.07.16.
 */
'use strict';
let SellingStatistics = require('../../models/').SellingStatistics;

module.exports = function (socket, data) {
    if (!+data.auctionId) {
        socket.emit('sellingStatisticsCreated',
            {err: 1, message: 'Undefined lot number'}
        );
        return
    }

    let _sellingStatisticsData = {
        userId: +data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        patronymic: data.patronymic,
        lotId: +data.lotId,
        lotNumber: +data.lotNumber,
        price: +data.price,
        auctionId: +data.auctionId,
        isSold: data.isSold,
        isCl: data.isCl
    };

    SellingStatistics.create(_sellingStatisticsData).then((sellingStatistics)=> {
            socket.emit('sellingStatisticsCreated', {
                'err': 0,
                newLot: {
                    sellingStatistics: sellingStatistics
                }
            });
        }).catch(function (err) {
        socket.emit('sellingStatisticsCreated',
            {err: 1, message: err.message}
        );
    });
};