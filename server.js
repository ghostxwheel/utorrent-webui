var express = require("express"),
    http = require("http"),
    app = express(),
    compression = require("compression"),
    //open = require("open"),
	httpProxy = require('http-proxy'),
	proxy = httpProxy.createProxyServer({}),
    serveIndex = require("serve-index"),
    port = process.env.OPENSHIFT_NODEJS_PORT || 8081,
	host = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    publicPath = "/",
    directory = __dirname,
    launchUrl = "http://" + host + ":" + port + publicPath,
    year = 60 * 60 * 24 * 365 * 1000;
 
try {

	// use compress middleware to gzip content
	app.use(compression());

	// set default mime type to xml for ".library" files
	express.static.mime.default_type = "text/xml";

	// serve up content directory showing hidden (leading dot) files
	app.use(publicPath, express.static(directory, { maxAge: year, hidden: true }));

	// enable directory listing
	app.use("/", serveIndex(__dirname, {"icons": true}));
	app.use("/gui", function(req, res) {

		//var headers = {};
		//if(req.headers.authorization) {
		//	headers.Authorization = req.headers.authorization;
		//}
		//
		//if(req.headers.cookie) {
		//	headers.Cookie = req.headers.cookie;
		//}
		//
		//var onResponse = function(innerRes) {
		//	var strData = ""
		//	
		//	innerRes.on('data', function (data) {
		//		strData += data;
		//	});
        //
		//	//the whole response has been recieved, so we just print it out here
		//	innerRes.on('end', function () {
		//		res.write(strData);
		//		res.end();
		//	});
		//}
        //
		//var innerReq = http.request({
		//	host: "grifonpc.ddns.net",
		//	port: "9002",
		//	path: "/gui" + req.url.toString(),
		//	headers: headers
		//}, onResponse);
		//
		//innerReq.on("error", function() {
		//	console.error(arguments);
		//});
		//
		//innerReq.end();
		
		proxy.web(req, res, { target: "http://grifonpc.ddns.net:9002/gui" + req.url.toString() });
	});

	// start server
	app.listen(port, host);

	// launch uri in default browser
	//open(launchUrl);

	// log to server console
	console.log("OpenUI5 SDK server running at\n  => " + launchUrl + " \nCTRL + C to shutdown");
}
catch (oException) {
	console.error(oException);
}