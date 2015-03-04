/*
	
	Market Manager

*/
var _ = require('lodash'),
	moment = require('moment'),
	log = require('./log.js'),
	utc = moment.utc;

var Manager = function(){
	_.bindAll(this);

	this.orderbook = {};
	this.walls = {}

	//init and get data when invoked
}

Manager.prototype.getData = function(){
	//get orderbook
	//get history
}

Manager.prototype.startTrading = function(){

}

module.exports = Manager;