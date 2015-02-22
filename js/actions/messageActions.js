
var AppDispatcher = require('../dispatcher/AppDispatcher');
var MessageConstants = require('../constants/messageConstants');

var MessageActions = {
	createBroadcast: function(text){
		AppDispatcher.handleViewAction({
			actionType: MessageConstants.MSG_ADD_BC,
			text: text,
		});
	},
	destroyBroadcast: function(id){
		AppDispatcher.handleViewAction({
			actionType: MessageConstants.MSG_REMOVE_BC,
			id: id
		});
	},

	updateBroadcast: function(id, text, read){
		AppDispatcher.handleViewAction({
			actionType: MessageConstants.MSG_UPDATE_BC,
			id: id
		});	
	}
};

module.exports = MessageActions;