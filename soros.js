/* 

  Soros is a digital currency trading bot for popular Bitcoin exchanges written 
  in node, it features multiple trading methods using technical analysis.

  Disclaimer:

  USE AT YOUR OWN RISK!

  The author of this project is NOT responsible for any damage or loss caused 
  by this software. There can be bugs and the bot may not perform as expected 
  or specified. Please consider testing it first with paper trading / 
  backtesting on historical data. Also look at the code to see what how 
  it's working.

*/
var sorosDir = './',
	coreDir = sorosDir+'core/';

var async = require('async'),
  	request = require('request'),
	utils = require(coreDir + 'utils'),
	log = require(coreDir + 'log'),
	Insights = require(coreDir + 'insights');

platform = {};

var loadUserDetails = function(next){
	var User = require(coreDir + 'user');
	platform.user = new User(platform);

	//do this within the module?
	async.series([
		platform.user.load
		], 
		function(){
			next()
		}
	);
},
runExchangeAnalysis = function(next){
	//find the best market of the exchange to trade in
	var Exchange = require(coreDir + 'exchangeManager');
	platform.exchange = new Exchange;

	async.series([
		platform.exchange.findBestMarket,
		platform.exchange.calculateBestSpread
		], 
		function(){
			next()
		}
	);

},
loadMarketData = function(next){
	var Market = require(coreDir + 'marketManager');
	platform.market = new Market();

	//do this within the module?
	async.series([
		platform.market.getData
		], 
		function(){
			next()
		}
	);

},
runMarketAnalysis = function(next){
	var Insights = require(coreDir + 'insights');
	platform.analysis = new Insights(platform);

	//do this within the module?
	
	async.series([
		platform.analysis.run
		], 
		function(){
			next()
		}
	);
}

async.series(
	  [
	  	loadUserDetails,
	  	runExchangeAnalysis,
	  	loadMarketData,
	  	runMarketAnalysis
	  ],
	  function() {
	  	platform.market.startTrading();
	  }
);

//bot #2
//trade between USDBTC, <asset>BTC, <asset>USD
tradingBot = function(){
	async.series(
		  [
		  	loadUserDetails,
		  	runExchangeAnalysis,
		  	loadMarketData,
		  	runMarketAnalysis
		  ],
		  function() {
		  	platform.market.startTrading();
		  }
	);
};
		



















