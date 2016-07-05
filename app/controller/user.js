'use strict';

var express = require('express');
var crypto = require('crypto');
var User = require('../models/').User;
var Role = require('../models/').Role;
var passport = require('passport');

exports.login = function (req, res, next) {
    passport.authenticate('local',
        function (err, user, info) {
            console.log(req.body);
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

    console.log(req.body);

    let username = req.body.username;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let patronymic = req.body.patronymic;
    let email = req.body.email;
    let phone = req.body.phone;
    let confirmationCode = req.body.confirmationCode;
    let password = req.body.password;
    let acceptTerms = req.body.acceptTerms;
    let receiveMessages = req.body.receiveMessages;
    let roleId = req.body.roleId;

    User.create({
        username: email,
        firstName: firstName,
        lastName: lastName,
        patronymic: patronymic,
        email: email,
        phone: phone,
        confirmationCode: confirmationCode,
        password: password,
        acceptTerms: acceptTerms,
        receiveMessages: receiveMessages,
        isArchive: false,
        roleId: roleId
    })
        .then(function (user) {
            req.logIn(user, function (err) {
                return err
                    ? next(err)
                    : res.json({
                    err: 0, doc: {
                        username: user.username
                    }
                });
            });
        }).catch(function (err) {
        res.json({err: 1, errorDescription: err.message});
    })
};

module.exports.logout = function (req, res) {
    req.logout();
    res.json({
        err: 0,
        doc: {}
    });
};