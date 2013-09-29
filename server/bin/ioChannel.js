/*!
 * ioChannel-node
 */

var io = require('socket.io'),
	RedisStore = require('socket.io/lib/stores/redis'),
    redis = require('socket.io/node_modules/redis'),
    pub = redis.createClient(),
    sub = redis.createClient(),
    client = redis.createClient(),
    accounts = require('./blAccounts'),
    logger = require('./utlLogging'),
    err = require('./utlErr'),
	chanDefault = require('./ioChannelDefault'),
	chanAccounts = require('./ioChannelAccounts');
	

function init (serverInstance, callback) {
	io = io.listen  ( serverInstance );
	configure       ( function ( e ) {} );
	setChannels     ( function ( e ) {} );
	return callback(null);
}

function configure ( callback ) {
    io.configure('production', function(){
        io.enable('browser client minification');  // send minified client
        io.enable('browser client etag');          // apply etag caching logic based on version number
        io.enable('browser client gzip');          // gzip the file
        io.set('log level', 1);                    // reduce logging
        io.set('flash policy port', 12843);
        io.set('transports', [ 'websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling', 'htmlfile' ]);
    });

    io.configure('development', function () {
        io.set('flash policy port', 12843);
        io.set('transports', [ 'websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling', 'htmlfile' ]);
        //io.set('match origin protocol', true);
    });

    io.configure(function () {
        io.set('store', new RedisStore({
            redisPub: pub,
            redisSub: sub,
            redisClient: client,
            host: '127.0.0.1',
            port: 6379,
            db: "socketDB"
        }));
    });
    
    
	return callback (null);
}

function setChannels ( callback ) {

    chanDefault.init(io, function (e, result) {
        if (e) { }
        chanAccounts.init(io, function (e, result) {
            if (e) { }
        });
    });

}

//-- Exports --//
exports.init = init;