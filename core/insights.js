/*
	
	Insights

*/


var utils = require('./utils'),
	config = utils.getConfig(),
	provider = config.market.exchange.toLowerCase(),
	DataProvider = require('../exchanges/' + provider);

var Insights = function(){
  _.bindAll(this);

  this.market = new DataProvider(config.market);

  this.momentum = 0;
  this.trend = 0;
  this.historyDay = [];

}

Insights.prototype.start = function(){
	/*
		Cryptsy v2 delivers tradeHistory in increments of 100 which is too low to analyze.
		As a result we have to piece together the last 24hrs.
	*/
	
	//this.getHistoryDay();
	//this.getHistory(false);

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
	

	log.info('test', orderbook);
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







