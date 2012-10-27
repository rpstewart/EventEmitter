/**
 * EventEmmiter adds event emmiters before and after method calls.
 */
function EventEmitter($) {
    if(this === window || this === document || this.__sink) 
        return;
    
    //Add an event sink
    this.__sink = {};
    
    for(var m in this) {
        if(typeof this[m] === "function" && (m != "on" && m != "off")) {
            var eventName = m.toLowerCase();
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
                                this.__sink["after"+eventName][i].callback({"eventType":"after"+eventName,"data":data,"scope":scope,"returnValue":retVal});
                            }
                        }
                        
                        return retVal;
                    };
                })(this,m,eventName);
        }
    }
    
    //Add on and off methods
    this.on = function(eventName,data,handler) {
        var e = eventName.toLowerCase();
        if(! this.__sink[e]) {
             this.__sink[e] = [];
        }
        var d = arguments.length === 3 ? arguments[1] : undefined,
            h = arguments.length === 3 && typeof arguments[2] === 'function' ? arguments[2] 
              : typeof arguments[1] === 'function' ? arguments[1] : undefined;
        if(h !== undefined) {
             this.__sink[e].push({"data":d,"callback":h});
        }
    };
    
    this.off = function(eventName,handler) {
        var e = eventName.toLowerCase();
        for(var i=0;i< this.__sink[e].length;i++) {
            if( this.__sink[e][i].callback === handler) {
                 this.__sink[e].splice(i,1);
                return;
            }
        }
    };
    
    this.bindTo = function(container) {
    };
    
    return this;
}
