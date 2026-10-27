let controls;

export default function init() {
	removeListeners();

	setUpControls();

	addListeners();
}

/**
 * The original version of this function was removed in Foundry VTT v9.
 */
export function getKey(event) {
	if (event.code === "Space") return event.code;
	if (/^Digit/.test(event.code)) return event.code[5];
	if (event.location === 3 && (event.code in game.keyboard.moveKeys || event.code in game.keyboard.zoomKeys)) {
		return event.code;
	}
	return event.key;
}

function setUpControls() {
	const settings = game.settings.get("pointer", "controls");
	controls = { pointer: {}, ping: {}, force: {} };

	for (let objKey of ["ping", "pointer"]) {
		const keys = settings[objKey].key.split(" + ");
		const metaKeys = keys.splice(0, keys.length - 1);
		controls[objKey].meta = {};
		for (const meta of ["Ctrl", "Shift", "Meta", "Alt"]) {
			controls[objKey].meta[`${meta.toLowerCase()}Key`] = metaKeys.includes(meta);
		}

		if (keys[0]?.includes("Click")) {
			controls[objKey].event = "pointer";
			if (keys[0].includes("Left")) controls[objKey].button = 0;
			else controls[objKey].button = 2;
		} else {
			controls[objKey].event = "key";
			controls[objKey].key = keys[0];
		}
	}
	controls.ping.pointerActive = settings.ping.pointerActive;

	if (game.user.isGM) {
		const keys = settings.ping.force.split(" + ");

		const metaKeys = keys.splice(0, keys.length - 1);
		controls.force.meta = {};
		for (const meta of ["Ctrl", "Shift", "Meta", "Alt"]) {
			controls.force.meta[`${meta.toLowerCase()}Key`] = metaKeys.includes(meta);
		}

		if (keys[0]?.includes("Click")) {
			controls.force.event = "pointer";
			if (keys[0].includes("Left")) controls.force.button = 0;
			else controls.force.button = 2;
		} else {
			controls.force.event = "key";
			controls.force.key = keys[0];
		}
	}
}

function removeListeners() {
	if (!controls) return;
	if (controls.pointer.event === "key") {
		window.removeEventListener(`${controls.pointer.event}down`, onPointerDown);
		window.removeEventListener(`${controls.pointer.event}up`, onPointerUp);
	} else {
		window.removeEventListener(`${controls.pointer.event}down`, onPointerDown);
		window.removeEventListener(`${controls.pointer.event}up`, onPointerUp);
	}

	if (controls.ping.event === "key") {
		window.removeEventListener(`${controls.ping.event}down`, onPing);
	} else {
		window.removeEventListener(`${controls.ping.event}down`, onPing);
	}

	if (controls.force.event) {
		if (controls.force.event === "key") {
			window.removeEventListener(`${controls.ping.event}down`, onForcePing);
		} else {
			window.removeEventListener(`${controls.ping.event}down`, onForcePing);
		}
	}
}

function addListeners() {
	if (controls.pointer.event === "key") {
		window.addEventListener(`${controls.pointer.event}down`, onPointerDown);
		window.addEventListener(`${controls.pointer.event}up`, onPointerUp);
	} else {
		window.addEventListener(`${controls.pointer.event}down`, onPointerDown);
		window.addEventListener(`${controls.pointer.event}up`, onPointerUp);
	}

	if (controls.ping.event === "key") {
		window.addEventListener(`${controls.ping.event}down`, onPing);
	} else {
		window.addEventListener(`${controls.ping.event}down`, onPing);
	}

	if (controls.force.event) {
		if (controls.force.event === "key") {
			window.addEventListener(`${controls.ping.event}down`, onForcePing);
		} else {
			window.addEventListener(`${controls.ping.event}down`, onForcePing);
		}
	}
}

function checkKey(ev, obj) {
	if (ev.target !== document.body && ev.target !== canvas.app.view) return false;
	// if (document.activeElement !== document.body) return false;

	const key = getKey(ev);
	if (key) {
		if (key?.toUpperCase() !== obj.key?.toUpperCase()) return false;
	} else if (ev.button !== obj.button) return false;

	for (let key of Object.keys(obj.meta)) {
		if (obj.meta[key] !== ev[key]) return false;
	}
	ev.preventDefault();
	ev.stopPropagation();
	return true;
}

function onPointerDown(ev) {
	if (ev.repeat) {
		return;
	}
	if (!checkKey(ev, controls.pointer)) {
		return;
	}
	game.pointer?.start();
}

function onPointerUp(ev) {
	if (ev.key && ev.key.toUpperCase() !== controls.pointer.key.toUpperCase()) {
		return;
	} else if (ev.button && !checkKey(ev, controls.pointer)) {
		return;
	}
	game.pointer?.stop();
}

function onPing(ev) {
	if (controls.ping.pointerActive && !game.pointer.active) {
		return;
	}
	if (!checkKey(ev, controls.ping)) {
		return;
	}
	if (game.pointer) game.pointer.ping();
}

function onForcePing(ev) {
	if (controls.ping.pointerActive && !game.pointer.active) {
		return;
	}
	if (!checkKey(ev, controls.force)) {
		return;
	}
	if (game.pointer) game.pointer.ping({ force: true });
}
