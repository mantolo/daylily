var assign = require('object-assign');
var list = {};
var Canvas = function(dom){
	if(this instanceof Canvas && dom){
		this.dom = dom;
		this.context2d = this.dom.getContext('2d');
		this.id = new Date().getTime();
		this.width = this.dom.width;
		this.height = this.dom.height;
		list[this.id] = this;
	}
};

// Instance functions
Canvas.prototype = assign(Canvas.prototype, {
	id: -1,
	context2d: false,
	dom: false,
	width: 0,
	height: 0,
	getDOMNode: function(){ return this.dom; },
	drawImage: function(imgElement, sx, sy, swidth, sheight, x, y, width, height){ 
		return this.context2d.drawImage.apply(this.context2d, arguments); 
	}
});

Canvas = assign(Canvas, {
	getInstance: function(id){		return list[id];	}
});

module.exports = Canvas;