/**
 * Created by piligrim on 19.07.16.
 */
'use strict';
let SellingStatistics = require('../../models/').SellingStatistics;

module.exports = function(socket, data) {

    let where = {
        // auctionId: data.auctionId
        // isSold: true
    };

    if (data.auctionId){where.auctionId = data.auctionId;}
    if (data.userId){where.userId = data.userId;}


    SellingStatistics.findAll({
        where
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