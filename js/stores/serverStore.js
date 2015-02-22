/**
 * So call store, 
 * @type {[type]}
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var MessageConstants = require('../constants/messageConstants');
var hubConstants = require('../constants/hubConstants');
var assign = require('object-assign');
var CHANGE_EVENT = 'serverChange';

var _serverMsg = '';

/**
 * Create a person
 * @param  @name name of person
 * @param  email email of this person
 * @return {[type]}
 */
function set(item){
	_serverMsg = item;
}

function get(){
	return _serverMsg;
}

var ServerStore = assign({}, EventEmitter.prototype, {
	getLast: function(){
		return _serverMsg;
	},

	emitChange: function(){
		this.emit(CHANGE_EVENT);
	},

	/**
	 * Register callback to dispatcher
	 * @param {Function}
	 */
	addChangeListener: function(callback){
		this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback){
		this.removeListener(CHANGE_EVENT, callback);
	},

	dispatcherIndex: AppDispatcher.register(function(payload){
		if (payload.source !== 'SERVER_ACTION'){
			return true;
		}
		var action = payload.action;		
		console.log(action.actionType);
		switch(action.actionType){
			case hubConstants.HUB_WHO_ARE_YOU:
				set(hubConstants.HUB_WHO_ARE_YOU);
				ServerStore.emitChange();
				break;
		}

		return true; // No errors. Needed by promise in Dispatcher.
	})

});

module.exports = ServerStore;