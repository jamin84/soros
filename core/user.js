/*
	User

*/

var _ = require('lodash'),
	utils = require('./utils'),
	config = utils.getConfig(),
	provider = config.market.exchange.toLowerCase(),
	events = require("events"),
	log = require('./log'),
	async = require('async');

var User = function(){
  _.bindAll(this);

  var Exchange = require('../exchanges/' + provider);
  this.exchange = new Exchange(config.market);

  this.portfolio = {};	
}

User.prototype.load = function(callback){
  log.info('Getting balances from', this.exchange.name,'...');

  var prepare = function() {
    this.starting = false;

    log.info('Trading at', this.exchange.name, 'ACTIVE');
    this.logPortfolio();

    callback();
  };

  async.series([
    this.setPortfolio
  ], _.bind(prepare, this));
	
}

// return the [fund] based on the data we have in memory
User.prototype.getFund = function(fund) {
  return _.find(this.portfolio, function(f) { return f.name === fund});
}
User.prototype.getBalance = function(fund) {
  return this.getFund(fund).amount;
}

User.prototype.setPortfolio = function(callback) {
  var set = function(err, portfolio) {
    this.portfolio = portfolio;
    
    if(_.isFunction(callback))
      callback();
  };
  this.exchange.getPortfolio(_.bind(set, this));
}

User.prototype.logPortfolio = function() {
  log.info(this.exchange.name, 'portfolio:');
  _.each(this.portfolio, function(fund) {
    log.info('\t', fund.name + ':', fund.amount);
  });
}

module.exports = User;