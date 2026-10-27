import { getKey } from "../keybindings.js";
import { Pointer } from "../pixi/pointer.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class PointerSettingsMenu extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id: "pointer-settings-menu",
		classes: ["pointer", "pointer-settings"],
		form: {
			handler: PointerSettingsMenu.myOnSubmit,
			submitOnClose: true,
			submitOnChange: true,
			closeOnSubmit: false,
		},
		window: {
			contentClasses: ["standard-form"],
		},
		position: {
			width: 700,
			height: "auto",
		},
		tag: "form",
		maxScale: 3,
		gridSize: 50,
	};

	static PARTS = {
		tabs: {
			template: "templates/generic/tab-navigation.hbs",
		},
		content: {
			template: "modules/pointer/templates/settings.html",
		},
	};

	get title() {
		return "Pings and Pointers - Settings";
	}

	static get defaultSettings() {
		return {
			controls: {
				pointer: {
					key: "X",
				},
				ping: {
					key: "Left Click",
					force: "Right Click",
					pointerActive: true,
				},
			},
		};
	}

	async _onRender(context, options) {
		const html = this.element;
		html.querySelectorAll(".pointer-control-chooser").forEach((e) => this._initControlChooser(e));

		this._initDesigner(html.querySelector(".designer"));

		const chooser = html.querySelector(".chooser");
		html.querySelectorAll(".chooser .pointer-name:not(.header .pointer-name)").forEach((el) => {
			el.addEventListener("click", (ev) => this._onClickName(ev));
		});
		html.querySelectorAll(".chooser .delete-pointer").forEach((el) => {
			el.addEventListener("click", (ev) => {
				const li = ev.target.closest("li");
				let collection = foundry.utils.duplicate(game.settings.get("pointer", "collection"));
				collection = collection.filter((e) => e.id !== li.dataset.pointerId);
				game.settings.set("pointer", "collection", collection).then(async (e) => {
					await this.render();
					this._selectPointer(li.dataset.pointerId === this.pointer.data.id ? {} : this.pointer.data);
				});
			});
		});
		html.querySelectorAll(".chooser .add-pointer").forEach((el) => {
			el.addEventListener("click", (ev) => this._addPointer());
		});

		chooser.querySelectorAll("input").forEach((el) =>
			el.addEventListener("change", async (ev) => {
				const target = ev.currentTarget;
				target.closest(".chooser")
					.querySelectorAll(`input[name="${CSS.escape(target.name)}"]`)
					.forEach((checkbox) => {
						checkbox.checked = checkbox === target;
					});
			}),
		);
	}

	async _addPointer() {
		const newData = foundry.utils.duplicate(game.settings.settings.get("pointer.collection").default[0]);
		newData.name = "New";
		newData.id = foundry.utils.randomID();

		const collection = foundry.utils.duplicate(game.settings.get("pointer", "collection"));
		collection.push(newData);
		await game.settings.set("pointer", "collection", collection);

		await this.render(false);

		this._selectPointer(newData);
	}

	async _onClickName(ev) {
		const li = ev.target.closest(".pointer-selection");
		if (this.canConfigure) {
			await this.pointer.save();
		}
		const pointerId = li.dataset.pointerId;

		const collection = game.settings.get("pointer", "collection");
		const pointerData = collection.find((e) => e.id === pointerId);

		this._selectPointer(pointerData);
	}

	async _selectPointer(pointerData) {
		this.pointer.update(pointerData);

		const designer = this.form.querySelector(".designer");
		const flatData = foundry.utils.flattenObject(pointerData);
		for (let key of Object.keys(flatData)) {
			const inp = designer.querySelector(`input[name="pointer.${key}"]`);
			if (!inp) {
				continue;
			}
			if (inp.type === "checkbox") {
				inp.checked = flatData[key];
			} else if (inp.type === "range") {
				inp.value = flatData[key];
				inp.parentNode.querySelector(".range-value").innerText = flatData[key];
			} else {
				inp.value = flatData[key];
			}
		}
	}

	_initControlChooser(inp) {
		inp.addEventListener("focusout", (ev) => {
			this.submit(ev);
			this._focusedControl = null;
			ev.preventDefault();
			ev.stopPropagation();
		});

		inp.addEventListener("click", (ev) => {
			ev.preventDefault();
			ev.stopPropagation();

			if (this._focusedControl !== ev.currentTarget) {
				this._focusedControl = ev.currentTarget;
				return;
			}
			ev.currentTarget.value = `${this._getMetaKeys(ev)}Left Click`;
		});

		inp.addEventListener("contextmenu", (ev) => {
			ev.preventDefault();
			ev.stopPropagation();

			if (this._focusedControl !== ev.currentTarget) {
				this._focusedControl = ev.currentTarget;
				return;
			}
			ev.currentTarget.value = `${this._getMetaKeys(ev)}Right Click`;
		});

		inp.addEventListener("keydown", (ev) => {
			ev.preventDefault();
			ev.stopPropagation();

			if (this._focusedControl !== ev.currentTarget) {
				this._focusedControl = ev.currentTarget;
				return;
			}
			let key = getKey(ev);
			if (["Control", "Shift", "Alt", "Meta"].includes(key)) {
				ev.currentTarget.value = key;
				return;
			}
			ev.currentTarget.value = this._getMetaKeys(ev) + getKey(ev).toUpperCase();
		});
	}

	_getMetaKeys(ev) {
		let keys = [];
		if (ev.shiftKey) {
			keys.push("Shift");
		}
		if (ev.ctrlKey) {
			keys.push("Ctrl");
		}
		if (ev.altKey) {
			keys.push("Alt");
		}
		if (ev.metaKey) {
			keys.push("Meta");
		}
		if (keys.length > 0) {
			return `${keys.join(" + ")} + `;
		}
		return "";
	}

	get canConfigure() {
		return game.user.can("SETTINGS_MODIFY");
	}

	_prepareContext(options) {
		const controls = game.settings.get("pointer", "controls");
		const data = {
			canConfigure: this.canConfigure,
			easingMethod: {
				none: "Linear",
				sine: "Sine",
				expo: "Exponential",
				elastic: "Elastic",
				bounce: "Bounce",
			},
			easingType: {
				in: "In",
				out: "Out",
				inOut: "In and Out",
			},
			collection: game.settings.get("pointer", "collection"),
			isGM: game.user.isGM,
			controls,
		};

		const selectedPointer = data.collection.find((e) => e.id === controls.pointer.id);

		data.collection.forEach((pointer) => {
			pointer.selectedAsPointer = pointer.id === controls.pointer.id;
		});

		data.pixi = foundry.utils.expandObject(selectedPointer);

		const selectedPing = data.collection.find((e) => e.id === controls.ping.id);

		data.collection.forEach((ping) => {
			ping.selectedAsPing = ping.id === controls.ping.id;
		});

		selectedPing.selectedAsPing = true;

		this.tabGroups.primary ??= "general";

		data.tabs = {
			general: {
				id: "general",
				group: "primary",
				label: "POINTER.Settings.Controls.header",
				cssClass: this.tabGroups.primary === "general" ? "active" : "",
			},
			chooser: {
				id: "chooser",
				group: "primary",
				label: "Choose your Pointer!",
				cssClass: this.tabGroups.primary === "chooser" ? "active" : "",
			},
		};

		return {
			...options,
			...data
		};
	}

	static async myOnSubmit(event, form, formData) {
		const { pointer, controls } = foundry.utils.expandObject(formData.object);
		if (this.canConfigure) {
			this.pointer.save();
			pointer.img = this.pointer.data.img;
			this.pointer.save(pointer);
		}
		if (event.currentTarget?.closest(".designer")) {
			return;
		}
		const chooser = form.querySelector(".chooser");
		const pingId = chooser.querySelector('li:has(input[name="selectedAsPing"]:checked)').dataset.pointerId;
		controls.ping.id = pingId;
		const pointerId = chooser.querySelector('li:has(input[name="selectedAsPointer"]:checked)').dataset.pointerId;
		controls.pointer.id = pointerId;

		await game.settings.set("pointer", "controls", controls);
		await this.render();

		// keep the updated pointer in sync with the settings
		const updatedPointerId = this.pointer.data.id;
		const collection = game.settings.get("pointer", "collection");
		const pointerData = collection.find((e) => e.id === updatedPointerId);
		this._selectPointer(pointerData);
	}

	/** PIXI STUFF */

	_initDesigner(container) {
		container.querySelectorAll("input, select").forEach((el) => {
			el.addEventListener("input", this._designerInputChange.bind(this));
			// el.addEventListener('change', ev => this.pointer.save());
			el.addEventListener("wheel", (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
			});
		});
		if (this._pixiApp) {
			container.querySelector(".canvas-container").appendChild(this._pixiApp.view);
			return;
		}
		const { stage } = this._initPixiApp(container);

		this._pixiApp.view.addEventListener("click", (ev) => {
			new foundry.applications.apps.FilePicker.implementation({
				type: "imagevideo",
				current: this.pointer.data.img || "",
				callback: (path) => {
					this.pointer.update({ img: path });
					this.pointer.save();
				},
				top: this.position.top + 40,
				left: this.position.left + 10,
			}).browse(this.pointer.data.img);
		});
		const pointerId = game.settings.get("pointer", "controls").pointer.id;
		const collection = game.settings.get("pointer", "collection");

		const pointerData = collection.find((e) => e.id === pointerId) || collection[0];
		pointerData.position = new PIXI.Point(this._pixiApp.view.width / 2, this._pixiApp.view.height / 2);

		this.pointer = stage.addChild(new Pointer(pointerData, game.user.id, this.options.gridSize));
	}

	_designerInputChange(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		let udata = {};
		const val =
		ev.currentTarget.type === "range"
			? Number(ev.currentTarget.value)
			: ev.currentTarget.type === "checkbox"
				? !!ev.currentTarget.checked
				: ev.currentTarget.value;

		if (ev.currentTarget.type === "range") {
			const rangevalue = ev.currentTarget.parentNode.querySelector(".range-value");
			rangevalue.innerText = ev.currentTarget.value;
		}
		const prop = ev.currentTarget.name.split(".").slice(1).join(".");
		udata[prop] = val;

		this.pointer.update(udata).then(async () => {
			// Update only the pointer object with the changes
			const collection = game.settings.get("pointer", "collection");
			const pointerId = this.pointer.data.id;
			const pointerData = collection.find((e) => e.id === pointerId);
			pointerData[prop] = val; // Apply the changes to the pointer data
			if (prop === "name") {
				const chooser = this.form.querySelector(".chooser");
				if (!chooser) {
					return;
				}
				// Update the name in the chooser
				chooser.querySelector(`.pointer-selection[data-pointer-id="${pointerId}"] .pointer-name`).innerText = val;
				this._selectPointer(pointerData);
			}
		});
	}

	_initPixiApp(container) {
		const pixiOptions = {
			width: 300,
			height: 300,
			transparent: true,
			sharedTicker: true,
			sharedLoader: true,
		};

		const app = new PIXI.Application(pixiOptions);
		this._pixiApp = app;
		container.querySelector(".canvas-container").appendChild(app.view);
		app.view.style.cursor = "pointer";
		const stage = app.stage;
		const grid = app.stage.addChild(new PIXI.Graphics());
		this.grid = grid;
		const gridColor = document.body.classList.contains("dark-mode") ? 0xaaaaaa : 0x666666;
		const gridSize = this.options.gridSize;
		grid.lineStyle(3, gridColor, 0.8);
		const gridLength = 20 * gridSize;
		for (let x = 0; x <= gridLength; x += gridSize) {
			for (let y = 0; y <= gridLength; y += gridSize) {
				grid.moveTo(x, 0).lineTo(x, gridLength).moveTo(0, y).lineTo(gridLength, y);
			}
		}
		grid.position = new PIXI.Point(pixiOptions.width * 0.5, pixiOptions.height * 0.5);
		grid.pivot = new PIXI.Point(gridLength * 0.5, gridLength * 0.5);
		const target = app.stage.addChild(new PIXI.Graphics());
		target.lineStyle(5, 0xcc0000, 1.0);
		const targetSize = gridSize * 0.25;
		const x = pixiOptions.width * 0.5;
		const y = pixiOptions.height * 0.5;
		target
			.moveTo(x - targetSize, y - targetSize)
			.lineTo(x + targetSize, y + targetSize)
			.moveTo(x - targetSize, y + targetSize)
			.lineTo(x + targetSize, y - targetSize);

		return {
			stage,
		};
	}
}
