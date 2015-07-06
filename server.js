/*eslint-env node, browser */
var express = require("express"),
	http = require("http"),
	compression = require("compression"),
	httpProxy = require("http-proxy"),
	basicAuth = require("basic-auth-connect"),
	//open = require("open"),
	serveIndex = require("serve-index");

var app = express(),
	proxy = httpProxy.createProxyServer({}),
	port = process.env.OPENSHIFT_NODEJS_PORT || 8081,
	host = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
	user = process.env.AUTH_USER || "admin",
	pass = process.env.AUTH_PASS || "pass",
	remoteUser = process.env.AUTH_REMOTE_USER || "admin",
	remotePass = process.env.AUTH_REMOTE_PASS || "pass",
	publicPath = "/",
	directory = __dirname,
	launchUrl = "http://" + host + ":" + port + publicPath,
	year = 60 * 60 * 24 * 365 * 1000;

// Authentication middleware
app.use(basicAuth(user, pass));

// use compress middleware to gzip content
app.use(compression());

// set default mime type to xml for ".library" files
express.static.mime.default_type = "text/xml";

// serve up content directory showing hidden (leading dot) files
app.use(publicPath, express.static(directory, {
	maxAge: year,
	hidden: true
}));

// enable directory listing
app.use("/", serveIndex(__dirname, {
	"icons": true
}));

proxy.on("proxyReq", function(proxyReq) {
  proxyReq.setHeader("Authorization", "Basic " + new Buffer(remoteUser + ":" + remotePass).toString("base64"));
});

app.use("/gui", function(req, res) {
    var urlPath = req.url.toString();
    
	proxy.web(req, res, {
		target: "http://grifonpc.ddns.net:9002/gui" + urlPath
	});
});

// start server
app.listen(port, host);

// log to server console
console.log("OpenUI5 SDK server running at\n  => " + launchUrl + " \nCTRL + C to shutdown");