/**
 * Created by piligrim on 19.07.16.
 */
'use strict';
let SellingStatistics = require('../../models/').SellingStatistics;

module.exports = function(socket, data) {
    
    let where = {
      auctionId: data.auctionId  
    };
    
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