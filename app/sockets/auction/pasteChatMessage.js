/**
 * Created by piligrim on 15.07.16.
 */
'use strict';
let Chat = require('../../models/').Chat;

module.exports = function(socket, data) {
    if (!data.auctionId) {
        socket.emit('lotList',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }
    
    let _chatData = {
        userId: data.userId,
        auctionId: data.auctionId,
        message: data.chatMessage
    };

    Chat.create(_chatData).then(function (message) {
        const resp = {
            err:0,
            message: message,
            user: {
                firstName:socket.request.user.firstName,
                lastName:socket.request.user.lastName,
                patronymic:socket.request.user.patronymic
            }
        };
        socket.to('auction:'+(+data.auctionId)).emit('catchMessageRow', resp);
        //пока возвращаем то же, что и для всех остальных
        socket.emit('catchMessageRow', resp);
    }).catch(function (err) {
        socket.emit('catchMessageRow', {
            err:1,
            message: err
        });
    });
};