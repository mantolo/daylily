var React = require('react');
var inputText;
var inputTextId = 'm';
var nameTextId = 'n';
var nameText;
var btnSend;
var btnSendId = 'btnSend';
var form;
var formId = 'sendForm';

var startedSince = new Date();
var constants = require('../constants/hubConstants');
var MessageStore = require('../stores/messageStore');
var PersonStore = require('../stores/personStore');
var ServerStore = require('../stores/serverStore');
var LocalStore = require('../stores/localStore');
var RoomStore = require('../stores/roomStore');

var PersonList = require('./personlist.react.js');
var RoomList = require('./roomlist.react.js');
var map = require('lodash/collection/map');
var serverActions = require('../actions/serverActions');
var roomActions = require('../actions/roomActions');

// Material UI
var mui = require('material-ui');
var LeftNav = mui.LeftNav;
var Paper = mui.Paper;
var Toolbar = mui.Toolbar;
var ToolbarGroup = mui.ToolbarGroup;
var Menu = mui.Menu ;
var FontIcon = mui.FontIcon;
var Dialog = mui.Dialog;
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;
var TextField = mui.TextField;
var IconButton = mui.IconButton;
var FloatingActionButton = mui.FloatingActionButton;
var Snackbar = mui.Snackbar;
var DropDownIcon = mui.DropDownIcon;


function sendmsg(){
	if(!inputText.value){ return; }
	serverActions.msg(PersonStore.getSelected(), inputText.value);	
	inputText.value = '';
}


function onnamechange(){
	var store = LocalStore.getAuth();
	var text = nameText.value || '無名氏';
	if(store){
		serverActions.iAm(store.uid, text);
	} else {
		serverActions.iAm('', text);
	}
}

var getMessages = (function(){
	var cb = function(v){
		return (<Paper zDepth={1} key={v.mid}>{v.from}: {v.text}</Paper>);
	};
	return function(items){
		var output = map(items, cb);
		return output; 
	};
}());

var Daylily = React.createClass({
	onRoomAdd: (function(){
		// start cross functions area ~
		var roomName = '';
		var that;
		var actions;
		var addDialogTitle = '新房叫乜名好呢?';

		function handleSubmit(){
	    	roomActions.add(roomName);
	    	that.refs.dialog.dismiss();
	    }
		function btnCancel(onclick){ return (<FlatButton key="1" label="Cancel" secondary={true} onClick={onclick} />); }
		function btnSubmit(onclick){ return (<FlatButton key="2" label="Submit" primary={true} onClick={onclick} />); }
		function handleInputChange(e){	roomName = e.target.value;	}

		// end cross functions area ~
		return function(){		
			that = this;	
			/// create and show dialog to ask user which room gonna use
			actions = actions || [ btnCancel(that.refs.dialog.dismiss), btnSubmit(handleSubmit)];
			this.setState({
				dialogTitle: addDialogTitle,
				customDialogActions: actions,
				dialogContent: <TextField hintText="e.g. New chat!" floatingLabelText="Room Name" defaultValue="" onChange={handleInputChange} />
			});
			this.refs.dialog.show();				
		}
	}()),

	onRoomChange: function(){ this.setState({ rooms: RoomStore.getAll(), selectedRoom: RoomStore.getSelected() }); },
	onMessageChange: function(){ this.setState({ messages: MessageStore.getAll()});	},
	onPersonChange: function(){ this.setState({ me: PersonStore.getMe(), persons: PersonStore.getAll() }); },
	onServerChange: function(){},

	//
	// =========================================
	//
	//
	//		Initial States
	//		
	//
	// =========================================
	//
	getInitialState: function(){
		return {
			me: PersonStore.getMe(),
			persons: PersonStore.getAll(),
			messages: MessageStore.getAll(),
			rooms: RoomStore.getAll(),
			selectedRoom: RoomStore.getSelected(),
			customDialogActions: [],
			dialogTitle: '',
			dialogContent: ''
		};
	},

	componentDidMount: function(){
		var that = this;
		//inputText = document.getElementById(inputTextId);
		//nameText = document.getElementById(nameTextId);
		//btnSend = document.getElementById(btnSendId);		
		//nameText.oninput = onnamechange;
		// inputText.onkeyup = function(e){
		// 	if(e.keyCode === 13){
		// 		sendmsg();
		// 	}
		// };
		// btnSend.onclick = sendmsg;

		MessageStore.addChangeListener(this.onMessageChange);
		RoomStore.addChangeListener(this.onRoomChange);
		PersonStore.addChangeListener(this.onPersonChange);

		var store = LocalStore.getAuth();
		if(store){
			serverActions.iAm(store.uid, store.name);
			//nameText.value = store.name;	
		}		
	},

	componentWillUnmount: function(){
		inputText = false;		
		nameText.onchange = null;
		nameText = false;	
		MessageStore.removeChangeListener(this.onMessageChange);
		RoomStore.removeChangeListener(this.onRoomChange);
	},

	_renderToolBar: function(){
		var items = [  { payload: '1', text: 'Notify?'}, { payload: '2', text: 'More Info'}];
		return (<Toolbar className="container" >
					<ToolbarGroup key={0} float="left">
						<h3 className="title">Daylily</h3>
					</ToolbarGroup>
					<ToolbarGroup key={1} float="right">
						<DropDownIcon autoWidth={true} iconClassName="icon-cog" menuItems={items} />
						<span className="mui-toolbar-separator">&nbsp;</span>
    					<RaisedButton label={this.state.me.name || '無名氏'} primary={true} />    					
					</ToolbarGroup>
				</Toolbar>);
	},

	_renderContent: function(){
		var list = getMessages(this.state.messages);
		var style = {
			"minHeight": "448px"
		};
		var styleInput = {
			"minHeight": "100px",
			"minWidth": "200px"
		};
		var styleInputWrap = {
			"padding": "10px",
			"paddingLeft": "50px"
		};

		item = (<Paper key={"mid"} zDepth={0} >{"name"} {"text"} {new Date(Date.now()).toString}</Paper>);
		return (<div className="container" >
					<div className="row" >
						<div className="roomlist col-xs-12 col-sm-3 col-md-2 col-lg-2" >
							<RoomList onRoomAdd={this.onRoomAdd} />
						</div>
						<div className="messagelist col-xs-12 col-sm-7 col-sm-offset-1 col-md-8 col-md-offset-1 col-lg-8 col-lg-offset-1">
							<Paper zDepth={1} >
								<h4>&nbsp;{this.state.selectedRoom.text}</h4>
								<Paper zDepth={1} style={style}>
								</Paper>
								<footer style={styleInputWrap}>
									<TextField style={styleInput}
										className="messageInput"
										hintText="Message Here"
										multiLine={true} />
								</footer>
							</Paper>
						</div>
					</div>								
				</div>);
	},

	_renderDialog: function(){
		return (<Dialog ref="dialog" title={this.state.dialogTitle} actions={this.state.customDialogActions}>
			{this.state.dialogContent}
		</Dialog>);
	},

	_renderFooter: function(){
		return (<footer className="page-footer light-blue darken-3 z-depth-2">          
			      <div className="footer-copyright">
			        <div className="container">
			        	{startedSince.getFullYear()} HTML 5 Team,&nbsp;
			        <a className="grey-text text-lighten-4 right" href="#!">Derivco Hong Kong</a>
			        </div>
			      </div>
			    </footer>);
	},

	//
	// =====================================
	//
	//		RENDER FUNCTION
	//	
	// =====================================
	//
	render: function(){
// <ThreadList id="threads" className="collection flow-text"  />
		return(
			<section>
				{this._renderToolBar()}

				<div className="editBackground">
					<IconButton iconClassName="icon-image" tooltip="Edit Background"/>
				</div>
				{this._renderContent()}
				{this._renderFooter()}
				{this._renderDialog()}
				<Snackbar ref="snackbar" message="Event added to your calendar" action="undo" openOnMount={false}></Snackbar>
			</section>
		);
	}
});

module.exports = Daylily;