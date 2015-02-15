var Promise     = require('es6-promise').Promise;
var Event       = require('../core/event');
var httpGet     = require('../core/httpget');
var Constants   = require('../constants/constants');
var utils       = require('../core/utils');
var Canvas      = require('../core/canvas');
var imgVault = require('../core/imageVault'); 
var xhrVault = httpGet.XHRVault;

var mainSection     = document.getElementById('mainSection'),
playID              = document.getElementById('playID'),
videotest1          = document.getElementById('videotest1'), // canvas
videotest2          = document.getElementById('videotest2'), // img
imageCan            = new Canvas(videotest1),
intervalInput       = document.getElementById('intervalInput'),
interval            = intervalInput? intervalInput.value / 1 : 83,
imgCount            = 252, //// how many images to loop
requestTimeout      = 10000, /// how long will it take before canceling requests
initialImagesCount  = 20;
initialXHRCount     = 10;
fps                 = 12; /// fps
bufferImagesCount   = 12; /// 1s of images
currentPlayingID    = 0,
skippedFrame        = 0,
i                   = 0,
intervalId          = false,
intervalFunc        = false,
imgPlaylist         = [],
requestBufferFunc   = false,
startTime           = false,
onsuccess           = function(data, res){ 
    return Promise.resolve({ id: this, data: data}); 
},
onfail              = function(data, res){ 
    mainSection.textContent = 'started at ' + startTime + ', ' + this + ' failed!' + '\n'; 
    return Promise.resolve({ id: this, data: data}); // also resolve because don't want to break Promise all, returns empty image
},

/**
 * Resolves / rejects with image data and id
 * @return {[type]} [description]
 */
// checkImageID        = function(p){
//     var id = p.id;
//     //console.log(p); 
//     if (currentPlayingID <= id) {/// if dom is already playing advance id, ignore this promise
//         return Promise.resolve(p);
//     } else {
//         console.log('ignoring ' +  id +' due to advance id is already on the dom');            
//         return Promise.reject(p);
//     }
// },
setCurrentID        = function(p){  
    currentPlayingID = p.id;
    return p; //Promise.resolve(p);
}
/**
 * Resolves with data
 * @param  {[type]} data [description]
 * @param  {[type]} res  [description]
 * @return {[type]}      [description]
 */
changeImage          = function(p){        
    var id = p.id;
    var data = p.data;
    imageCan.drawImage(data, 0, 0, data.width, data.height, 0, 0, imageCan.width, imageCan.height);    
    /*return new Promise(function(resolve, reject){        
        imageCan.drawImage(data, 0, 0, data.width, data.height, 0, 0, imageCan.width, imageCan.height);    
        resolve(p);    
    });*/
    return p;
},
changeImageBlob         = function(p){
    var id = p.id;
    var data = p.data;
    var blobURL;
    return new Promise(function(resolve, reject){
        blobURL = URL.createObjectURL(data);
        videotest2.onload = function(){
            URL.revokeObjectURL(blobURL);
            resolve(p);
        }
        videotest2.src = blobURL;
    });
},

skip                = function(data){    
    skippedFrame+=1;
    playID.classList.remove('noskip');
    playID.classList.add('skip');    
    return p; //Promise.reject(data);
},
noSkip              = function(data){
    playID.classList.remove('skip');
    playID.classList.add('noskip');
    return data;
};
writeStatus         = function(p){
    playID.innerHTML = 'Playing: ' + currentPlayingID + ', Skipped: ' + skippedFrame; 
    return p; //Promise.resolve(p);
},
recycle             = function(p){
    if (p.data instanceof XMLHttpRequest){
        xhrVault.recycle(p.data);
    } else if(p.data instanceof Image){
        imgVault.recycle(p.data);    
    }    
    return p;
},
determineBufferRequest= function(){
    if(typeof requestBufferFunc === 'function' && imgVault.getCount() >= bufferImagesCount ){ //// start requesting buffer again                        
        requestBufferFunc.call();
        requestBufferFunc = false;
        console.log('requesting buffer');
    }
},
renderLoop          = function(){
    if (imgPlaylist.length > 0 && typeof intervalId === 'boolean'){
    /// just started, call from setPlayList, start render loop
        intervalId = setInterval(renderLoop, interval);
        intervalFunc = renderLoop;
        console.log('start render loop.');
    } else if(imgPlaylist.length > 0){ 
    /// actual render loop
        var p = imgPlaylist.shift();
        setCurrentID(p)
        changeImage(p);
        writeStatus(p);        
        recycle(p);
        determineBufferRequest();        
    } else if (imgPlaylist === 0){
    /// no more data, clear render loop
        console.log('no more data! clear loop');
        clearInterval(intervalId);
        intervalId = intervalFunc = false; /// turn interval id to boolean
    }
}

resetPlayingID = function(p){       
    currentPlayingID = 0;
    return p;
},
setPlaylist = function(plist){    
    //imgPlaylist = imgPlaylist.concat(plist); // concat is not useful here
    while(plist.length > 0){
        imgPlaylist.push(plist.shift());
    }
    
    renderLoop();
};

var App = {
    /**
     * Provides an array of resource urls and prefetch them at once, callback when all of them are finished
     * @param  String urls      [description]
     * @param  Function successcb [description]
     * @param  Function failcb    [description]
     * @return Promise           [description]
     */
    prefetchs: function(urls, successcb, failcb){
        var prom;
        if(urls && urls.length > 0){            
            prom = Promise.all(
                urls.map(httpGet.prefetch) /// you may customize behavior for each prefetch, by adding function here
            )
            .then( function(xhrs){  //// called when all urls prefetched.
                xhrs.map(xhrVault.recycle);
                if(typeof successcb === 'function') successcb();
            })     
            .catch(function(err){  //// called when 1 or more errors occured.
                console.log('ERROR Prefetching: one or more resource problem has occured', err); 
                if(typeof failcb === 'function') failcb();
            });
        }        
        return prom;
    },
    /**
     * Reset image count handler for exposing to window namespace
     * @param {[type]} n [description]
     */
    setImageCount: function(n){ 
        imgCount = n;
    },
    /**
     * Reset handler for exposing to window namespace
     * @return {[type]} [description]
     */
    resetSkip: function(){
        noSkip();
        skippedFrame = 0;
    },
    /**
     * AJAX test function for exposing to window namespace
     * @param  {[type]} p [description]
     * @param  {[type]} t [description]
     * @return {[type]}   [description]
     */
	startAJAX: function(p, t){
        return httpGet.getJSON(p, t)
        .then(function(d){
            console.log('httpget Success');
            return d;
        }, function(m){
            console.log(m);
            return m;
        });
        //httpGet.getImageDOM(p, requestTimeout).then(function(){ console.log('success');}, function(){ console.log('failed'); });
	},
    /**
     * Change interval handler for exposing to window
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    changeInterval: function(value){
        console.log('changed to ', value);
        //clearInterval(intervalId);
        //intervalId = false;
        //if(intervalFunc){
            interval = value/1;    
            //intervalId = setInterval(intervalFunc, interval);
        //}        
    },
    stopHTTPTest: function(){
        if (intervalId && intervalFunc){ /// clear existing interval
            clearInterval(intervalId);
        }
    },
    startHTTPTest: function(url, type){   
        var requestURL;              
        type = type || '';
        App.stopHTTPTest();     
        imgVault.allocate(initialImagesCount);   
        xhrVault.allocate(initialXHRCount);

        function errorlog (p){
            console.log(p);
        }

        function requestBufferInner (){
            i = i >= imgCount - 1? 0: i;
            var promlist = [];
            var prom;
            var targetImagesCount = i + bufferImagesCount;
            targetImagesCount = targetImagesCount >= imgCount? bufferImagesCount : targetImagesCount;
            console.log('requesting ' + bufferImagesCount + ' frames from ' + i + ' to ' + targetImagesCount);
            /// url list
            var j = 0;
            while (j < bufferImagesCount){ //// do as many times as buffer has, for 1 batch.
                if (typeof url === 'string'){
                    requestURL = url.replace('{0}', i + 1);
                    requestURL += '?t=' + new Date().getTime();
                }

                // scripts on doing stuffs
                prom = type === 'blob' ? httpGet.getImageBlob(requestURL, requestTimeout): httpGet.getImageDOM(requestURL, requestTimeout);
                prom = prom.then(onsuccess.bind(i), onfail.bind(i));
                promlist.push(prom);
                i = (i + 1) % imgCount;
                j += 1;
            }

            prom = Promise.all(promlist) /// OH, promise me to make them reply in sequence please
            .then(setPlaylist)
            .then(setBufferFunc) // list ready mark to request buffer
            //.then(requestBuffer)
            .catch(errorlog);
        }

        function setBufferFunc(){                            
            requestBufferFunc = requestBufferInner;        
        }
        
        requestBufferInner();
        
        // intervalFunc = function(){            
        //     i = (i + 1) %  imgCount; /// make sure image id is within range.
        // };
        // intervalId = setInterval(intervalFunc, interval); 
        startTime = new Date();
        console.log('started ', startTime,'id: ' + intervalId);
        mainSection.textContent = 'started at ' + startTime;
    },
    startEventTest: function(){
        Event.on(Constants.CREATE, function(id){
            console.log('event arrived for', id);
        });
        var i = 0;
        while(i < 100){
            Event.emitAsync(Constants.CREATE, i);
            i++;
        }
    }
};

module.exports = App;