/*!
 * blPayments-node
 * Business Logic Layer for Payments
*/

var db                  = require('./dbMongo'),
    logger              = require('./utlLogging');
    err                 = require('./utlErr');
    stripeInit          = false,
    payments            = {
        simplify : {
            enabled :       true,
            initialized :   false,
            wrapper :       require('./blPaymentsSimplify')
        }
    };

function init(callback) {
    logger.info('blPayments init');
    var activated = false;
    for (var paymentHaus in payments) {
        if (payments[paymentHaus].enabled && !payments[paymentHaus].initialized) {
            payments[paymentHaus].wrapper.init(function (e) {
                payments[paymentHaus].initialized = true;
                activated = true;
            });
        }    
    }
    return callback(null, activated);
}

function createPayment (cardData, transaction, callback) {
    logger.info('blPayments createPayment');

    var paymentHaus = null;

    if (payments.paypal.enabled && payments.paypal.initialized) {
        paymentHaus = "paypal";
    } else if (payments.stripe.enabled && payments.stripe.initialized) {
        paymentHaus = "stripe"
    }

    logger.info('blPayments createPayment - Processing with ' + paymentHaus);
    payments[paymentHaus].wrapper.createPayment(cardData, transaction, function (e, response) {
        return callback(e, response);
    });
}


function recordPayment(data, callback) {
    logger.info('blPayments recordPayment');
    var insertArgs = {
        vendor:         data.vendor,
        transactionID:  data.transactionID,
        cmID:           data.cmID,
        account:        data.accountID, //added later
        cardName:       data.cardName,
        last4:          data.last4,
        items:          data.items,
        total:          data.total
    };

    db.insertTransaction(insertArgs, function (e, result) {
        return callback(e);
    });    
}

if (process.env.testing !== "true") {

    var initialized = false;

    for (var paymentHaus in payments) {
        if (payments[paymentHaus].initialized) { initialized = true; }
    }

    if (!initialized) {
        init(function (e, activated) {
            if (!activated) {
                logger.error('Could not initialize payment systems.');
            }
        }); 
    }
}


//-- Exports --//
exports.createPayment   = createPayment;
exports.recordPayment   = recordPayment;

//Testing
if (process.env.testing === "true") {
    exports.init = init;
}