var React = require('react');
var PersonStore = require('../stores/personStore');
var PersonActions = require('../actions/personActions');
var map = require('lodash/collection/map');

var PersonList = React.createClass({
	handlePersonChange: function(){
		this.setState({
			persons: PersonStore.getAll()
		});
	},

	handlePersonSelect: function(e){
		PersonActions.select(e.target.attributes['value'].value);
	},

	getInitialState: function(){
		return {
			persons: PersonStore.getAll()
		};
	},

	componentDidMount: function(){
		PersonStore.addChangeListener(this.handlePersonChange);
	},

	componentWillUnmount: function(){
		PersonStore.removeChangeListener(this.handlePersonChange);
	},

/**
 * get person list
 * @return {[type]} [description]
 */
	getMapped: function(){
		var that = this;
		return map(this.state.persons, function(v){
			var date = Date(v.onlineSince);
			return (<a 
				href="#!"
				className="collection-item"
				value={v.uid}
				key={v.uid}
				title={date.toString()}
				onClick={that.handlePersonSelect}
				>{v.name}</a>);
		});
	},

	render: function(){
		return(
			<section id={this.props.id} className={this.props.className}>
				{this.getMapped()}
			</section>
		);
	}
});

module.exports = PersonList;