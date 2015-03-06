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

//TODO: Find the market with best spread rather than explicitly define one.

var traderBot = function(){
	/*

	Create Insights:
		1. get history
		2. get orderbook
		3. run analysis
	*/
	var analysis = new Insights();
	analysis.run();

	// for each model, see if the current market environment satisfies the conditions
	// i.e if aggressive is too aggressive, try moderate, then conservative

}


//traderBot();

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
loadMarketData = function(next){
	//get orderbook
	//get history

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
	  	loadMarketData,
	  	runMarketAnalysis
	  ],
	  function() {
	  	platform.market.startTrading();
	  }
	);

		



















