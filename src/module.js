import initControls from "./scripts/keybindings.js";
import { PointerManager } from "./scripts/pointer-manager.js";
import { registerSettings } from "./scripts/settings.js";

Hooks.once("init", async () => {
	registerSettings();
	game.pointer = PointerManager.init();
});

Hooks.once("setup", function () {
	const legacySettings = game.user.getFlag("pointer", "settings");
	if (legacySettings) {
		legacySettings.controls.ping.id = legacySettings.ping;
		legacySettings.controls.pointer.id = legacySettings.pointer;
		game.settings.set("pointer", "controls", legacySettings.controls);
		game.user.unsetFlag("pointer", "settings");
	}
	initControls();
});

Hooks.once("ready", async () => {
	foundry.applications.handlebars.loadTemplates(["modules/pointer/templates/designer.html"]);
});

Hooks.on("updateUser", (entity, udata) => {
	if (udata.color) {
		canvas.controls.pointer?.updateUserColor(entity);
	}
	if (udata.flags?.pointer?.settings) {
		canvas.controls.pointer?.update(entity);
	}
	if (udata.flags?.pointer?.settings?.controls && entity.id === game.user.id) {
		initControls();
	}
});
