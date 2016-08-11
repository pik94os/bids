/**
 * Created by Alex on 03.06.2016.
 */
'use strict';

var UserMeta = require('./userInit/User.js'),
    RoleMeta = require('./userInit/Role'),
    RightMeta = require('./userInit/Right'),
    AuctionHouseMeta = require('./userInit/AuctionHouse'),
    AuctionMeta = require('./userInit/Auction'),
    LotMeta = require('./userInit/Lot'),
    LotPictureMeta = require('./userInit/LotPicture'),
    BidMeta = require('./userInit/Bid'),
    ChatMeta = require('./userInit/Chat'),
    AuctionUserMeta = require('./userInit/AuctionUser'),
    SellingStatisticsMeta = require('./userInit/SellingStatistics'),
    connection = require('../sequelize.js');

class Initiator {
    execute() {
        var that = this;
        return that._syncModels().then(function () {
            return that._addRoles()
        }).then(function () {
            return that._addSuperAdmin()
        }).then(function () {
            return that._addRights()
        }).then(function () {
            return that._grantRights()
        }).then(function () {
            return {
                Right: that.Right,
                Role: that.Role,
                RoleRight: that.RoleRight,
                User: that.User,
                AuctionHouse: that.AuctionHouse,
                Lot: that.Lot,
                LotPicture: that.LotPicture,
                Bid: that.Bid,
                AuctionUser: that.AuctionUser,
                Chat: that.Chat,
                SellingStatistics: that.SellingStatistics
            }
        }).catch(function (err) {
            console.error(err.message)
        });
    }

    constructor() {
        this.Right = connection.define('right', RightMeta.attributes);
        this.Role = connection.define('role', RoleMeta.attributes, RoleMeta.options);
        this.RoleRight = connection.define('role_right', {});
        this.AuctionUser = connection.define('auction_user', AuctionUserMeta.attributes);
        this.User = connection.define('users', UserMeta.attributes, UserMeta.options);
        this.AuctionHouse = connection.define('auction_houses', AuctionHouseMeta.attributes);
        this.Auction = connection.define('auction', AuctionMeta.attributes);
        this.Lot = connection.define('lot', LotMeta.attributes);
        this.Bid = connection.define('bid', BidMeta.attributes);
        this.LotPicture = connection.define('lot_picture', LotPictureMeta.attributes);
        this.Chat = connection.define('chat', ChatMeta.attributes);
        this.SellingStatistics = connection.define('selling_statistics', SellingStatisticsMeta.attributes);

        this.Role.hasMany(this.User);
        this.Role.belongsToMany(this.Right, {through: this.RoleRight});
        this.Right.belongsToMany(this.Role, {through: this.RoleRight});
        this.Auction.belongsToMany(this.User, {through: this.AuctionUser});
        this.User.belongsToMany(this.Auction, {through: this.AuctionUser});

        // this.Auction.belongsTo(this.User);
        this.User.hasMany(this.Auction);
        this.Auction.hasMany(this.Lot);
        this.Auction.hasMany(this.AuctionUser);
        this.Lot.belongsTo(this.Auction);
        this.Lot.hasMany(this.LotPicture);
        this.Bid.belongsTo(this.Lot);
        this.Lot.hasMany(this.Bid);
        this.User.hasMany(this.Bid);
        this.Bid.belongsTo(this.User);
        this.SellingStatistics.belongsTo(this.AuctionUser);
        this.SellingStatistics.belongsTo(this.User, {foreignKey: 'userId'});
        this.AuctionUser.hasMany(this.SellingStatistics);
       // this.Notification.belongsTo(this.Lot, {as: "lot"});
       // this.Notification.belongsTo(this.User, {as: "users"});
        this.Chat.belongsTo(this.User);
        this.AuctionUser.belongsTo(this.User);
        this.User.hasMany(this.AuctionUser);
        // this.SellingStatistics.hasMany(this.User);


        this.roles = {};
        this.rights = {};
    }

    fillExportModels(models) {
        models.User = this.User;
        models.Role = this.Role;
        models.Right = this.Right;
        models.AuctionHouse = this.AuctionHouse;
        models.AuctionUser = this.AuctionUser;
        models.Auction = this.Auction;
        models.Lot = this.Lot;
        models.LotPicture = this.LotPicture;
        models.Bid = this.Bid;
        models.Chat = this.Chat;
        models.SellingStatistics = this.SellingStatistics;
    }

    _syncModels() {
        var that = this;
        return this.Role.sync({force: false}).then(function () {
                return that.User.sync({force: false})
        }).then(function () {
                return that.Right.sync({force: false})
        }).then(function () {
                return that.RoleRight.sync({force: false})
        }).then(function () {
            return that.Auction.sync({force: false})
        }).then(function () {
            return that.AuctionUser.sync({force: false})
        }).then(function () {
            return that.Lot.sync({force: false})
        }).then(function () {
            return that.LotPicture.sync({force: false})
        }).then(function () {
            return that.Bid.sync({force: false})
        }).then(function () {
            return that.Chat.sync({force: false})
        }).then(function () {
            return that.SellingStatistics.sync({force: false})
        })
    }

    _addRoles() {
        var that = this;

        return that.Role.findOrCreate({
            where: {roleName: 'superadmin'},
            defaults: {
                roleName: 'superadmin',
                description: 'Суперадмин',
                isArchive: false
            }
        }).spread(function (role) {
            that.roles.sa = role;
            return that.Role.findOrCreate({
                where: {roleName: 'admin'},
                defaults: {description: 'Админ', isArchive: false}
            }).spread(function (role) {
                that.roles.admin = role;
                return that.Role.findOrCreate({
                    where: {roleName: 'auction_house'},
                    defaults: {description: 'Аукционный дом', isArchive: false}
                }).spread(function (role) {
                    that.roles.ah = role;
                    return that.Role.findOrCreate({
                        where: {roleName: 'buyer'},
                        defaults: {description: 'Покупатель', isArchive: false}
                    }).spread(function (role) {
                        that.roles.buyer = role;
                        return that.Role.findOrCreate({
                            where: {roleName: 'leading'},
                            defaults: {description: 'Ведущий', isArchive: false}
                        }).spread(function (role) {
                            that.roles.leading = role;
                            return true;
                        })
                    });
                })
            });
        })
    }

    _addSuperAdmin() {
        var that = this;

        return that.User.findOrCreate({
            where: {username: 'sa'},
            defaults: {
                username: 'sa',
                password: 'system',
                isArchive: false
            }
        }).spread(
            function (user) {
                return that.roles.sa.addUser(user)
            }
        );
    }

    _addRights() {
        var that = this;

        return that.Right.findOrCreate({
            where: {name: 'createUser'},
            defaults: {
                name: 'createUser',
                description: 'создание пользовталея'
            }
        }).spread(function (right) {
            that.rights.createUser = right;
            return
        })
    }

    _grantRights() {
        var that = this;
        return new Promise(function (resolve) {
                that.rights.createUser.addRoles([that.roles.sa, that.roles.admin]);
                resolve()
            }
        )
    }
}

module.exports = Initiator;