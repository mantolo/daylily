var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var MessageConstants = require('../constants/messageConstants');
var assign = require('object-assign');
var CHANGE_EVENT = 'messageChange';

var _messages = {}

/**
 * Create a person
 * @param  @name name of person
 * @param  email email of this person
 * @return {[type]}
 */
function create(text){
	var id = Date.now();
	_messages[id] = {
		id: id,
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
			case MessageConstants.MSG_ADD_BC:
				create(action.text);
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