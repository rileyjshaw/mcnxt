/*!
 * blAccounts-node
 * Business Logic Layer for Accounts
*/

var db          = require('./dbMongo'),
    dataSet     = require('./dbMongoDataSet'),
    simplify    = require('./blPaymentsSimplify'),
    crypto      = require('./utlCrypto'),
    err         = require('./utlErr'),
	logger      = require('./utlLogging'),
    _us         = require('underscore');


function hashPassword(data, callback) { // {password, salt}
    logger.info('blAccounts hashPassword: ' + data);
    
    var args = { type: 'sha256', encodingIn: 'utf8', encodingOut: 'hex', payload: data.salt + data.password };
    
    crypto.hashThis(args, function (e, digest) {
        if (e) { return callback(e); }
        return callback(e, digest)
    });
}

function createAccount (data, callback) { //data -> {email, firstName, lastName, establishment, session:[]}
    logger.info('blAccounts createAccount');
    logger.info(data);
    db.accountExistsFromEmail (data.email, function (e, accDoc) {
        if (e) { return callback(e); }
        if (accDoc) { return callback(new err.app(204)); } // account exists
        var args = { length: 32, encoding: 'hex' };
        crypto.getRandomBytes(args, function (e, salt) { // generate salt
            if (e) { return callback(e); } 
            hashPassword( {password:data.password, salt:salt}, function (e, digest) {
                var newAccount = _us.extend(dataSet.account,data,{auth: {pass: digest, salt: salt, reset:[]}});
                db.createAccount(newAccount, function (e, doc) {
                    return callback(e);
                });
            });
        });
    });
}

function accountExists (sessionID, callback) { 
    logger.info('blAccounts accountExists');
    db.retrieveAccountIDFromSession(sessionID, function (e, accDoc) {
        if (e) { return callback(e); }
        return callback(null, accDoc);
    });
}

function login (data, callback) { //data -> {email, password, session}
    logger.info('blAccounts login');
    db.retrievePassInfoFromEmail(data.email, function (e, accDoc) {
        if (e) { return callback(e); }
        if (!accDoc) { return callback(new err.app(201)); } // account does not exist
        if (!accDoc.auth || !accDoc.auth.salt || !accDoc.auth.pass) { return callback(new err.app(201)); } // salt or password does not exist

        hashPassword({ password: data.password, salt: accDoc.auth.salt }, function (e, digest) {
            if (digest !== accDoc.auth.pass) { return callback(new err.app(203)); } // wrong username or password
            var args = { email: data.email, sessionID: data.session };
            db.setLoginSession(args, function (e, result) {
                if (e) { logger.error(e); return callback(new err.app(210)); }
                return callback(null);
            });
        });
    });
}

function getAccountInfo(session, callback) {
    logger.info('blAccounts getAccountInfo');
    db.retrieveAccountDetails(session, function (e, accDoc) {
        if (e) { return callback(e); }
        if (!accDoc) { return callback(new err.app(209)); } // session does not exist (not logged in)
        return callback(null, accDoc);
    });
}

function logout (session, callback) {
    logger.info('blAccounts logout: ' + session);
    db.unSetLoginSession(session, function (e, result) { return callback(e, result); });
}

function createOrder(data, callback) { 
    logger.info('blAccounts createOrder');
    logger.info(data);
    getAccountInfo(data.session, function (e, accDoc) {
        if (e) { return callback(e); }
        var newOrder = _us.extend(dataSet.order, { custAccount : accDoc._id, merchAccount:data.merchAccount, displayCode:data.displayCode, items:data.items, total: data.total, time: { received: Date.now() } });
        db.createOrder(newOrder, function (e, doc) {
            return callback(e);
        });
    });
}

function startOrder(data, callback) { 
    logger.info('blAccounts startOrder');
    logger.info(data);
    var startOrderArgs = _us.extend(data, { status: 1 });
    db.updateOrderStatus(startOrderArgs, function (e, doc) {
        return callback(e);
    });
}

function fillOrder(data, callback) { 
    logger.info('blAccounts fillOrder');
    logger.info(data);
    var fillOrderArgs = _us.extend(data, { status: 3 });
    db.updateOrderStatus(fillOrderArgs, function (e, doc) {
        return callback(e);
    });
}

function getOrderByID(data, callback) { 
    logger.info('blAccounts getOrderByID');
    logger.info(data);
    db.retrieveOrder(data.orderID, function (e, order) {
        if (e) return callback(e)
        if (!order) return callback(new err.app(209));
        return callback (null, order);
    });
}

function getCustomerOrders(data, callback) { 
    logger.info('blAccounts getCustomerOrders');
    logger.info(data);
    db.retrieveOrdersCust(data.customerID, function (e, orders) {
        if (e) return callback(e);
        if (!orders || !orders.length) return callback(new err.app(101));
        return callback(null, orders);
    });
}

function getMerchantOrders(data, callback) { 
    logger.info('blAccounts getMerchantOrders');
    logger.info(data);
    db.retrieveOrdersMerch(data.merchantID, function (e, orders) {
        if (e) return callback(e);
        if (!orders || !orders.length) return callback(new err.app(101));
        return callback(null, orders);
    });
}

function chargeAmount(data, callback) {
    logger.info('blAccounts chargeAmount');
    logger.info(data);

    getCustomerOrders(data, function (e, orders) {
        if (e) return callback(e);
        if (!orders || !orders.length) return callback(new err.app(101));
        var amount = 0;
        orders.forEach(function (order) { amount += order.total; });
        var paymentArgs = [data.cardData.number, data.cardData.expMonth, data.cardData.expYear, data.cardData.cvc, amount, "", "USD"];
        simplify.createPayment(paymentArgs, function (e) {
            if (e) return callback(new err.app(101));
            return callback(null);
        });
    });
}

//-- Exports --//

exports.createAccount               =   createAccount;
exports.accountExists               =   accountExists;
exports.login                       =   login;
exports.logout                      =   logout;
exports.getAccountInfo              =   getAccountInfo;

exports.createOrder                 =   createOrder;
exports.startOrder                  =   startOrder;
exports.getOrderByID                =   getOrderByID;

// Testing
if (process.env.testing === "true") {

    exports.generateAccountID           =   generateAccountID;
    exports.hashPassword                =   hashPassword;

}

