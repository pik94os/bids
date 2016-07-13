'use strict';

const express = require('express');
const crypto = require('crypto');
const User = require('../models/').User;
const Role = require('../models/').Role;
const passport = require('passport');
const AuctionUser = require('../models/').AuctionUser;
exports.login = function (req, res, next) {
    passport.authenticate('local',
        function (err, user, info) {
            return err
                ? next(err)
                : user
                ? req.logIn(user, function (err) {
                return err
                    ? next(err)
                    : res.json({
                    err: 0,
                    doc: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        patronymic: user.patronymic,
                        username: user.username,
                        role: user.roleId
                    }
                });
            })
                : res.json({err: 1, errorDescription: "wrong login or password"});
        }
    )(req, res, next);
};



// exports.login = function (req, res, next) {
//     passport.authenticate('local',
//         function (err, user, info) {
//             return err
//                 ? next(err)
//                 : user
//                 ? req.logIn(user, function (err) {
//                 return err
//                     ? next(err)
//                     : res.json({
//                     err: 0, doc: {
//                         username: user.username,
//                         role: user.roleId
//                     }
//                 });
//             })
//                 : res.json({err: 1, errorDescription: "wrong login or password"});
//         }
//     )(req, res, next);
// };

module.exports.register = function (req, res, next) {

    User.create({
        username: req.body.email.toUpperCase(),
        firstName: req.body.firstName.toUpperCase(),
        lastName: req.body.lastName.toUpperCase(),
        patronymic: req.body.patronymic.toUpperCase(),
        email: req.body.email.toUpperCase(),
        phone: req.body.phone,
        //confirmationCode: req.body.confirmationCode,
        password: req.body.password,
        acceptTerms: req.body.acceptTerms,
        receiveMessages: req.body.receiveMessages,
        isArchive: false,
        // roleId: req.body.roleId <---этот человек адекватен????
        roleId: 4
    }).then(function (user) {
        let k = false;
            k = AuctionUser.create({
                userId: user.id,
                auctionId: req.body.auctionId
            });
        req.logIn(user, function (err) {
                return err
                    ? next(err)
                    : res.json({
                    err: 0, doc: {
                        username: user.username,
                        id: user.id
                    }
                });
            });
        }).catch(function (err) {
        res.json({err: 1, errorDescription: err.message});
        return k;
    })
};

module.exports.logout = function (req, res) {
    req.logout();
    res.json({
        err: 0,
        doc: {}
    });
};
