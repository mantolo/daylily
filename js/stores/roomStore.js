var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var hubConstants = require('../constants/hubConstants');
var roomConstants = require('../constants/roomConstants');
var assign = require('object-assign');
var CHANGE_EVENT = 'roomChanged';
var utils = require('../core/utils');
var findIndex = require('lodash/array/findIndex');


/// must at least has one object: add new
var _rooms = [
	{ payload: 'room:' + utils.guid(), text: 'Central', number: '2', iconClassName: 'icon-bubble2', className: 'h5team' },
	{ payload: 'room:' + utils.guid(), text: 'H5', number: '2', iconClassName: 'icon-html52', className: 'h5team' },
	{ payload: 'room:' + utils.guid(), text: 'LiveDealer', number: '3', iconClassName: 'icon-lanyrd', className: 'livedealerteam'},
	{ payload: 'room:' + utils.guid(), text: 'Flash', number: '4', iconClassName: 'icon-font', className: 'flashteam'},
	{ payload: 'room:' + utils.guid(), text: 'Graphic', number: '4', iconClassName: 'icon-paint-format', className: 'graphicteam'},
	{ payload: 'room:' + utils.guid(), text: 'QA', number: '4', iconClassName: 'icon-checkmark', className: 'qateam'},
	{ payload: 'new', text: 'Add New', iconClassName: 'icon-plus' }
];

var _selected = _rooms[0].payload;

var toIndex = (function(){
	var rid;
	function cb(v){
		return v.payload === rid;
	};

	return function(roomID){
		rid = roomID;
		return findIndex(_rooms, cb);
	};
}());

function append(label){
	var addNew = _rooms.pop();
	var newItem = {
		payload: 'room:' + utils.guid(),
		text: label,
		number: '',
		iconClassName: ''
	};
	_rooms.push(newItem);
	_rooms.push(addNew);
	return newItem;
}

var RoomStore = assign({}, EventEmitter.prototype, {
	getAll: function(){
		return _rooms;
	},

	getSelected: function(){
		return _rooms[toIndex(_selected)];
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
				break;

			case roomConstants.ROOM_ADD:
				var newItem = append(action.name);
				_selected = newItem.payload;
				RoomStore.emitChange();
				break;

			case roomConstants.ROOM_SELECT:
				_selected = action.roomid;
				RoomStore.emitChange();
				break;
		}

		return true; // No errors. Needed by promise in Dispatcher.
	})

});

module.exports = RoomStore;