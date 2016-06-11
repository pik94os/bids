var express = require('express');
var crypto = require('crypto');
var User = require('../models/').User;
var Role = require('../models/').Role;
var passport = require('passport');

exports.login = function(req, res, next) {
    passport.authenticate('local',
        function (err, user, info) {
            return err
                ? next(err)
                : user
                ? req.logIn(user, function (err) {
                return err
                    ? next(err)
                    : res.json({
                    err: 0, doc: {
                        username: user.username,
                        role : user.roleId
                    }
                });
            })
                : res.json({err: 1, errorDescription: "wrong login or password"});
        }
    )(req, res, next);
};

module.exports.register = function(req, res, next) {
var username = req.body.username;
var password = req.body.password;
 User
    .create({ username: username, password: password })
    .then(function (user) {
        req.logIn(user, function (err) {
        return err
            ? next(err)
            : res.json({err : 0, doc : {
                  username : user.username
                }
              });
        });
    }).catch(function(err){
        res.json({err : 1, errorDescription : err.message});
    })
};

module.exports.logout = function(req, res) {
  req.logout();
  res.json({
      err : 0,
      doc : {}
  });
};