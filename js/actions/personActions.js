var AppDispatcher = require('../dispatcher/AppDispatcher');
var PersonConstants = require('../constants/personConstants');

var PersonActions = {
	select: function(uid){
		AppDispatcher.handleViewAction({
			actionType: PersonConstants.PERSON_SELECT,
			uid: uid
		});
	},

	updateProfilePic: function(){
		AppDispatcher.handleViewAction({
			actionType: PersonConstants.PERSON_UPDATE,
			id: id
		});	
	}
};

module.exports = PersonActions;