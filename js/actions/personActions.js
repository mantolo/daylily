var AppDispatcher = require('../dispatcher/AppDispatcher');
var PersonConstants = require('../constants/personConstants');

var PersonActions = {
	create: function(name, email){
		AppDispatcher.handleViewAction({
			actionType: PersonConstants.PERSON_CREATE,
			name: name,
			email: email
		});
	},
	destroy: function(id){
		AppDispatcher.handleViewAction({
			actionType: PersonConstants.PERSON_DESTROY,
			id: id
		});
	},

	updateProfilePic: function(){
		AppDispatcher.handleViewAction({
			actionType: PersonConstants.PERSON_DESTROY,
			id: id
		});	
	}
};

module.exports = PersonActions;