process.env.testing = "true";

var assert      =   require("assert"),
    dbMongo     =   require('../bin/dbMongo.js'),
    crypto      =   require('../bin/utlCrypto.js'),
    accounts    =   require('../bin/blAccounts.js'),
    assert      =   require("assert"),
    should      =   require('should'),
    logger      =   require('../bin/utlLogging'),
    dbServer    =   null,
    dbName      =   null,
    _us = require('underscore');

describe('database', function () {

    describe('#init()', function () {
        it('should be an object', function (done) {
            dbMongo.init(function (e, server, db) {
                dbServer = server;
                dbName = db;
                dbServer.should.be.a('object');
                done();
            });
        });

        it('should be an object', function (done) {
            dbName.should.be.a('object');
            done();
        });

        it('should be an object', function (done) {
            dbName.db.should.be.a('object');
            done();
        });

        it('should be an object', function (done) {
            dbName.coll.should.be.a('object');
            done();
        });

        it('admins collection should exist', function (done) {
            dbName.coll.accounts.should.be.a('object');
            done();
        });

        it('accounts collection should exist', function (done) {
            dbName.coll.orders.should.be.a('object');
            done();
        });

    });

    describe("accounts", function () {
        var accountsData = {
            type: 0,
            firstName: "Bruce",
            lastName: "Wayne",
            email: "bwayne@gotham.net",
            phone: "4168877874",
            establishment: "Wayne Enterprises",
            auth: { pass: "76fe34c3a8f24ca3376fe34c3a3b276fe34c3a8f24ca3376fe34c3a3b2ff", salt: "76fe34c3a8f24ca3376fe34c3a3b276fe34c3a8f24ca3376fe34c3a3b2ff", reset: [] },
            simplifyAccount: {
                name: "",
                auth: { pass: "", key: "" }
            },
            session: [{ id: "3b2ff4c6aa6fe34c3a33376fe3fe3337b274c8f24ca324c3a8f4c3a", time: Date.now() - 10000}],
            settings: []
        },

        accountsCriteria = { email: accountsData.email },
        newSession = "b276fe34c3a8f24ca3376fe34c3a3b2ff4c3a8f24ca3376fe34c3a3",
        newEmailAddress = "batman@gotham.com",
        newAuth = { pass: "UDgPULuP9wFr9kkrmr8i0jGafzddIKU8wu0dZ", salt: "fqRLVjTlUqgNOyMSO5RB0DhEcafEOkymPGcD0", reset: [] };


        describe("#insertAccount()", function () {
            it('should be able to insert an account', function (done) {
                dbMongo.createAccount(accountsData, function (e, result) {
                    should.not.exist(e);
                    done();
                });
            });
        });

        describe("#retrieveDocument()", function () {
            it('should be able to retrieve the new account', function (done) {
                dbMongo.retrieveDocument(dbName.coll.accounts, accountsCriteria, {}, function (e, doc) {
                    should.not.exist(e)
                    should.exist(doc);

                    should.exist(doc._id);

                    should.exist(doc.type);
                    doc.type.should.equal(accountsData.type);

                    should.exist(doc.firstName);
                    doc.firstName.should.equal(accountsData.firstName);

                    should.exist(doc.lastName);
                    doc.lastName.should.equal(accountsData.lastName);

                    should.exist(doc.email);
                    doc.email.should.equal(accountsData.email);

                    should.exist(doc.phone);
                    doc.phone.should.equal(accountsData.phone);

                    should.exist(doc.establishment);
                    doc.establishment.should.equal(accountsData.establishment);

                    should.exist(doc.auth);

                    should.exist(doc.auth.pass);
                    doc.auth.pass.should.equal(accountsData.auth.pass);

                    should.exist(doc.auth.salt);
                    doc.auth.salt.should.equal(accountsData.auth.salt);

                    doc.auth.reset.length.should.equal(0);

                    should.exist(doc.session);
                    doc.session.length.should.equal(1);

                    done();
                });
            });
        });

    });

    describe("orders", function () {

        var ordersData = {
            custAccount: "b276fe34c3a8f24ca3376fe34c3a3b2ff4c3a8f24ca3376fe34c3a3", // customer id (from Accounts collection)
            merchAccount: "a3b2ff4c3a8f24ca3376fe34c3a3b276fe34c3a8f24ca3376fe34c3",
            displayCode: "celery",
            items: [{ id: 1232, description: "Rickard\'s Red" }, { id: 343, description: "Rickard's White"}], // {menuID:0, description: ""}
            status: 0, // 0 = received, 1 = started, 2 = cannot be filled, 3 = filled, 9 = problem
            time: { received: Date.now(), started: 0, filled: 0} // { received:0, started:0, filled:0 }
        },

        ordersCriteria = { custAccount: ordersData.custAccount };

        describe("#insertOrders()", function () {
            it('should be able to insert an order', function (done) {
                dbMongo.createOrder(ordersData, function (e, result) {
                    should.not.exist(e);
                    done();
                });
            });
        });

        describe("#retrieveDocument()", function () {
            it('should be able to retrieve the new order', function (done) {
                dbMongo.retrieveDocument(dbName.coll.orders, ordersCriteria, {}, function (e, doc) {
                    should.not.exist(e)
                    should.exist(doc);

                    should.exist(doc._id);

                    should.exist(doc.custAccount);
                    doc.custAccount.should.equal(ordersData.custAccount);

                    should.exist(doc.merchAccount);
                    doc.merchAccount.should.equal(ordersData.merchAccount);

                    should.exist(doc.displayCode);
                    doc.displayCode.should.equal(ordersData.displayCode);

                    should.exist(doc.items);
                    doc.items.length.should.equal(2);

                    should.exist(doc.status);
                    doc.status.should.equal(ordersData.status);

                    should.exist(doc.time);
                    should.exist(doc.time.received);
                    should.exist(doc.time.started);
                    should.exist(doc.time.filled);

                    //doc.time.received.should.equal(ordersData.time.received);
                    doc.time.started.should.equal(ordersData.time.started);
                    doc.time.filled.should.equal(ordersData.time.filled);

                    done();
                });
            });
        });

    });
    /*

    describe("#setLoginSession()", function () {
    it('should be able to set a login session', function (done) {
    var criteria = { emailAddress: accountsData.emailAddress, sessionID: newSession };
    dbMongo.setLoginSession(criteria, function (e, result) {
    should.not.exist(e)
    done();
    });
    });
    });

    describe("#retrieveDocument()", function () {
    it('should be able to retrieve the new account', function (done) {
    dbMongo.retrieveDocument(dbName.coll.accounts, accountsCriteria, null, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.exist(doc.accountID);
    doc.accountID.should.equal(accountsData.accountID);

    should.exist(doc.firstName);
    doc.firstName.should.equal(accountsData.firstName);

    should.exist(doc.lastName);
    doc.lastName.should.equal(accountsData.lastName);

    should.exist(doc.emailAddress);
    doc.emailAddress.should.equal(accountsData.emailAddress);

    should.exist(doc.company);
    doc.company.should.equal(accountsData.company);

    should.exist(doc.auth);

    should.exist(doc.auth.pass);
    doc.auth.pass.should.equal(accountsData.auth.pass);

    should.exist(doc.auth.salt);
    doc.auth.salt.should.equal(accountsData.auth.salt);

    doc.auth.reset.length.should.equal(0);

    should.exist(doc.privilege);
    doc.privilege.should.equal(accountsData.privilege);

    should.exist(doc.session);
    doc.session.length.should.equal(2);
    doc.session[0].id.should.equal(accountsData.session[0].id);
    doc.session[1].id.should.equal(newSession);

    should.exist(doc.settings);
    should.exist(doc.settings.accountType);
    doc.settings.accountType.should.equal(accountsData.settings.accountType);

    should.not.exist(doc.emailConfirm);

    done();
    });
    });
    });

    describe("#retrieveSettings()", function () {
    it('should be able to retrieve settings', function (done) {
    dbMongo.retrieveSettings(newSession, function (e, doc) {
    should.not.exist(e)

    should.exist(doc);
    should.exist(doc.settings);
    should.exist(doc.settings.accountType);
    should.exist(doc.settings.accountType);
    doc.settings.accountType.should.equal(accountsData.settings.accountType);
    done();
    });
    });
    });

    describe("#retrieveAccountIDFromSession()", function () {
    it('should be able to retrieve the account id given the session', function (done) {
    dbMongo.retrieveAccountIDFromSession(newSession, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.exist(doc.accountID);
    doc.accountID.should.equal(accountsData.accountID);

    should.not.exist(doc.firstName);
    should.not.exist(doc.lastName);
    should.not.exist(doc.emailAddress);
    should.not.exist(doc.company);
    should.not.exist(doc.auth);
    should.not.exist(doc.privilege);
    should.not.exist(doc.session);
    should.not.exist(doc.settings);

    done();
    });
    });
    });

    describe("#retrievePassInfoFromEmail()", function () {
    it('should be able to retrieve the password info given the email address', function (done) {
    dbMongo.retrievePassInfoFromEmail(accountsData.emailAddress, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.not.exist(doc.accountID);
    should.not.exist(doc.firstName);
    should.not.exist(doc.lastName);
    should.not.exist(doc.emailAddress);
    should.not.exist(doc.company);

    should.exist(doc.auth);

    should.exist(doc.auth.pass);
    doc.auth.pass.should.equal(accountsData.auth.pass);

    should.exist(doc.auth.salt);
    doc.auth.salt.should.equal(accountsData.auth.salt);

    doc.auth.reset.length.should.equal(0);

    should.not.exist(doc.privilege);
    should.not.exist(doc.session);

    should.not.exist(doc.settings);


    done();
    });
    });
    });

    describe("#retrievePassEmailInfoFromSession()", function () {
    it('should be able to retrieve email, passwordin info given the session', function (done) {
    dbMongo.retrievePassEmailInfoFromSession(newSession, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.not.exist(doc.accountID);
    should.not.exist(doc.firstName);
    should.not.exist(doc.lastName);

    should.exist(doc.emailAddress);
    doc.emailAddress.should.equal(accountsData.emailAddress);

    should.not.exist(doc.company);

    should.exist(doc.auth);

    should.exist(doc.auth.pass);
    doc.auth.pass.should.equal(accountsData.auth.pass);

    should.exist(doc.auth.salt);
    doc.auth.salt.should.equal(accountsData.auth.salt);

    doc.auth.reset.length.should.equal(0);

    should.not.exist(doc.privilege);
    should.not.exist(doc.session);

    should.not.exist(doc.settings);

    done();
    });
    });
    });

    describe("#accountExistsFromID()", function () {
    it('should be able to check if account exists, given accountID', function (done) {
    dbMongo.accountExistsFromID(accountsData.accountID, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.exist(doc.accountID);
    doc.accountID.should.equal(accountsData.accountID);

    should.not.exist(doc.firstName);
    should.not.exist(doc.lastName);
    should.not.exist(doc.emailAddress);
    should.not.exist(doc.company);
    should.not.exist(doc.auth);
    should.not.exist(doc.privilege);
    should.not.exist(doc.session);
    should.not.exist(doc.emailConfirm);

    should.not.exist(doc.settings);

    done();
    });
    });
    });

    describe("#accountExistsFromEmail()", function () {
    it('should be able to check if account exists, given email', function (done) {
    dbMongo.accountExistsFromEmail(accountsData.emailAddress, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.not.exist(doc.accountID);
    should.not.exist(doc.firstName);
    should.not.exist(doc.lastName);

    should.exist(doc.emailAddress);
    doc.emailAddress.should.equal(accountsData.emailAddress);

    should.not.exist(doc.company);
    should.not.exist(doc.auth);
    should.not.exist(doc.privilege);
    should.not.exist(doc.session);
    should.not.exist(doc.settings);

    done();
    });
    });
    });

    describe("#updateUserAccountEmail()", function () {
    it('should be able to update the user account email', function (done) {
    var data = { emailAddress: accountsData.emailAddress, newEmailAddress: newEmailAddress };
    dbMongo.updateUserAccountEmail(data, function (e, result) {
    should.not.exist(e)
    done();
    });
    });
    });

    describe("#retrieveDocument()", function () {
    it('should be able to retrieve the new account', function (done) {
    dbMongo.retrieveDocument(dbName.coll.accounts, accountsCriteria, null, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.exist(doc.accountID);
    doc.accountID.should.equal(accountsData.accountID);

    should.exist(doc.firstName);
    doc.firstName.should.equal(accountsData.firstName);

    should.exist(doc.lastName);
    doc.lastName.should.equal(accountsData.lastName);

    should.exist(doc.emailAddress);
    doc.emailAddress.should.equal(newEmailAddress);

    should.exist(doc.company);
    doc.company.should.equal(accountsData.company);

    should.exist(doc.auth);

    should.exist(doc.auth.pass);
    doc.auth.pass.should.equal(accountsData.auth.pass);

    should.exist(doc.auth.salt);
    doc.auth.salt.should.equal(accountsData.auth.salt);

    doc.auth.reset.length.should.equal(0);

    should.exist(doc.privilege);
    doc.privilege.should.equal(accountsData.privilege);

    should.exist(doc.session);
    doc.session.length.should.equal(2);
    doc.session[0].id.should.equal(accountsData.session[0].id);
    doc.session[1].id.should.equal(newSession);

    should.exist(doc.settings);
    should.exist(doc.settings.accountType);
    doc.settings.accountType.should.equal(accountsData.settings.accountType);

    done();
    });
    });
    });

    describe("#updateUserAccountPassword()", function () {
    it('should be able to update the user account password', function (done) {
    var data = { session: newSession, auth: newAuth };
    dbMongo.updateUserAccountPassword(data, function (e, result) {
    should.not.exist(e)
    done();
    });
    });
    });

    describe("#retrieveDocument()", function () {
    it('should be able to retrieve the new account', function (done) {
    dbMongo.retrieveDocument(dbName.coll.accounts, accountsCriteria, null, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.exist(doc.accountID);
    doc.accountID.should.equal(accountsData.accountID);

    should.exist(doc.firstName);
    doc.firstName.should.equal(accountsData.firstName);

    should.exist(doc.lastName);
    doc.lastName.should.equal(accountsData.lastName);

    should.exist(doc.emailAddress);
    doc.emailAddress.should.equal(newEmailAddress);

    should.exist(doc.company);
    doc.company.should.equal(accountsData.company);

    should.exist(doc.auth);

    should.exist(doc.auth.pass);
    doc.auth.pass.should.equal(newAuth.pass);

    should.exist(doc.auth.salt);
    doc.auth.salt.should.equal(newAuth.salt);

    doc.auth.reset.length.should.equal(0);

    should.exist(doc.privilege);
    doc.privilege.should.equal(accountsData.privilege);

    should.exist(doc.session);
    doc.session.length.should.equal(2);
    doc.session[0].id.should.equal(accountsData.session[0].id);
    doc.session[1].id.should.equal(newSession);

    should.exist(doc.settings);
    should.exist(doc.settings.accountType);
    doc.settings.accountType.should.equal(accountsData.settings.accountType);

    done();
    });
    });
    });

    describe("#retrieveAccountDetails()", function () {
    it('should be able to retrieve the new account', function (done) {
    dbMongo.retrieveAccountDetails(newSession, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.not.exist(doc.accountID);

    should.exist(doc.firstName);
    doc.firstName.should.equal(accountsData.firstName);

    should.exist(doc.lastName);
    doc.lastName.should.equal(accountsData.lastName);

    should.exist(doc.emailAddress);
    doc.emailAddress.should.equal(newEmailAddress);

    should.exist(doc.company);
    doc.company.should.equal(accountsData.company);

    should.not.exist(doc.auth);
    should.not.exist(doc.privilege);
    should.not.exist(doc.session);
    should.not.exist(doc.settings);

    done();
    });
    });
    });

    describe("#setPasswordReset()", function () {
    it('should be able to set the account for a password reset', function (done) {
    var data = { emailAddress: newEmailAddress, resetCode: "a34d3e227948b37c36e38d898a9a8" };
    dbMongo.setPasswordReset(data, function (e, result) {
    should.not.exist(e)
    done();
    });
    });

    it('should be able to retrieve the new account', function (done) {
    dbMongo.retrieveDocument(dbName.coll.accounts, accountsCriteria, null, function (e, doc) {
    should.not.exist(e)
    should.exist(doc);

    should.exist(doc.accountID);
    doc.accountID.should.equal(accountsData.accountID);

    should.exist(doc.firstName);
    doc.firstName.should.equal(accountsData.firstName);

    should.exist(doc.lastName);
    doc.lastName.should.equal(accountsData.lastName);

    should.exist(doc.emailAddress);
    doc.emailAddress.should.equal(newEmailAddress);

    should.exist(doc.company);
    doc.company.should.equal(accountsData.company);

    should.exist(doc.auth);

    should.exist(doc.auth.pass);
    doc.auth.pass.should.equal(newAuth.pass);

    should.exist(doc.auth.salt);
    doc.auth.salt.should.equal(newAuth.salt);

    should.exist(doc.auth.reset);
    should.exist(doc.auth.reset[0].code);
    doc.auth.reset[0].code.should.equal('a34d3e227948b37c36e38d898a9a8');

    should.exist(doc.privilege);
    doc.privilege.should.equal(accountsData.privilege);

    should.exist(doc.session);
    doc.session.length.should.equal(2);
    doc.session[0].id.should.equal(accountsData.session[0].id);
    doc.session[1].id.should.equal(newSession);

    should.exist(doc.settings);
    should.exist(doc.settings.accountType);
    doc.settings.accountType.should.equal(accountsData.settings.accountType);

    done();
    });
    });
    });

    describe("#resetCodeExists()", function () {
    it('should be able to check to see if the reset code exists', function (done) {
    dbMongo.resetCodeExists("a34d3e227948b37c36e38d898a9a8", function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.exist(doc.auth);
    should.exist(doc.auth.reset);
    should.exist(doc.auth.reset[0].code);
    doc.auth.reset[0].code.should.equal("a34d3e227948b37c36e38d898a9a8");

    should.not.exist(doc.auth.pass);
    should.not.exist(doc.auth.salt);

    should.not.exist(doc.firstName);
    should.not.exist(doc.lastName);
    should.not.exist(doc.emailAddress);
    should.not.exist(doc.company);
    should.not.exist(doc.privilege);
    should.not.exist(doc.session);
    should.not.exist(doc.settings);

    done();
    });
    });
    });

    describe("#resetPassword()", function () {
    it('should be able to reset the password', function (done) {
    var data = { resetCode: "a34d3e227948b37c36e38d898a9a8", auth: accountsData.auth };
    dbMongo.resetPassword(data, function (e, result) {
    should.not.exist(e)
    should.exist(result);
    done();
    });
    });

    it('should be able to retrieve the new account', function (done) {
    dbMongo.retrieveDocument(dbName.coll.accounts, accountsCriteria, null, function (e, doc) {
    should.not.exist(e)
    should.exist(doc);

    should.exist(doc.accountID);
    doc.accountID.should.equal(accountsData.accountID);

    should.exist(doc.firstName);
    doc.firstName.should.equal(accountsData.firstName);

    should.exist(doc.lastName);
    doc.lastName.should.equal(accountsData.lastName);

    should.exist(doc.emailAddress);
    doc.emailAddress.should.equal(newEmailAddress);

    should.exist(doc.company);
    doc.company.should.equal(accountsData.company);

    should.exist(doc.auth);

    should.exist(doc.auth.pass);
    doc.auth.pass.should.equal(accountsData.auth.pass);

    should.exist(doc.auth.salt);
    doc.auth.salt.should.equal(accountsData.auth.salt);

    doc.auth.reset.length.should.equal(0);

    should.exist(doc.privilege);
    doc.privilege.should.equal(accountsData.privilege);

    should.exist(doc.session);
    doc.session.length.should.equal(2);
    doc.session[0].id.should.equal(accountsData.session[0].id);
    doc.session[1].id.should.equal(newSession);

    should.exist(doc.settings);
    should.exist(doc.settings.accountType);
    doc.settings.accountType.should.equal(accountsData.settings.accountType);


    done();
    });
    });
    });


    describe("#unSetLoginSession()", function () {
    it('should be able to unset the login session', function (done) {
    dbMongo.unSetLoginSession(newSession, function (e, result) {
    should.not.exist(e)
    done();
    });
    });
    });

    describe("#unSetExpiredSessions()", function () {
    it('should be able to unset all expired login session', function (done) {
    dbMongo.unSetExpiredSessions(accountsData.session[0].id);
    done();
    });
    });

    describe("#retrieveDocument()", function () {
    it('should be able to retrieve the new account', function (done) {
    dbMongo.retrieveDocument(dbName.coll.accounts, accountsCriteria, null, function (e, doc) {

    should.not.exist(e)
    should.exist(doc);

    should.exist(doc.accountID);
    doc.accountID.should.equal(accountsData.accountID);

    should.exist(doc.firstName);
    doc.firstName.should.equal(accountsData.firstName);

    should.exist(doc.lastName);
    doc.lastName.should.equal(accountsData.lastName);

    should.exist(doc.emailAddress);
    doc.emailAddress.should.equal(newEmailAddress);

    should.exist(doc.company);
    doc.company.should.equal(accountsData.company);

    should.exist(doc.auth);

    should.exist(doc.auth.pass);
    doc.auth.pass.should.equal(accountsData.auth.pass);

    should.exist(doc.auth.salt);
    doc.auth.salt.should.equal(accountsData.auth.salt);

    doc.auth.reset.length.should.equal(0);

    should.exist(doc.privilege);
    doc.privilege.should.equal(accountsData.privilege);

    should.exist(doc.session);
    doc.session.length.should.equal(0);

    should.exist(doc.settings);
    should.exist(doc.settings.accountType);
    doc.settings.accountType.should.equal(accountsData.settings.accountType);

    done();
    });
    });
    });

    describe("#removeDocument()", function () {
    it('should be able to remove the accounts document', function (done) {
    dbMongo.removeDocument(dbName.coll.accounts, accountsCriteria, null, function (e, number) {
    should.not.exist(e);
    should.exist(number);
    number.should.be.above(0);
    done();
    });
    });
    });

    describe("#retrieveDocument()", function () {
    it('should be able to confirm account was removed', function (done) {
    dbMongo.retrieveDocument(dbName.coll.accounts, accountsCriteria, null, function (e, doc) {
    should.not.exist(e)
    should.not.exist(doc);
    done();
    });
    });
    });
    });

    describe("orders", function () {
    var ordersData = [
    { reseller: "HP",
    account: null,
    resellerOrderNumber: 'CCW471367001',
    resellerProductCode: 'QP941AAE',
    description: 'Trust Manager product 1',
    cmProductCode: 'CRYTO1',
    issued: 1360664598000,
    quantity: '44',
    entitlement: 'YUAAJDUJ94DH',
    fulfilled: false
    },
    { reseller: "HP",
    account: null,
    resellerOrderNumber: 'CCW471368541',
    resellerProductCode: 'QP941AAE',
    description: 'Trust Manager product 1',
    cmProductCode: 'CRYTO1',
    issued: 1360664658000,
    quantity: '7',
    entitlement: 'YU53JDUJJE3H',
    fulfilled: false
    },
    { reseller: "HP",
    account: null,
    resellerOrderNumber: 'CCW471368300',
    resellerProductCode: 'QP942AAE',
    description: 'Trust Manager product 2',
    cmProductCode: 'CRYTO2',
    issued: 1360665005000,
    quantity: '7',
    entitlement: 'YUUTJDUJJE37',
    fulfilled: false
    },
    { reseller: "HP",
    account: null,
    resellerOrderNumber: 'CCW471368352',
    resellerProductCode: 'QP941AA',
    description: 'Trust Manager product 1',
    cmProductCode: 'CRYTO1',
    issued: 1360665915000,
    quantity: '15',
    entitlement: 'Y937JDUJJEDH',
    fulfilled: false
    }],
    entitlements = [ordersData[0].entitlement, ordersData[1].entitlement, ordersData[2].entitlement, ordersData[3].entitlement],
    account = '8f24ca3376fe34c3a3b2f';

    describe("#checkifAddedOrders()", function () {
    var orderNumbers = _us.pluck(ordersData, 'resellerOrderNumber');
    it('should be able to check if orders already exist', function (done) {
    dbMongo.checkifAddedOrders(orderNumbers, function (e, result) {
    should.not.exist(e);
    should.exist(result);
    result.length.should.equal(0);
    done();
    });
    });
    });

    describe("#checkifAddedByEntitlement()", function () {
    var entitlements = _us.pluck(ordersData, 'entitlement');
    it('should be able to check if entitlements already exist', function (done) {
    dbMongo.checkifAddedByEntitlement(entitlements, function (e, result) {
    should.not.exist(e);
    should.exist(result);
    result.length.should.equal(0);
    done();
    });
    });
    });

    describe("#addOrders()", function () {
    it('should be able to add orders', function (done) {
    dbMongo.addOrders(ordersData, function (e, result) {
    should.not.exist(e);
    should.exist(result);
    result.length.should.equal(4);
    done();
    });
    });
    });

    describe("#checkifAddedByEntitlement()", function () {
    var entitlements = _us.pluck(ordersData, 'entitlement');
    it('should be able to check if entitlements already exist', function (done) {
    dbMongo.checkifAddedByEntitlement(entitlements, function (e, result) {
    should.not.exist(e);
    should.exist(result);
    result.length.should.equal(4);
    done();
    });
    });
    });
        
    describe("#retrieveOrdersbyOrderNumbers()", function () {
    var orderNumbers = _us.pluck(ordersData, 'resellerOrderNumber');
    it('should be able to retrieve orders', function (done) {
    dbMongo.retrieveOrdersbyOrderNumbers(orderNumbers, function (e, result) {
    should.not.exist(e);
    should.exist(result);
    result.length.should.equal(4);
    done();
    });
    });
    });

    describe("#retrieveOrdersbyEntitlement()", function () {
    var entitlement = ['Y937JDUJJEDH'];
    it('should be able to retrieve orders by entitlement', function (done) {
    dbMongo.retrieveOrdersbyEntitlement(entitlement, function (e, result) {
    should.not.exist(e);
    should.exist(result);
    result.length.should.equal(1);
    done();
    });
    });
    });

    describe("#retrieveOrdersbyEntitlement()", function () {
    var entitlement = ['what what?'];
    it('should be able to retrieve orders by entitlement', function (done) {
    dbMongo.retrieveOrdersbyEntitlement(entitlement, function (e, result) {
    should.not.exist(e);
    should.exist(result);
    result.length.should.equal(0);
    done();
    });
    });
    });


    describe("#fulfillOrder()", function () {
    var data = { entitlements: entitlements, account: account };
    it('should be able to fulfill orders by entitlement', function (done) {
    dbMongo.fulfillOrder(data, function (e, result) {
    should.not.exist(e);
    should.exist(result);
    result.should.equal(4);
    done();
    });
    });
    });


    describe("#retrieveOrdersbyAccountNumber()", function () {
    it('should be able to retrieve orders', function (done) {
    dbMongo.retrieveOrdersbyAccountNumber(account, function (e, result) {
    should.not.exist(e);
    should.exist(result);
    result.length.should.equal(4);
    result[0].fulfilled.should.equal(true);
    result[0].account.should.equal(account);
    result[1].fulfilled.should.equal(true);
    result[1].account.should.equal(account);
    result[2].fulfilled.should.equal(true);
    result[2].account.should.equal(account);
    result[3].fulfilled.should.equal(true);
    result[3].account.should.equal(account);
    done();
    });
    });
    });

    describe("#removeDocument()", function () {
    var removeAllOrders = {};
    it('should be able to remove the orders documents', function (done) {
    dbMongo.removeDocument(dbName.coll.orders, removeAllOrders, null, function (e, number) {
    should.not.exist(e);
    should.exist(number);
    number.should.be.equal(4);
    done();
    });
    });
    });
    });
    */
    describe("#removeDocument()", function () {
        var removeAllAccounts = {};
        it('should be able to remove all accounts', function (done) {
            dbMongo.removeDocument(dbName.coll.accounts, removeAllAccounts, null, function (e, number) {
                should.not.exist(e);
                should.exist(number);
                number.should.be.above(0);
                done();
            });
        });
    });
});