'use strict';

var _exports = {};

var UserInit = require('./userInit');
var _initiator = new UserInit();
_initiator.execute();
_initiator.fillExportModels(_exports);


module.exports.User = _exports.User;
module.exports.Role = _exports.Role;
module.exports.Auction = _exports.Auction;
module.exports.AuctionHouse = _exports.AuctionHouse;
module.exports.Lot = _exports.Lot;