import require$$4 from 'timers-browserify';
import require$$2 from 'stream-browserify';
import require$$0 from 'assert-browserify';
import require$$0$1 from 'tty-browserify';
import require$$0$3 from 'crypto-browserify';

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

var tarn = {exports: {}};

var Pool$2 = {};

var PendingOperation$1 = {};

var TimeoutError$2 = {};

Object.defineProperty(TimeoutError$2, "__esModule", { value: true });
let TimeoutError$1 = class TimeoutError extends Error {
};
TimeoutError$2.TimeoutError = TimeoutError$1;

var utils$3 = {};

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

Object.defineProperty(utils$3, "__esModule", { value: true });
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
utils$3.defer = defer;
function now() {
    return Date.now();
}
utils$3.now = now;
function duration(t1, t2) {
    return Math.abs(t2 - t1);
}
utils$3.duration = duration;
function checkOptionalTime(time) {
    if (typeof time === 'undefined') {
        return true;
    }
    return checkRequiredTime(time);
}
utils$3.checkOptionalTime = checkOptionalTime;
function checkRequiredTime(time) {
    return typeof time === 'number' && time === Math.round(time) && time > 0;
}
utils$3.checkRequiredTime = checkRequiredTime;
function delay$2(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
utils$3.delay = delay$2;
function reflect(promise) {
    return promise
        .then(value => {
        return new PromiseInspection_1.PromiseInspection({ value });
    })
        .catch(error => {
        return new PromiseInspection_1.PromiseInspection({ error });
    });
}
utils$3.reflect = reflect;
function tryPromise(cb) {
    try {
        const result = cb();
        return Promise.resolve(result);
    }
    catch (err) {
        return Promise.reject(err);
    }
}
utils$3.tryPromise = tryPromise;

Object.defineProperty(PendingOperation$1, "__esModule", { value: true });
const TimeoutError_1 = TimeoutError$2;
const utils_1$2 = utils$3;
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
const utils_1$1 = utils$3;
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
const utils_1 = utils$3;
const events_1 = eventsExports;
const timers_1 = require$$4;
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
var rePropName$1 = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar$1 = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath$2 = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError$1('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError$1('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName$1, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar$1, '$1') : number || match;
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
	var parts = stringToPath$2(name);
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

var isArguments$6 = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

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
var hasOwnProperty$i = Object.prototype.hasOwnProperty;

var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty$i.call(array, i)) {
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
        if (hasOwnProperty$i.call(object, k)) {
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

var isTypedArray$7 = function isTypedArray(value) {
	return !!whichTypedArray(value);
};

(function (exports) {

	var isArgumentsObject = isArguments$6;
	var isGeneratorFunction$1 = isGeneratorFunction;
	var whichTypedArray = whichTypedArray$1;
	var isTypedArray = isTypedArray$7;

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

function makeEscape$1(config = {}) {
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
  makeEscape: makeEscape$1,
};

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

var eq$5 = eq_1;

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
    if (eq$5(array[length][0], key)) {
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
var hasOwnProperty$h = objectProto$k.hasOwnProperty;

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
  var isOwn = hasOwnProperty$h.call(value, symToStringTag$1),
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

function isObject$i(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject$i;

var baseGetTag$6 = _baseGetTag,
    isObject$h = isObject_1;

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
  if (!isObject$h(value)) {
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
    isObject$g = isObject_1,
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
var hasOwnProperty$g = objectProto$i.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString$1.call(hasOwnProperty$g).replace(reRegExpChar, '\\$&')
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
  if (!isObject$g(value) || isMasked(value)) {
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

var getNative$6 = _getNative,
    root$5 = _root;

/* Built-in method references that are verified to be native. */
var Map$4 = getNative$6(root$5, 'Map');

var _Map = Map$4;

var getNative$5 = _getNative;

/* Built-in method references that are verified to be native. */
var nativeCreate$4 = getNative$5(Object, 'create');

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
var objectProto$h = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$f = objectProto$h.hasOwnProperty;

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
  return hasOwnProperty$f.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet$1;

var nativeCreate$1 = _nativeCreate;

/** Used for built-in method references. */
var objectProto$g = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$e = objectProto$g.hasOwnProperty;

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
  return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$e.call(data, key);
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

var getNative$4 = _getNative;

var defineProperty$2 = (function() {
  try {
    var func = getNative$4(Object, 'defineProperty');
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

var baseAssignValue$3 = _baseAssignValue,
    eq$4 = eq_1;

/** Used for built-in method references. */
var objectProto$f = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$d = objectProto$f.hasOwnProperty;

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
  if (!(hasOwnProperty$d.call(object, key) && eq$4(objValue, value)) ||
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
var objectProto$e = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$c = objectProto$e.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$e.propertyIsEnumerable;

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
var isArguments$5 = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike$8(value) && hasOwnProperty$c.call(value, 'callee') &&
    !propertyIsEnumerable$1.call(value, 'callee');
};

var isArguments_1 = isArguments$5;

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

/** Used as references for various `Number` constants. */

var MAX_SAFE_INTEGER$1 = 9007199254740991;

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
  length = length == null ? MAX_SAFE_INTEGER$1 : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex$4;

/** Used as references for various `Number` constants. */

var MAX_SAFE_INTEGER = 9007199254740991;

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
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

var isLength_1 = isLength$3;

var baseGetTag$4 = _baseGetTag,
    isLength$2 = isLength_1,
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
    isLength$2(value.length) && !!typedArrayTags[baseGetTag$4(value)];
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
var isTypedArray$6 = nodeIsTypedArray ? baseUnary$2(nodeIsTypedArray) : baseIsTypedArray;

var isTypedArray_1 = isTypedArray$6;

var baseTimes = _baseTimes,
    isArguments$4 = isArguments_1,
    isArray$i = isArray_1,
    isBuffer$5 = isBufferExports,
    isIndex$3 = _isIndex,
    isTypedArray$5 = isTypedArray_1;

/** Used for built-in method references. */
var objectProto$d = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$b = objectProto$d.hasOwnProperty;

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
      isArg = !isArr && isArguments$4(value),
      isBuff = !isArr && !isArg && isBuffer$5(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray$5(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$b.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex$3(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

var _arrayLikeKeys = arrayLikeKeys$2;

/** Used for built-in method references. */

var objectProto$c = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype$5(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$c;

  return value === proto;
}

var _isPrototype = isPrototype$5;

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

var isPrototype$4 = _isPrototype,
    nativeKeys = _nativeKeys;

/** Used for built-in method references. */
var objectProto$b = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$a = objectProto$b.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys$2(object) {
  if (!isPrototype$4(object)) {
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

var isFunction$7 = isFunction_1,
    isLength$1 = isLength_1;

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
  return value != null && isLength$1(value.length) && !isFunction$7(value);
}

var isArrayLike_1 = isArrayLike$9;

var arrayLikeKeys$1 = _arrayLikeKeys,
    baseKeys$1 = _baseKeys,
    isArrayLike$8 = isArrayLike_1;

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
  return isArrayLike$8(object) ? arrayLikeKeys$1(object) : baseKeys$1(object);
}

var keys_1 = keys$7;

var copyObject$6 = _copyObject,
    keys$6 = keys_1;

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
  return object && copyObject$6(source, keys$6(source), object);
}

var _baseAssign = baseAssign$1;

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

var isObject$f = isObject_1,
    isPrototype$3 = _isPrototype,
    nativeKeysIn = _nativeKeysIn;

/** Used for built-in method references. */
var objectProto$a = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$9 = objectProto$a.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn$1(object) {
  if (!isObject$f(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype$3(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$9.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

var _baseKeysIn = baseKeysIn$1;

var arrayLikeKeys = _arrayLikeKeys,
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
  return isArrayLike$7(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

var keysIn_1 = keysIn$7;

var copyObject$5 = _copyObject,
    keysIn$6 = keysIn_1;

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
  return object && copyObject$5(source, keysIn$6(source), object);
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
var objectProto$9 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$9.propertyIsEnumerable;

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

var copyObject$4 = _copyObject,
    getSymbols$2 = _getSymbols;

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols$1(source, object) {
  return copyObject$4(source, getSymbols$2(source), object);
}

var _copySymbols = copySymbols$1;

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

var overArg = _overArg;

/** Built-in value references. */
var getPrototype$4 = overArg(Object.getPrototypeOf, Object);

var _getPrototype = getPrototype$4;

var arrayPush$2 = _arrayPush,
    getPrototype$3 = _getPrototype,
    getSymbols$1 = _getSymbols,
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
    arrayPush$2(result, getSymbols$1(object));
    object = getPrototype$3(object);
  }
  return result;
};

var _getSymbolsIn = getSymbolsIn$2;

var copyObject$3 = _copyObject,
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
  return copyObject$3(source, getSymbolsIn$1(source), object);
}

var _copySymbolsIn = copySymbolsIn$1;

var arrayPush$1 = _arrayPush,
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
  return isArray$h(object) ? result : arrayPush$1(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys$2;

var baseGetAllKeys$1 = _baseGetAllKeys,
    getSymbols = _getSymbols,
    keys$5 = keys_1;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys$2(object) {
  return baseGetAllKeys$1(object, keys$5, getSymbols);
}

var _getAllKeys = getAllKeys$2;

var baseGetAllKeys = _baseGetAllKeys,
    getSymbolsIn = _getSymbolsIn,
    keysIn$5 = keysIn_1;

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn$2(object) {
  return baseGetAllKeys(object, keysIn$5, getSymbolsIn);
}

var _getAllKeysIn = getAllKeysIn$2;

var getNative$3 = _getNative,
    root$4 = _root;

/* Built-in method references that are verified to be native. */
var DataView$2 = getNative$3(root$4, 'DataView');

var _DataView = DataView$2;

var getNative$2 = _getNative,
    root$3 = _root;

/* Built-in method references that are verified to be native. */
var Promise$2 = getNative$2(root$3, 'Promise');

var _Promise = Promise$2;

var getNative$1 = _getNative,
    root$2 = _root;

/* Built-in method references that are verified to be native. */
var Set$2 = getNative$1(root$2, 'Set');

var _Set = Set$2;

var getNative = _getNative,
    root$1 = _root;

/* Built-in method references that are verified to be native. */
var WeakMap$2 = getNative(root$1, 'WeakMap');

var _WeakMap = WeakMap$2;

var DataView$1 = _DataView,
    Map$1 = _Map,
    Promise$1 = _Promise,
    Set$1 = _Set,
    WeakMap$1 = _WeakMap,
    baseGetTag$3 = _baseGetTag,
    toSource = _toSource;

/** `Object#toString` result references. */
var mapTag$6 = '[object Map]',
    objectTag$3 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$6 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';

var dataViewTag$3 = '[object DataView]';

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
if ((DataView$1 && getTag$6(new DataView$1(new ArrayBuffer(1))) != dataViewTag$3) ||
    (Map$1 && getTag$6(new Map$1) != mapTag$6) ||
    (Promise$1 && getTag$6(Promise$1.resolve()) != promiseTag) ||
    (Set$1 && getTag$6(new Set$1) != setTag$6) ||
    (WeakMap$1 && getTag$6(new WeakMap$1) != weakMapTag$1)) {
  getTag$6 = function(value) {
    var result = baseGetTag$3(value),
        Ctor = result == objectTag$3 ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$3;
        case mapCtorString: return mapTag$6;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$6;
        case weakMapCtorString: return weakMapTag$1;
      }
    }
    return result;
  };
}

var _getTag = getTag$6;

/** Used for built-in method references. */

var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$8.hasOwnProperty;

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
  if (length && typeof array[0] == 'string' && hasOwnProperty$8.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

var _initCloneArray = initCloneArray$1;

var root = _root;

/** Built-in value references. */
var Uint8Array$3 = root.Uint8Array;

var _Uint8Array = Uint8Array$3;

var Uint8Array$2 = _Uint8Array;

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer$3(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array$2(result).set(new Uint8Array$2(arrayBuffer));
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

var Symbol$5 = _Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto$2 = Symbol$5 ? Symbol$5.prototype : undefined,
    symbolValueOf$1 = symbolProto$2 ? symbolProto$2.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol$1(symbol) {
  return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {};
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
var boolTag$2 = '[object Boolean]',
    dateTag$2 = '[object Date]',
    mapTag$5 = '[object Map]',
    numberTag$2 = '[object Number]',
    regexpTag$2 = '[object RegExp]',
    setTag$5 = '[object Set]',
    stringTag$3 = '[object String]',
    symbolTag$3 = '[object Symbol]';

var arrayBufferTag$2 = '[object ArrayBuffer]',
    dataViewTag$2 = '[object DataView]',
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
    case arrayBufferTag$2:
      return cloneArrayBuffer(object);

    case boolTag$2:
    case dateTag$2:
      return new Ctor(+object);

    case dataViewTag$2:
      return cloneDataView(object, isDeep);

    case float32Tag$1: case float64Tag$1:
    case int8Tag$1: case int16Tag$1: case int32Tag$1:
    case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
      return cloneTypedArray$1(object, isDeep);

    case mapTag$5:
      return new Ctor;

    case numberTag$2:
    case stringTag$3:
      return new Ctor(object);

    case regexpTag$2:
      return cloneRegExp(object);

    case setTag$5:
      return new Ctor;

    case symbolTag$3:
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

var getTag$5 = _getTag,
    isObjectLike$6 = isObjectLike_1;

/** `Object#toString` result references. */
var mapTag$4 = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap$1(value) {
  return isObjectLike$6(value) && getTag$5(value) == mapTag$4;
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

var getTag$4 = _getTag,
    isObjectLike$5 = isObjectLike_1;

/** `Object#toString` result references. */
var setTag$4 = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet$1(value) {
  return isObjectLike$5(value) && getTag$4(value) == setTag$4;
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

var Stack$3 = _Stack,
    arrayEach$2 = _arrayEach,
    assignValue$2 = _assignValue,
    baseAssign = _baseAssign,
    baseAssignIn = _baseAssignIn,
    cloneBuffer$1 = _cloneBufferExports,
    copyArray$2 = _copyArray,
    copySymbols = _copySymbols,
    copySymbolsIn = _copySymbolsIn,
    getAllKeys$1 = _getAllKeys,
    getAllKeysIn$1 = _getAllKeysIn,
    getTag$3 = _getTag,
    initCloneArray = _initCloneArray,
    initCloneByTag = _initCloneByTag,
    initCloneObject$1 = _initCloneObject,
    isArray$g = isArray_1,
    isBuffer$4 = isBufferExports,
    isMap = isMap_1,
    isObject$d = isObject_1,
    isSet = isSet_1,
    keys$4 = keys_1,
    keysIn$4 = keysIn_1;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$1 = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG$2 = 4;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    errorTag$1 = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag$3 = '[object Map]',
    numberTag$1 = '[object Number]',
    objectTag$2 = '[object Object]',
    regexpTag$1 = '[object RegExp]',
    setTag$3 = '[object Set]',
    stringTag$2 = '[object String]',
    symbolTag$2 = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]',
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
cloneableTags[argsTag$1] = cloneableTags[arrayTag$1] =
cloneableTags[arrayBufferTag$1] = cloneableTags[dataViewTag$1] =
cloneableTags[boolTag$1] = cloneableTags[dateTag$1] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag$3] =
cloneableTags[numberTag$1] = cloneableTags[objectTag$2] =
cloneableTags[regexpTag$1] = cloneableTags[setTag$3] =
cloneableTags[stringTag$2] = cloneableTags[symbolTag$2] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag$1] = cloneableTags[funcTag] =
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
  var isArr = isArray$g(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray$2(value, result);
    }
  } else {
    var tag = getTag$3(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer$4(value)) {
      return cloneBuffer$1(value, isDeep);
    }
    if (tag == objectTag$2 || tag == argsTag$1 || (isFunc && !object)) {
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
  stack || (stack = new Stack$3);
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
    ? (isFlat ? getAllKeysIn$1 : getAllKeys$1)
    : (isFlat ? keysIn$4 : keys$4);

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

function identity$4(value) {
  return value;
}

var identity_1 = identity$4;

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
    identity$3 = identity_1;

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString$1 = !defineProperty ? identity$3 : function(func, string) {
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

var identity$2 = identity_1,
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
  return setToString(overRest(func, start, identity$2), func + '');
}

var _baseRest = baseRest$2;

var eq$3 = eq_1,
    isArrayLike$6 = isArrayLike_1,
    isIndex$2 = _isIndex,
    isObject$c = isObject_1;

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
  if (!isObject$c(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike$6(object) && isIndex$2(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq$3(object[index], value);
  }
  return false;
}

var _isIterateeCall = isIterateeCall$3;

var baseRest$1 = _baseRest,
    eq$2 = eq_1,
    isIterateeCall$2 = _isIterateeCall,
    keysIn$3 = keysIn_1;

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$7.hasOwnProperty;

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
var defaults$1 = baseRest$1(function(object, sources) {
  object = Object(object);

  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : undefined;

  if (guard && isIterateeCall$2(sources[0], sources[1], guard)) {
    length = 1;
  }

  while (++index < length) {
    var source = sources[index];
    var props = keysIn$3(source);
    var propsIndex = -1;
    var propsLength = props.length;

    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object[key];

      if (value === undefined ||
          (eq$2(value, objectProto$7[key]) && !hasOwnProperty$7.call(object, key))) {
        object[key] = source[key];
      }
    }
  }

  return object;
});

var defaults_1 = defaults$1;

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

var baseGetTag$2 = _baseGetTag,
    isObjectLike$4 = isObjectLike_1;

/** `Object#toString` result references. */
var symbolTag$1 = '[object Symbol]';

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
    (isObjectLike$4(value) && baseGetTag$2(value) == symbolTag$1);
}

var isSymbol_1 = isSymbol$4;

var Symbol$4 = _Symbol,
    arrayMap$3 = _arrayMap,
    isArray$f = isArray_1,
    isSymbol$3 = isSymbol_1;

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
  if (isArray$f(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap$3(value, baseToString$1) + '';
  }
  if (isSymbol$3(value)) {
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

var toString$1 = toString_1;

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
  return toString$1(prefix) + id;
}

var uniqueId_1 = uniqueId$2;

var timeout$3 = {};

let KnexTimeoutError$4 = class KnexTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'KnexTimeoutError';
  }
};

function timeout$2(promise, ms) {
  return new Promise(function (resolve, reject) {
    const id = setTimeout(function () {
      reject(new KnexTimeoutError$4('operation timed out'));
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

timeout$3.KnexTimeoutError = KnexTimeoutError$4;
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

const { KnexTimeoutError: KnexTimeoutError$3 } = timeout$3;
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
        if (!(error instanceof KnexTimeoutError$3)) {
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
      if (!(error instanceof KnexTimeoutError$3)) {
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
    eq$1 = eq_1;

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
  if ((value !== undefined && !eq$1(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue$1(object, key, value);
  }
}

var _assignMergeValue = assignMergeValue$2;

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

var isArrayLike$5 = isArrayLike_1,
    isObjectLike$3 = isObjectLike_1;

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
  return isObjectLike$3(value) && isArrayLike$5(value);
}

var isArrayLikeObject_1 = isArrayLikeObject$1;

var baseGetTag$1 = _baseGetTag,
    getPrototype$1 = _getPrototype,
    isObjectLike$2 = isObjectLike_1;

/** `Object#toString` result references. */
var objectTag$1 = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto$6 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$6.hasOwnProperty;

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
  if (!isObjectLike$2(value) || baseGetTag$1(value) != objectTag$1) {
    return false;
  }
  var proto = getPrototype$1(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$6.call(proto, 'constructor') && proto.constructor;
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

var copyObject$2 = _copyObject,
    keysIn$2 = keysIn_1;

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
  return copyObject$2(value, keysIn$2(value));
}

var toPlainObject_1 = toPlainObject$1;

var assignMergeValue$1 = _assignMergeValue,
    cloneBuffer = _cloneBufferExports,
    cloneTypedArray = _cloneTypedArray,
    copyArray$1 = _copyArray,
    initCloneObject = _initCloneObject,
    isArguments$3 = isArguments_1,
    isArray$e = isArray_1,
    isArrayLikeObject = isArrayLikeObject_1,
    isBuffer$3 = isBufferExports,
    isFunction$6 = isFunction_1,
    isObject$b = isObject_1,
    isPlainObject$4 = isPlainObject_1,
    isTypedArray$4 = isTypedArray_1,
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
    var isArr = isArray$e(srcValue),
        isBuff = !isArr && isBuffer$3(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray$4(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray$e(objValue)) {
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
    else if (isPlainObject$4(srcValue) || isArguments$3(srcValue)) {
      newValue = objValue;
      if (isArguments$3(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject$b(objValue) || isFunction$6(objValue)) {
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

var Stack$2 = _Stack,
    assignMergeValue = _assignMergeValue,
    baseFor$1 = _baseFor,
    baseMergeDeep = _baseMergeDeep,
    isObject$a = isObject_1,
    keysIn$1 = keysIn_1,
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
  baseFor$1(source, function(srcValue, key) {
    stack || (stack = new Stack$2);
    if (isObject$a(srcValue)) {
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
  }, keysIn$1);
}

var _baseMerge = baseMerge$1;

var baseRest = _baseRest,
    isIterateeCall$1 = _isIterateeCall;

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner$3(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall$1(sources[0], sources[1], guard)) {
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

var baseMerge = _baseMerge,
    createAssigner$2 = _createAssigner;

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
var merge$1 = createAssigner$2(function(object, source, srcIndex) {
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
    isObject$9 = isObject_1,
    isSymbol$2 = isSymbol_1;

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
function toNumber$3(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol$2(value)) {
    return NAN;
  }
  if (isObject$9(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$9(other) ? (other + '') : other;
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

var toNumber_1 = toNumber$3;

var toNumber$2 = toNumber_1;

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0,
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
  value = toNumber$2(value);
  if (value === INFINITY$1 || value === -INFINITY$1) {
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

var Symbol$3 = _Symbol,
    isArguments$2 = isArguments_1,
    isArray$d = isArray_1;

/** Built-in value references. */
var spreadableSymbol = Symbol$3 ? Symbol$3.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable$1(value) {
  return isArray$d(value) || isArguments$2(value) ||
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

function isString$8(value) {
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

function isObject$8(value) {
  return typeof value === 'object' && value !== null;
}

function isFunction$5(value) {
  return typeof value === 'function';
}

var is = {
  isString: isString$8,
  isNumber: isNumber$3,
  isBoolean: isBoolean$1,
  isUndefined: isUndefined$1,
  isObject: isObject$8,
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
const QueryInterface$1 = methodConstants;
const merge = merge_1;
const batchInsert = batchInsert_1;
const { isObject: isObject$7 } = is;
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

function makeKnex$2(client) {
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
      if (!_config && isObject$7(container)) {
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
  for (let i = 0; i < QueryInterface$1.length; i++) {
    const method = QueryInterface$1[i];
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

var makeKnex_1 = makeKnex$2;

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

const makeKnex$1 = makeKnex_1;
const { timeout, KnexTimeoutError: KnexTimeoutError$2 } = timeout$3;
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
let Transaction$1 = class Transaction extends EventEmitter$4 {
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
        if (!(err instanceof KnexTimeoutError$2)) {
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
      if (!(err instanceof KnexTimeoutError$2)) {
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
finallyMixin$1(Transaction$1.prototype);

// The transactor is a full featured knex object, with a "commit", a "rollback"
// and a "savepoint" function. The "savepoint" is just sugar for creating a new
// transaction. If the rollback is run inside a savepoint, it rolls back to the
// last savepoint - otherwise it rolls back the transaction.
function makeTransactor(trx, connection, trxClient) {
  const transactor = makeKnex$1(trxClient);

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

var transaction$5 = Transaction$1;

const _debugQuery = browserExports('knex:query');
const debugBindings$2 = browserExports('knex:bindings');
const debugQuery = (sql, txId) => _debugQuery(sql.replace(/%/g, '%%'), txId);
const { isString: isString$7 } = is;

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
  const queryObject = isString$7(queryParam) ? { sql: queryParam } : queryParam;

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
    copyObject$1 = _copyObject,
    createAssigner$1 = _createAssigner,
    isArrayLike$4 = isArrayLike_1,
    isPrototype$1 = _isPrototype,
    keys$3 = keys_1;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$5.hasOwnProperty;

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
var assign$7 = createAssigner$1(function(object, source) {
  if (isPrototype$1(source) || isArrayLike$4(source)) {
    copyObject$1(source, keys$3(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty$5.call(source, key)) {
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

var baseFor = _baseFor,
    keys$2 = keys_1;

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn$2(object, iteratee) {
  return object && baseFor(object, iteratee, keys$2);
}

var _baseForOwn = baseForOwn$2;

var isArrayLike$3 = isArrayLike_1;

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
    if (!isArrayLike$3(collection)) {
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
    baseEach$4 = _baseEach,
    castFunction = _castFunction,
    isArray$c = isArray_1;

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
  var func = isArray$c(collection) ? arrayEach$1 : baseEach$4;
  return func(collection, castFunction(iteratee));
}

var forEach_1 = forEach;

var each$2 = forEach_1;

var baseKeys = _baseKeys,
    getTag$2 = _getTag,
    isArguments$1 = isArguments_1,
    isArray$b = isArray_1,
    isArrayLike$2 = isArrayLike_1,
    isBuffer$2 = isBufferExports,
    isPrototype = _isPrototype,
    isTypedArray$3 = isTypedArray_1;

/** `Object#toString` result references. */
var mapTag$2 = '[object Map]',
    setTag$2 = '[object Set]';

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

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
  if (isArrayLike$2(value) &&
      (isArray$b(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        isBuffer$2(value) || isTypedArray$3(value) || isArguments$1(value))) {
    return !value.length;
  }
  var tag = getTag$2(value);
  if (tag == mapTag$2 || tag == setTag$2) {
    return !value.size;
  }
  if (isPrototype(value)) {
    return !baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty$4.call(value, key)) {
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

var baseEach$3 = _baseEach;

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
  baseEach$3(collection, function(value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

var _baseFilter = baseFilter$1;

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

var _arraySome;
var hasRequired_arraySome;

function require_arraySome () {
	if (hasRequired_arraySome) return _arraySome;
	hasRequired_arraySome = 1;
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	_arraySome = arraySome;
	return _arraySome;
}

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
    arraySome = require_arraySome(),
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

var Symbol$2 = _Symbol,
    Uint8Array$1 = _Uint8Array,
    eq = eq_1,
    equalArrays$1 = _equalArrays,
    mapToArray$1 = _mapToArray,
    setToArray$1 = _setToArray;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$4 = 1,
    COMPARE_UNORDERED_FLAG$2 = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag$1 = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag$1 = '[object Set]',
    stringTag$1 = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$2 ? Symbol$2.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

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
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag$1:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag$1:
      var convert = mapToArray$1;

    case setTag$1:
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

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

var _equalByTag = equalByTag$1;

var getAllKeys = _getAllKeys;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$3 = 1;

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

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
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$3.call(other, key))) {
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

var Stack$1 = _Stack,
    equalArrays = _equalArrays,
    equalByTag = _equalByTag,
    equalObjects = _equalObjects,
    getTag$1 = _getTag,
    isArray$a = isArray_1,
    isBuffer$1 = isBufferExports,
    isTypedArray$2 = isTypedArray_1;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$2 = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

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
  var objIsArr = isArray$a(object),
      othIsArr = isArray$a(other),
      objTag = objIsArr ? arrayTag : getTag$1(object),
      othTag = othIsArr ? arrayTag : getTag$1(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer$1(object)) {
    if (!isBuffer$1(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack$1);
    return (objIsArr || isTypedArray$2(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
    var objIsWrapped = objIsObj && hasOwnProperty$2.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$2.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack$1);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack$1);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

var _baseIsEqualDeep = baseIsEqualDeep$1;

var baseIsEqualDeep = _baseIsEqualDeep,
    isObjectLike$1 = isObjectLike_1;

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
  if (value == null || other == null || (!isObjectLike$1(value) && !isObjectLike$1(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$2, stack);
}

var _baseIsEqual = baseIsEqual$2;

var Stack = _Stack,
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
      var stack = new Stack;
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

var isObject$6 = isObject_1;

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable$2(value) {
  return value === value && !isObject$6(value);
}

var _isStrictComparable = isStrictComparable$2;

var isStrictComparable$1 = _isStrictComparable,
    keys$1 = keys_1;

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData$1(object) {
  var result = keys$1(object),
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

var isArray$9 = isArray_1,
    isSymbol$1 = isSymbol_1;

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
  if (isArray$9(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol$1(value)) {
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
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath$1 = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

var _stringToPath = stringToPath$1;

var isArray$8 = isArray_1,
    isKey$2 = _isKey,
    stringToPath = _stringToPath,
    toString = toString_1;

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath$4(value, object) {
  if (isArray$8(value)) {
    return value;
  }
  return isKey$2(value, object) ? [value] : stringToPath(toString(value));
}

var _castPath = castPath$4;

var isSymbol = isSymbol_1;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey$5(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
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
    isArguments = isArguments_1,
    isArray$7 = isArray_1,
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
    (isArray$7(object) || isArguments(object));
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
    identity = identity_1,
    isArray$6 = isArray_1,
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
    return identity;
  }
  if (typeof value == 'object') {
    return isArray$6(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

var _baseIteratee = baseIteratee$7;

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
    baseIteratee$6 = _baseIteratee,
    isArray$5 = isArray_1,
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
  var func = isArray$5(collection) ? arrayFilter : baseFilter;
  return func(collection, negate$1(baseIteratee$6(predicate)));
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
    isArray$4 = isArray_1,
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
function isString$6(value) {
  return typeof value == 'string' ||
    (!isArray$4(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}

var isString_1 = isString$6;

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

var arrayMap$2 = _arrayMap;

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
  return arrayMap$2(props, function(key) {
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
    isArrayLike$1 = isArrayLike_1,
    isString$5 = isString_1,
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
  if (isArrayLike$1(value)) {
    return isString$5(value) ? stringToArray(value) : copyArray(value);
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

const SUPPORTED_CLIENTS$1 = Object.freeze(
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
  SUPPORTED_CLIENTS: SUPPORTED_CLIENTS$1,
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

function resolveClientNameWithAliases$1(clientName) {
  return CLIENT_ALIASES[clientName] || clientName;
}

function toNumber$1(val, fallback) {
  if (val === undefined || val === null) return fallback;
  const number = parseInt(val, 10);
  return isNaN(number) ? fallback : number;
}

var helpers$7 = {
  addQueryContext: addQueryContext$3,
  containsUndefined,
  getUndefinedIndices,
  normalizeArr: normalizeArr$2,
  resolveClientNameWithAliases: resolveClientNameWithAliases$1,
  toNumber: toNumber$1,
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
  isObject: isObject$5,
  isString: isString$4,
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
    if (!isString$4(txt)) {
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
    if (hints.some((hint) => !isString$4(hint))) {
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
    if (isObject$5(column) && !column.isRawInstance)
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
    if (isObject$5(obj) && !obj.isRawInstance) {
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
    if (isObject$5(obj) && !obj.isRawInstance) {
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
      if (isObject$5(columnInfo)) {
        this._statements.push({
          grouping: 'order',
          type: 'orderByBasic',
          value: columnInfo['column'],
          direction: columnInfo['order'],
          nulls: columnInfo['nulls'],
        });
      } else if (isString$4(columnInfo) || isNumber$1(columnInfo)) {
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
    if (isObject$5(obj) && !obj.isRawInstance) {
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
    if (isObject$5(options)) {
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
    if (isObject$5(column)) {
      for (const key in column) {
        this._counter(key, column[key]);
      }

      return this;
    }

    return this._counter(column, amount);
  }

  // Decrements a column's value by the specified amount.
  decrement(column, amount = 1) {
    if (isObject$5(column)) {
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
    if (isString$4(values)) {
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
    return isObject$5(jsonValue) && !(jsonValue instanceof Builder);
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
    baseEach$2 = _baseEach,
    baseIteratee$5 = _baseIteratee,
    baseReduce = _baseReduce,
    isArray$3 = isArray_1;

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
function reduce$2(collection, iteratee, accumulator) {
  var func = isArray$3(collection) ? arrayReduce : baseReduce,
      initAccum = arguments.length < 3;

  return func(collection, baseIteratee$5(iteratee), accumulator, initAccum, baseEach$2);
}

var reduce_1 = reduce$2;

var arrayEach = _arrayEach,
    baseCreate = _baseCreate,
    baseForOwn = _baseForOwn,
    baseIteratee$4 = _baseIteratee,
    getPrototype = _getPrototype,
    isArray$2 = isArray_1,
    isBuffer = isBufferExports,
    isFunction$2 = isFunction_1,
    isObject$4 = isObject_1,
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
  var isArr = isArray$2(object),
      isArrLike = isArr || isBuffer(object) || isTypedArray(object);

  iteratee = baseIteratee$4(iteratee);
  if (accumulator == null) {
    var Ctor = object && object.constructor;
    if (isArrLike) {
      accumulator = isArr ? new Ctor : [];
    }
    else if (isObject$4(object)) {
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

const { isObject: isObject$3 } = is;

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
  } else if ((type === 'json' || type === 'jsonb') && isObject$3(value)) {
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
const QueryBuilder$3 = querybuilder;
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
      return wrapString(value + '', builder, client);
  }
}

function unwrapRaw$1(value, isParameter, builder, client, bindingsHolder) {
  let query;
  if (value instanceof QueryBuilder$3) {
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
function wrapString(value, builder, client) {
  const asIndex = value.toLowerCase().indexOf(' as ');
  if (asIndex !== -1) {
    const first = value.slice(0, asIndex);
    const second = value.slice(asIndex + 4);
    return client.alias(
      wrapString(first, builder, client),
      wrapAsIdentifier(second, builder, client)
    );
  }
  const wrapped = [];
  let i = -1;
  const segments = value.split('.');
  while (++i < segments.length) {
    value = segments[i];
    if (i === 0 && segments.length > 1) {
      wrapped.push(wrapString((value || '').trim(), builder, client));
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
    } else if (queryOrIdentifier instanceof QueryBuilder$3) {
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
        return client.alias(sql, wrapString(compiled.as, builder, client));
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
  wrapString,
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
const reduce$1 = reduce_1;

const {
  replaceRawArrBindings,
  replaceKeyBindings,
} = rawFormatter;
const helpers$6 = helpers$7;
const saveAsyncStack$1 = saveAsyncStack$3;
const { nanoid: nanoid$1 } = nanoid_1;
const { isNumber, isObject: isObject$2 } = is;
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
      (isObject$2(bindings) && !bindings.toSQL) || bindings === undefined
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

    obj.options = reduce$1(this._options, assign$5, {});

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

var baseEach$1 = _baseEach;

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
  baseEach$1(collection, function(value, key, collection) {
    setter(accumulator, value, iteratee(value), collection);
  });
  return accumulator;
}

var _baseAggregator = baseAggregator$1;

var arrayAggregator = _arrayAggregator,
    baseAggregator = _baseAggregator,
    baseIteratee$3 = _baseIteratee,
    isArray$1 = isArray_1;

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
    var func = isArray$1(collection) ? arrayAggregator : baseAggregator,
        accumulator = initializer ? initializer() : {};

    return func(collection, setter, baseIteratee$3(iteratee), accumulator);
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
function has$2(object, path) {
  return object != null && hasPath(object, path, baseHas);
}

var has_1 = has$2;

var baseEach = _baseEach,
    isArrayLike = isArrayLike_1;

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
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

var _baseMap = baseMap$1;

var arrayMap$1 = _arrayMap,
    baseIteratee$2 = _baseIteratee,
    baseMap = _baseMap,
    isArray = isArray_1;

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
function map$1(collection, iteratee) {
  var func = isArray(collection) ? arrayMap$1 : baseMap;
  return func(collection, baseIteratee$2(iteratee));
}

var map_1 = map$1;

var assignValue = _assignValue,
    castPath$1 = _castPath,
    isIndex = _isIndex,
    isObject$1 = isObject_1,
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
  if (!isObject$1(object)) {
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
        newValue = isObject$1(objValue)
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
const QueryBuilder$2 = querybuilder;
const JoinClause = joinclause;
const debug$1 = browserExports;

const assign$4 = assign_1;
const compact = compact_1;
const groupBy$3 = groupBy_1;
const has$1 = has_1;
const isEmpty$1 = isEmpty_1;
const map = map_1;
const omitBy = omitBy_1;
const reduce = reduce_1;
const { nanoid } = nanoid_1;
const { isString: isString$3, isUndefined } = is;
const {
  columnize: columnize_$2,
  direction: direction_,
  operator: operator_$1,
  wrap: wrap_$1,
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
let QueryCompiler$1 = class QueryCompiler {
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
      options: reduce(this.options, assign$4, {}),
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

    if (isString$3(val)) {
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
        sql += `(${columnize_$2(
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
            columnize_$2(
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
      wrap_$1(
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
          wrap_$1(
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
      wrap_$1(
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
      wrap_$1(
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
      wrap_$1(
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
      sql = `(${columnize_$2(
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
      wrap_$1(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      operator_$1(
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
      wrap_$1(
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
      wrap_$1(
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
      wrap_$1(
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
    const toWrap = clause.value instanceof QueryBuilder$2;
    return (
      wrap_$1(
        clause.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      operator_$1(
        clause.operator,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      (toWrap ? '(' : '') +
      wrap_$1(
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
      wrap_$1(
        clause.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      operator_$1(
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
      columnize_$2(
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
      ? wrap_$1(
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
      columns = `(${columnize_$2(
        statement.column,
        this.builder,
        this.client,
        this.bindingsHolder
      )})`;
    } else {
      columns = wrap_$1(
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
      wrap_$1(
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
      wrap_$1(
        statement.column,
        undefined,
        this.builder,
        this.client,
        this.bindingsHolder
      ) +
      ' ' +
      operator_$1(
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
      wrap_$1(
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
          map(stmt.partitions, function (partition) {
            if (isString$3(partition)) {
              return self.formatter.columnize(partition);
            } else return self.formatter.columnize(partition.column) + (partition.order ? ' ' + partition.order : '');
          }).join(', ') + ' ';
      }

      sql += 'order by ';
      sql += map(stmt.order, function (order) {
        if (isString$3(order)) {
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
        columnize_$2(
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
        columnize_$2(
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
      if (has$1(data, column)) {
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
        wrap_$1(
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
    } else if (value instanceof QueryBuilder$2 || nulls) {
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
        const isQueryBuilder = tableName instanceof QueryBuilder$2;
        const isRawQuery = tableName instanceof Raw$2;
        const isFunction = typeof tableName === 'function';

        if (!isQueryBuilder && !isRawQuery && !isFunction) {
          tableName = `${schemaName}.${tableName}`;
        }
      }

      this._tableName = tableName
        ? // Wrap subQuery with parenthesis, #3485
          wrap_$1(
            tableName,
            tableName instanceof QueryBuilder$2,
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
        let jsonCol = `${columnize_$2(
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
    const jsonSet = `${nameFunction}(${columnize_$2(
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
    )}, ${this._jsonPathWrap({ path: statement.jsonPath })}) ${operator_$1(
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
      wrap_$1(
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
      wrap_$1(
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

var querycompiler = QueryCompiler$1;

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
let SchemaBuilder$2 = class SchemaBuilder extends EventEmitter$1 {
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
  SchemaBuilder$2.prototype[method] = function () {
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

SchemaBuilder$2.extend = (methodName, fn) => {
  if (
    Object.prototype.hasOwnProperty.call(SchemaBuilder$2.prototype, methodName)
  ) {
    throw new Error(
      `Can't extend SchemaBuilder with existing method ('${methodName}').`
    );
  }

  assign$3(SchemaBuilder$2.prototype, { [methodName]: fn });
};

augmentWithBuilderInterface(SchemaBuilder$2);
addQueryContext$1(SchemaBuilder$2);

var builder = SchemaBuilder$2;

const tail$2 = tail_1;
const { isString: isString$2 } = is;

// Push a new query onto the compiled "sequence" stack,
// creating a new formatter, returning the compiler.
function pushQuery$3(query) {
  if (!query) return;
  if (isString$2(query)) {
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
  if (isString$2(query)) {
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
let SchemaCompiler$1 = class SchemaCompiler {
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

SchemaCompiler$1.prototype.dropTablePrefix = 'drop table ';
SchemaCompiler$1.prototype.dropViewPrefix = 'drop view ';
SchemaCompiler$1.prototype.dropMaterializedViewPrefix = 'drop materialized view ';
SchemaCompiler$1.prototype.alterViewPrefix = 'alter view ';

SchemaCompiler$1.prototype.alterTable = buildTable('alter');
SchemaCompiler$1.prototype.createTable = buildTable('create');
SchemaCompiler$1.prototype.createTableIfNotExists = buildTable('createIfNot');
SchemaCompiler$1.prototype.createTableLike = buildTable('createLike');

SchemaCompiler$1.prototype.createView = buildView('create');
SchemaCompiler$1.prototype.createViewOrReplace = buildView('createOrReplace');
SchemaCompiler$1.prototype.createMaterializedView = buildView(
  'createMaterializedView'
);
SchemaCompiler$1.prototype.alterView = buildView('alter');

SchemaCompiler$1.prototype.pushQuery = pushQuery$2;
SchemaCompiler$1.prototype.pushAdditional = pushAdditional$1;
SchemaCompiler$1.prototype.unshiftQuery = unshiftQuery$1;

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

var compiler$1 = SchemaCompiler$1;

var copyObject = _copyObject,
    createAssigner = _createAssigner,
    keysIn = keysIn_1;

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
var assignIn = createAssigner(function(object, source) {
  copyObject(source, keysIn(source), object);
});

var assignIn_1 = assignIn;

var extend$3 = assignIn_1;

// TableBuilder

// Takes the function passed to the "createTable" or "table/editTable"
// functions and calls it with the "TableBuilder" as both the context and
// the first argument. Inside this function we can specify what happens to the
// method, pushing everything we want to do onto the "allStatements" array,
// which is then compiled into sql.
// ------
const each = each$2;
const extend$2 = extend$3;
const assign$2 = assign_1;
const toArray$1 = toArray_1;
const helpers$3 = helpers$7;
const { isString: isString$1, isFunction: isFunction$1, isObject } = is;

let TableBuilder$2 = class TableBuilder {
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
      extend$2(this, AlterMethods$2);
    }
    // With 'create table ... like' callback function is useless.
    if (this._fn) {
      this._fn.call(this, this);
    }
    return this.client.tableCompiler(this).toSQL();
  }

  // The "timestamps" call is really just sets the `created_at` and `updated_at` columns.

  timestamps(useTimestamps, defaultToNow, useCamelCase) {
    if (isObject(useTimestamps)) {
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
        if (isString$1(tableColumn)) {
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
        extend$2(builder, returnObj);
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
  TableBuilder$2.prototype[method] = function () {
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
    TableBuilder$2.prototype[method] = function (value) {
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

helpers$3.addQueryContext(TableBuilder$2);

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
  TableBuilder$2.prototype[type] = function () {
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

TableBuilder$2.extend = (methodName, fn) => {
  if (
    Object.prototype.hasOwnProperty.call(TableBuilder$2.prototype, methodName)
  ) {
    throw new Error(
      `Can't extend TableBuilder with existing method ('${methodName}').`
    );
  }

  assign$2(TableBuilder$2.prototype, { [methodName]: fn });
};

var tablebuilder = TableBuilder$2;

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

let TableCompiler$1 = class TableCompiler {
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

TableCompiler$1.prototype.pushQuery = pushQuery$1;
TableCompiler$1.prototype.pushAdditional = pushAdditional;
TableCompiler$1.prototype.unshiftQuery = unshiftQuery;
TableCompiler$1.prototype.lowerCase = true;
TableCompiler$1.prototype.createAlterTableMethods = null;
TableCompiler$1.prototype.addColumnsPrefix = 'add column ';
TableCompiler$1.prototype.alterColumnsPrefix = 'alter column ';
TableCompiler$1.prototype.modifyColumnPrefix = 'modify column ';
TableCompiler$1.prototype.dropColumnPrefix = 'drop column ';

var tablecompiler = TableCompiler$1;

const extend$1 = extend$3;
const assign$1 = assign_1;
const toArray = toArray_1;
const { addQueryContext } = helpers$7;

// The chainable interface off the original "column" method.
let ColumnBuilder$2 = class ColumnBuilder {
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
      extend$1(this, AlterMethods$1);
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
  ColumnBuilder$2.prototype[method] = function () {
    this._modifiers[key] = toArray(arguments);
    return this;
  };
});

addQueryContext(ColumnBuilder$2);

ColumnBuilder$2.prototype.notNull = ColumnBuilder$2.prototype.notNullable =
  function notNullable() {
    return this.nullable(false);
  };

['index', 'primary', 'unique'].forEach(function (method) {
  ColumnBuilder$2.prototype[method] = function () {
    if (this._type.toLowerCase().indexOf('increments') === -1) {
      this._tableBuilder[method].apply(
        this._tableBuilder,
        [this._args[0]].concat(toArray(arguments))
      );
    }
    return this;
  };
});

ColumnBuilder$2.extend = (methodName, fn) => {
  if (
    Object.prototype.hasOwnProperty.call(ColumnBuilder$2.prototype, methodName)
  ) {
    throw new Error(
      `Can't extend ColumnBuilder with existing method ('${methodName}').`
    );
  }

  assign$1(ColumnBuilder$2.prototype, { [methodName]: fn });
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

var columnbuilder = ColumnBuilder$2;

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
const has = has_1;
const tail = tail_1;
const { toNumber } = helpers$7;
const { formatDefault } = formatterUtils;
const { operator: operator_ } = wrappingFormatter;

let ColumnCompiler$1 = class ColumnCompiler {
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
        if (has(this.modified, modifier)) {
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
    return `varchar(${toNumber(length, 255)})`;
  }

  floating(precision, scale) {
    return `float(${toNumber(precision, 8)}, ${toNumber(scale, 2)})`;
  }

  decimal(precision, scale) {
    if (precision === null) {
      throw new Error(
        'Specifying no precision on decimal columns is not supported for that SQL dialect.'
      );
    }
    return `decimal(${toNumber(precision, 8)}, ${toNumber(scale, 2)})`;
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
      `${this.formatter.wrap(this.getColumnName())} ${operator_(
        '>',
        this.columnBuilder,
        this.bindingsHolder
      )} 0`,
      constraintName
    );
  }

  checkNegative(constraintName) {
    return this._check(
      `${this.formatter.wrap(this.getColumnName())} ${operator_(
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
      `length(${this.formatter.wrap(this.getColumnName())}) ${operator_(
        operator,
        this.columnBuilder,
        this.bindingsHolder
      )} ${toNumber(length)}`,
      constraintName
    );
  }
};

ColumnCompiler$1.prototype.binary = 'blob';
ColumnCompiler$1.prototype.bool = 'boolean';
ColumnCompiler$1.prototype.date = 'date';
ColumnCompiler$1.prototype.datetime = 'datetime';
ColumnCompiler$1.prototype.time = 'time';
ColumnCompiler$1.prototype.timestamp = 'timestamp';
ColumnCompiler$1.prototype.geometry = 'geometry';
ColumnCompiler$1.prototype.geography = 'geography';
ColumnCompiler$1.prototype.point = 'point';
ColumnCompiler$1.prototype.enu = 'varchar';
ColumnCompiler$1.prototype.bit = ColumnCompiler$1.prototype.json = 'text';
ColumnCompiler$1.prototype.uuid = ({
  useBinaryUuid = false,
  primaryKey = false,
} = {}) => (useBinaryUuid ? 'binary(16)' : 'char(36)');
ColumnCompiler$1.prototype.integer =
  ColumnCompiler$1.prototype.smallint =
  ColumnCompiler$1.prototype.mediumint =
    'integer';
ColumnCompiler$1.prototype.biginteger = 'bigint';
ColumnCompiler$1.prototype.text = 'text';
ColumnCompiler$1.prototype.tinyint = 'tinyint';

ColumnCompiler$1.prototype.pushQuery = helpers$1.pushQuery;
ColumnCompiler$1.prototype.pushAdditional = helpers$1.pushAdditional;
ColumnCompiler$1.prototype.unshiftQuery = helpers$1.unshiftQuery;

ColumnCompiler$1.prototype._defaultMap = {
  columnName: function () {
    if (!this.isIncrements) {
      throw new Error(
        `You did not specify a column name for the ${this.type} column.`
      );
    }
    return 'id';
  },
};

var columncompiler = ColumnCompiler$1;

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
  columnize: columnize_$1,
  wrap: wrap_,
} = wrappingFormatter;

let Formatter$1 = class Formatter {
  constructor(client, builder) {
    this.client = client;
    this.builder = builder;
    this.bindings = [];
  }

  // Accepts a string or array of columns to wrap as appropriate.
  columnize(target) {
    return columnize_$1(target, this.builder, this.client, this);
  }

  // Puts the appropriate wrapper around a value depending on the database
  // engine, unless it's a knex.raw value, in which case it's left alone.
  wrap(value, isParameter) {
    return wrap_(value, isParameter, this.builder, this.client, this);
  }
};

var formatter = Formatter$1;

var colorette = {};

Object.defineProperty(colorette, '__esModule', { value: true });

var tty = require$$0$1;

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
const isWindows$1 = platform === "win32";
const isDumbTerminal = env.TERM === "dumb";

const isCompatibleTerminal =
  tty__namespace && tty__namespace.isatty && tty__namespace.isatty(1) && env.TERM && !isDumbTerminal;

const isCI =
  "CI" in env &&
  ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env);

const isColorSupported =
  !isDisabled &&
  (isForced || (isWindows$1 && !isDumbTerminal) || isCompatibleTerminal || isCI);

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
const { isString, isFunction } = is;

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

    if (!isString(message)) {
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
const extend = extend$3;
const assign = assign_1;

let ViewBuilder$2 = class ViewBuilder {
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
      extend(this, AlterMethods);
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

helpers.addQueryContext(ViewBuilder$2);

ViewBuilder$2.extend = (methodName, fn) => {
  if (Object.prototype.hasOwnProperty.call(ViewBuilder$2.prototype, methodName)) {
    throw new Error(
      `Can't extend ViewBuilder with existing method ('${methodName}').`
    );
  }

  assign(ViewBuilder$2.prototype, { [methodName]: fn });
};

var viewbuilder = ViewBuilder$2;

/* eslint max-len:0 */

// View Compiler
// -------
const { pushQuery } = helpers$4;
const groupBy = groupBy_1;
const { columnize: columnize_ } = wrappingFormatter;

let ViewCompiler$1 = class ViewCompiler {
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
        columnize_(
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

ViewCompiler$1.prototype.pushQuery = pushQuery;

var viewcompiler = ViewCompiler$1;

const { Pool, TimeoutError } = tarnExports;
const { EventEmitter } = eventsExports;
const { promisify } = util;
const { makeEscape } = string;
const cloneDeep = cloneDeep_1;
const defaults = defaults_1;
const uniqueId = uniqueId_1;

const Runner = runner;
const Transaction = transaction$5;
const {
  executeQuery,
  enrichQueryObject,
} = queryExecutioner;
const QueryBuilder$1 = querybuilder;
const QueryCompiler = querycompiler;
const SchemaBuilder$1 = builder;
const SchemaCompiler = compiler$1;
const TableBuilder$1 = tablebuilder;
const TableCompiler = tablecompiler;
const ColumnBuilder$1 = columnbuilder;
const ColumnCompiler = columncompiler;
const { KnexTimeoutError: KnexTimeoutError$1 } = timeout$3;
const { outputQuery, unwrapRaw } = wrappingFormatter;
const { compileCallback } = formatterUtils;
const Raw = raw;
const Ref = ref;
const Formatter = formatter;
const Logger = logger;
const { POOL_CONFIG_OPTIONS } = constants$1;
const ViewBuilder$1 = viewbuilder;
const ViewCompiler = viewcompiler;
const isPlainObject = isPlainObject_1;
const { setHiddenProperty } = security;

const debug = browserExports('knex:client');

// The base client provides the general structure
// for a dialect specific client object.

let Client$2 = class Client extends EventEmitter {
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
    return new QueryBuilder$1(this);
  }

  queryCompiler(builder, formatter) {
    return new QueryCompiler(this, builder, formatter);
  }

  schemaBuilder() {
    return new SchemaBuilder$1(this);
  }

  schemaCompiler(builder) {
    return new SchemaCompiler(this, builder);
  }

  tableBuilder(type, tableName, tableNameLike, fn) {
    return new TableBuilder$1(this, type, tableName, tableNameLike, fn);
  }

  viewBuilder(type, viewBuilder, fn) {
    return new ViewBuilder$1(this, type, viewBuilder, fn);
  }

  tableCompiler(tableBuilder) {
    return new TableCompiler(this, tableBuilder);
  }

  viewCompiler(viewCompiler) {
    return new ViewCompiler(this, viewCompiler);
  }

  columnBuilder(tableBuilder, type, args) {
    return new ColumnBuilder$1(this, tableBuilder, type, args);
  }

  columnCompiler(tableBuilder, columnBuilder) {
    return new ColumnCompiler(this, tableBuilder, columnBuilder);
  }

  runner(builder) {
    return new Runner(this, builder);
  }

  transaction(container, config, outerTx) {
    return new Transaction(this, container, config, outerTx);
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
          await promisify(poolConfig.afterCreate)(connection);
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
        convertedError = new KnexTimeoutError$1(
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

Object.assign(Client$2.prototype, {
  _escapeBinding: makeEscape({
    escapeString(str) {
      return `'${str.replace(/'/g, "''")}'`;
    },
  }),

  canCancelQuery: false,
});

var client = Client$2;

//Parse method copied from https://github.com/brianc/node-postgres
//Copyright (c) 2010-2014 Brian Carlson (brian.m.carlson@gmail.com)
//MIT License

//parses a connection string
function parse$1(str) {
  //unix socket
  if (str.charAt(0) === '/') {
    const config = str.split(' ');
    return { host: config[0], database: config[1] }
  }

  // Check for empty host in URL

  const config = {};
  let result;
  let dummyHost = false;
  if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
    // Ensure spaces are encoded as %20
    str = encodeURI(str).replace(/\%25(\d\d)/g, '%$1');
  }

  try {
    result = new URL(str, 'postgres://base');
  } catch (e) {
    // The URL is invalid so try again with a dummy host
    result = new URL(str.replace('@/', '@___DUMMY___/'), 'postgres://base');
    dummyHost = true;
  }

  // We'd like to use Object.fromEntries() here but Node.js 10 does not support it
  for (const entry of result.searchParams.entries()) {
    config[entry[0]] = entry[1];
  }

  config.user = config.user || decodeURIComponent(result.username);
  config.password = config.password || decodeURIComponent(result.password);

  config.port = result.port;
  if (result.protocol == 'socket:') {
    config.host = decodeURI(result.pathname);
    config.database = result.searchParams.get('db');
    config.client_encoding = result.searchParams.get('encoding');
    return config
  }
  const hostname = dummyHost ? '' : result.hostname;
  if (!config.host) {
    // Only set the host if there is no equivalent query param.
    config.host = decodeURIComponent(hostname);
  } else if (hostname && /^%2f/i.test(hostname)) {
    // Only prepend the hostname to the pathname if it is not a URL encoded Unix socket host.
    result.pathname = hostname + result.pathname;
  }

  const pathname = result.pathname.slice(1) || null;
  config.database = pathname ? decodeURI(pathname) : null;

  if (config.ssl === 'true' || config.ssl === '1') {
    config.ssl = true;
  }

  if (config.ssl === '0') {
    config.ssl = false;
  }

  if (config.sslcert || config.sslkey || config.sslrootcert || config.sslmode) {
    config.ssl = {};
  }

  // Only try to load fs if we expect to read from the disk
  const fs = null;

  if (config.sslcert) {
    config.ssl.cert = fs.readFileSync(config.sslcert).toString();
  }

  if (config.sslkey) {
    config.ssl.key = fs.readFileSync(config.sslkey).toString();
  }

  if (config.sslrootcert) {
    config.ssl.ca = fs.readFileSync(config.sslrootcert).toString();
  }

  switch (config.sslmode) {
    case 'disable': {
      config.ssl = false;
      break
    }
    case 'prefer':
    case 'require':
    case 'verify-ca':
    case 'verify-full': {
      break
    }
    case 'no-verify': {
      config.ssl.rejectUnauthorized = false;
      break
    }
  }

  return config
}

var pgConnectionString = parse$1;

parse$1.parse = parse$1;

const { parse } = pgConnectionString;
const parsePG = parse;
const isWindows = process && process.platform && process.platform === 'win32';

/**
 * @param str
 * @returns {URL}
 */
function tryParse(str) {
  try {
    return new URL(str);
  } catch (e) {
    return null;
  }
}

var parseConnection$1 = function parseConnectionString(str) {
  const parsed = tryParse(str);
  const isDriveLetter = isWindows && parsed && parsed.protocol.length === 2;
  if (!parsed || isDriveLetter) {
    return {
      client: 'sqlite3',
      connection: {
        filename: str,
      },
    };
  }
  let { protocol } = parsed;
  if (protocol.slice(-1) === ':') {
    protocol = protocol.slice(0, -1);
  }

  const isPG = ['postgresql', 'postgres'].includes(protocol);

  return {
    client: protocol,
    connection: isPG ? parsePG(str) : connectionObject(parsed),
  };
};

/**
 * @param {URL} parsed
 * @returns {{}}
 */
function connectionObject(parsed) {
  const connection = {};
  let db = parsed.pathname;
  if (db[0] === '/') {
    db = db.slice(1);
  }

  connection.database = db;

  if (parsed.hostname) {
    if (parsed.protocol.indexOf('mssql') === 0) {
      connection.server = parsed.hostname;
    } else {
      connection.host = parsed.hostname;
    }
  }
  if (parsed.port) {
    connection.port = parsed.port;
  }
  if (parsed.username || parsed.password) {
    connection.user = decodeURIComponent(parsed.username);
  }
  if (parsed.password) {
    connection.password = decodeURIComponent(parsed.password);
  }
  if (parsed.searchParams) {
    for (const [key, value] of parsed.searchParams.entries()) {
      const isNestedConfigSupported = ['mysql:', 'mariadb:', 'mssql:'].includes(
        parsed.protocol
      );
      if (isNestedConfigSupported) {
        try {
          connection[key] = JSON.parse(value);
        } catch (err) {
          connection[key] = value;
        }
      } else {
        connection[key] = value;
      }
    }
  }
  return connection;
}

var dialects = {};

var sqliteTransaction;
var hasRequiredSqliteTransaction;

function requireSqliteTransaction () {
	if (hasRequiredSqliteTransaction) return sqliteTransaction;
	hasRequiredSqliteTransaction = 1;
	const Transaction = transaction$5;

	class Transaction_Sqlite extends Transaction {
	  begin(conn) {
	    // SQLite doesn't really support isolation levels, it is serializable by
	    // default and so we override it to ignore isolation level.
	    // There is a `PRAGMA read_uncommitted = true;`, but that's probably not
	    // what the user wants
	    if (this.isolationLevel) {
	      this.client.logger.warn(
	        'sqlite3 only supports serializable transactions, ignoring the isolation level param'
	      );
	    }
	    // SQLite infers read vs write transactions from the statement operation
	    // https://www.sqlite.org/lang_transaction.html#read_transactions_versus_write_transactions
	    if (this.readOnly) {
	      this.client.logger.warn(
	        'sqlite3 implicitly handles read vs write transactions'
	      );
	    }
	    return this.query(conn, 'BEGIN;');
	  }
	}

	sqliteTransaction = Transaction_Sqlite;
	return sqliteTransaction;
}

var sqliteQuerycompiler;
var hasRequiredSqliteQuerycompiler;

function requireSqliteQuerycompiler () {
	if (hasRequiredSqliteQuerycompiler) return sqliteQuerycompiler;
	hasRequiredSqliteQuerycompiler = 1;
	// SQLite3 Query Builder & Compiler

	const constant = constant_1;
	const each = each$2;
	const identity = identity_1;
	const isEmpty = isEmpty_1;
	const reduce = reduce_1;

	const QueryCompiler = querycompiler;
	const noop = noop$1;
	const { isString } = is;
	const {
	  wrapString,
	  columnize: columnize_,
	} = wrappingFormatter;

	const emptyStr = constant('');

	class QueryCompiler_SQLite3 extends QueryCompiler {
	  constructor(client, builder, formatter) {
	    super(client, builder, formatter);

	    // The locks are not applicable in SQLite3
	    this.forShare = emptyStr;
	    this.forKeyShare = emptyStr;
	    this.forUpdate = emptyStr;
	    this.forNoKeyUpdate = emptyStr;
	  }

	  // SQLite requires us to build the multi-row insert as a listing of select with
	  // unions joining them together. So we'll build out this list of columns and
	  // then join them all together with select unions to complete the queries.
	  insert() {
	    const insertValues = this.single.insert || [];
	    let sql = this.with() + `insert into ${this.tableName} `;

	    if (Array.isArray(insertValues)) {
	      if (insertValues.length === 0) {
	        return '';
	      } else if (
	        insertValues.length === 1 &&
	        insertValues[0] &&
	        isEmpty(insertValues[0])
	      ) {
	        return {
	          sql: sql + this._emptyInsertValue,
	        };
	      }
	    } else if (typeof insertValues === 'object' && isEmpty(insertValues)) {
	      return {
	        sql: sql + this._emptyInsertValue,
	      };
	    }

	    const insertData = this._prepInsert(insertValues);

	    if (isString(insertData)) {
	      return {
	        sql: sql + insertData,
	      };
	    }

	    if (insertData.columns.length === 0) {
	      return {
	        sql: '',
	      };
	    }

	    sql += `(${this.formatter.columnize(insertData.columns)})`;

	    // backwards compatible error
	    if (this.client.valueForUndefined !== null) {
	      insertData.values.forEach((bindings) => {
	        each(bindings, (binding) => {
	          if (binding === undefined)
	            throw new TypeError(
	              '`sqlite` does not support inserting default values. Specify ' +
	                'values explicitly or use the `useNullAsDefault` config flag. ' +
	                '(see docs https://knexjs.org/guide/query-builder.html#insert).'
	            );
	        });
	      });
	    }

	    if (insertData.values.length === 1) {
	      const parameters = this.client.parameterize(
	        insertData.values[0],
	        this.client.valueForUndefined,
	        this.builder,
	        this.bindingsHolder
	      );
	      sql += ` values (${parameters})`;

	      const { onConflict, ignore, merge } = this.single;
	      if (onConflict && ignore) sql += this._ignore(onConflict);
	      else if (onConflict && merge) {
	        sql += this._merge(merge.updates, onConflict, insertValues);
	        const wheres = this.where();
	        if (wheres) sql += ` ${wheres}`;
	      }

	      const { returning } = this.single;
	      if (returning) {
	        sql += this._returning(returning);
	      }

	      return {
	        sql,
	        returning,
	      };
	    }

	    const blocks = [];
	    let i = -1;
	    while (++i < insertData.values.length) {
	      let i2 = -1;
	      const block = (blocks[i] = []);
	      let current = insertData.values[i];
	      current = current === undefined ? this.client.valueForUndefined : current;
	      while (++i2 < insertData.columns.length) {
	        block.push(
	          this.client.alias(
	            this.client.parameter(
	              current[i2],
	              this.builder,
	              this.bindingsHolder
	            ),
	            this.formatter.wrap(insertData.columns[i2])
	          )
	        );
	      }
	      blocks[i] = block.join(', ');
	    }
	    sql += ' select ' + blocks.join(' union all select ');

	    const { onConflict, ignore, merge } = this.single;
	    if (onConflict && ignore) sql += ' where true' + this._ignore(onConflict);
	    else if (onConflict && merge) {
	      sql +=
	        ' where true' + this._merge(merge.updates, onConflict, insertValues);
	    }

	    const { returning } = this.single;
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
	    const { returning } = this.single;
	    return {
	      sql:
	        withSQL +
	        `update ${this.single.only ? 'only ' : ''}${this.tableName} ` +
	        `set ${updateData.join(', ')}` +
	        (wheres ? ` ${wheres}` : '') +
	        this._returning(returning),
	      returning,
	    };
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

	  _returning(value) {
	    return value ? ` returning ${this.formatter.columnize(value)}` : '';
	  }

	  // Compile a truncate table statement into SQL.
	  truncate() {
	    const { table } = this.single;
	    return {
	      sql: `delete from ${this.tableName}`,
	      output() {
	        return this.query({
	          sql: `delete from sqlite_sequence where name = '${table}'`,
	        }).catch(noop);
	      },
	    };
	  }

	  // Compiles a `columnInfo` query
	  columnInfo() {
	    const column = this.single.columnInfo;

	    // The user may have specified a custom wrapIdentifier function in the config. We
	    // need to run the identifiers through that function, but not format them as
	    // identifiers otherwise.
	    const table = this.client.customWrapIdentifier(this.single.table, identity);

	    return {
	      sql: `PRAGMA table_info(\`${table}\`)`,
	      output(resp) {
	        const maxLengthRegex = /.*\((\d+)\)/;
	        const out = reduce(
	          resp,
	          function (columns, val) {
	            let { type } = val;
	            let maxLength = type.match(maxLengthRegex);
	            if (maxLength) {
	              maxLength = maxLength[1];
	            }
	            type = maxLength ? type.split('(')[0] : type;
	            columns[val.name] = {
	              type: type.toLowerCase(),
	              maxLength,
	              nullable: !val.notnull,
	              defaultValue: val.dflt_value,
	            };
	            return columns;
	          },
	          {}
	        );
	        return (column && out[column]) || out;
	      },
	    };
	  }

	  limit() {
	    const noLimit = !this.single.limit && this.single.limit !== 0;
	    if (noLimit && !this.single.offset) return '';

	    // Workaround for offset only,
	    // see http://stackoverflow.com/questions/10491492/sqllite-with-skip-offset-only-not-limit
	    this.single.limit = noLimit ? -1 : this.single.limit;
	    return `limit ${this._getValueOrParameterFromAttribute('limit')}`;
	  }

	  // Json functions
	  jsonExtract(params) {
	    return this._jsonExtract('json_extract', params);
	  }

	  jsonSet(params) {
	    return this._jsonSet('json_set', params);
	  }

	  jsonInsert(params) {
	    return this._jsonSet('json_insert', params);
	  }

	  jsonRemove(params) {
	    const jsonCol = `json_remove(${columnize_(
	      params.column,
	      this.builder,
	      this.client,
	      this.bindingsHolder
	    )},${this.client.parameter(
	      params.path,
	      this.builder,
	      this.bindingsHolder
	    )})`;
	    return params.alias
	      ? this.client.alias(jsonCol, this.formatter.wrap(params.alias))
	      : jsonCol;
	  }

	  whereJsonPath(statement) {
	    return this._whereJsonPath('json_extract', statement);
	  }

	  whereJsonSupersetOf(statement) {
	    throw new Error(
	      'Json superset where clause not actually supported by SQLite'
	    );
	  }

	  whereJsonSubsetOf(statement) {
	    throw new Error(
	      'Json subset where clause not actually supported by SQLite'
	    );
	  }

	  onJsonPathEquals(clause) {
	    return this._onJsonPathEquals('json_extract', clause);
	  }
	}

	sqliteQuerycompiler = QueryCompiler_SQLite3;
	return sqliteQuerycompiler;
}

var _baseSome;
var hasRequired_baseSome;

function require_baseSome () {
	if (hasRequired_baseSome) return _baseSome;
	hasRequired_baseSome = 1;
	var baseEach = _baseEach;

	/**
	 * The base implementation of `_.some` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function baseSome(collection, predicate) {
	  var result;

	  baseEach(collection, function(value, index, collection) {
	    result = predicate(value, index, collection);
	    return !result;
	  });
	  return !!result;
	}

	_baseSome = baseSome;
	return _baseSome;
}

var some_1;
var hasRequiredSome;

function requireSome () {
	if (hasRequiredSome) return some_1;
	hasRequiredSome = 1;
	var arraySome = require_arraySome(),
	    baseIteratee = _baseIteratee,
	    baseSome = require_baseSome(),
	    isArray = isArray_1,
	    isIterateeCall = _isIterateeCall;

	/**
	 * Checks if `predicate` returns truthy for **any** element of `collection`.
	 * Iteration is stopped once `predicate` returns truthy. The predicate is
	 * invoked with three arguments: (value, index|key, collection).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 * @example
	 *
	 * _.some([null, 0, 'yes', false], Boolean);
	 * // => true
	 *
	 * var users = [
	 *   { 'user': 'barney', 'active': true },
	 *   { 'user': 'fred',   'active': false }
	 * ];
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.some(users, { 'user': 'barney', 'active': false });
	 * // => false
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.some(users, ['active', false]);
	 * // => true
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.some(users, 'active');
	 * // => true
	 */
	function some(collection, predicate, guard) {
	  var func = isArray(collection) ? arraySome : baseSome;
	  if (guard && isIterateeCall(collection, predicate, guard)) {
	    predicate = undefined;
	  }
	  return func(collection, baseIteratee(predicate));
	}

	some_1 = some;
	return some_1;
}

var sqliteCompiler;
var hasRequiredSqliteCompiler;

function requireSqliteCompiler () {
	if (hasRequiredSqliteCompiler) return sqliteCompiler;
	hasRequiredSqliteCompiler = 1;
	// SQLite3: Column Builder & Compiler
	// -------
	const SchemaCompiler = compiler$1;

	const some = requireSome();

	// Schema Compiler
	// -------

	class SchemaCompiler_SQLite3 extends SchemaCompiler {
	  constructor(client, builder) {
	    super(client, builder);
	  }

	  // Compile the query to determine if a table exists.
	  hasTable(tableName) {
	    const sql =
	      `select * from sqlite_master ` +
	      `where type = 'table' and name = ${this.client.parameter(
	        this.formatter.wrap(tableName).replace(/`/g, ''),
	        this.builder,
	        this.bindingsHolder
	      )}`;
	    this.pushQuery({ sql, output: (resp) => resp.length > 0 });
	  }

	  // Compile the query to determine if a column exists.
	  hasColumn(tableName, column) {
	    this.pushQuery({
	      sql: `PRAGMA table_info(${this.formatter.wrap(tableName)})`,
	      output(resp) {
	        return some(resp, (col) => {
	          return (
	            this.client.wrapIdentifier(col.name.toLowerCase()) ===
	            this.client.wrapIdentifier(column.toLowerCase())
	          );
	        });
	      },
	    });
	  }

	  // Compile a rename table command.
	  renameTable(from, to) {
	    this.pushQuery(
	      `alter table ${this.formatter.wrap(from)} rename to ${this.formatter.wrap(
	        to
	      )}`
	    );
	  }

	  async generateDdlCommands() {
	    const sequence = this.builder._sequence;
	    for (let i = 0, l = sequence.length; i < l; i++) {
	      const query = sequence[i];
	      this[query.method].apply(this, query.args);
	    }

	    const commandSources = this.sequence;

	    if (commandSources.length === 1 && commandSources[0].statementsProducer) {
	      return commandSources[0].statementsProducer();
	    } else {
	      const result = [];

	      for (const commandSource of commandSources) {
	        const command = commandSource.sql;

	        if (Array.isArray(command)) {
	          result.push(...command);
	        } else {
	          result.push(command);
	        }
	      }

	      return { pre: [], sql: result, check: null, post: [] };
	    }
	  }
	}

	sqliteCompiler = SchemaCompiler_SQLite3;
	return sqliteCompiler;
}

var sqliteColumncompiler;
var hasRequiredSqliteColumncompiler;

function requireSqliteColumncompiler () {
	if (hasRequiredSqliteColumncompiler) return sqliteColumncompiler;
	hasRequiredSqliteColumncompiler = 1;
	const ColumnCompiler = columncompiler;

	// Column Compiler
	// -------

	class ColumnCompiler_SQLite3 extends ColumnCompiler {
	  constructor() {
	    super(...arguments);
	    this.modifiers = ['nullable', 'defaultTo'];
	    this._addCheckModifiers();
	  }

	  // Types
	  // -------

	  enu(allowed) {
	    return `text check (${this.formatter.wrap(
	      this.args[0]
	    )} in ('${allowed.join("', '")}'))`;
	  }

	  _pushAlterCheckQuery(checkPredicate, constraintName) {
	    throw new Error(
	      `Alter table with to add constraints is not permitted in SQLite`
	    );
	  }

	  checkRegex(regexes, constraintName) {
	    return this._check(
	      `${this.formatter.wrap(
	        this.getColumnName()
	      )} REGEXP ${this.client._escapeBinding(regexes)}`,
	      constraintName
	    );
	  }
	}

	ColumnCompiler_SQLite3.prototype.json = 'json';
	ColumnCompiler_SQLite3.prototype.jsonb = 'json';
	ColumnCompiler_SQLite3.prototype.double =
	  ColumnCompiler_SQLite3.prototype.decimal =
	  ColumnCompiler_SQLite3.prototype.floating =
	    'float';
	ColumnCompiler_SQLite3.prototype.timestamp = 'datetime';
	// autoincrement without primary key is a syntax error in SQLite, so it's necessary
	ColumnCompiler_SQLite3.prototype.increments =
	  ColumnCompiler_SQLite3.prototype.bigincrements =
	    'integer not null primary key autoincrement';

	sqliteColumncompiler = ColumnCompiler_SQLite3;
	return sqliteColumncompiler;
}

var filter_1;
var hasRequiredFilter;

function requireFilter () {
	if (hasRequiredFilter) return filter_1;
	hasRequiredFilter = 1;
	var arrayFilter = _arrayFilter,
	    baseFilter = _baseFilter,
	    baseIteratee = _baseIteratee,
	    isArray = isArray_1;

	/**
	 * Iterates over elements of `collection`, returning an array of all elements
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * **Note:** Unlike `_.remove`, this method returns a new array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 * @see _.reject
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney', 'age': 36, 'active': true },
	 *   { 'user': 'fred',   'age': 40, 'active': false }
	 * ];
	 *
	 * _.filter(users, function(o) { return !o.active; });
	 * // => objects for ['fred']
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.filter(users, { 'age': 36, 'active': true });
	 * // => objects for ['barney']
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.filter(users, ['active', false]);
	 * // => objects for ['fred']
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.filter(users, 'active');
	 * // => objects for ['barney']
	 *
	 * // Combining several predicates using `_.overEvery` or `_.overSome`.
	 * _.filter(users, _.overSome([{ 'age': 36 }, ['age', 40]]));
	 * // => objects for ['fred', 'barney']
	 */
	function filter(collection, predicate) {
	  var func = isArray(collection) ? arrayFilter : baseFilter;
	  return func(collection, baseIteratee(predicate));
	}

	filter_1 = filter;
	return filter_1;
}

var sqliteTablecompiler;
var hasRequiredSqliteTablecompiler;

function requireSqliteTablecompiler () {
	if (hasRequiredSqliteTablecompiler) return sqliteTablecompiler;
	hasRequiredSqliteTablecompiler = 1;
	const filter = requireFilter();
	const values = values_1;
	const identity = identity_1;
	const { isObject } = is;

	const TableCompiler = tablecompiler;
	const { formatDefault } = formatterUtils;

	class TableCompiler_SQLite3 extends TableCompiler {
	  constructor() {
	    super(...arguments);
	  }

	  // Create a new table.
	  createQuery(columns, ifNot, like) {
	    const createStatement = ifNot
	      ? 'create table if not exists '
	      : 'create table ';

	    let sql = createStatement + this.tableName();

	    if (like && this.tableNameLike()) {
	      sql += ' as select * from ' + this.tableNameLike() + ' where 0=1';
	    } else {
	      // so we will need to check for a primary key commands and add the columns
	      // to the table's declaration here so they can be created on the tables.
	      sql += ' (' + columns.sql.join(', ');
	      sql += this.foreignKeys() || '';
	      sql += this.primaryKeys() || '';
	      sql += this._addChecks();
	      sql += ')';
	    }
	    this.pushQuery(sql);

	    if (like) {
	      this.addColumns(columns, this.addColumnsPrefix);
	    }
	  }

	  addColumns(columns, prefix, colCompilers) {
	    if (prefix === this.alterColumnsPrefix) {
	      const compiler = this;

	      const columnsInfo = colCompilers.map((col) => {
	        const name = this.client.customWrapIdentifier(
	          col.getColumnName(),
	          identity,
	          col.columnBuilder.queryContext()
	        );

	        const type = col.getColumnType();

	        const defaultTo = col.modified['defaultTo']
	          ? formatDefault(col.modified['defaultTo'][0], col.type, this.client)
	          : null;

	        const notNull =
	          col.modified['nullable'] && col.modified['nullable'][0] === false;

	        return { name, type, defaultTo, notNull };
	      });

	      this.pushQuery({
	        sql: `PRAGMA table_info(${this.tableName()})`,
	        statementsProducer(pragma, connection) {
	          return compiler.client
	            .ddl(compiler, pragma, connection)
	            .alterColumn(columnsInfo);
	        },
	      });
	    } else {
	      for (let i = 0, l = columns.sql.length; i < l; i++) {
	        this.pushQuery({
	          sql: `alter table ${this.tableName()} add column ${columns.sql[i]}`,
	          bindings: columns.bindings[i],
	        });
	      }
	    }
	  }

	  // Compile a drop unique key command.
	  dropUnique(columns, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('unique', this.tableNameRaw, columns);
	    this.pushQuery(`drop index ${indexName}`);
	  }

	  // Compile a drop foreign key command.
	  dropForeign(columns, indexName) {
	    const compiler = this;

	    columns = Array.isArray(columns) ? columns : [columns];
	    columns = columns.map((column) =>
	      this.client.customWrapIdentifier(column, identity)
	    );
	    indexName = this.client.customWrapIdentifier(indexName, identity);

	    this.pushQuery({
	      sql: `PRAGMA table_info(${this.tableName()})`,
	      output(pragma) {
	        return compiler.client
	          .ddl(compiler, pragma, this.connection)
	          .dropForeign(columns, indexName);
	      },
	    });
	  }

	  // Compile a drop primary key command.
	  dropPrimary(constraintName) {
	    const compiler = this;

	    constraintName = this.client.customWrapIdentifier(constraintName, identity);

	    this.pushQuery({
	      sql: `PRAGMA table_info(${this.tableName()})`,
	      output(pragma) {
	        return compiler.client
	          .ddl(compiler, pragma, this.connection)
	          .dropPrimary(constraintName);
	      },
	    });
	  }

	  dropIndex(columns, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('index', this.tableNameRaw, columns);
	    this.pushQuery(`drop index ${indexName}`);
	  }

	  // Compile a unique key command.
	  unique(columns, indexName) {
	    let deferrable;
	    let predicate;
	    if (isObject(indexName)) {
	      ({ indexName, deferrable, predicate } = indexName);
	    }
	    if (deferrable && deferrable !== 'not deferrable') {
	      this.client.logger.warn(
	        `sqlite3: unique index \`${indexName}\` will not be deferrable ${deferrable} because sqlite3 does not support deferred constraints.`
	      );
	    }
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('unique', this.tableNameRaw, columns);
	    columns = this.formatter.columnize(columns);

	    const predicateQuery = predicate
	      ? ' ' + this.client.queryCompiler(predicate).where()
	      : '';

	    this.pushQuery(
	      `create unique index ${indexName} on ${this.tableName()} (${columns})${predicateQuery}`
	    );
	  }

	  // Compile a plain index key command.
	  index(columns, indexName, options) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('index', this.tableNameRaw, columns);
	    columns = this.formatter.columnize(columns);

	    let predicate;
	    if (isObject(options)) {
	      ({ predicate } = options);
	    }
	    const predicateQuery = predicate
	      ? ' ' + this.client.queryCompiler(predicate).where()
	      : '';
	    this.pushQuery(
	      `create index ${indexName} on ${this.tableName()} (${columns})${predicateQuery}`
	    );
	  }

	  /**
	   * Add a primary key to an existing table.
	   *
	   * @NOTE The `createQuery` method above handles table creation. Don't do anything regarding table
	   *       creation in this method
	   *
	   * @param {string | string[]} columns - Column name(s) to assign as primary keys
	   * @param {string} [constraintName] - Custom name for the PK constraint
	   */
	  primary(columns, constraintName) {
	    const compiler = this;

	    columns = Array.isArray(columns) ? columns : [columns];
	    columns = columns.map((column) =>
	      this.client.customWrapIdentifier(column, identity)
	    );

	    let deferrable;
	    if (isObject(constraintName)) {
	      ({ constraintName, deferrable } = constraintName);
	    }
	    if (deferrable && deferrable !== 'not deferrable') {
	      this.client.logger.warn(
	        `sqlite3: primary key constraint \`${constraintName}\` will not be deferrable ${deferrable} because sqlite3 does not support deferred constraints.`
	      );
	    }
	    constraintName = this.client.customWrapIdentifier(constraintName, identity);

	    if (this.method !== 'create' && this.method !== 'createIfNot') {
	      this.pushQuery({
	        sql: `PRAGMA table_info(${this.tableName()})`,
	        output(pragma) {
	          return compiler.client
	            .ddl(compiler, pragma, this.connection)
	            .primary(columns, constraintName);
	        },
	      });
	    }
	  }

	  /**
	   * Add a foreign key constraint to an existing table
	   *
	   * @NOTE The `createQuery` method above handles foreign key constraints on table creation. Don't do
	   *       anything regarding table creation in this method
	   *
	   * @param {object} foreignInfo - Information about the current column foreign setup
	   * @param {string | string[]} [foreignInfo.column] - Column in the current constraint
	   * @param {string | undefined} foreignInfo.keyName - Name of the foreign key constraint
	   * @param {string | string[]} foreignInfo.references - What column it references in the other table
	   * @param {string} foreignInfo.inTable - What table is referenced in this constraint
	   * @param {string} [foreignInfo.onUpdate] - What to do on updates
	   * @param {string} [foreignInfo.onDelete] - What to do on deletions
	   */
	  foreign(foreignInfo) {
	    const compiler = this;

	    if (this.method !== 'create' && this.method !== 'createIfNot') {
	      foreignInfo.column = Array.isArray(foreignInfo.column)
	        ? foreignInfo.column
	        : [foreignInfo.column];
	      foreignInfo.column = foreignInfo.column.map((column) =>
	        this.client.customWrapIdentifier(column, identity)
	      );
	      foreignInfo.inTable = this.client.customWrapIdentifier(
	        foreignInfo.inTable,
	        identity
	      );
	      foreignInfo.references = Array.isArray(foreignInfo.references)
	        ? foreignInfo.references
	        : [foreignInfo.references];
	      foreignInfo.references = foreignInfo.references.map((column) =>
	        this.client.customWrapIdentifier(column, identity)
	      );

	      this.pushQuery({
	        sql: `PRAGMA table_info(${this.tableName()})`,
	        statementsProducer(pragma, connection) {
	          return compiler.client
	            .ddl(compiler, pragma, connection)
	            .foreign(foreignInfo);
	        },
	      });
	    }
	  }

	  primaryKeys() {
	    const pks = filter(this.grouped.alterTable || [], { method: 'primary' });
	    if (pks.length > 0 && pks[0].args.length > 0) {
	      const columns = pks[0].args[0];
	      let constraintName = pks[0].args[1] || '';
	      if (constraintName) {
	        constraintName = ' constraint ' + this.formatter.wrap(constraintName);
	      }
	      const needUniqueCols =
	        this.grouped.columns.filter((t) => t.builder._type === 'increments')
	          .length > 0;
	      // SQLite dont support autoincrement columns and composite primary keys (autoincrement is always primary key).
	      // You need to add unique index instead when you have autoincrement columns (https://stackoverflow.com/a/6154876/1535159)
	      return `,${constraintName} ${
	        needUniqueCols ? 'unique' : 'primary key'
	      } (${this.formatter.columnize(columns)})`;
	    }
	  }

	  foreignKeys() {
	    let sql = '';
	    const foreignKeys = filter(this.grouped.alterTable || [], {
	      method: 'foreign',
	    });
	    for (let i = 0, l = foreignKeys.length; i < l; i++) {
	      const foreign = foreignKeys[i].args[0];
	      const column = this.formatter.columnize(foreign.column);
	      const references = this.formatter.columnize(foreign.references);
	      const foreignTable = this.formatter.wrap(foreign.inTable);
	      let constraintName = foreign.keyName || '';
	      if (constraintName) {
	        constraintName = ' constraint ' + this.formatter.wrap(constraintName);
	      }
	      sql += `,${constraintName} foreign key(${column}) references ${foreignTable}(${references})`;
	      if (foreign.onDelete) sql += ` on delete ${foreign.onDelete}`;
	      if (foreign.onUpdate) sql += ` on update ${foreign.onUpdate}`;
	    }
	    return sql;
	  }

	  createTableBlock() {
	    return this.getColumns().concat().join(',');
	  }

	  renameColumn(from, to) {
	    this.pushQuery({
	      sql: `alter table ${this.tableName()} rename ${this.formatter.wrap(
	        from
	      )} to ${this.formatter.wrap(to)}`,
	    });
	  }

	  _setNullableState(column, isNullable) {
	    const compiler = this;

	    this.pushQuery({
	      sql: `PRAGMA table_info(${this.tableName()})`,
	      statementsProducer(pragma, connection) {
	        return compiler.client
	          .ddl(compiler, pragma, connection)
	          .setNullable(column, isNullable);
	      },
	    });
	  }

	  dropColumn() {
	    const compiler = this;
	    const columns = values(arguments);

	    const columnsWrapped = columns.map((column) =>
	      this.client.customWrapIdentifier(column, identity)
	    );

	    this.pushQuery({
	      sql: `PRAGMA table_info(${this.tableName()})`,
	      output(pragma) {
	        return compiler.client
	          .ddl(compiler, pragma, this.connection)
	          .dropColumn(columnsWrapped);
	      },
	    });
	  }
	}

	sqliteTablecompiler = TableCompiler_SQLite3;
	return sqliteTablecompiler;
}

/* eslint max-len: 0 */

var sqliteViewcompiler;
var hasRequiredSqliteViewcompiler;

function requireSqliteViewcompiler () {
	if (hasRequiredSqliteViewcompiler) return sqliteViewcompiler;
	hasRequiredSqliteViewcompiler = 1;
	const ViewCompiler = viewcompiler;
	const {
	  columnize: columnize_,
	} = wrappingFormatter;

	class ViewCompiler_SQLite3 extends ViewCompiler {
	  constructor(client, viewCompiler) {
	    super(client, viewCompiler);
	  }
	  createOrReplace() {
	    const columns = this.columns;
	    const selectQuery = this.selectQuery.toString();
	    const viewName = this.viewName();

	    const columnList = columns
	      ? ' (' +
	        columnize_(
	          columns,
	          this.viewBuilder,
	          this.client,
	          this.bindingsHolder
	        ) +
	        ')'
	      : '';

	    const dropSql = `drop view if exists ${viewName}`;
	    const createSql = `create view ${viewName}${columnList} as ${selectQuery}`;

	    this.pushQuery({
	      sql: dropSql,
	    });
	    this.pushQuery({
	      sql: createSql,
	    });
	  }
	}

	sqliteViewcompiler = ViewCompiler_SQLite3;
	return sqliteViewcompiler;
}

var sqliteDdlOperations;
var hasRequiredSqliteDdlOperations;

function requireSqliteDdlOperations () {
	if (hasRequiredSqliteDdlOperations) return sqliteDdlOperations;
	hasRequiredSqliteDdlOperations = 1;
	function copyData(sourceTable, targetTable, columns) {
	  return `INSERT INTO "${targetTable}" SELECT ${
	    columns === undefined
	      ? '*'
	      : columns.map((column) => `"${column}"`).join(', ')
	  } FROM "${sourceTable}";`;
	}

	function dropOriginal(tableName) {
	  return `DROP TABLE "${tableName}"`;
	}

	function renameTable(tableName, alteredName) {
	  return `ALTER TABLE "${tableName}" RENAME TO "${alteredName}"`;
	}

	function getTableSql(tableName) {
	  return `SELECT type, sql FROM sqlite_master WHERE (type='table' OR (type='index' AND sql IS NOT NULL)) AND lower(tbl_name)='${tableName.toLowerCase()}'`;
	}

	function isForeignCheckEnabled() {
	  return `PRAGMA foreign_keys`;
	}

	function setForeignCheck(enable) {
	  return `PRAGMA foreign_keys = ${enable ? 'ON' : 'OFF'}`;
	}

	function executeForeignCheck() {
	  return `PRAGMA foreign_key_check`;
	}

	sqliteDdlOperations = {
	  copyData,
	  dropOriginal,
	  renameTable,
	  getTableSql,
	  isForeignCheckEnabled,
	  setForeignCheck,
	  executeForeignCheck,
	};
	return sqliteDdlOperations;
}

var tokenizer;
var hasRequiredTokenizer;

function requireTokenizer () {
	if (hasRequiredTokenizer) return tokenizer;
	hasRequiredTokenizer = 1;
	function tokenize(text, tokens) {
	  const compiledRegex = new RegExp(
	    Object.entries(tokens)
	      .map(([type, regex]) => `(?<${type}>${regex.source})`)
	      .join('|'),
	    'yi'
	  );

	  let index = 0;
	  const ast = [];

	  while (index < text.length) {
	    compiledRegex.lastIndex = index;
	    const result = text.match(compiledRegex);

	    if (result !== null) {
	      const [type, text] = Object.entries(result.groups).find(
	        ([name, group]) => group !== undefined
	      );

	      index += text.length;

	      if (!type.startsWith('_')) {
	        ast.push({ type, text });
	      }
	    } else {
	      throw new Error(
	        `No matching tokenizer rule found at: [${text.substring(index)}]`
	      );
	    }
	  }

	  return ast;
	}

	tokenizer = {
	  tokenize,
	};
	return tokenizer;
}

var parserCombinator;
var hasRequiredParserCombinator;

function requireParserCombinator () {
	if (hasRequiredParserCombinator) return parserCombinator;
	hasRequiredParserCombinator = 1;
	// Sequence parser combinator
	function s(sequence, post = (v) => v) {
	  return function ({ index = 0, input }) {
	    let position = index;
	    const ast = [];

	    for (const parser of sequence) {
	      const result = parser({ index: position, input });

	      if (result.success) {
	        position = result.index;
	        ast.push(result.ast);
	      } else {
	        return result;
	      }
	    }

	    return { success: true, ast: post(ast), index: position, input };
	  };
	}

	// Alternative parser combinator
	function a(alternative, post = (v) => v) {
	  return function ({ index = 0, input }) {
	    for (const parser of alternative) {
	      const result = parser({ index, input });

	      if (result.success) {
	        return {
	          success: true,
	          ast: post(result.ast),
	          index: result.index,
	          input,
	        };
	      }
	    }

	    return { success: false, ast: null, index, input };
	  };
	}

	// Many parser combinator
	function m(many, post = (v) => v) {
	  return function ({ index = 0, input }) {
	    let result = {};
	    let position = index;
	    const ast = [];

	    do {
	      result = many({ index: position, input });

	      if (result.success) {
	        position = result.index;
	        ast.push(result.ast);
	      }
	    } while (result.success);

	    if (ast.length > 0) {
	      return { success: true, ast: post(ast), index: position, input };
	    } else {
	      return { success: false, ast: null, index: position, input };
	    }
	  };
	}

	// Optional parser combinator
	function o(optional, post = (v) => v) {
	  return function ({ index = 0, input }) {
	    const result = optional({ index, input });

	    if (result.success) {
	      return {
	        success: true,
	        ast: post(result.ast),
	        index: result.index,
	        input,
	      };
	    } else {
	      return { success: true, ast: post(null), index, input };
	    }
	  };
	}

	// Lookahead parser combinator
	function l(lookahead, post = (v) => v) {
	  return function ({ index = 0, input }) {
	    const result = lookahead.do({ index, input });

	    if (result.success) {
	      const resultNext = lookahead.next({ index: result.index, input });

	      if (resultNext.success) {
	        return {
	          success: true,
	          ast: post(result.ast),
	          index: result.index,
	          input,
	        };
	      }
	    }

	    return { success: false, ast: null, index, input };
	  };
	}

	// Negative parser combinator
	function n(negative, post = (v) => v) {
	  return function ({ index = 0, input }) {
	    const result = negative.do({ index, input });

	    if (result.success) {
	      const resultNot = negative.not({ index, input });

	      if (!resultNot.success) {
	        return {
	          success: true,
	          ast: post(result.ast),
	          index: result.index,
	          input,
	        };
	      }
	    }

	    return { success: false, ast: null, index, input };
	  };
	}

	// Token parser combinator
	function t(token, post = (v) => v.text) {
	  return function ({ index = 0, input }) {
	    const result = input[index];

	    if (
	      result !== undefined &&
	      (token.type === undefined || token.type === result.type) &&
	      (token.text === undefined ||
	        token.text.toUpperCase() === result.text.toUpperCase())
	    ) {
	      return {
	        success: true,
	        ast: post(result),
	        index: index + 1,
	        input,
	      };
	    } else {
	      return { success: false, ast: null, index, input };
	    }
	  };
	}

	// Empty parser constant
	const e = function ({ index = 0, input }) {
	  return { success: true, ast: null, index, input };
	};

	// Finish parser constant
	const f = function ({ index = 0, input }) {
	  return { success: index === input.length, ast: null, index, input };
	};

	parserCombinator = { s, a, m, o, l, n, t, e, f };
	return parserCombinator;
}

var parser;
var hasRequiredParser;

function requireParser () {
	if (hasRequiredParser) return parser;
	hasRequiredParser = 1;
	const { tokenize } = requireTokenizer();
	const { s, a, m, o, l, n, t, e, f } = requireParserCombinator();

	const TOKENS = {
	  keyword:
	    /(?:ABORT|ACTION|ADD|AFTER|ALL|ALTER|ALWAYS|ANALYZE|AND|AS|ASC|ATTACH|AUTOINCREMENT|BEFORE|BEGIN|BETWEEN|BY|CASCADE|CASE|CAST|CHECK|COLLATE|COLUMN|COMMIT|CONFLICT|CONSTRAINT|CREATE|CROSS|CURRENT|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|DATABASE|DEFAULT|DEFERRED|DEFERRABLE|DELETE|DESC|DETACH|DISTINCT|DO|DROP|END|EACH|ELSE|ESCAPE|EXCEPT|EXCLUSIVE|EXCLUDE|EXISTS|EXPLAIN|FAIL|FILTER|FIRST|FOLLOWING|FOR|FOREIGN|FROM|FULL|GENERATED|GLOB|GROUP|GROUPS|HAVING|IF|IGNORE|IMMEDIATE|IN|INDEX|INDEXED|INITIALLY|INNER|INSERT|INSTEAD|INTERSECT|INTO|IS|ISNULL|JOIN|KEY|LAST|LEFT|LIKE|LIMIT|MATCH|MATERIALIZED|NATURAL|NO|NOT|NOTHING|NOTNULL|NULL|NULLS|OF|OFFSET|ON|OR|ORDER|OTHERS|OUTER|OVER|PARTITION|PLAN|PRAGMA|PRECEDING|PRIMARY|QUERY|RAISE|RANGE|RECURSIVE|REFERENCES|REGEXP|REINDEX|RELEASE|RENAME|REPLACE|RESTRICT|RETURNING|RIGHT|ROLLBACK|ROW|ROWS|SAVEPOINT|SELECT|SET|TABLE|TEMP|TEMPORARY|THEN|TIES|TO|TRANSACTION|TRIGGER|UNBOUNDED|UNION|UNIQUE|UPDATE|USING|VACUUM|VALUES|VIEW|VIRTUAL|WHEN|WHERE|WINDOW|WITH|WITHOUT)(?=\s+|-|\(|\)|;|\+|\*|\/|%|==|=|<=|<>|<<|<|>=|>>|>|!=|,|&|~|\|\||\||\.)/,
	  id: /"[^"]*(?:""[^"]*)*"|`[^`]*(?:``[^`]*)*`|\[[^[\]]*\]|[a-z_][a-z0-9_$]*/,
	  string: /'[^']*(?:''[^']*)*'/,
	  blob: /x'(?:[0-9a-f][0-9a-f])+'/,
	  numeric: /(?:\d+(?:\.\d*)?|\.\d+)(?:e(?:\+|-)?\d+)?|0x[0-9a-f]+/,
	  variable: /\?\d*|[@$:][a-z0-9_$]+/,
	  operator: /-|\(|\)|;|\+|\*|\/|%|==|=|<=|<>|<<|<|>=|>>|>|!=|,|&|~|\|\||\||\./,
	  _ws: /\s+/,
	};

	function parseCreateTable(sql) {
	  const result = createTable({ input: tokenize(sql, TOKENS) });

	  if (!result.success) {
	    throw new Error(
	      `Parsing CREATE TABLE failed at [${result.input
	        .slice(result.index)
	        .map((t) => t.text)
	        .join(' ')}] of "${sql}"`
	    );
	  }

	  return result.ast;
	}

	function parseCreateIndex(sql) {
	  const result = createIndex({ input: tokenize(sql, TOKENS) });

	  if (!result.success) {
	    throw new Error(
	      `Parsing CREATE INDEX failed at [${result.input
	        .slice(result.index)
	        .map((t) => t.text)
	        .join(' ')}] of "${sql}"`
	    );
	  }

	  return result.ast;
	}

	function createTable(ctx) {
	  return s(
	    [
	      t({ text: 'CREATE' }, (v) => null),
	      temporary,
	      t({ text: 'TABLE' }, (v) => null),
	      exists,
	      schema,
	      table,
	      t({ text: '(' }, (v) => null),
	      columnDefinitionList,
	      tableConstraintList,
	      t({ text: ')' }, (v) => null),
	      rowid,
	      f,
	    ],
	    (v) => Object.assign({}, ...v.filter((x) => x !== null))
	  )(ctx);
	}

	function temporary(ctx) {
	  return a([t({ text: 'TEMP' }), t({ text: 'TEMPORARY' }), e], (v) => ({
	    temporary: v !== null,
	  }))(ctx);
	}

	function rowid(ctx) {
	  return o(s([t({ text: 'WITHOUT' }), t({ text: 'ROWID' })]), (v) => ({
	    rowid: v !== null,
	  }))(ctx);
	}

	function columnDefinitionList(ctx) {
	  return a([
	    s([columnDefinition, t({ text: ',' }), columnDefinitionList], (v) => ({
	      columns: [v[0]].concat(v[2].columns),
	    })),
	    s([columnDefinition], (v) => ({ columns: [v[0]] })),
	  ])(ctx);
	}

	function columnDefinition(ctx) {
	  return s(
	    [s([identifier], (v) => ({ name: v[0] })), typeName, columnConstraintList],
	    (v) => Object.assign({}, ...v)
	  )(ctx);
	}

	function typeName(ctx) {
	  return o(
	    s(
	      [
	        m(t({ type: 'id' })),
	        a([
	          s(
	            [
	              t({ text: '(' }),
	              signedNumber,
	              t({ text: ',' }),
	              signedNumber,
	              t({ text: ')' }),
	            ],
	            (v) => `(${v[1]}, ${v[3]})`
	          ),
	          s(
	            [t({ text: '(' }), signedNumber, t({ text: ')' })],
	            (v) => `(${v[1]})`
	          ),
	          e,
	        ]),
	      ],
	      (v) => `${v[0].join(' ')}${v[1] || ''}`
	    ),
	    (v) => ({ type: v })
	  )(ctx);
	}

	function columnConstraintList(ctx) {
	  return o(m(columnConstraint), (v) => ({
	    constraints: Object.assign(
	      {
	        primary: null,
	        notnull: null,
	        null: null,
	        unique: null,
	        check: null,
	        default: null,
	        collate: null,
	        references: null,
	        as: null,
	      },
	      ...(v || [])
	    ),
	  }))(ctx);
	}

	function columnConstraint(ctx) {
	  return a([
	    primaryColumnConstraint,
	    notnullColumnConstraint,
	    nullColumnConstraint,
	    uniqueColumnConstraint,
	    checkColumnConstraint,
	    defaultColumnConstraint,
	    collateColumnConstraint,
	    referencesColumnConstraint,
	    asColumnConstraint,
	  ])(ctx);
	}

	function primaryColumnConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      t({ text: 'PRIMARY' }, (v) => null),
	      t({ text: 'KEY' }, (v) => null),
	      order,
	      conflictClause,
	      autoincrement,
	    ],
	    (v) => ({ primary: Object.assign({}, ...v.filter((x) => x !== null)) })
	  )(ctx);
	}

	function autoincrement(ctx) {
	  return o(t({ text: 'AUTOINCREMENT' }), (v) => ({
	    autoincrement: v !== null,
	  }))(ctx);
	}

	function notnullColumnConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      t({ text: 'NOT' }, (v) => null),
	      t({ text: 'NULL' }, (v) => null),
	      conflictClause,
	    ],
	    (v) => ({ notnull: Object.assign({}, ...v.filter((x) => x !== null)) })
	  )(ctx);
	}

	function nullColumnConstraint(ctx) {
	  return s(
	    [constraintName, t({ text: 'NULL' }, (v) => null), conflictClause],
	    (v) => ({ null: Object.assign({}, ...v.filter((x) => x !== null)) })
	  )(ctx);
	}

	function uniqueColumnConstraint(ctx) {
	  return s(
	    [constraintName, t({ text: 'UNIQUE' }, (v) => null), conflictClause],
	    (v) => ({ unique: Object.assign({}, ...v.filter((x) => x !== null)) })
	  )(ctx);
	}

	function checkColumnConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      t({ text: 'CHECK' }, (v) => null),
	      t({ text: '(' }, (v) => null),
	      s([expression], (v) => ({ expression: v[0] })),
	      t({ text: ')' }, (v) => null),
	    ],
	    (v) => ({ check: Object.assign({}, ...v.filter((x) => x !== null)) })
	  )(ctx);
	}

	function defaultColumnConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      t({ text: 'DEFAULT' }, (v) => null),
	      a([
	        s([t({ text: '(' }), expression, t({ text: ')' })], (v) => ({
	          value: v[1],
	          expression: true,
	        })),
	        s([literalValue], (v) => ({ value: v[0], expression: false })),
	        s([signedNumber], (v) => ({ value: v[0], expression: false })),
	      ]),
	    ],
	    (v) => ({ default: Object.assign({}, ...v.filter((x) => x !== null)) })
	  )(ctx);
	}

	function collateColumnConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      t({ text: 'COLLATE' }, (v) => null),
	      t({ type: 'id' }, (v) => ({ collation: v.text })),
	    ],
	    (v) => ({ collate: Object.assign({}, ...v.filter((x) => x !== null)) })
	  )(ctx);
	}

	function referencesColumnConstraint(ctx) {
	  return s(
	    [constraintName, s([foreignKeyClause], (v) => v[0].references)],
	    (v) => ({
	      references: Object.assign({}, ...v.filter((x) => x !== null)),
	    })
	  )(ctx);
	}

	function asColumnConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      o(s([t({ text: 'GENERATED' }), t({ text: 'ALWAYS' })]), (v) => ({
	        generated: v !== null,
	      })),
	      t({ text: 'AS' }, (v) => null),
	      t({ text: '(' }, (v) => null),
	      s([expression], (v) => ({ expression: v[0] })),
	      t({ text: ')' }, (v) => null),
	      a([t({ text: 'STORED' }), t({ text: 'VIRTUAL' }), e], (v) => ({
	        mode: v ? v.toUpperCase() : null,
	      })),
	    ],
	    (v) => ({ as: Object.assign({}, ...v.filter((x) => x !== null)) })
	  )(ctx);
	}

	function tableConstraintList(ctx) {
	  return o(m(s([t({ text: ',' }), tableConstraint], (v) => v[1])), (v) => ({
	    constraints: v || [],
	  }))(ctx);
	}

	function tableConstraint(ctx) {
	  return a([
	    primaryTableConstraint,
	    uniqueTableConstraint,
	    checkTableConstraint,
	    foreignTableConstraint,
	  ])(ctx);
	}

	function primaryTableConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      t({ text: 'PRIMARY' }, (v) => null),
	      t({ text: 'KEY' }, (v) => null),
	      t({ text: '(' }, (v) => null),
	      indexedColumnList,
	      t({ text: ')' }, (v) => null),
	      conflictClause,
	    ],
	    (v) =>
	      Object.assign({ type: 'PRIMARY KEY' }, ...v.filter((x) => x !== null))
	  )(ctx);
	}

	function uniqueTableConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      t({ text: 'UNIQUE' }, (v) => null),
	      t({ text: '(' }, (v) => null),
	      indexedColumnList,
	      t({ text: ')' }, (v) => null),
	      conflictClause,
	    ],
	    (v) => Object.assign({ type: 'UNIQUE' }, ...v.filter((x) => x !== null))
	  )(ctx);
	}

	function conflictClause(ctx) {
	  return o(
	    s(
	      [
	        t({ text: 'ON' }),
	        t({ text: 'CONFLICT' }),
	        a([
	          t({ text: 'ROLLBACK' }),
	          t({ text: 'ABORT' }),
	          t({ text: 'FAIL' }),
	          t({ text: 'IGNORE' }),
	          t({ text: 'REPLACE' }),
	        ]),
	      ],
	      (v) => v[2]
	    ),
	    (v) => ({ conflict: v ? v.toUpperCase() : null })
	  )(ctx);
	}

	function checkTableConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      t({ text: 'CHECK' }, (v) => null),
	      t({ text: '(' }, (v) => null),
	      s([expression], (v) => ({ expression: v[0] })),
	      t({ text: ')' }, (v) => null),
	    ],
	    (v) => Object.assign({ type: 'CHECK' }, ...v.filter((x) => x !== null))
	  )(ctx);
	}

	function foreignTableConstraint(ctx) {
	  return s(
	    [
	      constraintName,
	      t({ text: 'FOREIGN' }, (v) => null),
	      t({ text: 'KEY' }, (v) => null),
	      t({ text: '(' }, (v) => null),
	      columnNameList,
	      t({ text: ')' }, (v) => null),
	      foreignKeyClause,
	    ],
	    (v) =>
	      Object.assign({ type: 'FOREIGN KEY' }, ...v.filter((x) => x !== null))
	  )(ctx);
	}

	function foreignKeyClause(ctx) {
	  return s(
	    [
	      t({ text: 'REFERENCES' }, (v) => null),
	      table,
	      columnNameListOptional,
	      o(m(a([deleteReference, updateReference, matchReference])), (v) =>
	        Object.assign({ delete: null, update: null, match: null }, ...(v || []))
	      ),
	      deferrable,
	    ],
	    (v) => ({ references: Object.assign({}, ...v.filter((x) => x !== null)) })
	  )(ctx);
	}

	function columnNameListOptional(ctx) {
	  return o(
	    s([t({ text: '(' }), columnNameList, t({ text: ')' })], (v) => v[1]),
	    (v) => ({ columns: v ? v.columns : [] })
	  )(ctx);
	}

	function columnNameList(ctx) {
	  return s(
	    [
	      o(m(s([identifier, t({ text: ',' })], (v) => v[0])), (v) =>
	        v !== null ? v : []
	      ),
	      identifier,
	    ],
	    (v) => ({ columns: v[0].concat([v[1]]) })
	  )(ctx);
	}

	function deleteReference(ctx) {
	  return s([t({ text: 'ON' }), t({ text: 'DELETE' }), onAction], (v) => ({
	    delete: v[2],
	  }))(ctx);
	}

	function updateReference(ctx) {
	  return s([t({ text: 'ON' }), t({ text: 'UPDATE' }), onAction], (v) => ({
	    update: v[2],
	  }))(ctx);
	}

	function matchReference(ctx) {
	  return s(
	    [t({ text: 'MATCH' }), a([t({ type: 'keyword' }), t({ type: 'id' })])],
	    (v) => ({ match: v[1] })
	  )(ctx);
	}

	function deferrable(ctx) {
	  return o(
	    s([
	      o(t({ text: 'NOT' })),
	      t({ text: 'DEFERRABLE' }),
	      o(
	        s(
	          [
	            t({ text: 'INITIALLY' }),
	            a([t({ text: 'DEFERRED' }), t({ text: 'IMMEDIATE' })]),
	          ],
	          (v) => v[1].toUpperCase()
	        )
	      ),
	    ]),
	    (v) => ({ deferrable: v ? { not: v[0] !== null, initially: v[2] } : null })
	  )(ctx);
	}

	function constraintName(ctx) {
	  return o(
	    s([t({ text: 'CONSTRAINT' }), identifier], (v) => v[1]),
	    (v) => ({ name: v })
	  )(ctx);
	}

	function createIndex(ctx) {
	  return s(
	    [
	      t({ text: 'CREATE' }, (v) => null),
	      unique,
	      t({ text: 'INDEX' }, (v) => null),
	      exists,
	      schema,
	      index,
	      t({ text: 'ON' }, (v) => null),
	      table,
	      t({ text: '(' }, (v) => null),
	      indexedColumnList,
	      t({ text: ')' }, (v) => null),
	      where,
	      f,
	    ],
	    (v) => Object.assign({}, ...v.filter((x) => x !== null))
	  )(ctx);
	}

	function unique(ctx) {
	  return o(t({ text: 'UNIQUE' }), (v) => ({ unique: v !== null }))(ctx);
	}

	function exists(ctx) {
	  return o(
	    s([t({ text: 'IF' }), t({ text: 'NOT' }), t({ text: 'EXISTS' })]),
	    (v) => ({ exists: v !== null })
	  )(ctx);
	}

	function schema(ctx) {
	  return o(
	    s([identifier, t({ text: '.' })], (v) => v[0]),
	    (v) => ({ schema: v })
	  )(ctx);
	}

	function index(ctx) {
	  return s([identifier], (v) => ({ index: v[0] }))(ctx);
	}

	function table(ctx) {
	  return s([identifier], (v) => ({ table: v[0] }))(ctx);
	}

	function where(ctx) {
	  return o(
	    s([t({ text: 'WHERE' }), expression], (v) => v[1]),
	    (v) => ({ where: v })
	  )(ctx);
	}

	function indexedColumnList(ctx) {
	  return a([
	    s([indexedColumn, t({ text: ',' }), indexedColumnList], (v) => ({
	      columns: [v[0]].concat(v[2].columns),
	    })),
	    s([indexedColumnExpression, t({ text: ',' }), indexedColumnList], (v) => ({
	      columns: [v[0]].concat(v[2].columns),
	    })),
	    l({ do: indexedColumn, next: t({ text: ')' }) }, (v) => ({
	      columns: [v],
	    })),
	    l({ do: indexedColumnExpression, next: t({ text: ')' }) }, (v) => ({
	      columns: [v],
	    })),
	  ])(ctx);
	}

	function indexedColumn(ctx) {
	  return s(
	    [
	      s([identifier], (v) => ({ name: v[0], expression: false })),
	      collation,
	      order,
	    ],
	    (v) => Object.assign({}, ...v.filter((x) => x !== null))
	  )(ctx);
	}

	function indexedColumnExpression(ctx) {
	  return s(
	    [
	      s([indexedExpression], (v) => ({ name: v[0], expression: true })),
	      collation,
	      order,
	    ],
	    (v) => Object.assign({}, ...v.filter((x) => x !== null))
	  )(ctx);
	}

	function collation(ctx) {
	  return o(
	    s([t({ text: 'COLLATE' }), t({ type: 'id' })], (v) => v[1]),
	    (v) => ({ collation: v })
	  )(ctx);
	}

	function order(ctx) {
	  return a([t({ text: 'ASC' }), t({ text: 'DESC' }), e], (v) => ({
	    order: v ? v.toUpperCase() : null,
	  }))(ctx);
	}

	function indexedExpression(ctx) {
	  return m(
	    a([
	      n({
	        do: t({ type: 'keyword' }),
	        not: a([
	          t({ text: 'COLLATE' }),
	          t({ text: 'ASC' }),
	          t({ text: 'DESC' }),
	        ]),
	      }),
	      t({ type: 'id' }),
	      t({ type: 'string' }),
	      t({ type: 'blob' }),
	      t({ type: 'numeric' }),
	      t({ type: 'variable' }),
	      n({
	        do: t({ type: 'operator' }),
	        not: a([t({ text: '(' }), t({ text: ')' }), t({ text: ',' })]),
	      }),
	      s([t({ text: '(' }), o(expression), t({ text: ')' })], (v) => v[1] || []),
	    ])
	  )(ctx);
	}

	function expression(ctx) {
	  return m(
	    a([
	      t({ type: 'keyword' }),
	      t({ type: 'id' }),
	      t({ type: 'string' }),
	      t({ type: 'blob' }),
	      t({ type: 'numeric' }),
	      t({ type: 'variable' }),
	      n({
	        do: t({ type: 'operator' }),
	        not: a([t({ text: '(' }), t({ text: ')' })]),
	      }),
	      s([t({ text: '(' }), o(expression), t({ text: ')' })], (v) => v[1] || []),
	    ])
	  )(ctx);
	}

	function identifier(ctx) {
	  return a([t({ type: 'id' }), t({ type: 'string' })], (v) =>
	    /^["`['][^]*["`\]']$/.test(v) ? v.substring(1, v.length - 1) : v
	  )(ctx);
	}

	function onAction(ctx) {
	  return a(
	    [
	      s([t({ text: 'SET' }), t({ text: 'NULL' })], (v) => `${v[0]} ${v[1]}`),
	      s([t({ text: 'SET' }), t({ text: 'DEFAULT' })], (v) => `${v[0]} ${v[1]}`),
	      t({ text: 'CASCADE' }),
	      t({ text: 'RESTRICT' }),
	      s([t({ text: 'NO' }), t({ text: 'ACTION' })], (v) => `${v[0]} ${v[1]}`),
	    ],
	    (v) => v.toUpperCase()
	  )(ctx);
	}

	function literalValue(ctx) {
	  return a([
	    t({ type: 'numeric' }),
	    t({ type: 'string' }),
	    t({ type: 'id' }),
	    t({ type: 'blob' }),
	    t({ text: 'NULL' }),
	    t({ text: 'TRUE' }),
	    t({ text: 'FALSE' }),
	    t({ text: 'CURRENT_TIME' }),
	    t({ text: 'CURRENT_DATE' }),
	    t({ text: 'CURRENT_TIMESTAMP' }),
	  ])(ctx);
	}

	function signedNumber(ctx) {
	  return s(
	    [a([t({ text: '+' }), t({ text: '-' }), e]), t({ type: 'numeric' })],
	    (v) => `${v[0] || ''}${v[1]}`
	  )(ctx);
	}

	parser = {
	  parseCreateTable,
	  parseCreateIndex,
	};
	return parser;
}

var compiler;
var hasRequiredCompiler;

function requireCompiler () {
	if (hasRequiredCompiler) return compiler;
	hasRequiredCompiler = 1;
	function compileCreateTable(ast, wrap = (v) => v) {
	  return createTable(ast, wrap);
	}

	function compileCreateIndex(ast, wrap = (v) => v) {
	  return createIndex(ast, wrap);
	}

	function createTable(ast, wrap) {
	  return `CREATE${temporary(ast)} TABLE${exists(ast)} ${schema(
	    ast,
	    wrap
	  )}${table(ast, wrap)} (${columnDefinitionList(
	    ast,
	    wrap
	  )}${tableConstraintList(ast, wrap)})${rowid(ast)}`;
	}

	function temporary(ast, wrap) {
	  return ast.temporary ? ' TEMP' : '';
	}

	function rowid(ast, wrap) {
	  return ast.rowid ? ' WITHOUT ROWID' : '';
	}

	function columnDefinitionList(ast, wrap) {
	  return ast.columns.map((column) => columnDefinition(column, wrap)).join(', ');
	}

	function columnDefinition(ast, wrap) {
	  return `${identifier(ast.name, wrap)}${typeName(
	    ast)}${columnConstraintList(ast.constraints, wrap)}`;
	}

	function typeName(ast, wrap) {
	  return ast.type !== null ? ` ${ast.type}` : '';
	}

	function columnConstraintList(ast, wrap) {
	  return `${primaryColumnConstraint(ast, wrap)}${notnullColumnConstraint(
	    ast,
	    wrap
	  )}${nullColumnConstraint(ast, wrap)}${uniqueColumnConstraint(
	    ast,
	    wrap
	  )}${checkColumnConstraint(ast, wrap)}${defaultColumnConstraint(
	    ast,
	    wrap
	  )}${collateColumnConstraint(ast, wrap)}${referencesColumnConstraint(
	    ast,
	    wrap
	  )}${asColumnConstraint(ast, wrap)}`;
	}

	function primaryColumnConstraint(ast, wrap) {
	  return ast.primary !== null
	    ? ` ${constraintName(ast.primary, wrap)}PRIMARY KEY${order(
	        ast.primary)}${conflictClause(ast.primary)}${autoincrement(ast.primary)}`
	    : '';
	}

	function autoincrement(ast, wrap) {
	  return ast.autoincrement ? ' AUTOINCREMENT' : '';
	}

	function notnullColumnConstraint(ast, wrap) {
	  return ast.notnull !== null
	    ? ` ${constraintName(ast.notnull, wrap)}NOT NULL${conflictClause(
	        ast.notnull)}`
	    : '';
	}

	function nullColumnConstraint(ast, wrap) {
	  return ast.null !== null
	    ? ` ${constraintName(ast.null, wrap)}NULL${conflictClause(ast.null)}`
	    : '';
	}

	function uniqueColumnConstraint(ast, wrap) {
	  return ast.unique !== null
	    ? ` ${constraintName(ast.unique, wrap)}UNIQUE${conflictClause(
	        ast.unique)}`
	    : '';
	}

	function checkColumnConstraint(ast, wrap) {
	  return ast.check !== null
	    ? ` ${constraintName(ast.check, wrap)}CHECK (${expression(
	        ast.check.expression)})`
	    : '';
	}

	function defaultColumnConstraint(ast, wrap) {
	  return ast.default !== null
	    ? ` ${constraintName(ast.default, wrap)}DEFAULT ${
	        !ast.default.expression
	          ? ast.default.value
	          : `(${expression(ast.default.value)})`
	      }`
	    : '';
	}

	function collateColumnConstraint(ast, wrap) {
	  return ast.collate !== null
	    ? ` ${constraintName(ast.collate, wrap)}COLLATE ${ast.collate.collation}`
	    : '';
	}

	function referencesColumnConstraint(ast, wrap) {
	  return ast.references !== null
	    ? ` ${constraintName(ast.references, wrap)}${foreignKeyClause(
	        ast.references,
	        wrap
	      )}`
	    : '';
	}

	function asColumnConstraint(ast, wrap) {
	  return ast.as !== null
	    ? ` ${constraintName(ast.as, wrap)}${
	        ast.as.generated ? 'GENERATED ALWAYS ' : ''
	      }AS (${expression(ast.as.expression)})${
	        ast.as.mode !== null ? ` ${ast.as.mode}` : ''
	      }`
	    : '';
	}

	function tableConstraintList(ast, wrap) {
	  return ast.constraints.reduce(
	    (constraintList, constraint) =>
	      `${constraintList}, ${tableConstraint(constraint, wrap)}`,
	    ''
	  );
	}

	function tableConstraint(ast, wrap) {
	  switch (ast.type) {
	    case 'PRIMARY KEY':
	      return primaryTableConstraint(ast, wrap);
	    case 'UNIQUE':
	      return uniqueTableConstraint(ast, wrap);
	    case 'CHECK':
	      return checkTableConstraint(ast, wrap);
	    case 'FOREIGN KEY':
	      return foreignTableConstraint(ast, wrap);
	  }
	}

	function primaryTableConstraint(ast, wrap) {
	  return `${constraintName(ast, wrap)}PRIMARY KEY (${indexedColumnList(
	    ast,
	    wrap
	  )})${conflictClause(ast)}`;
	}

	function uniqueTableConstraint(ast, wrap) {
	  return `${constraintName(ast, wrap)}UNIQUE (${indexedColumnList(
	    ast,
	    wrap
	  )})${conflictClause(ast)}`;
	}

	function conflictClause(ast, wrap) {
	  return ast.conflict !== null ? ` ON CONFLICT ${ast.conflict}` : '';
	}

	function checkTableConstraint(ast, wrap) {
	  return `${constraintName(ast, wrap)}CHECK (${expression(
	    ast.expression)})`;
	}

	function foreignTableConstraint(ast, wrap) {
	  return `${constraintName(ast, wrap)}FOREIGN KEY (${columnNameList(
	    ast,
	    wrap
	  )}) ${foreignKeyClause(ast.references, wrap)}`;
	}

	function foreignKeyClause(ast, wrap) {
	  return `REFERENCES ${table(ast, wrap)}${columnNameListOptional(
	    ast,
	    wrap
	  )}${deleteUpdateMatchList(ast)}${deferrable(ast.deferrable)}`;
	}

	function columnNameListOptional(ast, wrap) {
	  return ast.columns.length > 0 ? ` (${columnNameList(ast, wrap)})` : '';
	}

	function columnNameList(ast, wrap) {
	  return ast.columns.map((column) => identifier(column, wrap)).join(', ');
	}

	function deleteUpdateMatchList(ast, wrap) {
	  return `${deleteReference(ast)}${updateReference(
	    ast)}${matchReference(ast)}`;
	}

	function deleteReference(ast, wrap) {
	  return ast.delete !== null ? ` ON DELETE ${ast.delete}` : '';
	}

	function updateReference(ast, wrap) {
	  return ast.update !== null ? ` ON UPDATE ${ast.update}` : '';
	}

	function matchReference(ast, wrap) {
	  return ast.match !== null ? ` MATCH ${ast.match}` : '';
	}

	function deferrable(ast, wrap) {
	  return ast !== null
	    ? ` ${ast.not ? 'NOT ' : ''}DEFERRABLE${
	        ast.initially !== null ? ` INITIALLY ${ast.initially}` : ''
	      }`
	    : '';
	}

	function constraintName(ast, wrap) {
	  return ast.name !== null ? `CONSTRAINT ${identifier(ast.name, wrap)} ` : '';
	}

	function createIndex(ast, wrap) {
	  return `CREATE${unique(ast)} INDEX${exists(ast)} ${schema(
	    ast,
	    wrap
	  )}${index(ast, wrap)} on ${table(ast, wrap)} (${indexedColumnList(
	    ast,
	    wrap
	  )})${where(ast)}`;
	}

	function unique(ast, wrap) {
	  return ast.unique ? ' UNIQUE' : '';
	}

	function exists(ast, wrap) {
	  return ast.exists ? ' IF NOT EXISTS' : '';
	}

	function schema(ast, wrap) {
	  return ast.schema !== null ? `${identifier(ast.schema, wrap)}.` : '';
	}

	function index(ast, wrap) {
	  return identifier(ast.index, wrap);
	}

	function table(ast, wrap) {
	  return identifier(ast.table, wrap);
	}

	function where(ast, wrap) {
	  return ast.where !== null ? ` where ${expression(ast.where)}` : '';
	}

	function indexedColumnList(ast, wrap) {
	  return ast.columns
	    .map((column) =>
	      !column.expression
	        ? indexedColumn(column, wrap)
	        : indexedColumnExpression(column)
	    )
	    .join(', ');
	}

	function indexedColumn(ast, wrap) {
	  return `${identifier(ast.name, wrap)}${collation(ast)}${order(
	    ast)}`;
	}

	function indexedColumnExpression(ast, wrap) {
	  return `${indexedExpression(ast.name)}${collation(ast)}${order(
	    ast)}`;
	}

	function collation(ast, wrap) {
	  return ast.collation !== null ? ` COLLATE ${ast.collation}` : '';
	}

	function order(ast, wrap) {
	  return ast.order !== null ? ` ${ast.order}` : '';
	}

	function indexedExpression(ast, wrap) {
	  return expression(ast);
	}

	function expression(ast, wrap) {
	  return ast.reduce(
	    (expr, e) =>
	      Array.isArray(e)
	        ? `${expr}(${expression(e)})`
	        : !expr
	        ? e
	        : `${expr} ${e}`,
	    ''
	  );
	}

	function identifier(ast, wrap) {
	  return wrap(ast);
	}

	compiler = {
	  compileCreateTable,
	  compileCreateIndex,
	};
	return compiler;
}

var utils$2;
var hasRequiredUtils$2;

function requireUtils$2 () {
	if (hasRequiredUtils$2) return utils$2;
	hasRequiredUtils$2 = 1;
	function isEqualId(first, second) {
	  return first.toLowerCase() === second.toLowerCase();
	}

	function includesId(list, id) {
	  return list.some((item) => isEqualId(item, id));
	}

	utils$2 = {
	  isEqualId,
	  includesId,
	};
	return utils$2;
}

var ddl;
var hasRequiredDdl;

function requireDdl () {
	if (hasRequiredDdl) return ddl;
	hasRequiredDdl = 1;
	// SQLite3_DDL
	//
	// All of the SQLite3 specific DDL helpers for renaming/dropping
	// columns and changing datatypes.
	// -------

	const identity = identity_1;
	const { nanonum } = nanoid_1;
	const {
	  copyData,
	  dropOriginal,
	  renameTable,
	  getTableSql,
	  isForeignCheckEnabled,
	  setForeignCheck,
	  executeForeignCheck,
	} = requireSqliteDdlOperations();
	const { parseCreateTable, parseCreateIndex } = requireParser();
	const {
	  compileCreateTable,
	  compileCreateIndex,
	} = requireCompiler();
	const { isEqualId, includesId } = requireUtils$2();

	// So altering the schema in SQLite3 is a major pain.
	// We have our own object to deal with the renaming and altering the types
	// for sqlite3 things.
	class SQLite3_DDL {
	  constructor(client, tableCompiler, pragma, connection) {
	    this.client = client;
	    this.tableCompiler = tableCompiler;
	    this.pragma = pragma;
	    this.tableNameRaw = this.tableCompiler.tableNameRaw;
	    this.alteredName = `_knex_temp_alter${nanonum(3)}`;
	    this.connection = connection;
	    this.formatter = (value) =>
	      this.client.customWrapIdentifier(value, identity);
	    this.wrap = (value) => this.client.wrapIdentifierImpl(value);
	  }

	  tableName() {
	    return this.formatter(this.tableNameRaw);
	  }

	  getTableSql() {
	    const tableName = this.tableName();

	    return this.client.transaction(
	      async (trx) => {
	        trx.disableProcessing();
	        const result = await trx.raw(getTableSql(tableName));
	        trx.enableProcessing();

	        return {
	          createTable: result.filter((create) => create.type === 'table')[0]
	            .sql,
	          createIndices: result
	            .filter((create) => create.type === 'index')
	            .map((create) => create.sql),
	        };
	      },
	      { connection: this.connection }
	    );
	  }

	  async isForeignCheckEnabled() {
	    const result = await this.client
	      .raw(isForeignCheckEnabled())
	      .connection(this.connection);

	    return result[0].foreign_keys === 1;
	  }

	  async setForeignCheck(enable) {
	    await this.client.raw(setForeignCheck(enable)).connection(this.connection);
	  }

	  renameTable(trx) {
	    return trx.raw(renameTable(this.alteredName, this.tableName()));
	  }

	  dropOriginal(trx) {
	    return trx.raw(dropOriginal(this.tableName()));
	  }

	  copyData(trx, columns) {
	    return trx.raw(copyData(this.tableName(), this.alteredName, columns));
	  }

	  async alterColumn(columns) {
	    const { createTable, createIndices } = await this.getTableSql();

	    const parsedTable = parseCreateTable(createTable);
	    parsedTable.table = this.alteredName;

	    parsedTable.columns = parsedTable.columns.map((column) => {
	      const newColumnInfo = columns.find((c) => isEqualId(c.name, column.name));

	      if (newColumnInfo) {
	        column.type = newColumnInfo.type;

	        column.constraints.default =
	          newColumnInfo.defaultTo !== null
	            ? {
	                name: null,
	                value: newColumnInfo.defaultTo,
	                expression: false,
	              }
	            : null;

	        column.constraints.notnull = newColumnInfo.notNull
	          ? { name: null, conflict: null }
	          : null;

	        column.constraints.null = newColumnInfo.notNull
	          ? null
	          : column.constraints.null;
	      }

	      return column;
	    });

	    const newTable = compileCreateTable(parsedTable, this.wrap);

	    return this.generateAlterCommands(newTable, createIndices);
	  }

	  async dropColumn(columns) {
	    const { createTable, createIndices } = await this.getTableSql();

	    const parsedTable = parseCreateTable(createTable);
	    parsedTable.table = this.alteredName;

	    parsedTable.columns = parsedTable.columns.filter(
	      (parsedColumn) =>
	        parsedColumn.expression || !includesId(columns, parsedColumn.name)
	    );

	    if (parsedTable.columns.length === 0) {
	      throw new Error('Unable to drop last column from table');
	    }

	    parsedTable.constraints = parsedTable.constraints.filter((constraint) => {
	      if (constraint.type === 'PRIMARY KEY' || constraint.type === 'UNIQUE') {
	        return constraint.columns.every(
	          (constraintColumn) =>
	            constraintColumn.expression ||
	            !includesId(columns, constraintColumn.name)
	        );
	      } else if (constraint.type === 'FOREIGN KEY') {
	        return (
	          constraint.columns.every(
	            (constraintColumnName) => !includesId(columns, constraintColumnName)
	          ) &&
	          (constraint.references.table !== parsedTable.table ||
	            constraint.references.columns.every(
	              (referenceColumnName) => !includesId(columns, referenceColumnName)
	            ))
	        );
	      } else {
	        return true;
	      }
	    });

	    const newColumns = parsedTable.columns.map((column) => column.name);

	    const newTable = compileCreateTable(parsedTable, this.wrap);

	    const newIndices = [];
	    for (const createIndex of createIndices) {
	      const parsedIndex = parseCreateIndex(createIndex);

	      parsedIndex.columns = parsedIndex.columns.filter(
	        (parsedColumn) =>
	          parsedColumn.expression || !includesId(columns, parsedColumn.name)
	      );

	      if (parsedIndex.columns.length > 0) {
	        newIndices.push(compileCreateIndex(parsedIndex, this.wrap));
	      }
	    }

	    return this.alter(newTable, newIndices, newColumns);
	  }

	  async dropForeign(columns, foreignKeyName) {
	    const { createTable, createIndices } = await this.getTableSql();

	    const parsedTable = parseCreateTable(createTable);
	    parsedTable.table = this.alteredName;

	    if (!foreignKeyName) {
	      parsedTable.columns = parsedTable.columns.map((column) => ({
	        ...column,
	        references: includesId(columns, column.name) ? null : column.references,
	      }));
	    }

	    parsedTable.constraints = parsedTable.constraints.filter((constraint) => {
	      if (constraint.type === 'FOREIGN KEY') {
	        if (foreignKeyName) {
	          return (
	            !constraint.name || !isEqualId(constraint.name, foreignKeyName)
	          );
	        }

	        return constraint.columns.every(
	          (constraintColumnName) => !includesId(columns, constraintColumnName)
	        );
	      } else {
	        return true;
	      }
	    });

	    const newTable = compileCreateTable(parsedTable, this.wrap);

	    return this.alter(newTable, createIndices);
	  }

	  async dropPrimary(constraintName) {
	    const { createTable, createIndices } = await this.getTableSql();

	    const parsedTable = parseCreateTable(createTable);
	    parsedTable.table = this.alteredName;

	    parsedTable.columns = parsedTable.columns.map((column) => ({
	      ...column,
	      primary: null,
	    }));

	    parsedTable.constraints = parsedTable.constraints.filter((constraint) => {
	      if (constraint.type === 'PRIMARY KEY') {
	        if (constraintName) {
	          return (
	            !constraint.name || !isEqualId(constraint.name, constraintName)
	          );
	        } else {
	          return false;
	        }
	      } else {
	        return true;
	      }
	    });

	    const newTable = compileCreateTable(parsedTable, this.wrap);

	    return this.alter(newTable, createIndices);
	  }

	  async primary(columns, constraintName) {
	    const { createTable, createIndices } = await this.getTableSql();

	    const parsedTable = parseCreateTable(createTable);
	    parsedTable.table = this.alteredName;

	    parsedTable.columns = parsedTable.columns.map((column) => ({
	      ...column,
	      primary: null,
	    }));

	    parsedTable.constraints = parsedTable.constraints.filter(
	      (constraint) => constraint.type !== 'PRIMARY KEY'
	    );

	    parsedTable.constraints.push({
	      type: 'PRIMARY KEY',
	      name: constraintName || null,
	      columns: columns.map((column) => ({
	        name: column,
	        expression: false,
	        collation: null,
	        order: null,
	      })),
	      conflict: null,
	    });

	    const newTable = compileCreateTable(parsedTable, this.wrap);

	    return this.alter(newTable, createIndices);
	  }

	  async foreign(foreignInfo) {
	    const { createTable, createIndices } = await this.getTableSql();

	    const parsedTable = parseCreateTable(createTable);
	    parsedTable.table = this.alteredName;

	    parsedTable.constraints.push({
	      type: 'FOREIGN KEY',
	      name: foreignInfo.keyName || null,
	      columns: foreignInfo.column,
	      references: {
	        table: foreignInfo.inTable,
	        columns: foreignInfo.references,
	        delete: foreignInfo.onDelete || null,
	        update: foreignInfo.onUpdate || null,
	        match: null,
	        deferrable: null,
	      },
	    });

	    const newTable = compileCreateTable(parsedTable, this.wrap);

	    return this.generateAlterCommands(newTable, createIndices);
	  }

	  async setNullable(column, isNullable) {
	    const { createTable, createIndices } = await this.getTableSql();

	    const parsedTable = parseCreateTable(createTable);
	    parsedTable.table = this.alteredName;

	    const parsedColumn = parsedTable.columns.find((c) =>
	      isEqualId(column, c.name)
	    );

	    if (!parsedColumn) {
	      throw new Error(
	        `.setNullable: Column ${column} does not exist in table ${this.tableName()}.`
	      );
	    }

	    parsedColumn.constraints.notnull = isNullable
	      ? null
	      : { name: null, conflict: null };

	    parsedColumn.constraints.null = isNullable
	      ? parsedColumn.constraints.null
	      : null;

	    const newTable = compileCreateTable(parsedTable, this.wrap);

	    return this.generateAlterCommands(newTable, createIndices);
	  }

	  async alter(newSql, createIndices, columns) {
	    const wasForeignCheckEnabled = await this.isForeignCheckEnabled();

	    if (wasForeignCheckEnabled) {
	      await this.setForeignCheck(false);
	    }

	    try {
	      await this.client.transaction(
	        async (trx) => {
	          await trx.raw(newSql);
	          await this.copyData(trx, columns);
	          await this.dropOriginal(trx);
	          await this.renameTable(trx);

	          for (const createIndex of createIndices) {
	            await trx.raw(createIndex);
	          }

	          if (wasForeignCheckEnabled) {
	            const foreignViolations = await trx.raw(executeForeignCheck());

	            if (foreignViolations.length > 0) {
	              throw new Error('FOREIGN KEY constraint failed');
	            }
	          }
	        },
	        { connection: this.connection }
	      );
	    } finally {
	      if (wasForeignCheckEnabled) {
	        await this.setForeignCheck(true);
	      }
	    }
	  }

	  async generateAlterCommands(newSql, createIndices, columns) {
	    const sql = [];
	    const pre = [];
	    const post = [];
	    let check = null;

	    sql.push(newSql);
	    sql.push(copyData(this.tableName(), this.alteredName, columns));
	    sql.push(dropOriginal(this.tableName()));
	    sql.push(renameTable(this.alteredName, this.tableName()));

	    for (const createIndex of createIndices) {
	      sql.push(createIndex);
	    }

	    const isForeignCheckEnabled = await this.isForeignCheckEnabled();

	    if (isForeignCheckEnabled) {
	      pre.push(setForeignCheck(false));
	      post.push(setForeignCheck(true));

	      check = executeForeignCheck();
	    }

	    return { pre, sql, check, post };
	  }
	}

	ddl = SQLite3_DDL;
	return ddl;
}

var sqliteQuerybuilder;
var hasRequiredSqliteQuerybuilder;

function requireSqliteQuerybuilder () {
	if (hasRequiredSqliteQuerybuilder) return sqliteQuerybuilder;
	hasRequiredSqliteQuerybuilder = 1;
	const QueryBuilder = querybuilder;

	sqliteQuerybuilder = class QueryBuilder_SQLite3 extends QueryBuilder {
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
	return sqliteQuerybuilder;
}

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: _nodeResolve_empty
});

var require$$9 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

var sqlite3;
var hasRequiredSqlite3;

function requireSqlite3 () {
	if (hasRequiredSqlite3) return sqlite3;
	hasRequiredSqlite3 = 1;
	// SQLite3
	// -------
	const defaults = defaults_1;
	const map = map_1;
	const { promisify } = util;

	const Client = client;

	const Raw = raw;
	const Transaction = requireSqliteTransaction();
	const SqliteQueryCompiler = requireSqliteQuerycompiler();
	const SchemaCompiler = requireSqliteCompiler();
	const ColumnCompiler = requireSqliteColumncompiler();
	const TableCompiler = requireSqliteTablecompiler();
	const ViewCompiler = requireSqliteViewcompiler();
	const SQLite3_DDL = requireDdl();
	const Formatter = formatter;
	const QueryBuilder = requireSqliteQuerybuilder();

	class Client_SQLite3 extends Client {
	  constructor(config) {
	    super(config);

	    if (config.connection && config.connection.filename === undefined) {
	      this.logger.warn(
	        'Could not find `connection.filename` in config. Please specify ' +
	          'the database path and name to avoid errors. ' +
	          '(see docs https://knexjs.org/guide/#configuration-options)'
	      );
	    }

	    if (config.useNullAsDefault === undefined) {
	      this.logger.warn(
	        'sqlite does not support inserting default values. Set the ' +
	          '`useNullAsDefault` flag to hide this warning. ' +
	          '(see docs https://knexjs.org/guide/query-builder.html#insert).'
	      );
	    }
	  }

	  _driver() {
	    return require$$9;
	  }

	  schemaCompiler() {
	    return new SchemaCompiler(this, ...arguments);
	  }

	  transaction() {
	    return new Transaction(this, ...arguments);
	  }

	  queryCompiler(builder, formatter) {
	    return new SqliteQueryCompiler(this, builder, formatter);
	  }

	  queryBuilder() {
	    return new QueryBuilder(this);
	  }

	  viewCompiler(builder, formatter) {
	    return new ViewCompiler(this, builder, formatter);
	  }

	  columnCompiler() {
	    return new ColumnCompiler(this, ...arguments);
	  }

	  tableCompiler() {
	    return new TableCompiler(this, ...arguments);
	  }

	  ddl(compiler, pragma, connection) {
	    return new SQLite3_DDL(this, compiler, pragma, connection);
	  }

	  wrapIdentifierImpl(value) {
	    return value !== '*' ? `\`${value.replace(/`/g, '``')}\`` : '*';
	  }

	  // Get a raw connection from the database, returning a promise with the connection object.
	  acquireRawConnection() {
	    return new Promise((resolve, reject) => {
	      // the default mode for sqlite3
	      let flags = this.driver.OPEN_READWRITE | this.driver.OPEN_CREATE;

	      if (this.connectionSettings.flags) {
	        if (!Array.isArray(this.connectionSettings.flags)) {
	          throw new Error(`flags must be an array of strings`);
	        }
	        this.connectionSettings.flags.forEach((_flag) => {
	          if (!_flag.startsWith('OPEN_') || !this.driver[_flag]) {
	            throw new Error(`flag ${_flag} not supported by node-sqlite3`);
	          }
	          flags = flags | this.driver[_flag];
	        });
	      }

	      const db = new this.driver.Database(
	        this.connectionSettings.filename,
	        flags,
	        (err) => {
	          if (err) {
	            return reject(err);
	          }
	          resolve(db);
	        }
	      );
	    });
	  }

	  // Used to explicitly close a connection, called internally by the pool when
	  // a connection times out or the pool is shutdown.
	  async destroyRawConnection(connection) {
	    const close = promisify((cb) => connection.close(cb));
	    return close();
	  }

	  // Runs the query on the specified connection, providing the bindings and any
	  // other necessary prep work.
	  _query(connection, obj) {
	    if (!obj.sql) throw new Error('The query is empty');

	    const { method } = obj;
	    let callMethod;
	    switch (method) {
	      case 'insert':
	      case 'update':
	        callMethod = obj.returning ? 'all' : 'run';
	        break;
	      case 'counter':
	      case 'del':
	        callMethod = 'run';
	        break;
	      default:
	        callMethod = 'all';
	    }
	    return new Promise(function (resolver, rejecter) {
	      if (!connection || !connection[callMethod]) {
	        return rejecter(
	          new Error(`Error calling ${callMethod} on connection.`)
	        );
	      }
	      connection[callMethod](obj.sql, obj.bindings, function (err, response) {
	        if (err) return rejecter(err);
	        obj.response = response;

	        // We need the context here, as it contains
	        // the "this.lastID" or "this.changes"
	        obj.context = this;

	        return resolver(obj);
	      });
	    });
	  }

	  _stream(connection, obj, stream) {
	    if (!obj.sql) throw new Error('The query is empty');

	    const client = this;
	    return new Promise(function (resolver, rejecter) {
	      stream.on('error', rejecter);
	      stream.on('end', resolver);

	      return client
	        ._query(connection, obj)
	        .then((obj) => obj.response)
	        .then((rows) => rows.forEach((row) => stream.write(row)))
	        .catch(function (err) {
	          stream.emit('error', err);
	        })
	        .then(function () {
	          stream.end();
	        });
	    });
	  }

	  // Ensures the response is returned in the same format as other clients.
	  processResponse(obj, runner) {
	    const ctx = obj.context;
	    const { response, returning } = obj;
	    if (obj.output) return obj.output.call(runner, response);
	    switch (obj.method) {
	      case 'select':
	        return response;
	      case 'first':
	        return response[0];
	      case 'pluck':
	        return map(response, obj.pluck);
	      case 'insert': {
	        if (returning) {
	          if (response) {
	            return response;
	          }
	        }
	        return [ctx.lastID];
	      }
	      case 'update': {
	        if (returning) {
	          if (response) {
	            return response;
	          }
	        }
	        return ctx.changes;
	      }
	      case 'del':
	      case 'counter':
	        return ctx.changes;
	      default: {
	        return response;
	      }
	    }
	  }

	  poolDefaults() {
	    return defaults({ min: 1, max: 1 }, super.poolDefaults());
	  }

	  formatter(builder) {
	    return new Formatter(this, builder);
	  }

	  values(values, builder, formatter) {
	    if (Array.isArray(values)) {
	      if (Array.isArray(values[0])) {
	        return `( values ${values
	          .map(
	            (value) =>
	              `(${this.parameterize(value, undefined, builder, formatter)})`
	          )
	          .join(', ')})`;
	      }
	      return `(${this.parameterize(values, undefined, builder, formatter)})`;
	    }

	    if (values instanceof Raw) {
	      return `(${this.parameter(values, builder, formatter)})`;
	    }

	    return this.parameter(values, builder, formatter);
	  }
	}

	Object.assign(Client_SQLite3.prototype, {
	  dialect: 'sqlite3',

	  driverName: 'sqlite3',
	});

	sqlite3 = Client_SQLite3;
	return sqlite3;
}

var betterSqlite3;
var hasRequiredBetterSqlite3;

function requireBetterSqlite3 () {
	if (hasRequiredBetterSqlite3) return betterSqlite3;
	hasRequiredBetterSqlite3 = 1;
	// better-sqlite3 Client
	// -------
	const Client_SQLite3 = requireSqlite3();

	class Client_BetterSQLite3 extends Client_SQLite3 {
	  _driver() {
	    return require$$9;
	  }

	  // Get a raw connection from the database, returning a promise with the connection object.
	  async acquireRawConnection() {
	    const options = this.connectionSettings.options || {};

	    return new this.driver(this.connectionSettings.filename, {
	      nativeBinding: options.nativeBinding,
	      readonly: !!options.readonly,
	    });
	  }

	  // Used to explicitly close a connection, called internally by the pool when
	  // a connection times out or the pool is shutdown.
	  async destroyRawConnection(connection) {
	    return connection.close();
	  }

	  // Runs the query on the specified connection, providing the bindings and any
	  // other necessary prep work.
	  async _query(connection, obj) {
	    if (!obj.sql) throw new Error('The query is empty');

	    if (!connection) {
	      throw new Error('No connection provided');
	    }

	    const statement = connection.prepare(obj.sql);
	    const bindings = this._formatBindings(obj.bindings);

	    if (statement.reader) {
	      const response = await statement.all(bindings);
	      obj.response = response;
	      return obj;
	    }

	    const response = await statement.run(bindings);
	    obj.response = response;
	    obj.context = {
	      lastID: response.lastInsertRowid,
	      changes: response.changes,
	    };

	    return obj;
	  }

	  _formatBindings(bindings) {
	    if (!bindings) {
	      return [];
	    }
	    return bindings.map((binding) => {
	      if (binding instanceof Date) {
	        return binding.valueOf();
	      }

	      if (typeof binding === 'boolean') {
	        return Number(binding);
	      }

	      return binding;
	    });
	  }
	}

	Object.assign(Client_BetterSQLite3.prototype, {
	  // The "dialect", for reference .
	  driverName: 'better-sqlite3',
	});

	betterSqlite3 = Client_BetterSQLite3;
	return betterSqlite3;
}

var pgTransaction;
var hasRequiredPgTransaction;

function requirePgTransaction () {
	if (hasRequiredPgTransaction) return pgTransaction;
	hasRequiredPgTransaction = 1;
	const Transaction = transaction$5;

	class Transaction_PG extends Transaction {
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

	pgTransaction = Transaction_PG;
	return pgTransaction;
}

var pgQuerycompiler;
var hasRequiredPgQuerycompiler;

function requirePgQuerycompiler () {
	if (hasRequiredPgQuerycompiler) return pgQuerycompiler;
	hasRequiredPgQuerycompiler = 1;
	// PostgreSQL Query Builder & Compiler
	// ------
	const identity = identity_1;
	const reduce = reduce_1;

	const QueryCompiler = querycompiler;
	const {
	  wrapString,
	  columnize: columnize_,
	  operator: operator_,
	  wrap: wrap_,
	} = wrappingFormatter;

	class QueryCompiler_PG extends QueryCompiler {
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

	pgQuerycompiler = QueryCompiler_PG;
	return pgQuerycompiler;
}

var pgQuerybuilder;
var hasRequiredPgQuerybuilder;

function requirePgQuerybuilder () {
	if (hasRequiredPgQuerybuilder) return pgQuerybuilder;
	hasRequiredPgQuerybuilder = 1;
	const QueryBuilder = querybuilder;

	pgQuerybuilder = class QueryBuilder_PostgreSQL extends QueryBuilder {
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
	return pgQuerybuilder;
}

var pgColumncompiler;
var hasRequiredPgColumncompiler;

function requirePgColumncompiler () {
	if (hasRequiredPgColumncompiler) return pgColumncompiler;
	hasRequiredPgColumncompiler = 1;
	// PostgreSQL Column Compiler
	// -------

	const ColumnCompiler = columncompiler;
	const { isObject } = is;
	const { toNumber } = helpers$7;
	const commentEscapeRegex = /(?<!')'(?!')/g;

	class ColumnCompiler_PG extends ColumnCompiler {
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
	    if (isObject(withoutTz)) {
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

	pgColumncompiler = ColumnCompiler_PG;
	return pgColumncompiler;
}

/* eslint max-len: 0 */

var pgTablecompiler;
var hasRequiredPgTablecompiler;

function requirePgTablecompiler () {
	if (hasRequiredPgTablecompiler) return pgTablecompiler;
	hasRequiredPgTablecompiler = 1;
	// PostgreSQL Table Builder & Compiler
	// -------

	const has = has_1;
	const TableCompiler = tablecompiler;
	const { isObject, isString } = is;

	class TableCompiler_PG extends TableCompiler {
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

	    if (isString(options)) {
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

	pgTablecompiler = TableCompiler_PG;
	return pgTablecompiler;
}

/* eslint max-len: 0 */

var pgViewcompiler;
var hasRequiredPgViewcompiler;

function requirePgViewcompiler () {
	if (hasRequiredPgViewcompiler) return pgViewcompiler;
	hasRequiredPgViewcompiler = 1;
	const ViewCompiler = viewcompiler;

	class ViewCompiler_PG extends ViewCompiler {
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

	pgViewcompiler = ViewCompiler_PG;
	return pgViewcompiler;
}

var pgViewbuilder;
var hasRequiredPgViewbuilder;

function requirePgViewbuilder () {
	if (hasRequiredPgViewbuilder) return pgViewbuilder;
	hasRequiredPgViewbuilder = 1;
	const ViewBuilder = viewbuilder;

	class ViewBuilder_PG extends ViewBuilder {
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

	pgViewbuilder = ViewBuilder_PG;
	return pgViewbuilder;
}

var pgCompiler;
var hasRequiredPgCompiler;

function requirePgCompiler () {
	if (hasRequiredPgCompiler) return pgCompiler;
	hasRequiredPgCompiler = 1;
	// PostgreSQL Schema Compiler
	// -------

	const SchemaCompiler = compiler$1;

	class SchemaCompiler_PG extends SchemaCompiler {
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

	pgCompiler = SchemaCompiler_PG;
	return pgCompiler;
}

var postgres;
var hasRequiredPostgres;

function requirePostgres () {
	if (hasRequiredPostgres) return postgres;
	hasRequiredPostgres = 1;
	// PostgreSQL
	// -------
	const extend = extend$3;
	const map = map_1;
	const { promisify } = util;
	const Client = client;

	const Transaction = requirePgTransaction();
	const QueryCompiler = requirePgQuerycompiler();
	const QueryBuilder = requirePgQuerybuilder();
	const ColumnCompiler = requirePgColumncompiler();
	const TableCompiler = requirePgTablecompiler();
	const ViewCompiler = requirePgViewcompiler();
	const ViewBuilder = requirePgViewbuilder();
	const SchemaCompiler = requirePgCompiler();
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
	    return require$$9;
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
	      : require$$9;
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

	postgres = Client_PG;
	return postgres;
}

var crdbQuerycompiler;
var hasRequiredCrdbQuerycompiler;

function requireCrdbQuerycompiler () {
	if (hasRequiredCrdbQuerycompiler) return crdbQuerycompiler;
	hasRequiredCrdbQuerycompiler = 1;
	const QueryCompiler_PG = requirePgQuerycompiler();
	const {
	  columnize: columnize_,
	  wrap: wrap_,
	  operator: operator_,
	} = wrappingFormatter;

	class QueryCompiler_CRDB extends QueryCompiler_PG {
	  truncate() {
	    return `truncate ${this.tableName}`;
	  }

	  upsert() {
	    let sql = this._upsert();
	    if (sql === '') return sql;
	    const { returning } = this.single;
	    if (returning) sql += this._returning(returning);
	    return {
	      sql: sql,
	      returning,
	    };
	  }

	  _upsert() {
	    const upsertValues = this.single.upsert || [];
	    const sql = this.with() + `upsert into ${this.tableName} `;
	    const body = this._insertBody(upsertValues);
	    return body === '' ? '' : sql + body;
	  }

	  _groupOrder(item, type) {
	    // CockroachDB don't support PostgreSQL order nulls first/last syntax, we take the generic one.
	    return this._basicGroupOrder(item, type);
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
	    return `json_extract_path(${this._columnClause(
	      statement
	    )}, ${this.client.toArrayPathFromJsonPath(
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

	  // Json common functions
	  _jsonExtract(nameFunction, params) {
	    let extractions;
	    if (Array.isArray(params.column)) {
	      extractions = params.column;
	    } else {
	      extractions = [params];
	    }
	    return extractions
	      .map((extraction) => {
	        const jsonCol = `json_extract_path(${columnize_(
	          extraction.column || extraction[0],
	          this.builder,
	          this.client,
	          this.bindingsHolder
	        )}, ${this.client.toArrayPathFromJsonPath(
	          extraction.path || extraction[1],
	          this.builder,
	          this.bindingsHolder
	        )})`;
	        const alias = extraction.alias || extraction[2];
	        return alias
	          ? this.client.alias(jsonCol, this.formatter.wrap(alias))
	          : jsonCol;
	      })
	      .join(', ');
	  }

	  _onJsonPathEquals(nameJoinFunction, clause) {
	    return (
	      'json_extract_path(' +
	      wrap_(
	        clause.columnFirst,
	        undefined,
	        this.builder,
	        this.client,
	        this.bindingsHolder
	      ) +
	      ', ' +
	      this.client.toArrayPathFromJsonPath(
	        clause.jsonPathFirst,
	        this.builder,
	        this.bindingsHolder
	      ) +
	      ') = json_extract_path(' +
	      wrap_(
	        clause.columnSecond,
	        undefined,
	        this.builder,
	        this.client,
	        this.bindingsHolder
	      ) +
	      ', ' +
	      this.client.toArrayPathFromJsonPath(
	        clause.jsonPathSecond,
	        this.builder,
	        this.bindingsHolder
	      ) +
	      ')'
	    );
	  }
	}

	crdbQuerycompiler = QueryCompiler_CRDB;
	return crdbQuerycompiler;
}

var crdbColumncompiler;
var hasRequiredCrdbColumncompiler;

function requireCrdbColumncompiler () {
	if (hasRequiredCrdbColumncompiler) return crdbColumncompiler;
	hasRequiredCrdbColumncompiler = 1;
	const ColumnCompiler_PG = requirePgColumncompiler();

	class ColumnCompiler_CRDB extends ColumnCompiler_PG {
	  uuid(options = { primaryKey: false }) {
	    return (
	      'uuid' +
	      (this.tableCompiler._canBeAddPrimaryKey(options)
	        ? ' primary key default gen_random_uuid()'
	        : '')
	    );
	  }
	}

	crdbColumncompiler = ColumnCompiler_CRDB;
	return crdbColumncompiler;
}

/* eslint max-len: 0 */

var crdbTablecompiler;
var hasRequiredCrdbTablecompiler;

function requireCrdbTablecompiler () {
	if (hasRequiredCrdbTablecompiler) return crdbTablecompiler;
	hasRequiredCrdbTablecompiler = 1;
	const TableCompiler = requirePgTablecompiler();

	class TableCompiler_CRDB extends TableCompiler {
	  constructor(client, tableBuilder) {
	    super(client, tableBuilder);
	  }

	  addColumns(columns, prefix, colCompilers) {
	    if (prefix === this.alterColumnsPrefix) {
	      // alter columns
	      for (const col of colCompilers) {
	        this.client.logger.warn(
	          'Experimental alter column in use, see issue: https://github.com/cockroachdb/cockroach/issues/49329'
	        );
	        this.pushQuery({
	          sql: 'SET enable_experimental_alter_column_type_general = true',
	          bindings: [],
	        });
	        super._addColumn(col);
	      }
	    } else {
	      // base class implementation for normal add
	      super.addColumns(columns, prefix);
	    }
	  }

	  dropUnique(columns, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('unique', this.tableNameRaw, columns);
	    this.pushQuery(`drop index ${this.tableName()}@${indexName} cascade `);
	  }
	}

	crdbTablecompiler = TableCompiler_CRDB;
	return crdbTablecompiler;
}

var crdbViewcompiler;
var hasRequiredCrdbViewcompiler;

function requireCrdbViewcompiler () {
	if (hasRequiredCrdbViewcompiler) return crdbViewcompiler;
	hasRequiredCrdbViewcompiler = 1;
	const ViewCompiler_PG = requirePgViewcompiler();

	class ViewCompiler_CRDB extends ViewCompiler_PG {
	  renameColumn(from, to) {
	    throw new Error('rename column of views is not supported by this dialect.');
	  }

	  defaultTo(column, defaultValue) {
	    throw new Error(
	      'change default values of views is not supported by this dialect.'
	    );
	  }
	}

	crdbViewcompiler = ViewCompiler_CRDB;
	return crdbViewcompiler;
}

var crdbQuerybuilder;
var hasRequiredCrdbQuerybuilder;

function requireCrdbQuerybuilder () {
	if (hasRequiredCrdbQuerybuilder) return crdbQuerybuilder;
	hasRequiredCrdbQuerybuilder = 1;
	const QueryBuilder = querybuilder;
	const isEmpty = isEmpty_1;

	crdbQuerybuilder = class QueryBuilder_CockroachDB extends QueryBuilder {
	  upsert(values, returning, options) {
	    this._method = 'upsert';
	    if (!isEmpty(returning)) this.returning(returning, options);
	    this._single.upsert = values;
	    return this;
	  }
	};
	return crdbQuerybuilder;
}

var cockroachdb;
var hasRequiredCockroachdb;

function requireCockroachdb () {
	if (hasRequiredCockroachdb) return cockroachdb;
	hasRequiredCockroachdb = 1;
	// CockroachDB Client
	// -------
	const Client_PostgreSQL = requirePostgres();
	const Transaction = requirePgTransaction();
	const QueryCompiler = requireCrdbQuerycompiler();
	const ColumnCompiler = requireCrdbColumncompiler();
	const TableCompiler = requireCrdbTablecompiler();
	const ViewCompiler = requireCrdbViewcompiler();
	const QueryBuilder = requireCrdbQuerybuilder();

	// Always initialize with the "QueryBuilder" and "QueryCompiler"
	// objects, which extend the base 'lib/query/builder' and
	// 'lib/query/compiler', respectively.
	class Client_CockroachDB extends Client_PostgreSQL {
	  transaction() {
	    return new Transaction(this, ...arguments);
	  }

	  queryCompiler(builder, formatter) {
	    return new QueryCompiler(this, builder, formatter);
	  }

	  columnCompiler() {
	    return new ColumnCompiler(this, ...arguments);
	  }

	  tableCompiler() {
	    return new TableCompiler(this, ...arguments);
	  }

	  viewCompiler() {
	    return new ViewCompiler(this, ...arguments);
	  }

	  queryBuilder() {
	    return new QueryBuilder(this);
	  }

	  _parseVersion(versionString) {
	    return versionString.split(' ')[2];
	  }

	  async cancelQuery(connectionToKill) {
	    try {
	      return await this._wrappedCancelQueryCall(null, connectionToKill);
	    } catch (err) {
	      this.logger.warn(`Connection Error: ${err}`);
	      throw err;
	    }
	  }

	  _wrappedCancelQueryCall(emptyConnection, connectionToKill) {
	    // FixMe https://github.com/cockroachdb/cockroach/issues/41335
	    if (
	      connectionToKill.activeQuery.processID === 0 &&
	      connectionToKill.activeQuery.secretKey === 0
	    ) {
	      return;
	    }

	    return connectionToKill.cancel(
	      connectionToKill,
	      connectionToKill.activeQuery
	    );
	  }

	  toArrayPathFromJsonPath(jsonPath, builder, bindingsHolder) {
	    return jsonPath
	      .replace(/^(\$\.)/, '') // remove the first dollar
	      .replace(/\[([0-9]+)]/, '.$1')
	      .split('.')
	      .map(
	        function (v) {
	          return this.parameter(v, builder, bindingsHolder);
	        }.bind(this)
	      )
	      .join(', ');
	  }
	}

	Object.assign(Client_CockroachDB.prototype, {
	  // The "dialect", for reference elsewhere.
	  driverName: 'cockroachdb',
	});

	cockroachdb = Client_CockroachDB;
	return cockroachdb;
}

/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * _.isNil(null);
 * // => true
 *
 * _.isNil(void 0);
 * // => true
 *
 * _.isNil(NaN);
 * // => false
 */

var isNil_1;
var hasRequiredIsNil;

function requireIsNil () {
	if (hasRequiredIsNil) return isNil_1;
	hasRequiredIsNil = 1;
	function isNil(value) {
	  return value == null;
	}

	isNil_1 = isNil;
	return isNil_1;
}

var mssqlFormatter;
var hasRequiredMssqlFormatter;

function requireMssqlFormatter () {
	if (hasRequiredMssqlFormatter) return mssqlFormatter;
	hasRequiredMssqlFormatter = 1;
	const Formatter = formatter;

	class MSSQL_Formatter extends Formatter {
	  // Accepts a string or array of columns to wrap as appropriate.
	  columnizeWithPrefix(prefix, target) {
	    const columns = typeof target === 'string' ? [target] : target;
	    let str = '',
	      i = -1;
	    while (++i < columns.length) {
	      if (i > 0) str += ', ';
	      str += prefix + this.wrap(columns[i]);
	    }
	    return str;
	  }

	  /**
	   * Returns its argument with single quotes escaped, so it can be included into a single-quoted string.
	   *
	   * For example, it converts "has'quote" to "has''quote".
	   *
	   * This assumes QUOTED_IDENTIFIER ON so it is only ' that need escaping,
	   * never ", because " cannot be used to quote a string when that's on;
	   * otherwise we'd need to be aware of whether the string is quoted with " or '.
	   *
	   * This assumption is consistent with the SQL Knex generates.
	   * @param {string} string
	   * @returns {string}
	   */
	  escapingStringDelimiters(string) {
	    return (string || '').replace(/'/g, "''");
	  }
	}

	mssqlFormatter = MSSQL_Formatter;
	return mssqlFormatter;
}

var transaction$4;
var hasRequiredTransaction$4;

function requireTransaction$4 () {
	if (hasRequiredTransaction$4) return transaction$4;
	hasRequiredTransaction$4 = 1;
	const Transaction = transaction$5;
	const debug = browserExports('knex:tx');

	class Transaction_MSSQL extends Transaction {
	  begin(/** @type {import('tedious').Connection} */ conn) {
	    debug('transaction::begin id=%s', this.txid);

	    return new Promise((resolve, reject) => {
	      conn.beginTransaction(
	        (err) => {
	          if (err) {
	            debug(
	              'transaction::begin error id=%s message=%s',
	              this.txid,
	              err.message
	            );
	            return reject(err);
	          }
	          resolve();
	        },
	        this.outerTx ? this.txid : undefined,
	        nameToIsolationLevelEnum(this.isolationLevel)
	      );
	    }).then(this._resolver, this._rejecter);
	  }

	  savepoint(conn) {
	    debug('transaction::savepoint id=%s', this.txid);

	    return new Promise((resolve, reject) => {
	      conn.saveTransaction(
	        (err) => {
	          if (err) {
	            debug(
	              'transaction::savepoint id=%s message=%s',
	              this.txid,
	              err.message
	            );
	            return reject(err);
	          }

	          this.trxClient.emit('query', {
	            __knexUid: this.trxClient.__knexUid,
	            __knexTxId: this.trxClient.__knexTxId,
	            autogenerated: true,
	            sql: this.outerTx
	              ? `SAVE TRANSACTION [${this.txid}]`
	              : `SAVE TRANSACTION`,
	          });
	          resolve();
	        },
	        this.outerTx ? this.txid : undefined
	      );
	    });
	  }

	  commit(conn, value) {
	    debug('transaction::commit id=%s', this.txid);

	    return new Promise((resolve, reject) => {
	      conn.commitTransaction(
	        (err) => {
	          if (err) {
	            debug(
	              'transaction::commit error id=%s message=%s',
	              this.txid,
	              err.message
	            );
	            return reject(err);
	          }

	          this._completed = true;
	          resolve(value);
	        },
	        this.outerTx ? this.txid : undefined
	      );
	    }).then(() => this._resolver(value), this._rejecter);
	  }

	  release(conn, value) {
	    return this._resolver(value);
	  }

	  rollback(conn, error) {
	    this._completed = true;
	    debug('transaction::rollback id=%s', this.txid);

	    return new Promise((_resolve, reject) => {
	      if (!conn.inTransaction) {
	        return reject(
	          error || new Error('Transaction rejected with non-error: undefined')
	        );
	      }

	      if (conn.state.name !== 'LoggedIn') {
	        return reject(
	          new Error(
	            "Can't rollback transaction. There is a request in progress"
	          )
	        );
	      }

	      conn.rollbackTransaction(
	        (err) => {
	          if (err) {
	            debug(
	              'transaction::rollback error id=%s message=%s',
	              this.txid,
	              err.message
	            );
	          }

	          reject(
	            err ||
	              error ||
	              new Error('Transaction rejected with non-error: undefined')
	          );
	        },
	        this.outerTx ? this.txid : undefined
	      );
	    }).catch((err) => {
	      if (!error && this.doNotRejectOnRollback) {
	        this._resolver();
	        return;
	      }
	      if (error) {
	        try {
	          err.originalError = error;
	        } catch (_err) {
	          // This is to handle https://github.com/knex/knex/issues/4128
	        }
	      }
	      this._rejecter(err);
	    });
	  }

	  rollbackTo(conn, error) {
	    return this.rollback(conn, error).then(
	      () =>
	        void this.trxClient.emit('query', {
	          __knexUid: this.trxClient.__knexUid,
	          __knexTxId: this.trxClient.__knexTxId,
	          autogenerated: true,
	          sql: `ROLLBACK TRANSACTION`,
	        })
	    );
	  }
	}

	transaction$4 = Transaction_MSSQL;

	function nameToIsolationLevelEnum(level) {
	  if (!level) return;
	  level = level.toUpperCase().replace(' ', '_');
	  const knownEnum = isolationEnum[level];
	  if (!knownEnum) {
	    throw new Error(
	      `Unknown Isolation level, was expecting one of: ${JSON.stringify(
	        humanReadableKeys
	      )}`
	    );
	  }
	  return knownEnum;
	}

	// Based on: https://github.com/tediousjs/node-mssql/blob/master/lib/isolationlevel.js
	const isolationEnum = {
	  READ_UNCOMMITTED: 0x01,
	  READ_COMMITTED: 0x02,
	  REPEATABLE_READ: 0x03,
	  SERIALIZABLE: 0x04,
	  SNAPSHOT: 0x05,
	};
	const humanReadableKeys = Object.keys(isolationEnum).map((key) =>
	  key.toLowerCase().replace('_', ' ')
	);
	return transaction$4;
}

var mssqlQuerycompiler;
var hasRequiredMssqlQuerycompiler;

function requireMssqlQuerycompiler () {
	if (hasRequiredMssqlQuerycompiler) return mssqlQuerycompiler;
	hasRequiredMssqlQuerycompiler = 1;
	// MSSQL Query Compiler
	// ------
	const QueryCompiler = querycompiler;

	const compact = compact_1;
	const identity = identity_1;
	const isEmpty = isEmpty_1;
	const Raw = raw;
	const {
	  columnize: columnize_,
	} = wrappingFormatter;

	const components = [
	  'comments',
	  'columns',
	  'join',
	  'lock',
	  'where',
	  'union',
	  'group',
	  'having',
	  'order',
	  'limit',
	  'offset',
	];

	class QueryCompiler_MSSQL extends QueryCompiler {
	  constructor(client, builder, formatter) {
	    super(client, builder, formatter);

	    const { onConflict } = this.single;
	    if (onConflict) {
	      throw new Error('.onConflict() is not supported for mssql.');
	    }

	    this._emptyInsertValue = 'default values';
	  }

	  with() {
	    // WITH RECURSIVE is a syntax error:
	    // SQL Server does not syntactically distinguish recursive and non-recursive CTEs.
	    // So mark all statements as non-recursive, generate the SQL, then restore.
	    // This approach ensures any changes in base class with() get propagated here.
	    const undoList = [];
	    if (this.grouped.with) {
	      for (const stmt of this.grouped.with) {
	        if (stmt.recursive) {
	          undoList.push(stmt);
	          stmt.recursive = false;
	        }
	      }
	    }

	    const result = super.with();

	    // Restore the recursive markings, in case this same query gets cloned and passed to other drivers.
	    for (const stmt of undoList) {
	      stmt.recursive = true;
	    }
	    return result;
	  }

	  select() {
	    const sql = this.with();
	    const statements = components.map((component) => this[component](this));
	    return sql + compact(statements).join(' ');
	  }

	  //#region Insert
	  // Compiles an "insert" query, allowing for multiple
	  // inserts using a single query statement.
	  insert() {
	    if (
	      this.single.options &&
	      this.single.options.includeTriggerModifications
	    ) {
	      return this.insertWithTriggers();
	    } else {
	      return this.standardInsert();
	    }
	  }

	  insertWithTriggers() {
	    const insertValues = this.single.insert || [];
	    const { returning } = this.single;
	    let sql =
	      this.with() +
	      `${this._buildTempTable(returning)}insert into ${this.tableName} `;
	    const returningSql = returning
	      ? this._returning('insert', returning, true) + ' '
	      : '';

	    if (Array.isArray(insertValues)) {
	      if (insertValues.length === 0) {
	        return '';
	      }
	    } else if (typeof insertValues === 'object' && isEmpty(insertValues)) {
	      return {
	        sql:
	          sql +
	          returningSql +
	          this._emptyInsertValue +
	          this._buildReturningSelect(returning),
	        returning,
	      };
	    }
	    sql += this._buildInsertData(insertValues, returningSql);

	    if (returning) {
	      sql += this._buildReturningSelect(returning);
	    }

	    return {
	      sql,
	      returning,
	    };
	  }

	  _buildInsertData(insertValues, returningSql) {
	    let sql = '';
	    const insertData = this._prepInsert(insertValues);
	    if (typeof insertData === 'string') {
	      sql += insertData;
	    } else {
	      if (insertData.columns.length) {
	        sql += `(${this.formatter.columnize(insertData.columns)}`;
	        sql +=
	          `) ${returningSql}values (` +
	          this._buildInsertValues(insertData) +
	          ')';
	      } else if (insertValues.length === 1 && insertValues[0]) {
	        sql += returningSql + this._emptyInsertValue;
	      } else {
	        return '';
	      }
	    }
	    return sql;
	  }

	  standardInsert() {
	    const insertValues = this.single.insert || [];
	    let sql = this.with() + `insert into ${this.tableName} `;
	    const { returning } = this.single;
	    const returningSql = returning
	      ? this._returning('insert', returning) + ' '
	      : '';

	    if (Array.isArray(insertValues)) {
	      if (insertValues.length === 0) {
	        return '';
	      }
	    } else if (typeof insertValues === 'object' && isEmpty(insertValues)) {
	      return {
	        sql: sql + returningSql + this._emptyInsertValue,
	        returning,
	      };
	    }

	    sql += this._buildInsertData(insertValues, returningSql);

	    return {
	      sql,
	      returning,
	    };
	  }
	  //#endregion

	  //#region Update
	  // Compiles an `update` query, allowing for a return value.
	  update() {
	    if (
	      this.single.options &&
	      this.single.options.includeTriggerModifications
	    ) {
	      return this.updateWithTriggers();
	    } else {
	      return this.standardUpdate();
	    }
	  }

	  updateWithTriggers() {
	    const top = this.top();
	    const withSQL = this.with();
	    const updates = this._prepUpdate(this.single.update);
	    const join = this.join();
	    const where = this.where();
	    const order = this.order();
	    const { returning } = this.single;
	    const declaredTemp = this._buildTempTable(returning);
	    return {
	      sql:
	        withSQL +
	        declaredTemp +
	        `update ${top ? top + ' ' : ''}${this.tableName}` +
	        ' set ' +
	        updates.join(', ') +
	        (returning ? ` ${this._returning('update', returning, true)}` : '') +
	        (join ? ` from ${this.tableName} ${join}` : '') +
	        (where ? ` ${where}` : '') +
	        (order ? ` ${order}` : '') +
	        (!returning
	          ? this._returning('rowcount', '@@rowcount')
	          : this._buildReturningSelect(returning)),
	      returning: returning || '@@rowcount',
	    };
	  }

	  _formatGroupsItemValue(value, nulls) {
	    const column = super._formatGroupsItemValue(value);
	    // MSSQL dont support 'is null' syntax in order by,
	    // so we override this function and add MSSQL specific syntax.
	    if (nulls && !(value instanceof Raw)) {
	      const collNulls = `IIF(${column} is null,`;
	      if (nulls === 'first') {
	        return `${collNulls}0,1)`;
	      } else if (nulls === 'last') {
	        return `${collNulls}1,0)`;
	      }
	    }
	    return column;
	  }

	  standardUpdate() {
	    const top = this.top();
	    const withSQL = this.with();
	    const updates = this._prepUpdate(this.single.update);
	    const join = this.join();
	    const where = this.where();
	    const order = this.order();
	    const { returning } = this.single;
	    return {
	      sql:
	        withSQL +
	        `update ${top ? top + ' ' : ''}${this.tableName}` +
	        ' set ' +
	        updates.join(', ') +
	        (returning ? ` ${this._returning('update', returning)}` : '') +
	        (join ? ` from ${this.tableName} ${join}` : '') +
	        (where ? ` ${where}` : '') +
	        (order ? ` ${order}` : '') +
	        (!returning ? this._returning('rowcount', '@@rowcount') : ''),
	      returning: returning || '@@rowcount',
	    };
	  }
	  //#endregion

	  //#region Delete
	  // Compiles a `delete` query.
	  del() {
	    if (
	      this.single.options &&
	      this.single.options.includeTriggerModifications
	    ) {
	      return this.deleteWithTriggers();
	    } else {
	      return this.standardDelete();
	    }
	  }

	  deleteWithTriggers() {
	    // Make sure tableName is processed by the formatter first.
	    const withSQL = this.with();
	    const { tableName } = this;
	    const wheres = this.where();
	    const joins = this.join();
	    const { returning } = this.single;
	    const returningStr = returning
	      ? ` ${this._returning('del', returning, true)}`
	      : '';
	    const deleteSelector = joins ? `${tableName}${returningStr} ` : '';
	    return {
	      sql:
	        withSQL +
	        `${this._buildTempTable(
	          returning
	        )}delete ${deleteSelector}from ${tableName}` +
	        (!joins ? returningStr : '') +
	        (joins ? ` ${joins}` : '') +
	        (wheres ? ` ${wheres}` : '') +
	        (!returning
	          ? this._returning('rowcount', '@@rowcount')
	          : this._buildReturningSelect(returning)),
	      returning: returning || '@@rowcount',
	    };
	  }

	  standardDelete() {
	    // Make sure tableName is processed by the formatter first.
	    const withSQL = this.with();
	    const { tableName } = this;
	    const wheres = this.where();
	    const joins = this.join();
	    const { returning } = this.single;
	    const returningStr = returning
	      ? ` ${this._returning('del', returning)}`
	      : '';
	    // returning needs to be before "from" when using join
	    const deleteSelector = joins ? `${tableName}${returningStr} ` : '';
	    return {
	      sql:
	        withSQL +
	        `delete ${deleteSelector}from ${tableName}` +
	        (!joins ? returningStr : '') +
	        (joins ? ` ${joins}` : '') +
	        (wheres ? ` ${wheres}` : '') +
	        (!returning ? this._returning('rowcount', '@@rowcount') : ''),
	      returning: returning || '@@rowcount',
	    };
	  }
	  //#endregion

	  // Compiles the columns in the query, specifying if an item was distinct.
	  columns() {
	    let distinctClause = '';
	    if (this.onlyUnions()) return '';
	    const top = this.top();
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
	          sql.push(this.formatter.columnize(stmt.value));
	        }
	      }
	    }
	    if (sql.length === 0) sql = ['*'];
	    const select = this.onlyJson() ? '' : 'select ';
	    return (
	      `${select}${hints}${distinctClause}` +
	      (top ? top + ' ' : '') +
	      sql.join(', ') +
	      (this.tableName ? ` from ${this.tableName}` : '')
	    );
	  }

	  _returning(method, value, withTrigger) {
	    switch (method) {
	      case 'update':
	      case 'insert':
	        return value
	          ? `output ${this.formatter.columnizeWithPrefix('inserted.', value)}${
	              withTrigger ? ' into #out' : ''
	            }`
	          : '';
	      case 'del':
	        return value
	          ? `output ${this.formatter.columnizeWithPrefix('deleted.', value)}${
	              withTrigger ? ' into #out' : ''
	            }`
	          : '';
	      case 'rowcount':
	        return value ? ';select @@rowcount' : '';
	    }
	  }

	  _buildTempTable(values) {
	    // If value is nothing then return an empty string
	    if (values && values.length > 0) {
	      let selections = '';

	      // Build values that will be returned from this procedure
	      if (Array.isArray(values)) {
	        selections = values
	          .map((value) => `[t].${this.formatter.columnize(value)}`)
	          .join(',');
	      } else {
	        selections = `[t].${this.formatter.columnize(values)}`;
	      }

	      // Force #out to be correctly populated with the correct column structure.
	      let sql = `select top(0) ${selections} into #out `;
	      sql += `from ${this.tableName} as t `;
	      sql += `left join ${this.tableName} on 0=1;`;

	      return sql;
	    }

	    return '';
	  }

	  _buildReturningSelect(values) {
	    // If value is nothing then return an empty string
	    if (values && values.length > 0) {
	      let selections = '';

	      // Build columns to return
	      if (Array.isArray(values)) {
	        selections = values
	          .map((value) => `${this.formatter.columnize(value)}`)
	          .join(',');
	      } else {
	        selections = this.formatter.columnize(values);
	      }

	      // Get the returned values
	      let sql = `; select ${selections} from #out; `;
	      // Drop the temp table to prevent memory leaks
	      sql += `drop table #out;`;

	      return sql;
	    }

	    return '';
	  }

	  // Compiles a `truncate` query.
	  truncate() {
	    return `truncate table ${this.tableName}`;
	  }

	  forUpdate() {
	    // this doesn't work exacltly as it should, one should also mention index while locking
	    // https://stackoverflow.com/a/9818448/360060
	    return 'with (UPDLOCK)';
	  }

	  forShare() {
	    // http://www.sqlteam.com/article/introduction-to-locking-in-sql-server
	    return 'with (HOLDLOCK)';
	  }

	  // Compiles a `columnInfo` query.
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

	    // GOTCHA: INFORMATION_SCHEMA.COLUMNS must be capitalized to work when the database has a case-sensitive collation. [#4573]
	    let sql = `select [COLUMN_NAME], [COLUMN_DEFAULT], [DATA_TYPE], [CHARACTER_MAXIMUM_LENGTH], [IS_NULLABLE] from INFORMATION_SCHEMA.COLUMNS where table_name = ? and table_catalog = ?`;
	    const bindings = [table, this.client.database()];

	    if (schema) {
	      sql += ' and table_schema = ?';
	      bindings.push(schema);
	    } else {
	      sql += ` and table_schema = 'dbo'`;
	    }

	    return {
	      sql,
	      bindings: bindings,
	      output(resp) {
	        const out = resp.reduce((columns, val) => {
	          columns[val[0].value] = {
	            defaultValue: val[1].value,
	            type: val[2].value,
	            maxLength: val[3].value,
	            nullable: val[4].value === 'YES',
	          };
	          return columns;
	        }, {});
	        return (column && out[column]) || out;
	      },
	    };
	  }

	  top() {
	    const noLimit = !this.single.limit && this.single.limit !== 0;
	    const noOffset = !this.single.offset;
	    if (noLimit || !noOffset) return '';
	    return `top (${this._getValueOrParameterFromAttribute('limit')})`;
	  }

	  limit() {
	    return '';
	  }

	  offset() {
	    const noLimit = !this.single.limit && this.single.limit !== 0;
	    const noOffset = !this.single.offset;
	    if (noOffset) return '';
	    let offset = `offset ${
	      noOffset ? '0' : this._getValueOrParameterFromAttribute('offset')
	    } rows`;
	    if (!noLimit) {
	      offset += ` fetch next ${this._getValueOrParameterFromAttribute(
	        'limit'
	      )} rows only`;
	    }
	    return offset;
	  }

	  whereLike(statement) {
	    return `${this._columnClause(
	      statement
	    )} collate SQL_Latin1_General_CP1_CS_AS ${this._not(
	      statement,
	      'like '
	    )}${this._valueClause(statement)}`;
	  }

	  whereILike(statement) {
	    return `${this._columnClause(
	      statement
	    )} collate SQL_Latin1_General_CP1_CI_AS ${this._not(
	      statement,
	      'like '
	    )}${this._valueClause(statement)}`;
	  }

	  jsonExtract(params) {
	    // JSON_VALUE return NULL if we query object or array
	    // JSON_QUERY return NULL if we query literal/single value
	    return this._jsonExtract(
	      params.singleValue ? 'JSON_VALUE' : 'JSON_QUERY',
	      params
	    );
	  }

	  jsonSet(params) {
	    return this._jsonSet('JSON_MODIFY', params);
	  }

	  jsonInsert(params) {
	    return this._jsonSet('JSON_MODIFY', params);
	  }

	  jsonRemove(params) {
	    const jsonCol = `JSON_MODIFY(${columnize_(
	      params.column,
	      this.builder,
	      this.client,
	      this.bindingsHolder
	    )},${this.client.parameter(
	      params.path,
	      this.builder,
	      this.bindingsHolder
	    )}, NULL)`;
	    return params.alias
	      ? this.client.alias(jsonCol, this.formatter.wrap(params.alias))
	      : jsonCol;
	  }

	  whereJsonPath(statement) {
	    return this._whereJsonPath('JSON_VALUE', statement);
	  }

	  whereJsonSupersetOf(statement) {
	    throw new Error(
	      'Json superset where clause not actually supported by MSSQL'
	    );
	  }

	  whereJsonSubsetOf(statement) {
	    throw new Error('Json subset where clause not actually supported by MSSQL');
	  }

	  _getExtracts(statement, operator) {
	    const column = columnize_(
	      statement.column,
	      this.builder,
	      this.client,
	      this.bindingsHolder
	    );
	    return (
	      Array.isArray(statement.values) ? statement.values : [statement.values]
	    )
	      .map(function (value) {
	        return (
	          'JSON_VALUE(' +
	          column +
	          ',' +
	          this.client.parameter(value, this.builder, this.bindingsHolder) +
	          ')'
	        );
	      }, this)
	      .join(operator);
	  }

	  onJsonPathEquals(clause) {
	    return this._onJsonPathEquals('JSON_VALUE', clause);
	  }
	}

	// Set the QueryBuilder & QueryCompiler on the client object,
	// in case anyone wants to modify things to suit their own purposes.
	mssqlQuerycompiler = QueryCompiler_MSSQL;
	return mssqlQuerycompiler;
}

var mssqlCompiler;
var hasRequiredMssqlCompiler;

function requireMssqlCompiler () {
	if (hasRequiredMssqlCompiler) return mssqlCompiler;
	hasRequiredMssqlCompiler = 1;
	// MySQL Schema Compiler
	// -------
	const SchemaCompiler = compiler$1;

	class SchemaCompiler_MSSQL extends SchemaCompiler {
	  constructor(client, builder) {
	    super(client, builder);
	  }

	  dropTableIfExists(tableName) {
	    const name = this.formatter.wrap(prefixedTableName(this.schema, tableName));
	    this.pushQuery(
	      `if object_id('${name}', 'U') is not null DROP TABLE ${name}`
	    );
	  }

	  dropViewIfExists(viewName) {
	    const name = this.formatter.wrap(prefixedTableName(this.schema, viewName));
	    this.pushQuery(
	      `if object_id('${name}', 'V') is not null DROP VIEW ${name}`
	    );
	  }

	  // Rename a table on the schema.
	  renameTable(tableName, to) {
	    this.pushQuery(
	      `exec sp_rename ${this.client.parameter(
	        prefixedTableName(this.schema, tableName),
	        this.builder,
	        this.bindingsHolder
	      )}, ${this.client.parameter(to, this.builder, this.bindingsHolder)}`
	    );
	  }

	  renameView(viewTable, to) {
	    this.pushQuery(
	      `exec sp_rename ${this.client.parameter(
	        prefixedTableName(this.schema, viewTable),
	        this.builder,
	        this.bindingsHolder
	      )}, ${this.client.parameter(to, this.builder, this.bindingsHolder)}`
	    );
	  }

	  // Check whether a table exists on the query.
	  hasTable(tableName) {
	    const formattedTable = this.client.parameter(
	      prefixedTableName(this.schema, tableName),
	      this.builder,
	      this.bindingsHolder
	    );
	    const bindings = [tableName];
	    let sql =
	      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ` +
	      `WHERE TABLE_NAME = ${formattedTable}`;

	    if (this.schema) {
	      sql += ' AND TABLE_SCHEMA = ?';
	      bindings.push(this.schema);
	    }

	    this.pushQuery({ sql, bindings, output: (resp) => resp.length > 0 });
	  }

	  // Check whether a column exists on the schema.
	  hasColumn(tableName, column) {
	    const formattedColumn = this.client.parameter(
	      column,
	      this.builder,
	      this.bindingsHolder
	    );
	    const formattedTable = this.client.parameter(
	      this.formatter.wrap(prefixedTableName(this.schema, tableName)),
	      this.builder,
	      this.bindingsHolder
	    );
	    const sql =
	      `select object_id from sys.columns ` +
	      `where name = ${formattedColumn} ` +
	      `and object_id = object_id(${formattedTable})`;
	    this.pushQuery({ sql, output: (resp) => resp.length > 0 });
	  }
	}

	SchemaCompiler_MSSQL.prototype.dropTablePrefix = 'DROP TABLE ';

	function prefixedTableName(prefix, table) {
	  return prefix ? `${prefix}.${table}` : table;
	}

	mssqlCompiler = SchemaCompiler_MSSQL;
	return mssqlCompiler;
}

/* eslint max-len:0 */

var mssqlTablecompiler;
var hasRequiredMssqlTablecompiler;

function requireMssqlTablecompiler () {
	if (hasRequiredMssqlTablecompiler) return mssqlTablecompiler;
	hasRequiredMssqlTablecompiler = 1;
	// MSSQL Table Builder & Compiler
	// -------
	const TableCompiler = tablecompiler;
	const helpers = helpers$7;
	const { isObject } = is;

	// Table Compiler
	// ------

	class TableCompiler_MSSQL extends TableCompiler {
	  constructor(client, tableBuilder) {
	    super(client, tableBuilder);
	  }

	  createQuery(columns, ifNot, like) {
	    let createStatement = ifNot
	      ? `if object_id('${this.tableName()}', 'U') is null `
	      : '';

	    if (like) {
	      // This query copy only columns and not all indexes and keys like other databases.
	      createStatement += `SELECT * INTO ${this.tableName()} FROM ${this.tableNameLike()} WHERE 0=1`;
	    } else {
	      createStatement +=
	        'CREATE TABLE ' +
	        this.tableName() +
	        (this._formatting ? ' (\n    ' : ' (') +
	        columns.sql.join(this._formatting ? ',\n    ' : ', ') +
	        this._addChecks() +
	        ')';
	    }

	    this.pushQuery(createStatement);

	    if (this.single.comment) {
	      this.comment(this.single.comment);
	    }
	    if (like) {
	      this.addColumns(columns, this.addColumnsPrefix);
	    }
	  }

	  comment(/** @type {string} */ comment) {
	    if (!comment) {
	      return;
	    }

	    // XXX: This is a byte limit, not character, so we cannot definitively say they'll exceed the limit without server collation info.
	    // When I checked in SQL Server 2019, the ctext column in sys.syscomments is defined as a varbinary(8000), so it doesn't even have its own defined collation.
	    if (comment.length > 7500 / 2) {
	      this.client.logger.warn(
	        'Your comment might be longer than the max comment length for MSSQL of 7,500 bytes.'
	      );
	    }

	    // See: https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-addextendedproperty-transact-sql?view=sql-server-ver15#f-adding-an-extended-property-to-a-table
	    const value = this.formatter.escapingStringDelimiters(comment);
	    const level0name = this.formatter.escapingStringDelimiters(
	      this.schemaNameRaw || 'dbo'
	    );
	    const level1name = this.formatter.escapingStringDelimiters(
	      this.tableNameRaw
	    );
	    const args = `N'MS_Description', N'${value}', N'Schema', N'${level0name}', N'Table', N'${level1name}'`;
	    const isAlreadyDefined = `EXISTS(SELECT * FROM sys.fn_listextendedproperty(N'MS_Description', N'Schema', N'${level0name}', N'Table', N'${level1name}', NULL, NULL))`;
	    this.pushQuery(
	      `IF ${isAlreadyDefined}\n  EXEC sys.sp_updateextendedproperty ${args}\nELSE\n  EXEC sys.sp_addextendedproperty ${args}`
	    );
	  }

	  // Compiles column add.  Multiple columns need only one ADD clause (not one ADD per column) so core addColumns doesn't work.  #1348
	  addColumns(columns, prefix) {
	    prefix = prefix || this.addColumnsPrefix;

	    if (columns.sql.length > 0) {
	      this.pushQuery({
	        sql:
	          (this.lowerCase ? 'alter table ' : 'ALTER TABLE ') +
	          this.tableName() +
	          ' ' +
	          prefix +
	          columns.sql.join(', '),
	        bindings: columns.bindings,
	      });
	    }
	  }

	  alterColumns(columns, colBuilder) {
	    for (let i = 0, l = colBuilder.length; i < l; i++) {
	      const builder = colBuilder[i];
	      if (builder.modified.defaultTo) {
	        const schema = this.schemaNameRaw || 'dbo';
	        const baseQuery = `
              DECLARE @constraint varchar(100) = (SELECT default_constraints.name
                                                  FROM sys.all_columns
                                                  INNER JOIN sys.tables
                                                    ON all_columns.object_id = tables.object_id
                                                  INNER JOIN sys.schemas
                                                    ON tables.schema_id = schemas.schema_id
                                                  INNER JOIN sys.default_constraints
                                                    ON all_columns.default_object_id = default_constraints.object_id
                                                  WHERE schemas.name = '${schema}'
                                                  AND tables.name = '${
	                                                    this.tableNameRaw
	                                                  }'
                                                  AND all_columns.name = '${builder.getColumnName()}')

              IF @constraint IS NOT NULL EXEC('ALTER TABLE ${
	                this.tableNameRaw
	              } DROP CONSTRAINT ' + @constraint)`;
	        this.pushQuery(baseQuery);
	      }
	    }
	    // in SQL server only one column can be altered at a time
	    columns.sql.forEach((sql) => {
	      this.pushQuery({
	        sql:
	          (this.lowerCase ? 'alter table ' : 'ALTER TABLE ') +
	          this.tableName() +
	          ' ' +
	          (this.lowerCase
	            ? this.alterColumnPrefix.toLowerCase()
	            : this.alterColumnPrefix) +
	          sql,
	        bindings: columns.bindings,
	      });
	    });
	  }

	  // Compiles column drop.  Multiple columns need only one DROP clause (not one DROP per column) so core dropColumn doesn't work.  #1348
	  dropColumn() {
	    const _this2 = this;
	    const columns = helpers.normalizeArr.apply(null, arguments);
	    const columnsArray = Array.isArray(columns) ? columns : [columns];
	    const drops = columnsArray.map((column) => _this2.formatter.wrap(column));
	    const schema = this.schemaNameRaw || 'dbo';

	    for (const column of columns) {
	      const baseQuery = `
              DECLARE @constraint varchar(100) = (SELECT default_constraints.name
                                                  FROM sys.all_columns
                                                  INNER JOIN sys.tables
                                                    ON all_columns.object_id = tables.object_id
                                                  INNER JOIN sys.schemas
                                                    ON tables.schema_id = schemas.schema_id
                                                  INNER JOIN sys.default_constraints
                                                    ON all_columns.default_object_id = default_constraints.object_id
                                                  WHERE schemas.name = '${schema}'
                                                  AND tables.name = '${this.tableNameRaw}'
                                                  AND all_columns.name = '${column}')

              IF @constraint IS NOT NULL EXEC('ALTER TABLE ${this.tableNameRaw} DROP CONSTRAINT ' + @constraint)`;
	      this.pushQuery(baseQuery);
	    }
	    this.pushQuery(
	      (this.lowerCase ? 'alter table ' : 'ALTER TABLE ') +
	        this.tableName() +
	        ' ' +
	        this.dropColumnPrefix +
	        drops.join(', ')
	    );
	  }

	  changeType() {}

	  // Renames a column on the table.
	  renameColumn(from, to) {
	    this.pushQuery(
	      `exec sp_rename ${this.client.parameter(
	        this.tableName() + '.' + from,
	        this.tableBuilder,
	        this.bindingsHolder
	      )}, ${this.client.parameter(
	        to,
	        this.tableBuilder,
	        this.bindingsHolder
	      )}, 'COLUMN'`
	    );
	  }

	  dropFKRefs(runner, refs) {
	    const formatter = this.client.formatter(this.tableBuilder);
	    return Promise.all(
	      refs.map(function (ref) {
	        const constraintName = formatter.wrap(ref.CONSTRAINT_NAME);
	        const tableName = formatter.wrap(ref.TABLE_NAME);
	        return runner.query({
	          sql: `ALTER TABLE ${tableName} DROP CONSTRAINT ${constraintName}`,
	        });
	      })
	    );
	  }

	  createFKRefs(runner, refs) {
	    const formatter = this.client.formatter(this.tableBuilder);

	    return Promise.all(
	      refs.map(function (ref) {
	        const tableName = formatter.wrap(ref.TABLE_NAME);
	        const keyName = formatter.wrap(ref.CONSTRAINT_NAME);
	        const column = formatter.columnize(ref.COLUMN_NAME);
	        const references = formatter.columnize(ref.REFERENCED_COLUMN_NAME);
	        const inTable = formatter.wrap(ref.REFERENCED_TABLE_NAME);
	        const onUpdate = ` ON UPDATE ${ref.UPDATE_RULE}`;
	        const onDelete = ` ON DELETE ${ref.DELETE_RULE}`;

	        return runner.query({
	          sql:
	            `ALTER TABLE ${tableName} ADD CONSTRAINT ${keyName}` +
	            ' FOREIGN KEY (' +
	            column +
	            ') REFERENCES ' +
	            inTable +
	            ' (' +
	            references +
	            ')' +
	            onUpdate +
	            onDelete,
	        });
	      })
	    );
	  }

	  index(columns, indexName, options) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('index', this.tableNameRaw, columns);

	    let predicate;
	    if (isObject(options)) {
	      ({ predicate } = options);
	    }
	    const predicateQuery = predicate
	      ? ' ' + this.client.queryCompiler(predicate).where()
	      : '';
	    this.pushQuery(
	      `CREATE INDEX ${indexName} ON ${this.tableName()} (${this.formatter.columnize(
	        columns
	      )})${predicateQuery}`
	    );
	  }

	  /**
	   * Create a primary key.
	   *
	   * @param {undefined | string | string[]} columns
	   * @param {string | {constraintName: string, deferrable?: 'not deferrable'|'deferred'|'immediate' }} constraintName
	   */
	  primary(columns, constraintName) {
	    let deferrable;
	    if (isObject(constraintName)) {
	      ({ constraintName, deferrable } = constraintName);
	    }
	    if (deferrable && deferrable !== 'not deferrable') {
	      this.client.logger.warn(
	        `mssql: primary key constraint [${constraintName}] will not be deferrable ${deferrable} because mssql does not support deferred constraints.`
	      );
	    }
	    constraintName = constraintName
	      ? this.formatter.wrap(constraintName)
	      : this.formatter.wrap(`${this.tableNameRaw}_pkey`);
	    if (!this.forCreate) {
	      this.pushQuery(
	        `ALTER TABLE ${this.tableName()} ADD CONSTRAINT ${constraintName} PRIMARY KEY (${this.formatter.columnize(
	          columns
	        )})`
	      );
	    } else {
	      this.pushQuery(
	        `CONSTRAINT ${constraintName} PRIMARY KEY (${this.formatter.columnize(
	          columns
	        )})`
	      );
	    }
	  }

	  /**
	   * Create a unique index.
	   *
	   * @param {string | string[]} columns
	   * @param {string | {indexName: undefined | string, deferrable?: 'not deferrable'|'deferred'|'immediate', useConstraint?: true|false, predicate?: QueryBuilder }} indexName
	   */
	  unique(columns, indexName) {
	    /** @type {string | undefined} */
	    let deferrable;
	    let useConstraint = false;
	    let predicate;
	    if (isObject(indexName)) {
	      ({ indexName, deferrable, useConstraint, predicate } = indexName);
	    }
	    if (deferrable && deferrable !== 'not deferrable') {
	      this.client.logger.warn(
	        `mssql: unique index [${indexName}] will not be deferrable ${deferrable} because mssql does not support deferred constraints.`
	      );
	    }
	    if (useConstraint && predicate) {
	      throw new Error('mssql cannot create constraint with predicate');
	    }
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('unique', this.tableNameRaw, columns);

	    if (!Array.isArray(columns)) {
	      columns = [columns];
	    }

	    if (useConstraint) {
	      // mssql supports unique indexes and unique constraints.
	      // unique indexes cannot be used with foreign key relationships hence unique constraints are used instead.
	      this.pushQuery(
	        `ALTER TABLE ${this.tableName()} ADD CONSTRAINT ${indexName} UNIQUE (${this.formatter.columnize(
	          columns
	        )})`
	      );
	    } else {
	      // default to making unique index that allows null https://stackoverflow.com/a/767702/360060
	      // to be more or less compatible with other DBs (if any of the columns is NULL then "duplicates" are allowed)
	      const predicateQuery = predicate
	        ? ' ' + this.client.queryCompiler(predicate).where()
	        : ' WHERE ' +
	          columns
	            .map((column) => this.formatter.columnize(column) + ' IS NOT NULL')
	            .join(' AND ');
	      this.pushQuery(
	        `CREATE UNIQUE INDEX ${indexName} ON ${this.tableName()} (${this.formatter.columnize(
	          columns
	        )})${predicateQuery}`
	      );
	    }
	  }

	  // Compile a drop index command.
	  dropIndex(columns, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('index', this.tableNameRaw, columns);
	    this.pushQuery(`DROP INDEX ${indexName} ON ${this.tableName()}`);
	  }

	  // Compile a drop foreign key command.
	  dropForeign(columns, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('foreign', this.tableNameRaw, columns);
	    this.pushQuery(
	      `ALTER TABLE ${this.tableName()} DROP CONSTRAINT ${indexName}`
	    );
	  }

	  // Compile a drop primary key command.
	  dropPrimary(constraintName) {
	    constraintName = constraintName
	      ? this.formatter.wrap(constraintName)
	      : this.formatter.wrap(`${this.tableNameRaw}_pkey`);
	    this.pushQuery(
	      `ALTER TABLE ${this.tableName()} DROP CONSTRAINT ${constraintName}`
	    );
	  }

	  // Compile a drop unique key command.
	  dropUnique(column, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('unique', this.tableNameRaw, column);
	    this.pushQuery(`DROP INDEX ${indexName} ON ${this.tableName()}`);
	  }
	}

	TableCompiler_MSSQL.prototype.createAlterTableMethods = ['foreign', 'primary'];
	TableCompiler_MSSQL.prototype.lowerCase = false;

	TableCompiler_MSSQL.prototype.addColumnsPrefix = 'ADD ';
	TableCompiler_MSSQL.prototype.dropColumnPrefix = 'DROP COLUMN ';
	TableCompiler_MSSQL.prototype.alterColumnPrefix = 'ALTER COLUMN ';

	mssqlTablecompiler = TableCompiler_MSSQL;
	return mssqlTablecompiler;
}

/* eslint max-len: 0 */

var mssqlViewcompiler;
var hasRequiredMssqlViewcompiler;

function requireMssqlViewcompiler () {
	if (hasRequiredMssqlViewcompiler) return mssqlViewcompiler;
	hasRequiredMssqlViewcompiler = 1;
	const ViewCompiler = viewcompiler;
	const {
	  columnize: columnize_,
	} = wrappingFormatter;

	class ViewCompiler_MSSQL extends ViewCompiler {
	  constructor(client, viewCompiler) {
	    super(client, viewCompiler);
	  }

	  createQuery(columns, selectQuery, materialized, replace) {
	    const createStatement = 'CREATE ' + (replace ? 'OR ALTER ' : '') + 'VIEW ';
	    let sql = createStatement + this.viewName();

	    const columnList = columns
	      ? ' (' +
	        columnize_(
	          columns,
	          this.viewBuilder,
	          this.client,
	          this.bindingsHolder
	        ) +
	        ')'
	      : '';

	    sql += columnList;
	    sql += ' AS ';
	    sql += selectQuery.toString();
	    this.pushQuery({
	      sql,
	    });
	  }

	  renameColumn(from, to) {
	    this.pushQuery(
	      `exec sp_rename ${this.client.parameter(
	        this.viewName() + '.' + from,
	        this.viewBuilder,
	        this.bindingsHolder
	      )}, ${this.client.parameter(
	        to,
	        this.viewBuilder,
	        this.bindingsHolder
	      )}, 'COLUMN'`
	    );
	  }

	  createOrReplace() {
	    this.createQuery(this.columns, this.selectQuery, false, true);
	  }
	}

	mssqlViewcompiler = ViewCompiler_MSSQL;
	return mssqlViewcompiler;
}

var mssqlColumncompiler;
var hasRequiredMssqlColumncompiler;

function requireMssqlColumncompiler () {
	if (hasRequiredMssqlColumncompiler) return mssqlColumncompiler;
	hasRequiredMssqlColumncompiler = 1;
	// MSSQL Column Compiler
	// -------
	const ColumnCompiler = columncompiler;
	const { toNumber } = helpers$7;
	const { formatDefault } = formatterUtils;
	const { operator: operator_ } = wrappingFormatter;

	class ColumnCompiler_MSSQL extends ColumnCompiler {
	  constructor(client, tableCompiler, columnBuilder) {
	    super(client, tableCompiler, columnBuilder);
	    this.modifiers = ['nullable', 'defaultTo', 'first', 'after', 'comment'];
	    this._addCheckModifiers();
	  }

	  // Types
	  // ------

	  double(precision, scale) {
	    return 'float';
	  }

	  floating(precision, scale) {
	    // ignore precicion / scale which is mysql specific stuff
	    return `float`;
	  }

	  integer() {
	    // mssql does not support length
	    return 'int';
	  }

	  tinyint() {
	    // mssql does not support length
	    return 'tinyint';
	  }

	  varchar(length) {
	    return `nvarchar(${toNumber(length, 255)})`;
	  }

	  timestamp({ useTz = false } = {}) {
	    return useTz ? 'datetimeoffset' : 'datetime2';
	  }

	  bit(length) {
	    if (length > 1) {
	      this.client.logger.warn('Bit field is exactly 1 bit length for MSSQL');
	    }
	    return 'bit';
	  }

	  binary(length) {
	    return length ? `varbinary(${toNumber(length)})` : 'varbinary(max)';
	  }

	  // Modifiers
	  // ------

	  first() {
	    this.client.logger.warn('Column first modifier not available for MSSQL');
	    return '';
	  }

	  after(column) {
	    this.client.logger.warn('Column after modifier not available for MSSQL');
	    return '';
	  }

	  defaultTo(value, { constraintName } = {}) {
	    const formattedValue = formatDefault(value, this.type, this.client);
	    constraintName =
	      typeof constraintName !== 'undefined'
	        ? constraintName
	        : `${
	            this.tableCompiler.tableNameRaw
	          }_${this.getColumnName()}_default`.toLowerCase();
	    if (this.columnBuilder._method === 'alter') {
	      this.pushAdditional(function () {
	        this.pushQuery(
	          `ALTER TABLE ${this.tableCompiler.tableName()} ADD CONSTRAINT ${this.formatter.wrap(
	            constraintName
	          )} DEFAULT ${formattedValue} FOR ${this.formatter.wrap(
	            this.getColumnName()
	          )}`
	        );
	      });
	      return '';
	    }
	    if (!constraintName) {
	      return `DEFAULT ${formattedValue}`;
	    }
	    return `CONSTRAINT ${this.formatter.wrap(
	      constraintName
	    )} DEFAULT ${formattedValue}`;
	  }

	  comment(/** @type {string} */ comment) {
	    if (!comment) {
	      return;
	    }

	    // XXX: This is a byte limit, not character, so we cannot definitively say they'll exceed the limit without database collation info.
	    // (Yes, even if the column has its own collation, the sqlvariant still uses the database collation.)
	    // I'm not sure we even need to raise a warning, as MSSQL will return an error when the limit is exceeded itself.
	    if (comment && comment.length > 7500 / 2) {
	      this.client.logger.warn(
	        'Your comment might be longer than the max comment length for MSSQL of 7,500 bytes.'
	      );
	    }

	    // See: https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-addextendedproperty-transact-sql?view=sql-server-ver15#b-adding-an-extended-property-to-a-column-in-a-table
	    const value = this.formatter.escapingStringDelimiters(comment);
	    const level0name = this.tableCompiler.schemaNameRaw || 'dbo';
	    const level1name = this.formatter.escapingStringDelimiters(
	      this.tableCompiler.tableNameRaw
	    );
	    const level2name = this.formatter.escapingStringDelimiters(
	      this.args[0] || this.defaults('columnName')
	    );

	    const args = `N'MS_Description', N'${value}', N'Schema', N'${level0name}', N'Table', N'${level1name}', N'Column', N'${level2name}'`;

	    this.pushAdditional(function () {
	      const isAlreadyDefined = `EXISTS(SELECT * FROM sys.fn_listextendedproperty(N'MS_Description', N'Schema', N'${level0name}', N'Table', N'${level1name}', N'Column', N'${level2name}'))`;
	      this.pushQuery(
	        `IF ${isAlreadyDefined}\n  EXEC sys.sp_updateextendedproperty ${args}\nELSE\n  EXEC sys.sp_addextendedproperty ${args}`
	      );
	    });
	    return '';
	  }

	  checkLength(operator, length, constraintName) {
	    return this._check(
	      `LEN(${this.formatter.wrap(this.getColumnName())}) ${operator_(
	        operator,
	        this.columnBuilder,
	        this.bindingsHolder
	      )} ${toNumber(length)}`,
	      constraintName
	    );
	  }

	  checkRegex(regex, constraintName) {
	    return this._check(
	      `${this.formatter.wrap(
	        this.getColumnName()
	      )} LIKE ${this.client._escapeBinding('%' + regex + '%')}`,
	      constraintName
	    );
	  }

	  increments(options = { primaryKey: true }) {
	    return (
	      'int identity(1,1) not null' +
	      (this.tableCompiler._canBeAddPrimaryKey(options) ? ' primary key' : '')
	    );
	  }

	  bigincrements(options = { primaryKey: true }) {
	    return (
	      'bigint identity(1,1) not null' +
	      (this.tableCompiler._canBeAddPrimaryKey(options) ? ' primary key' : '')
	    );
	  }
	}

	ColumnCompiler_MSSQL.prototype.bigint = 'bigint';
	ColumnCompiler_MSSQL.prototype.mediumint = 'int';
	ColumnCompiler_MSSQL.prototype.smallint = 'smallint';
	ColumnCompiler_MSSQL.prototype.text = 'nvarchar(max)';
	ColumnCompiler_MSSQL.prototype.mediumtext = 'nvarchar(max)';
	ColumnCompiler_MSSQL.prototype.longtext = 'nvarchar(max)';
	ColumnCompiler_MSSQL.prototype.json = ColumnCompiler_MSSQL.prototype.jsonb =
	  'nvarchar(max)';

	// TODO: mssql supports check constraints as of SQL Server 2008
	// so make enu here more like postgres
	ColumnCompiler_MSSQL.prototype.enu = 'nvarchar(100)';
	ColumnCompiler_MSSQL.prototype.uuid = ({ useBinaryUuid = false } = {}) =>
	  useBinaryUuid ? 'binary(16)' : 'uniqueidentifier';

	ColumnCompiler_MSSQL.prototype.datetime = 'datetime2';
	ColumnCompiler_MSSQL.prototype.bool = 'bit';

	mssqlColumncompiler = ColumnCompiler_MSSQL;
	return mssqlColumncompiler;
}

var mssql;
var hasRequiredMssql;

function requireMssql () {
	if (hasRequiredMssql) return mssql;
	hasRequiredMssql = 1;
	// MSSQL Client
	// -------
	const map = map_1;
	const isNil = requireIsNil();

	const Client = client;
	const MSSQL_Formatter = requireMssqlFormatter();
	const Transaction = requireTransaction$4();
	const QueryCompiler = requireMssqlQuerycompiler();
	const SchemaCompiler = requireMssqlCompiler();
	const TableCompiler = requireMssqlTablecompiler();
	const ViewCompiler = requireMssqlViewcompiler();
	const ColumnCompiler = requireMssqlColumncompiler();
	const QueryBuilder = querybuilder;
	const { setHiddenProperty } = security;

	const debug = browserExports('knex:mssql');

	const SQL_INT4 = { MIN: -2147483648, MAX: 2147483647 };
	const SQL_BIGINT_SAFE = { MIN: -9007199254740991, MAX: 9007199254740991 };

	// Always initialize with the "QueryBuilder" and "QueryCompiler" objects, which
	// extend the base 'lib/query/builder' and 'lib/query/compiler', respectively.
	class Client_MSSQL extends Client {
	  constructor(config = {}) {
	    super(config);
	  }

	  /**
	   * @param {import('knex').Config} options
	   */
	  _generateConnection() {
	    const settings = this.connectionSettings;
	    settings.options = settings.options || {};

	    /** @type {import('tedious').ConnectionConfig} */
	    const cfg = {
	      authentication: {
	        type: settings.type || 'default',
	        options: {
	          userName: settings.userName || settings.user,
	          password: settings.password,
	          domain: settings.domain,
	          token: settings.token,
	          clientId: settings.clientId,
	          clientSecret: settings.clientSecret,
	          tenantId: settings.tenantId,
	          msiEndpoint: settings.msiEndpoint,
	        },
	      },
	      server: settings.server || settings.host,
	      options: {
	        database: settings.database,
	        encrypt: settings.encrypt || false,
	        port: settings.port || 1433,
	        connectTimeout: settings.connectionTimeout || settings.timeout || 15000,
	        requestTimeout: !isNil(settings.requestTimeout)
	          ? settings.requestTimeout
	          : 15000,
	        rowCollectionOnDone: false,
	        rowCollectionOnRequestCompletion: false,
	        useColumnNames: false,
	        tdsVersion: settings.options.tdsVersion || '7_4',
	        appName: settings.options.appName || 'knex',
	        trustServerCertificate: false,
	        ...settings.options,
	      },
	    };

	    if (cfg.authentication.options.password) {
	      setHiddenProperty(cfg.authentication.options);
	    }

	    // tedious always connect via tcp when port is specified
	    if (cfg.options.instanceName) delete cfg.options.port;

	    if (isNaN(cfg.options.requestTimeout)) cfg.options.requestTimeout = 15000;
	    if (cfg.options.requestTimeout === Infinity) cfg.options.requestTimeout = 0;
	    if (cfg.options.requestTimeout < 0) cfg.options.requestTimeout = 0;

	    if (settings.debug) {
	      cfg.options.debug = {
	        packet: true,
	        token: true,
	        data: true,
	        payload: true,
	      };
	    }

	    return cfg;
	  }

	  _driver() {
	    const tds = require$$9;

	    return tds;
	  }

	  formatter() {
	    return new MSSQL_Formatter(this, ...arguments);
	  }

	  transaction() {
	    return new Transaction(this, ...arguments);
	  }

	  queryCompiler() {
	    return new QueryCompiler(this, ...arguments);
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
	  queryBuilder() {
	    const b = new QueryBuilder(this);
	    return b;
	  }

	  columnCompiler() {
	    return new ColumnCompiler(this, ...arguments);
	  }

	  wrapIdentifierImpl(value) {
	    if (value === '*') {
	      return '*';
	    }

	    return `[${value.replace(/[[\]]+/g, '')}]`;
	  }

	  // Get a raw connection, called by the `pool` whenever a new
	  // connection needs to be added to the pool.
	  acquireRawConnection() {
	    return new Promise((resolver, rejecter) => {
	      debug('connection::connection new connection requested');
	      const Driver = this._driver();
	      const settings = Object.assign({}, this._generateConnection());

	      const connection = new Driver.Connection(settings);

	      connection.connect((err) => {
	        if (err) {
	          debug('connection::connect error: %s', err.message);
	          return rejecter(err);
	        }

	        debug('connection::connect connected to server');

	        connection.connected = true;
	        connection.on('error', (e) => {
	          debug('connection::error message=%s', e.message);
	          connection.__knex__disposed = e;
	          connection.connected = false;
	        });

	        connection.once('end', () => {
	          connection.connected = false;
	          connection.__knex__disposed = 'Connection to server was terminated.';
	          debug('connection::end connection ended.');
	        });

	        return resolver(connection);
	      });
	    });
	  }

	  validateConnection(connection) {
	    return connection && connection.connected;
	  }

	  // Used to explicitly close a connection, called internally by the pool
	  // when a connection times out or the pool is shutdown.
	  destroyRawConnection(connection) {
	    debug('connection::destroy');

	    return new Promise((resolve) => {
	      connection.once('end', () => {
	        resolve();
	      });

	      connection.close();
	    });
	  }

	  // Position the bindings for the query.
	  positionBindings(sql) {
	    let questionCount = -1;
	    return sql.replace(/\\?\?/g, (match) => {
	      if (match === '\\?') {
	        return '?';
	      }

	      questionCount += 1;
	      return `@p${questionCount}`;
	    });
	  }

	  _chomp(connection) {
	    if (connection.state.name === 'LoggedIn') {
	      const nextRequest = this.requestQueue.pop();
	      if (nextRequest) {
	        debug(
	          'connection::query executing query, %d more in queue',
	          this.requestQueue.length
	        );

	        connection.execSql(nextRequest);
	      }
	    }
	  }

	  _enqueueRequest(request, connection) {
	    this.requestQueue.push(request);
	    this._chomp(connection);
	  }

	  _makeRequest(query, callback) {
	    const Driver = this._driver();
	    const sql = typeof query === 'string' ? query : query.sql;
	    let rowCount = 0;

	    if (!sql) throw new Error('The query is empty');

	    debug('request::request sql=%s', sql);

	    const request = new Driver.Request(sql, (err, remoteRowCount) => {
	      if (err) {
	        debug('request::error message=%s', err.message);
	        return callback(err);
	      }

	      rowCount = remoteRowCount;
	      debug('request::callback rowCount=%d', rowCount);
	    });

	    request.on('prepared', () => {
	      debug('request %s::request prepared', this.id);
	    });

	    request.on('done', (rowCount, more) => {
	      debug('request::done rowCount=%d more=%s', rowCount, more);
	    });

	    request.on('doneProc', (rowCount, more) => {
	      debug(
	        'request::doneProc id=%s rowCount=%d more=%s',
	        request.id,
	        rowCount,
	        more
	      );
	    });

	    request.on('doneInProc', (rowCount, more) => {
	      debug(
	        'request::doneInProc id=%s rowCount=%d more=%s',
	        request.id,
	        rowCount,
	        more
	      );
	    });

	    request.once('requestCompleted', () => {
	      debug('request::completed id=%s', request.id);
	      return callback(null, rowCount);
	    });

	    request.on('error', (err) => {
	      debug('request::error id=%s message=%s', request.id, err.message);
	      return callback(err);
	    });

	    return request;
	  }

	  // Grab a connection, run the query via the MSSQL streaming interface,
	  // and pass that through to the stream we've sent back to the client.
	  _stream(connection, query, /** @type {NodeJS.ReadWriteStream} */ stream) {
	    return new Promise((resolve, reject) => {
	      const request = this._makeRequest(query, (err) => {
	        if (err) {
	          stream.emit('error', err);
	          return reject(err);
	        }

	        resolve();
	      });

	      request.on('row', (row) => {
	        stream.write(
	          row.reduce(
	            (prev, curr) => ({
	              ...prev,
	              [curr.metadata.colName]: curr.value,
	            }),
	            {}
	          )
	        );
	      });
	      request.on('error', (err) => {
	        stream.emit('error', err);
	        reject(err);
	      });
	      request.once('requestCompleted', () => {
	        stream.end();
	        resolve();
	      });

	      this._assignBindings(request, query.bindings);
	      this._enqueueRequest(request, connection);
	    });
	  }

	  _assignBindings(request, bindings) {
	    if (Array.isArray(bindings)) {
	      for (let i = 0; i < bindings.length; i++) {
	        const binding = bindings[i];
	        this._setReqInput(request, i, binding);
	      }
	    }
	  }

	  _scaleForBinding(binding) {
	    if (binding % 1 === 0) {
	      throw new Error(`The binding value ${binding} must be a decimal number.`);
	    }

	    return { scale: 10 };
	  }

	  _typeForBinding(binding) {
	    const Driver = this._driver();

	    if (
	      this.connectionSettings.options &&
	      this.connectionSettings.options.mapBinding
	    ) {
	      const result = this.connectionSettings.options.mapBinding(binding);
	      if (result) {
	        return [result.value, result.type];
	      }
	    }

	    switch (typeof binding) {
	      case 'string':
	        return [binding, Driver.TYPES.NVarChar];
	      case 'boolean':
	        return [binding, Driver.TYPES.Bit];
	      case 'number': {
	        if (binding % 1 !== 0) {
	          return [binding, Driver.TYPES.Float];
	        }

	        if (binding < SQL_INT4.MIN || binding > SQL_INT4.MAX) {
	          if (binding < SQL_BIGINT_SAFE.MIN || binding > SQL_BIGINT_SAFE.MAX) {
	            throw new Error(
	              `Bigint must be safe integer or must be passed as string, saw ${binding}`
	            );
	          }

	          return [binding, Driver.TYPES.BigInt];
	        }

	        return [binding, Driver.TYPES.Int];
	      }
	      default: {
	        if (binding instanceof Date) {
	          return [binding, Driver.TYPES.DateTime];
	        }

	        if (binding instanceof Buffer) {
	          return [binding, Driver.TYPES.VarBinary];
	        }

	        return [binding, Driver.TYPES.NVarChar];
	      }
	    }
	  }

	  // Runs the query on the specified connection, providing the bindings
	  // and any other necessary prep work.
	  _query(connection, query) {
	    return new Promise((resolve, reject) => {
	      const rows = [];
	      const request = this._makeRequest(query, (err, count) => {
	        if (err) {
	          return reject(err);
	        }

	        query.response = rows;

	        process.nextTick(() => this._chomp(connection));

	        resolve(query);
	      });

	      request.on('row', (row) => {
	        debug('request::row');
	        rows.push(row);
	      });

	      this._assignBindings(request, query.bindings);
	      this._enqueueRequest(request, connection);
	    });
	  }

	  // sets a request input parameter. Detects bigints and decimals and sets type appropriately.
	  _setReqInput(req, i, inputBinding) {
	    const [binding, tediousType] = this._typeForBinding(inputBinding);
	    const bindingName = 'p'.concat(i);
	    let options;

	    if (typeof binding === 'number' && binding % 1 !== 0) {
	      options = this._scaleForBinding(binding);
	    }

	    debug(
	      'request::binding pos=%d type=%s value=%s',
	      i,
	      tediousType.name,
	      binding
	    );

	    if (Buffer.isBuffer(binding)) {
	      options = {
	        length: 'max',
	      };
	    }

	    req.addParameter(bindingName, tediousType, binding, options);
	  }

	  // Process the response as returned from the query.
	  processResponse(query, runner) {
	    if (query == null) return;
	    let { response } = query;
	    const { method } = query;

	    if (query.output) {
	      return query.output.call(runner, response);
	    }

	    response = response.map((row) =>
	      row.reduce((columns, r) => {
	        const colName = r.metadata.colName;

	        if (columns[colName]) {
	          if (!Array.isArray(columns[colName])) {
	            columns[colName] = [columns[colName]];
	          }

	          columns[colName].push(r.value);
	        } else {
	          columns[colName] = r.value;
	        }

	        return columns;
	      }, {})
	    );

	    if (query.output) return query.output.call(runner, response);
	    switch (method) {
	      case 'select':
	        return response;
	      case 'first':
	        return response[0];
	      case 'pluck':
	        return map(response, query.pluck);
	      case 'insert':
	      case 'del':
	      case 'update':
	      case 'counter':
	        if (query.returning) {
	          if (query.returning === '@@rowcount') {
	            return response[0][''];
	          }
	        }
	        return response;
	      default:
	        return response;
	    }
	  }
	}

	Object.assign(Client_MSSQL.prototype, {
	  requestQueue: [],

	  dialect: 'mssql',

	  driverName: 'mssql',
	});

	mssql = Client_MSSQL;
	return mssql;
}

/** Error message constants. */

var _baseDelay;
var hasRequired_baseDelay;

function require_baseDelay () {
	if (hasRequired_baseDelay) return _baseDelay;
	hasRequired_baseDelay = 1;
	var FUNC_ERROR_TEXT = 'Expected a function';

	/**
	 * The base implementation of `_.delay` and `_.defer` which accepts `args`
	 * to provide to `func`.
	 *
	 * @private
	 * @param {Function} func The function to delay.
	 * @param {number} wait The number of milliseconds to delay invocation.
	 * @param {Array} args The arguments to provide to `func`.
	 * @returns {number|Object} Returns the timer id or timeout object.
	 */
	function baseDelay(func, wait, args) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  return setTimeout(function() { func.apply(undefined, args); }, wait);
	}

	_baseDelay = baseDelay;
	return _baseDelay;
}

var defer_1;
var hasRequiredDefer;

function requireDefer () {
	if (hasRequiredDefer) return defer_1;
	hasRequiredDefer = 1;
	var baseDelay = require_baseDelay(),
	    baseRest = _baseRest;

	/**
	 * Defers invoking the `func` until the current call stack has cleared. Any
	 * additional arguments are provided to `func` when it's invoked.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to defer.
	 * @param {...*} [args] The arguments to invoke `func` with.
	 * @returns {number} Returns the timer id.
	 * @example
	 *
	 * _.defer(function(text) {
	 *   console.log(text);
	 * }, 'deferred');
	 * // => Logs 'deferred' after one millisecond.
	 */
	var defer = baseRest(function(func, args) {
	  return baseDelay(func, 1, args);
	});

	defer_1 = defer;
	return defer_1;
}

var transaction$3;
var hasRequiredTransaction$3;

function requireTransaction$3 () {
	if (hasRequiredTransaction$3) return transaction$3;
	hasRequiredTransaction$3 = 1;
	const Transaction = transaction$5;
	const Debug = browserExports;

	const debug = Debug('knex:tx');

	class Transaction_MySQL extends Transaction {
	  query(conn, sql, status, value) {
	    const t = this;
	    const q = this.trxClient
	      .query(conn, sql)
	      .catch((err) => {
	        if (err.errno === 1305) {
	          this.trxClient.logger.warn(
	            'Transaction was implicitly committed, do not mix transactions and ' +
	              'DDL with MySQL (#805)'
	          );
	          return;
	        }

	        status = 2;
	        value = err;
	        t._completed = true;
	        debug('%s error running transaction query', t.txid);
	      })
	      .then(function (res) {
	        if (status === 1) t._resolver(value);
	        if (status === 2) {
	          if (value === undefined) {
	            if (t.doNotRejectOnRollback && /^ROLLBACK\b/i.test(sql)) {
	              t._resolver();
	              return;
	            }
	            value = new Error(`Transaction rejected with non-error: ${value}`);
	          }
	          t._rejecter(value);
	        }
	        return res;
	      });
	    if (status === 1 || status === 2) {
	      t._completed = true;
	    }
	    return q;
	  }
	}

	transaction$3 = Transaction_MySQL;
	return transaction$3;
}

var mysqlQuerycompiler;
var hasRequiredMysqlQuerycompiler;

function requireMysqlQuerycompiler () {
	if (hasRequiredMysqlQuerycompiler) return mysqlQuerycompiler;
	hasRequiredMysqlQuerycompiler = 1;
	// MySQL Query Compiler
	// ------
	const assert = require$$0;
	const identity = identity_1;
	const isPlainObject = isPlainObject_1;
	const isEmpty = isEmpty_1;
	const QueryCompiler = querycompiler;
	const { wrapAsIdentifier } = formatterUtils;
	const {
	  columnize: columnize_,
	  wrap: wrap_,
	} = wrappingFormatter;

	const isPlainObjectOrArray = (value) =>
	  isPlainObject(value) || Array.isArray(value);

	class QueryCompiler_MySQL extends QueryCompiler {
	  constructor(client, builder, formatter) {
	    super(client, builder, formatter);

	    const { returning } = this.single;
	    if (returning) {
	      this.client.logger.warn(
	        '.returning() is not supported by mysql and will not have any effect.'
	      );
	    }

	    this._emptyInsertValue = '() values ()';
	  }

	  // Compiles an `insert` query, allowing for multiple
	  // inserts using a single query statement.
	  insert() {
	    let sql = super.insert();
	    if (sql === '') return sql;

	    const { ignore, merge, insert } = this.single;
	    if (ignore) sql = sql.replace('insert into', 'insert ignore into');
	    if (merge) {
	      sql += this._merge(merge.updates, insert);
	      const wheres = this.where();
	      if (wheres) {
	        throw new Error(
	          '.onConflict().merge().where() is not supported for mysql'
	        );
	      }
	    }

	    return sql;
	  }

	  // Compiles merge for onConflict, allowing for different merge strategies
	  _merge(updates, insert) {
	    const sql = ' on duplicate key update ';
	    if (updates && Array.isArray(updates)) {
	      // update subset of columns
	      return (
	        sql +
	        updates
	          .map((column) =>
	            wrapAsIdentifier(column, this.formatter.builder, this.client)
	          )
	          .map((column) => `${column} = values(${column})`)
	          .join(', ')
	      );
	    } else if (updates && typeof updates === 'object') {
	      const updateData = this._prepUpdate(updates);
	      return sql + updateData.join(',');
	    } else {
	      const insertData = this._prepInsert(insert);
	      if (typeof insertData === 'string') {
	        throw new Error(
	          'If using merge with a raw insert query, then updates must be provided'
	        );
	      }

	      return (
	        sql +
	        insertData.columns
	          .map((column) => wrapAsIdentifier(column, this.builder, this.client))
	          .map((column) => `${column} = values(${column})`)
	          .join(', ')
	      );
	    }
	  }

	  // Update method, including joins, wheres, order & limits.
	  update() {
	    const withSQL = this.with();
	    const join = this.join();
	    const updates = this._prepUpdate(this.single.update);
	    const where = this.where();
	    const order = this.order();
	    const limit = this.limit();
	    return (
	      withSQL +
	      `update ${this.tableName}` +
	      (join ? ` ${join}` : '') +
	      ' set ' +
	      updates.join(', ') +
	      (where ? ` ${where}` : '') +
	      (order ? ` ${order}` : '') +
	      (limit ? ` ${limit}` : '')
	    );
	  }

	  forUpdate() {
	    return 'for update';
	  }

	  forShare() {
	    return 'lock in share mode';
	  }

	  // Only supported on MySQL 8.0+
	  skipLocked() {
	    return 'skip locked';
	  }

	  // Supported on MySQL 8.0+ and MariaDB 10.3.0+
	  noWait() {
	    return 'nowait';
	  }

	  // Compiles a `columnInfo` query.
	  columnInfo() {
	    const column = this.single.columnInfo;

	    // The user may have specified a custom wrapIdentifier function in the config. We
	    // need to run the identifiers through that function, but not format them as
	    // identifiers otherwise.
	    const table = this.client.customWrapIdentifier(this.single.table, identity);

	    return {
	      sql: 'select * from information_schema.columns where table_name = ? and table_schema = ?',
	      bindings: [table, this.client.database()],
	      output(resp) {
	        const out = resp.reduce(function (columns, val) {
	          columns[val.COLUMN_NAME] = {
	            defaultValue:
	              val.COLUMN_DEFAULT === 'NULL' ? null : val.COLUMN_DEFAULT,
	            type: val.DATA_TYPE,
	            maxLength: val.CHARACTER_MAXIMUM_LENGTH,
	            nullable: val.IS_NULLABLE === 'YES',
	          };
	          return columns;
	        }, {});
	        return (column && out[column]) || out;
	      },
	    };
	  }

	  limit() {
	    const noLimit = !this.single.limit && this.single.limit !== 0;
	    if (noLimit && !this.single.offset) return '';

	    // Workaround for offset only.
	    // see: http://stackoverflow.com/questions/255517/mysql-offset-infinite-rows
	    const limit =
	      this.single.offset && noLimit
	        ? '18446744073709551615'
	        : this._getValueOrParameterFromAttribute('limit');
	    return `limit ${limit}`;
	  }

	  whereBasic(statement) {
	    assert(
	      !isPlainObjectOrArray(statement.value),
	      'The values in where clause must not be object or array.'
	    );

	    return super.whereBasic(statement);
	  }

	  whereRaw(statement) {
	    assert(
	      isEmpty(statement.value.bindings) ||
	        !Object.values(statement.value.bindings).some(isPlainObjectOrArray),
	      'The values in where clause must not be object or array.'
	    );

	    return super.whereRaw(statement);
	  }

	  whereLike(statement) {
	    return `${this._columnClause(statement)} ${this._not(
	      statement,
	      'like '
	    )}${this._valueClause(statement)} COLLATE utf8_bin`;
	  }

	  whereILike(statement) {
	    return `${this._columnClause(statement)} ${this._not(
	      statement,
	      'like '
	    )}${this._valueClause(statement)}`;
	  }

	  // Json functions
	  jsonExtract(params) {
	    return this._jsonExtract(['json_extract', 'json_unquote'], params);
	  }

	  jsonSet(params) {
	    return this._jsonSet('json_set', params);
	  }

	  jsonInsert(params) {
	    return this._jsonSet('json_insert', params);
	  }

	  jsonRemove(params) {
	    const jsonCol = `json_remove(${columnize_(
	      params.column,
	      this.builder,
	      this.client,
	      this.bindingsHolder
	    )},${this.client.parameter(
	      params.path,
	      this.builder,
	      this.bindingsHolder
	    )})`;
	    return params.alias
	      ? this.client.alias(jsonCol, this.formatter.wrap(params.alias))
	      : jsonCol;
	  }

	  whereJsonObject(statement) {
	    return this._not(
	      statement,
	      `json_contains(${this._columnClause(statement)}, ${this._jsonValueClause(
	        statement
	      )})`
	    );
	  }

	  whereJsonPath(statement) {
	    return this._whereJsonPath('json_extract', statement);
	  }

	  whereJsonSupersetOf(statement) {
	    return this._not(
	      statement,
	      `json_contains(${wrap_(
	        statement.column,
	        undefined,
	        this.builder,
	        this.client,
	        this.bindingsHolder
	      )},${this._jsonValueClause(statement)})`
	    );
	  }

	  whereJsonSubsetOf(statement) {
	    return this._not(
	      statement,
	      `json_contains(${this._jsonValueClause(statement)},${wrap_(
	        statement.column,
	        undefined,
	        this.builder,
	        this.client,
	        this.bindingsHolder
	      )})`
	    );
	  }

	  onJsonPathEquals(clause) {
	    return this._onJsonPathEquals('json_extract', clause);
	  }
	}

	// Set the QueryBuilder & QueryCompiler on the client object,
	// in case anyone wants to modify things to suit their own purposes.
	mysqlQuerycompiler = QueryCompiler_MySQL;
	return mysqlQuerycompiler;
}

var mysqlCompiler;
var hasRequiredMysqlCompiler;

function requireMysqlCompiler () {
	if (hasRequiredMysqlCompiler) return mysqlCompiler;
	hasRequiredMysqlCompiler = 1;
	// MySQL Schema Compiler
	// -------
	const SchemaCompiler = compiler$1;

	class SchemaCompiler_MySQL extends SchemaCompiler {
	  constructor(client, builder) {
	    super(client, builder);
	  }

	  // Rename a table on the schema.
	  renameTable(tableName, to) {
	    this.pushQuery(
	      `rename table ${this.formatter.wrap(tableName)} to ${this.formatter.wrap(
	        to
	      )}`
	    );
	  }

	  renameView(from, to) {
	    this.renameTable(from, to);
	  }

	  // Check whether a table exists on the query.
	  hasTable(tableName) {
	    let sql = 'select * from information_schema.tables where table_name = ?';
	    const bindings = [tableName];

	    if (this.schema) {
	      sql += ' and table_schema = ?';
	      bindings.push(this.schema);
	    } else {
	      sql += ' and table_schema = database()';
	    }

	    this.pushQuery({
	      sql,
	      bindings,
	      output: function output(resp) {
	        return resp.length > 0;
	      },
	    });
	  }

	  // Check whether a column exists on the schema.
	  hasColumn(tableName, column) {
	    this.pushQuery({
	      sql: `show columns from ${this.formatter.wrap(tableName)}`,
	      output(resp) {
	        return resp.some((row) => {
	          return (
	            this.client.wrapIdentifier(row.Field.toLowerCase()) ===
	            this.client.wrapIdentifier(column.toLowerCase())
	          );
	        });
	      },
	    });
	  }
	}

	mysqlCompiler = SchemaCompiler_MySQL;
	return mysqlCompiler;
}

/* eslint max-len:0*/

var mysqlTablecompiler;
var hasRequiredMysqlTablecompiler;

function requireMysqlTablecompiler () {
	if (hasRequiredMysqlTablecompiler) return mysqlTablecompiler;
	hasRequiredMysqlTablecompiler = 1;
	// MySQL Table Builder & Compiler
	// -------
	const TableCompiler = tablecompiler;
	const { isObject, isString } = is;

	// Table Compiler
	// ------

	class TableCompiler_MySQL extends TableCompiler {
	  constructor(client, tableBuilder) {
	    super(client, tableBuilder);
	  }

	  createQuery(columns, ifNot, like) {
	    const createStatement = ifNot
	      ? 'create table if not exists '
	      : 'create table ';
	    const { client } = this;
	    let conn = {};
	    let columnsSql = ' (' + columns.sql.join(', ');

	    columnsSql += this.primaryKeys() || '';
	    columnsSql += this._addChecks();
	    columnsSql += ')';

	    let sql =
	      createStatement +
	      this.tableName() +
	      (like && this.tableNameLike()
	        ? ' like ' + this.tableNameLike()
	        : columnsSql);

	    // Check if the connection settings are set.
	    if (client.connectionSettings) {
	      conn = client.connectionSettings;
	    }

	    const charset = this.single.charset || conn.charset || '';
	    const collation = this.single.collate || conn.collate || '';
	    const engine = this.single.engine || '';

	    if (charset && !like) sql += ` default character set ${charset}`;
	    if (collation) sql += ` collate ${collation}`;
	    if (engine) sql += ` engine = ${engine}`;

	    if (this.single.comment) {
	      const comment = this.single.comment || '';
	      const MAX_COMMENT_LENGTH = 1024;
	      if (comment.length > MAX_COMMENT_LENGTH)
	        this.client.logger.warn(
	          `The max length for a table comment is ${MAX_COMMENT_LENGTH} characters`
	        );
	      sql += ` comment = '${comment}'`;
	    }

	    this.pushQuery(sql);
	    if (like) {
	      this.addColumns(columns, this.addColumnsPrefix);
	    }
	  }

	  // Compiles the comment on the table.
	  comment(comment) {
	    this.pushQuery(`alter table ${this.tableName()} comment = '${comment}'`);
	  }

	  changeType() {
	    // alter table + table + ' modify ' + wrapped + '// type';
	  }

	  // Renames a column on the table.
	  renameColumn(from, to) {
	    const compiler = this;
	    const table = this.tableName();
	    const wrapped = this.formatter.wrap(from) + ' ' + this.formatter.wrap(to);

	    this.pushQuery({
	      sql:
	        `show full fields from ${table} where field = ` +
	        this.client.parameter(from, this.tableBuilder, this.bindingsHolder),
	      output(resp) {
	        const column = resp[0];
	        const runner = this;
	        return compiler.getFKRefs(runner).then(([refs]) =>
	          new Promise((resolve, reject) => {
	            try {
	              if (!refs.length) {
	                resolve();
	              }
	              resolve(compiler.dropFKRefs(runner, refs));
	            } catch (e) {
	              reject(e);
	            }
	          })
	            .then(function () {
	              let sql = `alter table ${table} change ${wrapped} ${column.Type}`;

	              if (String(column.Null).toUpperCase() !== 'YES') {
	                sql += ` NOT NULL`;
	              } else {
	                // This doesn't matter for most cases except Timestamp, where this is important
	                sql += ` NULL`;
	              }
	              if (column.Default !== void 0 && column.Default !== null) {
	                sql += ` DEFAULT '${column.Default}'`;
	              }
	              if (column.Collation !== void 0 && column.Collation !== null) {
	                sql += ` COLLATE '${column.Collation}'`;
	              }
	              // Add back the auto increment if the column  it, fix issue #2767
	              if (column.Extra == 'auto_increment') {
	                sql += ` AUTO_INCREMENT`;
	              }

	              return runner.query({
	                sql,
	              });
	            })
	            .then(function () {
	              if (!refs.length) {
	                return;
	              }
	              return compiler.createFKRefs(
	                runner,
	                refs.map(function (ref) {
	                  if (ref.REFERENCED_COLUMN_NAME === from) {
	                    ref.REFERENCED_COLUMN_NAME = to;
	                  }
	                  if (ref.COLUMN_NAME === from) {
	                    ref.COLUMN_NAME = to;
	                  }
	                  return ref;
	                })
	              );
	            })
	        );
	      },
	    });
	  }

	  primaryKeys() {
	    const pks = (this.grouped.alterTable || []).filter(
	      (k) => k.method === 'primary'
	    );
	    if (pks.length > 0 && pks[0].args.length > 0) {
	      const columns = pks[0].args[0];
	      let constraintName = pks[0].args[1] || '';
	      if (constraintName) {
	        constraintName = ' constraint ' + this.formatter.wrap(constraintName);
	      }

	      if (this.grouped.columns) {
	        const incrementsCols = this._getIncrementsColumnNames();
	        if (incrementsCols.length) {
	          incrementsCols.forEach((c) => {
	            if (!columns.includes(c)) {
	              columns.unshift(c);
	            }
	          });
	        }
	      }

	      return `,${constraintName} primary key (${this.formatter.columnize(
	        columns
	      )})`;
	    }
	  }

	  getFKRefs(runner) {
	    const bindingsHolder = {
	      bindings: [],
	    };

	    const sql =
	      'SELECT KCU.CONSTRAINT_NAME, KCU.TABLE_NAME, KCU.COLUMN_NAME, ' +
	      '       KCU.REFERENCED_TABLE_NAME, KCU.REFERENCED_COLUMN_NAME, ' +
	      '       RC.UPDATE_RULE, RC.DELETE_RULE ' +
	      'FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU ' +
	      'JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS RC ' +
	      '       USING(CONSTRAINT_NAME)' +
	      'WHERE KCU.REFERENCED_TABLE_NAME = ' +
	      this.client.parameter(
	        this.tableNameRaw,
	        this.tableBuilder,
	        bindingsHolder
	      ) +
	      ' ' +
	      '  AND KCU.CONSTRAINT_SCHEMA = ' +
	      this.client.parameter(
	        this.client.database(),
	        this.tableBuilder,
	        bindingsHolder
	      ) +
	      ' ' +
	      '  AND RC.CONSTRAINT_SCHEMA = ' +
	      this.client.parameter(
	        this.client.database(),
	        this.tableBuilder,
	        bindingsHolder
	      );

	    return runner.query({
	      sql,
	      bindings: bindingsHolder.bindings,
	    });
	  }

	  dropFKRefs(runner, refs) {
	    const formatter = this.client.formatter(this.tableBuilder);

	    return Promise.all(
	      refs.map(function (ref) {
	        const constraintName = formatter.wrap(ref.CONSTRAINT_NAME);
	        const tableName = formatter.wrap(ref.TABLE_NAME);
	        return runner.query({
	          sql: `alter table ${tableName} drop foreign key ${constraintName}`,
	        });
	      })
	    );
	  }

	  createFKRefs(runner, refs) {
	    const formatter = this.client.formatter(this.tableBuilder);

	    return Promise.all(
	      refs.map(function (ref) {
	        const tableName = formatter.wrap(ref.TABLE_NAME);
	        const keyName = formatter.wrap(ref.CONSTRAINT_NAME);
	        const column = formatter.columnize(ref.COLUMN_NAME);
	        const references = formatter.columnize(ref.REFERENCED_COLUMN_NAME);
	        const inTable = formatter.wrap(ref.REFERENCED_TABLE_NAME);
	        const onUpdate = ` ON UPDATE ${ref.UPDATE_RULE}`;
	        const onDelete = ` ON DELETE ${ref.DELETE_RULE}`;

	        return runner.query({
	          sql:
	            `alter table ${tableName} add constraint ${keyName} ` +
	            'foreign key (' +
	            column +
	            ') references ' +
	            inTable +
	            ' (' +
	            references +
	            ')' +
	            onUpdate +
	            onDelete,
	        });
	      })
	    );
	  }

	  index(columns, indexName, options) {
	    let storageEngineIndexType;
	    let indexType;

	    if (isString(options)) {
	      indexType = options;
	    } else if (isObject(options)) {
	      ({ indexType, storageEngineIndexType } = options);
	    }

	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('index', this.tableNameRaw, columns);
	    storageEngineIndexType = storageEngineIndexType
	      ? ` using ${storageEngineIndexType}`
	      : '';
	    this.pushQuery(
	      `alter table ${this.tableName()} add${
	        indexType ? ` ${indexType}` : ''
	      } index ${indexName}(${this.formatter.columnize(
	        columns
	      )})${storageEngineIndexType}`
	    );
	  }

	  primary(columns, constraintName) {
	    let deferrable;
	    if (isObject(constraintName)) {
	      ({ constraintName, deferrable } = constraintName);
	    }
	    if (deferrable && deferrable !== 'not deferrable') {
	      this.client.logger.warn(
	        `mysql: primary key constraint \`${constraintName}\` will not be deferrable ${deferrable} because mysql does not support deferred constraints.`
	      );
	    }
	    constraintName = constraintName
	      ? this.formatter.wrap(constraintName)
	      : this.formatter.wrap(`${this.tableNameRaw}_pkey`);

	    const primaryCols = columns;
	    let incrementsCols = [];
	    if (this.grouped.columns) {
	      incrementsCols = this._getIncrementsColumnNames();
	      if (incrementsCols) {
	        incrementsCols.forEach((c) => {
	          if (!primaryCols.includes(c)) {
	            primaryCols.unshift(c);
	          }
	        });
	      }
	    }
	    if (this.method !== 'create' && this.method !== 'createIfNot') {
	      this.pushQuery(
	        `alter table ${this.tableName()} add primary key ${constraintName}(${this.formatter.columnize(
	          primaryCols
	        )})`
	      );
	    }
	    if (incrementsCols.length) {
	      this.pushQuery(
	        `alter table ${this.tableName()} modify column ${this.formatter.columnize(
	          incrementsCols
	        )} int unsigned not null auto_increment`
	      );
	    }
	  }

	  unique(columns, indexName) {
	    let storageEngineIndexType;
	    let deferrable;
	    if (isObject(indexName)) {
	      ({ indexName, deferrable, storageEngineIndexType } = indexName);
	    }
	    if (deferrable && deferrable !== 'not deferrable') {
	      this.client.logger.warn(
	        `mysql: unique index \`${indexName}\` will not be deferrable ${deferrable} because mysql does not support deferred constraints.`
	      );
	    }
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('unique', this.tableNameRaw, columns);
	    storageEngineIndexType = storageEngineIndexType
	      ? ` using ${storageEngineIndexType}`
	      : '';
	    this.pushQuery(
	      `alter table ${this.tableName()} add unique ${indexName}(${this.formatter.columnize(
	        columns
	      )})${storageEngineIndexType}`
	    );
	  }

	  // Compile a drop index command.
	  dropIndex(columns, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('index', this.tableNameRaw, columns);
	    this.pushQuery(`alter table ${this.tableName()} drop index ${indexName}`);
	  }

	  // Compile a drop foreign key command.
	  dropForeign(columns, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('foreign', this.tableNameRaw, columns);
	    this.pushQuery(
	      `alter table ${this.tableName()} drop foreign key ${indexName}`
	    );
	  }

	  // Compile a drop primary key command.
	  dropPrimary() {
	    this.pushQuery(`alter table ${this.tableName()} drop primary key`);
	  }

	  // Compile a drop unique key command.
	  dropUnique(column, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('unique', this.tableNameRaw, column);
	    this.pushQuery(`alter table ${this.tableName()} drop index ${indexName}`);
	  }
	}

	TableCompiler_MySQL.prototype.addColumnsPrefix = 'add ';
	TableCompiler_MySQL.prototype.alterColumnsPrefix = 'modify ';
	TableCompiler_MySQL.prototype.dropColumnPrefix = 'drop ';

	mysqlTablecompiler = TableCompiler_MySQL;
	return mysqlTablecompiler;
}

var mysqlColumncompiler;
var hasRequiredMysqlColumncompiler;

function requireMysqlColumncompiler () {
	if (hasRequiredMysqlColumncompiler) return mysqlColumncompiler;
	hasRequiredMysqlColumncompiler = 1;
	// MySQL Column Compiler
	// -------
	const ColumnCompiler = columncompiler;
	const { isObject } = is;
	const { toNumber } = helpers$7;

	const commentEscapeRegex = /(?<!\\)'/g;

	class ColumnCompiler_MySQL extends ColumnCompiler {
	  constructor(client, tableCompiler, columnBuilder) {
	    super(client, tableCompiler, columnBuilder);
	    this.modifiers = [
	      'unsigned',
	      'nullable',
	      'defaultTo',
	      'comment',
	      'collate',
	      'first',
	      'after',
	    ];
	    this._addCheckModifiers();
	  }

	  // Types
	  // ------

	  double(precision, scale) {
	    if (!precision) return 'double';
	    return `double(${toNumber(precision, 8)}, ${toNumber(scale, 2)})`;
	  }

	  integer(length) {
	    length = length ? `(${toNumber(length, 11)})` : '';
	    return `int${length}`;
	  }

	  tinyint(length) {
	    length = length ? `(${toNumber(length, 1)})` : '';
	    return `tinyint${length}`;
	  }

	  text(column) {
	    switch (column) {
	      case 'medium':
	      case 'mediumtext':
	        return 'mediumtext';
	      case 'long':
	      case 'longtext':
	        return 'longtext';
	      default:
	        return 'text';
	    }
	  }

	  mediumtext() {
	    return this.text('medium');
	  }

	  longtext() {
	    return this.text('long');
	  }

	  enu(allowed) {
	    return `enum('${allowed.join("', '")}')`;
	  }

	  datetime(precision) {
	    if (isObject(precision)) {
	      ({ precision } = precision);
	    }

	    return typeof precision === 'number'
	      ? `datetime(${precision})`
	      : 'datetime';
	  }

	  timestamp(precision) {
	    if (isObject(precision)) {
	      ({ precision } = precision);
	    }

	    return typeof precision === 'number'
	      ? `timestamp(${precision})`
	      : 'timestamp';
	  }

	  time(precision) {
	    if (isObject(precision)) {
	      ({ precision } = precision);
	    }

	    return typeof precision === 'number' ? `time(${precision})` : 'time';
	  }

	  bit(length) {
	    return length ? `bit(${toNumber(length)})` : 'bit';
	  }

	  binary(length) {
	    return length ? `varbinary(${toNumber(length)})` : 'blob';
	  }

	  json() {
	    return 'json';
	  }

	  jsonb() {
	    return 'json';
	  }

	  // Modifiers
	  // ------

	  defaultTo(value) {
	    // MySQL defaults to null by default, but breaks down if you pass it explicitly
	    // Note that in MySQL versions up to 5.7, logic related to updating
	    // timestamps when no explicit value is passed is quite insane - https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_explicit_defaults_for_timestamp
	    if (value === null || value === undefined) {
	      return;
	    }
	    if ((this.type === 'json' || this.type === 'jsonb') && isObject(value)) {
	      // Default value for json will work only it is an expression
	      return `default ('${JSON.stringify(value)}')`;
	    }
	    const defaultVal = super.defaultTo.apply(this, arguments);
	    if (this.type !== 'blob' && this.type.indexOf('text') === -1) {
	      return defaultVal;
	    }
	    return '';
	  }

	  unsigned() {
	    return 'unsigned';
	  }

	  comment(comment) {
	    if (comment && comment.length > 255) {
	      this.client.logger.warn(
	        'Your comment is longer than the max comment length for MySQL'
	      );
	    }
	    return comment && `comment '${comment.replace(commentEscapeRegex, "\\'")}'`;
	  }

	  first() {
	    return 'first';
	  }

	  after(column) {
	    return `after ${this.formatter.wrap(column)}`;
	  }

	  collate(collation) {
	    return collation && `collate '${collation}'`;
	  }

	  checkRegex(regex, constraintName) {
	    return this._check(
	      `${this.formatter.wrap(
	        this.getColumnName()
	      )} REGEXP ${this.client._escapeBinding(regex)}`,
	      constraintName
	    );
	  }

	  increments(options = { primaryKey: true }) {
	    return (
	      'int unsigned not null' +
	      // In MySQL autoincrement are always a primary key. If you already have a primary key, we
	      // initialize this column as classic int column then modify it later in table compiler
	      (this.tableCompiler._canBeAddPrimaryKey(options)
	        ? ' auto_increment primary key'
	        : '')
	    );
	  }

	  bigincrements(options = { primaryKey: true }) {
	    return (
	      'bigint unsigned not null' +
	      // In MySQL autoincrement are always a primary key. If you already have a primary key, we
	      // initialize this column as classic int column then modify it later in table compiler
	      (this.tableCompiler._canBeAddPrimaryKey(options)
	        ? ' auto_increment primary key'
	        : '')
	    );
	  }
	}

	ColumnCompiler_MySQL.prototype.bigint = 'bigint';
	ColumnCompiler_MySQL.prototype.mediumint = 'mediumint';
	ColumnCompiler_MySQL.prototype.smallint = 'smallint';

	mysqlColumncompiler = ColumnCompiler_MySQL;
	return mysqlColumncompiler;
}

/* eslint max-len: 0 */

var mysqlViewcompiler;
var hasRequiredMysqlViewcompiler;

function requireMysqlViewcompiler () {
	if (hasRequiredMysqlViewcompiler) return mysqlViewcompiler;
	hasRequiredMysqlViewcompiler = 1;
	const ViewCompiler = viewcompiler;

	class ViewCompiler_MySQL extends ViewCompiler {
	  constructor(client, viewCompiler) {
	    super(client, viewCompiler);
	  }

	  createOrReplace() {
	    this.createQuery(this.columns, this.selectQuery, false, true);
	  }
	}

	mysqlViewcompiler = ViewCompiler_MySQL;
	return mysqlViewcompiler;
}

var mysqlViewbuilder;
var hasRequiredMysqlViewbuilder;

function requireMysqlViewbuilder () {
	if (hasRequiredMysqlViewbuilder) return mysqlViewbuilder;
	hasRequiredMysqlViewbuilder = 1;
	const ViewBuilder = viewbuilder;

	class ViewBuilder_MySQL extends ViewBuilder {
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

	mysqlViewbuilder = ViewBuilder_MySQL;
	return mysqlViewbuilder;
}

var mysql;
var hasRequiredMysql;

function requireMysql () {
	if (hasRequiredMysql) return mysql;
	hasRequiredMysql = 1;
	// MySQL Client
	// -------
	const defer = requireDefer();
	const map = map_1;
	const { promisify } = util;
	const Client = client;

	const Transaction = requireTransaction$3();
	const QueryCompiler = requireMysqlQuerycompiler();
	const SchemaCompiler = requireMysqlCompiler();
	const TableCompiler = requireMysqlTablecompiler();
	const ColumnCompiler = requireMysqlColumncompiler();

	const { makeEscape } = string;
	const ViewCompiler = requireMysqlViewcompiler();
	const ViewBuilder = requireMysqlViewbuilder();

	// Always initialize with the "QueryBuilder" and "QueryCompiler"
	// objects, which extend the base 'lib/query/builder' and
	// 'lib/query/compiler', respectively.
	class Client_MySQL extends Client {
	  _driver() {
	    return require$$9;
	  }

	  queryCompiler(builder, formatter) {
	    return new QueryCompiler(this, builder, formatter);
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

	  columnCompiler() {
	    return new ColumnCompiler(this, ...arguments);
	  }

	  transaction() {
	    return new Transaction(this, ...arguments);
	  }

	  wrapIdentifierImpl(value) {
	    return value !== '*' ? `\`${value.replace(/`/g, '``')}\`` : '*';
	  }

	  // Get a raw connection, called by the `pool` whenever a new
	  // connection needs to be added to the pool.
	  acquireRawConnection() {
	    return new Promise((resolver, rejecter) => {
	      const connection = this.driver.createConnection(this.connectionSettings);
	      connection.on('error', (err) => {
	        connection.__knex__disposed = err;
	      });
	      connection.connect((err) => {
	        if (err) {
	          // if connection is rejected, remove listener that was registered above...
	          connection.removeAllListeners();
	          return rejecter(err);
	        }
	        resolver(connection);
	      });
	    });
	  }

	  // Used to explicitly close a connection, called internally by the pool
	  // when a connection times out or the pool is shutdown.
	  async destroyRawConnection(connection) {
	    try {
	      const end = promisify((cb) => connection.end(cb));
	      return await end();
	    } catch (err) {
	      connection.__knex__disposed = err;
	    } finally {
	      // see discussion https://github.com/knex/knex/pull/3483
	      defer(() => connection.removeAllListeners());
	    }
	  }

	  validateConnection(connection) {
	    return (
	      connection.state === 'connected' || connection.state === 'authenticated'
	    );
	  }

	  // Grab a connection, run the query via the MySQL streaming interface,
	  // and pass that through to the stream we've sent back to the client.
	  _stream(connection, obj, stream, options) {
	    if (!obj.sql) throw new Error('The query is empty');

	    options = options || {};
	    const queryOptions = Object.assign({ sql: obj.sql }, obj.options);
	    return new Promise((resolver, rejecter) => {
	      stream.on('error', rejecter);
	      stream.on('end', resolver);
	      const queryStream = connection
	        .query(queryOptions, obj.bindings)
	        .stream(options);

	      queryStream.on('error', (err) => {
	        rejecter(err);
	        stream.emit('error', err);
	      });

	      queryStream.pipe(stream);
	    });
	  }

	  // Runs the query on the specified connection, providing the bindings
	  // and any other necessary prep work.
	  _query(connection, obj) {
	    if (!obj || typeof obj === 'string') obj = { sql: obj };
	    if (!obj.sql) throw new Error('The query is empty');

	    return new Promise(function (resolver, rejecter) {
	      if (!obj.sql) {
	        resolver();
	        return;
	      }
	      const queryOptions = Object.assign({ sql: obj.sql }, obj.options);
	      connection.query(
	        queryOptions,
	        obj.bindings,
	        function (err, rows, fields) {
	          if (err) return rejecter(err);
	          obj.response = [rows, fields];
	          resolver(obj);
	        }
	      );
	    });
	  }

	  // Process the response as returned from the query.
	  processResponse(obj, runner) {
	    if (obj == null) return;
	    const { response } = obj;
	    const { method } = obj;
	    const rows = response[0];
	    const fields = response[1];
	    if (obj.output) return obj.output.call(runner, rows, fields);
	    switch (method) {
	      case 'select':
	        return rows;
	      case 'first':
	        return rows[0];
	      case 'pluck':
	        return map(rows, obj.pluck);
	      case 'insert':
	        return [rows.insertId];
	      case 'del':
	      case 'update':
	      case 'counter':
	        return rows.affectedRows;
	      default:
	        return response;
	    }
	  }

	  async cancelQuery(connectionToKill) {
	    const conn = await this.acquireRawConnection();
	    try {
	      return await this._wrappedCancelQueryCall(conn, connectionToKill);
	    } finally {
	      await this.destroyRawConnection(conn);
	      if (conn.__knex__disposed) {
	        this.logger.warn(`Connection Error: ${conn.__knex__disposed}`);
	      }
	    }
	  }

	  _wrappedCancelQueryCall(conn, connectionToKill) {
	    return this._query(conn, {
	      sql: 'KILL QUERY ?',
	      bindings: [connectionToKill.threadId],
	      options: {},
	    });
	  }
	}

	Object.assign(Client_MySQL.prototype, {
	  dialect: 'mysql',

	  driverName: 'mysql',

	  _escapeBinding: makeEscape(),

	  canCancelQuery: true,
	});

	mysql = Client_MySQL;
	return mysql;
}

var transaction$2;
var hasRequiredTransaction$2;

function requireTransaction$2 () {
	if (hasRequiredTransaction$2) return transaction$2;
	hasRequiredTransaction$2 = 1;
	const Transaction = transaction$5;
	const debug = browserExports('knex:tx');

	class Transaction_MySQL2 extends Transaction {
	  query(conn, sql, status, value) {
	    const t = this;
	    const q = this.trxClient
	      .query(conn, sql)
	      .catch((err) => {
	        if (err.code === 'ER_SP_DOES_NOT_EXIST') {
	          this.trxClient.logger.warn(
	            'Transaction was implicitly committed, do not mix transactions and ' +
	              'DDL with MySQL (#805)'
	          );
	          return;
	        }

	        status = 2;
	        value = err;
	        t._completed = true;
	        debug('%s error running transaction query', t.txid);
	      })
	      .then(function (res) {
	        if (status === 1) t._resolver(value);
	        if (status === 2) {
	          if (value === undefined) {
	            if (t.doNotRejectOnRollback && /^ROLLBACK\b/i.test(sql)) {
	              t._resolver();
	              return;
	            }
	            value = new Error(`Transaction rejected with non-error: ${value}`);
	          }
	          t._rejecter(value);
	          return res;
	        }
	      });
	    if (status === 1 || status === 2) {
	      t._completed = true;
	    }
	    return q;
	  }
	}

	transaction$2 = Transaction_MySQL2;
	return transaction$2;
}

var mysql2;
var hasRequiredMysql2;

function requireMysql2 () {
	if (hasRequiredMysql2) return mysql2;
	hasRequiredMysql2 = 1;
	// MySQL2 Client
	// -------
	const Client_MySQL = requireMysql();
	const Transaction = requireTransaction$2();

	// Always initialize with the "QueryBuilder" and "QueryCompiler"
	// objects, which extend the base 'lib/query/builder' and
	// 'lib/query/compiler', respectively.
	class Client_MySQL2 extends Client_MySQL {
	  transaction() {
	    return new Transaction(this, ...arguments);
	  }

	  _driver() {
	    return require$$9;
	  }

	  initializeDriver() {
	    try {
	      this.driver = this._driver();
	    } catch (e) {
	      let message = `Knex: run\n$ npm install ${this.driverName}`;

	      const nodeMajorVersion = process.version.replace(/^v/, '').split('.')[0];
	      if (nodeMajorVersion <= 12) {
	        message += `@3.2.0`;
	        this.logger.error(
	          'Mysql2 version 3.2.0 is the latest version to support Node.js 12 or lower.'
	        );
	      }
	      message += ` --save`;
	      this.logger.error(`${message}\n${e.message}\n${e.stack}`);
	      throw new Error(`${message}\n${e.message}`);
	    }
	  }

	  validateConnection(connection) {
	    return (
	      connection &&
	      !connection._fatalError &&
	      !connection._protocolError &&
	      !connection._closing &&
	      !connection.stream.destroyed
	    );
	  }
	}

	Object.assign(Client_MySQL2.prototype, {
	  // The "dialect", for reference elsewhere.
	  driverName: 'mysql2',
	});

	mysql2 = Client_MySQL2;
	return mysql2;
}

var utils$1;
var hasRequiredUtils$1;

function requireUtils$1 () {
	if (hasRequiredUtils$1) return utils$1;
	hasRequiredUtils$1 = 1;
	class NameHelper {
	  constructor(oracleVersion) {
	    this.oracleVersion = oracleVersion;

	    // In oracle versions prior to 12.2, the maximum length for a database
	    // object name was 30 characters. 12.2 extended this to 128.
	    const versionParts = oracleVersion
	      .split('.')
	      .map((versionPart) => parseInt(versionPart));
	    if (
	      versionParts[0] > 12 ||
	      (versionParts[0] === 12 && versionParts[1] >= 2)
	    ) {
	      this.limit = 128;
	    } else {
	      this.limit = 30;
	    }
	  }

	  generateCombinedName(logger, postfix, name, subNames) {
	    const crypto = require$$0$3;
	    if (!Array.isArray(subNames)) subNames = subNames ? [subNames] : [];
	    const table = name.replace(/\.|-/g, '_');
	    const subNamesPart = subNames.join('_');
	    let result = `${table}_${
	      subNamesPart.length ? subNamesPart + '_' : ''
	    }${postfix}`.toLowerCase();
	    if (result.length > this.limit) {
	      logger.warn(
	        `Automatically generated name "${result}" exceeds ${this.limit} character ` +
	          `limit for Oracle Database ${this.oracleVersion}. Using base64 encoded sha1 of that name instead.`
	      );
	      // generates the sha1 of the name and encode it with base64
	      result = crypto
	        .createHash('sha1')
	        .update(result)
	        .digest('base64')
	        .replace('=', '');
	    }
	    return result;
	  }
	}

	function wrapSqlWithCatch(sql, errorNumberToCatch) {
	  return (
	    `begin execute immediate '${sql.replace(/'/g, "''")}'; ` +
	    `exception when others then if sqlcode != ${errorNumberToCatch} then raise; ` +
	    `end if; ` +
	    `end;`
	  );
	}

	function ReturningHelper(columnName) {
	  this.columnName = columnName;
	}

	ReturningHelper.prototype.toString = function () {
	  return `[object ReturningHelper:${this.columnName}]`;
	};

	// If the error is any of these, we'll assume we need to
	// mark the connection as failed
	function isConnectionError(err) {
	  return [
	    'DPI-1010', // not connected
	    'DPI-1080', // connection was closed by ORA-%d
	    'ORA-03114', // not connected to ORACLE
	    'ORA-03113', // end-of-file on communication channel
	    'ORA-03135', // connection lost contact
	    'ORA-12514', // listener does not currently know of service requested in connect descriptor
	    'ORA-00022', // invalid session ID; access denied
	    'ORA-00028', // your session has been killed
	    'ORA-00031', // your session has been marked for kill
	    'ORA-00045', // your session has been terminated with no replay
	    'ORA-00378', // buffer pools cannot be created as specified
	    'ORA-00602', // internal programming exception
	    'ORA-00603', // ORACLE server session terminated by fatal error
	    'ORA-00609', // could not attach to incoming connection
	    'ORA-01012', // not logged on
	    'ORA-01041', // internal error. hostdef extension doesn't exist
	    'ORA-01043', // user side memory corruption
	    'ORA-01089', // immediate shutdown or close in progress
	    'ORA-01092', // ORACLE instance terminated. Disconnection forced
	    'ORA-02396', // exceeded maximum idle time, please connect again
	    'ORA-03122', // attempt to close ORACLE-side window on user side
	    'ORA-12153', // TNS'not connected
	    'ORA-12537', // TNS'connection closed
	    'ORA-12547', // TNS'lost contact
	    'ORA-12570', // TNS'packet reader failure
	    'ORA-12583', // TNS'no reader
	    'ORA-27146', // post/wait initialization failed
	    'ORA-28511', // lost RPC connection
	    'ORA-56600', // an illegal OCI function call was issued
	    'NJS-024',
	    'NJS-003',
	  ].some(function (prefix) {
	    return err.message.indexOf(prefix) === 0;
	  });
	}

	utils$1 = {
	  NameHelper,
	  isConnectionError,
	  wrapSqlWithCatch,
	  ReturningHelper,
	};
	return utils$1;
}

var trigger;
var hasRequiredTrigger;

function requireTrigger () {
	if (hasRequiredTrigger) return trigger;
	hasRequiredTrigger = 1;
	const { NameHelper } = requireUtils$1();

	class Trigger {
	  constructor(oracleVersion) {
	    this.nameHelper = new NameHelper(oracleVersion);
	  }

	  renameColumnTrigger(logger, tableName, columnName, to) {
	    const triggerName = this.nameHelper.generateCombinedName(
	      logger,
	      'autoinc_trg',
	      tableName
	    );
	    const sequenceName = this.nameHelper.generateCombinedName(
	      logger,
	      'seq',
	      tableName
	    );
	    return (
	      `DECLARE ` +
	      `PK_NAME VARCHAR(200); ` +
	      `IS_AUTOINC NUMBER := 0; ` +
	      `BEGIN` +
	      `  EXECUTE IMMEDIATE ('ALTER TABLE "${tableName}" RENAME COLUMN "${columnName}" TO "${to}"');` +
	      `  SELECT COUNT(*) INTO IS_AUTOINC from "USER_TRIGGERS" where trigger_name = '${triggerName}';` +
	      `  IF (IS_AUTOINC > 0) THEN` +
	      `    SELECT cols.column_name INTO PK_NAME` +
	      `    FROM all_constraints cons, all_cons_columns cols` +
	      `    WHERE cons.constraint_type = 'P'` +
	      `    AND cons.constraint_name = cols.constraint_name` +
	      `    AND cons.owner = cols.owner` +
	      `    AND cols.table_name = '${tableName}';` +
	      `    IF ('${to}' = PK_NAME) THEN` +
	      `      EXECUTE IMMEDIATE ('DROP TRIGGER "${triggerName}"');` +
	      `      EXECUTE IMMEDIATE ('create or replace trigger "${triggerName}"` +
	      `      BEFORE INSERT on "${tableName}" for each row` +
	      `        declare` +
	      `        checking number := 1;` +
	      `        begin` +
	      `          if (:new."${to}" is null) then` +
	      `            while checking >= 1 loop` +
	      `              select "${sequenceName}".nextval into :new."${to}" from dual;` +
	      `              select count("${to}") into checking from "${tableName}"` +
	      `              where "${to}" = :new."${to}";` +
	      `            end loop;` +
	      `          end if;` +
	      `        end;');` +
	      `    end if;` +
	      `  end if;` +
	      `END;`
	    );
	  }

	  createAutoIncrementTrigger(logger, tableName, schemaName) {
	    const tableQuoted = `"${tableName}"`;
	    const tableUnquoted = tableName;
	    const schemaQuoted = schemaName ? `"${schemaName}".` : '';
	    const constraintOwner = schemaName ? `'${schemaName}'` : 'cols.owner';
	    const triggerName = this.nameHelper.generateCombinedName(
	      logger,
	      'autoinc_trg',
	      tableName
	    );
	    const sequenceNameUnquoted = this.nameHelper.generateCombinedName(
	      logger,
	      'seq',
	      tableName
	    );
	    const sequenceNameQuoted = `"${sequenceNameUnquoted}"`;
	    return (
	      `DECLARE ` +
	      `PK_NAME VARCHAR(200); ` +
	      `BEGIN` +
	      `  EXECUTE IMMEDIATE ('CREATE SEQUENCE ${schemaQuoted}${sequenceNameQuoted}');` +
	      `  SELECT cols.column_name INTO PK_NAME` + // TODO : support autoincrement on table with multiple primary keys
	      `  FROM all_constraints cons, all_cons_columns cols` +
	      `  WHERE cons.constraint_type = 'P'` +
	      `  AND cons.constraint_name = cols.constraint_name` +
	      `  AND cons.owner = ${constraintOwner}` +
	      `  AND cols.table_name = '${tableUnquoted}';` +
	      `  execute immediate ('create or replace trigger ${schemaQuoted}"${triggerName}"` +
	      `  BEFORE INSERT on ${schemaQuoted}${tableQuoted}` +
	      `  for each row` +
	      `  declare` +
	      `  checking number := 1;` +
	      `  begin` +
	      `    if (:new."' || PK_NAME || '" is null) then` +
	      `      while checking >= 1 loop` +
	      `        select ${schemaQuoted}${sequenceNameQuoted}.nextval into :new."' || PK_NAME || '" from dual;` +
	      `        select count("' || PK_NAME || '") into checking from ${schemaQuoted}${tableQuoted}` +
	      `        where "' || PK_NAME || '" = :new."' || PK_NAME || '";` +
	      `      end loop;` +
	      `    end if;` +
	      `  end;'); ` +
	      `END;`
	    );
	  }

	  renameTableAndAutoIncrementTrigger(logger, tableName, to) {
	    const triggerName = this.nameHelper.generateCombinedName(
	      logger,
	      'autoinc_trg',
	      tableName
	    );
	    const sequenceName = this.nameHelper.generateCombinedName(
	      logger,
	      'seq',
	      tableName
	    );
	    const toTriggerName = this.nameHelper.generateCombinedName(
	      logger,
	      'autoinc_trg',
	      to
	    );
	    const toSequenceName = this.nameHelper.generateCombinedName(
	      logger,
	      'seq',
	      to
	    );
	    return (
	      `DECLARE ` +
	      `PK_NAME VARCHAR(200); ` +
	      `IS_AUTOINC NUMBER := 0; ` +
	      `BEGIN` +
	      `  EXECUTE IMMEDIATE ('RENAME "${tableName}" TO "${to}"');` +
	      `  SELECT COUNT(*) INTO IS_AUTOINC from "USER_TRIGGERS" where trigger_name = '${triggerName}';` +
	      `  IF (IS_AUTOINC > 0) THEN` +
	      `    EXECUTE IMMEDIATE ('DROP TRIGGER "${triggerName}"');` +
	      `    EXECUTE IMMEDIATE ('RENAME "${sequenceName}" TO "${toSequenceName}"');` +
	      `    SELECT cols.column_name INTO PK_NAME` +
	      `    FROM all_constraints cons, all_cons_columns cols` +
	      `    WHERE cons.constraint_type = 'P'` +
	      `    AND cons.constraint_name = cols.constraint_name` +
	      `    AND cons.owner = cols.owner` +
	      `    AND cols.table_name = '${to}';` +
	      `    EXECUTE IMMEDIATE ('create or replace trigger "${toTriggerName}"` +
	      `    BEFORE INSERT on "${to}" for each row` +
	      `      declare` +
	      `      checking number := 1;` +
	      `      begin` +
	      `        if (:new."' || PK_NAME || '" is null) then` +
	      `          while checking >= 1 loop` +
	      `            select "${toSequenceName}".nextval into :new."' || PK_NAME || '" from dual;` +
	      `            select count("' || PK_NAME || '") into checking from "${to}"` +
	      `            where "' || PK_NAME || '" = :new."' || PK_NAME || '";` +
	      `          end loop;` +
	      `        end if;` +
	      `      end;');` +
	      `  end if;` +
	      `END;`
	    );
	  }
	}

	trigger = Trigger;
	return trigger;
}

var oracleCompiler;
var hasRequiredOracleCompiler;

function requireOracleCompiler () {
	if (hasRequiredOracleCompiler) return oracleCompiler;
	hasRequiredOracleCompiler = 1;
	// Oracle Schema Compiler
	// -------
	const SchemaCompiler = compiler$1;
	const utils = requireUtils$1();
	const Trigger = requireTrigger();

	class SchemaCompiler_Oracle extends SchemaCompiler {
	  constructor() {
	    super(...arguments);
	  }

	  // Rename a table on the schema.
	  renameTable(tableName, to) {
	    const trigger = new Trigger(this.client.version);
	    const renameTable = trigger.renameTableAndAutoIncrementTrigger(
	      this.client.logger,
	      tableName,
	      to
	    );
	    this.pushQuery(renameTable);
	  }

	  // Check whether a table exists on the query.
	  hasTable(tableName) {
	    this.pushQuery({
	      sql:
	        'select TABLE_NAME from USER_TABLES where TABLE_NAME = ' +
	        this.client.parameter(tableName, this.builder, this.bindingsHolder),
	      output(resp) {
	        return resp.length > 0;
	      },
	    });
	  }

	  // Check whether a column exists on the schema.
	  hasColumn(tableName, column) {
	    const sql =
	      `select COLUMN_NAME from ALL_TAB_COLUMNS ` +
	      `where TABLE_NAME = ${this.client.parameter(
	        tableName,
	        this.builder,
	        this.bindingsHolder
	      )} ` +
	      `and COLUMN_NAME = ${this.client.parameter(
	        column,
	        this.builder,
	        this.bindingsHolder
	      )}`;
	    this.pushQuery({ sql, output: (resp) => resp.length > 0 });
	  }

	  dropSequenceIfExists(sequenceName) {
	    const prefix = this.schema ? `"${this.schema}".` : '';
	    this.pushQuery(
	      utils.wrapSqlWithCatch(
	        `drop sequence ${prefix}${this.formatter.wrap(sequenceName)}`,
	        -2289
	      )
	    );
	  }

	  _dropRelatedSequenceIfExists(tableName) {
	    // removing the sequence that was possibly generated by increments() column
	    const nameHelper = new utils.NameHelper(this.client.version);
	    const sequenceName = nameHelper.generateCombinedName(
	      this.client.logger,
	      'seq',
	      tableName
	    );
	    this.dropSequenceIfExists(sequenceName);
	  }

	  dropTable(tableName) {
	    const prefix = this.schema ? `"${this.schema}".` : '';
	    this.pushQuery(`drop table ${prefix}${this.formatter.wrap(tableName)}`);

	    // removing the sequence that was possibly generated by increments() column
	    this._dropRelatedSequenceIfExists(tableName);
	  }

	  dropTableIfExists(tableName) {
	    this.dropObject(tableName, 'table');
	  }

	  dropViewIfExists(viewName) {
	    this.dropObject(viewName, 'view');
	  }

	  dropObject(objectName, type) {
	    const prefix = this.schema ? `"${this.schema}".` : '';
	    let errorCode = -942;
	    if (type === 'materialized view') {
	      // https://stackoverflow.com/a/1801453
	      errorCode = -12003;
	    }
	    this.pushQuery(
	      utils.wrapSqlWithCatch(
	        `drop ${type} ${prefix}${this.formatter.wrap(objectName)}`,
	        errorCode
	      )
	    );

	    // removing the sequence that was possibly generated by increments() column
	    this._dropRelatedSequenceIfExists(objectName);
	  }

	  refreshMaterializedView(viewName) {
	    return this.pushQuery({
	      sql: `BEGIN DBMS_MVIEW.REFRESH('${
	        this.schemaNameRaw ? this.schemaNameRaw + '.' : ''
	      }${viewName}'); END;`,
	    });
	  }

	  dropMaterializedView(viewName) {
	    this._dropView(viewName, false, true);
	  }

	  dropMaterializedViewIfExists(viewName) {
	    this.dropObject(viewName, 'materialized view');
	  }
	}

	oracleCompiler = SchemaCompiler_Oracle;
	return oracleCompiler;
}

var oracleColumnbuilder;
var hasRequiredOracleColumnbuilder;

function requireOracleColumnbuilder () {
	if (hasRequiredOracleColumnbuilder) return oracleColumnbuilder;
	hasRequiredOracleColumnbuilder = 1;
	const ColumnBuilder = columnbuilder;
	const toArray = toArray_1;

	class ColumnBuilder_Oracle extends ColumnBuilder {
	  constructor() {
	    super(...arguments);
	  }

	  // checkIn added to the builder to allow the column compiler to change the
	  // order via the modifiers ("check" must be after "default")
	  checkIn() {
	    this._modifiers.checkIn = toArray(arguments);
	    return this;
	  }
	}

	oracleColumnbuilder = ColumnBuilder_Oracle;
	return oracleColumnbuilder;
}

var _arrayIncludes;
var hasRequired_arrayIncludes;

function require_arrayIncludes () {
	if (hasRequired_arrayIncludes) return _arrayIncludes;
	hasRequired_arrayIncludes = 1;
	var baseIndexOf = _baseIndexOf;

	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array == null ? 0 : array.length;
	  return !!length && baseIndexOf(array, value, 0) > -1;
	}

	_arrayIncludes = arrayIncludes;
	return _arrayIncludes;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */

var _arrayIncludesWith;
var hasRequired_arrayIncludesWith;

function require_arrayIncludesWith () {
	if (hasRequired_arrayIncludesWith) return _arrayIncludesWith;
	hasRequired_arrayIncludesWith = 1;
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}

	_arrayIncludesWith = arrayIncludesWith;
	return _arrayIncludesWith;
}

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */

var noop_1;
var hasRequiredNoop;

function requireNoop () {
	if (hasRequiredNoop) return noop_1;
	hasRequiredNoop = 1;
	function noop() {
	  // No operation performed.
	}

	noop_1 = noop;
	return noop_1;
}

var _createSet;
var hasRequired_createSet;

function require_createSet () {
	if (hasRequired_createSet) return _createSet;
	hasRequired_createSet = 1;
	var Set = _Set,
	    noop = requireNoop(),
	    setToArray = _setToArray;

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/**
	 * Creates a set object of `values`.
	 *
	 * @private
	 * @param {Array} values The values to add to the set.
	 * @returns {Object} Returns the new set.
	 */
	var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
	  return new Set(values);
	};

	_createSet = createSet;
	return _createSet;
}

var _baseUniq;
var hasRequired_baseUniq;

function require_baseUniq () {
	if (hasRequired_baseUniq) return _baseUniq;
	hasRequired_baseUniq = 1;
	var SetCache = _SetCache,
	    arrayIncludes = require_arrayIncludes(),
	    arrayIncludesWith = require_arrayIncludesWith(),
	    cacheHas = _cacheHas,
	    createSet = require_createSet(),
	    setToArray = _setToArray;

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function baseUniq(array, iteratee, comparator) {
	  var index = -1,
	      includes = arrayIncludes,
	      length = array.length,
	      isCommon = true,
	      result = [],
	      seen = result;

	  if (comparator) {
	    isCommon = false;
	    includes = arrayIncludesWith;
	  }
	  else if (length >= LARGE_ARRAY_SIZE) {
	    var set = iteratee ? null : createSet(array);
	    if (set) {
	      return setToArray(set);
	    }
	    isCommon = false;
	    includes = cacheHas;
	    seen = new SetCache;
	  }
	  else {
	    seen = iteratee ? [] : result;
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;

	    value = (comparator || value !== 0) ? value : 0;
	    if (isCommon && computed === computed) {
	      var seenIndex = seen.length;
	      while (seenIndex--) {
	        if (seen[seenIndex] === computed) {
	          continue outer;
	        }
	      }
	      if (iteratee) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	    else if (!includes(seen, computed, comparator)) {
	      if (seen !== result) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}

	_baseUniq = baseUniq;
	return _baseUniq;
}

var uniq_1;
var hasRequiredUniq;

function requireUniq () {
	if (hasRequiredUniq) return uniq_1;
	hasRequiredUniq = 1;
	var baseUniq = require_baseUniq();

	/**
	 * Creates a duplicate-free version of an array, using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons, in which only the first occurrence of each element
	 * is kept. The order of result values is determined by the order they occur
	 * in the array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @returns {Array} Returns the new duplicate free array.
	 * @example
	 *
	 * _.uniq([2, 1, 2]);
	 * // => [2, 1]
	 */
	function uniq(array) {
	  return (array && array.length) ? baseUniq(array) : [];
	}

	uniq_1 = uniq;
	return uniq_1;
}

var incrementUtils;
var hasRequiredIncrementUtils;

function requireIncrementUtils () {
	if (hasRequiredIncrementUtils) return incrementUtils;
	hasRequiredIncrementUtils = 1;
	const Trigger = requireTrigger();

	// helper function for pushAdditional in increments() and bigincrements()
	function createAutoIncrementTriggerAndSequence(columnCompiler) {
	  const trigger = new Trigger(columnCompiler.client.version);

	  // TODO Add warning that sequence etc is created
	  columnCompiler.pushAdditional(function () {
	    const tableName = this.tableCompiler.tableNameRaw;
	    const schemaName = this.tableCompiler.schemaNameRaw;
	    const createTriggerSQL = trigger.createAutoIncrementTrigger(
	      this.client.logger,
	      tableName,
	      schemaName
	    );
	    this.pushQuery(createTriggerSQL);
	  });
	}

	incrementUtils = {
	  createAutoIncrementTriggerAndSequence,
	};
	return incrementUtils;
}

var oracleColumncompiler;
var hasRequiredOracleColumncompiler;

function requireOracleColumncompiler () {
	if (hasRequiredOracleColumncompiler) return oracleColumncompiler;
	hasRequiredOracleColumncompiler = 1;
	const uniq = requireUniq();
	const Raw = raw;
	const ColumnCompiler = columncompiler;
	const {
	  createAutoIncrementTriggerAndSequence,
	} = requireIncrementUtils();
	const { toNumber } = helpers$7;

	// Column Compiler
	// -------

	class ColumnCompiler_Oracle extends ColumnCompiler {
	  constructor() {
	    super(...arguments);
	    this.modifiers = ['defaultTo', 'checkIn', 'nullable', 'comment'];
	  }

	  increments(options = { primaryKey: true }) {
	    createAutoIncrementTriggerAndSequence(this);
	    return (
	      'integer not null' +
	      (this.tableCompiler._canBeAddPrimaryKey(options) ? ' primary key' : '')
	    );
	  }

	  bigincrements(options = { primaryKey: true }) {
	    createAutoIncrementTriggerAndSequence(this);
	    return (
	      'number(20, 0) not null' +
	      (this.tableCompiler._canBeAddPrimaryKey(options) ? ' primary key' : '')
	    );
	  }

	  floating(precision) {
	    const parsedPrecision = toNumber(precision, 0);
	    return `float${parsedPrecision ? `(${parsedPrecision})` : ''}`;
	  }

	  double(precision, scale) {
	    // if (!precision) return 'number'; // TODO: Check If default is ok
	    return `number(${toNumber(precision, 8)}, ${toNumber(scale, 2)})`;
	  }

	  decimal(precision, scale) {
	    if (precision === null) return 'decimal';
	    return `decimal(${toNumber(precision, 8)}, ${toNumber(scale, 2)})`;
	  }

	  integer(length) {
	    return length ? `number(${toNumber(length, 11)})` : 'integer';
	  }

	  enu(allowed) {
	    allowed = uniq(allowed);
	    const maxLength = (allowed || []).reduce(
	      (maxLength, name) => Math.max(maxLength, String(name).length),
	      1
	    );

	    // implicitly add the enum values as checked values
	    this.columnBuilder._modifiers.checkIn = [allowed];

	    return `varchar2(${maxLength})`;
	  }

	  datetime(without) {
	    return without ? 'timestamp' : 'timestamp with time zone';
	  }

	  timestamp(without) {
	    return without ? 'timestamp' : 'timestamp with time zone';
	  }

	  bool() {
	    // implicitly add the check for 0 and 1
	    this.columnBuilder._modifiers.checkIn = [[0, 1]];
	    return 'number(1, 0)';
	  }

	  varchar(length) {
	    return `varchar2(${toNumber(length, 255)})`;
	  }

	  // Modifiers
	  // ------

	  comment(comment) {
	    const columnName = this.args[0] || this.defaults('columnName');

	    this.pushAdditional(function () {
	      this.pushQuery(
	        `comment on column ${this.tableCompiler.tableName()}.` +
	          this.formatter.wrap(columnName) +
	          " is '" +
	          (comment || '') +
	          "'"
	      );
	    }, comment);
	  }

	  checkIn(value) {
	    // TODO: Maybe accept arguments also as array
	    // TODO: value(s) should be escaped properly
	    if (value === undefined) {
	      return '';
	    } else if (value instanceof Raw) {
	      value = value.toQuery();
	    } else if (Array.isArray(value)) {
	      value = value.map((v) => `'${v}'`).join(', ');
	    } else {
	      value = `'${value}'`;
	    }
	    return `check (${this.formatter.wrap(this.args[0])} in (${value}))`;
	  }
	}

	ColumnCompiler_Oracle.prototype.tinyint = 'smallint';
	ColumnCompiler_Oracle.prototype.smallint = 'smallint';
	ColumnCompiler_Oracle.prototype.mediumint = 'integer';
	ColumnCompiler_Oracle.prototype.biginteger = 'number(20, 0)';
	ColumnCompiler_Oracle.prototype.text = 'clob';
	ColumnCompiler_Oracle.prototype.time = 'timestamp with time zone';
	ColumnCompiler_Oracle.prototype.bit = 'clob';
	ColumnCompiler_Oracle.prototype.json = 'clob';

	oracleColumncompiler = ColumnCompiler_Oracle;
	return oracleColumncompiler;
}

/* eslint max-len:0 */

var oracleTablecompiler;
var hasRequiredOracleTablecompiler;

function requireOracleTablecompiler () {
	if (hasRequiredOracleTablecompiler) return oracleTablecompiler;
	hasRequiredOracleTablecompiler = 1;
	const utils = requireUtils$1();
	const TableCompiler = tablecompiler;
	const helpers = helpers$7;
	const Trigger = requireTrigger();
	const { isObject } = is;

	// Table Compiler
	// ------

	class TableCompiler_Oracle extends TableCompiler {
	  constructor() {
	    super(...arguments);
	  }

	  addColumns(columns, prefix) {
	    if (columns.sql.length > 0) {
	      prefix = prefix || this.addColumnsPrefix;

	      const columnSql = columns.sql;
	      const alter = this.lowerCase ? 'alter table ' : 'ALTER TABLE ';

	      let sql = `${alter}${this.tableName()} ${prefix}`;
	      if (columns.sql.length > 1) {
	        sql += `(${columnSql.join(', ')})`;
	      } else {
	        sql += columnSql.join(', ');
	      }

	      this.pushQuery({
	        sql,
	        bindings: columns.bindings,
	      });
	    }
	  }

	  // Compile a rename column command.
	  renameColumn(from, to) {
	    // Remove quotes around tableName
	    const tableName = this.tableName().slice(1, -1);
	    const trigger = new Trigger(this.client.version);
	    return this.pushQuery(
	      trigger.renameColumnTrigger(this.client.logger, tableName, from, to)
	    );
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
	    const columnsSql =
	      like && this.tableNameLike()
	        ? ' as (select * from ' + this.tableNameLike() + ' where 0=1)'
	        : ' (' + columns.sql.join(', ') + this._addChecks() + ')';
	    const sql = `create table ${this.tableName()}${columnsSql}`;

	    this.pushQuery({
	      // catch "name is already used by an existing object" for workaround for "if not exists"
	      sql: ifNot ? utils.wrapSqlWithCatch(sql, -955) : sql,
	      bindings: columns.bindings,
	    });
	    if (this.single.comment) this.comment(this.single.comment);
	    if (like) {
	      this.addColumns(columns, this.addColumnsPrefix);
	    }
	  }

	  // Compiles the comment on the table.
	  comment(comment) {
	    this.pushQuery(`comment on table ${this.tableName()} is '${comment}'`);
	  }

	  dropColumn() {
	    const columns = helpers.normalizeArr.apply(null, arguments);
	    this.pushQuery(
	      `alter table ${this.tableName()} drop (${this.formatter.columnize(
	        columns
	      )})`
	    );
	  }

	  _indexCommand(type, tableName, columns) {
	    const nameHelper = new utils.NameHelper(this.client.version);
	    return this.formatter.wrap(
	      nameHelper.generateCombinedName(
	        this.client.logger,
	        type,
	        tableName,
	        columns
	      )
	    );
	  }

	  primary(columns, constraintName) {
	    let deferrable;
	    if (isObject(constraintName)) {
	      ({ constraintName, deferrable } = constraintName);
	    }
	    deferrable = deferrable ? ` deferrable initially ${deferrable}` : '';
	    constraintName = constraintName
	      ? this.formatter.wrap(constraintName)
	      : this.formatter.wrap(`${this.tableNameRaw}_pkey`);
	    const primaryCols = columns;
	    let incrementsCols = [];
	    if (this.grouped.columns) {
	      incrementsCols = this._getIncrementsColumnNames();
	      if (incrementsCols) {
	        incrementsCols.forEach((c) => {
	          if (!primaryCols.includes(c)) {
	            primaryCols.unshift(c);
	          }
	        });
	      }
	    }
	    this.pushQuery(
	      `alter table ${this.tableName()} add constraint ${constraintName} primary key (${this.formatter.columnize(
	        primaryCols
	      )})${deferrable}`
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

	  index(columns, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('index', this.tableNameRaw, columns);
	    this.pushQuery(
	      `create index ${indexName} on ${this.tableName()}` +
	        ' (' +
	        this.formatter.columnize(columns) +
	        ')'
	    );
	  }

	  dropIndex(columns, indexName) {
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('index', this.tableNameRaw, columns);
	    this.pushQuery(`drop index ${indexName}`);
	  }

	  unique(columns, indexName) {
	    let deferrable;
	    if (isObject(indexName)) {
	      ({ indexName, deferrable } = indexName);
	    }
	    deferrable = deferrable ? ` deferrable initially ${deferrable}` : '';
	    indexName = indexName
	      ? this.formatter.wrap(indexName)
	      : this._indexCommand('unique', this.tableNameRaw, columns);
	    this.pushQuery(
	      `alter table ${this.tableName()} add constraint ${indexName}` +
	        ' unique (' +
	        this.formatter.columnize(columns) +
	        ')' +
	        deferrable
	    );
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

	TableCompiler_Oracle.prototype.addColumnsPrefix = 'add ';
	TableCompiler_Oracle.prototype.alterColumnsPrefix = 'modify ';

	oracleTablecompiler = TableCompiler_Oracle;
	return oracleTablecompiler;
}

var oracle;
var hasRequiredOracle;

function requireOracle () {
	if (hasRequiredOracle) return oracle;
	hasRequiredOracle = 1;
	// Oracle Client
	// -------
	const { ReturningHelper } = requireUtils$1();
	const { isConnectionError } = requireUtils$1();
	const Client = client;
	const SchemaCompiler = requireOracleCompiler();
	const ColumnBuilder = requireOracleColumnbuilder();
	const ColumnCompiler = requireOracleColumncompiler();
	const TableCompiler = requireOracleTablecompiler();

	// Always initialize with the "QueryBuilder" and "QueryCompiler"
	// objects, which extend the base 'lib/query/builder' and
	// 'lib/query/compiler', respectively.
	class Client_Oracle extends Client {
	  schemaCompiler() {
	    return new SchemaCompiler(this, ...arguments);
	  }

	  columnBuilder() {
	    return new ColumnBuilder(this, ...arguments);
	  }

	  columnCompiler() {
	    return new ColumnCompiler(this, ...arguments);
	  }

	  tableCompiler() {
	    return new TableCompiler(this, ...arguments);
	  }

	  // Return the database for the Oracle client.
	  database() {
	    return this.connectionSettings.database;
	  }

	  // Position the bindings for the query.
	  positionBindings(sql) {
	    let questionCount = 0;
	    return sql.replace(/\?/g, function () {
	      questionCount += 1;
	      return `:${questionCount}`;
	    });
	  }

	  _stream(connection, obj, stream, options) {
	    if (!obj.sql) throw new Error('The query is empty');

	    return new Promise(function (resolver, rejecter) {
	      stream.on('error', (err) => {
	        if (isConnectionError(err)) {
	          connection.__knex__disposed = err;
	        }
	        rejecter(err);
	      });
	      stream.on('end', resolver);
	      const queryStream = connection.queryStream(
	        obj.sql,
	        obj.bindings,
	        options
	      );
	      queryStream.pipe(stream);
	      queryStream.on('error', function (error) {
	        rejecter(error);
	        stream.emit('error', error);
	      });
	    });
	  }

	  // Formatter part

	  alias(first, second) {
	    return first + ' ' + second;
	  }

	  parameter(value, builder, formatter) {
	    // Returning helper uses always ROWID as string
	    if (value instanceof ReturningHelper && this.driver) {
	      value = new this.driver.OutParam(this.driver.OCCISTRING);
	    } else if (typeof value === 'boolean') {
	      value = value ? 1 : 0;
	    }
	    return super.parameter(value, builder, formatter);
	  }
	}

	Object.assign(Client_Oracle.prototype, {
	  dialect: 'oracle',

	  driverName: 'oracle',
	});

	oracle = Client_Oracle;
	return oracle;
}

/* eslint max-len:0 */

var oracleQuerycompiler;
var hasRequiredOracleQuerycompiler;

function requireOracleQuerycompiler () {
	if (hasRequiredOracleQuerycompiler) return oracleQuerycompiler;
	hasRequiredOracleQuerycompiler = 1;
	// Oracle Query Builder & Compiler
	// ------
	const compact = compact_1;
	const identity = identity_1;
	const isEmpty = isEmpty_1;
	const isPlainObject = isPlainObject_1;
	const reduce = reduce_1;
	const QueryCompiler = querycompiler;
	const { ReturningHelper } = requireUtils$1();
	const { isString } = is;

	const components = [
	  'comments',
	  'columns',
	  'join',
	  'where',
	  'union',
	  'group',
	  'having',
	  'order',
	  'lock',
	];

	// Query Compiler
	// -------

	// Set the "Formatter" to use for the queries,
	// ensuring that all parameterized values (even across sub-queries)
	// are properly built into the same query.
	class QueryCompiler_Oracle extends QueryCompiler {
	  constructor(client, builder, formatter) {
	    super(client, builder, formatter);

	    const { onConflict } = this.single;
	    if (onConflict) {
	      throw new Error('.onConflict() is not supported for oracledb.');
	    }

	    // Compiles the `select` statement, or nested sub-selects
	    // by calling each of the component compilers, trimming out
	    // the empties, and returning a generated query string.
	    this.first = this.select;
	  }

	  // Compiles an "insert" query, allowing for multiple
	  // inserts using a single query statement.
	  insert() {
	    let insertValues = this.single.insert || [];
	    let { returning } = this.single;

	    if (!Array.isArray(insertValues) && isPlainObject(this.single.insert)) {
	      insertValues = [this.single.insert];
	    }

	    // always wrap returning argument in array
	    if (returning && !Array.isArray(returning)) {
	      returning = [returning];
	    }

	    if (
	      Array.isArray(insertValues) &&
	      insertValues.length === 1 &&
	      isEmpty(insertValues[0])
	    ) {
	      return this._addReturningToSqlAndConvert(
	        `insert into ${this.tableName} (${this.formatter.wrap(
	          this.single.returning
	        )}) values (default)`,
	        returning,
	        this.tableName
	      );
	    }

	    if (
	      isEmpty(this.single.insert) &&
	      typeof this.single.insert !== 'function'
	    ) {
	      return '';
	    }

	    const insertData = this._prepInsert(insertValues);

	    const sql = {};

	    if (isString(insertData)) {
	      return this._addReturningToSqlAndConvert(
	        `insert into ${this.tableName} ${insertData}`,
	        returning
	      );
	    }

	    if (insertData.values.length === 1) {
	      return this._addReturningToSqlAndConvert(
	        `insert into ${this.tableName} (${this.formatter.columnize(
	          insertData.columns
	        )}) values (${this.client.parameterize(
	          insertData.values[0],
	          undefined,
	          this.builder,
	          this.bindingsHolder
	        )})`,
	        returning,
	        this.tableName
	      );
	    }

	    const insertDefaultsOnly = insertData.columns.length === 0;

	    sql.sql =
	      'begin ' +
	      insertData.values
	        .map((value) => {
	          let returningHelper;
	          const parameterizedValues = !insertDefaultsOnly
	            ? this.client.parameterize(
	                value,
	                this.client.valueForUndefined,
	                this.builder,
	                this.bindingsHolder
	              )
	            : '';
	          const returningValues = Array.isArray(returning)
	            ? returning
	            : [returning];
	          let subSql = `insert into ${this.tableName} `;

	          if (returning) {
	            returningHelper = new ReturningHelper(returningValues.join(':'));
	            sql.outParams = (sql.outParams || []).concat(returningHelper);
	          }

	          if (insertDefaultsOnly) {
	            // no columns given so only the default value
	            subSql += `(${this.formatter.wrap(
	              this.single.returning
	            )}) values (default)`;
	          } else {
	            subSql += `(${this.formatter.columnize(
	              insertData.columns
	            )}) values (${parameterizedValues})`;
	          }
	          subSql += returning
	            ? ` returning ROWID into ${this.client.parameter(
	                returningHelper,
	                this.builder,
	                this.bindingsHolder
	              )}`
	            : '';

	          // pre bind position because subSql is an execute immediate parameter
	          // later position binding will only convert the ? params

	          subSql = this.formatter.client.positionBindings(subSql);

	          const parameterizedValuesWithoutDefault = parameterizedValues
	            .replace('DEFAULT, ', '')
	            .replace(', DEFAULT', '');
	          return (
	            `execute immediate '${subSql.replace(/'/g, "''")}` +
	            (parameterizedValuesWithoutDefault || returning ? "' using " : '') +
	            parameterizedValuesWithoutDefault +
	            (parameterizedValuesWithoutDefault && returning ? ', ' : '') +
	            (returning ? 'out ?' : '') +
	            ';'
	          );
	        })
	        .join(' ') +
	      'end;';

	    if (returning) {
	      sql.returning = returning;
	      // generate select statement with special order by to keep the order because 'in (..)' may change the order
	      sql.returningSql =
	        `select ${this.formatter.columnize(returning)}` +
	        ' from ' +
	        this.tableName +
	        ' where ROWID in (' +
	        sql.outParams.map((v, i) => `:${i + 1}`).join(', ') +
	        ')' +
	        ' order by case ROWID ' +
	        sql.outParams
	          .map((v, i) => `when CHARTOROWID(:${i + 1}) then ${i}`)
	          .join(' ') +
	        ' end';
	    }

	    return sql;
	  }

	  // Update method, including joins, wheres, order & limits.
	  update() {
	    const updates = this._prepUpdate(this.single.update);
	    const where = this.where();
	    let { returning } = this.single;
	    const sql =
	      `update ${this.tableName}` +
	      ' set ' +
	      updates.join(', ') +
	      (where ? ` ${where}` : '');

	    if (!returning) {
	      return sql;
	    }

	    // always wrap returning argument in array
	    if (!Array.isArray(returning)) {
	      returning = [returning];
	    }

	    return this._addReturningToSqlAndConvert(sql, returning, this.tableName);
	  }

	  // Compiles a `truncate` query.
	  truncate() {
	    return `truncate table ${this.tableName}`;
	  }

	  forUpdate() {
	    return 'for update';
	  }

	  forShare() {
	    // lock for share is not directly supported by oracle
	    // use LOCK TABLE .. IN SHARE MODE; instead
	    this.client.logger.warn(
	      'lock for share is not supported by oracle dialect'
	    );
	    return '';
	  }

	  // Compiles a `columnInfo` query.
	  columnInfo() {
	    const column = this.single.columnInfo;

	    // The user may have specified a custom wrapIdentifier function in the config. We
	    // need to run the identifiers through that function, but not format them as
	    // identifiers otherwise.
	    const table = this.client.customWrapIdentifier(this.single.table, identity);

	    // Node oracle drivers doesn't support LONG type (which is data_default type)
	    const sql = `select * from xmltable( '/ROWSET/ROW'
      passing dbms_xmlgen.getXMLType('
      select char_col_decl_length, column_name, data_type, data_default, nullable
      from all_tab_columns where table_name = ''${table}'' ')
      columns
      CHAR_COL_DECL_LENGTH number, COLUMN_NAME varchar2(200), DATA_TYPE varchar2(106),
      DATA_DEFAULT clob, NULLABLE varchar2(1))`;

	    return {
	      sql: sql,
	      output(resp) {
	        const out = reduce(
	          resp,
	          function (columns, val) {
	            columns[val.COLUMN_NAME] = {
	              type: val.DATA_TYPE,
	              defaultValue: val.DATA_DEFAULT,
	              maxLength: val.CHAR_COL_DECL_LENGTH,
	              nullable: val.NULLABLE === 'Y',
	            };
	            return columns;
	          },
	          {}
	        );
	        return (column && out[column]) || out;
	      },
	    };
	  }

	  select() {
	    let query = this.with();
	    const statements = components.map((component) => {
	      return this[component]();
	    });
	    query += compact(statements).join(' ');
	    return this._surroundQueryWithLimitAndOffset(query);
	  }

	  aggregate(stmt) {
	    return this._aggregate(stmt, { aliasSeparator: ' ' });
	  }

	  // for single commands only
	  _addReturningToSqlAndConvert(sql, returning, tableName) {
	    const res = {
	      sql,
	    };

	    if (!returning) {
	      return res;
	    }

	    const returningValues = Array.isArray(returning) ? returning : [returning];
	    const returningHelper = new ReturningHelper(returningValues.join(':'));
	    res.sql =
	      sql +
	      ' returning ROWID into ' +
	      this.client.parameter(returningHelper, this.builder, this.bindingsHolder);
	    res.returningSql = `select ${this.formatter.columnize(
	      returning
	    )} from ${tableName} where ROWID = :1`;
	    res.outParams = [returningHelper];
	    res.returning = returning;
	    return res;
	  }

	  _surroundQueryWithLimitAndOffset(query) {
	    let { limit } = this.single;
	    const { offset } = this.single;
	    const hasLimit = limit || limit === 0 || limit === '0';
	    limit = +limit;

	    if (!hasLimit && !offset) return query;
	    query = query || '';

	    if (hasLimit && !offset) {
	      return `select * from (${query}) where rownum <= ${this._getValueOrParameterFromAttribute(
	        'limit',
	        limit
	      )}`;
	    }

	    const endRow = +offset + (hasLimit ? limit : 10000000000000);

	    return (
	      'select * from ' +
	      '(select row_.*, ROWNUM rownum_ from (' +
	      query +
	      ') row_ ' +
	      'where rownum <= ' +
	      (this.single.skipBinding['offset']
	        ? endRow
	        : this.client.parameter(endRow, this.builder, this.bindingsHolder)) +
	      ') ' +
	      'where rownum_ > ' +
	      this._getValueOrParameterFromAttribute('offset', offset)
	    );
	  }
	}

	oracleQuerycompiler = QueryCompiler_Oracle;
	return oracleQuerycompiler;
}

var utils;
var hasRequiredUtils;

function requireUtils () {
	if (hasRequiredUtils) return utils;
	hasRequiredUtils = 1;
	const Utils = requireUtils$1();
	const { promisify } = util;
	const stream = require$$2;

	function BlobHelper(columnName, value) {
	  this.columnName = columnName;
	  this.value = value;
	  this.returning = false;
	}

	BlobHelper.prototype.toString = function () {
	  return '[object BlobHelper:' + this.columnName + ']';
	};

	/**
	 * @param stream
	 * @param {'string' | 'buffer'} type
	 */
	function readStream(stream, type) {
	  return new Promise((resolve, reject) => {
	    let data = type === 'string' ? '' : Buffer.alloc(0);

	    stream.on('error', function (err) {
	      reject(err);
	    });
	    stream.on('data', function (chunk) {
	      if (type === 'string') {
	        data += chunk;
	      } else {
	        data = Buffer.concat([data, chunk]);
	      }
	    });
	    stream.on('end', function () {
	      resolve(data);
	    });
	  });
	}

	const lobProcessing = function (stream) {
	  const oracledb = require$$9;

	  /**
	   * @type 'string' | 'buffer'
	   */
	  let type;

	  if (stream.type) {
	    // v1.2-v4
	    if (stream.type === oracledb.BLOB) {
	      type = 'buffer';
	    } else if (stream.type === oracledb.CLOB) {
	      type = 'string';
	    }
	  } else if (stream.iLob) {
	    // v1
	    if (stream.iLob.type === oracledb.CLOB) {
	      type = 'string';
	    } else if (stream.iLob.type === oracledb.BLOB) {
	      type = 'buffer';
	    }
	  } else {
	    throw new Error('Unrecognized oracledb lob stream type');
	  }
	  if (type === 'string') {
	    stream.setEncoding('utf-8');
	  }
	  return readStream(stream, type);
	};

	function monkeyPatchConnection(connection, client) {
	  // Connection is already monkey-patched
	  if (connection.executeAsync) {
	    return;
	  }

	  connection.commitAsync = function () {
	    return new Promise((commitResolve, commitReject) => {
	      this.commit(function (err) {
	        if (err) {
	          return commitReject(err);
	        }
	        commitResolve();
	      });
	    });
	  };
	  connection.rollbackAsync = function () {
	    return new Promise((rollbackResolve, rollbackReject) => {
	      this.rollback(function (err) {
	        if (err) {
	          return rollbackReject(err);
	        }
	        rollbackResolve();
	      });
	    });
	  };
	  const fetchAsync = promisify(function (sql, bindParams, options, cb) {
	    options = options || {};
	    options.outFormat = client.driver.OUT_FORMAT_OBJECT || client.driver.OBJECT;
	    if (!options.outFormat) {
	      throw new Error('not found oracledb.outFormat constants');
	    }
	    if (options.resultSet) {
	      connection.execute(
	        sql,
	        bindParams || [],
	        options,
	        function (err, result) {
	          if (err) {
	            if (Utils.isConnectionError(err)) {
	              connection.close().catch(function (err) {});
	              connection.__knex__disposed = err;
	            }
	            return cb(err);
	          }
	          const fetchResult = { rows: [], resultSet: result.resultSet };
	          const numRows = 100;
	          const fetchRowsFromRS = function (connection, resultSet, numRows) {
	            resultSet.getRows(numRows, function (err, rows) {
	              if (err) {
	                if (Utils.isConnectionError(err)) {
	                  connection.close().catch(function (err) {});
	                  connection.__knex__disposed = err;
	                }
	                resultSet.close(function () {
	                  return cb(err);
	                });
	              } else if (rows.length === 0) {
	                return cb(null, fetchResult);
	              } else if (rows.length > 0) {
	                if (rows.length === numRows) {
	                  fetchResult.rows = fetchResult.rows.concat(rows);
	                  fetchRowsFromRS(connection, resultSet, numRows);
	                } else {
	                  fetchResult.rows = fetchResult.rows.concat(rows);
	                  return cb(null, fetchResult);
	                }
	              }
	            });
	          };
	          fetchRowsFromRS(connection, result.resultSet, numRows);
	        }
	      );
	    } else {
	      connection.execute(
	        sql,
	        bindParams || [],
	        options,
	        function (err, result) {
	          if (err) {
	            // dispose the connection on connection error
	            if (Utils.isConnectionError(err)) {
	              connection.close().catch(function (err) {});
	              connection.__knex__disposed = err;
	            }
	            return cb(err);
	          }

	          return cb(null, result);
	        }
	      );
	    }
	  });
	  connection.executeAsync = function (sql, bindParams, options) {
	    // Read all lob
	    return fetchAsync(sql, bindParams, options).then(async (results) => {
	      const closeResultSet = () => {
	        return results.resultSet
	          ? promisify(results.resultSet.close).call(results.resultSet)
	          : Promise.resolve();
	      };

	      // Collect LOBs to read
	      const lobs = [];
	      if (results.rows) {
	        if (Array.isArray(results.rows)) {
	          for (let i = 0; i < results.rows.length; i++) {
	            // Iterate through the rows
	            const row = results.rows[i];
	            for (const column in row) {
	              if (row[column] instanceof stream.Readable) {
	                lobs.push({ index: i, key: column, stream: row[column] });
	              }
	            }
	          }
	        }
	      }

	      try {
	        for (const lob of lobs) {
	          // todo should be fetchAsString/fetchAsBuffer polyfill only
	          results.rows[lob.index][lob.key] = await lobProcessing(lob.stream);
	        }
	      } catch (e) {
	        await closeResultSet().catch(() => {});

	        throw e;
	      }

	      await closeResultSet();

	      return results;
	    });
	  };
	}

	Utils.BlobHelper = BlobHelper;
	Utils.monkeyPatchConnection = monkeyPatchConnection;
	utils = Utils;
	return utils;
}

var oracledbQuerycompiler;
var hasRequiredOracledbQuerycompiler;

function requireOracledbQuerycompiler () {
	if (hasRequiredOracledbQuerycompiler) return oracledbQuerycompiler;
	hasRequiredOracledbQuerycompiler = 1;
	const clone = clone_1;
	const each = each$2;
	const isEmpty = isEmpty_1;
	const isPlainObject = isPlainObject_1;
	const Oracle_Compiler = requireOracleQuerycompiler();
	const ReturningHelper = requireUtils().ReturningHelper;
	const BlobHelper = requireUtils().BlobHelper;
	const { isString } = is;
	const {
	  columnize: columnize_,
	} = wrappingFormatter;

	class Oracledb_Compiler extends Oracle_Compiler {
	  // Compiles an "insert" query, allowing for multiple
	  // inserts using a single query statement.
	  insert() {
	    const self = this;
	    const outBindPrep = this._prepOutbindings(
	      this.single.insert,
	      this.single.returning
	    );
	    const outBinding = outBindPrep.outBinding;
	    const returning = outBindPrep.returning;
	    const insertValues = outBindPrep.values;

	    if (
	      Array.isArray(insertValues) &&
	      insertValues.length === 1 &&
	      isEmpty(insertValues[0])
	    ) {
	      const returningFragment = this.single.returning
	        ? ' (' + this.formatter.wrap(this.single.returning) + ')'
	        : '';

	      return this._addReturningToSqlAndConvert(
	        'insert into ' +
	          this.tableName +
	          returningFragment +
	          ' values (default)',
	        outBinding[0],
	        this.tableName,
	        returning
	      );
	    }

	    if (
	      isEmpty(this.single.insert) &&
	      typeof this.single.insert !== 'function'
	    ) {
	      return '';
	    }

	    const insertData = this._prepInsert(insertValues);

	    const sql = {};

	    if (isString(insertData)) {
	      return this._addReturningToSqlAndConvert(
	        'insert into ' + this.tableName + ' ' + insertData,
	        outBinding[0],
	        this.tableName,
	        returning
	      );
	    }

	    if (insertData.values.length === 1) {
	      return this._addReturningToSqlAndConvert(
	        'insert into ' +
	          this.tableName +
	          ' (' +
	          this.formatter.columnize(insertData.columns) +
	          ') values (' +
	          this.client.parameterize(
	            insertData.values[0],
	            undefined,
	            this.builder,
	            this.bindingsHolder
	          ) +
	          ')',
	        outBinding[0],
	        this.tableName,
	        returning
	      );
	    }

	    const insertDefaultsOnly = insertData.columns.length === 0;
	    sql.returning = returning;
	    sql.sql =
	      'begin ' +
	      insertData.values
	        .map(function (value, index) {
	          const parameterizedValues = !insertDefaultsOnly
	            ? self.client.parameterize(
	                value,
	                self.client.valueForUndefined,
	                self.builder,
	                self.bindingsHolder
	              )
	            : '';
	          let subSql = 'insert into ' + self.tableName;

	          if (insertDefaultsOnly) {
	            // No columns given so only the default value
	            subSql +=
	              ' (' +
	              self.formatter.wrap(self.single.returning) +
	              ') values (default)';
	          } else {
	            subSql +=
	              ' (' +
	              self.formatter.columnize(insertData.columns) +
	              ') values (' +
	              parameterizedValues +
	              ')';
	          }

	          let returningClause = '';
	          let intoClause = '';
	          // ToDo review if this code is still needed or could be dropped
	          // eslint-disable-next-line no-unused-vars
	          let usingClause = '';
	          let outClause = '';

	          each(value, function (val) {
	            if (!(val instanceof BlobHelper)) {
	              usingClause += ' ?,';
	            }
	          });
	          // eslint-disable-next-line no-unused-vars
	          usingClause = usingClause.slice(0, -1);

	          // Build returning and into clauses
	          outBinding[index].forEach(function (ret) {
	            const columnName = ret.columnName || ret;
	            returningClause += self.formatter.wrap(columnName) + ',';
	            intoClause += ' ?,';
	            outClause += ' out ?,';

	            // Add Helpers to bindings
	            if (ret instanceof BlobHelper) {
	              return self.formatter.bindings.push(ret);
	            }
	            self.formatter.bindings.push(new ReturningHelper(columnName));
	          });

	          // Strip last comma
	          returningClause = returningClause.slice(0, -1);
	          intoClause = intoClause.slice(0, -1);
	          outClause = outClause.slice(0, -1);

	          if (returningClause && intoClause) {
	            subSql += ' returning ' + returningClause + ' into' + intoClause;
	          }

	          // Pre bind position because subSql is an execute immediate parameter
	          // later position binding will only convert the ? params
	          subSql = self.formatter.client.positionBindings(subSql);
	          const parameterizedValuesWithoutDefaultAndBlob = parameterizedValues
	            .replace(/DEFAULT, /g, '')
	            .replace(/, DEFAULT/g, '')
	            .replace('EMPTY_BLOB(), ', '')
	            .replace(', EMPTY_BLOB()', '');
	          return (
	            "execute immediate '" +
	            subSql.replace(/'/g, "''") +
	            (parameterizedValuesWithoutDefaultAndBlob || value
	              ? "' using "
	              : '') +
	            parameterizedValuesWithoutDefaultAndBlob +
	            (parameterizedValuesWithoutDefaultAndBlob && outClause ? ',' : '') +
	            outClause +
	            ';'
	          );
	        })
	        .join(' ') +
	      'end;';

	    sql.outBinding = outBinding;
	    if (returning[0] === '*') {
	      // Generate select statement with special order by
	      // to keep the order because 'in (..)' may change the order
	      sql.returningSql = function () {
	        return (
	          'select * from ' +
	          self.tableName +
	          ' where ROWID in (' +
	          this.outBinding
	            .map(function (v, i) {
	              return ':' + (i + 1);
	            })
	            .join(', ') +
	          ')' +
	          ' order by case ROWID ' +
	          this.outBinding
	            .map(function (v, i) {
	              return 'when CHARTOROWID(:' + (i + 1) + ') then ' + i;
	            })
	            .join(' ') +
	          ' end'
	        );
	      };
	    }

	    return sql;
	  }

	  with() {
	    // WITH RECURSIVE is a syntax error in Oracle SQL.
	    // So mark all statements as non-recursive, generate the SQL, then restore.
	    // This approach ensures any changes in base class with() get propagated here.
	    const undoList = [];
	    if (this.grouped.with) {
	      for (const stmt of this.grouped.with) {
	        if (stmt.recursive) {
	          undoList.push(stmt);
	          stmt.recursive = false;
	        }
	      }
	    }

	    const result = super.with();

	    // Restore the recursive markings, in case this same query gets cloned and passed to other drivers.
	    for (const stmt of undoList) {
	      stmt.recursive = true;
	    }
	    return result;
	  }

	  _addReturningToSqlAndConvert(sql, outBinding, tableName, returning) {
	    const self = this;
	    const res = {
	      sql: sql,
	    };

	    if (!outBinding) {
	      return res;
	    }
	    const returningValues = Array.isArray(outBinding)
	      ? outBinding
	      : [outBinding];
	    let returningClause = '';
	    let intoClause = '';
	    // Build returning and into clauses
	    returningValues.forEach(function (ret) {
	      const columnName = ret.columnName || ret;
	      returningClause += self.formatter.wrap(columnName) + ',';
	      intoClause += '?,';

	      // Add Helpers to bindings
	      if (ret instanceof BlobHelper) {
	        return self.formatter.bindings.push(ret);
	      }
	      self.formatter.bindings.push(new ReturningHelper(columnName));
	    });
	    res.sql = sql;

	    // Strip last comma
	    returningClause = returningClause.slice(0, -1);
	    intoClause = intoClause.slice(0, -1);
	    if (returningClause && intoClause) {
	      res.sql += ' returning ' + returningClause + ' into ' + intoClause;
	    }
	    res.outBinding = [outBinding];
	    if (returning[0] === '*') {
	      res.returningSql = function () {
	        return 'select * from ' + self.tableName + ' where ROWID = :1';
	      };
	    }
	    res.returning = returning;

	    return res;
	  }

	  _prepOutbindings(paramValues, paramReturning) {
	    const result = {};
	    let params = paramValues || [];
	    let returning = paramReturning || [];
	    if (!Array.isArray(params) && isPlainObject(paramValues)) {
	      params = [params];
	    }
	    // Always wrap returning argument in array
	    if (returning && !Array.isArray(returning)) {
	      returning = [returning];
	    }

	    const outBinding = [];
	    // Handle Buffer value as Blob
	    each(params, function (values, index) {
	      if (returning[0] === '*') {
	        outBinding[index] = ['ROWID'];
	      } else {
	        outBinding[index] = clone(returning);
	      }
	      each(values, function (value, key) {
	        if (value instanceof Buffer) {
	          values[key] = new BlobHelper(key, value);

	          // Delete blob duplicate in returning
	          const blobIndex = outBinding[index].indexOf(key);
	          if (blobIndex >= 0) {
	            outBinding[index].splice(blobIndex, 1);
	            values[key].returning = true;
	          }
	          outBinding[index].push(values[key]);
	        }
	        if (value === undefined) {
	          delete params[index][key];
	        }
	      });
	    });
	    result.returning = returning;
	    result.outBinding = outBinding;
	    result.values = params;
	    return result;
	  }

	  _groupOrder(item, type) {
	    return super._groupOrderNulls(item, type);
	  }

	  update() {
	    const self = this;
	    const sql = {};
	    const outBindPrep = this._prepOutbindings(
	      this.single.update || this.single.counter,
	      this.single.returning
	    );
	    const outBinding = outBindPrep.outBinding;
	    const returning = outBindPrep.returning;

	    const updates = this._prepUpdate(this.single.update);
	    const where = this.where();

	    let returningClause = '';
	    let intoClause = '';

	    if (isEmpty(updates) && typeof this.single.update !== 'function') {
	      return '';
	    }

	    // Build returning and into clauses
	    outBinding.forEach(function (out) {
	      out.forEach(function (ret) {
	        const columnName = ret.columnName || ret;
	        returningClause += self.formatter.wrap(columnName) + ',';
	        intoClause += ' ?,';

	        // Add Helpers to bindings
	        if (ret instanceof BlobHelper) {
	          return self.formatter.bindings.push(ret);
	        }
	        self.formatter.bindings.push(new ReturningHelper(columnName));
	      });
	    });
	    // Strip last comma
	    returningClause = returningClause.slice(0, -1);
	    intoClause = intoClause.slice(0, -1);

	    sql.outBinding = outBinding;
	    sql.returning = returning;
	    sql.sql =
	      'update ' +
	      this.tableName +
	      ' set ' +
	      updates.join(', ') +
	      (where ? ' ' + where : '');
	    if (outBinding.length && !isEmpty(outBinding[0])) {
	      sql.sql += ' returning ' + returningClause + ' into' + intoClause;
	    }
	    if (returning[0] === '*') {
	      sql.returningSql = function () {
	        let sql = 'select * from ' + self.tableName;
	        const modifiedRowsCount = this.rowsAffected.length || this.rowsAffected;
	        let returningSqlIn = ' where ROWID in (';
	        let returningSqlOrderBy = ') order by case ROWID ';

	        // Needs special order by because in(...) change result order
	        for (let i = 0; i < modifiedRowsCount; i++) {
	          if (this.returning[0] === '*') {
	            returningSqlIn += ':' + (i + 1) + ', ';
	            returningSqlOrderBy +=
	              'when CHARTOROWID(:' + (i + 1) + ') then ' + i + ' ';
	          }
	        }
	        if (this.returning[0] === '*') {
	          this.returning = this.returning.slice(0, -1);
	          returningSqlIn = returningSqlIn.slice(0, -2);
	          returningSqlOrderBy = returningSqlOrderBy.slice(0, -1);
	        }
	        return (sql += returningSqlIn + returningSqlOrderBy + ' end');
	      };
	    }

	    return sql;
	  }

	  _jsonPathWrap(extraction) {
	    return `'${extraction.path || extraction[1]}'`;
	  }

	  // Json functions
	  jsonExtract(params) {
	    return this._jsonExtract(
	      params.singleValue ? 'json_value' : 'json_query',
	      params
	    );
	  }

	  jsonSet(params) {
	    return `json_transform(${columnize_(
	      params.column,
	      this.builder,
	      this.client,
	      this.bindingsHolder
	    )}, set ${this.client.parameter(
	      params.path,
	      this.builder,
	      this.bindingsHolder
	    )} = ${this.client.parameter(
	      params.value,
	      this.builder,
	      this.bindingsHolder
	    )})`;
	  }

	  jsonInsert(params) {
	    return `json_transform(${columnize_(
	      params.column,
	      this.builder,
	      this.client,
	      this.bindingsHolder
	    )}, insert ${this.client.parameter(
	      params.path,
	      this.builder,
	      this.bindingsHolder
	    )} = ${this.client.parameter(
	      params.value,
	      this.builder,
	      this.bindingsHolder
	    )})`;
	  }

	  jsonRemove(params) {
	    const jsonCol = `json_transform(${columnize_(
	      params.column,
	      this.builder,
	      this.client,
	      this.bindingsHolder
	    )}, remove ${this.client.parameter(
	      params.path,
	      this.builder,
	      this.bindingsHolder
	    )})`;
	    return params.alias
	      ? this.client.alias(jsonCol, this.formatter.wrap(params.alias))
	      : jsonCol;
	  }

	  whereJsonPath(statement) {
	    return this._whereJsonPath('json_value', statement);
	  }

	  whereJsonSupersetOf(statement) {
	    throw new Error(
	      'Json superset where clause not actually supported by Oracle'
	    );
	  }

	  whereJsonSubsetOf(statement) {
	    throw new Error(
	      'Json subset where clause not actually supported by Oracle'
	    );
	  }

	  onJsonPathEquals(clause) {
	    return this._onJsonPathEquals('json_value', clause);
	  }
	}

	oracledbQuerycompiler = Oracledb_Compiler;
	return oracledbQuerycompiler;
}

var oracledbTablecompiler;
var hasRequiredOracledbTablecompiler;

function requireOracledbTablecompiler () {
	if (hasRequiredOracledbTablecompiler) return oracledbTablecompiler;
	hasRequiredOracledbTablecompiler = 1;
	const TableCompiler_Oracle = requireOracleTablecompiler();

	class TableCompiler_Oracledb extends TableCompiler_Oracle {
	  constructor(client, tableBuilder) {
	    super(client, tableBuilder);
	  }

	  _setNullableState(column, isNullable) {
	    const nullability = isNullable ? 'NULL' : 'NOT NULL';
	    const sql = `alter table ${this.tableName()} modify (${this.formatter.wrap(
	      column
	    )} ${nullability})`;
	    return this.pushQuery({
	      sql: sql,
	    });
	  }
	}

	oracledbTablecompiler = TableCompiler_Oracledb;
	return oracledbTablecompiler;
}

var oracledbColumncompiler;
var hasRequiredOracledbColumncompiler;

function requireOracledbColumncompiler () {
	if (hasRequiredOracledbColumncompiler) return oracledbColumncompiler;
	hasRequiredOracledbColumncompiler = 1;
	const ColumnCompiler_Oracle = requireOracleColumncompiler();
	const { isObject } = is;

	class ColumnCompiler_Oracledb extends ColumnCompiler_Oracle {
	  constructor() {
	    super(...arguments);
	    this.modifiers = ['defaultTo', 'nullable', 'comment', 'checkJson'];
	    this._addCheckModifiers();
	  }

	  datetime(withoutTz) {
	    let useTz;
	    if (isObject(withoutTz)) {
	      ({ useTz } = withoutTz);
	    } else {
	      useTz = !withoutTz;
	    }
	    return useTz ? 'timestamp with local time zone' : 'timestamp';
	  }

	  timestamp(withoutTz) {
	    let useTz;
	    if (isObject(withoutTz)) {
	      ({ useTz } = withoutTz);
	    } else {
	      useTz = !withoutTz;
	    }
	    return useTz ? 'timestamp with local time zone' : 'timestamp';
	  }

	  checkRegex(regex, constraintName) {
	    return this._check(
	      `REGEXP_LIKE(${this.formatter.wrap(
	        this.getColumnName()
	      )},${this.client._escapeBinding(regex)})`,
	      constraintName
	    );
	  }

	  json() {
	    // implicitly add the check for json
	    this.columnBuilder._modifiers.checkJson = [
	      this.formatter.columnize(this.getColumnName()),
	    ];
	    return 'varchar2(4000)';
	  }

	  jsonb() {
	    return this.json();
	  }

	  checkJson(column) {
	    return `check (${column} is json)`;
	  }
	}

	ColumnCompiler_Oracledb.prototype.time = 'timestamp with local time zone';
	ColumnCompiler_Oracledb.prototype.uuid = ({ useBinaryUuid = false } = {}) =>
	  useBinaryUuid ? 'raw(16)' : 'char(36)';

	oracledbColumncompiler = ColumnCompiler_Oracledb;
	return oracledbColumncompiler;
}

/* eslint max-len: 0 */

var oracledbViewcompiler;
var hasRequiredOracledbViewcompiler;

function requireOracledbViewcompiler () {
	if (hasRequiredOracledbViewcompiler) return oracledbViewcompiler;
	hasRequiredOracledbViewcompiler = 1;
	const ViewCompiler = viewcompiler;

	class ViewCompiler_Oracledb extends ViewCompiler {
	  constructor(client, viewCompiler) {
	    super(client, viewCompiler);
	  }

	  createOrReplace() {
	    this.createQuery(this.columns, this.selectQuery, false, true);
	  }

	  createMaterializedView() {
	    this.createQuery(this.columns, this.selectQuery, true);
	  }
	}

	oracledbViewcompiler = ViewCompiler_Oracledb;
	return oracledbViewcompiler;
}

var oracledbViewbuilder;
var hasRequiredOracledbViewbuilder;

function requireOracledbViewbuilder () {
	if (hasRequiredOracledbViewbuilder) return oracledbViewbuilder;
	hasRequiredOracledbViewbuilder = 1;
	const ViewBuilder = viewbuilder;

	class ViewBuilder_Oracledb extends ViewBuilder {
	  constructor() {
	    super(...arguments);
	  }

	  checkOption() {
	    this._single.checkOption = 'default_option';
	  }
	}

	oracledbViewbuilder = ViewBuilder_Oracledb;
	return oracledbViewbuilder;
}

var transaction$1;
var hasRequiredTransaction$1;

function requireTransaction$1 () {
	if (hasRequiredTransaction$1) return transaction$1;
	hasRequiredTransaction$1 = 1;
	const Transaction = transaction$5;
	const { timeout, KnexTimeoutError } = timeout$3;
	const debugTx = browserExports('knex:tx');

	transaction$1 = class Oracle_Transaction extends Transaction {
	  // disable autocommit to allow correct behavior (default is true)
	  begin(conn) {
	    if (this.isolationLevel) {
	      {
	        this.client.logger.warn(
	          'Transaction isolation is not currently supported for Oracle'
	        );
	      }
	    }
	    return Promise.resolve();
	  }

	  async commit(conn, value) {
	    this._completed = true;
	    try {
	      await conn.commitAsync();
	      this._resolver(value);
	    } catch (err) {
	      this._rejecter(err);
	    }
	  }

	  release(conn, value) {
	    return this._resolver(value);
	  }

	  rollback(conn, err) {
	    this._completed = true;
	    debugTx('%s: rolling back', this.txid);
	    return timeout(conn.rollbackAsync(), 5000)
	      .catch((e) => {
	        if (!(e instanceof KnexTimeoutError)) {
	          return Promise.reject(e);
	        }
	        this._rejecter(e);
	      })
	      .then(() => {
	        if (err === undefined) {
	          if (this.doNotRejectOnRollback) {
	            this._resolver();
	            return;
	          }
	          err = new Error(`Transaction rejected with non-error: ${err}`);
	        }
	        this._rejecter(err);
	      });
	  }

	  savepoint(conn) {
	    return this.query(conn, `SAVEPOINT ${this.txid}`);
	  }

	  async acquireConnection(config, cb) {
	    const configConnection = config && config.connection;

	    const connection =
	      configConnection || (await this.client.acquireConnection());
	    try {
	      connection.__knexTxId = this.txid;
	      connection.isTransaction = true;
	      return await cb(connection);
	    } finally {
	      debugTx('%s: releasing connection', this.txid);
	      connection.isTransaction = false;
	      try {
	        await connection.commitAsync();
	      } catch (err) {
	        this._rejecter(err);
	      } finally {
	        if (!configConnection) {
	          await this.client.releaseConnection(connection);
	        } else {
	          debugTx('%s: not releasing external connection', this.txid);
	        }
	      }
	    }
	  }
	};
	return transaction$1;
}

var oracledb;
var hasRequiredOracledb;

function requireOracledb () {
	if (hasRequiredOracledb) return oracledb;
	hasRequiredOracledb = 1;
	// Oracledb Client
	// -------
	const each = each$2;
	const flatten = flatten_1;
	const isEmpty = isEmpty_1;
	const map = map_1;

	const Formatter = formatter;
	const QueryCompiler = requireOracledbQuerycompiler();
	const TableCompiler = requireOracledbTablecompiler();
	const ColumnCompiler = requireOracledbColumncompiler();
	const {
	  BlobHelper,
	  ReturningHelper,
	  monkeyPatchConnection,
	} = requireUtils();
	const ViewCompiler = requireOracledbViewcompiler();
	const ViewBuilder = requireOracledbViewbuilder();
	const Transaction = requireTransaction$1();
	const Client_Oracle = requireOracle();
	const { isString } = is;
	const { outputQuery, unwrapRaw } = wrappingFormatter;
	const { compileCallback } = formatterUtils;

	class Client_Oracledb extends Client_Oracle {
	  constructor(config) {
	    super(config);

	    if (this.version) {
	      // Normalize version format; null bad format
	      // to trigger fallback to auto-detect.
	      this.version = parseVersion(this.version);
	    }

	    if (this.driver) {
	      process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || 1;
	      process.env.UV_THREADPOOL_SIZE =
	        parseInt(process.env.UV_THREADPOOL_SIZE) + this.driver.poolMax;
	    }
	  }

	  _driver() {
	    const client = this;
	    const oracledb = require$$9;
	    client.fetchAsString = [];
	    if (this.config.fetchAsString && Array.isArray(this.config.fetchAsString)) {
	      this.config.fetchAsString.forEach(function (type) {
	        if (!isString(type)) return;
	        type = type.toUpperCase();
	        if (oracledb[type]) {
	          if (
	            type !== 'NUMBER' &&
	            type !== 'DATE' &&
	            type !== 'CLOB' &&
	            type !== 'BUFFER'
	          ) {
	            this.logger.warn(
	              'Only "date", "number", "clob" and "buffer" are supported for fetchAsString'
	            );
	          }
	          client.fetchAsString.push(oracledb[type]);
	        }
	      });
	    }
	    return oracledb;
	  }

	  queryCompiler(builder, formatter) {
	    return new QueryCompiler(this, builder, formatter);
	  }

	  tableCompiler() {
	    return new TableCompiler(this, ...arguments);
	  }

	  columnCompiler() {
	    return new ColumnCompiler(this, ...arguments);
	  }

	  viewBuilder() {
	    return new ViewBuilder(this, ...arguments);
	  }

	  viewCompiler() {
	    return new ViewCompiler(this, ...arguments);
	  }

	  formatter(builder) {
	    return new Formatter(this, builder);
	  }

	  transaction() {
	    return new Transaction(this, ...arguments);
	  }

	  prepBindings(bindings) {
	    return map(bindings, (value) => {
	      if (value instanceof BlobHelper && this.driver) {
	        return { type: this.driver.BLOB, dir: this.driver.BIND_OUT };
	        // Returning helper always use ROWID as string
	      } else if (value instanceof ReturningHelper && this.driver) {
	        return { type: this.driver.STRING, dir: this.driver.BIND_OUT };
	      } else if (typeof value === 'boolean') {
	        return value ? 1 : 0;
	      }
	      return value;
	    });
	  }

	  // Checks whether a value is a function... if it is, we compile it
	  // otherwise we check whether it's a raw
	  parameter(value, builder, formatter) {
	    if (typeof value === 'function') {
	      return outputQuery(
	        compileCallback(value, undefined, this, formatter),
	        true,
	        builder,
	        this
	      );
	    } else if (value instanceof BlobHelper) {
	      formatter.bindings.push(value.value);
	      return '?';
	    }
	    return unwrapRaw(value, true, builder, this, formatter) || '?';
	  }

	  // Get a raw connection, called by the `pool` whenever a new
	  // connection needs to be added to the pool.
	  acquireRawConnection() {
	    return new Promise((resolver, rejecter) => {
	      // If external authentication don't have to worry about username/password and
	      // if not need to set the username and password
	      const oracleDbConfig = this.connectionSettings.externalAuth
	        ? { externalAuth: this.connectionSettings.externalAuth }
	        : {
	            user: this.connectionSettings.user,
	            password: this.connectionSettings.password,
	          };

	      // In the case of external authentication connection string will be given
	      oracleDbConfig.connectString = resolveConnectString(
	        this.connectionSettings
	      );

	      if (this.connectionSettings.prefetchRowCount) {
	        oracleDbConfig.prefetchRows = this.connectionSettings.prefetchRowCount;
	      }

	      if (this.connectionSettings.stmtCacheSize !== undefined) {
	        oracleDbConfig.stmtCacheSize = this.connectionSettings.stmtCacheSize;
	      }

	      this.driver.fetchAsString = this.fetchAsString;

	      this.driver.getConnection(oracleDbConfig, (err, connection) => {
	        if (err) {
	          return rejecter(err);
	        }
	        monkeyPatchConnection(connection, this);

	        resolver(connection);
	      });
	    });
	  }

	  // Used to explicitly close a connection, called internally by the pool
	  // when a connection times out or the pool is shutdown.
	  destroyRawConnection(connection) {
	    return connection.release();
	  }

	  // Handle oracle version resolution on acquiring connection from pool instead of connection creation.
	  // Must do this here since only the client used to create a connection would be updated with version
	  // information on creation. Poses a problem when knex instance is cloned since instances share the
	  // connection pool while having their own client instances.
	  async acquireConnection() {
	    const connection = await super.acquireConnection();
	    this.checkVersion(connection);
	    return connection;
	  }

	  // In Oracle, we need to check the version to dynamically determine
	  // certain limits. If user did not specify a version, get it from the connection.
	  checkVersion(connection) {
	    // Already determined version before?
	    if (this.version) {
	      return this.version;
	    }

	    const detectedVersion = parseVersion(connection.oracleServerVersionString);
	    if (!detectedVersion) {
	      // When original version is set to null, user-provided version was invalid and we fell-back to auto-detect.
	      // Otherwise, we couldn't auto-detect at all. Set error message accordingly.
	      throw new Error(
	        this.version === null
	          ? 'Invalid Oracledb version number format passed to knex. Unable to successfully auto-detect as fallback. Please specify a valid oracledb version.'
	          : 'Unable to detect Oracledb version number automatically. Please specify the version in knex configuration.'
	      );
	    }

	    this.version = detectedVersion;
	    return detectedVersion;
	  }

	  // Runs the query on the specified connection, providing the bindings
	  // and any other necessary prep work.
	  _query(connection, obj) {
	    if (!obj.sql) throw new Error('The query is empty');

	    const options = Object.assign({}, obj.options, { autoCommit: false });
	    if (obj.method === 'select') {
	      options.resultSet = true;
	    }
	    return connection
	      .executeAsync(obj.sql, obj.bindings, options)
	      .then(async function (response) {
	        // Flatten outBinds
	        let outBinds = flatten(response.outBinds);
	        obj.response = response.rows || [];
	        obj.rowsAffected = response.rows
	          ? response.rows.rowsAffected
	          : response.rowsAffected;

	        //added for outBind parameter
	        if (obj.method === 'raw' && outBinds.length > 0) {
	          return {
	            response: outBinds,
	          };
	        }

	        if (obj.method === 'update') {
	          const modifiedRowsCount = obj.rowsAffected.length || obj.rowsAffected;
	          const updatedObjOutBinding = [];
	          const updatedOutBinds = [];
	          const updateOutBinds = (i) =>
	            function (value, index) {
	              const OutBindsOffset = index * modifiedRowsCount;
	              updatedOutBinds.push(outBinds[i + OutBindsOffset]);
	            };

	          for (let i = 0; i < modifiedRowsCount; i++) {
	            updatedObjOutBinding.push(obj.outBinding[0]);
	            each(obj.outBinding[0], updateOutBinds(i));
	          }
	          outBinds = updatedOutBinds;
	          obj.outBinding = updatedObjOutBinding;
	        }

	        if (!obj.returning && outBinds.length === 0) {
	          if (!connection.isTransaction) {
	            await connection.commitAsync();
	          }
	          return obj;
	        }
	        const rowIds = [];
	        let offset = 0;

	        for (let line = 0; line < obj.outBinding.length; line++) {
	          const ret = obj.outBinding[line];

	          offset =
	            offset +
	            (obj.outBinding[line - 1] ? obj.outBinding[line - 1].length : 0);

	          for (let index = 0; index < ret.length; index++) {
	            const out = ret[index];

	            await new Promise(function (bindResolver, bindRejecter) {
	              if (out instanceof BlobHelper) {
	                const blob = outBinds[index + offset];
	                if (out.returning) {
	                  obj.response[line] = obj.response[line] || {};
	                  obj.response[line][out.columnName] = out.value;
	                }
	                blob.on('error', function (err) {
	                  bindRejecter(err);
	                });
	                blob.on('finish', function () {
	                  bindResolver();
	                });
	                blob.write(out.value);
	                blob.end();
	              } else if (obj.outBinding[line][index] === 'ROWID') {
	                rowIds.push(outBinds[index + offset]);
	                bindResolver();
	              } else {
	                obj.response[line] = obj.response[line] || {};
	                obj.response[line][out] = outBinds[index + offset];
	                bindResolver();
	              }
	            });
	          }
	        }
	        if (obj.returningSql) {
	          const response = await connection.executeAsync(
	            obj.returningSql(),
	            rowIds,
	            { resultSet: true }
	          );
	          obj.response = response.rows;
	        }
	        if (connection.isTransaction) {
	          return obj;
	        }
	        await connection.commitAsync();
	        return obj;
	      });
	  }

	  // Process the response as returned from the query.
	  processResponse(obj, runner) {
	    const { response } = obj;
	    if (obj.output) {
	      return obj.output.call(runner, response);
	    }
	    switch (obj.method) {
	      case 'select':
	        return response;
	      case 'first':
	        return response[0];
	      case 'pluck':
	        return map(response, obj.pluck);
	      case 'insert':
	      case 'del':
	      case 'update':
	      case 'counter':
	        if ((obj.returning && !isEmpty(obj.returning)) || obj.returningSql) {
	          return response;
	        } else if (obj.rowsAffected !== undefined) {
	          return obj.rowsAffected;
	        } else {
	          return 1;
	        }
	      default:
	        return response;
	    }
	  }

	  processPassedConnection(connection) {
	    this.checkVersion(connection);
	    monkeyPatchConnection(connection, this);
	  }
	}

	Client_Oracledb.prototype.driverName = 'oracledb';

	function parseVersion(versionString) {
	  try {
	    // We only care about first two version components at most
	    const versionParts = versionString.split('.').slice(0, 2);
	    // Strip off any character suffixes in version number (ex. 12c => 12, 12.2c => 12.2)
	    versionParts.forEach((versionPart, idx) => {
	      versionParts[idx] = versionPart.replace(/\D$/, '');
	    });
	    const version = versionParts.join('.');
	    return version.match(/^\d+\.?\d*$/) ? version : null;
	  } catch (err) {
	    // Non-string versionString passed in.
	    return null;
	  }
	}

	function resolveConnectString(connectionSettings) {
	  if (connectionSettings.connectString) {
	    return connectionSettings.connectString;
	  }

	  if (!connectionSettings.port) {
	    return connectionSettings.host + '/' + connectionSettings.database;
	  }

	  return (
	    connectionSettings.host +
	    ':' +
	    connectionSettings.port +
	    '/' +
	    connectionSettings.database
	  );
	}

	oracledb = Client_Oracledb;
	return oracledb;
}

var pgnative;
var hasRequiredPgnative;

function requirePgnative () {
	if (hasRequiredPgnative) return pgnative;
	hasRequiredPgnative = 1;
	// PostgreSQL Native Driver (pg-native)
	// -------
	const Client_PG = requirePostgres();

	class Client_PgNative extends Client_PG {
	  constructor(...args) {
	    super(...args);
	    this.driverName = 'pgnative';
	    this.canCancelQuery = true;
	  }

	  _driver() {
	    return require$$9.native;
	  }

	  _stream(connection, obj, stream, options) {
	    if (!obj.sql) throw new Error('The query is empty');

	    const client = this;
	    return new Promise((resolver, rejecter) => {
	      stream.on('error', rejecter);
	      stream.on('end', resolver);

	      return client
	        ._query(connection, obj)
	        .then((obj) => obj.response)
	        .then(({ rows }) => rows.forEach((row) => stream.write(row)))
	        .catch(function (err) {
	          stream.emit('error', err);
	        })
	        .then(function () {
	          stream.end();
	        });
	    });
	  }

	  async cancelQuery(connectionToKill) {
	    try {
	      return await this._wrappedCancelQueryCall(null, connectionToKill);
	    } catch (err) {
	      this.logger.warn(`Connection Error: ${err}`);
	      throw err;
	    }
	  }

	  _wrappedCancelQueryCall(emptyConnection, connectionToKill) {
	    return new Promise(function (resolve, reject) {
	      connectionToKill.native.cancel(function (err) {
	        if (err) {
	          reject(err);
	          return;
	        }

	        resolve(true);
	      });
	    });
	  }
	}

	pgnative = Client_PgNative;
	return pgnative;
}

var transaction;
var hasRequiredTransaction;

function requireTransaction () {
	if (hasRequiredTransaction) return transaction;
	hasRequiredTransaction = 1;
	const Transaction = transaction$5;

	transaction = class Redshift_Transaction extends Transaction {
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
	    return this.query(conn, `BEGIN ${trxMode};`);
	  }

	  savepoint(conn) {
	    this.trxClient.logger('Redshift does not support savepoints.');
	    return Promise.resolve();
	  }

	  release(conn, value) {
	    this.trxClient.logger('Redshift does not support savepoints.');
	    return Promise.resolve();
	  }

	  rollbackTo(conn, error) {
	    this.trxClient.logger('Redshift does not support savepoints.');
	    return Promise.resolve();
	  }
	};
	return transaction;
}

var redshiftQuerycompiler;
var hasRequiredRedshiftQuerycompiler;

function requireRedshiftQuerycompiler () {
	if (hasRequiredRedshiftQuerycompiler) return redshiftQuerycompiler;
	hasRequiredRedshiftQuerycompiler = 1;
	// Redshift Query Builder & Compiler
	// ------
	const QueryCompiler = querycompiler;
	const QueryCompiler_PG = requirePgQuerycompiler();

	const identity = identity_1;
	const {
	  columnize: columnize_,
	} = wrappingFormatter;

	class QueryCompiler_Redshift extends QueryCompiler_PG {
	  truncate() {
	    return `truncate ${this.tableName.toLowerCase()}`;
	  }

	  // Compiles an `insert` query, allowing for multiple
	  // inserts using a single query statement.
	  insert() {
	    const sql = QueryCompiler.prototype.insert.apply(this, arguments);
	    if (sql === '') return sql;
	    this._slightReturn();
	    return {
	      sql,
	    };
	  }

	  // Compiles an `update` query, warning on unsupported returning
	  update() {
	    const sql = QueryCompiler.prototype.update.apply(this, arguments);
	    this._slightReturn();
	    return {
	      sql,
	    };
	  }

	  // Compiles an `delete` query, warning on unsupported returning
	  del() {
	    const sql = QueryCompiler.prototype.del.apply(this, arguments);
	    this._slightReturn();
	    return {
	      sql,
	    };
	  }

	  // simple: if trying to return, warn
	  _slightReturn() {
	    if (this.single.isReturning) {
	      this.client.logger.warn(
	        'insert/update/delete returning is not supported by redshift dialect'
	      );
	    }
	  }

	  forUpdate() {
	    this.client.logger.warn('table lock is not supported by redshift dialect');
	    return '';
	  }

	  forShare() {
	    this.client.logger.warn(
	      'lock for share is not supported by redshift dialect'
	    );
	    return '';
	  }

	  forNoKeyUpdate() {
	    this.client.logger.warn('table lock is not supported by redshift dialect');
	    return '';
	  }

	  forKeyShare() {
	    this.client.logger.warn(
	      'lock for share is not supported by redshift dialect'
	    );
	    return '';
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
	      'select * from information_schema.columns where table_name = ? and table_catalog = ?';
	    const bindings = [
	      table.toLowerCase(),
	      this.client.database().toLowerCase(),
	    ];

	    return this._buildColumnInfoQuery(schema, sql, bindings, column);
	  }

	  jsonExtract(params) {
	    let extractions;
	    if (Array.isArray(params.column)) {
	      extractions = params.column;
	    } else {
	      extractions = [params];
	    }
	    return extractions
	      .map((extraction) => {
	        const jsonCol = `json_extract_path_text(${columnize_(
	          extraction.column || extraction[0],
	          this.builder,
	          this.client,
	          this.bindingsHolder
	        )}, ${this.client.toPathForJson(
	          params.path || extraction[1],
	          this.builder,
	          this.bindingsHolder
	        )})`;
	        const alias = extraction.alias || extraction[2];
	        return alias
	          ? this.client.alias(jsonCol, this.formatter.wrap(alias))
	          : jsonCol;
	      })
	      .join(', ');
	  }

	  jsonSet(params) {
	    throw new Error('Json set is not supported by Redshift');
	  }

	  jsonInsert(params) {
	    throw new Error('Json insert is not supported by Redshift');
	  }

	  jsonRemove(params) {
	    throw new Error('Json remove is not supported by Redshift');
	  }

	  whereJsonPath(statement) {
	    return this._whereJsonPath(
	      'json_extract_path_text',
	      Object.assign({}, statement, {
	        path: this.client.toPathForJson(statement.path),
	      })
	    );
	  }

	  whereJsonSupersetOf(statement) {
	    throw new Error('Json superset is not supported by Redshift');
	  }

	  whereJsonSubsetOf(statement) {
	    throw new Error('Json subset is not supported by Redshift');
	  }

	  onJsonPathEquals(clause) {
	    return this._onJsonPathEquals('json_extract_path_text', clause);
	  }
	}

	redshiftQuerycompiler = QueryCompiler_Redshift;
	return redshiftQuerycompiler;
}

var redshiftColumnbuilder;
var hasRequiredRedshiftColumnbuilder;

function requireRedshiftColumnbuilder () {
	if (hasRequiredRedshiftColumnbuilder) return redshiftColumnbuilder;
	hasRequiredRedshiftColumnbuilder = 1;
	const ColumnBuilder = columnbuilder;

	class ColumnBuilder_Redshift extends ColumnBuilder {
	  constructor() {
	    super(...arguments);
	  }

	  // primary needs to set not null on non-preexisting columns, or fail
	  primary() {
	    this.notNullable();
	    return super.primary(...arguments);
	  }

	  index() {
	    this.client.logger.warn(
	      'Redshift does not support the creation of indexes.'
	    );
	    return this;
	  }
	}

	redshiftColumnbuilder = ColumnBuilder_Redshift;
	return redshiftColumnbuilder;
}

var redshiftColumncompiler;
var hasRequiredRedshiftColumncompiler;

function requireRedshiftColumncompiler () {
	if (hasRequiredRedshiftColumncompiler) return redshiftColumncompiler;
	hasRequiredRedshiftColumncompiler = 1;
	// Redshift Column Compiler
	// -------

	const ColumnCompiler_PG = requirePgColumncompiler();
	const ColumnCompiler = columncompiler;

	class ColumnCompiler_Redshift extends ColumnCompiler_PG {
	  constructor() {
	    super(...arguments);
	  }

	  // Types:
	  // ------

	  bit(column) {
	    return column.length !== false ? `char(${column.length})` : 'char(1)';
	  }

	  datetime(without) {
	    return without ? 'timestamp' : 'timestamptz';
	  }

	  timestamp(without) {
	    return without ? 'timestamp' : 'timestamptz';
	  }

	  // Modifiers:
	  // ------
	  comment(comment) {
	    this.pushAdditional(function () {
	      this.pushQuery(
	        `comment on column ${this.tableCompiler.tableName()}.` +
	          this.formatter.wrap(this.args[0]) +
	          ' is ' +
	          (comment ? `'${comment}'` : 'NULL')
	      );
	    }, comment);
	  }
	}

	ColumnCompiler_Redshift.prototype.increments = ({ primaryKey = true } = {}) =>
	  'integer identity(1,1)' + (primaryKey ? ' primary key' : '') + ' not null';
	ColumnCompiler_Redshift.prototype.bigincrements = ({
	  primaryKey = true,
	} = {}) =>
	  'bigint identity(1,1)' + (primaryKey ? ' primary key' : '') + ' not null';
	ColumnCompiler_Redshift.prototype.binary = 'varchar(max)';
	ColumnCompiler_Redshift.prototype.blob = 'varchar(max)';
	ColumnCompiler_Redshift.prototype.enu = 'varchar(255)';
	ColumnCompiler_Redshift.prototype.enum = 'varchar(255)';
	ColumnCompiler_Redshift.prototype.json = 'varchar(max)';
	ColumnCompiler_Redshift.prototype.jsonb = 'varchar(max)';
	ColumnCompiler_Redshift.prototype.longblob = 'varchar(max)';
	ColumnCompiler_Redshift.prototype.mediumblob = 'varchar(16777218)';
	ColumnCompiler_Redshift.prototype.set = 'text';
	ColumnCompiler_Redshift.prototype.text = 'varchar(max)';
	ColumnCompiler_Redshift.prototype.tinyblob = 'varchar(256)';
	ColumnCompiler_Redshift.prototype.uuid = ColumnCompiler.prototype.uuid;
	ColumnCompiler_Redshift.prototype.varbinary = 'varchar(max)';
	ColumnCompiler_Redshift.prototype.bigint = 'bigint';
	ColumnCompiler_Redshift.prototype.bool = 'boolean';
	ColumnCompiler_Redshift.prototype.double = 'double precision';
	ColumnCompiler_Redshift.prototype.floating = 'real';
	ColumnCompiler_Redshift.prototype.smallint = 'smallint';
	ColumnCompiler_Redshift.prototype.tinyint = 'smallint';

	redshiftColumncompiler = ColumnCompiler_Redshift;
	return redshiftColumncompiler;
}

/* eslint max-len: 0 */

var redshiftTablecompiler;
var hasRequiredRedshiftTablecompiler;

function requireRedshiftTablecompiler () {
	if (hasRequiredRedshiftTablecompiler) return redshiftTablecompiler;
	hasRequiredRedshiftTablecompiler = 1;
	// Redshift Table Builder & Compiler
	// -------

	const has = has_1;
	const TableCompiler_PG = requirePgTablecompiler();

	class TableCompiler_Redshift extends TableCompiler_PG {
	  constructor() {
	    super(...arguments);
	  }

	  index(columns, indexName, options) {
	    this.client.logger.warn(
	      'Redshift does not support the creation of indexes.'
	    );
	  }

	  dropIndex(columns, indexName) {
	    this.client.logger.warn(
	      'Redshift does not support the deletion of indexes.'
	    );
	  }

	  // TODO: have to disable setting not null on columns that already exist...

	  // Adds the "create" query to the query sequence.
	  createQuery(columns, ifNot, like) {
	    const createStatement = ifNot
	      ? 'create table if not exists '
	      : 'create table ';
	    const columnsSql = ' (' + columns.sql.join(', ') + this._addChecks() + ')';
	    let sql =
	      createStatement +
	      this.tableName() +
	      (like && this.tableNameLike()
	        ? ' (like ' + this.tableNameLike() + ')'
	        : columnsSql);
	    if (this.single.inherits)
	      sql += ` like (${this.formatter.wrap(this.single.inherits)})`;
	    this.pushQuery({
	      sql,
	      bindings: columns.bindings,
	    });
	    const hasComment = has(this.single, 'comment');
	    if (hasComment) this.comment(this.single.comment);
	    if (like) {
	      this.addColumns(columns, this.addColumnsPrefix);
	    }
	  }

	  primary(columns, constraintName) {
	    const self = this;
	    constraintName = constraintName
	      ? self.formatter.wrap(constraintName)
	      : self.formatter.wrap(`${this.tableNameRaw}_pkey`);
	    if (columns.constructor !== Array) {
	      columns = [columns];
	    }
	    const thiscolumns = self.grouped.columns;

	    if (thiscolumns) {
	      for (let i = 0; i < columns.length; i++) {
	        let exists = thiscolumns.find(
	          (tcb) =>
	            tcb.grouping === 'columns' &&
	            tcb.builder &&
	            tcb.builder._method === 'add' &&
	            tcb.builder._args &&
	            tcb.builder._args.indexOf(columns[i]) > -1
	        );
	        if (exists) {
	          exists = exists.builder;
	        }
	        const nullable = !(
	          exists &&
	          exists._modifiers &&
	          exists._modifiers['nullable'] &&
	          exists._modifiers['nullable'][0] === false
	        );
	        if (nullable) {
	          if (exists) {
	            return this.client.logger.warn(
	              'Redshift does not allow primary keys to contain nullable columns.'
	            );
	          } else {
	            return this.client.logger.warn(
	              'Redshift does not allow primary keys to contain nonexistent columns.'
	            );
	          }
	        }
	      }
	    }
	    return self.pushQuery(
	      `alter table ${self.tableName()} add constraint ${constraintName} primary key (${self.formatter.columnize(
	        columns
	      )})`
	    );
	  }

	  // Compiles column add. Redshift can only add one column per ALTER TABLE, so core addColumns doesn't work.  #2545
	  addColumns(columns, prefix, colCompilers) {
	    if (prefix === this.alterColumnsPrefix) {
	      super.addColumns(columns, prefix, colCompilers);
	    } else {
	      prefix = prefix || this.addColumnsPrefix;
	      colCompilers = colCompilers || this.getColumns();
	      for (const col of colCompilers) {
	        const quotedTableName = this.tableName();
	        const colCompiled = col.compileColumn();

	        this.pushQuery({
	          sql: `alter table ${quotedTableName} ${prefix}${colCompiled}`,
	          bindings: [],
	        });
	      }
	    }
	  }
	}

	redshiftTablecompiler = TableCompiler_Redshift;
	return redshiftTablecompiler;
}

/* eslint max-len: 0 */

var redshiftCompiler;
var hasRequiredRedshiftCompiler;

function requireRedshiftCompiler () {
	if (hasRequiredRedshiftCompiler) return redshiftCompiler;
	hasRequiredRedshiftCompiler = 1;
	// Redshift Table Builder & Compiler
	// -------

	const SchemaCompiler_PG = requirePgCompiler();

	class SchemaCompiler_Redshift extends SchemaCompiler_PG {
	  constructor() {
	    super(...arguments);
	  }
	}

	redshiftCompiler = SchemaCompiler_Redshift;
	return redshiftCompiler;
}

/* eslint max-len: 0 */

var redshiftViewcompiler;
var hasRequiredRedshiftViewcompiler;

function requireRedshiftViewcompiler () {
	if (hasRequiredRedshiftViewcompiler) return redshiftViewcompiler;
	hasRequiredRedshiftViewcompiler = 1;
	const ViewCompiler_PG = requirePgViewcompiler();

	class ViewCompiler_Redshift extends ViewCompiler_PG {
	  constructor(client, viewCompiler) {
	    super(client, viewCompiler);
	  }
	}

	redshiftViewcompiler = ViewCompiler_Redshift;
	return redshiftViewcompiler;
}

var redshift;
var hasRequiredRedshift;

function requireRedshift () {
	if (hasRequiredRedshift) return redshift;
	hasRequiredRedshift = 1;
	// Redshift
	// -------
	const Client_PG = requirePostgres();
	const map = map_1;

	const Transaction = requireTransaction();
	const QueryCompiler = requireRedshiftQuerycompiler();
	const ColumnBuilder = requireRedshiftColumnbuilder();
	const ColumnCompiler = requireRedshiftColumncompiler();
	const TableCompiler = requireRedshiftTablecompiler();
	const SchemaCompiler = requireRedshiftCompiler();
	const ViewCompiler = requireRedshiftViewcompiler();

	class Client_Redshift extends Client_PG {
	  transaction() {
	    return new Transaction(this, ...arguments);
	  }

	  queryCompiler(builder, formatter) {
	    return new QueryCompiler(this, builder, formatter);
	  }

	  columnBuilder() {
	    return new ColumnBuilder(this, ...arguments);
	  }

	  columnCompiler() {
	    return new ColumnCompiler(this, ...arguments);
	  }

	  tableCompiler() {
	    return new TableCompiler(this, ...arguments);
	  }

	  schemaCompiler() {
	    return new SchemaCompiler(this, ...arguments);
	  }

	  viewCompiler() {
	    return new ViewCompiler(this, ...arguments);
	  }

	  _driver() {
	    return require$$9;
	  }

	  // Ensures the response is returned in the same format as other clients.
	  processResponse(obj, runner) {
	    const resp = obj.response;
	    if (obj.output) return obj.output.call(runner, resp);
	    if (obj.method === 'raw') return resp;
	    if (resp.command === 'SELECT') {
	      if (obj.method === 'first') return resp.rows[0];
	      if (obj.method === 'pluck') return map(resp.rows, obj.pluck);
	      return resp.rows;
	    }
	    if (
	      resp.command === 'INSERT' ||
	      resp.command === 'UPDATE' ||
	      resp.command === 'DELETE'
	    ) {
	      return resp.rowCount;
	    }
	    return resp;
	  }

	  toPathForJson(jsonPath, builder, bindingsHolder) {
	    return jsonPath
	      .replace(/^(\$\.)/, '') // remove the first dollar
	      .split('.')
	      .map(
	        function (v) {
	          return this.parameter(v, builder, bindingsHolder);
	        }.bind(this)
	      )
	      .join(', ');
	  }
	}

	Object.assign(Client_Redshift.prototype, {
	  dialect: 'redshift',

	  driverName: 'pg-redshift',
	});

	redshift = Client_Redshift;
	return redshift;
}

Object.defineProperty(dialects, '__esModule', { value: true });
dialects.getDialectByNameOrAlias = void 0;
const { resolveClientNameWithAliases } = helpers$7;
const dbNameToDialectLoader = Object.freeze({
  'better-sqlite3': () => requireBetterSqlite3(),
  cockroachdb: () => requireCockroachdb(),
  mssql: () => requireMssql(),
  mysql: () => requireMysql(),
  mysql2: () => requireMysql2(),
  oracle: () => requireOracle(),
  oracledb: () => requireOracledb(),
  pgnative: () => requirePgnative(),
  postgres: () => requirePostgres(),
  redshift: () => requireRedshift(),
  sqlite3: () => requireSqlite3(),
});
/**
 * Gets the Dialect object with the given client name or throw an
 * error if not found.
 *
 * NOTE: This is a replacement for prior practice of doing dynamic
 * string construction for imports of Dialect objects.
 */
function getDialectByNameOrAlias$1(clientName) {
  const resolvedClientName = resolveClientNameWithAliases(clientName);
  const dialectLoader = dbNameToDialectLoader[resolvedClientName];
  if (!dialectLoader) {
    throw new Error(`Invalid clientName given: ${clientName}`);
  }
  return dialectLoader();
}
dialects.getDialectByNameOrAlias = getDialectByNameOrAlias$1;

const Client$1 = client;
const { SUPPORTED_CLIENTS } = constants$1;

const parseConnection = parseConnection$1;
const { getDialectByNameOrAlias } = dialects;

function resolveConfig$1(config) {
  let Dialect;
  let resolvedConfig;

  // If config is a string, try to parse it
  const parsedConfig =
    typeof config === 'string'
      ? Object.assign(parseConnection(config), arguments[2])
      : config;

  // If user provided no relevant parameters, use generic client
  if (
    arguments.length === 0 ||
    (!parsedConfig.client && !parsedConfig.dialect)
  ) {
    Dialect = Client$1;
  }
  // If user provided Client constructor as a parameter, use it
  else if (typeof parsedConfig.client === 'function') {
    Dialect = parsedConfig.client;
  }
  // If neither applies, let's assume user specified name of a client or dialect as a string
  else {
    const clientName = parsedConfig.client || parsedConfig.dialect;
    if (!SUPPORTED_CLIENTS.includes(clientName)) {
      throw new Error(
        `knex: Unknown configuration option 'client' value ${clientName}. Note that it is case-sensitive, check documentation for supported values.`
      );
    }

    Dialect = getDialectByNameOrAlias(clientName);
  }

  // If config connection parameter is passed as string, try to parse it
  if (typeof parsedConfig.connection === 'string') {
    resolvedConfig = Object.assign({}, parsedConfig, {
      connection: parseConnection(parsedConfig.connection).connection,
    });
  } else {
    resolvedConfig = Object.assign({}, parsedConfig);
  }

  return {
    resolvedConfig,
    Dialect,
  };
}

var configResolver = {
  resolveConfig: resolveConfig$1,
};

const Client = client;
const QueryBuilder = querybuilder;
const QueryInterface = methodConstants;

const makeKnex = makeKnex_1;
const { KnexTimeoutError } = timeout$3;
const { resolveConfig } = configResolver;
const SchemaBuilder = builder;
const ViewBuilder = viewbuilder;
const ColumnBuilder = columnbuilder;
const TableBuilder = tablebuilder;

function knex$1(config) {
  const { resolvedConfig, Dialect } = resolveConfig(...arguments);

  const newKnex = makeKnex(new Dialect(resolvedConfig));
  if (resolvedConfig.userParams) {
    newKnex.userParams = resolvedConfig.userParams;
  }
  return newKnex;
}

// Expose Client on the main Knex namespace.
knex$1.Client = Client;

knex$1.KnexTimeoutError = KnexTimeoutError;

knex$1.QueryBuilder = {
  extend: function (methodName, fn) {
    QueryBuilder.extend(methodName, fn);
    QueryInterface.push(methodName);
  },
};

knex$1.SchemaBuilder = {
  extend: function (methodName, fn) {
    SchemaBuilder.extend(methodName, fn);
  },
};

knex$1.ViewBuilder = {
  extend: function (methodName, fn) {
    ViewBuilder.extend(methodName, fn);
  },
};

knex$1.ColumnBuilder = {
  extend: function (methodName, fn) {
    ColumnBuilder.extend(methodName, fn);
  },
};

knex$1.TableBuilder = {
  extend: function (methodName, fn) {
    TableBuilder.extend(methodName, fn);
  },
};

var Knex$1 = knex$1;

const Knex = Knex$1;

var lib = Knex;

var knex = /*@__PURE__*/getDefaultExportFromCjs(lib);

// Knex.js
// --------------
//     (c) 2013-present Tim Griesser
//     Knex may be freely distributed under the MIT license.
//     For details and documentation:
//     http://knexjs.org

export { knex as default, knex };
