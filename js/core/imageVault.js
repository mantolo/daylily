/// overrides images from Image class
var assign = require('object-assign');
var availableImgs = [], 
ImageVault,
imgCount = 0, //// available images count
imgId = 0;
ImageVault = {
	/**
	 * allocate initial image objects for loading
	 * @param  {[type]} n [description]
	 * @return {[type]}   [description]
	 */
	allocate: function(n){
		n = n || 0;	
		if(typeof n !== 'number' || imgCount > 0){
			return false;
		}
		
		imgCount = n;

		while (n > 0){
			availableImgs.push(new Image());
			n-=1;
		}

		return true;
	},
	getCount: function(){
		return imgCount;
	},

	spawn : function(){
		if (availableImgs.length > 0){
			//imgId = imgId % availableImgs.length;
			imgCount-=1;
			return availableImgs.pop();			
			//return availableImgs[imgId++];
		} else {		
			imgCount+=1;
			return new Image();
		}
	},
	recycle: function(img){		
		if(img){
			imgCount+=1;
			availableImgs.push(img);			
		}		
	}
};

window.imgs = availableImgs;
module.exports = ImageVault;


