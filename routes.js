var uu      = require('underscore')
  , db      = require('./models')
  , Constants = require('./constants');

var build_errfn = function(errmsg, response) {
    return function errfn(err) {
	console.log(err);
	response.send(errmsg);
    };
};

var indexfn = function(request, response) {
    response.render("homepage", {
	name: Constants.APP_NAME,
	title: "My First " + Constants.APP_NAME,
	product_name: Constants.PRODUCT_NAME,
	twitter_username: Constants.TWITTER_USERNAME,
	twitter_tweet: Constants.TWITTER_TWEET,
	product_short_description: Constants.PRODUCT_SHORT_DESCRIPTION,
	coinbase_preorder_data_code: Constants.COINBASE_PREORDER_DATA_CODE
    });
};

var orderfn = function(request, response) {
    var successcb = function(orders_json) {
	response.render("orderpage", {orders: orders_json});
    };
    var errcb = build_errfn('error retrieving orders', response);
    global.db.Order.allToJSON(successcb, errcb);
};

var api_orderfn = function(request, response) {
    var successcb = function(totals) {
	var data = uu.extend(totals,
			     {target: Constants.FUNDING_TARGET,
			      unit_symbol: Constants.FUNDING_UNIT_SYMBOL,
			      days_left: Constants.days_left()});
	data.total_funded *= Constants.FUNDING_SI_SCALE;
	response.json(data);
    };
    var errcb = build_errfn('error retrieving API orders', response);
    global.db.Order.totals(successcb, errcb);
};

var refresh_orderfn = function(request, response) {
    var cb = function(err) {
	if(err) {
	    console.log("Error in refresh_orderfn");
	    response.send("Error refreshing orders.");
	} else {
	    response.redirect("/orders");
	}
    };
    global.db.Order.refreshFromCoinbase(cb);
};


/*
     [ { path: '/', fn: [Function] },
       { path: '/orders', fn: [Function] },
       { path: '/api/orders', fn: [Function] },
       { path: '/refresh_orders', fn: [Function] } ]
*/
var define_routes = function(dict) {
    var toroute = function(item) {
	return uu.object(uu.zip(['path', 'fn'], [item[0], item[1]]));
    };
    return uu.map(uu.pairs(dict), toroute);
};

var ROUTES = define_routes({
    '/': indexfn,
    '/orders': orderfn,
    '/api/orders': api_orderfn,
    '/refresh_orders': refresh_orderfn
});

module.exports = ROUTES;
