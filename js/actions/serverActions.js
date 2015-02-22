var AppDispatcher = require('../dispatcher/AppDispatcher');
var constants = require('../constants/hubConstants');
var network = window.io();
var ServerActions = { 
	// tell server events
	iAm: function(uid, name){
		network.emit(constants.HUB_I_AM, {uid: uid, name: name});
	},

	msg: function(to, msg){
		network.emit(constants.HUB_I_SEND_MSG, { to: to, text: msg });
	},

	editMsg: function(to, mid, msg){
		network.emit(constants.HUB_I_EDIT_MSG, { to: to, mid:mid, msg: msg });
	},

	putFile: function(arrayBuffer){
		network.emit(constants.HUB_I_PUT_FILE, { buffer: arrayBuffer});
	}
};


// from server
function whoAreYou(){
	AppDispatcher.handleServerAction({
		actionType: constants.HUB_WHO_ARE_YOU
	});
}

function youAre(data){
	data.actionType = constants.HUB_YOU_ARE;
	AppDispatcher.handleServerAction(data);
}

function news(data){
	data.actionType = constants.HUB_SERVER_NEWS;
	AppDispatcher.handleServerAction(data);
}

function userOn(data){
	data.actionType = constants.HUB_USER_ON;
	AppDispatcher.handleServerAction(data);
}

function userOff(data){
	data.actionType = constants.HUB_USER_OFF;		
	AppDispatcher.handleServerAction(data);
}

function userMsg(data, from, to, mid, msg){
	/// to = thread id;
	data.actionType = constants.HUB_USER_MSG;		
	AppDispatcher.handleServerAction(data);
}

function userEditMsg(data, from, to, mid, msg){
	data.actionType = constants.HUB_USER_EDIT_MSG;
	AppDispatcher.handleServerAction(data);
}

function userFile(data, from, to, link){
	data.actionType = constants.HUB_USER_FILE_TRANSFER;
	AppDispatcher.handleServerAction(data);
}

function userUpdate(data){
	data.actionType = constants.HUB_USER_PROFILE_UPDATE;
	AppDispatcher.handleServerAction(data);
}

function userSync(data){
	data.actionType = constants.HUB_USER_SYNC;
	AppDispatcher.handleServerAction(data);
}

function ondisconnect(){
	console.log('Disconnected');
	AppDispatcher.handleServerAction({ actionType: constants.HUB_DISCONNECT});
}

network.on('connect', function(){
	network.on(constants.HUB_WHO_ARE_YOU, 			whoAreYou);
	network.on(constants.HUB_YOU_ARE,	 			youAre);
	network.on(constants.HUB_SERVER_NEWS, 			news);
	network.on(constants.HUB_USER_ON, 				userOn);
	network.on(constants.HUB_USER_OFF, 				userOff);
	network.on(constants.HUB_USER_SYNC,				userSync);
	network.on(constants.HUB_USER_MSG, 				userMsg);	
	network.on(constants.HUB_USER_EDIT_MSG, 		userEditMsg);
	network.on(constants.HUB_USER_FILE_TRANSFER, 	userFile);
	network.on(constants.HUB_USER_PROFILE_UPDATE,	userUpdate);
});

network.on('disconnect', ondisconnect);

module.exports = ServerActions;