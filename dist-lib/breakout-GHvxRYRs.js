// lib/core/model/core.ts
var e = class {
	objects;
	constructor() {
		this.objects = {};
	}
	add(e) {
		Array.isArray(e) ? e.forEach((e) => this.add_single(e)) : this.add_single(e);
	}
	has(e) {
		return this.objects[e.Z].has(e);
	}
	add_single(e) {
		e.Z in this.objects || (this.objects[e.Z] = /* @__PURE__ */ new Set()), this.objects[e.Z].add(e);
	}
	delete(e) {
		Array.isArray(e) ? e.forEach((e) => this.delete_single(e)) : this.delete_single(e);
	}
	delete_single(e) {
		e.Z in this.objects && this.objects[e.Z].delete(e);
	}
	get all() {
		return Object.keys(this.objects).sort((e, t) => Number(t) - Number(e)).map((e) => [...this.objects[Number(e)]]).flat();
	}
};
function t(e) {
	return {
		left: e.x < 0,
		right: e.x + e.w > 1,
		top: e.y < 0,
		bottom: e.y + e.h > 1
	};
}
var n = class {
	X;
	Y;
	Z;
	width;
	height;
	wallsHit;
	doMove;
	constructor({ ...e }) {
		this.X = e.X, this.Y = e.Y, this.Z = e.Z ?? 0, this.width = e.width, this.height = e.height, this.doMove = !0, this.wallsHit = {
			top: !1,
			left: !1,
			right: !1,
			bottom: !1
		};
	}
	get boundHits() {
		return this.wallsHit;
	}
	set canMove(e) {
		this.doMove = e;
	}
	bounds() {
		return {
			x: this.X,
			y: this.Y,
			w: this.width,
			h: this.height
		};
	}
	visible() {
		let { x: e, y: t, w: n, h: r } = this.bounds();
		return e < 1 && e + n > 0 && t < 1 && t + r > 0;
	}
	collides(e) {
		let t = this.bounds(), n = e.bounds();
		return t.x < n.x + n.w && t.x + t.w > n.x && t.y < n.y + n.h && t.y + t.h > n.y;
	}
	handleCollision(e) {}
	move(e) {
		this.doMove && this.moveObject(e);
	}
	checkBounds() {
		this.wallsHit = this.checkObjectBounds();
	}
	draw(e, t) {
		this.drawObject(e, t);
	}
}, r = class extends n {
	XSpeed;
	YSpeed;
	direction = "none";
	fillColor;
	constructor({ ...e }) {
		super({ ...e }), this.XSpeed = e.XSpeed, this.YSpeed = e.YSpeed, this.fillColor = e.fillColor;
	}
	moveObject(e) {
		let t = this.XSpeed * e;
		switch (this.direction) {
			case "left":
				this.X -= t;
				break;
			case "right": this.X += t;
		}
	}
	checkObjectBounds() {
		let e = t(this.bounds());
		return e.left ? this.X = 0 : e.right && (this.X = 1 - this.width), e;
	}
	drawObject(e, t) {
		e.fillStyle = this.fillColor, e.fillRect(t.X(this.X), t.Y(this.Y), t.X(this.width), t.Y(this.height));
	}
}, i = .05, a = .3, o = class extends n {
	fullHeight;
	level;
	fillColor;
	roundness;
	constructor({ ...e }) {
		super({ ...e }), this.fullHeight = e.fullHeight, this.level = e.level, this.fillColor = e.fillColor, this.roundness = e.roundness, this.canMove = !1;
	}
	get alive() {
		return this.level > 0;
	}
	bounds() {
		return this.alive ? {
			x: this.X,
			y: this.Y,
			w: this.width,
			h: this.height
		} : {
			x: -1,
			y: -1,
			w: 0,
			h: 0
		};
	}
	moveObject(e) {
		this.Y += this.fullHeight / 20;
	}
	checkObjectBounds() {
		return {
			left: !1,
			right: !1,
			top: !1,
			bottom: !1
		};
	}
	drawObject(e, t) {
		let n = this.fillColor.colorFor(this.level);
		if (n.length === 0) return;
		e.fillStyle = n;
		let r = t.X(this.width), i = t.Y(this.height), a = Math.min(r, i) * this.roundness;
		e.beginPath(), e.roundRect(t.X(this.X), t.Y(this.Y), r, i, a), e.fill();
	}
}, s = class e extends n {
	velocity;
	angleDeg;
	fillColor;
	constructor({ ...e }) {
		super({ ...e }), this.velocity = e.velocity, this.angleDeg = e.angleDeg, this.fillColor = e.fillColor;
	}
	moveObject(e) {
		let t = Math.cos(this.angleDeg * Math.PI / 180) * this.velocity * e, n = Math.sin(this.angleDeg * Math.PI / 180) * this.velocity * e, r = this.X + t, i = this.Y + n;
		this.X = r, this.Y = i;
	}
	checkObjectBounds() {
		let e = t(this.bounds());
		if (!e.left && !e.right && !e.top && !e.bottom) return e;
		let n = this.angleDeg * Math.PI / 180, r = Math.cos(n), i = Math.sin(n);
		return e.left && (this.X = 0, r = Math.abs(r)), e.right && (this.X = 1 - this.width, r = -Math.abs(r)), e.top && (this.Y = 0, i = Math.abs(i)), e.bottom && (this.Y = 1 - this.height, i = -Math.abs(i)), this.angleDeg = Math.atan2(i, r) * 180 / Math.PI, e;
	}
	drawObject(e, t) {
		e.fillStyle = this.fillColor, e.fillRect(t.X(this.X), t.Y(this.Y), t.X(this.width), t.Y(this.height));
	}
	handleCollision(e) {
		e instanceof r ? this.handlePaddleCollision(e) : e instanceof o && this.handleBlockCollision(e);
	}
	handleBlockCollision(e) {
		let t = this.bounds(), n = e.bounds(), r = Math.min(t.x + t.w, n.x + n.w) - Math.max(t.x, n.x), i = Math.min(t.y + t.h, n.y + n.h) - Math.max(t.y, n.y);
		if (r <= 0 || i <= 0) return;
		let a = t.x + t.w / 2, o = t.y + t.h / 2, s = n.x + n.w / 2, c = n.y + n.h / 2, l = this.angleDeg * Math.PI / 180, u = Math.cos(l), d = Math.sin(l);
		if (r < i) {
			let e = a < s ? -1 : 1;
			this.X = e < 0 ? n.x - this.width : n.x + n.w, u = e * Math.abs(u);
		} else {
			let e = o < c ? -1 : 1;
			this.Y = e < 0 ? n.y - this.height : n.y + n.h, d = e * Math.abs(d);
		}
		this.setDirection(u, d), e.level = Math.max(0, e.level - 1);
	}
	static clamp(e, t, n) {
		return Math.min(n, Math.max(t, e));
	}
	handlePaddleCollision(t) {
		let n = this.bounds(), r = t.bounds(), i = Math.min(n.x + n.w, r.x + r.w) - Math.max(n.x, r.x), a = Math.min(n.y + n.h, r.y + r.h) - Math.max(n.y, r.y);
		if (i <= 0 || a <= 0) return;
		let o = n.x + n.w / 2, s = r.x + r.w / 2, c = this.angleDeg * Math.PI / 180, l = Math.cos(c), u = Math.sin(c);
		if (i < a) {
			let e = o < s ? -1 : 1, t = e < 0 ? r.x - this.width : r.x + r.w;
			if (t >= 0 && t + this.width <= 1) {
				this.X = t, this.setDirection(e * Math.abs(l), u);
				return;
			}
		} else if (u <= 0) return;
		this.Y = r.y - this.height;
		let d = e.clamp((o - s) / (r.w / 2), -1, 1) * 60, f = t.direction;
		f === "left" ? d -= 4 : f === "right" && (d += 4), d = e.clamp(d, -75, 75), this.angleDeg = -90 + d;
	}
	setDirection(e, t) {
		this.angleDeg = Math.atan2(t, e) * 180 / Math.PI;
	}
}, c = class {
	colorTable;
	fn;
	constructor(e) {
		this.fn = e, this.colorTable = {};
	}
	colorFor(e) {
		return e in this.colorTable || (this.colorTable[e] = this.fn(e)), this.colorTable[e];
	}
}, l = {
	0: "#151b23",
	1: "#033a16",
	2: "#196c2e",
	3: "#2ea043",
	4: "#56d364"
};
function u(e) {
	return e <= 0 ? l[0] : e >= 4 ? l[4] : l[e];
}
var d = {
	background: "#0d1117",
	paddle: "#ffffff",
	ball: "#ffffff",
	blocks: new c(u)
};
// lib/core/palettes/random.ts
function f() {
	return m(p(), p(), p());
}
function p() {
	return Math.floor(Math.random() * 256);
}
function m(e, t, n) {
	return "#" + ((1 << 24) + (e << 16) + (t << 8) + n).toString(16).slice(1);
}
var h = {
	background: f(),
	paddle: f(),
	ball: f(),
	blocks: new c((e) => f())
}, g = {
	0: "",
	1: "#9be9a8",
	2: "#40c463",
	3: "#30a14e",
	4: "#216e39"
};
function _(e) {
	return e <= 0 ? g[0] : e >= 4 ? g[4] : g[e];
}
var v = {
	background: "#ffffff",
	paddle: "#24292f",
	ball: "#24292f",
	blocks: new c(_)
};
// lib/core/palettes/types.ts
function y(e, t = null) {
	switch (e) {
		case "custom":
			if (!t) throw Error("Missing Custom color palette");
			return t;
		case "default":
		case "github_dark": return d;
		case "github_light": return v;
		case "random": return h;
	}
}
// lib/core/properties/defaults.ts
var b = "start", x = .5, S = .85, C = 1, w = 0, T = .2, E = .01, D = .5, O = .6, k = 270, A = .7, j = .02, M = .02, N = .01, P = .2, F = ["KeyA", "ArrowLeft"], I = ["KeyD", "ArrowRight"], L = ["Space"];
function R(e) {
	if (typeof e == "number") return e;
	let t = Math.min(e.min, e.max), n = Math.max(e.min, e.max);
	return Number.isInteger(t) && Number.isInteger(n) ? Math.floor(Math.random() * (n - t + 1)) + t : Math.random() * (n - t) + t;
}
var z = {
	paddle: {
		X: x,
		Y: S,
		height: E,
		width: T,
		XSpeed: C,
		YSpeed: w
	},
	ball: {
		X: D,
		Y: O,
		velocity: A,
		angleDeg: k,
		width: j,
		height: M
	},
	block: {
		margin: N,
		roundness: P
	},
	controls: {
		leftKeys: F,
		rightKeys: I,
		speedupKeys: L
	}
}, B = {
	horizontal: {
		start: 0,
		end: 1
	},
	vertical: {
		start: 0,
		end: 1
	}
}, V = class {
	views;
	viewIDCounter;
	constructor() {
		this.views = { 0: structuredClone(B) }, this.viewIDCounter = 0;
	}
	get mainView() {
		return this.views[0];
	}
	get screenView() {
		return -1;
	}
	get mainViewID() {
		return 0;
	}
	viewIDCheck(e) {
		if (!(e in this.views)) return Error(`Invalid View number ${e}`);
	}
	view(e) {
		return e === -1 ? structuredClone(B) : (this.viewIDCheck(e), this.views[e]);
	}
	splitView(e, t, n) {
		this.viewIDCheck(e);
		let r = this.views[e], i;
		switch (n) {
			case "vertical": {
				let e = Math.abs(r.horizontal.end - t - r.horizontal.end);
				i = {
					horizontal: {
						start: e,
						end: r.horizontal.end
					},
					vertical: structuredClone(r.vertical)
				}, r.horizontal.end = e;
				break;
			}
			case "horizontal": {
				let e = Math.abs(r.vertical.end - t - r.vertical.end);
				i = {
					horizontal: structuredClone(r.horizontal),
					vertical: {
						start: e,
						end: r.vertical.end
					}
				}, r.vertical.end = e;
				break;
			}
			default: throw Error("Invalid Orientation");
		}
		return this.views[e] = r, this.viewIDCounter += 1, this.views[this.viewIDCounter] = i, this.viewIDCounter;
	}
}, H = class {
	canvas;
	ctx;
	rafId = 0;
	running = !1;
	abort = new AbortController();
	resizeObserver;
	height;
	width;
	startingBlocks;
	store;
	properties;
	palette;
	customPalette;
	state = b;
	seconds = 0;
	colors;
	blockDownStepsCountdown;
	keySet;
	controls;
	transformations;
	model;
	clearedRows;
	constructor(e) {
		this.height = e.height, this.width = e.width, this.startingBlocks = e.startingBlocks, this.store = e.store ?? null, this.properties = e.properties ?? z, this.palette = e.palette ?? "default", this.customPalette = e.customPalette ?? null;
		let t = e.id ?? "breakout", n = document.getElementById(t);
		if (!n) throw Error(`Missing HTML element canvas "${t}"`);
		if (!(n instanceof HTMLCanvasElement)) throw Error(`HTML element "${t}" is not a canvas`);
		this.canvas = n, this.canvas.className = "breakout", this.canvas.tabIndex = 0, this.canvas.style.width = `${this.width}px`, this.canvas.style.height = `${this.height}px`;
		let r = this.canvas.getContext("2d");
		if (!r) throw Error("2D context not supported");
		this.ctx = r, this.keySet = /* @__PURE__ */ new Set(), this.controls = {
			...this.properties?.controls,
			...z.controls
		}, this.blockDownStepsCountdown = 0, this.colors = y(this.palette, this.customPalette), this.transformations = {
			screen: null,
			game: null,
			sidebar: null
		}, this.clearedRows = 0, this.model = this.makeBreakoutModel();
	}
	setStore(e) {
		this.store = e;
	}
	setState(e) {
		this.state = e, this.store && this.store.setState(e);
	}
	setSeconds(e) {
		this.seconds = e, this.store && this.store?.setSecondsElapsed(e);
	}
	init() {
		this.initialize(), this.start();
	}
	initialize() {
		let { signal: e } = this.abort;
		this.canvas.addEventListener("keydown", (e) => this.handleKeyDown(e), { signal: e }), this.canvas.addEventListener("keyup", (e) => this.handleKeyUp(e), { signal: e }), this.canvas.addEventListener("pointerdown", (e) => this.handlePointerDown(), { signal: e }), this.canvas.addEventListener("blur", (e) => this.handleBlur(), { signal: e }), this.canvas.addEventListener("focus", (e) => this.handleFocus(), { signal: e }), window.addEventListener("resize", (e) => this.handleResize(), { signal: e });
	}
	start() {
		let e = 0, t = -1, n = null, r = 0, a = (o) => {
			n === null && (n = o);
			let s = (o - n) / 1e3;
			switch (n = o, s = Math.min(s, i), this.clearScreen(), this.state) {
				case "end":
					this.drawGame("blur(6px)"), this.writeText("Game End", { rem: 10 });
					return;
				case "pause":
					this.drawGame("blur(6px)"), this.writeText("Paused", { rem: 10 });
					break;
				case "start":
					this.drawGame("blur(6px)");
					break;
				case "play":
					r += s, this.gameLogic(s), this.drawGame(), this.setSeconds(Math.floor(r)), this.seconds !== t && (t = this.seconds);
					break;
				default: throw Error(`Invalid game state: ${this.state}`);
			}
			this.drawBorders(), e++, this.rafId = window.requestAnimationFrame(a);
		};
		this.rafId = window.requestAnimationFrame(a);
	}
	gameLogic(e) {
		this.model.paddle.direction = this.getDirection(), this.model.objects.all.forEach((t) => t.move(e)), this.model.objects.all.forEach((e) => e.checkBounds()), this.blockDownStepsCountdown > 0 && (--this.blockDownStepsCountdown, this.blockDownStepsCountdown === 0 && this.model.activeBlocks.flat().forEach((e) => e.canMove = !1));
		for (let e of this.model.objects.all) this.model.ball.collides(e) && this.model.ball.handleCollision(e);
		this.filterBlocks(), this.model.objects.has(this.model.ball) && this.model.ball.boundHits.bottom && (this.model.objects.delete(this.model.ball), this.model.ball = this.model.ballCreate(), this.model.objects.add(this.model.ball), this.model.ball.canMove = !1, setTimeout(() => {
			this.model.ball.canMove = !0;
		}, 500));
	}
	clearScreen() {
		let e = this.transformations.screen;
		this.ctx.clearRect(e.X(0), e.Y(0), e.X(1), e.Y(1));
	}
	drawGame(e = "none") {
		let t = this.transformations.game;
		this.ctx.fillStyle = this.colors.background, this.ctx.fillRect(t.X(0), t.Y(0), t.X(1), t.Y(1)), this.model.objects.all.forEach((t) => {
			this.ctx.filter = e, t.draw(this.ctx, this.transformations.game);
		}), this.drawSidebar(), this.ctx.filter = "none";
	}
	drawBorders() {
		this.ctx.filter = "none", this.ctx.strokeStyle = "white", this.ctx.lineWidth = 2;
		let e = this.transformations.game;
		this.ctx.strokeRect(e.X(0), e.Y(0), e.X(1), e.Y(1)), e = this.transformations.screen, this.ctx.strokeRect(e.X(0), e.Y(0), e.X(1), e.Y(1));
	}
	drawSidebar() {
		if (!this.properties.sidebar?.blockRowIndicator) return;
		let e = this.transformations.sidebar;
		this.ctx.fillStyle = this.colors.background, this.ctx.fillRect(e.X(0), e.Y(0), e.X(1), e.Y(1));
		let t = (e.X(1) - e.X(0)) / 16 / (this.properties.sidebar.blockRowIndicatorWidthHint ?? 1);
		for (let e = 0; e < this.model.activeBlocks.length; e += 1) {
			let n = this.model.activeBlocks[e], r = n[0].Y + n[0].height / 2;
			this.writeText(this.properties.sidebar.blockRowIndicator(this.clearedRows + e), {
				view: "sidebar",
				X: .5,
				Y: r,
				rem: t
			});
		}
		this.ctx.filter = "none";
	}
	writeText(e, { view: t = "screen", X: n = .5, Y: r = .5, rem: i = 1 } = {}) {
		let a = this.transformations[t];
		this.ctx.fillStyle = "#fff", this.ctx.textAlign = "center", this.ctx.textBaseline = "middle", this.ctx.font = `${Math.floor(i * 16)}px monospace`, this.ctx.fillText(e, a.X(n), a.Y(r));
	}
	makeBreakoutModel() {
		let t = new V(), n = (e) => ({
			X: (n) => {
				let { start: r, end: i } = t.view(e).horizontal;
				return (r + +n.toFixed(5) * (i - r)) * this.canvas.width;
			},
			Y: (n) => {
				let { start: r, end: i } = t.view(e).vertical;
				return (r + +n.toFixed(5) * (i - r)) * this.canvas.height;
			}
		});
		if (this.transformations.screen = n(t.screenView), this.transformations.game = n(t.mainViewID), this.properties.sidebar?.blockRowIndicator) {
			let e = t.splitView(t.mainViewID, .8, "vertical");
			this.transformations.sidebar = n(e);
		}
		let i = (t.mainView.horizontal.end - t.mainView.horizontal.start) * this.width, c = (t.mainView.vertical.end - t.mainView.vertical.start) * this.height, l = i / c, u = (c - i) / c, d = (e) => e * l + u, f = (e) => e * l;
		this.handleResize();
		let p = () => {
			let e = this.properties?.ball?.angleDeg ?? z.ball.angleDeg, t = this.properties?.ball?.X ?? z.ball.X, n = this.properties?.ball?.Y ?? z.ball.Y, r = new s({
				...z.ball,
				...this.properties?.ball,
				X: R(t),
				Y: R(n),
				Z: 1,
				angleDeg: R(e),
				fillColor: this.colors.ball
			});
			return r.X -= r.width / 2, r.Y -= r.height / 2, r.angleDeg = (360 - r.angleDeg) % 360, r.Y = d(r.Y), r.height = f(r.height), r;
		}, m = this.properties?.blocks?.margin ?? z.block.margin, h = m / 2, g = 1 / this.startingBlocks.blocksPerRow, _ = [];
		for (let e = 0, t = 0; e < this.startingBlocks.blocks.length; e += this.startingBlocks.blocksPerRow, t += 1) _.push(this.startingBlocks.blocks.slice(e, e + this.startingBlocks.blocksPerRow).map((e, n) => {
			let r = n * g, i = d(a - t * g);
			return new o({
				X: r + h,
				Y: i + h,
				Z: 2,
				width: g - m,
				height: f(g - m),
				fullHeight: f(g),
				level: e.level,
				fillColor: this.colors.blocks,
				roundness: this.properties?.blocks?.roundness ?? z.block.roundness
			});
		}));
		let v = 0;
		for (; v < _.length && !_[v].filter((e) => e.alive).some((e) => !e.visible()); v += 1);
		let y = _.slice(0, v), b = _.slice(v), x = new r({
			...z.paddle,
			...this.properties?.paddle,
			fillColor: this.colors.paddle,
			Z: 1
		});
		x.Y = d(x.Y), x.height = f(x.height);
		let S = new e(), C = {
			activeBlocks: y,
			blockQueue: b,
			paddle: x,
			ball: p(),
			ballCreate: p,
			objects: S
		};
		return C.objects.add([
			C.paddle,
			C.ball,
			...C.activeBlocks.flat()
		]), C.paddle.X -= C.paddle.width / 2, C.paddle.Y -= C.paddle.height / 2, C;
	}
	handleKeyDown(e) {
		if (this.keySet.add(e.code), (e.code.startsWith("Arrow") || e.code === "Space") && e.preventDefault(), this.controls.speedupKeys.some((t) => t === e.code)) {
			let e = this.model.ball;
			e._speedup = e._speedup ?? !1, e._speedup || (e._speedup = !0, e.velocity *= 3);
		}
	}
	handleKeyUp(e) {
		if (this.keySet.delete(e.code), this.controls.speedupKeys.some((t) => t === e.code)) {
			let e = this.model.ball;
			e._speedup = e._speedup ?? !1, e._speedup && (e._speedup = !1, e.velocity /= 3);
		}
	}
	handlePointerDown() {
		this.canvas.focus();
	}
	handleBlur() {
		this.setState("pause"), this.keySet.clear();
	}
	handleFocus() {
		this.state !== "end" && this.setState("play");
	}
	handleResize() {
		if (this.state === "end") return;
		let e = window.devicePixelRatio || 1;
		this.canvas.height = this.canvas.clientHeight * e, this.canvas.width = this.canvas.clientWidth * e;
	}
	getDirection() {
		let e = "none";
		for (let t of this.controls.leftKeys) if (this.keySet.has(t)) {
			e = "left";
			break;
		}
		for (let t of this.controls.rightKeys) if (this.keySet.has(t)) {
			e = e === "left" ? "none" : "right";
			break;
		}
		return e;
	}
	filterBlocks() {
		let e = 0;
		for (let t = 0; t < this.model.activeBlocks.length; t += 1) if (this.model.activeBlocks[e].every((e) => !e.alive)) {
			e = t + 1;
			break;
		}
		if (e > 0) {
			this.clearedRows += e, this.blockDownStepsCountdown += 20 * e;
			let t = this.model.activeBlocks[this.model.activeBlocks.length - 1], n = t[0].Y, r = t[0].fullHeight, i = this.model.activeBlocks.slice(0, e);
			this.model.activeBlocks = this.model.activeBlocks.slice(e);
			let a = this.model.blockQueue.slice(0, e);
			this.model.blockQueue = this.model.blockQueue.slice(e), a.forEach((e, t) => {
				e.forEach((e) => {
					e.Y = n - (t + 1) * r;
				});
			}), this.model.objects.delete(i.flat()), this.model.objects.add(a.flat()), a.forEach((e) => this.model.activeBlocks.push(e)), this.model.activeBlocks.flat().forEach((e) => e.canMove = !0);
		}
		this.model.activeBlocks.length <= 0 && this.setState("end");
	}
	destroy() {
		this.running = !1, cancelAnimationFrame(this.rafId), this.abort.abort(), this.resizeObserver?.disconnect();
	}
};
export { h as a, v as i, b as n, d as o, y as r, H as t };

//# sourceMappingURL=breakout-GHvxRYRs.js.map