var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var PersonConstants = require('../constants/personConstants');
var HubConstants = require('../constants/hubConstants');
var assign = require('object-assign');


var CHANGE_EVENT = 'personchange'; // Thing that this js interested to know 
var _persons = {}; // list of person item
var _me = {};
var _selected = 'all';

/**
 * Create a person
 * @param  @name name of person
 * @param  email email of this person
 * @return {[type]}
 */
function create(uid, name, since){
	console.log('uid', uid, name);
	_persons[uid] = {
		uid: uid,
		name: name,
		email: '',
		onlineSince: since,
		picture: false
	};
}

function setMe(uid, name, email, since){	
	_me.uid = uid;
	_me.name= name;
	_me.email = email;
	_me.onlineSince = since;
	_me.picture = false;
}

function update(uid, name, email, picture){
	_persons[uid].name = name || _persons[uid].name;
	_persons[uid].email = email || _persons[uid].email;
	_persons[uid].picture = picture || _persons[uid].picture;
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

	getMe: function(){
		return _me;
	},

	getSelected: function(){
		return _selected;
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
			case HubConstants.HUB_YOU_ARE:
				setMe(action.uid, action.name);
				PersonStore.emitChange();
				break;
			case HubConstants.HUB_USER_ON:	
				create(action.uid, action.name, action.onlineSince);
				PersonStore.emitChange();			
				break;
			case HubConstants.HUB_USER_PROFILE_UPDATE:
				update(action.uid, action.name, action.email, action.picture);
				PersonStore.emitChange();
				break;
			case HubConstants.HUB_USER_OFF:
				destroy(action.uid);
				PersonStore.emitChange();
				break;
			case HubConstants.HUB_USER_SYNC:
				for(var i = 0; i < action.users.length; i++){
					var user = action.users[i];
					create(user.uid, user.name, user.onlineSince);
				}
				PersonStore.emitChange();
				break;
			case HubConstants.HUB_DISCONNECT:
				_persons = {};
				_selected = 'all';
				break;	
			case PersonConstants.PERSON_SELECT:
				_selected = action.uid;
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