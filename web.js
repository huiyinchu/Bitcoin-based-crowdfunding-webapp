var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , async   = require('async')
  , db      = require('./models')
  , ROUTES  = require('./routes');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));
app.use(express.logger("dev"));

for(var ii in ROUTES) {
    app.get(ROUTES[ii].path, ROUTES[ii].fn);
}

global.db.sequelize.sync().complete(function(err) {
    if (err) {
	throw err;
    } else {
	var DB_REFRESH_INTERVAL_SECONDS = 600;
	async.series([
	    function(cb) {
		// Mirror the orders before booting up the server
		console.log("Initial mirror of Coinbase orders at " + new Date());
		global.db.Order.refreshFromCoinbase(cb);
	    },
	    function(cb) {
		// Begin listening for HTTP requests to Express app
		http.createServer(app).listen(app.get('port'), function() {
		    console.log("Listening on " + app.get('port'));
		});

		// Start a simple daemon to refresh Coinbase orders periodically
		setInterval(function() {
		    console.log("Refresh db at " + new Date());
		    global.db.Order.refreshFromCoinbase(cb);
		}, DB_REFRESH_INTERVAL_SECONDS*1000);
		cb(null);
	    }
	]);
    }
});
