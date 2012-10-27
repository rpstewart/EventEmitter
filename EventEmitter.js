/**
 * EventEmmiter adds event emmiters before and after method calls.
 */
function EventEmmiter() {
    if(this === window || this === document || this.__sink) 
        return;
    
    //Add an event sink
    this.__sink = {};
    
    for(var m in this) {
        if(typeof this[m] === "function" && (m != "on" && m != "off")) {
            var eventName = m.substr(0,1).toUpperCase() + m.substr(1);
            this["_"+m] = this[m];
            this[m] = (function(scope,method,eventName) {
                    return function() {
                        var data, i;
                        if(this.__sink["before"+eventName]) {
                            for(i=0;i< this.__sink["before"+eventName].length;i++) {
                                data =  this.__sink["before"+eventName][i].data;
                                this.__sink["before"+eventName][i].callback({"eventType":"before"+eventName,"data":data,"scope":scope});
                            }
                        }
                        
                        var retVal = this["_"+method].apply(scope,arguments);
                        
                        if(this.__sink["after"+eventName]) {
                            for(i=0;i< this.__sink["after"+eventName].length;i++) {
                                data =  this.__sink["after"+eventName][i].data;
                                this.__sink["after"+eventName][i].callback({"eventType":"after"+eventName,"data":data,"scope":scope});
                            }
                        }
                        
                        return retVal;
                    };
                })(this,m,eventName);
        }
    }
    
    //Add on and off methods
    this.on = function(eventName,data,handler) {
        if(! this.__sink[eventName]) {
             this.__sink[eventName] = [];
        }
        var d = arguments.length === 3 ? arguments[1] : undefined,
            h = arguments.length === 3 && typeof arguments[2] === 'function' ? arguments[2] 
              : typeof arguments[1] === 'function' ? arguments[1] : undefined;
        if(h !== undefined) {
             this.__sink[eventName].push({"data":d,"callback":h});
        }
    };
    
    this.off = function(eventName,handler) {
        for(var i=0;i< this.__sink[eventName].length;i++) {
            if( this.__sink[eventName][i].callback === handler) {
                 this.__sink[eventName].splice(i,1);
                return;
            }
        }
    };
    
    return this;
}
