var network = window.io();
var assign = require('object-assign');
var Event = require('./event');
var constants = require('../constants/hubConstants');

var pageSocket = false;
var onusermsg = false;
var onuserbroadcast = false;
var onuseronline = false;
var onuseroffline = false;
var onnews = false;

function ondisconnect(){
	pageSocket = false;
}

function getSocket(){
	return pageSocket;
}

network.on('connect', function(){
	network.on(constants.HUB_SERVER_NEWS, function(news){
		if(typeof onnews === 'function'){
			onnews(news);
		}
	});

	network.on(constants.HUB_USER_ONLINE, function(){
		if(typeof onuseronline === 'function'){
			onuseronline();
		}
	});

	network.on(constants.HUB_USER_OFFLINE, function(){
		if(typeof onuseroffline === 'function'){
			onuseroffline();
		}
	});

	network.on(constants.HUB_USER_OTO_MSG, function(msg){
		if(typeof onusermsg === 'function'){
			onusermsg(msg);
		}
	});

	network.on(constants.HUB_USER_BROADCAST, function(msg){
		if(typeof onuserbroadcast === 'function'){
			onuserbroadcast(msg);
		}
	});

	network.on('disconnect', ondisconnect);
});

network.getSocket = getSocket;
network.setCBBroadcast = function(cb){ onuserbroadcast = cb; };
network.setCBMessage = function(cb){ onusermsg = cb; };
network.setCBOnline = function(cb){ onuseronline = cb; };
network.setCBOffline = function(cb){ onuseroffline = cb; };
network.setCBNews = function(cb){ onnews = cb; };

module.exports = network;