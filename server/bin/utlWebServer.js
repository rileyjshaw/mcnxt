/*!
 * utlWebServer-node
 */

var fs              = require('fs'),
    express         = require('express'),
    cluster         = require('cluster'),
    http            = require('http'),
    https           = require('https'),
    numCPUs         = require('os').cpus().length,
    ioChannel       = require('./ioChannel'),
    logger          = require('./utlLogging'),
    RedisStore      = require('connect-redis')(express),
    
    timeouts        = [],
    secureConn      = false,
    httpPort        = 12080;
    httpsPort       = 12443;

function init() {
    if (cluster.isMaster) {
	    // Fork workers.
	    for (var i = 0; i < numCPUs; i++) {
		    cluster.fork();
	    }

  	    cluster.on('fork', function(worker) {
		    timeouts[worker.id] = setTimeout(logger.warn('utlWebServer init Worker #' + worker.id +' is not listening yet. Something must be wrong.'), 5000);
	    });

	    cluster.on('listening', function (worker, address) {
	        clearTimeout(timeouts[worker.id]);
	        logger.info('utlWebServer init Worker #' + worker.id + ' now listening on port ' + address.port);
	    });
	
	    cluster.on('exit', function(worker, code, signal) {
            clearTimeout(timeouts[worker.id]);
		    logger.info('utlWebServer init Worker #' + worker.process.pid + ' died ('+code+'). restarting...');
            cluster.fork();
	    });

        cluster.on('disconnect', function(worker) {
          console.warn('Worker #' + worker.id + ' has disconnected');
        });

    } else {
        // Workers can share any TCP connection
        // In this case its a HTTP server
        var server = express();
        configure(server);
        //setRoutes(server);
        startServer(server);
    }    
}

function startServer(server) {
    var serverInstance = null;
    if (secureConn === "true") {
        var options = {
            key  :              fs.readFileSync(__dirname + '/keys/privatekey.pem'),
            cert :              fs.readFileSync(__dirname + '/keys/certificate.pem'),
            ciphers :           "ECDHE-RSA-AES128-SHA256:AES128-GCM-SHA256:RC4:HIGH:!MD5:!aNULL:!EDH",
            honorCipherOrder :  true
        };
        serverInstance = https.createServer(options, server); 
	} else {
		serverInstance = http.createServer(server); 
	}
	
	ioChannel.init ( serverInstance, function (e) {} );

	if (secureConn === "true") {
	    serverInstance.listen(httpsPort);
	    logger.info ('utlWebServer startServer Starting HTTPS');
	} else {
	    serverInstance.listen(httpPort);
	    logger.info ('utlWebServer startServer Starting HTTP');
	}
}

function configure (server) {

	var oneDay = 24 * 60 * 60 * 1000;

	server.configure('production', function(){
        server.enable("trust proxy");
        server.use(express.compress());
	});

    server.configure('development', function(){
        server.use(function (req, res, next) { logger.info(req.method + " " + req.url); next(); }); //log requests
	});

	server.configure(function () {
        server.use(express.cookieParser());
        server.use(express.session({
        store: new RedisStore({
                host: '127.0.0.1',
                port: 6379,
                db: "sessionDB"
                //pass: 'K5A33koMdYoAmtlKxGXUxloVeBwvcyPuUadW4e3qBkkUvWbvCN4hNQcEbsv733I'
            }),
            secret: '6MG09cI7oEC0WiKIpZgvEGE4m9ZKjMgrNTgYoSGLLO43zNcc8yNLw9riOf35m0C',
            key: 'express.sid'
        }));
        server.use(express.static(__dirname + '/../public', { maxAge: oneDay }));
	});
    
	return false;
}

function setRoutes (server) {
    /*
	
    // Browser Routes //
    server.get('/', function (req, res) {
        //logger.info("utlWebServer setRoutes Worker #" + cluster.worker.id);
        res.sendfile(__dirname + '/../index.html');
    });

	
    server.get('/public/*.(js|css)', function(req, res, next) {
		res.sendfile(__dirname + "/.." + req.url);
	});

	server.get('/public/images/*.(jpg|jpeg|ico|png|gif)', function (req, res) {
	    res.sendfile(__dirname + "/.." + req.url);
	});

    // TBM Routes //
	server.post('/tbm/licensing/', function (req, res) {
	    //logger.info('utlWebServer setRoutes Parameters: ' + req.param('test') +'\n' );
	    res.sendfile(__dirname + "/.." + '/index.html');
	});
	
	//Generic Product Routes //
	server.post('/versions/', function (req, res) {	
		res.writeHead(200, { 'Content-Type': 'text/html' });
        res.send('Connected!');
	});	
    */
    server.all('/*', function (req, res) { //catchall route
        res.redirect('/');
    });
	
	return false;
}

//-- Exports --//
exports.init = init;