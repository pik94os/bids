var express = require('express');
var router = express.Router();
var user = require('../controller/user');
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', user.login);

router.post('/reg', user.register);

router.get('/logout', user.logout);

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});

module.exports = router;