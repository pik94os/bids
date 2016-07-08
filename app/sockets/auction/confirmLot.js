/**
 * Created by piligrim on 06.07.16.
 */
'use strict';
var Lot = require('../../models/').Lot;
var User = require('../models/').User;
var Bid = require('../models/').Bid;

module.exports = function(socket, data) {
    if (!data.lotId || !data.userId) {
        socket.emit('lotConfirmed',
            {err: 1, message: 'Undefined identifier'}
        );
        return
    }
    Bid.create(data.bidPrice)
        .then(function (bid) {
            addLotToBid(bid, data.lotId, function(err, bid){
                if (err) return emitError(socket, err);
                    addBidToUser(bid, data.userId, function(err, bid){
                        if (err) return emitError(socket, err);
                            socket.emit('lotConfirmed',
                                {err: 0, bid: bid});
                    })
            })
        })
        .catch(function (err) {
            emitError(socket, err);
        })

    function addLotToBid(bid, lotId, cb){
        Lot.findById(lotId)
            .then(function(lot) {
                bid.addLot(lot)
                    .then(function (){
                        return cb(null, bid);
                    })
                    .catch(function (err) {
                        return cb(err);
                    })
            })
            .catch(function (err) {
                return cb(err);
            })

    }
    function addBidToUser(bid, userId, cb){
        User.findById(userId)
            .then(function(user){
                user.addBid(bid)
                    .then(function () {
                        return cb(null, bid)
                    })
                    .catch(function (err) {
                        return cb(err);
                    })
            })
            .catch(function (err) {
                    return cb (err);
            })
    }
    function emitError(socket, err){
        socket.emit('lotConfirmed',
            {err: 1, message: err.message})

    }

};