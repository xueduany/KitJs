/*
 *
 * IEContentLoaded.js
 *
 * Author: Diego Perini (diego.perini at gmail.com) NWBOX S.r.l.
 * Summary: DOMContentLoaded emulation for IE browsers
 * Updated: 05/10/2007
 * License: GPL
 * Version: TBD
 *
 * Copyright (C) 2007 Diego Perini & NWBOX S.r.l.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see http://javascript.nwbox.com/IEContentLoaded/GNU_GPL.txt.
 *
 */

// @w	window reference
// @fn	function reference
function IEContentLoaded(w, fn) {
	var d = w.document, done = false,
	// only fire once
	init = function() {
		if (!done) {
			done = true;
			fn();
		}
	};
	// polling for no errors
	(function() {
		try {
			// throws errors until after ondocumentready
			d.documentElement.doScroll('left');
		} catch (e) {
			setTimeout(arguments.callee, 50);
			return;
		}
		// no errors, fire
		init();
	})();
	// trying to always fire before onload
	d.onreadystatechange = function() {
		if (d.readyState == 'complete') {
			d.onreadystatechange = null;
			init();
		}
	};
}