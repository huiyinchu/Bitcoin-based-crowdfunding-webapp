/*
   Object/Relational mapping for instances of the Order class.
*/
var async = require('async');
var util = require('util');
var uu = require('underscore');
var coinbase = require('./coinbase');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Order", {
	coinbase_id: {type: DataTypes.STRING, unique: true, allowNull: false},
	amount: {type: DataTypes.FLOAT},
	time: {type: DataTypes.STRING, allowNull: false}
    }, {
	classMethods: {
	    numOrders: function() {
		this.count().success(function(c) {
		    console.log("There are %s Orders", c);});
	    },
	    allToJSON: function(successcb, errcb) {
		this.findAll()
		    .success(function(orders) {
			successcb(uu.invoke(orders, 'toJSON'));
		    })
		    .error(errcb);
	    },
	    totals: function(successcb, errcb) {
		this.findAll().success(function(orders) {
		    var total_funded = 0.0;
		    orders.forEach(function(order) {
			total_funded += parseFloat(order.amount);
		    });
		    var totals = {total_funded: total_funded,
				  num_orders: orders.length};
		    successcb(totals);
		}).error(errcb);
	    },
	    addAllFromJSON: function(orders, errcb) {
		var MAX_CONCURRENT_POSTGRES_QUERIES = 1;
		async.eachLimit(orders,
				MAX_CONCURRENT_POSTGRES_QUERIES,
				this.addFromJSON.bind(this), errcb);
	    },
	    addFromJSON: function(order_obj, cb) {
		var order = order_obj.order; // order json from coinbase
		if (order.status != "completed") {
		    cb();
		} else {
		    var _Order = this;
		    _Order.find({where: {coinbase_id: order.id}}).success(function(order_instance) {
			if (order_instance) {
			    // order already exists, do nothing
			    cb();
			} else {
			    var new_order_instance = _Order.build({
				coinbase_id: order.id,
				amount: order.total_btc.cents / 100000000,
				time: order.created_at
			    });
			    new_order_instance.save().success(function() {
				cb();
			    }).error(function(err) {
				cb(err);
			    });
			}
		    });
		}
	    },
	    refreshFromCoinbase: function(cb) {
		var _Order = this;
		coinbase.get_coinbase_json(1, function(err, orders) {
		    _Order.addAllFromJSON(orders, cb);
		});
	    }
	},
	instanceMethods: {
	    repr: function() {
		return util.format(
		    "Order <ID: %s Coinbase_ID:%s Amount:%s Time:%s " +
			"Created: %s Updated:%s", this.id, this.coinbase_id,
		    this.amount, this.time, this.createdAt, this.updatedAt);
	    },
	    amountInUSD: function() {
		var BTC2USD = 118.86;
		return this.amount * BTC2USD;
	    }
	}
    });
};
