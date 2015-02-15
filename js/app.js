//var stream = require('stream');
//var assign = require('object-assign');
//var AppModule = require('./components/appModule');

//window.appmodule = AppModule;

var React = require('react');
var Daylily = require('./components/daylily.react');
var Network = require('./core/network');
var MessageActions = require('./actions/messageActions');

React.render(
	<Daylily />,
	document.getElementById('app')
);

Network.setCBBroadcast(function(msg){
	MessageActions.createBroadcast(msg);
})
