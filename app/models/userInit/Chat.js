/**
 * Created by piligrim on 15.07.16.
 */
'use strict';
const Sequelize = require('sequelize');

const attributes = {
    message: {type: Sequelize.STRING},
    auctionId: {type: Sequelize.INTEGER}
};

module.exports.attributes = attributes;