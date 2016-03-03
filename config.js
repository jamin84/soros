/*

	Config

*/

var config = {};

config.debug = true; // for additional logging / debugging

//------------------------------dbSettings
config.mongoConnectionString = 'localhost/soros';

config.market = {
  exchange: 'bitstamp',
  fee: '.0025',
  key: '3y5J4qEP0whdK2po66Dc4cl9GGqPlIBi',
  secret: 'rxDiYCEREQSqtlhY0yoZxczNf11NYDjA',
  currency: 'BTC'
}
config.exchangeSettings = {
  exchange: 'bitstamp',
  // Options: (bitstamp, kraken, btce)
  currencyPair: {pair: 'XBTUSD', asset: 'XBT', currency: 'USD'},
  // For Bitstamp just use {pair: 'XBTUSD', asset: 'XBT', currency: 'USD'}
  // For Kraken look up the currency pairs in their API: https://api.kraken.com/0/public/AssetPairs
  // Kraken Example: {pair: 'XXBTZEUR', asset: 'XXBT', currency: 'ZEUR'}
  // For BTC-E look up the currency pairs in their API: https://btc-e.com/api/3/info
  // BTC-E Example: {pair: 'BTC_USD', asset: 'BTC', currency: 'USD'}
  tradingReserveAsset: 0,
  // Enter an amount of "asset" you would like to freeze (not trade).
  tradingReserveCurrency: 0,
  // Enter an amount of "currency" you would like to freeze (not trade).
  slippagePercentage: 0.1
  // Percentage to sell below and buy above the market.
};

/*
	WHAT TYPE OF BOT: determines profit outlook
	
		MODELS:
		1. Conservative
			<= 5%
		2. Moderate
			<= 10%
		3. Aggressive
			> 10%
*/

config.strategy = {
	'models' : [{
		'type' : 'conservative',
		'profitMin' : .01,
		'profitMax' : .05
	},
	{
		'type' : 'moderate',
		'profitMin' : .0501,
		'profitMax' : .1
	},
	{
		'type' : 'aggressive',
		'profitMin' : .1001,
		'profitMax' : .15
	}],
	'threshold' : .0001
}

module.exports = config;