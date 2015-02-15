/**
 * Extends nodejs's event emitter functionality
 */
// Events: http://nodejs.org/api/events.html
var EventEmitter = require('events').EventEmitter;
var utils = require ('../core/utils.js');
var assign = require('object-assign');
var listenerCount = 0;

var emitter = assign(new EventEmitter(), {
	addChangeListener: function(callback){
		this.addEventListener();
	},
	/**
	 * Emit event in async way, be reminded, listener timing is not guaranteed. use it wisely
	 * @return {[type]} [description]
	 */
	emitAsync: function(){
		var that = this,
		params = utils.sortArgs(arguments);
		setTimeout(function(){
			that.emit.apply(that, params[0]);	
		}, 0);		
	}
});
 
// test listener method
// emitter.on('newListener', function(){
// 	listenerCount+=1;
// 	console.log('Event.js: listener added, currently(' + listenerCount + ')');
// });
// emitter.on('removeListener', function(){
// 	listenerCount-=1;
// 	console.log('Event.js: listener added, currently(' + listenerCount + ')');
// });

module.exports = emitter;