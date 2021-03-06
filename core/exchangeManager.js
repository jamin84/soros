/*
	
	Exchange Manager

*/
var _ = require('lodash'),
	moment = require('moment'),
	log = require('./log.js'),
    utils = require('./utils'),
	config = utils.getConfig(),
	provider = config.market.exchange.toLowerCase(),
	DataProvider = require('../exchanges/' + provider),
	utc = moment.utc

var Exchange = function(){
	_.bindAll(this);

  	this.exchange = new DataProvider(config.market);
	
  	this.markets = [
  		{asset : 'XBTUSD', name: 'USDBTC', spread: 0}
  	];
  	this.targetMarket = '';
  	this.exchange.setMarket('XBTUSD', 'USDBTC');

}

Exchange.prototype.findBestMarket = function(next){
	//pull the orderbooks for the markets, and find the spread
	async.each(this.markets, function(item, callback){
		platform.exchange.exchange.getMarketOrderbook(item.asset, item.name, function(err, orderbook){
			platform.exchange.calculateSpread(item, orderbook, callback);
		}, false);
	},
	function(err){
		next();
	});
}

Exchange.prototype.calculateSpread = function(market, orderbook, callback){
	log.info('Calculating spread for', market.name,'...');

	var sell = orderbook['sellorders'][0].price+.00000001,
		buy = orderbook['buyorders'][0].price+.00000001;
	var spread = (sell-buy).toFixed(8);
	log.info('\t','Spread:', spread);
  	_.find(this.markets, function(f) { if(f.asset === market.asset) f.spread = spread});
  	//callback from async.each to signal <vader>the cycle is complete muahahahahahaha</vader>
	callback();
}

Exchange.prototype.calculateBestSpread = function(next){
	log.info('Calculating best spread...');
	var sortedMarkets = this.markets.sort(function(a,b){ return parseFloat(b.spread) - parseFloat(a.spread) });
	this.exchange.setMarket(sortedMarkets[0].asset, sortedMarkets[0].name);
	next();
}

module.exports = Exchange;