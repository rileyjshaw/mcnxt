/*!
 * dbMongo-node
 * Mongo Database
 */

var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    logger = require('./utlLogging'),
    err = require('./utlErr'),
    dataSet = require('./dbMongoDataSet'),
    _us = require('underscore'),
    updateOptionsDefault = { w: 1 },
    updateNoConcernOptionsDefault = { w: 0 },
    databaseName = null,
    replSet = null;


databaseName = "linehakdb";
// mongodb://linehakdb:GrandAndToy@ds047438.mongolab.com:47438/linehakdb
replSet = new Server("ds047438.mongolab.com", 47438, {native_parser: true});

// Set up the connection to the local db server
var linehak = new MongoClient(replSet);

//Set up aliases for databases and collections
var linehakDB = {}; 
    linehakDB.db = null;
    linehakDB.coll = {};

function dbOpen (database, callback) {
    database.open(function (e, database) {
        if (e) { logger.error('dbMongo dbOpen ' + e); return callback(new err.db(100)); }
        logger.info('dbMongo Opened Database');
        return callback(null, null);
    });
}

function dbClose (database, callback) {
    database.close(function (e, database) {
        if (e) { logger.error('dbMongo dbClose' + e); return callback(new err.db(100)); }
        logger.info('dbMongo dbClose Closed Database');
        return callback(null);
    });
}

function getCollectionHandle (db, name, callback) { 
    //create and collections
    db.createCollection(name, { strict: true }, function (e, collection) {
        if (e) { // collection already exists
            logger.info("dbMongo getCollectionHandle Opening collection " + name)
        } else { // create it
            logger.info("dbMongo getCollectionHandle Creating collection " + name)
        }
        
        linehakDB.coll[name] = db.collection(name);

        process.nextTick(function () {
            if (linehakDB.coll[name]) {
                return callback(null);
            }
            return callback(new err.db(100));
        });
    });
}

function init(callback) {

    if (linehakDB.db) { 
        if (process.env.testing === "true") { return callback(null, linehak, linehakDB); }
        else { return callback(null); }
    }

    dbOpen(linehak, function (e, database) {
        if (e) { logger.error('dbMongo init' + e); return callback(new err.db(100)); }
        //set a database
        linehakDB.db = linehak.db(databaseName);
        logger.info('dbMongo init Set the Database');

        getCollectionHandle(linehakDB.db, "accounts", function (e) {
            if (e) { logger.error('dbMongo init ' + e); return callback(new err.db(100)); }
            logger.info("dbMongo init Opened collection accounts");

            getCollectionHandle(linehakDB.db, "orders", function (e) {
                if (e) { logger.error('dbMongo init ' + e); return callback(new err.db(100)); } logger.info("dbMongo init Opened collection orders");

                if (process.env.testing === "true") {
                    return callback(null, linehak, linehakDB);
                } else { 
                    return callback(null);
                }

            });
        });
    });
}

// Primitives //

function createDocument (collection, data, options, callback ) {
    options = options || {w:1};
    collection.insert(data, options, function (e, result) {
        if (e) { logger.error('dbMongo createDocument ' + e); return callback(new err.db(100)); }
        return callback(null, result);
    });
}

function retrieveDocument (collection, criteria, options, callback) { 
    options = options || { fields: {_id:0} };
    collection.findOne(criteria, options, function (e, doc) {
        if (e) { logger.error('dbMongo retrieveDocument ' + e); return callback(new err.db(100)); }
        return callback(null, doc);
    });
}

function retrieveDocuments (collection, criteria, options, callback) {
    options = options || {};
    collection.find(criteria, options).toArray(function (e, docs) {
        if (e) { logger.error('dbMongo retrieveDocuments ' + e); return callback(new err.db(100)); }
        return callback(null, docs);
    });
}

function retrieveDocumentCount (collection, criteria, callback) { 
    collection.count(criteria, function (e, count) {
        if (e) { logger.error('dbMongo retrieveDocumentCount ' + e); return callback(new err.db(100)); }
        return callback(null, count);
    });
}

function removeDocument (collection, criteria, options, callback) {
    options = options || { w: 1 };
    collection.remove(criteria, options, function (e, numberOfRemovedDocs) {
        if (e) { logger.error('dbMongo removeDocument ' + e); return callback ( new err.db(100) ); }
        return callback(null, numberOfRemovedDocs);
    });
}

function updateDocument (collection, criteria, modification, options, callback) {
    var updateOptions = _us.extend(updateOptionsDefault, options);
    collection.update(criteria, modification, updateOptions, function (e, result) {
        if (e) { 
            logger.error('dbMongo updateDocument ' + e); 
            if (process.env.testing === "true") { 
                return callback(e); 
            } else { 
                return callback(new err.db(100)); 
            } 
        }
        return callback(null, result);
    });
}

function updateDocumentNoConcern (collection, criteria, modification, options) {
    var updateOptions = _us.extend(updateNoConcernOptionsDefault, options);
    collection.update(criteria, modification, updateOptions);
}

function findAndUpdateDocument(collection, criteria, sort, modification, options, callback) { 
    var findAndUpdateOptions = _us.extend(updateOptionsDefault, options);
    collection.findAndModify (criteria, sort, modification, findAndUpdateOptions, function (e, result) {
        if (e) { logger.error('dbMongo findAndUpdateDocument ' + e); return callback(new err.db(100)); }
        return callback(null, result);
    });
}


// Accounts
function createAccount(data, callback) { 
    logger.info('dbMongo insertAccount');
    createDocument(linehakDB.coll.accounts, data, null, callback);
}

function retrieveAccountDetails(session, callback) { 
    logger.info('dbMongo retrieveAccountDetails');
    var criteria = { "session.id": session }, options = { fields: { auth:0, session:0 } };
    retrieveDocument(linehakDB.coll.accounts, criteria, options, callback);
}

function setLoginSession(data, callback) { // data -> {email:string, sessionID:string}
    logger.info('dbMongo setLoginSession');
    var criteria = { email: data.email }, modification = { $push: { session: { id:data.sessionID, time:Date.now() } } };
    updateDocument(linehakDB.coll.accounts, criteria, modification, null, callback);
}

function unSetLoginSession (sessionID, callback) {
    logger.info('dbMongo unSetLoginSession');
    var criteria = { "session.id": sessionID }, modification = { $pull: { session: { id: sessionID}} };
    updateDocument(linehakDB.coll.accounts, criteria, modification, null, callback);
}

function retrievePassInfoFromEmail (email, callback) {
    logger.info('dbMongo retrievePassInfoFromEmail');
    var criteria = { email: email }, options = { fields: { auth:1} };
    retrieveDocument(linehakDB.coll.accounts, criteria, options, callback);
}


// Orders //

function createOrder (data, callback) { 
    logger.info('dbMongo insertOrder');
    createDocument(linehakDB.coll.orders, data, null, callback);
}

function retrieveOrder(orderID, callback) { 
    logger.info('dbMongo retrieveOrder');
    var criteria = { _id: orderID }, options = null;
    retrieveDocument(linehakDB.coll.orders, criteria, options, callback);
}

function retrieveOrdersCust(custAccount, callback) { 
    logger.info('dbMongo retrieveOrdersCust');
    var criteria = { custAccount: custAccount }, options = null;
    retrieveDocuments(linehakDB.coll.orders, criteria, options, callback);
}

function retrieveOrdersMerch(merchAccount, callback) { 
    logger.info('dbMongo retrieveOrdersMerch');
    var criteria = {merchAccount:merchAccount}, options = null;
    retrieveDocuments(linehakDB.coll.orders, criteria, options, callback);
}

function updateOrderStatus (data, callback) { // data -> {orderID:string, status:int}
    logger.info('dbMongo updateOrderStatus');
    var criteria = { _id: data.orderID }, modification = { $set: { status: data.status } };
    updateDocument(linehakDB.coll.orders, criteria, modification, null, callback);
}

//-- Exports --//

// accounts
exports.createAccount				        =   createAccount;
exports.retrieveAccountDetails		        =   retrieveAccountDetails;
exports.setLoginSession		                =   setLoginSession;
exports.unSetLoginSession		            =   unSetLoginSession;
exports.retrievePassInfoFromEmail		    =   retrievePassInfoFromEmail;

// orders
exports.createOrder				            =   createOrder;
exports.retrieveOrder                       =   retrieveOrder;
exports.retrieveOrdersCust                  =   retrieveOrdersCust;
exports.retrieveOrdersMerch                 =   retrieveOrdersMerch;
exports.updateOrderStatus                   =   updateOrderStatus;




// db
exports.init				                =   init;

//Testing
if (process.env.testing === "true") {
    exports.dbClose                     =   dbClose;
    exports.createDocument			    =   createDocument;
    exports.retrieveDocument		    =   retrieveDocument;
    exports.retrieveDocuments 		    =	retrieveDocuments;
    exports.retrieveDocumentCount	    =   retrieveDocumentCount;
    exports.updateDocument		    	=   updateDocument;
    exports.findAndUpdateDocument		=   findAndUpdateDocument;
    exports.removeDocument			    =   removeDocument;
}