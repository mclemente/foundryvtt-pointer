import { PointerSettingsMenu } from "../settings/settings-menu.js";
import { Ping, Pointer } from "./pointer.js";

export class PointerContainer extends PIXI.Container {
	constructor() {
		super();
		this.initUsers();
	}

	get deltaTime() {
		return 1000 / 30;
	}

	async initUsers() {
		this._users = {};
		for (let user of game.users) {
			const data = this._getUserPointerData(user);
			const pointer = this.addChild(new Pointer(data.pointer, user.id));
			const ping = this.addChild(new Ping(data.ping, user.id));
			ping.hide();
			pointer.hide();
			this._users[user.id] = { pointer, ping };
		}
	}

	_getUserPointerData(user) {
		const collection =
            game.settings.get("pointer", "collection") || PointerSettingsMenu.defaultCollection;
		const settings = foundry.utils.mergeObject(
			PointerSettingsMenu.defaultSettings,
			user.getFlag("pointer", "settings"),
		);
		const pointerData = collection.find((e) => e.id === settings.pointer) || collection[0];
		const pingData = collection.find((e) => e.id === settings.ping) || collection[1] || collection[0];
		return { pointer: pointerData, ping: pingData };
	}

	update(user) {
		const data = this._getUserPointerData(user);
		if (!data.pointer || !data.ping) {
			return;
		}
		if (this._users[user.id]) {
			this._users[user.id].pointer.update(data.pointer);
			this._users[user.id].ping.update(data.ping);
		}
	}

	updateAll() {
		for (let user of game.users) {
			this.update(user);
		}
	}

	updateUserColor(user) {
		if (!this._users[user.id]) return;
		const pointer = this._users[user.id].pointer;
		pointer.update({ tint: pointer.tint });
		const ping = this._users[user.id].ping;
		ping.update({ tint: ping.tint });
	}

	ping({
		userId = game.user.id,
		position = canvas.mousePosition,
		force = false,
		scale = canvas.stage.scale.x,
	} = {}) {
		if (!this._users[userId]) return;
		const ping = this._users[userId].ping;
		ping.update({ position });
	}

	movePointer(userId, { x, y }) {
		if (!this._users[userId]) return;
		const pointer = this._users[userId].pointer;
		if (pointer.renderable) {
			// only animate if already visible
			gsap.to(pointer.position, { duration: this.deltaTime / 1000, x, y });
		} else {
			pointer.renderable = true;
			this._users[userId].pointer.update({ position: { x, y } });
		}
	}

	updatePointerPosition(userId, { x, y }) {
		if (!this._users[userId]) return;
		this._users[userId].pointer.update({ position: { x, y } });
	}

	showPointer(userId) {
		if (!this._users[userId]) return;
		this._users[userId].pointer.renderable = true;
	}

	hidePointer(userId) {
		if (!this._users[userId]) return;
		const pointer = this._users[userId].pointer;
		pointer.hide();
	}

	destroy(options) {
		super.destroy(options);
	}
}
