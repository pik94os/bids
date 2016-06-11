/**
 * Created by Alex on 03.06.2016.
 */
'use strict';

var UserMeta = require('./userInit/User.js'),
    RoleMeta = require('./userInit/Role'),
    RightMeta = require('./userInit/Right'),
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
                User: that.User
            }
        }).catch(function (err) {
            console.error(err.message)
        });
    }

    constructor() {
        this.Right = connection.define('right', RightMeta.attributes);
        this.Role = connection.define('role', RoleMeta.attributes, RoleMeta.options);
        this.RoleRight = connection.define('role_right', {});
        this.User = connection.define('users', UserMeta.attributes, UserMeta.options);

        this.Role.hasMany(this.User);
        this.Role.belongsToMany(this.Right, {through: this.RoleRight});
        this.Right.belongsToMany(this.Role, {through: this.RoleRight});

        this.roles = {};
        this.rights = {};
    }

    fillExportModels(models) {
        models.User = this.User;
        models.Role = this.Role;
        models.Right = this.Right;
    }

    _syncModels() {
        var that = this;
        return this.Role.sync({force: false}).then(function () {
            return that.User.sync({force: false})
        }).then(function () {
            return that.Right.sync({force: false})
        }).then(function () {
            return that.RoleRight.sync({force: false})
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
                        return true;
                    })
                })
            })
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