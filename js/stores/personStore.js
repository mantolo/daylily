var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var PersonConstants = require('../constants/personConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'personchange'; // Thing that this js interested to know 

var _persons = {}; // list of person item

/**
 * Create a person
 * @param  @name name of person
 * @param  email email of this person
 * @return {[type]}
 */
function create(name, email){
	var id = Date.now();
	_persons[id] = {
		id: id,
		name: name,
		email: email,
		picture: false
	};
}

/**
 * destroy person from list
 * @param  {[type]}
 * @return {[type]}
 */
function destroy(id){
	delete _persons[id];
}

var PersonStore = assign({}, EventEmitter.prototype, {
	getAll: function(){
		return _persons;
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
		this.removeListener(CHANGE_EVENT. callback);
	},

	dispatcherIndex: AppDispatcher.register(function(payload){
		var action = payload.action;
		switch(action.actionType){
			case PersonConstants.PERSON_DESTROY:
				destroy(action.id);
				PersonStore.emitChange();
				break;
			case PersonConstants.PERSON_CREATE:
				create(action.name, action.email);
				PersonStore.emitChange();
				break;
		}

		return true; // No errors. Needed by promise in Dispatcher.
	})

});

module.exports = PersonStore;