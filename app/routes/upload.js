/**
 * Created by piligrim on 07.07.16.
 */
var express = require('express');
var router = express.Router();
var upload = require('../controller/upload');
var passport = require('passport');

// var multer  = require('multer');

// router.post('/avatar', upload.avatar);
router.post('/lotCSV', upload.lotCSV);
// router.post('/uploadFile', upload.uploadFile);

module.exports = router;