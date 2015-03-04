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
	log = require(coreDir + 'log');

var	Insights = require(coreDir + 'insights');

//TODO: Find the market with best spread rather than explicitly define one.

var tradingModels = [
	{
		'type' : 'conservative',
		'profitMin' : .05,
		'profitMax' : 5
	},
	{
		'type' : 'moderate',
		'profitMin' : 5.01,
		'profitMax' : 10
	},
	{
		'type' : 'aggressive',
		'profitMin' : 10.01,
		'profitMax' : -1
	}
];

var traderBot = function(models){
/*

Create Insights:
	1. get history
	2. get orderbook
	3. run analysis
*/


// getHistory(false);

var analysis = new Insights();

analysis.start();


// for each model, see if the current market environment satisfies the conditions
// i.e if aggressive is too aggressive, try moderate, then conservative

}


traderBot(tradingModels);
/*

Buying or selling?


	
	WHAT TYPE OF BOT: determines profit outlook
	
		MODELS:
		1. Conservative
			<= 5%
		2. Moderate
			<= 10%
		3. Aggressive
			> 10%

	GET TRADE OPPORTUNITIES:

		1. CALCULATE CURRENT SPREAD: highest buy order - lowest sell order
			a. is this enough for a quick profitable trade regardless of model?
		2. SET TARGET PROFIT: I think I can make *this* much; 
			a. Based on model vs projections/insights/momentum and SPREAD
		3. FIND DAT TARGET PRICE: based on #2
			a. Adjust for buy/sell walls
			b. Set price:
				i. Selling: exit point
				ii. Buying: entry point
		4. REFLECT ON MARKET CONDITIONS
			a. Did another buy order replace mine?
			b. Check for new walls
			c. Is someone scooping up coins quickly and can I adjust

*/

















