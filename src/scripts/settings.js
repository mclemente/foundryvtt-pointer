import { PointerSettingsMenu } from "./settings/settings-menu.js";

const {
	ArrayField, BooleanField, ColorField, FilePathField, NumberField, SchemaField, StringField
} = foundry.data.fields;

export const registerSettings = function () {
	game.settings.registerMenu("pointer", "design-studio", {
		name: game.i18n.localize("POINTER.Settings.Name"),
		label: game.i18n.localize("POINTER.Settings.Button"),
		icon: "fas fa-paint-roller",
		type: PointerSettingsMenu,
		restricted: false,
	});

	const animationField = (min, max) => {
		return new SchemaField({
			use: new BooleanField(),
			dur: new NumberField({ initial: 1 }),
			easing: new SchemaField({
				method: new StringField({ initial: "none" }),
				type: new StringField({ initial: "in" })
			}),
			yoyo: new BooleanField(),
			min: new NumberField({ initial: min }),
			max: new NumberField({ initial: max })
		});
	};

	game.settings.register("pointer", "collection", {
		name: "Collection of all pings and pointers",
		config: false,
		restricted: false,
		scope: "world",
		type: new ArrayField(
			new SchemaField({
				name: new StringField(),
				id: new StringField(),
				scale: new NumberField({ initial: 1 }),
				angle: new NumberField({ initial: 0 }),
				offset: new SchemaField({
					x: new NumberField({ initial: 0.5 }),
					y: new NumberField({ initial: 0.5 })
				}),
				tint: new SchemaField({
					useUser: new BooleanField({ initial: true }),
					color: new ColorField({ initial: "#ffffff" })
				}),
				pingDuration: new NumberField({ initial: 1 }),
				animations: new SchemaField({
					rotation: animationField(0, 180),
					scale: animationField(0.5, 2)
				}),
				img: new FilePathField({ categories: ["IMAGE"] })
			}),
			{
				initial: [
					{
						name: "Pointer Hand",
						id: "wztq19uwjl",
						scale: 1,
						angle: 0,
						offset: {
							x: 0.5,
							y: 0.5,
						},
						tint: {
							useUser: true,
							color: "#ffffff",
						},
						pingDuration: 1,
						animations: {
							rotation: {
								use: false,
								dur: 1,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: false,
								min: 0,
								max: 180,
							},
							scale: {
								use: false,
								dur: 1,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: false,
								min: 0.5,
								max: 2,
							},
						},
						img: "modules/pointer/assets/pointer.svg",
					},
					{
						name: "Ping Round",
						id: "gw4tu2ov86",
						scale: 1,
						angle: 0,
						offset: {
							x: 0,
							y: 0,
						},
						tint: {
							useUser: true,
							color: "#ffffff",
						},
						pingDuration: 5,
						animations: {
							rotation: {
								use: true,
								dur: 5,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: false,
								min: -180,
								max: 180,
							},
							scale: {
								use: false,
								dur: 2.5,
								easing: {
									method: "sine",
									type: "inOut",
								},
								yoyo: true,
								min: 1,
								max: 1.5,
							},
						},
						img: "modules/pointer/assets/focus.svg",
						gridSize: 50,
						default: "ping",
					},
					{
						name: "Ping Arrows",
						id: "6p55sd7xi3",
						scale: 1,
						angle: 0,
						offset: {
							x: 0,
							y: 0,
						},
						tint: {
							useUser: true,
							color: "#ffffff",
						},
						pingDuration: 5,
						animations: {
							rotation: {
								use: false,
								dur: 1,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: false,
								min: 0,
								max: 180,
							},
							scale: {
								use: true,
								dur: 1,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: true,
								min: 0.9,
								max: 1.3,
							},
						},
						img: "modules/pointer/assets/convergence-target.svg",
					},
					{
						name: "Ping Triangle",
						id: "eogjz9yjn3",
						scale: 1,
						angle: 0,
						offset: {
							x: 0,
							y: -0.1,
						},
						tint: {
							useUser: true,
							color: "#ffffff",
						},
						pingDuration: 5,
						animations: {
							rotation: {
								use: true,
								dur: 4,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: false,
								min: -180,
								max: 180,
							},
							scale: {
								use: true,
								dur: 1,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: true,
								min: 0.9,
								max: 1.3,
							},
						},
						img: "modules/pointer/assets/triangle-target.svg",
					},
					{
						name: "Pointer Pin",
						id: "dvs2vb9y0y",
						scale: 1,
						angle: -15,
						offset: {
							x: 0.35,
							y: -0.6,
						},
						tint: {
							useUser: true,
							color: "#ffffff",
						},
						pingDuration: 1,
						animations: {
							rotation: {
								use: false,
								dur: 1,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: false,
								min: 0,
								max: 180,
							},
							scale: {
								use: true,
								dur: 1.5,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: true,
								min: 0.9,
								max: 1,
							},
						},
						img: "modules/pointer/assets/pin.svg",
					},
					{
						name: "Pointer Arrow",
						id: "6njoyebxpf",
						scale: 1,
						angle: 0,
						offset: {
							x: 0,
							y: -0.5,
						},
						tint: {
							useUser: true,
							color: "#ffffff",
						},
						pingDuration: 1,
						animations: {
							rotation: {
								use: false,
								dur: 1,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: false,
								min: 0,
								max: 180,
							},
							scale: {
								use: true,
								dur: 1.5,
								easing: {
									method: "none",
									type: "in",
								},
								yoyo: true,
								min: 0.9,
								max: 1,
							},
						},
						img: "modules/pointer/assets/plain-arrow.svg",
					},
				]
			}
		),
		onChange: (data) => {
			canvas.controls.pointer.updateAll();
		},
	});

	game.settings.register("pointer", "controls", {
		config: false,
		scope: "user",
		type: new SchemaField({
			pointer: new SchemaField({
				id: new StringField({ initial: "wztq19uwjl" }),
				key: new StringField({ initial: "X" })
			}),
			ping: new SchemaField({
				id: new StringField({ initial: "gw4tu2ov86" }),
				force: new StringField({ initial: "Right Click" }),
				key: new StringField({ initial: "Left Click" }),
				pointerActive: new BooleanField({ initial: true }),
			}),
		})
	});
};
