//var stream = require('stream');
//var assign = require('object-assign');
//var AppModule = require('./components/appModule');

//window.appmodule = AppModule;

var React = require('react');
var Daylily = require('./components/daylily.react');
var injectTapEventPlugin = require("react-tap-event-plugin");

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

React.render(
	<Daylily />,
	document.getElementById('app')
);