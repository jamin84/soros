/*
	
	Market Manager

*/
var _ = require('lodash'),
	moment = require('moment'),
	log = require('./log.js'),
    utils = require('./utils'),
	config = utils.getConfig(),
	provider = config.market.exchange.toLowerCase(),
	DataProvider = require('../exchanges/' + provider),
	utc = moment.utc;

var Market = function(){
	log.info('Loading market for', this.market.asset,'...');
	_.bindAll(this);
	
  	this.market = platform.exchange.exchange//new DataProvider(config.market);

	this.history = {};
	this.orderbook = {};
	this.walls = {};
	this.peaks = {};
	this.valleys = {};
}

Market.prototype.getData = function(callback){

	async.series([
		function(next){
    		platform.market.getHistory(false, next);
    	},
    	function(next){
    		platform.market.getOrderbook(next);
    	}
  	], function(){
		//tells the async script from soros.js to go to the next call
  		callback();
  	});
}

Market.prototype.getHistory = function(since, next){
	log.info('Grabbing history for',this.market.asset,'...');

	this.market.getTrades(since, function(err, history){
		platform.market.history = history;
		next();
	}, false);
}

Market.prototype.getOrderbook = function(next){
    log.info("Grabbing Orderbook for id", this.market.asset,this.market.currency);

	this.market.getOrderbook(function(err, orderbook){
		platform.market.orderbook = orderbook;
		next();
	}, false);
}

Market.prototype.getHistoryDay = function(){
	//calculate 24hrs ago
	var begin = Math.round(new Date().getTime() / 1000) - (24 * 3600);
	log.info('begin: ', begin)
	//get the 100 trades from the begin timestamp.
	var trades = this.market.getTrades(begin, this.processHistoryDay, false);
}

Market.prototype.processHistoryDay = function(err, trades){
	//log.info(trades);
	this.historyDay.push(trades);
	log.info(trades);

	// Find the last timestamp from the last fetch and do another from that timestamp	
	this.market.getTrades(trades[99].timestamp, this.processHistoryDay, false);
}


Market.prototype.processTrades = function(err, trades) {
  if(err)
    throw err;

  // Make sure we have trades to process
  if(_.isEmpty(trades)) {

  } else {
  	//assume for now

  	this.Trends(trades);


  }

}

Market.prototype.startTrading = function(){

}

module.exports = Market;