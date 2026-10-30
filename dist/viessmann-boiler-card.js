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
var ie = globalThis, ae = (e) => e, oe = ie.trustedTypes, b = oe ? oe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, se = "$lit$", x = `lit$${Math.random().toFixed(9).slice(2)}$`, ce = "?" + x, le = `<${ce}>`, S = document, C = () => S.createComment(""), w = (e) => e === null || typeof e != "object" && typeof e != "function", ue = Array.isArray, T = (e) => ue(e) || typeof e?.[Symbol.iterator] == "function", de = "[ 	\n\f\r]", fe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pe = /-->/g, me = />/g, E = RegExp(`>|${de}(?:([^\\s"'>=/]+)(${de}*=${de}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), D = /'/g, he = /"/g, ge = /^(?:script|style|textarea|title)$/i, _e = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), O = _e(1), k = _e(2), A = Symbol.for("lit-noChange"), j = Symbol.for("lit-nothing"), ve = /* @__PURE__ */ new WeakMap(), M = S.createTreeWalker(S, 129);
function ye(e, t) {
	if (!ue(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return b === void 0 ? t : b.createHTML(t);
}
var N = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = fe;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === fe ? c[1] === "!--" ? o = pe : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = E) : (ge.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = E) : o = me : o === E ? c[0] === ">" ? (o = i ?? fe, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? E : c[3] === "\"" ? he : D) : o === he || o === D ? o = E : o === pe || o === me ? o = fe : (o = E, i = void 0);
		let d = o === E && e[t + 1].startsWith("/>") ? " " : "";
		a += o === fe ? n + le : l >= 0 ? (r.push(s), n.slice(0, l) + se + n.slice(l) + x + d) : n + x + (l === -2 ? t : d);
	}
	return [ye(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, P = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = N(t, n);
		if (this.el = e.createElement(l, r), M.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = M.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(se)) {
					let t = u[o++], n = i.getAttribute(e).split(x), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? xe : r[1] === "?" ? Se : r[1] === "@" ? Ce : L
					}), i.removeAttribute(e);
				} else e.startsWith(x) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ge.test(i.tagName)) {
					let e = i.textContent.split(x), t = e.length - 1;
					if (t > 0) {
						i.textContent = oe ? oe.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], C()), M.nextNode(), c.push({
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
function F(e, t, n = e, r) {
	if (t === A) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = w(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = F(e, i._$AS(e, t.values), i, r)), t;
}
var be = class {
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
		M.currentNode = r;
		let i = M.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new I(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new we(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = M.nextNode(), a++);
		}
		return M.currentNode = S, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, I = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = j, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = F(this, e, t), w(e) ? e === j || e == null || e === "" ? (this._$AH !== j && this._$AR(), this._$AH = j) : e !== this._$AH && e !== A && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? T(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== j && w(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = P.createElement(ye(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new be(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ve.get(e.strings);
		return t === void 0 && ve.set(e.strings, t = new P(e)), t;
	}
	k(t) {
		ue(this._$AH) || (this._$AH = [], this._$AR());
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
}, L = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = j, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = j;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = F(this, e, t, 0), a = !w(e) || e !== this._$AH && e !== A, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = F(this, r[n + o], t, o), s === A && (s = this._$AH[o]), a ||= !w(s) || s !== this._$AH[o], s === j ? e = j : e !== j && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === j ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, xe = class extends L {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === j ? void 0 : e;
	}
}, Se = class extends L {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== j);
	}
}, Ce = class extends L {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = F(this, e, t, 0) ?? j) === A) return;
		let n = this._$AH, r = e === j && n !== j || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== j && (n === j || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, we = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		F(this, e);
	}
}, Te = ie.litHtmlPolyfillSupport;
Te?.(P, I), (ie.litHtmlVersions ??= []).push("3.3.3");
var Ee = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new I(t.insertBefore(C(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, De = globalThis, R = class extends y {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ee(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return A;
	}
};
R._$litElement$ = !0, R.finalized = !0, De.litElementHydrateSupport?.({ LitElement: R });
var Oe = De.litElementPolyfillSupport;
Oe?.({ LitElement: R }), (De.litElementVersions ??= []).push("4.2.2");
// src/config.ts
function ke() {
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
function Ae(e) {
	return e.circuits?.length ? e.circuits : ke();
}
function je(e, t, n) {
	return Pe({
		...e,
		circuits: Ae(e).map((e) => e.circuit === t ? {
			...e,
			...n
		} : e)
	});
}
function Me(e, t) {
	let n = Ae(e).find((e) => e.separated_by === "heat_exchanger");
	return n ? je(e, n.circuit, { zones: t }) : e;
}
function Ne(e, t, n) {
	if (n < 0 || n >= e.length) return e;
	let r = [...e], [i] = r.splice(t, 1);
	return r.splice(n, 0, i), r;
}
function Pe(e) {
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
var Fe = "0.3.0", Ie = "viessmann-boiler-card", Le = "viessmann-boiler-card-editor", Re = "viessmann-boiler-usage", ze = Fe.replace(/\.0$/, ""), Be = new URL(
	/* @vite-ignore */
	"viessmann-boiler-card/",
	import.meta.url
).pathname, Ve = { "vitocrossal-300-cu3a-199": {
	name: "Vitocrossal 300",
	variant: "CU3A 199"
} };
// src/util/temperature.ts
function He(e, t) {
	return t === "°F" ? (e - 32) * 5 / 9 : e;
}
function Ue(e, t) {
	return t === "°F" ? e * 9 / 5 + 32 : e;
}
function z(e, t, n) {
	if (!t) return null;
	let r = e.states[t];
	if (!r) return null;
	let i = n ? r.attributes[n] : r.state, a = typeof i == "number" ? i : Number.parseFloat(String(i));
	return Number.isFinite(a) ? He(a, n ? e.config.unit_system.temperature : r.attributes.unit_of_measurement ?? e.config.unit_system.temperature) : null;
}
function B(e, t, n = 0) {
	return e === null ? "–" : `${Ue(e, t).toFixed(n)} ${t}`;
}
var We = [
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
], Ge = [
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
function Ke(e, t) {
	return e === "return" ? qe(Ge, t ?? 30) : qe(We, t ?? 50);
}
function qe(e, t) {
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
function Je(e, t, n) {
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
function Ye(e) {
	let t = Ze(e.step), n = (n) => e.onChange(Number(Math.min(e.max, Math.max(e.min, n)).toFixed(t))), r = e.value;
	return O`
    <span class="stepper ${e.pending ? "pending" : ""}">
      <button class="step" ?disabled=${r === null || r <= e.min} @click=${() => r !== null && n(r - e.step)} aria-label="Lower ${e.label}">−</button>
      <span class="step-value">${r === null ? "–" : r.toFixed(t)}${e.unit ? O`<small>${e.unit}</small>` : j}</span>
      <button class="step" ?disabled=${r === null || r >= e.max} @click=${() => r !== null && n(r + e.step)} aria-label="Raise ${e.label}">+</button>
    </span>
  `;
}
function Xe(e, t, n, r) {
	return O`
    <div class="segmented" role="radiogroup" aria-label=${e}>
      ${t.map((e) => O`
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
function V(e, t) {
	return O`<div class="field"><span class="field-label">${e}</span>${t}</div>`;
}
function H(e, t, n, r) {
	return O`
    <button class="stat ${r ? "on" : ""}" ?disabled=${!n} @click=${() => n?.()}>
      <span class="stat-label">${e}</span>
      <span class="stat-value">${t}</span>
    </button>
  `;
}
function Ze(e) {
	let t = String(e);
	return t.includes(".") ? t.split(".")[1].length : 0;
}
// src/panels/format.ts
function Qe(e) {
	return e.charAt(0).toUpperCase() + e.slice(1);
}
function $e(e, t) {
	let n = String(e.hass.states[t]?.attributes.friendly_name ?? t), r = e.hass.devices[e.vicare.deviceId], i = r?.name_by_user ?? r?.name;
	return i && n.startsWith(`${i} `) ? n.slice(i.length + 1) : n;
}
function et(e) {
	let t = Math.round(e);
	if (t < 60) return `${t} min`;
	let n = Math.floor(t / 60);
	return t % 60 ? `${n} h ${t % 60} min` : `${n} h`;
}
// src/panels/diagnostics.ts
function tt(e) {
	let { state: t, vicare: n } = e, r = n.device, i = t.burner, a = e.hass.language ?? "en", o = (e, t = 0) => e === null ? "–" : e.toLocaleString(a, {
		maximumFractionDigits: t,
		minimumFractionDigits: t
	}), s = (t) => t ? e.hass.states[t]?.state === "on" ? "On" : "Off" : "–", c = [
		...Object.values(r),
		...Object.values(n.circuits).flatMap((e) => Object.values(e)),
		...n.other
	].filter((t, n, r) => r.indexOf(t) === n && e.hass.states[t]).sort((t, n) => $e(e, t).localeCompare($e(e, n)));
	return O`
    <div class="panel-grid">
      <section class="panel">
        <header class="panel-head"><h3>Burner</h3><span class="muted">${rt(e, c)}</span></header>
        <div class="stats">
          ${H("Burner", i.on ? "On" : "Off", () => e.moreInfo(r.burner), i.on)}
          ${H("Modulation", i.modulation === null ? "–" : `${o(i.modulation)} %`, () => e.moreInfo(r.burner_modulation))}
          ${H("Hours", o(i.hours), () => e.moreInfo(r.burner_hours))}
          ${H("Starts", o(i.starts), () => e.moreInfo(r.burner_starts))}
          ${H("Run per start", i.minutesPerStart === null ? "–" : `${o(i.minutesPerStart, 1)} min`)}
          ${H("Boiler", B(t.boilerC, e.unit, 1), () => e.moreInfo(r.boiler_temperature))}
          ${H("Outside", B(t.outsideC, e.unit, 1), () => e.moreInfo(r.outside_temperature))}
        </div>
      </section>
      ${t.circuits.map((t) => {
		let r = n.circuits[t.circuit] ?? {};
		return O`
          <section class="panel">
            <header class="panel-head"><h3>${t.name}</h3><span class="muted">Circuit ${t.circuit}</span></header>
            <div class="stats">
              ${H("Supply", B(t.supplyC, e.unit, 1), () => e.moreInfo(r.supply_temperature))}
              ${H("Pump", t.pumpOn ? "Running" : "Off", () => e.moreInfo(r.circulation_pump), t.pumpOn)}
              ${H("Frost protection", s(r.frost_protection), () => e.moreInfo(r.frost_protection))}
            </div>
          </section>
        `;
	})}
      <section class="panel wide">
        <header class="panel-head"><h3>All ViCare entities</h3><span class="muted">${c.length}</span></header>
        <div class="entity-list">
          ${c.map((t) => O`
              <button class="entity-row" @click=${() => e.moreInfo(t)}>
                <span>${$e(e, t)}</span>
                <span class="muted">${nt(e, t)}</span>
              </button>
            `)}
        </div>
      </section>
    </div>
  `;
}
function nt(e, t) {
	let n = e.hass.states[t];
	if (!n) return "–";
	let r = n.attributes.unit_of_measurement, i = /^-?\d+(\.\d+)?$/.test(n.state) ? Number(n.state) : NaN;
	return Number.isFinite(i) ? `${i.toLocaleString(e.hass.language ?? "en")}${r ? ` ${r}` : ""}` : Qe(n.state);
}
function rt(e, t) {
	let n = Math.max(...t.map((t) => Date.parse(e.hass.states[t]?.last_updated ?? "") || 0));
	if (!n) return "";
	let r = Math.round((Date.now() - n) / 6e4);
	return `Updated ${new Intl.RelativeTimeFormat(e.hass.language ?? "en", { numeric: "auto" }).format(-Math.max(0, r), "minute")}`;
}
// src/util/heating-curve.ts
function it(e, t) {
	let n = t - e.roomSetpoint;
	return e.roomSetpoint + e.shift - e.slope * n * (1.4347 + .021 * n + 2479e-7 * n * n);
}
// src/panels/curve-chart.ts
var at = 340, ot = 180, U = {
	left: 36,
	right: 12,
	top: 10,
	bottom: 26
}, st = 20, ct = -20, lt = 100, ut = 0;
function dt(e) {
	let t = (e) => {
		let t = [];
		for (let n = st; n >= ct; --n) t.push([n, it(e, n)]);
		return t;
	}, n = t(e.curve), r = e.draft ? t(e.draft) : [], i = [...n, ...r].map((e) => e[1]).concat(e.supplyC ?? []), a = Math.min(20, Math.floor(Math.min(...i) / 10) * 10), o = Math.min(lt, Math.max(a + 30, Math.ceil(Math.max(...i) / 10) * 10)), s = (e) => U.left + (st - e) / 40 * (at - U.left - U.right), c = (e) => ot - U.bottom - (e - a) / (o - a) * (ot - U.top - U.bottom), l = (e) => e.map(([e, t], n) => `${n ? "L" : "M"}${s(e).toFixed(1)} ${c(t).toFixed(1)}`).join(""), u = (t) => `${Math.round(Ue(t, e.unit))}°`, d = [
		20,
		10,
		0,
		-10,
		-20
	], f = [];
	for (let e = a; e <= o; e += 10) f.push(e);
	let p = e.outsideC, m = p === null ? null : it(e.curve, p), h = p !== null && m !== null && p <= st && p >= ct ? s(p) : null, g = `curve-plot-${++ut}`;
	return O`
    <svg class="curve-chart" viewBox="0 0 ${at} ${ot}" role="img" aria-label="Heating curve">
      <defs>
        <clipPath id=${g}>
          <rect x=${U.left} y=${U.top - 3} width=${at - U.left - U.right} height=${ot - U.top - U.bottom + 6} />
        </clipPath>
      </defs>
      ${f.map((e) => k`
          <line class="grid" x1=${U.left} x2=${at - U.right} y1=${c(e)} y2=${c(e)} />
          <text class="tick" x=${U.left - 6} y=${c(e) + 3.5} text-anchor="end">${u(e)}</text>`)}
      ${d.map((e) => k`<text class="tick" x=${s(e)} y=${ot - U.bottom + 15} text-anchor="middle">${u(e)}</text>`)}
      <text class="axis" x=${at - U.right} y=${178} text-anchor="end">Outside</text>
      <g clip-path="url(#${g})">
        <path class="curve-line" d=${l(n)} />
        ${r.length ? k`<path class="curve-line draft" d=${l(r)} />` : j}
      </g>
      ${h !== null && m !== null ? k`
          <line class="now" x1=${h} x2=${h} y1=${U.top} y2=${ot - U.bottom} />
          <circle class="target-dot" cx=${h} cy=${c(m)} r="4.5" />
          ${e.supplyC === null ? j : k`<circle class="supply-dot" cx=${h} cy=${c(e.supplyC)} r="5" />`}` : j}
    </svg>
    <div class="curve-legend">
      <span><i class="key target"></i>Target ${B(m, e.unit)}</span>
      <span><i class="key supply"></i>Supply now ${B(e.supplyC, e.unit)}</span>
      ${r.length ? O`<span><i class="key draft"></i>New curve</span>` : j}
      <span class="muted">at ${B(p, e.unit, 1)} outside</span>
    </div>
  `;
}
// src/panels/heating.ts
var ft = {
	dhwAndHeating: "Heating & hot water",
	heating: "Heating only",
	dhw: "Hot water only",
	forcedNormal: "Always normal",
	forcedReduced: "Always reduced",
	standby: "Standby",
	dhwAndHeatingCooling: "Heating, cooling & hot water",
	heatingCooling: "Heating & cooling",
	cooling: "Cooling only"
}, pt = {
	normal: "Normal",
	reduced: "Reduced",
	comfort: "Comfort",
	eco: "Eco",
	standby: "Standby",
	external: "External",
	holiday: "Holiday"
};
function mt(e) {
	return O`<div class="panel-grid">${e.state.circuits.map((t) => ht(e, t))}</div>`;
}
function ht(e, t) {
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
		`${B(t.supplyC, e.unit)} supply`,
		t.pumpOn ? "pump running" : "pump off",
		o ? `${pt[o] ?? o} program` : void 0
	].filter(Boolean);
	return O`
    <section class="panel">
      <header class="panel-head">
        <h3>${t.name}</h3>
        <button class="link" @click=${() => e.moreInfo(r)}>${u.join(" · ")}</button>
      </header>
      ${a.length && r ? V("Mode", Xe("Mode", a.map((e) => ({
		value: e,
		label: ft[e] ?? e
	})), i.active_vicare_mode, (t) => e.call("vicare", "set_vicare_mode", {
		entity_id: r,
		vicare_mode: t
	}))) : j}
      ${c.length > 1 && r ? V("Program", Xe("Program", c, l, (t) => e.call("climate", "set_preset_mode", {
		entity_id: r,
		preset_mode: t
	}))) : j}
      <div class="field-row">
        ${gt(e, "Normal", n.normal_temperature ?? n.normal_heating_temperature)}
        ${gt(e, "Reduced", n.reduced_temperature ?? n.reduced_heating_temperature)}
        ${gt(e, "Comfort", n.comfort_temperature ?? n.comfort_heating_temperature)}
      </div>
      ${_t(e, t, n, o)}
    </section>
  `;
}
function gt(e, t, n) {
	if (!n) return j;
	let r = Je(e.hass, n, {
		min: 3,
		max: 37,
		step: 1
	});
	return V(`${t} room`, Ye({
		...r,
		label: `${t.toLowerCase()} room temperature`,
		value: e.value(n),
		pending: e.pending(n),
		onChange: (t) => e.setValue(n, t)
	}));
}
function _t(e, t, n, r) {
	let i = n.heating_curve_slope, a = n.heating_curve_shift, o = e.value(i), s = e.value(a);
	if (!i || !a || o === null || s === null) return j;
	let c = e.curveDraft(t.circuit), l = c ?? {
		slope: o,
		shift: s
	}, u = vt(e, n, r) ?? 20, d = (n) => e.setCurveDraft(t.circuit, {
		...l,
		...n
	});
	return O`
    <div class="curve">
      <div class="field-row">
        ${V("Curve slope", Ye({
		...Je(e.hass, i, {
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
        ${V("Curve shift", Ye({
		...Je(e.hass, a, {
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
        ${c ? O`
              <div class="curve-actions">
                <button class="primary" @click=${() => e.applyCurve(t.circuit)}>Apply</button>
                <button @click=${() => e.setCurveDraft(t.circuit, void 0)}>Cancel</button>
              </div>
            ` : j}
      </div>
      ${dt({
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
function vt(e, t, n) {
	let r = (t) => z(e.hass, t);
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
function yt(e) {
	let t = e.vicare.device, n = e.state, r = t.domestic_hot_water, i = t.dhw_temperature ?? r, a = Je(e.hass, i, {
		min: 10,
		max: 60,
		step: 1,
		unit: e.unit
	}), o = (e) => e ? "On" : "Off", s = e.vicare.other.filter((e) => e.startsWith("select.")), c = e.vicare.other.filter((e) => e.startsWith("button."));
	return O`
    <div class="panel-grid">
      <section class="panel">
        <header class="panel-head">
          <h3>Hot water</h3>
          <button class="link" @click=${() => e.moreInfo(r)}>Vitocell 300-V</button>
        </header>
        <div class="big-reading">
          <span class="big">${B(n.tank.c, e.unit, 1)}</span>
          <span class="muted">in the tank</span>
        </div>
        ${i ? V("Target", Ye({
		...a,
		label: "hot water target",
		value: e.value(i),
		pending: e.pending(i),
		onChange: (t) => e.setValue(i, t)
	})) : j}
        <div class="stats">
          ${H("Charging", o(n.tank.charging), () => e.moreInfo(t.domestic_hot_water_charging), n.tank.charging)}
          ${H("DHW pump", o(n.tank.pumpOn), () => e.moreInfo(t.domestic_hot_water_pump), n.tank.pumpOn)}
          ${H("Water heater", Qe(r ? e.hass.states[r]?.state ?? "–" : "–"), () => e.moreInfo(r))}
        </div>
        ${s.map((t) => bt(e, t))}
        ${c.length ? O`<div class="actions">
              ${c.map((t) => O`<button @click=${() => e.call("button", "press", { entity_id: t })}>${$e(e, t)}</button>`)}
            </div>` : j}
      </section>
    </div>
  `;
}
function bt(e, t) {
	let n = e.hass.states[t], r = n?.attributes.options ?? [];
	return r.length ? V($e(e, t), Xe($e(e, t), r.map((e) => ({
		value: e,
		label: e.charAt(0).toUpperCase() + e.slice(1)
	})), n?.state, (n) => e.call("select", "select_option", {
		entity_id: t,
		option: n
	}))) : j;
}
// src/scene/catalog.ts
var W = [
	-1,
	0,
	0
], G = [
	1,
	0,
	0
], xt = [
	0,
	0,
	1
], St = {
	"vitocrossal-300-cu3a-199": {
		min: [-357, 0],
		max: [357, 1640],
		ports: {
			supply: {
				at: [-64, 1640],
				dir: xt,
				d: 34.9
			},
			return: {
				at: [357, 1100],
				dir: G,
				d: 34.9
			},
			dhw_supply: {
				at: [-357, 642],
				dir: W,
				d: 28.6
			},
			dhw_return: {
				at: [-357, 342],
				dir: W,
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
				dir: G,
				d: 28.6
			},
			coil_lower: {
				at: [344, 342],
				dir: G,
				d: 28.6
			},
			hot_out: {
				at: [150, 1444],
				dir: xt,
				d: 22.2
			},
			cold_in: {
				at: [-150, 1444],
				dir: xt,
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
				dir: W,
				d: 22.2
			},
			hot: {
				at: [55, 0],
				dir: G,
				d: 22.2
			},
			mixed: {
				at: [0, 60],
				dir: xt,
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
				dir: W,
				d: 25.4
			},
			outlet: {
				at: [90, 0],
				dir: G,
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
				dir: W,
				d: 25.4
			},
			p1_out: {
				at: [-100, -120],
				dir: W,
				d: 25.4
			},
			p2_out: {
				at: [100, 120],
				dir: G,
				d: 25.4
			},
			p2_in: {
				at: [100, -120],
				dir: G,
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
				dir: W,
				d: 25.4
			},
			ab: {
				at: [100, 0],
				dir: G,
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
				dir: W,
				d: 19.05
			},
			outlet: {
				at: [55, 0],
				dir: G,
				d: 19.05
			}
		}
	}
};
St["circulator-black"] = St["circulator-red"];
var Ct = 1;
function wt(e) {
	let t = St[e] ?? St["circulator-red"], n = Ct, r = ([e, r]) => [(e - t.min[0]) * n, (t.max[1] - r) * n];
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
var Tt = /* @__PURE__ */ new Map(), Et = `?v=${ze}`;
function Dt(e, t) {
	let n = `${e.replace(/\/?$/, "/")}${t}/`, r = Tt.get(n);
	return r || (r = fetch(`${n}ports.json${Et}`).then((e) => e.ok ? e.json() : Promise.reject(/* @__PURE__ */ Error(`HTTP ${e.status}`))).then((e) => kt(e, n)).catch(() => wt(t)), Tt.set(n, r)), r;
}
function Ot(e) {
	return Object.keys(St[e]?.ports ?? {});
}
function kt(e, t) {
	if (e.camera.yaw_deg !== 0 || e.camera.pitch_deg !== 0) return console.warn(`viessmann-boiler-card: ${e.id} is not a front view; using the placeholder`), wt(e.id);
	let n = Ot(e.id).filter((t) => !e.ports[t]);
	return n.length ? (console.warn(`viessmann-boiler-card: ${e.id} render lacks ${n.join(", ")}; using the placeholder`), wt(e.id)) : {
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
		image: `${t}${e.image.file}${Et}`
	};
}
// src/scene/diagram.ts
var At = "vitocrossal-300-cu3a-199", K = {
	tank: "vitocell-300-v-56",
	pumpRed: "circulator-red",
	pumpBlack: "circulator-black",
	hx: "plate-hx",
	mixer: "mixing-valve",
	zoneValve: "zone-valve",
	tempering: "tempering-valve"
};
function jt(e) {
	return [e.model ?? "vitocrossal-300-cu3a-199", ...Object.values(K)];
}
var Mt = .36, q = .5, J = {
	main: 13,
	branch: 10,
	pex: 7
}, Nt = 800, Pt = 120, Ft = 230, It = 200, Lt = 90, Rt = 772, zt = 100, Bt = 100, Vt = 300, Ht = 60, Ut = 15, Wt = 46;
function Gt(e, t) {
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
		let s = e(n), c = (s.ports.outlet.x - s.ports.inlet.x) * (q / s.pxPerMm);
		return f(t, n, q, [(r[0] + i[0]) / 2 - c / 2, r[1]], a, "inlet", o);
	}, v = f("tank", K.tank, Mt, [185, Nt], "Vitocell 300-V"), re = p(v, "coil_upper"), y = p(v, "coil_lower"), ie = t.model ?? "vitocrossal-300-cu3a-199", ae = e(ie), oe = (ae.ports.dhw_supply.x - ae.anchor[0]) * (Mt / ae.pxPerMm), b = f("boiler", ie, Mt, [re[0] + Ft - oe, Nt], "Vitocrossal 300"), se = p(b, "dhw_supply"), x = p(b, "dhw_return"), ce = p(b, "supply"), le = p(b, "return"), S = ne("dhw-pump", K.pumpRed, re, se, "Hot water pump", "DHW");
	_("dhw-supply", ["dhw"], "supply", J.branch, Kt(se, p(S, "outlet"))), _("dhw-to-tank", ["dhw"], "supply", J.branch, Kt(p(S, "inlet"), re)), _("dhw-return", ["dhw"], "return", J.branch, Kt(y, x));
	let C = f("boiler-pump", K.pumpRed, q, [ce[0] + 60, Pt], "Boiler pump", "inlet", r?.pump_label ?? "BOILER"), w = p(C, "outlet"), ue = w[0] + 28, T = f("hx", K.hx, q, [Math.max(ue + Lt, le[0] + 90), le[1]], "Heat exchanger", "p1_out"), de = p(T, "p1_in"), fe = p(T, "p1_out"), pe = p(T, "p2_out"), me = p(T, "p2_in");
	_("boiler-supply", ["boiler"], "supply", J.main, [
		ce,
		[ce[0], Pt],
		p(C, "inlet")
	]), _("pump-to-hx", ["boiler"], "supply", J.main, [
		w,
		[ue, w[1]],
		[ue, de[1]],
		de
	]), _("hx-return", ["boiler"], "return", J.main, Kt(fe, le));
	let E = p(v, "hot_out"), D = p(v, "cold_in"), he = f("tempering", K.tempering, q, [(E[0] + D[0]) / 2, It], "Mixing valve"), ge = p(he, "cold"), _e = p(he, "hot"), O = p(he, "mixed"), k = [D[0], ge[1]];
	_("tap-cold", ["tap"], "return", J.branch, [[D[0], Wt], D]), _("tap-cold-to-mixer", ["tap"], "return", J.branch, [k, ge]), _("tap-hot", ["tap"], "supply", J.branch, [
		E,
		[E[0], _e[1]],
		_e
	]), _("tap-mixed", ["tap"], "supply", J.branch, [O, [O[0], Wt]]), u.push({
		at: k,
		width: J.branch,
		vertical: !0
	}), d.push({
		key: "cold",
		at: [D[0], Wt],
		dir: [0, -1],
		label: "Cold water in",
		labelSide: "left"
	}, {
		key: "hot",
		at: [O[0], Wt],
		dir: [0, -1],
		label: "Hot water to taps"
	});
	let A = f("mixer", K.mixer, q, [pe[0] + 70, pe[1]], "Mixing valve", "a"), j = p(A, "ab"), ve = p(A, "b"), M = f("radiant-pump", K.pumpBlack, q, [j[0] + 40, j[1]], "Radiant pump", "inlet", i?.pump_label ?? "RADIANT"), ye = p(M, "outlet");
	_("hx-to-mixer", [a], "supply", J.main, [pe, p(A, "a")]), _("mixer-to-pump", [a], "supply", J.main, [j, p(M, "inlet")]);
	let N = ye[0] + 60, P = ye[1];
	_("pump-to-manifold", [a], "supply", J.main, [ye, [N, P]]), u.push({
		at: [N, P],
		width: J.main,
		vertical: !0
	});
	let F = o.map((e, t) => zt + t * Bt), be = F.map((e, t) => f(`zone-valve-${t}`, K.zoneValve, q, [N + 30, e], "Zone valve", "inlet")), I = p(be[0], "outlet")[0] + 30, L = I + Vt + 40, xe = [.../* @__PURE__ */ new Set([...F, P])].sort((e, t) => e - t);
	for (let e = 0; e < xe.length - 1; e++) {
		let [t, n] = [xe[e], xe[e + 1]], r = n <= P, i = F.flatMap((e, i) => (r ? e <= t : e >= n) ? [s(i)] : []), a = r ? [[N, n], [N, t]] : [[N, t], [N, n]];
		_(`supply-manifold-${e}`, i, "supply", J.main, a);
	}
	let Se = o.map((e, t) => {
		let n = F[t], r = s(t);
		return _(`zone-${t}-supply`, [r], "supply", J.branch, [[N, n], p(be[t], "inlet")]), _(`zone-${t}-to-coil`, [r], "supply", J.branch, [p(be[t], "outlet"), [I, n]]), _(`zone-${t}-coil`, [r], "coil", J.pex, qt(I, I + Vt, n, n - Ht + 14), "pex"), _(`zone-${t}-return`, [r], "return", J.branch, [[I + Vt, n], [L, n]]), u.push({
			at: [N, n],
			width: J.main,
			vertical: !0
		}, {
			at: [L, n],
			width: J.main,
			vertical: !0
		}), {
			index: t,
			key: `zone-${t}`,
			name: e.name,
			loop: r,
			x: I,
			y: n - Ht,
			w: Vt,
			h: 80
		};
	});
	for (let e = 0; e < F.length - 1; e++) _(`return-manifold-${e}`, F.slice(0, e + 1).map((e, t) => s(t)), "return", J.main, [[L, F[e]], [L, F[e + 1]]]);
	let Ce = me[0] + 34, we = [ve[0], Rt];
	_("radiant-return", [a], "return", J.main, [
		[L, F[F.length - 1]],
		[L, Rt],
		we
	]), _("mixer-bypass", [a], "return", J.branch, [we, ve]), _("hx-secondary-return", [a], "return", J.main, [
		we,
		[Ce, Rt],
		[Ce, me[1]],
		me
	]), u.push({
		at: we,
		width: J.main,
		vertical: !1
	});
	let Te = (e) => ({
		at: [te(e), ee(e) + 4],
		below: !0
	}), Ee = b.spec.points.burner_glow;
	return {
		width: L + 50,
		height: 836,
		floor: {
			y: Nt,
			x0: m(v) - 30,
			x1: h(b) + 30
		},
		parts: c,
		pipes: l,
		joints: u,
		terminals: d,
		zones: Se,
		anchors: {
			boiler: { at: [te(b), g(b) + (ee(b) - g(b)) * .3] },
			tank: { at: [te(v), g(v) + (ee(v) - g(v)) * .28] },
			hx: { at: [te(T), g(T) - 6] },
			radiant: Te(M),
			burner: { at: Ee ? [b.x + Ee[0] * b.scale, b.y + Ee[1] * b.scale] : [te(b), g(b) + (ee(b) - g(b)) * .6] }
		}
	};
}
function Kt(e, t) {
	if (Math.abs(e[1] - t[1]) < .5) return [e, [t[0], e[1]]];
	let n = (e[0] + t[0]) / 2;
	return [
		e,
		[n, e[1]],
		[n, t[1]],
		t
	];
}
function qt(e, t, n, r) {
	let i = e + 150, a = t - 18, o = Math.max(1, Math.floor(((a - i) / Ut - 1) / 2)), s = [[e, n], [i, n]];
	for (let e = 0; e <= o * 2 - 1; e++) {
		let t = i + e * Ut, [a, o] = e % 2 == 0 ? [n, r] : [r, n];
		e > 0 && s.push([t, a]), s.push([t, o]);
	}
	return s.push([t, n]), s;
}
// src/scene/geometry.ts
function Jt(e, t, n = 8) {
	let r = rn(e);
	if (r.length < 3) return {
		points: r,
		corners: []
	};
	let i = [r[0]], a = [];
	for (let e = 1; e < r.length - 1; e++) {
		let o = r[e - 1], s = r[e], c = r[e + 1], l = X(o, s), u = X(s, c), d = (s[0] - o[0]) * (c[1] - s[1]) - (s[1] - o[1]) * (c[0] - s[0]);
		if (Math.abs(d) < 1e-6 * l * u) continue;
		let f = Math.min(t, l / 2, u / 2), p = tn(s, o, f / l), m = tn(s, c, f / u), h = i.length;
		i.push(p);
		for (let e = 1; e < n; e++) i.push(nn(p, s, m, e / n));
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
function Yt(e, t, n) {
	return e.map((r, i) => {
		let [a, o] = Xt(e, i), s = t * (n[0] * a + n[1] * o);
		return [r[0] + s * a, r[1] + s * o];
	});
}
function Xt(e, t) {
	let n = e[Math.max(0, t - 1)], r = e[Math.min(e.length - 1, t + 1)], i = r[0] - n[0], a = r[1] - n[1], o = Math.hypot(i, a) || 1;
	return [-a / o, i / o];
}
function Y(e) {
	return e.map((e, t) => `${t ? "L" : "M"}${e[0].toFixed(1)} ${e[1].toFixed(1)}`).join("");
}
function Zt(e) {
	let t = 0;
	for (let n = 1; n < e.length; n++) t += X(e[n - 1], e[n]);
	return t;
}
function Qt(e, t, n) {
	let r = [en(e, t)], i = 0;
	for (let a = 1; a < e.length; a++) i += X(e[a - 1], e[a]), i > t && i < n && r.push(e[a]);
	return r.push(en(e, n)), r;
}
function $t(e, t) {
	let n = 0;
	for (let r = 1; r <= t; r++) n += X(e[r - 1], e[r]);
	return n;
}
function en(e, t) {
	let n = t;
	for (let t = 1; t < e.length; t++) {
		let r = X(e[t - 1], e[t]);
		if (n <= r) return tn(e[t - 1], e[t], r ? n / r : 0);
		n -= r;
	}
	return e[e.length - 1];
}
function X(e, t) {
	return Math.hypot(t[0] - e[0], t[1] - e[1]);
}
function tn(e, t, n) {
	return [e[0] + (t[0] - e[0]) * n, e[1] + (t[1] - e[1]) * n];
}
function nn(e, t, n, r) {
	let i = 1 - r;
	return [i * i * e[0] + 2 * i * r * t[0] + r * r * n[0], i * i * e[1] + 2 * i * r * t[1] + r * r * n[1]];
}
function rn(e) {
	let t = [];
	for (let n of e) {
		let e = t[t.length - 1];
		(!e || X(e, n) > .01) && t.push([n[0], n[1]]);
	}
	return t;
}
// src/scene/flow-layer.ts
var an = 1e3 / 30, on = class {
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
				path: new Path2D(Y(e.points)),
				width: e.width
			})), r = [
				this.paint(e, .38),
				this.paint(e, .85),
				this.paint(e, .95, !0)
			];
			return {
				...e,
				path: new Path2D(Y(e.points)),
				dash: t,
				gap: t * 1.15,
				hidden: n,
				paints: r
			};
		}), this.draw());
	}
	paint(e, t, n = !1) {
		let r = (e) => {
			let [r, i, a] = n ? e.map(sn) : e;
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
		this.running && (this.frame = requestAnimationFrame(this.tick), !(e - this.last < an) && (this.elapsed += Math.min(.1, (e - this.last) / 1e3), this.last = e, this.draw()));
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
function sn(e) {
	return Math.round(e + (255 - e) * .65);
}
// src/scene/svg.ts
var cn = [-.55, -.835], ln = 1.5, un = 27, dn = {
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
}, fn = {
	edge: "#6a361a",
	body: "#b56b40",
	light: "#e6a679",
	spec: "#ffefe0",
	specOpacity: .75,
	ring: "#4f2812"
};
function pn(e) {
	let t = Jt(e.points, e.width * ln), n = t.points.map((e) => e[0]), r = t.points.map((e) => e[1]), i = e.width / 2;
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
function mn(e, t) {
	return e.box[0] < t.box[2] && t.box[0] < e.box[2] && e.box[1] < t.box[3] && t.box[1] < e.box[3];
}
function hn(e) {
	return k`<defs>
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
function gn(e) {
	let { y: t, x0: n, x1: r } = e.floor, i = e.parts.filter((e) => e.key === "tank" || e.key === "boiler");
	return k`
    <rect class="floor" x=${n} y=${t} width=${r - n} height=${e.height - t} fill="url(#floor)" />
    <line class="floor-line" x1=${n} y1=${t} x2=${r} y2=${t} />
    ${i.map((e) => {
		let n = e.spec.width * e.scale;
		return k`<ellipse cx=${e.x + n / 2} cy=${t} rx=${n * .56} ry="9" fill="url(#contact)" />`;
	})}`;
}
function _n(e) {
	return k`<g filter="url(#pipe-shadow)" opacity="0.2" transform="translate(3 5)">
    ${e.map((e) => k`<path d=${Y(e.points)} stroke="#2b2117" stroke-width=${e.pipe.width * .9} />`)}
  </g>`;
}
function vn(e, t, n) {
	let r = Y(e);
	return k`
    <path d=${r} stroke=${n.edge} stroke-width=${t} />
    <path d=${r} stroke=${n.body} stroke-width=${t * .8} />
    <path d=${Y(Yt(e, t * .17, cn))} stroke=${n.light} stroke-width=${t * .36} opacity="0.9" />
    <path d=${Y(Yt(e, t * .28, cn))} stroke=${n.spec} stroke-width=${Math.max(.6, t * .08)} opacity=${n.specOpacity} />
    <path d=${Y(Yt(e, -t * .3, cn))} stroke=${n.light} stroke-width=${t * .07} opacity="0.3" />`;
}
function yn(e, t, n, r) {
	let i = Math.min(e.length - 1, Math.max(0, t)), [a, o] = Xt(e, i), [s, c] = e[i], l = n * .6;
	return k`<line x1=${s - a * l} y1=${c - o * l} x2=${s + a * l} y2=${c + o * l} stroke=${r.ring} stroke-width=${Math.max(.8, n * .08)} opacity="0.75" />`;
}
function bn(e) {
	let { width: t, material: n } = e.pipe, r = t * .9, i = n === "copper" ? e.corners.map(({ start: n, end: i }) => {
		let a = Math.max(0, $t(e.points, n) - r), o = Math.min(Zt(e.points), $t(e.points, i) + r), s = Qt(e.points, a, o);
		return k`${vn(s, t * 1.14, fn)}${yn(s, 1, t * 1.14, fn)}${yn(s, s.length - 2, t * 1.14, fn)}`;
	}) : null;
	return k`<g class="pipe">${vn(e.points, t, dn[n])}${i}</g>`;
}
function xn(e) {
	let t = e.width * .95, n = e.vertical ? [[e.at[0], e.at[1] - t], [e.at[0], e.at[1] + t]] : [[e.at[0] - t, e.at[1]], [e.at[0] + t, e.at[1]]];
	return k`<g class="pipe">${vn(n, e.width * 1.16, fn)}${yn(n, 0, e.width * 1.16, fn)}${yn(n, 1, e.width * 1.16, fn)}</g>`;
}
function Sn(e) {
	let [t, n] = e.at, r = e.dir[0] === 0;
	return k`<g class="terminal">${r ? k`<rect x=${t - 9} y=${n - 2} width="18" height="26" rx="4" class="brass" />` : k`<rect x=${t - 2} y=${n - 9} width="26" height="18" rx="4" class="brass" />`}${r ? k`<rect x=${t + 6} y=${n + 6} width="26" height="6" rx="3" class="lever" />` : k`<rect x=${t + 7} y=${n - 30} width="6" height="24" rx="3" class="lever" />`}${r ? e.labelSide === "left" ? k`<text class="terminal-label" x=${t - 16} y=${n + 14} text-anchor="end">${e.label}</text>` : k`<text class="terminal-label" x=${t + 40} y=${n + 14}>${e.label}</text>` : k`<text class="terminal-label" x=${t - 10} y=${n + 5} text-anchor="end">${e.label}</text>`}</g>`;
}
function Cn(e, t) {
	return k`<g class="zone ${t ? "calling" : ""}">
    <rect class="tile" x=${e.x} y=${e.y} width=${e.w} height=${e.h} rx="10" />
    ${t ? k`<rect x=${e.x} y=${e.y} width=${e.w} height=${e.h} rx="10" fill="url(#zone-warm)" />` : null}
  </g>`;
}
function wn(e, t, n) {
	let r = e.x + 14;
	return k`<g class="zone-text ${t ? "calling" : ""}">
    <circle cx=${r + 5} cy=${e.y + 21} r="5" class="dot" />
    <text class="zone-name" x=${r + 16} y=${e.y + 27}>${e.name}</text>
    <text class="zone-temp" x=${r} y=${e.y + 50}>${n}</text>
    <rect class="hit" data-key=${e.key} x=${e.x} y=${e.y} width=${e.w} height=${e.h} />
  </g>`;
}
function Tn(e, t = {}) {
	let n = e.spec.width * e.scale, r = e.spec.height * e.scale;
	return k`<g filter="url(#part-shadow)">${e.spec.image ? k`<image href=${e.spec.image} x=${e.x} y=${e.y} width=${n} height=${r} preserveAspectRatio="none" />` : Dn(e, n, r)}</g>${En(e, n, t)}
    <rect class="hit" data-key=${e.key} x=${e.x} y=${e.y} width=${n} height=${r} />`;
}
function En(e, t, { tag: n, on: r }) {
	if (n === void 0 && r === void 0) return null;
	let i = e.x + t / 2, a = e.y + 14, o = n ? n.length * 9.6 + 14 : 0, s = n ? [i + o / 2 + 9, a] : [e.x + t - 6, e.y + 8];
	return k`<g class="status ${r ? "on" : ""}">
    ${n ? k`<rect class="tag" x=${i - o / 2} y=${a - 10} width=${o} height="20" rx="3" />
        <text class="tag-text" x=${i} y=${a + 5} text-anchor="middle">${n}</text>` : null}
    ${r === void 0 ? null : k`<circle class="led-halo" cx=${s[0]} cy=${s[1]} r="9" /><circle class="led" cx=${s[0]} cy=${s[1]} r="5" />`}
  </g>`;
}
function Dn(e, t, n) {
	return k`${kn(e, t, n)}${On(e)}`;
}
function On(e) {
	let t = e.key === "boiler";
	return Object.values(e.spec.ports).map((n) => {
		let r = Math.max(8, n.diameter * e.spec.pxPerMm * e.scale * 1.3), i = n.dir[1] < 0, a = t ? i ? e.spec.height * e.scale * .088 : un * e.scale : 12, o = e.x + n.x * e.scale, s = e.y + n.y * e.scale, [c, l] = [-n.dir[0] * a, -n.dir[1] * a];
		return k`<rect x=${Math.min(o, o + c) - (c ? 0 : r / 2)} y=${Math.min(s, s + l) - (l ? 0 : r / 2)}
      width=${c ? Math.abs(c) : r} height=${l ? Math.abs(l) : r} rx="2" class="brass" />`;
	});
}
function kn(e, t, n) {
	let { x: r, y: i } = e, a = e.spec.id;
	if (a.startsWith("vitocrossal") || a.startsWith("vitodens")) {
		let a = n * .088, o = un * e.scale, [s, c] = [r + o, t - 2 * o];
		return k`
      <rect x=${s} y=${i + a} width=${c} height=${n - a} rx="5" fill="url(#ph-steel)" />
      <rect x=${s} y=${i + a} width="3.5" height=${n - a} fill="#c8102e" />
      <rect x=${s + c - 3.5} y=${i + a} width="3.5" height=${n - a} fill="#c8102e" />
      <rect x=${s + c * .3} y=${i + a - 16} width=${c * .4} height="16" rx="3" fill="#e2551b" />`;
	}
	if (a.startsWith("vitocell")) return k`<rect x=${r} y=${i} width=${t} height=${n} rx=${t * .1} fill="url(#ph-white)" stroke="#a9a9a5" />`;
	if (a.startsWith("circulator")) {
		let e = a.endsWith("black") ? "#2a2c2e" : "#a3242a";
		return k`
      <rect x=${r + t * .1} y=${i + n * .42} width=${t * .8} height=${n * .36} rx="6" fill=${e} />
      <circle cx=${r + t / 2} cy=${i + n * .45} r=${Math.min(t, n) * .32} fill=${e} stroke="#111" stroke-opacity="0.4" />
      <rect x=${r + t * .3} y=${i} width=${t * .4} height=${n * .2} rx="3" fill=${e} />`;
	}
	return a === "plate-hx" ? k`<rect x=${r + t * .2} y=${i} width=${t * .6} height=${n} rx="4" fill="url(#ph-steel)" stroke="#6f757b" />` : a === "tempering-valve" ? k`
      <rect x=${r + t * .42} y=${i} width=${t * .16} height=${n * .5} class="brass" />
      <rect x=${r} y=${i + n * .42} width=${t} height=${n * .3} rx="5" class="brass" />
      <circle cx=${r + t / 2} cy=${i + n * .84} r=${Math.min(t, n) * .16} fill="#8e9398" />` : a === "mixing-valve" ? k`
      <rect x=${r + t * .4} y=${i + n * .55} width=${t * .2} height=${n * .45} fill="#2e3033" />
      <rect x=${r} y=${i + n * .5} width=${t} height=${n * .2} rx="4" fill="#2e3033" />
      <rect x=${r + t * .22} y=${i} width=${t * .56} height=${n * .5} rx="5" fill="#1c1d1f" stroke="#55585c" />` : k`
    <rect x=${r} y=${i + n * .66} width=${t} height=${n * .2} rx="3" fill="#b8922f" />
    <rect x=${r + t * .12} y=${i} width=${t * .76} height=${n * .66} rx="4" fill="#8e9398" />`;
}
// src/system/thermostats.ts
var An = (e) => e.toLowerCase().replace(/thermostat/g, "").replace(/[^a-z0-9]/g, ""), jn = /* @__PURE__ */ new WeakMap();
function Mn(e, t) {
	let n = jn.get(e.entities);
	return n || jn.set(e.entities, n = /* @__PURE__ */ new Map()), n.has(t) || n.set(t, Nn(e, t)), n.get(t);
}
function Nn(e, t) {
	let n = An(t);
	if (!n) return;
	let r;
	for (let t of Pn(e)) {
		let i = [t.slice(8), String(e.states[t]?.attributes.friendly_name ?? "")].map(An), a = i.includes(n), o = i.some((e) => e.startsWith(n));
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
function Pn(e) {
	return Object.keys(e.states).filter((t) => t.startsWith("climate.") && e.entities[t]?.platform !== "vicare").sort();
}
function Fn(e) {
	let t = Pn(e), n = t.filter((t) => e.entities[t]?.platform === "nest");
	return n.length ? n : t;
}
function In(e, t) {
	let n = String(e.states[t]?.attributes.friendly_name ?? t.slice(8));
	return n.replace(/\s*thermostat$/i, "").trim() || n;
}
// src/system/state.ts
var Ln = 11, Rn = 8, zn = 12;
function Bn(e, t, n) {
	let r = t.device, i = (t) => !!t && e.states[t]?.state === "on", a = (t) => {
		let n = Number.parseFloat(t ? e.states[t]?.state ?? "" : "");
		return Number.isFinite(n) ? n : null;
	}, o = z(e, r.boiler_temperature) ?? z(e, r.boiler_supply_temperature), s = a(r.burner_hours), c = a(r.burner_starts), l = {
		on: i(r.burner),
		modulation: a(r.burner_modulation),
		hours: s,
		starts: c,
		minutesPerStart: s !== null && c ? s * 60 / c : null
	}, u = {
		c: z(e, r.dhw_storage_temperature) ?? z(e, r.domestic_hot_water, "current_temperature"),
		targetC: z(e, r.domestic_hot_water, "temperature") ?? z(e, r.dhw_temperature),
		charging: i(r.domestic_hot_water_charging),
		pumpOn: i(r.domestic_hot_water_pump)
	}, d = (n.circuits?.length ? n.circuits : Object.keys(t.circuits).map((e) => ({ circuit: Number(e) }))).map((n) => {
		let r = t.circuits[n.circuit] ?? {};
		return {
			circuit: n.circuit,
			name: n.name ?? `Circuit ${n.circuit}`,
			pumpOn: i(r.circulation_pump),
			supplyC: z(e, r.supply_temperature),
			separated: n.separated_by === "heat_exchanger",
			zones: (n.zones ?? []).map((t) => {
				let n = t.thermostat ?? Mn(e, t.name);
				return {
					name: t.name,
					entityId: n,
					calling: e.states[n ?? ""]?.attributes.hvac_action === "heating",
					currentC: z(e, n, "current_temperature"),
					targetC: z(e, n, "temperature") ?? z(e, n, "target_temp_low")
				};
			})
		};
	}), f = {}, p = d.find((e) => !e.separated), m = o ?? p?.supplyC ?? null;
	f.boiler = Vn(!!p?.pumpOn, m, z(e, r.return_temperature), Ln), f.dhw = {
		flowing: u.pumpOn || u.charging,
		supplyC: m,
		returnC: u.c !== null && m !== null ? Math.min(m, u.c + 4) : u.c,
		returnEstimated: !0
	};
	for (let e of d.filter((e) => e.separated)) {
		let t = !e.zones.length || e.zones.some((e) => e.calling);
		f[`circuit${e.circuit}`] = Vn(e.pumpOn && t, e.supplyC, null, Rn), e.zones.forEach((t, n) => {
			f[`circuit${e.circuit}.zone${n}`] = Vn(e.pumpOn && t.calling, e.supplyC, null, Rn);
		});
	}
	return f.tap = {
		flowing: !1,
		supplyC: u.c,
		returnC: zn,
		returnEstimated: !0
	}, {
		outsideC: z(e, r.outside_temperature),
		boilerC: o,
		burner: l,
		tank: u,
		circuits: d,
		loops: f
	};
}
function Vn(e, t, n, r) {
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
var Hn = /* @__PURE__ */ new Set([
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
]), Un = /* @__PURE__ */ new Set([
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
function Wn(e) {
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
function Gn(e, t, n = {}, r = {}) {
	let i = {
		deviceId: t,
		device: {},
		circuits: {},
		other: []
	}, a = /* @__PURE__ */ new Map();
	for (let r of Object.values(e.entities)) {
		if (r.platform !== "vicare" || r.device_id !== t) continue;
		let e = r.translation_key ?? "";
		if (Un.has(e)) i.device[e] ??= r.entity_id;
		else if (Hn.has(e)) {
			let t = qn(n[r.entity_id]?.unique_id);
			t === null ? a.set(e, [...a.get(e) ?? [], r.entity_id]) : (i.circuits[t + 1] ??= {})[e] ??= r.entity_id;
		} else i.other.push(r.entity_id);
	}
	for (let [e, t] of a) t.sort(Jn).forEach((t, n) => {
		(i.circuits[n + 1] ??= {})[e] ??= t;
	});
	for (let [e, t] of Object.entries(r)) {
		let n = /^circuit(\d+)\.(.+)$/.exec(e);
		n ? (i.circuits[Number(n[1])] ??= {})[n[2]] = t : i.device[e] = t;
	}
	return i.other.sort(), i;
}
async function Kn(e, t) {
	let n = Object.values(e.entities).filter((e) => e.platform === "vicare" && e.device_id === t).map((e) => e.entity_id);
	if (!n.length) return {};
	let r = await e.callWS({
		type: "config/entity_registry/get_entries",
		entity_ids: n
	}), i = {}, a = Array.isArray(r) ? r : Object.values(r ?? {});
	for (let e of a) e && (i[e.entity_id] = e);
	return i;
}
function qn(e) {
	let t = e ? /-(\d+)$/.exec(e) : null;
	return t ? Number(t[1]) : null;
}
function Jn(e, t) {
	let n = (e) => Number(/_(\d+)$/.exec(e)?.[1] ?? 1);
	return n(e) - n(t) || e.localeCompare(t);
}
// src/card.ts
var Yn = 60, Xn = 1500, Zn = 18e4, Qn = [
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
		id: "usage",
		label: "Usage"
	},
	{
		id: "diagnostics",
		label: "Diagnostics"
	}
], $n = class extends R {
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
			asset_url: Be,
			animation: !0,
			...e,
			circuits: Ae(e)
		};
		this._config = t, this._specs = void 0;
		let n = jt(t);
		Promise.all(n.map((e) => Dt(t.asset_url, e))).then((e) => {
			this._config === t && (this._specs = Object.fromEntries(n.map((t, n) => [t, e[n]])));
		});
	}
	static getStubConfig(e) {
		let t = Fn(e).map((t) => ({
			name: In(e, t),
			thermostat: t
		})), { type: n, ...r } = Me({
			type: "",
			device_id: Wn(e)[0],
			model: At
		}, t);
		return r;
	}
	static getConfigElement() {
		return document.createElement(Le);
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
			this._diagram = Gt((t) => e?.[t] ?? wt(t), t), this._pipes = this._diagram.pipes.map(pn);
		}
		let n = this.hass;
		if (!n) return;
		let r = t.device_id ?? Wn(n)[0];
		if (!r) {
			this._vicare = void 0, this._state = void 0;
			return;
		}
		this._registryDevice !== r && (this._registryDevice = r, Kn(n, r).then((e) => this._registry = e).catch(() => void 0));
		let i = [
			n.entities,
			r,
			this._registry,
			t.entities
		];
		(!this._vicare || i.some((e, t) => e !== this._discoveryInputs[t])) && (this._vicare = Gn(n, r, this._registry, t.entities), this._discoveryInputs = i), this._state = Bn(n, this._vicare, t), e.has("hass") && this._settlePending();
	}
	render() {
		let e = this._diagram;
		if (!this._config || !e) return j;
		let t = this._tab;
		return O`
      <ha-card class=${this.hass?.themes?.darkMode ? "dark" : ""}>
        ${this._renderHeader()}
        <nav class="tabs" role="tablist">
          ${Qn.map((e) => O`
              <button role="tab" aria-selected=${e.id === t} class=${e.id === t ? "active" : ""} @click=${() => this._tab = e.id}>
                ${e.label}
              </button>
            `)}
        </nav>
        <div class="scroller" ?hidden=${t !== "system"}>${this._renderScene(e)}</div>
        ${t !== "system" && t !== "usage" ? O`<div class="panels">${this._renderPanel(t)}</div>` : j}
        <div class="panels" ?hidden=${t !== "usage"}>
          <viessmann-boiler-usage .ctx=${this._panelContext()} .active=${t === "usage"}></viessmann-boiler-usage>
        </div>
      </ha-card>
    `;
	}
	updated() {
		let e = this.renderRoot.querySelector(".scene"), t = this.renderRoot.querySelector("canvas.flow");
		e && t && this._diagram && (this._flow?.canvas !== t && (this._flow?.layer.stop(), this._flow = {
			layer: new on(t),
			canvas: t
		}), this._resize || (this._resize = new ResizeObserver(() => this._syncViewport()), this._resize.observe(e)), this._intersection || (this._intersection = new IntersectionObserver(([e]) => {
			this._onScreen = e.isIntersecting, this._syncAnimation();
		}), this._intersection.observe(e)), this._flow.layer.setStreams(this._streams()), this._syncViewport(), this._syncAnimation());
	}
	_renderHeader() {
		let e = Ve[this._config?.model ?? "vitocrossal-300-cu3a-199"], t = this._state, n = this._unit();
		return O`
      <div class="header">
        <div class="title">
          ${this._config?.title ?? e?.name ?? "Viessmann"}
          ${e ? O`<span class="variant">${e.variant}</span>` : j}
        </div>
        <div class="chips">
          ${t ? O`
                <span class="chip">Outside ${B(t.outsideC, n, 1)}</span>
                <span class="chip ${t.burner.on ? "hot" : ""}">
                  ${t.burner.on ? `Burner ${t.burner.modulation ?? 0}%` : "Burner off"}
                </span>
                <span class="chip">Hot water ${B(t.tank.c, n)}</span>
              ` : O`<span class="chip warn">No ViCare boiler found</span>`}
        </div>
      </div>
    `;
	}
	_renderScene(e) {
		let t = `0 0 ${e.width} ${e.height}`, n = this._zoneStates();
		return O`
      <div class="scene" style="aspect-ratio: ${e.width} / ${e.height}" @click=${this._onSceneClick}>
        <svg viewBox=${t} aria-hidden="true">
          ${hn(e)} ${gn(e)} ${e.zones.map((e) => Cn(e, !!n[e.index]?.calling))}
          ${_n(this._pipes)} ${this._pipes.map(bn)} ${e.joints.map(xn)}
          ${e.terminals.map(Sn)}
        </svg>
        <canvas class="flow"></canvas>
        <svg viewBox=${t}>
          ${e.parts.map((e) => Tn(e, this._partStatus(e, n)))} ${this._burnerGlow(e)}
          ${e.zones.map((e) => wn(e, !!n[e.index]?.calling, this._zoneTemps(n[e.index])))}
        </svg>
        <div class="labels">${this._renderLabels(e)}</div>
      </div>
    `;
	}
	_renderPanel(e) {
		let t = this._panelContext();
		if (!t) return O`<p class="empty">Waiting for the ViCare boiler…</p>`;
		switch (e) {
			case "heating": return mt(t);
			case "hotwater": return yt(t);
			case "diagnostics": return tt(t);
			default: return j;
		}
	}
	_burnerGlow(e) {
		let t = this._state?.burner, n = e.anchors.burner?.at;
		if (!t?.on || !n) return j;
		let r = e.parts.find((e) => e.key === "boiler"), i = r ? r.spec.width * r.scale : 200, a = Math.min(1, Math.max(0, (t.modulation ?? 50) / 100));
		return k`<ellipse class="burner-glow" cx=${n[0]} cy=${n[1]} rx=${i * .36} ry=${i * .5}
      fill="url(#burner-glow)" style="--glow: ${(.35 + .5 * a).toFixed(2)}" />`;
	}
	_renderLabels(e) {
		let t = this._state;
		if (!t) return j;
		let n = this._unit(), r = t.circuits.find((e) => e.separated), i = (t, n, r, i, a) => {
			let o = e.anchors[t];
			if (!o) return j;
			let s = (o.at[0] / e.width * 100).toFixed(2), c = (o.at[1] / e.height * 100).toFixed(2);
			return O`
        <button class=${[
				"label",
				a ? "on" : "",
				o.below ? "below" : ""
			].join(" ")} style="left:${s}%;top:${c}%" data-key=${t}>
          <span class="t">${n}</span>
          <span class="v">${r}</span>
          ${i ? O`<span class="d">${i}</span>` : j}
        </button>
      `;
		}, a = r?.zones.filter((e) => e.calling).length ?? 0;
		return O`
      ${i("boiler", "Boiler", B(t.boilerC, n), t.burner.on ? `Burner ${t.burner.modulation ?? 0}%` : "Burner off", t.burner.on)}
      ${i("tank", "Hot water", B(t.tank.c, n), t.tank.targetC === null ? void 0 : `Target ${B(t.tank.targetC, n)}`, t.tank.charging || t.tank.pumpOn)}
      ${i("hx", "Heat exchanger", `${B(t.loops.boiler?.supplyC ?? null, n)} → ${B(r?.supplyC ?? null, n)}`)}
      ${r ? i("radiant", r.name, B(r.supplyC, n), r.zones.length ? `${a} of ${r.zones.length} zones calling` : void 0, t.loops[`circuit${r.circuit}`]?.flowing) : j}
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
		let t = this._unit(), n = (e) => e === null ? "–" : `${B(e, t, 1).replace(/ ?°[CF]$/, "")}°`;
		return e.targetC === null ? n(e.currentC) : `${n(e.currentC)} · set ${n(e.targetC)}`;
	}
	_streams() {
		let e = this._state?.loops ?? {}, t = [];
		return this._pipes.forEach((n, r) => {
			let i = n.pipe.loops.map((t) => e[t]).find((e) => e?.flowing);
			if (!i) return;
			let a = Ke("supply", i.supplyC), o = Ke("return", i.returnC), s = n.pipe.side;
			t.push({
				key: n.pipe.key,
				points: n.points,
				width: n.pipe.width,
				rgb: s === "return" ? o : a,
				fade: s === "coil" ? {
					to: n.points[n.points.length - 1],
					rgb: o
				} : void 0,
				speed: Yn,
				occluders: this._pipes.slice(r + 1).filter((e) => mn(e, n)).map((e) => ({
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
			until: Date.now() + Zn
		}), window.clearTimeout(this._timers.get(e)), this._timers.set(e, window.setTimeout(() => {
			this._timers.delete(e), this._send(e, t);
		}, Xn)), this.requestUpdate();
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
			until: e + Zn
		}), this._send(t, n.value)) : this._timers.has(t) || (this._reported(t) === n.value || e > n.until) && this._pending.delete(t);
	}
	_setCurveDraft(e, t) {
		let n = this._vicare?.circuits[e] ?? {}, r = t && t.slope === this._value(n.heating_curve_slope) && t.shift === this._value(n.heating_curve_shift);
		!t || r ? this._drafts.delete(e) : this._drafts.set(e, t), this.requestUpdate();
	}
	_applyCurve(e) {
		let t = this._drafts.get(e), n = this._vicare?.circuits[e] ?? {}, r = n.heating_curve_slope, i = n.heating_curve_shift;
		if (!t || !r || !i) return;
		let a = Date.now() + Zn, o = t.slope !== this._reported(r), s = t.shift !== this._reported(i);
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
      /* Usage chart series, in order along the water's path (checked for colour-blind separation). */
      --series-boiler: #eb6834;
      --series-circuit-1: #1baf7a;
      --series-circuit-2: #eda100;
      --series-circuit-3: #e87ba4;
      --series-circuit-4: #6250d6;
      --series-tank: #2a78d6;
    }
    ha-card.dark {
      --floor-top: rgba(255, 255, 255, 0.07);
      --floor-bottom: rgba(255, 255, 255, 0);
      --floor-line: rgba(255, 255, 255, 0.16);
      --tile: #2b2825;
      --tile-stroke: rgba(255, 255, 255, 0.08);
      --panel: rgba(255, 255, 255, 0.05);
      --series-boiler: #d95926;
      --series-circuit-1: #199e70;
      --series-circuit-2: #c98500;
      --series-circuit-3: #d55181;
      --series-circuit-4: #9085e9;
      --series-tank: #3987e5;
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
    .curve-legend,
    .chart-legend {
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

    /* Usage */
    viessmann-boiler-usage {
      display: block;
    }
    .series-toggles {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .series-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border: 1px solid var(--divider);
      border-radius: 999px;
      background: transparent;
      font-size: 0.82rem;
      cursor: pointer;
    }
    .series-toggle[aria-pressed="false"] {
      color: var(--secondary-text-color);
    }
    .series-toggle[aria-pressed="false"] .key.line {
      background: transparent;
      box-shadow: inset 0 0 0 1px var(--secondary-text-color);
    }
    .key.line {
      width: 14px;
      height: 3px;
      margin-right: 0;
      border-radius: 2px;
      vertical-align: 3px;
      background: var(--c);
    }
    .key.bar {
      border-radius: 2px;
      background: var(--series-boiler);
    }
    .key.bar.whole-hours {
      background: repeating-linear-gradient(
        45deg,
        var(--series-boiler) 0 2px,
        color-mix(in srgb, var(--series-boiler) 30%, transparent) 2px 4px
      );
    }
    .chart {
      position: relative;
      border-radius: 6px;
      outline: none;
      touch-action: pan-y;
      transition: opacity 0.2s;
    }
    .chart:focus-visible {
      box-shadow: 0 0 0 2px var(--accent);
    }
    .chart.loading {
      opacity: 0.55;
    }
    .usage-chart {
      display: block;
      width: 100%;
      height: auto;
    }
    .usage-chart .grid,
    .usage-chart .crosshair {
      stroke: var(--divider);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .usage-chart .crosshair {
      stroke: var(--secondary-text-color);
    }
    .usage-chart .tick {
      font-size: 10px;
      font-variant-numeric: tabular-nums;
      fill: var(--secondary-text-color);
    }
    .series-line {
      stroke: var(--c);
      stroke-width: 2;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }
    .hover-dot {
      fill: var(--c);
      stroke: var(--ha-card-background, var(--card-background-color, #fff));
      stroke-width: 2;
      vector-effect: non-scaling-stroke;
    }
    .usage-chart .bar {
      fill: var(--series-boiler);
      transition: opacity 0.15s;
    }
    .bars.hovering .bar:not(.active) {
      opacity: 0.45;
    }
    .hatch-back {
      fill: var(--series-boiler);
      opacity: 0.3;
    }
    .hatch-line {
      fill: var(--series-boiler);
    }
    .tip {
      position: absolute;
      top: 4px;
      z-index: 1;
      display: grid;
      gap: 3px;
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 0.78rem;
      white-space: nowrap;
      color: var(--primary-text-color);
      background: var(--ha-card-background, var(--card-background-color, #fff));
      box-shadow: 0 0 0 1px var(--divider), 0 4px 12px rgba(0, 0, 0, 0.16);
      transform: translateX(12px);
      pointer-events: none;
    }
    .tip.left {
      transform: translateX(calc(-100% - 12px));
    }
    .tip-head {
      color: var(--secondary-text-color);
    }
    .tip-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tip strong {
      font-variant-numeric: tabular-nums;
    }
  `;
}, er = class extends R {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	setConfig(e) {
		this._config = e;
	}
	render() {
		let e = this._config, t = this.hass;
		if (!e || !t) return j;
		let n = Ae(e), r = n.find((e) => !e.separated_by), i = n.find((e) => e.separated_by === "heat_exchanger");
		return O`
      <section>
        <h3>Boiler</h3>
        <label>
          <span>Title</span>
          <input .value=${e.title ?? ""} placeholder="Vitocrossal 300" @change=${(t) => this._update({
			...e,
			title: Z(t)
		})} />
        </label>
        <label>
          <span>ViCare device</span>
          <select @change=${(t) => this._update({
			...e,
			device_id: Z(t)
		})}>
            <option value="" ?selected=${!e.device_id}>Find automatically</option>
            ${Wn(t).map((n) => O`<option value=${n} ?selected=${n === e.device_id}>${tr(t, n)}</option>`)}
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
      ${r ? this._circuit("Heating loop", r) : j}
      ${i ? this._circuit("Radiant circuit", i) : j}
      ${i ? this._zones(i.zones ?? []) : j}
      <section>
        <h3>Renders</h3>
        <label>
          <span>Folder with the boiler renders</span>
          <input .value=${e.asset_url ?? ""} placeholder=${Be} @change=${(t) => this._update({
			...e,
			asset_url: Z(t)
		})} />
        </label>
      </section>
    `;
	}
	_circuit(e, t) {
		let n = this._config;
		return O`
      <section>
        <h3>${e} <small>ViCare circuit ${t.circuit}</small></h3>
        <div class="pair">
          <label>
            <span>Name</span>
            <input .value=${t.name ?? ""} @change=${(e) => this._update(je(n, t.circuit, { name: Z(e) }))} />
          </label>
          <label>
            <span>Pump tag</span>
            <input .value=${t.pump_label ?? ""} @change=${(e) => this._update(je(n, t.circuit, { pump_label: Z(e) }))} />
          </label>
        </div>
      </section>
    `;
	}
	_zones(e) {
		let t = this.hass, n = this._config, r = Pn(t), i = (e) => this._update(Me(n, e)), a = Fn(t).filter((n) => !e.some((e) => (e.thermostat ?? Mn(t, e.name)) === n));
		return O`
      <section>
        <h3>Zones <small>${e.length}</small></h3>
        ${e.map((n, a) => {
			let o = n.thermostat ? void 0 : Mn(t, n.name);
			return O`
            <div class="zone">
              <input aria-label="Zone name" .value=${n.name} @change=${(t) => i(e.map((e, n) => n === a ? {
				...e,
				name: Z(t)
			} : e))} />
              <select aria-label="Thermostat" @change=${(t) => i(e.map((e, n) => n === a ? {
				name: e.name,
				thermostat: Z(t) || void 0
			} : e))}>
                <option value="" ?selected=${!n.thermostat}>${o ? `Match by name: ${In(t, o)}` : "Match by name: none found"}</option>
                ${r.map((e) => O`<option value=${e} ?selected=${e === n.thermostat}>${In(t, e)} (${e})</option>`)}
              </select>
              <span class="buttons">
                <button title="Move up" ?disabled=${a === 0} @click=${() => i(Ne(e, a, a - 1))}>↑</button>
                <button title="Move down" ?disabled=${a === e.length - 1} @click=${() => i(Ne(e, a, a + 1))}>↓</button>
                <button title="Remove" @click=${() => i(e.filter((e, t) => t !== a))}>✕</button>
              </span>
            </div>
          `;
		})}
        <div class="row">
          <button @click=${() => i([...e, { name: `Zone ${e.length + 1}` }])}>Add zone</button>
          ${a.length ? O`<button @click=${() => i([...e, ...a.map((e) => ({
			name: In(t, e),
			thermostat: e
		}))])}>
                Add ${a.length} unassigned thermostat${a.length === 1 ? "" : "s"}
              </button>` : j}
        </div>
      </section>
    `;
	}
	_update(e) {
		this._config = Pe(e), this.dispatchEvent(new CustomEvent("config-changed", {
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
function Z(e) {
	return e.target.value.trim();
}
function tr(e, t) {
	let n = e.devices[t];
	return n?.name_by_user ?? n?.name ?? t;
}
// src/system/history.ts
var nr = 36e5;
function rr(e, t, n, r) {
	return t.length ? e.callWS({
		type: "history/history_during_period",
		start_time: new Date(n).toISOString(),
		end_time: new Date(r).toISOString(),
		entity_ids: t,
		minimal_response: !0,
		no_attributes: !0
	}) : Promise.resolve({});
}
function ir(e, t, n, r) {
	return t ? e.callWS({
		type: "recorder/statistics_during_period",
		start_time: new Date(n).toISOString(),
		end_time: new Date(r).toISOString(),
		statistic_ids: [t],
		period: "hour",
		types: ["change"]
	}).then((e) => e[t] ?? []) : Promise.resolve([]);
}
function ar(e = [], t, n) {
	return e.map((e) => {
		let r = Number.parseFloat(e.s);
		return {
			t: Math.max(n, e.lu * 1e3),
			c: Number.isFinite(r) ? He(r, t) : null
		};
	});
}
function or(e, t) {
	let n = null;
	for (let r of e) {
		if (r.t > t) break;
		n = r.c;
	}
	return n;
}
function sr(e, t) {
	let n = new Date(e);
	return n.setHours(0, 0, 0, 0), Array.from({ length: t }, (e, r) => {
		let i = new Date(n);
		return i.setDate(n.getDate() - (t - 1 - r)), i.getTime();
	});
}
function cr(e, t, n = [], r = []) {
	let i = e[0], a = lr(n, i), o = a.length ? a[0].t : Infinity, s = o <= i ? i : Math.ceil(o / nr) * nr, c = [];
	a.forEach((e, n) => {
		e.s === "on" && c.push([e.t, a[n + 1]?.t ?? t]);
	});
	let l = r.map((e) => ({
		start: typeof e.start == "number" ? e.start : Date.parse(e.start),
		hours: e.change ?? 0
	}));
	return e.map((n, r) => {
		let i = Math.min(e[r + 1] ?? t, t), a = Math.min(Math.max(s, n), i), o = l.filter((e) => e.start >= n && e.start < a), u = c.reduce((e, [t, n]) => e + Math.max(0, Math.min(n, i) - Math.max(t, a)), 0);
		return a === i && !o.length ? {
			start: n,
			minutes: null,
			wholeHours: !1
		} : {
			start: n,
			minutes: o.reduce((e, t) => e + t.hours * 60, 0) + u / 6e4,
			wholeHours: a > n
		};
	});
}
function lr(e, t) {
	return e.map((e) => ({
		s: e.s,
		t: Math.max(t, e.lu * 1e3)
	})).sort((e, t) => e.t - t.t);
}
// src/panels/usage-charts.ts
var ur = 340, dr = 180, Q = {
	left: 36,
	right: 12,
	top: 10,
	bottom: 26
}, fr = ur - Q.left - Q.right, pr = dr - Q.top - Q.bottom, $ = dr - Q.bottom, mr = 6e4, hr = 15 * mr, gr = 0;
function _r(e) {
	let t = e.end - e.start, n = (n) => Q.left + (n - e.start) / t * fr, r = (t) => Ue(t, e.unit), i = e.series.flatMap((e) => e.points.flatMap((e) => e.c === null ? [] : [r(e.c)])), a = xr(i.length ? i : [r(20), r(80)], [
		5,
		10,
		20,
		25,
		50
	]), o = (e) => $ - (e - a.min) / (a.max - a.min) * pr, s = (e) => o(r(e)), c = new Intl.DateTimeFormat(e.lang, { hour: "numeric" }), l = new Intl.DateTimeFormat(e.lang, {
		hour: "numeric",
		minute: "2-digit"
	}), u = e.hover === void 0 ? null : n(e.hover), d = (t) => e.hover === void 0 ? null : or(t.points, e.hover), f = (n) => e.start + Math.round(n * t / mr) * mr, p = (t) => Math.min(e.end, Math.max(e.start, (e.hover ?? e.end) + t * hr));
	return yr({
		label: "Temperatures over the last 24 hours",
		loading: e.loading,
		onPick: (t) => e.onHover(f(t)),
		onStep: (t) => e.onHover(t ? p(t) : e.hover ?? e.end),
		onClear: () => e.onHover(void 0),
		plot: k`
      ${Sr(a).map((e) => k`
          <line class="grid" x1=${Q.left} x2=${ur - Q.right} y1=${o(e)} y2=${o(e)} />
          <text class="tick" x=${Q.left - 6} y=${o(e) + 3.5} text-anchor="end">${e}°</text>`)}
      ${Cr(e.start, e.end).map((e) => k`<text class="tick" x=${n(e)} y=${$ + 15} text-anchor="middle">${c.format(e)}</text>`)}
      ${e.series.map((t) => k`<path class="series-line" style="--c:${t.color}" d=${wr(t.points, e.end, n, s)} />`)}
      ${u === null ? j : k`
          <line class="crosshair" x1=${u} x2=${u} y1=${Q.top} y2=${$} />
          ${e.series.map((e) => {
			let t = d(e);
			return t === null ? j : k`<circle class="hover-dot" style="--c:${e.color}" cx=${u} cy=${s(t)} r="4" />`;
		})}`}
    `,
		tip: e.hover === void 0 ? j : br(n(e.hover), O`
              <span class="tip-head">${l.format(e.hover)}</span>
              ${e.series.map((t) => O`
                  <span class="tip-row">
                    <i class="key line" style="--c:${t.color}"></i>
                    <strong>${B(d(t), e.unit, 1)}</strong>
                    <span class="muted">${t.label}</span>
                  </span>
                `)}
            `)
	});
}
function vr(e) {
	let t = e.days.length, n = fr / t, r = Math.min(24, n - 2), i = e.days.map((e) => (e.minutes ?? 0) / 60), a = xr([
		0,
		1,
		...i
	], [
		1,
		2,
		3,
		4,
		6,
		12
	]), o = (e) => $ - e / a.max * pr, s = (e) => Q.left + e * n + (n - r) / 2, c = new Intl.DateTimeFormat(e.lang, {
		month: "short",
		day: "numeric"
	}), l = new Intl.DateTimeFormat(e.lang, {
		weekday: "short",
		month: "short",
		day: "numeric"
	}), u = t - 1, d = `whole-hours-${++gr}`, f = e.hover === void 0 ? void 0 : e.days[e.hover];
	return yr({
		label: `Burner run time per day over the last ${t} days`,
		loading: e.loading,
		onPick: (n) => e.onHover(Math.min(u, Math.floor(n * t))),
		onStep: (t) => e.onHover(Math.min(u, Math.max(0, (e.hover ?? u) + t))),
		onClear: () => e.onHover(void 0),
		plot: k`
      <defs>
        <pattern id=${d} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect class="hatch-back" width="4" height="4" />
          <rect class="hatch-line" width="2" height="4" />
        </pattern>
      </defs>
      ${Sr(a).map((e) => k`
          <line class="grid" x1=${Q.left} x2=${ur - Q.right} y1=${o(e)} y2=${o(e)} />
          <text class="tick" x=${Q.left - 6} y=${o(e) + 3.5} text-anchor="end">${e} h</text>`)}
      ${e.days.map((e, t) => (u - t) % 7 ? j : k`<text class="tick" x=${s(t) + r / 2} y=${$ + 15} text-anchor="middle">${t === u ? "Today" : c.format(e.start)}</text>`)}
      <g class="bars ${e.hover === void 0 ? "" : "hovering"}">
        ${e.days.map((t, n) => t.minutes ? k`<path class="bar ${n === e.hover ? "active" : ""}" style=${t.wholeHours ? `fill:url(#${d})` : ""}
                d=${Tr(s(n), o(i[n]), r)} />` : j)}
      </g>
    `,
		tip: e.hover === void 0 || !f ? j : br(s(e.hover) + r / 2, O`
              <span class="tip-head">${e.hover === u ? "Today so far" : l.format(f.start)}</span>
              <strong>${f.minutes === null ? "No record" : et(f.minutes)}</strong>
              ${f.wholeHours ? O`<span class="muted">Whole hours, from the hour counter</span>` : j}
            `)
	});
}
function yr(e) {
	let t = (t) => {
		let n = t.currentTarget.getBoundingClientRect(), r = (t.clientX - n.left) / n.width * ur;
		e.onPick(Math.min(1, Math.max(0, (r - Q.left) / fr)));
	};
	return O`
    <div class="chart ${e.loading ? "loading" : ""}" tabindex="0" @keydown=${(t) => {
		if (t.key === "Escape") return e.onClear();
		let n = t.key === "ArrowLeft" ? -1 : +(t.key === "ArrowRight");
		n && (t.preventDefault(), e.onStep(n));
	}} @focus=${(t) => t.currentTarget.matches(":focus-visible") && e.onStep(0)} @blur=${e.onClear}>
      <svg
        class="usage-chart"
        viewBox="0 0 ${ur} ${dr}"
        role="img"
        aria-label=${e.label}
        @pointermove=${t}
        @pointerdown=${t}
        @pointerleave=${(t) => t.pointerType === "mouse" && e.onClear()}
      >
        ${e.plot}
      </svg>
      ${e.tip}
    </div>
  `;
}
function br(e, t) {
	return O`<div class="tip ${e > ur / 2 ? "left" : ""}" style="left:${(e / ur * 100).toFixed(2)}%">${t}</div>`;
}
function xr(e, t) {
	let n = Math.min(...e), r = Math.max(...e), i = t.find((e) => Math.ceil(r / e) - Math.floor(n / e) <= 5) ?? t[t.length - 1], a = Math.floor(n / i) * i;
	return {
		min: a,
		max: Math.max(a + i, Math.ceil(r / i) * i),
		step: i
	};
}
function Sr(e) {
	let t = [];
	for (let n = e.min; n <= e.max; n += e.step) t.push(n);
	return t;
}
function Cr(e, t) {
	let n = new Date(e);
	n.setMinutes(0, 0, 0);
	let r = [];
	for (n.setHours(n.getHours() + 1); n.getTime() < t; n.setHours(n.getHours() + 1)) n.getHours() % 6 == 0 && r.push(n.getTime());
	return r;
}
function wr(e, t, n, r) {
	let i = "", a = !1;
	for (let t of e) {
		let e = n(t.t).toFixed(1);
		a && (i += `H${e}`), t.c === null ? a = !1 : (i += a ? `V${r(t.c).toFixed(1)}` : `M${e} ${r(t.c).toFixed(1)}`, a = !0);
	}
	return a && (i += `H${n(t).toFixed(1)}`), i;
}
function Tr(e, t, n) {
	let r = Math.min(4, n / 2, $ - t), i = (e) => e.toFixed(1);
	return `M${i(e)} ${$}V${i(t + r)}A${i(r)} ${i(r)} 0 0 1 ${i(e + r)} ${i(t)}H${i(e + n - r)}A${i(r)} ${i(r)} 0 0 1 ${i(e + n)} ${i(t + r)}V${$}Z`;
}
// src/panels/usage.ts
var Er = 864e5, Dr = 30, Or = 3e5, kr = class extends R {
	static properties = {
		ctx: { attribute: !1 },
		active: { attribute: !1 },
		_hidden: { state: !0 },
		_temps: { state: !0 },
		_days: { state: !0 },
		_error: { state: !0 },
		_loading: { state: !0 },
		_hoverTime: { state: !0 },
		_hoverDay: { state: !0 }
	};
	_loaded;
	constructor() {
		super(), this.active = !1, this._hidden = /* @__PURE__ */ new Set(), this._loading = !1;
	}
	createRenderRoot() {
		return this;
	}
	shouldUpdate() {
		return this.active;
	}
	willUpdate() {
		let e = this.ctx;
		if (!e || this._loading) return;
		let t = jr(e).join(" ");
		(this._loaded?.key !== t || Date.now() - this._loaded.at > Or) && this._load(e, t);
	}
	render() {
		let e = this.ctx;
		if (!e) return O`<p class="empty">Waiting for the ViCare boiler…</p>`;
		let t = e.hass.language ?? "en", n = Ar(e), r = this._temps, i = this._days;
		return O`
      <div class="panel-grid">
        <section class="panel">
          <header class="panel-head"><h3>Temperatures</h3><span class="muted">Last 24 hours</span></header>
          <div class="series-toggles">
            ${n.map((t) => O`
                <button class="series-toggle" style="--c:${t.color}" aria-pressed=${!this._hidden.has(t.key)} @click=${() => this._toggle(t.key)}>
                  <i class="key line"></i>${t.label}<span class="muted">${B(t.nowC, e.unit)}</span>
                </button>
              `)}
          </div>
          ${r ? _r({
			series: n.filter((e) => !this._hidden.has(e.key)).map((e) => ({
				...e,
				points: r.points[e.entityId] ?? []
			})),
			start: r.start,
			end: r.end,
			unit: e.unit,
			lang: t,
			loading: this._loading,
			hover: this._hoverTime,
			onHover: (e) => this._hoverTime = e
		}) : this._placeholder()}
        </section>
        <section class="panel">
          <header class="panel-head"><h3>Burner run time</h3><span class="muted">Last ${Dr} days</span></header>
          ${i ? this._runTime(i, t) : this._placeholder()}
        </section>
      </div>
    `;
	}
	_runTime(e, t) {
		let n = e.slice(0, -1).flatMap((e) => e.minutes === null ? [] : [e.minutes]), r = n.length ? n.reduce((e, t) => e + t, 0) / n.length : null, i = (e) => e == null ? "–" : et(e);
		return O`
      <div class="stats">
        ${H("Today so far", i(e.at(-1)?.minutes))} ${H("Yesterday", i(e.at(-2)?.minutes))}
        ${H("Daily average", i(r))}
      </div>
      ${vr({
			days: e,
			lang: t,
			loading: this._loading,
			hover: this._hoverDay,
			onHover: (e) => this._hoverDay = e
		})}
      ${e.some((e) => e.wholeHours) ? O`
            <div class="chart-legend">
              <span><i class="key bar"></i>On/off history</span>
              <span><i class="key bar whole-hours"></i>Whole hours, from the hour counter</span>
            </div>
          ` : j}
    `;
	}
	_placeholder() {
		return this._error ? O`<p class="empty">Couldn't read Home Assistant's history: ${this._error}</p>` : O`<p class="empty">Loading history…</p>`;
	}
	_toggle(e) {
		let t = new Set(this._hidden);
		t.delete(e) || t.add(e), this._hidden = t;
	}
	async _load(e, t) {
		this._loading = !0;
		let { hass: n, vicare: r } = e, i = Date.now(), a = i - Er, o = sr(i, Dr), s = Ar(e), c = r.device.burner;
		try {
			let [e, t, l] = await Promise.all([
				rr(n, s.map((e) => e.entityId), a, i),
				rr(n, c ? [c] : [], o[0], i),
				ir(n, r.device.burner_hours, o[0], i)
			]), u = Object.fromEntries(s.map((t) => [t.entityId, ar(e[t.entityId], Mr(n, t.entityId), a)]));
			this._temps = {
				start: a,
				end: i,
				points: u
			}, this._days = cr(o, i, c ? t[c] : [], l), this._error = void 0;
		} catch (e) {
			this._error = e instanceof Error ? e.message : String(e?.message ?? e);
		} finally {
			this._loaded = {
				key: t,
				at: Date.now()
			}, this._loading = !1;
		}
	}
};
function Ar(e) {
	let { state: t, vicare: n } = e, r = n.device;
	return [
		{
			key: "boiler",
			label: "Boiler",
			color: "var(--series-boiler)",
			entityId: r.boiler_temperature ?? r.boiler_supply_temperature,
			nowC: t.boilerC
		},
		...t.circuits.map((e, t) => ({
			key: `circuit${e.circuit}`,
			label: `${e.name} supply`,
			color: `var(--series-circuit-${t + 1})`,
			entityId: n.circuits[e.circuit]?.supply_temperature,
			nowC: e.supplyC
		})),
		{
			key: "tank",
			label: "Hot water tank",
			color: "var(--series-tank)",
			entityId: r.dhw_storage_temperature,
			nowC: t.tank.c
		}
	].filter((e) => !!e.entityId);
}
function jr(e) {
	let t = e.vicare.device;
	return [
		...Ar(e).map((e) => e.entityId),
		t.burner ?? "",
		t.burner_hours ?? ""
	];
}
function Mr(e, t) {
	return e.states[t]?.attributes.unit_of_measurement ?? e.config.unit_system.temperature;
}
customElements.get("viessmann-boiler-card") || customElements.define(Ie, $n), customElements.get("viessmann-boiler-card-editor") || customElements.define(Le, er), customElements.get("viessmann-boiler-usage") || customElements.define(Re, kr);
var Nr = window;
Nr.customCards ??= [], Nr.customCards.some((e) => e.type === "viessmann-boiler-card") || Nr.customCards.push({
	type: Ie,
	name: "Viessmann Boiler Card",
	description: "Realistic, animated view of a Viessmann ViCare heating system.",
	preview: !0
}), console.info(`%c VIESSMANN-BOILER-CARD %c ${ze} `, "color:#fff;background:#d6001c;font-weight:700", "color:#d6001c;background:#fff");

//# sourceMappingURL=viessmann-boiler-card.js.map