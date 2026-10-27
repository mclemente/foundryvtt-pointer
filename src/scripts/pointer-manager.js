import { PointerContainer } from "./pixi/container.js";

export class PointerManager {
	constructor() {
		this._socket = "module.pointer";
		this.lastTime = 0;
		this.deltaTime = 1000 / 30; // 30 FPS
		this._onMouseMove = this._mouseMove.bind(this);
	}

	active = false;

	get container() {
		return canvas.controls.pointer;
	}

	static init() {
		const manager = new PointerManager();
		manager.registerHooks();
		return manager;
	}

	registerHooks() {
		// Socket handling
		game.socket.on(this._socket, this._socketHandler.bind(this));

		// Canvas interactions
		Hooks.on("canvasReady", this._onCanvasReady.bind(this));
	}

	_onCanvasReady() {
		// Initialize the visual container on the canvas
		// In v13, we should probably use a specific layer or interface group
		// For now, sticking to canvas.controls as per existing logic but wrapped safely
		if (canvas.controls.pointer) {
			canvas.controls.pointer.destroy({ children: true });
		}
		canvas.controls.pointer = canvas.controls.addChild(new PointerContainer());
	}

	_socketHandler(data) {
		if (!this.container || data.sceneId !== canvas.scene.id) return;

		if (data.stop) {
			this.container.hidePointer(data.senderId);
		} else if (data.type === "pointer") {
			this.container.movePointer(data.senderId, data.position);
		} else if (data.type === "ping") {
			this.container.ping({
				userId: data.senderId,
				position: data.position,
				force: data.force,
				scale: data.scale,
			});
			// move canvas to pinged position
			canvas.animatePan({x: data.position.x, y: data.position.y, scale: data.scale});
		}
	}

	start() {
		this.lastTime = 0;
		this.active = true;
		window.addEventListener("mousemove", this._onMouseMove);
		this.container.updatePointerPosition(game.user.id, canvas.mousePosition);
		this.container.showPointer(game.user.id);
	}

	stop() {
		this.active = false;
		window.removeEventListener("mousemove", this._onMouseMove);
		this.container.hidePointer(game.user.id);

		// Notify others
		const data = {
			senderId: game.user.id,
			stop: true,
		};
		game.socket.emit(this._socket, data);
	}

	_mouseMove(ev) {
		if (!this.container) return;

		const { x, y } = canvas.mousePosition;
		this.container.updatePointerPosition(game.user.id, { x, y });

		const dt = Date.now() - this.lastTime;
		if (dt < this.deltaTime) return;

		this.lastTime = Date.now();
		const mdata = {
			senderId: game.user.id,
			position: { x, y },
			sceneId: canvas.scene.id,
			type: "pointer",
		};
		game.socket.emit(this._socket, mdata);
	}

	ping(options = {}) {
		const container = canvas.controls.pointer;
		if (!container) return;

		const defaults = {
			userId: game.user.id,
			position: canvas.mousePosition,
			force: false,
			scale: canvas.stage.scale.x
		};
		const finalOptions = { ...defaults, ...options };

		// Show local ping
		container.ping(finalOptions);

		if (finalOptions.force) {
			canvas.animatePan({ x: finalOptions.position.x, y: finalOptions.position.y, scale: finalOptions.scale });
		}

		// Notify others
		const data = {
			senderId: finalOptions.userId,
			position: finalOptions.position,
			sceneId: canvas.scene.id,
			type: "ping",
			force: finalOptions.force,
			scale: finalOptions.scale,
		};
		game.socket.emit(this._socket, data);
	}
}
