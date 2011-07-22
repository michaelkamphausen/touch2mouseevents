(function () {
	// touch feature detection
	if (!('ontouchend' in document)) return;
	
	// save the native implementations
	HTMLElement.prototype._addEventListener = HTMLElement.prototype.addEventListener;
	document._addEventListener = document.addEventListener;
	window._addEventListener = window.addEventListener;
	
	// detect a sequence of taps and iterate event.detail accordingly
	var TOUCH_TIMEOUT = 500;
	var FAT_FINGER_TOLERANCE = 8;
	var lastTouchstart = null;
	var evtDetail = 1;
	document._addEventListener("touchstart", function (evt) {
		if (evt.changedTouches.length == 1) {
	  		if ((lastTouchstart != null) && 
			(evt.timeStamp < lastTouchstart.timeStamp + TOUCH_TIMEOUT) &&
			(Math.abs(lastTouchstart.changedTouches[0].screenX - evt.changedTouches[0].screenX) < FAT_FINGER_TOLERANCE) &&
			(Math.abs(lastTouchstart.changedTouches[0].screenY - evt.changedTouches[0].screenY) < FAT_FINGER_TOLERANCE) && 
			(evt.target == lastTouchstart.target)) {
				evtDetail++;
			} else {
				evtDetail = 1;
			}
			lastTouchstart = evt;
	  	} else {
			lastTouchstart = null;
			evtDetail = 1;
		}
	}, true);
	document._addEventListener("touchmove", function (evt) {
		lastTouchstart = null;
		evtDetail = 1;
	}, true);
	
	// event mapping
	var eventMapping = {mousedown: "touchstart", mouseup: "touchend", mousemove: "touchmove"}
	var listenerMapping = [];
	var mapEvent = function (type, listener) {
		return function (evt) {
			if (evt.changedTouches.length != 1) return;
			var mouseEvent = document.createEvent('MouseEvents');
			mouseEvent.initMouseEvent(type, evt.bubbles, evt.cancelable, window, evtDetail, 
			evt.changedTouches[0].screenX, evt.changedTouches[0].screenY, evt.changedTouches[0].clientX /*+ evt.layerX*/,
			evt.changedTouches[0].clientY /*+ evt.layerY*/,
			evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, 0, evt.target);
			listener.call(this, mouseEvent);
		};
	}
	
	// reimplement addEventListener
	HTMLElement.prototype.addEventListener = function (type, listener, useCapture) {
		if (eventMapping[type]) {
			var mappedListener = mapEvent(type, listener);
			listenerMapping.push({element: this, type: type, listener: listener, mappedListener: mappedListener, useCapture: useCapture});
			this._addEventListener(eventMapping[type], mappedListener, useCapture);
		} else {
			this._addEventListener(type, listener, useCapture);
		}
	}
	document.addEventListener = HTMLElement.prototype.addEventListener;
	window.addEventListener = HTMLElement.prototype.addEventListener;
	
	// reimplement removeEventListener
	HTMLElement.prototype._removeEventListener = HTMLElement.prototype.removeEventListener;
	document._removeEventListener = document.removeEventListener;
	window._removeEventListener = window.removeEventListener;
	// deletes all event listeners on the element with same type and useCapture if listener == null
	HTMLElement.prototype.removeEventListener = function (type, listener, useCapture) {
		if (eventMapping[type]) {
			var mappedListener
			for (var i = 0, maxI = listenerMapping.length; i < maxI; i++) {
				registeredListener = listenerMapping[i];
				if (((registeredListener.listener == listener) || (listener == null)) && 
				(registeredListener.element == this) && 
				(registeredListener.type == type) && 
				(registeredListener.useCapture == useCapture)) {
					this._removeEventListener(eventMapping[type], registeredListener.mappedListener, useCapture);
					listenerMapping.splice(i, 1);
					if (listener == null) {
						i--;
						maxI--;
					} else {
						i = maxI;
					}
				}
			}
		} else {
			this._removeEventListener(type, listener, useCapture);
		}
	}
	document.removeEventListener = HTMLElement.prototype.removeEventListener;
	window.removeEventListener = HTMLElement.prototype.removeEventListener;
}());