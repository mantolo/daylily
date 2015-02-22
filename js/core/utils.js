var utils;

utils = {
	sortArgs: function(){
	    var args = Array.prototype.slice.call(arguments);
	    return args.sort();
	},

	/**
	 * pad a string with 0 or specific character
	 * @param  {string} n string to be padded
	 * @param  {number} p number of characters to add before n
	 * @param  {string} c optional, charcater used to pad, default 0
	 * @return {string}   padded string
	 */
	paddy: function (n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
	    var pad = new Array(1 + p).join(pad_char);
	    return (pad + n).slice(-pad.length);
	},

	arrayBufferToBinary: function(buffer){
		var bytes = new Uint8Array( buffer );
	    var binary = String.fromCharCode.apply(null, bytes);
	    return binary;
	},
	
	arrayBufferToBase64: function( buffer ) {
	    return window.btoa( utils.arrayBufferToBinary(buffer) );
	},

	saveAsFile: (function () {
	    var a = document.createElement("a");
	    document.body.appendChild(a);
	    a.style = "display: none";
	    return function (data, fileName) {
	    	var blob, url, output;

	    	if(data instanceof ArrayBuffer){
	    		output = arrayBufferToBinary(data);
	    	} else if (typeof data === 'object'){
	    		output = JSON.stringify(data);
	    	}

            blob = new Blob([output], {type: "octet/stream"});
            url = window.URL.createObjectURL(blob);	
	        a.href = url;
	        a.download = fileName;
	        a.click();
	        window.URL.revokeObjectURL(url);
	    };
	}()),

	guid: (function(){
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		}
		return function(){
			return s4() + '-' + s4();
		}
	}()),

	/**
	 * immediate function inorder to gain performance over setTimeout
	 * @param  {[type]} ) {		var       hiddenDiv [description]
	 * @return {[type]}   [description]
	 */
	setImmediate: (function() {
		var hiddenDiv = document.createElement("div");
		var callbacks = [];

		//// observe it using Mutation Observer
		(new MutationObserver(function(records) {
			var cbList = callbacks.slice(); /// clone array?
			callbacks.length = 0; /// why set?
			cbList.forEach(function(callback) { callback(); });
		})).observe(hiddenDiv, { attributes: true });

		//// the actual code that would run each time
		return function setImmediate(callback) {
		  if( !callbacks.length) {
		    hiddenDiv.setAttribute('yes', 'no');
		  }
		  callbacks.push(callback);
		};
	}())
};
window.utils = utils;
module.exports = utils;