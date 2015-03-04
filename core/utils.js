/*

	Utils

*/

var _ = require('lodash'),
	path = require('path'),
	_config = false;

var utils = {
  getConfig: function() {
    if(_config)
      return _config;

    var configFile = path.resolve(utils.getArgument('config') || __dirname + '/../config.js');
    _config = require(configFile);
    _config.resolvedLocation = configFile;
    return _config;
  },
  getArgument: function(argument) {
    var ret;
    _.each(process.argv, function(arg) {
      // check if it's a configurable
      var pos = arg.indexOf(argument + '=');
      if(pos !== -1)
        ret = arg.substr(argument.length + 1);
      // check if it's a toggle
      pos = arg.indexOf('-' + argument);
      if(pos !== -1 && !ret)
        ret = true;
    });
    return ret;
  }
}

module.exports = utils;