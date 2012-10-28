/**
 * EventEmmiter adds event emmiters before and after method calls.
 */
function EventEmitter($) {
    if(this === window || this === document || this._sink || this.cache) 
        return;
    
    //Add an event sink
    this._sink = {};
    //Cache for instrumented methods
    this._methods = {};
    var eventName, cachedName;
    for(var m in this) {
        if(!this._methods[m] && (typeof this[m] === "function" && (m != "on" && m != "off"))) {
            eventName = m.toLowerCase();
            cachedName = "_"+m;
            this._methods[cachedName] = this[m]; //cache the original method
            this[m] = wrap(this,cachedName,eventName);
        }
    }
    
    function wrap(scope,method,eventName) {
        return function() {
            var data, i;
            if(this._sink["before"+eventName]) {
                for(i=0;i< this._sink["before"+eventName].length;i++) {
                    data =  this._sink["before"+eventName][i].data;
                    this._sink["before"+eventName][i].callback({"eventType":"before"+eventName,"data":data,"scope":scope});
                }
            }
            
            var retVal = this._methods[method].apply(scope,arguments);
            
            if(this._sink["after"+eventName]) {
                for(i=0;i< this._sink["after"+eventName].length;i++) {
                    data =  this._sink["after"+eventName][i].data;
                    this._sink["after"+eventName][i].callback({"eventType":"after"+eventName,"data":data,"scope":scope});
                }
            }
            
            return retVal;
        };
    }
    
    //Add on and off methods
    this.on = function(eventName,data,handler) {
        var e = eventName.toLowerCase();
        if(! this._sink[e]) {
             this._sink[e] = [];
        }
        var d = arguments.length === 3 ? arguments[1] : undefined,
            h = arguments.length === 3 && typeof arguments[2] === 'function' ? arguments[2] 
              : typeof arguments[1] === 'function' ? arguments[1] : undefined;
        if(h !== undefined) {
             this._sink[e].push({"data":d,"callback":h});
        }
    };
    
    this.off = function(eventName,handler) {
        var e = eventName.toLowerCase();
        for(var i=0;i< this._sink[e].length;i++) {
            if( this._sink[e][i].callback === handler) {
                 this._sink[e].splice(i,1);
                return;
            }
        }
    };
    
    return this;
}
