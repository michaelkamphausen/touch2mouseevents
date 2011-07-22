When the user swipes with his finger over a website with a mobile Webkit browser, it fires touchstart, touchmove and touchend events first and and according to the finger movement. After the finger left the screen and an extra delay, the mobile browser fires mousedown, a single mousemove, mouseup and click legacy events. If actions on your website or web app depend on mousedown, mousemove and mouseup events, these actions will be executed far too late causing a strange behaviour.

touch2mouseevents.js rewrites the DOM addEventListener methods to map listeners for mousedown, mousemove and mouseup events to touchstart, touchmove and touchend events, so that the listener actions are executed in time and the delayed mobile browser legacy events are ignored. A sequence of taps can be detected, too, allowing double or triple click actions.

The click event is not mapped and handled by touch2mouseevents.js right now, so the delayed legacy click event remains. Keep in mind that the css :hover selector leads to delayed event handling, too.

# Usage

The script file needs to be loaded before the mouse event listeners are registered. That's it.

# License

jsCalendar is licensed under the terms of the MIT License.