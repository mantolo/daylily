var React = require('react');
var map = require('lodash/collection/map');

var roomStore = require('../stores/roomStore');

var roomActions = require('../actions/roomActions');

// Material UI
var mui = require('material-ui');
var TextField = mui.TextField;
var Paper = mui.Paper;
var IconButton = mui.IconButton;
var Menu = mui.Menu;

var RoomList = React.createClass({
	onRoomSelect: function(e, index, data){
		var payload	= data.payload;
		var label = data.text;
		var that = this;
		if (payload === "new"){			
			if(this.props.onRoomAdd) this.props.onRoomAdd(label);
		} else {
			roomActions.select(payload);
		}	
	},

	onRoomChange: function(){ this.setState({ rooms: roomStore.getAll() }); },

	//
	// =================================================
	//
	//
	//			Inital States
	//	
	//
	// =================================================
	//
	getInitialState: function(){
		return {
			rooms: roomStore.getAll()
			//persons: PersonStore.getAll()
		};
	},

	componentDidMount: function(){
		roomStore.addChangeListener(this.onRoomChange);
		//PersonStore.addChangeListener(this.onPersonChange);
	},

	componentWillUnmount: function(){
		roomStore.removeChangeListener(this.onRoomChange);
		//PersonStore.removeChangeListener(this.onPersonChange);
	},

	render: function(){
		return (			
			<Paper>
				<IconButton iconClassName="icon-address-book" className="people" touch={true} tooltip="People"/>
				<h4>Room</h4> 
				<Menu menuItems={this.state.rooms} onItemClick={this.onRoomSelect} />
				<br />								
			</Paper>
		);
	}
});

module.exports = RoomList;