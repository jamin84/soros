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
	this.calculateSpread();
}

Insights.prototype.calculateSpread = function(){
	log.info('Calculating spread...');

	var sell = platform.market.orderbook['sellorders'][0].price+.00000001,
		buy = platform.market.orderbook['buyorders'][0].price+.00000001;
	var spread = (sell-buy).toFixed(8);
	log.info('\t', 'Spread:', spread)
	log.info('\t', 'To buy price: ', buy, ' | To sell price: ', sell );

	this.calculateProfit(platform.market.orderbook['buyorders'][0].price, platform.market.orderbook['sellorders'][0].price, .10);//platform.user.getFund('BTC').amount

/*
	var callback = function(err, orderbook){
		log.info('Calculating spread...');

		var sell = orderbook['sellorders'][0].price+.00000001,
			buy = orderbook['buyorders'][0].price+.00000001;
		var spread = (sell-buy).toFixed(8);
		log.info('\t', 'Spread:', spread)
		log.info('\t', 'To buy price: ', buy, ' | To sell price: ', sell );

		this.calculateProfit(orderbook['buyorders'][0].price, orderbook['sellorders'][0].price, .10);//platform.user.getFund('BTC').amount
	}
	platform.market.getOrderbook(_.bind(callback, this));
	*/

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
	log.info('\t','Profit (If buying with',currency,this.currency,' gives you',shares,'shares) ', profit);
	log.info('\t','Threshold of',this.strategy.threshold,' is',(profit>=this.strategy.threshold?"":"not"),'met');

	this.wallCheck();
	
	//run throught the models to see where the profit margin lies

	this.Projections();

	this.Trends();
	

	//correlate the 3 Buy Order spots with 3 Sell Order spots

	//shift to accomodate any walls

	//find likelihood of each tolerance being accepted given the amount of BTC being traded. More BTC "in the way" means less likelihood

	//find momentum

	//find trend

	/*
		startTrading(): 

		reassess walls,
		reassess with new orders,
		find optimal price within accepted tolerance range given a set of orders (not every Order is sequential, so maximize the trade price given the range of existing orders),
		execute trade given optimal price

	*/

}

Insights.prototype.Projections = function(callback){
	log.info('Running models...');

	//find 3 (conservative, moderate, aggressive) Sell Order points assuming the top Buy Order spot
	var topBuy = platform.market.orderbook['buyorders'][0].price+.00000001;
	log.info('Topbuy Model - Buy Price(adj):',topBuy);

	this.strategy.models.forEach(function(model, i){
		max = model.profitMax,
		sell = ((topBuy*max)+topBuy).toFixed(8);
		log.info('\t',model.type,'max:',max*100,'% | price:', sell);
	});

	//find 3 (conservative, moderate, aggressive) Buy Order points assuming top Sell Order spot
	var topSell = platform.market.orderbook['sellorders'][0].price-.00000001;
	log.info('TopSell Model - Sell Price(adj):',topSell);

	this.strategy.models.forEach(function(model, i){
		max = model.profitMax,
		buy = (topSell-(topSell*max)).toFixed(8);
		log.info('\t',model.type,'max:',max*100,'% | price:', buy);
	});

	//callback();
}

Insights.prototype.Momentum = function(){
}

Insights.prototype.Trends = function(history){
	log.info('Assessing Trends...');

	var history = platform.market.history,
		dayTrend = 0, //slope of the day's peaks/highs vs the slope of the day's valleys/lows
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
				if(i == 1 || i == history.length-2) return;
				if( (history[i].price > history[i-2].price) && (history[i].price > history[i+2].price) ){					
					if( (history[i].price > history[i-3].price) && (history[i].price > history[i+3].price) ){
						if(i == 2 || i == history.length-3) return;
						//log.info(i, history[i].price)
						peaks.push({'id':i,'datetime':trade.datetime, 'price':trade.price});
					}
				}
			}			
		});
		platform.market.peaks = peaks;//.sort(function(a,b){return parseFloat(a.price)-parseFloat(b.price)});

		/*
		We'll get you eventually you recursive fucking devil

		function peakFinder(arr, left, right){
			
			var mid = parseFloat((left+(right-left)/2).toFixed(0));

	log.debug(left, mid, right);
	log.debug(arr[mid-3].price,arr[mid-2].price,arr[mid-1].price,'|', arr[mid].price,'|', arr[mid+1].price,arr[mid+2].price,arr[mid+3].price);

			if( (arr[mid-1].price < arr[mid].price) && (arr[mid+1].price < arr[mid].price) ){
				if( (arr[mid-2].price < arr[mid].price) && (arr[mid+2].price < arr[mid].price) )
					if( (arr[mid-3].price < arr[mid].price) && (arr[mid+3].price < arr[mid].price) )
						return mid;
			}
			else if( arr[mid-1].price > arr[mid].price){
				return peakFinder(arr, left, (mid-1));
			}
			else return peakFinder(arr, (mid+1), right);

		}
		peakFinder(history, 0, history.length-1);
		*/
	},
	findValleys = function(){
		//(a[n] < a[n - 1] and a[n] < a[n + 1])
		history.forEach( function(trade, i) {
			//skip the first and last point
			if(i == 0 || i == history.length-1) return;

			if( (history[i].price < history[i-1].price) && (history[i].price < history[i+1].price) ){
				if(i == 1 || i == history.length-2) return;
				if( (history[i].price < history[i-2].price) && (history[i].price < history[i+2].price) ){
					if( (history[i].price < history[i-2].price) && (history[i].price < history[i+2].price) ){
						if(i == 2 || i == history.length-3) return;
						//log.info(i, history[i].price)
						valleys.push({'id':i,'datetime':trade.datetime, 'price':trade.price});
					}
				}
			}			
		});
		platform.market.valleys = valleys;//.sort(function(a,b){return parseFloat(a.price)-parseFloat(b.price)})
	},
	findSlope = function(){
		/*
		//compare the current price to the highest or lowest point for Slope 1
		var currentPrice = platform.market.history[0].price, //x = history.length, y = price
			highPrice =  platform.market.peaks[0].price,
			lowPrice = platform.market.valleys[0].price;

		//slope = price1-price2/0-timeInMins2
		date1 = new Date(platform.market.history[999].datetime);
		date2 = new Date(platform.market.peaks[0].datetime);
		log.debug( date1.getTime()-date2.getTime());
		timeDiff = ((date1.getTime()-date2.getTime())/3600000).toFixed(2);//time difference in hours

		log.debug(date1,'',date2);
		log.debug(timeDiff);
		var slope1 = (highPrice-currentPrice)/(timeDiff);
		log.debug(slope1);

		//compare the current price to the most recent highest and lowest Slope 2
		*/

		//find slope of all the peaks

	},
	linearRegression = function(x,y){
		var lr = {};
		var n = y.length;
		var sum_x = 0;
		var sum_y = 0;
		var sum_xy = 0;
		var sum_xx = 0;
		var sum_yy = 0;
		
		for (var i = 0; i < y.length; i++) {
			
			sum_x += x[i];
			sum_y += y[i];
			sum_xy += (x[i]*y[i]);
			sum_xx += (x[i]*x[i]);
			sum_yy += (y[i]*y[i]);
		} 
		
		lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
		lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
		lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
		
		return lr;
	}

	findPeaks();
	findValleys();
	//findSlope();
	//split history into x, y points for regression
	var x =[], y =[], xCoord = 0;

	//combined = platform.market.peaks.concat(platform.market.valleys)

	history.forEach(function(trade, i){
		//compare each trade to the first history datetime, since not all trades happened equadistant from each other
		//get the seconds since the first historical trade and treat as the x-axis. First trade is 0
		if(!i==0)
			xCoord = ((new Date(trade.datetime)).getTime()-(new Date(history[0].datetime)).getTime())/3600000;
		
		x.push(xCoord);
		y.push(trade.price);
	});
	var info=linearRegression(x,y);
	log.debug(info.slope,' | ',info.intercept,' | ',info.r2);
	//log.debug((history[999].price-history[0].price).toFixed(8),'|',(info.slope*((new Date(history[999].datetime)).getTime()-(new Date(history[0].datetime)).getTime())/3600000).toFixed(8));
}

Insights.prototype.wallCheck = function(){
	log.info('Checking for walls...');
	var wallAmount = 1, //in BTC. TODO: What is a more accurate way to diagnose a wall?
		walls = {},
		temp = [];
	platform.market.orderbook['sellorders'].forEach( function(order, i){
		if( order.total > wallAmount){
			//log.info('Sell Wall found. Index: ',i,'| Amount: ',order.total);
			temp.push({'index' : i, 'amount' : order.total});
		}
	});
	platform.market.walls['sell'] = temp;
	temp=[];
	platform.market.orderbook['buyorders'].forEach( function(order, i){
		if( order.total > wallAmount){
			//log.info('Buy Wall found: Index: ',i,'| Amount: ',order.total);
			temp.push({'index' : i, 'amount' : order.total});
		}
	});
	platform.market.walls['buy'] = temp;
}

module.exports = Insights;







