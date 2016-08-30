/**
 * Created by piligrim on 19.07.16.
 */
'use strict';
let SellingStatistics = require('../../models/').SellingStatistics;
let AuctionUser = require('../../models/').AuctionUser;
let Auction = require('../../models/').Auction;
module.exports = function (socket, data) {

    let where = {};

    if (data.auctionId && data.isSold) {
        where = {
            auctionId: data.auctionId
        };
    }
    if (data.userId) {
        where.userId = data.userId;
    }
    if (data.isCl) {
        where.isCl = data.isCl;
    }


    SellingStatistics.findAll({
        where,
        include: [
            {model: AuctionUser, attributes: []},
            {model: Auction, attributes: []}
        ]
    }).then(function (result) {
            socket.emit('catchSellingStatistics', {
                'err': 0,
                sellingStatistics: result
            });
    }).catch(function (err) {
        socket.emit('catchSellingStatistics',
            {err: 1, message: err.message}
        );
    });
};