/**
 * Created by Alex on 31.05.2016.
 */
'use strict';
const User = require('../models/').User;

module.exports = function(socket, data) {
    console.log('>>>>>>>>>>>>>>>>>'+data.id);
    // if (!data.id) {
    //     socket.emit('userChanged',
    //         {err: 1, message: 'Undefined user identifier'}
    //     );
    //     return
    // }
    //
    // if (!(data.username && data.password)) {
    //     socket.emit('userChanged',
    //         {err: 1, message: 'Incorrect username or password'}
    //     );
    //     return
    // }

    User.findById(+data.id).then(
        function(user) {
            // поля пользователя
            user.username = data.username;
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            user.patronymic = data.patronymic;
            console.log ( user.patronymic );
            console.log ( data.patronymic );
            user.email = data.email;
            user.phone = data.phone;
            user.confirmationCode = data.confirmationCode;
            user.password = data.password;

            // поля аукционного дома
            user.index = data.index;
            user.country = data.country;
            user.city = data.city;
            user.street = data.street;
            user.house = data.house;
            user.office = data.office;

            // поля кредитной карты
            user.typeOfCard = data.typeOfCard;
            user.numberOfCard = data.numberOfCard;
            user.nameOfCardHolder = data.nameOfCardHolder;
            user.month = data.month;
            user.year = data.year;
            user.cardCode = data.cardCode;

            // прочее
            user.acceptTerms = data.acceptTerms;
            user.receiveMessages = data.receiveMessages;

            return user.save().then(function(user){
                socket.emit('userChanged', {
                    'err': 0,
                    user: {
                        userId : user.id,
                        username: user.username
                    }
                });
            }).catch(function (err) {
                socket.emit('userChanged',
                    {err: 1, message: err.message}
                );
            })
        }).catch(function (err) {
            socket.emit('userChanged',
                {err: 1, message: err.message}
            );
        })
};