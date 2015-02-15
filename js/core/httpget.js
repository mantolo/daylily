var assign = require('object-assign');
var Promise = require('es6-promise').Promise;
var utils = require('./utils');
var imgVault = require('./imageVault'); 
var XHRVault;
/// simple vault to reuse xhr objects
var availableXHR = [],
xhrCount = 0,
XHRVault = {
	allocate: function(n){ /// predefine xhr objects in array. before the app start
		n = n || 0;	
		if(typeof n !== 'number' || xhrCount > 0){
			return false;
		}
		
		xhrCount = n;
		while (n > 0){
			availableXHR.push(new XMLHttpRequest());
			n-=1;
		}

		return true;
	},
	spawn : function(){ /// get or new a xhr object
		if (availableXHR.length > 0 ){
			return availableXHR.pop();
		} else {	
			xhrCount += 1;
			return new XMLHttpRequest();
		}
	},
	recycle: function(xhr){		
		if(xhr){
			availableXHR.push(xhr);			
		}		
	}
};

// Promise reference: http://www.html5rocks.com/en/tutorials/es6/promises/
var HttpGetDemo = {
	XHRVault: XHRVault,
	/**
	 * try to fetch target URL and instantly abort it when readystates first come in, resolves with xhr object.
	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
	prefetch: function(url){		
		var xhr = XHRVault.spawn();
		return new Promise(function(resolve, reject){
			xhr.open('GET', url, true); // HTTP Method, URL, isAsync
			xhr.responseType = 'text';			
			xhr.onreadystatechange = function(e){
				// readyState	Holds the status of the XMLHttpRequest. Changes from 0 to 4: 
				// 0: request not initialized 
				// 1: server connection established
				// 2: request received 
				// 3: processing request 
				// 4: request finished and response is ready				

				if(xhr.readyState === 2 && xhr.status === 200){ // 2: request received, abort instantly
					xhr.abort();
					xhr.onreadystatechange = null;
					resolve(xhr);
				} else if( (xhr.readyState === 0 && xhr.status === 0 ) || xhr.status > 0){ // fail cases										
					xhr.onreadystatechange = null;
					reject( // reject with a self execute function, returning error message
						(function(status, rUrl){
							switch(status){
								case 0	: return 'Possibly blocked by browser, try to look at CORS header?' + rUrl;
								case 404: return '404: Resource not found ? ' + rUrl;
								case 500: return '500: Internal Server problem ?' + rUrl;
							}
						}(xhr.status, xhr.responseURL))
					);
					xhr.abort();
					XHRVault.recycle(xhr);
				}
			};
			xhr.send();
		});
	},
	getJSON: function(url, timeout){
		var timelimit = typeof timeout === 'number'? timeout : -1;
		var timeoutId = false;
		var xhr = XHRVault.spawn();
		return new Promise(function(resolve, reject){
			xhr.open('GET', url, true);
			xhr.responseType = 'text';
			xhr.onload = function(e) {
				if(typeof timeoutId === 'number'){
					clearTimeout(timeoutId);
					timeoutId = false;
				}
			  	xhr.onload = null;
			  	xhr.onerror = null;

			  	if (this.status === 200) {
			  		xhr.abort	    
			    	resolve(this.responseText, xhr);
			  	} else {
			  		reject(xhr);
			  	}
			};
			xhr.onreadystatechange = function(e){
				console.log(xhr.status, e);
			};

			xhr.onerror = function(){
				console.log('JSON load error');
				if(typeof timeoutId === 'number'){
					clearTimeout(timeoutId);
					timeoutId = false;
				}
				xhr.onload = null;
				xhr.onerror = null;				
				XHRVault.recycle(xhr);
				reject('error or timed out, no xhr returned');
			}

			xhr.send();
			if(timelimit >= 0){ /// set timeout call to abort xhr if there is timeout data given 
				timeoutId = setTimeout(function() {
					xhr.abort();
					xhr.onerror();
				}, timelimit);	
			}
		});	
	},
	getImageDOM: function(url, timeout){
		var timelimit = typeof timeout === 'number'? timeout : -1;
		var timeoutId = false;
		var img = imgVault.spawn();
		return new Promise(function(resolve, reject){
			img.onload = function(){				
				if (typeof timeoutId === 'number'){ // clean up delay call.
					clearTimeout(timeoutId);
					timeoutId = false;
				}
				img.onload = null;
				img.onerror = null;				
				resolve(img);
			};
			img.onerror = function(){
				console.log('IMAGE load error');
				if(typeof timeoutId === 'number'){
					clearTimeout(timeoutId);
					timeoutId = false;	
				}				
				img.onload = null;
				img.onerror = null;				
				imgVault.recycle(img);
				reject('error or timed out, no img returning');
			};
			img.src = url;

			if(timelimit >= 0){
				timeoutId = setTimeout(img.onerror, timelimit);	
			}
		});
	},
	/**
	 * get image with xhr and response type is blob, resolves with xhr object, you should use xhr.response for the actual data.
	 * @param  {[type]} url     [description]
	 * @param  {[type]} timeout [description]
	 * @return {[type]}         [description]
	 */
	getImageBlob: function(url, timeout){
		var timelimit = typeof timeout === 'number'? timeout : -1;
		var timeoutId = false;
		var xhr = XHRVault.spawn();		
		return new Promise(function(resolve, reject){
			xhr.open('GET', url, true);
			xhr.responseType = 'blob';
			//xhr.responseType = 'arraybuffer';
			//xhr.responseType = 'text';
			xhr.onerror = function(){
				console.log('IMAGE load error, clean up and recycling..');
				if(typeof timeoutId === 'number'){
					clearTimeout(timeoutId);
					timeoutId = false;
				}
				xhr.onload = null;
				xhr.onerror = null;				
				XHRVault.recycle(xhr);
				reject('error or timed out, no xhr returned');
			}

			xhr.onload = function() {				
				xhr.onload = null;
				xhr.onerror = null;				
				if (typeof timeoutId === 'number'){ /// clear delayed abort call
					clearTimeout(timeoutId);
					timeoutId = false;
				}

				if (this.status === 200) {					
					// Note: .response instead of .responseText
					//var blob = this.response; //new Blob([this.response], {type: 'image/png'});		    
					//resolve("data:image/jpeg;base64,"+b64, xhr);
					resolve(xhr);
				} else {										
					reject(xhr);
				}
				//XHRVault.recycle(xhr);
			};

			xhr.send();

			if(timelimit >= 0){ /// set timeout call to abort xhr if there is timeout data given 
				timeoutId = setTimeout(function() {
					xhr.abort();
					xhr.onerror();
				}, timelimit);	
			}
		});
	}
};

window.xhrs = availableXHR;
module.exports = HttpGetDemo;