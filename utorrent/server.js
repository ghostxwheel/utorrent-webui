var express = require("express"),
    httpProxy = require("http-proxy"),
    proxy = httpProxy.createProxyServer({}),
    app = express(),
    compression = require("compression"),
    open = require("open"),
    serveIndex = require("serve-index"),
    port = 8081,
    publicPath = "/app",
    directory = __dirname,
    launchUrl = "http://localhost:" + port + publicPath,
    year = 60 * 60 * 24 * 365 * 1000;
    
// use compress middleware to gzip content
app.use(compression());

// set default mime type to xml for ".library" files
express.static.mime.default_type = "text/xml";

// serve up content directory showing hidden (leading dot) files
app.use(publicPath, express.static(directory, { maxAge: year, hidden: true }));

// enable directory listing
app.use("/app", serveIndex(__dirname, {"icons": true}));
app.use("/gui", function(req,res) {
    for(var prop in req.headers) {
        if(req.headers.hasOwnProperty(prop)) {
            if(prop !== "authorization" && prop !== "cookie") {
                delete req.headers[prop];
            }
        }
    }
    
    proxy.web(req, res, { target: "http://localhost:9002/gui" + req.url.toString() });
});

// start server
app.listen(port);

// launch uri in default browser
open(launchUrl);

// log to server console
console.log("OpenUI5 SDK server running at\n  => " + launchUrl + " \nCTRL + C to shutdown")