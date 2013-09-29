/*!
 * ioChannelAccounts-node
 */

var chanAccounts = null,
    cookie = require('express/node_modules/cookie'),
    connect = require('express/node_modules/connect'),
    parseCookie = connect.utils.parseCookie,
    accounts = require('./blAccounts'),
    //payments = require('./blPayments'),
    logger = require('./utlLogging'),
    err = require('./utlErr'),
    _us = require('underscore');


function init(io, callback) {
    chanAccounts = io
    .of('/accounts')
	.on('connection', function (socket) {
	    logger.info('ioChannelAccounts Connected to accounts');

	    socket.on ('createAccount',         createAccount);
	    socket.on ('login',                 login);
	    socket.on ('logout',                logout);
	    socket.on ('getAccountInfo',        getAccountInfo);
        
        socket.on ('createOrder',           createOrder);
        socket.on ('startOrder',            startOrder);
        socket.on ('fillOrder',             fillOrder);
        socket.on ('getOrderByID',          getOrderByID);
        socket.on ('getCustomerOrders',     getCustomerOrders);
        socket.on ('getMerchantOrders',     getMerchantOrders);

        socket.on ('chargeAmount',          chargeAmount);

	    socket.on ('terminate',             terminate);
	    socket.on ('error',                 function () { logger.error ('ioChannelAccounts Error connecting to channel accounts'); });
	    socket.on ('disconnect',            function () { logger.info  ('ioChannelAccounts Disconnected from channel accounts'); });
	})

	return callback(null, chanAccounts);
}

//-- Functions --//

function createAccount(data) {
    logger.info('ioChannelAccounts createAccount');
    
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if (!cleanData.email || !cleanData.firstName || !cleanData.lastName || !cleanData.password || !cleanData.type || !cleanData.session) {
                that.emit('createAccount', { error: true, errorCode: 231 });
                logger.error('ioChannelAccounts createAccount return: Bad or missing inputs');
            } else {
                cleanData.email = cleanData.email.toLowerCase();
                cleanData.session = [{id:cleanData.session, time:Date.now()}]
                accounts.createAccount(cleanData, function (e) {
                    if (e) {
                        logger.info('ioChannelAccounts createAccount error: ' + e);
                        that.emit('createAccount', { error: true, errorCode: e.code });
                    } else {
                        that.emit('createAccount', { error: false });
                        logger.info('ioChannelAccounts createAccount return: Account successfully created');
                    }
                });
            }
        } else {
            that.emit('createAccount', { error: true, errorCode: 231 });
            logger.error('ioChannelAccounts createAccount return: Bad or missing inputs');
        }
    });
    
    return false;
}

function login(data) {
    logger.info('ioChannelAccounts login');
    logger.info('ioChannelAccounts login email address: ' + data.email);
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if (!cleanData.email || !cleanData.password || !cleanData.session) {
                that.emit('login', { error: true, errorCode: 231 });
                logger.info('ioChannelAccounts login return: Bad or missing inputs');
                return true;
            }

            cleanData.email = cleanData.email.toLowerCase();

            var args = { email: cleanData.email, password: cleanData.password, session: cleanData.session };

            accounts.login(args, function (e, settings) {
                if (e) {
                    logger.info('ioChannelAccounts login error: ' + e);
                    that.emit('login', { error: true, errorCode: e.code });
                    return false;
                } else {
                    that.emit('login', { error: false, settings:settings });
                    logger.info('ioChannelAccounts login return: User successfully logged in');
                }
            });
        }
    });
}

function logout (data) {
    logger.info('ioChannelAccounts logout');
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if (!cleanData.session) {
                that.emit('logout', { error: true, errorCode: 231 });
                logger.info('ioChannelAccounts login return: Bad or missing inputs');
                return true;
            }
            accounts.logout(cleanData.session, function (e, result) {
                if (e) {
                    logger.info('ioChannelAccounts logout error: ' + e);
                    that.emit('logout', { error: true, errorCode: 211 });
                } else {
                    logger.info('ioChannelAccounts logout return: User successfully logged out');
                    that.emit('logout', { error: false });
                }
            });
        }
    });
}

function getAccountInfo (data) {
    logger.info('ioChannelAccounts getAccountInfo');
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if (!cleanData.session) {
                that.emit('getAccountInfo', { error: true, errorCode: 231 });
                logger.info('ioChannelAccounts getAccountInfo return: Bad or missing inputs');
                return true;
            }

            accounts.getAccountInfo(cleanData.session, function (e, accountInfo) {
                if (e) {
                    logger.info('ioChannelAccounts getAccountInfo error: ' + e.message);
                    that.emit('getAccountInfo', { error: true, errorCode: e.code });
                } else {
                    logger.info('ioChannelAccounts getAccountInfo return: account info retrieved');
                    that.emit('getAccountInfo', { error: false, accountInfo: accountInfo });
                }
            });
        }
    });
}

function createOrder(data) {
    logger.info('ioChannelAccounts createOrder');
    var that = this;
    sanitize(data, function (e, cleanData) {
        
        if (cleanData) {
            if (!cleanData.merchAccount || !cleanData.displayCode || !cleanData.items || !cleanData.total || !cleanData.session) {
                that.emit('createOrder', { error: true, errorCode: 231 });
                logger.error('ioChannelAccounts createOrder return: Bad or missing inputs');
            } else {
                accounts.createOrder(cleanData, function (e) {
                    if (e) {
                        logger.info('ioChannelAccounts createOrder error: ' + e);
                        that.emit('createOrder', { error: true, errorCode: e.code });
                    } else {
                        that.emit('createOrder', { error: false });
                        logger.info('ioChannelAccounts createOrder return: Order successfully created');
                    }
                });
            }
        } else {
            that.emit('createOrder', { error: true, errorCode: 231 });
            logger.error('ioChannelAccounts createOrder return: Bad or missing inputs');
        }

    });
    
    return false;
}

function startOrder(data) {
    logger.info('ioChannelAccounts startOrder');
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if (!cleanData.orderID) {
                that.emit('startOrder', { error: true, errorCode: 231 });
                logger.error('ioChannelAccounts startOrder return: Bad or missing inputs');
            } else {
                accounts.startOrder(cleanData, function (e) {
                    if (e) {
                        logger.info('ioChannelAccounts startOrder error: ' + e);
                        that.emit('startOrder', { error: true, errorCode: e.code });
                    } else {
                        that.emit('startOrder', { error: false });
                        logger.info('ioChannelAccounts startOrder return: Order successfully created');
                    }
                });
            }
        } else {
            that.emit('startOrder', { error: true, errorCode: 231 });
            logger.error('ioChannelAccounts startOrder return: Bad or missing inputs');
        }
    });
    return false;
}

function fillOrder(data) {
    logger.info('ioChannelAccounts fillOrder');
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if (!cleanData.orderID) {
                that.emit('fillOrder', { error: true, errorCode: 231 });
                logger.error('ioChannelAccounts fillOrder return: Bad or missing inputs');
            } else {
                accounts.fillOrder(cleanData, function (e) {
                    if (e) {
                        logger.info('ioChannelAccounts fillOrder error: ' + e);
                        that.emit('fillOrder', { error: true, errorCode: e.code });
                    } else {
                        that.emit('fillOrder', { error: false });
                        logger.info('ioChannelAccounts fillOrder return: Order successfully created');
                    }
                });
            }
        } else {
            that.emit('fillOrder', { error: true, errorCode: 231 });
            logger.error('ioChannelAccounts fillOrder return: Bad or missing inputs');
        }
    });
    return false;
}

function getOrderByID(data) {
    logger.info('ioChannelAccounts getOrderByID');
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if (!cleanData.orderID) {
                that.emit('getOrderByID', { error: true, errorCode: 231 });
                logger.error('ioChannelAccounts getOrderByID return: Bad or missing inputs');
            } else {
                accounts.getOrderByID(cleanData, function (e, order) {
                    if (e) {
                        logger.info('ioChannelAccounts getOrderByID error: ' + e);
                        that.emit('getOrderByID', { error: true, errorCode: e.code });
                    } else {
                        that.emit('getOrderByID', { error: false, order: order });
                        logger.info('ioChannelAccounts getOrderByID return: Order successfully retrieved');
                    }
                });
            }
        } else {
            that.emit('getOrderByID', { error: true, errorCode: 231 });
            logger.error('ioChannelAccounts getOrderByID return: Bad or missing inputs');
        }
    });
    return false;
}


function getCustomerOrders(data) {
    logger.info('ioChannelAccounts getCustomerOrders');
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if (!cleanData.customerID || !cleanData.session) {
                that.emit('getCustomerOrders', { error: true, errorCode: 231 });
                logger.error('ioChannelAccounts getCustomerOrders return: Bad or missing inputs');
            } else {
                accounts.getCustomerOrders(cleanData, function (e, orders) {
                    if (e) {
                        logger.info('ioChannelAccounts getCustomerOrders error: ' + e);
                        that.emit('getCustomerOrders', { error: true, errorCode: e.code });
                    } else {
                        that.emit('getCustomerOrders', { error: false, orders: orders });
                        logger.info('ioChannelAccounts getCustomerOrders return: Orders successfully retrieved');
                    }
                });
            }
        } else {
            that.emit('getCustomerOrders', { error: true, errorCode: 231 });
            logger.error('ioChannelAccounts getCustomerOrders return: Bad or missing inputs');
        }
    });
    return false;
}

function getMerchantOrders(data) {
    logger.info('ioChannelAccounts getMerchantOrders');
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if (!cleanData.merchantID || !cleanData.session) {
                that.emit('getMerchantOrders', { error: true, errorCode: 231 });
                logger.error('ioChannelAccounts getMerchantOrders return: Bad or missing inputs');
            } else {
                accounts.getMerchantOrders(cleanData, function (e, orders) {
                    if (e) {
                        logger.info('ioChannelAccounts getMerchantOrders error: ' + e);
                        that.emit('getMerchantOrders', { error: true, errorCode: e.code });
                    } else {
                        that.emit('getMerchantOrders', { error: false, orders: orders });
                        logger.info('ioChannelAccounts getMerchantOrders return: Order successfully created');
                    }
                });
            }
        } else {
            that.emit('getMerchantOrders', { error: true, errorCode: 231 });
            logger.error('ioChannelAccounts getMerchantOrders return: Bad or missing inputs');
        }
    });
    return false;
}

function chargeAmount(data) {
    logger.info('ioChannelAccounts chargeAmount');
    var that = this;
    sanitize(data, function (e, cleanData) {
        if (cleanData) {
            if ( !cleanData.customerID || !cleanData.cardData || !cleanData.cardData.number || !cleanData.cardData.expMonth || !cleanData.expYear || !cleanData.cardData.cvc  ) {
                that.emit('chargeAmount', { error: true, errorCode: 231 });
                logger.error('ioChannelAccounts chargeAmount return: Bad or missing inputs');
            } else {
                accounts.chargeAmount(cleanData, function (e) {
                    if (e) {
                        logger.info('ioChannelAccounts chargeAmount error: ' + e);
                        that.emit('chargeAmount', { error: true, errorCode: e.code });
                    } else {
                        that.emit('chargeAmount', { error: false });
                        logger.info('ioChannelAccounts chargeAmount return: Order successfully created');
                    }
                });
            }
        } else {
            that.emit('chargeAmount', { error: true, errorCode: 231 });
            logger.error('ioChannelAccounts chargeAmount return: Bad or missing inputs');
        }
    });
    return false;
}

function terminate() {
    this.disconnect();
}


 //-- Exports --//
exports.init    =   init;