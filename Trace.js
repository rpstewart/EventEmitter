/**
 * TRACE Module designed to inject tracing code into objects and functions at run-time.
 * @param log {function} Writes messages to user defined destination. Defaults to console or alert.
 * @return this {Object||Function} Object or function to which tracing was added.
 */
var Trace = function(out) {
    // Don't munge the global env
    if(this === window || this === document) return;
    // Cache to store original methods/functions
    var cache = {};
    
    // Add tracing
    var typ = typeof this;
    var newMethod;
    if(typ === 'object') {
        for(var p in this) {
            if(typeof this[p] === 'function') {
                if(!this[p].trace_enabled) {
                    cache[p] = this[p];
                    newMethod = wrap(this,p);
                    newMethod.prototype = cache[p].prototype;
                    this[p] = newMethod;
                    //Flag this method as traced
                    this[p].trace_enabled = true;
                }
            } else if(typeof this[p] === 'object') {
                //Trace into sub-objects
                Trace.apply(this[p],arguments);
            }
        }
    } else if(typ === 'function') {
        var funcName = this.toString().substring(this.toString().indexOf(" ")+1,this.toString().indexOf("("));
        cache[funcName] = this;
        newMethod = wrap(this,funcName);
        newMethod.prototype = cache[funcName].prototype;
        window[funcName] = newMethod;
        this.trace_enabled = true;
    }
    
    /**
     * wrap Helper function to create a closure around the execution of the 
     * original method/function.
     * @param context {Object} Execution context
     * @param methodName {String} Name of cached method.
     * @return {undefined}
     */
    function wrap(context,methodName) {
        return function() {
            //Log the arguments
            var args = [];
            for(var i=0;i<arguments.length;i++) {
                if(typeof arguments[i] === 'string' || typeof arguments[i] === 'number') {
                    args[args.length] = arguments[i];
                } else {
                    if(arguments[i].constructor === Array) {
                        args[args.length] = 'array[' + arguments[i].length + ']';
                    } else {
                        args[args.length] = typeof arguments[i];
                    }
                }
            }
            //Log and execute the cached method
            out('Entering ' + methodName + '(' + args.join(',') + ')');
            var start = new Date();
            try {
                cache[methodName].apply(this,arguments);
            } catch(e) {
                out('Error: ' + e.message);
            }
            var stop = new Date();
            out('Exiting ' + methodName + '(' + (stop - start) + ' ms)');
        };
    }
    
    return this;
}; //end Trace
