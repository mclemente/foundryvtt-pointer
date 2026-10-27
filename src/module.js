import initControls from "./scripts/keybindings.js";
import { PointerManager } from "./scripts/pointer-manager.js";
import { registerSettings } from "./scripts/settings.js";

Hooks.once("init", async () => {
	registerSettings();
	game.pointer = PointerManager.init();
});

Hooks.once("setup", function () {
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
