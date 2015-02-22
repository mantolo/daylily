var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var MessageConstants = require('../constants/messageConstants');
var hubConstants = require('../constants/hubConstants');
var assign = require('object-assign');
var CHANGE_EVENT = 'localChanged';

var localStore = window.localStorage || {};

var authKey = 'auth';

var LocalStore = assign({}, EventEmitter.prototype, {
	getAll: function(){
		return localStore;
	},

	getAuth: function(){
		return JSON.parse(localStore.getItem(authKey));
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
		var action = payload.action;
		switch(action.actionType){
			case hubConstants.HUB_YOU_ARE:
				localStore.setItem(authKey, JSON.stringify(action) );
				LocalStore.emitChange();
				break;
		}

		return true; // No errors. Needed by promise in Dispatcher.
	})

});

module.exports = LocalStore;