var Bitstamp = require("bitstamp"),
   moment = require('moment'),
    async = require('async'),
        _ = require('lodash'),
     utils = require('../core/utils'),
      log = require('../core/log');

var Trader = function(config) {
  _.bindAll(this);
  if(_.isObject(config)) {
    this.key = config.key;
    this.secret = config.secret;
    this.clientID = config.username;
  }
  this.name = 'Bitstamp';
  this.balance;
  this.price;

  this.bitstamp = new Bitstamp(this.key, this.secret, this.clientID);
}

// if the exchange errors we try the same call again after
// waiting 10 seconds
Trader.prototype.retry = function(method, args) {
  var wait = +moment.duration(10, 'seconds');
  log.debug(this.name, 'returned an error, retrying..');

  var self = this;

  // make sure the callback (and any other fn)
  // is bound to Trader
  _.each(args, function(arg, i) {
    if(_.isFunction(arg))
      args[i] = _.bind(arg, self);
  });

  // run the failed method again with the same
  // arguments after wait
  setTimeout(
    function() { method.apply(self, args) },
    wait
  );
}

Trader.prototype.getPortfolio = function(callback) {
  var set = function(err, data) {
    var portfolio = [];
    _.each(data, function(amount, asset) {
      if(asset.indexOf('available') !== -1) {
        asset = asset.substr(0, 3).toUpperCase();
        portfolio.push({name: asset, amount: parseFloat(amount)});
      }
    });
    callback(err, portfolio);
  }
  this.bitstamp.balance(_.bind(set, this));
}

Trader.prototype.getTicker = function(callback) {
  this.bitstamp.ticker(callback);
}

Trader.prototype.getFee = function(callback) {
  var set = function(err, data) {
    if(err)
      callback(err);

    callback(false, data.fee / 100);
  }
  this.bitstamp.balance(_.bind(set, this));
}

Trader.prototype.buy = function(amount, price, callback) {
  var set = function(err, result) {
    if(err || result.error)
      return log.error('unable to buy:', err, result);

    callback(null, result.id);
  };

  // TODO: fees are hardcoded here?
  amount *= 0.995; // remove fees
  // prevent: Ensure that there are no more than 8 digits in total.
  amount *= 100000000;
  amount = Math.floor(amount);
  amount /= 100000000;
  this.bitstamp.buy(amount, price, _.bind(set, this));
}

Trader.prototype.sell = function(amount, price, callback) {
  var set = function(err, result) {
    if(err || result.error)
      return log.error('unable to sell:', err, result);

    callback(null, result.id);
  };

  this.bitstamp.sell(amount, price, _.bind(set, this));
}

Trader.prototype.checkOrder = function(order, callback) {
  var check = function(err, result) {
    var stillThere = _.find(result, function(o) { return o.id === order });
    callback(err, !stillThere);
  };

  this.bitstamp.open_orders(_.bind(check, this));
}

Trader.prototype.cancelOrder = function(order, callback) {
  var cancel = function(err, result) {
    if(err || !result)
      log.error('unable to cancel order', order, '(', err, result, ')');
  };

  this.bitstamp.cancel_order(order, _.bind(cancel, this));
}

Trader.prototype.getTrades = function(since, callback, descending) {
  var args = _.toArray(arguments);
  var process = function(err, result) {
    if(err)
      return this.retry(this.getTrades, args);

    callback(null, result.reverse());
  };

  this.bitstamp.transactions(_.bind(process, this));
}


module.exports = Trader;