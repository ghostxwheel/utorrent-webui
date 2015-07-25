/*eslint-env node, browser */
var express = require('express'),
	compression = require('compression'),
	httpProxy = require('http-proxy'),
	basicAuth = require('basic-auth-connect'),
	net = require('net'),
	wol = require('wake_on_lan'),
	dns = require('dns'),
	ssh2Client = require('ssh2').Client,
	path = require('path'),
	cacheManifest = require('connect-cache-manifest'),
	serveIndex = require('serve-index');

var app = express(),
	ssh2client = new ssh2Client(),
	proxy = httpProxy.createProxyServer({}),
	port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8081,
	//host = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	host = 'herokuhost',
	user = process.env.AUTH_USER || 'admin',
	pass = process.env.AUTH_PASS || 'pass',
	macAddress = process.env.REMOTE_MAC || '000000000000',
	remoteDns = process.env.REMOTE_ADDRESS || 'localhost',
	remoteUser = process.env.AUTH_REMOTE_USER || 'admin',
	remotePass = process.env.AUTH_REMOTE_PASS || 'pass',
	remoteSshUser = process.env.REMOTE_SSH_USER || 'admin',
	remoteSshPassword = process.env.REMOTE_SSH_PASSWORD || 'pass',
	publicPath = '/',
	launchUrl = 'http://' + host + ':' + port + publicPath,
	year = 60 * 60 * 24 * 365 * 1000;

// Cache manifest
app.use(cacheManifest({
	manifestPath: '/public/cache.manifest',
	files: [{
		dir: path.join(__dirname, '/public/'),
		prefix: '/public/'
    }, {
		dir: path.join(__dirname, '/resources'),
		prefix: '/resources/'
    }],
	networks: ['*'],
	fallbacks: []
}));

var auth = function(req, res, next) {
	if (req.url.indexOf('/public/') !== 0 && req.url.indexOf('/resources/') !== 0) {
		basicAuth(user, pass)(req, res, next);
	} else {
	    next();
	}
};

// use compress middleware to gzip content
app.use(auth);

// use compress middleware to gzip content
app.use(compression());

// set default mime type to xml for '.library' files
express.static.mime.default_type = 'text/xml';

// serve up content directory showing hidden (leading dot) files
app.use(publicPath, express.static(__dirname, {
	maxAge: year,
	hidden: true
}));

// enable directory listing
app.use(publicPath, serveIndex(__dirname, {
	'icons': true
}));

app.use('/gui', function(req, res) {
	var urlPath = req.url.toString();

    proxy.on('proxyReq', function(proxyReq) {
    	proxyReq.setHeader('Authorization', 'Basic ' + new Buffer(remoteUser + ':' + remotePass).toString('base64'));
    });

	proxy.web(req, res, {
		target: 'http://' + remoteDns + ':9002/gui' + urlPath
	});
});

app.use('/ping', function(req, res) {
	var status = {};
	var client = net.connect({
		host: remoteDns,
		port: 22
	}, function() { //'connect' listener
		status = {
			status: 'Success'
		};
		client.end();
	});

	client.setTimeout(2000, function() {
		status = {
			status: 'Error'
		};
		client.end();
	});

	client.on('error', function() {
		status = {
			status: 'Error'
		};
		client.end();
	});

	client.on('close', function() {
		res.json(status);
		client.end();
	});
});

app.use('/wakeup', function(req, res) {
	dns.resolve(remoteDns, function(error, addresses) {
		if (error) {
			res.json({
				statusCode: 4,
				status: 'Error occurred while resolving address'
			});
		} else if (addresses.length > 0) {
			wol.wake(macAddress, {
				address: addresses[0],
				port: 50000
			}, function(error) {
				console.log(macAddress);
				console.log(addresses[0]);

				if (error) {
					console.log(error.toString());
					res.json({
						statusCode: 4,
						status: 'Error occured: ' + error.toString()
					});
				} else {
					res.json({
						statusCode: 0,
						status: 'Wake-up packet sent'
					});
				}
			});
		}
	});
});

app.use('/shutdown', function(req, res) {
	dns.resolve(remoteDns, function(error, addresses) {
		if (error) {
			res.json({
				statusCode: 4,
				status: 'Error occurred while resolving address'
			});
		} else if (addresses.length > 0) {
			var status = {
				statusCode: 0,
				status: 'Shutdown sent to remote server'
			};

			ssh2client
				.on('ready', function() {
					console.log('Client :: ready');
					ssh2client.exec('shutdown /s /t 0', function(err, stream) {
						if (err) {
							status = {
								statusCode: 4,
								status: 'Error occured: '
							};

							return;
						}

						stream.on('close', function(code, signal) {
							console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
							ssh2client.end();
						}).on('data', function(data) {
							console.log('STDOUT: ' + data);
						}).stderr.on('data', function(data) {
							console.log('STDERR: ' + data);
						});
					});
				})

			.on('error', function(error) {
				// Nothing
				console.log(error);
			})

			.on('close', function() {
				res.json(status);
			})

			.connect({
				host: addresses[0],
				port: 22,
				username: remoteSshUser,
				password: remoteSshPassword
			});
		}
	});
});

// start server
app.listen(port);

// log to server console
console.log('OpenUI5 SDK server running at\n  => ' + launchUrl + ' \nCTRL + C to shutdown');