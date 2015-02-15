var React = require('react');
var Network = require('../core/network');
var inputText;
var inputTextId = 'm';
var form;
var formId = 'sendForm';
var constants = require('../constants/hubConstants');
var MessageStore = require('../stores/messageStore');

function onsubmit(){
	Network.emit(constants.HUB_USER_BROADCAST, inputText.value);
	inputText.value = '';
	return false;
}

var Daylily = React.createClass({
	onMessageChange: function(){
		this.setState({
			messages: MessageStore.getAll()
		});
	},

	getInitialState: function(){
		return {
			messages: MessageStore.getAll()
		};
	},

	componentDidMount: function(){
		var that = this;
		inputText = document.getElementById(inputTextId);
		sendForm = document.getElementById(formId);
		sendForm.onsubmit = onsubmit;
		MessageStore.addChangeListener(this.onMessageChange);		
	},

	componentWillUnmount: function(){
		inputText = false;
		sendForm = false;
		sendForm.onsubmit = null;
		
		MessageStore.removeChangeListener(this.onMessageChange);
	},

	render: function(){
		return(
			<section>
				<section id="messages" ref="messages" >
					{this.state.messages}
				</section>	
			    <form action="" id="sendForm" >
			      <input id="m" type="text"/><button>Draw</button><button>Send</button>
			    </form>
			</section>
		);
	}
});

module.exports = Daylily;