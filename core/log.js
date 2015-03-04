/*

  Lightweight logger, print everything that is send to error, warn
  and messages to stdout (the terminal). If config.debug is set in config
  also print out everything send to debug.

*/

var moment = require('moment'),
       fmt = require('util').format,
         _ = require('lodash'),
     debug = require('./utils').getConfig().debug;

var Log = function() {
  _.bindAll(this);
};

Log.prototype = {
  _write: function(method, args, name) {
    if(!name)
      name = method.toUpperCase();

    var message = moment().format('YYYY-MM-DD HH:mm:ss');
    message += ' (' + name + '):\t';
    message += fmt.apply(null, args);

    console[method](message);
  },
  error: function() {
    this._write('error', arguments);
  },
  warn: function() {
    this._write('warn', arguments);
  },
  info: function() {
    this._write('info', arguments);
  }
}

if(debug)
  Log.prototype.debug = function() {
    this._write('info', arguments, 'DEBUG');  
  }
else
  Log.prototype.debug = function() {};

module.exports = new Log;