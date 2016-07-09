/**
 * Created by piligrim on 06.07.16.
 */
'use strict';
var Lot = require('../../models/').Lot;
var User = require('../../models/').User;
var Bid = require('../../models/').Bid;


module.exports = function(socket, data) {
    if (!data.lotId || !data.userId) {
        socket.emit('lotConfirmed',
            {err: 1, message: 'Undefined identifier'}
        );
        return
    }
    findLot(data.lotId, function(err, lot){
        if (err) return emitError(socket, err);
        if (err) return emitError(socket, err);
            findUser(data.userId, function (err, user){
                if (err) return emitError(socket, err);
                Bid.create({price: data.bidPrice, lotId: lot.id, creatorId: user.id})
                    .then(function (bid){
                        socket.emit('lotConfirmed',
                            {err: 0, bid: bid});
                    }).catch(function (err) {
                        return emitError(socket, err);
                    })
            })
    })


    function findLot(lotId, cb){
        Lot.findById(lotId)
            .then(function(lot) {
                return cb(null, lot);
            })
            .catch(function (err) {
                return cb(err);
            })

    }
    function findUser(userId, cb){
        User.findById(userId)
            .then(function(user){
                    return cb(null, user)
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