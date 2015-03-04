/*
	
	Insights

*/

var utils = require('./utils'),
	config = utils.getConfig(),
	provider = config.market.exchange.toLowerCase(),
	DataProvider = require('../exchanges/' + provider),
	User = require('./user');

var Insights = function(){
  _.bindAll(this);

  this.market = new DataProvider(config.market);

  this.asset = config.market.asset;
  this.currency = config.market.currency;
  this.fee = config.market.fee;
  this.strategy = config.strategy,
  this.momentum = 0;
  this.trend = 0;
  this.historyDay = [];

}

Insights.prototype.run = function(callback){

	/*
		Automatically figure out strategies based on most available funds:
		i.e. If I have BTC, then find the trade amongst currencies, including USD
	*/

	//var user = new User();
	//user.load();


	/*

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

	/*
		Cryptsy v2 delivers tradeHistory in increments of 100 which is too low to analyze.
		As a result we have to piece together the last 24hrs.
	*/
	
	//this.getHistoryDay();
	//this.getHistory(false);

	this.models = config.tradingModels;
	this.getOrderbook();
}

Insights.prototype.getHistoryDay = function(){
	//calculate 24hrs ago
	var begin = Math.round(new Date().getTime() / 1000) - (24 * 3600);
	log.info('begin: ', begin)
	//get the 100 trades from the begin timestamp.
	var trades = this.market.getTrades(begin, this.processHistoryDay, false);
}

Insights.prototype.processHistoryDay = function(err, trades){
	//log.info(trades);
	this.historyDay.push(trades);
	log.info(trades);

	// Find the last timestamp from the last fetch and do another from that timestamp	
	this.market.getTrades(trades[99].timestamp, this.processHistoryDay, false);
}

Insights.prototype.getHistory = function(since){
	//request market data and run processTrades()
	this.market.getTrades(since, this.processTrades, false);
}

Insights.prototype.getOrderbook = function(){
	this.market.getOrderbook(this.calculateSpread, false);
}

Insights.prototype.processTrades = function(err, trades) {
  if(err)
    throw err;

  // Make sure we have trades to process
  if(_.isEmpty(trades)) {

  } else {
  	//assume for now

  	this.Trends(trades);


  }

}

Insights.prototype.calculateSpread = function(err, orderbook){
	log.info('Calculating spread...');

	var sell = orderbook['sellorders'][0].price+.00000001,
		buy = orderbook['buyorders'][0].price+.00000001;
	var spread = (sell-buy).toFixed(8);
	log.info('\t', 'Spread:', spread)
	log.info('\t', 'To buy price: ', buy, ' | To sell price: ', sell );

	this.calculateProfit(orderbook['buyorders'][0].price, orderbook['sellorders'][0].price, .10);//platform.user.getFund('BTC').amount

	//check orders for entry/exit point

	//if(this.)
	//this.calculateEntryPoint();
	//this.calculateExitPoint();

}

Insights.prototype.calculateProfit = function(buyPrice, sellPrice, currency ){
	log.info('Calculating profits...');
	var fee = (currency*this.fee),
		spread = (sellPrice-buyPrice).toFixed(8),
		profitPercent = ((spread)/(buyPrice-fee))*100,
		shares = ((currency-fee)/buyPrice).toFixed(8);
		profit = (spread*shares).toFixed(8);


	log.info('\t','Profit %: ', profitPercent.toFixed(2));
	log.info('\t','Profit (If buying with',currency,this.currency,' give you',shares,'shares) ', profit);
	log.info('\t','Threshold of',this.strategy.threshold,' is',(profit>=this.strategy.threshold?"":"not"),'met');

	/*
	var profitPercent = ((sell-buy)/buy)*100,
		fee = (currency*this.fee),
		profit = ((currency-fee)/buy).toFixed(8);


	log.info('\t','Profit %: ', profitPercent.toFixed(2));
	log.info('\t','Profit (',this.currency,'): ', profit);
	*/


	//use latest available currency for the user
	log.info('')

	//run throught the models to see where the profit margin lies
	log.info('Running against models')

	//

}

Insights.prototype.Momentum = function(){
}

Insights.prototype.Trends = function(history){
	var dayTrend = 0, //slope of the day's peaks/highs vs the slope of the day's valleys/lows
		currentTrend = 0, //current price vs the last high or low 
		peaks = [],
		valleys = [];

	var findPeaks = function(){
		//(a[n] > a[n - 1] and a[n] > a[n + 1])
		history.forEach( function(trade, i) {
			//log.info(history[i].price ,i);

			//skip the first and last point
			if(i == 0 || i == history.length-1) return;

			if( (history[i].price > history[i-1].price) && (history[i].price > history[i+1].price) ){
				log.info(i, history[i].price)
				peaks.push[i];
			}			
		});

	},
	findValleys = function(){
		//(a[n] < a[n - 1] and a[n] < a[n + 1])
		history.forEach( function(trade, i) {
			//skip the first and last point
			if(i == 0 || i == history.length-1) return;

			if( (history[i].price < history[i-1].price) && (history[i].price < history[i+1].price) ){
				log.info(i, history[i].price)
				valleys.push[i];
			}			
		});
	}

	findPeaks();
	findValleys();
}

module.exports = Insights;







