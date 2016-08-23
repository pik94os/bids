/**
 * Created by piligrim on 19.07.16.
 */
'use strict';
let SellingStatistics = require('../../models/').SellingStatistics;
let AuctionUser = require('../../models/').AuctionUser;
let Auction = require('../../models/').Auction;
module.exports = function(socket, data) {

    let where = {
        // auctionId: data.auctionId
        // isSold: true
    };

    if (data.auctionId){where.auctionId = data.auctionId;}
    if (data.userId){where.userId = data.userId;}
    if (data.isSold){where.isSold = data.isSold;}


    SellingStatistics.findAll({
        where,
        include: [
            {model:AuctionUser,attributes:[]},
            {model:Auction,attributes:[]}
            ],
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