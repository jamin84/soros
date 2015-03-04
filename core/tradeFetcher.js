// 
// The fetcher is responsible for fetching new 
// trades at the exchange. It will emit `new trades`
// events as soon as it fetches new data.
// 
// How often this is depends on:
// 
//  - The capability of the exchange (to provide
//  historical data).
//  - The amount of data we get per fetch.
//  - The interval at which we need new data.

var _ = require('lodash');
var moment = require('moment');
var utc = moment.utc;
var log = require('./log.js');

var utils = require('./utils');
var config = utils.getConfig();

var exchangeChecker = require('./exchangeChecker');

var provider = config.watch.exchange.toLowerCase();
var DataProvider = require('../exchanges/' + provider);

var Fetcher = function() {
  _.bindAll(this);

  // Create a public dataProvider object which can retrieve live 
  // trade information from an exchange.

  this.watcher = new DataProvider(config.watch);
  this.lastFetch = false;

  this.exchange = exchangeChecker.settings(config.watch);

  this.pair = [
    config.watch.asset,
    config.watch.currency
  ].join('/');

  // console.log(config);
  log.info('Starting to watch the market:',
    this.exchange.name,
    this.pair
  );

  if(!this.exchange.providesHistory) {
    this.on('new trades', function(a) {
      log.debug(
        'Fetched',
        _.size(a.all),
        'new trades, from',
        a.start.format('YYYY-MM-DD HH:mm:ss UTC'),
        'to',
        a.end.format('YYYY-MM-DD HH:mm:ss UTC')
      );
    });  
  }
}

var Utils = require('utils');
var EventEmitter = require('events').EventEmitter;
Utils.inherits(Fetcher, EventEmitter);

Fetcher.prototype.start = function() {
  // if this exchange does not support historical trades
  // start fetching.
  if(!this.exchange.providesHistory)
    this.fetch(false);
  else
    console.log(
      'either start looping right away (`since`)',
      'or first determine starting point dynamically'
    );
}

// Set the first & last trade date and set the
// timespan between them.
Fetcher.prototype.setFetchMeta = function(trades) {
  this.firstTrade = _.first(trades); 
  this.first = moment.unix(this.firstTrade.date).utc();
  this.lastTrade = _.last(trades);
  this.last = moment.unix(this.lastTrade.date).utc();

  this.fetchTimespan = utils.calculateTimespan(this.first, this.last);
}

// *This method is only used if this exchange does not support
// historical data.*
// 
// we need to keep polling exchange because we cannot
// access older data. We need to calculate how often we
// we should poll.
// 
// Returns amount of ms to wait for until next fetch.
Fetcher.prototype.calculateNextFetch = function(trades) {

  // for now just refetch every minute
  return this.fetchAfter = utils.minToMs(0.8);


  // not used at this moment

  // if the timespan per fetch is fixed at this exchange,
  // just return that number.
  if(this.exchange.fetchTimespan) {
    // todo: if the interval doesn't go in
    // sync with exchange fetchTimes we
    // need to calculate overlapping times.
    // 
    // eg: if we can fetch every 60 min but user
    // interval is at 80, we would also need to
    // fetch again at 80 min.
    var min = _.min([
      this.exchange.fetchTimespan,
      config.tradingAdvisor.candleSize
    ]);
    this.fetchAfter = utils.minToMs(min);
    // debugging bitstamp
    this.fetchAfter = utils.minToMs(1);
    return;  
  }
    
  var minimalInterval = utils.minToMs(config.tradingAdvisor.candleSize);

  // if we got the last 100 seconds of trades last
  // time make sure we fetch at least in 55 seconds
  // again.
  var safeTreshold = 0.2;
  var defaultFetchTime = utils.minToMs(1);

  if(this.fetchTimespan * safeTreshold > minimalInterval)
    // If the oldest trade in a fetch call > candle size
    // we can just use candle size.
    var fetchAfter = minimalInterval;
  else if(this.fetchTimespan * safeTreshold < defaultFetchTime)
    // If the oldest trade in a fetch call < default time
    // we fetch at default time.
    var fetchAfter = defaultFetchTime;
  else
    // use a safe fetch time to determine
    var fetchAfter = this.fetchTimespan * safeTreshold;

  this.fetchAfter = fetchAfter;
}

Fetcher.prototype.scheduleNextFetch = function() {
  setTimeout(this.fetch, this.fetchAfter);
}

Fetcher.prototype.fetch = function(since) {
  log.debug('Requested', this.pair ,'trade data from', this.exchange.name, '...');
  this.watcher.getTrades(since, this.processTrades, false);
  // this.spoofTrades();
}

Fetcher.prototype.spoofTrades = function() {
  var fs = require('fs');
  trades = JSON.parse( fs.readFileSync('./a3.json', 'utf8') );
  this.processTrades(false, trades);

  setTimeout(this.spoofTrades2, 5000);
}

Fetcher.prototype.spoofTrades2 = function() {
  var fs = require('fs');
  trades = JSON.parse( fs.readFileSync('./a4.json', 'utf8') );
  this.processTrades(false, trades);
}

Fetcher.prototype.processTrades = function(err, trades) {
  if(err)
    throw err;

  // Make sure we have trades to process
  if(_.isEmpty(trades)) {
    log.debug('Trade fetch came back empty. Rescheduling...');
    this.calculateNextFetch();
    this.scheduleNextFetch();
    return;
  }

  this.setFetchMeta(trades);
  this.calculateNextFetch();

  // schedule next fetch
  if(!this.exchange.providesHistory)
    this.scheduleNextFetch();

  this.emit('new trades', {
    timespan: this.fetchTimespan,
    start: this.first,
    first: this.firstTrade,
    end: this.last,
    last: this.lastTrade,
    all: trades,
    nextIn: this.fetchAfter
  });
}


module.exports = Fetcher;