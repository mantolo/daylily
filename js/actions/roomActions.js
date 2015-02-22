var AppDispatcher = require('../dispatcher/AppDispatcher');
var RoomConstants = require('../constants/roomConstants');

var RoomActions = {
	select: function(roomid){
		AppDispatcher.handleViewAction({
			actionType: RoomConstants.ROOM_SELECT,
			roomid: roomid
		});
	},

	add: function(name){
		AppDispatcher.handleViewAction({
			actionType: RoomConstants.ROOM_ADD,
			name: name			
		});
	}
};

module.exports = RoomActions;