/**
 * Created by piligrim on 15.07.16.
 */
'use strict';

let Chat = require('../../models/').Chat;
let User = require('../../models/').User;

module.exports = function(socket, data) {
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>');
    if (!data.auctionId) {
        socket.emit('chatMessagesList',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }
    
    Chat.findAll({where: {auctionId: +data.auctionId}, order: [["id", "desc"]], include: {model: User, attributes: ['firstName', 'lastName']}})
        .then(function(chatMessagesList) {
            socket.emit('chatMessagesList', {
                'err': 0,
                chatMessagesList: chatMessagesList
            });
        });
};