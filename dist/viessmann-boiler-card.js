// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, g = h.trustedTypes, ee = g ? g.emptyScript : "", te = h.reactiveElementPolyfillSupport, _ = (e, t) => e, ne = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ee : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, v = (e, t) => !l(e, t), re = {
	attribute: !0,
	type: String,
	converter: ne,
	reflect: !1,
	useDefault: !1,
	hasChanged: v
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = re) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? re;
	}
	static _$Ei() {
		if (this.hasOwnProperty(_("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(_("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(_("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? ne : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ne : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? v)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[_("elementProperties")] = /* @__PURE__ */ new Map(), y[_("finalized")] = /* @__PURE__ */ new Map(), te?.({ ReactiveElement: y }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ie = globalThis, ae = (e) => e, oe = ie.trustedTypes, b = oe ? oe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, se = "$lit$", x = `lit$${Math.random().toFixed(9).slice(2)}$`, ce = "?" + x, le = `<${ce}>`, S = document, C = () => S.createComment(""), w = (e) => e === null || typeof e != "object" && typeof e != "function", T = Array.isArray, E = (e) => T(e) || typeof e?.[Symbol.iterator] == "function", ue = "[ 	\n\f\r]", D = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, de = /-->/g, fe = />/g, O = RegExp(`>|${ue}(?:([^\\s"'>=/]+)(${ue}*=${ue}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), k = /'/g, pe = /"/g, me = /^(?:script|style|textarea|title)$/i, he = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), A = he(1), j = he(2), M = Symbol.for("lit-noChange"), N = Symbol.for("lit-nothing"), ge = /* @__PURE__ */ new WeakMap(), P = S.createTreeWalker(S, 129);
function _e(e, t) {
	if (!T(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return b === void 0 ? t : b.createHTML(t);
}
var F = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = D;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === D ? c[1] === "!--" ? o = de : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = O) : (me.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = O) : o = fe : o === O ? c[0] === ">" ? (o = i ?? D, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? O : c[3] === "\"" ? pe : k) : o === pe || o === k ? o = O : o === de || o === fe ? o = D : (o = O, i = void 0);
		let d = o === O && e[t + 1].startsWith("/>") ? " " : "";
		a += o === D ? n + le : l >= 0 ? (r.push(s), n.slice(0, l) + se + n.slice(l) + x + d) : n + x + (l === -2 ? t : d);
	}
	return [_e(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, I = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = F(t, n);
		if (this.el = e.createElement(l, r), P.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = P.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(se)) {
					let t = u[o++], n = i.getAttribute(e).split(x), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ye : r[1] === "?" ? be : r[1] === "@" ? xe : z
					}), i.removeAttribute(e);
				} else e.startsWith(x) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (me.test(i.tagName)) {
					let e = i.textContent.split(x), t = e.length - 1;
					if (t > 0) {
						i.textContent = oe ? oe.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], C()), P.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], C());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ce) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(x, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += x.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = S.createElement("template");
		return n.innerHTML = e, n;
	}
};
function L(e, t, n = e, r) {
	if (t === M) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = w(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = L(e, i._$AS(e, t.values), i, r)), t;
}
var ve = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? S).importNode(t, !0);
		P.currentNode = r;
		let i = P.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new R(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Se(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = P.nextNode(), a++);
		}
		return P.currentNode = S, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, R = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = N, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = L(this, e, t), w(e) ? e === N || e == null || e === "" ? (this._$AH !== N && this._$AR(), this._$AH = N) : e !== this._$AH && e !== M && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? E(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== N && w(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = I.createElement(_e(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new ve(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ge.get(e.strings);
		return t === void 0 && ge.set(e.strings, t = new I(e)), t;
	}
	k(t) {
		T(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(C()), this.O(C()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ae(e).nextSibling;
			ae(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, z = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = N, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = N;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = L(this, e, t, 0), a = !w(e) || e !== this._$AH && e !== M, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = L(this, r[n + o], t, o), s === M && (s = this._$AH[o]), a ||= !w(s) || s !== this._$AH[o], s === N ? e = N : e !== N && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === N ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ye = class extends z {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === N ? void 0 : e;
	}
}, be = class extends z {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== N);
	}
}, xe = class extends z {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = L(this, e, t, 0) ?? N) === M) return;
		let n = this._$AH, r = e === N && n !== N || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== N && (n === N || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Se = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		L(this, e);
	}
}, Ce = ie.litHtmlPolyfillSupport;
Ce?.(I, R), (ie.litHtmlVersions ??= []).push("3.3.3");
var we = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new R(t.insertBefore(C(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Te = globalThis, B = class extends y {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = we(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return M;
	}
};
B._$litElement$ = !0, B.finalized = !0, Te.litElementHydrateSupport?.({ LitElement: B });
var Ee = Te.litElementPolyfillSupport;
Ee?.({ LitElement: B }), (Te.litElementVersions ??= []).push("4.2.2");
// src/config.ts
function De() {
	return [{
		circuit: 1,
		name: "Boiler Loop",
		pump_label: "BOILER"
	}, {
		circuit: 2,
		name: "Radiant",
		separated_by: "heat_exchanger",
		mixing_valve: !0,
		pump_label: "RADIANT",
		zones: []
	}];
}
function Oe(e) {
	return e.circuits?.length ? e.circuits : De();
}
function ke(e, t, n) {
	return Me({
		...e,
		circuits: Oe(e).map((e) => e.circuit === t ? {
			...e,
			...n
		} : e)
	});
}
function Ae(e, t) {
	let n = Oe(e).find((e) => e.separated_by === "heat_exchanger");
	return n ? ke(e, n.circuit, { zones: t }) : e;
}
function je(e, t, n) {
	if (n < 0 || n >= e.length) return e;
	let r = [...e], [i] = r.splice(t, 1);
	return r.splice(n, 0, i), r;
}
function Me(e) {
	let t = { ...e };
	for (let e of [
		"title",
		"device_id",
		"asset_url"
	]) t[e] || delete t[e];
	return t.circuits &&= t.circuits.map((e) => {
		let t = { ...e };
		return t.name || delete t.name, t.pump_label || delete t.pump_label, t.zones &&= t.zones.map((e) => e.thermostat ? e : { name: e.name }), t;
	}), t;
}
// package.json
var Ne = "0.2.0", Pe = "viessmann-boiler-card", Fe = "viessmann-boiler-card-editor", Ie = Ne, Le = new URL(
	/* @vite-ignore */
	"viessmann-boiler-card/",
	import.meta.url
).pathname, Re = { "vitocrossal-300-cu3a-199": {
	name: "Vitocrossal 300",
	variant: "CU3A 199"
} };
// src/util/temperature.ts
function ze(e, t) {
	return t === "°F" ? (e - 32) * 5 / 9 : e;
}
function Be(e, t) {
	return t === "°F" ? e * 9 / 5 + 32 : e;
}
function V(e, t, n) {
	if (!t) return null;
	let r = e.states[t];
	if (!r) return null;
	let i = n ? r.attributes[n] : r.state, a = typeof i == "number" ? i : Number.parseFloat(String(i));
	return Number.isFinite(a) ? ze(a, n ? e.config.unit_system.temperature : r.attributes.unit_of_measurement ?? e.config.unit_system.temperature) : null;
}
function H(e, t, n = 0) {
	return e === null ? "–" : `${Be(e, t).toFixed(n)} ${t}`;
}
var Ve = [
	[30, [
		255,
		176,
		64
	]],
	[50, [
		255,
		132,
		40
	]],
	[75, [
		236,
		70,
		44
	]]
], He = [
	[15, [
		40,
		104,
		245
	]],
	[45, [
		64,
		148,
		255
	]],
	[70, [
		104,
		186,
		255
	]]
];
function Ue(e, t) {
	return e === "return" ? We(He, t ?? 30) : We(Ve, t ?? 50);
}
function We(e, t) {
	if (t <= e[0][0]) return e[0][1];
	for (let n = 1; n < e.length; n++) {
		let [r, i] = e[n];
		if (t <= r) {
			let [a, o] = e[n - 1], s = (t - a) / (r - a);
			return [
				0,
				1,
				2
			].map((e) => Math.round(o[e] + (i[e] - o[e]) * s));
		}
	}
	return e[e.length - 1][1];
}
// src/panels/controls.ts
function Ge(e, t, n) {
	let r = t ? e.states[t]?.attributes : void 0;
	if (!r) return n;
	let i = (...e) => {
		for (let t of e) if (typeof r[t] == "number") return r[t];
	};
	return {
		min: i("min", "min_temp") ?? n.min,
		max: i("max", "max_temp") ?? n.max,
		step: i("step", "target_temp_step") ?? n.step,
		unit: r.unit_of_measurement ?? n.unit
	};
}
function Ke(e) {
	let t = Je(e.step), n = (n) => e.onChange(Number(Math.min(e.max, Math.max(e.min, n)).toFixed(t))), r = e.value;
	return A`
    <span class="stepper ${e.pending ? "pending" : ""}">
      <button class="step" ?disabled=${r === null || r <= e.min} @click=${() => r !== null && n(r - e.step)} aria-label="Lower ${e.label}">−</button>
      <span class="step-value">${r === null ? "–" : r.toFixed(t)}${e.unit ? A`<small>${e.unit}</small>` : N}</span>
      <button class="step" ?disabled=${r === null || r >= e.max} @click=${() => r !== null && n(r + e.step)} aria-label="Raise ${e.label}">+</button>
    </span>
  `;
}
function qe(e, t, n, r) {
	return A`
    <div class="segmented" role="radiogroup" aria-label=${e}>
      ${t.map((e) => A`
          <button
            role="radio"
            aria-checked=${e.value === n}
            class=${e.value === n ? "selected" : ""}
            @click=${() => e.value !== n && r(e.value)}
          >
            ${e.label}
          </button>
        `)}
    </div>
  `;
}
function U(e, t) {
	return A`<div class="field"><span class="field-label">${e}</span>${t}</div>`;
}
function W(e, t, n, r) {
	return A`
    <button class="stat ${r ? "on" : ""}" ?disabled=${!n} @click=${() => n?.()}>
      <span class="stat-label">${e}</span>
      <span class="stat-value">${t}</span>
    </button>
  `;
}
function Je(e) {
	let t = String(e);
	return t.includes(".") ? t.split(".")[1].length : 0;
}
// src/panels/format.ts
function Ye(e) {
	return e.charAt(0).toUpperCase() + e.slice(1);
}
function Xe(e, t) {
	let n = String(e.hass.states[t]?.attributes.friendly_name ?? t), r = e.hass.devices[e.vicare.deviceId], i = r?.name_by_user ?? r?.name;
	return i && n.startsWith(`${i} `) ? n.slice(i.length + 1) : n;
}
// src/panels/diagnostics.ts
function Ze(e) {
	let { state: t, vicare: n } = e, r = n.device, i = t.burner, a = e.hass.language ?? "en", o = (e, t = 0) => e === null ? "–" : e.toLocaleString(a, {
		maximumFractionDigits: t,
		minimumFractionDigits: t
	}), s = (t) => t ? e.hass.states[t]?.state === "on" ? "On" : "Off" : "–", c = [
		...Object.values(r),
		...Object.values(n.circuits).flatMap((e) => Object.values(e)),
		...n.other
	].filter((t, n, r) => r.indexOf(t) === n && e.hass.states[t]).sort((t, n) => Xe(e, t).localeCompare(Xe(e, n)));
	return A`
    <div class="panel-grid">
      <section class="panel">
        <header class="panel-head"><h3>Burner</h3><span class="muted">${$e(e, c)}</span></header>
        <div class="stats">
          ${W("Burner", i.on ? "On" : "Off", () => e.moreInfo(r.burner), i.on)}
          ${W("Modulation", i.modulation === null ? "–" : `${o(i.modulation)} %`, () => e.moreInfo(r.burner_modulation))}
          ${W("Hours", o(i.hours), () => e.moreInfo(r.burner_hours))}
          ${W("Starts", o(i.starts), () => e.moreInfo(r.burner_starts))}
          ${W("Run per start", i.minutesPerStart === null ? "–" : `${o(i.minutesPerStart, 1)} min`)}
          ${W("Boiler", H(t.boilerC, e.unit, 1), () => e.moreInfo(r.boiler_temperature))}
          ${W("Outside", H(t.outsideC, e.unit, 1), () => e.moreInfo(r.outside_temperature))}
        </div>
      </section>
      ${t.circuits.map((t) => {
		let r = n.circuits[t.circuit] ?? {};
		return A`
          <section class="panel">
            <header class="panel-head"><h3>${t.name}</h3><span class="muted">Circuit ${t.circuit}</span></header>
            <div class="stats">
              ${W("Supply", H(t.supplyC, e.unit, 1), () => e.moreInfo(r.supply_temperature))}
              ${W("Pump", t.pumpOn ? "Running" : "Off", () => e.moreInfo(r.circulation_pump), t.pumpOn)}
              ${W("Frost protection", s(r.frost_protection), () => e.moreInfo(r.frost_protection))}
            </div>
          </section>
        `;
	})}
      <section class="panel wide">
        <header class="panel-head"><h3>All ViCare entities</h3><span class="muted">${c.length}</span></header>
        <div class="entity-list">
          ${c.map((t) => A`
              <button class="entity-row" @click=${() => e.moreInfo(t)}>
                <span>${Xe(e, t)}</span>
                <span class="muted">${Qe(e, t)}</span>
              </button>
            `)}
        </div>
      </section>
    </div>
  `;
}
function Qe(e, t) {
	let n = e.hass.states[t];
	if (!n) return "–";
	let r = n.attributes.unit_of_measurement, i = /^-?\d+(\.\d+)?$/.test(n.state) ? Number(n.state) : NaN;
	return Number.isFinite(i) ? `${i.toLocaleString(e.hass.language ?? "en")}${r ? ` ${r}` : ""}` : Ye(n.state);
}
function $e(e, t) {
	let n = Math.max(...t.map((t) => Date.parse(e.hass.states[t]?.last_updated ?? "") || 0));
	if (!n) return "";
	let r = Math.round((Date.now() - n) / 6e4);
	return `Updated ${new Intl.RelativeTimeFormat(e.hass.language ?? "en", { numeric: "auto" }).format(-Math.max(0, r), "minute")}`;
}
// src/util/heating-curve.ts
function et(e, t) {
	let n = t - e.roomSetpoint;
	return e.roomSetpoint + e.shift - e.slope * n * (1.4347 + .021 * n + 2479e-7 * n * n);
}
// src/panels/curve-chart.ts
var tt = 340, nt = 180, G = {
	left: 36,
	right: 12,
	top: 10,
	bottom: 26
}, rt = 20, it = -20, at = 100, ot = 0;
function st(e) {
	let t = (e) => {
		let t = [];
		for (let n = rt; n >= it; --n) t.push([n, et(e, n)]);
		return t;
	}, n = t(e.curve), r = e.draft ? t(e.draft) : [], i = [...n, ...r].map((e) => e[1]).concat(e.supplyC ?? []), a = Math.min(20, Math.floor(Math.min(...i) / 10) * 10), o = Math.min(at, Math.max(a + 30, Math.ceil(Math.max(...i) / 10) * 10)), s = (e) => G.left + (rt - e) / 40 * (tt - G.left - G.right), c = (e) => nt - G.bottom - (e - a) / (o - a) * (nt - G.top - G.bottom), l = (e) => e.map(([e, t], n) => `${n ? "L" : "M"}${s(e).toFixed(1)} ${c(t).toFixed(1)}`).join(""), u = (t) => `${Math.round(Be(t, e.unit))}°`, d = [
		20,
		10,
		0,
		-10,
		-20
	], f = [];
	for (let e = a; e <= o; e += 10) f.push(e);
	let p = e.outsideC, m = p === null ? null : et(e.curve, p), h = p !== null && m !== null && p <= rt && p >= it ? s(p) : null, g = `curve-plot-${++ot}`;
	return A`
    <svg class="curve-chart" viewBox="0 0 ${tt} ${nt}" role="img" aria-label="Heating curve">
      <defs>
        <clipPath id=${g}>
          <rect x=${G.left} y=${G.top - 3} width=${tt - G.left - G.right} height=${nt - G.top - G.bottom + 6} />
        </clipPath>
      </defs>
      ${f.map((e) => j`
          <line class="grid" x1=${G.left} x2=${tt - G.right} y1=${c(e)} y2=${c(e)} />
          <text class="tick" x=${G.left - 6} y=${c(e) + 3.5} text-anchor="end">${u(e)}</text>`)}
      ${d.map((e) => j`<text class="tick" x=${s(e)} y=${nt - G.bottom + 15} text-anchor="middle">${u(e)}</text>`)}
      <text class="axis" x=${tt - G.right} y=${178} text-anchor="end">Outside</text>
      <g clip-path="url(#${g})">
        <path class="curve-line" d=${l(n)} />
        ${r.length ? j`<path class="curve-line draft" d=${l(r)} />` : N}
      </g>
      ${h !== null && m !== null ? j`
          <line class="now" x1=${h} x2=${h} y1=${G.top} y2=${nt - G.bottom} />
          <circle class="target-dot" cx=${h} cy=${c(m)} r="4.5" />
          ${e.supplyC === null ? N : j`<circle class="supply-dot" cx=${h} cy=${c(e.supplyC)} r="5" />`}` : N}
    </svg>
    <div class="curve-legend">
      <span><i class="key target"></i>Target ${H(m, e.unit)}</span>
      <span><i class="key supply"></i>Supply now ${H(e.supplyC, e.unit)}</span>
      ${r.length ? A`<span><i class="key draft"></i>New curve</span>` : N}
      <span class="muted">at ${H(p, e.unit, 1)} outside</span>
    </div>
  `;
}
// src/panels/heating.ts
var ct = {
	dhwAndHeating: "Heating & hot water",
	heating: "Heating only",
	dhw: "Hot water only",
	forcedNormal: "Always normal",
	forcedReduced: "Always reduced",
	standby: "Standby",
	dhwAndHeatingCooling: "Heating, cooling & hot water",
	heatingCooling: "Heating & cooling",
	cooling: "Cooling only"
}, lt = {
	normal: "Normal",
	reduced: "Reduced",
	comfort: "Comfort",
	eco: "Eco",
	standby: "Standby",
	external: "External",
	holiday: "Holiday"
};
function ut(e) {
	return A`<div class="panel-grid">${e.state.circuits.map((t) => dt(e, t))}</div>`;
}
function dt(e, t) {
	let n = e.vicare.circuits[t.circuit] ?? {}, r = n.heating, i = r ? e.hass.states[r]?.attributes ?? {} : {}, a = i.vicare_modes ?? [], o = i.active_vicare_program, s = i.preset_modes ?? [], c = [
		...s.includes("home") ? [{
			value: "home",
			label: "Schedule"
		}] : [],
		...s.includes("comfort") ? [{
			value: "comfort",
			label: "Comfort"
		}] : [],
		...s.includes("eco") ? [{
			value: "eco",
			label: "Eco"
		}] : []
	], l = i.preset_mode === "comfort" || i.preset_mode === "eco" ? i.preset_mode : "home", u = [
		`${H(t.supplyC, e.unit)} supply`,
		t.pumpOn ? "pump running" : "pump off",
		o ? `${lt[o] ?? o} program` : void 0
	].filter(Boolean);
	return A`
    <section class="panel">
      <header class="panel-head">
        <h3>${t.name}</h3>
        <button class="link" @click=${() => e.moreInfo(r)}>${u.join(" · ")}</button>
      </header>
      ${a.length && r ? U("Mode", qe("Mode", a.map((e) => ({
		value: e,
		label: ct[e] ?? e
	})), i.active_vicare_mode, (t) => e.call("vicare", "set_vicare_mode", {
		entity_id: r,
		vicare_mode: t
	}))) : N}
      ${c.length > 1 && r ? U("Program", qe("Program", c, l, (t) => e.call("climate", "set_preset_mode", {
		entity_id: r,
		preset_mode: t
	}))) : N}
      <div class="field-row">
        ${ft(e, "Normal", n.normal_temperature ?? n.normal_heating_temperature)}
        ${ft(e, "Reduced", n.reduced_temperature ?? n.reduced_heating_temperature)}
        ${ft(e, "Comfort", n.comfort_temperature ?? n.comfort_heating_temperature)}
      </div>
      ${pt(e, t, n, o)}
    </section>
  `;
}
function ft(e, t, n) {
	if (!n) return N;
	let r = Ge(e.hass, n, {
		min: 3,
		max: 37,
		step: 1
	});
	return U(`${t} room`, Ke({
		...r,
		label: `${t.toLowerCase()} room temperature`,
		value: e.value(n),
		pending: e.pending(n),
		onChange: (t) => e.setValue(n, t)
	}));
}
function pt(e, t, n, r) {
	let i = n.heating_curve_slope, a = n.heating_curve_shift, o = e.value(i), s = e.value(a);
	if (!i || !a || o === null || s === null) return N;
	let c = e.curveDraft(t.circuit), l = c ?? {
		slope: o,
		shift: s
	}, u = mt(e, n, r) ?? 20, d = (n) => e.setCurveDraft(t.circuit, {
		...l,
		...n
	});
	return A`
    <div class="curve">
      <div class="field-row">
        ${U("Curve slope", Ke({
		...Ge(e.hass, i, {
			min: .2,
			max: 3.5,
			step: .1
		}),
		unit: void 0,
		label: "heating curve slope",
		value: l.slope,
		pending: !!c || e.pending(i),
		onChange: (e) => d({ slope: e })
	}))}
        ${U("Curve shift", Ke({
		...Ge(e.hass, a, {
			min: -13,
			max: 40,
			step: 1
		}),
		unit: void 0,
		label: "heating curve shift",
		value: l.shift,
		pending: !!c || e.pending(a),
		onChange: (e) => d({ shift: e })
	}))}
        ${c ? A`
              <div class="curve-actions">
                <button class="primary" @click=${() => e.applyCurve(t.circuit)}>Apply</button>
                <button @click=${() => e.setCurveDraft(t.circuit, void 0)}>Cancel</button>
              </div>
            ` : N}
      </div>
      ${st({
		curve: {
			slope: o,
			shift: s,
			roomSetpoint: u
		},
		draft: c ? {
			...c,
			roomSetpoint: u
		} : void 0,
		outsideC: e.state.outsideC,
		supplyC: t.supplyC,
		unit: e.unit
	})}
    </div>
  `;
}
function mt(e, t, n) {
	let r = (t) => V(e.hass, t);
	switch (n) {
		case "reduced": return r(t.reduced_temperature ?? t.reduced_heating_temperature);
		case "comfort": return r(t.comfort_temperature ?? t.comfort_heating_temperature);
		case "eco": {
			let e = r(t.normal_temperature ?? t.normal_heating_temperature);
			return e === null ? null : e - 3;
		}
		default: return r(t.normal_temperature ?? t.normal_heating_temperature);
	}
}
// src/panels/hot-water.ts
function ht(e) {
	let t = e.vicare.device, n = e.state, r = t.domestic_hot_water, i = t.dhw_temperature ?? r, a = Ge(e.hass, i, {
		min: 10,
		max: 60,
		step: 1,
		unit: e.unit
	}), o = (e) => e ? "On" : "Off", s = e.vicare.other.filter((e) => e.startsWith("select.")), c = e.vicare.other.filter((e) => e.startsWith("button."));
	return A`
    <div class="panel-grid">
      <section class="panel">
        <header class="panel-head">
          <h3>Hot water</h3>
          <button class="link" @click=${() => e.moreInfo(r)}>Vitocell 300-V</button>
        </header>
        <div class="big-reading">
          <span class="big">${H(n.tank.c, e.unit, 1)}</span>
          <span class="muted">in the tank</span>
        </div>
        ${i ? U("Target", Ke({
		...a,
		label: "hot water target",
		value: e.value(i),
		pending: e.pending(i),
		onChange: (t) => e.setValue(i, t)
	})) : N}
        <div class="stats">
          ${W("Charging", o(n.tank.charging), () => e.moreInfo(t.domestic_hot_water_charging), n.tank.charging)}
          ${W("DHW pump", o(n.tank.pumpOn), () => e.moreInfo(t.domestic_hot_water_pump), n.tank.pumpOn)}
          ${W("Water heater", Ye(r ? e.hass.states[r]?.state ?? "–" : "–"), () => e.moreInfo(r))}
        </div>
        ${s.map((t) => gt(e, t))}
        ${c.length ? A`<div class="actions">
              ${c.map((t) => A`<button @click=${() => e.call("button", "press", { entity_id: t })}>${Xe(e, t)}</button>`)}
            </div>` : N}
      </section>
    </div>
  `;
}
function gt(e, t) {
	let n = e.hass.states[t], r = n?.attributes.options ?? [];
	return r.length ? U(Xe(e, t), qe(Xe(e, t), r.map((e) => ({
		value: e,
		label: e.charAt(0).toUpperCase() + e.slice(1)
	})), n?.state, (n) => e.call("select", "select_option", {
		entity_id: t,
		option: n
	}))) : N;
}
// src/scene/catalog.ts
var K = [
	-1,
	0,
	0
], q = [
	1,
	0,
	0
], _t = [
	0,
	0,
	1
], vt = {
	"vitocrossal-300-cu3a-199": {
		min: [-357, 0],
		max: [357, 1640],
		ports: {
			supply: {
				at: [-64, 1640],
				dir: _t,
				d: 34.9
			},
			return: {
				at: [357, 1100],
				dir: q,
				d: 34.9
			},
			dhw_supply: {
				at: [-357, 642],
				dir: K,
				d: 28.6
			},
			dhw_return: {
				at: [-357, 342],
				dir: K,
				d: 28.6
			}
		}
	},
	"vitocell-300-v-56": {
		min: [-344, 0],
		max: [344, 1444],
		ports: {
			coil_upper: {
				at: [344, 642],
				dir: q,
				d: 28.6
			},
			coil_lower: {
				at: [344, 342],
				dir: q,
				d: 28.6
			},
			hot_out: {
				at: [150, 1444],
				dir: _t,
				d: 22.2
			},
			cold_in: {
				at: [-150, 1444],
				dir: _t,
				d: 22.2
			}
		}
	},
	"tempering-valve": {
		min: [-55, -45],
		max: [55, 60],
		ports: {
			cold: {
				at: [-55, 0],
				dir: K,
				d: 22.2
			},
			hot: {
				at: [55, 0],
				dir: q,
				d: 22.2
			},
			mixed: {
				at: [0, 60],
				dir: _t,
				d: 22.2
			}
		}
	},
	"circulator-red": {
		min: [-90, -80],
		max: [90, 130],
		ports: {
			inlet: {
				at: [-90, 0],
				dir: K,
				d: 25.4
			},
			outlet: {
				at: [90, 0],
				dir: q,
				d: 25.4
			}
		}
	},
	"plate-hx": {
		min: [-100, -170],
		max: [100, 170],
		ports: {
			p1_in: {
				at: [-100, 120],
				dir: K,
				d: 25.4
			},
			p1_out: {
				at: [-100, -120],
				dir: K,
				d: 25.4
			},
			p2_out: {
				at: [100, 120],
				dir: q,
				d: 25.4
			},
			p2_in: {
				at: [100, -120],
				dir: q,
				d: 25.4
			}
		}
	},
	"mixing-valve": {
		min: [-100, -110],
		max: [100, 160],
		ports: {
			a: {
				at: [-100, 0],
				dir: K,
				d: 25.4
			},
			ab: {
				at: [100, 0],
				dir: q,
				d: 25.4
			},
			b: {
				at: [0, -110],
				dir: [
					0,
					0,
					-1
				],
				d: 25.4
			}
		}
	},
	"zone-valve": {
		min: [-55, -35],
		max: [55, 110],
		ports: {
			inlet: {
				at: [-55, 0],
				dir: K,
				d: 19.05
			},
			outlet: {
				at: [55, 0],
				dir: q,
				d: 19.05
			}
		}
	}
};
vt["circulator-black"] = vt["circulator-red"];
var yt = 1;
function bt(e) {
	let t = vt[e] ?? vt["circulator-red"], n = yt, r = ([e, r]) => [(e - t.min[0]) * n, (t.max[1] - r) * n];
	return {
		id: e,
		pxPerMm: n,
		width: (t.max[0] - t.min[0]) * n,
		height: (t.max[1] - t.min[1]) * n,
		anchor: r([0, 0]),
		ports: Object.fromEntries(Object.entries(t.ports).map(([e, t]) => {
			let [n, i] = r(t.at);
			return [e, {
				x: n,
				y: i,
				dir: [t.dir[0], -t.dir[2]],
				diameter: t.d
			}];
		})),
		points: Object.fromEntries(Object.entries(t.points ?? {}).map(([e, t]) => [e, r(t)]))
	};
}
var xt = /* @__PURE__ */ new Map(), St = `?v=${Ie}`;
function Ct(e, t) {
	let n = `${e.replace(/\/?$/, "/")}${t}/`, r = xt.get(n);
	return r || (r = fetch(`${n}ports.json${St}`).then((e) => e.ok ? e.json() : Promise.reject(/* @__PURE__ */ Error(`HTTP ${e.status}`))).then((e) => Tt(e, n)).catch(() => bt(t)), xt.set(n, r)), r;
}
function wt(e) {
	return Object.keys(vt[e]?.ports ?? {});
}
function Tt(e, t) {
	if (e.camera.yaw_deg !== 0 || e.camera.pitch_deg !== 0) return console.warn(`viessmann-boiler-card: ${e.id} is not a front view; using the placeholder`), bt(e.id);
	let n = wt(e.id).filter((t) => !e.ports[t]);
	return n.length ? (console.warn(`viessmann-boiler-card: ${e.id} render lacks ${n.join(", ")}; using the placeholder`), bt(e.id)) : {
		id: e.id,
		width: e.image.width,
		height: e.image.height,
		pxPerMm: e.camera.px_per_mm,
		anchor: e.anchor_px,
		ports: Object.fromEntries(Object.entries(e.ports).map(([e, t]) => {
			let n = Math.hypot(t.dir[0], t.dir[2]) || 1;
			return [e, {
				x: t.px[0],
				y: t.px[1],
				dir: [t.dir[0] / n, -t.dir[2] / n],
				diameter: t.diameter_mm
			}];
		})),
		points: Object.fromEntries(Object.entries(e.points ?? {}).map(([e, t]) => [e, t.px])),
		image: `${t}${e.image.file}${St}`
	};
}
// src/scene/diagram.ts
var Et = "vitocrossal-300-cu3a-199", J = {
	tank: "vitocell-300-v-56",
	pumpRed: "circulator-red",
	pumpBlack: "circulator-black",
	hx: "plate-hx",
	mixer: "mixing-valve",
	zoneValve: "zone-valve",
	tempering: "tempering-valve"
};
function Dt(e) {
	return [e.model ?? "vitocrossal-300-cu3a-199", ...Object.values(J)];
}
var Ot = .36, Y = .5, X = {
	main: 13,
	branch: 10,
	pex: 7
}, kt = 800, At = 120, jt = 230, Mt = 200, Nt = 90, Pt = 772, Ft = 100, It = 100, Lt = 300, Rt = 60, zt = 15, Bt = 46;
function Vt(e, t) {
	let n = t.circuits ?? [], r = n.find((e) => !e.separated_by), i = n.find((e) => e.separated_by === "heat_exchanger"), a = `circuit${i?.circuit ?? 2}`, o = i?.zones?.length ? i.zones : [{ name: i?.name ?? "Radiant circuit" }], s = (e) => i?.zones?.length ? `${a}.zone${e}` : a, c = [], l = [], u = [], d = [], f = (t, n, r, i, a, o, s) => {
		let l = e(n), u = r / l.pxPerMm, d = o ? [l.ports[o].x, l.ports[o].y] : l.anchor, f = {
			key: t,
			spec: l,
			scale: u,
			x: i[0] - d[0] * u,
			y: i[1] - d[1] * u,
			name: a,
			tag: s
		};
		return c.push(f), f;
	}, p = (e, t) => {
		let n = e.spec.ports[t];
		return [e.x + n.x * e.scale, e.y + n.y * e.scale];
	}, m = (e) => e.x, h = (e) => e.x + e.spec.width * e.scale, g = (e) => e.y, ee = (e) => e.y + e.spec.height * e.scale, te = (e) => (m(e) + h(e)) / 2, _ = (e, t, n, r, i, a = "copper") => l.push({
		key: e,
		loops: t,
		side: n,
		material: a,
		width: r,
		points: i
	}), ne = (t, n, r, i, a, o) => {
		let s = e(n), c = (s.ports.outlet.x - s.ports.inlet.x) * (Y / s.pxPerMm);
		return f(t, n, Y, [(r[0] + i[0]) / 2 - c / 2, r[1]], a, "inlet", o);
	}, v = f("tank", J.tank, Ot, [185, kt], "Vitocell 300-V"), re = p(v, "coil_upper"), y = p(v, "coil_lower"), ie = t.model ?? "vitocrossal-300-cu3a-199", ae = e(ie), oe = (ae.ports.dhw_supply.x - ae.anchor[0]) * (Ot / ae.pxPerMm), b = f("boiler", ie, Ot, [re[0] + jt - oe, kt], "Vitocrossal 300"), se = p(b, "dhw_supply"), x = p(b, "dhw_return"), ce = p(b, "supply"), le = p(b, "return"), S = ne("dhw-pump", J.pumpRed, re, se, "Hot water pump", "DHW");
	_("dhw-supply", ["dhw"], "supply", X.branch, Ht(se, p(S, "outlet"))), _("dhw-to-tank", ["dhw"], "supply", X.branch, Ht(p(S, "inlet"), re)), _("dhw-return", ["dhw"], "return", X.branch, Ht(y, x));
	let C = f("boiler-pump", J.pumpRed, Y, [ce[0] + 60, At], "Boiler pump", "inlet", r?.pump_label ?? "BOILER"), w = p(C, "outlet"), T = w[0] + 28, E = f("hx", J.hx, Y, [Math.max(T + Nt, le[0] + 90), le[1]], "Heat exchanger", "p1_out"), ue = p(E, "p1_in"), D = p(E, "p1_out"), de = p(E, "p2_out"), fe = p(E, "p2_in");
	_("boiler-supply", ["boiler"], "supply", X.main, [
		ce,
		[ce[0], At],
		p(C, "inlet")
	]), _("pump-to-hx", ["boiler"], "supply", X.main, [
		w,
		[T, w[1]],
		[T, ue[1]],
		ue
	]), _("hx-return", ["boiler"], "return", X.main, Ht(D, le));
	let O = p(v, "hot_out"), k = p(v, "cold_in"), pe = f("tempering", J.tempering, Y, [(O[0] + k[0]) / 2, Mt], "Mixing valve"), me = p(pe, "cold"), he = p(pe, "hot"), A = p(pe, "mixed"), j = [k[0], me[1]];
	_("tap-cold", ["tap"], "return", X.branch, [[k[0], Bt], k]), _("tap-cold-to-mixer", ["tap"], "return", X.branch, [j, me]), _("tap-hot", ["tap"], "supply", X.branch, [
		O,
		[O[0], he[1]],
		he
	]), _("tap-mixed", ["tap"], "supply", X.branch, [A, [A[0], Bt]]), u.push({
		at: j,
		width: X.branch,
		vertical: !0
	}), d.push({
		key: "cold",
		at: [k[0], Bt],
		dir: [0, -1],
		label: "Cold water in",
		labelSide: "left"
	}, {
		key: "hot",
		at: [A[0], Bt],
		dir: [0, -1],
		label: "Hot water to taps"
	});
	let M = f("mixer", J.mixer, Y, [de[0] + 70, de[1]], "Mixing valve", "a"), N = p(M, "ab"), ge = p(M, "b"), P = f("radiant-pump", J.pumpBlack, Y, [N[0] + 40, N[1]], "Radiant pump", "inlet", i?.pump_label ?? "RADIANT"), _e = p(P, "outlet");
	_("hx-to-mixer", [a], "supply", X.main, [de, p(M, "a")]), _("mixer-to-pump", [a], "supply", X.main, [N, p(P, "inlet")]);
	let F = _e[0] + 60, I = _e[1];
	_("pump-to-manifold", [a], "supply", X.main, [_e, [F, I]]), u.push({
		at: [F, I],
		width: X.main,
		vertical: !0
	});
	let L = o.map((e, t) => Ft + t * It), ve = L.map((e, t) => f(`zone-valve-${t}`, J.zoneValve, Y, [F + 30, e], "Zone valve", "inlet")), R = p(ve[0], "outlet")[0] + 30, z = R + Lt + 40, ye = [.../* @__PURE__ */ new Set([...L, I])].sort((e, t) => e - t);
	for (let e = 0; e < ye.length - 1; e++) {
		let [t, n] = [ye[e], ye[e + 1]], r = n <= I, i = L.flatMap((e, i) => (r ? e <= t : e >= n) ? [s(i)] : []), a = r ? [[F, n], [F, t]] : [[F, t], [F, n]];
		_(`supply-manifold-${e}`, i, "supply", X.main, a);
	}
	let be = o.map((e, t) => {
		let n = L[t], r = s(t);
		return _(`zone-${t}-supply`, [r], "supply", X.branch, [[F, n], p(ve[t], "inlet")]), _(`zone-${t}-to-coil`, [r], "supply", X.branch, [p(ve[t], "outlet"), [R, n]]), _(`zone-${t}-coil`, [r], "coil", X.pex, Ut(R, R + Lt, n, n - Rt + 14), "pex"), _(`zone-${t}-return`, [r], "return", X.branch, [[R + Lt, n], [z, n]]), u.push({
			at: [F, n],
			width: X.main,
			vertical: !0
		}, {
			at: [z, n],
			width: X.main,
			vertical: !0
		}), {
			index: t,
			key: `zone-${t}`,
			name: e.name,
			loop: r,
			x: R,
			y: n - Rt,
			w: Lt,
			h: 80
		};
	});
	for (let e = 0; e < L.length - 1; e++) _(`return-manifold-${e}`, L.slice(0, e + 1).map((e, t) => s(t)), "return", X.main, [[z, L[e]], [z, L[e + 1]]]);
	let xe = fe[0] + 34, Se = [ge[0], Pt];
	_("radiant-return", [a], "return", X.main, [
		[z, L[L.length - 1]],
		[z, Pt],
		Se
	]), _("mixer-bypass", [a], "return", X.branch, [Se, ge]), _("hx-secondary-return", [a], "return", X.main, [
		Se,
		[xe, Pt],
		[xe, fe[1]],
		fe
	]), u.push({
		at: Se,
		width: X.main,
		vertical: !1
	});
	let Ce = (e) => ({
		at: [te(e), ee(e) + 4],
		below: !0
	}), we = b.spec.points.burner_glow;
	return {
		width: z + 50,
		height: 836,
		floor: {
			y: kt,
			x0: m(v) - 30,
			x1: h(b) + 30
		},
		parts: c,
		pipes: l,
		joints: u,
		terminals: d,
		zones: be,
		anchors: {
			boiler: { at: [te(b), g(b) + (ee(b) - g(b)) * .3] },
			tank: { at: [te(v), g(v) + (ee(v) - g(v)) * .28] },
			hx: { at: [te(E), g(E) - 6] },
			radiant: Ce(P),
			burner: { at: we ? [b.x + we[0] * b.scale, b.y + we[1] * b.scale] : [te(b), g(b) + (ee(b) - g(b)) * .6] }
		}
	};
}
function Ht(e, t) {
	if (Math.abs(e[1] - t[1]) < .5) return [e, [t[0], e[1]]];
	let n = (e[0] + t[0]) / 2;
	return [
		e,
		[n, e[1]],
		[n, t[1]],
		t
	];
}
function Ut(e, t, n, r) {
	let i = e + 150, a = t - 18, o = Math.max(1, Math.floor(((a - i) / zt - 1) / 2)), s = [[e, n], [i, n]];
	for (let e = 0; e <= o * 2 - 1; e++) {
		let t = i + e * zt, [a, o] = e % 2 == 0 ? [n, r] : [r, n];
		e > 0 && s.push([t, a]), s.push([t, o]);
	}
	return s.push([t, n]), s;
}
// src/scene/geometry.ts
function Wt(e, t, n = 8) {
	let r = $t(e);
	if (r.length < 3) return {
		points: r,
		corners: []
	};
	let i = [r[0]], a = [];
	for (let e = 1; e < r.length - 1; e++) {
		let o = r[e - 1], s = r[e], c = r[e + 1], l = Q(o, s), u = Q(s, c), d = (s[0] - o[0]) * (c[1] - s[1]) - (s[1] - o[1]) * (c[0] - s[0]);
		if (Math.abs(d) < 1e-6 * l * u) continue;
		let f = Math.min(t, l / 2, u / 2), p = Zt(s, o, f / l), m = Zt(s, c, f / u), h = i.length;
		i.push(p);
		for (let e = 1; e < n; e++) i.push(Qt(p, s, m, e / n));
		i.push(m), a.push({
			start: h,
			end: i.length - 1
		});
	}
	return i.push(r[r.length - 1]), {
		points: i,
		corners: a
	};
}
function Gt(e, t, n) {
	return e.map((r, i) => {
		let [a, o] = Kt(e, i), s = t * (n[0] * a + n[1] * o);
		return [r[0] + s * a, r[1] + s * o];
	});
}
function Kt(e, t) {
	let n = e[Math.max(0, t - 1)], r = e[Math.min(e.length - 1, t + 1)], i = r[0] - n[0], a = r[1] - n[1], o = Math.hypot(i, a) || 1;
	return [-a / o, i / o];
}
function Z(e) {
	return e.map((e, t) => `${t ? "L" : "M"}${e[0].toFixed(1)} ${e[1].toFixed(1)}`).join("");
}
function qt(e) {
	let t = 0;
	for (let n = 1; n < e.length; n++) t += Q(e[n - 1], e[n]);
	return t;
}
function Jt(e, t, n) {
	let r = [Xt(e, t)], i = 0;
	for (let a = 1; a < e.length; a++) i += Q(e[a - 1], e[a]), i > t && i < n && r.push(e[a]);
	return r.push(Xt(e, n)), r;
}
function Yt(e, t) {
	let n = 0;
	for (let r = 1; r <= t; r++) n += Q(e[r - 1], e[r]);
	return n;
}
function Xt(e, t) {
	let n = t;
	for (let t = 1; t < e.length; t++) {
		let r = Q(e[t - 1], e[t]);
		if (n <= r) return Zt(e[t - 1], e[t], r ? n / r : 0);
		n -= r;
	}
	return e[e.length - 1];
}
function Q(e, t) {
	return Math.hypot(t[0] - e[0], t[1] - e[1]);
}
function Zt(e, t, n) {
	return [e[0] + (t[0] - e[0]) * n, e[1] + (t[1] - e[1]) * n];
}
function Qt(e, t, n, r) {
	let i = 1 - r;
	return [i * i * e[0] + 2 * i * r * t[0] + r * r * n[0], i * i * e[1] + 2 * i * r * t[1] + r * r * n[1]];
}
function $t(e) {
	let t = [];
	for (let n of e) {
		let e = t[t.length - 1];
		(!e || Q(e, n) > .01) && t.push([n[0], n[1]]);
	}
	return t;
}
// src/scene/flow-layer.ts
var en = 1e3 / 30, tn = class {
	canvas;
	ctx;
	streams = [];
	viewBox = {
		x: 0,
		y: 0,
		w: 1,
		h: 1
	};
	scale = 1;
	frame = 0;
	last = 0;
	elapsed = 0;
	animate = !0;
	running = !1;
	constructor(e) {
		this.canvas = e, this.ctx = e.getContext("2d");
	}
	setStreams(e) {
		this.ctx && (this.streams = e.map((e) => {
			let t = Math.max(5, e.width * 2.2), n = (e.occluders ?? []).map((e) => ({
				path: new Path2D(Z(e.points)),
				width: e.width
			})), r = [
				this.paint(e, .38),
				this.paint(e, .85),
				this.paint(e, .95, !0)
			];
			return {
				...e,
				path: new Path2D(Z(e.points)),
				dash: t,
				gap: t * 1.15,
				hidden: n,
				paints: r
			};
		}), this.draw());
	}
	paint(e, t, n = !1) {
		let r = (e) => {
			let [r, i, a] = n ? e.map(nn) : e;
			return `rgba(${r}, ${i}, ${a}, ${t})`;
		};
		if (!e.fade || !this.ctx) return r(e.rgb);
		let [i, a] = [e.points[0], e.fade.to], o = this.ctx.createLinearGradient(i[0], i[1], a[0], a[1]);
		return o.addColorStop(0, r(e.rgb)), o.addColorStop(1, r(e.fade.rgb)), o;
	}
	setViewport(e, t, n, r) {
		let i = Math.max(1, Math.round(t * r)), a = Math.max(1, Math.round(n * r));
		this.canvas.width !== i && (this.canvas.width = i), this.canvas.height !== a && (this.canvas.height = a), this.viewBox = e, this.scale = i / e.w, this.draw();
	}
	setAnimate(e) {
		this.animate = e, e || this.stop(), this.draw();
	}
	start() {
		!this.running && this.animate && (this.running = !0, this.last = performance.now(), this.frame = requestAnimationFrame(this.tick));
	}
	stop() {
		this.running = !1, cancelAnimationFrame(this.frame);
	}
	tick = (e) => {
		this.running && (this.frame = requestAnimationFrame(this.tick), !(e - this.last < en) && (this.elapsed += Math.min(.1, (e - this.last) / 1e3), this.last = e, this.draw()));
	};
	draw() {
		let e = this.ctx;
		if (!e || (e.setTransform(1, 0, 0, 1, 0, 0), e.clearRect(0, 0, this.canvas.width, this.canvas.height), !this.streams.length)) return;
		let t = this.scale;
		e.setTransform(t, 0, 0, t, -this.viewBox.x * t, -this.viewBox.y * t), e.lineCap = "round", e.lineJoin = "round";
		for (let t of this.streams) {
			e.setLineDash([]), e.lineWidth = t.width * .5, e.strokeStyle = "rgba(30, 14, 6, 0.32)", e.stroke(t.path), this.animate && (e.setLineDash([t.dash, t.gap]), e.lineDashOffset = -(this.elapsed * t.speed % (t.dash + t.gap)));
			let [n, r, i] = t.paints;
			if (e.lineWidth = t.width * .56, e.strokeStyle = n, e.stroke(t.path), e.lineWidth = t.width * .3, e.strokeStyle = r, e.stroke(t.path), e.lineWidth = t.width * .11, e.strokeStyle = i, e.stroke(t.path), t.hidden.length) {
				e.save(), e.globalCompositeOperation = "destination-out", e.setLineDash([]), e.strokeStyle = "#000";
				for (let n of t.hidden) e.lineWidth = n.width, e.stroke(n.path);
				e.restore();
			}
		}
	}
};
function nn(e) {
	return Math.round(e + (255 - e) * .65);
}
// src/scene/svg.ts
var rn = [-.55, -.835], an = 1.5, on = 27, sn = {
	copper: {
		edge: "#74401f",
		body: "#c07648",
		light: "#efb186",
		spec: "#fff4e8",
		specOpacity: .8,
		ring: "#5d3017"
	},
	pex: {
		edge: "#a99f92",
		body: "#ece6dc",
		light: "#fffcf6",
		spec: "#ffffff",
		specOpacity: .9,
		ring: "#8f8578"
	}
}, cn = {
	edge: "#6a361a",
	body: "#b56b40",
	light: "#e6a679",
	spec: "#ffefe0",
	specOpacity: .75,
	ring: "#4f2812"
};
function ln(e) {
	let t = Wt(e.points, e.width * an), n = t.points.map((e) => e[0]), r = t.points.map((e) => e[1]), i = e.width / 2;
	return {
		pipe: e,
		points: t.points,
		corners: t.corners,
		box: [
			Math.min(...n) - i,
			Math.min(...r) - i,
			Math.max(...n) + i,
			Math.max(...r) + i
		]
	};
}
function un(e, t) {
	return e.box[0] < t.box[2] && t.box[0] < e.box[2] && e.box[1] < t.box[3] && t.box[1] < e.box[3];
}
function dn(e) {
	return j`<defs>
    <filter id="pipe-shadow" filterUnits="userSpaceOnUse" x="0" y="0" width=${e.width} height=${e.height}>
      <feGaussianBlur stdDeviation="2.5" />
    </filter>
    <filter id="part-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.28" />
    </filter>
    <radialGradient id="contact" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#000" stop-opacity="0.35" />
      <stop offset="1" stop-color="#000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" class="floor-top" />
      <stop offset="1" class="floor-bottom" />
    </linearGradient>
    <radialGradient id="burner-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffb04a" stop-opacity="0.85" />
      <stop offset="0.45" stop-color="#ff7a1a" stop-opacity="0.35" />
      <stop offset="1" stop-color="#ff6a00" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="zone-warm" cx="0.75" cy="0.6" r="0.75">
      <stop offset="0" stop-color="#ff8a3d" stop-opacity="0.32" />
      <stop offset="1" stop-color="#ff8a3d" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="ph-steel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9ea3a8" /><stop offset="0.35" stop-color="#c9cdd1" /><stop offset="1" stop-color="#8d9297" />
    </linearGradient>
    <linearGradient id="ph-white" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#c9c9c6" /><stop offset="0.35" stop-color="#fafaf8" /><stop offset="1" stop-color="#b9b9b5" />
    </linearGradient>
  </defs>`;
}
function fn(e) {
	let { y: t, x0: n, x1: r } = e.floor, i = e.parts.filter((e) => e.key === "tank" || e.key === "boiler");
	return j`
    <rect class="floor" x=${n} y=${t} width=${r - n} height=${e.height - t} fill="url(#floor)" />
    <line class="floor-line" x1=${n} y1=${t} x2=${r} y2=${t} />
    ${i.map((e) => {
		let n = e.spec.width * e.scale;
		return j`<ellipse cx=${e.x + n / 2} cy=${t} rx=${n * .56} ry="9" fill="url(#contact)" />`;
	})}`;
}
function pn(e) {
	return j`<g filter="url(#pipe-shadow)" opacity="0.2" transform="translate(3 5)">
    ${e.map((e) => j`<path d=${Z(e.points)} stroke="#2b2117" stroke-width=${e.pipe.width * .9} />`)}
  </g>`;
}
function mn(e, t, n) {
	let r = Z(e);
	return j`
    <path d=${r} stroke=${n.edge} stroke-width=${t} />
    <path d=${r} stroke=${n.body} stroke-width=${t * .8} />
    <path d=${Z(Gt(e, t * .17, rn))} stroke=${n.light} stroke-width=${t * .36} opacity="0.9" />
    <path d=${Z(Gt(e, t * .28, rn))} stroke=${n.spec} stroke-width=${Math.max(.6, t * .08)} opacity=${n.specOpacity} />
    <path d=${Z(Gt(e, -t * .3, rn))} stroke=${n.light} stroke-width=${t * .07} opacity="0.3" />`;
}
function hn(e, t, n, r) {
	let i = Math.min(e.length - 1, Math.max(0, t)), [a, o] = Kt(e, i), [s, c] = e[i], l = n * .6;
	return j`<line x1=${s - a * l} y1=${c - o * l} x2=${s + a * l} y2=${c + o * l} stroke=${r.ring} stroke-width=${Math.max(.8, n * .08)} opacity="0.75" />`;
}
function gn(e) {
	let { width: t, material: n } = e.pipe, r = t * .9, i = n === "copper" ? e.corners.map(({ start: n, end: i }) => {
		let a = Math.max(0, Yt(e.points, n) - r), o = Math.min(qt(e.points), Yt(e.points, i) + r), s = Jt(e.points, a, o);
		return j`${mn(s, t * 1.14, cn)}${hn(s, 1, t * 1.14, cn)}${hn(s, s.length - 2, t * 1.14, cn)}`;
	}) : null;
	return j`<g class="pipe">${mn(e.points, t, sn[n])}${i}</g>`;
}
function _n(e) {
	let t = e.width * .95, n = e.vertical ? [[e.at[0], e.at[1] - t], [e.at[0], e.at[1] + t]] : [[e.at[0] - t, e.at[1]], [e.at[0] + t, e.at[1]]];
	return j`<g class="pipe">${mn(n, e.width * 1.16, cn)}${hn(n, 0, e.width * 1.16, cn)}${hn(n, 1, e.width * 1.16, cn)}</g>`;
}
function vn(e) {
	let [t, n] = e.at, r = e.dir[0] === 0;
	return j`<g class="terminal">${r ? j`<rect x=${t - 9} y=${n - 2} width="18" height="26" rx="4" class="brass" />` : j`<rect x=${t - 2} y=${n - 9} width="26" height="18" rx="4" class="brass" />`}${r ? j`<rect x=${t + 6} y=${n + 6} width="26" height="6" rx="3" class="lever" />` : j`<rect x=${t + 7} y=${n - 30} width="6" height="24" rx="3" class="lever" />`}${r ? e.labelSide === "left" ? j`<text class="terminal-label" x=${t - 16} y=${n + 14} text-anchor="end">${e.label}</text>` : j`<text class="terminal-label" x=${t + 40} y=${n + 14}>${e.label}</text>` : j`<text class="terminal-label" x=${t - 10} y=${n + 5} text-anchor="end">${e.label}</text>`}</g>`;
}
function yn(e, t) {
	return j`<g class="zone ${t ? "calling" : ""}">
    <rect class="tile" x=${e.x} y=${e.y} width=${e.w} height=${e.h} rx="10" />
    ${t ? j`<rect x=${e.x} y=${e.y} width=${e.w} height=${e.h} rx="10" fill="url(#zone-warm)" />` : null}
  </g>`;
}
function bn(e, t, n) {
	let r = e.x + 14;
	return j`<g class="zone-text ${t ? "calling" : ""}">
    <circle cx=${r + 5} cy=${e.y + 21} r="5" class="dot" />
    <text class="zone-name" x=${r + 16} y=${e.y + 27}>${e.name}</text>
    <text class="zone-temp" x=${r} y=${e.y + 50}>${n}</text>
    <rect class="hit" data-key=${e.key} x=${e.x} y=${e.y} width=${e.w} height=${e.h} />
  </g>`;
}
function xn(e, t = {}) {
	let n = e.spec.width * e.scale, r = e.spec.height * e.scale;
	return j`<g filter="url(#part-shadow)">${e.spec.image ? j`<image href=${e.spec.image} x=${e.x} y=${e.y} width=${n} height=${r} preserveAspectRatio="none" />` : Cn(e, n, r)}</g>${Sn(e, n, t)}
    <rect class="hit" data-key=${e.key} x=${e.x} y=${e.y} width=${n} height=${r} />`;
}
function Sn(e, t, { tag: n, on: r }) {
	if (n === void 0 && r === void 0) return null;
	let i = e.x + t / 2, a = e.y + 14, o = n ? n.length * 9.6 + 14 : 0, s = n ? [i + o / 2 + 9, a] : [e.x + t - 6, e.y + 8];
	return j`<g class="status ${r ? "on" : ""}">
    ${n ? j`<rect class="tag" x=${i - o / 2} y=${a - 10} width=${o} height="20" rx="3" />
        <text class="tag-text" x=${i} y=${a + 5} text-anchor="middle">${n}</text>` : null}
    ${r === void 0 ? null : j`<circle class="led-halo" cx=${s[0]} cy=${s[1]} r="9" /><circle class="led" cx=${s[0]} cy=${s[1]} r="5" />`}
  </g>`;
}
function Cn(e, t, n) {
	return j`${Tn(e, t, n)}${wn(e)}`;
}
function wn(e) {
	let t = e.key === "boiler";
	return Object.values(e.spec.ports).map((n) => {
		let r = Math.max(8, n.diameter * e.spec.pxPerMm * e.scale * 1.3), i = n.dir[1] < 0, a = t ? i ? e.spec.height * e.scale * .088 : on * e.scale : 12, o = e.x + n.x * e.scale, s = e.y + n.y * e.scale, [c, l] = [-n.dir[0] * a, -n.dir[1] * a];
		return j`<rect x=${Math.min(o, o + c) - (c ? 0 : r / 2)} y=${Math.min(s, s + l) - (l ? 0 : r / 2)}
      width=${c ? Math.abs(c) : r} height=${l ? Math.abs(l) : r} rx="2" class="brass" />`;
	});
}
function Tn(e, t, n) {
	let { x: r, y: i } = e, a = e.spec.id;
	if (a.startsWith("vitocrossal") || a.startsWith("vitodens")) {
		let a = n * .088, o = on * e.scale, [s, c] = [r + o, t - 2 * o];
		return j`
      <rect x=${s} y=${i + a} width=${c} height=${n - a} rx="5" fill="url(#ph-steel)" />
      <rect x=${s} y=${i + a} width="3.5" height=${n - a} fill="#c8102e" />
      <rect x=${s + c - 3.5} y=${i + a} width="3.5" height=${n - a} fill="#c8102e" />
      <rect x=${s + c * .3} y=${i + a - 16} width=${c * .4} height="16" rx="3" fill="#e2551b" />`;
	}
	if (a.startsWith("vitocell")) return j`<rect x=${r} y=${i} width=${t} height=${n} rx=${t * .1} fill="url(#ph-white)" stroke="#a9a9a5" />`;
	if (a.startsWith("circulator")) {
		let e = a.endsWith("black") ? "#2a2c2e" : "#a3242a";
		return j`
      <rect x=${r + t * .1} y=${i + n * .42} width=${t * .8} height=${n * .36} rx="6" fill=${e} />
      <circle cx=${r + t / 2} cy=${i + n * .45} r=${Math.min(t, n) * .32} fill=${e} stroke="#111" stroke-opacity="0.4" />
      <rect x=${r + t * .3} y=${i} width=${t * .4} height=${n * .2} rx="3" fill=${e} />`;
	}
	return a === "plate-hx" ? j`<rect x=${r + t * .2} y=${i} width=${t * .6} height=${n} rx="4" fill="url(#ph-steel)" stroke="#6f757b" />` : a === "tempering-valve" ? j`
      <rect x=${r + t * .42} y=${i} width=${t * .16} height=${n * .5} class="brass" />
      <rect x=${r} y=${i + n * .42} width=${t} height=${n * .3} rx="5" class="brass" />
      <circle cx=${r + t / 2} cy=${i + n * .84} r=${Math.min(t, n) * .16} fill="#8e9398" />` : a === "mixing-valve" ? j`
      <rect x=${r + t * .4} y=${i + n * .55} width=${t * .2} height=${n * .45} fill="#2e3033" />
      <rect x=${r} y=${i + n * .5} width=${t} height=${n * .2} rx="4" fill="#2e3033" />
      <rect x=${r + t * .22} y=${i} width=${t * .56} height=${n * .5} rx="5" fill="#1c1d1f" stroke="#55585c" />` : j`
    <rect x=${r} y=${i + n * .66} width=${t} height=${n * .2} rx="3" fill="#b8922f" />
    <rect x=${r + t * .12} y=${i} width=${t * .76} height=${n * .66} rx="4" fill="#8e9398" />`;
}
// src/system/thermostats.ts
var En = (e) => e.toLowerCase().replace(/thermostat/g, "").replace(/[^a-z0-9]/g, ""), Dn = /* @__PURE__ */ new WeakMap();
function On(e, t) {
	let n = Dn.get(e.entities);
	return n || Dn.set(e.entities, n = /* @__PURE__ */ new Map()), n.has(t) || n.set(t, kn(e, t)), n.get(t);
}
function kn(e, t) {
	let n = En(t);
	if (!n) return;
	let r;
	for (let t of An(e)) {
		let i = [t.slice(8), String(e.states[t]?.attributes.friendly_name ?? "")].map(En), a = i.includes(n), o = i.some((e) => e.startsWith(n));
		if (!a && !o) continue;
		let s = {
			id: t,
			score: a ? 2 : 1,
			length: Math.min(...i.map((e) => e.length))
		};
		(!r || s.score > r.score || s.score === r.score && s.length < r.length) && (r = s);
	}
	return r?.id;
}
function An(e) {
	return Object.keys(e.states).filter((t) => t.startsWith("climate.") && e.entities[t]?.platform !== "vicare").sort();
}
function jn(e) {
	let t = An(e), n = t.filter((t) => e.entities[t]?.platform === "nest");
	return n.length ? n : t;
}
function Mn(e, t) {
	let n = String(e.states[t]?.attributes.friendly_name ?? t.slice(8));
	return n.replace(/\s*thermostat$/i, "").trim() || n;
}
// src/system/state.ts
var Nn = 11, Pn = 8, Fn = 12;
function In(e, t, n) {
	let r = t.device, i = (t) => !!t && e.states[t]?.state === "on", a = (t) => {
		let n = Number.parseFloat(t ? e.states[t]?.state ?? "" : "");
		return Number.isFinite(n) ? n : null;
	}, o = V(e, r.boiler_temperature) ?? V(e, r.boiler_supply_temperature), s = a(r.burner_hours), c = a(r.burner_starts), l = {
		on: i(r.burner),
		modulation: a(r.burner_modulation),
		hours: s,
		starts: c,
		minutesPerStart: s !== null && c ? s * 60 / c : null
	}, u = {
		c: V(e, r.dhw_storage_temperature) ?? V(e, r.domestic_hot_water, "current_temperature"),
		targetC: V(e, r.domestic_hot_water, "temperature") ?? V(e, r.dhw_temperature),
		charging: i(r.domestic_hot_water_charging),
		pumpOn: i(r.domestic_hot_water_pump)
	}, d = (n.circuits?.length ? n.circuits : Object.keys(t.circuits).map((e) => ({ circuit: Number(e) }))).map((n) => {
		let r = t.circuits[n.circuit] ?? {};
		return {
			circuit: n.circuit,
			name: n.name ?? `Circuit ${n.circuit}`,
			pumpOn: i(r.circulation_pump),
			supplyC: V(e, r.supply_temperature),
			separated: n.separated_by === "heat_exchanger",
			zones: (n.zones ?? []).map((t) => {
				let n = t.thermostat ?? On(e, t.name);
				return {
					name: t.name,
					entityId: n,
					calling: e.states[n ?? ""]?.attributes.hvac_action === "heating",
					currentC: V(e, n, "current_temperature"),
					targetC: V(e, n, "temperature") ?? V(e, n, "target_temp_low")
				};
			})
		};
	}), f = {}, p = d.find((e) => !e.separated), m = o ?? p?.supplyC ?? null;
	f.boiler = Ln(!!p?.pumpOn, m, V(e, r.return_temperature), Nn), f.dhw = {
		flowing: u.pumpOn || u.charging,
		supplyC: m,
		returnC: u.c !== null && m !== null ? Math.min(m, u.c + 4) : u.c,
		returnEstimated: !0
	};
	for (let e of d.filter((e) => e.separated)) {
		let t = !e.zones.length || e.zones.some((e) => e.calling);
		f[`circuit${e.circuit}`] = Ln(e.pumpOn && t, e.supplyC, null, Pn), e.zones.forEach((t, n) => {
			f[`circuit${e.circuit}.zone${n}`] = Ln(e.pumpOn && t.calling, e.supplyC, null, Pn);
		});
	}
	return f.tap = {
		flowing: !1,
		supplyC: u.c,
		returnC: Fn,
		returnEstimated: !0
	}, {
		outsideC: V(e, r.outside_temperature),
		boilerC: o,
		burner: l,
		tank: u,
		circuits: d,
		loops: f
	};
}
function Ln(e, t, n, r) {
	return n === null ? {
		flowing: e,
		supplyC: t,
		returnC: t === null ? null : t - r,
		returnEstimated: !0
	} : {
		flowing: e,
		supplyC: t,
		returnC: n,
		returnEstimated: !1
	};
}
// src/vicare/discovery.ts
var Rn = /* @__PURE__ */ new Set([
	"heating",
	"supply_temperature",
	"circulation_pump",
	"frost_protection",
	"heating_curve_shift",
	"heating_curve_slope",
	"normal_temperature",
	"reduced_temperature",
	"comfort_temperature",
	"normal_heating_temperature",
	"reduced_heating_temperature",
	"comfort_heating_temperature"
]), zn = /* @__PURE__ */ new Set([
	"outside_temperature",
	"boiler_temperature",
	"boiler_supply_temperature",
	"return_temperature",
	"dhw_storage_temperature",
	"dhw_storage_top_temperature",
	"hotwater_out_temperature",
	"burner_modulation",
	"burner_hours",
	"burner_starts",
	"volumetric_flow",
	"burner",
	"domestic_hot_water_charging",
	"domestic_hot_water_pump",
	"domestic_hot_water_circulation_pump",
	"one_time_charge",
	"solar_pump",
	"dhw_temperature",
	"domestic_hot_water"
]);
function Bn(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of Object.values(e.entities)) {
		if (n.platform !== "vicare" || !n.device_id) continue;
		let e = t.get(n.device_id) ?? {
			total: 0,
			heating: 0
		};
		e.total++, n.translation_key === "heating" && e.heating++, t.set(n.device_id, e);
	}
	return [...t].sort(([, e], [, t]) => t.heating - e.heating || t.total - e.total).map(([e]) => e);
}
function Vn(e, t, n = {}, r = {}) {
	let i = {
		deviceId: t,
		device: {},
		circuits: {},
		other: []
	}, a = /* @__PURE__ */ new Map();
	for (let r of Object.values(e.entities)) {
		if (r.platform !== "vicare" || r.device_id !== t) continue;
		let e = r.translation_key ?? "";
		if (zn.has(e)) i.device[e] ??= r.entity_id;
		else if (Rn.has(e)) {
			let t = Un(n[r.entity_id]?.unique_id);
			t === null ? a.set(e, [...a.get(e) ?? [], r.entity_id]) : (i.circuits[t + 1] ??= {})[e] ??= r.entity_id;
		} else i.other.push(r.entity_id);
	}
	for (let [e, t] of a) t.sort(Wn).forEach((t, n) => {
		(i.circuits[n + 1] ??= {})[e] ??= t;
	});
	for (let [e, t] of Object.entries(r)) {
		let n = /^circuit(\d+)\.(.+)$/.exec(e);
		n ? (i.circuits[Number(n[1])] ??= {})[n[2]] = t : i.device[e] = t;
	}
	return i.other.sort(), i;
}
async function Hn(e, t) {
	let n = Object.values(e.entities).filter((e) => e.platform === "vicare" && e.device_id === t).map((e) => e.entity_id);
	if (!n.length) return {};
	let r = await e.callWS({
		type: "config/entity_registry/get_entries",
		entity_ids: n
	}), i = {}, a = Array.isArray(r) ? r : Object.values(r ?? {});
	for (let e of a) e && (i[e.entity_id] = e);
	return i;
}
function Un(e) {
	let t = e ? /-(\d+)$/.exec(e) : null;
	return t ? Number(t[1]) : null;
}
function Wn(e, t) {
	let n = (e) => Number(/_(\d+)$/.exec(e)?.[1] ?? 1);
	return n(e) - n(t) || e.localeCompare(t);
}
// src/card.ts
var Gn = 60, Kn = 1500, qn = 18e4, Jn = [
	{
		id: "system",
		label: "System"
	},
	{
		id: "heating",
		label: "Heating"
	},
	{
		id: "hotwater",
		label: "Hot water"
	},
	{
		id: "diagnostics",
		label: "Diagnostics"
	}
], Yn = class extends B {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 },
		_specs: { state: !0 },
		_registry: { state: !0 },
		_tab: { state: !0 }
	};
	_diagram;
	_pipes = [];
	_vicare;
	_state;
	_discoveryInputs = [];
	_registryDevice;
	_flow;
	_resize;
	_intersection;
	_onScreen = !0;
	_reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	_pending = /* @__PURE__ */ new Map();
	_timers = /* @__PURE__ */ new Map();
	_drafts = /* @__PURE__ */ new Map();
	constructor() {
		super(), this._tab = "system";
	}
	setConfig(e) {
		if (!e) throw Error("Invalid configuration");
		let t = {
			asset_url: Le,
			animation: !0,
			...e,
			circuits: Oe(e)
		};
		this._config = t, this._specs = void 0;
		let n = Dt(t);
		Promise.all(n.map((e) => Ct(t.asset_url, e))).then((e) => {
			this._config === t && (this._specs = Object.fromEntries(n.map((t, n) => [t, e[n]])));
		});
	}
	static getStubConfig(e) {
		let t = jn(e).map((t) => ({
			name: Mn(e, t),
			thermostat: t
		})), { type: n, ...r } = Ae({
			type: "",
			device_id: Bn(e)[0],
			model: Et
		}, t);
		return r;
	}
	static getConfigElement() {
		return document.createElement(Fe);
	}
	getCardSize() {
		return 7;
	}
	getGridOptions() {
		return {
			columns: 12,
			rows: "auto",
			min_columns: 6
		};
	}
	connectedCallback() {
		super.connectedCallback(), document.addEventListener("visibilitychange", this._syncAnimation), this._reducedMotion.addEventListener("change", this._syncAnimation);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), document.removeEventListener("visibilitychange", this._syncAnimation), this._reducedMotion.removeEventListener("change", this._syncAnimation), this._resize?.disconnect(), this._intersection?.disconnect(), this._resize = void 0, this._intersection = void 0, this._flow?.layer.stop();
		for (let [e, t] of this._timers) {
			window.clearTimeout(t);
			let n = this._pending.get(e);
			n && !n.after && this._send(e, n.value);
		}
		this._timers.clear();
	}
	willUpdate(e) {
		let t = this._config;
		if (!t) return;
		if (e.has("_config") || e.has("_specs")) {
			let e = this._specs;
			this._diagram = Vt((t) => e?.[t] ?? bt(t), t), this._pipes = this._diagram.pipes.map(ln);
		}
		let n = this.hass;
		if (!n) return;
		let r = t.device_id ?? Bn(n)[0];
		if (!r) {
			this._vicare = void 0, this._state = void 0;
			return;
		}
		this._registryDevice !== r && (this._registryDevice = r, Hn(n, r).then((e) => this._registry = e).catch(() => void 0));
		let i = [
			n.entities,
			r,
			this._registry,
			t.entities
		];
		(!this._vicare || i.some((e, t) => e !== this._discoveryInputs[t])) && (this._vicare = Vn(n, r, this._registry, t.entities), this._discoveryInputs = i), this._state = In(n, this._vicare, t), e.has("hass") && this._settlePending();
	}
	render() {
		let e = this._diagram;
		if (!this._config || !e) return N;
		let t = this._tab;
		return A`
      <ha-card class=${this.hass?.themes?.darkMode ? "dark" : ""}>
        ${this._renderHeader()}
        <nav class="tabs" role="tablist">
          ${Jn.map((e) => A`
              <button role="tab" aria-selected=${e.id === t} class=${e.id === t ? "active" : ""} @click=${() => this._tab = e.id}>
                ${e.label}
              </button>
            `)}
        </nav>
        <div class="scroller" ?hidden=${t !== "system"}>${this._renderScene(e)}</div>
        ${t === "system" ? N : A`<div class="panels">${this._renderPanel(t)}</div>`}
      </ha-card>
    `;
	}
	updated() {
		let e = this.renderRoot.querySelector(".scene"), t = this.renderRoot.querySelector("canvas.flow");
		e && t && this._diagram && (this._flow?.canvas !== t && (this._flow?.layer.stop(), this._flow = {
			layer: new tn(t),
			canvas: t
		}), this._resize || (this._resize = new ResizeObserver(() => this._syncViewport()), this._resize.observe(e)), this._intersection || (this._intersection = new IntersectionObserver(([e]) => {
			this._onScreen = e.isIntersecting, this._syncAnimation();
		}), this._intersection.observe(e)), this._flow.layer.setStreams(this._streams()), this._syncViewport(), this._syncAnimation());
	}
	_renderHeader() {
		let e = Re[this._config?.model ?? "vitocrossal-300-cu3a-199"], t = this._state, n = this._unit();
		return A`
      <div class="header">
        <div class="title">
          ${this._config?.title ?? e?.name ?? "Viessmann"}
          ${e ? A`<span class="variant">${e.variant}</span>` : N}
        </div>
        <div class="chips">
          ${t ? A`
                <span class="chip">Outside ${H(t.outsideC, n, 1)}</span>
                <span class="chip ${t.burner.on ? "hot" : ""}">
                  ${t.burner.on ? `Burner ${t.burner.modulation ?? 0}%` : "Burner off"}
                </span>
                <span class="chip">Hot water ${H(t.tank.c, n)}</span>
              ` : A`<span class="chip warn">No ViCare boiler found</span>`}
        </div>
      </div>
    `;
	}
	_renderScene(e) {
		let t = `0 0 ${e.width} ${e.height}`, n = this._zoneStates();
		return A`
      <div class="scene" style="aspect-ratio: ${e.width} / ${e.height}" @click=${this._onSceneClick}>
        <svg viewBox=${t} aria-hidden="true">
          ${dn(e)} ${fn(e)} ${e.zones.map((e) => yn(e, !!n[e.index]?.calling))}
          ${pn(this._pipes)} ${this._pipes.map(gn)} ${e.joints.map(_n)}
          ${e.terminals.map(vn)}
        </svg>
        <canvas class="flow"></canvas>
        <svg viewBox=${t}>
          ${e.parts.map((e) => xn(e, this._partStatus(e, n)))} ${this._burnerGlow(e)}
          ${e.zones.map((e) => bn(e, !!n[e.index]?.calling, this._zoneTemps(n[e.index])))}
        </svg>
        <div class="labels">${this._renderLabels(e)}</div>
      </div>
    `;
	}
	_renderPanel(e) {
		let t = this._panelContext();
		if (!t) return A`<p class="empty">Waiting for the ViCare boiler…</p>`;
		switch (e) {
			case "heating": return ut(t);
			case "hotwater": return ht(t);
			case "diagnostics": return Ze(t);
			default: return N;
		}
	}
	_burnerGlow(e) {
		let t = this._state?.burner, n = e.anchors.burner?.at;
		if (!t?.on || !n) return N;
		let r = e.parts.find((e) => e.key === "boiler"), i = r ? r.spec.width * r.scale : 200, a = Math.min(1, Math.max(0, (t.modulation ?? 50) / 100));
		return j`<ellipse class="burner-glow" cx=${n[0]} cy=${n[1]} rx=${i * .36} ry=${i * .5}
      fill="url(#burner-glow)" style="--glow: ${(.35 + .5 * a).toFixed(2)}" />`;
	}
	_renderLabels(e) {
		let t = this._state;
		if (!t) return N;
		let n = this._unit(), r = t.circuits.find((e) => e.separated), i = (t, n, r, i, a) => {
			let o = e.anchors[t];
			if (!o) return N;
			let s = (o.at[0] / e.width * 100).toFixed(2), c = (o.at[1] / e.height * 100).toFixed(2);
			return A`
        <button class=${[
				"label",
				a ? "on" : "",
				o.below ? "below" : ""
			].join(" ")} style="left:${s}%;top:${c}%" data-key=${t}>
          <span class="t">${n}</span>
          <span class="v">${r}</span>
          ${i ? A`<span class="d">${i}</span>` : N}
        </button>
      `;
		}, a = r?.zones.filter((e) => e.calling).length ?? 0;
		return A`
      ${i("boiler", "Boiler", H(t.boilerC, n), t.burner.on ? `Burner ${t.burner.modulation ?? 0}%` : "Burner off", t.burner.on)}
      ${i("tank", "Hot water", H(t.tank.c, n), t.tank.targetC === null ? void 0 : `Target ${H(t.tank.targetC, n)}`, t.tank.charging || t.tank.pumpOn)}
      ${i("hx", "Heat exchanger", `${H(t.loops.boiler?.supplyC ?? null, n)} → ${H(r?.supplyC ?? null, n)}`)}
      ${r ? i("radiant", r.name, H(r.supplyC, n), r.zones.length ? `${a} of ${r.zones.length} zones calling` : void 0, t.loops[`circuit${r.circuit}`]?.flowing) : N}
    `;
	}
	_partStatus(e, t) {
		let n = this._state;
		if (!n) return {};
		let r = /^zone-valve-(\d+)$/.exec(e.key);
		if (r) return { on: !!t[Number(r[1])]?.calling };
		switch (e.key) {
			case "dhw-pump": return {
				tag: e.tag,
				on: n.tank.pumpOn
			};
			case "boiler-pump": return {
				tag: e.tag,
				on: !!n.circuits.find((e) => !e.separated)?.pumpOn
			};
			case "radiant-pump": return {
				tag: e.tag,
				on: !!n.circuits.find((e) => e.separated)?.pumpOn
			};
			default: return {};
		}
	}
	_zoneStates() {
		return this._state?.circuits.find((e) => e.separated)?.zones ?? [];
	}
	_zoneTemps(e) {
		if (!e || e.currentC === null && e.targetC === null) return "";
		let t = this._unit(), n = (e) => e === null ? "–" : `${H(e, t, 1).replace(/ ?°[CF]$/, "")}°`;
		return e.targetC === null ? n(e.currentC) : `${n(e.currentC)} · set ${n(e.targetC)}`;
	}
	_streams() {
		let e = this._state?.loops ?? {}, t = [];
		return this._pipes.forEach((n, r) => {
			let i = n.pipe.loops.map((t) => e[t]).find((e) => e?.flowing);
			if (!i) return;
			let a = Ue("supply", i.supplyC), o = Ue("return", i.returnC), s = n.pipe.side;
			t.push({
				key: n.pipe.key,
				points: n.points,
				width: n.pipe.width,
				rgb: s === "return" ? o : a,
				fade: s === "coil" ? {
					to: n.points[n.points.length - 1],
					rgb: o
				} : void 0,
				speed: Gn,
				occluders: this._pipes.slice(r + 1).filter((e) => un(e, n)).map((e) => ({
					points: e.points,
					width: e.pipe.width
				}))
			});
		}), t;
	}
	_syncViewport() {
		let e = this.renderRoot.querySelector(".scene");
		if (!e || !this._flow || !this._diagram) return;
		let { width: t, height: n } = e.getBoundingClientRect(), r = {
			x: 0,
			y: 0,
			w: this._diagram.width,
			h: this._diagram.height
		};
		this._flow.layer.setViewport(r, t, n, window.devicePixelRatio || 1);
	}
	_syncAnimation = () => {
		if (!this._flow) return;
		let e = this._config?.animation !== !1 && !this._reducedMotion.matches;
		this._flow.layer.setAnimate(e);
		let t = this._tab === "system" && this._onScreen && document.visibilityState === "visible";
		e && t && this.isConnected ? this._flow.layer.start() : this._flow.layer.stop();
	};
	_onSceneClick = (e) => {
		let t = e.composedPath().find((e) => e instanceof Element && e.hasAttribute("data-key"));
		this._moreInfo(t ? this._entityFor(t.getAttribute("data-key") ?? "") : void 0);
	};
	_entityFor(e) {
		let t = this._vicare;
		if (!t) return;
		let n = this._config?.circuits ?? [], r = n.find((e) => !e.separated_by)?.circuit ?? 1, i = t.circuits[n.find((e) => e.separated_by)?.circuit ?? 2] ?? {}, a = /^zone(?:-valve)?-(\d+)$/.exec(e);
		if (a) return this._zoneStates()[Number(a[1])]?.entityId ?? i.heating;
		switch (e) {
			case "boiler": return t.device.boiler_temperature ?? t.device.burner;
			case "tank":
			case "tempering": return t.device.domestic_hot_water ?? t.device.dhw_storage_temperature;
			case "dhw-pump": return t.device.domestic_hot_water_pump;
			case "boiler-pump": return t.circuits[r]?.circulation_pump;
			case "radiant-pump": return i.circulation_pump;
			case "hx":
			case "mixer":
			case "radiant": return i.heating;
			default: return;
		}
	}
	_panelContext() {
		let { hass: e, _config: t, _vicare: n, _state: r } = this;
		if (e && t && n && r) return {
			hass: e,
			config: t,
			vicare: n,
			state: r,
			unit: this._unit(),
			value: (e) => this._value(e),
			pending: (e) => !!e && this._pending.has(e),
			setValue: (e, t) => this._setValue(e, t),
			call: (e, t, n) => this._call(e, t, n),
			moreInfo: (e) => this._moreInfo(e),
			curveDraft: (e) => this._drafts.get(e),
			setCurveDraft: (e, t) => this._setCurveDraft(e, t),
			applyCurve: (e) => this._applyCurve(e)
		};
	}
	_value(e) {
		return e ? this._pending.get(e)?.value ?? this._reported(e) : null;
	}
	_reported(e) {
		let t = this.hass?.states[e];
		if (!t) return null;
		let n = e.split(".")[0], r = n === "water_heater" || n === "climate" ? t.attributes.temperature : t.state, i = typeof r == "number" ? r : Number.parseFloat(String(r));
		return Number.isFinite(i) ? i : null;
	}
	_setValue(e, t) {
		this._pending.set(e, {
			value: t,
			until: Date.now() + qn
		}), window.clearTimeout(this._timers.get(e)), this._timers.set(e, window.setTimeout(() => {
			this._timers.delete(e), this._send(e, t);
		}, Kn)), this.requestUpdate();
	}
	_send(e, t) {
		if (this._reported(e) === t) {
			this._pending.delete(e), this.requestUpdate();
			return;
		}
		let n = e.split(".")[0];
		n === "number" ? this._call("number", "set_value", {
			entity_id: e,
			value: t
		}, e) : this._call(n, "set_temperature", {
			entity_id: e,
			temperature: t
		}, e);
	}
	_call(e, t, n, r) {
		this.hass?.callService(e, t, n).catch((e) => {
			r && this._pending.delete(r), this.requestUpdate();
			let t = e instanceof Error ? e.message : String(e?.message ?? e);
			this.dispatchEvent(new CustomEvent("hass-notification", {
				detail: { message: `Viessmann: ${t}` },
				bubbles: !0,
				composed: !0
			}));
		});
	}
	_settlePending() {
		let e = Date.now();
		for (let [t, n] of this._pending) n.after ? (this._reported(n.after.entityId) === n.after.value || e > n.until) && (this._pending.set(t, {
			value: n.value,
			until: e + qn
		}), this._send(t, n.value)) : this._timers.has(t) || (this._reported(t) === n.value || e > n.until) && this._pending.delete(t);
	}
	_setCurveDraft(e, t) {
		let n = this._vicare?.circuits[e] ?? {}, r = t && t.slope === this._value(n.heating_curve_slope) && t.shift === this._value(n.heating_curve_shift);
		!t || r ? this._drafts.delete(e) : this._drafts.set(e, t), this.requestUpdate();
	}
	_applyCurve(e) {
		let t = this._drafts.get(e), n = this._vicare?.circuits[e] ?? {}, r = n.heating_curve_slope, i = n.heating_curve_shift;
		if (!t || !r || !i) return;
		let a = Date.now() + qn, o = t.slope !== this._reported(r), s = t.shift !== this._reported(i);
		o && (this._pending.set(r, {
			value: t.slope,
			until: a
		}), this._send(r, t.slope)), s && (o ? this._pending.set(i, {
			value: t.shift,
			until: a,
			after: {
				entityId: r,
				value: t.slope
			}
		}) : (this._pending.set(i, {
			value: t.shift,
			until: a
		}), this._send(i, t.shift))), this._drafts.delete(e), this.requestUpdate();
	}
	_moreInfo(e) {
		e && this.dispatchEvent(new CustomEvent("hass-more-info", {
			detail: { entityId: e },
			bubbles: !0,
			composed: !0
		}));
	}
	_unit() {
		return this.hass?.config.unit_system.temperature ?? "°C";
	}
	static styles = o`
    :host {
      display: block;
    }
    ha-card {
      display: block;
      overflow: hidden;
      container: card / inline-size;
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: var(--ha-card-border-radius, 12px);
      --floor-top: rgba(70, 60, 50, 0.1);
      --floor-bottom: rgba(70, 60, 50, 0);
      --floor-line: rgba(0, 0, 0, 0.18);
      --tile: #efe9e0;
      --tile-stroke: rgba(80, 60, 40, 0.14);
      --panel: rgba(127, 127, 127, 0.07);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.22));
      --accent: var(--primary-color, #03a9f4);
    }
    ha-card.dark {
      --floor-top: rgba(255, 255, 255, 0.07);
      --floor-bottom: rgba(255, 255, 255, 0);
      --floor-line: rgba(255, 255, 255, 0.16);
      --tile: #2b2825;
      --tile-stroke: rgba(255, 255, 255, 0.08);
      --panel: rgba(255, 255, 255, 0.05);
    }
    [hidden] {
      display: none !important;
    }
    button {
      font: inherit;
      color: inherit;
    }
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 16px;
      padding: 12px 16px 6px;
    }
    .title {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .variant {
      margin-left: 6px;
      font-size: 0.85rem;
      font-weight: 400;
      color: var(--secondary-text-color);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 0.78rem;
      line-height: 1;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .chip.hot {
      background: rgba(240, 96, 40, 0.24);
    }
    .chip.hot::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 6px;
      border-radius: 50%;
      vertical-align: 1px;
      background: #f97316;
      box-shadow: 0 0 6px #f97316;
    }
    .chip.warn {
      background: rgba(219, 68, 55, 0.15);
    }
    .tabs {
      display: flex;
      gap: 4px;
      padding: 0 12px;
      border-bottom: 1px solid var(--divider);
      overflow-x: auto;
    }
    .tabs button {
      padding: 10px 12px 9px;
      border: 0;
      border-bottom: 2px solid transparent;
      background: none;
      font-size: 0.88rem;
      color: var(--secondary-text-color);
      cursor: pointer;
      white-space: nowrap;
    }
    .tabs button.active {
      color: var(--primary-text-color);
      border-bottom-color: var(--accent);
    }
    .scroller {
      overflow-x: auto;
      overscroll-behavior-x: contain;
    }
    .scene {
      position: relative;
      width: 100%;
      overflow: hidden;
      container-type: inline-size;
    }
    /* On narrow cards the diagram keeps a readable size and scrolls sideways. */
    @container card (max-width: 720px) {
      .scene {
        width: 940px;
      }
    }
    .scene > svg,
    .scene > canvas {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
    }
    .scene > svg:not(:first-of-type) {
      pointer-events: none;
    }
    svg path,
    svg line {
      fill: none;
      stroke-linecap: butt;
      stroke-linejoin: round;
    }
    svg text {
      font-family: var(--ha-font-family-body, Roboto, "Segoe UI", system-ui, sans-serif);
    }
    .floor-top {
      stop-color: var(--floor-top);
    }
    .floor-bottom {
      stop-color: var(--floor-bottom);
    }
    .floor-line {
      stroke: var(--floor-line);
      stroke-width: 1.5;
    }
    .tile {
      fill: var(--tile);
      stroke: var(--tile-stroke);
      stroke-width: 1.5;
    }
    .zone.calling .tile {
      stroke: rgba(249, 115, 22, 0.75);
      stroke-width: 2.5;
    }
    .zone-name {
      font-size: 19px;
      font-weight: 600;
      fill: var(--primary-text-color);
    }
    .zone-temp {
      font-size: 16px;
      fill: var(--secondary-text-color);
    }
    .zone-text .dot {
      fill: #9ca3af;
    }
    .zone-text.calling .dot {
      fill: #f97316;
    }
    .terminal-label {
      font-size: 16px;
      fill: var(--secondary-text-color);
    }
    .brass {
      fill: #b8922f;
      stroke: #7a5d1a;
      stroke-width: 1.5;
    }
    .lever {
      fill: #f2c200;
      stroke: #a07f00;
      stroke-width: 1;
    }
    .burner-glow {
      mix-blend-mode: screen;
      opacity: var(--glow);
      animation: flicker 2.6s ease-in-out infinite alternate;
    }
    @keyframes flicker {
      from {
        opacity: calc(var(--glow) * 0.82);
      }
      to {
        opacity: var(--glow);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .burner-glow {
        animation: none;
      }
    }
    .hit {
      fill: transparent;
      cursor: pointer;
      pointer-events: all;
    }
    .tag {
      fill: #f7f7f5;
      stroke: rgba(0, 0, 0, 0.25);
      stroke-width: 1;
    }
    .tag-text {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
      fill: #1d1d1d;
    }
    .led {
      fill: #6b7280;
      stroke: rgba(0, 0, 0, 0.35);
      stroke-width: 1;
    }
    .led-halo {
      fill: transparent;
    }
    .status.on .led {
      fill: #4ade80;
    }
    .status.on .led-halo {
      fill: rgba(74, 222, 128, 0.35);
    }
    .labels {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .label {
      position: absolute;
      display: grid;
      gap: 0.1em;
      padding: 0.4em 0.7em 0.45em;
      border: 0;
      border-radius: 0.6em;
      font-family: inherit;
      /* Labels scale with the diagram, within readable limits. */
      font-size: clamp(10px, 1.1cqw, 15px);
      text-align: left;
      white-space: nowrap;
      color: #f5f5f4;
      background: rgba(24, 24, 27, 0.72);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
      backdrop-filter: blur(6px);
      transform: translate(-50%, -100%);
      pointer-events: auto;
      cursor: pointer;
    }
    .label.below {
      transform: translate(-50%, 4px);
    }
    ha-card.dark .label {
      background: rgba(64, 64, 70, 0.88);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    .label .t {
      font-size: max(8px, 0.68em);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      opacity: 0.72;
    }
    .label .v {
      font-size: 1em;
      font-weight: 600;
    }
    .label .d {
      font-size: max(8px, 0.78em);
      opacity: 0.8;
    }
    .label.on .t::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 5px;
      border-radius: 50%;
      vertical-align: 1px;
      background: #4ade80;
      box-shadow: 0 0 6px #4ade80;
    }

    /* Panels */
    .panels {
      padding: 12px;
    }
    .panel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
      gap: 12px;
    }
    .panel {
      display: grid;
      gap: 12px;
      align-content: start;
      padding: 14px;
      border-radius: 10px;
      background: var(--panel);
      color: var(--primary-text-color);
    }
    .panel.wide {
      grid-column: 1 / -1;
    }
    .panel-head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 4px 12px;
    }
    .panel-head h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    .muted {
      color: var(--secondary-text-color);
      font-size: 0.82rem;
    }
    .link {
      padding: 0;
      border: 0;
      background: none;
      color: var(--secondary-text-color);
      font-size: 0.82rem;
      cursor: pointer;
      text-align: right;
    }
    .field {
      display: grid;
      gap: 6px;
      justify-items: start;
    }
    .field-label {
      font-size: 0.75rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }
    .field-row {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      gap: 12px 18px;
    }
    .segmented {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .segmented button,
    .curve-actions button,
    .actions button {
      padding: 7px 12px;
      border: 1px solid var(--divider);
      border-radius: 999px;
      background: transparent;
      font-size: 0.84rem;
      cursor: pointer;
    }
    .segmented button.selected {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 16%, transparent);
      font-weight: 600;
    }
    .curve-actions {
      display: flex;
      gap: 8px;
    }
    .curve-actions button.primary {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--text-primary-color, #fff);
      font-weight: 600;
    }
    .stepper {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--divider);
      border-radius: 999px;
    }
    .stepper.pending {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    .step {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 50%;
      background: none;
      font-size: 1.15rem;
      line-height: 1;
      cursor: pointer;
    }
    .step:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .step-value {
      min-width: 52px;
      text-align: center;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .step-value small {
      margin-left: 2px;
      font-weight: 400;
      color: var(--secondary-text-color);
    }
    .curve {
      display: grid;
      gap: 8px;
    }
    .curve-chart {
      width: 100%;
      height: auto;
    }
    .curve-chart .grid {
      stroke: var(--divider);
      stroke-width: 1;
    }
    .curve-chart .tick,
    .curve-chart .axis {
      font-size: 10px;
      fill: var(--secondary-text-color);
    }
    .curve-line {
      stroke: #f97316;
      stroke-width: 2.5;
    }
    .curve-line.draft {
      stroke: var(--accent);
      stroke-dasharray: 6 4;
    }
    .curve-chart .now {
      stroke: var(--secondary-text-color);
      stroke-dasharray: 3 3;
      stroke-width: 1;
    }
    .target-dot {
      fill: #f97316;
    }
    .supply-dot {
      fill: none;
      stroke: var(--primary-text-color);
      stroke-width: 2;
    }
    .curve-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      font-size: 0.8rem;
    }
    .key {
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-right: 5px;
      border-radius: 50%;
      vertical-align: -1px;
    }
    .key.target {
      background: #f97316;
    }
    .key.supply {
      border: 2px solid var(--primary-text-color);
      box-sizing: border-box;
    }
    .key.draft {
      border-radius: 0;
      height: 2px;
      vertical-align: 3px;
      background: var(--accent);
    }
    .big-reading {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .big {
      font-size: 2rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
      gap: 8px;
    }
    .stat {
      display: grid;
      gap: 2px;
      padding: 8px 10px;
      border: 1px solid var(--divider);
      border-radius: 8px;
      background: transparent;
      text-align: left;
      cursor: pointer;
    }
    .stat:disabled {
      cursor: default;
    }
    .stat-label {
      font-size: 0.72rem;
      color: var(--secondary-text-color);
    }
    .stat-value {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .stat.on .stat-value::before {
      content: "";
      display: inline-block;
      width: 7px;
      height: 7px;
      margin-right: 6px;
      border-radius: 50%;
      vertical-align: 1px;
      background: #4ade80;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .entity-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
      gap: 0 18px;
    }
    .entity-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 7px 0;
      border: 0;
      border-bottom: 1px solid var(--divider);
      background: none;
      font-size: 0.86rem;
      text-align: left;
      cursor: pointer;
    }
    .empty {
      margin: 0;
      color: var(--secondary-text-color);
    }
  `;
}, Xn = class extends B {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	setConfig(e) {
		this._config = e;
	}
	render() {
		let e = this._config, t = this.hass;
		if (!e || !t) return N;
		let n = Oe(e), r = n.find((e) => !e.separated_by), i = n.find((e) => e.separated_by === "heat_exchanger");
		return A`
      <section>
        <h3>Boiler</h3>
        <label>
          <span>Title</span>
          <input .value=${e.title ?? ""} placeholder="Vitocrossal 300" @change=${(t) => this._update({
			...e,
			title: $(t)
		})} />
        </label>
        <label>
          <span>ViCare device</span>
          <select @change=${(t) => this._update({
			...e,
			device_id: $(t)
		})}>
            <option value="" ?selected=${!e.device_id}>Find automatically</option>
            ${Bn(t).map((n) => A`<option value=${n} ?selected=${n === e.device_id}>${Zn(t, n)}</option>`)}
          </select>
        </label>
        <label class="check">
          <input type="checkbox" .checked=${e.animation !== !1} @change=${(t) => this._update({
			...e,
			animation: t.target.checked
		})} />
          <span>Animate the water flow</span>
        </label>
      </section>
      ${r ? this._circuit("Heating loop", r) : N}
      ${i ? this._circuit("Radiant circuit", i) : N}
      ${i ? this._zones(i.zones ?? []) : N}
      <section>
        <h3>Renders</h3>
        <label>
          <span>Folder with the boiler renders</span>
          <input .value=${e.asset_url ?? ""} placeholder=${Le} @change=${(t) => this._update({
			...e,
			asset_url: $(t)
		})} />
        </label>
      </section>
    `;
	}
	_circuit(e, t) {
		let n = this._config;
		return A`
      <section>
        <h3>${e} <small>ViCare circuit ${t.circuit}</small></h3>
        <div class="pair">
          <label>
            <span>Name</span>
            <input .value=${t.name ?? ""} @change=${(e) => this._update(ke(n, t.circuit, { name: $(e) }))} />
          </label>
          <label>
            <span>Pump tag</span>
            <input .value=${t.pump_label ?? ""} @change=${(e) => this._update(ke(n, t.circuit, { pump_label: $(e) }))} />
          </label>
        </div>
      </section>
    `;
	}
	_zones(e) {
		let t = this.hass, n = this._config, r = An(t), i = (e) => this._update(Ae(n, e)), a = jn(t).filter((n) => !e.some((e) => (e.thermostat ?? On(t, e.name)) === n));
		return A`
      <section>
        <h3>Zones <small>${e.length}</small></h3>
        ${e.map((n, a) => {
			let o = n.thermostat ? void 0 : On(t, n.name);
			return A`
            <div class="zone">
              <input aria-label="Zone name" .value=${n.name} @change=${(t) => i(e.map((e, n) => n === a ? {
				...e,
				name: $(t)
			} : e))} />
              <select aria-label="Thermostat" @change=${(t) => i(e.map((e, n) => n === a ? {
				name: e.name,
				thermostat: $(t) || void 0
			} : e))}>
                <option value="" ?selected=${!n.thermostat}>${o ? `Match by name: ${Mn(t, o)}` : "Match by name: none found"}</option>
                ${r.map((e) => A`<option value=${e} ?selected=${e === n.thermostat}>${Mn(t, e)} (${e})</option>`)}
              </select>
              <span class="buttons">
                <button title="Move up" ?disabled=${a === 0} @click=${() => i(je(e, a, a - 1))}>↑</button>
                <button title="Move down" ?disabled=${a === e.length - 1} @click=${() => i(je(e, a, a + 1))}>↓</button>
                <button title="Remove" @click=${() => i(e.filter((e, t) => t !== a))}>✕</button>
              </span>
            </div>
          `;
		})}
        <div class="row">
          <button @click=${() => i([...e, { name: `Zone ${e.length + 1}` }])}>Add zone</button>
          ${a.length ? A`<button @click=${() => i([...e, ...a.map((e) => ({
			name: Mn(t, e),
			thermostat: e
		}))])}>
                Add ${a.length} unassigned thermostat${a.length === 1 ? "" : "s"}
              </button>` : N}
        </div>
      </section>
    `;
	}
	_update(e) {
		this._config = Me(e), this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: this._config },
			bubbles: !0,
			composed: !0
		}));
	}
	static styles = o`
    :host {
      display: grid;
      gap: 18px;
      color: var(--primary-text-color);
    }
    section {
      display: grid;
      gap: 10px;
    }
    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    h3 small {
      margin-left: 6px;
      font-weight: 400;
      color: var(--secondary-text-color);
    }
    label {
      display: grid;
      gap: 4px;
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    label.check {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary-text-color);
    }
    .pair,
    .zone {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      align-items: end;
    }
    .zone {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
      align-items: center;
    }
    input:not([type="checkbox"]),
    select {
      box-sizing: border-box;
      width: 100%;
      padding: 9px 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      border-radius: 6px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font: inherit;
      font-size: 0.9rem;
    }
    button {
      padding: 7px 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      border-radius: 6px;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-size: 0.85rem;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .buttons {
      display: flex;
      gap: 4px;
    }
    .buttons button {
      padding: 6px 9px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `;
};
function $(e) {
	return e.target.value.trim();
}
function Zn(e, t) {
	let n = e.devices[t];
	return n?.name_by_user ?? n?.name ?? t;
}
customElements.get("viessmann-boiler-card") || customElements.define(Pe, Yn), customElements.get("viessmann-boiler-card-editor") || customElements.define(Fe, Xn);
var Qn = window;
Qn.customCards ??= [], Qn.customCards.some((e) => e.type === "viessmann-boiler-card") || Qn.customCards.push({
	type: Pe,
	name: "Viessmann Boiler Card",
	description: "Realistic, animated view of a Viessmann ViCare heating system.",
	preview: !0
}), console.info(`%c VIESSMANN-BOILER-CARD %c ${Ie} `, "color:#fff;background:#d6001c;font-weight:700", "color:#d6001c;background:#fff");

//# sourceMappingURL=viessmann-boiler-card.js.map