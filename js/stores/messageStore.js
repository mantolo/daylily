var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var MessageConstants = require('../constants/messageConstants');
var hubConstants = require('../constants/hubConstants');
var assign = require('object-assign');
var CHANGE_EVENT = 'messageChange';

var _messages = {};

var example = {
	mid: {
		from: '',
		to: '',
		room: '',
		mid: '',
		timestamp: '',
		text: ''
	}
};

function modal(){
	return {
		from: '',
		to: '',
		room: '',
		mid: '',
		timestamp: '',
		text: ''
	};
}

/**
 * Create a person
 * @param  @name name of person
 * @param  email email of this person
 * @return {[type]}
 */
function create(from, to, mid, text){
	_messages[mid] = {
		from: from, // userName
		mid: mid,
		to: to, // thread id
		text: text,
		read: false
	};
}

/**
 * destroy person from list
 * @param  {[type]}
 * @return {[type]}
 */
function destroy(id){
	delete _messages[id];
}

function update(id, text, read){
	_messages[id].text = text;
	_messages[id].read = read;
}

var MessageStore = assign({}, EventEmitter.prototype, {
	getAll: function(){
		return _messages;
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
			case hubConstants.HUB_USER_MSG:
				create(action.from, action.to, action.mid, action.text);
				MessageStore.emitChange();
				break;
			case MessageConstants.MSG_UPDATE_BC:
				update(action.id, action,text, action.read);
				MessageStore.emitChange();
				break;
			case MessageConstants.MSG_REMOVE_BC:
				destroy(action.id);
				MessageStore.emitChange();
				break;
		}

		return true; // No errors. Needed by promise in Dispatcher.
	})

});

module.exports = MessageStore;