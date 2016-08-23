/**
 * Created by syrosework on 15.08.16.
 */
'use strict';
const User = require('../models/').User;
const AuctionUser = require('../models/').AuctionUser;

module.exports = function (socket, data) {
    if (!data.userId) {
        socket.emit('userRegChecked',
            {err: 1, message: 'Undefined user identifier'}
        );
        return
    }

    AuctionUser.findOne({
        where : {
            userId : data.userId,
            auctionId : data.auctionId
        }
    }).then(function () {
        socket.emit('userRegChecked',
            {err: 0}
        );
    }).catch(function (err) {
        socket.emit('userRegChecked',
            {err: 1, message: err.message}
        );
    })
};