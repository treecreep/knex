var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs$1 (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace$1(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var main = {};

(function (global, undefined$1) {

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined$1, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof commonjsGlobal$1 === "undefined" ? commonjsGlobal$1 : commonjsGlobal$1 : self));

var scope = (typeof commonjsGlobal$1 !== "undefined" && commonjsGlobal$1) ||
            (typeof self !== "undefined" && self) ||
            window;
var apply$2 = Function.prototype.apply;

// DOM APIs, for completeness

main.setTimeout = function() {
  return new Timeout(apply$2.call(setTimeout, scope, arguments), clearTimeout);
};
main.setInterval = function() {
  return new Timeout(apply$2.call(setInterval, scope, arguments), clearInterval);
};
main.clearTimeout =
main.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(scope, this._id);
};

// Does not start the time, just sets up the members needed.
main.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

main.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

main._unrefActive = main.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object

// On some exotic environments, it's not clear which object `setimmediate` was
// able to install onto.  Search each possibility in the same order as the
// `setimmediate` library.
main.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
                       (typeof commonjsGlobal$1 !== "undefined" && commonjsGlobal$1.setImmediate) ||
                       (commonjsGlobal$1 && commonjsGlobal$1.setImmediate);
main.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
                         (typeof commonjsGlobal$1 !== "undefined" && commonjsGlobal$1.clearImmediate) ||
                         (commonjsGlobal$1 && commonjsGlobal$1.clearImmediate);

var events$1 = {exports: {}};

var R$1 = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply$1 = R$1 && typeof R$1.apply === 'function'
  ? R$1.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys$1;
if (R$1 && typeof R$1.ownKeys === 'function') {
  ReflectOwnKeys$1 = R$1.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys$1 = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys$1 = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning$1(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN$1 = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter$7() {
  EventEmitter$7.init.call(this);
}
events$1.exports = EventEmitter$7;
events$1.exports.once = once$1;

// Backwards-compat with node 0.10.x
EventEmitter$7.EventEmitter = EventEmitter$7;

EventEmitter$7.prototype._events = undefined;
EventEmitter$7.prototype._eventsCount = 0;
EventEmitter$7.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners$1 = 10;

function checkListener$1(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter$7, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners$1;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN$1(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners$1 = arg;
  }
});

EventEmitter$7.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter$7.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN$1(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners$1(that) {
  if (that._maxListeners === undefined)
    return EventEmitter$7.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter$7.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners$1(this);
};

EventEmitter$7.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply$1(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone$1(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply$1(listeners[i], this, args);
  }

  return true;
};

function _addListener$1(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener$1(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners$1(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning$1(w);
    }
  }

  return target;
}

EventEmitter$7.prototype.addListener = function addListener(type, listener) {
  return _addListener$1(this, type, listener, false);
};

EventEmitter$7.prototype.on = EventEmitter$7.prototype.addListener;

EventEmitter$7.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener$1(this, type, listener, true);
    };

function onceWrapper$1() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap$1(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper$1.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter$7.prototype.once = function once(type, listener) {
  checkListener$1(listener);
  this.on(type, _onceWrap$1(this, type, listener));
  return this;
};

EventEmitter$7.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener$1(listener);
      this.prependListener(type, _onceWrap$1(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter$7.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener$1(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne$1(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter$7.prototype.off = EventEmitter$7.prototype.removeListener;

EventEmitter$7.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners$1(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners$1(evlistener) : arrayClone$1(evlistener, evlistener.length);
}

EventEmitter$7.prototype.listeners = function listeners(type) {
  return _listeners$1(this, type, true);
};

EventEmitter$7.prototype.rawListeners = function rawListeners(type) {
  return _listeners$1(this, type, false);
};

EventEmitter$7.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount$1.call(emitter, type);
  }
};

EventEmitter$7.prototype.listenerCount = listenerCount$1;
function listenerCount$1(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter$7.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys$1(this._events) : [];
};

function arrayClone$1(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne$1(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners$1(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once$1(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    }
    eventTargetAgnosticAddListener$1(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter$1(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter$1(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener$1(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener$1(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

var eventsExports$1 = events$1.exports;

var inherits_browser$1 = {exports: {}};

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  inherits_browser$1.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
} else {
  // old school shim for old browsers
  inherits_browser$1.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }
  };
}

var inherits_browserExports$1 = inherits_browser$1.exports;

var streamBrowser;
var hasRequiredStreamBrowser;

function requireStreamBrowser () {
	if (hasRequiredStreamBrowser) return streamBrowser;
	hasRequiredStreamBrowser = 1;
	streamBrowser = eventsExports$1.EventEmitter;
	return streamBrowser;
}

var buffer = {};

var base64Js = {};

var hasRequiredBase64Js;

function requireBase64Js () {
	if (hasRequiredBase64Js) return base64Js;
	hasRequiredBase64Js = 1;

	base64Js.byteLength = byteLength;
	base64Js.toByteArray = toByteArray;
	base64Js.fromByteArray = fromByteArray;

	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i];
	  revLookup[code.charCodeAt(i)] = i;
	}

	// Support decoding URL-safe base64 strings, as Node.js does.
	// See: https://en.wikipedia.org/wiki/Base64#URL_applications
	revLookup['-'.charCodeAt(0)] = 62;
	revLookup['_'.charCodeAt(0)] = 63;

	function getLens (b64) {
	  var len = b64.length;

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // Trim off extra bytes after placeholder bytes are found
	  // See: https://github.com/beatgammit/base64-js/issues/42
	  var validLen = b64.indexOf('=');
	  if (validLen === -1) validLen = len;

	  var placeHoldersLen = validLen === len
	    ? 0
	    : 4 - (validLen % 4);

	  return [validLen, placeHoldersLen]
	}

	// base64 is 4/3 + up to two characters of the original data
	function byteLength (b64) {
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function _byteLength (b64, validLen, placeHoldersLen) {
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function toByteArray (b64) {
	  var tmp;
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];

	  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

	  var curByte = 0;

	  // if there are placeholders, only get up to the last complete 4 chars
	  var len = placeHoldersLen > 0
	    ? validLen - 4
	    : validLen;

	  var i;
	  for (i = 0; i < len; i += 4) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 18) |
	      (revLookup[b64.charCodeAt(i + 1)] << 12) |
	      (revLookup[b64.charCodeAt(i + 2)] << 6) |
	      revLookup[b64.charCodeAt(i + 3)];
	    arr[curByte++] = (tmp >> 16) & 0xFF;
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 2) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 2) |
	      (revLookup[b64.charCodeAt(i + 1)] >> 4);
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 1) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 10) |
	      (revLookup[b64.charCodeAt(i + 1)] << 4) |
	      (revLookup[b64.charCodeAt(i + 2)] >> 2);
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] +
	    lookup[num >> 12 & 0x3F] +
	    lookup[num >> 6 & 0x3F] +
	    lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp =
	      ((uint8[i] << 16) & 0xFF0000) +
	      ((uint8[i + 1] << 8) & 0xFF00) +
	      (uint8[i + 2] & 0xFF);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 2] +
	      lookup[(tmp << 4) & 0x3F] +
	      '=='
	    );
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 10] +
	      lookup[(tmp >> 4) & 0x3F] +
	      lookup[(tmp << 2) & 0x3F] +
	      '='
	    );
	  }

	  return parts.join('')
	}
	return base64Js;
}

var ieee754 = {};

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */

var hasRequiredIeee754;

function requireIeee754 () {
	if (hasRequiredIeee754) return ieee754;
	hasRequiredIeee754 = 1;
	ieee754.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m;
	  var eLen = (nBytes * 8) - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = -7;
	  var i = isLE ? (nBytes - 1) : 0;
	  var d = isLE ? -1 : 1;
	  var s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	};

	ieee754.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c;
	  var eLen = (nBytes * 8) - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
	  var i = isLE ? 0 : (nBytes - 1);
	  var d = isLE ? 1 : -1;
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = ((value * c) - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128;
	};
	return ieee754;
}

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

var hasRequiredBuffer;

function requireBuffer () {
	if (hasRequiredBuffer) return buffer;
	hasRequiredBuffer = 1;
	(function (exports) {

		const base64 = requireBase64Js();
		const ieee754 = requireIeee754();
		const customInspectSymbol =
		  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
		    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
		    : null;

		exports.Buffer = Buffer;
		exports.SlowBuffer = SlowBuffer;
		exports.INSPECT_MAX_BYTES = 50;

		const K_MAX_LENGTH = 0x7fffffff;
		exports.kMaxLength = K_MAX_LENGTH;

		/**
		 * If `Buffer.TYPED_ARRAY_SUPPORT`:
		 *   === true    Use Uint8Array implementation (fastest)
		 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
		 *               implementation (most compatible, even IE6)
		 *
		 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
		 * Opera 11.6+, iOS 4.2+.
		 *
		 * We report that the browser does not support typed arrays if the are not subclassable
		 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
		 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
		 * for __proto__ and has a buggy typed array implementation.
		 */
		Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

		if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
		    typeof console.error === 'function') {
		  console.error(
		    'This browser lacks typed array (Uint8Array) support which is required by ' +
		    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
		  );
		}

		function typedArraySupport () {
		  // Can typed array instances can be augmented?
		  try {
		    const arr = new Uint8Array(1);
		    const proto = { foo: function () { return 42 } };
		    Object.setPrototypeOf(proto, Uint8Array.prototype);
		    Object.setPrototypeOf(arr, proto);
		    return arr.foo() === 42
		  } catch (e) {
		    return false
		  }
		}

		Object.defineProperty(Buffer.prototype, 'parent', {
		  enumerable: true,
		  get: function () {
		    if (!Buffer.isBuffer(this)) return undefined
		    return this.buffer
		  }
		});

		Object.defineProperty(Buffer.prototype, 'offset', {
		  enumerable: true,
		  get: function () {
		    if (!Buffer.isBuffer(this)) return undefined
		    return this.byteOffset
		  }
		});

		function createBuffer (length) {
		  if (length > K_MAX_LENGTH) {
		    throw new RangeError('The value "' + length + '" is invalid for option "size"')
		  }
		  // Return an augmented `Uint8Array` instance
		  const buf = new Uint8Array(length);
		  Object.setPrototypeOf(buf, Buffer.prototype);
		  return buf
		}

		/**
		 * The Buffer constructor returns instances of `Uint8Array` that have their
		 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
		 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
		 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
		 * returns a single octet.
		 *
		 * The `Uint8Array` prototype remains unmodified.
		 */

		function Buffer (arg, encodingOrOffset, length) {
		  // Common case.
		  if (typeof arg === 'number') {
		    if (typeof encodingOrOffset === 'string') {
		      throw new TypeError(
		        'The "string" argument must be of type string. Received type number'
		      )
		    }
		    return allocUnsafe(arg)
		  }
		  return from(arg, encodingOrOffset, length)
		}

		Buffer.poolSize = 8192; // not used by this implementation

		function from (value, encodingOrOffset, length) {
		  if (typeof value === 'string') {
		    return fromString(value, encodingOrOffset)
		  }

		  if (ArrayBuffer.isView(value)) {
		    return fromArrayView(value)
		  }

		  if (value == null) {
		    throw new TypeError(
		      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
		      'or Array-like Object. Received type ' + (typeof value)
		    )
		  }

		  if (isInstance(value, ArrayBuffer) ||
		      (value && isInstance(value.buffer, ArrayBuffer))) {
		    return fromArrayBuffer(value, encodingOrOffset, length)
		  }

		  if (typeof SharedArrayBuffer !== 'undefined' &&
		      (isInstance(value, SharedArrayBuffer) ||
		      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
		    return fromArrayBuffer(value, encodingOrOffset, length)
		  }

		  if (typeof value === 'number') {
		    throw new TypeError(
		      'The "value" argument must not be of type number. Received type number'
		    )
		  }

		  const valueOf = value.valueOf && value.valueOf();
		  if (valueOf != null && valueOf !== value) {
		    return Buffer.from(valueOf, encodingOrOffset, length)
		  }

		  const b = fromObject(value);
		  if (b) return b

		  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
		      typeof value[Symbol.toPrimitive] === 'function') {
		    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length)
		  }

		  throw new TypeError(
		    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
		    'or Array-like Object. Received type ' + (typeof value)
		  )
		}

		/**
		 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
		 * if value is a number.
		 * Buffer.from(str[, encoding])
		 * Buffer.from(array)
		 * Buffer.from(buffer)
		 * Buffer.from(arrayBuffer[, byteOffset[, length]])
		 **/
		Buffer.from = function (value, encodingOrOffset, length) {
		  return from(value, encodingOrOffset, length)
		};

		// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
		// https://github.com/feross/buffer/pull/148
		Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
		Object.setPrototypeOf(Buffer, Uint8Array);

		function assertSize (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('"size" argument must be of type number')
		  } else if (size < 0) {
		    throw new RangeError('The value "' + size + '" is invalid for option "size"')
		  }
		}

		function alloc (size, fill, encoding) {
		  assertSize(size);
		  if (size <= 0) {
		    return createBuffer(size)
		  }
		  if (fill !== undefined) {
		    // Only pay attention to encoding if it's a string. This
		    // prevents accidentally sending in a number that would
		    // be interpreted as a start offset.
		    return typeof encoding === 'string'
		      ? createBuffer(size).fill(fill, encoding)
		      : createBuffer(size).fill(fill)
		  }
		  return createBuffer(size)
		}

		/**
		 * Creates a new filled Buffer instance.
		 * alloc(size[, fill[, encoding]])
		 **/
		Buffer.alloc = function (size, fill, encoding) {
		  return alloc(size, fill, encoding)
		};

		function allocUnsafe (size) {
		  assertSize(size);
		  return createBuffer(size < 0 ? 0 : checked(size) | 0)
		}

		/**
		 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
		 * */
		Buffer.allocUnsafe = function (size) {
		  return allocUnsafe(size)
		};
		/**
		 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
		 */
		Buffer.allocUnsafeSlow = function (size) {
		  return allocUnsafe(size)
		};

		function fromString (string, encoding) {
		  if (typeof encoding !== 'string' || encoding === '') {
		    encoding = 'utf8';
		  }

		  if (!Buffer.isEncoding(encoding)) {
		    throw new TypeError('Unknown encoding: ' + encoding)
		  }

		  const length = byteLength(string, encoding) | 0;
		  let buf = createBuffer(length);

		  const actual = buf.write(string, encoding);

		  if (actual !== length) {
		    // Writing a hex string, for example, that contains invalid characters will
		    // cause everything after the first invalid character to be ignored. (e.g.
		    // 'abxxcd' will be treated as 'ab')
		    buf = buf.slice(0, actual);
		  }

		  return buf
		}

		function fromArrayLike (array) {
		  const length = array.length < 0 ? 0 : checked(array.length) | 0;
		  const buf = createBuffer(length);
		  for (let i = 0; i < length; i += 1) {
		    buf[i] = array[i] & 255;
		  }
		  return buf
		}

		function fromArrayView (arrayView) {
		  if (isInstance(arrayView, Uint8Array)) {
		    const copy = new Uint8Array(arrayView);
		    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
		  }
		  return fromArrayLike(arrayView)
		}

		function fromArrayBuffer (array, byteOffset, length) {
		  if (byteOffset < 0 || array.byteLength < byteOffset) {
		    throw new RangeError('"offset" is outside of buffer bounds')
		  }

		  if (array.byteLength < byteOffset + (length || 0)) {
		    throw new RangeError('"length" is outside of buffer bounds')
		  }

		  let buf;
		  if (byteOffset === undefined && length === undefined) {
		    buf = new Uint8Array(array);
		  } else if (length === undefined) {
		    buf = new Uint8Array(array, byteOffset);
		  } else {
		    buf = new Uint8Array(array, byteOffset, length);
		  }

		  // Return an augmented `Uint8Array` instance
		  Object.setPrototypeOf(buf, Buffer.prototype);

		  return buf
		}

		function fromObject (obj) {
		  if (Buffer.isBuffer(obj)) {
		    const len = checked(obj.length) | 0;
		    const buf = createBuffer(len);

		    if (buf.length === 0) {
		      return buf
		    }

		    obj.copy(buf, 0, 0, len);
		    return buf
		  }

		  if (obj.length !== undefined) {
		    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
		      return createBuffer(0)
		    }
		    return fromArrayLike(obj)
		  }

		  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
		    return fromArrayLike(obj.data)
		  }
		}

		function checked (length) {
		  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
		  // length is NaN (which is otherwise coerced to zero.)
		  if (length >= K_MAX_LENGTH) {
		    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
		                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
		  }
		  return length | 0
		}

		function SlowBuffer (length) {
		  if (+length != length) { // eslint-disable-line eqeqeq
		    length = 0;
		  }
		  return Buffer.alloc(+length)
		}

		Buffer.isBuffer = function isBuffer (b) {
		  return b != null && b._isBuffer === true &&
		    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
		};

		Buffer.compare = function compare (a, b) {
		  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
		  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
		  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
		    throw new TypeError(
		      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
		    )
		  }

		  if (a === b) return 0

		  let x = a.length;
		  let y = b.length;

		  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
		    if (a[i] !== b[i]) {
		      x = a[i];
		      y = b[i];
		      break
		    }
		  }

		  if (x < y) return -1
		  if (y < x) return 1
		  return 0
		};

		Buffer.isEncoding = function isEncoding (encoding) {
		  switch (String(encoding).toLowerCase()) {
		    case 'hex':
		    case 'utf8':
		    case 'utf-8':
		    case 'ascii':
		    case 'latin1':
		    case 'binary':
		    case 'base64':
		    case 'ucs2':
		    case 'ucs-2':
		    case 'utf16le':
		    case 'utf-16le':
		      return true
		    default:
		      return false
		  }
		};

		Buffer.concat = function concat (list, length) {
		  if (!Array.isArray(list)) {
		    throw new TypeError('"list" argument must be an Array of Buffers')
		  }

		  if (list.length === 0) {
		    return Buffer.alloc(0)
		  }

		  let i;
		  if (length === undefined) {
		    length = 0;
		    for (i = 0; i < list.length; ++i) {
		      length += list[i].length;
		    }
		  }

		  const buffer = Buffer.allocUnsafe(length);
		  let pos = 0;
		  for (i = 0; i < list.length; ++i) {
		    let buf = list[i];
		    if (isInstance(buf, Uint8Array)) {
		      if (pos + buf.length > buffer.length) {
		        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
		        buf.copy(buffer, pos);
		      } else {
		        Uint8Array.prototype.set.call(
		          buffer,
		          buf,
		          pos
		        );
		      }
		    } else if (!Buffer.isBuffer(buf)) {
		      throw new TypeError('"list" argument must be an Array of Buffers')
		    } else {
		      buf.copy(buffer, pos);
		    }
		    pos += buf.length;
		  }
		  return buffer
		};

		function byteLength (string, encoding) {
		  if (Buffer.isBuffer(string)) {
		    return string.length
		  }
		  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
		    return string.byteLength
		  }
		  if (typeof string !== 'string') {
		    throw new TypeError(
		      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
		      'Received type ' + typeof string
		    )
		  }

		  const len = string.length;
		  const mustMatch = (arguments.length > 2 && arguments[2] === true);
		  if (!mustMatch && len === 0) return 0

		  // Use a for loop to avoid recursion
		  let loweredCase = false;
		  for (;;) {
		    switch (encoding) {
		      case 'ascii':
		      case 'latin1':
		      case 'binary':
		        return len
		      case 'utf8':
		      case 'utf-8':
		        return utf8ToBytes(string).length
		      case 'ucs2':
		      case 'ucs-2':
		      case 'utf16le':
		      case 'utf-16le':
		        return len * 2
		      case 'hex':
		        return len >>> 1
		      case 'base64':
		        return base64ToBytes(string).length
		      default:
		        if (loweredCase) {
		          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
		        }
		        encoding = ('' + encoding).toLowerCase();
		        loweredCase = true;
		    }
		  }
		}
		Buffer.byteLength = byteLength;

		function slowToString (encoding, start, end) {
		  let loweredCase = false;

		  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
		  // property of a typed array.

		  // This behaves neither like String nor Uint8Array in that we set start/end
		  // to their upper/lower bounds if the value passed is out of range.
		  // undefined is handled specially as per ECMA-262 6th Edition,
		  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
		  if (start === undefined || start < 0) {
		    start = 0;
		  }
		  // Return early if start > this.length. Done here to prevent potential uint32
		  // coercion fail below.
		  if (start > this.length) {
		    return ''
		  }

		  if (end === undefined || end > this.length) {
		    end = this.length;
		  }

		  if (end <= 0) {
		    return ''
		  }

		  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
		  end >>>= 0;
		  start >>>= 0;

		  if (end <= start) {
		    return ''
		  }

		  if (!encoding) encoding = 'utf8';

		  while (true) {
		    switch (encoding) {
		      case 'hex':
		        return hexSlice(this, start, end)

		      case 'utf8':
		      case 'utf-8':
		        return utf8Slice(this, start, end)

		      case 'ascii':
		        return asciiSlice(this, start, end)

		      case 'latin1':
		      case 'binary':
		        return latin1Slice(this, start, end)

		      case 'base64':
		        return base64Slice(this, start, end)

		      case 'ucs2':
		      case 'ucs-2':
		      case 'utf16le':
		      case 'utf-16le':
		        return utf16leSlice(this, start, end)

		      default:
		        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
		        encoding = (encoding + '').toLowerCase();
		        loweredCase = true;
		    }
		  }
		}

		// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
		// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
		// reliably in a browserify context because there could be multiple different
		// copies of the 'buffer' package in use. This method works even for Buffer
		// instances that were created from another copy of the `buffer` package.
		// See: https://github.com/feross/buffer/issues/154
		Buffer.prototype._isBuffer = true;

		function swap (b, n, m) {
		  const i = b[n];
		  b[n] = b[m];
		  b[m] = i;
		}

		Buffer.prototype.swap16 = function swap16 () {
		  const len = this.length;
		  if (len % 2 !== 0) {
		    throw new RangeError('Buffer size must be a multiple of 16-bits')
		  }
		  for (let i = 0; i < len; i += 2) {
		    swap(this, i, i + 1);
		  }
		  return this
		};

		Buffer.prototype.swap32 = function swap32 () {
		  const len = this.length;
		  if (len % 4 !== 0) {
		    throw new RangeError('Buffer size must be a multiple of 32-bits')
		  }
		  for (let i = 0; i < len; i += 4) {
		    swap(this, i, i + 3);
		    swap(this, i + 1, i + 2);
		  }
		  return this
		};

		Buffer.prototype.swap64 = function swap64 () {
		  const len = this.length;
		  if (len % 8 !== 0) {
		    throw new RangeError('Buffer size must be a multiple of 64-bits')
		  }
		  for (let i = 0; i < len; i += 8) {
		    swap(this, i, i + 7);
		    swap(this, i + 1, i + 6);
		    swap(this, i + 2, i + 5);
		    swap(this, i + 3, i + 4);
		  }
		  return this
		};

		Buffer.prototype.toString = function toString () {
		  const length = this.length;
		  if (length === 0) return ''
		  if (arguments.length === 0) return utf8Slice(this, 0, length)
		  return slowToString.apply(this, arguments)
		};

		Buffer.prototype.toLocaleString = Buffer.prototype.toString;

		Buffer.prototype.equals = function equals (b) {
		  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
		  if (this === b) return true
		  return Buffer.compare(this, b) === 0
		};

		Buffer.prototype.inspect = function inspect () {
		  let str = '';
		  const max = exports.INSPECT_MAX_BYTES;
		  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
		  if (this.length > max) str += ' ... ';
		  return '<Buffer ' + str + '>'
		};
		if (customInspectSymbol) {
		  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
		}

		Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
		  if (isInstance(target, Uint8Array)) {
		    target = Buffer.from(target, target.offset, target.byteLength);
		  }
		  if (!Buffer.isBuffer(target)) {
		    throw new TypeError(
		      'The "target" argument must be one of type Buffer or Uint8Array. ' +
		      'Received type ' + (typeof target)
		    )
		  }

		  if (start === undefined) {
		    start = 0;
		  }
		  if (end === undefined) {
		    end = target ? target.length : 0;
		  }
		  if (thisStart === undefined) {
		    thisStart = 0;
		  }
		  if (thisEnd === undefined) {
		    thisEnd = this.length;
		  }

		  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
		    throw new RangeError('out of range index')
		  }

		  if (thisStart >= thisEnd && start >= end) {
		    return 0
		  }
		  if (thisStart >= thisEnd) {
		    return -1
		  }
		  if (start >= end) {
		    return 1
		  }

		  start >>>= 0;
		  end >>>= 0;
		  thisStart >>>= 0;
		  thisEnd >>>= 0;

		  if (this === target) return 0

		  let x = thisEnd - thisStart;
		  let y = end - start;
		  const len = Math.min(x, y);

		  const thisCopy = this.slice(thisStart, thisEnd);
		  const targetCopy = target.slice(start, end);

		  for (let i = 0; i < len; ++i) {
		    if (thisCopy[i] !== targetCopy[i]) {
		      x = thisCopy[i];
		      y = targetCopy[i];
		      break
		    }
		  }

		  if (x < y) return -1
		  if (y < x) return 1
		  return 0
		};

		// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
		// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
		//
		// Arguments:
		// - buffer - a Buffer to search
		// - val - a string, Buffer, or number
		// - byteOffset - an index into `buffer`; will be clamped to an int32
		// - encoding - an optional encoding, relevant is val is a string
		// - dir - true for indexOf, false for lastIndexOf
		function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
		  // Empty buffer means no match
		  if (buffer.length === 0) return -1

		  // Normalize byteOffset
		  if (typeof byteOffset === 'string') {
		    encoding = byteOffset;
		    byteOffset = 0;
		  } else if (byteOffset > 0x7fffffff) {
		    byteOffset = 0x7fffffff;
		  } else if (byteOffset < -0x80000000) {
		    byteOffset = -0x80000000;
		  }
		  byteOffset = +byteOffset; // Coerce to Number.
		  if (numberIsNaN(byteOffset)) {
		    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
		    byteOffset = dir ? 0 : (buffer.length - 1);
		  }

		  // Normalize byteOffset: negative offsets start from the end of the buffer
		  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
		  if (byteOffset >= buffer.length) {
		    if (dir) return -1
		    else byteOffset = buffer.length - 1;
		  } else if (byteOffset < 0) {
		    if (dir) byteOffset = 0;
		    else return -1
		  }

		  // Normalize val
		  if (typeof val === 'string') {
		    val = Buffer.from(val, encoding);
		  }

		  // Finally, search either indexOf (if dir is true) or lastIndexOf
		  if (Buffer.isBuffer(val)) {
		    // Special case: looking for empty string/buffer always fails
		    if (val.length === 0) {
		      return -1
		    }
		    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
		  } else if (typeof val === 'number') {
		    val = val & 0xFF; // Search for a byte value [0-255]
		    if (typeof Uint8Array.prototype.indexOf === 'function') {
		      if (dir) {
		        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
		      } else {
		        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
		      }
		    }
		    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
		  }

		  throw new TypeError('val must be string, number or Buffer')
		}

		function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
		  let indexSize = 1;
		  let arrLength = arr.length;
		  let valLength = val.length;

		  if (encoding !== undefined) {
		    encoding = String(encoding).toLowerCase();
		    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
		        encoding === 'utf16le' || encoding === 'utf-16le') {
		      if (arr.length < 2 || val.length < 2) {
		        return -1
		      }
		      indexSize = 2;
		      arrLength /= 2;
		      valLength /= 2;
		      byteOffset /= 2;
		    }
		  }

		  function read (buf, i) {
		    if (indexSize === 1) {
		      return buf[i]
		    } else {
		      return buf.readUInt16BE(i * indexSize)
		    }
		  }

		  let i;
		  if (dir) {
		    let foundIndex = -1;
		    for (i = byteOffset; i < arrLength; i++) {
		      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
		        if (foundIndex === -1) foundIndex = i;
		        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
		      } else {
		        if (foundIndex !== -1) i -= i - foundIndex;
		        foundIndex = -1;
		      }
		    }
		  } else {
		    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
		    for (i = byteOffset; i >= 0; i--) {
		      let found = true;
		      for (let j = 0; j < valLength; j++) {
		        if (read(arr, i + j) !== read(val, j)) {
		          found = false;
		          break
		        }
		      }
		      if (found) return i
		    }
		  }

		  return -1
		}

		Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
		  return this.indexOf(val, byteOffset, encoding) !== -1
		};

		Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
		  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
		};

		Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
		  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
		};

		function hexWrite (buf, string, offset, length) {
		  offset = Number(offset) || 0;
		  const remaining = buf.length - offset;
		  if (!length) {
		    length = remaining;
		  } else {
		    length = Number(length);
		    if (length > remaining) {
		      length = remaining;
		    }
		  }

		  const strLen = string.length;

		  if (length > strLen / 2) {
		    length = strLen / 2;
		  }
		  let i;
		  for (i = 0; i < length; ++i) {
		    const parsed = parseInt(string.substr(i * 2, 2), 16);
		    if (numberIsNaN(parsed)) return i
		    buf[offset + i] = parsed;
		  }
		  return i
		}

		function utf8Write (buf, string, offset, length) {
		  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
		}

		function asciiWrite (buf, string, offset, length) {
		  return blitBuffer(asciiToBytes(string), buf, offset, length)
		}

		function base64Write (buf, string, offset, length) {
		  return blitBuffer(base64ToBytes(string), buf, offset, length)
		}

		function ucs2Write (buf, string, offset, length) {
		  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
		}

		Buffer.prototype.write = function write (string, offset, length, encoding) {
		  // Buffer#write(string)
		  if (offset === undefined) {
		    encoding = 'utf8';
		    length = this.length;
		    offset = 0;
		  // Buffer#write(string, encoding)
		  } else if (length === undefined && typeof offset === 'string') {
		    encoding = offset;
		    length = this.length;
		    offset = 0;
		  // Buffer#write(string, offset[, length][, encoding])
		  } else if (isFinite(offset)) {
		    offset = offset >>> 0;
		    if (isFinite(length)) {
		      length = length >>> 0;
		      if (encoding === undefined) encoding = 'utf8';
		    } else {
		      encoding = length;
		      length = undefined;
		    }
		  } else {
		    throw new Error(
		      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
		    )
		  }

		  const remaining = this.length - offset;
		  if (length === undefined || length > remaining) length = remaining;

		  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
		    throw new RangeError('Attempt to write outside buffer bounds')
		  }

		  if (!encoding) encoding = 'utf8';

		  let loweredCase = false;
		  for (;;) {
		    switch (encoding) {
		      case 'hex':
		        return hexWrite(this, string, offset, length)

		      case 'utf8':
		      case 'utf-8':
		        return utf8Write(this, string, offset, length)

		      case 'ascii':
		      case 'latin1':
		      case 'binary':
		        return asciiWrite(this, string, offset, length)

		      case 'base64':
		        // Warning: maxLength not taken into account in base64Write
		        return base64Write(this, string, offset, length)

		      case 'ucs2':
		      case 'ucs-2':
		      case 'utf16le':
		      case 'utf-16le':
		        return ucs2Write(this, string, offset, length)

		      default:
		        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
		        encoding = ('' + encoding).toLowerCase();
		        loweredCase = true;
		    }
		  }
		};

		Buffer.prototype.toJSON = function toJSON () {
		  return {
		    type: 'Buffer',
		    data: Array.prototype.slice.call(this._arr || this, 0)
		  }
		};

		function base64Slice (buf, start, end) {
		  if (start === 0 && end === buf.length) {
		    return base64.fromByteArray(buf)
		  } else {
		    return base64.fromByteArray(buf.slice(start, end))
		  }
		}

		function utf8Slice (buf, start, end) {
		  end = Math.min(buf.length, end);
		  const res = [];

		  let i = start;
		  while (i < end) {
		    const firstByte = buf[i];
		    let codePoint = null;
		    let bytesPerSequence = (firstByte > 0xEF)
		      ? 4
		      : (firstByte > 0xDF)
		          ? 3
		          : (firstByte > 0xBF)
		              ? 2
		              : 1;

		    if (i + bytesPerSequence <= end) {
		      let secondByte, thirdByte, fourthByte, tempCodePoint;

		      switch (bytesPerSequence) {
		        case 1:
		          if (firstByte < 0x80) {
		            codePoint = firstByte;
		          }
		          break
		        case 2:
		          secondByte = buf[i + 1];
		          if ((secondByte & 0xC0) === 0x80) {
		            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
		            if (tempCodePoint > 0x7F) {
		              codePoint = tempCodePoint;
		            }
		          }
		          break
		        case 3:
		          secondByte = buf[i + 1];
		          thirdByte = buf[i + 2];
		          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
		            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
		            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
		              codePoint = tempCodePoint;
		            }
		          }
		          break
		        case 4:
		          secondByte = buf[i + 1];
		          thirdByte = buf[i + 2];
		          fourthByte = buf[i + 3];
		          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
		            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
		            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
		              codePoint = tempCodePoint;
		            }
		          }
		      }
		    }

		    if (codePoint === null) {
		      // we did not generate a valid codePoint so insert a
		      // replacement char (U+FFFD) and advance only 1 byte
		      codePoint = 0xFFFD;
		      bytesPerSequence = 1;
		    } else if (codePoint > 0xFFFF) {
		      // encode to utf16 (surrogate pair dance)
		      codePoint -= 0x10000;
		      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
		      codePoint = 0xDC00 | codePoint & 0x3FF;
		    }

		    res.push(codePoint);
		    i += bytesPerSequence;
		  }

		  return decodeCodePointsArray(res)
		}

		// Based on http://stackoverflow.com/a/22747272/680742, the browser with
		// the lowest limit is Chrome, with 0x10000 args.
		// We go 1 magnitude less, for safety
		const MAX_ARGUMENTS_LENGTH = 0x1000;

		function decodeCodePointsArray (codePoints) {
		  const len = codePoints.length;
		  if (len <= MAX_ARGUMENTS_LENGTH) {
		    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
		  }

		  // Decode in chunks to avoid "call stack size exceeded".
		  let res = '';
		  let i = 0;
		  while (i < len) {
		    res += String.fromCharCode.apply(
		      String,
		      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
		    );
		  }
		  return res
		}

		function asciiSlice (buf, start, end) {
		  let ret = '';
		  end = Math.min(buf.length, end);

		  for (let i = start; i < end; ++i) {
		    ret += String.fromCharCode(buf[i] & 0x7F);
		  }
		  return ret
		}

		function latin1Slice (buf, start, end) {
		  let ret = '';
		  end = Math.min(buf.length, end);

		  for (let i = start; i < end; ++i) {
		    ret += String.fromCharCode(buf[i]);
		  }
		  return ret
		}

		function hexSlice (buf, start, end) {
		  const len = buf.length;

		  if (!start || start < 0) start = 0;
		  if (!end || end < 0 || end > len) end = len;

		  let out = '';
		  for (let i = start; i < end; ++i) {
		    out += hexSliceLookupTable[buf[i]];
		  }
		  return out
		}

		function utf16leSlice (buf, start, end) {
		  const bytes = buf.slice(start, end);
		  let res = '';
		  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
		  for (let i = 0; i < bytes.length - 1; i += 2) {
		    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256));
		  }
		  return res
		}

		Buffer.prototype.slice = function slice (start, end) {
		  const len = this.length;
		  start = ~~start;
		  end = end === undefined ? len : ~~end;

		  if (start < 0) {
		    start += len;
		    if (start < 0) start = 0;
		  } else if (start > len) {
		    start = len;
		  }

		  if (end < 0) {
		    end += len;
		    if (end < 0) end = 0;
		  } else if (end > len) {
		    end = len;
		  }

		  if (end < start) end = start;

		  const newBuf = this.subarray(start, end);
		  // Return an augmented `Uint8Array` instance
		  Object.setPrototypeOf(newBuf, Buffer.prototype);

		  return newBuf
		};

		/*
		 * Need to make sure that buffer isn't trying to write out of bounds.
		 */
		function checkOffset (offset, ext, length) {
		  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
		  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
		}

		Buffer.prototype.readUintLE =
		Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) checkOffset(offset, byteLength, this.length);

		  let val = this[offset];
		  let mul = 1;
		  let i = 0;
		  while (++i < byteLength && (mul *= 0x100)) {
		    val += this[offset + i] * mul;
		  }

		  return val
		};

		Buffer.prototype.readUintBE =
		Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) {
		    checkOffset(offset, byteLength, this.length);
		  }

		  let val = this[offset + --byteLength];
		  let mul = 1;
		  while (byteLength > 0 && (mul *= 0x100)) {
		    val += this[offset + --byteLength] * mul;
		  }

		  return val
		};

		Buffer.prototype.readUint8 =
		Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 1, this.length);
		  return this[offset]
		};

		Buffer.prototype.readUint16LE =
		Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 2, this.length);
		  return this[offset] | (this[offset + 1] << 8)
		};

		Buffer.prototype.readUint16BE =
		Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 2, this.length);
		  return (this[offset] << 8) | this[offset + 1]
		};

		Buffer.prototype.readUint32LE =
		Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);

		  return ((this[offset]) |
		      (this[offset + 1] << 8) |
		      (this[offset + 2] << 16)) +
		      (this[offset + 3] * 0x1000000)
		};

		Buffer.prototype.readUint32BE =
		Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);

		  return (this[offset] * 0x1000000) +
		    ((this[offset + 1] << 16) |
		    (this[offset + 2] << 8) |
		    this[offset + 3])
		};

		Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE (offset) {
		  offset = offset >>> 0;
		  validateNumber(offset, 'offset');
		  const first = this[offset];
		  const last = this[offset + 7];
		  if (first === undefined || last === undefined) {
		    boundsError(offset, this.length - 8);
		  }

		  const lo = first +
		    this[++offset] * 2 ** 8 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 24;

		  const hi = this[++offset] +
		    this[++offset] * 2 ** 8 +
		    this[++offset] * 2 ** 16 +
		    last * 2 ** 24;

		  return BigInt(lo) + (BigInt(hi) << BigInt(32))
		});

		Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE (offset) {
		  offset = offset >>> 0;
		  validateNumber(offset, 'offset');
		  const first = this[offset];
		  const last = this[offset + 7];
		  if (first === undefined || last === undefined) {
		    boundsError(offset, this.length - 8);
		  }

		  const hi = first * 2 ** 24 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 8 +
		    this[++offset];

		  const lo = this[++offset] * 2 ** 24 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 8 +
		    last;

		  return (BigInt(hi) << BigInt(32)) + BigInt(lo)
		});

		Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) checkOffset(offset, byteLength, this.length);

		  let val = this[offset];
		  let mul = 1;
		  let i = 0;
		  while (++i < byteLength && (mul *= 0x100)) {
		    val += this[offset + i] * mul;
		  }
		  mul *= 0x80;

		  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

		  return val
		};

		Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) checkOffset(offset, byteLength, this.length);

		  let i = byteLength;
		  let mul = 1;
		  let val = this[offset + --i];
		  while (i > 0 && (mul *= 0x100)) {
		    val += this[offset + --i] * mul;
		  }
		  mul *= 0x80;

		  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

		  return val
		};

		Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 1, this.length);
		  if (!(this[offset] & 0x80)) return (this[offset])
		  return ((0xff - this[offset] + 1) * -1)
		};

		Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 2, this.length);
		  const val = this[offset] | (this[offset + 1] << 8);
		  return (val & 0x8000) ? val | 0xFFFF0000 : val
		};

		Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 2, this.length);
		  const val = this[offset + 1] | (this[offset] << 8);
		  return (val & 0x8000) ? val | 0xFFFF0000 : val
		};

		Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);

		  return (this[offset]) |
		    (this[offset + 1] << 8) |
		    (this[offset + 2] << 16) |
		    (this[offset + 3] << 24)
		};

		Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);

		  return (this[offset] << 24) |
		    (this[offset + 1] << 16) |
		    (this[offset + 2] << 8) |
		    (this[offset + 3])
		};

		Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE (offset) {
		  offset = offset >>> 0;
		  validateNumber(offset, 'offset');
		  const first = this[offset];
		  const last = this[offset + 7];
		  if (first === undefined || last === undefined) {
		    boundsError(offset, this.length - 8);
		  }

		  const val = this[offset + 4] +
		    this[offset + 5] * 2 ** 8 +
		    this[offset + 6] * 2 ** 16 +
		    (last << 24); // Overflow

		  return (BigInt(val) << BigInt(32)) +
		    BigInt(first +
		    this[++offset] * 2 ** 8 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 24)
		});

		Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE (offset) {
		  offset = offset >>> 0;
		  validateNumber(offset, 'offset');
		  const first = this[offset];
		  const last = this[offset + 7];
		  if (first === undefined || last === undefined) {
		    boundsError(offset, this.length - 8);
		  }

		  const val = (first << 24) + // Overflow
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 8 +
		    this[++offset];

		  return (BigInt(val) << BigInt(32)) +
		    BigInt(this[++offset] * 2 ** 24 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 8 +
		    last)
		});

		Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);
		  return ieee754.read(this, offset, true, 23, 4)
		};

		Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);
		  return ieee754.read(this, offset, false, 23, 4)
		};

		Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 8, this.length);
		  return ieee754.read(this, offset, true, 52, 8)
		};

		Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 8, this.length);
		  return ieee754.read(this, offset, false, 52, 8)
		};

		function checkInt (buf, value, offset, ext, max, min) {
		  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
		  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
		  if (offset + ext > buf.length) throw new RangeError('Index out of range')
		}

		Buffer.prototype.writeUintLE =
		Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) {
		    const maxBytes = Math.pow(2, 8 * byteLength) - 1;
		    checkInt(this, value, offset, byteLength, maxBytes, 0);
		  }

		  let mul = 1;
		  let i = 0;
		  this[offset] = value & 0xFF;
		  while (++i < byteLength && (mul *= 0x100)) {
		    this[offset + i] = (value / mul) & 0xFF;
		  }

		  return offset + byteLength
		};

		Buffer.prototype.writeUintBE =
		Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) {
		    const maxBytes = Math.pow(2, 8 * byteLength) - 1;
		    checkInt(this, value, offset, byteLength, maxBytes, 0);
		  }

		  let i = byteLength - 1;
		  let mul = 1;
		  this[offset + i] = value & 0xFF;
		  while (--i >= 0 && (mul *= 0x100)) {
		    this[offset + i] = (value / mul) & 0xFF;
		  }

		  return offset + byteLength
		};

		Buffer.prototype.writeUint8 =
		Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
		  this[offset] = (value & 0xff);
		  return offset + 1
		};

		Buffer.prototype.writeUint16LE =
		Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
		  this[offset] = (value & 0xff);
		  this[offset + 1] = (value >>> 8);
		  return offset + 2
		};

		Buffer.prototype.writeUint16BE =
		Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
		  this[offset] = (value >>> 8);
		  this[offset + 1] = (value & 0xff);
		  return offset + 2
		};

		Buffer.prototype.writeUint32LE =
		Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
		  this[offset + 3] = (value >>> 24);
		  this[offset + 2] = (value >>> 16);
		  this[offset + 1] = (value >>> 8);
		  this[offset] = (value & 0xff);
		  return offset + 4
		};

		Buffer.prototype.writeUint32BE =
		Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
		  this[offset] = (value >>> 24);
		  this[offset + 1] = (value >>> 16);
		  this[offset + 2] = (value >>> 8);
		  this[offset + 3] = (value & 0xff);
		  return offset + 4
		};

		function wrtBigUInt64LE (buf, value, offset, min, max) {
		  checkIntBI(value, min, max, buf, offset, 7);

		  let lo = Number(value & BigInt(0xffffffff));
		  buf[offset++] = lo;
		  lo = lo >> 8;
		  buf[offset++] = lo;
		  lo = lo >> 8;
		  buf[offset++] = lo;
		  lo = lo >> 8;
		  buf[offset++] = lo;
		  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
		  buf[offset++] = hi;
		  hi = hi >> 8;
		  buf[offset++] = hi;
		  hi = hi >> 8;
		  buf[offset++] = hi;
		  hi = hi >> 8;
		  buf[offset++] = hi;
		  return offset
		}

		function wrtBigUInt64BE (buf, value, offset, min, max) {
		  checkIntBI(value, min, max, buf, offset, 7);

		  let lo = Number(value & BigInt(0xffffffff));
		  buf[offset + 7] = lo;
		  lo = lo >> 8;
		  buf[offset + 6] = lo;
		  lo = lo >> 8;
		  buf[offset + 5] = lo;
		  lo = lo >> 8;
		  buf[offset + 4] = lo;
		  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
		  buf[offset + 3] = hi;
		  hi = hi >> 8;
		  buf[offset + 2] = hi;
		  hi = hi >> 8;
		  buf[offset + 1] = hi;
		  hi = hi >> 8;
		  buf[offset] = hi;
		  return offset + 8
		}

		Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE (value, offset = 0) {
		  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
		});

		Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE (value, offset = 0) {
		  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
		});

		Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) {
		    const limit = Math.pow(2, (8 * byteLength) - 1);

		    checkInt(this, value, offset, byteLength, limit - 1, -limit);
		  }

		  let i = 0;
		  let mul = 1;
		  let sub = 0;
		  this[offset] = value & 0xFF;
		  while (++i < byteLength && (mul *= 0x100)) {
		    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
		      sub = 1;
		    }
		    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
		  }

		  return offset + byteLength
		};

		Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) {
		    const limit = Math.pow(2, (8 * byteLength) - 1);

		    checkInt(this, value, offset, byteLength, limit - 1, -limit);
		  }

		  let i = byteLength - 1;
		  let mul = 1;
		  let sub = 0;
		  this[offset + i] = value & 0xFF;
		  while (--i >= 0 && (mul *= 0x100)) {
		    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
		      sub = 1;
		    }
		    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
		  }

		  return offset + byteLength
		};

		Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
		  if (value < 0) value = 0xff + value + 1;
		  this[offset] = (value & 0xff);
		  return offset + 1
		};

		Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
		  this[offset] = (value & 0xff);
		  this[offset + 1] = (value >>> 8);
		  return offset + 2
		};

		Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
		  this[offset] = (value >>> 8);
		  this[offset + 1] = (value & 0xff);
		  return offset + 2
		};

		Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
		  this[offset] = (value & 0xff);
		  this[offset + 1] = (value >>> 8);
		  this[offset + 2] = (value >>> 16);
		  this[offset + 3] = (value >>> 24);
		  return offset + 4
		};

		Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
		  if (value < 0) value = 0xffffffff + value + 1;
		  this[offset] = (value >>> 24);
		  this[offset + 1] = (value >>> 16);
		  this[offset + 2] = (value >>> 8);
		  this[offset + 3] = (value & 0xff);
		  return offset + 4
		};

		Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE (value, offset = 0) {
		  return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
		});

		Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE (value, offset = 0) {
		  return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
		});

		function checkIEEE754 (buf, value, offset, ext, max, min) {
		  if (offset + ext > buf.length) throw new RangeError('Index out of range')
		  if (offset < 0) throw new RangeError('Index out of range')
		}

		function writeFloat (buf, value, offset, littleEndian, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) {
		    checkIEEE754(buf, value, offset, 4);
		  }
		  ieee754.write(buf, value, offset, littleEndian, 23, 4);
		  return offset + 4
		}

		Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
		  return writeFloat(this, value, offset, true, noAssert)
		};

		Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
		  return writeFloat(this, value, offset, false, noAssert)
		};

		function writeDouble (buf, value, offset, littleEndian, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) {
		    checkIEEE754(buf, value, offset, 8);
		  }
		  ieee754.write(buf, value, offset, littleEndian, 52, 8);
		  return offset + 8
		}

		Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
		  return writeDouble(this, value, offset, true, noAssert)
		};

		Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
		  return writeDouble(this, value, offset, false, noAssert)
		};

		// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
		Buffer.prototype.copy = function copy (target, targetStart, start, end) {
		  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
		  if (!start) start = 0;
		  if (!end && end !== 0) end = this.length;
		  if (targetStart >= target.length) targetStart = target.length;
		  if (!targetStart) targetStart = 0;
		  if (end > 0 && end < start) end = start;

		  // Copy 0 bytes; we're done
		  if (end === start) return 0
		  if (target.length === 0 || this.length === 0) return 0

		  // Fatal error conditions
		  if (targetStart < 0) {
		    throw new RangeError('targetStart out of bounds')
		  }
		  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
		  if (end < 0) throw new RangeError('sourceEnd out of bounds')

		  // Are we oob?
		  if (end > this.length) end = this.length;
		  if (target.length - targetStart < end - start) {
		    end = target.length - targetStart + start;
		  }

		  const len = end - start;

		  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
		    // Use built-in when available, missing from IE11
		    this.copyWithin(targetStart, start, end);
		  } else {
		    Uint8Array.prototype.set.call(
		      target,
		      this.subarray(start, end),
		      targetStart
		    );
		  }

		  return len
		};

		// Usage:
		//    buffer.fill(number[, offset[, end]])
		//    buffer.fill(buffer[, offset[, end]])
		//    buffer.fill(string[, offset[, end]][, encoding])
		Buffer.prototype.fill = function fill (val, start, end, encoding) {
		  // Handle string cases:
		  if (typeof val === 'string') {
		    if (typeof start === 'string') {
		      encoding = start;
		      start = 0;
		      end = this.length;
		    } else if (typeof end === 'string') {
		      encoding = end;
		      end = this.length;
		    }
		    if (encoding !== undefined && typeof encoding !== 'string') {
		      throw new TypeError('encoding must be a string')
		    }
		    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
		      throw new TypeError('Unknown encoding: ' + encoding)
		    }
		    if (val.length === 1) {
		      const code = val.charCodeAt(0);
		      if ((encoding === 'utf8' && code < 128) ||
		          encoding === 'latin1') {
		        // Fast path: If `val` fits into a single byte, use that numeric value.
		        val = code;
		      }
		    }
		  } else if (typeof val === 'number') {
		    val = val & 255;
		  } else if (typeof val === 'boolean') {
		    val = Number(val);
		  }

		  // Invalid ranges are not set to a default, so can range check early.
		  if (start < 0 || this.length < start || this.length < end) {
		    throw new RangeError('Out of range index')
		  }

		  if (end <= start) {
		    return this
		  }

		  start = start >>> 0;
		  end = end === undefined ? this.length : end >>> 0;

		  if (!val) val = 0;

		  let i;
		  if (typeof val === 'number') {
		    for (i = start; i < end; ++i) {
		      this[i] = val;
		    }
		  } else {
		    const bytes = Buffer.isBuffer(val)
		      ? val
		      : Buffer.from(val, encoding);
		    const len = bytes.length;
		    if (len === 0) {
		      throw new TypeError('The value "' + val +
		        '" is invalid for argument "value"')
		    }
		    for (i = 0; i < end - start; ++i) {
		      this[i + start] = bytes[i % len];
		    }
		  }

		  return this
		};

		// CUSTOM ERRORS
		// =============

		// Simplified versions from Node, changed for Buffer-only usage
		const errors = {};
		function E (sym, getMessage, Base) {
		  errors[sym] = class NodeError extends Base {
		    constructor () {
		      super();

		      Object.defineProperty(this, 'message', {
		        value: getMessage.apply(this, arguments),
		        writable: true,
		        configurable: true
		      });

		      // Add the error code to the name to include it in the stack trace.
		      this.name = `${this.name} [${sym}]`;
		      // Access the stack to generate the error message including the error code
		      // from the name.
		      this.stack; // eslint-disable-line no-unused-expressions
		      // Reset the name to the actual name.
		      delete this.name;
		    }

		    get code () {
		      return sym
		    }

		    set code (value) {
		      Object.defineProperty(this, 'code', {
		        configurable: true,
		        enumerable: true,
		        value,
		        writable: true
		      });
		    }

		    toString () {
		      return `${this.name} [${sym}]: ${this.message}`
		    }
		  };
		}

		E('ERR_BUFFER_OUT_OF_BOUNDS',
		  function (name) {
		    if (name) {
		      return `${name} is outside of buffer bounds`
		    }

		    return 'Attempt to access memory outside buffer bounds'
		  }, RangeError);
		E('ERR_INVALID_ARG_TYPE',
		  function (name, actual) {
		    return `The "${name}" argument must be of type number. Received type ${typeof actual}`
		  }, TypeError);
		E('ERR_OUT_OF_RANGE',
		  function (str, range, input) {
		    let msg = `The value of "${str}" is out of range.`;
		    let received = input;
		    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
		      received = addNumericalSeparator(String(input));
		    } else if (typeof input === 'bigint') {
		      received = String(input);
		      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
		        received = addNumericalSeparator(received);
		      }
		      received += 'n';
		    }
		    msg += ` It must be ${range}. Received ${received}`;
		    return msg
		  }, RangeError);

		function addNumericalSeparator (val) {
		  let res = '';
		  let i = val.length;
		  const start = val[0] === '-' ? 1 : 0;
		  for (; i >= start + 4; i -= 3) {
		    res = `_${val.slice(i - 3, i)}${res}`;
		  }
		  return `${val.slice(0, i)}${res}`
		}

		// CHECK FUNCTIONS
		// ===============

		function checkBounds (buf, offset, byteLength) {
		  validateNumber(offset, 'offset');
		  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
		    boundsError(offset, buf.length - (byteLength + 1));
		  }
		}

		function checkIntBI (value, min, max, buf, offset, byteLength) {
		  if (value > max || value < min) {
		    const n = typeof min === 'bigint' ? 'n' : '';
		    let range;
		    if (byteLength > 3) {
		      if (min === 0 || min === BigInt(0)) {
		        range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`;
		      } else {
		        range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` +
		                `${(byteLength + 1) * 8 - 1}${n}`;
		      }
		    } else {
		      range = `>= ${min}${n} and <= ${max}${n}`;
		    }
		    throw new errors.ERR_OUT_OF_RANGE('value', range, value)
		  }
		  checkBounds(buf, offset, byteLength);
		}

		function validateNumber (value, name) {
		  if (typeof value !== 'number') {
		    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value)
		  }
		}

		function boundsError (value, length, type) {
		  if (Math.floor(value) !== value) {
		    validateNumber(value, type);
		    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value)
		  }

		  if (length < 0) {
		    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()
		  }

		  throw new errors.ERR_OUT_OF_RANGE(type || 'offset',
		                                    `>= ${type ? 1 : 0} and <= ${length}`,
		                                    value)
		}

		// HELPER FUNCTIONS
		// ================

		const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

		function base64clean (str) {
		  // Node takes equal signs as end of the Base64 encoding
		  str = str.split('=')[0];
		  // Node strips out invalid characters like \n and \t from the string, base64-js does not
		  str = str.trim().replace(INVALID_BASE64_RE, '');
		  // Node converts strings with length < 2 to ''
		  if (str.length < 2) return ''
		  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
		  while (str.length % 4 !== 0) {
		    str = str + '=';
		  }
		  return str
		}

		function utf8ToBytes (string, units) {
		  units = units || Infinity;
		  let codePoint;
		  const length = string.length;
		  let leadSurrogate = null;
		  const bytes = [];

		  for (let i = 0; i < length; ++i) {
		    codePoint = string.charCodeAt(i);

		    // is surrogate component
		    if (codePoint > 0xD7FF && codePoint < 0xE000) {
		      // last char was a lead
		      if (!leadSurrogate) {
		        // no lead yet
		        if (codePoint > 0xDBFF) {
		          // unexpected trail
		          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
		          continue
		        } else if (i + 1 === length) {
		          // unpaired lead
		          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
		          continue
		        }

		        // valid lead
		        leadSurrogate = codePoint;

		        continue
		      }

		      // 2 leads in a row
		      if (codePoint < 0xDC00) {
		        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
		        leadSurrogate = codePoint;
		        continue
		      }

		      // valid surrogate pair
		      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
		    } else if (leadSurrogate) {
		      // valid bmp char, but last char was a lead
		      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
		    }

		    leadSurrogate = null;

		    // encode utf8
		    if (codePoint < 0x80) {
		      if ((units -= 1) < 0) break
		      bytes.push(codePoint);
		    } else if (codePoint < 0x800) {
		      if ((units -= 2) < 0) break
		      bytes.push(
		        codePoint >> 0x6 | 0xC0,
		        codePoint & 0x3F | 0x80
		      );
		    } else if (codePoint < 0x10000) {
		      if ((units -= 3) < 0) break
		      bytes.push(
		        codePoint >> 0xC | 0xE0,
		        codePoint >> 0x6 & 0x3F | 0x80,
		        codePoint & 0x3F | 0x80
		      );
		    } else if (codePoint < 0x110000) {
		      if ((units -= 4) < 0) break
		      bytes.push(
		        codePoint >> 0x12 | 0xF0,
		        codePoint >> 0xC & 0x3F | 0x80,
		        codePoint >> 0x6 & 0x3F | 0x80,
		        codePoint & 0x3F | 0x80
		      );
		    } else {
		      throw new Error('Invalid code point')
		    }
		  }

		  return bytes
		}

		function asciiToBytes (str) {
		  const byteArray = [];
		  for (let i = 0; i < str.length; ++i) {
		    // Node's code seems to be doing this and not & 0x7F..
		    byteArray.push(str.charCodeAt(i) & 0xFF);
		  }
		  return byteArray
		}

		function utf16leToBytes (str, units) {
		  let c, hi, lo;
		  const byteArray = [];
		  for (let i = 0; i < str.length; ++i) {
		    if ((units -= 2) < 0) break

		    c = str.charCodeAt(i);
		    hi = c >> 8;
		    lo = c % 256;
		    byteArray.push(lo);
		    byteArray.push(hi);
		  }

		  return byteArray
		}

		function base64ToBytes (str) {
		  return base64.toByteArray(base64clean(str))
		}

		function blitBuffer (src, dst, offset, length) {
		  let i;
		  for (i = 0; i < length; ++i) {
		    if ((i + offset >= dst.length) || (i >= src.length)) break
		    dst[i + offset] = src[i];
		  }
		  return i
		}

		// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
		// the `instanceof` check but they should be treated as of that type.
		// See: https://github.com/feross/buffer/issues/166
		function isInstance (obj, type) {
		  return obj instanceof type ||
		    (obj != null && obj.constructor != null && obj.constructor.name != null &&
		      obj.constructor.name === type.name)
		}
		function numberIsNaN (obj) {
		  // For IE11 support
		  return obj !== obj // eslint-disable-line no-self-compare
		}

		// Create lookup table for `toString('hex')`
		// See: https://github.com/feross/buffer/issues/219
		const hexSliceLookupTable = (function () {
		  const alphabet = '0123456789abcdef';
		  const table = new Array(256);
		  for (let i = 0; i < 16; ++i) {
		    const i16 = i * 16;
		    for (let j = 0; j < 16; ++j) {
		      table[i16 + j] = alphabet[i] + alphabet[j];
		    }
		  }
		  return table
		})();

		// Return not function with Error if BigInt not supported
		function defineBigIntMethod (fn) {
		  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn
		}

		function BufferBigIntNotDefined () {
		  throw new Error('BigInt not supported')
		} 
	} (buffer));
	return buffer;
}

var _nodeResolve_empty$2 = {};

var _nodeResolve_empty$3 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: _nodeResolve_empty$2
});

var require$$3 = /*@__PURE__*/getAugmentedNamespace$1(_nodeResolve_empty$3);

var buffer_list;
var hasRequiredBuffer_list;

function requireBuffer_list () {
	if (hasRequiredBuffer_list) return buffer_list;
	hasRequiredBuffer_list = 1;

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
	function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
	function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
	var _require = requireBuffer(),
	  Buffer = _require.Buffer;
	var _require2 = require$$3,
	  inspect = _require2.inspect;
	var custom = inspect && inspect.custom || 'inspect';
	function copyBuffer(src, target, offset) {
	  Buffer.prototype.copy.call(src, target, offset);
	}
	buffer_list = /*#__PURE__*/function () {
	  function BufferList() {
	    _classCallCheck(this, BufferList);
	    this.head = null;
	    this.tail = null;
	    this.length = 0;
	  }
	  _createClass(BufferList, [{
	    key: "push",
	    value: function push(v) {
	      var entry = {
	        data: v,
	        next: null
	      };
	      if (this.length > 0) this.tail.next = entry;else this.head = entry;
	      this.tail = entry;
	      ++this.length;
	    }
	  }, {
	    key: "unshift",
	    value: function unshift(v) {
	      var entry = {
	        data: v,
	        next: this.head
	      };
	      if (this.length === 0) this.tail = entry;
	      this.head = entry;
	      ++this.length;
	    }
	  }, {
	    key: "shift",
	    value: function shift() {
	      if (this.length === 0) return;
	      var ret = this.head.data;
	      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	      --this.length;
	      return ret;
	    }
	  }, {
	    key: "clear",
	    value: function clear() {
	      this.head = this.tail = null;
	      this.length = 0;
	    }
	  }, {
	    key: "join",
	    value: function join(s) {
	      if (this.length === 0) return '';
	      var p = this.head;
	      var ret = '' + p.data;
	      while (p = p.next) ret += s + p.data;
	      return ret;
	    }
	  }, {
	    key: "concat",
	    value: function concat(n) {
	      if (this.length === 0) return Buffer.alloc(0);
	      var ret = Buffer.allocUnsafe(n >>> 0);
	      var p = this.head;
	      var i = 0;
	      while (p) {
	        copyBuffer(p.data, ret, i);
	        i += p.data.length;
	        p = p.next;
	      }
	      return ret;
	    }

	    // Consumes a specified amount of bytes or characters from the buffered data.
	  }, {
	    key: "consume",
	    value: function consume(n, hasStrings) {
	      var ret;
	      if (n < this.head.data.length) {
	        // `slice` is the same for buffers and strings.
	        ret = this.head.data.slice(0, n);
	        this.head.data = this.head.data.slice(n);
	      } else if (n === this.head.data.length) {
	        // First chunk is a perfect match.
	        ret = this.shift();
	      } else {
	        // Result spans more than one buffer.
	        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
	      }
	      return ret;
	    }
	  }, {
	    key: "first",
	    value: function first() {
	      return this.head.data;
	    }

	    // Consumes a specified amount of characters from the buffered data.
	  }, {
	    key: "_getString",
	    value: function _getString(n) {
	      var p = this.head;
	      var c = 1;
	      var ret = p.data;
	      n -= ret.length;
	      while (p = p.next) {
	        var str = p.data;
	        var nb = n > str.length ? str.length : n;
	        if (nb === str.length) ret += str;else ret += str.slice(0, n);
	        n -= nb;
	        if (n === 0) {
	          if (nb === str.length) {
	            ++c;
	            if (p.next) this.head = p.next;else this.head = this.tail = null;
	          } else {
	            this.head = p;
	            p.data = str.slice(nb);
	          }
	          break;
	        }
	        ++c;
	      }
	      this.length -= c;
	      return ret;
	    }

	    // Consumes a specified amount of bytes from the buffered data.
	  }, {
	    key: "_getBuffer",
	    value: function _getBuffer(n) {
	      var ret = Buffer.allocUnsafe(n);
	      var p = this.head;
	      var c = 1;
	      p.data.copy(ret);
	      n -= p.data.length;
	      while (p = p.next) {
	        var buf = p.data;
	        var nb = n > buf.length ? buf.length : n;
	        buf.copy(ret, ret.length - n, 0, nb);
	        n -= nb;
	        if (n === 0) {
	          if (nb === buf.length) {
	            ++c;
	            if (p.next) this.head = p.next;else this.head = this.tail = null;
	          } else {
	            this.head = p;
	            p.data = buf.slice(nb);
	          }
	          break;
	        }
	        ++c;
	      }
	      this.length -= c;
	      return ret;
	    }

	    // Make sure the linked list only shows the minimal necessary information.
	  }, {
	    key: custom,
	    value: function value(_, options) {
	      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
	        // Only inspect one level.
	        depth: 0,
	        // It should not recurse.
	        customInspect: false
	      }));
	    }
	  }]);
	  return BufferList;
	}();
	return buffer_list;
}

var destroy_1;
var hasRequiredDestroy;

function requireDestroy () {
	if (hasRequiredDestroy) return destroy_1;
	hasRequiredDestroy = 1;

	// undocumented cb() API, needed for core, not for public API
	function destroy(err, cb) {
	  var _this = this;
	  var readableDestroyed = this._readableState && this._readableState.destroyed;
	  var writableDestroyed = this._writableState && this._writableState.destroyed;
	  if (readableDestroyed || writableDestroyed) {
	    if (cb) {
	      cb(err);
	    } else if (err) {
	      if (!this._writableState) {
	        process.nextTick(emitErrorNT, this, err);
	      } else if (!this._writableState.errorEmitted) {
	        this._writableState.errorEmitted = true;
	        process.nextTick(emitErrorNT, this, err);
	      }
	    }
	    return this;
	  }

	  // we set destroyed to true before firing error callbacks in order
	  // to make it re-entrance safe in case destroy() is called within callbacks

	  if (this._readableState) {
	    this._readableState.destroyed = true;
	  }

	  // if this is a duplex stream mark the writable part as destroyed as well
	  if (this._writableState) {
	    this._writableState.destroyed = true;
	  }
	  this._destroy(err || null, function (err) {
	    if (!cb && err) {
	      if (!_this._writableState) {
	        process.nextTick(emitErrorAndCloseNT, _this, err);
	      } else if (!_this._writableState.errorEmitted) {
	        _this._writableState.errorEmitted = true;
	        process.nextTick(emitErrorAndCloseNT, _this, err);
	      } else {
	        process.nextTick(emitCloseNT, _this);
	      }
	    } else if (cb) {
	      process.nextTick(emitCloseNT, _this);
	      cb(err);
	    } else {
	      process.nextTick(emitCloseNT, _this);
	    }
	  });
	  return this;
	}
	function emitErrorAndCloseNT(self, err) {
	  emitErrorNT(self, err);
	  emitCloseNT(self);
	}
	function emitCloseNT(self) {
	  if (self._writableState && !self._writableState.emitClose) return;
	  if (self._readableState && !self._readableState.emitClose) return;
	  self.emit('close');
	}
	function undestroy() {
	  if (this._readableState) {
	    this._readableState.destroyed = false;
	    this._readableState.reading = false;
	    this._readableState.ended = false;
	    this._readableState.endEmitted = false;
	  }
	  if (this._writableState) {
	    this._writableState.destroyed = false;
	    this._writableState.ended = false;
	    this._writableState.ending = false;
	    this._writableState.finalCalled = false;
	    this._writableState.prefinished = false;
	    this._writableState.finished = false;
	    this._writableState.errorEmitted = false;
	  }
	}
	function emitErrorNT(self, err) {
	  self.emit('error', err);
	}
	function errorOrDestroy(stream, err) {
	  // We have tests that rely on errors being emitted
	  // in the same tick, so changing this is semver major.
	  // For now when you opt-in to autoDestroy we allow
	  // the error to be emitted nextTick. In a future
	  // semver major update we should change the default to this.

	  var rState = stream._readableState;
	  var wState = stream._writableState;
	  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
	}
	destroy_1 = {
	  destroy: destroy,
	  undestroy: undestroy,
	  errorOrDestroy: errorOrDestroy
	};
	return destroy_1;
}

var errorsBrowser = {};

var hasRequiredErrorsBrowser;

function requireErrorsBrowser () {
	if (hasRequiredErrorsBrowser) return errorsBrowser;
	hasRequiredErrorsBrowser = 1;

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

	var codes = {};

	function createErrorType(code, message, Base) {
	  if (!Base) {
	    Base = Error;
	  }

	  function getMessage(arg1, arg2, arg3) {
	    if (typeof message === 'string') {
	      return message;
	    } else {
	      return message(arg1, arg2, arg3);
	    }
	  }

	  var NodeError =
	  /*#__PURE__*/
	  function (_Base) {
	    _inheritsLoose(NodeError, _Base);

	    function NodeError(arg1, arg2, arg3) {
	      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
	    }

	    return NodeError;
	  }(Base);

	  NodeError.prototype.name = Base.name;
	  NodeError.prototype.code = code;
	  codes[code] = NodeError;
	} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


	function oneOf(expected, thing) {
	  if (Array.isArray(expected)) {
	    var len = expected.length;
	    expected = expected.map(function (i) {
	      return String(i);
	    });

	    if (len > 2) {
	      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
	    } else if (len === 2) {
	      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
	    } else {
	      return "of ".concat(thing, " ").concat(expected[0]);
	    }
	  } else {
	    return "of ".concat(thing, " ").concat(String(expected));
	  }
	} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


	function startsWith(str, search, pos) {
	  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


	function endsWith(str, search, this_len) {
	  if (this_len === undefined || this_len > str.length) {
	    this_len = str.length;
	  }

	  return str.substring(this_len - search.length, this_len) === search;
	} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


	function includes(str, search, start) {
	  if (typeof start !== 'number') {
	    start = 0;
	  }

	  if (start + search.length > str.length) {
	    return false;
	  } else {
	    return str.indexOf(search, start) !== -1;
	  }
	}

	createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
	  return 'The value "' + value + '" is invalid for option "' + name + '"';
	}, TypeError);
	createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
	  // determiner: 'must be' or 'must not be'
	  var determiner;

	  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
	    determiner = 'must not be';
	    expected = expected.replace(/^not /, '');
	  } else {
	    determiner = 'must be';
	  }

	  var msg;

	  if (endsWith(name, ' argument')) {
	    // For cases like 'first argument'
	    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
	  } else {
	    var type = includes(name, '.') ? 'property' : 'argument';
	    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
	  }

	  msg += ". Received type ".concat(typeof actual);
	  return msg;
	}, TypeError);
	createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
	createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
	  return 'The ' + name + ' method is not implemented';
	});
	createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
	createErrorType('ERR_STREAM_DESTROYED', function (name) {
	  return 'Cannot call ' + name + ' after a stream was destroyed';
	});
	createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
	createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
	createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
	createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
	createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
	  return 'Unknown encoding: ' + arg;
	}, TypeError);
	createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
	errorsBrowser.codes = codes;
	return errorsBrowser;
}

var state;
var hasRequiredState;

function requireState () {
	if (hasRequiredState) return state;
	hasRequiredState = 1;

	var ERR_INVALID_OPT_VALUE = requireErrorsBrowser().codes.ERR_INVALID_OPT_VALUE;
	function highWaterMarkFrom(options, isDuplex, duplexKey) {
	  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
	}
	function getHighWaterMark(state, options, duplexKey, isDuplex) {
	  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
	  if (hwm != null) {
	    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
	      var name = isDuplex ? duplexKey : 'highWaterMark';
	      throw new ERR_INVALID_OPT_VALUE(name, hwm);
	    }
	    return Math.floor(hwm);
	  }

	  // Default value
	  return state.objectMode ? 16 : 16 * 1024;
	}
	state = {
	  getHighWaterMark: getHighWaterMark
	};
	return state;
}

var browser$1;
var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser$1;
	hasRequiredBrowser = 1;
	/**
	 * Module exports.
	 */

	browser$1 = deprecate;

	/**
	 * Mark that a method should not be used.
	 * Returns a modified function which warns once by default.
	 *
	 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
	 *
	 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
	 * will throw an Error when invoked.
	 *
	 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
	 * will invoke `console.trace()` instead of `console.error()`.
	 *
	 * @param {Function} fn - the function to deprecate
	 * @param {String} msg - the string to print to the console when `fn` is invoked
	 * @returns {Function} a new "deprecated" version of `fn`
	 * @api public
	 */

	function deprecate (fn, msg) {
	  if (config('noDeprecation')) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (config('throwDeprecation')) {
	        throw new Error(msg);
	      } else if (config('traceDeprecation')) {
	        console.trace(msg);
	      } else {
	        console.warn(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	}

	/**
	 * Checks `localStorage` for boolean values for the given `name`.
	 *
	 * @param {String} name
	 * @returns {Boolean}
	 * @api private
	 */

	function config (name) {
	  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
	  try {
	    if (!commonjsGlobal$1.localStorage) return false;
	  } catch (_) {
	    return false;
	  }
	  var val = commonjsGlobal$1.localStorage[name];
	  if (null == val) return false;
	  return String(val).toLowerCase() === 'true';
	}
	return browser$1;
}

var _stream_writable;
var hasRequired_stream_writable;

function require_stream_writable () {
	if (hasRequired_stream_writable) return _stream_writable;
	hasRequired_stream_writable = 1;

	_stream_writable = Writable;

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	  var _this = this;
	  this.next = null;
	  this.entry = null;
	  this.finish = function () {
	    onCorkedFinish(_this, state);
	  };
	}
	/* </replacement> */

	/*<replacement>*/
	var Duplex;
	/*</replacement>*/

	Writable.WritableState = WritableState;

	/*<replacement>*/
	var internalUtil = {
	  deprecate: requireBrowser()
	};
	/*</replacement>*/

	/*<replacement>*/
	var Stream = requireStreamBrowser();
	/*</replacement>*/

	var Buffer = requireBuffer().Buffer;
	var OurUint8Array = (typeof commonjsGlobal$1 !== 'undefined' ? commonjsGlobal$1 : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
	}
	var destroyImpl = requireDestroy();
	var _require = requireState(),
	  getHighWaterMark = _require.getHighWaterMark;
	var _require$codes = requireErrorsBrowser().codes,
	  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
	  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
	  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
	  ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
	  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
	  ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
	  ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
	  ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
	var errorOrDestroy = destroyImpl.errorOrDestroy;
	inherits_browserExports$1(Writable, Stream);
	function nop() {}
	function WritableState(options, stream, isDuplex) {
	  Duplex = Duplex || require_stream_duplex();
	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream,
	  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
	  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;
	  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex);

	  // if _final has been called
	  this.finalCalled = false;

	  // drain event flag.
	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;
	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // Should close be emitted on destroy. Defaults to true.
	  this.emitClose = options.emitClose !== false;

	  // Should .destroy() be called after 'finish' (and potentially 'end')
	  this.autoDestroy = !!options.autoDestroy;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest(this);
	}
	WritableState.prototype.getBuffer = function getBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};
	(function () {
	  try {
	    Object.defineProperty(WritableState.prototype, 'buffer', {
	      get: internalUtil.deprecate(function writableStateBufferGetter() {
	        return this.getBuffer();
	      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
	    });
	  } catch (_) {}
	})();

	// Test _writableState for inheritance to account for Duplex streams,
	// whose prototype chain only points to Readable.
	var realHasInstance;
	if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
	  realHasInstance = Function.prototype[Symbol.hasInstance];
	  Object.defineProperty(Writable, Symbol.hasInstance, {
	    value: function value(object) {
	      if (realHasInstance.call(this, object)) return true;
	      if (this !== Writable) return false;
	      return object && object._writableState instanceof WritableState;
	    }
	  });
	} else {
	  realHasInstance = function realHasInstance(object) {
	    return object instanceof this;
	  };
	}
	function Writable(options) {
	  Duplex = Duplex || require_stream_duplex();

	  // Writable ctor is applied to Duplexes, too.
	  // `realHasInstance` is necessary because using plain `instanceof`
	  // would return false, as no `_writableState` property is attached.

	  // Trying to use the custom `instanceof` for Writable here will also break the
	  // Node.js LazyTransform implementation, which has a non-trivial getter for
	  // `_writableState` that would lead to infinite recursion.

	  // Checking for a Stream.Duplex instance is faster here instead of inside
	  // the WritableState constructor, at least with V8 6.5
	  var isDuplex = this instanceof Duplex;
	  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
	  this._writableState = new WritableState(options, this, isDuplex);

	  // legacy.
	  this.writable = true;
	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;
	    if (typeof options.writev === 'function') this._writev = options.writev;
	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	    if (typeof options.final === 'function') this._final = options.final;
	  }
	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function () {
	  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
	};
	function writeAfterEnd(stream, cb) {
	  var er = new ERR_STREAM_WRITE_AFTER_END();
	  // TODO: defer error events consistently everywhere, not just the cb
	  errorOrDestroy(stream, er);
	  process.nextTick(cb, er);
	}

	// Checks that a user-supplied chunk is valid, especially for the particular
	// mode the stream is in. Currently this means that `null` is never accepted
	// and undefined/non-string values are only allowed in object mode.
	function validChunk(stream, state, chunk, cb) {
	  var er;
	  if (chunk === null) {
	    er = new ERR_STREAM_NULL_VALUES();
	  } else if (typeof chunk !== 'string' && !state.objectMode) {
	    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
	  }
	  if (er) {
	    errorOrDestroy(stream, er);
	    process.nextTick(cb, er);
	    return false;
	  }
	  return true;
	}
	Writable.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;
	  var isBuf = !state.objectMode && _isUint8Array(chunk);
	  if (isBuf && !Buffer.isBuffer(chunk)) {
	    chunk = _uint8ArrayToBuffer(chunk);
	  }
	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }
	  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
	  if (typeof cb !== 'function') cb = nop;
	  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
	  }
	  return ret;
	};
	Writable.prototype.cork = function () {
	  this._writableState.corked++;
	};
	Writable.prototype.uncork = function () {
	  var state = this._writableState;
	  if (state.corked) {
	    state.corked--;
	    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
	  }
	};
	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};
	Object.defineProperty(Writable.prototype, 'writableBuffer', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState && this._writableState.getBuffer();
	  }
	});
	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer.from(chunk, encoding);
	  }
	  return chunk;
	}
	Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.highWaterMark;
	  }
	});

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
	  if (!isBuf) {
	    var newChunk = decodeChunk(state, chunk, encoding);
	    if (chunk !== newChunk) {
	      isBuf = true;
	      encoding = 'buffer';
	      chunk = newChunk;
	    }
	  }
	  var len = state.objectMode ? 1 : chunk.length;
	  state.length += len;
	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;
	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = {
	      chunk: chunk,
	      encoding: encoding,
	      isBuf: isBuf,
	      callback: cb,
	      next: null
	    };
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite(stream, state, false, len, chunk, encoding, cb);
	  }
	  return ret;
	}
	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}
	function onwriteError(stream, state, sync, er, cb) {
	  --state.pendingcb;
	  if (sync) {
	    // defer the callback if we are being called synchronously
	    // to avoid piling up things on the stack
	    process.nextTick(cb, er);
	    // this can emit finish, and it will always happen
	    // after error
	    process.nextTick(finishMaybe, stream, state);
	    stream._writableState.errorEmitted = true;
	    errorOrDestroy(stream, er);
	  } else {
	    // the caller expect this to happen before if
	    // it is async
	    cb(er);
	    stream._writableState.errorEmitted = true;
	    errorOrDestroy(stream, er);
	    // this can emit finish, but finish must
	    // always follow error
	    finishMaybe(stream, state);
	  }
	}
	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}
	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;
	  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
	  onwriteStateUpdate(state);
	  if (er) onwriteError(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(state) || stream.destroyed;
	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer(stream, state);
	    }
	    if (sync) {
	      process.nextTick(afterWrite, stream, state, finished, cb);
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}
	function afterWrite(stream, state, finished, cb) {
	  if (!finished) onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;
	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;
	    var count = 0;
	    var allBuffers = true;
	    while (entry) {
	      buffer[count] = entry;
	      if (!entry.isBuf) allBuffers = false;
	      entry = entry.next;
	      count += 1;
	    }
	    buffer.allBuffers = allBuffers;
	    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest(state);
	    }
	    state.bufferedRequestCount = 0;
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;
	      doWrite(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      state.bufferedRequestCount--;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }
	    if (entry === null) state.lastBufferedRequest = null;
	  }
	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}
	Writable.prototype._write = function (chunk, encoding, cb) {
	  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
	};
	Writable.prototype._writev = null;
	Writable.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }
	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending) endWritable(this, state, cb);
	  return this;
	};
	Object.defineProperty(Writable.prototype, 'writableLength', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.length;
	  }
	});
	function needFinish(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}
	function callFinal(stream, state) {
	  stream._final(function (err) {
	    state.pendingcb--;
	    if (err) {
	      errorOrDestroy(stream, err);
	    }
	    state.prefinished = true;
	    stream.emit('prefinish');
	    finishMaybe(stream, state);
	  });
	}
	function prefinish(stream, state) {
	  if (!state.prefinished && !state.finalCalled) {
	    if (typeof stream._final === 'function' && !state.destroyed) {
	      state.pendingcb++;
	      state.finalCalled = true;
	      process.nextTick(callFinal, stream, state);
	    } else {
	      state.prefinished = true;
	      stream.emit('prefinish');
	    }
	  }
	}
	function finishMaybe(stream, state) {
	  var need = needFinish(state);
	  if (need) {
	    prefinish(stream, state);
	    if (state.pendingcb === 0) {
	      state.finished = true;
	      stream.emit('finish');
	      if (state.autoDestroy) {
	        // In case of duplex streams we need a way to detect
	        // if the readable side is ready for autoDestroy as well
	        var rState = stream._readableState;
	        if (!rState || rState.autoDestroy && rState.endEmitted) {
	          stream.destroy();
	        }
	      }
	    }
	  }
	  return need;
	}
	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
	  }
	  state.ended = true;
	  stream.writable = false;
	}
	function onCorkedFinish(corkReq, state, err) {
	  var entry = corkReq.entry;
	  corkReq.entry = null;
	  while (entry) {
	    var cb = entry.callback;
	    state.pendingcb--;
	    cb(err);
	    entry = entry.next;
	  }

	  // reuse the free corkReq.
	  state.corkedRequestsFree.next = corkReq;
	}
	Object.defineProperty(Writable.prototype, 'destroyed', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    if (this._writableState === undefined) {
	      return false;
	    }
	    return this._writableState.destroyed;
	  },
	  set: function set(value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._writableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._writableState.destroyed = value;
	  }
	});
	Writable.prototype.destroy = destroyImpl.destroy;
	Writable.prototype._undestroy = destroyImpl.undestroy;
	Writable.prototype._destroy = function (err, cb) {
	  cb(err);
	};
	return _stream_writable;
}

var _stream_duplex;
var hasRequired_stream_duplex;

function require_stream_duplex () {
	if (hasRequired_stream_duplex) return _stream_duplex;
	hasRequired_stream_duplex = 1;

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	};
	/*</replacement>*/

	_stream_duplex = Duplex;
	var Readable = require_stream_readable();
	var Writable = require_stream_writable();
	inherits_browserExports$1(Duplex, Readable);
	{
	  // Allow the keys array to be GC'ed.
	  var keys = objectKeys(Writable.prototype);
	  for (var v = 0; v < keys.length; v++) {
	    var method = keys[v];
	    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
	  }
	}
	function Duplex(options) {
	  if (!(this instanceof Duplex)) return new Duplex(options);
	  Readable.call(this, options);
	  Writable.call(this, options);
	  this.allowHalfOpen = true;
	  if (options) {
	    if (options.readable === false) this.readable = false;
	    if (options.writable === false) this.writable = false;
	    if (options.allowHalfOpen === false) {
	      this.allowHalfOpen = false;
	      this.once('end', onend);
	    }
	  }
	}
	Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.highWaterMark;
	  }
	});
	Object.defineProperty(Duplex.prototype, 'writableBuffer', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState && this._writableState.getBuffer();
	  }
	});
	Object.defineProperty(Duplex.prototype, 'writableLength', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.length;
	  }
	});

	// the no-half-open enforcer
	function onend() {
	  // If the writable side ended, then we're ok.
	  if (this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  process.nextTick(onEndNT, this);
	}
	function onEndNT(self) {
	  self.end();
	}
	Object.defineProperty(Duplex.prototype, 'destroyed', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed && this._writableState.destroyed;
	  },
	  set: function set(value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	    this._writableState.destroyed = value;
	  }
	});
	return _stream_duplex;
}

var string_decoder = {};

var safeBuffer = {exports: {}};

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

var hasRequiredSafeBuffer;

function requireSafeBuffer () {
	if (hasRequiredSafeBuffer) return safeBuffer.exports;
	hasRequiredSafeBuffer = 1;
	(function (module, exports) {
		/* eslint-disable node/no-deprecated-api */
		var buffer = requireBuffer();
		var Buffer = buffer.Buffer;

		// alternative to using Object.keys for old browsers
		function copyProps (src, dst) {
		  for (var key in src) {
		    dst[key] = src[key];
		  }
		}
		if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
		  module.exports = buffer;
		} else {
		  // Copy properties from require('buffer')
		  copyProps(buffer, exports);
		  exports.Buffer = SafeBuffer;
		}

		function SafeBuffer (arg, encodingOrOffset, length) {
		  return Buffer(arg, encodingOrOffset, length)
		}

		SafeBuffer.prototype = Object.create(Buffer.prototype);

		// Copy static methods from Buffer
		copyProps(Buffer, SafeBuffer);

		SafeBuffer.from = function (arg, encodingOrOffset, length) {
		  if (typeof arg === 'number') {
		    throw new TypeError('Argument must not be a number')
		  }
		  return Buffer(arg, encodingOrOffset, length)
		};

		SafeBuffer.alloc = function (size, fill, encoding) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  var buf = Buffer(size);
		  if (fill !== undefined) {
		    if (typeof encoding === 'string') {
		      buf.fill(fill, encoding);
		    } else {
		      buf.fill(fill);
		    }
		  } else {
		    buf.fill(0);
		  }
		  return buf
		};

		SafeBuffer.allocUnsafe = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return Buffer(size)
		};

		SafeBuffer.allocUnsafeSlow = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return buffer.SlowBuffer(size)
		}; 
	} (safeBuffer, safeBuffer.exports));
	return safeBuffer.exports;
}

var hasRequiredString_decoder;

function requireString_decoder () {
	if (hasRequiredString_decoder) return string_decoder;
	hasRequiredString_decoder = 1;

	/*<replacement>*/

	var Buffer = requireSafeBuffer().Buffer;
	/*</replacement>*/

	var isEncoding = Buffer.isEncoding || function (encoding) {
	  encoding = '' + encoding;
	  switch (encoding && encoding.toLowerCase()) {
	    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
	      return true;
	    default:
	      return false;
	  }
	};

	function _normalizeEncoding(enc) {
	  if (!enc) return 'utf8';
	  var retried;
	  while (true) {
	    switch (enc) {
	      case 'utf8':
	      case 'utf-8':
	        return 'utf8';
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return 'utf16le';
	      case 'latin1':
	      case 'binary':
	        return 'latin1';
	      case 'base64':
	      case 'ascii':
	      case 'hex':
	        return enc;
	      default:
	        if (retried) return; // undefined
	        enc = ('' + enc).toLowerCase();
	        retried = true;
	    }
	  }
	}
	// Do not cache `Buffer.isEncoding` when checking encoding names as some
	// modules monkey-patch it to support additional encodings
	function normalizeEncoding(enc) {
	  var nenc = _normalizeEncoding(enc);
	  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
	  return nenc || enc;
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters.
	string_decoder.StringDecoder = StringDecoder;
	function StringDecoder(encoding) {
	  this.encoding = normalizeEncoding(encoding);
	  var nb;
	  switch (this.encoding) {
	    case 'utf16le':
	      this.text = utf16Text;
	      this.end = utf16End;
	      nb = 4;
	      break;
	    case 'utf8':
	      this.fillLast = utf8FillLast;
	      nb = 4;
	      break;
	    case 'base64':
	      this.text = base64Text;
	      this.end = base64End;
	      nb = 3;
	      break;
	    default:
	      this.write = simpleWrite;
	      this.end = simpleEnd;
	      return;
	  }
	  this.lastNeed = 0;
	  this.lastTotal = 0;
	  this.lastChar = Buffer.allocUnsafe(nb);
	}

	StringDecoder.prototype.write = function (buf) {
	  if (buf.length === 0) return '';
	  var r;
	  var i;
	  if (this.lastNeed) {
	    r = this.fillLast(buf);
	    if (r === undefined) return '';
	    i = this.lastNeed;
	    this.lastNeed = 0;
	  } else {
	    i = 0;
	  }
	  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
	  return r || '';
	};

	StringDecoder.prototype.end = utf8End;

	// Returns only complete characters in a Buffer
	StringDecoder.prototype.text = utf8Text;

	// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
	StringDecoder.prototype.fillLast = function (buf) {
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
	  this.lastNeed -= buf.length;
	};

	// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
	// continuation byte. If an invalid byte is detected, -2 is returned.
	function utf8CheckByte(byte) {
	  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
	  return byte >> 6 === 0x02 ? -1 : -2;
	}

	// Checks at most 3 bytes at the end of a Buffer in order to detect an
	// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
	// needed to complete the UTF-8 character (if applicable) are returned.
	function utf8CheckIncomplete(self, buf, i) {
	  var j = buf.length - 1;
	  if (j < i) return 0;
	  var nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 1;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 2;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) {
	      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
	    }
	    return nb;
	  }
	  return 0;
	}

	// Validates as many continuation bytes for a multi-byte UTF-8 character as
	// needed or are available. If we see a non-continuation byte where we expect
	// one, we "replace" the validated continuation bytes we've seen so far with
	// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
	// behavior. The continuation byte check is included three times in the case
	// where all of the continuation bytes for a character exist in the same buffer.
	// It is also done this way as a slight performance increase instead of using a
	// loop.
	function utf8CheckExtraBytes(self, buf, p) {
	  if ((buf[0] & 0xC0) !== 0x80) {
	    self.lastNeed = 0;
	    return '\ufffd';
	  }
	  if (self.lastNeed > 1 && buf.length > 1) {
	    if ((buf[1] & 0xC0) !== 0x80) {
	      self.lastNeed = 1;
	      return '\ufffd';
	    }
	    if (self.lastNeed > 2 && buf.length > 2) {
	      if ((buf[2] & 0xC0) !== 0x80) {
	        self.lastNeed = 2;
	        return '\ufffd';
	      }
	    }
	  }
	}

	// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
	function utf8FillLast(buf) {
	  var p = this.lastTotal - this.lastNeed;
	  var r = utf8CheckExtraBytes(this, buf);
	  if (r !== undefined) return r;
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, p, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, p, 0, buf.length);
	  this.lastNeed -= buf.length;
	}

	// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
	// partial character, the character's bytes are buffered until the required
	// number of bytes are available.
	function utf8Text(buf, i) {
	  var total = utf8CheckIncomplete(this, buf, i);
	  if (!this.lastNeed) return buf.toString('utf8', i);
	  this.lastTotal = total;
	  var end = buf.length - (total - this.lastNeed);
	  buf.copy(this.lastChar, 0, end);
	  return buf.toString('utf8', i, end);
	}

	// For UTF-8, a replacement character is added when ending on a partial
	// character.
	function utf8End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + '\ufffd';
	  return r;
	}

	// UTF-16LE typically needs two bytes per character, but even if we have an even
	// number of bytes available, we need to check if we end on a leading/high
	// surrogate. In that case, we need to wait for the next two bytes in order to
	// decode the last character properly.
	function utf16Text(buf, i) {
	  if ((buf.length - i) % 2 === 0) {
	    var r = buf.toString('utf16le', i);
	    if (r) {
	      var c = r.charCodeAt(r.length - 1);
	      if (c >= 0xD800 && c <= 0xDBFF) {
	        this.lastNeed = 2;
	        this.lastTotal = 4;
	        this.lastChar[0] = buf[buf.length - 2];
	        this.lastChar[1] = buf[buf.length - 1];
	        return r.slice(0, -1);
	      }
	    }
	    return r;
	  }
	  this.lastNeed = 1;
	  this.lastTotal = 2;
	  this.lastChar[0] = buf[buf.length - 1];
	  return buf.toString('utf16le', i, buf.length - 1);
	}

	// For UTF-16LE we do not explicitly append special replacement characters if we
	// end on a partial character, we simply let v8 handle that.
	function utf16End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) {
	    var end = this.lastTotal - this.lastNeed;
	    return r + this.lastChar.toString('utf16le', 0, end);
	  }
	  return r;
	}

	function base64Text(buf, i) {
	  var n = (buf.length - i) % 3;
	  if (n === 0) return buf.toString('base64', i);
	  this.lastNeed = 3 - n;
	  this.lastTotal = 3;
	  if (n === 1) {
	    this.lastChar[0] = buf[buf.length - 1];
	  } else {
	    this.lastChar[0] = buf[buf.length - 2];
	    this.lastChar[1] = buf[buf.length - 1];
	  }
	  return buf.toString('base64', i, buf.length - n);
	}

	function base64End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
	  return r;
	}

	// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
	function simpleWrite(buf) {
	  return buf.toString(this.encoding);
	}

	function simpleEnd(buf) {
	  return buf && buf.length ? this.write(buf) : '';
	}
	return string_decoder;
}

var endOfStream;
var hasRequiredEndOfStream;

function requireEndOfStream () {
	if (hasRequiredEndOfStream) return endOfStream;
	hasRequiredEndOfStream = 1;

	var ERR_STREAM_PREMATURE_CLOSE = requireErrorsBrowser().codes.ERR_STREAM_PREMATURE_CLOSE;
	function once(callback) {
	  var called = false;
	  return function () {
	    if (called) return;
	    called = true;
	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	    callback.apply(this, args);
	  };
	}
	function noop() {}
	function isRequest(stream) {
	  return stream.setHeader && typeof stream.abort === 'function';
	}
	function eos(stream, opts, callback) {
	  if (typeof opts === 'function') return eos(stream, null, opts);
	  if (!opts) opts = {};
	  callback = once(callback || noop);
	  var readable = opts.readable || opts.readable !== false && stream.readable;
	  var writable = opts.writable || opts.writable !== false && stream.writable;
	  var onlegacyfinish = function onlegacyfinish() {
	    if (!stream.writable) onfinish();
	  };
	  var writableEnded = stream._writableState && stream._writableState.finished;
	  var onfinish = function onfinish() {
	    writable = false;
	    writableEnded = true;
	    if (!readable) callback.call(stream);
	  };
	  var readableEnded = stream._readableState && stream._readableState.endEmitted;
	  var onend = function onend() {
	    readable = false;
	    readableEnded = true;
	    if (!writable) callback.call(stream);
	  };
	  var onerror = function onerror(err) {
	    callback.call(stream, err);
	  };
	  var onclose = function onclose() {
	    var err;
	    if (readable && !readableEnded) {
	      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
	      return callback.call(stream, err);
	    }
	    if (writable && !writableEnded) {
	      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
	      return callback.call(stream, err);
	    }
	  };
	  var onrequest = function onrequest() {
	    stream.req.on('finish', onfinish);
	  };
	  if (isRequest(stream)) {
	    stream.on('complete', onfinish);
	    stream.on('abort', onclose);
	    if (stream.req) onrequest();else stream.on('request', onrequest);
	  } else if (writable && !stream._writableState) {
	    // legacy streams
	    stream.on('end', onlegacyfinish);
	    stream.on('close', onlegacyfinish);
	  }
	  stream.on('end', onend);
	  stream.on('finish', onfinish);
	  if (opts.error !== false) stream.on('error', onerror);
	  stream.on('close', onclose);
	  return function () {
	    stream.removeListener('complete', onfinish);
	    stream.removeListener('abort', onclose);
	    stream.removeListener('request', onrequest);
	    if (stream.req) stream.req.removeListener('finish', onfinish);
	    stream.removeListener('end', onlegacyfinish);
	    stream.removeListener('close', onlegacyfinish);
	    stream.removeListener('finish', onfinish);
	    stream.removeListener('end', onend);
	    stream.removeListener('error', onerror);
	    stream.removeListener('close', onclose);
	  };
	}
	endOfStream = eos;
	return endOfStream;
}

var async_iterator;
var hasRequiredAsync_iterator;

function requireAsync_iterator () {
	if (hasRequiredAsync_iterator) return async_iterator;
	hasRequiredAsync_iterator = 1;

	var _Object$setPrototypeO;
	function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
	function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
	var finished = requireEndOfStream();
	var kLastResolve = Symbol('lastResolve');
	var kLastReject = Symbol('lastReject');
	var kError = Symbol('error');
	var kEnded = Symbol('ended');
	var kLastPromise = Symbol('lastPromise');
	var kHandlePromise = Symbol('handlePromise');
	var kStream = Symbol('stream');
	function createIterResult(value, done) {
	  return {
	    value: value,
	    done: done
	  };
	}
	function readAndResolve(iter) {
	  var resolve = iter[kLastResolve];
	  if (resolve !== null) {
	    var data = iter[kStream].read();
	    // we defer if data is null
	    // we can be expecting either 'end' or
	    // 'error'
	    if (data !== null) {
	      iter[kLastPromise] = null;
	      iter[kLastResolve] = null;
	      iter[kLastReject] = null;
	      resolve(createIterResult(data, false));
	    }
	  }
	}
	function onReadable(iter) {
	  // we wait for the next tick, because it might
	  // emit an error with process.nextTick
	  process.nextTick(readAndResolve, iter);
	}
	function wrapForNext(lastPromise, iter) {
	  return function (resolve, reject) {
	    lastPromise.then(function () {
	      if (iter[kEnded]) {
	        resolve(createIterResult(undefined, true));
	        return;
	      }
	      iter[kHandlePromise](resolve, reject);
	    }, reject);
	  };
	}
	var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
	var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
	  get stream() {
	    return this[kStream];
	  },
	  next: function next() {
	    var _this = this;
	    // if we have detected an error in the meanwhile
	    // reject straight away
	    var error = this[kError];
	    if (error !== null) {
	      return Promise.reject(error);
	    }
	    if (this[kEnded]) {
	      return Promise.resolve(createIterResult(undefined, true));
	    }
	    if (this[kStream].destroyed) {
	      // We need to defer via nextTick because if .destroy(err) is
	      // called, the error will be emitted via nextTick, and
	      // we cannot guarantee that there is no error lingering around
	      // waiting to be emitted.
	      return new Promise(function (resolve, reject) {
	        process.nextTick(function () {
	          if (_this[kError]) {
	            reject(_this[kError]);
	          } else {
	            resolve(createIterResult(undefined, true));
	          }
	        });
	      });
	    }

	    // if we have multiple next() calls
	    // we will wait for the previous Promise to finish
	    // this logic is optimized to support for await loops,
	    // where next() is only called once at a time
	    var lastPromise = this[kLastPromise];
	    var promise;
	    if (lastPromise) {
	      promise = new Promise(wrapForNext(lastPromise, this));
	    } else {
	      // fast path needed to support multiple this.push()
	      // without triggering the next() queue
	      var data = this[kStream].read();
	      if (data !== null) {
	        return Promise.resolve(createIterResult(data, false));
	      }
	      promise = new Promise(this[kHandlePromise]);
	    }
	    this[kLastPromise] = promise;
	    return promise;
	  }
	}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
	  return this;
	}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
	  var _this2 = this;
	  // destroy(err, cb) is a private API
	  // we can guarantee we have that here, because we control the
	  // Readable class this is attached to
	  return new Promise(function (resolve, reject) {
	    _this2[kStream].destroy(null, function (err) {
	      if (err) {
	        reject(err);
	        return;
	      }
	      resolve(createIterResult(undefined, true));
	    });
	  });
	}), _Object$setPrototypeO), AsyncIteratorPrototype);
	var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
	  var _Object$create;
	  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
	    value: stream,
	    writable: true
	  }), _defineProperty(_Object$create, kLastResolve, {
	    value: null,
	    writable: true
	  }), _defineProperty(_Object$create, kLastReject, {
	    value: null,
	    writable: true
	  }), _defineProperty(_Object$create, kError, {
	    value: null,
	    writable: true
	  }), _defineProperty(_Object$create, kEnded, {
	    value: stream._readableState.endEmitted,
	    writable: true
	  }), _defineProperty(_Object$create, kHandlePromise, {
	    value: function value(resolve, reject) {
	      var data = iterator[kStream].read();
	      if (data) {
	        iterator[kLastPromise] = null;
	        iterator[kLastResolve] = null;
	        iterator[kLastReject] = null;
	        resolve(createIterResult(data, false));
	      } else {
	        iterator[kLastResolve] = resolve;
	        iterator[kLastReject] = reject;
	      }
	    },
	    writable: true
	  }), _Object$create));
	  iterator[kLastPromise] = null;
	  finished(stream, function (err) {
	    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
	      var reject = iterator[kLastReject];
	      // reject if we are waiting for data in the Promise
	      // returned by next() and store the error
	      if (reject !== null) {
	        iterator[kLastPromise] = null;
	        iterator[kLastResolve] = null;
	        iterator[kLastReject] = null;
	        reject(err);
	      }
	      iterator[kError] = err;
	      return;
	    }
	    var resolve = iterator[kLastResolve];
	    if (resolve !== null) {
	      iterator[kLastPromise] = null;
	      iterator[kLastResolve] = null;
	      iterator[kLastReject] = null;
	      resolve(createIterResult(undefined, true));
	    }
	    iterator[kEnded] = true;
	  });
	  stream.on('readable', onReadable.bind(null, iterator));
	  return iterator;
	};
	async_iterator = createReadableStreamAsyncIterator;
	return async_iterator;
}

var fromBrowser;
var hasRequiredFromBrowser;

function requireFromBrowser () {
	if (hasRequiredFromBrowser) return fromBrowser;
	hasRequiredFromBrowser = 1;
	fromBrowser = function () {
	  throw new Error('Readable.from is not available in the browser')
	};
	return fromBrowser;
}

var _stream_readable;
var hasRequired_stream_readable;

function require_stream_readable () {
	if (hasRequired_stream_readable) return _stream_readable;
	hasRequired_stream_readable = 1;

	_stream_readable = Readable;

	/*<replacement>*/
	var Duplex;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	/*<replacement>*/
	eventsExports$1.EventEmitter;
	var EElistenerCount = function EElistenerCount(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	/*<replacement>*/
	var Stream = requireStreamBrowser();
	/*</replacement>*/

	var Buffer = requireBuffer().Buffer;
	var OurUint8Array = (typeof commonjsGlobal$1 !== 'undefined' ? commonjsGlobal$1 : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
	}

	/*<replacement>*/
	var debugUtil = require$$3;
	var debug;
	if (debugUtil && debugUtil.debuglog) {
	  debug = debugUtil.debuglog('stream');
	} else {
	  debug = function debug() {};
	}
	/*</replacement>*/

	var BufferList = requireBuffer_list();
	var destroyImpl = requireDestroy();
	var _require = requireState(),
	  getHighWaterMark = _require.getHighWaterMark;
	var _require$codes = requireErrorsBrowser().codes,
	  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
	  ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
	  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
	  ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;

	// Lazy loaded to improve the startup performance.
	var StringDecoder;
	var createReadableStreamAsyncIterator;
	var from;
	inherits_browserExports$1(Readable, Stream);
	var errorOrDestroy = destroyImpl.errorOrDestroy;
	var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

	  // This is a hack to make sure that our error handler is attached before any
	  // userland ones.  NEVER DO THIS. This is here only because this code needs
	  // to continue to work with older versions of Node.js that do not include
	  // the prependListener() method. The goal is to eventually remove this hack.
	  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
	}
	function ReadableState(options, stream, isDuplex) {
	  Duplex = Duplex || require_stream_duplex();
	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;
	  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex);

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the event 'readable'/'data' is emitted
	  // immediately, or on a later tick.  We set this to true at first, because
	  // any actions that shouldn't happen until "later" should generally also
	  // not happen before the first read call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;
	  this.paused = true;

	  // Should close be emitted on destroy. Defaults to true.
	  this.emitClose = options.emitClose !== false;

	  // Should .destroy() be called after 'end' (and potentially 'finish')
	  this.autoDestroy = !!options.autoDestroy;

	  // has it been destroyed
	  this.destroyed = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;
	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}
	function Readable(options) {
	  Duplex = Duplex || require_stream_duplex();
	  if (!(this instanceof Readable)) return new Readable(options);

	  // Checking for a Stream.Duplex instance is faster here instead of inside
	  // the ReadableState constructor, at least with V8 6.5
	  var isDuplex = this instanceof Duplex;
	  this._readableState = new ReadableState(options, this, isDuplex);

	  // legacy
	  this.readable = true;
	  if (options) {
	    if (typeof options.read === 'function') this._read = options.read;
	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	  }
	  Stream.call(this);
	}
	Object.defineProperty(Readable.prototype, 'destroyed', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    if (this._readableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed;
	  },
	  set: function set(value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._readableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	  }
	});
	Readable.prototype.destroy = destroyImpl.destroy;
	Readable.prototype._undestroy = destroyImpl.undestroy;
	Readable.prototype._destroy = function (err, cb) {
	  cb(err);
	};

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;
	  var skipChunkCheck;
	  if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      encoding = encoding || state.defaultEncoding;
	      if (encoding !== state.encoding) {
	        chunk = Buffer.from(chunk, encoding);
	        encoding = '';
	      }
	      skipChunkCheck = true;
	    }
	  } else {
	    skipChunkCheck = true;
	  }
	  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function (chunk) {
	  return readableAddChunk(this, chunk, null, true, false);
	};
	function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
	  debug('readableAddChunk', chunk);
	  var state = stream._readableState;
	  if (chunk === null) {
	    state.reading = false;
	    onEofChunk(stream, state);
	  } else {
	    var er;
	    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
	    if (er) {
	      errorOrDestroy(stream, er);
	    } else if (state.objectMode || chunk && chunk.length > 0) {
	      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
	        chunk = _uint8ArrayToBuffer(chunk);
	      }
	      if (addToFront) {
	        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
	      } else if (state.ended) {
	        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
	      } else if (state.destroyed) {
	        return false;
	      } else {
	        state.reading = false;
	        if (state.decoder && !encoding) {
	          chunk = state.decoder.write(chunk);
	          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
	        } else {
	          addChunk(stream, state, chunk, false);
	        }
	      }
	    } else if (!addToFront) {
	      state.reading = false;
	      maybeReadMore(stream, state);
	    }
	  }

	  // We can push more data if we are below the highWaterMark.
	  // Also, if we have no data yet, we can stand some more bytes.
	  // This is to work around cases where hwm=0, such as the repl.
	  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
	}
	function addChunk(stream, state, chunk, addToFront) {
	  if (state.flowing && state.length === 0 && !state.sync) {
	    state.awaitDrain = 0;
	    stream.emit('data', chunk);
	  } else {
	    // update the buffer info.
	    state.length += state.objectMode ? 1 : chunk.length;
	    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
	    if (state.needReadable) emitReadable(stream);
	  }
	  maybeReadMore(stream, state);
	}
	function chunkInvalid(state, chunk) {
	  var er;
	  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
	  }
	  return er;
	}
	Readable.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	// backwards compatibility.
	Readable.prototype.setEncoding = function (enc) {
	  if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
	  var decoder = new StringDecoder(enc);
	  this._readableState.decoder = decoder;
	  // If setEncoding(null), decoder.encoding equals utf8
	  this._readableState.encoding = this._readableState.decoder.encoding;

	  // Iterate over current buffer to convert already stored Buffers:
	  var p = this._readableState.buffer.head;
	  var content = '';
	  while (p !== null) {
	    content += decoder.write(p.data);
	    p = p.next;
	  }
	  this._readableState.buffer.clear();
	  if (content !== '') this._readableState.buffer.push(content);
	  this._readableState.length = content.length;
	  return this;
	};

	// Don't raise the hwm > 1GB
	var MAX_HWM = 0x40000000;
	function computeNewHighWaterMark(n) {
	  if (n >= MAX_HWM) {
	    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function (n) {
	  debug('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;
	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
	    return null;
	  }
	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  } else if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead(nOrig, state);
	  }
	  var ret;
	  if (n > 0) ret = fromList(n, state);else ret = null;
	  if (ret === null) {
	    state.needReadable = state.length <= state.highWaterMark;
	    n = 0;
	  } else {
	    state.length -= n;
	    state.awaitDrain = 0;
	  }
	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable(this);
	  }
	  if (ret !== null) this.emit('data', ret);
	  return ret;
	};
	function onEofChunk(stream, state) {
	  debug('onEofChunk');
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;
	  if (state.sync) {
	    // if we are sync, wait until next tick to emit the data.
	    // Otherwise we risk emitting data in the flow()
	    // the readable code triggers during a read() call
	    emitReadable(stream);
	  } else {
	    // emit 'readable' now to make sure it gets picked up.
	    state.needReadable = false;
	    if (!state.emittedReadable) {
	      state.emittedReadable = true;
	      emitReadable_(stream);
	    }
	  }
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  debug('emitReadable', state.needReadable, state.emittedReadable);
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    process.nextTick(emitReadable_, stream);
	  }
	}
	function emitReadable_(stream) {
	  var state = stream._readableState;
	  debug('emitReadable_', state.destroyed, state.length, state.ended);
	  if (!state.destroyed && (state.length || state.ended)) {
	    stream.emit('readable');
	    state.emittedReadable = false;
	  }

	  // The stream needs another readable event if
	  // 1. It is not flowing, as the flow mechanism will take
	  //    care of it.
	  // 2. It is not ended.
	  // 3. It is below the highWaterMark, so we can schedule
	  //    another readable later.
	  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
	  flow(stream);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(maybeReadMore_, stream, state);
	  }
	}
	function maybeReadMore_(stream, state) {
	  // Attempt to read more data if we should.
	  //
	  // The conditions for reading more data are (one of):
	  // - Not enough data buffered (state.length < state.highWaterMark). The loop
	  //   is responsible for filling the buffer with enough data if such data
	  //   is available. If highWaterMark is 0 and we are not in the flowing mode
	  //   we should _not_ attempt to buffer any extra data. We'll get more data
	  //   when the stream consumer calls read() instead.
	  // - No data in the buffer, and the stream is in flowing mode. In this mode
	  //   the loop below is responsible for ensuring read() is called. Failing to
	  //   call read here would abort the flow and there's no other mechanism for
	  //   continuing the flow if the stream consumer has just subscribed to the
	  //   'data' event.
	  //
	  // In addition to the above conditions to keep reading data, the following
	  // conditions prevent the data from being read:
	  // - The stream has ended (state.ended).
	  // - There is already a pending 'read' operation (state.reading). This is a
	  //   case where the the stream has called the implementation defined _read()
	  //   method, but they are processing the call asynchronously and have _not_
	  //   called push() with new data. In this case we skip performing more
	  //   read()s. The execution ends in this method again after the _read() ends
	  //   up calling push() with more data.
	  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
	    var len = state.length;
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function (n) {
	  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
	};
	Readable.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;
	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
	  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
	  var endFn = doEnd ? onend : unpipe;
	  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable, unpipeInfo) {
	    debug('onunpipe');
	    if (readable === src) {
	      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
	        unpipeInfo.hasUnpiped = true;
	        cleanup();
	      }
	    }
	  }
	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);
	  var cleanedUp = false;
	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', unpipe);
	    src.removeListener('data', ondata);
	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    var ret = dest.write(chunk);
	    debug('dest.write', ret);
	    if (ret === false) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug('false write response, pause', state.awaitDrain);
	        state.awaitDrain++;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);
	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }
	  return dest;
	};
	function pipeOnDrain(src) {
	  return function pipeOnDrainFunctionResult() {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}
	Readable.prototype.unpipe = function (dest) {
	  var state = this._readableState;
	  var unpipeInfo = {
	    hasUnpiped: false
	  };

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;
	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this, unpipeInfo);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    for (var i = 0; i < len; i++) dests[i].emit('unpipe', this, {
	      hasUnpiped: false
	    });
	    return this;
	  }

	  // try to find the right one.
	  var index = indexOf(state.pipes, dest);
	  if (index === -1) return this;
	  state.pipes.splice(index, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];
	  dest.emit('unpipe', this, unpipeInfo);
	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function (ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);
	  var state = this._readableState;
	  if (ev === 'data') {
	    // update readableListening so that resume() may be a no-op
	    // a few lines down. This is needed to support once('readable').
	    state.readableListening = this.listenerCount('readable') > 0;

	    // Try start flowing on next tick if stream isn't explicitly paused
	    if (state.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.flowing = false;
	      state.emittedReadable = false;
	      debug('on readable', state.length, state.reading);
	      if (state.length) {
	        emitReadable(this);
	      } else if (!state.reading) {
	        process.nextTick(nReadingNextTick, this);
	      }
	    }
	  }
	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;
	Readable.prototype.removeListener = function (ev, fn) {
	  var res = Stream.prototype.removeListener.call(this, ev, fn);
	  if (ev === 'readable') {
	    // We need to check if there is someone still listening to
	    // readable and reset the state. However this needs to happen
	    // after readable has been emitted but before I/O (nextTick) to
	    // support once('readable', fn) cycles. This means that calling
	    // resume within the same tick will have no
	    // effect.
	    process.nextTick(updateReadableListening, this);
	  }
	  return res;
	};
	Readable.prototype.removeAllListeners = function (ev) {
	  var res = Stream.prototype.removeAllListeners.apply(this, arguments);
	  if (ev === 'readable' || ev === undefined) {
	    // We need to check if there is someone still listening to
	    // readable and reset the state. However this needs to happen
	    // after readable has been emitted but before I/O (nextTick) to
	    // support once('readable', fn) cycles. This means that calling
	    // resume within the same tick will have no
	    // effect.
	    process.nextTick(updateReadableListening, this);
	  }
	  return res;
	};
	function updateReadableListening(self) {
	  var state = self._readableState;
	  state.readableListening = self.listenerCount('readable') > 0;
	  if (state.resumeScheduled && !state.paused) {
	    // flowing needs to be set to true now, otherwise
	    // the upcoming resume will not flow.
	    state.flowing = true;

	    // crude way to check if we should resume
	  } else if (self.listenerCount('data') > 0) {
	    self.resume();
	  }
	}
	function nReadingNextTick(self) {
	  debug('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    // we flow only if there is no one listening
	    // for readable, but we still have to call
	    // resume()
	    state.flowing = !state.readableListening;
	    resume(this, state);
	  }
	  state.paused = false;
	  return this;
	};
	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    process.nextTick(resume_, stream, state);
	  }
	}
	function resume_(stream, state) {
	  debug('resume', state.reading);
	  if (!state.reading) {
	    stream.read(0);
	  }
	  state.resumeScheduled = false;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}
	Readable.prototype.pause = function () {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (this._readableState.flowing !== false) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  this._readableState.paused = true;
	  return this;
	};
	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  while (state.flowing && stream.read() !== null);
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function (stream) {
	  var _this = this;
	  var state = this._readableState;
	  var paused = false;
	  stream.on('end', function () {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) _this.push(chunk);
	    }
	    _this.push(null);
	  });
	  stream.on('data', function (chunk) {
	    debug('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;
	    var ret = _this.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function methodWrap(method) {
	        return function methodWrapReturnFunction() {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  for (var n = 0; n < kProxyEvents.length; n++) {
	    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
	  }

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  this._read = function (n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };
	  return this;
	};
	if (typeof Symbol === 'function') {
	  Readable.prototype[Symbol.asyncIterator] = function () {
	    if (createReadableStreamAsyncIterator === undefined) {
	      createReadableStreamAsyncIterator = requireAsync_iterator();
	    }
	    return createReadableStreamAsyncIterator(this);
	  };
	}
	Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState.highWaterMark;
	  }
	});
	Object.defineProperty(Readable.prototype, 'readableBuffer', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState && this._readableState.buffer;
	  }
	});
	Object.defineProperty(Readable.prototype, 'readableFlowing', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState.flowing;
	  },
	  set: function set(state) {
	    if (this._readableState) {
	      this._readableState.flowing = state;
	    }
	  }
	});

	// exposed for testing purposes only.
	Readable._fromList = fromList;
	Object.defineProperty(Readable.prototype, 'readableLength', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState.length;
	  }
	});

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;
	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = state.buffer.consume(n, state.decoder);
	  }
	  return ret;
	}
	function endReadable(stream) {
	  var state = stream._readableState;
	  debug('endReadable', state.endEmitted);
	  if (!state.endEmitted) {
	    state.ended = true;
	    process.nextTick(endReadableNT, state, stream);
	  }
	}
	function endReadableNT(state, stream) {
	  debug('endReadableNT', state.endEmitted, state.length);

	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');
	    if (state.autoDestroy) {
	      // In case of duplex streams we need a way to detect
	      // if the writable side is ready for autoDestroy as well
	      var wState = stream._writableState;
	      if (!wState || wState.autoDestroy && wState.finished) {
	        stream.destroy();
	      }
	    }
	  }
	}
	if (typeof Symbol === 'function') {
	  Readable.from = function (iterable, opts) {
	    if (from === undefined) {
	      from = requireFromBrowser();
	    }
	    return from(Readable, iterable, opts);
	  };
	}
	function indexOf(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}
	return _stream_readable;
}

var _stream_transform;
var hasRequired_stream_transform;

function require_stream_transform () {
	if (hasRequired_stream_transform) return _stream_transform;
	hasRequired_stream_transform = 1;

	_stream_transform = Transform;
	var _require$codes = requireErrorsBrowser().codes,
	  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
	  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
	  ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
	  ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
	var Duplex = require_stream_duplex();
	inherits_browserExports$1(Transform, Duplex);
	function afterTransform(er, data) {
	  var ts = this._transformState;
	  ts.transforming = false;
	  var cb = ts.writecb;
	  if (cb === null) {
	    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
	  }
	  ts.writechunk = null;
	  ts.writecb = null;
	  if (data != null)
	    // single equals check for both `null` and `undefined`
	    this.push(data);
	  cb(er);
	  var rs = this._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    this._read(rs.highWaterMark);
	  }
	}
	function Transform(options) {
	  if (!(this instanceof Transform)) return new Transform(options);
	  Duplex.call(this, options);
	  this._transformState = {
	    afterTransform: afterTransform.bind(this),
	    needTransform: false,
	    transforming: false,
	    writecb: null,
	    writechunk: null,
	    writeencoding: null
	  };

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;
	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;
	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  // When the writable side finishes, then flush out anything remaining.
	  this.on('prefinish', prefinish);
	}
	function prefinish() {
	  var _this = this;
	  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
	    this._flush(function (er, data) {
	      done(_this, er, data);
	    });
	  } else {
	    done(this, null, null);
	  }
	}
	Transform.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function (chunk, encoding, cb) {
	  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
	};
	Transform.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function (n) {
	  var ts = this._transformState;
	  if (ts.writechunk !== null && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};
	Transform.prototype._destroy = function (err, cb) {
	  Duplex.prototype._destroy.call(this, err, function (err2) {
	    cb(err2);
	  });
	};
	function done(stream, er, data) {
	  if (er) return stream.emit('error', er);
	  if (data != null)
	    // single equals check for both `null` and `undefined`
	    stream.push(data);

	  // TODO(BridgeAR): Write a test for these two error cases
	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
	  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
	  return stream.push(null);
	}
	return _stream_transform;
}

var _stream_passthrough;
var hasRequired_stream_passthrough;

function require_stream_passthrough () {
	if (hasRequired_stream_passthrough) return _stream_passthrough;
	hasRequired_stream_passthrough = 1;

	_stream_passthrough = PassThrough;
	var Transform = require_stream_transform();
	inherits_browserExports$1(PassThrough, Transform);
	function PassThrough(options) {
	  if (!(this instanceof PassThrough)) return new PassThrough(options);
	  Transform.call(this, options);
	}
	PassThrough.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};
	return _stream_passthrough;
}

var pipeline_1;
var hasRequiredPipeline;

function requirePipeline () {
	if (hasRequiredPipeline) return pipeline_1;
	hasRequiredPipeline = 1;

	var eos;
	function once(callback) {
	  var called = false;
	  return function () {
	    if (called) return;
	    called = true;
	    callback.apply(void 0, arguments);
	  };
	}
	var _require$codes = requireErrorsBrowser().codes,
	  ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
	  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
	function noop(err) {
	  // Rethrow the error if it exists to avoid swallowing it
	  if (err) throw err;
	}
	function isRequest(stream) {
	  return stream.setHeader && typeof stream.abort === 'function';
	}
	function destroyer(stream, reading, writing, callback) {
	  callback = once(callback);
	  var closed = false;
	  stream.on('close', function () {
	    closed = true;
	  });
	  if (eos === undefined) eos = requireEndOfStream();
	  eos(stream, {
	    readable: reading,
	    writable: writing
	  }, function (err) {
	    if (err) return callback(err);
	    closed = true;
	    callback();
	  });
	  var destroyed = false;
	  return function (err) {
	    if (closed) return;
	    if (destroyed) return;
	    destroyed = true;

	    // request.destroy just do .end - .abort is what we want
	    if (isRequest(stream)) return stream.abort();
	    if (typeof stream.destroy === 'function') return stream.destroy();
	    callback(err || new ERR_STREAM_DESTROYED('pipe'));
	  };
	}
	function call(fn) {
	  fn();
	}
	function pipe(from, to) {
	  return from.pipe(to);
	}
	function popCallback(streams) {
	  if (!streams.length) return noop;
	  if (typeof streams[streams.length - 1] !== 'function') return noop;
	  return streams.pop();
	}
	function pipeline() {
	  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
	    streams[_key] = arguments[_key];
	  }
	  var callback = popCallback(streams);
	  if (Array.isArray(streams[0])) streams = streams[0];
	  if (streams.length < 2) {
	    throw new ERR_MISSING_ARGS('streams');
	  }
	  var error;
	  var destroys = streams.map(function (stream, i) {
	    var reading = i < streams.length - 1;
	    var writing = i > 0;
	    return destroyer(stream, reading, writing, function (err) {
	      if (!error) error = err;
	      if (err) destroys.forEach(call);
	      if (reading) return;
	      destroys.forEach(call);
	      callback(error);
	    });
	  });
	  return streams.reduce(pipe);
	}
	pipeline_1 = pipeline;
	return pipeline_1;
}

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var streamBrowserify = Stream;

var EE = eventsExports$1.EventEmitter;
var inherits = inherits_browserExports$1;

inherits(Stream, EE);
Stream.Readable = require_stream_readable();
Stream.Writable = require_stream_writable();
Stream.Duplex = require_stream_duplex();
Stream.Transform = require_stream_transform();
Stream.PassThrough = require_stream_passthrough();
Stream.finished = requireEndOfStream();
Stream.pipeline = requirePipeline();

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

var require$$2 = /*@__PURE__*/getDefaultExportFromCjs$1(streamBrowserify);

var assert$3 = {exports: {}};

var errors = {};

var util$1 = {};

var types$1 = {};

/* eslint complexity: [2, 18], max-statements: [2, 33] */
var shams$3 = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

var hasSymbols$4 = shams$3;

var shams$2 = function hasToStringTagShams() {
	return hasSymbols$4() && !!Symbol.toStringTag;
};

var hasSymbols$3;
var hasRequiredHasSymbols;

function requireHasSymbols () {
	if (hasRequiredHasSymbols) return hasSymbols$3;
	hasRequiredHasSymbols = 1;

	var origSymbol = typeof Symbol !== 'undefined' && Symbol;
	var hasSymbolSham = shams$3;

	hasSymbols$3 = function hasNativeSymbols() {
		if (typeof origSymbol !== 'function') { return false; }
		if (typeof Symbol !== 'function') { return false; }
		if (typeof origSymbol('foo') !== 'symbol') { return false; }
		if (typeof Symbol('bar') !== 'symbol') { return false; }

		return hasSymbolSham();
	};
	return hasSymbols$3;
}

var hasProto$2;
var hasRequiredHasProto;

function requireHasProto () {
	if (hasRequiredHasProto) return hasProto$2;
	hasRequiredHasProto = 1;

	var test = {
		foo: {}
	};

	var $Object = Object;

	hasProto$2 = function hasProto() {
		return { __proto__: test }.foo === test.foo && !({ __proto__: null } instanceof $Object);
	};
	return hasProto$2;
}

var implementation$5;
var hasRequiredImplementation$3;

function requireImplementation$3 () {
	if (hasRequiredImplementation$3) return implementation$5;
	hasRequiredImplementation$3 = 1;

	/* eslint no-invalid-this: 1 */

	var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
	var toStr = Object.prototype.toString;
	var max = Math.max;
	var funcType = '[object Function]';

	var concatty = function concatty(a, b) {
	    var arr = [];

	    for (var i = 0; i < a.length; i += 1) {
	        arr[i] = a[i];
	    }
	    for (var j = 0; j < b.length; j += 1) {
	        arr[j + a.length] = b[j];
	    }

	    return arr;
	};

	var slicy = function slicy(arrLike, offset) {
	    var arr = [];
	    for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
	        arr[j] = arrLike[i];
	    }
	    return arr;
	};

	var joiny = function (arr, joiner) {
	    var str = '';
	    for (var i = 0; i < arr.length; i += 1) {
	        str += arr[i];
	        if (i + 1 < arr.length) {
	            str += joiner;
	        }
	    }
	    return str;
	};

	implementation$5 = function bind(that) {
	    var target = this;
	    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
	        throw new TypeError(ERROR_MESSAGE + target);
	    }
	    var args = slicy(arguments, 1);

	    var bound;
	    var binder = function () {
	        if (this instanceof bound) {
	            var result = target.apply(
	                this,
	                concatty(args, arguments)
	            );
	            if (Object(result) === result) {
	                return result;
	            }
	            return this;
	        }
	        return target.apply(
	            that,
	            concatty(args, arguments)
	        );

	    };

	    var boundLength = max(0, target.length - args.length);
	    var boundArgs = [];
	    for (var i = 0; i < boundLength; i++) {
	        boundArgs[i] = '$' + i;
	    }

	    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

	    if (target.prototype) {
	        var Empty = function Empty() {};
	        Empty.prototype = target.prototype;
	        bound.prototype = new Empty();
	        Empty.prototype = null;
	    }

	    return bound;
	};
	return implementation$5;
}

var functionBind$1;
var hasRequiredFunctionBind;

function requireFunctionBind () {
	if (hasRequiredFunctionBind) return functionBind$1;
	hasRequiredFunctionBind = 1;

	var implementation = requireImplementation$3();

	functionBind$1 = Function.prototype.bind || implementation;
	return functionBind$1;
}

var hasown$1;
var hasRequiredHasown;

function requireHasown () {
	if (hasRequiredHasown) return hasown$1;
	hasRequiredHasown = 1;

	var call = Function.prototype.call;
	var $hasOwn = Object.prototype.hasOwnProperty;
	var bind = requireFunctionBind();

	/** @type {(o: {}, p: PropertyKey) => p is keyof o} */
	hasown$1 = bind.call(call, $hasOwn);
	return hasown$1;
}

var getIntrinsic$1;
var hasRequiredGetIntrinsic;

function requireGetIntrinsic () {
	if (hasRequiredGetIntrinsic) return getIntrinsic$1;
	hasRequiredGetIntrinsic = 1;

	var undefined$1;

	var $SyntaxError = SyntaxError;
	var $Function = Function;
	var $TypeError = TypeError;

	// eslint-disable-next-line consistent-return
	var getEvalledConstructor = function (expressionSyntax) {
		try {
			return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
		} catch (e) {}
	};

	var $gOPD = Object.getOwnPropertyDescriptor;
	if ($gOPD) {
		try {
			$gOPD({}, '');
		} catch (e) {
			$gOPD = null; // this is IE 8, which has a broken gOPD
		}
	}

	var throwTypeError = function () {
		throw new $TypeError();
	};
	var ThrowTypeError = $gOPD
		? (function () {
			try {
				// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
				arguments.callee; // IE 8 does not throw here
				return throwTypeError;
			} catch (calleeThrows) {
				try {
					// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
					return $gOPD(arguments, 'callee').get;
				} catch (gOPDthrows) {
					return throwTypeError;
				}
			}
		}())
		: throwTypeError;

	var hasSymbols = requireHasSymbols()();
	var hasProto = requireHasProto()();

	var getProto = Object.getPrototypeOf || (
		hasProto
			? function (x) { return x.__proto__; } // eslint-disable-line no-proto
			: null
	);

	var needsEval = {};

	var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined$1 : getProto(Uint8Array);

	var INTRINSICS = {
		'%AggregateError%': typeof AggregateError === 'undefined' ? undefined$1 : AggregateError,
		'%Array%': Array,
		'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
		'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined$1,
		'%AsyncFromSyncIteratorPrototype%': undefined$1,
		'%AsyncFunction%': needsEval,
		'%AsyncGenerator%': needsEval,
		'%AsyncGeneratorFunction%': needsEval,
		'%AsyncIteratorPrototype%': needsEval,
		'%Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
		'%BigInt%': typeof BigInt === 'undefined' ? undefined$1 : BigInt,
		'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined$1 : BigInt64Array,
		'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined$1 : BigUint64Array,
		'%Boolean%': Boolean,
		'%DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
		'%Date%': Date,
		'%decodeURI%': decodeURI,
		'%decodeURIComponent%': decodeURIComponent,
		'%encodeURI%': encodeURI,
		'%encodeURIComponent%': encodeURIComponent,
		'%Error%': Error,
		'%eval%': eval, // eslint-disable-line no-eval
		'%EvalError%': EvalError,
		'%Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
		'%Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
		'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined$1 : FinalizationRegistry,
		'%Function%': $Function,
		'%GeneratorFunction%': needsEval,
		'%Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
		'%Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
		'%Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
		'%isFinite%': isFinite,
		'%isNaN%': isNaN,
		'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
		'%JSON%': typeof JSON === 'object' ? JSON : undefined$1,
		'%Map%': typeof Map === 'undefined' ? undefined$1 : Map,
		'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
		'%Math%': Math,
		'%Number%': Number,
		'%Object%': Object,
		'%parseFloat%': parseFloat,
		'%parseInt%': parseInt,
		'%Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
		'%Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
		'%RangeError%': RangeError,
		'%ReferenceError%': ReferenceError,
		'%Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
		'%RegExp%': RegExp,
		'%Set%': typeof Set === 'undefined' ? undefined$1 : Set,
		'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
		'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
		'%String%': String,
		'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined$1,
		'%Symbol%': hasSymbols ? Symbol : undefined$1,
		'%SyntaxError%': $SyntaxError,
		'%ThrowTypeError%': ThrowTypeError,
		'%TypedArray%': TypedArray,
		'%TypeError%': $TypeError,
		'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
		'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
		'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
		'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
		'%URIError%': URIError,
		'%WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
		'%WeakRef%': typeof WeakRef === 'undefined' ? undefined$1 : WeakRef,
		'%WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet
	};

	if (getProto) {
		try {
			null.error; // eslint-disable-line no-unused-expressions
		} catch (e) {
			// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
			var errorProto = getProto(getProto(e));
			INTRINSICS['%Error.prototype%'] = errorProto;
		}
	}

	var doEval = function doEval(name) {
		var value;
		if (name === '%AsyncFunction%') {
			value = getEvalledConstructor('async function () {}');
		} else if (name === '%GeneratorFunction%') {
			value = getEvalledConstructor('function* () {}');
		} else if (name === '%AsyncGeneratorFunction%') {
			value = getEvalledConstructor('async function* () {}');
		} else if (name === '%AsyncGenerator%') {
			var fn = doEval('%AsyncGeneratorFunction%');
			if (fn) {
				value = fn.prototype;
			}
		} else if (name === '%AsyncIteratorPrototype%') {
			var gen = doEval('%AsyncGenerator%');
			if (gen && getProto) {
				value = getProto(gen.prototype);
			}
		}

		INTRINSICS[name] = value;

		return value;
	};

	var LEGACY_ALIASES = {
		'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
		'%ArrayPrototype%': ['Array', 'prototype'],
		'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
		'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
		'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
		'%ArrayProto_values%': ['Array', 'prototype', 'values'],
		'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
		'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
		'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
		'%BooleanPrototype%': ['Boolean', 'prototype'],
		'%DataViewPrototype%': ['DataView', 'prototype'],
		'%DatePrototype%': ['Date', 'prototype'],
		'%ErrorPrototype%': ['Error', 'prototype'],
		'%EvalErrorPrototype%': ['EvalError', 'prototype'],
		'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
		'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
		'%FunctionPrototype%': ['Function', 'prototype'],
		'%Generator%': ['GeneratorFunction', 'prototype'],
		'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
		'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
		'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
		'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
		'%JSONParse%': ['JSON', 'parse'],
		'%JSONStringify%': ['JSON', 'stringify'],
		'%MapPrototype%': ['Map', 'prototype'],
		'%NumberPrototype%': ['Number', 'prototype'],
		'%ObjectPrototype%': ['Object', 'prototype'],
		'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
		'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
		'%PromisePrototype%': ['Promise', 'prototype'],
		'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
		'%Promise_all%': ['Promise', 'all'],
		'%Promise_reject%': ['Promise', 'reject'],
		'%Promise_resolve%': ['Promise', 'resolve'],
		'%RangeErrorPrototype%': ['RangeError', 'prototype'],
		'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
		'%RegExpPrototype%': ['RegExp', 'prototype'],
		'%SetPrototype%': ['Set', 'prototype'],
		'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
		'%StringPrototype%': ['String', 'prototype'],
		'%SymbolPrototype%': ['Symbol', 'prototype'],
		'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
		'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
		'%TypeErrorPrototype%': ['TypeError', 'prototype'],
		'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
		'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
		'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
		'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
		'%URIErrorPrototype%': ['URIError', 'prototype'],
		'%WeakMapPrototype%': ['WeakMap', 'prototype'],
		'%WeakSetPrototype%': ['WeakSet', 'prototype']
	};

	var bind = requireFunctionBind();
	var hasOwn = requireHasown();
	var $concat = bind.call(Function.call, Array.prototype.concat);
	var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
	var $replace = bind.call(Function.call, String.prototype.replace);
	var $strSlice = bind.call(Function.call, String.prototype.slice);
	var $exec = bind.call(Function.call, RegExp.prototype.exec);

	/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
	var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
	var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
	var stringToPath = function stringToPath(string) {
		var first = $strSlice(string, 0, 1);
		var last = $strSlice(string, -1);
		if (first === '%' && last !== '%') {
			throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
		} else if (last === '%' && first !== '%') {
			throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
		}
		var result = [];
		$replace(string, rePropName, function (match, number, quote, subString) {
			result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
		});
		return result;
	};
	/* end adaptation */

	var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
		var intrinsicName = name;
		var alias;
		if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
			alias = LEGACY_ALIASES[intrinsicName];
			intrinsicName = '%' + alias[0] + '%';
		}

		if (hasOwn(INTRINSICS, intrinsicName)) {
			var value = INTRINSICS[intrinsicName];
			if (value === needsEval) {
				value = doEval(intrinsicName);
			}
			if (typeof value === 'undefined' && !allowMissing) {
				throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
			}

			return {
				alias: alias,
				name: intrinsicName,
				value: value
			};
		}

		throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
	};

	getIntrinsic$1 = function GetIntrinsic(name, allowMissing) {
		if (typeof name !== 'string' || name.length === 0) {
			throw new $TypeError('intrinsic name must be a non-empty string');
		}
		if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
			throw new $TypeError('"allowMissing" argument must be a boolean');
		}

		if ($exec(/^%?[^%]*%?$/, name) === null) {
			throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
		}
		var parts = stringToPath(name);
		var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

		var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
		var intrinsicRealName = intrinsic.name;
		var value = intrinsic.value;
		var skipFurtherCaching = false;

		var alias = intrinsic.alias;
		if (alias) {
			intrinsicBaseName = alias[0];
			$spliceApply(parts, $concat([0, 1], alias));
		}

		for (var i = 1, isOwn = true; i < parts.length; i += 1) {
			var part = parts[i];
			var first = $strSlice(part, 0, 1);
			var last = $strSlice(part, -1);
			if (
				(
					(first === '"' || first === "'" || first === '`')
					|| (last === '"' || last === "'" || last === '`')
				)
				&& first !== last
			) {
				throw new $SyntaxError('property names with quotes must have matching quotes');
			}
			if (part === 'constructor' || !isOwn) {
				skipFurtherCaching = true;
			}

			intrinsicBaseName += '.' + part;
			intrinsicRealName = '%' + intrinsicBaseName + '%';

			if (hasOwn(INTRINSICS, intrinsicRealName)) {
				value = INTRINSICS[intrinsicRealName];
			} else if (value != null) {
				if (!(part in value)) {
					if (!allowMissing) {
						throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
					}
					return void undefined$1;
				}
				if ($gOPD && (i + 1) >= parts.length) {
					var desc = $gOPD(value, part);
					isOwn = !!desc;

					// By convention, when a data property is converted to an accessor
					// property to emulate a data property that does not suffer from
					// the override mistake, that accessor's getter is marked with
					// an `originalValue` property. Here, when we detect this, we
					// uphold the illusion by pretending to see that original data
					// property, i.e., returning the value rather than the getter
					// itself.
					if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
						value = desc.get;
					} else {
						value = value[part];
					}
				} else {
					isOwn = hasOwn(value, part);
					value = value[part];
				}

				if (isOwn && !skipFurtherCaching) {
					INTRINSICS[intrinsicRealName] = value;
				}
			}
		}
		return value;
	};
	return getIntrinsic$1;
}

var callBind$5 = {exports: {}};

var hasPropertyDescriptors_1$1;
var hasRequiredHasPropertyDescriptors;

function requireHasPropertyDescriptors () {
	if (hasRequiredHasPropertyDescriptors) return hasPropertyDescriptors_1$1;
	hasRequiredHasPropertyDescriptors = 1;

	var GetIntrinsic = requireGetIntrinsic();

	var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);

	var hasPropertyDescriptors = function hasPropertyDescriptors() {
		if ($defineProperty) {
			try {
				$defineProperty({}, 'a', { value: 1 });
				return true;
			} catch (e) {
				// IE 8 has a broken defineProperty
				return false;
			}
		}
		return false;
	};

	hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
		// node v0.6 has a bug where array lengths can be Set but not Defined
		if (!hasPropertyDescriptors()) {
			return null;
		}
		try {
			return $defineProperty([], 'length', { value: 1 }).length !== 1;
		} catch (e) {
			// In Firefox 4-22, defining length on an array throws an exception.
			return true;
		}
	};

	hasPropertyDescriptors_1$1 = hasPropertyDescriptors;
	return hasPropertyDescriptors_1$1;
}

var GetIntrinsic$6 = requireGetIntrinsic();

var $gOPD$2 = GetIntrinsic$6('%Object.getOwnPropertyDescriptor%', true);

if ($gOPD$2) {
	try {
		$gOPD$2([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD$2 = null;
	}
}

var gopd$2 = $gOPD$2;

var defineDataProperty$1;
var hasRequiredDefineDataProperty;

function requireDefineDataProperty () {
	if (hasRequiredDefineDataProperty) return defineDataProperty$1;
	hasRequiredDefineDataProperty = 1;

	var hasPropertyDescriptors = requireHasPropertyDescriptors()();

	var GetIntrinsic = requireGetIntrinsic();

	var $defineProperty = hasPropertyDescriptors && GetIntrinsic('%Object.defineProperty%', true);
	if ($defineProperty) {
		try {
			$defineProperty({}, 'a', { value: 1 });
		} catch (e) {
			// IE 8 has a broken defineProperty
			$defineProperty = false;
		}
	}

	var $SyntaxError = GetIntrinsic('%SyntaxError%');
	var $TypeError = GetIntrinsic('%TypeError%');

	var gopd = gopd$2;

	/** @type {(obj: Record<PropertyKey, unknown>, property: PropertyKey, value: unknown, nonEnumerable?: boolean | null, nonWritable?: boolean | null, nonConfigurable?: boolean | null, loose?: boolean) => void} */
	defineDataProperty$1 = function defineDataProperty(
		obj,
		property,
		value
	) {
		if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
			throw new $TypeError('`obj` must be an object or a function`');
		}
		if (typeof property !== 'string' && typeof property !== 'symbol') {
			throw new $TypeError('`property` must be a string or a symbol`');
		}
		if (arguments.length > 3 && typeof arguments[3] !== 'boolean' && arguments[3] !== null) {
			throw new $TypeError('`nonEnumerable`, if provided, must be a boolean or null');
		}
		if (arguments.length > 4 && typeof arguments[4] !== 'boolean' && arguments[4] !== null) {
			throw new $TypeError('`nonWritable`, if provided, must be a boolean or null');
		}
		if (arguments.length > 5 && typeof arguments[5] !== 'boolean' && arguments[5] !== null) {
			throw new $TypeError('`nonConfigurable`, if provided, must be a boolean or null');
		}
		if (arguments.length > 6 && typeof arguments[6] !== 'boolean') {
			throw new $TypeError('`loose`, if provided, must be a boolean');
		}

		var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
		var nonWritable = arguments.length > 4 ? arguments[4] : null;
		var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
		var loose = arguments.length > 6 ? arguments[6] : false;

		/* @type {false | TypedPropertyDescriptor<unknown>} */
		var desc = !!gopd && gopd(obj, property);

		if ($defineProperty) {
			$defineProperty(obj, property, {
				configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
				enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
				value: value,
				writable: nonWritable === null && desc ? desc.writable : !nonWritable
			});
		} else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
			// must fall back to [[Set]], and was not explicitly asked to make non-enumerable, non-writable, or non-configurable
			obj[property] = value; // eslint-disable-line no-param-reassign
		} else {
			throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
		}
	};
	return defineDataProperty$1;
}

var setFunctionLength$1;
var hasRequiredSetFunctionLength;

function requireSetFunctionLength () {
	if (hasRequiredSetFunctionLength) return setFunctionLength$1;
	hasRequiredSetFunctionLength = 1;

	var GetIntrinsic = requireGetIntrinsic();
	var define = requireDefineDataProperty();
	var hasDescriptors = requireHasPropertyDescriptors()();
	var gOPD = gopd$2;

	var $TypeError = GetIntrinsic('%TypeError%');
	var $floor = GetIntrinsic('%Math.floor%');

	setFunctionLength$1 = function setFunctionLength(fn, length) {
		if (typeof fn !== 'function') {
			throw new $TypeError('`fn` is not a function');
		}
		if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || $floor(length) !== length) {
			throw new $TypeError('`length` must be a positive 32-bit integer');
		}

		var loose = arguments.length > 2 && !!arguments[2];

		var functionLengthIsConfigurable = true;
		var functionLengthIsWritable = true;
		if ('length' in fn && gOPD) {
			var desc = gOPD(fn, 'length');
			if (desc && !desc.configurable) {
				functionLengthIsConfigurable = false;
			}
			if (desc && !desc.writable) {
				functionLengthIsWritable = false;
			}
		}

		if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
			if (hasDescriptors) {
				define(fn, 'length', length, true, true);
			} else {
				define(fn, 'length', length);
			}
		}
		return fn;
	};
	return setFunctionLength$1;
}

var hasRequiredCallBind;

function requireCallBind () {
	if (hasRequiredCallBind) return callBind$5.exports;
	hasRequiredCallBind = 1;
	(function (module) {

		var bind = requireFunctionBind();
		var GetIntrinsic = requireGetIntrinsic();
		var setFunctionLength = requireSetFunctionLength();

		var $TypeError = GetIntrinsic('%TypeError%');
		var $apply = GetIntrinsic('%Function.prototype.apply%');
		var $call = GetIntrinsic('%Function.prototype.call%');
		var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

		var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
		var $max = GetIntrinsic('%Math.max%');

		if ($defineProperty) {
			try {
				$defineProperty({}, 'a', { value: 1 });
			} catch (e) {
				// IE 8 has a broken defineProperty
				$defineProperty = null;
			}
		}

		module.exports = function callBind(originalFunction) {
			if (typeof originalFunction !== 'function') {
				throw new $TypeError('a function is required');
			}
			var func = $reflectApply(bind, $call, arguments);
			return setFunctionLength(
				func,
				1 + $max(0, originalFunction.length - (arguments.length - 1)),
				true
			);
		};

		var applyBind = function applyBind() {
			return $reflectApply(bind, $apply, arguments);
		};

		if ($defineProperty) {
			$defineProperty(module.exports, 'apply', { value: applyBind });
		} else {
			module.exports.apply = applyBind;
		} 
	} (callBind$5));
	return callBind$5.exports;
}

var GetIntrinsic$5 = requireGetIntrinsic();

var callBind$4 = requireCallBind();

var $indexOf$3 = callBind$4(GetIntrinsic$5('String.prototype.indexOf'));

var callBound$5 = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic$5(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf$3(name, '.prototype.') > -1) {
		return callBind$4(intrinsic);
	}
	return intrinsic;
};

var hasToStringTag$7 = shams$2();
var callBound$4 = callBound$5;

var $toString$3 = callBound$4('Object.prototype.toString');

var isStandardArguments$1 = function isArguments(value) {
	if (hasToStringTag$7 && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString$3(value) === '[object Arguments]';
};

var isLegacyArguments$1 = function isArguments(value) {
	if (isStandardArguments$1(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString$3(value) !== '[object Array]' &&
		$toString$3(value.callee) === '[object Function]';
};

var supportsStandardArguments$1 = (function () {
	return isStandardArguments$1(arguments);
}());

isStandardArguments$1.isLegacyArguments = isLegacyArguments$1; // for tests

var isArguments$8 = supportsStandardArguments$1 ? isStandardArguments$1 : isLegacyArguments$1;

var toStr$6 = Object.prototype.toString;
var fnToStr$3 = Function.prototype.toString;
var isFnRegex$1 = /^\s*(?:function)?\*/;
var hasToStringTag$6 = shams$2();
var getProto$2 = Object.getPrototypeOf;
var getGeneratorFunc$1 = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag$6) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction$1;

var isGeneratorFunction$1 = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex$1.test(fnToStr$3.call(fn))) {
		return true;
	}
	if (!hasToStringTag$6) {
		var str = toStr$6.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto$2) {
		return false;
	}
	if (typeof GeneratorFunction$1 === 'undefined') {
		var generatorFunc = getGeneratorFunc$1();
		GeneratorFunction$1 = generatorFunc ? getProto$2(generatorFunc) : false;
	}
	return getProto$2(fn) === GeneratorFunction$1;
};

var fnToStr$2 = Function.prototype.toString;
var reflectApply$1 = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike$1;
var isCallableMarker$1;
if (typeof reflectApply$1 === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike$1 = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker$1;
			}
		});
		isCallableMarker$1 = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply$1(function () { throw 42; }, null, badArrayLike$1);
	} catch (_) {
		if (_ !== isCallableMarker$1) {
			reflectApply$1 = null;
		}
	}
} else {
	reflectApply$1 = null;
}

var constructorRegex$1 = /^\s*class\b/;
var isES6ClassFn$1 = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr$2.call(value);
		return constructorRegex$1.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject$1 = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn$1(value)) { return false; }
		fnToStr$2.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr$5 = Object.prototype.toString;
var objectClass$1 = '[object Object]';
var fnClass$1 = '[object Function]';
var genClass$1 = '[object GeneratorFunction]';
var ddaClass$1 = '[object HTMLAllCollection]'; // IE 11
var ddaClass2$1 = '[object HTML document.all class]';
var ddaClass3$1 = '[object HTMLCollection]'; // IE 9-10
var hasToStringTag$5 = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`

var isIE68$1 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

var isDDA$1 = function isDocumentDotAll() { return false; };
if (typeof document === 'object') {
	// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
	var all$1 = document.all;
	if (toStr$5.call(all$1) === toStr$5.call(document.all)) {
		isDDA$1 = function isDocumentDotAll(value) {
			/* globals document: false */
			// in IE 6-8, typeof document.all is "object" and it's truthy
			if ((isIE68$1 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					var str = toStr$5.call(value);
					return (
						str === ddaClass$1
						|| str === ddaClass2$1
						|| str === ddaClass3$1 // opera 12.16
						|| str === objectClass$1 // IE 6-8
					) && value('') == null; // eslint-disable-line eqeqeq
				} catch (e) { /**/ }
			}
			return false;
		};
	}
}

var isCallable$3 = reflectApply$1
	? function isCallable(value) {
		if (isDDA$1(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		try {
			reflectApply$1(value, null, badArrayLike$1);
		} catch (e) {
			if (e !== isCallableMarker$1) { return false; }
		}
		return !isES6ClassFn$1(value) && tryFunctionObject$1(value);
	}
	: function isCallable(value) {
		if (isDDA$1(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (hasToStringTag$5) { return tryFunctionObject$1(value); }
		if (isES6ClassFn$1(value)) { return false; }
		var strClass = toStr$5.call(value);
		if (strClass !== fnClass$1 && strClass !== genClass$1 && !(/^\[object HTML/).test(strClass)) { return false; }
		return tryFunctionObject$1(value);
	};

var isCallable$2 = isCallable$3;

var toStr$4 = Object.prototype.toString;
var hasOwnProperty$j = Object.prototype.hasOwnProperty;

var forEachArray$1 = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty$j.call(array, i)) {
            if (receiver == null) {
                iterator(array[i], i, array);
            } else {
                iterator.call(receiver, array[i], i, array);
            }
        }
    }
};

var forEachString$1 = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        if (receiver == null) {
            iterator(string.charAt(i), i, string);
        } else {
            iterator.call(receiver, string.charAt(i), i, string);
        }
    }
};

var forEachObject$1 = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
        if (hasOwnProperty$j.call(object, k)) {
            if (receiver == null) {
                iterator(object[k], k, object);
            } else {
                iterator.call(receiver, object[k], k, object);
            }
        }
    }
};

var forEach$4 = function forEach(list, iterator, thisArg) {
    if (!isCallable$2(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    var receiver;
    if (arguments.length >= 3) {
        receiver = thisArg;
    }

    if (toStr$4.call(list) === '[object Array]') {
        forEachArray$1(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString$1(list, iterator, receiver);
    } else {
        forEachObject$1(list, iterator, receiver);
    }
};

var forEach_1$2 = forEach$4;

var possibleNames$1 = [
	'BigInt64Array',
	'BigUint64Array',
	'Float32Array',
	'Float64Array',
	'Int16Array',
	'Int32Array',
	'Int8Array',
	'Uint16Array',
	'Uint32Array',
	'Uint8Array',
	'Uint8ClampedArray'
];

var g$3 = typeof globalThis === 'undefined' ? commonjsGlobal$1 : globalThis;

var availableTypedArrays$3 = function availableTypedArrays() {
	var out = [];
	for (var i = 0; i < possibleNames$1.length; i++) {
		if (typeof g$3[possibleNames$1[i]] === 'function') {
			out[out.length] = possibleNames$1[i];
		}
	}
	return out;
};

var forEach$3 = forEach_1$2;
var availableTypedArrays$2 = availableTypedArrays$3;
var callBind$3 = requireCallBind();
var callBound$3 = callBound$5;
var gOPD$2 = gopd$2;

var $toString$2 = callBound$3('Object.prototype.toString');
var hasToStringTag$4 = shams$2();

var g$2 = typeof globalThis === 'undefined' ? commonjsGlobal$1 : globalThis;
var typedArrays$1 = availableTypedArrays$2();

var $slice$1 = callBound$3('String.prototype.slice');
var getPrototypeOf$1 = Object.getPrototypeOf; // require('getprototypeof');

var $indexOf$2 = callBound$3('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
var cache$1 = { __proto__: null };
if (hasToStringTag$4 && gOPD$2 && getPrototypeOf$1) {
	forEach$3(typedArrays$1, function (typedArray) {
		var arr = new g$2[typedArray]();
		if (Symbol.toStringTag in arr) {
			var proto = getPrototypeOf$1(arr);
			var descriptor = gOPD$2(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf$1(proto);
				descriptor = gOPD$2(superProto, Symbol.toStringTag);
			}
			cache$1['$' + typedArray] = callBind$3(descriptor.get);
		}
	});
} else {
	forEach$3(typedArrays$1, function (typedArray) {
		var arr = new g$2[typedArray]();
		var fn = arr.slice || arr.set;
		if (fn) {
			cache$1['$' + typedArray] = callBind$3(fn);
		}
	});
}

var tryTypedArrays$1 = function tryAllTypedArrays(value) {
	var found = false;
	forEach$3(cache$1, function (getter, typedArray) {
		if (!found) {
			try {
				if ('$' + getter(value) === typedArray) {
					found = $slice$1(typedArray, 1);
				}
			} catch (e) { /**/ }
		}
	});
	return found;
};

var trySlices$1 = function tryAllSlices(value) {
	var found = false;
	forEach$3(cache$1, function (getter, name) {
		if (!found) {
			try {
				getter(value);
				found = $slice$1(name, 1);
			} catch (e) { /**/ }
		}
	});
	return found;
};

var whichTypedArray$3 = function whichTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag$4) {
		var tag = $slice$1($toString$2(value), 8, -1);
		if ($indexOf$2(typedArrays$1, tag) > -1) {
			return tag;
		}
		if (tag !== 'Object') {
			return false;
		}
		// node < 0.6 hits here on real Typed Arrays
		return trySlices$1(value);
	}
	if (!gOPD$2) { return null; } // unknown engine
	return tryTypedArrays$1(value);
};

var whichTypedArray$2 = whichTypedArray$3;

var isTypedArray$8 = function isTypedArray(value) {
	return !!whichTypedArray$2(value);
};

(function (exports) {

	var isArgumentsObject = isArguments$8;
	var isGeneratorFunction = isGeneratorFunction$1;
	var whichTypedArray = whichTypedArray$3;
	var isTypedArray = isTypedArray$8;

	function uncurryThis(f) {
	  return f.call.bind(f);
	}

	var BigIntSupported = typeof BigInt !== 'undefined';
	var SymbolSupported = typeof Symbol !== 'undefined';

	var ObjectToString = uncurryThis(Object.prototype.toString);

	var numberValue = uncurryThis(Number.prototype.valueOf);
	var stringValue = uncurryThis(String.prototype.valueOf);
	var booleanValue = uncurryThis(Boolean.prototype.valueOf);

	if (BigIntSupported) {
	  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
	}

	if (SymbolSupported) {
	  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
	}

	function checkBoxedPrimitive(value, prototypeValueOf) {
	  if (typeof value !== 'object') {
	    return false;
	  }
	  try {
	    prototypeValueOf(value);
	    return true;
	  } catch(e) {
	    return false;
	  }
	}

	exports.isArgumentsObject = isArgumentsObject;
	exports.isGeneratorFunction = isGeneratorFunction;
	exports.isTypedArray = isTypedArray;

	// Taken from here and modified for better browser support
	// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
	function isPromise(input) {
		return (
			(
				typeof Promise !== 'undefined' &&
				input instanceof Promise
			) ||
			(
				input !== null &&
				typeof input === 'object' &&
				typeof input.then === 'function' &&
				typeof input.catch === 'function'
			)
		);
	}
	exports.isPromise = isPromise;

	function isArrayBufferView(value) {
	  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
	    return ArrayBuffer.isView(value);
	  }

	  return (
	    isTypedArray(value) ||
	    isDataView(value)
	  );
	}
	exports.isArrayBufferView = isArrayBufferView;


	function isUint8Array(value) {
	  return whichTypedArray(value) === 'Uint8Array';
	}
	exports.isUint8Array = isUint8Array;

	function isUint8ClampedArray(value) {
	  return whichTypedArray(value) === 'Uint8ClampedArray';
	}
	exports.isUint8ClampedArray = isUint8ClampedArray;

	function isUint16Array(value) {
	  return whichTypedArray(value) === 'Uint16Array';
	}
	exports.isUint16Array = isUint16Array;

	function isUint32Array(value) {
	  return whichTypedArray(value) === 'Uint32Array';
	}
	exports.isUint32Array = isUint32Array;

	function isInt8Array(value) {
	  return whichTypedArray(value) === 'Int8Array';
	}
	exports.isInt8Array = isInt8Array;

	function isInt16Array(value) {
	  return whichTypedArray(value) === 'Int16Array';
	}
	exports.isInt16Array = isInt16Array;

	function isInt32Array(value) {
	  return whichTypedArray(value) === 'Int32Array';
	}
	exports.isInt32Array = isInt32Array;

	function isFloat32Array(value) {
	  return whichTypedArray(value) === 'Float32Array';
	}
	exports.isFloat32Array = isFloat32Array;

	function isFloat64Array(value) {
	  return whichTypedArray(value) === 'Float64Array';
	}
	exports.isFloat64Array = isFloat64Array;

	function isBigInt64Array(value) {
	  return whichTypedArray(value) === 'BigInt64Array';
	}
	exports.isBigInt64Array = isBigInt64Array;

	function isBigUint64Array(value) {
	  return whichTypedArray(value) === 'BigUint64Array';
	}
	exports.isBigUint64Array = isBigUint64Array;

	function isMapToString(value) {
	  return ObjectToString(value) === '[object Map]';
	}
	isMapToString.working = (
	  typeof Map !== 'undefined' &&
	  isMapToString(new Map())
	);

	function isMap(value) {
	  if (typeof Map === 'undefined') {
	    return false;
	  }

	  return isMapToString.working
	    ? isMapToString(value)
	    : value instanceof Map;
	}
	exports.isMap = isMap;

	function isSetToString(value) {
	  return ObjectToString(value) === '[object Set]';
	}
	isSetToString.working = (
	  typeof Set !== 'undefined' &&
	  isSetToString(new Set())
	);
	function isSet(value) {
	  if (typeof Set === 'undefined') {
	    return false;
	  }

	  return isSetToString.working
	    ? isSetToString(value)
	    : value instanceof Set;
	}
	exports.isSet = isSet;

	function isWeakMapToString(value) {
	  return ObjectToString(value) === '[object WeakMap]';
	}
	isWeakMapToString.working = (
	  typeof WeakMap !== 'undefined' &&
	  isWeakMapToString(new WeakMap())
	);
	function isWeakMap(value) {
	  if (typeof WeakMap === 'undefined') {
	    return false;
	  }

	  return isWeakMapToString.working
	    ? isWeakMapToString(value)
	    : value instanceof WeakMap;
	}
	exports.isWeakMap = isWeakMap;

	function isWeakSetToString(value) {
	  return ObjectToString(value) === '[object WeakSet]';
	}
	isWeakSetToString.working = (
	  typeof WeakSet !== 'undefined' &&
	  isWeakSetToString(new WeakSet())
	);
	function isWeakSet(value) {
	  return isWeakSetToString(value);
	}
	exports.isWeakSet = isWeakSet;

	function isArrayBufferToString(value) {
	  return ObjectToString(value) === '[object ArrayBuffer]';
	}
	isArrayBufferToString.working = (
	  typeof ArrayBuffer !== 'undefined' &&
	  isArrayBufferToString(new ArrayBuffer())
	);
	function isArrayBuffer(value) {
	  if (typeof ArrayBuffer === 'undefined') {
	    return false;
	  }

	  return isArrayBufferToString.working
	    ? isArrayBufferToString(value)
	    : value instanceof ArrayBuffer;
	}
	exports.isArrayBuffer = isArrayBuffer;

	function isDataViewToString(value) {
	  return ObjectToString(value) === '[object DataView]';
	}
	isDataViewToString.working = (
	  typeof ArrayBuffer !== 'undefined' &&
	  typeof DataView !== 'undefined' &&
	  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
	);
	function isDataView(value) {
	  if (typeof DataView === 'undefined') {
	    return false;
	  }

	  return isDataViewToString.working
	    ? isDataViewToString(value)
	    : value instanceof DataView;
	}
	exports.isDataView = isDataView;

	// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
	var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined;
	function isSharedArrayBufferToString(value) {
	  return ObjectToString(value) === '[object SharedArrayBuffer]';
	}
	function isSharedArrayBuffer(value) {
	  if (typeof SharedArrayBufferCopy === 'undefined') {
	    return false;
	  }

	  if (typeof isSharedArrayBufferToString.working === 'undefined') {
	    isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
	  }

	  return isSharedArrayBufferToString.working
	    ? isSharedArrayBufferToString(value)
	    : value instanceof SharedArrayBufferCopy;
	}
	exports.isSharedArrayBuffer = isSharedArrayBuffer;

	function isAsyncFunction(value) {
	  return ObjectToString(value) === '[object AsyncFunction]';
	}
	exports.isAsyncFunction = isAsyncFunction;

	function isMapIterator(value) {
	  return ObjectToString(value) === '[object Map Iterator]';
	}
	exports.isMapIterator = isMapIterator;

	function isSetIterator(value) {
	  return ObjectToString(value) === '[object Set Iterator]';
	}
	exports.isSetIterator = isSetIterator;

	function isGeneratorObject(value) {
	  return ObjectToString(value) === '[object Generator]';
	}
	exports.isGeneratorObject = isGeneratorObject;

	function isWebAssemblyCompiledModule(value) {
	  return ObjectToString(value) === '[object WebAssembly.Module]';
	}
	exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

	function isNumberObject(value) {
	  return checkBoxedPrimitive(value, numberValue);
	}
	exports.isNumberObject = isNumberObject;

	function isStringObject(value) {
	  return checkBoxedPrimitive(value, stringValue);
	}
	exports.isStringObject = isStringObject;

	function isBooleanObject(value) {
	  return checkBoxedPrimitive(value, booleanValue);
	}
	exports.isBooleanObject = isBooleanObject;

	function isBigIntObject(value) {
	  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
	}
	exports.isBigIntObject = isBigIntObject;

	function isSymbolObject(value) {
	  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
	}
	exports.isSymbolObject = isSymbolObject;

	function isBoxedPrimitive(value) {
	  return (
	    isNumberObject(value) ||
	    isStringObject(value) ||
	    isBooleanObject(value) ||
	    isBigIntObject(value) ||
	    isSymbolObject(value)
	  );
	}
	exports.isBoxedPrimitive = isBoxedPrimitive;

	function isAnyArrayBuffer(value) {
	  return typeof Uint8Array !== 'undefined' && (
	    isArrayBuffer(value) ||
	    isSharedArrayBuffer(value)
	  );
	}
	exports.isAnyArrayBuffer = isAnyArrayBuffer;

	['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
	  Object.defineProperty(exports, method, {
	    enumerable: false,
	    value: function() {
	      throw new Error(method + ' is not supported in userland');
	    }
	  });
	}); 
} (types$1));

var isBufferBrowser$1 = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
};

(function (exports) {
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
	  function getOwnPropertyDescriptors(obj) {
	    var keys = Object.keys(obj);
	    var descriptors = {};
	    for (var i = 0; i < keys.length; i++) {
	      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
	    }
	    return descriptors;
	  };

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  if (typeof process !== 'undefined' && process.noDeprecation === true) {
	    return fn;
	  }

	  // Allow for deprecating things in the process of starting up.
	  if (typeof process === 'undefined') {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnvRegex = /^$/;

	if (process.env.NODE_DEBUG) {
	  var debugEnv = process.env.NODE_DEBUG;
	  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
	    .replace(/\*/g, '.*')
	    .replace(/,/g, '$|^')
	    .toUpperCase();
	  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
	}
	exports.debuglog = function(set) {
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (debugEnvRegex.test(set)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').slice(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.slice(1, -1);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var length = output.reduce(function(prev, cur) {
	    if (cur.indexOf('\n') >= 0) ;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	exports.types = types$1;

	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;
	exports.types.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;
	exports.types.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;
	exports.types.isNativeError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = isBufferBrowser$1;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = inherits_browserExports$1;

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

	exports.promisify = function promisify(original) {
	  if (typeof original !== 'function')
	    throw new TypeError('The "original" argument must be of type Function');

	  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
	    var fn = original[kCustomPromisifiedSymbol];
	    if (typeof fn !== 'function') {
	      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
	    }
	    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
	      value: fn, enumerable: false, writable: false, configurable: true
	    });
	    return fn;
	  }

	  function fn() {
	    var promiseResolve, promiseReject;
	    var promise = new Promise(function (resolve, reject) {
	      promiseResolve = resolve;
	      promiseReject = reject;
	    });

	    var args = [];
	    for (var i = 0; i < arguments.length; i++) {
	      args.push(arguments[i]);
	    }
	    args.push(function (err, value) {
	      if (err) {
	        promiseReject(err);
	      } else {
	        promiseResolve(value);
	      }
	    });

	    try {
	      original.apply(this, args);
	    } catch (err) {
	      promiseReject(err);
	    }

	    return promise;
	  }

	  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

	  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
	    value: fn, enumerable: false, writable: false, configurable: true
	  });
	  return Object.defineProperties(
	    fn,
	    getOwnPropertyDescriptors(original)
	  );
	};

	exports.promisify.custom = kCustomPromisifiedSymbol;

	function callbackifyOnRejected(reason, cb) {
	  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
	  // Because `null` is a special error value in callbacks which means "no error
	  // occurred", we error-wrap so the callback consumer can distinguish between
	  // "the promise rejected with null" or "the promise fulfilled with undefined".
	  if (!reason) {
	    var newReason = new Error('Promise was rejected with a falsy value');
	    newReason.reason = reason;
	    reason = newReason;
	  }
	  return cb(reason);
	}

	function callbackify(original) {
	  if (typeof original !== 'function') {
	    throw new TypeError('The "original" argument must be of type Function');
	  }

	  // We DO NOT return the promise as it gives the user a false sense that
	  // the promise is actually somehow related to the callback's execution
	  // and that the callback throwing will reject the promise.
	  function callbackified() {
	    var args = [];
	    for (var i = 0; i < arguments.length; i++) {
	      args.push(arguments[i]);
	    }

	    var maybeCb = args.pop();
	    if (typeof maybeCb !== 'function') {
	      throw new TypeError('The last argument must be of type Function');
	    }
	    var self = this;
	    var cb = function() {
	      return maybeCb.apply(self, arguments);
	    };
	    // In true node style we process the callback on `nextTick` with all the
	    // implications (stack, `uncaughtException`, `async_hooks`)
	    original.apply(this, args)
	      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)); },
	            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)); });
	  }

	  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
	  Object.defineProperties(callbackified,
	                          getOwnPropertyDescriptors(original));
	  return callbackified;
	}
	exports.callbackify = callbackify; 
} (util$1));

var hasRequiredErrors;

function requireErrors () {
	if (hasRequiredErrors) return errors;
	hasRequiredErrors = 1;
	// longer be forced to treat every error message change as a semver-major
	// change. The NodeError classes here all expose a `code` property whose
	// value statically and permanently identifies the error. While the error
	// message may change, the code should not.

	function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

	function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

	function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var codes = {}; // Lazy loaded

	var assert;
	var util;

	function createErrorType(code, message, Base) {
	  if (!Base) {
	    Base = Error;
	  }

	  function getMessage(arg1, arg2, arg3) {
	    if (typeof message === 'string') {
	      return message;
	    } else {
	      return message(arg1, arg2, arg3);
	    }
	  }

	  var NodeError =
	  /*#__PURE__*/
	  function (_Base) {
	    _inherits(NodeError, _Base);

	    function NodeError(arg1, arg2, arg3) {
	      var _this;

	      _classCallCheck(this, NodeError);

	      _this = _possibleConstructorReturn(this, _getPrototypeOf(NodeError).call(this, getMessage(arg1, arg2, arg3)));
	      _this.code = code;
	      return _this;
	    }

	    return NodeError;
	  }(Base);

	  codes[code] = NodeError;
	} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


	function oneOf(expected, thing) {
	  if (Array.isArray(expected)) {
	    var len = expected.length;
	    expected = expected.map(function (i) {
	      return String(i);
	    });

	    if (len > 2) {
	      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
	    } else if (len === 2) {
	      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
	    } else {
	      return "of ".concat(thing, " ").concat(expected[0]);
	    }
	  } else {
	    return "of ".concat(thing, " ").concat(String(expected));
	  }
	} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


	function startsWith(str, search, pos) {
	  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


	function endsWith(str, search, this_len) {
	  if (this_len === undefined || this_len > str.length) {
	    this_len = str.length;
	  }

	  return str.substring(this_len - search.length, this_len) === search;
	} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


	function includes(str, search, start) {
	  if (typeof start !== 'number') {
	    start = 0;
	  }

	  if (start + search.length > str.length) {
	    return false;
	  } else {
	    return str.indexOf(search, start) !== -1;
	  }
	}

	createErrorType('ERR_AMBIGUOUS_ARGUMENT', 'The "%s" argument is ambiguous. %s', TypeError);
	createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
	  if (assert === undefined) assert = requireAssert();
	  assert(typeof name === 'string', "'name' must be a string"); // determiner: 'must be' or 'must not be'

	  var determiner;

	  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
	    determiner = 'must not be';
	    expected = expected.replace(/^not /, '');
	  } else {
	    determiner = 'must be';
	  }

	  var msg;

	  if (endsWith(name, ' argument')) {
	    // For cases like 'first argument'
	    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
	  } else {
	    var type = includes(name, '.') ? 'property' : 'argument';
	    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
	  } // TODO(BridgeAR): Improve the output by showing `null` and similar.


	  msg += ". Received type ".concat(_typeof(actual));
	  return msg;
	}, TypeError);
	createErrorType('ERR_INVALID_ARG_VALUE', function (name, value) {
	  var reason = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'is invalid';
	  if (util === undefined) util = util$1;
	  var inspected = util.inspect(value);

	  if (inspected.length > 128) {
	    inspected = "".concat(inspected.slice(0, 128), "...");
	  }

	  return "The argument '".concat(name, "' ").concat(reason, ". Received ").concat(inspected);
	}, TypeError);
	createErrorType('ERR_INVALID_RETURN_VALUE', function (input, name, value) {
	  var type;

	  if (value && value.constructor && value.constructor.name) {
	    type = "instance of ".concat(value.constructor.name);
	  } else {
	    type = "type ".concat(_typeof(value));
	  }

	  return "Expected ".concat(input, " to be returned from the \"").concat(name, "\"") + " function but got ".concat(type, ".");
	}, TypeError);
	createErrorType('ERR_MISSING_ARGS', function () {
	  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }

	  if (assert === undefined) assert = requireAssert();
	  assert(args.length > 0, 'At least one arg needs to be specified');
	  var msg = 'The ';
	  var len = args.length;
	  args = args.map(function (a) {
	    return "\"".concat(a, "\"");
	  });

	  switch (len) {
	    case 1:
	      msg += "".concat(args[0], " argument");
	      break;

	    case 2:
	      msg += "".concat(args[0], " and ").concat(args[1], " arguments");
	      break;

	    default:
	      msg += args.slice(0, len - 1).join(', ');
	      msg += ", and ".concat(args[len - 1], " arguments");
	      break;
	  }

	  return "".concat(msg, " must be specified");
	}, TypeError);
	errors.codes = codes;
	return errors;
}

var assertion_error;
var hasRequiredAssertion_error;

function requireAssertion_error () {
	if (hasRequiredAssertion_error) return assertion_error;
	hasRequiredAssertion_error = 1;

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

	function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

	function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

	function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

	function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

	function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

	function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

	var _require = util$1,
	    inspect = _require.inspect;

	var _require2 = requireErrors(),
	    ERR_INVALID_ARG_TYPE = _require2.codes.ERR_INVALID_ARG_TYPE; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


	function endsWith(str, search, this_len) {
	  if (this_len === undefined || this_len > str.length) {
	    this_len = str.length;
	  }

	  return str.substring(this_len - search.length, this_len) === search;
	} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat


	function repeat(str, count) {
	  count = Math.floor(count);
	  if (str.length == 0 || count == 0) return '';
	  var maxCount = str.length * count;
	  count = Math.floor(Math.log(count) / Math.log(2));

	  while (count) {
	    str += str;
	    count--;
	  }

	  str += str.substring(0, maxCount - str.length);
	  return str;
	}

	var blue = '';
	var green = '';
	var red = '';
	var white = '';
	var kReadableOperator = {
	  deepStrictEqual: 'Expected values to be strictly deep-equal:',
	  strictEqual: 'Expected values to be strictly equal:',
	  strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
	  deepEqual: 'Expected values to be loosely deep-equal:',
	  equal: 'Expected values to be loosely equal:',
	  notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
	  notStrictEqual: 'Expected "actual" to be strictly unequal to:',
	  notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
	  notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
	  notEqual: 'Expected "actual" to be loosely unequal to:',
	  notIdentical: 'Values identical but not reference-equal:'
	}; // Comparing short primitives should just show === / !== instead of using the
	// diff.

	var kMaxShortLength = 10;

	function copyError(source) {
	  var keys = Object.keys(source);
	  var target = Object.create(Object.getPrototypeOf(source));
	  keys.forEach(function (key) {
	    target[key] = source[key];
	  });
	  Object.defineProperty(target, 'message', {
	    value: source.message
	  });
	  return target;
	}

	function inspectValue(val) {
	  // The util.inspect default values could be changed. This makes sure the
	  // error messages contain the necessary information nevertheless.
	  return inspect(val, {
	    compact: false,
	    customInspect: false,
	    depth: 1000,
	    maxArrayLength: Infinity,
	    // Assert compares only enumerable properties (with a few exceptions).
	    showHidden: false,
	    // Having a long line as error is better than wrapping the line for
	    // comparison for now.
	    // TODO(BridgeAR): `breakLength` should be limited as soon as soon as we
	    // have meta information about the inspected properties (i.e., know where
	    // in what line the property starts and ends).
	    breakLength: Infinity,
	    // Assert does not detect proxies currently.
	    showProxy: false,
	    sorted: true,
	    // Inspect getters as we also check them when comparing entries.
	    getters: true
	  });
	}

	function createErrDiff(actual, expected, operator) {
	  var other = '';
	  var res = '';
	  var lastPos = 0;
	  var end = '';
	  var skipped = false;
	  var actualInspected = inspectValue(actual);
	  var actualLines = actualInspected.split('\n');
	  var expectedLines = inspectValue(expected).split('\n');
	  var i = 0;
	  var indicator = ''; // In case both values are objects explicitly mark them as not reference equal
	  // for the `strictEqual` operator.

	  if (operator === 'strictEqual' && _typeof(actual) === 'object' && _typeof(expected) === 'object' && actual !== null && expected !== null) {
	    operator = 'strictEqualObject';
	  } // If "actual" and "expected" fit on a single line and they are not strictly
	  // equal, check further special handling.


	  if (actualLines.length === 1 && expectedLines.length === 1 && actualLines[0] !== expectedLines[0]) {
	    var inputLength = actualLines[0].length + expectedLines[0].length; // If the character length of "actual" and "expected" together is less than
	    // kMaxShortLength and if neither is an object and at least one of them is
	    // not `zero`, use the strict equal comparison to visualize the output.

	    if (inputLength <= kMaxShortLength) {
	      if ((_typeof(actual) !== 'object' || actual === null) && (_typeof(expected) !== 'object' || expected === null) && (actual !== 0 || expected !== 0)) {
	        // -0 === +0
	        return "".concat(kReadableOperator[operator], "\n\n") + "".concat(actualLines[0], " !== ").concat(expectedLines[0], "\n");
	      }
	    } else if (operator !== 'strictEqualObject') {
	      // If the stderr is a tty and the input length is lower than the current
	      // columns per line, add a mismatch indicator below the output. If it is
	      // not a tty, use a default value of 80 characters.
	      var maxLength = process.stderr && process.stderr.isTTY ? process.stderr.columns : 80;

	      if (inputLength < maxLength) {
	        while (actualLines[0][i] === expectedLines[0][i]) {
	          i++;
	        } // Ignore the first characters.


	        if (i > 2) {
	          // Add position indicator for the first mismatch in case it is a
	          // single line and the input length is less than the column length.
	          indicator = "\n  ".concat(repeat(' ', i), "^");
	          i = 0;
	        }
	      }
	    }
	  } // Remove all ending lines that match (this optimizes the output for
	  // readability by reducing the number of total changed lines).


	  var a = actualLines[actualLines.length - 1];
	  var b = expectedLines[expectedLines.length - 1];

	  while (a === b) {
	    if (i++ < 2) {
	      end = "\n  ".concat(a).concat(end);
	    } else {
	      other = a;
	    }

	    actualLines.pop();
	    expectedLines.pop();
	    if (actualLines.length === 0 || expectedLines.length === 0) break;
	    a = actualLines[actualLines.length - 1];
	    b = expectedLines[expectedLines.length - 1];
	  }

	  var maxLines = Math.max(actualLines.length, expectedLines.length); // Strict equal with identical objects that are not identical by reference.
	  // E.g., assert.deepStrictEqual({ a: Symbol() }, { a: Symbol() })

	  if (maxLines === 0) {
	    // We have to get the result again. The lines were all removed before.
	    var _actualLines = actualInspected.split('\n'); // Only remove lines in case it makes sense to collapse those.
	    // TODO: Accept env to always show the full error.


	    if (_actualLines.length > 30) {
	      _actualLines[26] = "".concat(blue, "...").concat(white);

	      while (_actualLines.length > 27) {
	        _actualLines.pop();
	      }
	    }

	    return "".concat(kReadableOperator.notIdentical, "\n\n").concat(_actualLines.join('\n'), "\n");
	  }

	  if (i > 3) {
	    end = "\n".concat(blue, "...").concat(white).concat(end);
	    skipped = true;
	  }

	  if (other !== '') {
	    end = "\n  ".concat(other).concat(end);
	    other = '';
	  }

	  var printedLines = 0;
	  var msg = kReadableOperator[operator] + "\n".concat(green, "+ actual").concat(white, " ").concat(red, "- expected").concat(white);
	  var skippedMsg = " ".concat(blue, "...").concat(white, " Lines skipped");

	  for (i = 0; i < maxLines; i++) {
	    // Only extra expected lines exist
	    var cur = i - lastPos;

	    if (actualLines.length < i + 1) {
	      // If the last diverging line is more than one line above and the
	      // current line is at least line three, add some of the former lines and
	      // also add dots to indicate skipped entries.
	      if (cur > 1 && i > 2) {
	        if (cur > 4) {
	          res += "\n".concat(blue, "...").concat(white);
	          skipped = true;
	        } else if (cur > 3) {
	          res += "\n  ".concat(expectedLines[i - 2]);
	          printedLines++;
	        }

	        res += "\n  ".concat(expectedLines[i - 1]);
	        printedLines++;
	      } // Mark the current line as the last diverging one.


	      lastPos = i; // Add the expected line to the cache.

	      other += "\n".concat(red, "-").concat(white, " ").concat(expectedLines[i]);
	      printedLines++; // Only extra actual lines exist
	    } else if (expectedLines.length < i + 1) {
	      // If the last diverging line is more than one line above and the
	      // current line is at least line three, add some of the former lines and
	      // also add dots to indicate skipped entries.
	      if (cur > 1 && i > 2) {
	        if (cur > 4) {
	          res += "\n".concat(blue, "...").concat(white);
	          skipped = true;
	        } else if (cur > 3) {
	          res += "\n  ".concat(actualLines[i - 2]);
	          printedLines++;
	        }

	        res += "\n  ".concat(actualLines[i - 1]);
	        printedLines++;
	      } // Mark the current line as the last diverging one.


	      lastPos = i; // Add the actual line to the result.

	      res += "\n".concat(green, "+").concat(white, " ").concat(actualLines[i]);
	      printedLines++; // Lines diverge
	    } else {
	      var expectedLine = expectedLines[i];
	      var actualLine = actualLines[i]; // If the lines diverge, specifically check for lines that only diverge by
	      // a trailing comma. In that case it is actually identical and we should
	      // mark it as such.

	      var divergingLines = actualLine !== expectedLine && (!endsWith(actualLine, ',') || actualLine.slice(0, -1) !== expectedLine); // If the expected line has a trailing comma but is otherwise identical,
	      // add a comma at the end of the actual line. Otherwise the output could
	      // look weird as in:
	      //
	      //   [
	      //     1         // No comma at the end!
	      // +   2
	      //   ]
	      //

	      if (divergingLines && endsWith(expectedLine, ',') && expectedLine.slice(0, -1) === actualLine) {
	        divergingLines = false;
	        actualLine += ',';
	      }

	      if (divergingLines) {
	        // If the last diverging line is more than one line above and the
	        // current line is at least line three, add some of the former lines and
	        // also add dots to indicate skipped entries.
	        if (cur > 1 && i > 2) {
	          if (cur > 4) {
	            res += "\n".concat(blue, "...").concat(white);
	            skipped = true;
	          } else if (cur > 3) {
	            res += "\n  ".concat(actualLines[i - 2]);
	            printedLines++;
	          }

	          res += "\n  ".concat(actualLines[i - 1]);
	          printedLines++;
	        } // Mark the current line as the last diverging one.


	        lastPos = i; // Add the actual line to the result and cache the expected diverging
	        // line so consecutive diverging lines show up as +++--- and not +-+-+-.

	        res += "\n".concat(green, "+").concat(white, " ").concat(actualLine);
	        other += "\n".concat(red, "-").concat(white, " ").concat(expectedLine);
	        printedLines += 2; // Lines are identical
	      } else {
	        // Add all cached information to the result before adding other things
	        // and reset the cache.
	        res += other;
	        other = ''; // If the last diverging line is exactly one line above or if it is the
	        // very first line, add the line to the result.

	        if (cur === 1 || i === 0) {
	          res += "\n  ".concat(actualLine);
	          printedLines++;
	        }
	      }
	    } // Inspected object to big (Show ~20 rows max)


	    if (printedLines > 20 && i < maxLines - 2) {
	      return "".concat(msg).concat(skippedMsg, "\n").concat(res, "\n").concat(blue, "...").concat(white).concat(other, "\n") + "".concat(blue, "...").concat(white);
	    }
	  }

	  return "".concat(msg).concat(skipped ? skippedMsg : '', "\n").concat(res).concat(other).concat(end).concat(indicator);
	}

	var AssertionError =
	/*#__PURE__*/
	function (_Error) {
	  _inherits(AssertionError, _Error);

	  function AssertionError(options) {
	    var _this;

	    _classCallCheck(this, AssertionError);

	    if (_typeof(options) !== 'object' || options === null) {
	      throw new ERR_INVALID_ARG_TYPE('options', 'Object', options);
	    }

	    var message = options.message,
	        operator = options.operator,
	        stackStartFn = options.stackStartFn;
	    var actual = options.actual,
	        expected = options.expected;
	    var limit = Error.stackTraceLimit;
	    Error.stackTraceLimit = 0;

	    if (message != null) {
	      _this = _possibleConstructorReturn(this, _getPrototypeOf(AssertionError).call(this, String(message)));
	    } else {
	      if (process.stderr && process.stderr.isTTY) {
	        // Reset on each call to make sure we handle dynamically set environment
	        // variables correct.
	        if (process.stderr && process.stderr.getColorDepth && process.stderr.getColorDepth() !== 1) {
	          blue = "\x1B[34m";
	          green = "\x1B[32m";
	          white = "\x1B[39m";
	          red = "\x1B[31m";
	        } else {
	          blue = '';
	          green = '';
	          white = '';
	          red = '';
	        }
	      } // Prevent the error stack from being visible by duplicating the error
	      // in a very close way to the original in case both sides are actually
	      // instances of Error.


	      if (_typeof(actual) === 'object' && actual !== null && _typeof(expected) === 'object' && expected !== null && 'stack' in actual && actual instanceof Error && 'stack' in expected && expected instanceof Error) {
	        actual = copyError(actual);
	        expected = copyError(expected);
	      }

	      if (operator === 'deepStrictEqual' || operator === 'strictEqual') {
	        _this = _possibleConstructorReturn(this, _getPrototypeOf(AssertionError).call(this, createErrDiff(actual, expected, operator)));
	      } else if (operator === 'notDeepStrictEqual' || operator === 'notStrictEqual') {
	        // In case the objects are equal but the operator requires unequal, show
	        // the first object and say A equals B
	        var base = kReadableOperator[operator];
	        var res = inspectValue(actual).split('\n'); // In case "actual" is an object, it should not be reference equal.

	        if (operator === 'notStrictEqual' && _typeof(actual) === 'object' && actual !== null) {
	          base = kReadableOperator.notStrictEqualObject;
	        } // Only remove lines in case it makes sense to collapse those.
	        // TODO: Accept env to always show the full error.


	        if (res.length > 30) {
	          res[26] = "".concat(blue, "...").concat(white);

	          while (res.length > 27) {
	            res.pop();
	          }
	        } // Only print a single input.


	        if (res.length === 1) {
	          _this = _possibleConstructorReturn(this, _getPrototypeOf(AssertionError).call(this, "".concat(base, " ").concat(res[0])));
	        } else {
	          _this = _possibleConstructorReturn(this, _getPrototypeOf(AssertionError).call(this, "".concat(base, "\n\n").concat(res.join('\n'), "\n")));
	        }
	      } else {
	        var _res = inspectValue(actual);

	        var other = '';
	        var knownOperators = kReadableOperator[operator];

	        if (operator === 'notDeepEqual' || operator === 'notEqual') {
	          _res = "".concat(kReadableOperator[operator], "\n\n").concat(_res);

	          if (_res.length > 1024) {
	            _res = "".concat(_res.slice(0, 1021), "...");
	          }
	        } else {
	          other = "".concat(inspectValue(expected));

	          if (_res.length > 512) {
	            _res = "".concat(_res.slice(0, 509), "...");
	          }

	          if (other.length > 512) {
	            other = "".concat(other.slice(0, 509), "...");
	          }

	          if (operator === 'deepEqual' || operator === 'equal') {
	            _res = "".concat(knownOperators, "\n\n").concat(_res, "\n\nshould equal\n\n");
	          } else {
	            other = " ".concat(operator, " ").concat(other);
	          }
	        }

	        _this = _possibleConstructorReturn(this, _getPrototypeOf(AssertionError).call(this, "".concat(_res).concat(other)));
	      }
	    }

	    Error.stackTraceLimit = limit;
	    _this.generatedMessage = !message;
	    Object.defineProperty(_assertThisInitialized(_this), 'name', {
	      value: 'AssertionError [ERR_ASSERTION]',
	      enumerable: false,
	      writable: true,
	      configurable: true
	    });
	    _this.code = 'ERR_ASSERTION';
	    _this.actual = actual;
	    _this.expected = expected;
	    _this.operator = operator;

	    if (Error.captureStackTrace) {
	      // eslint-disable-next-line no-restricted-syntax
	      Error.captureStackTrace(_assertThisInitialized(_this), stackStartFn);
	    } // Create error message including the error code in the name.


	    _this.stack; // Reset the name.

	    _this.name = 'AssertionError';
	    return _possibleConstructorReturn(_this);
	  }

	  _createClass(AssertionError, [{
	    key: "toString",
	    value: function toString() {
	      return "".concat(this.name, " [").concat(this.code, "]: ").concat(this.message);
	    }
	  }, {
	    key: inspect.custom,
	    value: function value(recurseTimes, ctx) {
	      // This limits the `actual` and `expected` property default inspection to
	      // the minimum depth. Otherwise those values would be too verbose compared
	      // to the actual error message which contains a combined view of these two
	      // input values.
	      return inspect(this, _objectSpread({}, ctx, {
	        customInspect: false,
	        depth: 0
	      }));
	    }
	  }]);

	  return AssertionError;
	}(_wrapNativeSuper(Error));

	assertion_error = AssertionError;
	return assertion_error;
}

/**
 * Code refactored from Mozilla Developer Network:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */

var es6ObjectAssign;
var hasRequiredEs6ObjectAssign;

function requireEs6ObjectAssign () {
	if (hasRequiredEs6ObjectAssign) return es6ObjectAssign;
	hasRequiredEs6ObjectAssign = 1;

	function assign(target, firstSource) {
	  if (target === undefined || target === null) {
	    throw new TypeError('Cannot convert first argument to object');
	  }

	  var to = Object(target);
	  for (var i = 1; i < arguments.length; i++) {
	    var nextSource = arguments[i];
	    if (nextSource === undefined || nextSource === null) {
	      continue;
	    }

	    var keysArray = Object.keys(Object(nextSource));
	    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
	      var nextKey = keysArray[nextIndex];
	      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
	      if (desc !== undefined && desc.enumerable) {
	        to[nextKey] = nextSource[nextKey];
	      }
	    }
	  }
	  return to;
	}

	function polyfill() {
	  if (!Object.assign) {
	    Object.defineProperty(Object, 'assign', {
	      enumerable: false,
	      configurable: true,
	      writable: true,
	      value: assign
	    });
	  }
	}

	es6ObjectAssign = {
	  assign: assign,
	  polyfill: polyfill
	};
	return es6ObjectAssign;
}

var isArguments$7;
var hasRequiredIsArguments;

function requireIsArguments () {
	if (hasRequiredIsArguments) return isArguments$7;
	hasRequiredIsArguments = 1;

	var toStr = Object.prototype.toString;

	isArguments$7 = function isArguments(value) {
		var str = toStr.call(value);
		var isArgs = str === '[object Arguments]';
		if (!isArgs) {
			isArgs = str !== '[object Array]' &&
				value !== null &&
				typeof value === 'object' &&
				typeof value.length === 'number' &&
				value.length >= 0 &&
				toStr.call(value.callee) === '[object Function]';
		}
		return isArgs;
	};
	return isArguments$7;
}

var implementation$4;
var hasRequiredImplementation$2;

function requireImplementation$2 () {
	if (hasRequiredImplementation$2) return implementation$4;
	hasRequiredImplementation$2 = 1;

	var keysShim;
	if (!Object.keys) {
		// modified from https://github.com/es-shims/es5-shim
		var has = Object.prototype.hasOwnProperty;
		var toStr = Object.prototype.toString;
		var isArgs = requireIsArguments(); // eslint-disable-line global-require
		var isEnumerable = Object.prototype.propertyIsEnumerable;
		var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
		var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
		var dontEnums = [
			'toString',
			'toLocaleString',
			'valueOf',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'constructor'
		];
		var equalsConstructorPrototype = function (o) {
			var ctor = o.constructor;
			return ctor && ctor.prototype === o;
		};
		var excludedKeys = {
			$applicationCache: true,
			$console: true,
			$external: true,
			$frame: true,
			$frameElement: true,
			$frames: true,
			$innerHeight: true,
			$innerWidth: true,
			$onmozfullscreenchange: true,
			$onmozfullscreenerror: true,
			$outerHeight: true,
			$outerWidth: true,
			$pageXOffset: true,
			$pageYOffset: true,
			$parent: true,
			$scrollLeft: true,
			$scrollTop: true,
			$scrollX: true,
			$scrollY: true,
			$self: true,
			$webkitIndexedDB: true,
			$webkitStorageInfo: true,
			$window: true
		};
		var hasAutomationEqualityBug = (function () {
			/* global window */
			if (typeof window === 'undefined') { return false; }
			for (var k in window) {
				try {
					if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
						try {
							equalsConstructorPrototype(window[k]);
						} catch (e) {
							return true;
						}
					}
				} catch (e) {
					return true;
				}
			}
			return false;
		}());
		var equalsConstructorPrototypeIfNotBuggy = function (o) {
			/* global window */
			if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
				return equalsConstructorPrototype(o);
			}
			try {
				return equalsConstructorPrototype(o);
			} catch (e) {
				return false;
			}
		};

		keysShim = function keys(object) {
			var isObject = object !== null && typeof object === 'object';
			var isFunction = toStr.call(object) === '[object Function]';
			var isArguments = isArgs(object);
			var isString = isObject && toStr.call(object) === '[object String]';
			var theKeys = [];

			if (!isObject && !isFunction && !isArguments) {
				throw new TypeError('Object.keys called on a non-object');
			}

			var skipProto = hasProtoEnumBug && isFunction;
			if (isString && object.length > 0 && !has.call(object, 0)) {
				for (var i = 0; i < object.length; ++i) {
					theKeys.push(String(i));
				}
			}

			if (isArguments && object.length > 0) {
				for (var j = 0; j < object.length; ++j) {
					theKeys.push(String(j));
				}
			} else {
				for (var name in object) {
					if (!(skipProto && name === 'prototype') && has.call(object, name)) {
						theKeys.push(String(name));
					}
				}
			}

			if (hasDontEnumBug) {
				var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

				for (var k = 0; k < dontEnums.length; ++k) {
					if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
						theKeys.push(dontEnums[k]);
					}
				}
			}
			return theKeys;
		};
	}
	implementation$4 = keysShim;
	return implementation$4;
}

var objectKeys;
var hasRequiredObjectKeys;

function requireObjectKeys () {
	if (hasRequiredObjectKeys) return objectKeys;
	hasRequiredObjectKeys = 1;

	var slice = Array.prototype.slice;
	var isArgs = requireIsArguments();

	var origKeys = Object.keys;
	var keysShim = origKeys ? function keys(o) { return origKeys(o); } : requireImplementation$2();

	var originalKeys = Object.keys;

	keysShim.shim = function shimObjectKeys() {
		if (Object.keys) {
			var keysWorksWithArguments = (function () {
				// Safari 5.0 bug
				var args = Object.keys(arguments);
				return args && args.length === arguments.length;
			}(1, 2));
			if (!keysWorksWithArguments) {
				Object.keys = function keys(object) { // eslint-disable-line func-name-matching
					if (isArgs(object)) {
						return originalKeys(slice.call(object));
					}
					return originalKeys(object);
				};
			}
		} else {
			Object.keys = keysShim;
		}
		return Object.keys || keysShim;
	};

	objectKeys = keysShim;
	return objectKeys;
}

var defineProperties_1;
var hasRequiredDefineProperties;

function requireDefineProperties () {
	if (hasRequiredDefineProperties) return defineProperties_1;
	hasRequiredDefineProperties = 1;

	var keys = requireObjectKeys();
	var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

	var toStr = Object.prototype.toString;
	var concat = Array.prototype.concat;
	var defineDataProperty = requireDefineDataProperty();

	var isFunction = function (fn) {
		return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
	};

	var supportsDescriptors = requireHasPropertyDescriptors()();

	var defineProperty = function (object, name, value, predicate) {
		if (name in object) {
			if (predicate === true) {
				if (object[name] === value) {
					return;
				}
			} else if (!isFunction(predicate) || !predicate()) {
				return;
			}
		}

		if (supportsDescriptors) {
			defineDataProperty(object, name, value, true);
		} else {
			defineDataProperty(object, name, value);
		}
	};

	var defineProperties = function (object, map) {
		var predicates = arguments.length > 2 ? arguments[2] : {};
		var props = keys(map);
		if (hasSymbols) {
			props = concat.call(props, Object.getOwnPropertySymbols(map));
		}
		for (var i = 0; i < props.length; i += 1) {
			defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
		}
	};

	defineProperties.supportsDescriptors = !!supportsDescriptors;

	defineProperties_1 = defineProperties;
	return defineProperties_1;
}

var implementation$3;
var hasRequiredImplementation$1;

function requireImplementation$1 () {
	if (hasRequiredImplementation$1) return implementation$3;
	hasRequiredImplementation$1 = 1;

	var numberIsNaN = function (value) {
		return value !== value;
	};

	implementation$3 = function is(a, b) {
		if (a === 0 && b === 0) {
			return 1 / a === 1 / b;
		}
		if (a === b) {
			return true;
		}
		if (numberIsNaN(a) && numberIsNaN(b)) {
			return true;
		}
		return false;
	};
	return implementation$3;
}

var polyfill$1;
var hasRequiredPolyfill$1;

function requirePolyfill$1 () {
	if (hasRequiredPolyfill$1) return polyfill$1;
	hasRequiredPolyfill$1 = 1;

	var implementation = requireImplementation$1();

	polyfill$1 = function getPolyfill() {
		return typeof Object.is === 'function' ? Object.is : implementation;
	};
	return polyfill$1;
}

var shim$1;
var hasRequiredShim$1;

function requireShim$1 () {
	if (hasRequiredShim$1) return shim$1;
	hasRequiredShim$1 = 1;

	var getPolyfill = requirePolyfill$1();
	var define = requireDefineProperties();

	shim$1 = function shimObjectIs() {
		var polyfill = getPolyfill();
		define(Object, { is: polyfill }, {
			is: function testObjectIs() {
				return Object.is !== polyfill;
			}
		});
		return polyfill;
	};
	return shim$1;
}

var objectIs;
var hasRequiredObjectIs;

function requireObjectIs () {
	if (hasRequiredObjectIs) return objectIs;
	hasRequiredObjectIs = 1;

	var define = requireDefineProperties();
	var callBind = requireCallBind();

	var implementation = requireImplementation$1();
	var getPolyfill = requirePolyfill$1();
	var shim = requireShim$1();

	var polyfill = callBind(getPolyfill(), Object);

	define(polyfill, {
		getPolyfill: getPolyfill,
		implementation: implementation,
		shim: shim
	});

	objectIs = polyfill;
	return objectIs;
}

var implementation$2;
var hasRequiredImplementation;

function requireImplementation () {
	if (hasRequiredImplementation) return implementation$2;
	hasRequiredImplementation = 1;

	/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

	implementation$2 = function isNaN(value) {
		return value !== value;
	};
	return implementation$2;
}

var polyfill;
var hasRequiredPolyfill;

function requirePolyfill () {
	if (hasRequiredPolyfill) return polyfill;
	hasRequiredPolyfill = 1;

	var implementation = requireImplementation();

	polyfill = function getPolyfill() {
		if (Number.isNaN && Number.isNaN(NaN) && !Number.isNaN('a')) {
			return Number.isNaN;
		}
		return implementation;
	};
	return polyfill;
}

var shim;
var hasRequiredShim;

function requireShim () {
	if (hasRequiredShim) return shim;
	hasRequiredShim = 1;

	var define = requireDefineProperties();
	var getPolyfill = requirePolyfill();

	/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

	shim = function shimNumberIsNaN() {
		var polyfill = getPolyfill();
		define(Number, { isNaN: polyfill }, {
			isNaN: function testIsNaN() {
				return Number.isNaN !== polyfill;
			}
		});
		return polyfill;
	};
	return shim;
}

var isNan;
var hasRequiredIsNan;

function requireIsNan () {
	if (hasRequiredIsNan) return isNan;
	hasRequiredIsNan = 1;

	var callBind = requireCallBind();
	var define = requireDefineProperties();

	var implementation = requireImplementation();
	var getPolyfill = requirePolyfill();
	var shim = requireShim();

	var polyfill = callBind(getPolyfill(), Number);

	/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

	define(polyfill, {
		getPolyfill: getPolyfill,
		implementation: implementation,
		shim: shim
	});

	isNan = polyfill;
	return isNan;
}

var comparisons;
var hasRequiredComparisons;

function requireComparisons () {
	if (hasRequiredComparisons) return comparisons;
	hasRequiredComparisons = 1;

	function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

	function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

	function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

	function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

	function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

	var regexFlagsSupported = /a/g.flags !== undefined;

	var arrayFromSet = function arrayFromSet(set) {
	  var array = [];
	  set.forEach(function (value) {
	    return array.push(value);
	  });
	  return array;
	};

	var arrayFromMap = function arrayFromMap(map) {
	  var array = [];
	  map.forEach(function (value, key) {
	    return array.push([key, value]);
	  });
	  return array;
	};

	var objectIs = Object.is ? Object.is : requireObjectIs();
	var objectGetOwnPropertySymbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols : function () {
	  return [];
	};
	var numberIsNaN = Number.isNaN ? Number.isNaN : requireIsNan();

	function uncurryThis(f) {
	  return f.call.bind(f);
	}

	var hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
	var propertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);
	var objectToString = uncurryThis(Object.prototype.toString);

	var _require$types = util$1.types,
	    isAnyArrayBuffer = _require$types.isAnyArrayBuffer,
	    isArrayBufferView = _require$types.isArrayBufferView,
	    isDate = _require$types.isDate,
	    isMap = _require$types.isMap,
	    isRegExp = _require$types.isRegExp,
	    isSet = _require$types.isSet,
	    isNativeError = _require$types.isNativeError,
	    isBoxedPrimitive = _require$types.isBoxedPrimitive,
	    isNumberObject = _require$types.isNumberObject,
	    isStringObject = _require$types.isStringObject,
	    isBooleanObject = _require$types.isBooleanObject,
	    isBigIntObject = _require$types.isBigIntObject,
	    isSymbolObject = _require$types.isSymbolObject,
	    isFloat32Array = _require$types.isFloat32Array,
	    isFloat64Array = _require$types.isFloat64Array;

	function isNonIndex(key) {
	  if (key.length === 0 || key.length > 10) return true;

	  for (var i = 0; i < key.length; i++) {
	    var code = key.charCodeAt(i);
	    if (code < 48 || code > 57) return true;
	  } // The maximum size for an array is 2 ** 32 -1.


	  return key.length === 10 && key >= Math.pow(2, 32);
	}

	function getOwnNonIndexProperties(value) {
	  return Object.keys(value).filter(isNonIndex).concat(objectGetOwnPropertySymbols(value).filter(Object.prototype.propertyIsEnumerable.bind(value)));
	} // Taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
	// original notice:

	/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */


	function compare(a, b) {
	  if (a === b) {
	    return 0;
	  }

	  var x = a.length;
	  var y = b.length;

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i];
	      y = b[i];
	      break;
	    }
	  }

	  if (x < y) {
	    return -1;
	  }

	  if (y < x) {
	    return 1;
	  }

	  return 0;
	}
	var kStrict = true;
	var kLoose = false;
	var kNoIterator = 0;
	var kIsArray = 1;
	var kIsSet = 2;
	var kIsMap = 3; // Check if they have the same source and flags

	function areSimilarRegExps(a, b) {
	  return regexFlagsSupported ? a.source === b.source && a.flags === b.flags : RegExp.prototype.toString.call(a) === RegExp.prototype.toString.call(b);
	}

	function areSimilarFloatArrays(a, b) {
	  if (a.byteLength !== b.byteLength) {
	    return false;
	  }

	  for (var offset = 0; offset < a.byteLength; offset++) {
	    if (a[offset] !== b[offset]) {
	      return false;
	    }
	  }

	  return true;
	}

	function areSimilarTypedArrays(a, b) {
	  if (a.byteLength !== b.byteLength) {
	    return false;
	  }

	  return compare(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), new Uint8Array(b.buffer, b.byteOffset, b.byteLength)) === 0;
	}

	function areEqualArrayBuffers(buf1, buf2) {
	  return buf1.byteLength === buf2.byteLength && compare(new Uint8Array(buf1), new Uint8Array(buf2)) === 0;
	}

	function isEqualBoxedPrimitive(val1, val2) {
	  if (isNumberObject(val1)) {
	    return isNumberObject(val2) && objectIs(Number.prototype.valueOf.call(val1), Number.prototype.valueOf.call(val2));
	  }

	  if (isStringObject(val1)) {
	    return isStringObject(val2) && String.prototype.valueOf.call(val1) === String.prototype.valueOf.call(val2);
	  }

	  if (isBooleanObject(val1)) {
	    return isBooleanObject(val2) && Boolean.prototype.valueOf.call(val1) === Boolean.prototype.valueOf.call(val2);
	  }

	  if (isBigIntObject(val1)) {
	    return isBigIntObject(val2) && BigInt.prototype.valueOf.call(val1) === BigInt.prototype.valueOf.call(val2);
	  }

	  return isSymbolObject(val2) && Symbol.prototype.valueOf.call(val1) === Symbol.prototype.valueOf.call(val2);
	} // Notes: Type tags are historical [[Class]] properties that can be set by
	// FunctionTemplate::SetClassName() in C++ or Symbol.toStringTag in JS
	// and retrieved using Object.prototype.toString.call(obj) in JS
	// See https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	// for a list of tags pre-defined in the spec.
	// There are some unspecified tags in the wild too (e.g. typed array tags).
	// Since tags can be altered, they only serve fast failures
	//
	// Typed arrays and buffers are checked by comparing the content in their
	// underlying ArrayBuffer. This optimization requires that it's
	// reasonable to interpret their underlying memory in the same way,
	// which is checked by comparing their type tags.
	// (e.g. a Uint8Array and a Uint16Array with the same memory content
	// could still be different because they will be interpreted differently).
	//
	// For strict comparison, objects should have
	// a) The same built-in type tags
	// b) The same prototypes.


	function innerDeepEqual(val1, val2, strict, memos) {
	  // All identical values are equivalent, as determined by ===.
	  if (val1 === val2) {
	    if (val1 !== 0) return true;
	    return strict ? objectIs(val1, val2) : true;
	  } // Check more closely if val1 and val2 are equal.


	  if (strict) {
	    if (_typeof(val1) !== 'object') {
	      return typeof val1 === 'number' && numberIsNaN(val1) && numberIsNaN(val2);
	    }

	    if (_typeof(val2) !== 'object' || val1 === null || val2 === null) {
	      return false;
	    }

	    if (Object.getPrototypeOf(val1) !== Object.getPrototypeOf(val2)) {
	      return false;
	    }
	  } else {
	    if (val1 === null || _typeof(val1) !== 'object') {
	      if (val2 === null || _typeof(val2) !== 'object') {
	        // eslint-disable-next-line eqeqeq
	        return val1 == val2;
	      }

	      return false;
	    }

	    if (val2 === null || _typeof(val2) !== 'object') {
	      return false;
	    }
	  }

	  var val1Tag = objectToString(val1);
	  var val2Tag = objectToString(val2);

	  if (val1Tag !== val2Tag) {
	    return false;
	  }

	  if (Array.isArray(val1)) {
	    // Check for sparse arrays and general fast path
	    if (val1.length !== val2.length) {
	      return false;
	    }

	    var keys1 = getOwnNonIndexProperties(val1);
	    var keys2 = getOwnNonIndexProperties(val2);

	    if (keys1.length !== keys2.length) {
	      return false;
	    }

	    return keyCheck(val1, val2, strict, memos, kIsArray, keys1);
	  } // [browserify] This triggers on certain types in IE (Map/Set) so we don't
	  // wan't to early return out of the rest of the checks. However we can check
	  // if the second value is one of these values and the first isn't.


	  if (val1Tag === '[object Object]') {
	    // return keyCheck(val1, val2, strict, memos, kNoIterator);
	    if (!isMap(val1) && isMap(val2) || !isSet(val1) && isSet(val2)) {
	      return false;
	    }
	  }

	  if (isDate(val1)) {
	    if (!isDate(val2) || Date.prototype.getTime.call(val1) !== Date.prototype.getTime.call(val2)) {
	      return false;
	    }
	  } else if (isRegExp(val1)) {
	    if (!isRegExp(val2) || !areSimilarRegExps(val1, val2)) {
	      return false;
	    }
	  } else if (isNativeError(val1) || val1 instanceof Error) {
	    // Do not compare the stack as it might differ even though the error itself
	    // is otherwise identical.
	    if (val1.message !== val2.message || val1.name !== val2.name) {
	      return false;
	    }
	  } else if (isArrayBufferView(val1)) {
	    if (!strict && (isFloat32Array(val1) || isFloat64Array(val1))) {
	      if (!areSimilarFloatArrays(val1, val2)) {
	        return false;
	      }
	    } else if (!areSimilarTypedArrays(val1, val2)) {
	      return false;
	    } // Buffer.compare returns true, so val1.length === val2.length. If they both
	    // only contain numeric keys, we don't need to exam further than checking
	    // the symbols.


	    var _keys = getOwnNonIndexProperties(val1);

	    var _keys2 = getOwnNonIndexProperties(val2);

	    if (_keys.length !== _keys2.length) {
	      return false;
	    }

	    return keyCheck(val1, val2, strict, memos, kNoIterator, _keys);
	  } else if (isSet(val1)) {
	    if (!isSet(val2) || val1.size !== val2.size) {
	      return false;
	    }

	    return keyCheck(val1, val2, strict, memos, kIsSet);
	  } else if (isMap(val1)) {
	    if (!isMap(val2) || val1.size !== val2.size) {
	      return false;
	    }

	    return keyCheck(val1, val2, strict, memos, kIsMap);
	  } else if (isAnyArrayBuffer(val1)) {
	    if (!areEqualArrayBuffers(val1, val2)) {
	      return false;
	    }
	  } else if (isBoxedPrimitive(val1) && !isEqualBoxedPrimitive(val1, val2)) {
	    return false;
	  }

	  return keyCheck(val1, val2, strict, memos, kNoIterator);
	}

	function getEnumerables(val, keys) {
	  return keys.filter(function (k) {
	    return propertyIsEnumerable(val, k);
	  });
	}

	function keyCheck(val1, val2, strict, memos, iterationType, aKeys) {
	  // For all remaining Object pairs, including Array, objects and Maps,
	  // equivalence is determined by having:
	  // a) The same number of owned enumerable properties
	  // b) The same set of keys/indexes (although not necessarily the same order)
	  // c) Equivalent values for every corresponding key/index
	  // d) For Sets and Maps, equal contents
	  // Note: this accounts for both named and indexed properties on Arrays.
	  if (arguments.length === 5) {
	    aKeys = Object.keys(val1);
	    var bKeys = Object.keys(val2); // The pair must have the same number of owned properties.

	    if (aKeys.length !== bKeys.length) {
	      return false;
	    }
	  } // Cheap key test


	  var i = 0;

	  for (; i < aKeys.length; i++) {
	    if (!hasOwnProperty(val2, aKeys[i])) {
	      return false;
	    }
	  }

	  if (strict && arguments.length === 5) {
	    var symbolKeysA = objectGetOwnPropertySymbols(val1);

	    if (symbolKeysA.length !== 0) {
	      var count = 0;

	      for (i = 0; i < symbolKeysA.length; i++) {
	        var key = symbolKeysA[i];

	        if (propertyIsEnumerable(val1, key)) {
	          if (!propertyIsEnumerable(val2, key)) {
	            return false;
	          }

	          aKeys.push(key);
	          count++;
	        } else if (propertyIsEnumerable(val2, key)) {
	          return false;
	        }
	      }

	      var symbolKeysB = objectGetOwnPropertySymbols(val2);

	      if (symbolKeysA.length !== symbolKeysB.length && getEnumerables(val2, symbolKeysB).length !== count) {
	        return false;
	      }
	    } else {
	      var _symbolKeysB = objectGetOwnPropertySymbols(val2);

	      if (_symbolKeysB.length !== 0 && getEnumerables(val2, _symbolKeysB).length !== 0) {
	        return false;
	      }
	    }
	  }

	  if (aKeys.length === 0 && (iterationType === kNoIterator || iterationType === kIsArray && val1.length === 0 || val1.size === 0)) {
	    return true;
	  } // Use memos to handle cycles.


	  if (memos === undefined) {
	    memos = {
	      val1: new Map(),
	      val2: new Map(),
	      position: 0
	    };
	  } else {
	    // We prevent up to two map.has(x) calls by directly retrieving the value
	    // and checking for undefined. The map can only contain numbers, so it is
	    // safe to check for undefined only.
	    var val2MemoA = memos.val1.get(val1);

	    if (val2MemoA !== undefined) {
	      var val2MemoB = memos.val2.get(val2);

	      if (val2MemoB !== undefined) {
	        return val2MemoA === val2MemoB;
	      }
	    }

	    memos.position++;
	  }

	  memos.val1.set(val1, memos.position);
	  memos.val2.set(val2, memos.position);
	  var areEq = objEquiv(val1, val2, strict, aKeys, memos, iterationType);
	  memos.val1.delete(val1);
	  memos.val2.delete(val2);
	  return areEq;
	}

	function setHasEqualElement(set, val1, strict, memo) {
	  // Go looking.
	  var setValues = arrayFromSet(set);

	  for (var i = 0; i < setValues.length; i++) {
	    var val2 = setValues[i];

	    if (innerDeepEqual(val1, val2, strict, memo)) {
	      // Remove the matching element to make sure we do not check that again.
	      set.delete(val2);
	      return true;
	    }
	  }

	  return false;
	} // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Loose_equality_using
	// Sadly it is not possible to detect corresponding values properly in case the
	// type is a string, number, bigint or boolean. The reason is that those values
	// can match lots of different string values (e.g., 1n == '+00001').


	function findLooseMatchingPrimitives(prim) {
	  switch (_typeof(prim)) {
	    case 'undefined':
	      return null;

	    case 'object':
	      // Only pass in null as object!
	      return undefined;

	    case 'symbol':
	      return false;

	    case 'string':
	      prim = +prim;
	    // Loose equal entries exist only if the string is possible to convert to
	    // a regular number and not NaN.
	    // Fall through

	    case 'number':
	      if (numberIsNaN(prim)) {
	        return false;
	      }

	  }

	  return true;
	}

	function setMightHaveLoosePrim(a, b, prim) {
	  var altValue = findLooseMatchingPrimitives(prim);
	  if (altValue != null) return altValue;
	  return b.has(altValue) && !a.has(altValue);
	}

	function mapMightHaveLoosePrim(a, b, prim, item, memo) {
	  var altValue = findLooseMatchingPrimitives(prim);

	  if (altValue != null) {
	    return altValue;
	  }

	  var curB = b.get(altValue);

	  if (curB === undefined && !b.has(altValue) || !innerDeepEqual(item, curB, false, memo)) {
	    return false;
	  }

	  return !a.has(altValue) && innerDeepEqual(item, curB, false, memo);
	}

	function setEquiv(a, b, strict, memo) {
	  // This is a lazily initiated Set of entries which have to be compared
	  // pairwise.
	  var set = null;
	  var aValues = arrayFromSet(a);

	  for (var i = 0; i < aValues.length; i++) {
	    var val = aValues[i]; // Note: Checking for the objects first improves the performance for object
	    // heavy sets but it is a minor slow down for primitives. As they are fast
	    // to check this improves the worst case scenario instead.

	    if (_typeof(val) === 'object' && val !== null) {
	      if (set === null) {
	        set = new Set();
	      } // If the specified value doesn't exist in the second set its an not null
	      // object (or non strict only: a not matching primitive) we'll need to go
	      // hunting for something thats deep-(strict-)equal to it. To make this
	      // O(n log n) complexity we have to copy these values in a new set first.


	      set.add(val);
	    } else if (!b.has(val)) {
	      if (strict) return false; // Fast path to detect missing string, symbol, undefined and null values.

	      if (!setMightHaveLoosePrim(a, b, val)) {
	        return false;
	      }

	      if (set === null) {
	        set = new Set();
	      }

	      set.add(val);
	    }
	  }

	  if (set !== null) {
	    var bValues = arrayFromSet(b);

	    for (var _i = 0; _i < bValues.length; _i++) {
	      var _val = bValues[_i]; // We have to check if a primitive value is already
	      // matching and only if it's not, go hunting for it.

	      if (_typeof(_val) === 'object' && _val !== null) {
	        if (!setHasEqualElement(set, _val, strict, memo)) return false;
	      } else if (!strict && !a.has(_val) && !setHasEqualElement(set, _val, strict, memo)) {
	        return false;
	      }
	    }

	    return set.size === 0;
	  }

	  return true;
	}

	function mapHasEqualEntry(set, map, key1, item1, strict, memo) {
	  // To be able to handle cases like:
	  //   Map([[{}, 'a'], [{}, 'b']]) vs Map([[{}, 'b'], [{}, 'a']])
	  // ... we need to consider *all* matching keys, not just the first we find.
	  var setValues = arrayFromSet(set);

	  for (var i = 0; i < setValues.length; i++) {
	    var key2 = setValues[i];

	    if (innerDeepEqual(key1, key2, strict, memo) && innerDeepEqual(item1, map.get(key2), strict, memo)) {
	      set.delete(key2);
	      return true;
	    }
	  }

	  return false;
	}

	function mapEquiv(a, b, strict, memo) {
	  var set = null;
	  var aEntries = arrayFromMap(a);

	  for (var i = 0; i < aEntries.length; i++) {
	    var _aEntries$i = _slicedToArray(aEntries[i], 2),
	        key = _aEntries$i[0],
	        item1 = _aEntries$i[1];

	    if (_typeof(key) === 'object' && key !== null) {
	      if (set === null) {
	        set = new Set();
	      }

	      set.add(key);
	    } else {
	      // By directly retrieving the value we prevent another b.has(key) check in
	      // almost all possible cases.
	      var item2 = b.get(key);

	      if (item2 === undefined && !b.has(key) || !innerDeepEqual(item1, item2, strict, memo)) {
	        if (strict) return false; // Fast path to detect missing string, symbol, undefined and null
	        // keys.

	        if (!mapMightHaveLoosePrim(a, b, key, item1, memo)) return false;

	        if (set === null) {
	          set = new Set();
	        }

	        set.add(key);
	      }
	    }
	  }

	  if (set !== null) {
	    var bEntries = arrayFromMap(b);

	    for (var _i2 = 0; _i2 < bEntries.length; _i2++) {
	      var _bEntries$_i = _slicedToArray(bEntries[_i2], 2),
	          key = _bEntries$_i[0],
	          item = _bEntries$_i[1];

	      if (_typeof(key) === 'object' && key !== null) {
	        if (!mapHasEqualEntry(set, a, key, item, strict, memo)) return false;
	      } else if (!strict && (!a.has(key) || !innerDeepEqual(a.get(key), item, false, memo)) && !mapHasEqualEntry(set, a, key, item, false, memo)) {
	        return false;
	      }
	    }

	    return set.size === 0;
	  }

	  return true;
	}

	function objEquiv(a, b, strict, keys, memos, iterationType) {
	  // Sets and maps don't have their entries accessible via normal object
	  // properties.
	  var i = 0;

	  if (iterationType === kIsSet) {
	    if (!setEquiv(a, b, strict, memos)) {
	      return false;
	    }
	  } else if (iterationType === kIsMap) {
	    if (!mapEquiv(a, b, strict, memos)) {
	      return false;
	    }
	  } else if (iterationType === kIsArray) {
	    for (; i < a.length; i++) {
	      if (hasOwnProperty(a, i)) {
	        if (!hasOwnProperty(b, i) || !innerDeepEqual(a[i], b[i], strict, memos)) {
	          return false;
	        }
	      } else if (hasOwnProperty(b, i)) {
	        return false;
	      } else {
	        // Array is sparse.
	        var keysA = Object.keys(a);

	        for (; i < keysA.length; i++) {
	          var key = keysA[i];

	          if (!hasOwnProperty(b, key) || !innerDeepEqual(a[key], b[key], strict, memos)) {
	            return false;
	          }
	        }

	        if (keysA.length !== Object.keys(b).length) {
	          return false;
	        }

	        return true;
	      }
	    }
	  } // The pair must have equivalent values for every corresponding key.
	  // Possibly expensive deep test:


	  for (i = 0; i < keys.length; i++) {
	    var _key = keys[i];

	    if (!innerDeepEqual(a[_key], b[_key], strict, memos)) {
	      return false;
	    }
	  }

	  return true;
	}

	function isDeepEqual(val1, val2) {
	  return innerDeepEqual(val1, val2, kLoose);
	}

	function isDeepStrictEqual(val1, val2) {
	  return innerDeepEqual(val1, val2, kStrict);
	}

	comparisons = {
	  isDeepEqual: isDeepEqual,
	  isDeepStrictEqual: isDeepStrictEqual
	};
	return comparisons;
}

var hasRequiredAssert;

function requireAssert () {
	if (hasRequiredAssert) return assert$3.exports;
	hasRequiredAssert = 1;

	function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _require = requireErrors(),
	    _require$codes = _require.codes,
	    ERR_AMBIGUOUS_ARGUMENT = _require$codes.ERR_AMBIGUOUS_ARGUMENT,
	    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
	    ERR_INVALID_ARG_VALUE = _require$codes.ERR_INVALID_ARG_VALUE,
	    ERR_INVALID_RETURN_VALUE = _require$codes.ERR_INVALID_RETURN_VALUE,
	    ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;

	var AssertionError = requireAssertion_error();

	var _require2 = util$1,
	    inspect = _require2.inspect;

	var _require$types = util$1.types,
	    isPromise = _require$types.isPromise,
	    isRegExp = _require$types.isRegExp;

	var objectAssign = Object.assign ? Object.assign : requireEs6ObjectAssign().assign;
	var objectIs = Object.is ? Object.is : requireObjectIs();
	var isDeepEqual;
	var isDeepStrictEqual;

	function lazyLoadComparison() {
	  var comparison = requireComparisons();

	  isDeepEqual = comparison.isDeepEqual;
	  isDeepStrictEqual = comparison.isDeepStrictEqual;
	} // Escape control characters but not \n and \t to keep the line breaks and

	var warned = false; // The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.

	var assert = assert$3.exports = ok;
	var NO_EXCEPTION_SENTINEL = {}; // All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided. All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.

	function innerFail(obj) {
	  if (obj.message instanceof Error) throw obj.message;
	  throw new AssertionError(obj);
	}

	function fail(actual, expected, message, operator, stackStartFn) {
	  var argsLen = arguments.length;
	  var internalMessage;

	  if (argsLen === 0) {
	    internalMessage = 'Failed';
	  } else if (argsLen === 1) {
	    message = actual;
	    actual = undefined;
	  } else {
	    if (warned === false) {
	      warned = true;
	      var warn = process.emitWarning ? process.emitWarning : console.warn.bind(console);
	      warn('assert.fail() with more than one argument is deprecated. ' + 'Please use assert.strictEqual() instead or only pass a message.', 'DeprecationWarning', 'DEP0094');
	    }

	    if (argsLen === 2) operator = '!=';
	  }

	  if (message instanceof Error) throw message;
	  var errArgs = {
	    actual: actual,
	    expected: expected,
	    operator: operator === undefined ? 'fail' : operator,
	    stackStartFn: stackStartFn || fail
	  };

	  if (message !== undefined) {
	    errArgs.message = message;
	  }

	  var err = new AssertionError(errArgs);

	  if (internalMessage) {
	    err.message = internalMessage;
	    err.generatedMessage = true;
	  }

	  throw err;
	}

	assert.fail = fail; // The AssertionError is defined in internal/error.

	assert.AssertionError = AssertionError;

	function innerOk(fn, argLen, value, message) {
	  if (!value) {
	    var generatedMessage = false;

	    if (argLen === 0) {
	      generatedMessage = true;
	      message = 'No value argument passed to `assert.ok()`';
	    } else if (message instanceof Error) {
	      throw message;
	    }

	    var err = new AssertionError({
	      actual: value,
	      expected: true,
	      message: message,
	      operator: '==',
	      stackStartFn: fn
	    });
	    err.generatedMessage = generatedMessage;
	    throw err;
	  }
	} // Pure assertion tests whether a value is truthy, as determined
	// by !!value.


	function ok() {
	  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }

	  innerOk.apply(void 0, [ok, args.length].concat(args));
	}

	assert.ok = ok; // The equality assertion tests shallow, coercive equality with ==.

	/* eslint-disable no-restricted-properties */

	assert.equal = function equal(actual, expected, message) {
	  if (arguments.length < 2) {
	    throw new ERR_MISSING_ARGS('actual', 'expected');
	  } // eslint-disable-next-line eqeqeq


	  if (actual != expected) {
	    innerFail({
	      actual: actual,
	      expected: expected,
	      message: message,
	      operator: '==',
	      stackStartFn: equal
	    });
	  }
	}; // The non-equality assertion tests for whether two objects are not
	// equal with !=.


	assert.notEqual = function notEqual(actual, expected, message) {
	  if (arguments.length < 2) {
	    throw new ERR_MISSING_ARGS('actual', 'expected');
	  } // eslint-disable-next-line eqeqeq


	  if (actual == expected) {
	    innerFail({
	      actual: actual,
	      expected: expected,
	      message: message,
	      operator: '!=',
	      stackStartFn: notEqual
	    });
	  }
	}; // The equivalence assertion tests a deep equality relation.


	assert.deepEqual = function deepEqual(actual, expected, message) {
	  if (arguments.length < 2) {
	    throw new ERR_MISSING_ARGS('actual', 'expected');
	  }

	  if (isDeepEqual === undefined) lazyLoadComparison();

	  if (!isDeepEqual(actual, expected)) {
	    innerFail({
	      actual: actual,
	      expected: expected,
	      message: message,
	      operator: 'deepEqual',
	      stackStartFn: deepEqual
	    });
	  }
	}; // The non-equivalence assertion tests for any deep inequality.


	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
	  if (arguments.length < 2) {
	    throw new ERR_MISSING_ARGS('actual', 'expected');
	  }

	  if (isDeepEqual === undefined) lazyLoadComparison();

	  if (isDeepEqual(actual, expected)) {
	    innerFail({
	      actual: actual,
	      expected: expected,
	      message: message,
	      operator: 'notDeepEqual',
	      stackStartFn: notDeepEqual
	    });
	  }
	};
	/* eslint-enable */


	assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
	  if (arguments.length < 2) {
	    throw new ERR_MISSING_ARGS('actual', 'expected');
	  }

	  if (isDeepEqual === undefined) lazyLoadComparison();

	  if (!isDeepStrictEqual(actual, expected)) {
	    innerFail({
	      actual: actual,
	      expected: expected,
	      message: message,
	      operator: 'deepStrictEqual',
	      stackStartFn: deepStrictEqual
	    });
	  }
	};

	assert.notDeepStrictEqual = notDeepStrictEqual;

	function notDeepStrictEqual(actual, expected, message) {
	  if (arguments.length < 2) {
	    throw new ERR_MISSING_ARGS('actual', 'expected');
	  }

	  if (isDeepEqual === undefined) lazyLoadComparison();

	  if (isDeepStrictEqual(actual, expected)) {
	    innerFail({
	      actual: actual,
	      expected: expected,
	      message: message,
	      operator: 'notDeepStrictEqual',
	      stackStartFn: notDeepStrictEqual
	    });
	  }
	}

	assert.strictEqual = function strictEqual(actual, expected, message) {
	  if (arguments.length < 2) {
	    throw new ERR_MISSING_ARGS('actual', 'expected');
	  }

	  if (!objectIs(actual, expected)) {
	    innerFail({
	      actual: actual,
	      expected: expected,
	      message: message,
	      operator: 'strictEqual',
	      stackStartFn: strictEqual
	    });
	  }
	};

	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
	  if (arguments.length < 2) {
	    throw new ERR_MISSING_ARGS('actual', 'expected');
	  }

	  if (objectIs(actual, expected)) {
	    innerFail({
	      actual: actual,
	      expected: expected,
	      message: message,
	      operator: 'notStrictEqual',
	      stackStartFn: notStrictEqual
	    });
	  }
	};

	var Comparison = function Comparison(obj, keys, actual) {
	  var _this = this;

	  _classCallCheck(this, Comparison);

	  keys.forEach(function (key) {
	    if (key in obj) {
	      if (actual !== undefined && typeof actual[key] === 'string' && isRegExp(obj[key]) && obj[key].test(actual[key])) {
	        _this[key] = actual[key];
	      } else {
	        _this[key] = obj[key];
	      }
	    }
	  });
	};

	function compareExceptionKey(actual, expected, key, message, keys, fn) {
	  if (!(key in actual) || !isDeepStrictEqual(actual[key], expected[key])) {
	    if (!message) {
	      // Create placeholder objects to create a nice output.
	      var a = new Comparison(actual, keys);
	      var b = new Comparison(expected, keys, actual);
	      var err = new AssertionError({
	        actual: a,
	        expected: b,
	        operator: 'deepStrictEqual',
	        stackStartFn: fn
	      });
	      err.actual = actual;
	      err.expected = expected;
	      err.operator = fn.name;
	      throw err;
	    }

	    innerFail({
	      actual: actual,
	      expected: expected,
	      message: message,
	      operator: fn.name,
	      stackStartFn: fn
	    });
	  }
	}

	function expectedException(actual, expected, msg, fn) {
	  if (typeof expected !== 'function') {
	    if (isRegExp(expected)) return expected.test(actual); // assert.doesNotThrow does not accept objects.

	    if (arguments.length === 2) {
	      throw new ERR_INVALID_ARG_TYPE('expected', ['Function', 'RegExp'], expected);
	    } // Handle primitives properly.


	    if (_typeof(actual) !== 'object' || actual === null) {
	      var err = new AssertionError({
	        actual: actual,
	        expected: expected,
	        message: msg,
	        operator: 'deepStrictEqual',
	        stackStartFn: fn
	      });
	      err.operator = fn.name;
	      throw err;
	    }

	    var keys = Object.keys(expected); // Special handle errors to make sure the name and the message are compared
	    // as well.

	    if (expected instanceof Error) {
	      keys.push('name', 'message');
	    } else if (keys.length === 0) {
	      throw new ERR_INVALID_ARG_VALUE('error', expected, 'may not be an empty object');
	    }

	    if (isDeepEqual === undefined) lazyLoadComparison();
	    keys.forEach(function (key) {
	      if (typeof actual[key] === 'string' && isRegExp(expected[key]) && expected[key].test(actual[key])) {
	        return;
	      }

	      compareExceptionKey(actual, expected, key, msg, keys, fn);
	    });
	    return true;
	  } // Guard instanceof against arrow functions as they don't have a prototype.


	  if (expected.prototype !== undefined && actual instanceof expected) {
	    return true;
	  }

	  if (Error.isPrototypeOf(expected)) {
	    return false;
	  }

	  return expected.call({}, actual) === true;
	}

	function getActual(fn) {
	  if (typeof fn !== 'function') {
	    throw new ERR_INVALID_ARG_TYPE('fn', 'Function', fn);
	  }

	  try {
	    fn();
	  } catch (e) {
	    return e;
	  }

	  return NO_EXCEPTION_SENTINEL;
	}

	function checkIsPromise(obj) {
	  // Accept native ES6 promises and promises that are implemented in a similar
	  // way. Do not accept thenables that use a function as `obj` and that have no
	  // `catch` handler.
	  // TODO: thenables are checked up until they have the correct methods,
	  // but according to documentation, the `then` method should receive
	  // the `fulfill` and `reject` arguments as well or it may be never resolved.
	  return isPromise(obj) || obj !== null && _typeof(obj) === 'object' && typeof obj.then === 'function' && typeof obj.catch === 'function';
	}

	function waitForActual(promiseFn) {
	  return Promise.resolve().then(function () {
	    var resultPromise;

	    if (typeof promiseFn === 'function') {
	      // Return a rejected promise if `promiseFn` throws synchronously.
	      resultPromise = promiseFn(); // Fail in case no promise is returned.

	      if (!checkIsPromise(resultPromise)) {
	        throw new ERR_INVALID_RETURN_VALUE('instance of Promise', 'promiseFn', resultPromise);
	      }
	    } else if (checkIsPromise(promiseFn)) {
	      resultPromise = promiseFn;
	    } else {
	      throw new ERR_INVALID_ARG_TYPE('promiseFn', ['Function', 'Promise'], promiseFn);
	    }

	    return Promise.resolve().then(function () {
	      return resultPromise;
	    }).then(function () {
	      return NO_EXCEPTION_SENTINEL;
	    }).catch(function (e) {
	      return e;
	    });
	  });
	}

	function expectsError(stackStartFn, actual, error, message) {
	  if (typeof error === 'string') {
	    if (arguments.length === 4) {
	      throw new ERR_INVALID_ARG_TYPE('error', ['Object', 'Error', 'Function', 'RegExp'], error);
	    }

	    if (_typeof(actual) === 'object' && actual !== null) {
	      if (actual.message === error) {
	        throw new ERR_AMBIGUOUS_ARGUMENT('error/message', "The error message \"".concat(actual.message, "\" is identical to the message."));
	      }
	    } else if (actual === error) {
	      throw new ERR_AMBIGUOUS_ARGUMENT('error/message', "The error \"".concat(actual, "\" is identical to the message."));
	    }

	    message = error;
	    error = undefined;
	  } else if (error != null && _typeof(error) !== 'object' && typeof error !== 'function') {
	    throw new ERR_INVALID_ARG_TYPE('error', ['Object', 'Error', 'Function', 'RegExp'], error);
	  }

	  if (actual === NO_EXCEPTION_SENTINEL) {
	    var details = '';

	    if (error && error.name) {
	      details += " (".concat(error.name, ")");
	    }

	    details += message ? ": ".concat(message) : '.';
	    var fnType = stackStartFn.name === 'rejects' ? 'rejection' : 'exception';
	    innerFail({
	      actual: undefined,
	      expected: error,
	      operator: stackStartFn.name,
	      message: "Missing expected ".concat(fnType).concat(details),
	      stackStartFn: stackStartFn
	    });
	  }

	  if (error && !expectedException(actual, error, message, stackStartFn)) {
	    throw actual;
	  }
	}

	function expectsNoError(stackStartFn, actual, error, message) {
	  if (actual === NO_EXCEPTION_SENTINEL) return;

	  if (typeof error === 'string') {
	    message = error;
	    error = undefined;
	  }

	  if (!error || expectedException(actual, error)) {
	    var details = message ? ": ".concat(message) : '.';
	    var fnType = stackStartFn.name === 'doesNotReject' ? 'rejection' : 'exception';
	    innerFail({
	      actual: actual,
	      expected: error,
	      operator: stackStartFn.name,
	      message: "Got unwanted ".concat(fnType).concat(details, "\n") + "Actual message: \"".concat(actual && actual.message, "\""),
	      stackStartFn: stackStartFn
	    });
	  }

	  throw actual;
	}

	assert.throws = function throws(promiseFn) {
	  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	    args[_key2 - 1] = arguments[_key2];
	  }

	  expectsError.apply(void 0, [throws, getActual(promiseFn)].concat(args));
	};

	assert.rejects = function rejects(promiseFn) {
	  for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
	    args[_key3 - 1] = arguments[_key3];
	  }

	  return waitForActual(promiseFn).then(function (result) {
	    return expectsError.apply(void 0, [rejects, result].concat(args));
	  });
	};

	assert.doesNotThrow = function doesNotThrow(fn) {
	  for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
	    args[_key4 - 1] = arguments[_key4];
	  }

	  expectsNoError.apply(void 0, [doesNotThrow, getActual(fn)].concat(args));
	};

	assert.doesNotReject = function doesNotReject(fn) {
	  for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
	    args[_key5 - 1] = arguments[_key5];
	  }

	  return waitForActual(fn).then(function (result) {
	    return expectsNoError.apply(void 0, [doesNotReject, result].concat(args));
	  });
	};

	assert.ifError = function ifError(err) {
	  if (err !== null && err !== undefined) {
	    var message = 'ifError got unwanted exception: ';

	    if (_typeof(err) === 'object' && typeof err.message === 'string') {
	      if (err.message.length === 0 && err.constructor) {
	        message += err.constructor.name;
	      } else {
	        message += err.message;
	      }
	    } else {
	      message += inspect(err);
	    }

	    var newErr = new AssertionError({
	      actual: err,
	      expected: null,
	      operator: 'ifError',
	      message: message,
	      stackStartFn: ifError
	    }); // Make sure we actually have a stack trace!

	    var origStack = err.stack;

	    if (typeof origStack === 'string') {
	      // This will remove any duplicated frames from the error frames taken
	      // from within `ifError` and add the original error frames to the newly
	      // created ones.
	      var tmp2 = origStack.split('\n');
	      tmp2.shift(); // Filter all frames existing in err.stack.

	      var tmp1 = newErr.stack.split('\n');

	      for (var i = 0; i < tmp2.length; i++) {
	        // Find the first occurrence of the frame.
	        var pos = tmp1.indexOf(tmp2[i]);

	        if (pos !== -1) {
	          // Only keep new frames.
	          tmp1 = tmp1.slice(0, pos);
	          break;
	        }
	      }

	      newErr.stack = "".concat(tmp1.join('\n'), "\n").concat(tmp2.join('\n'));
	    }

	    throw newErr;
	  }
	}; // Expose a strict only variant of assert


	function strict() {
	  for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
	    args[_key6] = arguments[_key6];
	  }

	  innerOk.apply(void 0, [strict, args.length].concat(args));
	}

	assert.strict = objectAssign(strict, assert, {
	  equal: assert.strictEqual,
	  deepEqual: assert.deepStrictEqual,
	  notEqual: assert.notStrictEqual,
	  notDeepEqual: assert.notDeepStrictEqual
	});
	assert.strict.strict = assert.strict;
	return assert$3.exports;
}

var assertExports = requireAssert();
var require$$0 = /*@__PURE__*/getDefaultExportFromCjs$1(assertExports);

var ttyBrowserify = {};

ttyBrowserify.isatty = function () { return false; };

function ReadStream() {
  throw new Error('tty.ReadStream is not implemented');
}
ttyBrowserify.ReadStream = ReadStream;

function WriteStream() {
  throw new Error('tty.WriteStream is not implemented');
}
ttyBrowserify.WriteStream = WriteStream;

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

/** Detect free variable `global` from Node.js. */

var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal$1;

var freeGlobal = _freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$8 = freeGlobal || freeSelf || Function('return this')();

var _root = root$8;

var root$7 = _root;

/** Built-in value references. */
var Symbol$8 = root$7.Symbol;

var _Symbol = Symbol$8;

var Symbol$7 = _Symbol;

/** Used for built-in method references. */
var objectProto$k = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$i = objectProto$k.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$k.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$7 ? Symbol$7.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag$1(value) {
  var isOwn = hasOwnProperty$i.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag$1;

/** Used for built-in method references. */

var objectProto$j = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto$j.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}

var _objectToString = objectToString$1;

var Symbol$6 = _Symbol,
    getRawTag = _getRawTag,
    objectToString = _objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol$6 ? Symbol$6.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag$7(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

var _baseGetTag = baseGetTag$7;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */

function isObject$k(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject$k;

var baseGetTag$6 = _baseGetTag,
    isObject$j = isObject_1;

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag$2 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$9(value) {
  if (!isObject$j(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag$6(value);
  return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction$9;

var root$6 = _root;

/** Used to detect overreaching core-js shims. */
var coreJsData$1 = root$6['__core-js_shared__'];

var _coreJsData = coreJsData$1;

var coreJsData = _coreJsData;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked$1(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

var _isMasked = isMasked$1;

/** Used for built-in method references. */

var funcProto$2 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$2 = funcProto$2.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource$2(func) {
  if (func != null) {
    try {
      return funcToString$2.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

var _toSource = toSource$2;

var isFunction$8 = isFunction_1,
    isMasked = _isMasked,
    isObject$i = isObject_1,
    toSource$1 = _toSource;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto$1 = Function.prototype,
    objectProto$i = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$h = objectProto$i.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString$1.call(hasOwnProperty$h).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative$1(value) {
  if (!isObject$i(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction$8(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource$1(value));
}

var _baseIsNative = baseIsNative$1;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */

function getValue$1(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue$1;

var baseIsNative = _baseIsNative,
    getValue = _getValue;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative$7(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

var _getNative = getNative$7;

var getNative$6 = _getNative;

var defineProperty$2 = (function() {
  try {
    var func = getNative$6(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

var _defineProperty = defineProperty$2;

var defineProperty$1 = _defineProperty;

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue$4(object, key, value) {
  if (key == '__proto__' && defineProperty$1) {
    defineProperty$1(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

var _baseAssignValue = baseAssignValue$4;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */

function eq$6(value, other) {
  return value === other || (value !== value && other !== other);
}

var eq_1 = eq$6;

var baseAssignValue$3 = _baseAssignValue,
    eq$5 = eq_1;

/** Used for built-in method references. */
var objectProto$h = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$g = objectProto$h.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue$4(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$g.call(object, key) && eq$5(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue$3(object, key, value);
  }
}

var _assignValue = assignValue$4;

var assignValue$3 = _assignValue,
    baseAssignValue$2 = _baseAssignValue;

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject$7(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue$2(object, key, newValue);
    } else {
      assignValue$3(object, key, newValue);
    }
  }
  return object;
}

var _copyObject = copyObject$7;

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */

function identity$5(value) {
  return value;
}

var identity_1 = identity$5;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */

function apply$1(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

var _apply = apply$1;

var apply = _apply;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax$2 = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest$1(func, start, transform) {
  start = nativeMax$2(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax$2(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

var _overRest = overRest$1;

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */

function constant$1(value) {
  return function() {
    return value;
  };
}

var constant_1 = constant$1;

var constant = constant_1,
    defineProperty = _defineProperty,
    identity$4 = identity_1;

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString$1 = !defineProperty ? identity$4 : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

var _baseSetToString = baseSetToString$1;

/** Used to detect hot functions by number of calls within a span of milliseconds. */

var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut$1(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

var _shortOut = shortOut$1;

var baseSetToString = _baseSetToString,
    shortOut = _shortOut;

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString$1 = shortOut(baseSetToString);

var _setToString = setToString$1;

var identity$3 = identity_1,
    overRest = _overRest,
    setToString = _setToString;

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest$2(func, start) {
  return setToString(overRest(func, start, identity$3), func + '');
}

var _baseRest = baseRest$2;

/** Used as references for various `Number` constants. */

var MAX_SAFE_INTEGER$1 = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength$3(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}

var isLength_1 = isLength$3;

var isFunction$7 = isFunction_1,
    isLength$2 = isLength_1;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike$9(value) {
  return value != null && isLength$2(value.length) && !isFunction$7(value);
}

var isArrayLike_1 = isArrayLike$9;

/** Used as references for various `Number` constants. */

var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex$4(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex$4;

var eq$4 = eq_1,
    isArrayLike$8 = isArrayLike_1,
    isIndex$3 = _isIndex,
    isObject$h = isObject_1;

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall$3(value, index, object) {
  if (!isObject$h(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike$8(object) && isIndex$3(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq$4(object[index], value);
  }
  return false;
}

var _isIterateeCall = isIterateeCall$3;

var baseRest$1 = _baseRest,
    isIterateeCall$2 = _isIterateeCall;

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner$3(assigner) {
  return baseRest$1(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall$2(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

var _createAssigner = createAssigner$3;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */

function baseTimes$1(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

var _baseTimes = baseTimes$1;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */

function isObjectLike$a(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike$a;

var baseGetTag$5 = _baseGetTag,
    isObjectLike$9 = isObjectLike_1;

/** `Object#toString` result references. */
var argsTag$3 = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments$1(value) {
  return isObjectLike$9(value) && baseGetTag$5(value) == argsTag$3;
}

var _baseIsArguments = baseIsArguments$1;

var baseIsArguments = _baseIsArguments,
    isObjectLike$8 = isObjectLike_1;

/** Used for built-in method references. */
var objectProto$g = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$f = objectProto$g.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$g.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments$6 = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike$8(value) && hasOwnProperty$f.call(value, 'callee') &&
    !propertyIsEnumerable$1.call(value, 'callee');
};

var isArguments_1 = isArguments$6;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */

var isArray$j = Array.isArray;

var isArray_1 = isArray$j;

var isBuffer$6 = {exports: {}};

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */

function stubFalse() {
  return false;
}

var stubFalse_1 = stubFalse;

isBuffer$6.exports;

(function (module, exports) {
	var root = _root,
	    stubFalse = stubFalse_1;

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;

	module.exports = isBuffer; 
} (isBuffer$6, isBuffer$6.exports));

var isBufferExports = isBuffer$6.exports;

var baseGetTag$4 = _baseGetTag,
    isLength$1 = isLength_1,
    isObjectLike$7 = isObjectLike_1;

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]',
    arrayTag$2 = '[object Array]',
    boolTag$3 = '[object Boolean]',
    dateTag$3 = '[object Date]',
    errorTag$2 = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag$7 = '[object Map]',
    numberTag$3 = '[object Number]',
    objectTag$4 = '[object Object]',
    regexpTag$3 = '[object RegExp]',
    setTag$7 = '[object Set]',
    stringTag$4 = '[object String]',
    weakMapTag$2 = '[object WeakMap]';

var arrayBufferTag$3 = '[object ArrayBuffer]',
    dataViewTag$4 = '[object DataView]',
    float32Tag$2 = '[object Float32Array]',
    float64Tag$2 = '[object Float64Array]',
    int8Tag$2 = '[object Int8Array]',
    int16Tag$2 = '[object Int16Array]',
    int32Tag$2 = '[object Int32Array]',
    uint8Tag$2 = '[object Uint8Array]',
    uint8ClampedTag$2 = '[object Uint8ClampedArray]',
    uint16Tag$2 = '[object Uint16Array]',
    uint32Tag$2 = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] =
typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] =
typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] =
typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] =
typedArrayTags[uint32Tag$2] = true;
typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$2] =
typedArrayTags[arrayBufferTag$3] = typedArrayTags[boolTag$3] =
typedArrayTags[dataViewTag$4] = typedArrayTags[dateTag$3] =
typedArrayTags[errorTag$2] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag$7] = typedArrayTags[numberTag$3] =
typedArrayTags[objectTag$4] = typedArrayTags[regexpTag$3] =
typedArrayTags[setTag$7] = typedArrayTags[stringTag$4] =
typedArrayTags[weakMapTag$2] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray$1(value) {
  return isObjectLike$7(value) &&
    isLength$1(value.length) && !!typedArrayTags[baseGetTag$4(value)];
}

var _baseIsTypedArray = baseIsTypedArray$1;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */

function baseUnary$3(func) {
  return function(value) {
    return func(value);
  };
}

var _baseUnary = baseUnary$3;

var _nodeUtil = {exports: {}};

_nodeUtil.exports;

(function (module, exports) {
	var freeGlobal = _freeGlobal;

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    // Use `util.types` for Node.js 10+.
	    var types = freeModule && freeModule.require && freeModule.require('util').types;

	    if (types) {
	      return types;
	    }

	    // Legacy `process.binding('util')` for Node.js < 10.
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

	module.exports = nodeUtil; 
} (_nodeUtil, _nodeUtil.exports));

var _nodeUtilExports = _nodeUtil.exports;

var baseIsTypedArray = _baseIsTypedArray,
    baseUnary$2 = _baseUnary,
    nodeUtil$2 = _nodeUtilExports;

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil$2 && nodeUtil$2.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray$7 = nodeIsTypedArray ? baseUnary$2(nodeIsTypedArray) : baseIsTypedArray;

var isTypedArray_1 = isTypedArray$7;

var baseTimes = _baseTimes,
    isArguments$5 = isArguments_1,
    isArray$i = isArray_1,
    isBuffer$5 = isBufferExports,
    isIndex$2 = _isIndex,
    isTypedArray$6 = isTypedArray_1;

/** Used for built-in method references. */
var objectProto$f = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$e = objectProto$f.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys$2(value, inherited) {
  var isArr = isArray$i(value),
      isArg = !isArr && isArguments$5(value),
      isBuff = !isArr && !isArg && isBuffer$5(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray$6(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$e.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex$2(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

var _arrayLikeKeys = arrayLikeKeys$2;

/** Used for built-in method references. */

var objectProto$e = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype$5(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$e;

  return value === proto;
}

var _isPrototype = isPrototype$5;

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */

function nativeKeysIn$1(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

var _nativeKeysIn = nativeKeysIn$1;

var isObject$g = isObject_1,
    isPrototype$4 = _isPrototype,
    nativeKeysIn = _nativeKeysIn;

/** Used for built-in method references. */
var objectProto$d = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$d = objectProto$d.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn$1(object) {
  if (!isObject$g(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype$4(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$d.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

var _baseKeysIn = baseKeysIn$1;

var arrayLikeKeys$1 = _arrayLikeKeys,
    baseKeysIn = _baseKeysIn,
    isArrayLike$7 = isArrayLike_1;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn$7(object) {
  return isArrayLike$7(object) ? arrayLikeKeys$1(object, true) : baseKeysIn(object);
}

var keysIn_1 = keysIn$7;

var copyObject$6 = _copyObject,
    createAssigner$2 = _createAssigner,
    keysIn$6 = keysIn_1;

/**
 * This method is like `_.assign` except that it iterates over own and
 * inherited source properties.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assign
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assignIn({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
 */
var assignIn = createAssigner$2(function(object, source) {
  copyObject$6(source, keysIn$6(source), object);
});

var assignIn_1 = assignIn;

var extend$4 = assignIn_1;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */

function arrayMap$4(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

var _arrayMap = arrayMap$4;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */

function listCacheClear$1() {
  this.__data__ = [];
  this.size = 0;
}

var _listCacheClear = listCacheClear$1;

var eq$3 = eq_1;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf$4(array, key) {
  var length = array.length;
  while (length--) {
    if (eq$3(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var _assocIndexOf = assocIndexOf$4;

var assocIndexOf$3 = _assocIndexOf;

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete$1(key) {
  var data = this.__data__,
      index = assocIndexOf$3(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

var _listCacheDelete = listCacheDelete$1;

var assocIndexOf$2 = _assocIndexOf;

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet$1(key) {
  var data = this.__data__,
      index = assocIndexOf$2(data, key);

  return index < 0 ? undefined : data[index][1];
}

var _listCacheGet = listCacheGet$1;

var assocIndexOf$1 = _assocIndexOf;

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}

var _listCacheHas = listCacheHas$1;

var assocIndexOf = _assocIndexOf;

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet$1(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

var _listCacheSet = listCacheSet$1;

var listCacheClear = _listCacheClear,
    listCacheDelete = _listCacheDelete,
    listCacheGet = _listCacheGet,
    listCacheHas = _listCacheHas,
    listCacheSet = _listCacheSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache$4(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache$4.prototype.clear = listCacheClear;
ListCache$4.prototype['delete'] = listCacheDelete;
ListCache$4.prototype.get = listCacheGet;
ListCache$4.prototype.has = listCacheHas;
ListCache$4.prototype.set = listCacheSet;

var _ListCache = ListCache$4;

var ListCache$3 = _ListCache;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear$1() {
  this.__data__ = new ListCache$3;
  this.size = 0;
}

var _stackClear = stackClear$1;

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */

function stackDelete$1(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

var _stackDelete = stackDelete$1;

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */

function stackGet$1(key) {
  return this.__data__.get(key);
}

var _stackGet = stackGet$1;

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */

function stackHas$1(key) {
  return this.__data__.has(key);
}

var _stackHas = stackHas$1;

var getNative$5 = _getNative,
    root$5 = _root;

/* Built-in method references that are verified to be native. */
var Map$4 = getNative$5(root$5, 'Map');

var _Map = Map$4;

var getNative$4 = _getNative;

/* Built-in method references that are verified to be native. */
var nativeCreate$4 = getNative$4(Object, 'create');

var _nativeCreate = nativeCreate$4;

var nativeCreate$3 = _nativeCreate;

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear$1() {
  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
  this.size = 0;
}

var _hashClear = hashClear$1;

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */

function hashDelete$1(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var _hashDelete = hashDelete$1;

var nativeCreate$2 = _nativeCreate;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$c = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$c = objectProto$c.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet$1(key) {
  var data = this.__data__;
  if (nativeCreate$2) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? undefined : result;
  }
  return hasOwnProperty$c.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet$1;

var nativeCreate$1 = _nativeCreate;

/** Used for built-in method references. */
var objectProto$b = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$b = objectProto$b.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas$1(key) {
  var data = this.__data__;
  return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$b.call(data, key);
}

var _hashHas = hashHas$1;

var nativeCreate = _nativeCreate;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet$1(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

var _hashSet = hashSet$1;

var hashClear = _hashClear,
    hashDelete = _hashDelete,
    hashGet = _hashGet,
    hashHas = _hashHas,
    hashSet = _hashSet;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash$1(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash$1.prototype.clear = hashClear;
Hash$1.prototype['delete'] = hashDelete;
Hash$1.prototype.get = hashGet;
Hash$1.prototype.has = hashHas;
Hash$1.prototype.set = hashSet;

var _Hash = Hash$1;

var Hash = _Hash,
    ListCache$2 = _ListCache,
    Map$3 = _Map;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear$1() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map$3 || ListCache$2),
    'string': new Hash
  };
}

var _mapCacheClear = mapCacheClear$1;

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */

function isKeyable$1(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

var _isKeyable = isKeyable$1;

var isKeyable = _isKeyable;

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData$4(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

var _getMapData = getMapData$4;

var getMapData$3 = _getMapData;

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete$1(key) {
  var result = getMapData$3(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

var _mapCacheDelete = mapCacheDelete$1;

var getMapData$2 = _getMapData;

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet$1(key) {
  return getMapData$2(this, key).get(key);
}

var _mapCacheGet = mapCacheGet$1;

var getMapData$1 = _getMapData;

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}

var _mapCacheHas = mapCacheHas$1;

var getMapData = _getMapData;

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet$1(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

var _mapCacheSet = mapCacheSet$1;

var mapCacheClear = _mapCacheClear,
    mapCacheDelete = _mapCacheDelete,
    mapCacheGet = _mapCacheGet,
    mapCacheHas = _mapCacheHas,
    mapCacheSet = _mapCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache$3(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache$3.prototype.clear = mapCacheClear;
MapCache$3.prototype['delete'] = mapCacheDelete;
MapCache$3.prototype.get = mapCacheGet;
MapCache$3.prototype.has = mapCacheHas;
MapCache$3.prototype.set = mapCacheSet;

var _MapCache = MapCache$3;

var ListCache$1 = _ListCache,
    Map$2 = _Map,
    MapCache$2 = _MapCache;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet$1(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache$1) {
    var pairs = data.__data__;
    if (!Map$2 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache$2(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

var _stackSet = stackSet$1;

var ListCache = _ListCache,
    stackClear = _stackClear,
    stackDelete = _stackDelete,
    stackGet = _stackGet,
    stackHas = _stackHas,
    stackSet = _stackSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack$4(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack$4.prototype.clear = stackClear;
Stack$4.prototype['delete'] = stackDelete;
Stack$4.prototype.get = stackGet;
Stack$4.prototype.has = stackHas;
Stack$4.prototype.set = stackSet;

var _Stack = Stack$4;

/** Used to stand-in for `undefined` hash values. */

var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd$1(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

var _setCacheAdd = setCacheAdd$1;

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */

function setCacheHas$1(value) {
  return this.__data__.has(value);
}

var _setCacheHas = setCacheHas$1;

var MapCache$1 = _MapCache,
    setCacheAdd = _setCacheAdd,
    setCacheHas = _setCacheHas;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache$1(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache$1;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache$1.prototype.add = SetCache$1.prototype.push = setCacheAdd;
SetCache$1.prototype.has = setCacheHas;

var _SetCache = SetCache$1;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */

function arraySome$1(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

var _arraySome = arraySome$1;

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */

function cacheHas$1(cache, key) {
  return cache.has(key);
}

var _cacheHas = cacheHas$1;

var SetCache = _SetCache,
    arraySome = _arraySome,
    cacheHas = _cacheHas;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$5 = 1,
    COMPARE_UNORDERED_FLAG$3 = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays$2(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Check that cyclic values are equal.
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG$3) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

var _equalArrays = equalArrays$2;

var root$4 = _root;

/** Built-in value references. */
var Uint8Array$3 = root$4.Uint8Array;

var _Uint8Array = Uint8Array$3;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */

function mapToArray$2(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

var _mapToArray = mapToArray$2;

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */

function setToArray$2(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

var _setToArray = setToArray$2;

var Symbol$5 = _Symbol,
    Uint8Array$2 = _Uint8Array,
    eq$2 = eq_1,
    equalArrays$1 = _equalArrays,
    mapToArray$1 = _mapToArray,
    setToArray$1 = _setToArray;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$4 = 1,
    COMPARE_UNORDERED_FLAG$2 = 2;

/** `Object#toString` result references. */
var boolTag$2 = '[object Boolean]',
    dateTag$2 = '[object Date]',
    errorTag$1 = '[object Error]',
    mapTag$6 = '[object Map]',
    numberTag$2 = '[object Number]',
    regexpTag$2 = '[object RegExp]',
    setTag$6 = '[object Set]',
    stringTag$3 = '[object String]',
    symbolTag$3 = '[object Symbol]';

var arrayBufferTag$2 = '[object ArrayBuffer]',
    dataViewTag$3 = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto$2 = Symbol$5 ? Symbol$5.prototype : undefined,
    symbolValueOf$1 = symbolProto$2 ? symbolProto$2.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag$1(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$3:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag$2:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array$2(object), new Uint8Array$2(other))) {
        return false;
      }
      return true;

    case boolTag$2:
    case dateTag$2:
    case numberTag$2:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq$2(+object, +other);

    case errorTag$1:
      return object.name == other.name && object.message == other.message;

    case regexpTag$2:
    case stringTag$3:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag$6:
      var convert = mapToArray$1;

    case setTag$6:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
      convert || (convert = setToArray$1);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays$1(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag$3:
      if (symbolValueOf$1) {
        return symbolValueOf$1.call(object) == symbolValueOf$1.call(other);
      }
  }
  return false;
}

var _equalByTag = equalByTag$1;

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */

function arrayPush$3(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var _arrayPush = arrayPush$3;

var arrayPush$2 = _arrayPush,
    isArray$h = isArray_1;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys$2(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray$h(object) ? result : arrayPush$2(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys$2;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */

function arrayFilter$2(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var _arrayFilter = arrayFilter$2;

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */

function stubArray$2() {
  return [];
}

var stubArray_1 = stubArray$2;

var arrayFilter$1 = _arrayFilter,
    stubArray$1 = stubArray_1;

/** Used for built-in method references. */
var objectProto$a = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$a.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols$3 = !nativeGetSymbols$1 ? stubArray$1 : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter$1(nativeGetSymbols$1(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

var _getSymbols = getSymbols$3;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */

function overArg$2(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg$2;

var overArg$1 = _overArg;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys$1 = overArg$1(Object.keys, Object);

var _nativeKeys = nativeKeys$1;

var isPrototype$3 = _isPrototype,
    nativeKeys = _nativeKeys;

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$a = objectProto$9.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys$2(object) {
  if (!isPrototype$3(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$a.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys$2;

var arrayLikeKeys = _arrayLikeKeys,
    baseKeys$1 = _baseKeys,
    isArrayLike$6 = isArrayLike_1;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys$7(object) {
  return isArrayLike$6(object) ? arrayLikeKeys(object) : baseKeys$1(object);
}

var keys_1 = keys$7;

var baseGetAllKeys$1 = _baseGetAllKeys,
    getSymbols$2 = _getSymbols,
    keys$6 = keys_1;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys$2(object) {
  return baseGetAllKeys$1(object, keys$6, getSymbols$2);
}

var _getAllKeys = getAllKeys$2;

var getAllKeys$1 = _getAllKeys;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$3 = 1;

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$9 = objectProto$8.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects$1(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
      objProps = getAllKeys$1(object),
      objLength = objProps.length,
      othProps = getAllKeys$1(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$9.call(other, key))) {
      return false;
    }
  }
  // Check that cyclic values are equal.
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

var _equalObjects = equalObjects$1;

var getNative$3 = _getNative,
    root$3 = _root;

/* Built-in method references that are verified to be native. */
var DataView$2 = getNative$3(root$3, 'DataView');

var _DataView = DataView$2;

var getNative$2 = _getNative,
    root$2 = _root;

/* Built-in method references that are verified to be native. */
var Promise$2 = getNative$2(root$2, 'Promise');

var _Promise = Promise$2;

var getNative$1 = _getNative,
    root$1 = _root;

/* Built-in method references that are verified to be native. */
var Set$2 = getNative$1(root$1, 'Set');

var _Set = Set$2;

var getNative = _getNative,
    root = _root;

/* Built-in method references that are verified to be native. */
var WeakMap$2 = getNative(root, 'WeakMap');

var _WeakMap = WeakMap$2;

var DataView$1 = _DataView,
    Map$1 = _Map,
    Promise$1 = _Promise,
    Set$1 = _Set,
    WeakMap$1 = _WeakMap,
    baseGetTag$3 = _baseGetTag,
    toSource = _toSource;

/** `Object#toString` result references. */
var mapTag$5 = '[object Map]',
    objectTag$3 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$5 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';

var dataViewTag$2 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView$1),
    mapCtorString = toSource(Map$1),
    promiseCtorString = toSource(Promise$1),
    setCtorString = toSource(Set$1),
    weakMapCtorString = toSource(WeakMap$1);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag$6 = baseGetTag$3;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView$1 && getTag$6(new DataView$1(new ArrayBuffer(1))) != dataViewTag$2) ||
    (Map$1 && getTag$6(new Map$1) != mapTag$5) ||
    (Promise$1 && getTag$6(Promise$1.resolve()) != promiseTag) ||
    (Set$1 && getTag$6(new Set$1) != setTag$5) ||
    (WeakMap$1 && getTag$6(new WeakMap$1) != weakMapTag$1)) {
  getTag$6 = function(value) {
    var result = baseGetTag$3(value),
        Ctor = result == objectTag$3 ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$2;
        case mapCtorString: return mapTag$5;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$5;
        case weakMapCtorString: return weakMapTag$1;
      }
    }
    return result;
  };
}

var _getTag = getTag$6;

var Stack$3 = _Stack,
    equalArrays = _equalArrays,
    equalByTag = _equalByTag,
    equalObjects = _equalObjects,
    getTag$5 = _getTag,
    isArray$g = isArray_1,
    isBuffer$4 = isBufferExports,
    isTypedArray$5 = isTypedArray_1;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$2 = 1;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    objectTag$2 = '[object Object]';

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$7.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep$1(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray$g(object),
      othIsArr = isArray$g(other),
      objTag = objIsArr ? arrayTag$1 : getTag$5(object),
      othTag = othIsArr ? arrayTag$1 : getTag$5(other);

  objTag = objTag == argsTag$1 ? objectTag$2 : objTag;
  othTag = othTag == argsTag$1 ? objectTag$2 : othTag;

  var objIsObj = objTag == objectTag$2,
      othIsObj = othTag == objectTag$2,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer$4(object)) {
    if (!isBuffer$4(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack$3);
    return (objIsArr || isTypedArray$5(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
    var objIsWrapped = objIsObj && hasOwnProperty$8.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$8.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack$3);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack$3);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

var _baseIsEqualDeep = baseIsEqualDeep$1;

var baseIsEqualDeep = _baseIsEqualDeep,
    isObjectLike$6 = isObjectLike_1;

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual$2(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike$6(value) && !isObjectLike$6(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$2, stack);
}

var _baseIsEqual = baseIsEqual$2;

var Stack$2 = _Stack,
    baseIsEqual$1 = _baseIsEqual;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$1 = 1,
    COMPARE_UNORDERED_FLAG$1 = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch$1(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack$2;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual$1(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

var _baseIsMatch = baseIsMatch$1;

var isObject$f = isObject_1;

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable$2(value) {
  return value === value && !isObject$f(value);
}

var _isStrictComparable = isStrictComparable$2;

var isStrictComparable$1 = _isStrictComparable,
    keys$5 = keys_1;

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData$1(object) {
  var result = keys$5(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable$1(value)];
  }
  return result;
}

var _getMatchData = getMatchData$1;

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */

function matchesStrictComparable$2(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

var _matchesStrictComparable = matchesStrictComparable$2;

var baseIsMatch = _baseIsMatch,
    getMatchData = _getMatchData,
    matchesStrictComparable$1 = _matchesStrictComparable;

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches$1(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable$1(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

var _baseMatches = baseMatches$1;

var baseGetTag$2 = _baseGetTag,
    isObjectLike$5 = isObjectLike_1;

/** `Object#toString` result references. */
var symbolTag$2 = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$4(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$5(value) && baseGetTag$2(value) == symbolTag$2);
}

var isSymbol_1 = isSymbol$4;

var isArray$f = isArray_1,
    isSymbol$3 = isSymbol_1;

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey$3(value, object) {
  if (isArray$f(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol$3(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

var _isKey = isKey$3;

var MapCache = _MapCache;

/** Error message constants. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize$1(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize$1.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize$1.Cache = MapCache;

var memoize_1 = memoize$1;

var memoize = memoize_1;

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped$1(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

var _memoizeCapped = memoizeCapped$1;

var memoizeCapped = _memoizeCapped;

/** Used to match property names within property paths. */
var rePropName$1 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar$1 = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath$2 = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName$1, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar$1, '$1') : (number || match));
  });
  return result;
});

var _stringToPath = stringToPath$2;

var Symbol$4 = _Symbol,
    arrayMap$3 = _arrayMap,
    isArray$e = isArray_1,
    isSymbol$2 = isSymbol_1;

/** Used as references for various `Number` constants. */
var INFINITY$2 = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = Symbol$4 ? Symbol$4.prototype : undefined,
    symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString$1(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray$e(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap$3(value, baseToString$1) + '';
  }
  if (isSymbol$2(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
}

var _baseToString = baseToString$1;

var baseToString = _baseToString;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString$2(value) {
  return value == null ? '' : baseToString(value);
}

var toString_1 = toString$2;

var isArray$d = isArray_1,
    isKey$2 = _isKey,
    stringToPath$1 = _stringToPath,
    toString$1 = toString_1;

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath$4(value, object) {
  if (isArray$d(value)) {
    return value;
  }
  return isKey$2(value, object) ? [value] : stringToPath$1(toString$1(value));
}

var _castPath = castPath$4;

var isSymbol$1 = isSymbol_1;

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey$5(value) {
  if (typeof value == 'string' || isSymbol$1(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

var _toKey = toKey$5;

var castPath$3 = _castPath,
    toKey$4 = _toKey;

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet$3(object, path) {
  path = castPath$3(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey$4(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

var _baseGet = baseGet$3;

var baseGet$2 = _baseGet;

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get$1(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet$2(object, path);
  return result === undefined ? defaultValue : result;
}

var get_1 = get$1;

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */

function baseHasIn$1(object, key) {
  return object != null && key in Object(object);
}

var _baseHasIn = baseHasIn$1;

var castPath$2 = _castPath,
    isArguments$4 = isArguments_1,
    isArray$c = isArray_1,
    isIndex$1 = _isIndex,
    isLength = isLength_1,
    toKey$3 = _toKey;

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath$2(object, path, hasFunc) {
  path = castPath$2(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey$3(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex$1(key, length) &&
    (isArray$c(object) || isArguments$4(object));
}

var _hasPath = hasPath$2;

var baseHasIn = _baseHasIn,
    hasPath$1 = _hasPath;

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn$1(object, path) {
  return object != null && hasPath$1(object, path, baseHasIn);
}

var hasIn_1 = hasIn$1;

var baseIsEqual = _baseIsEqual,
    get = get_1,
    hasIn = hasIn_1,
    isKey$1 = _isKey,
    isStrictComparable = _isStrictComparable,
    matchesStrictComparable = _matchesStrictComparable,
    toKey$2 = _toKey;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty$1(path, srcValue) {
  if (isKey$1(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey$2(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

var _baseMatchesProperty = baseMatchesProperty$1;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */

function baseProperty$1(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

var _baseProperty = baseProperty$1;

var baseGet$1 = _baseGet;

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep$1(path) {
  return function(object) {
    return baseGet$1(object, path);
  };
}

var _basePropertyDeep = basePropertyDeep$1;

var baseProperty = _baseProperty,
    basePropertyDeep = _basePropertyDeep,
    isKey = _isKey,
    toKey$1 = _toKey;

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property$1(path) {
  return isKey(path) ? baseProperty(toKey$1(path)) : basePropertyDeep(path);
}

var property_1 = property$1;

var baseMatches = _baseMatches,
    baseMatchesProperty = _baseMatchesProperty,
    identity$2 = identity_1,
    isArray$b = isArray_1,
    property = property_1;

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee$7(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity$2;
  }
  if (typeof value == 'object') {
    return isArray$b(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

var _baseIteratee = baseIteratee$7;

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */

function createBaseFor$1(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var _createBaseFor = createBaseFor$1;

var createBaseFor = _createBaseFor;

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor$2 = createBaseFor();

var _baseFor = baseFor$2;

var baseFor$1 = _baseFor,
    keys$4 = keys_1;

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn$2(object, iteratee) {
  return object && baseFor$1(object, iteratee, keys$4);
}

var _baseForOwn = baseForOwn$2;

var isArrayLike$5 = isArrayLike_1;

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach$1(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike$5(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

var _createBaseEach = createBaseEach$1;

var baseForOwn$1 = _baseForOwn,
    createBaseEach = _createBaseEach;

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach$5 = createBaseEach(baseForOwn$1);

var _baseEach = baseEach$5;

var baseEach$4 = _baseEach,
    isArrayLike$4 = isArrayLike_1;

/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap$1(collection, iteratee) {
  var index = -1,
      result = isArrayLike$4(collection) ? Array(collection.length) : [];

  baseEach$4(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

var _baseMap = baseMap$1;

var arrayMap$2 = _arrayMap,
    baseIteratee$6 = _baseIteratee,
    baseMap = _baseMap,
    isArray$a = isArray_1;

/**
 * Creates an array of values by running each element in `collection` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * _.map([4, 8], square);
 * // => [16, 64]
 *
 * _.map({ 'a': 4, 'b': 8 }, square);
 * // => [16, 64] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // The `_.property` iteratee shorthand.
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */
function map$2(collection, iteratee) {
  var func = isArray$a(collection) ? arrayMap$2 : baseMap;
  return func(collection, baseIteratee$6(iteratee));
}

var map_1 = map$2;

var util = {};

var types = {};

/* eslint complexity: [2, 18], max-statements: [2, 33] */
var shams$1 = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

var hasSymbols$2 = shams$1;

var shams = function hasToStringTagShams() {
	return hasSymbols$2() && !!Symbol.toStringTag;
};

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = shams$1;

var hasSymbols$1 = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

var test = {
	foo: {}
};

var $Object = Object;

var hasProto$1 = function hasProto() {
	return { __proto__: test }.foo === test.foo && !({ __proto__: null } instanceof $Object);
};

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr$3 = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';

var concatty = function concatty(a, b) {
    var arr = [];

    for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
    }
    for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
    }

    return arr;
};

var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
    }
    return arr;
};

var joiny = function (arr, joiner) {
    var str = '';
    for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};

var implementation$1 = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr$3.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                concatty(args, arguments)
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(
            that,
            concatty(args, arguments)
        );

    };

    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = '$' + i;
    }

    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

var implementation = implementation$1;

var functionBind = Function.prototype.bind || implementation;

var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind$1 = functionBind;

/** @type {(o: {}, p: PropertyKey) => p is keyof o} */
var hasown = bind$1.call(call, $hasOwn);

var undefined$1;

var $SyntaxError$1 = SyntaxError;
var $Function = Function;
var $TypeError$2 = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD$1 = Object.getOwnPropertyDescriptor;
if ($gOPD$1) {
	try {
		$gOPD$1({}, '');
	} catch (e) {
		$gOPD$1 = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError$2();
};
var ThrowTypeError = $gOPD$1
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD$1(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = hasSymbols$1();
var hasProto = hasProto$1();

var getProto$1 = Object.getPrototypeOf || (
	hasProto
		? function (x) { return x.__proto__; } // eslint-disable-line no-proto
		: null
);

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' || !getProto$1 ? undefined$1 : getProto$1(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined$1 : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols && getProto$1 ? getProto$1([][Symbol.iterator]()) : undefined$1,
	'%AsyncFromSyncIteratorPrototype%': undefined$1,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined$1 : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined$1 : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined$1 : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined$1 : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols && getProto$1 ? getProto$1(getProto$1([][Symbol.iterator]())) : undefined$1,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined$1,
	'%Map%': typeof Map === 'undefined' ? undefined$1 : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto$1 ? undefined$1 : getProto$1(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined$1 : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto$1 ? undefined$1 : getProto$1(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols && getProto$1 ? getProto$1(''[Symbol.iterator]()) : undefined$1,
	'%Symbol%': hasSymbols ? Symbol : undefined$1,
	'%SyntaxError%': $SyntaxError$1,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError$2,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined$1 : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet
};

if (getProto$1) {
	try {
		null.error; // eslint-disable-line no-unused-expressions
	} catch (e) {
		// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
		var errorProto = getProto$1(getProto$1(e));
		INTRINSICS['%Error.prototype%'] = errorProto;
	}
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen && getProto$1) {
			value = getProto$1(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = functionBind;
var hasOwn = hasown;
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError$1('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError$1('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError$2('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError$1('intrinsic ' + name + ' does not exist!');
};

var getIntrinsic = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError$2('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError$2('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError$1('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError$1('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError$2('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined$1;
			}
			if ($gOPD$1 && (i + 1) >= parts.length) {
				var desc = $gOPD$1(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

var callBind$2 = {exports: {}};

var GetIntrinsic$4 = getIntrinsic;

var $defineProperty$1 = GetIntrinsic$4('%Object.defineProperty%', true);

var hasPropertyDescriptors$1 = function hasPropertyDescriptors() {
	if ($defineProperty$1) {
		try {
			$defineProperty$1({}, 'a', { value: 1 });
			return true;
		} catch (e) {
			// IE 8 has a broken defineProperty
			return false;
		}
	}
	return false;
};

hasPropertyDescriptors$1.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
	// node v0.6 has a bug where array lengths can be Set but not Defined
	if (!hasPropertyDescriptors$1()) {
		return null;
	}
	try {
		return $defineProperty$1([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// In Firefox 4-22, defining length on an array throws an exception.
		return true;
	}
};

var hasPropertyDescriptors_1 = hasPropertyDescriptors$1;

var GetIntrinsic$3 = getIntrinsic;

var $gOPD = GetIntrinsic$3('%Object.getOwnPropertyDescriptor%', true);

if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

var gopd$1 = $gOPD;

var hasPropertyDescriptors = hasPropertyDescriptors_1();

var GetIntrinsic$2 = getIntrinsic;

var $defineProperty = hasPropertyDescriptors && GetIntrinsic$2('%Object.defineProperty%', true);
if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = false;
	}
}

var $SyntaxError = GetIntrinsic$2('%SyntaxError%');
var $TypeError$1 = GetIntrinsic$2('%TypeError%');

var gopd = gopd$1;

/** @type {(obj: Record<PropertyKey, unknown>, property: PropertyKey, value: unknown, nonEnumerable?: boolean | null, nonWritable?: boolean | null, nonConfigurable?: boolean | null, loose?: boolean) => void} */
var defineDataProperty = function defineDataProperty(
	obj,
	property,
	value
) {
	if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
		throw new $TypeError$1('`obj` must be an object or a function`');
	}
	if (typeof property !== 'string' && typeof property !== 'symbol') {
		throw new $TypeError$1('`property` must be a string or a symbol`');
	}
	if (arguments.length > 3 && typeof arguments[3] !== 'boolean' && arguments[3] !== null) {
		throw new $TypeError$1('`nonEnumerable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 4 && typeof arguments[4] !== 'boolean' && arguments[4] !== null) {
		throw new $TypeError$1('`nonWritable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 5 && typeof arguments[5] !== 'boolean' && arguments[5] !== null) {
		throw new $TypeError$1('`nonConfigurable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 6 && typeof arguments[6] !== 'boolean') {
		throw new $TypeError$1('`loose`, if provided, must be a boolean');
	}

	var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
	var nonWritable = arguments.length > 4 ? arguments[4] : null;
	var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
	var loose = arguments.length > 6 ? arguments[6] : false;

	/* @type {false | TypedPropertyDescriptor<unknown>} */
	var desc = !!gopd && gopd(obj, property);

	if ($defineProperty) {
		$defineProperty(obj, property, {
			configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
			enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
			value: value,
			writable: nonWritable === null && desc ? desc.writable : !nonWritable
		});
	} else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
		// must fall back to [[Set]], and was not explicitly asked to make non-enumerable, non-writable, or non-configurable
		obj[property] = value; // eslint-disable-line no-param-reassign
	} else {
		throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
	}
};

var GetIntrinsic$1 = getIntrinsic;
var define = defineDataProperty;
var hasDescriptors = hasPropertyDescriptors_1();
var gOPD$1 = gopd$1;

var $TypeError = GetIntrinsic$1('%TypeError%');
var $floor = GetIntrinsic$1('%Math.floor%');

var setFunctionLength = function setFunctionLength(fn, length) {
	if (typeof fn !== 'function') {
		throw new $TypeError('`fn` is not a function');
	}
	if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || $floor(length) !== length) {
		throw new $TypeError('`length` must be a positive 32-bit integer');
	}

	var loose = arguments.length > 2 && !!arguments[2];

	var functionLengthIsConfigurable = true;
	var functionLengthIsWritable = true;
	if ('length' in fn && gOPD$1) {
		var desc = gOPD$1(fn, 'length');
		if (desc && !desc.configurable) {
			functionLengthIsConfigurable = false;
		}
		if (desc && !desc.writable) {
			functionLengthIsWritable = false;
		}
	}

	if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
		if (hasDescriptors) {
			define(fn, 'length', length, true, true);
		} else {
			define(fn, 'length', length);
		}
	}
	return fn;
};

(function (module) {

	var bind = functionBind;
	var GetIntrinsic = getIntrinsic;
	var setFunctionLength$1 = setFunctionLength;

	var $TypeError = GetIntrinsic('%TypeError%');
	var $apply = GetIntrinsic('%Function.prototype.apply%');
	var $call = GetIntrinsic('%Function.prototype.call%');
	var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

	var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
	var $max = GetIntrinsic('%Math.max%');

	if ($defineProperty) {
		try {
			$defineProperty({}, 'a', { value: 1 });
		} catch (e) {
			// IE 8 has a broken defineProperty
			$defineProperty = null;
		}
	}

	module.exports = function callBind(originalFunction) {
		if (typeof originalFunction !== 'function') {
			throw new $TypeError('a function is required');
		}
		var func = $reflectApply(bind, $call, arguments);
		return setFunctionLength$1(
			func,
			1 + $max(0, originalFunction.length - (arguments.length - 1)),
			true
		);
	};

	var applyBind = function applyBind() {
		return $reflectApply(bind, $apply, arguments);
	};

	if ($defineProperty) {
		$defineProperty(module.exports, 'apply', { value: applyBind });
	} else {
		module.exports.apply = applyBind;
	} 
} (callBind$2));

var callBindExports = callBind$2.exports;

var GetIntrinsic = getIntrinsic;

var callBind$1 = callBindExports;

var $indexOf$1 = callBind$1(GetIntrinsic('String.prototype.indexOf'));

var callBound$2 = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf$1(name, '.prototype.') > -1) {
		return callBind$1(intrinsic);
	}
	return intrinsic;
};

var hasToStringTag$3 = shams();
var callBound$1 = callBound$2;

var $toString$1 = callBound$1('Object.prototype.toString');

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag$3 && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString$1(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString$1(value) !== '[object Array]' &&
		$toString$1(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

var isArguments$3 = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

var toStr$2 = Object.prototype.toString;
var fnToStr$1 = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag$2 = shams();
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag$2) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction;

var isGeneratorFunction = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr$1.call(fn))) {
		return true;
	}
	if (!hasToStringTag$2) {
		var str = toStr$2.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto) {
		return false;
	}
	if (typeof GeneratorFunction === 'undefined') {
		var generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}
	return getProto(fn) === GeneratorFunction;
};

var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		isCallableMarker = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply(function () { throw 42; }, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr$1 = Object.prototype.toString;
var objectClass = '[object Object]';
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var ddaClass = '[object HTMLAllCollection]'; // IE 11
var ddaClass2 = '[object HTML document.all class]';
var ddaClass3 = '[object HTMLCollection]'; // IE 9-10
var hasToStringTag$1 = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`

var isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

var isDDA = function isDocumentDotAll() { return false; };
if (typeof document === 'object') {
	// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
	var all = document.all;
	if (toStr$1.call(all) === toStr$1.call(document.all)) {
		isDDA = function isDocumentDotAll(value) {
			/* globals document: false */
			// in IE 6-8, typeof document.all is "object" and it's truthy
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					var str = toStr$1.call(value);
					return (
						str === ddaClass
						|| str === ddaClass2
						|| str === ddaClass3 // opera 12.16
						|| str === objectClass // IE 6-8
					) && value('') == null; // eslint-disable-line eqeqeq
				} catch (e) { /**/ }
			}
			return false;
		};
	}
}

var isCallable$1 = reflectApply
	? function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) { return false; }
		}
		return !isES6ClassFn(value) && tryFunctionObject(value);
	}
	: function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (hasToStringTag$1) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr$1.call(value);
		if (strClass !== fnClass && strClass !== genClass && !(/^\[object HTML/).test(strClass)) { return false; }
		return tryFunctionObject(value);
	};

var isCallable = isCallable$1;

var toStr = Object.prototype.toString;
var hasOwnProperty$7 = Object.prototype.hasOwnProperty;

var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty$7.call(array, i)) {
            if (receiver == null) {
                iterator(array[i], i, array);
            } else {
                iterator.call(receiver, array[i], i, array);
            }
        }
    }
};

var forEachString = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        if (receiver == null) {
            iterator(string.charAt(i), i, string);
        } else {
            iterator.call(receiver, string.charAt(i), i, string);
        }
    }
};

var forEachObject = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
        if (hasOwnProperty$7.call(object, k)) {
            if (receiver == null) {
                iterator(object[k], k, object);
            } else {
                iterator.call(receiver, object[k], k, object);
            }
        }
    }
};

var forEach$2 = function forEach(list, iterator, thisArg) {
    if (!isCallable(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    var receiver;
    if (arguments.length >= 3) {
        receiver = thisArg;
    }

    if (toStr.call(list) === '[object Array]') {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

var forEach_1$1 = forEach$2;

var possibleNames = [
	'BigInt64Array',
	'BigUint64Array',
	'Float32Array',
	'Float64Array',
	'Int16Array',
	'Int32Array',
	'Int8Array',
	'Uint16Array',
	'Uint32Array',
	'Uint8Array',
	'Uint8ClampedArray'
];

var g$1 = typeof globalThis === 'undefined' ? commonjsGlobal : globalThis;

var availableTypedArrays$1 = function availableTypedArrays() {
	var out = [];
	for (var i = 0; i < possibleNames.length; i++) {
		if (typeof g$1[possibleNames[i]] === 'function') {
			out[out.length] = possibleNames[i];
		}
	}
	return out;
};

var forEach$1 = forEach_1$1;
var availableTypedArrays = availableTypedArrays$1;
var callBind = callBindExports;
var callBound = callBound$2;
var gOPD = gopd$1;

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = shams();

var g = typeof globalThis === 'undefined' ? commonjsGlobal : globalThis;
var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');

var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
var cache = { __proto__: null };
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach$1(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		if (Symbol.toStringTag in arr) {
			var proto = getPrototypeOf(arr);
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf(proto);
				descriptor = gOPD(superProto, Symbol.toStringTag);
			}
			cache['$' + typedArray] = callBind(descriptor.get);
		}
	});
} else {
	forEach$1(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		var fn = arr.slice || arr.set;
		if (fn) {
			cache['$' + typedArray] = callBind(fn);
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var found = false;
	forEach$1(cache, function (getter, typedArray) {
		if (!found) {
			try {
				if ('$' + getter(value) === typedArray) {
					found = $slice(typedArray, 1);
				}
			} catch (e) { /**/ }
		}
	});
	return found;
};

var trySlices = function tryAllSlices(value) {
	var found = false;
	forEach$1(cache, function (getter, name) {
		if (!found) {
			try {
				getter(value);
				found = $slice(name, 1);
			} catch (e) { /**/ }
		}
	});
	return found;
};

var whichTypedArray$1 = function whichTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag) {
		var tag = $slice($toString(value), 8, -1);
		if ($indexOf(typedArrays, tag) > -1) {
			return tag;
		}
		if (tag !== 'Object') {
			return false;
		}
		// node < 0.6 hits here on real Typed Arrays
		return trySlices(value);
	}
	if (!gOPD) { return null; } // unknown engine
	return tryTypedArrays(value);
};

var whichTypedArray = whichTypedArray$1;

var isTypedArray$4 = function isTypedArray(value) {
	return !!whichTypedArray(value);
};

(function (exports) {

	var isArgumentsObject = isArguments$3;
	var isGeneratorFunction$1 = isGeneratorFunction;
	var whichTypedArray = whichTypedArray$1;
	var isTypedArray = isTypedArray$4;

	function uncurryThis(f) {
	  return f.call.bind(f);
	}

	var BigIntSupported = typeof BigInt !== 'undefined';
	var SymbolSupported = typeof Symbol !== 'undefined';

	var ObjectToString = uncurryThis(Object.prototype.toString);

	var numberValue = uncurryThis(Number.prototype.valueOf);
	var stringValue = uncurryThis(String.prototype.valueOf);
	var booleanValue = uncurryThis(Boolean.prototype.valueOf);

	if (BigIntSupported) {
	  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
	}

	if (SymbolSupported) {
	  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
	}

	function checkBoxedPrimitive(value, prototypeValueOf) {
	  if (typeof value !== 'object') {
	    return false;
	  }
	  try {
	    prototypeValueOf(value);
	    return true;
	  } catch(e) {
	    return false;
	  }
	}

	exports.isArgumentsObject = isArgumentsObject;
	exports.isGeneratorFunction = isGeneratorFunction$1;
	exports.isTypedArray = isTypedArray;

	// Taken from here and modified for better browser support
	// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
	function isPromise(input) {
		return (
			(
				typeof Promise !== 'undefined' &&
				input instanceof Promise
			) ||
			(
				input !== null &&
				typeof input === 'object' &&
				typeof input.then === 'function' &&
				typeof input.catch === 'function'
			)
		);
	}
	exports.isPromise = isPromise;

	function isArrayBufferView(value) {
	  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
	    return ArrayBuffer.isView(value);
	  }

	  return (
	    isTypedArray(value) ||
	    isDataView(value)
	  );
	}
	exports.isArrayBufferView = isArrayBufferView;


	function isUint8Array(value) {
	  return whichTypedArray(value) === 'Uint8Array';
	}
	exports.isUint8Array = isUint8Array;

	function isUint8ClampedArray(value) {
	  return whichTypedArray(value) === 'Uint8ClampedArray';
	}
	exports.isUint8ClampedArray = isUint8ClampedArray;

	function isUint16Array(value) {
	  return whichTypedArray(value) === 'Uint16Array';
	}
	exports.isUint16Array = isUint16Array;

	function isUint32Array(value) {
	  return whichTypedArray(value) === 'Uint32Array';
	}
	exports.isUint32Array = isUint32Array;

	function isInt8Array(value) {
	  return whichTypedArray(value) === 'Int8Array';
	}
	exports.isInt8Array = isInt8Array;

	function isInt16Array(value) {
	  return whichTypedArray(value) === 'Int16Array';
	}
	exports.isInt16Array = isInt16Array;

	function isInt32Array(value) {
	  return whichTypedArray(value) === 'Int32Array';
	}
	exports.isInt32Array = isInt32Array;

	function isFloat32Array(value) {
	  return whichTypedArray(value) === 'Float32Array';
	}
	exports.isFloat32Array = isFloat32Array;

	function isFloat64Array(value) {
	  return whichTypedArray(value) === 'Float64Array';
	}
	exports.isFloat64Array = isFloat64Array;

	function isBigInt64Array(value) {
	  return whichTypedArray(value) === 'BigInt64Array';
	}
	exports.isBigInt64Array = isBigInt64Array;

	function isBigUint64Array(value) {
	  return whichTypedArray(value) === 'BigUint64Array';
	}
	exports.isBigUint64Array = isBigUint64Array;

	function isMapToString(value) {
	  return ObjectToString(value) === '[object Map]';
	}
	isMapToString.working = (
	  typeof Map !== 'undefined' &&
	  isMapToString(new Map())
	);

	function isMap(value) {
	  if (typeof Map === 'undefined') {
	    return false;
	  }

	  return isMapToString.working
	    ? isMapToString(value)
	    : value instanceof Map;
	}
	exports.isMap = isMap;

	function isSetToString(value) {
	  return ObjectToString(value) === '[object Set]';
	}
	isSetToString.working = (
	  typeof Set !== 'undefined' &&
	  isSetToString(new Set())
	);
	function isSet(value) {
	  if (typeof Set === 'undefined') {
	    return false;
	  }

	  return isSetToString.working
	    ? isSetToString(value)
	    : value instanceof Set;
	}
	exports.isSet = isSet;

	function isWeakMapToString(value) {
	  return ObjectToString(value) === '[object WeakMap]';
	}
	isWeakMapToString.working = (
	  typeof WeakMap !== 'undefined' &&
	  isWeakMapToString(new WeakMap())
	);
	function isWeakMap(value) {
	  if (typeof WeakMap === 'undefined') {
	    return false;
	  }

	  return isWeakMapToString.working
	    ? isWeakMapToString(value)
	    : value instanceof WeakMap;
	}
	exports.isWeakMap = isWeakMap;

	function isWeakSetToString(value) {
	  return ObjectToString(value) === '[object WeakSet]';
	}
	isWeakSetToString.working = (
	  typeof WeakSet !== 'undefined' &&
	  isWeakSetToString(new WeakSet())
	);
	function isWeakSet(value) {
	  return isWeakSetToString(value);
	}
	exports.isWeakSet = isWeakSet;

	function isArrayBufferToString(value) {
	  return ObjectToString(value) === '[object ArrayBuffer]';
	}
	isArrayBufferToString.working = (
	  typeof ArrayBuffer !== 'undefined' &&
	  isArrayBufferToString(new ArrayBuffer())
	);
	function isArrayBuffer(value) {
	  if (typeof ArrayBuffer === 'undefined') {
	    return false;
	  }

	  return isArrayBufferToString.working
	    ? isArrayBufferToString(value)
	    : value instanceof ArrayBuffer;
	}
	exports.isArrayBuffer = isArrayBuffer;

	function isDataViewToString(value) {
	  return ObjectToString(value) === '[object DataView]';
	}
	isDataViewToString.working = (
	  typeof ArrayBuffer !== 'undefined' &&
	  typeof DataView !== 'undefined' &&
	  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
	);
	function isDataView(value) {
	  if (typeof DataView === 'undefined') {
	    return false;
	  }

	  return isDataViewToString.working
	    ? isDataViewToString(value)
	    : value instanceof DataView;
	}
	exports.isDataView = isDataView;

	// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
	var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined;
	function isSharedArrayBufferToString(value) {
	  return ObjectToString(value) === '[object SharedArrayBuffer]';
	}
	function isSharedArrayBuffer(value) {
	  if (typeof SharedArrayBufferCopy === 'undefined') {
	    return false;
	  }

	  if (typeof isSharedArrayBufferToString.working === 'undefined') {
	    isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
	  }

	  return isSharedArrayBufferToString.working
	    ? isSharedArrayBufferToString(value)
	    : value instanceof SharedArrayBufferCopy;
	}
	exports.isSharedArrayBuffer = isSharedArrayBuffer;

	function isAsyncFunction(value) {
	  return ObjectToString(value) === '[object AsyncFunction]';
	}
	exports.isAsyncFunction = isAsyncFunction;

	function isMapIterator(value) {
	  return ObjectToString(value) === '[object Map Iterator]';
	}
	exports.isMapIterator = isMapIterator;

	function isSetIterator(value) {
	  return ObjectToString(value) === '[object Set Iterator]';
	}
	exports.isSetIterator = isSetIterator;

	function isGeneratorObject(value) {
	  return ObjectToString(value) === '[object Generator]';
	}
	exports.isGeneratorObject = isGeneratorObject;

	function isWebAssemblyCompiledModule(value) {
	  return ObjectToString(value) === '[object WebAssembly.Module]';
	}
	exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

	function isNumberObject(value) {
	  return checkBoxedPrimitive(value, numberValue);
	}
	exports.isNumberObject = isNumberObject;

	function isStringObject(value) {
	  return checkBoxedPrimitive(value, stringValue);
	}
	exports.isStringObject = isStringObject;

	function isBooleanObject(value) {
	  return checkBoxedPrimitive(value, booleanValue);
	}
	exports.isBooleanObject = isBooleanObject;

	function isBigIntObject(value) {
	  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
	}
	exports.isBigIntObject = isBigIntObject;

	function isSymbolObject(value) {
	  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
	}
	exports.isSymbolObject = isSymbolObject;

	function isBoxedPrimitive(value) {
	  return (
	    isNumberObject(value) ||
	    isStringObject(value) ||
	    isBooleanObject(value) ||
	    isBigIntObject(value) ||
	    isSymbolObject(value)
	  );
	}
	exports.isBoxedPrimitive = isBoxedPrimitive;

	function isAnyArrayBuffer(value) {
	  return typeof Uint8Array !== 'undefined' && (
	    isArrayBuffer(value) ||
	    isSharedArrayBuffer(value)
	  );
	}
	exports.isAnyArrayBuffer = isAnyArrayBuffer;

	['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
	  Object.defineProperty(exports, method, {
	    enumerable: false,
	    value: function() {
	      throw new Error(method + ' is not supported in userland');
	    }
	  });
	}); 
} (types));

var isBufferBrowser = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
};

var inherits_browser = {exports: {}};

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  inherits_browser.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
} else {
  // old school shim for old browsers
  inherits_browser.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }
  };
}

var inherits_browserExports = inherits_browser.exports;

(function (exports) {
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
	  function getOwnPropertyDescriptors(obj) {
	    var keys = Object.keys(obj);
	    var descriptors = {};
	    for (var i = 0; i < keys.length; i++) {
	      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
	    }
	    return descriptors;
	  };

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  if (typeof process !== 'undefined' && process.noDeprecation === true) {
	    return fn;
	  }

	  // Allow for deprecating things in the process of starting up.
	  if (typeof process === 'undefined') {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnvRegex = /^$/;

	if (process.env.NODE_DEBUG) {
	  var debugEnv = process.env.NODE_DEBUG;
	  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
	    .replace(/\*/g, '.*')
	    .replace(/,/g, '$|^')
	    .toUpperCase();
	  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
	}
	exports.debuglog = function(set) {
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (debugEnvRegex.test(set)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').slice(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.slice(1, -1);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var length = output.reduce(function(prev, cur) {
	    if (cur.indexOf('\n') >= 0) ;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	exports.types = types;

	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;
	exports.types.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;
	exports.types.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;
	exports.types.isNativeError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = isBufferBrowser;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = inherits_browserExports;

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

	exports.promisify = function promisify(original) {
	  if (typeof original !== 'function')
	    throw new TypeError('The "original" argument must be of type Function');

	  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
	    var fn = original[kCustomPromisifiedSymbol];
	    if (typeof fn !== 'function') {
	      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
	    }
	    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
	      value: fn, enumerable: false, writable: false, configurable: true
	    });
	    return fn;
	  }

	  function fn() {
	    var promiseResolve, promiseReject;
	    var promise = new Promise(function (resolve, reject) {
	      promiseResolve = resolve;
	      promiseReject = reject;
	    });

	    var args = [];
	    for (var i = 0; i < arguments.length; i++) {
	      args.push(arguments[i]);
	    }
	    args.push(function (err, value) {
	      if (err) {
	        promiseReject(err);
	      } else {
	        promiseResolve(value);
	      }
	    });

	    try {
	      original.apply(this, args);
	    } catch (err) {
	      promiseReject(err);
	    }

	    return promise;
	  }

	  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

	  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
	    value: fn, enumerable: false, writable: false, configurable: true
	  });
	  return Object.defineProperties(
	    fn,
	    getOwnPropertyDescriptors(original)
	  );
	};

	exports.promisify.custom = kCustomPromisifiedSymbol;

	function callbackifyOnRejected(reason, cb) {
	  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
	  // Because `null` is a special error value in callbacks which means "no error
	  // occurred", we error-wrap so the callback consumer can distinguish between
	  // "the promise rejected with null" or "the promise fulfilled with undefined".
	  if (!reason) {
	    var newReason = new Error('Promise was rejected with a falsy value');
	    newReason.reason = reason;
	    reason = newReason;
	  }
	  return cb(reason);
	}

	function callbackify(original) {
	  if (typeof original !== 'function') {
	    throw new TypeError('The "original" argument must be of type Function');
	  }

	  // We DO NOT return the promise as it gives the user a false sense that
	  // the promise is actually somehow related to the callback's execution
	  // and that the callback throwing will reject the promise.
	  function callbackified() {
	    var args = [];
	    for (var i = 0; i < arguments.length; i++) {
	      args.push(arguments[i]);
	    }

	    var maybeCb = args.pop();
	    if (typeof maybeCb !== 'function') {
	      throw new TypeError('The last argument must be of type Function');
	    }
	    var self = this;
	    var cb = function() {
	      return maybeCb.apply(self, arguments);
	    };
	    // In true node style we process the callback on `nextTick` with all the
	    // implications (stack, `uncaughtException`, `async_hooks`)
	    original.apply(this, args)
	      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)); },
	            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)); });
	  }

	  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
	  Object.defineProperties(callbackified,
	                          getOwnPropertyDescriptors(original));
	  return callbackified;
	}
	exports.callbackify = callbackify; 
} (util));

var tarn = {exports: {}};

var Pool$2 = {};

var PendingOperation$1 = {};

var TimeoutError$2 = {};

Object.defineProperty(TimeoutError$2, "__esModule", { value: true });
let TimeoutError$1 = class TimeoutError extends Error {
};
TimeoutError$2.TimeoutError = TimeoutError$1;

var utils = {};

var PromiseInspection$1 = {};

Object.defineProperty(PromiseInspection$1, "__esModule", { value: true });
class PromiseInspection {
    constructor(args) {
        this._value = args.value;
        this._error = args.error;
    }
    value() {
        return this._value;
    }
    reason() {
        return this._error;
    }
    isRejected() {
        return !!this._error;
    }
    isFulfilled() {
        return !!this._value;
    }
}
PromiseInspection$1.PromiseInspection = PromiseInspection;

Object.defineProperty(utils, "__esModule", { value: true });
const PromiseInspection_1 = PromiseInspection$1;
function defer() {
    let resolve = null;
    let reject = null;
    const promise = new Promise((resolver, rejecter) => {
        resolve = resolver;
        reject = rejecter;
    });
    return {
        promise,
        resolve,
        reject
    };
}
utils.defer = defer;
function now() {
    return Date.now();
}
utils.now = now;
function duration(t1, t2) {
    return Math.abs(t2 - t1);
}
utils.duration = duration;
function checkOptionalTime(time) {
    if (typeof time === 'undefined') {
        return true;
    }
    return checkRequiredTime(time);
}
utils.checkOptionalTime = checkOptionalTime;
function checkRequiredTime(time) {
    return typeof time === 'number' && time === Math.round(time) && time > 0;
}
utils.checkRequiredTime = checkRequiredTime;
function delay$2(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
utils.delay = delay$2;
function reflect(promise) {
    return promise
        .then(value => {
        return new PromiseInspection_1.PromiseInspection({ value });
    })
        .catch(error => {
        return new PromiseInspection_1.PromiseInspection({ error });
    });
}
utils.reflect = reflect;
function tryPromise(cb) {
    try {
        const result = cb();
        return Promise.resolve(result);
    }
    catch (err) {
        return Promise.reject(err);
    }
}
utils.tryPromise = tryPromise;

Object.defineProperty(PendingOperation$1, "__esModule", { value: true });
const TimeoutError_1 = TimeoutError$2;
const utils_1$2 = utils;
class PendingOperation {
    constructor(timeoutMillis) {
        this.timeoutMillis = timeoutMillis;
        this.deferred = utils_1$2.defer();
        this.possibleTimeoutCause = null;
        this.isRejected = false;
        this.promise = timeout$4(this.deferred.promise, timeoutMillis).catch(err => {
            if (err instanceof TimeoutError_1.TimeoutError) {
                if (this.possibleTimeoutCause) {
                    err = new TimeoutError_1.TimeoutError(this.possibleTimeoutCause.message);
                }
                else {
                    err = new TimeoutError_1.TimeoutError('operation timed out for an unknown reason');
                }
            }
            this.isRejected = true;
            return Promise.reject(err);
        });
    }
    abort() {
        this.reject(new Error('aborted'));
    }
    reject(err) {
        this.deferred.reject(err);
    }
    resolve(value) {
        this.deferred.resolve(value);
    }
}
PendingOperation$1.PendingOperation = PendingOperation;
function timeout$4(promise, time) {
    return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => reject(new TimeoutError_1.TimeoutError()), time);
        promise
            .then(result => {
            clearTimeout(timeoutHandle);
            resolve(result);
        })
            .catch(err => {
            clearTimeout(timeoutHandle);
            reject(err);
        });
    });
}

var Resource$1 = {};

Object.defineProperty(Resource$1, "__esModule", { value: true });
const utils_1$1 = utils;
class Resource {
    constructor(resource) {
        this.resource = resource;
        this.resource = resource;
        this.timestamp = utils_1$1.now();
        this.deferred = utils_1$1.defer();
    }
    get promise() {
        return this.deferred.promise;
    }
    resolve() {
        this.deferred.resolve(undefined);
        return new Resource(this.resource);
    }
}
Resource$1.Resource = Resource;

var events = {exports: {}};

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter$6() {
  EventEmitter$6.init.call(this);
}
events.exports = EventEmitter$6;
events.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter$6.EventEmitter = EventEmitter$6;

EventEmitter$6.prototype._events = undefined;
EventEmitter$6.prototype._eventsCount = 0;
EventEmitter$6.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter$6, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter$6.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter$6.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter$6.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter$6.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter$6.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter$6.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter$6.prototype.on = EventEmitter$6.prototype.addListener;

EventEmitter$6.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter$6.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter$6.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter$6.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter$6.prototype.off = EventEmitter$6.prototype.removeListener;

EventEmitter$6.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter$6.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter$6.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter$6.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter$6.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter$6.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    }
    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

var eventsExports = events.exports;

Object.defineProperty(Pool$2, "__esModule", { value: true });
const PendingOperation_1 = PendingOperation$1;
const Resource_1 = Resource$1;
const utils_1 = utils;
const events_1 = eventsExports;
const timers_1 = main;
let Pool$1 = class Pool {
    constructor(opt) {
        this.destroyed = false;
        this.emitter = new events_1.EventEmitter();
        opt = opt || {};
        if (!opt.create) {
            throw new Error('Tarn: opt.create function most be provided');
        }
        if (!opt.destroy) {
            throw new Error('Tarn: opt.destroy function most be provided');
        }
        if (typeof opt.min !== 'number' || opt.min < 0 || opt.min !== Math.round(opt.min)) {
            throw new Error('Tarn: opt.min must be an integer >= 0');
        }
        if (typeof opt.max !== 'number' || opt.max <= 0 || opt.max !== Math.round(opt.max)) {
            throw new Error('Tarn: opt.max must be an integer > 0');
        }
        if (opt.min > opt.max) {
            throw new Error('Tarn: opt.max is smaller than opt.min');
        }
        if (!utils_1.checkOptionalTime(opt.acquireTimeoutMillis)) {
            throw new Error('Tarn: invalid opt.acquireTimeoutMillis ' + JSON.stringify(opt.acquireTimeoutMillis));
        }
        if (!utils_1.checkOptionalTime(opt.createTimeoutMillis)) {
            throw new Error('Tarn: invalid opt.createTimeoutMillis ' + JSON.stringify(opt.createTimeoutMillis));
        }
        if (!utils_1.checkOptionalTime(opt.destroyTimeoutMillis)) {
            throw new Error('Tarn: invalid opt.destroyTimeoutMillis ' + JSON.stringify(opt.destroyTimeoutMillis));
        }
        if (!utils_1.checkOptionalTime(opt.idleTimeoutMillis)) {
            throw new Error('Tarn: invalid opt.idleTimeoutMillis ' + JSON.stringify(opt.idleTimeoutMillis));
        }
        if (!utils_1.checkOptionalTime(opt.reapIntervalMillis)) {
            throw new Error('Tarn: invalid opt.reapIntervalMillis ' + JSON.stringify(opt.reapIntervalMillis));
        }
        if (!utils_1.checkOptionalTime(opt.createRetryIntervalMillis)) {
            throw new Error('Tarn: invalid opt.createRetryIntervalMillis ' +
                JSON.stringify(opt.createRetryIntervalMillis));
        }
        const allowedKeys = {
            create: true,
            validate: true,
            destroy: true,
            log: true,
            min: true,
            max: true,
            acquireTimeoutMillis: true,
            createTimeoutMillis: true,
            destroyTimeoutMillis: true,
            idleTimeoutMillis: true,
            reapIntervalMillis: true,
            createRetryIntervalMillis: true,
            propagateCreateError: true
        };
        for (const key of Object.keys(opt)) {
            if (!allowedKeys[key]) {
                throw new Error(`Tarn: unsupported option opt.${key}`);
            }
        }
        this.creator = opt.create;
        this.destroyer = opt.destroy;
        this.validate = typeof opt.validate === 'function' ? opt.validate : () => true;
        this.log = opt.log || (() => { });
        this.acquireTimeoutMillis = opt.acquireTimeoutMillis || 30000;
        this.createTimeoutMillis = opt.createTimeoutMillis || 30000;
        this.destroyTimeoutMillis = opt.destroyTimeoutMillis || 5000;
        this.idleTimeoutMillis = opt.idleTimeoutMillis || 30000;
        this.reapIntervalMillis = opt.reapIntervalMillis || 1000;
        this.createRetryIntervalMillis = opt.createRetryIntervalMillis || 200;
        this.propagateCreateError = !!opt.propagateCreateError;
        this.min = opt.min;
        this.max = opt.max;
        // All the resources, which are either already acquired or which are
        // considered for being passed to acquire in async validation phase.
        this.used = [];
        // All the resources, which are either just created and free or returned
        // back to pool after using.
        this.free = [];
        this.pendingCreates = [];
        this.pendingAcquires = [];
        this.pendingDestroys = [];
        // When acquire is pending, but also still in validation phase
        this.pendingValidations = [];
        this.destroyed = false;
        this.interval = null;
        this.eventId = 1;
    }
    numUsed() {
        return this.used.length;
    }
    numFree() {
        return this.free.length;
    }
    numPendingAcquires() {
        return this.pendingAcquires.length;
    }
    numPendingValidations() {
        return this.pendingValidations.length;
    }
    numPendingCreates() {
        return this.pendingCreates.length;
    }
    acquire() {
        const eventId = this.eventId++;
        this._executeEventHandlers('acquireRequest', eventId);
        const pendingAcquire = new PendingOperation_1.PendingOperation(this.acquireTimeoutMillis);
        this.pendingAcquires.push(pendingAcquire);
        // If the acquire fails for whatever reason
        // remove it from the pending queue.
        pendingAcquire.promise = pendingAcquire.promise
            .then(resource => {
            this._executeEventHandlers('acquireSuccess', eventId, resource);
            return resource;
        })
            .catch(err => {
            this._executeEventHandlers('acquireFail', eventId, err);
            remove(this.pendingAcquires, pendingAcquire);
            return Promise.reject(err);
        });
        this._tryAcquireOrCreate();
        return pendingAcquire;
    }
    release(resource) {
        this._executeEventHandlers('release', resource);
        for (let i = 0, l = this.used.length; i < l; ++i) {
            const used = this.used[i];
            if (used.resource === resource) {
                this.used.splice(i, 1);
                this.free.push(used.resolve());
                this._tryAcquireOrCreate();
                return true;
            }
        }
        return false;
    }
    isEmpty() {
        return ([
            this.numFree(),
            this.numUsed(),
            this.numPendingAcquires(),
            this.numPendingValidations(),
            this.numPendingCreates()
        ].reduce((total, value) => total + value) === 0);
    }
    /**
     * Reaping cycle.
     */
    check() {
        const timestamp = utils_1.now();
        const newFree = [];
        const minKeep = this.min - this.used.length;
        const maxDestroy = this.free.length - minKeep;
        let numDestroyed = 0;
        this.free.forEach(free => {
            if (utils_1.duration(timestamp, free.timestamp) >= this.idleTimeoutMillis &&
                numDestroyed < maxDestroy) {
                numDestroyed++;
                this._destroy(free.resource);
            }
            else {
                newFree.push(free);
            }
        });
        this.free = newFree;
        // Pool is completely empty, stop reaping.
        // Next .acquire will start reaping interval again.
        if (this.isEmpty()) {
            this._stopReaping();
        }
    }
    destroy() {
        const eventId = this.eventId++;
        this._executeEventHandlers('poolDestroyRequest', eventId);
        this._stopReaping();
        this.destroyed = true;
        // First wait for all the pending creates get ready.
        return utils_1.reflect(Promise.all(this.pendingCreates.map(create => utils_1.reflect(create.promise)))
            .then(() => {
            // eslint-disable-next-line
            return new Promise((resolve, reject) => {
                // poll every 100ms and wait that all validations are ready
                if (this.numPendingValidations() === 0) {
                    resolve();
                    return;
                }
                const interval = setInterval(() => {
                    if (this.numPendingValidations() === 0) {
                        timers_1.clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        })
            .then(() => {
            // Wait for all the used resources to be freed.
            return Promise.all(this.used.map(used => utils_1.reflect(used.promise)));
        })
            .then(() => {
            // Abort all pending acquires.
            return Promise.all(this.pendingAcquires.map(acquire => {
                acquire.abort();
                return utils_1.reflect(acquire.promise);
            }));
        })
            .then(() => {
            // Now we can destroy all the freed resources.
            return Promise.all(this.free.map(free => utils_1.reflect(this._destroy(free.resource))));
        })
            .then(() => {
            // Also wait rest of the pending destroys to finish
            return Promise.all(this.pendingDestroys.map(pd => pd.promise));
        })
            .then(() => {
            this.free = [];
            this.pendingAcquires = [];
        })).then(res => {
            this._executeEventHandlers('poolDestroySuccess', eventId);
            this.emitter.removeAllListeners();
            return res;
        });
    }
    on(event, listener) {
        this.emitter.on(event, listener);
    }
    removeListener(event, listener) {
        this.emitter.removeListener(event, listener);
    }
    removeAllListeners(event) {
        this.emitter.removeAllListeners(event);
    }
    /**
     * The most important method that is called always when resources
     * are created / destroyed / acquired / released. In other words
     * every time when resources are moved from used to free or vice
     * versa.
     *
     * Either assigns free resources to pendingAcquires or creates new
     * resources if there is room for it in the pool.
     */
    _tryAcquireOrCreate() {
        if (this.destroyed) {
            return;
        }
        if (this._hasFreeResources()) {
            this._doAcquire();
        }
        else if (this._shouldCreateMoreResources()) {
            this._doCreate();
        }
    }
    _hasFreeResources() {
        return this.free.length > 0;
    }
    _doAcquire() {
        // Acquire as many pending acquires as possible concurrently
        while (this._canAcquire()) {
            // To allow async validation, we actually need to move free resource
            // and pending acquire temporary from their respective arrays and depending
            // on validation result to either leave the free resource to used resources array
            // or destroy the free resource if validation did fail.
            const pendingAcquire = this.pendingAcquires.shift();
            const free = this.free.pop();
            if (free === undefined || pendingAcquire === undefined) {
                const errMessage = 'this.free was empty while trying to acquire resource';
                this.log(`Tarn: ${errMessage}`, 'warn');
                throw new Error(`Internal error, should never happen. ${errMessage}`);
            }
            // Make sure that pendingAcquire that is being validated is not lost and
            // can be freed when pool is destroyed.
            this.pendingValidations.push(pendingAcquire);
            // Must be added here pre-emptively to prevent logic that decides
            // if new resources are created will keep on working correctly.
            this.used.push(free);
            // if acquire fails also pending validation, must be aborted so that pre reserved
            // resource will be returned to free resources immediately
            const abortAbleValidation = new PendingOperation_1.PendingOperation(this.acquireTimeoutMillis);
            // eslint-disable-next-line
            pendingAcquire.promise.catch(err => {
                abortAbleValidation.abort();
            });
            abortAbleValidation.promise
                .catch(err => {
                // There's nothing we can do here but log the error. This would otherwise
                // leak out as an unhandled exception.
                this.log('Tarn: resource validator threw an exception ' + err.stack, 'warn');
                return false;
            })
                .then(validationSuccess => {
                try {
                    if (validationSuccess && !pendingAcquire.isRejected) {
                        // At least one active resource exist, start reaping.
                        this._startReaping();
                        pendingAcquire.resolve(free.resource);
                    }
                    else {
                        remove(this.used, free);
                        // Only destroy the resource if the validation has failed
                        if (!validationSuccess) {
                            this._destroy(free.resource);
                            // Since we destroyed an invalid resource and were not able to fulfill
                            // all the pending acquires, we may need to create new ones or at
                            // least run this acquire loop again to verify it. But not immediately
                            // to prevent starving event loop.
                            setTimeout(() => {
                                this._tryAcquireOrCreate();
                            }, 0);
                        }
                        else {
                            this.free.push(free);
                        }
                        // is acquire was canceled, failed or timed out already
                        // no need to return it to pending queries
                        if (!pendingAcquire.isRejected) {
                            this.pendingAcquires.unshift(pendingAcquire);
                        }
                    }
                }
                finally {
                    remove(this.pendingValidations, pendingAcquire);
                }
            });
            // try to validate
            this._validateResource(free.resource)
                .then(validationSuccess => {
                abortAbleValidation.resolve(validationSuccess);
            })
                .catch(err => {
                abortAbleValidation.reject(err);
            });
        }
    }
    _canAcquire() {
        return this.free.length > 0 && this.pendingAcquires.length > 0;
    }
    _validateResource(resource) {
        try {
            return Promise.resolve(this.validate(resource));
        }
        catch (err) {
            // prevent leaking of sync exception
            return Promise.reject(err);
        }
    }
    _shouldCreateMoreResources() {
        return (this.used.length + this.pendingCreates.length < this.max &&
            this.pendingCreates.length < this.pendingAcquires.length);
    }
    _doCreate() {
        const pendingAcquiresBeforeCreate = this.pendingAcquires.slice();
        const pendingCreate = this._create();
        pendingCreate.promise
            .then(() => {
            // Not returned on purpose.
            this._tryAcquireOrCreate();
            return null;
        })
            .catch(err => {
            if (this.propagateCreateError && this.pendingAcquires.length !== 0) {
                // If propagateCreateError is true, we don't retry the create
                // but reject the first pending acquire immediately. Intentionally
                // use `this.pendingAcquires` instead of `pendingAcquiresBeforeCreate`
                // in case some acquires in pendingAcquiresBeforeCreate have already
                // been resolved.
                this.pendingAcquires[0].reject(err);
            }
            // Save the create error to all pending acquires so that we can use it
            // as the error to reject the acquire if it times out.
            pendingAcquiresBeforeCreate.forEach(pendingAcquire => {
                pendingAcquire.possibleTimeoutCause = err;
            });
            // Not returned on purpose.
            utils_1.delay(this.createRetryIntervalMillis).then(() => this._tryAcquireOrCreate());
        });
    }
    _create() {
        const eventId = this.eventId++;
        this._executeEventHandlers('createRequest', eventId);
        const pendingCreate = new PendingOperation_1.PendingOperation(this.createTimeoutMillis);
        // If an error occurs (likely a create timeout) remove this creation from
        // the list of pending creations so we try to create a new one.
        pendingCreate.promise = pendingCreate.promise.catch(err => {
            if (remove(this.pendingCreates, pendingCreate)) {
                // TODO: figure out more consistent way for different error handlers in next rewrite
                this._executeEventHandlers('createFail', eventId, err);
            }
            throw err;
        });
        this.pendingCreates.push(pendingCreate);
        callbackOrPromise(this.creator)
            .then(resource => {
            if (pendingCreate.isRejected) {
                this.destroyer(resource);
                return null;
            }
            remove(this.pendingCreates, pendingCreate);
            this.free.push(new Resource_1.Resource(resource));
            // Not returned on purpose.
            pendingCreate.resolve(resource);
            this._executeEventHandlers('createSuccess', eventId, resource);
            return null;
        })
            .catch(err => {
            if (pendingCreate.isRejected) {
                return null;
            }
            if (remove(this.pendingCreates, pendingCreate)) {
                this._executeEventHandlers('createFail', eventId, err);
            }
            // Not returned on purpose.
            pendingCreate.reject(err);
            return null;
        });
        return pendingCreate;
    }
    _destroy(resource) {
        const eventId = this.eventId++;
        this._executeEventHandlers('destroyRequest', eventId, resource);
        // this.destroyer can be both synchronous and asynchronous.
        // so we wrap it to promise to get all exceptions through same pipeline
        const pendingDestroy = new PendingOperation_1.PendingOperation(this.destroyTimeoutMillis);
        const retVal = Promise.resolve().then(() => this.destroyer(resource));
        retVal
            .then(() => {
            pendingDestroy.resolve(resource);
        })
            .catch((err) => {
            pendingDestroy.reject(err);
        });
        this.pendingDestroys.push(pendingDestroy);
        // In case of an error there's nothing we can do here but log it.
        return pendingDestroy.promise
            .then(res => {
            this._executeEventHandlers('destroySuccess', eventId, resource);
            return res;
        })
            .catch(err => this._logDestroyerError(eventId, resource, err))
            .then(res => {
            const index = this.pendingDestroys.findIndex(pd => pd === pendingDestroy);
            this.pendingDestroys.splice(index, 1);
            return res;
        });
    }
    _logDestroyerError(eventId, resource, err) {
        this._executeEventHandlers('destroyFail', eventId, resource, err);
        this.log('Tarn: resource destroyer threw an exception ' + err.stack, 'warn');
    }
    _startReaping() {
        if (!this.interval) {
            this._executeEventHandlers('startReaping');
            this.interval = setInterval(() => this.check(), this.reapIntervalMillis);
        }
    }
    _stopReaping() {
        if (this.interval !== null) {
            this._executeEventHandlers('stopReaping');
            timers_1.clearInterval(this.interval);
        }
        this.interval = null;
    }
    _executeEventHandlers(eventName, ...args) {
        const listeners = this.emitter.listeners(eventName);
        // just calling .emit() would stop running rest of the listeners if one them fails
        listeners.forEach(listener => {
            try {
                listener(...args);
            }
            catch (err) {
                // There's nothing we can do here but log the error. This would otherwise
                // leak out as an unhandled exception.
                this.log(`Tarn: event handler "${eventName}" threw an exception ${err.stack}`, 'warn');
            }
        });
    }
};
Pool$2.Pool = Pool$1;
function remove(arr, item) {
    const idx = arr.indexOf(item);
    if (idx === -1) {
        return false;
    }
    else {
        arr.splice(idx, 1);
        return true;
    }
}
function callbackOrPromise(func) {
    return new Promise((resolve, reject) => {
        const callback = (err, resource) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(resource);
            }
        };
        utils_1.tryPromise(() => func(callback))
            .then(res => {
            // If the result is falsy, we assume that the callback will
            // be called instead of interpreting the falsy value as a
            // result value.
            if (res) {
                resolve(res);
            }
        })
            .catch(err => {
            reject(err);
        });
    });
}

(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const Pool_1 = Pool$2;
	exports.Pool = Pool_1.Pool;
	const TimeoutError_1 = TimeoutError$2;
	exports.TimeoutError = TimeoutError_1.TimeoutError;
	module.exports = {
	    Pool: Pool_1.Pool,
	    TimeoutError: TimeoutError_1.TimeoutError
	}; 
} (tarn, tarn.exports));

var tarnExports = tarn.exports;

/*eslint max-len: 0, no-var:0 */

const charsRegex = /[\0\b\t\n\r\x1a"'\\]/g; // eslint-disable-line no-control-regex
const charsMap = {
  '\0': '\\0',
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\r': '\\r',
  '\x1a': '\\Z',
  '"': '\\"',
  "'": "\\'",
  '\\': '\\\\',
};

function wrapEscape(escapeFn) {
  return function finalEscape(val, ctx = {}) {
    return escapeFn(val, finalEscape, ctx);
  };
}

function makeEscape$2(config = {}) {
  const finalEscapeDate = config.escapeDate || dateToString;
  const finalEscapeArray = config.escapeArray || arrayToList;
  const finalEscapeBuffer = config.escapeBuffer || bufferToString;
  const finalEscapeString = config.escapeString || escapeString;
  const finalEscapeObject = config.escapeObject || escapeObject;
  const finalWrap = config.wrap || wrapEscape;

  function escapeFn(val, finalEscape, ctx) {
    if (val === undefined || val === null) {
      return 'NULL';
    }
    switch (typeof val) {
      case 'boolean':
        return val ? 'true' : 'false';
      case 'number':
        return val + '';
      case 'object':
        if (val instanceof Date) {
          val = finalEscapeDate(val, finalEscape, ctx);
        } else if (Array.isArray(val)) {
          return finalEscapeArray(val, finalEscape, ctx);
        } else if (Buffer.isBuffer(val)) {
          return finalEscapeBuffer(val, finalEscape, ctx);
        } else {
          return finalEscapeObject(val, finalEscape, ctx);
        }
    }
    return finalEscapeString(val, finalEscape, ctx);
  }

  return finalWrap ? finalWrap(escapeFn) : escapeFn;
}

function escapeObject(val, finalEscape, ctx) {
  if (val && typeof val.toSQL === 'function') {
    return val.toSQL(ctx);
  } else {
    return JSON.stringify(val);
  }
}

function arrayToList(array, finalEscape, ctx) {
  let sql = '';
  for (let i = 0; i < array.length; i++) {
    const val = array[i];
    if (Array.isArray(val)) {
      sql +=
        (i === 0 ? '' : ', ') + '(' + arrayToList(val, finalEscape, ctx) + ')';
    } else {
      sql += (i === 0 ? '' : ', ') + finalEscape(val, ctx);
    }
  }
  return sql;
}

function bufferToString(buffer) {
  return 'X' + escapeString(buffer.toString('hex'));
}

function escapeString(val, finalEscape, ctx) {
  let chunkIndex = (charsRegex.lastIndex = 0);
  let escapedVal = '';
  let match;

  while ((match = charsRegex.exec(val))) {
    escapedVal += val.slice(chunkIndex, match.index) + charsMap[match[0]];
    chunkIndex = charsRegex.lastIndex;
  }

  if (chunkIndex === 0) {
    // Nothing was escaped
    return "'" + val + "'";
  }

  if (chunkIndex < val.length) {
    return "'" + escapedVal + val.slice(chunkIndex) + "'";
  }

  return "'" + escapedVal + "'";
}

function dateToString(date, finalEscape, ctx = {}) {
  const timeZone = ctx.timeZone || 'local';

  const dt = new Date(date);
  let year;
  let month;
  let day;
  let hour;
  let minute;
  let second;
  let millisecond;

  if (timeZone === 'local') {
    year = dt.getFullYear();
    month = dt.getMonth() + 1;
    day = dt.getDate();
    hour = dt.getHours();
    minute = dt.getMinutes();
    second = dt.getSeconds();
    millisecond = dt.getMilliseconds();
  } else {
    const tz = convertTimezone(timeZone);

    if (tz !== false && tz !== 0) {
      dt.setTime(dt.getTime() + tz * 60000);
    }

    year = dt.getUTCFullYear();
    month = dt.getUTCMonth() + 1;
    day = dt.getUTCDate();
    hour = dt.getUTCHours();
    minute = dt.getUTCMinutes();
    second = dt.getUTCSeconds();
    millisecond = dt.getUTCMilliseconds();
  }

  // YYYY-MM-DD HH:mm:ss.mmm
  return (
    zeroPad(year, 4) +
    '-' +
    zeroPad(month, 2) +
    '-' +
    zeroPad(day, 2) +
    ' ' +
    zeroPad(hour, 2) +
    ':' +
    zeroPad(minute, 2) +
    ':' +
    zeroPad(second, 2) +
    '.' +
    zeroPad(millisecond, 3)
  );
}

function zeroPad(number, length) {
  number = number.toString();
  while (number.length < length) {
    number = '0' + number;
  }
  return number;
}

function convertTimezone(tz) {
  if (tz === 'Z') {
    return 0;
  }
  const m = tz.match(/([+\-\s])(\d\d):?(\d\d)?/);
  if (m) {
    return (
      (m[1] == '-' ? -1 : 1) *
      (parseInt(m[2], 10) + (m[3] ? parseInt(m[3], 10) : 0) / 60) *
      60
    );
  }
  return false;
}

var string = {
  arrayToList,
  bufferToString,
  dateToString,
  escapeString,
  charsRegex,
  charsMap,
  escapeObject,
  makeEscape: makeEscape$2,
};

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */

function arrayEach$3(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

var _arrayEach = arrayEach$3;

var copyObject$5 = _copyObject,
    keys$3 = keys_1;

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign$1(object, source) {
  return object && copyObject$5(source, keys$3(source), object);
}

var _baseAssign = baseAssign$1;

var copyObject$4 = _copyObject,
    keysIn$5 = keysIn_1;

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn$1(object, source) {
  return object && copyObject$4(source, keysIn$5(source), object);
}

var _baseAssignIn = baseAssignIn$1;

var _cloneBuffer = {exports: {}};

_cloneBuffer.exports;

(function (module, exports) {
	var root = _root;

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined,
	    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

	/**
	 * Creates a clone of  `buffer`.
	 *
	 * @private
	 * @param {Buffer} buffer The buffer to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Buffer} Returns the cloned buffer.
	 */
	function cloneBuffer(buffer, isDeep) {
	  if (isDeep) {
	    return buffer.slice();
	  }
	  var length = buffer.length,
	      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

	  buffer.copy(result);
	  return result;
	}

	module.exports = cloneBuffer; 
} (_cloneBuffer, _cloneBuffer.exports));

var _cloneBufferExports = _cloneBuffer.exports;

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */

function copyArray$3(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

var _copyArray = copyArray$3;

var copyObject$3 = _copyObject,
    getSymbols$1 = _getSymbols;

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols$1(source, object) {
  return copyObject$3(source, getSymbols$1(source), object);
}

var _copySymbols = copySymbols$1;

var overArg = _overArg;

/** Built-in value references. */
var getPrototype$4 = overArg(Object.getPrototypeOf, Object);

var _getPrototype = getPrototype$4;

var arrayPush$1 = _arrayPush,
    getPrototype$3 = _getPrototype,
    getSymbols = _getSymbols,
    stubArray = stubArray_1;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn$2 = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush$1(result, getSymbols(object));
    object = getPrototype$3(object);
  }
  return result;
};

var _getSymbolsIn = getSymbolsIn$2;

var copyObject$2 = _copyObject,
    getSymbolsIn$1 = _getSymbolsIn;

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn$1(source, object) {
  return copyObject$2(source, getSymbolsIn$1(source), object);
}

var _copySymbolsIn = copySymbolsIn$1;

var baseGetAllKeys = _baseGetAllKeys,
    getSymbolsIn = _getSymbolsIn,
    keysIn$4 = keysIn_1;

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn$2(object) {
  return baseGetAllKeys(object, keysIn$4, getSymbolsIn);
}

var _getAllKeysIn = getAllKeysIn$2;

/** Used for built-in method references. */

var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$6.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray$1(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty$6.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

var _initCloneArray = initCloneArray$1;

var Uint8Array$1 = _Uint8Array;

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer$3(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer));
  return result;
}

var _cloneArrayBuffer = cloneArrayBuffer$3;

var cloneArrayBuffer$2 = _cloneArrayBuffer;

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView$1(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer$2(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

var _cloneDataView = cloneDataView$1;

/** Used to match `RegExp` flags from their coerced string values. */

var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp$1(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

var _cloneRegExp = cloneRegExp$1;

var Symbol$3 = _Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$3 ? Symbol$3.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol$1(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

var _cloneSymbol = cloneSymbol$1;

var cloneArrayBuffer$1 = _cloneArrayBuffer;

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray$2(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer$1(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

var _cloneTypedArray = cloneTypedArray$2;

var cloneArrayBuffer = _cloneArrayBuffer,
    cloneDataView = _cloneDataView,
    cloneRegExp = _cloneRegExp,
    cloneSymbol = _cloneSymbol,
    cloneTypedArray$1 = _cloneTypedArray;

/** `Object#toString` result references. */
var boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    mapTag$4 = '[object Map]',
    numberTag$1 = '[object Number]',
    regexpTag$1 = '[object RegExp]',
    setTag$4 = '[object Set]',
    stringTag$2 = '[object String]',
    symbolTag$1 = '[object Symbol]';

var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]',
    float32Tag$1 = '[object Float32Array]',
    float64Tag$1 = '[object Float64Array]',
    int8Tag$1 = '[object Int8Array]',
    int16Tag$1 = '[object Int16Array]',
    int32Tag$1 = '[object Int32Array]',
    uint8Tag$1 = '[object Uint8Array]',
    uint8ClampedTag$1 = '[object Uint8ClampedArray]',
    uint16Tag$1 = '[object Uint16Array]',
    uint32Tag$1 = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag$1(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$1:
      return cloneArrayBuffer(object);

    case boolTag$1:
    case dateTag$1:
      return new Ctor(+object);

    case dataViewTag$1:
      return cloneDataView(object, isDeep);

    case float32Tag$1: case float64Tag$1:
    case int8Tag$1: case int16Tag$1: case int32Tag$1:
    case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
      return cloneTypedArray$1(object, isDeep);

    case mapTag$4:
      return new Ctor;

    case numberTag$1:
    case stringTag$2:
      return new Ctor(object);

    case regexpTag$1:
      return cloneRegExp(object);

    case setTag$4:
      return new Ctor;

    case symbolTag$1:
      return cloneSymbol(object);
  }
}

var _initCloneByTag = initCloneByTag$1;

var isObject$e = isObject_1;

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate$2 = (function() {
  function object() {}
  return function(proto) {
    if (!isObject$e(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

var _baseCreate = baseCreate$2;

var baseCreate$1 = _baseCreate,
    getPrototype$2 = _getPrototype,
    isPrototype$2 = _isPrototype;

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject$2(object) {
  return (typeof object.constructor == 'function' && !isPrototype$2(object))
    ? baseCreate$1(getPrototype$2(object))
    : {};
}

var _initCloneObject = initCloneObject$2;

var getTag$4 = _getTag,
    isObjectLike$4 = isObjectLike_1;

/** `Object#toString` result references. */
var mapTag$3 = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap$1(value) {
  return isObjectLike$4(value) && getTag$4(value) == mapTag$3;
}

var _baseIsMap = baseIsMap$1;

var baseIsMap = _baseIsMap,
    baseUnary$1 = _baseUnary,
    nodeUtil$1 = _nodeUtilExports;

/* Node.js helper references. */
var nodeIsMap = nodeUtil$1 && nodeUtil$1.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap$1 = nodeIsMap ? baseUnary$1(nodeIsMap) : baseIsMap;

var isMap_1 = isMap$1;

var getTag$3 = _getTag,
    isObjectLike$3 = isObjectLike_1;

/** `Object#toString` result references. */
var setTag$3 = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet$1(value) {
  return isObjectLike$3(value) && getTag$3(value) == setTag$3;
}

var _baseIsSet = baseIsSet$1;

var baseIsSet = _baseIsSet,
    baseUnary = _baseUnary,
    nodeUtil = _nodeUtilExports;

/* Node.js helper references. */
var nodeIsSet = nodeUtil && nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet$1 = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

var isSet_1 = isSet$1;

var Stack$1 = _Stack,
    arrayEach$2 = _arrayEach,
    assignValue$2 = _assignValue,
    baseAssign = _baseAssign,
    baseAssignIn = _baseAssignIn,
    cloneBuffer$1 = _cloneBufferExports,
    copyArray$2 = _copyArray,
    copySymbols = _copySymbols,
    copySymbolsIn = _copySymbolsIn,
    getAllKeys = _getAllKeys,
    getAllKeysIn$1 = _getAllKeysIn,
    getTag$2 = _getTag,
    initCloneArray = _initCloneArray,
    initCloneByTag = _initCloneByTag,
    initCloneObject$1 = _initCloneObject,
    isArray$9 = isArray_1,
    isBuffer$3 = isBufferExports,
    isMap = isMap_1,
    isObject$d = isObject_1,
    isSet = isSet_1,
    keys$2 = keys_1,
    keysIn$3 = keysIn_1;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$1 = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG$2 = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag$2 = '[object Map]',
    numberTag = '[object Number]',
    objectTag$1 = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag$2 = '[object Set]',
    stringTag$1 = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag$2] =
cloneableTags[numberTag] = cloneableTags[objectTag$1] =
cloneableTags[regexpTag] = cloneableTags[setTag$2] =
cloneableTags[stringTag$1] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone$2(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG$1,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG$2;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject$d(value)) {
    return value;
  }
  var isArr = isArray$9(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray$2(value, result);
    }
  } else {
    var tag = getTag$2(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer$3(value)) {
      return cloneBuffer$1(value, isDeep);
    }
    if (tag == objectTag$1 || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject$1(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack$1);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone$2(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone$2(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn$1 : getAllKeys)
    : (isFlat ? keysIn$3 : keys$2);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach$2(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue$2(result, key, baseClone$2(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

var _baseClone = baseClone$2;

var baseClone$1 = _baseClone;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_SYMBOLS_FLAG$1 = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep$1(value) {
  return baseClone$1(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG$1);
}

var cloneDeep_1 = cloneDeep$1;

var baseRest = _baseRest,
    eq$1 = eq_1,
    isIterateeCall$1 = _isIterateeCall,
    keysIn$2 = keysIn_1;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$5.hasOwnProperty;

/**
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to `undefined`. Source objects are applied from left to right.
 * Once a property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaultsDeep
 * @example
 *
 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */
var defaults$1 = baseRest(function(object, sources) {
  object = Object(object);

  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : undefined;

  if (guard && isIterateeCall$1(sources[0], sources[1], guard)) {
    length = 1;
  }

  while (++index < length) {
    var source = sources[index];
    var props = keysIn$2(source);
    var propsIndex = -1;
    var propsLength = props.length;

    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object[key];

      if (value === undefined ||
          (eq$1(value, objectProto$5[key]) && !hasOwnProperty$5.call(object, key))) {
        object[key] = source[key];
      }
    }
  }

  return object;
});

var defaults_1 = defaults$1;

var toString = toString_1;

/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId$2(prefix) {
  var id = ++idCounter;
  return toString(prefix) + id;
}

var uniqueId_1 = uniqueId$2;

var timeout$3 = {};

let KnexTimeoutError$3 = class KnexTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'KnexTimeoutError';
  }
};

function timeout$2(promise, ms) {
  return new Promise(function (resolve, reject) {
    const id = setTimeout(function () {
      reject(new KnexTimeoutError$3('operation timed out'));
    }, ms);

    function wrappedResolve(value) {
      clearTimeout(id);
      resolve(value);
    }

    function wrappedReject(err) {
      clearTimeout(id);
      reject(err);
    }

    promise.then(wrappedResolve, wrappedReject);
  });
}

timeout$3.KnexTimeoutError = KnexTimeoutError$3;
timeout$3.timeout = timeout$2;

function ensureConnectionCallback$1(runner) {
  runner.client.emit('start', runner.builder);
  runner.builder.emit('start', runner.builder);
  const sql = runner.builder.toSQL();

  if (runner.builder._debug) {
    runner.client.logger.debug(sql);
  }

  if (Array.isArray(sql)) {
    return runner.queryArray(sql);
  }
  return runner.query(sql);
}

function ensureConnectionStreamCallback$1(runner, params) {
  try {
    const sql = runner.builder.toSQL();

    if (Array.isArray(sql) && params.hasHandler) {
      throw new Error(
        'The stream may only be used with a single query statement.'
      );
    }

    return runner.client.stream(
      runner.connection,
      sql,
      params.stream,
      params.options
    );
  } catch (e) {
    params.stream.emit('error', e);
    throw e;
  }
}

var ensureConnectionCallback_1 = {
  ensureConnectionCallback: ensureConnectionCallback$1,
  ensureConnectionStreamCallback: ensureConnectionStreamCallback$1,
};

const { KnexTimeoutError: KnexTimeoutError$2 } = timeout$3;
const { timeout: timeout$1 } = timeout$3;
const {
  ensureConnectionCallback,
  ensureConnectionStreamCallback,
} = ensureConnectionCallback_1;

let Transform;

// The "Runner" constructor takes a "builder" (query, schema, or raw)
// and runs through each of the query statements, calling any additional
// "output" method provided alongside the query and bindings.
let Runner$1 = class Runner {
  constructor(client, builder) {
    this.client = client;
    this.builder = builder;
    this.queries = [];

    // The "connection" object is set on the runner when
    // "run" is called.
    this.connection = undefined;
  }

  // "Run" the target, calling "toSQL" on the builder, returning
  // an object or array of queries to run, each of which are run on
  // a single connection.
  async run() {
    const runner = this;
    try {
      const res = await this.ensureConnection(ensureConnectionCallback);

      // Fire a single "end" event on the builder when
      // all queries have successfully completed.
      runner.builder.emit('end');
      return res;

      // If there are any "error" listeners, we fire an error event
      // and then re-throw the error to be eventually handled by
      // the promise chain. Useful if you're wrapping in a custom `Promise`.
    } catch (err) {
      if (runner.builder._events && runner.builder._events.error) {
        runner.builder.emit('error', err);
      }
      throw err;
    }
  }

  // Stream the result set, by passing through to the dialect's streaming
  // capabilities. If the options are
  stream(optionsOrHandler, handlerOrNil) {
    const firstOptionIsHandler =
      typeof optionsOrHandler === 'function' && arguments.length === 1;

    const options = firstOptionIsHandler ? {} : optionsOrHandler;
    const handler = firstOptionIsHandler ? optionsOrHandler : handlerOrNil;

    // Determines whether we emit an error or throw here.
    const hasHandler = typeof handler === 'function';

    // Lazy-load the "Transform" dependency.
    Transform = Transform || require$$2.Transform;

    const queryContext = this.builder.queryContext();

    const stream = new Transform({
      objectMode: true,
      transform: (chunk, _, callback) => {
        callback(null, this.client.postProcessResponse(chunk, queryContext));
      },
    });
    stream.on('close', () => {
      this.client.releaseConnection(this.connection);
    });

    // If the stream is manually destroyed, the close event is not
    // propagated to the top of the pipe chain. We need to manually verify
    // that the source stream is closed and if not, manually destroy it.
    stream.on('pipe', (sourceStream) => {
      const cleanSourceStream = () => {
        if (!sourceStream.closed) {
          sourceStream.destroy();
        }
      };

      // Stream already closed, cleanup immediately
      if (stream.closed) {
        cleanSourceStream();
      } else {
        stream.on('close', cleanSourceStream);
      }
    });

    const connectionAcquirePromise = this.ensureConnection(
      ensureConnectionStreamCallback,
      {
        options,
        hasHandler,
        stream,
      }
    )
      // Emit errors on the stream if the error occurred before a connection
      // could be acquired.
      // If the connection was acquired, assume the error occurred in the client
      // code and has already been emitted on the stream. Don't emit it twice.
      .catch((err) => {
        if (!this.connection) {
          stream.emit('error', err);
        }
      });

    // If a function is passed to handle the stream, send the stream
    // there and return the promise, otherwise just return the stream
    // and the promise will take care of itself.
    if (hasHandler) {
      handler(stream);
      return connectionAcquirePromise;
    }
    return stream;
  }

  // Allow you to pipe the stream to a writable stream.
  pipe(writable, options) {
    return this.stream(options).pipe(writable);
  }

  // "Runs" a query, returning a promise. All queries specified by the builder are guaranteed
  // to run in sequence, and on the same connection, especially helpful when schema building
  // and dealing with foreign key constraints, etc.
  async query(obj) {
    const { __knexUid, __knexTxId } = this.connection;

    this.builder.emit('query', Object.assign({ __knexUid, __knexTxId }, obj));

    const runner = this;
    const queryContext = this.builder.queryContext();
    // query-error events are emitted before the queryPromise continuations.
    // pass queryContext into client.query so it can be raised properly.
    if (obj !== null && typeof obj === 'object') {
      obj.queryContext = queryContext;
    }
    let queryPromise = this.client.query(this.connection, obj);

    if (obj.timeout) {
      queryPromise = timeout$1(queryPromise, obj.timeout);
    }

    // Await the return value of client.processResponse; in the case of sqlite3's
    // dropColumn()/renameColumn(), it will be a Promise for the transaction
    // containing the complete rename procedure.
    return queryPromise
      .then((resp) => this.client.processResponse(resp, runner))
      .then((processedResponse) => {
        const postProcessedResponse = this.client.postProcessResponse(
          processedResponse,
          queryContext
        );

        this.builder.emit(
          'query-response',
          postProcessedResponse,
          Object.assign({ __knexUid, __knexTxId }, obj),
          this.builder
        );

        this.client.emit(
          'query-response',
          postProcessedResponse,
          Object.assign({ __knexUid, __knexTxId }, obj),
          this.builder
        );

        return postProcessedResponse;
      })
      .catch((error) => {
        if (!(error instanceof KnexTimeoutError$2)) {
          return Promise.reject(error);
        }
        const { timeout, sql, bindings } = obj;

        let cancelQuery;
        if (obj.cancelOnTimeout) {
          cancelQuery = this.client.cancelQuery(this.connection);
        } else {
          // If we don't cancel the query, we need to mark the connection as disposed so that
          // it gets destroyed by the pool and is never used again. If we don't do this and
          // return the connection to the pool, it will be useless until the current operation
          // that timed out, finally finishes.
          this.connection.__knex__disposed = error;
          cancelQuery = Promise.resolve();
        }

        return cancelQuery
          .catch((cancelError) => {
            // If the cancellation failed, we need to mark the connection as disposed so that
            // it gets destroyed by the pool and is never used again. If we don't do this and
            // return the connection to the pool, it will be useless until the current operation
            // that timed out, finally finishes.
            this.connection.__knex__disposed = error;

            // cancellation failed
            throw Object.assign(cancelError, {
              message: `After query timeout of ${timeout}ms exceeded, cancelling of query failed.`,
              sql,
              bindings,
              timeout,
            });
          })
          .then(() => {
            // cancellation succeeded, rethrow timeout error
            throw Object.assign(error, {
              message: `Defined query timeout of ${timeout}ms exceeded when running query.`,
              sql,
              bindings,
              timeout,
            });
          });
      })
      .catch((error) => {
        this.builder.emit(
          'query-error',
          error,
          Object.assign({ __knexUid, __knexTxId, queryContext }, obj)
        );
        throw error;
      });
  }

  // In the case of the "schema builder" we call `queryArray`, which runs each
  // of the queries in sequence.
  async queryArray(queries) {
    if (queries.length === 1) {
      const query = queries[0];

      if (!query.statementsProducer) {
        return this.query(query);
      }

      const statements = await query.statementsProducer(
        undefined,
        this.connection
      );

      const sqlQueryObjects = statements.sql.map((statement) => ({
        sql: statement,
        bindings: query.bindings,
      }));
      const preQueryObjects = statements.pre.map((statement) => ({
        sql: statement,
        bindings: query.bindings,
      }));
      const postQueryObjects = statements.post.map((statement) => ({
        sql: statement,
        bindings: query.bindings,
      }));

      let results = [];

      await this.queryArray(preQueryObjects);

      try {
        await this.client.transaction(
          async (trx) => {
            const transactionRunner = new Runner(trx.client, this.builder);
            transactionRunner.connection = this.connection;

            results = await transactionRunner.queryArray(sqlQueryObjects);

            if (statements.check) {
              const foreignViolations = await trx.raw(statements.check);

              if (foreignViolations.length > 0) {
                throw new Error('FOREIGN KEY constraint failed');
              }
            }
          },
          { connection: this.connection }
        );
      } finally {
        await this.queryArray(postQueryObjects);
      }

      return results;
    }

    const results = [];
    for (const query of queries) {
      results.push(await this.queryArray([query]));
    }
    return results;
  }

  // Check whether there's a transaction flag, and that it has a connection.
  async ensureConnection(cb, cbParams) {
    // Use override from a builder if passed
    if (this.builder._connection) {
      this.connection = this.builder._connection;
    }

    if (this.connection) {
      return cb(this, cbParams);
    }

    let acquiredConnection;
    try {
      acquiredConnection = await this.client.acquireConnection();
    } catch (error) {
      if (!(error instanceof KnexTimeoutError$2)) {
        return Promise.reject(error);
      }
      if (this.builder) {
        error.sql = this.builder.sql;
        error.bindings = this.builder.bindings;
      }
      throw error;
    }
    try {
      this.connection = acquiredConnection;
      return await cb(this, cbParams);
    } finally {
      await this.client.releaseConnection(acquiredConnection);
    }
  }
};

var runner = Runner$1;

var browser = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = requireMs();
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

var common = setup;

/* eslint-env browser */

(function (module, exports) {
	/**
	 * This is the web browser implementation of `debug()`.
	 */

	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;

		return () => {
			if (!warned) {
				warned = true;
				console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
			}
		};
	})();

	/**
	 * Colors.
	 */

	exports.colors = [
		'#0000CC',
		'#0000FF',
		'#0033CC',
		'#0033FF',
		'#0066CC',
		'#0066FF',
		'#0099CC',
		'#0099FF',
		'#00CC00',
		'#00CC33',
		'#00CC66',
		'#00CC99',
		'#00CCCC',
		'#00CCFF',
		'#3300CC',
		'#3300FF',
		'#3333CC',
		'#3333FF',
		'#3366CC',
		'#3366FF',
		'#3399CC',
		'#3399FF',
		'#33CC00',
		'#33CC33',
		'#33CC66',
		'#33CC99',
		'#33CCCC',
		'#33CCFF',
		'#6600CC',
		'#6600FF',
		'#6633CC',
		'#6633FF',
		'#66CC00',
		'#66CC33',
		'#9900CC',
		'#9900FF',
		'#9933CC',
		'#9933FF',
		'#99CC00',
		'#99CC33',
		'#CC0000',
		'#CC0033',
		'#CC0066',
		'#CC0099',
		'#CC00CC',
		'#CC00FF',
		'#CC3300',
		'#CC3333',
		'#CC3366',
		'#CC3399',
		'#CC33CC',
		'#CC33FF',
		'#CC6600',
		'#CC6633',
		'#CC9900',
		'#CC9933',
		'#CCCC00',
		'#CCCC33',
		'#FF0000',
		'#FF0033',
		'#FF0066',
		'#FF0099',
		'#FF00CC',
		'#FF00FF',
		'#FF3300',
		'#FF3333',
		'#FF3366',
		'#FF3399',
		'#FF33CC',
		'#FF33FF',
		'#FF6600',
		'#FF6633',
		'#FF9900',
		'#FF9933',
		'#FFCC00',
		'#FFCC33'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	// eslint-disable-next-line complexity
	function useColors() {
		// NB: In an Electron preload script, document will be defined but not fully
		// initialized. Since we know we're in Chrome, we'll just detect this case
		// explicitly
		if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
			return true;
		}

		// Internet Explorer and Edge do not support colors.
		if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
			return false;
		}

		// Is webkit? http://stackoverflow.com/a/16459606/376773
		// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
			// Is firebug? http://stackoverflow.com/a/398120/376773
			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
			// Is firefox >= v31?
			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
			// Double check webkit in userAgent just in case we are in a worker
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}

	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs(args) {
		args[0] = (this.useColors ? '%c' : '') +
			this.namespace +
			(this.useColors ? ' %c' : ' ') +
			args[0] +
			(this.useColors ? '%c ' : ' ') +
			'+' + module.exports.humanize(this.diff);

		if (!this.useColors) {
			return;
		}

		const c = 'color: ' + this.color;
		args.splice(1, 0, c, 'color: inherit');

		// The final "%c" is somewhat tricky, because there could be other
		// arguments passed either before or after the %c, so we need to
		// figure out the correct index to insert the CSS into
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, match => {
			if (match === '%%') {
				return;
			}
			index++;
			if (match === '%c') {
				// We only are interested in the *last* %c
				// (the user may have provided their own)
				lastC = index;
			}
		});

		args.splice(lastC, 0, c);
	}

	/**
	 * Invokes `console.debug()` when available.
	 * No-op when `console.debug` is not a "function".
	 * If `console.debug` is not available, falls back
	 * to `console.log`.
	 *
	 * @api public
	 */
	exports.log = console.debug || console.log || (() => {});

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	function save(namespaces) {
		try {
			if (namespaces) {
				exports.storage.setItem('debug', namespaces);
			} else {
				exports.storage.removeItem('debug');
			}
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	function load() {
		let r;
		try {
			r = exports.storage.getItem('debug');
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}

		// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		if (!r && typeof process !== 'undefined' && 'env' in process) {
			r = process.env.DEBUG;
		}

		return r;
	}

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage() {
		try {
			// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
			// The Browser also has localStorage in the global context.
			return localStorage;
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}

	module.exports = common(exports);

	const {formatters} = module.exports;

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	formatters.j = function (v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return '[UnexpectedJSONParseError]: ' + error.message;
		}
	}; 
} (browser, browser.exports));

var browserExports = browser.exports;

var noop$1 = function () {};

// FunctionHelper
// -------
// Used for adding functions from the builder
// Example usage: table.dateTime('datetime_to_date').notNull().defaultTo(knex.fn.now());
let FunctionHelper$1 = class FunctionHelper {
  constructor(client) {
    this.client = client;
  }

  now(precision) {
    if (typeof precision === 'number') {
      return this.client.raw(`CURRENT_TIMESTAMP(${precision})`);
    }
    return this.client.raw('CURRENT_TIMESTAMP');
  }

  uuid() {
    switch (this.client.driverName) {
      case 'sqlite3':
      case 'better-sqlite3':
        return this.client.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"
        );
      case 'mssql':
        return this.client.raw('(NEWID())');
      case 'pg':
      case 'pgnative':
      case 'cockroachdb':
        return this.client.raw('(gen_random_uuid())');
      case 'oracle':
      case 'oracledb':
        return this.client.raw('(random_uuid())');
      case 'mysql':
      case 'mysql2':
        return this.client.raw('(UUID())');
      default:
        throw new Error(
          `${this.client.driverName} does not have a uuid function`
        );
    }
  }

  uuidToBin(uuid, ordered = true) {
    const buf = Buffer.from(uuid.replace(/-/g, ''), 'hex');
    return ordered
      ? Buffer.concat([
          buf.slice(6, 8),
          buf.slice(4, 6),
          buf.slice(0, 4),
          buf.slice(8, 16),
        ])
      : Buffer.concat([
          buf.slice(0, 4),
          buf.slice(4, 6),
          buf.slice(6, 8),
          buf.slice(8, 16),
        ]);
  }

  binToUuid(bin, ordered = true) {
    const buf = Buffer.from(bin, 'hex');
    return ordered
      ? [
          buf.toString('hex', 4, 8),
          buf.toString('hex', 2, 4),
          buf.toString('hex', 0, 2),
          buf.toString('hex', 8, 10),
          buf.toString('hex', 10, 16),
        ].join('-')
      : [
          buf.toString('hex', 0, 4),
          buf.toString('hex', 4, 6),
          buf.toString('hex', 6, 8),
          buf.toString('hex', 8, 10),
          buf.toString('hex', 10, 16),
        ].join('-');
  }
};

var FunctionHelper_1 = FunctionHelper$1;

// All properties we can use to start a query chain
// from the `knex` object, e.g. `knex.select('*').from(...`
var methodConstants = [
  'with',
  'withRecursive',
  'withMaterialized',
  'withNotMaterialized',
  'select',
  'as',
  'columns',
  'column',
  'from',
  'fromJS',
  'fromRaw',
  'into',
  'withSchema',
  'table',
  'distinct',
  'join',
  'joinRaw',
  'innerJoin',
  'leftJoin',
  'leftOuterJoin',
  'rightJoin',
  'rightOuterJoin',
  'outerJoin',
  'fullOuterJoin',
  'crossJoin',
  'where',
  'andWhere',
  'orWhere',
  'whereNot',
  'orWhereNot',
  'whereLike',
  'andWhereLike',
  'orWhereLike',
  'whereILike',
  'andWhereILike',
  'orWhereILike',
  'whereRaw',
  'whereWrapped',
  'havingWrapped',
  'orWhereRaw',
  'whereExists',
  'orWhereExists',
  'whereNotExists',
  'orWhereNotExists',
  'whereIn',
  'orWhereIn',
  'whereNotIn',
  'orWhereNotIn',
  'whereNull',
  'orWhereNull',
  'whereNotNull',
  'orWhereNotNull',
  'whereBetween',
  'whereNotBetween',
  'andWhereBetween',
  'andWhereNotBetween',
  'orWhereBetween',
  'orWhereNotBetween',
  'groupBy',
  'groupByRaw',
  'orderBy',
  'orderByRaw',
  'union',
  'unionAll',
  'intersect',
  'except',
  'having',
  'havingRaw',
  'orHaving',
  'orHavingRaw',
  'offset',
  'limit',
  'count',
  'countDistinct',
  'min',
  'max',
  'sum',
  'sumDistinct',
  'avg',
  'avgDistinct',
  'increment',
  'decrement',
  'first',
  'debug',
  'pluck',
  'clearSelect',
  'clearWhere',
  'clearGroup',
  'clearOrder',
  'clearHaving',
  'insert',
  'update',
  'returning',
  'del',
  'delete',
  'truncate',
  'transacting',
  'connection',

  // JSON methods

  // Json manipulation functions
  'jsonExtract',
  'jsonSet',
  'jsonInsert',
  'jsonRemove',

  // Wheres Json
  'whereJsonObject',
  'orWhereJsonObject',
  'andWhereJsonObject',
  'whereNotJsonObject',
  'orWhereNotJsonObject',
  'andWhereNotJsonObject',

  'whereJsonPath',
  'orWhereJsonPath',
  'andWhereJsonPath',

  'whereJsonSupersetOf',
  'orWhereJsonSupersetOf',
  'andWhereJsonSupersetOf',
  'whereJsonNotSupersetOf',
  'orWhereJsonNotSupersetOf',
  'andWhereJsonNotSupersetOf',

  'whereJsonSubsetOf',
  'orWhereJsonSubsetOf',
  'andWhereJsonSubsetOf',
  'whereJsonNotSubsetOf',
  'orWhereJsonNotSubsetOf',
  'andWhereJsonNotSubsetOf',
];

var baseAssignValue$1 = _baseAssignValue,
    eq = eq_1;

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue$2(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue$1(object, key, value);
  }
}

var _assignMergeValue = assignMergeValue$2;

var isArrayLike$3 = isArrayLike_1,
    isObjectLike$2 = isObjectLike_1;

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject$1(value) {
  return isObjectLike$2(value) && isArrayLike$3(value);
}

var isArrayLikeObject_1 = isArrayLikeObject$1;

var baseGetTag$1 = _baseGetTag,
    getPrototype$1 = _getPrototype,
    isObjectLike$1 = isObjectLike_1;

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto$4 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject$5(value) {
  if (!isObjectLike$1(value) || baseGetTag$1(value) != objectTag) {
    return false;
  }
  var proto = getPrototype$1(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$4.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

var isPlainObject_1 = isPlainObject$5;

/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */

function safeGet$2(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

var _safeGet = safeGet$2;

var copyObject$1 = _copyObject,
    keysIn$1 = keysIn_1;

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject$1(value) {
  return copyObject$1(value, keysIn$1(value));
}

var toPlainObject_1 = toPlainObject$1;

var assignMergeValue$1 = _assignMergeValue,
    cloneBuffer = _cloneBufferExports,
    cloneTypedArray = _cloneTypedArray,
    copyArray$1 = _copyArray,
    initCloneObject = _initCloneObject,
    isArguments$2 = isArguments_1,
    isArray$8 = isArray_1,
    isArrayLikeObject = isArrayLikeObject_1,
    isBuffer$2 = isBufferExports,
    isFunction$6 = isFunction_1,
    isObject$c = isObject_1,
    isPlainObject$4 = isPlainObject_1,
    isTypedArray$3 = isTypedArray_1,
    safeGet$1 = _safeGet,
    toPlainObject = toPlainObject_1;

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep$1(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet$1(object, key),
      srcValue = safeGet$1(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue$1(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray$8(srcValue),
        isBuff = !isArr && isBuffer$2(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray$3(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray$8(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray$1(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject$4(srcValue) || isArguments$2(srcValue)) {
      newValue = objValue;
      if (isArguments$2(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject$c(objValue) || isFunction$6(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue$1(object, key, newValue);
}

var _baseMergeDeep = baseMergeDeep$1;

var Stack = _Stack,
    assignMergeValue = _assignMergeValue,
    baseFor = _baseFor,
    baseMergeDeep = _baseMergeDeep,
    isObject$b = isObject_1,
    keysIn = keysIn_1,
    safeGet = _safeGet;

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge$1(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    stack || (stack = new Stack);
    if (isObject$b(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge$1, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

var _baseMerge = baseMerge$1;

var baseMerge = _baseMerge,
    createAssigner$1 = _createAssigner;

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge$1 = createAssigner$1(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

var merge_1 = merge$1;

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */

function baseSlice$2(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

var _baseSlice = baseSlice$2;

/** Used to match a single whitespace character. */

var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex$1(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

var _trimmedEndIndex = trimmedEndIndex$1;

var trimmedEndIndex = _trimmedEndIndex;

/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim$1(string) {
  return string
    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

var _baseTrim = baseTrim$1;

var baseTrim = _baseTrim,
    isObject$a = isObject_1,
    isSymbol = isSymbol_1;

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$4(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject$a(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$a(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var toNumber_1 = toNumber$4;

var toNumber$3 = toNumber_1;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite$1(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber$3(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

var toFinite_1 = toFinite$1;

var toFinite = toFinite_1;

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger$2(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

var toInteger_1 = toInteger$2;

var baseSlice$1 = _baseSlice,
    isIterateeCall = _isIterateeCall,
    toInteger$1 = toInteger_1;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil,
    nativeMax$1 = Math.max;

/**
 * Creates an array of elements split into groups the length of `size`.
 * If `array` can't be split evenly, the final chunk will be the remaining
 * elements.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to process.
 * @param {number} [size=1] The length of each chunk
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {Array} Returns the new array of chunks.
 * @example
 *
 * _.chunk(['a', 'b', 'c', 'd'], 2);
 * // => [['a', 'b'], ['c', 'd']]
 *
 * _.chunk(['a', 'b', 'c', 'd'], 3);
 * // => [['a', 'b', 'c'], ['d']]
 */
function chunk$1(array, size, guard) {
  if ((guard ? isIterateeCall(array, size, guard) : size === undefined)) {
    size = 1;
  } else {
    size = nativeMax$1(toInteger$1(size), 0);
  }
  var length = array == null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  var index = 0,
      resIndex = 0,
      result = Array(nativeCeil(length / size));

  while (index < length) {
    result[resIndex++] = baseSlice$1(array, index, (index += size));
  }
  return result;
}

var chunk_1 = chunk$1;

var Symbol$2 = _Symbol,
    isArguments$1 = isArguments_1,
    isArray$7 = isArray_1;

/** Built-in value references. */
var spreadableSymbol = Symbol$2 ? Symbol$2.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable$1(value) {
  return isArray$7(value) || isArguments$1(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

var _isFlattenable = isFlattenable$1;

var arrayPush = _arrayPush,
    isFlattenable = _isFlattenable;

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten$1(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten$1(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

var _baseFlatten = baseFlatten$1;

var baseFlatten = _baseFlatten;

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten$1(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}

var flatten_1 = flatten$1;

/**
 * @param {number} delay
 * @returns {Promise<void>}
 */

var delay$1 = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay));

function isString$a(value) {
  return typeof value === 'string';
}

function isNumber$3(value) {
  return typeof value === 'number';
}

function isBoolean$1(value) {
  return typeof value === 'boolean';
}

function isUndefined$1(value) {
  return typeof value === 'undefined';
}

function isObject$9(value) {
  return typeof value === 'object' && value !== null;
}

function isFunction$5(value) {
  return typeof value === 'function';
}

var is = {
  isString: isString$a,
  isNumber: isNumber$3,
  isBoolean: isBoolean$1,
  isUndefined: isUndefined$1,
  isObject: isObject$9,
  isFunction: isFunction$5,
};

const chunk = chunk_1;
const flatten = flatten_1;
const delay = delay$1;
const { isNumber: isNumber$2 } = is;

function batchInsert$1(client, tableName, batch, chunkSize = 1000) {
  let returning = undefined;
  let transaction = null;
  if (!isNumber$2(chunkSize) || chunkSize < 1) {
    throw new TypeError(`Invalid chunkSize: ${chunkSize}`);
  }
  if (!Array.isArray(batch)) {
    throw new TypeError(`Invalid batch: Expected array, got ${typeof batch}`);
  }
  const chunks = chunk(batch, chunkSize);

  const runInTransaction = (cb) => {
    if (transaction) {
      return cb(transaction);
    }
    return client.transaction(cb);
  };

  return Object.assign(
    Promise.resolve().then(async () => {
      //Next tick to ensure wrapper functions are called if needed
      await delay(1);
      return runInTransaction(async (tr) => {
        const chunksResults = [];
        for (const items of chunks) {
          chunksResults.push(await tr(tableName).insert(items, returning));
        }
        return flatten(chunksResults);
      });
    }),
    {
      returning(columns) {
        returning = columns;

        return this;
      },
      transacting(tr) {
        transaction = tr;

        return this;
      },
    }
  );
}

var batchInsert_1 = batchInsert$1;

/**
 * Sets a hidden (non-enumerable) property on the `target` object, copying it
 * from `source`.
 *
 * This is useful when we want to protect certain data from being accidentally
 * leaked through logs, also when the property is non-enumerable on the `source`
 * object and we want to ensure that it is properly copied.
 *
 * @param {object} target
 * @param {object} source - default: target
 * @param {string} propertyName - default: 'password'
 */

function setHiddenProperty$2(target, source, propertyName = 'password') {
  if (!source) {
    source = target;
  }

  Object.defineProperty(target, propertyName, {
    enumerable: false,
    value: source[propertyName],
  });
}

var security = {
  setHiddenProperty: setHiddenProperty$2,
};

const { EventEmitter: EventEmitter$5 } = eventsExports;

const { Migrator } = noop$1;
const Seeder = noop$1;
const FunctionHelper = FunctionHelper_1;
const QueryInterface = methodConstants;
const merge = merge_1;
const batchInsert = batchInsert_1;
const { isObject: isObject$8 } = is;
const { setHiddenProperty: setHiddenProperty$1 } = security;

// Javascript does not officially support "callable objects".  Instead,
// you must create a regular Function and inject properties/methods
// into it.  In other words: you can't leverage Prototype Inheritance
// to share the property/method definitions.
//
// To work around this, we're creating an Object Property Definition.
// This allow us to quickly inject everything into the `knex` function
// via the `Object.defineProperties(..)` function.  More importantly,
// it allows the same definitions to be shared across `knex` instances.
const KNEX_PROPERTY_DEFINITIONS = {
  client: {
    get() {
      return this.context.client;
    },
    set(client) {
      this.context.client = client;
    },
    configurable: true,
  },

  userParams: {
    get() {
      return this.context.userParams;
    },
    set(userParams) {
      this.context.userParams = userParams;
    },
    configurable: true,
  },

  schema: {
    get() {
      return this.client.schemaBuilder();
    },
    configurable: true,
  },

  migrate: {
    get() {
      return new Migrator(this);
    },
    configurable: true,
  },

  seed: {
    get() {
      return new Seeder();
    },
    configurable: true,
  },

  fn: {
    get() {
      return new FunctionHelper(this.client);
    },
    configurable: true,
  },
};

// `knex` instances serve as proxies around `context` objects.  So, calling
// any of these methods on the `knex` instance will forward the call to
// the `knex.context` object. This ensures that `this` will correctly refer
// to `context` within each of these methods.
const CONTEXT_METHODS = [
  'raw',
  'batchInsert',
  'transaction',
  'transactionProvider',
  'initialize',
  'destroy',
  'ref',
  'withUserParams',
  'queryBuilder',
  'disableProcessing',
  'enableProcessing',
];

for (const m of CONTEXT_METHODS) {
  KNEX_PROPERTY_DEFINITIONS[m] = {
    value: function (...args) {
      return this.context[m](...args);
    },
    configurable: true,
  };
}

function makeKnex$1(client) {
  // The object we're potentially using to kick off an initial chain.
  function knex(tableName, options) {
    return createQueryBuilder(knex.context, tableName, options);
  }

  redefineProperties(knex, client);
  return knex;
}

function initContext(knexFn) {
  const knexContext = knexFn.context || {};
  Object.assign(knexContext, {
    queryBuilder() {
      return this.client.queryBuilder();
    },

    raw() {
      return this.client.raw.apply(this.client, arguments);
    },

    batchInsert(table, batch, chunkSize = 1000) {
      return batchInsert(this, table, batch, chunkSize);
    },

    // Creates a new transaction.
    // If container is provided, returns a promise for when the transaction is resolved.
    // If container is not provided, returns a promise with a transaction that is resolved
    // when transaction is ready to be used.
    transaction(container, _config) {
      // Overload support of `transaction(config)`
      if (!_config && isObject$8(container)) {
        _config = container;
        container = null;
      }

      const config = Object.assign({}, _config);
      config.userParams = this.userParams || {};
      if (config.doNotRejectOnRollback === undefined) {
        config.doNotRejectOnRollback = true;
      }

      return this._transaction(container, config);
    },

    // Internal method that actually establishes the Transaction.  It makes no assumptions
    // about the `config` or `outerTx`, and expects the caller to handle these details.
    _transaction(container, config, outerTx = null) {
      if (container) {
        const trx = this.client.transaction(container, config, outerTx);
        return trx;
      } else {
        return new Promise((resolve, reject) => {
          this.client.transaction(resolve, config, outerTx).catch(reject);
        });
      }
    },

    transactionProvider(config) {
      let trx;
      return () => {
        if (!trx) {
          trx = this.transaction(undefined, config);
        }
        return trx;
      };
    },

    // Typically never needed, initializes the pool for a knex client.
    initialize(config) {
      return this.client.initializePool(config);
    },

    // Convenience method for tearing down the pool.
    destroy(callback) {
      return this.client.destroy(callback);
    },

    ref(ref) {
      return this.client.ref(ref);
    },

    // Do not document this as public API until naming and API is improved for general consumption
    // This method exists to disable processing of internal queries in migrations
    disableProcessing() {
      if (this.userParams.isProcessingDisabled) {
        return;
      }
      this.userParams.wrapIdentifier = this.client.config.wrapIdentifier;
      this.userParams.postProcessResponse =
        this.client.config.postProcessResponse;
      this.client.config.wrapIdentifier = null;
      this.client.config.postProcessResponse = null;
      this.userParams.isProcessingDisabled = true;
    },

    // Do not document this as public API until naming and API is improved for general consumption
    // This method exists to enable execution of non-internal queries with consistent identifier naming in migrations
    enableProcessing() {
      if (!this.userParams.isProcessingDisabled) {
        return;
      }
      this.client.config.wrapIdentifier = this.userParams.wrapIdentifier;
      this.client.config.postProcessResponse =
        this.userParams.postProcessResponse;
      this.userParams.isProcessingDisabled = false;
    },

    withUserParams(params) {
      const knexClone = shallowCloneFunction(knexFn); // We need to include getters in our clone
      if (this.client) {
        knexClone.client = Object.create(this.client.constructor.prototype); // Clone client to avoid leaking listeners that are set on it
        merge(knexClone.client, this.client);
        knexClone.client.config = Object.assign({}, this.client.config); // Clone client config to make sure they can be modified independently

        if (this.client.config.password) {
          setHiddenProperty$1(knexClone.client.config, this.client.config);
        }
      }

      redefineProperties(knexClone, knexClone.client);
      _copyEventListeners('query', knexFn, knexClone);
      _copyEventListeners('query-error', knexFn, knexClone);
      _copyEventListeners('query-response', knexFn, knexClone);
      _copyEventListeners('start', knexFn, knexClone);
      knexClone.userParams = params;
      return knexClone;
    },
  });

  if (!knexFn.context) {
    knexFn.context = knexContext;
  }
}

function _copyEventListeners(eventName, sourceKnex, targetKnex) {
  const listeners = sourceKnex.listeners(eventName);
  listeners.forEach((listener) => {
    targetKnex.on(eventName, listener);
  });
}

function redefineProperties(knex, client) {
  // Allow chaining methods from the root object, before
  // any other information is specified.
  //
  // TODO: `QueryBuilder.extend(..)` allows new QueryBuilder
  //       methods to be introduced via external components.
  //       As a side-effect, it also pushes the new method names
  //       into the `QueryInterface` array.
  //
  //       The Problem: due to the way the code is currently
  //       structured, these new methods cannot be retroactively
  //       injected into existing `knex` instances!  As a result,
  //       some `knex` instances will support the methods, and
  //       others will not.
  //
  //       We should revisit this once we figure out the desired
  //       behavior / usage.  For instance: do we really want to
  //       allow external components to directly manipulate `knex`
  //       data structures?  Or, should we come up w/ a different
  //       approach that avoids side-effects / mutation?
  //
  //      (FYI: I noticed this issue because I attempted to integrate
  //       this logic directly into the `KNEX_PROPERTY_DEFINITIONS`
  //       construction.  However, `KNEX_PROPERTY_DEFINITIONS` is
  //       constructed before any `knex` instances are created.
  //       As a result, the method extensions were missing from all
  //       `knex` instances.)
  for (let i = 0; i < QueryInterface.length; i++) {
    const method = QueryInterface[i];
    knex[method] = function () {
      const builder = this.queryBuilder();
      return builder[method].apply(builder, arguments);
    };
  }

  Object.defineProperties(knex, KNEX_PROPERTY_DEFINITIONS);

  initContext(knex);
  knex.client = client;
  knex.userParams = {};

  // Hook up the "knex" object as an EventEmitter.
  const ee = new EventEmitter$5();
  for (const key in ee) {
    knex[key] = ee[key];
  }

  // Unfortunately, something seems to be broken in Node 6 and removing events from a clone also mutates original Knex,
  // which is highly undesirable
  if (knex._internalListeners) {
    knex._internalListeners.forEach(({ eventName, listener }) => {
      knex.client.removeListener(eventName, listener); // Remove duplicates for copies
    });
  }
  knex._internalListeners = [];

  // Passthrough all "start" and "query" events to the knex object.
  _addInternalListener(knex, 'start', (obj) => {
    knex.emit('start', obj);
  });
  _addInternalListener(knex, 'query', (obj) => {
    knex.emit('query', obj);
  });
  _addInternalListener(knex, 'query-error', (err, obj) => {
    knex.emit('query-error', err, obj);
  });
  _addInternalListener(knex, 'query-response', (response, obj, builder) => {
    knex.emit('query-response', response, obj, builder);
  });
}

function _addInternalListener(knex, eventName, listener) {
  knex.client.on(eventName, listener);
  knex._internalListeners.push({
    eventName,
    listener,
  });
}

function createQueryBuilder(knexContext, tableName, options) {
  const qb = knexContext.queryBuilder();
  if (!tableName)
    knexContext.client.logger.warn(
      'calling knex without a tableName is deprecated. Use knex.queryBuilder() instead.'
    );
  return tableName ? qb.table(tableName, options) : qb;
}

function shallowCloneFunction(originalFunction) {
  const fnContext = Object.create(
    Object.getPrototypeOf(originalFunction),
    Object.getOwnPropertyDescriptors(originalFunction)
  );

  const knexContext = {};
  const knexFnWrapper = (tableName, options) => {
    return createQueryBuilder(knexContext, tableName, options);
  };

  const clonedFunction = knexFnWrapper.bind(fnContext);
  Object.assign(clonedFunction, originalFunction);
  clonedFunction.context = knexContext;
  return clonedFunction;
}

var makeKnex_1 = makeKnex$1;

const noop = noop$1;

const finallyMixin$2 = (prototype) =>
  Object.assign(prototype, {
    finally(onFinally) {
      return this.then().finally(onFinally);
    },
  });

// FYI: Support for `Promise.prototype.finally` was not introduced until Node 9.
//      Therefore, Knex will need to conditionally inject support for `.finally(..)`
//      until support for Node 8 is officially dropped.
var finallyMixin_1 = Promise.prototype.finally ? finallyMixin$2 : noop;

// Transaction
// -------
const { EventEmitter: EventEmitter$4 } = eventsExports;
const Debug = browserExports;
const uniqueId$1 = uniqueId_1;
const { callbackify: callbackify$1 } = util;

const makeKnex = makeKnex_1;
const { timeout, KnexTimeoutError: KnexTimeoutError$1 } = timeout$3;
const finallyMixin$1 = finallyMixin_1;

const debug$3 = Debug('knex:tx');

// FYI: This is defined as a function instead of a constant so that
//      each Transactor can have its own copy of the default config.
//      This will minimize the impact of bugs that might be introduced
//      if a Transactor ever mutates its config.
function DEFAULT_CONFIG() {
  return {
    userParams: {},
    doNotRejectOnRollback: true,
  };
}
// These aren't supported in sqlite3 which is serialized already so it's as
// safe as reasonable, except for a special read_uncommitted pragma
const validIsolationLevels = [
  // Doesn't really work in postgres, it treats it as read committed
  'read uncommitted',
  'read committed',
  'snapshot',
  // snapshot and repeatable read are basically the same, most "repeatable
  // read" implementations are actually "snapshot" also known as Multi Version
  // Concurrency Control (MVCC). Mssql's repeatable read doesn't stop
  // repeated reads for inserts as it uses a pessimistic locking system so
  // you should probably use 'snapshot' to stop read skew.
  'repeatable read',
  // mysql pretends to have serializable, but it is not
  'serializable',
];

// Acts as a facade for a Promise, keeping the internal state
// and managing any child transactions.
let Transaction$3 = class Transaction extends EventEmitter$4 {
  constructor(client, container, config = DEFAULT_CONFIG(), outerTx = null) {
    super();
    this.userParams = config.userParams;
    this.doNotRejectOnRollback = config.doNotRejectOnRollback;

    const txid = (this.txid = uniqueId$1('trx'));

    this.client = client;
    this.logger = client.logger;
    this.outerTx = outerTx;
    this.trxClient = undefined;
    this._completed = false;
    this._debug = client.config && client.config.debug;

    this.readOnly = config.readOnly;
    if (config.isolationLevel) {
      this.setIsolationLevel(config.isolationLevel);
    }

    debug$3(
      '%s: Starting %s transaction',
      txid,
      outerTx ? 'nested' : 'top level'
    );

    // `this` can potentially serve as an `outerTx` for another
    // Transaction.  So, go ahead and establish `_lastChild` now.
    this._lastChild = Promise.resolve();

    const _previousSibling = outerTx ? outerTx._lastChild : Promise.resolve();

    // FYI: As you will see in a moment, this Promise will be used to construct
    //      2 separate Promise Chains.  This ensures that each Promise Chain
    //      can establish its error-handling semantics without interfering
    //      with the other Promise Chain.
    const basePromise = _previousSibling.then(() =>
      this._evaluateContainer(config, container)
    );

    // FYI: This is the Promise Chain for EXTERNAL use.  It ensures that the
    //      caller must handle any exceptions that result from `basePromise`.
    this._promise = basePromise.then((x) => x);

    if (outerTx) {
      // FYI: This is the Promise Chain for INTERNAL use.  It serves as a signal
      //      for when the next sibling should begin its execution.  Therefore,
      //      exceptions are caught and ignored.
      outerTx._lastChild = basePromise.catch(() => {});
    }
  }

  isCompleted() {
    return (
      this._completed || (this.outerTx && this.outerTx.isCompleted()) || false
    );
  }

  begin(conn) {
    const trxMode = [
      this.isolationLevel ? `ISOLATION LEVEL ${this.isolationLevel}` : '',
      this.readOnly ? 'READ ONLY' : '',
    ]
      .join(' ')
      .trim();

    if (trxMode.length === 0) {
      return this.query(conn, 'BEGIN;');
    }

    return this.query(conn, `SET TRANSACTION ${trxMode};`).then(() =>
      this.query(conn, 'BEGIN;')
    );
  }

  savepoint(conn) {
    return this.query(conn, `SAVEPOINT ${this.txid};`);
  }

  commit(conn, value) {
    return this.query(conn, 'COMMIT;', 1, value);
  }

  release(conn, value) {
    return this.query(conn, `RELEASE SAVEPOINT ${this.txid};`, 1, value);
  }

  setIsolationLevel(isolationLevel) {
    if (!validIsolationLevels.includes(isolationLevel)) {
      throw new Error(
        `Invalid isolationLevel, supported isolation levels are: ${JSON.stringify(
          validIsolationLevels
        )}`
      );
    }
    this.isolationLevel = isolationLevel;
    return this;
  }

  rollback(conn, error) {
    return timeout(this.query(conn, 'ROLLBACK', 2, error), 5000).catch(
      (err) => {
        if (!(err instanceof KnexTimeoutError$1)) {
          return Promise.reject(err);
        }
        this._rejecter(error);
      }
    );
  }

  rollbackTo(conn, error) {
    return timeout(
      this.query(conn, `ROLLBACK TO SAVEPOINT ${this.txid}`, 2, error),
      5000
    ).catch((err) => {
      if (!(err instanceof KnexTimeoutError$1)) {
        return Promise.reject(err);
      }
      this._rejecter(error);
    });
  }

  query(conn, sql, status, value) {
    const q = this.trxClient
      .query(conn, sql)
      .catch((err) => {
        status = 2;
        value = err;
        this._completed = true;
        debug$3('%s error running transaction query', this.txid);
      })
      .then((res) => {
        if (status === 1) {
          this._resolver(value);
        }
        if (status === 2) {
          if (value === undefined) {
            if (this.doNotRejectOnRollback && /^ROLLBACK\b/i.test(sql)) {
              this._resolver();
              return;
            }

            value = new Error(`Transaction rejected with non-error: ${value}`);
          }
          this._rejecter(value);
        }
        return res;
      });
    if (status === 1 || status === 2) {
      this._completed = true;
    }
    return q;
  }

  debug(enabled) {
    this._debug = arguments.length ? enabled : true;
    return this;
  }

  async _evaluateContainer(config, container) {
    return this.acquireConnection(config, (connection) => {
      const trxClient = (this.trxClient = makeTxClient(
        this,
        this.client,
        connection
      ));
      const init = this.client.transacting
        ? this.savepoint(connection)
        : this.begin(connection);
      const executionPromise = new Promise((resolver, rejecter) => {
        this._resolver = resolver;
        this._rejecter = rejecter;
      });

      init
        .then(() => {
          return makeTransactor(this, connection, trxClient);
        })
        .then((transactor) => {
          transactor.executionPromise = executionPromise;

          // If we've returned a "thenable" from the transaction container, assume
          // the rollback and commit are chained to this object's success / failure.
          // Directly thrown errors are treated as automatic rollbacks.
          let result;
          try {
            result = container(transactor);
          } catch (err) {
            result = Promise.reject(err);
          }
          if (result && result.then && typeof result.then === 'function') {
            result
              .then((val) => {
                return transactor.commit(val);
              })
              .catch((err) => {
                return transactor.rollback(err);
              });
          }
          return null;
        })
        .catch((e) => {
          return this._rejecter(e);
        });

      return executionPromise;
    });
  }

  // Acquire a connection and create a disposer - either using the one passed
  // via config or getting one off the client. The disposer will be called once
  // the original promise is marked completed.
  async acquireConnection(config, cb) {
    const configConnection = config && config.connection;
    const connection =
      configConnection || (await this.client.acquireConnection());

    try {
      connection.__knexTxId = this.txid;
      return await cb(connection);
    } finally {
      if (!configConnection) {
        debug$3('%s: releasing connection', this.txid);
        this.client.releaseConnection(connection);
      } else {
        debug$3('%s: not releasing external connection', this.txid);
      }
    }
  }

  then(onResolve, onReject) {
    return this._promise.then(onResolve, onReject);
  }

  catch(...args) {
    return this._promise.catch(...args);
  }

  asCallback(cb) {
    callbackify$1(() => this._promise)(cb);
    return this._promise;
  }
};
finallyMixin$1(Transaction$3.prototype);

// The transactor is a full featured knex object, with a "commit", a "rollback"
// and a "savepoint" function. The "savepoint" is just sugar for creating a new
// transaction. If the rollback is run inside a savepoint, it rolls back to the
// last savepoint - otherwise it rolls back the transaction.
function makeTransactor(trx, connection, trxClient) {
  const transactor = makeKnex(trxClient);

  transactor.context.withUserParams = () => {
    throw new Error(
      'Cannot set user params on a transaction - it can only inherit params from main knex instance'
    );
  };

  transactor.isTransaction = true;
  transactor.userParams = trx.userParams || {};

  transactor.context.transaction = function (container, options) {
    if (!options) {
      options = { doNotRejectOnRollback: true };
    } else if (options.doNotRejectOnRollback === undefined) {
      options.doNotRejectOnRollback = true;
    }

    return this._transaction(container, options, trx);
  };

  transactor.savepoint = function (container, options) {
    return transactor.transaction(container, options);
  };

  if (trx.client.transacting) {
    transactor.commit = (value) => trx.release(connection, value);
    transactor.rollback = (error) => trx.rollbackTo(connection, error);
  } else {
    transactor.commit = (value) => trx.commit(connection, value);
    transactor.rollback = (error) => trx.rollback(connection, error);
  }

  transactor.isCompleted = () => trx.isCompleted();

  return transactor;
}

// We need to make a client object which always acquires the same
// connection and does not release back into the pool.
function makeTxClient(trx, client, connection) {
  const trxClient = Object.create(client.constructor.prototype);
  trxClient.version = client.version;
  trxClient.config = client.config;
  trxClient.driver = client.driver;
  trxClient.connectionSettings = client.connectionSettings;
  trxClient.transacting = true;
  trxClient.valueForUndefined = client.valueForUndefined;
  trxClient.logger = client.logger;

  trxClient.on('start', function (arg) {
    trx.emit('start', arg);
    client.emit('start', arg);
  });

  trxClient.on('query', function (arg) {
    trx.emit('query', arg);
    client.emit('query', arg);
  });

  trxClient.on('query-error', function (err, obj) {
    trx.emit('query-error', err, obj);
    client.emit('query-error', err, obj);
  });

  trxClient.on('query-response', function (response, obj, builder) {
    trx.emit('query-response', response, obj, builder);
    client.emit('query-response', response, obj, builder);
  });

  const _query = trxClient.query;
  trxClient.query = function (conn, obj) {
    const completed = trx.isCompleted();
    return new Promise(function (resolve, reject) {
      try {
        if (conn !== connection)
          throw new Error('Invalid connection for transaction query.');
        if (completed) completedError(trx, obj);
        resolve(_query.call(trxClient, conn, obj));
      } catch (e) {
        reject(e);
      }
    });
  };
  const _stream = trxClient.stream;
  trxClient.stream = function (conn, obj, stream, options) {
    const completed = trx.isCompleted();
    return new Promise(function (resolve, reject) {
      try {
        if (conn !== connection)
          throw new Error('Invalid connection for transaction query.');
        if (completed) completedError(trx, obj);
        resolve(_stream.call(trxClient, conn, obj, stream, options));
      } catch (e) {
        reject(e);
      }
    });
  };
  trxClient.acquireConnection = function () {
    return Promise.resolve(connection);
  };
  trxClient.releaseConnection = function () {
    return Promise.resolve();
  };

  return trxClient;
}

function completedError(trx, obj) {
  const sql = typeof obj === 'string' ? obj : obj && obj.sql;
  debug$3('%s: Transaction completed: %s', trx.txid, sql);
  throw new Error(
    'Transaction query already complete, run with DEBUG=knex:tx for more info'
  );
}

var transaction = Transaction$3;

const _debugQuery = browserExports('knex:query');
const debugBindings$2 = browserExports('knex:bindings');
const debugQuery = (sql, txId) => _debugQuery(sql.replace(/%/g, '%%'), txId);
const { isString: isString$9 } = is;

function formatQuery$1(sql, bindings, timeZone, client) {
  bindings = bindings == null ? [] : [].concat(bindings);
  let index = 0;
  return sql.replace(/\\?\?/g, (match) => {
    if (match === '\\?') {
      return '?';
    }
    if (index === bindings.length) {
      return match;
    }
    const value = bindings[index++];
    return client._escapeBinding(value, { timeZone });
  });
}

function enrichQueryObject$1(connection, queryParam, client) {
  const queryObject = isString$9(queryParam) ? { sql: queryParam } : queryParam;

  queryObject.bindings = client.prepBindings(queryObject.bindings);
  queryObject.sql = client.positionBindings(queryObject.sql);

  const { __knexUid, __knexTxId } = connection;

  client.emit('query', Object.assign({ __knexUid, __knexTxId }, queryObject));
  debugQuery(queryObject.sql, __knexTxId);
  debugBindings$2(queryObject.bindings, __knexTxId);

  return queryObject;
}

function executeQuery$1(connection, queryObject, client) {
  return client._query(connection, queryObject).catch((err) => {
    if (client.config && client.config.compileSqlOnError === false) {
      err.message = queryObject.sql + ' - ' + err.message;
    } else {
      err.message =
        formatQuery$1(queryObject.sql, queryObject.bindings, undefined, client) +
        ' - ' +
        err.message;
    }
    client.emit(
      'query-error',
      err,
      Object.assign(
        { __knexUid: connection.__knexUid, __knexTxId: connection.__knexUid },
        queryObject
      )
    );
    throw err;
  });
}

var queryExecutioner = {
  enrichQueryObject: enrichQueryObject$1,
  executeQuery: executeQuery$1,
  formatQuery: formatQuery$1,
};

var assignValue$1 = _assignValue,
    copyObject = _copyObject,
    createAssigner = _createAssigner,
    isArrayLike$2 = isArrayLike_1,
    isPrototype$1 = _isPrototype,
    keys$1 = keys_1;

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign$7 = createAssigner(function(object, source) {
  if (isPrototype$1(source) || isArrayLike$2(source)) {
    copyObject(source, keys$1(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty$3.call(source, key)) {
      assignValue$1(object, key, source[key]);
    }
  }
});

var assign_1 = assign$7;

var baseClone = _baseClone;

/** Used to compose bitmasks for cloning. */
var CLONE_SYMBOLS_FLAG = 4;

/**
 * Creates a shallow clone of `value`.
 *
 * **Note:** This method is loosely based on the
 * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
 * and supports cloning arrays, array buffers, booleans, date objects, maps,
 * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
 * arrays. The own enumerable properties of `arguments` objects are cloned
 * as plain objects. An empty object is returned for uncloneable values such
 * as error objects, functions, DOM nodes, and WeakMaps.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to clone.
 * @returns {*} Returns the cloned value.
 * @see _.cloneDeep
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var shallow = _.clone(objects);
 * console.log(shallow[0] === objects[0]);
 * // => true
 */
function clone$2(value) {
  return baseClone(value, CLONE_SYMBOLS_FLAG);
}

var clone_1 = clone$2;

var identity$1 = identity_1;

/**
 * Casts `value` to `identity` if it's not a function.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Function} Returns cast function.
 */
function castFunction$1(value) {
  return typeof value == 'function' ? value : identity$1;
}

var _castFunction = castFunction$1;

var arrayEach$1 = _arrayEach,
    baseEach$3 = _baseEach,
    castFunction = _castFunction,
    isArray$6 = isArray_1;

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _.forEach([1, 2], function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = isArray$6(collection) ? arrayEach$1 : baseEach$3;
  return func(collection, castFunction(iteratee));
}

var forEach_1 = forEach;

var each$2 = forEach_1;

var baseKeys = _baseKeys,
    getTag$1 = _getTag,
    isArguments = isArguments_1,
    isArray$5 = isArray_1,
    isArrayLike$1 = isArrayLike_1,
    isBuffer$1 = isBufferExports,
    isPrototype = _isPrototype,
    isTypedArray$2 = isTypedArray_1;

/** `Object#toString` result references. */
var mapTag$1 = '[object Map]',
    setTag$1 = '[object Set]';

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty$4(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike$1(value) &&
      (isArray$5(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        isBuffer$1(value) || isTypedArray$2(value) || isArguments(value))) {
    return !value.length;
  }
  var tag = getTag$1(value);
  if (tag == mapTag$1 || tag == setTag$1) {
    return !value.size;
  }
  if (isPrototype(value)) {
    return !baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty$2.call(value, key)) {
      return false;
    }
  }
  return true;
}

var isEmpty_1 = isEmpty$4;

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */

function last$1(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

var last_1 = last$1;

var baseEach$2 = _baseEach;

/**
 * The base implementation of `_.filter` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function baseFilter$1(collection, predicate) {
  var result = [];
  baseEach$2(collection, function(value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

var _baseFilter = baseFilter$1;

/** Error message constants. */

var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that negates the result of the predicate `func`. The
 * `func` predicate is invoked with the `this` binding and arguments of the
 * created function.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Function
 * @param {Function} predicate The predicate to negate.
 * @returns {Function} Returns the new negated function.
 * @example
 *
 * function isEven(n) {
 *   return n % 2 == 0;
 * }
 *
 * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
 * // => [1, 3, 5]
 */
function negate$2(predicate) {
  if (typeof predicate != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  return function() {
    var args = arguments;
    switch (args.length) {
      case 0: return !predicate.call(this);
      case 1: return !predicate.call(this, args[0]);
      case 2: return !predicate.call(this, args[0], args[1]);
      case 3: return !predicate.call(this, args[0], args[1], args[2]);
    }
    return !predicate.apply(this, args);
  };
}

var negate_1 = negate$2;

var arrayFilter = _arrayFilter,
    baseFilter = _baseFilter,
    baseIteratee$5 = _baseIteratee,
    isArray$4 = isArray_1,
    negate$1 = negate_1;

/**
 * The opposite of `_.filter`; this method returns the elements of `collection`
 * that `predicate` does **not** return truthy for.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 * @see _.filter
 * @example
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': false },
 *   { 'user': 'fred',   'age': 40, 'active': true }
 * ];
 *
 * _.reject(users, function(o) { return !o.active; });
 * // => objects for ['fred']
 *
 * // The `_.matches` iteratee shorthand.
 * _.reject(users, { 'age': 40, 'active': true });
 * // => objects for ['barney']
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.reject(users, ['active', false]);
 * // => objects for ['fred']
 *
 * // The `_.property` iteratee shorthand.
 * _.reject(users, 'active');
 * // => objects for ['barney']
 */
function reject$1(collection, predicate) {
  var func = isArray$4(collection) ? arrayFilter : baseFilter;
  return func(collection, negate$1(baseIteratee$5(predicate)));
}

var reject_1 = reject$1;

var baseSlice = _baseSlice;

/**
 * Gets all but the first element of `array`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * _.tail([1, 2, 3]);
 * // => [2, 3]
 */
function tail$4(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseSlice(array, 1, length) : [];
}

var tail_1 = tail$4;

var baseGetTag = _baseGetTag,
    isArray$3 = isArray_1,
    isObjectLike = isObjectLike_1;

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString$8(value) {
  return typeof value == 'string' ||
    (!isArray$3(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}

var isString_1 = isString$8;

/**
 * Converts `iterator` to an array.
 *
 * @private
 * @param {Object} iterator The iterator to convert.
 * @returns {Array} Returns the converted array.
 */

function iteratorToArray$1(iterator) {
  var data,
      result = [];

  while (!(data = iterator.next()).done) {
    result.push(data.value);
  }
  return result;
}

var _iteratorToArray = iteratorToArray$1;

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */

function asciiToArray$1(string) {
  return string.split('');
}

var _asciiToArray = asciiToArray$1;

/** Used to compose unicode character classes. */

var rsAstralRange$1 = '\\ud800-\\udfff',
    rsComboMarksRange$1 = '\\u0300-\\u036f',
    reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange$1 = '\\u20d0-\\u20ff',
    rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1,
    rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ$1 = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ$1 + rsAstralRange$1  + rsComboRange$1 + rsVarRange$1 + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode$1(string) {
  return reHasUnicode.test(string);
}

var _hasUnicode = hasUnicode$1;

/** Used to compose unicode character classes. */

var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray$1(string) {
  return string.match(reUnicode) || [];
}

var _unicodeToArray = unicodeToArray$1;

var asciiToArray = _asciiToArray,
    hasUnicode = _hasUnicode,
    unicodeToArray = _unicodeToArray;

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray$1(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

var _stringToArray = stringToArray$1;

var arrayMap$1 = _arrayMap;

/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues$1(object, props) {
  return arrayMap$1(props, function(key) {
    return object[key];
  });
}

var _baseValues = baseValues$1;

var baseValues = _baseValues,
    keys = keys_1;

/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values$1(object) {
  return object == null ? [] : baseValues(object, keys(object));
}

var values_1 = values$1;

var Symbol$1 = _Symbol,
    copyArray = _copyArray,
    getTag = _getTag,
    isArrayLike = isArrayLike_1,
    isString$7 = isString_1,
    iteratorToArray = _iteratorToArray,
    mapToArray = _mapToArray,
    setToArray = _setToArray,
    stringToArray = _stringToArray,
    values = values_1;

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/** Built-in value references. */
var symIterator = Symbol$1 ? Symbol$1.iterator : undefined;

/**
 * Converts `value` to an array.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Array} Returns the converted array.
 * @example
 *
 * _.toArray({ 'a': 1, 'b': 2 });
 * // => [1, 2]
 *
 * _.toArray('abc');
 * // => ['a', 'b', 'c']
 *
 * _.toArray(1);
 * // => []
 *
 * _.toArray(null);
 * // => []
 */
function toArray$4(value) {
  if (!value) {
    return [];
  }
  if (isArrayLike(value)) {
    return isString$7(value) ? stringToArray(value) : copyArray(value);
  }
  if (symIterator && value[symIterator]) {
    return iteratorToArray(value[symIterator]());
  }
  var tag = getTag(value),
      func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values);

  return func(value);
}

var toArray_1 = toArray$4;

// The client names we'll allow in the `{name: lib}` pairing.
const CLIENT_ALIASES$1 = Object.freeze({
  pg: 'postgres',
  postgresql: 'postgres',
  sqlite: 'sqlite3',
});

const SUPPORTED_CLIENTS = Object.freeze(
  [
    'mssql',
    'mysql',
    'mysql2',
    'oracledb',
    'postgres',
    'pgnative',
    'redshift',
    'sqlite3',
    'cockroachdb',
    'better-sqlite3',
  ].concat(Object.keys(CLIENT_ALIASES$1))
);

const DRIVER_NAMES = Object.freeze({
  MsSQL: 'mssql',
  MySQL: 'mysql',
  MySQL2: 'mysql2',
  Oracle: 'oracledb',
  PostgreSQL: 'pg',
  PgNative: 'pgnative',
  Redshift: 'pg-redshift',
  SQLite: 'sqlite3',
  CockroachDB: 'cockroachdb',
  BetterSQLite3: 'better-sqlite3',
});

const POOL_CONFIG_OPTIONS$1 = Object.freeze([
  'maxWaitingClients',
  'testOnBorrow',
  'fifo',
  'priorityRange',
  'autostart',
  'evictionRunIntervalMillis',
  'numTestsPerRun',
  'softIdleTimeoutMillis',
  'Promise',
]);

/**
 * Regex that only matches comma's in strings that aren't wrapped in parentheses. Can be used to
 * safely split strings like `id int, name string, body text, primary key (id, name)` into definition
 * rows
 */
const COMMA_NO_PAREN_REGEX = /,[\s](?![^(]*\))/g;

var constants$1 = {
  CLIENT_ALIASES: CLIENT_ALIASES$1,
  SUPPORTED_CLIENTS,
  POOL_CONFIG_OPTIONS: POOL_CONFIG_OPTIONS$1,
  COMMA_NO_PAREN_REGEX,
  DRIVER_NAMES,
};

const isPlainObject$3 = isPlainObject_1;
const isTypedArray$1 = isTypedArray_1;
const { CLIENT_ALIASES } = constants$1;
const { isFunction: isFunction$4 } = is;

// Check if the first argument is an array, otherwise uses all arguments as an
// array.
function normalizeArr$2(...args) {
  if (Array.isArray(args[0])) {
    return args[0];
  }

  return args;
}

function containsUndefined(mixed) {
  let argContainsUndefined = false;

  if (isTypedArray$1(mixed)) return false;

  if (mixed && isFunction$4(mixed.toSQL)) {
    //Any QueryBuilder or Raw will automatically be validated during compile.
    return argContainsUndefined;
  }

  if (Array.isArray(mixed)) {
    for (let i = 0; i < mixed.length; i++) {
      if (argContainsUndefined) break;
      argContainsUndefined = containsUndefined(mixed[i]);
    }
  } else if (isPlainObject$3(mixed)) {
    Object.keys(mixed).forEach((key) => {
      if (!argContainsUndefined) {
        argContainsUndefined = containsUndefined(mixed[key]);
      }
    });
  } else {
    argContainsUndefined = mixed === undefined;
  }

  return argContainsUndefined;
}

function getUndefinedIndices(mixed) {
  const indices = [];

  if (Array.isArray(mixed)) {
    mixed.forEach((item, index) => {
      if (containsUndefined(item)) {
        indices.push(index);
      }
    });
  } else if (isPlainObject$3(mixed)) {
    Object.keys(mixed).forEach((key) => {
      if (containsUndefined(mixed[key])) {
        indices.push(key);
      }
    });
  } else {
    indices.push(0);
  }

  return indices;
}

function addQueryContext$3(Target) {
  // Stores or returns (if called with no arguments) context passed to
  // wrapIdentifier and postProcessResponse hooks
  Target.prototype.queryContext = function (context) {
    if (context === undefined) {
      return this._queryContext;
    }
    this._queryContext = context;
    return this;
  };
}

function resolveClientNameWithAliases(clientName) {
  return CLIENT_ALIASES[clientName] || clientName;
}

function toNumber$2(val, fallback) {
  if (val === undefined || val === null) return fallback;
  const number = parseInt(val, 10);
  return isNaN(number) ? fallback : number;
}

var helpers$7 = {
  addQueryContext: addQueryContext$3,
  containsUndefined,
  getUndefinedIndices,
  normalizeArr: normalizeArr$2,
  resolveClientNameWithAliases,
  toNumber: toNumber$2,
};

const assert$2 = require$$0;

// JoinClause
// -------

function getClauseFromArguments(compilerType, bool, first, operator, second) {
  if (typeof first === 'function') {
    return {
      type: 'onWrapped',
      value: first,
      bool: bool,
    };
  }

  switch (arguments.length) {
    case 3:
      return { type: 'onRaw', value: first, bool };
    case 4:
      return {
        type: compilerType,
        column: first,
        operator: '=',
        value: operator,
        bool,
      };
    default:
      return {
        type: compilerType,
        column: first,
        operator,
        value: second,
        bool,
      };
  }
}

// The "JoinClause" is an object holding any necessary info about a join,
// including the type, and any associated tables & columns being joined.
let JoinClause$2 = class JoinClause {
  constructor(table, type, schema) {
    this.schema = schema;
    this.table = table;
    this.joinType = type;
    this.and = this;
    this.clauses = [];
  }

  get or() {
    return this._bool('or');
  }

  // Adds an "on" clause to the current join object.
  on(first) {
    if (typeof first === 'object' && typeof first.toSQL !== 'function') {
      const keys = Object.keys(first);
      let i = -1;
      const method = this._bool() === 'or' ? 'orOn' : 'on';
      while (++i < keys.length) {
        this[method](keys[i], first[keys[i]]);
      }
      return this;
    }

    const data = getClauseFromArguments('onBasic', this._bool(), ...arguments);

    if (data) {
      this.clauses.push(data);
    }

    return this;
  }

  // Adds an "or on" clause to the current join object.
  orOn(first, operator, second) {
    return this._bool('or').on.apply(this, arguments);
  }

  onJsonPathEquals(columnFirst, jsonPathFirst, columnSecond, jsonPathSecond) {
    this.clauses.push({
      type: 'onJsonPathEquals',
      columnFirst: columnFirst,
      jsonPathFirst: jsonPathFirst,
      columnSecond: columnSecond,
      jsonPathSecond: jsonPathSecond,
      bool: this._bool(),
      not: this._not(),
    });
    return this;
  }

  orOnJsonPathEquals(columnFirst, jsonPathFirst, columnSecond, jsonPathSecond) {
    return this._bool('or').onJsonPathEquals.apply(this, arguments);
  }

  // Adds a "using" clause to the current join.
  using(column) {
    return this.clauses.push({ type: 'onUsing', column, bool: this._bool() });
  }

  onVal(first) {
    if (typeof first === 'object' && typeof first.toSQL !== 'function') {
      const keys = Object.keys(first);
      let i = -1;
      const method = this._bool() === 'or' ? 'orOnVal' : 'onVal';
      while (++i < keys.length) {
        this[method](keys[i], first[keys[i]]);
      }
      return this;
    }

    const data = getClauseFromArguments('onVal', this._bool(), ...arguments);

    if (data) {
      this.clauses.push(data);
    }

    return this;
  }

  andOnVal() {
    return this.onVal(...arguments);
  }

  orOnVal() {
    return this._bool('or').onVal(...arguments);
  }

  onBetween(column, values) {
    assert$2(
      Array.isArray(values),
      'The second argument to onBetween must be an array.'
    );
    assert$2(
      values.length === 2,
      'You must specify 2 values for the onBetween clause'
    );
    this.clauses.push({
      type: 'onBetween',
      column,
      value: values,
      bool: this._bool(),
      not: this._not(),
    });
    return this;
  }

  onNotBetween(column, values) {
    return this._not(true).onBetween(column, values);
  }

  orOnBetween(column, values) {
    return this._bool('or').onBetween(column, values);
  }

  orOnNotBetween(column, values) {
    return this._bool('or')._not(true).onBetween(column, values);
  }

  onIn(column, values) {
    if (Array.isArray(values) && values.length === 0) return this.on(1, '=', 0);
    this.clauses.push({
      type: 'onIn',
      column,
      value: values,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  onNotIn(column, values) {
    return this._not(true).onIn(column, values);
  }

  orOnIn(column, values) {
    return this._bool('or').onIn(column, values);
  }

  orOnNotIn(column, values) {
    return this._bool('or')._not(true).onIn(column, values);
  }

  onNull(column) {
    this.clauses.push({
      type: 'onNull',
      column,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  orOnNull(callback) {
    return this._bool('or').onNull(callback);
  }

  onNotNull(callback) {
    return this._not(true).onNull(callback);
  }

  orOnNotNull(callback) {
    return this._not(true)._bool('or').onNull(callback);
  }

  onExists(callback) {
    this.clauses.push({
      type: 'onExists',
      value: callback,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  orOnExists(callback) {
    return this._bool('or').onExists(callback);
  }

  onNotExists(callback) {
    return this._not(true).onExists(callback);
  }

  orOnNotExists(callback) {
    return this._not(true)._bool('or').onExists(callback);
  }

  // Explicitly set the type of join, useful within a function when creating a grouped join.
  type(type) {
    this.joinType = type;
    return this;
  }

  _bool(bool) {
    if (arguments.length === 1) {
      this._boolFlag = bool;
      return this;
    }
    const ret = this._boolFlag || 'and';
    this._boolFlag = 'and';
    return ret;
  }

  _not(val) {
    if (arguments.length === 1) {
      this._notFlag = val;
      return this;
    }
    const ret = this._notFlag;
    this._notFlag = false;
    return ret;
  }
};

Object.assign(JoinClause$2.prototype, {
  grouping: 'join',
});

JoinClause$2.prototype.andOn = JoinClause$2.prototype.on;
JoinClause$2.prototype.andOnIn = JoinClause$2.prototype.onIn;
JoinClause$2.prototype.andOnNotIn = JoinClause$2.prototype.onNotIn;
JoinClause$2.prototype.andOnNull = JoinClause$2.prototype.onNull;
JoinClause$2.prototype.andOnNotNull = JoinClause$2.prototype.onNotNull;
JoinClause$2.prototype.andOnExists = JoinClause$2.prototype.onExists;
JoinClause$2.prototype.andOnNotExists = JoinClause$2.prototype.onNotExists;
JoinClause$2.prototype.andOnBetween = JoinClause$2.prototype.onBetween;
JoinClause$2.prototype.andOnNotBetween = JoinClause$2.prototype.onNotBetween;
JoinClause$2.prototype.andOnJsonPathEquals =
  JoinClause$2.prototype.onJsonPathEquals;

var joinclause = JoinClause$2;

const assert$1 = require$$0;

// Analytic
// -------

// The "Analytic" is an object holding any necessary info about a analytic function
// e.g row_number, rank, dense_rank,
let Analytic$1 = class Analytic {
  constructor(method, schema, alias, orderBy, partitions) {
    this.schema = schema;
    this.type = 'analytic';
    this.method = method;
    this.order = orderBy || [];
    this.partitions = partitions || [];
    this.alias = alias;
    this.and = this;

    this.grouping = 'columns';
  }

  partitionBy(column, direction) {
    assert$1(
      Array.isArray(column) || typeof column === 'string',
      `The argument to an analytic partitionBy function must be either a string
            or an array of string.`
    );

    if (Array.isArray(column)) {
      this.partitions = this.partitions.concat(column);
    } else {
      this.partitions.push({ column: column, order: direction });
    }
    return this;
  }

  orderBy(column, direction) {
    assert$1(
      Array.isArray(column) || typeof column === 'string',
      `The argument to an analytic orderBy function must be either a string
            or an array of string.`
    );

    if (Array.isArray(column)) {
      this.order = this.order.concat(column);
    } else {
      this.order.push({ column: column, order: direction });
    }
    return this;
  }
};

var analytic = Analytic$1;

var saveAsyncStack$3 = function saveAsyncStack(instance, lines) {
  if (instance.client.config.asyncStackTraces) {
    // a hack to get a callstack into the client code despite this
    // node.js bug https://github.com/nodejs/node/issues/11865

    // Save error here but not error trace
    // reading trace with '--enable-source-maps' flag on node can be very costly

    instance._asyncStack = {
      error: new Error(),
      lines,
    };
  }
};

/**
 * internal constants, do not use in application code
 */

var constants = {
  lockMode: {
    forShare: 'forShare',
    forUpdate: 'forUpdate',
    forNoKeyUpdate: 'forNoKeyUpdate',
    forKeyShare: 'forKeyShare',
  },
  waitMode: {
    skipLocked: 'skipLocked',
    noWait: 'noWait',
  },
};

const clone$1 = clone_1;
const isEmpty$3 = isEmpty_1;
const { callbackify } = util;
const finallyMixin = finallyMixin_1;
const { formatQuery } = queryExecutioner;

function augmentWithBuilderInterface$3(Target) {
  Target.prototype.toQuery = function (tz) {
    let data = this.toSQL(this._method, tz);
    if (!Array.isArray(data)) data = [data];
    if (!data.length) {
      return '';
    }

    return data
      .map((statement) => {
        return formatQuery(statement.sql, statement.bindings, tz, this.client);
      })
      .reduce((a, c) => a.concat(a.endsWith(';') ? '\n' : ';\n', c));
  };

  // Create a new instance of the `Runner`, passing in the current object.
  Target.prototype.then = function (/* onFulfilled, onRejected */) {
    let result = this.client.runner(this).run();

    if (this.client.config.asyncStackTraces) {
      result = result.catch((err) => {
        err.originalStack = err.stack;
        const firstLine = err.stack.split('\n')[0];

        // a hack to get a callstack into the client code despite this
        // node.js bug https://github.com/nodejs/node/issues/11865
        // see lib/util/save-async-stack.js for more details
        const { error, lines } = this._asyncStack;
        const stackByLines = error.stack.split('\n');
        const asyncStack = stackByLines.slice(lines);
        asyncStack.unshift(firstLine);

        // put the fake more helpful "async" stack on the thrown error
        err.stack = asyncStack.join('\n');
        throw err;
      });
    }

    return result.then.apply(result, arguments);
  };

  // Add additional "options" to the builder. Typically used for client specific
  // items, like the `mysql` and `sqlite3` drivers.
  Target.prototype.options = function (opts) {
    this._options = this._options || [];
    this._options.push(clone$1(opts) || {});
    return this;
  };

  // Sets an explicit "connection" we wish to use for this query.
  Target.prototype.connection = function (connection) {
    this._connection = connection;
    this.client.processPassedConnection(connection);
    return this;
  };

  // Set a debug flag for the current schema query stack.
  Target.prototype.debug = function (enabled) {
    this._debug = arguments.length ? enabled : true;
    return this;
  };

  // Set the transaction object for this query.
  Target.prototype.transacting = function (transaction) {
    if (transaction && transaction.client) {
      if (!transaction.client.transacting) {
        transaction.client.logger.warn(
          `Invalid transaction value: ${transaction.client}`
        );
      } else {
        this.client = transaction.client;
      }
    }
    if (isEmpty$3(transaction)) {
      this.client.logger.error(
        'Invalid value on transacting call, potential bug'
      );
      throw Error(
        'Invalid transacting value (null, undefined or empty object)'
      );
    }
    return this;
  };

  // Initializes a stream.
  Target.prototype.stream = function (options) {
    return this.client.runner(this).stream(options);
  };

  // Initialize a stream & pipe automatically.
  Target.prototype.pipe = function (writable, options) {
    return this.client.runner(this).pipe(writable, options);
  };

  Target.prototype.asCallback = function (cb) {
    const promise = this.then();
    callbackify(() => promise)(cb);
    return promise;
  };

  Target.prototype.catch = function (onReject) {
    return this.then().catch(onReject);
  };

  Object.defineProperty(Target.prototype, Symbol.toStringTag, {
    get: () => 'object',
  });

  finallyMixin(Target.prototype);
}

var builderInterfaceAugmenter = {
  augmentWithBuilderInterface: augmentWithBuilderInterface$3,
};

// Builder
// -------
const assert = require$$0;
const { EventEmitter: EventEmitter$3 } = eventsExports;
const assign$6 = assign_1;
const clone = clone_1;
const each$1 = each$2;
const isEmpty$2 = isEmpty_1;
const isPlainObject$2 = isPlainObject_1;
const last = last_1;
const reject = reject_1;
const tail$3 = tail_1;
const toArray$3 = toArray_1;

const { addQueryContext: addQueryContext$2, normalizeArr: normalizeArr$1 } = helpers$7;
const JoinClause$1 = joinclause;
const Analytic = analytic;
const saveAsyncStack$2 = saveAsyncStack$3;
const {
  isBoolean,
  isNumber: isNumber$1,
  isObject: isObject$7,
  isString: isString$6,
  isFunction: isFunction$3,
} = is;

const { lockMode, waitMode } = constants;
const {
  augmentWithBuilderInterface: augmentWithBuilderInterface$2,
} = builderInterfaceAugmenter;

const SELECT_COMMANDS = new Set(['pluck', 'first', 'select']);
const CLEARABLE_STATEMENTS = new Set([
  'with',
  'select',
  'columns',
  'hintComments',
  'where',
  'union',
  'join',
  'group',
  'order',
  'having',
  'limit',
  'offset',
  'counter',
  'counters',
]);
const LOCK_MODES = new Set([
  lockMode.forShare,
  lockMode.forUpdate,
  lockMode.forNoKeyUpdate,
  lockMode.forKeyShare,
]);

// Typically called from `knex.builder`,
// start a new query building chain.
class Builder extends EventEmitter$3 {
  constructor(client) {
    super();
    this.client = client;
    this.and = this;
    this._single = {};
    this._comments = [];
    this._statements = [];
    this._method = 'select';
    if (client.config) {
      saveAsyncStack$2(this, 5);
      this._debug = client.config.debug;
    }
    // Internal flags used in the builder.
    this._joinFlag = 'inner';
    this._boolFlag = 'and';
    this._notFlag = false;
    this._asColumnFlag = false;
  }

  toString() {
    return this.toQuery();
  }

  // Convert the current query "toSQL"
  toSQL(method, tz) {
    return this.client.queryCompiler(this).toSQL(method || this._method, tz);
  }

  // Create a shallow clone of the current query builder.
  clone() {
    const cloned = new this.constructor(this.client);
    cloned._method = this._method;
    cloned._single = clone(this._single);
    cloned._comments = clone(this._comments);
    cloned._statements = clone(this._statements);
    cloned._debug = this._debug;

    // `_option` is assigned by the `Interface` mixin.
    if (this._options !== undefined) {
      cloned._options = clone(this._options);
    }
    if (this._queryContext !== undefined) {
      cloned._queryContext = clone(this._queryContext);
    }
    if (this._connection !== undefined) {
      cloned._connection = this._connection;
    }

    return cloned;
  }

  timeout(ms, { cancel } = {}) {
    if (isNumber$1(ms) && ms > 0) {
      this._timeout = ms;
      if (cancel) {
        this.client.assertCanCancelQuery();
        this._cancelOnTimeout = true;
      }
    }
    return this;
  }

  // With
  // ------
  isValidStatementArg(statement) {
    return (
      typeof statement === 'function' ||
      statement instanceof Builder ||
      (statement && statement.isRawInstance)
    );
  }

  _validateWithArgs(alias, statementOrColumnList, nothingOrStatement, method) {
    const [query, columnList] =
      typeof nothingOrStatement === 'undefined'
        ? [statementOrColumnList, undefined]
        : [nothingOrStatement, statementOrColumnList];
    if (typeof alias !== 'string') {
      throw new Error(`${method}() first argument must be a string`);
    }

    if (this.isValidStatementArg(query) && typeof columnList === 'undefined') {
      // Validated as two-arg variant (alias, statement).
      return;
    }

    // Attempt to interpret as three-arg variant (alias, columnList, statement).
    const isNonEmptyNameList =
      Array.isArray(columnList) &&
      columnList.length > 0 &&
      columnList.every((it) => typeof it === 'string');
    if (!isNonEmptyNameList) {
      throw new Error(
        `${method}() second argument must be a statement or non-empty column name list.`
      );
    }

    if (this.isValidStatementArg(query)) {
      return;
    }
    throw new Error(
      `${method}() third argument must be a function / QueryBuilder or a raw when its second argument is a column name list`
    );
  }

  with(alias, statementOrColumnList, nothingOrStatement) {
    this._validateWithArgs(
      alias,
      statementOrColumnList,
      nothingOrStatement,
      'with'
    );
    return this.withWrapped(alias, statementOrColumnList, nothingOrStatement);
  }

  withMaterialized(alias, statementOrColumnList, nothingOrStatement) {
    throw new Error('With materialized is not supported by this dialect');
  }

  withNotMaterialized(alias, statementOrColumnList, nothingOrStatement) {
    throw new Error('With materialized is not supported by this dialect');
  }

  // Helper for compiling any advanced `with` queries.
  withWrapped(alias, statementOrColumnList, nothingOrStatement, materialized) {
    const [query, columnList] =
      typeof nothingOrStatement === 'undefined'
        ? [statementOrColumnList, undefined]
        : [nothingOrStatement, statementOrColumnList];
    const statement = {
      grouping: 'with',
      type: 'withWrapped',
      alias: alias,
      columnList,
      value: query,
    };
    if (materialized !== undefined) {
      statement.materialized = materialized;
    }
    this._statements.push(statement);
    return this;
  }

  // With Recursive
  // ------

  withRecursive(alias, statementOrColumnList, nothingOrStatement) {
    this._validateWithArgs(
      alias,
      statementOrColumnList,
      nothingOrStatement,
      'withRecursive'
    );
    return this.withRecursiveWrapped(
      alias,
      statementOrColumnList,
      nothingOrStatement
    );
  }

  // Helper for compiling any advanced `withRecursive` queries.
  withRecursiveWrapped(alias, statementOrColumnList, nothingOrStatement) {
    this.withWrapped(alias, statementOrColumnList, nothingOrStatement);
    this._statements[this._statements.length - 1].recursive = true;
    return this;
  }

  // Select
  // ------

  // Adds a column or columns to the list of "columns"
  // being selected on the query.
  columns(column) {
    if (!column && column !== 0) return this;
    this._statements.push({
      grouping: 'columns',
      value: normalizeArr$1(...arguments),
    });
    return this;
  }

  // Adds a comment to the query
  comment(txt) {
    if (!isString$6(txt)) {
      throw new Error('Comment must be a string');
    }
    const forbiddenChars = ['/*', '*/', '?'];
    if (forbiddenChars.some((chars) => txt.includes(chars))) {
      throw new Error(`Cannot include ${forbiddenChars.join(', ')} in comment`);
    }
    this._comments.push({
      comment: txt,
    });
    return this;
  }

  // Allow for a sub-select to be explicitly aliased as a column,
  // without needing to compile the query in a where.
  as(column) {
    this._single.as = column;
    return this;
  }

  // Adds a single hint or an array of hits to the list of "hintComments" on the query.
  hintComment(hints) {
    hints = Array.isArray(hints) ? hints : [hints];
    if (hints.some((hint) => !isString$6(hint))) {
      throw new Error('Hint comment must be a string');
    }
    if (hints.some((hint) => hint.includes('/*') || hint.includes('*/'))) {
      throw new Error('Hint comment cannot include "/*" or "*/"');
    }
    if (hints.some((hint) => hint.includes('?'))) {
      throw new Error('Hint comment cannot include "?"');
    }
    this._statements.push({
      grouping: 'hintComments',
      value: hints,
    });
    return this;
  }

  // Prepends the `schemaName` on `tableName` defined by `.table` and `.join`.
  withSchema(schemaName) {
    this._single.schema = schemaName;
    return this;
  }

  // Sets the `tableName` on the query.
  // Alias to "from" for select and "into" for insert statements
  // e.g. builder.insert({a: value}).into('tableName')
  // `options`: options object containing keys:
  //   - `only`: whether the query should use SQL's ONLY to not return
  //           inheriting table data. Defaults to false.
  table(tableName, options = {}) {
    this._single.table = tableName;
    this._single.only = options.only === true;
    return this;
  }

  // Adds a `distinct` clause to the query.
  distinct(...args) {
    this._statements.push({
      grouping: 'columns',
      value: normalizeArr$1(...args),
      distinct: true,
    });
    return this;
  }

  distinctOn(...args) {
    if (isEmpty$2(args)) {
      throw new Error('distinctOn requires at least on argument');
    }
    this._statements.push({
      grouping: 'columns',
      value: normalizeArr$1(...args),
      distinctOn: true,
    });
    return this;
  }

  // Adds a join clause to the query, allowing for advanced joins
  // with an anonymous function as the second argument.
  join(table, first, ...args) {
    let join;
    const schema =
      table instanceof Builder || typeof table === 'function'
        ? undefined
        : this._single.schema;
    const joinType = this._joinType();
    if (typeof first === 'function') {
      join = new JoinClause$1(table, joinType, schema);
      first.call(join, join);
    } else if (joinType === 'raw') {
      join = new JoinClause$1(this.client.raw(table, first), 'raw');
    } else {
      join = new JoinClause$1(table, joinType, schema);
      if (first) {
        join.on(first, ...args);
      }
    }
    this._statements.push(join);
    return this;
  }

  using(tables) {
    throw new Error(
      "'using' function is only available in PostgreSQL dialect with Delete statements."
    );
  }

  // JOIN blocks:
  innerJoin(...args) {
    return this._joinType('inner').join(...args);
  }

  leftJoin(...args) {
    return this._joinType('left').join(...args);
  }

  leftOuterJoin(...args) {
    return this._joinType('left outer').join(...args);
  }

  rightJoin(...args) {
    return this._joinType('right').join(...args);
  }

  rightOuterJoin(...args) {
    return this._joinType('right outer').join(...args);
  }

  outerJoin(...args) {
    return this._joinType('outer').join(...args);
  }

  fullOuterJoin(...args) {
    return this._joinType('full outer').join(...args);
  }

  crossJoin(...args) {
    return this._joinType('cross').join(...args);
  }

  joinRaw(...args) {
    return this._joinType('raw').join(...args);
  }

  // Where modifiers:
  get or() {
    return this._bool('or');
  }

  get not() {
    return this._not(true);
  }

  // The where function can be used in several ways:
  // The most basic is `where(key, value)`, which expands to
  // where key = value.
  where(column, operator, value) {
    const argsLength = arguments.length;

    // Support "where true || where false"
    if (column === false || column === true) {
      return this.where(1, '=', column ? 1 : 0);
    }

    // Check if the column is a function, in which case it's
    // a where statement wrapped in parens.
    if (typeof column === 'function') {
      return this.whereWrapped(column);
    }

    // Allows `where({id: 2})` syntax.
    if (isObject$7(column) && !column.isRawInstance)
      return this._objectWhere(column);

    // Allow a raw statement to be passed along to the query.
    if (column && column.isRawInstance && argsLength === 1)
      return this.whereRaw(column);

    // Enable the where('key', value) syntax, only when there
    // are explicitly two arguments passed, so it's not possible to
    // do where('key', '!=') and have that turn into where key != null
    if (argsLength === 2) {
      value = operator;
      operator = '=';

      // If the value is null, and it's a two argument query,
      // we assume we're going for a `whereNull`.
      if (value === null) {
        return this.whereNull(column);
      }
    }

    // lower case the operator for comparison purposes
    const checkOperator = `${operator}`.toLowerCase().trim();

    // If there are 3 arguments, check whether 'in' is one of them.
    if (argsLength === 3) {
      if (checkOperator === 'in' || checkOperator === 'not in') {
        return this._not(checkOperator === 'not in').whereIn(column, value);
      }
      if (checkOperator === 'between' || checkOperator === 'not between') {
        return this._not(checkOperator === 'not between').whereBetween(
          column,
          value
        );
      }
    }

    // If the value is still null, check whether they're meaning
    // where value is null
    if (value === null) {
      // Check for .where(key, 'is', null) or .where(key, 'is not', 'null');
      if (checkOperator === 'is' || checkOperator === 'is not') {
        return this._not(checkOperator === 'is not').whereNull(column);
      }
    }

    // Push onto the where statement stack.
    this._statements.push({
      grouping: 'where',
      type: 'whereBasic',
      column,
      operator,
      value,
      not: this._not(),
      bool: this._bool(),
      asColumn: this._asColumnFlag,
    });
    return this;
  }

  whereColumn(...args) {
    this._asColumnFlag = true;
    this.where(...args);
    this._asColumnFlag = false;
    return this;
  }

  // Adds an `or where` clause to the query.
  orWhere(column, ...args) {
    this._bool('or');
    const obj = column;
    if (isObject$7(obj) && !obj.isRawInstance) {
      return this.whereWrapped(function () {
        for (const key in obj) {
          this.andWhere(key, obj[key]);
        }
      });
    }
    return this.where(column, ...args);
  }

  orWhereColumn(column, ...args) {
    this._bool('or');
    const obj = column;
    if (isObject$7(obj) && !obj.isRawInstance) {
      return this.whereWrapped(function () {
        for (const key in obj) {
          this.andWhereColumn(key, '=', obj[key]);
        }
      });
    }
    return this.whereColumn(column, ...args);
  }

  // Adds an `not where` clause to the query.
  whereNot(column, ...args) {
    if (args.length >= 2) {
      if (args[0] === 'in' || args[0] === 'between') {
        this.client.logger.warn(
          'whereNot is not suitable for "in" and "between" type subqueries. You should use "not in" and "not between" instead.'
        );
      }
    }
    return this._not(true).where(column, ...args);
  }

  whereNotColumn(...args) {
    return this._not(true).whereColumn(...args);
  }

  // Adds an `or not where` clause to the query.
  orWhereNot(...args) {
    return this._bool('or').whereNot(...args);
  }

  orWhereNotColumn(...args) {
    return this._bool('or').whereNotColumn(...args);
  }

  // Processes an object literal provided in a "where" clause.
  _objectWhere(obj) {
    const boolVal = this._bool();
    const notVal = this._not() ? 'Not' : '';
    for (const key in obj) {
      this[boolVal + 'Where' + notVal](key, obj[key]);
    }
    return this;
  }

  // Adds a raw `where` clause to the query.
  whereRaw(sql, bindings) {
    const raw = sql.isRawInstance ? sql : this.client.raw(sql, bindings);

    this._statements.push({
      grouping: 'where',
      type: 'whereRaw',
      value: raw,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  orWhereRaw(sql, bindings) {
    return this._bool('or').whereRaw(sql, bindings);
  }

  // Helper for compiling any advanced `where` queries.
  whereWrapped(callback) {
    this._statements.push({
      grouping: 'where',
      type: 'whereWrapped',
      value: callback,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  // Adds a `where exists` clause to the query.
  whereExists(callback) {
    this._statements.push({
      grouping: 'where',
      type: 'whereExists',
      value: callback,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  // Adds an `or where exists` clause to the query.
  orWhereExists(callback) {
    return this._bool('or').whereExists(callback);
  }

  // Adds a `where not exists` clause to the query.
  whereNotExists(callback) {
    return this._not(true).whereExists(callback);
  }

  // Adds a `or where not exists` clause to the query.
  orWhereNotExists(callback) {
    return this._bool('or').whereNotExists(callback);
  }

  // Adds a `where in` clause to the query.
  whereIn(column, values) {
    if (Array.isArray(values) && isEmpty$2(values))
      return this.where(this._not());
    this._statements.push({
      grouping: 'where',
      type: 'whereIn',
      column,
      value: values,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  // Adds a `or where in` clause to the query.
  orWhereIn(column, values) {
    return this._bool('or').whereIn(column, values);
  }

  // Adds a `where not in` clause to the query.
  whereNotIn(column, values) {
    return this._not(true).whereIn(column, values);
  }

  // Adds a `or where not in` clause to the query.
  orWhereNotIn(column, values) {
    return this._bool('or')._not(true).whereIn(column, values);
  }

  // Adds a `where null` clause to the query.
  whereNull(column) {
    this._statements.push({
      grouping: 'where',
      type: 'whereNull',
      column,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  // Adds a `or where null` clause to the query.
  orWhereNull(column) {
    return this._bool('or').whereNull(column);
  }

  // Adds a `where not null` clause to the query.
  whereNotNull(column) {
    return this._not(true).whereNull(column);
  }

  // Adds a `or where not null` clause to the query.
  orWhereNotNull(column) {
    return this._bool('or').whereNotNull(column);
  }

  // Adds a `where between` clause to the query.
  whereBetween(column, values) {
    assert(
      Array.isArray(values),
      'The second argument to whereBetween must be an array.'
    );
    assert(
      values.length === 2,
      'You must specify 2 values for the whereBetween clause'
    );
    this._statements.push({
      grouping: 'where',
      type: 'whereBetween',
      column,
      value: values,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  // Adds a `where not between` clause to the query.
  whereNotBetween(column, values) {
    return this._not(true).whereBetween(column, values);
  }

  // Adds a `or where between` clause to the query.
  orWhereBetween(column, values) {
    return this._bool('or').whereBetween(column, values);
  }

  // Adds a `or where not between` clause to the query.
  orWhereNotBetween(column, values) {
    return this._bool('or').whereNotBetween(column, values);
  }

  _whereLike(type, column, value) {
    this._statements.push({
      grouping: 'where',
      type: type,
      column,
      value: value,
      not: this._not(),
      bool: this._bool(),
      asColumn: this._asColumnFlag,
    });
    return this;
  }

  // Adds a `where like` clause to the query.
  whereLike(column, value) {
    return this._whereLike('whereLike', column, value);
  }

  // Adds a `or where like` clause to the query.
  orWhereLike(column, value) {
    return this._bool('or')._whereLike('whereLike', column, value);
  }

  // Adds a `where ilike` clause to the query.
  whereILike(column, value) {
    return this._whereLike('whereILike', column, value);
  }

  // Adds a `or where ilike` clause to the query.
  orWhereILike(column, value) {
    return this._bool('or')._whereLike('whereILike', column, value);
  }

  // Adds a `group by` clause to the query.
  groupBy(item) {
    if (item && item.isRawInstance) {
      return this.groupByRaw.apply(this, arguments);
    }
    this._statements.push({
      grouping: 'group',
      type: 'groupByBasic',
      value: normalizeArr$1(...arguments),
    });
    return this;
  }

  // Adds a raw `group by` clause to the query.
  groupByRaw(sql, bindings) {
    const raw = sql.isRawInstance ? sql : this.client.raw(sql, bindings);
    this._statements.push({
      grouping: 'group',
      type: 'groupByRaw',
      value: raw,
    });
    return this;
  }

  // Adds a `order by` clause to the query.
  orderBy(column, direction, nulls = '') {
    if (Array.isArray(column)) {
      return this._orderByArray(column);
    }
    this._statements.push({
      grouping: 'order',
      type: 'orderByBasic',
      value: column,
      direction,
      nulls,
    });
    return this;
  }

  // Adds a `order by` with multiple columns to the query.
  _orderByArray(columnDefs) {
    for (let i = 0; i < columnDefs.length; i++) {
      const columnInfo = columnDefs[i];
      if (isObject$7(columnInfo)) {
        this._statements.push({
          grouping: 'order',
          type: 'orderByBasic',
          value: columnInfo['column'],
          direction: columnInfo['order'],
          nulls: columnInfo['nulls'],
        });
      } else if (isString$6(columnInfo) || isNumber$1(columnInfo)) {
        this._statements.push({
          grouping: 'order',
          type: 'orderByBasic',
          value: columnInfo,
        });
      }
    }
    return this;
  }

  // Add a raw `order by` clause to the query.
  orderByRaw(sql, bindings) {
    const raw = sql.isRawInstance ? sql : this.client.raw(sql, bindings);
    this._statements.push({
      grouping: 'order',
      type: 'orderByRaw',
      value: raw,
    });
    return this;
  }

  _union(clause, args) {
    let callbacks = args[0];
    let wrap = args[1];
    if (args.length === 1 || (args.length === 2 && isBoolean(wrap))) {
      if (!Array.isArray(callbacks)) {
        callbacks = [callbacks];
      }
      for (let i = 0, l = callbacks.length; i < l; i++) {
        this._statements.push({
          grouping: 'union',
          clause: clause,
          value: callbacks[i],
          wrap: wrap || false,
        });
      }
    } else {
      callbacks = toArray$3(args).slice(0, args.length - 1);
      wrap = args[args.length - 1];
      if (!isBoolean(wrap)) {
        callbacks.push(wrap);
        wrap = false;
      }
      this._union(clause, [callbacks, wrap]);
    }
    return this;
  }

  // Add a union statement to the query.
  union(...args) {
    return this._union('union', args);
  }

  // Adds a union all statement to the query.
  unionAll(...args) {
    return this._union('union all', args);
  }

  intersect(...args) {
    return this._union('intersect', args);
  }

  except(...args) {
    return this._union('except', args);
  }

  // Adds a `having` clause to the query.
  having(column, operator, value) {
    if (column.isRawInstance && arguments.length === 1) {
      return this.havingRaw(column);
    }

    // Check if the column is a function, in which case it's
    // a having statement wrapped in parens.
    if (typeof column === 'function') {
      return this.havingWrapped(column);
    }

    this._statements.push({
      grouping: 'having',
      type: 'havingBasic',
      column,
      operator,
      value,
      bool: this._bool(),
      not: this._not(),
    });
    return this;
  }

  orHaving(column, ...args) {
    this._bool('or');
    const obj = column;
    if (isObject$7(obj) && !obj.isRawInstance) {
      return this.havingWrapped(function () {
        for (const key in obj) {
          this.andHaving(key, obj[key]);
        }
      });
    }
    return this.having(column, ...args);
  }

  // Helper for compiling any advanced `having` queries.
  havingWrapped(callback) {
    this._statements.push({
      grouping: 'having',
      type: 'havingWrapped',
      value: callback,
      bool: this._bool(),
      not: this._not(),
    });
    return this;
  }

  havingNull(column) {
    this._statements.push({
      grouping: 'having',
      type: 'havingNull',
      column,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  orHavingNull(callback) {
    return this._bool('or').havingNull(callback);
  }

  havingNotNull(callback) {
    return this._not(true).havingNull(callback);
  }

  orHavingNotNull(callback) {
    return this._not(true)._bool('or').havingNull(callback);
  }

  havingExists(callback) {
    this._statements.push({
      grouping: 'having',
      type: 'havingExists',
      value: callback,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  orHavingExists(callback) {
    return this._bool('or').havingExists(callback);
  }

  havingNotExists(callback) {
    return this._not(true).havingExists(callback);
  }

  orHavingNotExists(callback) {
    return this._not(true)._bool('or').havingExists(callback);
  }

  havingBetween(column, values) {
    assert(
      Array.isArray(values),
      'The second argument to havingBetween must be an array.'
    );
    assert(
      values.length === 2,
      'You must specify 2 values for the havingBetween clause'
    );
    this._statements.push({
      grouping: 'having',
      type: 'havingBetween',
      column,
      value: values,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  orHavingBetween(column, values) {
    return this._bool('or').havingBetween(column, values);
  }

  havingNotBetween(column, values) {
    return this._not(true).havingBetween(column, values);
  }

  orHavingNotBetween(column, values) {
    return this._not(true)._bool('or').havingBetween(column, values);
  }

  havingIn(column, values) {
    if (Array.isArray(values) && isEmpty$2(values))
      return this.where(this._not());
    this._statements.push({
      grouping: 'having',
      type: 'havingIn',
      column,
      value: values,
      not: this._not(),
      bool: this._bool(),
    });
    return this;
  }

  // Adds a `or where in` clause to the query.
  orHavingIn(column, values) {
    return this._bool('or').havingIn(column, values);
  }

  // Adds a `where not in` clause to the query.
  havingNotIn(column, values) {
    return this._not(true).havingIn(column, values);
  }

  // Adds a `or where not in` clause to the query.
  orHavingNotIn(column, values) {
    return this._bool('or')._not(true).havingIn(column, values);
  }

  // Adds a raw `having` clause to the query.
  havingRaw(sql, bindings) {
    const raw = sql.isRawInstance ? sql : this.client.raw(sql, bindings);
    this._statements.push({
      grouping: 'having',
      type: 'havingRaw',
      value: raw,
      bool: this._bool(),
      not: this._not(),
    });
    return this;
  }

  orHavingRaw(sql, bindings) {
    return this._bool('or').havingRaw(sql, bindings);
  }

  // set the skip binding parameter (= insert the raw value in the query) for an attribute.
  _setSkipBinding(attribute, options) {
    let skipBinding = options;
    if (isObject$7(options)) {
      skipBinding = options.skipBinding;
    }
    this._single.skipBinding = this._single.skipBinding || {};
    this._single.skipBinding[attribute] = skipBinding;
  }

  // Only allow a single "offset" to be set for the current query.
  offset(value, options) {
    if (value == null || value.isRawInstance || value instanceof Builder) {
      // Builder for backward compatibility
      this._single.offset = value;
    } else {
      const val = parseInt(value, 10);
      if (isNaN(val)) {
        this.client.logger.warn('A valid integer must be provided to offset');
      } else if (val < 0) {
        throw new Error(`A non-negative integer must be provided to offset.`);
      } else {
        this._single.offset = val;
      }
    }
    this._setSkipBinding('offset', options);
    return this;
  }

  // Only allow a single "limit" to be set for the current query.
  limit(value, options) {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      this.client.logger.warn('A valid integer must be provided to limit');
    } else {
      this._single.limit = val;
      this._setSkipBinding('limit', options);
    }
    return this;
  }

  // Retrieve the "count" result of the query.
  count(column, options) {
    return this._aggregate('count', column || '*', options);
  }

  // Retrieve the minimum value of a given column.
  min(column, options) {
    return this._aggregate('min', column, options);
  }

  // Retrieve the maximum value of a given column.
  max(column, options) {
    return this._aggregate('max', column, options);
  }

  // Retrieve the sum of the values of a given column.
  sum(column, options) {
    return this._aggregate('sum', column, options);
  }

  // Retrieve the average of the values of a given column.
  avg(column, options) {
    return this._aggregate('avg', column, options);
  }

  // Retrieve the "count" of the distinct results of the query.
  countDistinct(...columns) {
    let options;
    if (columns.length > 1 && isPlainObject$2(last(columns))) {
      [options] = columns.splice(columns.length - 1, 1);
    }

    if (!columns.length) {
      columns = '*';
    } else if (columns.length === 1) {
      columns = columns[0];
    }

    return this._aggregate('count', columns, { ...options, distinct: true });
  }

  // Retrieve the sum of the distinct values of a given column.
  sumDistinct(column, options) {
    return this._aggregate('sum', column, { ...options, distinct: true });
  }

  // Retrieve the vg of the distinct results of the query.
  avgDistinct(column, options) {
    return this._aggregate('avg', column, { ...options, distinct: true });
  }

  // Increments a column's value by the specified amount.
  increment(column, amount = 1) {
    if (isObject$7(column)) {
      for (const key in column) {
        this._counter(key, column[key]);
      }

      return this;
    }

    return this._counter(column, amount);
  }

  // Decrements a column's value by the specified amount.
  decrement(column, amount = 1) {
    if (isObject$7(column)) {
      for (const key in column) {
        this._counter(key, -column[key]);
      }

      return this;
    }

    return this._counter(column, -amount);
  }

  // Clears increments/decrements
  clearCounters() {
    this._single.counter = {};
    return this;
  }

  // Sets the values for a `select` query, informing that only the first
  // row should be returned (limit 1).
  first(...args) {
    if (this._method && this._method !== 'select') {
      throw new Error(`Cannot chain .first() on "${this._method}" query`);
    }

    this.select(normalizeArr$1(...args));
    this._method = 'first';
    this.limit(1);
    return this;
  }

  // Use existing connection to execute the query
  // Same value that client.acquireConnection() for an according client returns should be passed
  connection(_connection) {
    this._connection = _connection;
    this.client.processPassedConnection(_connection);
    return this;
  }

  // Pluck a column from a query.
  pluck(column) {
    if (this._method && this._method !== 'select') {
      throw new Error(`Cannot chain .pluck() on "${this._method}" query`);
    }

    this._method = 'pluck';
    this._single.pluck = column;
    this._statements.push({
      grouping: 'columns',
      type: 'pluck',
      value: column,
    });
    return this;
  }

  // Deprecated. Remove everything from select clause
  clearSelect() {
    this._clearGrouping('columns');
    return this;
  }

  // Deprecated. Remove everything from where clause
  clearWhere() {
    this._clearGrouping('where');
    return this;
  }

  // Deprecated. Remove everything from group clause
  clearGroup() {
    this._clearGrouping('group');
    return this;
  }

  // Deprecated. Remove everything from order clause
  clearOrder() {
    this._clearGrouping('order');
    return this;
  }

  // Deprecated. Remove everything from having clause
  clearHaving() {
    this._clearGrouping('having');
    return this;
  }

  // Remove everything from statement clause
  clear(statement) {
    if (!CLEARABLE_STATEMENTS.has(statement))
      throw new Error(`Knex Error: unknown statement '${statement}'`);
    if (statement.startsWith('counter')) return this.clearCounters();
    if (statement === 'select') {
      statement = 'columns';
    }
    this._clearGrouping(statement);
    return this;
  }

  // Insert & Update
  // ------

  // Sets the values for an `insert` query.
  insert(values, returning, options) {
    this._method = 'insert';
    if (!isEmpty$2(returning)) this.returning(returning, options);
    this._single.insert = values;
    return this;
  }

  // Sets the values for an `update`, allowing for both
  // `.update(key, value, [returning])` and `.update(obj, [returning])` syntaxes.
  update(values, returning, options) {
    let ret;
    const obj = this._single.update || {};
    this._method = 'update';
    if (isString$6(values)) {
      if (isPlainObject$2(returning)) {
        obj[values] = JSON.stringify(returning);
      } else {
        obj[values] = returning;
      }
      if (arguments.length > 2) {
        ret = arguments[2];
      }
    } else {
      const keys = Object.keys(values);
      if (this._single.update) {
        this.client.logger.warn('Update called multiple times with objects.');
      }
      let i = -1;
      while (++i < keys.length) {
        obj[keys[i]] = values[keys[i]];
      }
      ret = arguments[1];
    }
    if (!isEmpty$2(ret)) this.returning(ret, options);
    this._single.update = obj;
    return this;
  }

  // Sets the returning value for the query.
  returning(returning, options) {
    this._single.returning = returning;
    this._single.options = options;
    return this;
  }

  onConflict(columns) {
    if (typeof columns === 'string') {
      columns = [columns];
    }
    return new OnConflictBuilder(this, columns || true);
  }

  // Delete
  // ------

  // Executes a delete statement on the query;
  delete(ret, options) {
    this._method = 'del';
    if (!isEmpty$2(ret)) this.returning(ret, options);
    return this;
  }

  // Truncates a table, ends the query chain.
  truncate(tableName) {
    this._method = 'truncate';
    if (tableName) {
      this._single.table = tableName;
    }
    return this;
  }

  // Retrieves columns for the table specified by `knex(tableName)`
  columnInfo(column) {
    this._method = 'columnInfo';
    this._single.columnInfo = column;
    return this;
  }

  // Set a lock for update constraint.
  forUpdate(...tables) {
    this._single.lock = lockMode.forUpdate;
    if (tables.length === 1 && Array.isArray(tables[0])) {
      this._single.lockTables = tables[0];
    } else {
      this._single.lockTables = tables;
    }
    return this;
  }

  // Set a lock for share constraint.
  forShare(...tables) {
    this._single.lock = lockMode.forShare;
    this._single.lockTables = tables;
    return this;
  }

  // Set a lock for no key update constraint.
  forNoKeyUpdate(...tables) {
    this._single.lock = lockMode.forNoKeyUpdate;
    this._single.lockTables = tables;
    return this;
  }

  // Set a lock for key share constraint.
  forKeyShare(...tables) {
    this._single.lock = lockMode.forKeyShare;
    this._single.lockTables = tables;
    return this;
  }

  // Skips locked rows when using a lock constraint.
  skipLocked() {
    if (!this._isSelectQuery()) {
      throw new Error(`Cannot chain .skipLocked() on "${this._method}" query!`);
    }
    if (!this._hasLockMode()) {
      throw new Error(
        '.skipLocked() can only be used after a call to .forShare() or .forUpdate()!'
      );
    }
    if (this._single.waitMode === waitMode.noWait) {
      throw new Error('.skipLocked() cannot be used together with .noWait()!');
    }
    this._single.waitMode = waitMode.skipLocked;
    return this;
  }

  // Causes error when acessing a locked row instead of waiting for it to be released.
  noWait() {
    if (!this._isSelectQuery()) {
      throw new Error(`Cannot chain .noWait() on "${this._method}" query!`);
    }
    if (!this._hasLockMode()) {
      throw new Error(
        '.noWait() can only be used after a call to .forShare() or .forUpdate()!'
      );
    }
    if (this._single.waitMode === waitMode.skipLocked) {
      throw new Error('.noWait() cannot be used together with .skipLocked()!');
    }
    this._single.waitMode = waitMode.noWait;
    return this;
  }

  // Takes a JS object of methods to call and calls them
  fromJS(obj) {
    each$1(obj, (val, key) => {
      if (typeof this[key] !== 'function') {
        this.client.logger.warn(`Knex Error: unknown key ${key}`);
      }
      if (Array.isArray(val)) {
        this[key].apply(this, val);
      } else {
        this[key](val);
      }
    });
    return this;
  }

  fromRaw(sql, bindings) {
    const raw = sql.isRawInstance ? sql : this.client.raw(sql, bindings);
    return this.from(raw);
  }

  // Passes query to provided callback function, useful for e.g. composing
  // domain-specific helpers
  modify(callback) {
    callback.apply(this, [this].concat(tail$3(arguments)));
    return this;
  }

  upsert(values, returning, options) {
    throw new Error(
      `Upsert is not yet supported for dialect ${this.client.dialect}`
    );
  }

  // JSON support functions
  _json(nameFunction, params) {
    this._statements.push({
      grouping: 'columns',
      type: 'json',
      method: nameFunction,
      params: params,
    });
    return this;
  }

  jsonExtract() {
    const column = arguments[0];
    let path;
    let alias;
    let singleValue = true;

    // We use arguments to have the signatures :
    // - column (string or array)
    // - column + path
    // - column + path + alias
    // - column + path + alias + singleValue
    // - column array + singleValue
    if (arguments.length >= 2) {
      path = arguments[1];
    }
    if (arguments.length >= 3) {
      alias = arguments[2];
    }
    if (arguments.length === 4) {
      singleValue = arguments[3];
    }
    if (
      arguments.length === 2 &&
      Array.isArray(arguments[0]) &&
      isBoolean(arguments[1])
    ) {
      singleValue = arguments[1];
    }
    return this._json('jsonExtract', {
      column: column,
      path: path,
      alias: alias,
      singleValue, // boolean used only in MSSQL to use function for extract value instead of object/array.
    });
  }

  jsonSet(column, path, value, alias) {
    return this._json('jsonSet', {
      column: column,
      path: path,
      value: value,
      alias: alias,
    });
  }

  jsonInsert(column, path, value, alias) {
    return this._json('jsonInsert', {
      column: column,
      path: path,
      value: value,
      alias: alias,
    });
  }

  jsonRemove(column, path, alias) {
    return this._json('jsonRemove', {
      column: column,
      path: path,
      alias: alias,
    });
  }

  // Wheres for JSON
  _isJsonObject(jsonValue) {
    return isObject$7(jsonValue) && !(jsonValue instanceof Builder);
  }

  _whereJsonWrappedValue(type, column, value) {
    const whereJsonClause = {
      grouping: 'where',
      type: type,
      column,
      value: value,
      not: this._not(),
      bool: this._bool(),
      asColumn: this._asColumnFlag,
    };
    if (arguments[3]) {
      whereJsonClause.operator = arguments[3];
    }
    if (arguments[4]) {
      whereJsonClause.jsonPath = arguments[4];
    }
    this._statements.push(whereJsonClause);
  }

  whereJsonObject(column, value) {
    this._whereJsonWrappedValue('whereJsonObject', column, value);
    return this;
  }

  orWhereJsonObject(column, value) {
    return this._bool('or').whereJsonObject(column, value);
  }

  whereNotJsonObject(column, value) {
    return this._not(true).whereJsonObject(column, value);
  }

  orWhereNotJsonObject(column, value) {
    return this._bool('or').whereNotJsonObject(column, value);
  }

  whereJsonPath(column, path, operator, value) {
    this._whereJsonWrappedValue('whereJsonPath', column, value, operator, path);
    return this;
  }

  orWhereJsonPath(column, path, operator, value) {
    return this._bool('or').whereJsonPath(column, path, operator, value);
  }

  // Json superset wheres
  whereJsonSupersetOf(column, value) {
    this._whereJsonWrappedValue('whereJsonSupersetOf', column, value);
    return this;
  }

  whereJsonNotSupersetOf(column, value) {
    return this._not(true).whereJsonSupersetOf(column, value);
  }

  orWhereJsonSupersetOf(column, value) {
    return this._bool('or').whereJsonSupersetOf(column, value);
  }

  orWhereJsonNotSupersetOf(column, value) {
    return this._bool('or').whereJsonNotSupersetOf(column, value);
  }

  // Json subset wheres
  whereJsonSubsetOf(column, value) {
    this._whereJsonWrappedValue('whereJsonSubsetOf', column, value);
    return this;
  }

  whereJsonNotSubsetOf(column, value) {
    return this._not(true).whereJsonSubsetOf(column, value);
  }

  orWhereJsonSubsetOf(column, value) {
    return this._bool('or').whereJsonSubsetOf(column, value);
  }

  orWhereJsonNotSubsetOf(column, value) {
    return this._bool('or').whereJsonNotSubsetOf(column, value);
  }

  whereJsonHasNone(column, values) {
    this._not(true).whereJsonHasAll(column, values);
    return this;
  }

  // end of wheres for JSON

  _analytic(alias, second, third) {
    let analytic;
    const { schema } = this._single;
    const method = this._analyticMethod();
    alias = typeof alias === 'string' ? alias : null;

    assert(
      typeof second === 'function' ||
        second.isRawInstance ||
        Array.isArray(second) ||
        typeof second === 'string' ||
        typeof second === 'object',
      `The second argument to an analytic function must be either a function, a raw,
       an array of string or object, an object or a single string.`
    );

    if (third) {
      assert(
        Array.isArray(third) ||
          typeof third === 'string' ||
          typeof third === 'object',
        'The third argument to an analytic function must be either a string, an array of string or object or an object.'
      );
    }

    if (isFunction$3(second)) {
      analytic = new Analytic(method, schema, alias);
      second.call(analytic, analytic);
    } else if (second.isRawInstance) {
      const raw = second;
      analytic = {
        grouping: 'columns',
        type: 'analytic',
        method: method,
        raw: raw,
        alias: alias,
      };
    } else {
      const order = !Array.isArray(second) ? [second] : second;
      let partitions = third || [];
      partitions = !Array.isArray(partitions) ? [partitions] : partitions;
      analytic = {
        grouping: 'columns',
        type: 'analytic',
        method: method,
        order: order,
        alias: alias,
        partitions: partitions,
      };
    }
    this._statements.push(analytic);
    return this;
  }

  rank(...args) {
    return this._analyticMethod('rank')._analytic(...args);
  }

  denseRank(...args) {
    return this._analyticMethod('dense_rank')._analytic(...args);
  }

  rowNumber(...args) {
    return this._analyticMethod('row_number')._analytic(...args);
  }

  // ----------------------------------------------------------------------

  // Helper for the incrementing/decrementing queries.
  _counter(column, amount) {
    amount = parseFloat(amount);

    this._method = 'update';

    this._single.counter = this._single.counter || {};

    this._single.counter[column] = amount;

    return this;
  }

  // Helper to get or set the "boolFlag" value.
  _bool(val) {
    if (arguments.length === 1) {
      this._boolFlag = val;
      return this;
    }
    const ret = this._boolFlag;
    this._boolFlag = 'and';
    return ret;
  }

  // Helper to get or set the "notFlag" value.
  _not(val) {
    if (arguments.length === 1) {
      this._notFlag = val;
      return this;
    }
    const ret = this._notFlag;
    this._notFlag = false;
    return ret;
  }

  // Helper to get or set the "joinFlag" value.
  _joinType(val) {
    if (arguments.length === 1) {
      this._joinFlag = val;
      return this;
    }
    const ret = this._joinFlag || 'inner';
    this._joinFlag = 'inner';
    return ret;
  }

  _analyticMethod(val) {
    if (arguments.length === 1) {
      this._analyticFlag = val;
      return this;
    }
    return this._analyticFlag || 'row_number';
  }

  // Helper for compiling any aggregate queries.
  _aggregate(method, column, options = {}) {
    this._statements.push({
      grouping: 'columns',
      type: column.isRawInstance ? 'aggregateRaw' : 'aggregate',
      method,
      value: column,
      aggregateDistinct: options.distinct || false,
      alias: options.as,
    });
    return this;
  }

  // Helper function for clearing or reseting a grouping type from the builder
  _clearGrouping(grouping) {
    if (grouping in this._single) {
      this._single[grouping] = undefined;
    } else {
      this._statements = reject(this._statements, { grouping });
    }
  }

  // Helper function that checks if the builder will emit a select query
  _isSelectQuery() {
    return SELECT_COMMANDS.has(this._method);
  }

  // Helper function that checks if the query has a lock mode set
  _hasLockMode() {
    return LOCK_MODES.has(this._single.lock);
  }
}

Builder.prototype.select = Builder.prototype.columns;
Builder.prototype.column = Builder.prototype.columns;
Builder.prototype.andWhereNot = Builder.prototype.whereNot;
Builder.prototype.andWhereNotColumn = Builder.prototype.whereNotColumn;
Builder.prototype.andWhere = Builder.prototype.where;
Builder.prototype.andWhereColumn = Builder.prototype.whereColumn;
Builder.prototype.andWhereRaw = Builder.prototype.whereRaw;
Builder.prototype.andWhereBetween = Builder.prototype.whereBetween;
Builder.prototype.andWhereNotBetween = Builder.prototype.whereNotBetween;
Builder.prototype.andWhereJsonObject = Builder.prototype.whereJsonObject;
Builder.prototype.andWhereNotJsonObject = Builder.prototype.whereJsonObject;
Builder.prototype.andWhereJsonPath = Builder.prototype.whereJsonPath;
Builder.prototype.andWhereLike = Builder.prototype.whereLike;
Builder.prototype.andWhereILike = Builder.prototype.whereILike;
Builder.prototype.andHaving = Builder.prototype.having;
Builder.prototype.andHavingIn = Builder.prototype.havingIn;
Builder.prototype.andHavingNotIn = Builder.prototype.havingNotIn;
Builder.prototype.andHavingNull = Builder.prototype.havingNull;
Builder.prototype.andHavingNotNull = Builder.prototype.havingNotNull;
Builder.prototype.andHavingExists = Builder.prototype.havingExists;
Builder.prototype.andHavingNotExists = Builder.prototype.havingNotExists;
Builder.prototype.andHavingBetween = Builder.prototype.havingBetween;
Builder.prototype.andHavingNotBetween = Builder.prototype.havingNotBetween;
Builder.prototype.from = Builder.prototype.table;
Builder.prototype.into = Builder.prototype.table;
Builder.prototype.del = Builder.prototype.delete;

// Attach all of the top level promise methods that should be chainable.
augmentWithBuilderInterface$2(Builder);
addQueryContext$2(Builder);

Builder.extend = (methodName, fn) => {
  if (Object.prototype.hasOwnProperty.call(Builder.prototype, methodName)) {
    throw new Error(
      `Can't extend QueryBuilder with existing method ('${methodName}').`
    );
  }

  assign$6(Builder.prototype, { [methodName]: fn });
};

// Sub-builder for onConflict clauses
class OnConflictBuilder {
  constructor(builder, columns) {
    this.builder = builder;
    this._columns = columns;
  }

  // Sets insert query to ignore conflicts
  ignore() {
    this.builder._single.onConflict = this._columns;
    this.builder._single.ignore = true;
    return this.builder;
  }

  // Sets insert query to update on conflict
  merge(updates) {
    this.builder._single.onConflict = this._columns;
    this.builder._single.merge = { updates };
    return this.builder;
  }

  // Prevent
  then() {
    throw new Error(
      'Incomplete onConflict clause. .onConflict() must be directly followed by either .merge() or .ignore()'
    );
  }
}

var querybuilder = Builder;

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */

function arrayReduce$1(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

var _arrayReduce = arrayReduce$1;

/**
 * The base implementation of `_.reduce` and `_.reduceRight`, without support
 * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} accumulator The initial value.
 * @param {boolean} initAccum Specify using the first or last element of
 *  `collection` as the initial value.
 * @param {Function} eachFunc The function to iterate over `collection`.
 * @returns {*} Returns the accumulated value.
 */

function baseReduce$1(collection, iteratee, accumulator, initAccum, eachFunc) {
  eachFunc(collection, function(value, index, collection) {
    accumulator = initAccum
      ? (initAccum = false, value)
      : iteratee(accumulator, value, index, collection);
  });
  return accumulator;
}

var _baseReduce = baseReduce$1;

var arrayReduce = _arrayReduce,
    baseEach$1 = _baseEach,
    baseIteratee$4 = _baseIteratee,
    baseReduce = _baseReduce,
    isArray$2 = isArray_1;

/**
 * Reduces `collection` to a value which is the accumulated result of running
 * each element in `collection` thru `iteratee`, where each successive
 * invocation is supplied the return value of the previous. If `accumulator`
 * is not given, the first element of `collection` is used as the initial
 * value. The iteratee is invoked with four arguments:
 * (accumulator, value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.reduce`, `_.reduceRight`, and `_.transform`.
 *
 * The guarded methods are:
 * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
 * and `sortBy`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @returns {*} Returns the accumulated value.
 * @see _.reduceRight
 * @example
 *
 * _.reduce([1, 2], function(sum, n) {
 *   return sum + n;
 * }, 0);
 * // => 3
 *
 * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
 *   (result[value] || (result[value] = [])).push(key);
 *   return result;
 * }, {});
 * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
 */
function reduce$3(collection, iteratee, accumulator) {
  var func = isArray$2(collection) ? arrayReduce : baseReduce,
      initAccum = arguments.length < 3;

  return func(collection, baseIteratee$4(iteratee), accumulator, initAccum, baseEach$1);
}

var reduce_1 = reduce$3;

var arrayEach = _arrayEach,
    baseCreate = _baseCreate,
    baseForOwn = _baseForOwn,
    baseIteratee$3 = _baseIteratee,
    getPrototype = _getPrototype,
    isArray$1 = isArray_1,
    isBuffer = isBufferExports,
    isFunction$2 = isFunction_1,
    isObject$6 = isObject_1,
    isTypedArray = isTypedArray_1;

/**
 * An alternative to `_.reduce`; this method transforms `object` to a new
 * `accumulator` object which is the result of running each of its own
 * enumerable string keyed properties thru `iteratee`, with each invocation
 * potentially mutating the `accumulator` object. If `accumulator` is not
 * provided, a new object with the same `[[Prototype]]` will be used. The
 * iteratee is invoked with four arguments: (accumulator, value, key, object).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @since 1.3.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [accumulator] The custom accumulator value.
 * @returns {*} Returns the accumulated value.
 * @example
 *
 * _.transform([2, 3, 4], function(result, n) {
 *   result.push(n *= n);
 *   return n % 2 == 0;
 * }, []);
 * // => [4, 9]
 *
 * _.transform({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
 *   (result[value] || (result[value] = [])).push(key);
 * }, {});
 * // => { '1': ['a', 'c'], '2': ['b'] }
 */
function transform$1(object, iteratee, accumulator) {
  var isArr = isArray$1(object),
      isArrLike = isArr || isBuffer(object) || isTypedArray(object);

  iteratee = baseIteratee$3(iteratee);
  if (accumulator == null) {
    var Ctor = object && object.constructor;
    if (isArrLike) {
      accumulator = isArr ? new Ctor : [];
    }
    else if (isObject$6(object)) {
      accumulator = isFunction$2(Ctor) ? baseCreate(getPrototype(object)) : {};
    }
    else {
      accumulator = {};
    }
  }
  (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object) {
    return iteratee(accumulator, value, index, object);
  });
  return accumulator;
}

var transform_1 = transform$1;

const { isObject: isObject$5 } = is;

// Compiles a callback using the query builder.
function compileCallback$2(callback, method, client, bindingsHolder) {
  // Build the callback
  const builder = client.queryBuilder();
  callback.call(builder, builder);

  // Compile the callback, using the current formatter (to track all bindings).
  const compiler = client.queryCompiler(builder, bindingsHolder.bindings);

  // Return the compiled & parameterized sql.
  return compiler.toSQL(method || builder._method || 'select');
}

function wrapAsIdentifier$1(value, builder, client) {
  const queryContext = builder.queryContext();
  return client.wrapIdentifier((value || '').trim(), queryContext);
}

function formatDefault$1(value, type, client) {
  if (value === void 0) {
    return '';
  } else if (value === null) {
    return 'null';
  } else if (value && value.isRawInstance) {
    return value.toQuery();
  } else if (type === 'bool') {
    if (value === 'false') value = 0;
    return `'${value ? 1 : 0}'`;
  } else if ((type === 'json' || type === 'jsonb') && isObject$5(value)) {
    return `'${JSON.stringify(value)}'`;
  } else {
    return client._escapeBinding(value.toString());
  }
}

var formatterUtils = {
  compileCallback: compileCallback$2,
  wrapAsIdentifier: wrapAsIdentifier$1,
  formatDefault: formatDefault$1,
};

const transform = transform_1;
const QueryBuilder$4 = querybuilder;
const { compileCallback: compileCallback$1, wrapAsIdentifier } = formatterUtils;

// Valid values for the `order by` clause generation.
const orderBys = ['asc', 'desc'];

// Turn this into a lookup map
const operators = transform(
  [
    '=',
    '<',
    '>',
    '<=',
    '>=',
    '<>',
    '!=',
    'like',
    'not like',
    'between',
    'not between',
    'ilike',
    'not ilike',
    'exists',
    'not exist',
    'rlike',
    'not rlike',
    'regexp',
    'not regexp',
    'match',
    '&',
    '|',
    '^',
    '<<',
    '>>',
    '~',
    '~=',
    '~*',
    '!~',
    '!~*',
    '#',
    '&&',
    '@>',
    '<@',
    '||',
    '&<',
    '&>',
    '-|-',
    '@@',
    '!!',
    ['?', '\\?'],
    ['?|', '\\?|'],
    ['?&', '\\?&'],
  ],
  (result, key) => {
    if (Array.isArray(key)) {
      result[key[0]] = key[1];
    } else {
      result[key] = key;
    }
  },
  {}
);

// Accepts a string or array of columns to wrap as appropriate. Column can be raw
function columnize$1(target, builder, client, bindingHolder) {
  const columns = Array.isArray(target) ? target : [target];
  let str = '',
    i = -1;
  while (++i < columns.length) {
    if (i > 0) str += ', ';
    str += wrap(columns[i], undefined, builder, client, bindingHolder);
  }
  return str;
}

// Puts the appropriate wrapper around a value depending on the database
// engine, unless it's a knex.raw value, in which case it's left alone.
function wrap(value, isParameter, builder, client, bindingHolder) {
  const raw = unwrapRaw$1(value, isParameter, builder, client, bindingHolder);
  if (raw) return raw;
  switch (typeof value) {
    case 'function':
      return outputQuery$1(
        compileCallback$1(value, undefined, client, bindingHolder),
        true,
        builder,
        client
      );
    case 'object':
      return parseObject(value, builder, client, bindingHolder);
    case 'number':
      return value;
    default:
      return wrapString$1(value + '', builder, client);
  }
}

function unwrapRaw$1(value, isParameter, builder, client, bindingsHolder) {
  let query;
  if (value instanceof QueryBuilder$4) {
    query = client.queryCompiler(value).toSQL();
    if (query.bindings) {
      bindingsHolder.bindings.push(...query.bindings);
    }
    return outputQuery$1(query, isParameter, builder, client);
  }
  if (value && value.isRawInstance) {
    value.client = client;
    if (builder._queryContext) {
      value.queryContext = () => {
        return builder._queryContext;
      };
    }

    query = value.toSQL();
    if (query.bindings) {
      bindingsHolder.bindings.push(...query.bindings);
    }
    return query.sql;
  }
  if (isParameter) {
    bindingsHolder.bindings.push(value);
  }
}

function operator(value, builder, client, bindingsHolder) {
  const raw = unwrapRaw$1(value, undefined, builder, client, bindingsHolder);
  if (raw) return raw;
  const operator = operators[(value || '').toLowerCase()];
  if (!operator) {
    throw new TypeError(`The operator "${value}" is not permitted`);
  }
  return operator;
}

// Coerce to string to prevent strange errors when it's not a string.
function wrapString$1(value, builder, client) {
  const asIndex = value.toLowerCase().indexOf(' as ');
  if (asIndex !== -1) {
    const first = value.slice(0, asIndex);
    const second = value.slice(asIndex + 4);
    return client.alias(
      wrapString$1(first, builder, client),
      wrapAsIdentifier(second, builder, client)
    );
  }
  const wrapped = [];
  let i = -1;
  const segments = value.split('.');
  while (++i < segments.length) {
    value = segments[i];
    if (i === 0 && segments.length > 1) {
      wrapped.push(wrapString$1((value || '').trim(), builder, client));
    } else {
      wrapped.push(wrapAsIdentifier(value, builder, client));
    }
  }
  return wrapped.join('.');
}

// Key-value notation for alias
function parseObject(obj, builder, client, formatter) {
  const ret = [];
  for (const alias in obj) {
    const queryOrIdentifier = obj[alias];
    // Avoids double aliasing for subqueries
    if (typeof queryOrIdentifier === 'function') {
      const compiled = compileCallback$1(
        queryOrIdentifier,
        undefined,
        client,
        formatter
      );
      compiled.as = alias; // enforces the object's alias
      ret.push(outputQuery$1(compiled, true, builder, client));
    } else if (queryOrIdentifier instanceof QueryBuilder$4) {
      ret.push(
        client.alias(
          `(${wrap(queryOrIdentifier, undefined, builder, client, formatter)})`,
          wrapAsIdentifier(alias, builder, client)
        )
      );
    } else {
      ret.push(
        client.alias(
          wrap(queryOrIdentifier, undefined, builder, client, formatter),
          wrapAsIdentifier(alias, builder, client)
        )
      );
    }
  }
  return ret.join(', ');
}

// Ensures the query is aliased if necessary.
function outputQuery$1(compiled, isParameter, builder, client) {
  let sql = compiled.sql || '';
  if (sql) {
    if (
      (compiled.method === 'select' || compiled.method === 'first') &&
      (isParameter || compiled.as)
    ) {
      sql = `(${sql})`;
      if (compiled.as)
        return client.alias(sql, wrapString$1(compiled.as, builder, client));
    }
  }
  return sql;
}

/**
 * Creates SQL for a parameter, which might be passed to where() or .with() or
 * pretty much anywhere in API.
 *
 * @param value
 * @param method Optional at least 'select' or 'update' are valid
 * @param builder
 * @param client
 * @param bindingHolder
 */
function rawOrFn(value, method, builder, client, bindingHolder) {
  if (typeof value === 'function') {
    return outputQuery$1(
      compileCallback$1(value, method, client, bindingHolder),
      undefined,
      builder,
      client
    );
  }
  return unwrapRaw$1(value, undefined, builder, client, bindingHolder) || '';
}

// Specify the direction of the ordering.
function direction(value, builder, client, bindingsHolder) {
  const raw = unwrapRaw$1(value, undefined, builder, client, bindingsHolder);
  if (raw) return raw;
  return orderBys.indexOf((value || '').toLowerCase()) !== -1 ? value : 'asc';
}

var wrappingFormatter = {
  columnize: columnize$1,
  direction,
  operator,
  outputQuery: outputQuery$1,
  rawOrFn,
  unwrapRaw: unwrapRaw$1,
  wrap,
  wrapString: wrapString$1,
};

const { columnize } = wrappingFormatter;

function replaceRawArrBindings$1(raw, client) {
  const bindingsHolder = {
    bindings: [],
  };
  const builder = raw;

  const expectedBindings = raw.bindings.length;
  const values = raw.bindings;
  let index = 0;

  const sql = raw.sql.replace(/\\?\?\??/g, function (match) {
    if (match === '\\?') {
      return match;
    }

    const value = values[index++];

    if (match === '??') {
      return columnize(value, builder, client, bindingsHolder);
    }
    return client.parameter(value, builder, bindingsHolder);
  });

  if (expectedBindings !== index) {
    throw new Error(`Expected ${expectedBindings} bindings, saw ${index}`);
  }

  return {
    method: 'raw',
    sql,
    bindings: bindingsHolder.bindings,
  };
}

function replaceKeyBindings$1(raw, client) {
  const bindingsHolder = {
    bindings: [],
  };
  const builder = raw;

  const values = raw.bindings;
  const regex = /\\?(:(\w+):(?=::)|:(\w+):(?!:)|:(\w+))/g;

  const sql = raw.sql.replace(regex, function (match, p1, p2, p3, p4) {
    if (match !== p1) {
      return p1;
    }

    const part = p2 || p3 || p4;
    const key = match.trim();
    const isIdentifier = key[key.length - 1] === ':';
    const value = values[part];

    if (value === undefined) {
      if (Object.prototype.hasOwnProperty.call(values, part)) {
        bindingsHolder.bindings.push(value);
      }

      return match;
    }

    if (isIdentifier) {
      return match.replace(
        p1,
        columnize(value, builder, client, bindingsHolder)
      );
    }

    return match.replace(p1, client.parameter(value, builder, bindingsHolder));
  });

  return {
    method: 'raw',
    sql,
    bindings: bindingsHolder.bindings,
  };
}

var rawFormatter = {
  replaceKeyBindings: replaceKeyBindings$1,
  replaceRawArrBindings: replaceRawArrBindings$1,
};

// This alphabet uses `A-Za-z0-9_-` symbols. The genetic algorithm helped
// optimize the gzip compression for this alphabet.
const urlAlphabet =
  'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';

const numberAlphabet = '0123456789';

/**
 * Generate URL-friendly unique ID. This method uses the non-secure
 * predictable random generator with bigger collision probability.
 * Based on https://github.com/ai/nanoid
 *
 * ```js
 * model.id = nanoid() //=> "Uakgb_J5m9g-0JDMbcJqL"
 * ```
 *
 * @param size Size of the ID. The default size is 21.
 * @returns A random string.
 */
function nanoid$2(size = 21) {
  let id = '';
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size;
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id;
}

function nanonum(size = 21) {
  let id = '';
  let i = size;
  while (i--) {
    id += numberAlphabet[(Math.random() * 10) | 0];
  }
  return id;
}

var nanoid_1 = { nanoid: nanoid$2, nanonum };

// Raw
// -------
const { EventEmitter: EventEmitter$2 } = eventsExports;
const debug$2 = browserExports;
const assign$5 = assign_1;
const isPlainObject$1 = isPlainObject_1;
const reduce$2 = reduce_1;

const {
  replaceRawArrBindings,
  replaceKeyBindings,
} = rawFormatter;
const helpers$6 = helpers$7;
const saveAsyncStack$1 = saveAsyncStack$3;
const { nanoid: nanoid$1 } = nanoid_1;
const { isNumber, isObject: isObject$4 } = is;
const {
  augmentWithBuilderInterface: augmentWithBuilderInterface$1,
} = builderInterfaceAugmenter;

const debugBindings$1 = debug$2('knex:bindings');

let Raw$3 = class Raw extends EventEmitter$2 {
  constructor(client) {
    super();

    this.client = client;

    this.sql = '';
    this.bindings = [];

    // Todo: Deprecate
    this._wrappedBefore = undefined;
    this._wrappedAfter = undefined;
    if (client && client.config) {
      this._debug = client.config.debug;
      saveAsyncStack$1(this, 4);
    }
  }
  set(sql, bindings) {
    this.sql = sql;
    this.bindings =
      (isObject$4(bindings) && !bindings.toSQL) || bindings === undefined
        ? bindings
        : [bindings];

    return this;
  }

  timeout(ms, { cancel } = {}) {
    if (isNumber(ms) && ms > 0) {
      this._timeout = ms;
      if (cancel) {
        this.client.assertCanCancelQuery();
        this._cancelOnTimeout = true;
      }
    }
    return this;
  }

  // Wraps the current sql with `before` and `after`.
  wrap(before, after) {
    this._wrappedBefore = before;
    this._wrappedAfter = after;
    return this;
  }

  // Calls `toString` on the Knex object.
  toString() {
    return this.toQuery();
  }

  // Returns the raw sql for the query.
  toSQL(method, tz) {
    let obj;
    if (Array.isArray(this.bindings)) {
      obj = replaceRawArrBindings(this, this.client);
    } else if (this.bindings && isPlainObject$1(this.bindings)) {
      obj = replaceKeyBindings(this, this.client);
    } else {
      obj = {
        method: 'raw',
        sql: this.sql,
        bindings: this.bindings === undefined ? [] : [this.bindings],
      };
    }

    if (this._wrappedBefore) {
      obj.sql = this._wrappedBefore + obj.sql;
    }
    if (this._wrappedAfter) {
      obj.sql = obj.sql + this._wrappedAfter;
    }

    obj.options = reduce$2(this._options, assign$5, {});

    if (this._timeout) {
      obj.timeout = this._timeout;
      if (this._cancelOnTimeout) {
        obj.cancelOnTimeout = this._cancelOnTimeout;
      }
    }

    obj.bindings = obj.bindings || [];
    if (helpers$6.containsUndefined(obj.bindings)) {
      const undefinedBindingIndices = helpers$6.getUndefinedIndices(
        this.bindings
      );
      debugBindings$1(obj.bindings);
      throw new Error(
        `Undefined binding(s) detected for keys [${undefinedBindingIndices}] when compiling RAW query: ${obj.sql}`
      );
    }

    obj.__knexQueryUid = nanoid$1();

    Object.defineProperties(obj, {
      toNative: {
        value: () => ({
          sql: this.client.positionBindings(obj.sql),
          bindings: this.client.prepBindings(obj.bindings),
        }),
        enumerable: false,
      },
    });

    return obj;
  }
};

// Workaround to avoid circular dependency between wrappingFormatter.unwrapRaw and rawFormatter
Raw$3.prototype.isRawInstance = true;

// Allow the `Raw` object to be utilized with full access to the relevant
// promise API.
augmentWithBuilderInterface$1(Raw$3);
helpers$6.addQueryContext(Raw$3);

var raw = Raw$3;

/**
 * Creates an array with all falsey values removed. The values `false`, `null`,
 * `0`, `""`, `undefined`, and `NaN` are falsey.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to compact.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * _.compact([0, 1, false, 2, '', 3]);
 * // => [1, 2, 3]
 */

function compact$1(array) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (value) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var compact_1 = compact$1;

/**
 * A specialized version of `baseAggregator` for arrays.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} setter The function to set `accumulator` values.
 * @param {Function} iteratee The iteratee to transform keys.
 * @param {Object} accumulator The initial aggregated object.
 * @returns {Function} Returns `accumulator`.
 */

function arrayAggregator$1(array, setter, iteratee, accumulator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    var value = array[index];
    setter(accumulator, value, iteratee(value), array);
  }
  return accumulator;
}

var _arrayAggregator = arrayAggregator$1;

var baseEach = _baseEach;

/**
 * Aggregates elements of `collection` on `accumulator` with keys transformed
 * by `iteratee` and values set by `setter`.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} setter The function to set `accumulator` values.
 * @param {Function} iteratee The iteratee to transform keys.
 * @param {Object} accumulator The initial aggregated object.
 * @returns {Function} Returns `accumulator`.
 */
function baseAggregator$1(collection, setter, iteratee, accumulator) {
  baseEach(collection, function(value, key, collection) {
    setter(accumulator, value, iteratee(value), collection);
  });
  return accumulator;
}

var _baseAggregator = baseAggregator$1;

var arrayAggregator = _arrayAggregator,
    baseAggregator = _baseAggregator,
    baseIteratee$2 = _baseIteratee,
    isArray = isArray_1;

/**
 * Creates a function like `_.groupBy`.
 *
 * @private
 * @param {Function} setter The function to set accumulator values.
 * @param {Function} [initializer] The accumulator object initializer.
 * @returns {Function} Returns the new aggregator function.
 */
function createAggregator$1(setter, initializer) {
  return function(collection, iteratee) {
    var func = isArray(collection) ? arrayAggregator : baseAggregator,
        accumulator = initializer ? initializer() : {};

    return func(collection, setter, baseIteratee$2(iteratee), accumulator);
  };
}

var _createAggregator = createAggregator$1;

var baseAssignValue = _baseAssignValue,
    createAggregator = _createAggregator;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

/**
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` thru `iteratee`. The order of grouped values
 * is determined by the order they occur in `collection`. The corresponding
 * value of each key is an array of elements responsible for generating the
 * key. The iteratee is invoked with one argument: (value).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
 * @returns {Object} Returns the composed aggregate object.
 * @example
 *
 * _.groupBy([6.1, 4.2, 6.3], Math.floor);
 * // => { '4': [4.2], '6': [6.1, 6.3] }
 *
 * // The `_.property` iteratee shorthand.
 * _.groupBy(['one', 'two', 'three'], 'length');
 * // => { '3': ['one', 'two'], '5': ['three'] }
 */
var groupBy$4 = createAggregator(function(result, value, key) {
  if (hasOwnProperty$1.call(result, key)) {
    result[key].push(value);
  } else {
    baseAssignValue(result, key, [value]);
  }
});

var groupBy_1 = groupBy$4;

/** Used for built-in method references. */

var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.has` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHas$1(object, key) {
  return object != null && hasOwnProperty.call(object, key);
}

var _baseHas = baseHas$1;

var baseHas = _baseHas,
    hasPath = _hasPath;

/**
 * Checks if `path` is a direct property of `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = { 'a': { 'b': 2 } };
 * var other = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.has(object, 'a');
 * // => true
 *
 * _.has(object, 'a.b');
 * // => true
 *
 * _.has(object, ['a', 'b']);
 * // => true
 *
 * _.has(other, 'a');
 * // => false
 */
function has$3(object, path) {
  return object != null && hasPath(object, path, baseHas);
}

var has_1 = has$3;

var assignValue = _assignValue,
    castPath$1 = _castPath,
    isIndex = _isIndex,
    isObject$3 = isObject_1,
    toKey = _toKey;

/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet$1(object, path, value, customizer) {
  if (!isObject$3(object)) {
    return object;
  }
  path = castPath$1(path, object);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = toKey(path[index]),
        newValue = value;

    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return object;
    }

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject$3(objValue)
          ? objValue
          : (isIndex(path[index + 1]) ? [] : {});
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

var _baseSet = baseSet$1;

var baseGet = _baseGet,
    baseSet = _baseSet,
    castPath = _castPath;

/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy$1(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};

  while (++index < length) {
    var path = paths[index],
        value = baseGet(object, path);

    if (predicate(value, path)) {
      baseSet(result, castPath(path, object), value);
    }
  }
  return result;
}

var _basePickBy = basePickBy$1;

var arrayMap = _arrayMap,
    baseIteratee$1 = _baseIteratee,
    basePickBy = _basePickBy,
    getAllKeysIn = _getAllKeysIn;

/**
 * Creates an object composed of the `object` properties `predicate` returns
 * truthy for. The predicate is invoked with two arguments: (value, key).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The source object.
 * @param {Function} [predicate=_.identity] The function invoked per property.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pickBy(object, _.isNumber);
 * // => { 'a': 1, 'c': 3 }
 */
function pickBy$1(object, predicate) {
  if (object == null) {
    return {};
  }
  var props = arrayMap(getAllKeysIn(object), function(prop) {
    return [prop];
  });
  predicate = baseIteratee$1(predicate);
  return basePickBy(object, props, function(value, path) {
    return predicate(value, path[0]);
  });
}

var pickBy_1 = pickBy$1;

var baseIteratee = _baseIteratee,
    negate = negate_1,
    pickBy = pickBy_1;

/**
 * The opposite of `_.pickBy`; this method creates an object composed of
 * the own and inherited enumerable string keyed properties of `object` that
 * `predicate` doesn't return truthy for. The predicate is invoked with two
 * arguments: (value, key).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The source object.
 * @param {Function} [predicate=_.identity] The function invoked per property.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omitBy(object, _.isNumber);
 * // => { 'b': '2' }
 */
function omitBy$1(object, predicate) {
  return pickBy(object, negate(baseIteratee(predicate)));
}

var omitBy_1 = omitBy$1;

// Query Compiler
// -------
const helpers$5 = helpers$7;
const Raw$2 = raw;
const QueryBuilder$3 = querybuilder;
const JoinClause = joinclause;
const debug$1 = browserExports;

const assign$4 = assign_1;
const compact = compact_1;
const groupBy$3 = groupBy_1;
const has$2 = has_1;
const isEmpty$1 = isEmpty_1;
const map$1 = map_1;
const omitBy = omitBy_1;
const reduce$1 = reduce_1;
const { nanoid } = nanoid_1;
const { isString: isString$5, isUndefined } = is;
const {
  columnize: columnize_$3,
  direction: direction_,
  operator: operator_$2,
  wrap: wrap_$2,
  unwrapRaw: unwrapRaw_,
  rawOrFn: rawOrFn_,
} = wrappingFormatter;

const debugBindings = debug$1('knex:bindings');

const components = [
  'comments',
  'columns',
  'join',
  'where',
  'union',
  'group',
  'having',
  'order',
  'limit',
  'offset',
  'lock',
  'waitMode',
];

// The "QueryCompiler" takes all of the query statements which
// have been gathered in the "QueryBuilder" and turns them into a
// properly formatted / bound query string.
let QueryCompiler$3 = class QueryCompiler {
  constructor(client, builder, bindings) {
    this.client = client;
    this.method = builder._method || 'select';
    this.options = builder._options;
    this.single = builder._single;
    this.queryComments = builder._comments;
    this.timeout = builder._timeout || false;
    this.cancelOnTimeout = builder._cancelOnTimeout || false;
    this.grouped = groupBy$3(builder._statements, 'grouping');
    this.formatter = client.formatter(builder);
    // Used when the insert call is empty.
    this._emptyInsertValue = 'default values';
    this.first = this.select;

    this.bindings = bindings || [];
    this.formatter.bindings = this.bindings;
    this.bindingsHolder = this;
    this.builder = this.formatter.builder;
  }

  // Collapse the builder into a single object
  toSQL(method, tz) {
    this._undefinedInWhereClause = false;
    this.undefinedBindingsInfo = [];

    method = method || this.method;
    const val = this[method]() || '';

    const query = {
      method,
      options: reduce$1(this.options, assign$4, {}),
      timeout: this.timeout,
      cancelOnTimeout: this.cancelOnTimeout,
      bindings: this.bindingsHolder.bindings || [],
      __knexQueryUid: nanoid(),
    };

    Object.defineProperties(query, {
      toNative: {
        value: () => {
          return {
            sql: this.client.positionBindings(query.sql),
            bindings: this.client.prepBindings(query.bindings),
          };
        },
        enumerable: false,
      },
    });

    if (isString$5(val)) {
      query.sql = val;
    } else {
      assign$4(query, val);
    }

    if (method === 'select' || method === 'first') {
      if (this.single.as) {
        query.as = this.single.as;
      }
    }

    if (this._undefinedInWhereClause) {
      debugBindings(query.bindings);
      throw new Error(
        `Undefined binding(s) detected when compiling ` +
          `${method.toUpperCase()}. Undefined column(s): [${this.undefinedBindingsInfo.join(
            ', '
          )}] query: ${query.sql}`
      );
    }

    return query;
  }

  // Compiles the `select` statement, or nested sub-selects by calling each of
  // the component compilers, trimming out the empties, and returning a
  // generated query string.
  select() {
    let sql = this.with();

    let unionStatement = '';

    const firstStatements = [];
    const endStatements = [];

    components.forEach((component) => {
      const statement = this[component](this);
      // We store the 'union' statement to append it at the end.
      // We still need to call the component sequentially because of
      // order of bindings.
      switch (component) {
        case 'union':
          unionStatement = statement;
          break;
        case 'comments':
        case 'columns':
        case 'join':
        case 'where':
          firstStatements.push(statement);
          break;
        default:
          endStatements.push(statement);
          break;
      }
    });

    // Check if we need to wrap the main query.
    // We need to wrap main query if one of union have wrap options to true
    // to avoid error syntax (in PostgreSQL for example).
    const wrapMainQuery =
      this.grouped.union &&
      this.grouped.union.map((u) => u.wrap).some((u) => u);

    if (this.onlyUnions()) {
      const statements = compact(firstStatements.concat(endStatements)).join(
        ' '
      );
      sql += unionStatement + (statements ? ' ' + statements : '');
    } else {
      const allStatements =
        (wrapMainQuery ? '(' : '') +
        compact(firstStatements).join(' ') +
        (wrapMainQuery ? ')' : '');
      const endStat = compact(endStatements).join(' ');
      sql +=
        allStatements +
        (unionStatement ? ' ' + unionStatement : '') +
        (endStat ? ' ' + endStat : endStat);
    }
    return sql;
  }

  pluck() {
    let toPluck = this.single.pluck;
    if (toPluck.indexOf('.') !== -1) {
      toPluck = toPluck.split('.').slice(-1)[0];
    }
    return {
      sql: this.select(),
      pluck: toPluck,
    };
  }

  // Compiles an "insert" query, allowing for multiple
  // inserts using a single query statement.
  insert() {
    const insertValues = this.single.insert || [];
    const sql = this.with() + `insert into ${this.tableName} `;
    const body = this._insertBody(insertValues);
    return body === '' ? '' : sql + body;
  }

  _onConflictClause(columns) {
    return columns instanceof Raw$2
      ? this.formatter.wrap(columns)
      : `(${this.formatter.columnize(columns)})`;
  }

  _buildInsertValues(insertData) {
    let sql = '';
    let i = -1;
    while (++i < insertData.values.length) {
      if (i !== 0) sql += '), (';
      sql += this.client.parameterize(
        insertData.values[i],
        this.client.valueForUndefined,
        this.builder,
        this.bindingsHolder
      );
    }
    return sql;
  }

  _insertBody(insertValues) {
    let sql = '';
    if (Array.isArray(insertValues)) {
      if (insertValues.length === 0) {
        return '';
      }
    } else if (typeof insertValues === 'object' && isEmpty$1(insertValues)) {
      return sql + this._emptyInsertValue;
    }

    const insertData = this._prepInsert(insertValues);
    if (typeof insertData === 'string') {
      sql += insertData;
    } else {
      if (insertData.columns.length) {
        sql += `(${columnize_$3(
          insertData.columns,
          this.builder,
          this.client,
          this.bindingsHolder
        )}`;
        sql += ') values (' + this._buildInsertValues(insertData) + ')';
      } else if (insertValues.length === 1 && insertValues[0]) {
        sql += this._emptyInsertValue;
      } else {
        sql = '';
      }
    }
    return sql;
  }

  // Compiles the "update" query.
  update() {
    // Make sure tableName is processed by the formatter first.
    const withSQL = this.with();
    const { tableName } = this;
    const updateData = this._prepUpdate(this.single.update);
    const wheres = this.where();
    return (
      withSQL +
      `update ${this.single.only ? 'only ' : ''}${tableName}` +
      ' set ' +
      updateData.join(', ') +
      (wheres ? ` ${wheres}` : '')
    );
  }

  _hintComments() {
    let hints = this.grouped.hintComments || [];
    hints = hints.map((hint) => compact(hint.value).join(' '));
    hints = compact(hints).join(' ');
    return hints ? `/*+ ${hints} */ ` : '';
  }

  // Compiles the columns in the query, specifying if an item was distinct.
  columns() {
    let distinctClause = '';
    if (this.onlyUnions()) return '';
    const hints = this._hintComments();
    const columns = this.grouped.columns || [];
    let i = -1,
      sql = [];
    if (columns) {
      while (++i < columns.length) {
        const stmt = columns[i];
        if (stmt.distinct) distinctClause = 'distinct ';
        if (stmt.distinctOn) {
          distinctClause = this.distinctOn(stmt.value);
          continue;
        }
        if (stmt.type === 'aggregate') {
          sql.push(...this.aggregate(stmt));
        } else if (stmt.type === 'aggregateRaw') {
          sql.push(this.aggregateRaw(stmt));
        } else if (stmt.type === 'analytic') {
          sql.push(this.analytic(stmt));
        } else if (stmt.type === 'json') {
          sql.push(this.json(stmt));
        } else if (stmt.value && stmt.value.length > 0) {
          sql.push(
            columnize_$3(
              stmt.value,
              this.builder,
              this.client,
              this.bindingsHolder
            )
          );
        }
      }
    }
    if (sql.length === 0) sql = ['*'];
    const select = this.onlyJson() ? '' : 'select ';
    return (
      `${select}${hints}${distinctClause}` +
      sql.join(', ') +
      (this.tableName
        ? ` from ${this.single.only ? 'only ' : ''}${this.tableName}`
        : '')
    );
  }

  // Add comments to the query
  comments() {
    if (!this.queryComments.length) return '';
    return this.queryComments
      .map((comment) => `/* ${comment.comment} */`)
      .join(' ');
  }

  _aggregate(stmt, { aliasSeparator = ' as ', distinctParentheses } = {}) {
    const value = stmt.value;
    const method = stmt.method;
    const distinct = stmt.aggregateDistinct ? 'distinct ' : '';
    const wrap = (identifier) =>
      wrap_$2(
        identifier,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      );
    const addAlias = (value, alias) => {
      if (alias) {
        return value + aliasSeparator + wrap(alias);
      }
      return value;
    };
    const aggregateArray = (value, alias) => {
      let columns = value.map(wrap).join(', ');
      if (distinct) {
        const openParen = distinctParentheses ? '(' : ' ';
        const closeParen = distinctParentheses ? ')' : '';
        columns = distinct.trim() + openParen + columns + closeParen;
      }
      const aggregated = `${method}(${columns})`;
      return addAlias(aggregated, alias);
    };
    const aggregateString = (value, alias) => {
      const aggregated = `${method}(${distinct + wrap(value)})`;
      return addAlias(aggregated, alias);
    };

    if (Array.isArray(value)) {
      return [aggregateArray(value)];
    }

    if (typeof value === 'object') {
      if (stmt.alias) {
        throw new Error('When using an object explicit alias can not be used');
      }
      return Object.entries(value).map(([alias, column]) => {
        if (Array.isArray(column)) {
          return aggregateArray(column, alias);
        }
        return aggregateString(column, alias);
      });
    }

    // Allows us to speciy an alias for the aggregate types.
    const splitOn = value.toLowerCase().indexOf(' as ');
    let column = value;
    let { alias } = stmt;
    if (splitOn !== -1) {
      column = value.slice(0, splitOn);
      if (alias) {
        throw new Error(`Found multiple aliases for same column: ${column}`);
      }
      alias = value.slice(splitOn + 4);
    }
    return [aggregateString(column, alias)];
  }

  aggregate(stmt) {
    return this._aggregate(stmt);
  }

  aggregateRaw(stmt) {
    const distinct = stmt.aggregateDistinct ? 'distinct ' : '';
    return `${stmt.method}(${
      distinct +
      unwrapRaw_(
        stmt.value,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      )
    })`;
  }

  _joinTable(join) {
    return join.schema && !(join.table instanceof Raw$2)
      ? `${join.schema}.${join.table}`
      : join.table;
  }

  // Compiles all each of the `join` clauses on the query,
  // including any nested join queries.
  join() {
    let sql = '';
    let i = -1;
    const joins = this.grouped.join;
    if (!joins) return '';
    while (++i < joins.length) {
      const join = joins[i];
      const table = this._joinTable(join);
      if (i > 0) sql += ' ';
      if (join.joinType === 'raw') {
        sql += unwrapRaw_(
          join.table,
          undefined,
          this.builder,
          this.client,
          this.bindingsHolder
        );
      } else {
        sql +=
          join.joinType +
          ' join ' +
          wrap_$2(
            table,
            undefined,
            this.builder,
            this.client,
            this.bindingsHolder
          );
        let ii = -1;
        while (++ii < join.clauses.length) {
          const clause = join.clauses[ii];
          if (ii > 0) {
            sql += ` ${clause.bool} `;
          } else {
            sql += ` ${clause.type === 'onUsing' ? 'using' : 'on'} `;
          }
          const val = this[clause.type](clause);
          if (val) {
            sql += val;
          }
        }
      }
    }
    return sql;
  }

  onBetween(statement) {
    return (
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      this._not(statement, 'between') +
      ' ' +
      statement.value
        .map((value) =>
          this.client.parameter(value, this.builder, this.bindingsHolder)
        )
        .join(' and ')
    );
  }

  onNull(statement) {
    return (
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' is ' +
      this._not(statement, 'null')
    );
  }

  onExists(statement) {
    return (
      this._not(statement, 'exists') +
      ' (' +
      rawOrFn_(
        statement.value,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ')'
    );
  }

  onIn(statement) {
    if (Array.isArray(statement.column)) return this.multiOnIn(statement);

    let values;
    if (statement.value instanceof Raw$2) {
      values = this.client.parameter(
        statement.value,
        this.builder,
        this.formatter
      );
    } else {
      values = this.client.parameterize(
        statement.value,
        undefined,
        this.builder,
        this.bindingsHolder
      );
    }

    return (
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      this._not(statement, 'in ') +
      this.wrap(values)
    );
  }

  multiOnIn(statement) {
    let i = -1,
      sql = `(${columnize_$3(
        statement.column,
        this.builder,
        this.client,
        this.bindingsHolder
      )}) `;
    sql += this._not(statement, 'in ') + '((';
    while (++i < statement.value.length) {
      if (i !== 0) sql += '),(';
      sql += this.client.parameterize(
        statement.value[i],
        undefined,
        this.builder,
        this.bindingsHolder
      );
    }
    return sql + '))';
  }

  // Compiles all `where` statements on the query.
  where() {
    const wheres = this.grouped.where;
    if (!wheres) return;
    const sql = [];
    let i = -1;
    while (++i < wheres.length) {
      const stmt = wheres[i];
      if (
        Object.prototype.hasOwnProperty.call(stmt, 'value') &&
        helpers$5.containsUndefined(stmt.value)
      ) {
        this.undefinedBindingsInfo.push(stmt.column);
        this._undefinedInWhereClause = true;
      }
      const val = this[stmt.type](stmt);
      if (val) {
        if (sql.length === 0) {
          sql[0] = 'where';
        } else {
          sql.push(stmt.bool);
        }
        sql.push(val);
      }
    }
    return sql.length > 1 ? sql.join(' ') : '';
  }

  group() {
    return this._groupsOrders('group');
  }

  order() {
    return this._groupsOrders('order');
  }

  // Compiles the `having` statements.
  having() {
    const havings = this.grouped.having;
    if (!havings) return '';
    const sql = ['having'];
    for (let i = 0, l = havings.length; i < l; i++) {
      const s = havings[i];
      const val = this[s.type](s);
      if (val) {
        if (sql.length === 0) {
          sql[0] = 'where';
        }
        if (sql.length > 1 || (sql.length === 1 && sql[0] !== 'having')) {
          sql.push(s.bool);
        }
        sql.push(val);
      }
    }
    return sql.length > 1 ? sql.join(' ') : '';
  }

  havingRaw(statement) {
    return (
      this._not(statement, '') +
      unwrapRaw_(
        statement.value,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      )
    );
  }

  havingWrapped(statement) {
    const val = rawOrFn_(
      statement.value,
      'where',
      this.builder,
      this.client,
      this.bindingsHolder
    );
    return (val && this._not(statement, '') + '(' + val.slice(6) + ')') || '';
  }

  havingBasic(statement) {
    return (
      this._not(statement, '') +
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      operator_$2(
        statement.operator,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      this.client.parameter(statement.value, this.builder, this.bindingsHolder)
    );
  }

  havingNull(statement) {
    return (
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' is ' +
      this._not(statement, 'null')
    );
  }

  havingExists(statement) {
    return (
      this._not(statement, 'exists') +
      ' (' +
      rawOrFn_(
        statement.value,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ')'
    );
  }

  havingBetween(statement) {
    return (
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      this._not(statement, 'between') +
      ' ' +
      statement.value
        .map((value) =>
          this.client.parameter(value, this.builder, this.bindingsHolder)
        )
        .join(' and ')
    );
  }

  havingIn(statement) {
    if (Array.isArray(statement.column)) return this.multiHavingIn(statement);
    return (
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      this._not(statement, 'in ') +
      this.wrap(
        this.client.parameterize(
          statement.value,
          undefined,
          this.builder,
          this.bindingsHolder
        )
      )
    );
  }

  multiHavingIn(statement) {
    return this.multiOnIn(statement);
  }

  // Compile the "union" queries attached to the main query.
  union() {
    const onlyUnions = this.onlyUnions();
    const unions = this.grouped.union;
    if (!unions) return '';
    let sql = '';
    for (let i = 0, l = unions.length; i < l; i++) {
      const union = unions[i];
      if (i > 0) sql += ' ';
      if (i > 0 || !onlyUnions) sql += union.clause + ' ';
      const statement = rawOrFn_(
        union.value,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      );
      if (statement) {
        const wrap = union.wrap;
        if (wrap) sql += '(';
        sql += statement;
        if (wrap) sql += ')';
      }
    }
    return sql;
  }

  // If we haven't specified any columns or a `tableName`, we're assuming this
  // is only being used for unions.
  onlyUnions() {
    return (
      (!this.grouped.columns || !!this.grouped.columns[0].value) &&
      this.grouped.union &&
      !this.tableName
    );
  }

  _getValueOrParameterFromAttribute(attribute, rawValue) {
    if (this.single.skipBinding[attribute] === true) {
      return rawValue !== undefined && rawValue !== null
        ? rawValue
        : this.single[attribute];
    }
    return this.client.parameter(
      this.single[attribute],
      this.builder,
      this.bindingsHolder
    );
  }

  onlyJson() {
    return (
      !this.tableName &&
      this.grouped.columns &&
      this.grouped.columns.length === 1 &&
      this.grouped.columns[0].type === 'json'
    );
  }

  limit() {
    const noLimit = !this.single.limit && this.single.limit !== 0;
    if (noLimit) return '';
    return `limit ${this._getValueOrParameterFromAttribute('limit')}`;
  }

  offset() {
    if (!this.single.offset) return '';
    return `offset ${this._getValueOrParameterFromAttribute('offset')}`;
  }

  // Compiles a `delete` query.
  del() {
    // Make sure tableName is processed by the formatter first.
    const { tableName } = this;
    const withSQL = this.with();
    const wheres = this.where();
    const joins = this.join();
    // When using joins, delete the "from" table values as a default
    const deleteSelector = joins ? tableName + ' ' : '';
    return (
      withSQL +
      `delete ${deleteSelector}from ${
        this.single.only ? 'only ' : ''
      }${tableName}` +
      (joins ? ` ${joins}` : '') +
      (wheres ? ` ${wheres}` : '')
    );
  }

  // Compiles a `truncate` query.
  truncate() {
    return `truncate ${this.tableName}`;
  }

  // Compiles the "locks".
  lock() {
    if (this.single.lock) {
      return this[this.single.lock]();
    }
  }

  // Compiles the wait mode on the locks.
  waitMode() {
    if (this.single.waitMode) {
      return this[this.single.waitMode]();
    }
  }

  // Fail on unsupported databases
  skipLocked() {
    throw new Error(
      '.skipLocked() is currently only supported on MySQL 8.0+ and PostgreSQL 9.5+'
    );
  }

  // Fail on unsupported databases
  noWait() {
    throw new Error(
      '.noWait() is currently only supported on MySQL 8.0+, MariaDB 10.3.0+ and PostgreSQL 9.5+'
    );
  }

  distinctOn(value) {
    throw new Error('.distinctOn() is currently only supported on PostgreSQL');
  }

  // On Clause
  // ------

  onWrapped(clause) {
    const self = this;

    const wrapJoin = new JoinClause();
    clause.value.call(wrapJoin, wrapJoin);

    let sql = '';

    for (let ii = 0; ii < wrapJoin.clauses.length; ii++) {
      const wrapClause = wrapJoin.clauses[ii];
      if (ii > 0) {
        sql += ` ${wrapClause.bool} `;
      }
      const val = self[wrapClause.type](wrapClause);
      if (val) {
        sql += val;
      }
    }

    if (sql.length) {
      return `(${sql})`;
    }
    return '';
  }

  onBasic(clause) {
    const toWrap = clause.value instanceof QueryBuilder$3;
    return (
      wrap_$2(
        clause.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      operator_$2(
        clause.operator,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      (toWrap ? '(' : '') +
      wrap_$2(
        clause.value,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      (toWrap ? ')' : '')
    );
  }

  onVal(clause) {
    return (
      wrap_$2(
        clause.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      operator_$2(
        clause.operator,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      this.client.parameter(clause.value, this.builder, this.bindingsHolder)
    );
  }

  onRaw(clause) {
    return unwrapRaw_(
      clause.value,
      undefined,
      this.builder,
      this.client,
      this.bindingsHolder
    );
  }

  onUsing(clause) {
    return (
      '(' +
      columnize_$3(
        clause.column,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ')'
    );
  }

  // Where Clause
  // ------

  _valueClause(statement) {
    return statement.asColumn
      ? wrap_$2(
          statement.value,
          undefined,
          this.builder,
          this.client,
          this.bindingsHolder
        )
      : this.client.parameter(
          statement.value,
          this.builder,
          this.bindingsHolder
        );
  }

  _columnClause(statement) {
    let columns;
    if (Array.isArray(statement.column)) {
      columns = `(${columnize_$3(
        statement.column,
        this.builder,
        this.client,
        this.bindingsHolder
      )})`;
    } else {
      columns = wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      );
    }
    return columns;
  }

  whereIn(statement) {
    const values = this.client.values(
      statement.value,
      this.builder,
      this.bindingsHolder
    );
    return `${this._columnClause(statement)} ${this._not(
      statement,
      'in '
    )}${values}`;
  }

  whereLike(statement) {
    return `${this._columnClause(statement)} ${this._not(
      statement,
      'like '
    )}${this._valueClause(statement)}`;
  }

  whereILike(statement) {
    return `${this._columnClause(statement)} ${this._not(
      statement,
      'ilike '
    )}${this._valueClause(statement)}`;
  }

  whereNull(statement) {
    return (
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' is ' +
      this._not(statement, 'null')
    );
  }

  // Compiles a basic "where" clause.
  whereBasic(statement) {
    return (
      this._not(statement, '') +
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      operator_$2(
        statement.operator,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      this._valueClause(statement)
    );
  }

  whereExists(statement) {
    return (
      this._not(statement, 'exists') +
      ' (' +
      rawOrFn_(
        statement.value,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ')'
    );
  }

  whereWrapped(statement) {
    const val = rawOrFn_(
      statement.value,
      'where',
      this.builder,
      this.client,
      this.bindingsHolder
    );
    return (val && this._not(statement, '') + '(' + val.slice(6) + ')') || '';
  }

  whereBetween(statement) {
    return (
      wrap_$2(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      this._not(statement, 'between') +
      ' ' +
      statement.value
        .map((value) =>
          this.client.parameter(value, this.builder, this.bindingsHolder)
        )
        .join(' and ')
    );
  }

  // Compiles a "whereRaw" query.
  whereRaw(statement) {
    return (
      this._not(statement, '') +
      unwrapRaw_(
        statement.value,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      )
    );
  }

  _jsonWrapValue(jsonValue) {
    if (!this.builder._isJsonObject(jsonValue)) {
      try {
        return JSON.stringify(JSON.parse(jsonValue.replace(/\n|\t/g, '')));
      } catch (e) {
        return jsonValue;
      }
    }
    return JSON.stringify(jsonValue);
  }

  _jsonValueClause(statement) {
    statement.value = this._jsonWrapValue(statement.value);
    return this._valueClause(statement);
  }

  whereJsonObject(statement) {
    return `${this._columnClause(statement)} ${
      statement.not ? '!=' : '='
    } ${this._jsonValueClause(statement)}`;
  }

  wrap(str) {
    if (str.charAt(0) !== '(') return `(${str})`;
    return str;
  }

  json(stmt) {
    return this[stmt.method](stmt.params);
  }

  analytic(stmt) {
    let sql = '';
    const self = this;
    sql += stmt.method + '() over (';

    if (stmt.raw) {
      sql += stmt.raw;
    } else {
      if (stmt.partitions.length) {
        sql += 'partition by ';
        sql +=
          map$1(stmt.partitions, function (partition) {
            if (isString$5(partition)) {
              return self.formatter.columnize(partition);
            } else return self.formatter.columnize(partition.column) + (partition.order ? ' ' + partition.order : '');
          }).join(', ') + ' ';
      }

      sql += 'order by ';
      sql += map$1(stmt.order, function (order) {
        if (isString$5(order)) {
          return self.formatter.columnize(order);
        } else return self.formatter.columnize(order.column) + (order.order ? ' ' + order.order : '');
      }).join(', ');
    }

    sql += ')';

    if (stmt.alias) {
      sql += ' as ' + stmt.alias;
    }

    return sql;
  }

  // Compiles all `with` statements on the query.
  with() {
    if (!this.grouped.with || !this.grouped.with.length) {
      return '';
    }
    const withs = this.grouped.with;
    if (!withs) return;
    const sql = [];
    let i = -1;
    let isRecursive = false;
    while (++i < withs.length) {
      const stmt = withs[i];
      if (stmt.recursive) {
        isRecursive = true;
      }
      const val = this[stmt.type](stmt);
      sql.push(val);
    }
    return `with ${isRecursive ? 'recursive ' : ''}${sql.join(', ')} `;
  }

  withWrapped(statement) {
    const val = rawOrFn_(
      statement.value,
      undefined,
      this.builder,
      this.client,
      this.bindingsHolder
    );
    const columnList = statement.columnList
      ? '(' +
        columnize_$3(
          statement.columnList,
          this.builder,
          this.client,
          this.bindingsHolder
        ) +
        ')'
      : '';
    const materialized =
      statement.materialized === undefined
        ? ''
        : statement.materialized
        ? 'materialized '
        : 'not materialized ';
    return (
      (val &&
        columnize_$3(
          statement.alias,
          this.builder,
          this.client,
          this.bindingsHolder
        ) +
          columnList +
          ' as ' +
          materialized +
          '(' +
          val +
          ')') ||
      ''
    );
  }

  // Determines whether to add a "not" prefix to the where clause.
  _not(statement, str) {
    if (statement.not) return `not ${str}`;
    return str;
  }

  _prepInsert(data) {
    const isRaw = rawOrFn_(
      data,
      undefined,
      this.builder,
      this.client,
      this.bindingsHolder
    );
    if (isRaw) return isRaw;
    let columns = [];
    const values = [];
    if (!Array.isArray(data)) data = data ? [data] : [];
    let i = -1;
    while (++i < data.length) {
      if (data[i] == null) break;
      if (i === 0) columns = Object.keys(data[i]).sort();
      const row = new Array(columns.length);
      const keys = Object.keys(data[i]);
      let j = -1;
      while (++j < keys.length) {
        const key = keys[j];
        let idx = columns.indexOf(key);
        if (idx === -1) {
          columns = columns.concat(key).sort();
          idx = columns.indexOf(key);
          let k = -1;
          while (++k < values.length) {
            values[k].splice(idx, 0, undefined);
          }
          row.splice(idx, 0, undefined);
        }
        row[idx] = data[i][key];
      }
      values.push(row);
    }
    return {
      columns,
      values,
    };
  }

  // "Preps" the update.
  _prepUpdate(data = {}) {
    const { counter = {} } = this.single;

    for (const column of Object.keys(counter)) {
      //Skip?
      if (has$2(data, column)) {
        //Needed?
        this.client.logger.warn(
          `increment/decrement called for a column that has already been specified in main .update() call. Ignoring increment/decrement and using value from .update() call.`
        );
        continue;
      }

      let value = counter[column];

      const symbol = value < 0 ? '-' : '+';

      if (symbol === '-') {
        value = -value;
      }

      data[column] = this.client.raw(`?? ${symbol} ?`, [column, value]);
    }

    data = omitBy(data, isUndefined);

    const vals = [];
    const columns = Object.keys(data);
    let i = -1;

    while (++i < columns.length) {
      vals.push(
        wrap_$2(
          columns[i],
          undefined,
          this.builder,
          this.client,
          this.bindingsHolder
        ) +
          ' = ' +
          this.client.parameter(
            data[columns[i]],
            this.builder,
            this.bindingsHolder
          )
      );
    }

    if (isEmpty$1(vals)) {
      throw new Error(
        [
          'Empty .update() call detected!',
          'Update data does not contain any values to update.',
          'This will result in a faulty query.',
          this.single.table ? `Table: ${this.single.table}.` : '',
          this.single.update
            ? `Columns: ${Object.keys(this.single.update)}.`
            : '',
        ].join(' ')
      );
    }

    return vals;
  }

  _formatGroupsItemValue(value, nulls) {
    const { formatter } = this;
    let nullOrder = '';
    if (nulls === 'last') {
      nullOrder = ' is null';
    } else if (nulls === 'first') {
      nullOrder = ' is not null';
    }

    let groupOrder;
    if (value instanceof Raw$2) {
      groupOrder = unwrapRaw_(
        value,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      );
    } else if (value instanceof QueryBuilder$3 || nulls) {
      groupOrder = '(' + formatter.columnize(value) + nullOrder + ')';
    } else {
      groupOrder = formatter.columnize(value);
    }
    return groupOrder;
  }

  _basicGroupOrder(item, type) {
    const column = this._formatGroupsItemValue(item.value, item.nulls);
    const direction =
      type === 'order' && item.type !== 'orderByRaw'
        ? ` ${direction_(
            item.direction,
            this.builder,
            this.client,
            this.bindingsHolder
          )}`
        : '';
    return column + direction;
  }

  _groupOrder(item, type) {
    return this._basicGroupOrder(item, type);
  }

  _groupOrderNulls(item, type) {
    const column = this._formatGroupsItemValue(item.value);
    const direction =
      type === 'order' && item.type !== 'orderByRaw'
        ? ` ${direction_(
            item.direction,
            this.builder,
            this.client,
            this.bindingsHolder
          )}`
        : '';
    if (item.nulls && !(item.value instanceof Raw$2)) {
      return `${column}${direction ? direction : ''} nulls ${item.nulls}`;
    }
    return column + direction;
  }

  // Compiles the `order by` statements.
  _groupsOrders(type) {
    const items = this.grouped[type];
    if (!items) return '';
    const sql = items.map((item) => {
      return this._groupOrder(item, type);
    });
    return sql.length ? type + ' by ' + sql.join(', ') : '';
  }

  // Get the table name, wrapping it if necessary.
  // Implemented as a property to prevent ordering issues as described in #704.
  get tableName() {
    if (!this._tableName) {
      // Only call this.formatter.wrap() the first time this property is accessed.
      let tableName = this.single.table;
      const schemaName = this.single.schema;

      if (tableName && schemaName) {
        const isQueryBuilder = tableName instanceof QueryBuilder$3;
        const isRawQuery = tableName instanceof Raw$2;
        const isFunction = typeof tableName === 'function';

        if (!isQueryBuilder && !isRawQuery && !isFunction) {
          tableName = `${schemaName}.${tableName}`;
        }
      }

      this._tableName = tableName
        ? // Wrap subQuery with parenthesis, #3485
          wrap_$2(
            tableName,
            tableName instanceof QueryBuilder$3,
            this.builder,
            this.client,
            this.bindingsHolder
          )
        : '';
    }
    return this._tableName;
  }

  _jsonPathWrap(extraction) {
    return this.client.parameter(
      extraction.path || extraction[1],
      this.builder,
      this.bindingsHolder
    );
  }

  // Json common functions
  _jsonExtract(nameFunction, params) {
    let extractions;
    if (Array.isArray(params.column)) {
      extractions = params.column;
    } else {
      extractions = [params];
    }
    if (!Array.isArray(nameFunction)) {
      nameFunction = [nameFunction];
    }
    return extractions
      .map((extraction) => {
        let jsonCol = `${columnize_$3(
          extraction.column || extraction[0],
          this.builder,
          this.client,
          this.bindingsHolder
        )}, ${this._jsonPathWrap(extraction)}`;
        nameFunction.forEach((f) => {
          jsonCol = f + '(' + jsonCol + ')';
        });
        const alias = extraction.alias || extraction[2];
        return alias
          ? this.client.alias(jsonCol, this.formatter.wrap(alias))
          : jsonCol;
      })
      .join(', ');
  }

  _jsonSet(nameFunction, params) {
    const jsonSet = `${nameFunction}(${columnize_$3(
      params.column,
      this.builder,
      this.client,
      this.bindingsHolder
    )}, ${this.client.parameter(
      params.path,
      this.builder,
      this.bindingsHolder
    )}, ${this.client.parameter(
      params.value,
      this.builder,
      this.bindingsHolder
    )})`;
    return params.alias
      ? this.client.alias(jsonSet, this.formatter.wrap(params.alias))
      : jsonSet;
  }

  _whereJsonPath(nameFunction, statement) {
    return `${nameFunction}(${this._columnClause(
      statement
    )}, ${this._jsonPathWrap({ path: statement.jsonPath })}) ${operator_$2(
      statement.operator,
      this.builder,
      this.client,
      this.bindingsHolder
    )} ${this._jsonValueClause(statement)}`;
  }

  _onJsonPathEquals(nameJoinFunction, clause) {
    return (
      nameJoinFunction +
      '(' +
      wrap_$2(
        clause.columnFirst,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ', ' +
      this.client.parameter(
        clause.jsonPathFirst,
        this.builder,
        this.bindingsHolder
      ) +
      ') = ' +
      nameJoinFunction +
      '(' +
      wrap_$2(
        clause.columnSecond,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ', ' +
      this.client.parameter(
        clause.jsonPathSecond,
        this.builder,
        this.bindingsHolder
      ) +
      ')'
    );
  }
};

var querycompiler = QueryCompiler$3;

const { EventEmitter: EventEmitter$1 } = eventsExports;
const toArray$2 = toArray_1;
const assign$3 = assign_1;
const { addQueryContext: addQueryContext$1 } = helpers$7;
const saveAsyncStack = saveAsyncStack$3;
const {
  augmentWithBuilderInterface,
} = builderInterfaceAugmenter;

// Constructor for the builder instance, typically called from
// `knex.builder`, accepting the current `knex` instance,
// and pulling out the `client` and `grammar` from the current
// knex instance.
let SchemaBuilder$1 = class SchemaBuilder extends EventEmitter$1 {
  constructor(client) {
    super();
    this.client = client;
    this._sequence = [];

    if (client.config) {
      this._debug = client.config.debug;
      saveAsyncStack(this, 4);
    }
  }

  withSchema(schemaName) {
    this._schema = schemaName;
    return this;
  }

  toString() {
    return this.toQuery();
  }

  toSQL() {
    return this.client.schemaCompiler(this).toSQL();
  }

  async generateDdlCommands() {
    return await this.client.schemaCompiler(this).generateDdlCommands();
  }
};

// Each of the schema builder methods just add to the
// "_sequence" array for consistency.
[
  'createTable',
  'createTableIfNotExists',
  'createTableLike',
  'createView',
  'createViewOrReplace',
  'createMaterializedView',
  'refreshMaterializedView',
  'dropView',
  'dropViewIfExists',
  'dropMaterializedView',
  'dropMaterializedViewIfExists',
  'createSchema',
  'createSchemaIfNotExists',
  'dropSchema',
  'dropSchemaIfExists',
  'createExtension',
  'createExtensionIfNotExists',
  'dropExtension',
  'dropExtensionIfExists',
  'table',
  'alterTable',
  'view',
  'alterView',
  'hasTable',
  'hasColumn',
  'dropTable',
  'renameTable',
  'renameView',
  'dropTableIfExists',
  'raw',
].forEach(function (method) {
  SchemaBuilder$1.prototype[method] = function () {
    if (method === 'createTableIfNotExists') {
      this.client.logger.warn(
        [
          'Use async .hasTable to check if table exists and then use plain .createTable. Since ',
          '.createTableIfNotExists actually just generates plain "CREATE TABLE IF NOT EXIST..." ',
          'query it will not work correctly if there are any alter table queries generated for ',
          'columns afterwards. To not break old migrations this function is left untouched for now',
          ', but it should not be used when writing new code and it is removed from documentation.',
        ].join('')
      );
    }
    if (method === 'table') method = 'alterTable';
    if (method === 'view') method = 'alterView';
    this._sequence.push({
      method,
      args: toArray$2(arguments),
    });
    return this;
  };
});

SchemaBuilder$1.extend = (methodName, fn) => {
  if (
    Object.prototype.hasOwnProperty.call(SchemaBuilder$1.prototype, methodName)
  ) {
    throw new Error(
      `Can't extend SchemaBuilder with existing method ('${methodName}').`
    );
  }

  assign$3(SchemaBuilder$1.prototype, { [methodName]: fn });
};

augmentWithBuilderInterface(SchemaBuilder$1);
addQueryContext$1(SchemaBuilder$1);

var builder = SchemaBuilder$1;

const tail$2 = tail_1;
const { isString: isString$4 } = is;

// Push a new query onto the compiled "sequence" stack,
// creating a new formatter, returning the compiler.
function pushQuery$3(query) {
  if (!query) return;
  if (isString$4(query)) {
    query = { sql: query };
  }
  if (!query.bindings) {
    query.bindings = this.bindingsHolder.bindings;
  }
  this.sequence.push(query);

  this.formatter = this.client.formatter(this._commonBuilder);
  this.bindings = [];
  this.formatter.bindings = this.bindings;
}

// Used in cases where we need to push some additional column specific statements.
function pushAdditional$2(fn) {
  const child = new this.constructor(
    this.client,
    this.tableCompiler,
    this.columnBuilder
  );
  fn.call(child, tail$2(arguments));
  this.sequence.additional = (this.sequence.additional || []).concat(
    child.sequence
  );
}

// Unshift a new query onto the compiled "sequence" stack,
// creating a new formatter, returning the compiler.
function unshiftQuery$2(query) {
  if (!query) return;
  if (isString$4(query)) {
    query = { sql: query };
  }
  if (!query.bindings) {
    query.bindings = this.bindingsHolder.bindings;
  }
  this.sequence.unshift(query);

  this.formatter = this.client.formatter(this._commonBuilder);
  this.bindings = [];
  this.formatter.bindings = this.bindings;
}

var helpers$4 = {
  pushAdditional: pushAdditional$2,
  pushQuery: pushQuery$3,
  unshiftQuery: unshiftQuery$2,
};

const {
  pushQuery: pushQuery$2,
  pushAdditional: pushAdditional$1,
  unshiftQuery: unshiftQuery$1,
} = helpers$4;

// The "SchemaCompiler" takes all of the query statements which have been
// gathered in the "SchemaBuilder" and turns them into an array of
// properly formatted / bound query strings.
let SchemaCompiler$3 = class SchemaCompiler {
  constructor(client, builder) {
    this.builder = builder;
    this._commonBuilder = this.builder;
    this.client = client;
    this.schema = builder._schema;

    this.bindings = [];
    this.bindingsHolder = this;
    this.formatter = client.formatter(builder);
    this.formatter.bindings = this.bindings;
    this.sequence = [];
  }

  createSchema() {
    throwOnlyPGError('createSchema');
  }

  createSchemaIfNotExists() {
    throwOnlyPGError('createSchemaIfNotExists');
  }

  dropSchema() {
    throwOnlyPGError('dropSchema');
  }

  dropSchemaIfExists() {
    throwOnlyPGError('dropSchemaIfExists');
  }

  dropTable(tableName) {
    this.pushQuery(
      this.dropTablePrefix +
        this.formatter.wrap(prefixedTableName(this.schema, tableName))
    );
  }

  dropTableIfExists(tableName) {
    this.pushQuery(
      this.dropTablePrefix +
        'if exists ' +
        this.formatter.wrap(prefixedTableName(this.schema, tableName))
    );
  }

  dropView(viewName) {
    this._dropView(viewName, false, false);
  }

  dropViewIfExists(viewName) {
    this._dropView(viewName, true, false);
  }

  dropMaterializedView(viewName) {
    throw new Error('materialized views are not supported by this dialect.');
  }

  dropMaterializedViewIfExists(viewName) {
    throw new Error('materialized views are not supported by this dialect.');
  }

  renameView(from, to) {
    throw new Error(
      'rename view is not supported by this dialect (instead drop then create another view).'
    );
  }

  refreshMaterializedView() {
    throw new Error('materialized views are not supported by this dialect.');
  }

  _dropView(viewName, ifExists, materialized) {
    this.pushQuery(
      (materialized ? this.dropMaterializedViewPrefix : this.dropViewPrefix) +
        (ifExists ? 'if exists ' : '') +
        this.formatter.wrap(prefixedTableName(this.schema, viewName))
    );
  }

  raw(sql, bindings) {
    this.sequence.push(this.client.raw(sql, bindings).toSQL());
  }

  toSQL() {
    const sequence = this.builder._sequence;
    for (let i = 0, l = sequence.length; i < l; i++) {
      const query = sequence[i];
      this[query.method].apply(this, query.args);
    }
    return this.sequence;
  }

  async generateDdlCommands() {
    const generatedCommands = this.toSQL();
    return {
      pre: [],
      sql: Array.isArray(generatedCommands)
        ? generatedCommands
        : [generatedCommands],
      check: null,
      post: [],
    };
  }
};

SchemaCompiler$3.prototype.dropTablePrefix = 'drop table ';
SchemaCompiler$3.prototype.dropViewPrefix = 'drop view ';
SchemaCompiler$3.prototype.dropMaterializedViewPrefix = 'drop materialized view ';
SchemaCompiler$3.prototype.alterViewPrefix = 'alter view ';

SchemaCompiler$3.prototype.alterTable = buildTable('alter');
SchemaCompiler$3.prototype.createTable = buildTable('create');
SchemaCompiler$3.prototype.createTableIfNotExists = buildTable('createIfNot');
SchemaCompiler$3.prototype.createTableLike = buildTable('createLike');

SchemaCompiler$3.prototype.createView = buildView('create');
SchemaCompiler$3.prototype.createViewOrReplace = buildView('createOrReplace');
SchemaCompiler$3.prototype.createMaterializedView = buildView(
  'createMaterializedView'
);
SchemaCompiler$3.prototype.alterView = buildView('alter');

SchemaCompiler$3.prototype.pushQuery = pushQuery$2;
SchemaCompiler$3.prototype.pushAdditional = pushAdditional$1;
SchemaCompiler$3.prototype.unshiftQuery = unshiftQuery$1;

function build(builder) {
  // pass queryContext down to tableBuilder but do not overwrite it if already set
  const queryContext = this.builder.queryContext();
  if (queryContext !== undefined && builder.queryContext() === undefined) {
    builder.queryContext(queryContext);
  }

  builder.setSchema(this.schema);
  const sql = builder.toSQL();

  for (let i = 0, l = sql.length; i < l; i++) {
    this.sequence.push(sql[i]);
  }
}

function buildTable(type) {
  if (type === 'createLike') {
    return function (tableName, tableNameLike, fn) {
      const builder = this.client.tableBuilder(
        type,
        tableName,
        tableNameLike,
        fn
      );
      build.call(this, builder);
    };
  } else {
    return function (tableName, fn) {
      const builder = this.client.tableBuilder(type, tableName, null, fn);
      build.call(this, builder);
    };
  }
}

function buildView(type) {
  return function (viewName, fn) {
    const builder = this.client.viewBuilder(type, viewName, fn);
    build.call(this, builder);
  };
}

function prefixedTableName(prefix, table) {
  return prefix ? `${prefix}.${table}` : table;
}

function throwOnlyPGError(operationName) {
  throw new Error(
    `${operationName} is not supported for this dialect (only PostgreSQL supports it currently).`
  );
}

var compiler = SchemaCompiler$3;

// TableBuilder

// Takes the function passed to the "createTable" or "table/editTable"
// functions and calls it with the "TableBuilder" as both the context and
// the first argument. Inside this function we can specify what happens to the
// method, pushing everything we want to do onto the "allStatements" array,
// which is then compiled into sql.
// ------
const each = each$2;
const extend$3 = extend$4;
const assign$2 = assign_1;
const toArray$1 = toArray_1;
const helpers$3 = helpers$7;
const { isString: isString$3, isFunction: isFunction$1, isObject: isObject$2 } = is;

let TableBuilder$1 = class TableBuilder {
  constructor(client, method, tableName, tableNameLike, fn) {
    this.client = client;
    this._fn = fn;
    this._method = method;
    this._schemaName = undefined;
    this._tableName = tableName;
    this._tableNameLike = tableNameLike;
    this._statements = [];
    this._single = {};

    if (!tableNameLike && !isFunction$1(this._fn)) {
      throw new TypeError(
        'A callback function must be supplied to calls against `.createTable` ' +
          'and `.table`'
      );
    }
  }

  setSchema(schemaName) {
    this._schemaName = schemaName;
  }

  // Convert the current tableBuilder object "toSQL"
  // giving us additional methods if we're altering
  // rather than creating the table.
  toSQL() {
    if (this._method === 'alter') {
      extend$3(this, AlterMethods$2);
    }
    // With 'create table ... like' callback function is useless.
    if (this._fn) {
      this._fn.call(this, this);
    }
    return this.client.tableCompiler(this).toSQL();
  }

  // The "timestamps" call is really just sets the `created_at` and `updated_at` columns.

  timestamps(useTimestamps, defaultToNow, useCamelCase) {
    if (isObject$2(useTimestamps)) {
      ({ useTimestamps, defaultToNow, useCamelCase } = useTimestamps);
    }
    const method = useTimestamps === true ? 'timestamp' : 'datetime';
    const createdAt = this[method](useCamelCase ? 'createdAt' : 'created_at');
    const updatedAt = this[method](useCamelCase ? 'updatedAt' : 'updated_at');

    if (defaultToNow === true) {
      const now = this.client.raw('CURRENT_TIMESTAMP');
      createdAt.notNullable().defaultTo(now);
      updatedAt.notNullable().defaultTo(now);
    }
  }

  // Set the comment value for a table, they're only allowed to be called
  // once per table.
  comment(value) {
    if (typeof value !== 'string') {
      throw new TypeError('Table comment must be string');
    }
    this._single.comment = value;
  }

  // Set a foreign key on the table, calling
  // `table.foreign('column_name').references('column').on('table').onDelete()...
  // Also called from the ColumnBuilder context when chaining.
  foreign(column, keyName) {
    const foreignData = { column: column, keyName: keyName };
    this._statements.push({
      grouping: 'alterTable',
      method: 'foreign',
      args: [foreignData],
    });
    let returnObj = {
      references(tableColumn) {
        let pieces;
        if (isString$3(tableColumn)) {
          pieces = tableColumn.split('.');
        }
        if (!pieces || pieces.length === 1) {
          foreignData.references = pieces ? pieces[0] : tableColumn;
          return {
            on(tableName) {
              if (typeof tableName !== 'string') {
                throw new TypeError(
                  `Expected tableName to be a string, got: ${typeof tableName}`
                );
              }
              foreignData.inTable = tableName;
              return returnObj;
            },
            inTable() {
              return this.on.apply(this, arguments);
            },
          };
        }
        foreignData.inTable = pieces[0];
        foreignData.references = pieces[1];
        return returnObj;
      },
      withKeyName(keyName) {
        foreignData.keyName = keyName;
        return returnObj;
      },
      onUpdate(statement) {
        foreignData.onUpdate = statement;
        return returnObj;
      },
      onDelete(statement) {
        foreignData.onDelete = statement;
        return returnObj;
      },
      deferrable: (type) => {
        const unSupported = [
          'mysql',
          'mssql',
          'redshift',
          'mysql2',
          'oracledb',
        ];
        if (unSupported.indexOf(this.client.dialect) !== -1) {
          throw new Error(`${this.client.dialect} does not support deferrable`);
        }
        foreignData.deferrable = type;
        return returnObj;
      },
      _columnBuilder(builder) {
        extend$3(builder, returnObj);
        returnObj = builder;
        return builder;
      },
    };
    return returnObj;
  }

  check(checkPredicate, bindings, constraintName) {
    this._statements.push({
      grouping: 'checks',
      args: [checkPredicate, bindings, constraintName],
    });
    return this;
  }
};

[
  // Each of the index methods can be called individually, with the
  // column name to be used, e.g. table.unique('column').
  'index',
  'primary',
  'unique',

  // Key specific
  'dropPrimary',
  'dropUnique',
  'dropIndex',
  'dropForeign',
].forEach((method) => {
  TableBuilder$1.prototype[method] = function () {
    this._statements.push({
      grouping: 'alterTable',
      method,
      args: toArray$1(arguments),
    });
    return this;
  };
});

// Warn for dialect-specific table methods, since that's the
// only time these are supported.
const specialMethods = {
  mysql: ['engine', 'charset', 'collate'],
  postgresql: ['inherits'],
};
each(specialMethods, function (methods, dialect) {
  methods.forEach(function (method) {
    TableBuilder$1.prototype[method] = function (value) {
      if (this.client.dialect !== dialect) {
        throw new Error(
          `Knex only supports ${method} statement with ${dialect}.`
        );
      }
      if (this._method === 'alter') {
        throw new Error(
          `Knex does not support altering the ${method} outside of create ` +
            `table, please use knex.raw statement.`
        );
      }
      this._single[method] = value;
    };
  });
});

helpers$3.addQueryContext(TableBuilder$1);

// Each of the column types that we can add, we create a new ColumnBuilder
// instance and push it onto the statements array.
const columnTypes = [
  // Numeric
  'tinyint',
  'smallint',
  'mediumint',
  'int',
  'bigint',
  'decimal',
  'float',
  'double',
  'real',
  'bit',
  'boolean',
  'serial',

  // Date / Time
  'date',
  'datetime',
  'timestamp',
  'time',
  'year',

  // Geometry
  'geometry',
  'geography',
  'point',

  // String
  'char',
  'varchar',
  'tinytext',
  'tinyText',
  'text',
  'mediumtext',
  'mediumText',
  'longtext',
  'longText',
  'binary',
  'varbinary',
  'tinyblob',
  'tinyBlob',
  'mediumblob',
  'mediumBlob',
  'blob',
  'longblob',
  'longBlob',
  'enum',
  'set',

  // Increments, Aliases, and Additional
  'bool',
  'dateTime',
  'increments',
  'bigincrements',
  'bigIncrements',
  'integer',
  'biginteger',
  'bigInteger',
  'string',
  'json',
  'jsonb',
  'uuid',
  'enu',
  'specificType',
];

// For each of the column methods, create a new "ColumnBuilder" interface,
// push it onto the "allStatements" stack, and then return the interface,
// with which we can add indexes, etc.
columnTypes.forEach((type) => {
  TableBuilder$1.prototype[type] = function () {
    const args = toArray$1(arguments);
    const builder = this.client.columnBuilder(this, type, args);
    this._statements.push({
      grouping: 'columns',
      builder,
    });
    return builder;
  };
});

const AlterMethods$2 = {
  // Renames the current column `from` the current
  // TODO: this.column(from).rename(to)
  renameColumn(from, to) {
    this._statements.push({
      grouping: 'alterTable',
      method: 'renameColumn',
      args: [from, to],
    });
    return this;
  },

  dropTimestamps() {
    // arguments[0] = useCamelCase
    return this.dropColumns(
      arguments[0] === true
        ? ['createdAt', 'updatedAt']
        : ['created_at', 'updated_at']
    );
  },

  setNullable(column) {
    this._statements.push({
      grouping: 'alterTable',
      method: 'setNullable',
      args: [column],
    });

    return this;
  },

  check(checkPredicate, bindings, constraintName) {
    this._statements.push({
      grouping: 'alterTable',
      method: 'check',
      args: [checkPredicate, bindings, constraintName],
    });
  },

  dropChecks() {
    this._statements.push({
      grouping: 'alterTable',
      method: 'dropChecks',
      args: toArray$1(arguments),
    });
  },

  dropNullable(column) {
    this._statements.push({
      grouping: 'alterTable',
      method: 'dropNullable',
      args: [column],
    });

    return this;
  },

  // TODO: changeType
};

// Drop a column from the current table.
// TODO: Enable this.column(columnName).drop();
AlterMethods$2.dropColumn = AlterMethods$2.dropColumns = function () {
  this._statements.push({
    grouping: 'alterTable',
    method: 'dropColumn',
    args: toArray$1(arguments),
  });
  return this;
};

TableBuilder$1.extend = (methodName, fn) => {
  if (
    Object.prototype.hasOwnProperty.call(TableBuilder$1.prototype, methodName)
  ) {
    throw new Error(
      `Can't extend TableBuilder with existing method ('${methodName}').`
    );
  }

  assign$2(TableBuilder$1.prototype, { [methodName]: fn });
};

var tablebuilder = TableBuilder$1;

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */

function baseFindIndex$1(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

var _baseFindIndex = baseFindIndex$1;

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */

function baseIsNaN$1(value) {
  return value !== value;
}

var _baseIsNaN = baseIsNaN$1;

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */

function strictIndexOf$1(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

var _strictIndexOf = strictIndexOf$1;

var baseFindIndex = _baseFindIndex,
    baseIsNaN = _baseIsNaN,
    strictIndexOf = _strictIndexOf;

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf$1(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

var _baseIndexOf = baseIndexOf$1;

var baseIndexOf = _baseIndexOf,
    toInteger = toInteger_1;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Gets the index at which the first occurrence of `value` is found in `array`
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons. If `fromIndex` is negative, it's used as the
 * offset from the end of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 * @example
 *
 * _.indexOf([1, 2, 1, 2], 2);
 * // => 1
 *
 * // Search from the `fromIndex`.
 * _.indexOf([1, 2, 1, 2], 2, 2);
 * // => 3
 */
function indexOf$1(array, value, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax(length + index, 0);
  }
  return baseIndexOf(array, value, index);
}

var indexOf_1 = indexOf$1;

/* eslint max-len:0 */

// Table Compiler
// -------
const {
  pushAdditional,
  pushQuery: pushQuery$1,
  unshiftQuery,
} = helpers$4;
const helpers$2 = helpers$7;
const groupBy$2 = groupBy_1;
const indexOf = indexOf_1;
const isEmpty = isEmpty_1;
const tail$1 = tail_1;
const { normalizeArr } = helpers$7;

let TableCompiler$3 = class TableCompiler {
  constructor(client, tableBuilder) {
    this.client = client;
    this.tableBuilder = tableBuilder;
    this._commonBuilder = this.tableBuilder;
    this.method = tableBuilder._method;
    this.schemaNameRaw = tableBuilder._schemaName;
    this.tableNameRaw = tableBuilder._tableName;
    this.tableNameLikeRaw = tableBuilder._tableNameLike;
    this.single = tableBuilder._single;
    this.grouped = groupBy$2(tableBuilder._statements, 'grouping');

    this.formatter = client.formatter(tableBuilder);
    this.bindings = [];
    this.formatter.bindings = this.bindings;
    this.bindingsHolder = this;

    this.sequence = [];
    this._formatting = client.config && client.config.formatting;

    this.checksCount = 0;
  }

  // Convert the tableCompiler toSQL
  toSQL() {
    this[this.method]();
    return this.sequence;
  }

  // Column Compilation
  // -------

  // If this is a table "creation", we need to first run through all
  // of the columns to build them into a single string,
  // and then run through anything else and push it to the query sequence.
  create(ifNot, like) {
    const columnBuilders = this.getColumns();
    const columns = columnBuilders.map((col) => col.toSQL());
    const columnTypes = this.getColumnTypes(columns);
    if (this.createAlterTableMethods) {
      this.alterTableForCreate(columnTypes);
    }
    this.createQuery(columnTypes, ifNot, like);
    this.columnQueries(columns);
    delete this.single.comment;
    this.alterTable();
  }

  // Only create the table if it doesn't exist.
  createIfNot() {
    this.create(true);
  }

  createLike() {
    this.create(false, true);
  }

  createLikeIfNot() {
    this.create(true, true);
  }

  // If we're altering the table, we need to one-by-one
  // go through and handle each of the queries associated
  // with altering the table's schema.
  alter() {
    const addColBuilders = this.getColumns();
    const addColumns = addColBuilders.map((col) => col.toSQL());
    const alterColBuilders = this.getColumns('alter');
    const alterColumns = alterColBuilders.map((col) => col.toSQL());
    const addColumnTypes = this.getColumnTypes(addColumns);
    const alterColumnTypes = this.getColumnTypes(alterColumns);

    this.addColumns(addColumnTypes);
    this.alterColumns(alterColumnTypes, alterColBuilders);
    this.columnQueries(addColumns);
    this.columnQueries(alterColumns);
    this.alterTable();
  }

  foreign(foreignData) {
    if (foreignData.inTable && foreignData.references) {
      const keyName = foreignData.keyName
        ? this.formatter.wrap(foreignData.keyName)
        : this._indexCommand('foreign', this.tableNameRaw, foreignData.column);
      const column = this.formatter.columnize(foreignData.column);
      const references = this.formatter.columnize(foreignData.references);
      const inTable = this.formatter.wrap(foreignData.inTable);
      const onUpdate = foreignData.onUpdate
        ? (this.lowerCase ? ' on update ' : ' ON UPDATE ') +
          foreignData.onUpdate
        : '';
      const onDelete = foreignData.onDelete
        ? (this.lowerCase ? ' on delete ' : ' ON DELETE ') +
          foreignData.onDelete
        : '';
      const deferrable = foreignData.deferrable
        ? this.lowerCase
          ? ` deferrable initially ${foreignData.deferrable.toLowerCase()} `
          : ` DEFERRABLE INITIALLY ${foreignData.deferrable.toUpperCase()} `
        : '';
      if (this.lowerCase) {
        this.pushQuery(
          (!this.forCreate ? `alter table ${this.tableName()} add ` : '') +
            'constraint ' +
            keyName +
            ' ' +
            'foreign key (' +
            column +
            ') references ' +
            inTable +
            ' (' +
            references +
            ')' +
            onUpdate +
            onDelete +
            deferrable
        );
      } else {
        this.pushQuery(
          (!this.forCreate ? `ALTER TABLE ${this.tableName()} ADD ` : '') +
            'CONSTRAINT ' +
            keyName +
            ' ' +
            'FOREIGN KEY (' +
            column +
            ') REFERENCES ' +
            inTable +
            ' (' +
            references +
            ')' +
            onUpdate +
            onDelete +
            deferrable
        );
      }
    }
  }

  // Get all of the column sql & bindings individually for building the table queries.
  getColumnTypes(columns) {
    return columns.reduce(
      function (memo, columnSQL) {
        const column = columnSQL[0];
        memo.sql.push(column.sql);
        memo.bindings.concat(column.bindings);
        return memo;
      },
      { sql: [], bindings: [] }
    );
  }

  // Adds all of the additional queries from the "column"
  columnQueries(columns) {
    const queries = columns.reduce(function (memo, columnSQL) {
      const column = tail$1(columnSQL);
      if (!isEmpty(column)) return memo.concat(column);
      return memo;
    }, []);
    for (const q of queries) {
      this.pushQuery(q);
    }
  }

  // All of the columns to "add" for the query
  addColumns(columns, prefix) {
    prefix = prefix || this.addColumnsPrefix;

    if (columns.sql.length > 0) {
      const columnSql = columns.sql.map((column) => {
        return prefix + column;
      });
      this.pushQuery({
        sql:
          (this.lowerCase ? 'alter table ' : 'ALTER TABLE ') +
          this.tableName() +
          ' ' +
          columnSql.join(', '),
        bindings: columns.bindings,
      });
    }
  }

  alterColumns(columns, colBuilders) {
    if (columns.sql.length > 0) {
      this.addColumns(columns, this.alterColumnsPrefix, colBuilders);
    }
  }

  // Compile the columns as needed for the current create or alter table
  getColumns(method) {
    const columns = this.grouped.columns || [];
    method = method || 'add';

    const queryContext = this.tableBuilder.queryContext();

    return columns
      .filter((column) => column.builder._method === method)
      .map((column) => {
        // pass queryContext down to columnBuilder but do not overwrite it if already set
        if (
          queryContext !== undefined &&
          column.builder.queryContext() === undefined
        ) {
          column.builder.queryContext(queryContext);
        }
        return this.client.columnCompiler(this, column.builder);
      });
  }

  tableName() {
    const name = this.schemaNameRaw
      ? `${this.schemaNameRaw}.${this.tableNameRaw}`
      : this.tableNameRaw;

    return this.formatter.wrap(name);
  }

  tableNameLike() {
    const name = this.schemaNameRaw
      ? `${this.schemaNameRaw}.${this.tableNameLikeRaw}`
      : this.tableNameLikeRaw;

    return this.formatter.wrap(name);
  }

  // Generate all of the alter column statements necessary for the query.
  alterTable() {
    const alterTable = this.grouped.alterTable || [];
    for (let i = 0, l = alterTable.length; i < l; i++) {
      const statement = alterTable[i];
      if (this[statement.method]) {
        this[statement.method].apply(this, statement.args);
      } else {
        this.client.logger.error(`Debug: ${statement.method} does not exist`);
      }
    }
    for (const item in this.single) {
      if (typeof this[item] === 'function') this[item](this.single[item]);
    }
  }

  alterTableForCreate(columnTypes) {
    this.forCreate = true;
    const savedSequence = this.sequence;
    const alterTable = this.grouped.alterTable || [];
    this.grouped.alterTable = [];
    for (let i = 0, l = alterTable.length; i < l; i++) {
      const statement = alterTable[i];
      if (indexOf(this.createAlterTableMethods, statement.method) < 0) {
        this.grouped.alterTable.push(statement);
        continue;
      }
      if (this[statement.method]) {
        this.sequence = [];
        this[statement.method].apply(this, statement.args);
        columnTypes.sql.push(this.sequence[0].sql);
      } else {
        this.client.logger.error(`Debug: ${statement.method} does not exist`);
      }
    }
    this.sequence = savedSequence;
    this.forCreate = false;
  }

  // Drop the index on the current table.
  dropIndex(value) {
    this.pushQuery(`drop index${value}`);
  }

  dropUnique() {
    throw new Error('Method implemented in the dialect driver');
  }

  dropForeign() {
    throw new Error('Method implemented in the dialect driver');
  }

  dropColumn() {
    const columns = helpers$2.normalizeArr.apply(null, arguments);
    const drops = (Array.isArray(columns) ? columns : [columns]).map(
      (column) => {
        return this.dropColumnPrefix + this.formatter.wrap(column);
      }
    );
    this.pushQuery(
      (this.lowerCase ? 'alter table ' : 'ALTER TABLE ') +
        this.tableName() +
        ' ' +
        drops.join(', ')
    );
  }

  //Default implementation of setNullable. Overwrite on dialect-specific tablecompiler when needed
  //(See postgres/mssql for reference)
  _setNullableState(column, nullable) {
    const tableName = this.tableName();
    const columnName = this.formatter.columnize(column);
    const alterColumnPrefix = this.alterColumnsPrefix;
    return this.pushQuery({
      sql: 'SELECT 1',
      output: () => {
        return this.client
          .queryBuilder()
          .from(this.tableNameRaw)
          .columnInfo(column)
          .then((columnInfo) => {
            if (isEmpty(columnInfo)) {
              throw new Error(
                `.setNullable: Column ${columnName} does not exist in table ${tableName}.`
              );
            }
            const nullableType = nullable ? 'null' : 'not null';
            const columnType =
              columnInfo.type +
              (columnInfo.maxLength ? `(${columnInfo.maxLength})` : '');
            const defaultValue =
              columnInfo.defaultValue !== null &&
              columnInfo.defaultValue !== void 0
                ? `default '${columnInfo.defaultValue}'`
                : '';
            const sql = `alter table ${tableName} ${alterColumnPrefix} ${columnName} ${columnType} ${nullableType} ${defaultValue}`;
            return this.client.raw(sql);
          });
      },
    });
  }

  setNullable(column) {
    return this._setNullableState(column, true);
  }

  dropNullable(column) {
    return this._setNullableState(column, false);
  }

  dropChecks(checkConstraintNames) {
    if (checkConstraintNames === undefined) return '';
    checkConstraintNames = normalizeArr(checkConstraintNames);
    const tableName = this.tableName();
    const sql = `alter table ${tableName} ${checkConstraintNames
      .map((constraint) => `drop constraint ${constraint}`)
      .join(', ')}`;
    this.pushQuery(sql);
  }

  check(checkPredicate, bindings, constraintName) {
    const tableName = this.tableName();
    let checkConstraint = constraintName;
    if (!checkConstraint) {
      this.checksCount++;
      checkConstraint = tableName + '_' + this.checksCount;
    }
    const sql = `alter table ${tableName} add constraint ${checkConstraint} check(${checkPredicate})`;
    this.pushQuery(sql);
  }

  _addChecks() {
    if (this.grouped.checks) {
      return (
        ', ' +
        this.grouped.checks
          .map((c) => {
            return `${
              c.args[2] ? 'constraint ' + c.args[2] + ' ' : ''
            }check (${this.client.raw(c.args[0], c.args[1])})`;
          })
          .join(', ')
      );
    }
    return '';
  }

  // If no name was specified for this index, we will create one using a basic
  // convention of the table name, followed by the columns, followed by an
  // index type, such as primary or index, which makes the index unique.
  _indexCommand(type, tableName, columns) {
    if (!Array.isArray(columns)) columns = columns ? [columns] : [];
    const table = tableName.replace(/\.|-/g, '_');
    const indexName = (
      table +
      '_' +
      columns.join('_') +
      '_' +
      type
    ).toLowerCase();
    return this.formatter.wrap(indexName);
  }

  _getPrimaryKeys() {
    return (this.grouped.alterTable || [])
      .filter((a) => a.method === 'primary')
      .flatMap((a) => a.args)
      .flat();
  }

  _canBeAddPrimaryKey(options) {
    return options.primaryKey && this._getPrimaryKeys().length === 0;
  }

  _getIncrementsColumnNames() {
    return this.grouped.columns
      .filter((c) => c.builder._type === 'increments')
      .map((c) => c.builder._args[0]);
  }
};

TableCompiler$3.prototype.pushQuery = pushQuery$1;
TableCompiler$3.prototype.pushAdditional = pushAdditional;
TableCompiler$3.prototype.unshiftQuery = unshiftQuery;
TableCompiler$3.prototype.lowerCase = true;
TableCompiler$3.prototype.createAlterTableMethods = null;
TableCompiler$3.prototype.addColumnsPrefix = 'add column ';
TableCompiler$3.prototype.alterColumnsPrefix = 'alter column ';
TableCompiler$3.prototype.modifyColumnPrefix = 'modify column ';
TableCompiler$3.prototype.dropColumnPrefix = 'drop column ';

var tablecompiler = TableCompiler$3;

const extend$2 = extend$4;
const assign$1 = assign_1;
const toArray = toArray_1;
const { addQueryContext } = helpers$7;

// The chainable interface off the original "column" method.
let ColumnBuilder$1 = class ColumnBuilder {
  constructor(client, tableBuilder, type, args) {
    this.client = client;
    this._method = 'add';
    this._single = {};
    this._modifiers = {};
    this._statements = [];
    this._type = columnAlias[type] || type;
    this._args = args;
    this._tableBuilder = tableBuilder;

    // If we're altering the table, extend the object
    // with the available "alter" methods.
    if (tableBuilder._method === 'alter') {
      extend$2(this, AlterMethods$1);
    }
  }

  // Specify that the current column "references" a column,
  // which may be tableName.column or just "column"
  references(value) {
    return this._tableBuilder.foreign
      .call(this._tableBuilder, this._args[0], undefined, this)
      ._columnBuilder(this)
      .references(value);
  }
};

// All of the modifier methods that can be used to modify the current query.
const modifiers = [
  'default',
  'defaultsTo',
  'defaultTo',
  'unsigned',
  'nullable',
  'first',
  'after',
  'comment',
  'collate',
  'check',
  'checkPositive',
  'checkNegative',
  'checkIn',
  'checkNotIn',
  'checkBetween',
  'checkLength',
  'checkRegex',
];

// Aliases for convenience.
const aliasMethod = {
  default: 'defaultTo',
  defaultsTo: 'defaultTo',
};

// If we call any of the modifiers (index or otherwise) on the chainable, we pretend
// as though we're calling `table.method(column)` directly.
modifiers.forEach(function (method) {
  const key = aliasMethod[method] || method;
  ColumnBuilder$1.prototype[method] = function () {
    this._modifiers[key] = toArray(arguments);
    return this;
  };
});

addQueryContext(ColumnBuilder$1);

ColumnBuilder$1.prototype.notNull = ColumnBuilder$1.prototype.notNullable =
  function notNullable() {
    return this.nullable(false);
  };

['index', 'primary', 'unique'].forEach(function (method) {
  ColumnBuilder$1.prototype[method] = function () {
    if (this._type.toLowerCase().indexOf('increments') === -1) {
      this._tableBuilder[method].apply(
        this._tableBuilder,
        [this._args[0]].concat(toArray(arguments))
      );
    }
    return this;
  };
});

ColumnBuilder$1.extend = (methodName, fn) => {
  if (
    Object.prototype.hasOwnProperty.call(ColumnBuilder$1.prototype, methodName)
  ) {
    throw new Error(
      `Can't extend ColumnBuilder with existing method ('${methodName}').`
    );
  }

  assign$1(ColumnBuilder$1.prototype, { [methodName]: fn });
};

const AlterMethods$1 = {};

// Specify that the column is to be dropped. This takes precedence
// over all other rules for the column.
AlterMethods$1.drop = function () {
  this._single.drop = true;

  return this;
};

// Specify the "type" that we're looking to set the
// Knex takes no responsibility for any data-loss that may
// occur when changing data types.
AlterMethods$1.alterType = function (type) {
  this._statements.push({
    grouping: 'alterType',
    value: type,
  });

  return this;
};

// Set column method to alter (default is add).
AlterMethods$1.alter = function ({
  alterNullable = true,
  alterType = true,
} = {}) {
  this._method = 'alter';
  this.alterNullable = alterNullable;
  this.alterType = alterType;

  return this;
};

// Alias a few methods for clarity when processing.
const columnAlias = {
  float: 'floating',
  enum: 'enu',
  boolean: 'bool',
  string: 'varchar',
  bigint: 'bigInteger',
};

var columnbuilder = ColumnBuilder$1;

/**
 * Gets the first element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias first
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the first element of `array`.
 * @example
 *
 * _.head([1, 2, 3]);
 * // => 1
 *
 * _.head([]);
 * // => undefined
 */

function head(array) {
  return (array && array.length) ? array[0] : undefined;
}

var head_1 = head;

var first$1 = head_1;

// Column Compiler
// Used for designating column definitions
// during the table "create" / "alter" statements.
// -------
const helpers$1 = helpers$4;
const groupBy$1 = groupBy_1;
const first = first$1;
const has$1 = has_1;
const tail = tail_1;
const { toNumber: toNumber$1 } = helpers$7;
const { formatDefault } = formatterUtils;
const { operator: operator_$1 } = wrappingFormatter;

let ColumnCompiler$3 = class ColumnCompiler {
  constructor(client, tableCompiler, columnBuilder) {
    this.client = client;
    this.tableCompiler = tableCompiler;
    this.columnBuilder = columnBuilder;
    this._commonBuilder = this.columnBuilder;
    this.args = columnBuilder._args;
    this.type = columnBuilder._type.toLowerCase();
    this.grouped = groupBy$1(columnBuilder._statements, 'grouping');
    this.modified = columnBuilder._modifiers;
    this.isIncrements = this.type.indexOf('increments') !== -1;

    this.formatter = client.formatter(columnBuilder);
    this.bindings = [];
    this.formatter.bindings = this.bindings;
    this.bindingsHolder = this;

    this.sequence = [];
    this.modifiers = [];

    this.checksCount = 0;
  }

  _addCheckModifiers() {
    this.modifiers.push(
      'check',
      'checkPositive',
      'checkNegative',
      'checkIn',
      'checkNotIn',
      'checkBetween',
      'checkLength',
      'checkRegex'
    );
  }

  defaults(label) {
    if (Object.prototype.hasOwnProperty.call(this._defaultMap, label)) {
      return this._defaultMap[label].bind(this)();
    } else {
      throw new Error(
        `There is no default for the specified identifier ${label}`
      );
    }
  }

  // To convert to sql, we first go through and build the
  // column as it would be in the insert statement
  toSQL() {
    this.pushQuery(this.compileColumn());
    if (this.sequence.additional) {
      this.sequence = this.sequence.concat(this.sequence.additional);
    }
    return this.sequence;
  }

  // Compiles a column.
  compileColumn() {
    return (
      this.formatter.wrap(this.getColumnName()) +
      ' ' +
      this.getColumnType() +
      this.getModifiers()
    );
  }

  // Assumes the autoincrementing key is named `id` if not otherwise specified.
  getColumnName() {
    const value = first(this.args);
    return value || this.defaults('columnName');
  }

  getColumnType() {
    // Column type is cached so side effects (such as in pg native enums) are only run once
    if (!this._columnType) {
      const type = this[this.type];
      this._columnType =
        typeof type === 'function' ? type.apply(this, tail(this.args)) : type;
    }

    return this._columnType;
  }

  getModifiers() {
    const modifiers = [];

    for (let i = 0, l = this.modifiers.length; i < l; i++) {
      const modifier = this.modifiers[i];

      //Cannot allow 'nullable' modifiers on increments types
      if (!this.isIncrements || (this.isIncrements && modifier === 'comment')) {
        if (has$1(this.modified, modifier)) {
          const val = this[modifier].apply(this, this.modified[modifier]);
          if (val) modifiers.push(val);
        }
      }
    }

    return modifiers.length > 0 ? ` ${modifiers.join(' ')}` : '';
  }

  // Types
  // ------
  varchar(length) {
    return `varchar(${toNumber$1(length, 255)})`;
  }

  floating(precision, scale) {
    return `float(${toNumber$1(precision, 8)}, ${toNumber$1(scale, 2)})`;
  }

  decimal(precision, scale) {
    if (precision === null) {
      throw new Error(
        'Specifying no precision on decimal columns is not supported for that SQL dialect.'
      );
    }
    return `decimal(${toNumber$1(precision, 8)}, ${toNumber$1(scale, 2)})`;
  }

  // Used to support custom types
  specifictype(type) {
    return type;
  }

  // Modifiers
  // -------

  nullable(nullable) {
    return nullable === false ? 'not null' : 'null';
  }

  notNullable() {
    return this.nullable(false);
  }

  defaultTo(value) {
    return `default ${formatDefault(value, this.type, this.client)}`;
  }

  increments(options = { primaryKey: true }) {
    return (
      'integer not null' +
      (this.tableCompiler._canBeAddPrimaryKey(options) ? ' primary key' : '') +
      ' autoincrement'
    );
  }

  bigincrements(options = { primaryKey: true }) {
    return this.increments(options);
  }

  _pushAlterCheckQuery(checkPredicate, constraintName) {
    let checkName = constraintName;
    if (!checkName) {
      this.checksCount++;
      checkName =
        this.tableCompiler.tableNameRaw +
        '_' +
        this.getColumnName() +
        '_' +
        this.checksCount;
    }
    this.pushAdditional(function () {
      this.pushQuery(
        `alter table ${this.tableCompiler.tableName()} add constraint ${checkName} check(${checkPredicate})`
      );
    });
  }

  _checkConstraintName(constraintName) {
    return constraintName ? `constraint ${constraintName} ` : '';
  }

  _check(checkPredicate, constraintName) {
    if (this.columnBuilder._method === 'alter') {
      this._pushAlterCheckQuery(checkPredicate, constraintName);
      return '';
    }
    return `${this._checkConstraintName(
      constraintName
    )}check (${checkPredicate})`;
  }

  checkPositive(constraintName) {
    return this._check(
      `${this.formatter.wrap(this.getColumnName())} ${operator_$1(
        '>',
        this.columnBuilder,
        this.bindingsHolder
      )} 0`,
      constraintName
    );
  }

  checkNegative(constraintName) {
    return this._check(
      `${this.formatter.wrap(this.getColumnName())} ${operator_$1(
        '<',
        this.columnBuilder,
        this.bindingsHolder
      )} 0`,
      constraintName
    );
  }

  _checkIn(values, constraintName, not) {
    return this._check(
      `${this.formatter.wrap(this.getColumnName())} ${
        not ? 'not ' : ''
      }in (${values.map((v) => this.client._escapeBinding(v)).join(',')})`,
      constraintName
    );
  }

  checkIn(values, constraintName) {
    return this._checkIn(values, constraintName);
  }

  checkNotIn(values, constraintName) {
    return this._checkIn(values, constraintName, true);
  }

  checkBetween(intervals, constraintName) {
    if (
      intervals.length === 2 &&
      !Array.isArray(intervals[0]) &&
      !Array.isArray(intervals[1])
    ) {
      intervals = [intervals];
    }
    const intervalChecks = intervals
      .map((interval) => {
        return `${this.formatter.wrap(
          this.getColumnName()
        )} between ${this.client._escapeBinding(
          interval[0]
        )} and ${this.client._escapeBinding(interval[1])}`;
      })
      .join(' or ');
    return this._check(intervalChecks, constraintName);
  }

  checkLength(operator, length, constraintName) {
    return this._check(
      `length(${this.formatter.wrap(this.getColumnName())}) ${operator_$1(
        operator,
        this.columnBuilder,
        this.bindingsHolder
      )} ${toNumber$1(length)}`,
      constraintName
    );
  }
};

ColumnCompiler$3.prototype.binary = 'blob';
ColumnCompiler$3.prototype.bool = 'boolean';
ColumnCompiler$3.prototype.date = 'date';
ColumnCompiler$3.prototype.datetime = 'datetime';
ColumnCompiler$3.prototype.time = 'time';
ColumnCompiler$3.prototype.timestamp = 'timestamp';
ColumnCompiler$3.prototype.geometry = 'geometry';
ColumnCompiler$3.prototype.geography = 'geography';
ColumnCompiler$3.prototype.point = 'point';
ColumnCompiler$3.prototype.enu = 'varchar';
ColumnCompiler$3.prototype.bit = ColumnCompiler$3.prototype.json = 'text';
ColumnCompiler$3.prototype.uuid = ({
  useBinaryUuid = false,
  primaryKey = false,
} = {}) => (useBinaryUuid ? 'binary(16)' : 'char(36)');
ColumnCompiler$3.prototype.integer =
  ColumnCompiler$3.prototype.smallint =
  ColumnCompiler$3.prototype.mediumint =
    'integer';
ColumnCompiler$3.prototype.biginteger = 'bigint';
ColumnCompiler$3.prototype.text = 'text';
ColumnCompiler$3.prototype.tinyint = 'tinyint';

ColumnCompiler$3.prototype.pushQuery = helpers$1.pushQuery;
ColumnCompiler$3.prototype.pushAdditional = helpers$1.pushAdditional;
ColumnCompiler$3.prototype.unshiftQuery = helpers$1.unshiftQuery;

ColumnCompiler$3.prototype._defaultMap = {
  columnName: function () {
    if (!this.isIncrements) {
      throw new Error(
        `You did not specify a column name for the ${this.type} column.`
      );
    }
    return 'id';
  },
};

var columncompiler = ColumnCompiler$3;

const Raw$1 = raw;

let Ref$1 = class Ref extends Raw$1 {
  constructor(client, ref) {
    super(client);

    this.ref = ref;
    this._schema = null;
    this._alias = null;
  }

  withSchema(schema) {
    this._schema = schema;

    return this;
  }

  as(alias) {
    this._alias = alias;

    return this;
  }

  toSQL() {
    const string = this._schema ? `${this._schema}.${this.ref}` : this.ref;

    const formatter = this.client.formatter(this);

    const ref = formatter.columnize(string);

    const sql = this._alias ? `${ref} as ${formatter.wrap(this._alias)}` : ref;

    this.set(sql, []);

    return super.toSQL(...arguments);
  }
};

var ref = Ref$1;

const {
  columnize: columnize_$2,
  wrap: wrap_$1,
} = wrappingFormatter;

let Formatter$1 = class Formatter {
  constructor(client, builder) {
    this.client = client;
    this.builder = builder;
    this.bindings = [];
  }

  // Accepts a string or array of columns to wrap as appropriate.
  columnize(target) {
    return columnize_$2(target, this.builder, this.client, this);
  }

  // Puts the appropriate wrapper around a value depending on the database
  // engine, unless it's a knex.raw value, in which case it's left alone.
  wrap(value, isParameter) {
    return wrap_$1(value, isParameter, this.builder, this.client, this);
  }
};

var formatter = Formatter$1;

var colorette = {};

Object.defineProperty(colorette, '__esModule', { value: true });

var tty = ttyBrowserify;

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var tty__namespace = /*#__PURE__*/_interopNamespace(tty);

const {
  env = {},
  argv = [],
  platform = "",
} = typeof process === "undefined" ? {} : process;

const isDisabled = "NO_COLOR" in env || argv.includes("--no-color");
const isForced = "FORCE_COLOR" in env || argv.includes("--color");
const isWindows = platform === "win32";
const isDumbTerminal = env.TERM === "dumb";

const isCompatibleTerminal =
  tty__namespace && tty__namespace.isatty && tty__namespace.isatty(1) && env.TERM && !isDumbTerminal;

const isCI =
  "CI" in env &&
  ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env);

const isColorSupported =
  !isDisabled &&
  (isForced || (isWindows && !isDumbTerminal) || isCompatibleTerminal || isCI);

const replaceClose = (
  index,
  string,
  close,
  replace,
  head = string.substring(0, index) + replace,
  tail = string.substring(index + close.length),
  next = tail.indexOf(close)
) => head + (next < 0 ? tail : replaceClose(next, tail, close, replace));

const clearBleed = (index, string, open, close, replace) =>
  index < 0
    ? open + string + close
    : open + replaceClose(index, string, close, replace) + close;

const filterEmpty =
  (open, close, replace = open, at = open.length + 1) =>
  (string) =>
    string || !(string === "" || string === undefined)
      ? clearBleed(
          ("" + string).indexOf(close, at),
          string,
          open,
          close,
          replace
        )
      : "";

const init = (open, close, replace) =>
  filterEmpty(`\x1b[${open}m`, `\x1b[${close}m`, replace);

const colors = {
  reset: init(0, 0),
  bold: init(1, 22, "\x1b[22m\x1b[1m"),
  dim: init(2, 22, "\x1b[22m\x1b[2m"),
  italic: init(3, 23),
  underline: init(4, 24),
  inverse: init(7, 27),
  hidden: init(8, 28),
  strikethrough: init(9, 29),
  black: init(30, 39),
  red: init(31, 39),
  green: init(32, 39),
  yellow: init(33, 39),
  blue: init(34, 39),
  magenta: init(35, 39),
  cyan: init(36, 39),
  white: init(37, 39),
  gray: init(90, 39),
  bgBlack: init(40, 49),
  bgRed: init(41, 49),
  bgGreen: init(42, 49),
  bgYellow: init(43, 49),
  bgBlue: init(44, 49),
  bgMagenta: init(45, 49),
  bgCyan: init(46, 49),
  bgWhite: init(47, 49),
  blackBright: init(90, 39),
  redBright: init(91, 39),
  greenBright: init(92, 39),
  yellowBright: init(93, 39),
  blueBright: init(94, 39),
  magentaBright: init(95, 39),
  cyanBright: init(96, 39),
  whiteBright: init(97, 39),
  bgBlackBright: init(100, 49),
  bgRedBright: init(101, 49),
  bgGreenBright: init(102, 49),
  bgYellowBright: init(103, 49),
  bgBlueBright: init(104, 49),
  bgMagentaBright: init(105, 49),
  bgCyanBright: init(106, 49),
  bgWhiteBright: init(107, 49),
};

const createColors = ({ useColor = isColorSupported } = {}) =>
  useColor
    ? colors
    : Object.keys(colors).reduce(
        (colors, key) => ({ ...colors, [key]: String }),
        {}
      );

const {
  reset,
  bold,
  dim,
  italic,
  underline,
  inverse,
  hidden,
  strikethrough,
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  gray,
  bgBlack,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
  blackBright,
  redBright,
  greenBright,
  yellowBright,
  blueBright,
  magentaBright,
  cyanBright,
  whiteBright,
  bgBlackBright,
  bgRedBright,
  bgGreenBright,
  bgYellowBright,
  bgBlueBright,
  bgMagentaBright,
  bgCyanBright,
  bgWhiteBright,
} = createColors();

colorette.bgBlack = bgBlack;
colorette.bgBlackBright = bgBlackBright;
colorette.bgBlue = bgBlue;
colorette.bgBlueBright = bgBlueBright;
colorette.bgCyan = bgCyan;
colorette.bgCyanBright = bgCyanBright;
colorette.bgGreen = bgGreen;
colorette.bgGreenBright = bgGreenBright;
colorette.bgMagenta = bgMagenta;
colorette.bgMagentaBright = bgMagentaBright;
colorette.bgRed = bgRed;
colorette.bgRedBright = bgRedBright;
colorette.bgWhite = bgWhite;
colorette.bgWhiteBright = bgWhiteBright;
colorette.bgYellow = bgYellow;
colorette.bgYellowBright = bgYellowBright;
colorette.black = black;
colorette.blackBright = blackBright;
colorette.blue = blue;
colorette.blueBright = blueBright;
colorette.bold = bold;
colorette.createColors = createColors;
colorette.cyan = cyan;
colorette.cyanBright = cyanBright;
colorette.dim = dim;
colorette.gray = gray;
colorette.green = green;
colorette.greenBright = greenBright;
colorette.hidden = hidden;
colorette.inverse = inverse;
colorette.isColorSupported = isColorSupported;
colorette.italic = italic;
colorette.magenta = magenta;
colorette.magentaBright = magentaBright;
colorette.red = red;
colorette.redBright = redBright;
colorette.reset = reset;
colorette.strikethrough = strikethrough;
colorette.underline = underline;
colorette.white = white;
colorette.whiteBright = whiteBright;
colorette.yellow = yellow;
colorette.yellowBright = yellowBright;

const color = colorette;
const { inspect } = util;
const { isString: isString$2, isFunction } = is;

let Logger$1 = class Logger {
  constructor(config = {}) {
    const {
      log: {
        debug,
        warn,
        error,
        deprecate,
        inspectionDepth,
        enableColors,
      } = {},
    } = config;
    this._inspectionDepth = inspectionDepth || 5;
    this._enableColors = resolveIsEnabledColors(enableColors);
    this._debug = debug;
    this._warn = warn;
    this._error = error;
    this._deprecate = deprecate;
  }

  _log(message, userFn, colorFn) {
    if (userFn != null && !isFunction(userFn)) {
      throw new TypeError('Extensions to knex logger must be functions!');
    }

    if (isFunction(userFn)) {
      userFn(message);
      return;
    }

    if (!isString$2(message)) {
      message = inspect(message, {
        depth: this._inspectionDepth,
        colors: this._enableColors,
      });
    }

    console.log(colorFn ? colorFn(message) : message);
  }

  debug(message) {
    this._log(message, this._debug);
  }

  warn(message) {
    this._log(message, this._warn, color.yellow);
  }

  error(message) {
    this._log(message, this._error, color.red);
  }

  deprecate(method, alternative) {
    const message = `${method} is deprecated, please use ${alternative}`;

    this._log(message, this._deprecate, color.yellow);
  }
};

function resolveIsEnabledColors(enableColorsParam) {
  if (enableColorsParam != null) {
    return enableColorsParam;
  }

  if (process && process.stdout) {
    return process.stdout.isTTY;
  }

  return false;
}

var logger = Logger$1;

const helpers = helpers$7;
const extend$1 = extend$4;
const assign = assign_1;

let ViewBuilder$3 = class ViewBuilder {
  constructor(client, method, viewName, fn) {
    this.client = client;
    this._method = method;
    this._schemaName = undefined;
    this._columns = undefined;
    this._fn = fn;
    this._viewName = viewName;
    this._statements = [];
    this._single = {};
  }

  setSchema(schemaName) {
    this._schemaName = schemaName;
  }

  columns(columns) {
    this._columns = columns;
  }

  as(selectQuery) {
    this._selectQuery = selectQuery;
  }

  checkOption() {
    throw new Error(
      'check option definition is not supported by this dialect.'
    );
  }

  localCheckOption() {
    throw new Error(
      'check option definition is not supported by this dialect.'
    );
  }

  cascadedCheckOption() {
    throw new Error(
      'check option definition is not supported by this dialect.'
    );
  }

  toSQL() {
    if (this._method === 'alter') {
      extend$1(this, AlterMethods);
    }
    this._fn.call(this, this);
    return this.client.viewCompiler(this).toSQL();
  }
};

const AlterMethods = {
  column(column) {
    const self = this;
    return {
      rename: function (newName) {
        self._statements.push({
          grouping: 'alterView',
          method: 'renameColumn',
          args: [column, newName],
        });
        return this;
      },
      defaultTo: function (defaultValue) {
        self._statements.push({
          grouping: 'alterView',
          method: 'defaultTo',
          args: [column, defaultValue],
        });
        return this;
      },
    };
  },
};

helpers.addQueryContext(ViewBuilder$3);

ViewBuilder$3.extend = (methodName, fn) => {
  if (Object.prototype.hasOwnProperty.call(ViewBuilder$3.prototype, methodName)) {
    throw new Error(
      `Can't extend ViewBuilder with existing method ('${methodName}').`
    );
  }

  assign(ViewBuilder$3.prototype, { [methodName]: fn });
};

var viewbuilder = ViewBuilder$3;

/* eslint max-len:0 */

// View Compiler
// -------
const { pushQuery } = helpers$4;
const groupBy = groupBy_1;
const { columnize: columnize_$1 } = wrappingFormatter;

let ViewCompiler$3 = class ViewCompiler {
  constructor(client, viewBuilder) {
    this.client = client;
    this.viewBuilder = viewBuilder;
    this._commonBuilder = this.viewBuilder;
    this.method = viewBuilder._method;
    this.schemaNameRaw = viewBuilder._schemaName;
    this.viewNameRaw = viewBuilder._viewName;
    this.single = viewBuilder._single;
    this.selectQuery = viewBuilder._selectQuery;
    this.columns = viewBuilder._columns;
    this.grouped = groupBy(viewBuilder._statements, 'grouping');

    this.formatter = client.formatter(viewBuilder);
    this.bindings = [];
    this.formatter.bindings = this.bindings;
    this.bindingsHolder = this;

    this.sequence = [];
  }

  // Convert the tableCompiler toSQL
  toSQL() {
    this[this.method]();
    return this.sequence;
  }

  // Column Compilation
  // -------

  create() {
    this.createQuery(this.columns, this.selectQuery);
  }

  createOrReplace() {
    throw new Error('replace views is not supported by this dialect.');
  }

  createMaterializedView() {
    throw new Error('materialized views are not supported by this dialect.');
  }

  createQuery(columns, selectQuery, materialized, replace) {
    const createStatement =
      'create ' +
      (materialized ? 'materialized ' : '') +
      (replace ? 'or replace ' : '') +
      'view ';
    const columnList = columns
      ? ' (' +
        columnize_$1(
          columns,
          this.viewBuilder,
          this.client,
          this.bindingsHolder
        ) +
        ')'
      : '';
    let sql = createStatement + this.viewName() + columnList;
    sql += ' as ';
    sql += selectQuery.toString();
    switch (this.single.checkOption) {
      case 'default_option':
        sql += ' with check option';
        break;
      case 'local':
        sql += ' with local check option';
        break;
      case 'cascaded':
        sql += ' with cascaded check option';
        break;
    }
    this.pushQuery({
      sql,
    });
  }

  renameView(from, to) {
    throw new Error(
      'rename view is not supported by this dialect (instead drop, then create another view).'
    );
  }

  refreshMaterializedView() {
    throw new Error('materialized views are not supported by this dialect.');
  }

  alter() {
    this.alterView();
  }

  alterView() {
    const alterView = this.grouped.alterView || [];
    for (let i = 0, l = alterView.length; i < l; i++) {
      const statement = alterView[i];
      if (this[statement.method]) {
        this[statement.method].apply(this, statement.args);
      } else {
        this.client.logger.error(`Debug: ${statement.method} does not exist`);
      }
    }
    for (const item in this.single) {
      if (typeof this[item] === 'function') this[item](this.single[item]);
    }
  }

  renameColumn(from, to) {
    throw new Error('rename column of views is not supported by this dialect.');
  }

  defaultTo(column, defaultValue) {
    throw new Error(
      'change default values of views is not supported by this dialect.'
    );
  }

  viewName() {
    const name = this.schemaNameRaw
      ? `${this.schemaNameRaw}.${this.viewNameRaw}`
      : this.viewNameRaw;

    return this.formatter.wrap(name);
  }
};

ViewCompiler$3.prototype.pushQuery = pushQuery;

var viewcompiler = ViewCompiler$3;

const { Pool, TimeoutError } = tarnExports;
const { EventEmitter } = eventsExports;
const { promisify: promisify$1 } = util;
const { makeEscape: makeEscape$1 } = string;
const cloneDeep = cloneDeep_1;
const defaults = defaults_1;
const uniqueId = uniqueId_1;

const Runner = runner;
const Transaction$2 = transaction;
const {
  executeQuery,
  enrichQueryObject,
} = queryExecutioner;
const QueryBuilder$2 = querybuilder;
const QueryCompiler$2 = querycompiler;
const SchemaBuilder = builder;
const SchemaCompiler$2 = compiler;
const TableBuilder = tablebuilder;
const TableCompiler$2 = tablecompiler;
const ColumnBuilder = columnbuilder;
const ColumnCompiler$2 = columncompiler;
const { KnexTimeoutError } = timeout$3;
const { outputQuery, unwrapRaw } = wrappingFormatter;
const { compileCallback } = formatterUtils;
const Raw = raw;
const Ref = ref;
const Formatter = formatter;
const Logger = logger;
const { POOL_CONFIG_OPTIONS } = constants$1;
const ViewBuilder$2 = viewbuilder;
const ViewCompiler$2 = viewcompiler;
const isPlainObject = isPlainObject_1;
const { setHiddenProperty } = security;

const debug = browserExports('knex:client');

// The base client provides the general structure
// for a dialect specific client object.

let Client$1 = class Client extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.logger = new Logger(config);

    if (this.config.connection && this.config.connection.password) {
      setHiddenProperty(this.config.connection);
    }

    //Client is a required field, so throw error if it's not supplied.
    //If 'this.dialect' is set, then this is a 'super()' call, in which case
    //'client' does not have to be set as it's already assigned on the client prototype.

    if (this.dialect && !this.config.client) {
      this.logger.warn(
        `Using 'this.dialect' to identify the client is deprecated and support for it will be removed in the future. Please use configuration option 'client' instead.`
      );
    }

    const dbClient = this.config.client || this.dialect;
    if (!dbClient) {
      throw new Error(
        `knex: Required configuration option 'client' is missing.`
      );
    }

    if (config.version) {
      this.version = config.version;
    }

    if (config.connection && config.connection instanceof Function) {
      this.connectionConfigProvider = config.connection;
      this.connectionConfigExpirationChecker = () => true; // causes the provider to be called on first use
    } else {
      this.connectionSettings = cloneDeep(config.connection || {});
      if (config.connection && config.connection.password) {
        setHiddenProperty(this.connectionSettings, config.connection);
      }
      this.connectionConfigExpirationChecker = null;
    }
    if (this.driverName && config.connection) {
      this.initializeDriver();
      if (!config.pool || (config.pool && config.pool.max !== 0)) {
        this.initializePool(config);
      }
    }
    this.valueForUndefined = this.raw('DEFAULT');
    if (config.useNullAsDefault) {
      this.valueForUndefined = null;
    }
  }
  formatter(builder) {
    return new Formatter(this, builder);
  }

  queryBuilder() {
    return new QueryBuilder$2(this);
  }

  queryCompiler(builder, formatter) {
    return new QueryCompiler$2(this, builder, formatter);
  }

  schemaBuilder() {
    return new SchemaBuilder(this);
  }

  schemaCompiler(builder) {
    return new SchemaCompiler$2(this, builder);
  }

  tableBuilder(type, tableName, tableNameLike, fn) {
    return new TableBuilder(this, type, tableName, tableNameLike, fn);
  }

  viewBuilder(type, viewBuilder, fn) {
    return new ViewBuilder$2(this, type, viewBuilder, fn);
  }

  tableCompiler(tableBuilder) {
    return new TableCompiler$2(this, tableBuilder);
  }

  viewCompiler(viewCompiler) {
    return new ViewCompiler$2(this, viewCompiler);
  }

  columnBuilder(tableBuilder, type, args) {
    return new ColumnBuilder(this, tableBuilder, type, args);
  }

  columnCompiler(tableBuilder, columnBuilder) {
    return new ColumnCompiler$2(this, tableBuilder, columnBuilder);
  }

  runner(builder) {
    return new Runner(this, builder);
  }

  transaction(container, config, outerTx) {
    return new Transaction$2(this, container, config, outerTx);
  }

  raw() {
    return new Raw(this).set(...arguments);
  }

  ref() {
    return new Ref(this, ...arguments);
  }
  query(connection, queryParam) {
    const queryObject = enrichQueryObject(connection, queryParam, this);
    return executeQuery(connection, queryObject, this);
  }

  stream(connection, queryParam, stream, options) {
    const queryObject = enrichQueryObject(connection, queryParam, this);
    return this._stream(connection, queryObject, stream, options);
  }

  prepBindings(bindings) {
    return bindings;
  }

  positionBindings(sql) {
    return sql;
  }

  postProcessResponse(resp, queryContext) {
    if (this.config.postProcessResponse) {
      return this.config.postProcessResponse(resp, queryContext);
    }
    return resp;
  }

  wrapIdentifier(value, queryContext) {
    return this.customWrapIdentifier(
      value,
      this.wrapIdentifierImpl,
      queryContext
    );
  }

  customWrapIdentifier(value, origImpl, queryContext) {
    if (this.config.wrapIdentifier) {
      return this.config.wrapIdentifier(value, origImpl, queryContext);
    }
    return origImpl(value);
  }

  wrapIdentifierImpl(value) {
    return value !== '*' ? `"${value.replace(/"/g, '""')}"` : '*';
  }

  initializeDriver() {
    try {
      this.driver = this._driver();
    } catch (e) {
      const message = `Knex: run\n$ npm install ${this.driverName} --save`;
      this.logger.error(`${message}\n${e.message}\n${e.stack}`);
      throw new Error(`${message}\n${e.message}`);
    }
  }

  poolDefaults() {
    return { min: 2, max: 10, propagateCreateError: true };
  }

  getPoolSettings(poolConfig) {
    poolConfig = defaults({}, poolConfig, this.poolDefaults());

    POOL_CONFIG_OPTIONS.forEach((option) => {
      if (option in poolConfig) {
        this.logger.warn(
          [
            `Pool config option "${option}" is no longer supported.`,
            `See https://github.com/Vincit/tarn.js for possible pool config options.`,
          ].join(' ')
        );
      }
    });

    const DEFAULT_ACQUIRE_TIMEOUT = 60000;
    const timeouts = [
      this.config.acquireConnectionTimeout,
      poolConfig.acquireTimeoutMillis,
    ].filter((timeout) => timeout !== undefined);

    if (!timeouts.length) {
      timeouts.push(DEFAULT_ACQUIRE_TIMEOUT);
    }

    // acquire connection timeout can be set on config or config.pool
    // choose the smallest, positive timeout setting and set on poolConfig
    poolConfig.acquireTimeoutMillis = Math.min(...timeouts);

    const updatePoolConnectionSettingsFromProvider = async () => {
      if (!this.connectionConfigProvider) {
        return; // static configuration, nothing to update
      }
      if (
        !this.connectionConfigExpirationChecker ||
        !this.connectionConfigExpirationChecker()
      ) {
        return; // not expired, reuse existing connection
      }
      const providerResult = await this.connectionConfigProvider();
      if (providerResult.expirationChecker) {
        this.connectionConfigExpirationChecker =
          providerResult.expirationChecker;
        delete providerResult.expirationChecker; // MySQL2 driver warns on receiving extra properties
      } else {
        this.connectionConfigExpirationChecker = null;
      }
      this.connectionSettings = providerResult;
    };

    return Object.assign(poolConfig, {
      create: async () => {
        await updatePoolConnectionSettingsFromProvider();
        const connection = await this.acquireRawConnection();
        connection.__knexUid = uniqueId('__knexUid');
        if (poolConfig.afterCreate) {
          await promisify$1(poolConfig.afterCreate)(connection);
        }
        return connection;
      },

      destroy: (connection) => {
        if (connection !== void 0) {
          return this.destroyRawConnection(connection);
        }
      },

      validate: (connection) => {
        if (connection.__knex__disposed) {
          this.logger.warn(`Connection Error: ${connection.__knex__disposed}`);
          return false;
        }

        return this.validateConnection(connection);
      },
    });
  }

  initializePool(config = this.config) {
    if (this.pool) {
      this.logger.warn('The pool has already been initialized');
      return;
    }

    const tarnPoolConfig = {
      ...this.getPoolSettings(config.pool),
    };
    // afterCreate is an internal knex param, tarn.js does not support it
    if (tarnPoolConfig.afterCreate) {
      delete tarnPoolConfig.afterCreate;
    }

    this.pool = new Pool(tarnPoolConfig);
  }

  validateConnection(connection) {
    return true;
  }

  // Acquire a connection from the pool.
  async acquireConnection() {
    if (!this.pool) {
      throw new Error('Unable to acquire a connection');
    }
    try {
      const connection = await this.pool.acquire().promise;
      debug('acquired connection from pool: %s', connection.__knexUid);
      if (connection.config) {
        if (connection.config.password) {
          setHiddenProperty(connection.config);
        }
        if (
          connection.config.authentication &&
          connection.config.authentication.options &&
          connection.config.authentication.options.password
        ) {
          setHiddenProperty(connection.config.authentication.options);
        }
      }
      return connection;
    } catch (error) {
      let convertedError = error;
      if (error instanceof TimeoutError) {
        convertedError = new KnexTimeoutError(
          'Knex: Timeout acquiring a connection. The pool is probably full. ' +
            'Are you missing a .transacting(trx) call?'
        );
      }
      throw convertedError;
    }
  }

  // Releases a connection back to the connection pool,
  // returning a promise resolved when the connection is released.
  releaseConnection(connection) {
    debug('releasing connection to pool: %s', connection.__knexUid);
    const didRelease = this.pool.release(connection);

    if (!didRelease) {
      debug('pool refused connection: %s', connection.__knexUid);
    }

    return Promise.resolve();
  }

  // Destroy the current connection pool for the client.
  async destroy(callback) {
    try {
      if (this.pool && this.pool.destroy) {
        await this.pool.destroy();
      }
      this.pool = undefined;

      if (typeof callback === 'function') {
        callback();
      }
    } catch (err) {
      if (typeof callback === 'function') {
        return callback(err);
      }
      throw err;
    }
  }

  // Return the database being used by this client.
  database() {
    return this.connectionSettings.database;
  }

  toString() {
    return '[object KnexClient]';
  }

  assertCanCancelQuery() {
    if (!this.canCancelQuery) {
      throw new Error('Query cancelling not supported for this dialect');
    }
  }

  cancelQuery() {
    throw new Error('Query cancelling not supported for this dialect');
  }

  // Formatter part

  alias(first, second) {
    return first + ' as ' + second;
  }

  // Checks whether a value is a function... if it is, we compile it
  // otherwise we check whether it's a raw
  parameter(value, builder, bindingsHolder) {
    if (typeof value === 'function') {
      return outputQuery(
        compileCallback(value, undefined, this, bindingsHolder),
        true,
        builder,
        this
      );
    }
    return unwrapRaw(value, true, builder, this, bindingsHolder) || '?';
  }

  // Turns a list of values into a list of ?'s, joining them with commas unless
  // a "joining" value is specified (e.g. ' and ')
  parameterize(values, notSetValue, builder, bindingsHolder) {
    if (typeof values === 'function')
      return this.parameter(values, builder, bindingsHolder);
    values = Array.isArray(values) ? values : [values];
    let str = '',
      i = -1;
    while (++i < values.length) {
      if (i > 0) str += ', ';
      let value = values[i];
      // json columns can have object in values.
      if (isPlainObject(value)) {
        value = JSON.stringify(value);
      }
      str += this.parameter(
        value === undefined ? notSetValue : value,
        builder,
        bindingsHolder
      );
    }
    return str;
  }

  // Formats `values` into a parenthesized list of parameters for a `VALUES`
  // clause.
  //
  // [1, 2]                  -> '(?, ?)'
  // [[1, 2], [3, 4]]        -> '((?, ?), (?, ?))'
  // knex('table')           -> '(select * from "table")'
  // knex.raw('select ?', 1) -> '(select ?)'
  //
  values(values, builder, bindingsHolder) {
    if (Array.isArray(values)) {
      if (Array.isArray(values[0])) {
        return `(${values
          .map(
            (value) =>
              `(${this.parameterize(
                value,
                undefined,
                builder,
                bindingsHolder
              )})`
          )
          .join(', ')})`;
      }
      return `(${this.parameterize(
        values,
        undefined,
        builder,
        bindingsHolder
      )})`;
    }

    if (values && values.isRawInstance) {
      return `(${this.parameter(values, builder, bindingsHolder)})`;
    }

    return this.parameter(values, builder, bindingsHolder);
  }

  processPassedConnection(connection) {
    // Default implementation is noop
  }

  toPathForJson(jsonPath) {
    // By default, we want a json path, so if this function is not overriden,
    // we return the path.
    return jsonPath;
  }
};

Object.assign(Client$1.prototype, {
  _escapeBinding: makeEscape$1({
    escapeString(str) {
      return `'${str.replace(/'/g, "''")}'`;
    },
  }),

  canCancelQuery: false,
});

var client = Client$1;

const Transaction$1 = transaction;

class Transaction_PG extends Transaction$1 {
  begin(conn) {
    const trxMode = [
      this.isolationLevel ? `ISOLATION LEVEL ${this.isolationLevel}` : '',
      this.readOnly ? 'READ ONLY' : '',
    ]
      .join(' ')
      .trim();

    if (trxMode.length === 0) {
      return this.query(conn, 'BEGIN;');
    }
    return this.query(conn, `BEGIN TRANSACTION ${trxMode};`);
  }
}

var pgTransaction = Transaction_PG;

// PostgreSQL Query Builder & Compiler
// ------
const identity = identity_1;
const reduce = reduce_1;

const QueryCompiler$1 = querycompiler;
const {
  wrapString,
  columnize: columnize_,
  operator: operator_,
  wrap: wrap_,
} = wrappingFormatter;

class QueryCompiler_PG extends QueryCompiler$1 {
  constructor(client, builder, formatter) {
    super(client, builder, formatter);
    this._defaultInsertValue = 'default';
  }

  // Compiles a truncate query.
  truncate() {
    return `truncate ${this.tableName} restart identity`;
  }

  // is used if the an array with multiple empty values supplied

  // Compiles an `insert` query, allowing for multiple
  // inserts using a single query statement.
  insert() {
    let sql = super.insert();
    if (sql === '') return sql;

    const { returning, onConflict, ignore, merge, insert } = this.single;
    if (onConflict && ignore) sql += this._ignore(onConflict);
    if (onConflict && merge) {
      sql += this._merge(merge.updates, onConflict, insert);
      const wheres = this.where();
      if (wheres) sql += ` ${wheres}`;
    }
    if (returning) sql += this._returning(returning);

    return {
      sql,
      returning,
    };
  }

  // Compiles an `update` query, allowing for a return value.
  update() {
    const withSQL = this.with();
    const updateData = this._prepUpdate(this.single.update);
    const wheres = this.where();
    const { returning, updateFrom } = this.single;
    return {
      sql:
        withSQL +
        `update ${this.single.only ? 'only ' : ''}${this.tableName} ` +
        `set ${updateData.join(', ')}` +
        this._updateFrom(updateFrom) +
        (wheres ? ` ${wheres}` : '') +
        this._returning(returning),
      returning,
    };
  }

  using() {
    const usingTables = this.single.using;
    if (!usingTables) return;
    let sql = 'using ';
    if (Array.isArray(usingTables)) {
      sql += usingTables
        .map((table) => {
          return this.formatter.wrap(table);
        })
        .join(',');
    } else {
      sql += this.formatter.wrap(usingTables);
    }
    return sql;
  }

  // Compiles an `delete` query, allowing for a return value.
  del() {
    // Make sure tableName is processed by the formatter first.
    const { tableName } = this;
    const withSQL = this.with();
    let wheres = this.where() || '';
    let using = this.using() || '';
    const joins = this.grouped.join;

    const tableJoins = [];
    if (Array.isArray(joins)) {
      for (const join of joins) {
        tableJoins.push(
          wrap_(
            this._joinTable(join),
            undefined,
            this.builder,
            this.client,
            this.bindingsHolder
          )
        );

        const joinWheres = [];
        for (const clause of join.clauses) {
          joinWheres.push(
            this.whereBasic({
              column: clause.column,
              operator: '=',
              value: clause.value,
              asColumn: true,
            })
          );
        }
        if (joinWheres.length > 0) {
          wheres += (wheres ? ' and ' : 'where ') + joinWheres.join(' and ');
        }
      }
      if (tableJoins.length > 0) {
        using += (using ? ',' : 'using ') + tableJoins.join(',');
      }
    }

    // With 'using' syntax, no tablename between DELETE and FROM.
    const sql =
      withSQL +
      `delete from ${this.single.only ? 'only ' : ''}${tableName}` +
      (using ? ` ${using}` : '') +
      (wheres ? ` ${wheres}` : '');
    const { returning } = this.single;
    return {
      sql: sql + this._returning(returning),
      returning,
    };
  }

  aggregate(stmt) {
    return this._aggregate(stmt, { distinctParentheses: true });
  }

  _returning(value) {
    return value ? ` returning ${this.formatter.columnize(value)}` : '';
  }

  _updateFrom(name) {
    return name ? ` from ${this.formatter.wrap(name)}` : '';
  }

  _ignore(columns) {
    if (columns === true) {
      return ' on conflict do nothing';
    }
    return ` on conflict ${this._onConflictClause(columns)} do nothing`;
  }

  _merge(updates, columns, insert) {
    let sql = ` on conflict ${this._onConflictClause(columns)} do update set `;
    if (updates && Array.isArray(updates)) {
      sql += updates
        .map((column) =>
          wrapString(
            column.split('.').pop(),
            this.formatter.builder,
            this.client,
            this.formatter
          )
        )
        .map((column) => `${column} = excluded.${column}`)
        .join(', ');

      return sql;
    } else if (updates && typeof updates === 'object') {
      const updateData = this._prepUpdate(updates);
      if (typeof updateData === 'string') {
        sql += updateData;
      } else {
        sql += updateData.join(',');
      }

      return sql;
    } else {
      const insertData = this._prepInsert(insert);
      if (typeof insertData === 'string') {
        throw new Error(
          'If using merge with a raw insert query, then updates must be provided'
        );
      }

      sql += insertData.columns
        .map((column) =>
          wrapString(column.split('.').pop(), this.builder, this.client)
        )
        .map((column) => `${column} = excluded.${column}`)
        .join(', ');

      return sql;
    }
  }

  // Join array of table names and apply default schema.
  _tableNames(tables) {
    const schemaName = this.single.schema;
    const sql = [];

    for (let i = 0; i < tables.length; i++) {
      let tableName = tables[i];

      if (tableName) {
        if (schemaName) {
          tableName = `${schemaName}.${tableName}`;
        }
        sql.push(this.formatter.wrap(tableName));
      }
    }

    return sql.join(', ');
  }

  _lockingClause(lockMode) {
    const tables = this.single.lockTables || [];

    return lockMode + (tables.length ? ' of ' + this._tableNames(tables) : '');
  }

  _groupOrder(item, type) {
    return super._groupOrderNulls(item, type);
  }

  forUpdate() {
    return this._lockingClause('for update');
  }

  forShare() {
    return this._lockingClause('for share');
  }

  forNoKeyUpdate() {
    return this._lockingClause('for no key update');
  }

  forKeyShare() {
    return this._lockingClause('for key share');
  }

  skipLocked() {
    return 'skip locked';
  }

  noWait() {
    return 'nowait';
  }

  // Compiles a columnInfo query
  columnInfo() {
    const column = this.single.columnInfo;
    let schema = this.single.schema;

    // The user may have specified a custom wrapIdentifier function in the config. We
    // need to run the identifiers through that function, but not format them as
    // identifiers otherwise.
    const table = this.client.customWrapIdentifier(this.single.table, identity);

    if (schema) {
      schema = this.client.customWrapIdentifier(schema, identity);
    }

    const sql =
      'select * from information_schema.columns where table_name = ? and table_catalog = current_database()';
    const bindings = [table];

    return this._buildColumnInfoQuery(schema, sql, bindings, column);
  }

  _buildColumnInfoQuery(schema, sql, bindings, column) {
    if (schema) {
      sql += ' and table_schema = ?';
      bindings.push(schema);
    } else {
      sql += ' and table_schema = current_schema()';
    }

    return {
      sql,
      bindings,
      output(resp) {
        const out = reduce(
          resp.rows,
          function (columns, val) {
            columns[val.column_name] = {
              type: val.data_type,
              maxLength: val.character_maximum_length,
              nullable: val.is_nullable === 'YES',
              defaultValue: val.column_default,
            };
            return columns;
          },
          {}
        );
        return (column && out[column]) || out;
      },
    };
  }

  distinctOn(value) {
    return 'distinct on (' + this.formatter.columnize(value) + ') ';
  }

  // Json functions
  jsonExtract(params) {
    return this._jsonExtract('jsonb_path_query', params);
  }

  jsonSet(params) {
    return this._jsonSet(
      'jsonb_set',
      Object.assign({}, params, {
        path: this.client.toPathForJson(params.path),
      })
    );
  }

  jsonInsert(params) {
    return this._jsonSet(
      'jsonb_insert',
      Object.assign({}, params, {
        path: this.client.toPathForJson(params.path),
      })
    );
  }

  jsonRemove(params) {
    const jsonCol = `${columnize_(
      params.column,
      this.builder,
      this.client,
      this.bindingsHolder
    )} #- ${this.client.parameter(
      this.client.toPathForJson(params.path),
      this.builder,
      this.bindingsHolder
    )}`;
    return params.alias
      ? this.client.alias(jsonCol, this.formatter.wrap(params.alias))
      : jsonCol;
  }

  whereJsonPath(statement) {
    let castValue = '';
    if (!isNaN(statement.value) && parseInt(statement.value)) {
      castValue = '::int';
    } else if (!isNaN(statement.value) && parseFloat(statement.value)) {
      castValue = '::float';
    } else {
      castValue = " #>> '{}'";
    }
    return `jsonb_path_query_first(${this._columnClause(
      statement
    )}, ${this.client.parameter(
      statement.jsonPath,
      this.builder,
      this.bindingsHolder
    )})${castValue} ${operator_(
      statement.operator,
      this.builder,
      this.client,
      this.bindingsHolder
    )} ${this._jsonValueClause(statement)}`;
  }

  whereJsonSupersetOf(statement) {
    return this._not(
      statement,
      `${wrap_(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      )} @> ${this._jsonValueClause(statement)}`
    );
  }

  whereJsonSubsetOf(statement) {
    return this._not(
      statement,
      `${columnize_(
        statement.column,
        this.builder,
        this.client,
        this.bindingsHolder
      )} <@ ${this._jsonValueClause(statement)}`
    );
  }

  onJsonPathEquals(clause) {
    return this._onJsonPathEquals('jsonb_path_query_first', clause);
  }
}

var pgQuerycompiler = QueryCompiler_PG;

const QueryBuilder$1 = querybuilder;

var pgQuerybuilder = class QueryBuilder_PostgreSQL extends QueryBuilder$1 {
  updateFrom(name) {
    this._single.updateFrom = name;
    return this;
  }

  using(tables) {
    this._single.using = tables;
    return this;
  }

  withMaterialized(alias, statementOrColumnList, nothingOrStatement) {
    this._validateWithArgs(
      alias,
      statementOrColumnList,
      nothingOrStatement,
      'with'
    );
    return this.withWrapped(
      alias,
      statementOrColumnList,
      nothingOrStatement,
      true
    );
  }

  withNotMaterialized(alias, statementOrColumnList, nothingOrStatement) {
    this._validateWithArgs(
      alias,
      statementOrColumnList,
      nothingOrStatement,
      'with'
    );
    return this.withWrapped(
      alias,
      statementOrColumnList,
      nothingOrStatement,
      false
    );
  }
};

// PostgreSQL Column Compiler
// -------

const ColumnCompiler$1 = columncompiler;
const { isObject: isObject$1 } = is;
const { toNumber } = helpers$7;
const commentEscapeRegex = /(?<!')'(?!')/g;

class ColumnCompiler_PG extends ColumnCompiler$1 {
  constructor(client, tableCompiler, columnBuilder) {
    super(client, tableCompiler, columnBuilder);
    this.modifiers = ['nullable', 'defaultTo', 'comment'];
    this._addCheckModifiers();
  }

  // Types
  // ------

  bit(column) {
    return column.length !== false ? `bit(${column.length})` : 'bit';
  }

  // Create the column definition for an enum type.
  // Using method "2" here: http://stackoverflow.com/a/10984951/525714
  enu(allowed, options) {
    options = options || {};

    const values =
      options.useNative && options.existingType
        ? undefined
        : allowed.join("', '");

    if (options.useNative) {
      let enumName = '';
      const schemaName = options.schemaName || this.tableCompiler.schemaNameRaw;

      if (schemaName) {
        enumName += `"${schemaName}".`;
      }

      enumName += `"${options.enumName}"`;

      if (!options.existingType) {
        this.tableCompiler.unshiftQuery(
          `create type ${enumName} as enum ('${values}')`
        );
      }

      return enumName;
    }
    return `text check (${this.formatter.wrap(this.args[0])} in ('${values}'))`;
  }

  decimal(precision, scale) {
    if (precision === null) return 'decimal';
    return `decimal(${toNumber(precision, 8)}, ${toNumber(scale, 2)})`;
  }

  json(jsonb) {
    if (jsonb) this.client.logger.deprecate('json(true)', 'jsonb()');
    return jsonColumn(this.client, jsonb);
  }

  jsonb() {
    return jsonColumn(this.client, true);
  }

  checkRegex(regex, constraintName) {
    return this._check(
      `${this.formatter.wrap(
        this.getColumnName()
      )} ~ ${this.client._escapeBinding(regex)}`,
      constraintName
    );
  }

  datetime(withoutTz = false, precision) {
    let useTz;
    if (isObject$1(withoutTz)) {
      ({ useTz, precision } = withoutTz);
    } else {
      useTz = !withoutTz;
    }
    useTz = typeof useTz === 'boolean' ? useTz : true;
    precision =
      precision !== undefined && precision !== null
        ? '(' + precision + ')'
        : '';

    return `${useTz ? 'timestamptz' : 'timestamp'}${precision}`;
  }

  timestamp(withoutTz = false, precision) {
    return this.datetime(withoutTz, precision);
  }

  // Modifiers:
  // ------
  comment(comment) {
    const columnName = this.args[0] || this.defaults('columnName');
    const escapedComment = comment
      ? `'${comment.replace(commentEscapeRegex, "''")}'`
      : 'NULL';

    this.pushAdditional(function () {
      this.pushQuery(
        `comment on column ${this.tableCompiler.tableName()}.` +
          this.formatter.wrap(columnName) +
          ` is ${escapedComment}`
      );
    }, comment);
  }

  increments(options = { primaryKey: true }) {
    return (
      'serial' +
      (this.tableCompiler._canBeAddPrimaryKey(options) ? ' primary key' : '')
    );
  }

  bigincrements(options = { primaryKey: true }) {
    return (
      'bigserial' +
      (this.tableCompiler._canBeAddPrimaryKey(options) ? ' primary key' : '')
    );
  }

  uuid(options = { primaryKey: false }) {
    return (
      'uuid' +
      (this.tableCompiler._canBeAddPrimaryKey(options) ? ' primary key' : '')
    );
  }
}

ColumnCompiler_PG.prototype.bigint = 'bigint';
ColumnCompiler_PG.prototype.binary = 'bytea';
ColumnCompiler_PG.prototype.bool = 'boolean';
ColumnCompiler_PG.prototype.double = 'double precision';
ColumnCompiler_PG.prototype.floating = 'real';
ColumnCompiler_PG.prototype.smallint = 'smallint';
ColumnCompiler_PG.prototype.tinyint = 'smallint';

function jsonColumn(client, jsonb) {
  if (
    !client.version ||
    client.config.client === 'cockroachdb' ||
    client.config.jsonbSupport === true ||
    parseFloat(client.version) >= 9.2
  ) {
    return jsonb ? 'jsonb' : 'json';
  }
  return 'text';
}

var pgColumncompiler = ColumnCompiler_PG;

/* eslint max-len: 0 */

// PostgreSQL Table Builder & Compiler
// -------

const has = has_1;
const TableCompiler$1 = tablecompiler;
const { isObject, isString: isString$1 } = is;

class TableCompiler_PG extends TableCompiler$1 {
  constructor(client, tableBuilder) {
    super(client, tableBuilder);
  }

  // Compile a rename column command.
  renameColumn(from, to) {
    return this.pushQuery({
      sql: `alter table ${this.tableName()} rename ${this.formatter.wrap(
        from
      )} to ${this.formatter.wrap(to)}`,
    });
  }

  _setNullableState(column, isNullable) {
    const constraintAction = isNullable ? 'drop not null' : 'set not null';
    const sql = `alter table ${this.tableName()} alter column ${this.formatter.wrap(
      column
    )} ${constraintAction}`;
    return this.pushQuery({
      sql: sql,
    });
  }

  compileAdd(builder) {
    const table = this.formatter.wrap(builder);
    const columns = this.prefixArray('add column', this.getColumns(builder));
    return this.pushQuery({
      sql: `alter table ${table} ${columns.join(', ')}`,
    });
  }

  // Adds the "create" query to the query sequence.
  createQuery(columns, ifNot, like) {
    const createStatement = ifNot
      ? 'create table if not exists '
      : 'create table ';
    const columnsSql = ` (${columns.sql.join(', ')}${
      this.primaryKeys() || ''
    }${this._addChecks()})`;

    let sql =
      createStatement +
      this.tableName() +
      (like && this.tableNameLike()
        ? ' (like ' +
          this.tableNameLike() +
          ' including all' +
          (columns.sql.length ? ', ' + columns.sql.join(', ') : '') +
          ')'
        : columnsSql);
    if (this.single.inherits)
      sql += ` inherits (${this.formatter.wrap(this.single.inherits)})`;
    this.pushQuery({
      sql,
      bindings: columns.bindings,
    });
    const hasComment = has(this.single, 'comment');
    if (hasComment) this.comment(this.single.comment);
  }

  primaryKeys() {
    const pks = (this.grouped.alterTable || []).filter(
      (k) => k.method === 'primary'
    );
    if (pks.length > 0 && pks[0].args.length > 0) {
      const columns = pks[0].args[0];
      let constraintName = pks[0].args[1] || '';
      let deferrable;
      if (isObject(constraintName)) {
        ({ constraintName, deferrable } = constraintName);
      }
      deferrable = deferrable ? ` deferrable initially ${deferrable}` : '';
      constraintName = constraintName
        ? this.formatter.wrap(constraintName)
        : this.formatter.wrap(`${this.tableNameRaw}_pkey`);

      return `, constraint ${constraintName} primary key (${this.formatter.columnize(
        columns
      )})${deferrable}`;
    }
  }

  addColumns(columns, prefix, colCompilers) {
    if (prefix === this.alterColumnsPrefix) {
      // alter columns
      for (const col of colCompilers) {
        this._addColumn(col);
      }
    } else {
      // base class implementation for normal add
      super.addColumns(columns, prefix);
    }
  }

  _addColumn(col) {
    const quotedTableName = this.tableName();
    const type = col.getColumnType();
    // We'd prefer to call this.formatter.wrapAsIdentifier here instead, however the context passed to
    // `this` instance is not that of the column, but of the table. Thus, we unfortunately have to call
    // `wrapIdentifier` here as well (it is already called once on the initial column operation) to give
    // our `alter` operation the correct `queryContext`. Refer to issue #2606 and PR #2612.
    const colName = this.client.wrapIdentifier(
      col.getColumnName(),
      col.columnBuilder.queryContext()
    );

    // To alter enum columns they must be cast to text first
    const isEnum = col.type === 'enu';
    this.pushQuery({
      sql: `alter table ${quotedTableName} alter column ${colName} drop default`,
      bindings: [],
    });

    const alterNullable = col.columnBuilder.alterNullable;
    if (alterNullable) {
      this.pushQuery({
        sql: `alter table ${quotedTableName} alter column ${colName} drop not null`,
        bindings: [],
      });
    }

    const alterType = col.columnBuilder.alterType;
    if (alterType) {
      this.pushQuery({
        sql: `alter table ${quotedTableName} alter column ${colName} type ${type} using (${colName}${
          isEnum ? '::text::' : '::'
        }${type})`,
        bindings: [],
      });
    }

    const defaultTo = col.modified['defaultTo'];
    if (defaultTo) {
      const modifier = col.defaultTo.apply(col, defaultTo);
      this.pushQuery({
        sql: `alter table ${quotedTableName} alter column ${colName} set ${modifier}`,
        bindings: [],
      });
    }

    if (alterNullable) {
      const nullable = col.modified['nullable'];
      if (nullable && nullable[0] === false) {
        this.pushQuery({
          sql: `alter table ${quotedTableName} alter column ${colName} set not null`,
          bindings: [],
        });
      }
    }
  }

  // Compiles the comment on the table.
  comment(comment) {
    this.pushQuery(
      `comment on table ${this.tableName()} is '${this.single.comment}'`
    );
  }

  // Indexes:
  // -------

  primary(columns, constraintName) {
    let deferrable;
    if (isObject(constraintName)) {
      ({ constraintName, deferrable } = constraintName);
    }
    deferrable = deferrable ? ` deferrable initially ${deferrable}` : '';
    constraintName = constraintName
      ? this.formatter.wrap(constraintName)
      : this.formatter.wrap(`${this.tableNameRaw}_pkey`);
    if (this.method !== 'create' && this.method !== 'createIfNot') {
      this.pushQuery(
        `alter table ${this.tableName()} add constraint ${constraintName} primary key (${this.formatter.columnize(
          columns
        )})${deferrable}`
      );
    }
  }

  unique(columns, indexName) {
    let deferrable;
    let useConstraint = true;
    let predicate;
    if (isObject(indexName)) {
      ({ indexName, deferrable, useConstraint, predicate } = indexName);
      if (useConstraint === undefined) {
        useConstraint = !!deferrable || !predicate;
      }
    }
    if (!useConstraint && deferrable && deferrable !== 'not deferrable') {
      throw new Error('postgres cannot create deferrable index');
    }
    if (useConstraint && predicate) {
      throw new Error('postgres cannot create constraint with predicate');
    }
    deferrable = deferrable ? ` deferrable initially ${deferrable}` : '';
    indexName = indexName
      ? this.formatter.wrap(indexName)
      : this._indexCommand('unique', this.tableNameRaw, columns);

    if (useConstraint) {
      this.pushQuery(
        `alter table ${this.tableName()} add constraint ${indexName}` +
          ' unique (' +
          this.formatter.columnize(columns) +
          ')' +
          deferrable
      );
    } else {
      const predicateQuery = predicate
        ? ' ' + this.client.queryCompiler(predicate).where()
        : '';

      this.pushQuery(
        `create unique index ${indexName} on ${this.tableName()} (${this.formatter.columnize(
          columns
        )})${predicateQuery}`
      );
    }
  }

  index(columns, indexName, options) {
    indexName = indexName
      ? this.formatter.wrap(indexName)
      : this._indexCommand('index', this.tableNameRaw, columns);

    let predicate;
    let storageEngineIndexType;
    let indexType;

    if (isString$1(options)) {
      storageEngineIndexType = options;
    } else if (isObject(options)) {
      ({ indexType, storageEngineIndexType, predicate } = options);
    }

    const predicateQuery = predicate
      ? ' ' + this.client.queryCompiler(predicate).where()
      : '';

    this.pushQuery(
      `create${
        typeof indexType === 'string' && indexType.toLowerCase() === 'unique'
          ? ' unique'
          : ''
      } index ${indexName} on ${this.tableName()}${
        (storageEngineIndexType && ` using ${storageEngineIndexType}`) || ''
      }` +
        ' (' +
        this.formatter.columnize(columns) +
        ')' +
        `${predicateQuery}`
    );
  }

  dropPrimary(constraintName) {
    constraintName = constraintName
      ? this.formatter.wrap(constraintName)
      : this.formatter.wrap(this.tableNameRaw + '_pkey');
    this.pushQuery(
      `alter table ${this.tableName()} drop constraint ${constraintName}`
    );
  }

  dropIndex(columns, indexName) {
    indexName = indexName
      ? this.formatter.wrap(indexName)
      : this._indexCommand('index', this.tableNameRaw, columns);
    indexName = this.schemaNameRaw
      ? `${this.formatter.wrap(this.schemaNameRaw)}.${indexName}`
      : indexName;
    this.pushQuery(`drop index ${indexName}`);
  }

  dropUnique(columns, indexName) {
    indexName = indexName
      ? this.formatter.wrap(indexName)
      : this._indexCommand('unique', this.tableNameRaw, columns);
    this.pushQuery(
      `alter table ${this.tableName()} drop constraint ${indexName}`
    );
  }

  dropForeign(columns, indexName) {
    indexName = indexName
      ? this.formatter.wrap(indexName)
      : this._indexCommand('foreign', this.tableNameRaw, columns);
    this.pushQuery(
      `alter table ${this.tableName()} drop constraint ${indexName}`
    );
  }
}

var pgTablecompiler = TableCompiler_PG;

/* eslint max-len: 0 */

const ViewCompiler$1 = viewcompiler;

class ViewCompiler_PG extends ViewCompiler$1 {
  constructor(client, viewCompiler) {
    super(client, viewCompiler);
  }

  renameColumn(from, to) {
    return this.pushQuery({
      sql: `alter view ${this.viewName()} rename ${this.formatter.wrap(
        from
      )} to ${this.formatter.wrap(to)}`,
    });
  }

  defaultTo(column, defaultValue) {
    return this.pushQuery({
      sql: `alter view ${this.viewName()} alter ${this.formatter.wrap(
        column
      )} set default ${defaultValue}`,
    });
  }

  createOrReplace() {
    this.createQuery(this.columns, this.selectQuery, false, true);
  }

  createMaterializedView() {
    this.createQuery(this.columns, this.selectQuery, true);
  }
}

var pgViewcompiler = ViewCompiler_PG;

const ViewBuilder$1 = viewbuilder;

class ViewBuilder_PG extends ViewBuilder$1 {
  constructor() {
    super(...arguments);
  }

  checkOption() {
    this._single.checkOption = 'default_option';
  }

  localCheckOption() {
    this._single.checkOption = 'local';
  }

  cascadedCheckOption() {
    this._single.checkOption = 'cascaded';
  }
}

var pgViewbuilder = ViewBuilder_PG;

// PostgreSQL Schema Compiler
// -------

const SchemaCompiler$1 = compiler;

class SchemaCompiler_PG extends SchemaCompiler$1 {
  constructor(client, builder) {
    super(client, builder);
  }

  // Check whether the current table
  hasTable(tableName) {
    let sql = 'select * from information_schema.tables where table_name = ?';
    const bindings = [tableName];

    if (this.schema) {
      sql += ' and table_schema = ?';
      bindings.push(this.schema);
    } else {
      sql += ' and table_schema = current_schema()';
    }

    this.pushQuery({
      sql,
      bindings,
      output(resp) {
        return resp.rows.length > 0;
      },
    });
  }

  // Compile the query to determine if a column exists in a table.
  hasColumn(tableName, columnName) {
    let sql =
      'select * from information_schema.columns where table_name = ? and column_name = ?';
    const bindings = [tableName, columnName];

    if (this.schema) {
      sql += ' and table_schema = ?';
      bindings.push(this.schema);
    } else {
      sql += ' and table_schema = current_schema()';
    }

    this.pushQuery({
      sql,
      bindings,
      output(resp) {
        return resp.rows.length > 0;
      },
    });
  }

  qualifiedTableName(tableName) {
    const name = this.schema ? `${this.schema}.${tableName}` : tableName;
    return this.formatter.wrap(name);
  }

  // Compile a rename table command.
  renameTable(from, to) {
    this.pushQuery(
      `alter table ${this.qualifiedTableName(
        from
      )} rename to ${this.formatter.wrap(to)}`
    );
  }

  createSchema(schemaName) {
    this.pushQuery(`create schema ${this.formatter.wrap(schemaName)}`);
  }

  createSchemaIfNotExists(schemaName) {
    this.pushQuery(
      `create schema if not exists ${this.formatter.wrap(schemaName)}`
    );
  }

  dropSchema(schemaName, cascade = false) {
    this.pushQuery(
      `drop schema ${this.formatter.wrap(schemaName)}${
        cascade ? ' cascade' : ''
      }`
    );
  }

  dropSchemaIfExists(schemaName, cascade = false) {
    this.pushQuery(
      `drop schema if exists ${this.formatter.wrap(schemaName)}${
        cascade ? ' cascade' : ''
      }`
    );
  }

  dropExtension(extensionName) {
    this.pushQuery(`drop extension ${this.formatter.wrap(extensionName)}`);
  }

  dropExtensionIfExists(extensionName) {
    this.pushQuery(
      `drop extension if exists ${this.formatter.wrap(extensionName)}`
    );
  }

  createExtension(extensionName) {
    this.pushQuery(`create extension ${this.formatter.wrap(extensionName)}`);
  }

  createExtensionIfNotExists(extensionName) {
    this.pushQuery(
      `create extension if not exists ${this.formatter.wrap(extensionName)}`
    );
  }

  renameView(from, to) {
    this.pushQuery(
      this.alterViewPrefix +
        `${this.formatter.wrap(from)} rename to ${this.formatter.wrap(to)}`
    );
  }

  refreshMaterializedView(viewName, concurrently = false) {
    this.pushQuery({
      sql: `refresh materialized view${
        concurrently ? ' concurrently' : ''
      } ${this.formatter.wrap(viewName)}`,
    });
  }

  dropMaterializedView(viewName) {
    this._dropView(viewName, false, true);
  }

  dropMaterializedViewIfExists(viewName) {
    this._dropView(viewName, true, true);
  }
}

var pgCompiler = SchemaCompiler_PG;

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: _nodeResolve_empty
});

var require$$15 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

// PostgreSQL
// -------
const extend = extend$4;
const map = map_1;
const { promisify } = util;
const Client = client;

const Transaction = pgTransaction;
const QueryCompiler = pgQuerycompiler;
const QueryBuilder = pgQuerybuilder;
const ColumnCompiler = pgColumncompiler;
const TableCompiler = pgTablecompiler;
const ViewCompiler = pgViewcompiler;
const ViewBuilder = pgViewbuilder;
const SchemaCompiler = pgCompiler;
const { makeEscape } = string;
const { isString } = is;

class Client_PG extends Client {
  constructor(config) {
    super(config);
    if (config.returning) {
      this.defaultReturning = config.returning;
    }

    if (config.searchPath) {
      this.searchPath = config.searchPath;
    }
  }
  transaction() {
    return new Transaction(this, ...arguments);
  }

  queryBuilder() {
    return new QueryBuilder(this);
  }

  queryCompiler(builder, formatter) {
    return new QueryCompiler(this, builder, formatter);
  }

  columnCompiler() {
    return new ColumnCompiler(this, ...arguments);
  }

  schemaCompiler() {
    return new SchemaCompiler(this, ...arguments);
  }

  tableCompiler() {
    return new TableCompiler(this, ...arguments);
  }

  viewCompiler() {
    return new ViewCompiler(this, ...arguments);
  }

  viewBuilder() {
    return new ViewBuilder(this, ...arguments);
  }

  _driver() {
    return require$$15;
  }

  wrapIdentifierImpl(value) {
    if (value === '*') return value;

    let arrayAccessor = '';
    const arrayAccessorMatch = value.match(/(.*?)(\[[0-9]+\])/);

    if (arrayAccessorMatch) {
      value = arrayAccessorMatch[1];
      arrayAccessor = arrayAccessorMatch[2];
    }

    return `"${value.replace(/"/g, '""')}"${arrayAccessor}`;
  }

  _acquireOnlyConnection() {
    const connection = new this.driver.Client(this.connectionSettings);

    connection.on('error', (err) => {
      connection.__knex__disposed = err;
    });

    connection.on('end', (err) => {
      connection.__knex__disposed = err || 'Connection ended unexpectedly';
    });

    return connection.connect().then(() => connection);
  }

  // Get a raw connection, called by the `pool` whenever a new
  // connection needs to be added to the pool.
  acquireRawConnection() {
    const client = this;

    return this._acquireOnlyConnection()
      .then(function (connection) {
        if (!client.version) {
          return client.checkVersion(connection).then(function (version) {
            client.version = version;
            return connection;
          });
        }

        return connection;
      })
      .then(async function setSearchPath(connection) {
        await client.setSchemaSearchPath(connection);
        return connection;
      });
  }

  // Used to explicitly close a connection, called internally by the pool
  // when a connection times out or the pool is shutdown.
  async destroyRawConnection(connection) {
    const end = promisify((cb) => connection.end(cb));
    return end();
  }

  // In PostgreSQL, we need to do a version check to do some feature
  // checking on the database.
  checkVersion(connection) {
    return new Promise((resolve, reject) => {
      connection.query('select version();', (err, resp) => {
        if (err) return reject(err);
        resolve(this._parseVersion(resp.rows[0].version));
      });
    });
  }

  _parseVersion(versionString) {
    return /^PostgreSQL (.*?)( |$)/.exec(versionString)[1];
  }

  // Position the bindings for the query. The escape sequence for question mark
  // is \? (e.g. knex.raw("\\?") since javascript requires '\' to be escaped too...)
  positionBindings(sql) {
    let questionCount = 0;
    return sql.replace(/(\\*)(\?)/g, function (match, escapes) {
      if (escapes.length % 2) {
        return '?';
      } else {
        questionCount++;
        return `$${questionCount}`;
      }
    });
  }

  setSchemaSearchPath(connection, searchPath) {
    let path = searchPath || this.searchPath;

    if (!path) return Promise.resolve(true);

    if (!Array.isArray(path) && !isString(path)) {
      throw new TypeError(
        `knex: Expected searchPath to be Array/String, got: ${typeof path}`
      );
    }

    if (isString(path)) {
      if (path.includes(',')) {
        const parts = path.split(',');
        const arraySyntax = `[${parts
          .map((searchPath) => `'${searchPath}'`)
          .join(', ')}]`;
        this.logger.warn(
          `Detected comma in searchPath "${path}".` +
            `If you are trying to specify multiple schemas, use Array syntax: ${arraySyntax}`
        );
      }
      path = [path];
    }

    path = path.map((schemaName) => `"${schemaName}"`).join(',');

    return new Promise(function (resolver, rejecter) {
      connection.query(`set search_path to ${path}`, function (err) {
        if (err) return rejecter(err);
        resolver(true);
      });
    });
  }

  _stream(connection, obj, stream, options) {
    if (!obj.sql) throw new Error('The query is empty');

    const PGQueryStream = process.browser
      ? undefined
      : require$$15;
    const sql = obj.sql;

    return new Promise(function (resolver, rejecter) {
      const queryStream = connection.query(
        new PGQueryStream(sql, obj.bindings, options)
      );

      queryStream.on('error', function (error) {
        rejecter(error);
        stream.emit('error', error);
      });

      // 'end' IS propagated by .pipe, by default
      stream.on('end', resolver);
      queryStream.pipe(stream);
    });
  }

  // Runs the query on the specified connection, providing the bindings
  // and any other necessary prep work.
  _query(connection, obj) {
    if (!obj.sql) throw new Error('The query is empty');

    let queryConfig = {
      text: obj.sql,
      values: obj.bindings || [],
    };

    if (obj.options) {
      queryConfig = extend(queryConfig, obj.options);
    }

    return new Promise(function (resolver, rejecter) {
      connection.query(queryConfig, function (err, response) {
        if (err) return rejecter(err);
        obj.response = response;
        resolver(obj);
      });
    });
  }

  // Ensures the response is returned in the same format as other clients.
  processResponse(obj, runner) {
    const resp = obj.response;
    if (obj.output) return obj.output.call(runner, resp);
    if (obj.method === 'raw') return resp;
    const { returning } = obj;
    if (resp.command === 'SELECT') {
      if (obj.method === 'first') return resp.rows[0];
      if (obj.method === 'pluck') return map(resp.rows, obj.pluck);
      return resp.rows;
    }
    if (returning) {
      const returns = [];
      for (let i = 0, l = resp.rows.length; i < l; i++) {
        const row = resp.rows[i];
        returns[i] = row;
      }
      return returns;
    }
    if (resp.command === 'UPDATE' || resp.command === 'DELETE') {
      return resp.rowCount;
    }
    return resp;
  }

  async cancelQuery(connectionToKill) {
    const conn = await this.acquireRawConnection();

    try {
      return await this._wrappedCancelQueryCall(conn, connectionToKill);
    } finally {
      await this.destroyRawConnection(conn).catch((err) => {
        this.logger.warn(`Connection Error: ${err}`);
      });
    }
  }
  _wrappedCancelQueryCall(conn, connectionToKill) {
    return this._query(conn, {
      sql: 'SELECT pg_cancel_backend($1);',
      bindings: [connectionToKill.processID],
      options: {},
    });
  }

  toPathForJson(jsonPath) {
    const PG_PATH_REGEX = /^{.*}$/;
    if (jsonPath.match(PG_PATH_REGEX)) {
      return jsonPath;
    }
    return (
      '{' +
      jsonPath
        .replace(/^(\$\.)/, '') // remove the first dollar
        .replace('.', ',')
        .replace(/\[([0-9]+)]/, ',$1') + // transform [number] to ,number
      '}'
    );
  }
}

Object.assign(Client_PG.prototype, {
  dialect: 'postgresql',

  driverName: 'pg',
  canCancelQuery: true,

  _escapeBinding: makeEscape({
    escapeArray(val, esc) {
      return esc(arrayString(val, esc));
    },
    escapeString(str) {
      let hasBackslash = false;
      let escaped = "'";
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "'") {
          escaped += c + c;
        } else if (c === '\\') {
          escaped += c + c;
          hasBackslash = true;
        } else {
          escaped += c;
        }
      }
      escaped += "'";
      if (hasBackslash === true) {
        escaped = 'E' + escaped;
      }
      return escaped;
    },
    escapeObject(val, prepareValue, timezone, seen = []) {
      if (val && typeof val.toPostgres === 'function') {
        seen = seen || [];
        if (seen.indexOf(val) !== -1) {
          throw new Error(
            `circular reference detected while preparing "${val}" for query`
          );
        }
        seen.push(val);
        return prepareValue(val.toPostgres(prepareValue), seen);
      }
      return JSON.stringify(val);
    },
  }),
});

function arrayString(arr, esc) {
  let result = '{';
  for (let i = 0; i < arr.length; i++) {
    if (i > 0) result += ',';
    const val = arr[i];
    if (val === null || typeof val === 'undefined') {
      result += 'NULL';
    } else if (Array.isArray(val)) {
      result += arrayString(val, esc);
    } else if (typeof val === 'number') {
      result += val;
    } else {
      result += JSON.stringify(typeof val === 'string' ? val : esc(val));
    }
  }
  return result + '}';
}

var postgres = Client_PG;

var index = /*@__PURE__*/getDefaultExportFromCjs(postgres);

export { index as default };
