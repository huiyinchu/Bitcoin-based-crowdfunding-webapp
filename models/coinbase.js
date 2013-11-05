/*
   using async.compose to manage asynchrony.
*/
var async = require('async');
var request = require('request');
var uu = require('underscore');

var coinbase_api_url = function(page) {
    return "https://coinbase.com/api/v1/orders?page=" +
        page.toString() + "&api_key=" + process.env.COINBASE_API_KEY;
};

var get_ncoinbase_page = function(init, cb) {
    request.get(coinbase_api_url(init), function(err, resp, body) {
        var orders_json = JSON.parse(body);
        console.log("Finished get_ncoinbase_page");
        cb(null, orders_json.num_pages);
    });
};

var ncoinbase_page2coinbase_json = function(npage, cb) {
    console.log("Starting ncoinbase_page2coinbase_json with npage = " + npage);
    var inds = uu.range(1, npage + 1);
    var LIMIT = 5;
    var getjson = function(item, cb2) {
        request.get(coinbase_api_url(item), function(err, resp, body) {
            var orders_json = JSON.parse(body);
            console.log("Finished API request for Coinbase Order Page " + item);
            cb2(null, orders_json.orders);
        });
    };
    async.mapLimit(inds, LIMIT, getjson, function(err, results) {
        cb(null, uu.flatten(results));
    });
};

var get_coinbase_json = async.compose(ncoinbase_page2coinbase_json,
                                      get_ncoinbase_page);
/*

    https://coinbase.com/api/v1/orders?page=1&api_key=YOUR-COINBASE-API-KEY

    parse the num_pages field from it first.
*/
var debug_get_coinbase_json = function() {
    get_coinbase_json(1, function(err, result) {
        console.log(result);
    });
};

module.exports = { 'get_coinbase_json': get_coinbase_json,
                   'debug_get_coinbase_json': debug_get_coinbase_json};
