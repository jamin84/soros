/*

	Config

*/

var config = {};

config.debug = true; // for additional logging / debugging

config.market = {
  exchange: 'cryptsy',
  fee: '.00245',
  key: '5b0f487b91cb055204306240a9699885b9ffb25e',
  secret: '39975ca0714115c80914e8ad6cd3f8a80026e508034cf6b1783d80dba7c6d00692c1e667885f38d3',
  currency: 'BTC',
  asset: 'DRK'
}

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