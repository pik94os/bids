/**
 * Created by piligrim on 06.07.16.
 */
'use strict';
const Lot = require('../../models/').Lot;
const LotPicture = require('../../models').LotPicture;
const Bid = require('../../models').Bid;

module.exports = function(socket, data) {
    if (!data.lotId) {
        socket.emit('lotSelected',
            {err: 1, message: 'Undefined lot identifier'}
        );
        return
    }
    Lot.findById(data.lotId)
        .then(function(lot) {
            LotPicture.findAll({
                where:{
                    lotId : data.lotId
                }
            }).then(function(lotPictures){
                    Bid.findAll({
                        where:{
                            lotId: lot.id
                        },
                        order: [
                            ['price', 'DESC']
                        ]
                    }).then(function(bids){
                            socket.emit('lotSelected', {
                                'err': 0,
                                lot: lot,
                                lotPictures: lotPictures,
                                bids: bids
                            });

                        })
            })
        }).catch(function (err) {
                socket.emit('lotSelected',
                    {err: 1, message: err.message}
                );
            })
};