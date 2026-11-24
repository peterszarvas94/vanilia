/*! Vanilia | includes Squire, MIT License, Copyright (c) 2011-2023 Neil Jenkins */
// node_modules/squire-rte/dist/squire-raw.mjs
var SHOW_ELEMENT = 1;
var SHOW_TEXT = 4;
var SHOW_ELEMENT_OR_TEXT = 5;
var always = () => true;
var TreeIterator = class {
	constructor(root, nodeType, filter) {
		this.root = root;
		this.currentNode = root;
		this.nodeType = nodeType;
		this.filter = filter || always;
	}
	isAcceptableNode(node) {
		const nodeType = node.nodeType;
		return !!((nodeType === Node.ELEMENT_NODE ? SHOW_ELEMENT : nodeType === Node.TEXT_NODE ? SHOW_TEXT : 0) & this.nodeType) && this.filter(node);
	}
	nextNode() {
		const root = this.root;
		let current = this.currentNode;
		let node;
		while (true) {
			node = current.firstChild;
			while (!node && current) {
				if (current === root) break;
				node = current.nextSibling;
				if (!node) current = current.parentNode;
			}
			if (!node) return null;
			if (this.isAcceptableNode(node)) {
				this.currentNode = node;
				return node;
			}
			current = node;
		}
	}
	previousNode() {
		const root = this.root;
		let current = this.currentNode;
		let node;
		while (true) {
			if (current === root) return null;
			node = current.previousSibling;
			if (node) while (current = node.lastChild) node = current;
			else node = current.parentNode;
			if (!node) return null;
			if (this.isAcceptableNode(node)) {
				this.currentNode = node;
				return node;
			}
			current = node;
		}
	}
	previousPONode() {
		const root = this.root;
		let current = this.currentNode;
		let node;
		while (true) {
			node = current.lastChild;
			while (!node && current) {
				if (current === root) break;
				node = current.previousSibling;
				if (!node) current = current.parentNode;
			}
			if (!node) return null;
			if (this.isAcceptableNode(node)) {
				this.currentNode = node;
				return node;
			}
			current = node;
		}
	}
};
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var DOCUMENT_FRAGMENT_NODE = 11;
var ZWS = "​";
var ua = navigator.userAgent;
var isMac = /Mac OS X/.test(ua);
var isWin = /Windows NT/.test(ua);
var isIOS = /iP(?:ad|hone|od)/.test(ua) || isMac && !!navigator.maxTouchPoints;
/Android/.test(ua);
var isGecko = /Gecko\//.test(ua);
var isLegacyEdge = /Edge\//.test(ua);
var isWebKit = !isLegacyEdge && /WebKit\//.test(ua);
var ctrlKey = isMac || isIOS ? "Meta-" : "Ctrl-";
var cantFocusEmptyTextNodes = isWebKit;
var supportsInputEvents = "onbeforeinput" in document && "inputType" in new InputEvent("input");
var notWS = /[^ \t\r\n\u200B]/;
var inlineNodeNames = /^(?:#text|A(?:BBR|CRONYM)?|B(?:R|D[IO])?|C(?:ITE|ODE)|D(?:ATA|EL|FN)|EM|FONT|HR|I(?:FRAME|MG|NPUT|NS)?|KBD|Q|R(?:P|T|UBY)|S(?:AMP|MALL|PAN|TR(?:IKE|ONG)|U[BP])?|TIME|U|VAR|WBR)$/;
var leafNodeNames = /* @__PURE__ */ new Set([
	"BR",
	"HR",
	"IFRAME",
	"IMG",
	"INPUT"
]);
var UNKNOWN = 0;
var INLINE = 1;
var BLOCK = 2;
var CONTAINER = 3;
var cache = /* @__PURE__ */ new WeakMap();
var resetNodeCategoryCache = () => {
	cache = /* @__PURE__ */ new WeakMap();
};
var isLeaf = (node) => {
	return leafNodeNames.has(node.nodeName);
};
var getNodeCategory = (node) => {
	switch (node.nodeType) {
		case COMMENT_NODE:
		case TEXT_NODE: return INLINE;
		case ELEMENT_NODE:
		case DOCUMENT_FRAGMENT_NODE:
			if (cache.has(node)) return cache.get(node);
			break;
		default: return UNKNOWN;
	}
	let nodeCategory;
	if (!Array.from(node.childNodes).every(isInline)) nodeCategory = CONTAINER;
	else if (inlineNodeNames.test(node.nodeName)) nodeCategory = INLINE;
	else nodeCategory = BLOCK;
	cache.set(node, nodeCategory);
	return nodeCategory;
};
var isInline = (node) => {
	return getNodeCategory(node) === INLINE;
};
var isBlock = (node) => {
	return getNodeCategory(node) === BLOCK;
};
var isContainer = (node) => {
	return getNodeCategory(node) === CONTAINER;
};
var createElement = (tag, props, children) => {
	const el = document.createElement(tag);
	if (props instanceof Array) {
		children = props;
		props = null;
	}
	if (props) for (const attr in props) {
		const value = props[attr];
		if (value !== void 0) el.setAttribute(attr, value);
	}
	if (children) children.forEach((node) => el.appendChild(node));
	return el;
};
var areAlike = (node, node2) => {
	if (isLeaf(node)) return false;
	if (node.nodeType !== node2.nodeType || node.nodeName !== node2.nodeName) return false;
	if (node instanceof HTMLElement && node2 instanceof HTMLElement) return node.nodeName !== "A" && node.className === node2.className && node.style.cssText === node2.style.cssText;
	return true;
};
var hasTagAttributes = (node, tag, attributes) => {
	if (node.nodeName !== tag) return false;
	for (const attr in attributes) if (!("getAttribute" in node) || node.getAttribute(attr) !== attributes[attr]) return false;
	return true;
};
var getNearest = (node, root, tag, attributes) => {
	while (node && node !== root) {
		if (hasTagAttributes(node, tag, attributes)) return node;
		node = node.parentNode;
	}
	return null;
};
var getNodeBeforeOffset = (node, offset) => {
	let children = node.childNodes;
	while (offset && node instanceof Element) {
		node = children[offset - 1];
		children = node.childNodes;
		offset = children.length;
	}
	return node;
};
var getNodeAfterOffset = (node, offset) => {
	let returnNode = node;
	if (returnNode instanceof Element) {
		const children = returnNode.childNodes;
		if (offset < children.length) returnNode = children[offset];
		else {
			while (returnNode && !returnNode.nextSibling) returnNode = returnNode.parentNode;
			if (returnNode) returnNode = returnNode.nextSibling;
		}
	}
	return returnNode;
};
var getLength = (node) => {
	return node instanceof Element || node instanceof DocumentFragment ? node.childNodes.length : node instanceof CharacterData ? node.length : 0;
};
var empty = (node) => {
	const frag = document.createDocumentFragment();
	let child = node.firstChild;
	while (child) {
		frag.appendChild(child);
		child = node.firstChild;
	}
	return frag;
};
var detach = (node) => {
	const parent = node.parentNode;
	if (parent) parent.removeChild(node);
	return node;
};
var replaceWith = (node, node2) => {
	const parent = node.parentNode;
	if (parent) parent.replaceChild(node2, node);
};
var notWSTextNode = (node) => {
	return node instanceof Element ? node.nodeName === "BR" : notWS.test(node.data);
};
var isLineBreak = (br, isLBIfEmptyBlock) => {
	let block = br.parentNode;
	while (isInline(block)) block = block.parentNode;
	const walker = new TreeIterator(block, SHOW_ELEMENT_OR_TEXT, notWSTextNode);
	walker.currentNode = br;
	return !!walker.nextNode() || isLBIfEmptyBlock && !walker.previousNode();
};
var removeZWS = (root, keepNode) => {
	const walker = new TreeIterator(root, SHOW_TEXT);
	let textNode;
	let index;
	while (textNode = walker.nextNode()) while ((index = textNode.data.indexOf(ZWS)) > -1 && (!keepNode || textNode.parentNode !== keepNode)) if (textNode.length === 1) {
		let node = textNode;
		let parent = node.parentNode;
		while (parent) {
			parent.removeChild(node);
			walker.currentNode = parent;
			if (!isInline(parent) || getLength(parent)) break;
			node = parent;
			parent = node.parentNode;
		}
		break;
	} else textNode.deleteData(index, 1);
};
var START_TO_START = 0;
var START_TO_END = 1;
var END_TO_END = 2;
var END_TO_START = 3;
var isNodeContainedInRange = (range, node, partial) => {
	const nodeRange = document.createRange();
	nodeRange.selectNode(node);
	if (partial) {
		const nodeEndBeforeStart = range.compareBoundaryPoints(END_TO_START, nodeRange) > -1;
		const nodeStartAfterEnd = range.compareBoundaryPoints(START_TO_END, nodeRange) < 1;
		return !nodeEndBeforeStart && !nodeStartAfterEnd;
	} else {
		const nodeStartAfterStart = range.compareBoundaryPoints(START_TO_START, nodeRange) < 1;
		const nodeEndBeforeEnd = range.compareBoundaryPoints(END_TO_END, nodeRange) > -1;
		return nodeStartAfterStart && nodeEndBeforeEnd;
	}
};
var canDescendInto = (node) => node instanceof Text || node.nodeType === ELEMENT_NODE && !isLeaf(node);
var moveRangeBoundariesDownTree = (range) => {
	let { startContainer, startOffset, endContainer, endOffset } = range;
	while (!(startContainer instanceof Text)) {
		let child = startContainer.childNodes[startOffset];
		if (!child || !canDescendInto(child)) {
			if (startOffset) {
				child = startContainer.childNodes[startOffset - 1];
				if (child instanceof Text) {
					let textChild = child;
					let prev;
					while (!textChild.length && (prev = textChild.previousSibling) && prev instanceof Text) {
						textChild.remove();
						textChild = prev;
					}
					startContainer = textChild;
					startOffset = textChild.data.length;
				}
			}
			break;
		}
		startContainer = child;
		startOffset = 0;
	}
	if (endOffset) while (!(endContainer instanceof Text)) {
		const child = endContainer.childNodes[endOffset - 1];
		if (!child || !canDescendInto(child)) {
			if (child && child.nodeName === "BR" && !isLineBreak(child, false)) {
				endOffset -= 1;
				continue;
			}
			break;
		}
		endContainer = child;
		endOffset = getLength(endContainer);
	}
	else while (!(endContainer instanceof Text)) {
		const child = endContainer.firstChild;
		if (!child || !canDescendInto(child)) break;
		endContainer = child;
	}
	range.setStart(startContainer, startOffset);
	range.setEnd(endContainer, endOffset);
};
var moveRangeBoundariesUpTree = (range, startMax, endMax, root) => {
	let startContainer = range.startContainer;
	let startOffset = range.startOffset;
	let endContainer = range.endContainer;
	let endOffset = range.endOffset;
	let parent;
	if (!startMax) startMax = range.commonAncestorContainer;
	if (!endMax) endMax = startMax;
	while (!startOffset && startContainer !== startMax && startContainer !== root) {
		parent = startContainer.parentNode;
		startOffset = Array.from(parent.childNodes).indexOf(startContainer);
		startContainer = parent;
	}
	while (true) {
		if (endContainer === endMax || endContainer === root) break;
		if (endContainer.nodeType !== TEXT_NODE && endContainer.childNodes[endOffset] && endContainer.childNodes[endOffset].nodeName === "BR" && !isLineBreak(endContainer.childNodes[endOffset], false)) endOffset += 1;
		if (endOffset !== getLength(endContainer)) break;
		parent = endContainer.parentNode;
		endOffset = Array.from(parent.childNodes).indexOf(endContainer) + 1;
		endContainer = parent;
	}
	range.setStart(startContainer, startOffset);
	range.setEnd(endContainer, endOffset);
};
var moveRangeBoundaryOutOf = (range, tag, root) => {
	let parent = getNearest(range.endContainer, root, tag);
	if (parent && (parent = parent.parentNode)) {
		const clone = range.cloneRange();
		moveRangeBoundariesUpTree(clone, parent, parent, root);
		if (clone.endContainer === parent) {
			range.setStart(clone.endContainer, clone.endOffset);
			range.setEnd(clone.endContainer, clone.endOffset);
		}
	}
	return range;
};
var fixCursor = (node) => {
	let fixer = null;
	if (node instanceof Text) return node;
	if (isInline(node)) {
		let child = node.firstChild;
		if (cantFocusEmptyTextNodes) while (child && child instanceof Text && !child.data) {
			node.removeChild(child);
			child = node.firstChild;
		}
		if (!child) {
			if (cantFocusEmptyTextNodes) fixer = document.createTextNode(ZWS);
			else fixer = document.createTextNode("");
		}
	} else if ((node instanceof Element || node instanceof DocumentFragment) && !node.querySelector("BR") && !notWS.test(node.textContent || "")) {
		fixer = createElement("BR");
		let parent = node;
		let child;
		while ((child = parent.lastElementChild) && !isInline(child)) parent = child;
		node = parent;
		if (node instanceof HTMLElement && node.contentEditable === "true") {
			node = createElement("DIV");
			parent.appendChild(node);
		}
	}
	if (fixer) try {
		node.appendChild(fixer);
	} catch {}
	return node;
};
var fixContainer = (container, root) => {
	let wrapper = null;
	if (/^(?:TABLE|TBODY|TR|TH|TD|P)/.test(container.nodeName)) return container;
	Array.from(container.childNodes).forEach((child) => {
		const isBR = child.nodeName === "BR";
		if (!isBR && isInline(child)) {
			if (!wrapper) wrapper = createElement("DIV");
			wrapper.appendChild(child);
		} else if (isBR || wrapper) {
			if (!wrapper) wrapper = createElement("DIV");
			fixCursor(wrapper);
			if (isBR) container.replaceChild(wrapper, child);
			else container.insertBefore(wrapper, child);
			wrapper = null;
		}
		if (isContainer(child)) fixContainer(child, root);
	});
	if (wrapper) container.appendChild(fixCursor(wrapper));
	return container;
};
var split = (node, offset, stopNode, root) => {
	if (!stopNode.contains(node)) throw new Error("split: stopNode does not contain node");
	if (node instanceof Text && node !== stopNode) {
		if (typeof offset !== "number") throw new Error("Offset must be a number to split text node!");
		if (!node.parentNode) throw new Error("Cannot split text node with no parent!");
		return split(node.parentNode, node.splitText(offset), stopNode, root);
	}
	let nodeAfterSplit = typeof offset === "number" ? offset < node.childNodes.length ? node.childNodes[offset] : null : offset;
	const parent = node.parentNode;
	if (!parent || node === stopNode || !(node instanceof Element)) return nodeAfterSplit;
	const clone = node.cloneNode(false);
	while (nodeAfterSplit) {
		const next = nodeAfterSplit.nextSibling;
		clone.appendChild(nodeAfterSplit);
		nodeAfterSplit = next;
	}
	if (node instanceof HTMLOListElement && getNearest(node, root, "BLOCKQUOTE")) clone.start = (+node.start || 1) + node.childNodes.length - 1;
	fixCursor(node);
	fixCursor(clone);
	parent.insertBefore(clone, node.nextSibling);
	return split(parent, clone, stopNode, root);
};
var _mergeInlines = (node, fakeRange) => {
	const children = node.childNodes;
	let l = children.length;
	const frags = [];
	while (l--) {
		const child = children[l];
		const prev = l ? children[l - 1] : null;
		if (prev && isInline(child) && areAlike(child, prev)) {
			if (fakeRange.startContainer === child) {
				fakeRange.startContainer = prev;
				fakeRange.startOffset += getLength(prev);
			}
			if (fakeRange.endContainer === child) {
				fakeRange.endContainer = prev;
				fakeRange.endOffset += getLength(prev);
			}
			if (fakeRange.startContainer === node) {
				if (fakeRange.startOffset > l) fakeRange.startOffset -= 1;
				else if (fakeRange.startOffset === l) {
					fakeRange.startContainer = prev;
					fakeRange.startOffset = getLength(prev);
				}
			}
			if (fakeRange.endContainer === node) {
				if (fakeRange.endOffset > l) fakeRange.endOffset -= 1;
				else if (fakeRange.endOffset === l) {
					fakeRange.endContainer = prev;
					fakeRange.endOffset = getLength(prev);
				}
			}
			detach(child);
			if (child instanceof Text) prev.appendData(child.data);
			else frags.push(empty(child));
		} else if (child instanceof Element) {
			let frag;
			while (frag = frags.pop()) child.appendChild(frag);
			_mergeInlines(child, fakeRange);
		}
	}
};
var mergeInlines = (node, range) => {
	const element = node instanceof Text ? node.parentNode : node;
	if (element instanceof Element) {
		const fakeRange = {
			startContainer: range.startContainer,
			startOffset: range.startOffset,
			endContainer: range.endContainer,
			endOffset: range.endOffset
		};
		_mergeInlines(element, fakeRange);
		range.setStart(fakeRange.startContainer, fakeRange.startOffset);
		range.setEnd(fakeRange.endContainer, fakeRange.endOffset);
	}
};
var mergeWithBlock = (block, next, range, root) => {
	let container = next;
	let parent;
	let offset;
	while ((parent = container.parentNode) && parent !== root && parent instanceof Element && parent.childNodes.length === 1) container = parent;
	detach(container);
	offset = block.childNodes.length;
	const last = block.lastChild;
	if (last && last.nodeName === "BR") {
		block.removeChild(last);
		offset -= 1;
	}
	block.appendChild(empty(next));
	range.setStart(block, offset);
	range.collapse(true);
	mergeInlines(block, range);
};
var mergeContainers = (node, root) => {
	const prev = node.previousSibling;
	const first = node.firstChild;
	const isListItem = node.nodeName === "LI";
	if (isListItem && (!first || !/^[OU]L$/.test(first.nodeName))) return;
	if (prev && areAlike(prev, node)) {
		if (!isContainer(prev)) {
			if (isListItem) {
				const block = createElement("DIV");
				block.appendChild(empty(prev));
				prev.appendChild(block);
			} else return;
		}
		detach(node);
		const needsFix = !isContainer(node);
		prev.appendChild(empty(node));
		if (needsFix) fixContainer(prev, root);
		if (first) mergeContainers(first, root);
	} else if (isListItem) {
		const block = createElement("DIV");
		node.insertBefore(block, first);
		fixCursor(block);
	}
};
var styleToSemantic = {
	"font-weight": {
		regexp: /^bold|^700/i,
		replace() {
			return createElement("B");
		}
	},
	"font-style": {
		regexp: /^italic/i,
		replace() {
			return createElement("I");
		}
	},
	"font-family": {
		regexp: notWS,
		replace(classNames, family) {
			const span = createElement("SPAN", { class: classNames.fontFamily });
			span.style.fontFamily = family;
			return span;
		}
	},
	"font-size": {
		regexp: notWS,
		replace(classNames, size) {
			const span = createElement("SPAN", { class: classNames.fontSize });
			span.style.fontSize = size;
			return span;
		}
	},
	"text-decoration": {
		regexp: /^underline/i,
		replace() {
			return createElement("U");
		}
	}
};
var replaceStyles = (node, _, config) => {
	const style = node.style;
	let newTreeBottom;
	let newTreeTop;
	for (const attr in styleToSemantic) {
		const converter = styleToSemantic[attr];
		const css = style.getPropertyValue(attr);
		if (css && converter.regexp.test(css)) {
			const el = converter.replace(config.classNames, css);
			if (el.nodeName === node.nodeName && el.className === node.className) continue;
			if (!newTreeTop) newTreeTop = el;
			if (newTreeBottom) newTreeBottom.appendChild(el);
			newTreeBottom = el;
			node.style.removeProperty(attr);
		}
	}
	if (newTreeTop && newTreeBottom) {
		newTreeBottom.appendChild(empty(node));
		if (node.style.cssText) node.appendChild(newTreeTop);
		else replaceWith(node, newTreeTop);
	}
	return newTreeBottom || node;
};
var replaceWithTag = (tag) => {
	return (node, parent) => {
		const el = createElement(tag);
		const attributes = node.attributes;
		for (let i = 0, l = attributes.length; i < l; i += 1) {
			const attribute = attributes[i];
			el.setAttribute(attribute.name, attribute.value);
		}
		parent.replaceChild(el, node);
		el.appendChild(empty(node));
		return el;
	};
};
var fontSizes = {
	"1": "10",
	"2": "13",
	"3": "16",
	"4": "18",
	"5": "24",
	"6": "32",
	"7": "48"
};
var stylesRewriters = {
	STRONG: replaceWithTag("B"),
	EM: replaceWithTag("I"),
	INS: replaceWithTag("U"),
	STRIKE: replaceWithTag("S"),
	SPAN: replaceStyles,
	FONT: (node, parent, config) => {
		const font = node;
		const face = font.face;
		const size = font.size;
		let color = font.color;
		const classNames = config.classNames;
		let fontSpan;
		let sizeSpan;
		let colorSpan;
		let newTreeBottom;
		let newTreeTop;
		if (face) {
			fontSpan = createElement("SPAN", { class: classNames.fontFamily });
			fontSpan.style.fontFamily = face;
			newTreeTop = fontSpan;
			newTreeBottom = fontSpan;
		}
		if (size) {
			sizeSpan = createElement("SPAN", { class: classNames.fontSize });
			sizeSpan.style.fontSize = fontSizes[size] + "px";
			if (!newTreeTop) newTreeTop = sizeSpan;
			if (newTreeBottom) newTreeBottom.appendChild(sizeSpan);
			newTreeBottom = sizeSpan;
		}
		if (color && /^#?([\dA-F]{3}){1,2}$/i.test(color)) {
			if (color.charAt(0) !== "#") color = "#" + color;
			colorSpan = createElement("SPAN", { class: classNames.color });
			colorSpan.style.color = color;
			if (!newTreeTop) newTreeTop = colorSpan;
			if (newTreeBottom) newTreeBottom.appendChild(colorSpan);
			newTreeBottom = colorSpan;
		}
		if (!newTreeTop || !newTreeBottom) newTreeTop = newTreeBottom = createElement("SPAN");
		parent.replaceChild(newTreeTop, font);
		newTreeBottom.appendChild(empty(font));
		return newTreeBottom;
	},
	TT: (node, parent, config) => {
		const el = createElement("SPAN", {
			class: config.classNames.fontFamily,
			style: "font-family:menlo,consolas,\"courier new\",monospace"
		});
		parent.replaceChild(el, node);
		el.appendChild(empty(node));
		return el;
	}
};
var allowedBlock = /^(?:A(?:DDRESS|RTICLE|SIDE|UDIO)?|BLOCKQUOTE|CAPTION|D(?:[DLT]|IV)|F(?:IGURE|IGCAPTION|OOTER)|H[1-6]|HEADER|L(?:ABEL|EGEND|I)|O(?:L|UTPUT)|P(?:RE)?|SECTION|T(?:ABLE|BODY|D|FOOT|H|HEAD|R)|COL(?:GROUP)?|UL)$/;
var blacklist = /^(?:HEAD|META|STYLE)$/;
var hasInlineContent = (walker, start, forwards, cache2) => {
	const visited = [];
	let result = false;
	let cacheable = true;
	let node;
	walker.currentNode = start;
	while (node = forwards ? walker.nextNode() : walker.previousPONode()) {
		const cached = cache2.get(node);
		if (cached !== void 0) {
			result = cached;
			break;
		}
		if (node.nodeName === "IMG" || node instanceof Text && notWS.test(node.data)) {
			result = true;
			break;
		}
		if (!isInline(node)) {
			cacheable = !forwards || allowedBlock.test(node.nodeName) && !stylesRewriters[node.nodeName];
			break;
		}
		visited.push(node);
	}
	if (cacheable) for (const visitedNode of visited) cache2.set(visitedNode, result);
	return result;
};
var cleanTree = (node, config, preserveWS, wsCache = {
	before: /* @__PURE__ */ new WeakMap(),
	after: /* @__PURE__ */ new WeakMap()
}) => {
	const children = node.childNodes;
	let nonInlineParent = node;
	while (isInline(nonInlineParent)) nonInlineParent = nonInlineParent.parentNode;
	const walker = new TreeIterator(nonInlineParent, SHOW_ELEMENT_OR_TEXT);
	for (let i = 0, l = children.length; i < l; i += 1) {
		let child = children[i];
		const nodeName = child.nodeName;
		const rewriter = stylesRewriters[nodeName];
		if (child instanceof HTMLElement) {
			const childLength = child.childNodes.length;
			if (rewriter) child = rewriter(child, node, config);
			else if (blacklist.test(nodeName)) {
				node.removeChild(child);
				i -= 1;
				l -= 1;
				continue;
			} else if (!allowedBlock.test(nodeName) && !isInline(child)) {
				i -= 1;
				l += childLength - 1;
				node.replaceChild(empty(child), child);
				continue;
			}
			if (childLength) cleanTree(child, config, preserveWS || nodeName === "PRE", wsCache);
		} else {
			if (child instanceof Text) {
				let data = child.data;
				const startsWithWS = !notWS.test(data.charAt(0));
				const endsWithWS = !notWS.test(data.charAt(data.length - 1));
				if (preserveWS || !startsWithWS && !endsWithWS) continue;
				if (startsWithWS) data = data.replace(/^[ \t\r\n]+/g, hasInlineContent(walker, child, false, wsCache.before) ? " " : "");
				if (endsWithWS && data) data = data.replace(/[ \t\r\n]+$/g, hasInlineContent(walker, child, true, wsCache.after) ? " " : "");
				if (data) {
					child.data = data;
					continue;
				}
			}
			node.removeChild(child);
			i -= 1;
			l -= 1;
		}
	}
	return node;
};
var removeEmptyInlines = (node) => {
	const children = node.childNodes;
	let l = children.length;
	while (l--) {
		const child = children[l];
		if (child instanceof Element && !isLeaf(child)) {
			removeEmptyInlines(child);
			if (isInline(child) && !child.firstChild) node.removeChild(child);
		} else if (child instanceof Text && !child.data) node.removeChild(child);
	}
};
var cleanupBRs = (node, root, keepForBlankLine) => {
	const brs = node.querySelectorAll("BR");
	const brBreaksLine = [];
	let l = brs.length;
	for (let i = 0; i < l; i += 1) brBreaksLine[i] = isLineBreak(brs[i], keepForBlankLine);
	while (l--) {
		const br = brs[l];
		const parent = br.parentNode;
		if (!parent) continue;
		if (!brBreaksLine[l]) detach(br);
		else if (!isInline(parent)) fixContainer(parent, root);
	}
};
var escapeHTML = (text) => {
	return text.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split("\"").join("&quot;");
};
var getBlockWalker = (node, root) => {
	const walker = new TreeIterator(root, SHOW_ELEMENT, isBlock);
	walker.currentNode = node;
	return walker;
};
var getPreviousBlock = (node, root) => {
	const block = getBlockWalker(node, root).previousNode();
	return block !== root ? block : null;
};
var getNextBlock = (node, root) => {
	const block = getBlockWalker(node, root).nextNode();
	return block !== root ? block : null;
};
var isEmptyBlock = (block) => {
	return !block.textContent && !block.querySelector("IMG");
};
var getStartBlockOfRange = (range, root) => {
	const container = range.startContainer;
	let block;
	if (isInline(container)) block = getPreviousBlock(container, root);
	else if (container !== root && container instanceof HTMLElement && isBlock(container)) block = container;
	else block = getNextBlock(getNodeBeforeOffset(container, range.startOffset), root);
	return block && isNodeContainedInRange(range, block, true) ? block : null;
};
var getEndBlockOfRange = (range, root) => {
	const container = range.endContainer;
	let block;
	if (isInline(container)) block = getPreviousBlock(container, root);
	else if (container !== root && container instanceof HTMLElement && isBlock(container)) block = container;
	else {
		let node = getNodeAfterOffset(container, range.endOffset);
		if (!node || !root.contains(node)) {
			node = root;
			let child;
			while (child = node.lastChild) node = child;
		}
		block = getPreviousBlock(node, root);
	}
	return block && isNodeContainedInRange(range, block, true) ? block : null;
};
var isContent = (node) => {
	return node instanceof Text ? notWS.test(node.data) : node.nodeName === "IMG";
};
var rangeDoesStartAtBlockBoundary = (range, root) => {
	const startContainer = range.startContainer;
	const startOffset = range.startOffset;
	let nodeAfterCursor;
	if (startContainer instanceof Text) {
		const text = startContainer.data;
		for (let i = startOffset; i > 0; i -= 1) if (text.charAt(i - 1) !== ZWS) return false;
		nodeAfterCursor = startContainer;
	} else {
		nodeAfterCursor = getNodeAfterOffset(startContainer, startOffset);
		if (nodeAfterCursor && !root.contains(nodeAfterCursor)) nodeAfterCursor = null;
		if (!nodeAfterCursor) {
			nodeAfterCursor = getNodeBeforeOffset(startContainer, startOffset);
			if (nodeAfterCursor instanceof Text && nodeAfterCursor.length) return false;
		}
	}
	const block = getStartBlockOfRange(range, root);
	if (!block) return false;
	const contentWalker = new TreeIterator(block, SHOW_ELEMENT_OR_TEXT, isContent);
	contentWalker.currentNode = nodeAfterCursor;
	return !contentWalker.previousNode();
};
var rangeDoesEndAtBlockBoundary = (range, root) => {
	const endContainer = range.endContainer;
	const endOffset = range.endOffset;
	let currentNode;
	if (endContainer instanceof Text) {
		const text = endContainer.data;
		const length = text.length;
		for (let i = endOffset; i < length; i += 1) if (text.charAt(i) !== ZWS) return false;
		currentNode = endContainer;
	} else currentNode = getNodeBeforeOffset(endContainer, endOffset);
	const block = getEndBlockOfRange(range, root);
	if (!block) return false;
	const contentWalker = new TreeIterator(block, SHOW_ELEMENT_OR_TEXT, isContent);
	contentWalker.currentNode = currentNode;
	return !contentWalker.nextNode();
};
var expandRangeToBlockBoundaries = (range, root) => {
	const start = getStartBlockOfRange(range, root);
	const end = getEndBlockOfRange(range, root);
	let parent;
	if (start && end) {
		parent = start.parentNode;
		range.setStart(parent, Array.from(parent.childNodes).indexOf(start));
		parent = end.parentNode;
		range.setEnd(parent, Array.from(parent.childNodes).indexOf(end) + 1);
	}
};
function createRange(startContainer, startOffset, endContainer, endOffset) {
	const range = document.createRange();
	range.setStart(startContainer, startOffset);
	if (endContainer && typeof endOffset === "number") range.setEnd(endContainer, endOffset);
	else range.setEnd(startContainer, startOffset);
	return range;
}
var insertNodeInRange = (range, node) => {
	let { startContainer, startOffset, endContainer, endOffset } = range;
	let children;
	if (startContainer instanceof Text) {
		const parent = startContainer.parentNode;
		children = parent.childNodes;
		if (startOffset === startContainer.length) {
			startOffset = Array.from(children).indexOf(startContainer) + 1;
			if (range.collapsed) {
				endContainer = parent;
				endOffset = startOffset;
			}
		} else {
			if (startOffset) {
				const afterSplit = startContainer.splitText(startOffset);
				if (endContainer === startContainer) {
					endOffset -= startOffset;
					endContainer = afterSplit;
				} else if (endContainer === parent) endOffset += 1;
				startContainer = afterSplit;
			}
			startOffset = Array.from(children).indexOf(startContainer);
		}
		startContainer = parent;
	} else children = startContainer.childNodes;
	const childCount = children.length;
	if (startOffset === childCount) startContainer.appendChild(node);
	else startContainer.insertBefore(node, children[startOffset]);
	if (startContainer === endContainer) endOffset += children.length - childCount;
	range.setStart(startContainer, startOffset);
	range.setEnd(endContainer, endOffset);
};
var extractContentsOfRange = (range, common, root) => {
	const frag = document.createDocumentFragment();
	if (range.collapsed) return frag;
	if (!common) common = range.commonAncestorContainer;
	if (common instanceof Text) common = common.parentNode;
	const startContainer = range.startContainer;
	const startOffset = range.startOffset;
	let endContainer = split(range.endContainer, range.endOffset, common, root);
	let endOffset = 0;
	let node = split(startContainer, startOffset, common, root);
	while (node && node !== endContainer) {
		const next = node.nextSibling;
		frag.appendChild(node);
		node = next;
	}
	node = endContainer && endContainer.previousSibling;
	if (node && node instanceof Text && endContainer instanceof Text) {
		endOffset = node.length;
		node.appendData(endContainer.data);
		detach(endContainer);
		endContainer = node;
	}
	range.setStart(startContainer, startOffset);
	if (endContainer) range.setEnd(endContainer, endOffset);
	else range.setEnd(common, common.childNodes.length);
	fixCursor(common);
	return frag;
};
var getAdjacentInlineNode = (iterator, method, node) => {
	iterator.currentNode = node;
	let nextNode;
	while (nextNode = iterator[method]()) {
		if (nextNode instanceof Text || isLeaf(nextNode)) return nextNode;
		if (!isInline(nextNode)) return null;
	}
	return null;
};
var deleteContentsOfRange = (range, root) => {
	const startBlock = getStartBlockOfRange(range, root);
	let endBlock = getEndBlockOfRange(range, root);
	const needsMerge = startBlock !== endBlock;
	if (startBlock && endBlock) {
		moveRangeBoundariesDownTree(range);
		moveRangeBoundariesUpTree(range, startBlock, endBlock, root);
	}
	const frag = extractContentsOfRange(range, null, root);
	moveRangeBoundariesDownTree(range);
	if (needsMerge) {
		endBlock = getEndBlockOfRange(range, root);
		if (startBlock && endBlock && startBlock !== endBlock) mergeWithBlock(startBlock, endBlock, range, root);
	}
	if (startBlock) fixCursor(startBlock);
	const child = root.firstChild;
	if (!child || child.nodeName === "BR") {
		fixCursor(root);
		if (root.firstChild) range.selectNodeContents(root.firstChild);
	}
	range.collapse(true);
	const startContainer = range.startContainer;
	const startOffset = range.startOffset;
	const iterator = new TreeIterator(root, SHOW_ELEMENT_OR_TEXT);
	let afterNode = startContainer;
	let afterOffset = startOffset;
	if (!(afterNode instanceof Text) || afterOffset === afterNode.data.length) {
		afterNode = getAdjacentInlineNode(iterator, "nextNode", afterNode);
		afterOffset = 0;
	}
	let beforeNode = startContainer;
	let beforeOffset = startOffset - 1;
	if (!(beforeNode instanceof Text) || beforeOffset === -1) {
		beforeNode = getAdjacentInlineNode(iterator, "previousPONode", afterNode || (startContainer instanceof Text ? startContainer : startContainer.childNodes[startOffset] || startContainer));
		if (beforeNode instanceof Text) beforeOffset = beforeNode.data.length;
	}
	let node = null;
	let offset = 0;
	if (afterNode instanceof Text && afterNode.data.charAt(afterOffset) === " " && rangeDoesStartAtBlockBoundary(range, root)) {
		node = afterNode;
		offset = afterOffset;
	} else if (beforeNode instanceof Text && beforeNode.data.charAt(beforeOffset) === " ") {
		if (afterNode instanceof Text && afterNode.data.charAt(afterOffset) === " " || rangeDoesEndAtBlockBoundary(range, root)) {
			node = beforeNode;
			offset = beforeOffset;
		}
	}
	if (node) node.replaceData(offset, 1, "\xA0");
	range.setStart(startContainer, startOffset);
	range.collapse(true);
	return frag;
};
var insertTreeFragmentIntoRange = (range, frag, root) => {
	const firstInFragIsInline = frag.firstChild && isInline(frag.firstChild);
	let node;
	fixContainer(frag, root);
	node = frag;
	while (node = getNextBlock(node, root)) fixCursor(node);
	if (!range.collapsed) deleteContentsOfRange(range, root);
	moveRangeBoundariesDownTree(range);
	range.collapse(false);
	let stopPoint = getNearest(range.endContainer, root, "BLOCKQUOTE") || root;
	let block = getStartBlockOfRange(range, root);
	let blockContentsAfterSplit = null;
	const firstBlockInFrag = getNextBlock(frag, frag);
	const replaceBlock = !firstInFragIsInline && !!block && isEmptyBlock(block);
	if (block && firstBlockInFrag && !replaceBlock && !getNearest(firstBlockInFrag, frag, "PRE") && !getNearest(firstBlockInFrag, frag, "TABLE")) {
		moveRangeBoundariesUpTree(range, block, block, root);
		range.collapse(true);
		let container = range.endContainer;
		let offset = range.endOffset;
		cleanupBRs(block, root, false);
		if (isInline(container)) {
			const nodeAfterSplit = split(container, offset, getPreviousBlock(container, root) || root, root);
			container = nodeAfterSplit.parentNode;
			offset = Array.from(container.childNodes).indexOf(nodeAfterSplit);
		}
		if (offset !== getLength(container)) {
			blockContentsAfterSplit = document.createDocumentFragment();
			while (node = container.childNodes[offset]) blockContentsAfterSplit.appendChild(node);
		}
		mergeWithBlock(container, firstBlockInFrag, range, root);
		if (container === root) range.setEnd(root, getLength(root));
		else {
			offset = Array.from(container.parentNode.childNodes).indexOf(container) + 1;
			container = container.parentNode;
			range.setEnd(container, offset);
		}
	}
	if (getLength(frag)) {
		if (replaceBlock && block) {
			range.setEndBefore(block);
			range.collapse(false);
			detach(block);
		}
		if (!stopPoint.contains(range.endContainer)) {
			if (!root.contains(range.endContainer)) {
				range.setEnd(root, getLength(root));
				range.collapse(false);
			}
			stopPoint = getNearest(range.endContainer, root, "BLOCKQUOTE") || root;
		}
		moveRangeBoundariesUpTree(range, stopPoint, stopPoint, root);
		let nodeAfterSplit = split(range.endContainer, range.endOffset, stopPoint, root);
		const nodeBeforeSplit = nodeAfterSplit ? nodeAfterSplit.previousSibling : stopPoint.lastChild;
		stopPoint.insertBefore(frag, nodeAfterSplit);
		if (nodeAfterSplit) range.setEndBefore(nodeAfterSplit);
		else range.setEnd(stopPoint, getLength(stopPoint));
		block = getEndBlockOfRange(range, root);
		moveRangeBoundariesDownTree(range);
		const container = range.endContainer;
		const offset = range.endOffset;
		if (nodeAfterSplit && isContainer(nodeAfterSplit)) mergeContainers(nodeAfterSplit, root);
		nodeAfterSplit = nodeBeforeSplit && nodeBeforeSplit.nextSibling;
		if (nodeAfterSplit && isContainer(nodeAfterSplit)) mergeContainers(nodeAfterSplit, root);
		range.setEnd(container, offset);
	}
	if (blockContentsAfterSplit && block) {
		const tempRange = range.cloneRange();
		fixCursor(blockContentsAfterSplit);
		mergeWithBlock(block, blockContentsAfterSplit, tempRange, root);
		range.setEnd(tempRange.endContainer, tempRange.endOffset);
	}
	moveRangeBoundariesDownTree(range);
};
var getTextContentsOfRange = (range) => {
	if (range.collapsed) return "";
	const startContainer = range.startContainer;
	const endContainer = range.endContainer;
	const walker = new TreeIterator(range.commonAncestorContainer, SHOW_ELEMENT_OR_TEXT, (node2) => {
		return isNodeContainedInRange(range, node2, true);
	});
	walker.currentNode = startContainer;
	let node = startContainer;
	let textContent = "";
	let addedTextInBlock = false;
	let value;
	if (!(node instanceof Element) && !(node instanceof Text) || !walker.filter(node)) node = walker.nextNode();
	while (node) {
		if (node instanceof Text) {
			value = node.data;
			if (value && /\S/.test(value)) {
				if (node === endContainer) value = value.slice(0, range.endOffset);
				if (node === startContainer) value = value.slice(range.startOffset);
				textContent += value;
				addedTextInBlock = true;
			}
		} else if (node.nodeName === "BR" || addedTextInBlock && !isInline(node)) {
			textContent += "\n";
			addedTextInBlock = false;
		}
		node = walker.nextNode();
	}
	textContent = textContent.replace(/ /g, " ");
	return textContent;
};
var indexOf = Array.prototype.indexOf;
var extractRange = (range, root, removeRangeFromDocument, toCleanHTML, toPlainText) => {
	let text = toPlainText ? "" : getTextContentsOfRange(range);
	const startBlock = getStartBlockOfRange(range, root);
	const endBlock = getEndBlockOfRange(range, root);
	let parent = range.commonAncestorContainer;
	let copyRoot = root;
	if (startBlock === endBlock && startBlock?.contains(parent)) copyRoot = startBlock;
	let contents;
	if (removeRangeFromDocument) {
		contents = deleteContentsOfRange(range, root);
		if (!parent.isConnected) parent = range.commonAncestorContainer;
	} else contents = range.cloneContents();
	while (parent && !(parent instanceof Element)) parent = parent.parentNode;
	while (parent && parent !== copyRoot) {
		const newContents = parent.cloneNode(false);
		newContents.appendChild(contents);
		contents = newContents;
		parent = parent.parentNode;
	}
	let html;
	if (contents.childNodes.length === 1 && contents.childNodes[0] instanceof Text) {
		text = contents.childNodes[0].data.replace(/ /g, " ");
		html = void 0;
	} else {
		const node = createElement("DIV");
		node.appendChild(contents);
		html = node.innerHTML;
		if (toCleanHTML) html = toCleanHTML(html);
	}
	if (toPlainText && html !== void 0) text = toPlainText(html);
	if (text === html) html = void 0;
	if (isWin) text = text.replace(/\r?\n/g, "\r\n");
	if (html) html = "<!-- squire -->" + html;
	return [text, html];
};
var extractRangeToClipboard = (event, range, root, removeRangeFromDocument, toCleanHTML, toPlainText, plainTextOnly) => {
	const clipboardData = event.clipboardData;
	if (isLegacyEdge || !clipboardData) return false;
	let [text, html] = extractRange(range, root, removeRangeFromDocument, toCleanHTML, toPlainText);
	event.preventDefault();
	if (!plainTextOnly && html) clipboardData.setData("text/html", html);
	clipboardData.setData("text/plain", text);
	return true;
};
var _onCut = function(event) {
	const range = this.getSelection();
	const root = this._root;
	if (range.collapsed) {
		event.preventDefault();
		return;
	}
	this.saveUndoState(range);
	if (!extractRangeToClipboard(event, range, root, true, this._config.willCutCopy, this._config.toPlainText, false)) setTimeout(() => {
		try {
			this._ensureBottomLine();
		} catch (error) {
			this._config.didError(error);
		}
	}, 0);
	this.setSelection(range);
};
var _onCopy = function(event) {
	extractRangeToClipboard(event, this.getSelection(), this._root, false, this._config.willCutCopy, this._config.toPlainText, false);
};
var _monitorShiftKey = function(event) {
	this._isShiftDown = event.shiftKey;
};
var _onPaste = function(event) {
	const clipboardData = event.clipboardData;
	const items = clipboardData?.items;
	const choosePlain = this._isShiftDown || !!getNearest(this.getSelection().commonAncestorContainer, this._root, "PRE");
	let hasRTF = false;
	let hasImage = false;
	let plainItem = null;
	let htmlItem = null;
	if (items) {
		let l = items.length;
		while (l--) {
			const item = items[l];
			const type = item.type;
			if (type === "text/html") htmlItem = item;
			else if (type === "text/plain" || type === "text/uri-list") plainItem = item;
			else if (type === "text/rtf") hasRTF = true;
			else if (/^image\/.*/.test(type)) hasImage = true;
		}
		if (hasImage && !(hasRTF && htmlItem) && !plainItem) {
			event.preventDefault();
			this.fireEvent("pasteImage", { clipboardData });
			return;
		}
		if (!isLegacyEdge) {
			event.preventDefault();
			if (htmlItem && (!choosePlain || !plainItem)) htmlItem.getAsString((html) => {
				this.insertHTML(html, true);
			});
			else if (plainItem) plainItem.getAsString((text) => {
				const range2 = this.getSelection();
				if (!range2.collapsed && notWS.test(range2.toString())) {
					const match = this.linkRegExp.exec(text);
					if (!!match && match[0].length === text.length) {
						const href = match[1] ? /^(?:ht|f)tps?:/i.test(match[1]) ? match[1] : "http://" + match[1] : "mailto:" + match[0];
						this.makeLink(href);
						return;
					}
				}
				this.insertPlainText(text, true);
			});
			return;
		}
	}
	const types = clipboardData?.types;
	if (!isLegacyEdge && types && (indexOf.call(types, "text/html") > -1 || !isGecko && indexOf.call(types, "text/plain") > -1 && indexOf.call(types, "text/rtf") < 0)) {
		event.preventDefault();
		let data;
		if (!choosePlain && (data = clipboardData.getData("text/html"))) this.insertHTML(data, true);
		else if ((data = clipboardData.getData("text/plain")) || (data = clipboardData.getData("text/uri-list"))) this.insertPlainText(data, true);
		return;
	}
	const body = document.body;
	const range = this.getSelection();
	const startContainer = range.startContainer;
	const startOffset = range.startOffset;
	const endContainer = range.endContainer;
	const endOffset = range.endOffset;
	let pasteArea = createElement("DIV", {
		contenteditable: "true",
		style: "position:fixed; overflow:hidden; top:0; right:100%; width:1px; height:1px;"
	});
	body.appendChild(pasteArea);
	range.selectNodeContents(pasteArea);
	this.setSelection(range);
	setTimeout(() => {
		try {
			let html = "";
			let next = pasteArea;
			let first;
			while (pasteArea = next) {
				next = pasteArea.nextSibling;
				detach(pasteArea);
				first = pasteArea.firstChild;
				if (first && first === pasteArea.lastChild && first instanceof HTMLDivElement) pasteArea = first;
				html += pasteArea.innerHTML;
			}
			this.setSelection(createRange(startContainer, startOffset, endContainer, endOffset));
			if (html) this.insertHTML(html, true);
		} catch (error) {
			this._config.didError(error);
		}
	}, 0);
};
var _onDragStart = function() {
	const range = this.getSelection();
	if (range && !range.collapsed && this._root.contains(range.commonAncestorContainer)) this._dragRange = range.cloneRange();
	else this._dragRange = null;
};
var _onDragEnd = function() {
	this._dragRange = null;
};
var getCaretRangeFromPoint = (x, y, root) => {
	let range = null;
	const doc = document;
	if (doc.caretPositionFromPoint) {
		const pos = doc.caretPositionFromPoint(x, y);
		if (pos) {
			range = document.createRange();
			range.setStart(pos.offsetNode, pos.offset);
			range.collapse(true);
		}
	} else if (doc.caretRangeFromPoint) range = doc.caretRangeFromPoint(x, y);
	if (range && !root.contains(range.commonAncestorContainer)) return null;
	return range;
};
var pointIsWithinRange = (point, source) => {
	return point.compareBoundaryPoints(Range.START_TO_START, source) >= 0 && point.compareBoundaryPoints(Range.END_TO_END, source) <= 0;
};
var _onDrop = function(event) {
	const dataTransfer = event.dataTransfer;
	if (!dataTransfer) return;
	const types = dataTransfer.types;
	let hasPlain = false;
	let hasHTML = false;
	for (let i = 0, l = types.length; i < l; i += 1) switch (types[i]) {
		case "text/plain":
			hasPlain = true;
			break;
		case "text/html": hasHTML = true;
	}
	if (!hasPlain && !hasHTML) return;
	event.preventDefault();
	const root = this._root;
	let dropRange = getCaretRangeFromPoint(event.clientX, event.clientY, root);
	const dragRange = this._dragRange;
	this._dragRange = null;
	if (!dropRange) return;
	let text, html;
	if (dragRange) {
		if (pointIsWithinRange(dropRange, dragRange)) return;
		this._recordUndoState(dragRange, this._isInUndoState);
		const bookmark = document.createComment("");
		dropRange.insertNode(bookmark);
		this._getRangeAndRemoveBookmark(dragRange);
		[text, html] = extractRange(dragRange, root, dataTransfer.dropEffect !== "copy", this._config.willCutCopy, this._config.toPlainText);
		bookmark.replaceWith(createElement("INPUT", {
			id: this.startSelectionId,
			type: "hidden"
		}), createElement("INPUT", {
			id: this.endSelectionId,
			type: "hidden"
		}));
		this._getRangeAndRemoveBookmark(dropRange);
		resetNodeCategoryCache();
	} else {
		this.saveUndoState(dropRange);
		if (hasHTML) html = dataTransfer.getData("text/html");
		else text = dataTransfer.getData("text/plain");
	}
	this.setSelection(dropRange);
	if (html !== void 0) this.insertHTML(html, true);
	else if (text !== void 0) this.insertPlainText(text, true);
};
var Enter = (self, event, range) => {
	event.preventDefault();
	self.splitBlock(event.shiftKey, range);
};
var afterDelete = (self, range) => {
	try {
		if (!range) range = self.getSelection();
		let node = range.startContainer;
		if (node instanceof Text) node = node.parentNode;
		let parent = node;
		while (isInline(parent) && (!parent.textContent || parent.textContent === ZWS)) {
			node = parent;
			parent = node.parentNode;
		}
		if (node !== parent) {
			range.setStart(parent, Array.from(parent.childNodes).indexOf(node));
			range.collapse(true);
			parent.removeChild(node);
			if (!isBlock(parent)) parent = getPreviousBlock(parent, self._root) || self._root;
			fixCursor(parent);
			moveRangeBoundariesDownTree(range);
		}
		if (node === self._root && (node = node.firstChild) && node.nodeName === "BR") detach(node);
		self._ensureBottomLine();
		self.setSelection(range);
		self._updatePath(range, true);
	} catch (error) {
		self._config.didError(error);
	}
};
var detachUneditableNode = (node, root) => {
	let parent;
	while (parent = node.parentNode) {
		if (parent === root || parent.isContentEditable) break;
		node = parent;
	}
	detach(node);
};
var linkifyText = (self, textNode, offset) => {
	if (getNearest(textNode, self._root, "A")) return;
	const data = textNode.data || "";
	const searchFrom = Math.max(data.lastIndexOf(" ", offset - 1), data.lastIndexOf("\xA0", offset - 1)) + 1;
	const searchText = data.slice(searchFrom, offset);
	const match = self.linkRegExp.exec(searchText);
	if (match) {
		const selection = self.getSelection();
		self._docWasChanged();
		self._recordUndoState(selection);
		self._getRangeAndRemoveBookmark(selection);
		const index = searchFrom + match.index;
		const endIndex = index + match[0].length;
		const needsSelectionUpdate = selection.startContainer === textNode;
		const newSelectionOffset = selection.startOffset - endIndex;
		if (index) textNode = textNode.splitText(index);
		const defaultAttributes = self._config.tagAttributes.a;
		const link = createElement("A", Object.assign({ href: match[1] ? /^(?:ht|f)tps?:/i.test(match[1]) ? match[1] : "http://" + match[1] : "mailto:" + match[0] }, defaultAttributes));
		link.textContent = data.slice(index, endIndex);
		textNode.parentNode.insertBefore(link, textNode);
		textNode.data = data.slice(endIndex);
		if (needsSelectionUpdate) {
			selection.setStart(textNode, newSelectionOffset);
			selection.setEnd(textNode, newSelectionOffset);
		}
		self.setSelection(selection);
	}
};
var Backspace = (self, event, range) => {
	const root = self._root;
	self._removeZWS();
	self.saveUndoState(range);
	if (!range.collapsed) {
		event.preventDefault();
		deleteContentsOfRange(range, root);
		afterDelete(self, range);
	} else if (rangeDoesStartAtBlockBoundary(range, root)) {
		event.preventDefault();
		const startBlock = getStartBlockOfRange(range, root);
		if (!startBlock) return;
		let current = startBlock;
		fixContainer(current.parentNode, root);
		const previous = getPreviousBlock(current, root);
		if (previous) {
			if (!previous.isContentEditable) {
				detachUneditableNode(previous, root);
				return;
			}
			mergeWithBlock(previous, current, range, root);
			current = previous.parentNode;
			while (current !== root && !current.nextSibling) current = current.parentNode;
			if (current !== root && (current = current.nextSibling)) mergeContainers(current, root);
			self.setSelection(range);
		} else if (current) {
			if (getNearest(current, root, "UL") || getNearest(current, root, "OL")) {
				self.decreaseListLevel(range);
				return;
			} else if (getNearest(current, root, "BLOCKQUOTE")) {
				self.removeQuote(range);
				return;
			}
			self.setSelection(range);
			self._updatePath(range, true);
		}
	} else {
		moveRangeBoundariesDownTree(range);
		const text = range.startContainer;
		const offset = range.startOffset;
		const a = text.parentNode;
		if (text instanceof Text && a instanceof HTMLAnchorElement && offset && a.href.includes(text.data)) {
			text.deleteData(offset - 1, 1);
			self.setSelection(range);
			self.removeLink();
			event.preventDefault();
		} else {
			self.setSelection(range);
			setTimeout(() => {
				afterDelete(self);
			}, 0);
		}
	}
};
var Delete = (self, event, range) => {
	const root = self._root;
	let current;
	let next;
	let originalRange;
	let cursorContainer;
	let cursorOffset;
	let nodeAfterCursor;
	self._removeZWS();
	self.saveUndoState(range);
	if (!range.collapsed) {
		event.preventDefault();
		deleteContentsOfRange(range, root);
		afterDelete(self, range);
	} else if (rangeDoesEndAtBlockBoundary(range, root)) {
		event.preventDefault();
		current = getStartBlockOfRange(range, root);
		if (!current) return;
		fixContainer(current.parentNode, root);
		next = getNextBlock(current, root);
		if (next) {
			if (!next.isContentEditable) {
				detachUneditableNode(next, root);
				return;
			}
			mergeWithBlock(current, next, range, root);
			next = current.parentNode;
			while (next !== root && !next.nextSibling) next = next.parentNode;
			if (next !== root && (next = next.nextSibling)) mergeContainers(next, root);
			self.setSelection(range);
			self._updatePath(range, true);
		}
	} else {
		originalRange = range.cloneRange();
		moveRangeBoundariesUpTree(range, root, root, root);
		cursorContainer = range.endContainer;
		cursorOffset = range.endOffset;
		if (cursorContainer instanceof Element) {
			nodeAfterCursor = cursorContainer.childNodes[cursorOffset];
			if (nodeAfterCursor && nodeAfterCursor.nodeName === "IMG") {
				event.preventDefault();
				detach(nodeAfterCursor);
				moveRangeBoundariesDownTree(range);
				afterDelete(self, range);
				return;
			}
		}
		self.setSelection(originalRange);
		setTimeout(() => {
			afterDelete(self);
		}, 0);
	}
};
var Tab = (self, event, range) => {
	const root = self._root;
	self._removeZWS();
	if (range.collapsed && rangeDoesStartAtBlockBoundary(range, root)) {
		let node = getStartBlockOfRange(range, root);
		let parent;
		while (parent = node.parentNode) {
			if (parent.nodeName === "UL" || parent.nodeName === "OL") {
				event.preventDefault();
				self.increaseListLevel(range);
				break;
			}
			node = parent;
		}
	}
};
var ShiftTab = (self, event, range) => {
	const root = self._root;
	self._removeZWS();
	if (range.collapsed && rangeDoesStartAtBlockBoundary(range, root)) {
		const node = range.startContainer;
		if (getNearest(node, root, "UL") || getNearest(node, root, "OL")) {
			event.preventDefault();
			self.decreaseListLevel(range);
		}
	}
};
var Space = (self, event, range) => {
	let node;
	const root = self._root;
	self._recordUndoState(range);
	self._getRangeAndRemoveBookmark(range);
	if (!range.collapsed) {
		deleteContentsOfRange(range, root);
		self._ensureBottomLine();
		self.setSelection(range);
		self._updatePath(range, true);
	} else if (rangeDoesEndAtBlockBoundary(range, root)) {
		const block = getStartBlockOfRange(range, root);
		if (block && block.nodeName !== "PRE") {
			const text = block.textContent?.trimEnd().replace(ZWS, "");
			if (text === "*" || text === "1.") {
				event.preventDefault();
				self.insertPlainText(" ", false);
				self._docWasChanged();
				self.saveUndoState(range);
				const walker = new TreeIterator(block, SHOW_TEXT);
				let textNode;
				while (textNode = walker.nextNode()) detach(textNode);
				if (text === "*") self.makeUnorderedList();
				else self.makeOrderedList();
				return;
			}
		}
	}
	node = range.endContainer;
	if (range.endOffset === getLength(node)) do
		if (node.nodeName === "A") {
			range.setStartAfter(node);
			break;
		}
	while (!node.nextSibling && (node = node.parentNode) && node !== root);
	if (self._config.addLinks) {
		const linkRange = range.cloneRange();
		moveRangeBoundariesDownTree(linkRange);
		const textNode = linkRange.startContainer;
		const offset = linkRange.startOffset;
		setTimeout(() => {
			linkifyText(self, textNode, offset);
		}, 0);
	}
	self.setSelection(range);
};
var _onKey = function(event) {
	if (event.defaultPrevented || event.isComposing) return;
	let key = event.key;
	let modifiers = "";
	const code = event.code;
	if (/^Digit\d$/.test(code)) key = code.slice(-1);
	if (key !== "Backspace" && key !== "Delete") {
		if (event.altKey) modifiers += "Alt-";
		if (event.ctrlKey) modifiers += "Ctrl-";
		if (event.metaKey) modifiers += "Meta-";
		if (event.shiftKey) modifiers += "Shift-";
	}
	if (isWin && event.shiftKey && key === "Delete") modifiers += "Shift-";
	key = modifiers + key;
	const range = this.getSelection();
	const handler = this._keyHandlers[key];
	if (handler) handler(this, event, range);
	else if (!range.collapsed && !event.ctrlKey && !event.metaKey && key.length === 1) {
		this.saveUndoState(range);
		deleteContentsOfRange(range, this._root);
		this._ensureBottomLine();
		this.setSelection(range);
		this._updatePath(range, true);
	}
};
var keyHandlers = {
	"Backspace": Backspace,
	"Delete": Delete,
	"Tab": Tab,
	"Shift-Tab": ShiftTab,
	" ": Space,
	"ArrowLeft"(self) {
		self._removeZWS();
	},
	"ArrowRight"(self, event, range) {
		self._removeZWS();
		const root = self.getRoot();
		if (rangeDoesEndAtBlockBoundary(range, root)) {
			moveRangeBoundariesDownTree(range);
			let node = range.endContainer;
			do
				if (node.nodeName === "CODE") {
					let next = node.nextSibling;
					if (!(next instanceof Text) || next.length === 0) {
						const textNode = document.createTextNode("\xA0");
						node.parentNode.insertBefore(textNode, next);
						next = textNode;
					}
					range.setStart(next, 1);
					self.setSelection(range);
					event.preventDefault();
					break;
				}
			while (!node.nextSibling && (node = node.parentNode) && node !== root);
		}
	}
};
if (!supportsInputEvents) {
	keyHandlers.Enter = Enter;
	keyHandlers["Shift-Enter"] = Enter;
}
if (!isMac && !isIOS) {
	keyHandlers.PageUp = (self) => {
		self.moveCursorToStart();
	};
	keyHandlers.PageDown = (self) => {
		self.moveCursorToEnd();
	};
}
var mapKeyToFormat = (tag, remove) => {
	remove = remove || null;
	return (self, event) => {
		event.preventDefault();
		const range = self.getSelection();
		if (self.hasFormat(tag, null, range)) self.changeFormat(null, { tag }, range);
		else self.changeFormat({ tag }, remove, range);
	};
};
keyHandlers[ctrlKey + "b"] = mapKeyToFormat("B");
keyHandlers[ctrlKey + "i"] = mapKeyToFormat("I");
keyHandlers[ctrlKey + "u"] = mapKeyToFormat("U");
keyHandlers[ctrlKey + "Shift-7"] = mapKeyToFormat("S");
keyHandlers[ctrlKey + "Shift-5"] = mapKeyToFormat("SUB", { tag: "SUP" });
keyHandlers[ctrlKey + "Shift-6"] = mapKeyToFormat("SUP", { tag: "SUB" });
keyHandlers[ctrlKey + "Shift-8"] = (self, event) => {
	event.preventDefault();
	const path = self.getPath();
	if (!/(?:^|>)UL/.test(path)) self.makeUnorderedList();
	else self.removeList();
};
keyHandlers[ctrlKey + "Shift-9"] = (self, event) => {
	event.preventDefault();
	const path = self.getPath();
	if (!/(?:^|>)OL/.test(path)) self.makeOrderedList();
	else self.removeList();
};
keyHandlers[ctrlKey + "["] = (self, event) => {
	event.preventDefault();
	const path = self.getPath();
	if (/(?:^|>)BLOCKQUOTE/.test(path) || !/(?:^|>)[OU]L/.test(path)) self.decreaseQuoteLevel();
	else self.decreaseListLevel();
};
keyHandlers[ctrlKey + "]"] = (self, event) => {
	event.preventDefault();
	const path = self.getPath();
	if (/(?:^|>)BLOCKQUOTE/.test(path) || !/(?:^|>)[OU]L/.test(path)) self.increaseQuoteLevel();
	else self.increaseListLevel();
};
keyHandlers[ctrlKey + "d"] = (self, event) => {
	event.preventDefault();
	self.toggleCode();
};
keyHandlers[ctrlKey + "z"] = (self, event) => {
	event.preventDefault();
	self.undo();
};
keyHandlers[ctrlKey + "y"] = keyHandlers[ctrlKey + "Shift-z"] = keyHandlers[ctrlKey + "Shift-Z"] = (self, event) => {
	event.preventDefault();
	self.redo();
};
var RESIZE_HANDLE_SIZE = 8;
var MIN_IMAGE_SIZE = 40;
var MAX_IMAGE_SIZE = 1200;
var handlePositions = [
	{
		pos: "nw",
		cursor: "nwse-resize"
	},
	{
		pos: "n",
		cursor: "ns-resize"
	},
	{
		pos: "ne",
		cursor: "nesw-resize"
	},
	{
		pos: "e",
		cursor: "ew-resize"
	},
	{
		pos: "se",
		cursor: "nwse-resize"
	},
	{
		pos: "s",
		cursor: "ns-resize"
	},
	{
		pos: "sw",
		cursor: "nesw-resize"
	},
	{
		pos: "w",
		cursor: "ew-resize"
	}
];
var keyHandlers2 = {
	ArrowUp: (editor, range, root) => {
		const block = getStartBlockOfRange(range, root);
		if (block) {
			const prev = getPreviousBlock(block, root);
			if (prev) {
				range.selectNodeContents(prev);
				range.collapse(false);
				editor.setSelection(range).focus();
			}
		}
	},
	ArrowDown: (editor, range, root) => {
		const block = getStartBlockOfRange(range, root);
		if (block) {
			const next = getNextBlock(block, root);
			if (next) {
				range.selectNodeContents(next);
				range.collapse(true);
				editor.setSelection(range).focus();
			}
		}
	},
	Delete: (editor, range) => {
		editor.replaceWithBlankLine(range);
	},
	Backspace: (editor, range) => {
		editor.replaceWithBlankLine(range);
	}
};
var ImageResizer = class {
	constructor(root, editor) {
		this._currentImage = null;
		this._resizeContainer = null;
		this._handles = null;
		this._currentHandle = null;
		this._startX = 0;
		this._startY = 0;
		this._startWidth = 0;
		this._startHeight = 0;
		this._maxWidth = MAX_IMAGE_SIZE;
		this._originalRatio = 1;
		this._editor = editor;
		this._root = root;
		document.addEventListener("click", this);
		editor.addEventListener("drop", this);
	}
	destroy() {
		this._deselectImage();
		this._editor.removeEventListener("drop", this);
		document.removeEventListener("click", this);
	}
	handleEvent(event) {
		switch (event.type) {
			case "click":
				this._onClick(event);
				break;
			case "pointerdown":
				this._onPointerDown(event);
				break;
			case "pointermove":
				this._onPointerMove(event);
				break;
			case "pointercancel":
			case "pointerup":
				this._onPointerUp(event);
				break;
			case "keydown":
				this._onKeyDown(event);
				break;
			case "drop": this._deselectImage();
		}
	}
	_onClick(event) {
		const target = event.target;
		if (target.nodeName === "IMG" && this._root.contains(target)) {
			event.stopPropagation();
			this._selectImage(target);
		} else if (this._currentImage && this._handles && !this._handles.some((handle) => handle.element === target)) this._deselectImage();
	}
	_deselectImage() {
		if (!this._currentImage) return;
		document.removeEventListener("keydown", this, true);
		if (this._currentHandle) this._onPointerUp({
			preventDefault() {},
			target: this._currentHandle.element
		});
		if (this._handles) this._handles.forEach(({ element }) => element.removeEventListener("pointerdown", this));
		if (this._resizeContainer) this._resizeContainer.remove();
		this._currentImage.removeAttribute("tabindex");
		this._handles = null;
		this._resizeContainer = null;
		this._currentImage = null;
	}
	_selectImage(image) {
		if (this._currentImage === image) return;
		this._deselectImage();
		this._root.blur();
		const handles = handlePositions.map(({ pos, cursor }) => {
			const offset = RESIZE_HANDLE_SIZE / 2;
			let positionStyle = "";
			switch (pos) {
				case "nw":
					positionStyle = `left: -${offset}px; top: -${offset}px;`;
					break;
				case "n":
					positionStyle = `left: calc(50% - ${offset}px); top: -${offset}px;`;
					break;
				case "ne":
					positionStyle = `right: -${offset}px; top: -${offset}px;`;
					break;
				case "e":
					positionStyle = `right: -${offset}px; top: calc(50% - ${offset}px);`;
					break;
				case "se":
					positionStyle = `right: -${offset}px; bottom: -${offset}px;`;
					break;
				case "s":
					positionStyle = `left: calc(50% - ${offset}px); bottom: -${offset}px;`;
					break;
				case "sw":
					positionStyle = `left: -${offset}px; bottom: -${offset}px;`;
					break;
				case "w": positionStyle = `left: -${offset}px; top: calc(50% - ${offset}px);`;
			}
			const handle = createElement("div", {
				class: `squire-resize-handle squire-resize-handle-${pos}`,
				style: `
                    position: absolute;
                    width: ${RESIZE_HANDLE_SIZE}px;
                    height: ${RESIZE_HANDLE_SIZE}px;
                    background: #0067b9;
                    border: 1px solid #fff;
                    cursor: ${cursor};
                    pointer-events: auto;
                    touch-action: none;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    ${positionStyle}
                `
			});
			handle.addEventListener("pointerdown", this);
			return {
				element: handle,
				cursor,
				position: pos
			};
		});
		const resizeContainer = createElement("div", {
			class: "squire-image-resize-container",
			style: "position: absolute; pointer-events: none; z-index: 1000;"
		}, handles.map((handle) => handle.element));
		this._currentImage = image;
		this._resizeContainer = resizeContainer;
		this._handles = handles;
		this._root.appendChild(this._resizeContainer);
		const naturalWidth = image.naturalWidth;
		this._originalRatio = naturalWidth / image.naturalHeight;
		this._maxWidth = Math.min(naturalWidth * 2, image.parentElement ? image.parentElement.offsetWidth : MAX_IMAGE_SIZE, MAX_IMAGE_SIZE);
		this._positionResizeContainer();
		image.tabIndex = -1;
		image.focus();
		document.addEventListener("keydown", this, true);
	}
	_positionResizeContainer() {
		const resizeContainer = this._resizeContainer;
		const root = this._root;
		const currentImage = this._currentImage;
		if (!resizeContainer || !currentImage) return;
		const rootRect = root.getBoundingClientRect();
		const imageRect = currentImage.getBoundingClientRect();
		const top = imageRect.top - rootRect.top + root.scrollTop;
		const left = imageRect.left - rootRect.left + root.scrollLeft;
		const width = imageRect.width;
		const height = imageRect.height;
		resizeContainer.style.top = top + "px";
		resizeContainer.style.left = left + "px";
		resizeContainer.style.width = width + "px";
		resizeContainer.style.height = height + "px";
	}
	_onPointerDown(event) {
		if (this._currentHandle || !this._handles) return;
		const target = event.target;
		const currentHandle = this._handles.find((h) => h.element === target) || null;
		if (!currentHandle) return;
		const currentImage = this._currentImage;
		if (!currentImage) return;
		event.preventDefault();
		event.stopPropagation();
		target.addEventListener("pointermove", this);
		target.addEventListener("pointerup", this);
		target.addEventListener("pointercancel", this);
		target.setPointerCapture(event.pointerId);
		this._currentHandle = currentHandle;
		this._startX = event.clientX;
		this._startY = event.clientY;
		const style = getComputedStyle(currentImage);
		this._startWidth = parseFloat(style.width);
		this._startHeight = parseFloat(style.height);
		document.body.style.cursor = currentHandle.cursor;
	}
	_onPointerMove(event) {
		event.preventDefault();
		const currentHandle = this._currentHandle;
		const currentImage = this._currentImage;
		if (!currentHandle || !currentImage) return;
		const deltaX = event.clientX - this._startX;
		const deltaY = event.clientY - this._startY;
		const maxWidth = this._maxWidth;
		const originalRatio = this._originalRatio;
		let newWidth = this._startWidth;
		let newHeight = this._startHeight;
		switch (currentHandle.position) {
			case "sw":
			case "nw":
			case "w":
				newWidth -= 2 * deltaX;
				break;
			case "se":
			case "ne":
			case "e":
				newWidth += 2 * deltaX;
				break;
			case "n":
				newHeight -= deltaY;
				newWidth = newHeight * originalRatio;
				break;
			case "s":
				newHeight += deltaY;
				newWidth = newHeight * originalRatio;
		}
		if (newWidth < MIN_IMAGE_SIZE) newWidth = MIN_IMAGE_SIZE;
		else if (newWidth > maxWidth) newWidth = maxWidth;
		const currentImageStyle = currentImage.style;
		currentImageStyle.width = newWidth + "px";
		currentImageStyle.height = "auto";
		this._positionResizeContainer();
	}
	_onPointerUp(event) {
		event.preventDefault();
		const target = event.target;
		if (target) {
			target.removeEventListener("pointermove", this);
			target.removeEventListener("pointerup", this);
			target.removeEventListener("pointercancel", this);
		}
		this._currentHandle = null;
		document.body.style.cursor = "";
	}
	_onKeyDown(event) {
		event.preventDefault();
		event.stopPropagation();
		const keyHandler = keyHandlers2[event.key];
		if (!keyHandler) return;
		const image = this._currentImage;
		if (!image) return;
		const editor = this._editor;
		const root = this._root;
		this._deselectImage();
		const range = editor.getSelection();
		range.selectNode(image);
		keyHandler(editor, range, root);
	}
};
var Squire = class {
	constructor(root, config) {
		/**
		* Subscribing to these events won't automatically add a listener to the
		* document node, since these events are fired in a custom manner by the
		* editor code.
		*/
		this.customEvents = /* @__PURE__ */ new Set([
			"pathChange",
			"select",
			"input",
			"pasteImage",
			"undoStateChange"
		]);
		this.startSelectionId = "squire-selection-start";
		this.endSelectionId = "squire-selection-end";
		this.linkRegExp = /\b(?:((?:(?:ht|f)tps?:\/\/|www\d{0,3}[.]|[a-z0-9][a-z0-9.\-]{0,252}[.][a-z]{2,}\/)(?:[^\s()<>]|\([^\s()<>]+\))+(?:[^\s?&`!()\[\]{};:'".,<>«»“”‘’]|\([^\s()<>]+\)))|([\w\-.%+]{1,64}@(?:[\w\-]+\.)+[a-z]{2,}\b(?:[?][^&?\s]+=[^\s?&`!()\[\]{};:'".,<>«»“”‘’]+(?:&[^&?\s]+=[^\s?&`!()\[\]{};:'".,<>«»“”‘’]+)*)?))/i;
		this.tagAfterSplit = {
			DT: "DD",
			DD: "DT",
			LI: "LI",
			PRE: "PRE"
		};
		this._root = root;
		this._config = this._makeConfig(config);
		this._isFocused = false;
		this._lastSelection = createRange(root, 0);
		this._willRestoreSelection = false;
		this._mayHaveZWS = false;
		this._lastAnchorNode = null;
		this._lastFocusNode = null;
		this._lastPathRange = null;
		this._path = "";
		this._events = /* @__PURE__ */ new Map();
		this._undoIndex = -1;
		this._undoStack = [];
		this._undoStackLength = 0;
		this._isInUndoState = false;
		this._ignoreChange = false;
		this._ignoreAllChanges = false;
		this.addEventListener("selectionchange", this._updatePathOnEvent);
		this.addEventListener("blur", this._enableRestoreSelection);
		this.addEventListener("mousedown", this._disableRestoreSelection);
		this.addEventListener("touchstart", this._disableRestoreSelection);
		this.addEventListener("focus", this._restoreSelection);
		this.addEventListener("blur", this._removeZWS);
		this._isShiftDown = false;
		this.addEventListener("cut", _onCut);
		this.addEventListener("copy", _onCopy);
		this.addEventListener("paste", _onPaste);
		this._dragRange = null;
		this.addEventListener("dragstart", _onDragStart);
		this.addEventListener("dragend", _onDragEnd);
		this.addEventListener("drop", _onDrop);
		this.addEventListener("keydown", _monitorShiftKey);
		this.addEventListener("keyup", _monitorShiftKey);
		this.addEventListener("keydown", _onKey);
		this._keyHandlers = Object.create(keyHandlers);
		const mutation = new MutationObserver(() => this._docWasChanged());
		mutation.observe(root, {
			childList: true,
			attributes: true,
			characterData: true,
			subtree: true
		});
		this._mutation = mutation;
		root.setAttribute("contenteditable", "true");
		this.addEventListener("beforeinput", this._beforeInput);
		this._imageResizer = new ImageResizer(root, this);
		this.setHTML("");
	}
	destroy() {
		this._events.forEach((_, type) => {
			this.removeEventListener(type);
		});
		this._mutation.disconnect();
		this._imageResizer.destroy();
		this._undoIndex = -1;
		this._undoStack = [];
		this._undoStackLength = 0;
	}
	_makeConfig(userConfig) {
		const config = {
			blockTag: "DIV",
			blockAttributes: null,
			tagAttributes: {},
			classNames: {
				color: "color",
				fontFamily: "font",
				fontSize: "size",
				highlight: "highlight"
			},
			undo: {
				documentSizeThreshold: -1,
				undoLimit: -1
			},
			addLinks: true,
			willCutCopy: null,
			toPlainText: null,
			sanitizeToDOMFragment: (html) => {
				const frag = DOMPurify.sanitize(html, {
					ALLOW_UNKNOWN_PROTOCOLS: true,
					WHOLE_DOCUMENT: false,
					RETURN_DOM: true,
					RETURN_DOM_FRAGMENT: true,
					FORCE_BODY: false
				});
				return frag ? document.importNode(frag, true) : document.createDocumentFragment();
			},
			didError: (error) => console.log(error)
		};
		if (userConfig) {
			Object.assign(config, userConfig);
			config.blockTag = config.blockTag.toUpperCase();
		}
		return config;
	}
	setKeyHandler(key, fn) {
		this._keyHandlers[key] = fn;
		return this;
	}
	_beforeInput(event) {
		switch (event.inputType) {
			case "insertLineBreak":
				event.preventDefault();
				this.splitBlock(true);
				break;
			case "insertParagraph":
				event.preventDefault();
				this.splitBlock(false);
				break;
			case "insertOrderedList":
				event.preventDefault();
				this.makeOrderedList();
				break;
			case "insertUnoderedList":
				event.preventDefault();
				this.makeUnorderedList();
				break;
			case "historyUndo":
				event.preventDefault();
				this.undo();
				break;
			case "historyRedo":
				event.preventDefault();
				this.redo();
				break;
			case "formatBold":
				event.preventDefault();
				this.bold();
				break;
			case "formatItalic":
				event.preventDefault();
				this.italic();
				break;
			case "formatUnderline":
				event.preventDefault();
				this.underline();
				break;
			case "formatStrikeThrough":
				event.preventDefault();
				this.strikethrough();
				break;
			case "formatSuperscript":
				event.preventDefault();
				this.superscript();
				break;
			case "formatSubscript":
				event.preventDefault();
				this.subscript();
				break;
			case "formatJustifyFull":
			case "formatJustifyCenter":
			case "formatJustifyRight":
			case "formatJustifyLeft": {
				event.preventDefault();
				let alignment = event.inputType.slice(13).toLowerCase();
				if (alignment === "full") alignment = "justify";
				this.setTextAlignment(alignment);
				break;
			}
			case "formatRemove":
				event.preventDefault();
				this.removeAllFormatting();
				break;
			case "formatSetBlockTextDirection": {
				event.preventDefault();
				let dir = event.data;
				if (dir === "null") dir = null;
				this.setTextDirection(dir);
				break;
			}
			case "formatBackColor":
				event.preventDefault();
				this.setHighlightColor(event.data);
				break;
			case "formatFontColor":
				event.preventDefault();
				this.setTextColor(event.data);
				break;
			case "formatFontName":
				event.preventDefault();
				this.setFontFace(event.data);
		}
	}
	handleEvent(event) {
		this.fireEvent(event.type, event);
	}
	fireEvent(type, detail) {
		let handlers = this._events.get(type);
		if (/^(?:focus|blur)/.test(type)) {
			const isFocused = this._root === document.activeElement;
			if (type === "focus") {
				if (!isFocused || this._isFocused) return this;
				this._isFocused = true;
			} else {
				if (isFocused || !this._isFocused) return this;
				this._isFocused = false;
			}
		}
		if (handlers) {
			const event = detail instanceof Event ? detail : new CustomEvent(type, { detail });
			handlers = handlers.slice();
			for (const handler of handlers) try {
				if ("handleEvent" in handler) handler.handleEvent(event);
				else handler.call(this, event);
			} catch (error) {
				this._config.didError(error);
			}
		}
		return this;
	}
	addEventListener(type, fn) {
		let handlers = this._events.get(type);
		let target = this._root;
		if (!handlers) {
			handlers = [];
			this._events.set(type, handlers);
			if (!this.customEvents.has(type)) {
				if (type === "selectionchange") target = document;
				target.addEventListener(type, this, true);
			}
		}
		handlers.push(fn);
		return this;
	}
	removeEventListener(type, fn) {
		const handlers = this._events.get(type);
		let target = this._root;
		if (handlers) {
			if (fn) {
				let l = handlers.length;
				while (l--) if (handlers[l] === fn) handlers.splice(l, 1);
			} else handlers.length = 0;
			if (!handlers.length) {
				this._events.delete(type);
				if (!this.customEvents.has(type)) {
					if (type === "selectionchange") target = document;
					target.removeEventListener(type, this, true);
				}
			}
		}
		return this;
	}
	focus() {
		this._root.focus({ preventScroll: true });
		return this;
	}
	blur() {
		this._root.blur();
		return this;
	}
	_enableRestoreSelection() {
		this._willRestoreSelection = true;
	}
	_disableRestoreSelection() {
		this._willRestoreSelection = false;
	}
	_restoreSelection() {
		if (this._willRestoreSelection) this.setSelection(this._lastSelection);
	}
	_removeZWS() {
		if (!this._mayHaveZWS) return;
		removeZWS(this._root);
		this._mayHaveZWS = false;
	}
	_saveRangeToBookmark(range) {
		let startNode = createElement("INPUT", {
			id: this.startSelectionId,
			type: "hidden"
		});
		let endNode = createElement("INPUT", {
			id: this.endSelectionId,
			type: "hidden"
		});
		let temp;
		insertNodeInRange(range, startNode);
		range.collapse(false);
		insertNodeInRange(range, endNode);
		if (startNode.compareDocumentPosition(endNode) & Node.DOCUMENT_POSITION_PRECEDING) {
			startNode.id = this.endSelectionId;
			endNode.id = this.startSelectionId;
			temp = startNode;
			startNode = endNode;
			endNode = temp;
		}
		range.setStartAfter(startNode);
		range.setEndBefore(endNode);
	}
	_getRangeAndRemoveBookmark(range) {
		const root = this._root;
		const starts = root.querySelectorAll("#" + this.startSelectionId);
		const ends = root.querySelectorAll("#" + this.endSelectionId);
		const start = starts[0];
		const end = ends[0];
		if (start && end && !!(start.compareDocumentPosition(end) & Node.DOCUMENT_POSITION_FOLLOWING)) {
			let startContainer = start.parentNode;
			let endContainer = end.parentNode;
			const startOffset = Array.from(startContainer.childNodes).indexOf(start);
			let endOffset = Array.from(endContainer.childNodes).indexOf(end);
			if (startContainer === endContainer) endOffset -= 1;
			start.remove();
			end.remove();
			if (!range) range = document.createRange();
			range.setStart(startContainer, startOffset);
			range.setEnd(endContainer, endOffset);
			mergeInlines(startContainer, range);
			if (startContainer !== endContainer) mergeInlines(endContainer, range);
			if (range.collapsed) {
				startContainer = range.startContainer;
				if (startContainer instanceof Text) {
					endContainer = startContainer.childNodes[range.startOffset];
					if (!endContainer || !(endContainer instanceof Text)) endContainer = startContainer.childNodes[range.startOffset - 1];
					if (endContainer && endContainer instanceof Text) {
						range.setStart(endContainer, 0);
						range.collapse(true);
					}
				}
			}
		}
		for (let i = 0; i < starts.length; i += 1) starts[i].remove();
		for (let i = 0; i < ends.length; i += 1) ends[i].remove();
		return range || null;
	}
	getSelection() {
		const selection = window.getSelection();
		const root = this._root;
		let range = null;
		if (this._isFocused && selection && selection.rangeCount) {
			range = selection.getRangeAt(0).cloneRange();
			const startContainer = range.startContainer;
			const endContainer = range.endContainer;
			if (startContainer && isLeaf(startContainer)) range.setStartBefore(startContainer);
			if (endContainer && isLeaf(endContainer)) range.setEndBefore(endContainer);
		}
		if (range && root.contains(range.commonAncestorContainer)) this._lastSelection = range;
		else {
			range = this._lastSelection;
			if (!document.contains(range.commonAncestorContainer)) range = null;
		}
		if (!range) range = createRange(root.firstElementChild || root, 0);
		return range;
	}
	setSelection(range) {
		this._lastSelection = range;
		if (!this._isFocused) this._enableRestoreSelection();
		else {
			const selection = window.getSelection();
			if (selection) {
				if ("setBaseAndExtent" in Selection.prototype) selection.setBaseAndExtent(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
				else {
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}
		}
		return this;
	}
	_moveCursorTo(toStart) {
		const root = this._root;
		const range = createRange(root, toStart ? 0 : root.childNodes.length);
		moveRangeBoundariesDownTree(range);
		this.setSelection(range);
		return this;
	}
	moveCursorToStart() {
		return this._moveCursorTo(true);
	}
	moveCursorToEnd() {
		return this._moveCursorTo(false);
	}
	getCursorPosition() {
		const range = this.getSelection();
		let rect = range.getBoundingClientRect();
		if (rect && !rect.top) {
			this._ignoreChange = true;
			const node = createElement("SPAN");
			node.textContent = ZWS;
			insertNodeInRange(range, node);
			rect = node.getBoundingClientRect();
			const parent = node.parentNode;
			parent.removeChild(node);
			mergeInlines(parent, range);
		}
		return rect;
	}
	getPath() {
		return this._path;
	}
	_updatePathOnEvent() {
		if (this._isFocused) {
			const lastPathRange = this._lastPathRange;
			const selection = this.getSelection();
			if (!lastPathRange || !lastPathRange.commonAncestorContainer.isConnected || selection.compareBoundaryPoints(0, lastPathRange) !== 0 || selection.compareBoundaryPoints(2, lastPathRange) !== 0) this._updatePath(selection);
		}
	}
	_updatePath(range, force) {
		this._lastPathRange = range.cloneRange();
		const anchor = range.startContainer;
		const focus = range.endContainer;
		let newPath;
		if (force || anchor !== this._lastAnchorNode || focus !== this._lastFocusNode) {
			this._lastAnchorNode = anchor;
			this._lastFocusNode = focus;
			newPath = anchor && focus ? anchor === focus ? this._getPath(focus) : "(selection)" : "";
			if (this._path !== newPath || anchor !== focus) {
				this._path = newPath;
				this.fireEvent("pathChange", { path: newPath });
			}
		}
		this.fireEvent(range.collapsed ? "cursor" : "select", { range });
	}
	_getPath(node) {
		const root = this._root;
		const config = this._config;
		let path = "";
		if (node && node !== root) {
			const parent = node.parentNode;
			path = parent ? this._getPath(parent) : "";
			if (node instanceof HTMLElement) {
				const id = node.id;
				const classList = node.classList;
				const classNames = Array.from(classList).sort();
				const dir = node.dir;
				const styleNames = config.classNames;
				path += (path ? ">" : "") + node.nodeName;
				if (id) path += "#" + id;
				if (classNames.length) {
					path += ".";
					path += classNames.join(".");
				}
				if (dir) path += "[dir=" + dir + "]";
				if (classList.contains(styleNames.highlight)) path += "[backgroundColor=" + node.style.backgroundColor.replace(/ /g, "") + "]";
				if (classList.contains(styleNames.color)) path += "[color=" + node.style.color.replace(/ /g, "") + "]";
				if (classList.contains(styleNames.fontFamily)) path += "[fontFamily=" + node.style.fontFamily.replace(/ /g, "") + "]";
				if (classList.contains(styleNames.fontSize)) path += "[fontSize=" + node.style.fontSize + "]";
			}
		}
		return path;
	}
	modifyDocument(modificationFn) {
		const mutation = this._mutation;
		if (mutation) {
			if (mutation.takeRecords().length) this._docWasChanged();
			mutation.disconnect();
		}
		this._ignoreAllChanges = true;
		modificationFn();
		this._ignoreAllChanges = false;
		if (mutation) {
			mutation.observe(this._root, {
				childList: true,
				attributes: true,
				characterData: true,
				subtree: true
			});
			this._ignoreChange = false;
		}
		return this;
	}
	_docWasChanged() {
		resetNodeCategoryCache();
		this._mayHaveZWS = true;
		if (this._ignoreAllChanges) return;
		if (this._ignoreChange) {
			this._ignoreChange = false;
			return;
		}
		if (this._isInUndoState) {
			this._isInUndoState = false;
			this.fireEvent("undoStateChange", {
				canUndo: true,
				canRedo: false
			});
		}
		this.fireEvent("input");
	}
	/**
	* Leaves bookmark.
	*/
	_recordUndoState(range, replace) {
		const isInUndoState = this._isInUndoState;
		if (!isInUndoState || replace) {
			let undoIndex = this._undoIndex + 1;
			const undoStack = this._undoStack;
			const undoConfig = this._config.undo;
			const undoThreshold = undoConfig.documentSizeThreshold;
			const undoLimit = undoConfig.undoLimit;
			if (undoIndex < this._undoStackLength) undoStack.length = this._undoStackLength = undoIndex;
			if (range) this._saveRangeToBookmark(range);
			if (isInUndoState) return this;
			const html = this._getRawHTML();
			if (replace) undoIndex -= 1;
			if (undoThreshold > -1 && html.length * 2 > undoThreshold) {
				if (undoLimit > -1 && undoIndex > undoLimit) {
					undoStack.splice(0, undoIndex - undoLimit);
					undoIndex = undoLimit;
					this._undoStackLength = undoLimit;
				}
			}
			undoStack[undoIndex] = html;
			this._undoIndex = undoIndex;
			this._undoStackLength += 1;
			this._isInUndoState = true;
		}
		return this;
	}
	saveUndoState(range) {
		let rangeIsFromSelection = false;
		if (!range) {
			range = this.getSelection();
			rangeIsFromSelection = true;
		}
		this._recordUndoState(range, this._isInUndoState);
		this._getRangeAndRemoveBookmark(range);
		if (rangeIsFromSelection) this.setSelection(range);
		return this;
	}
	undo() {
		if (this._undoIndex !== 0 || !this._isInUndoState) {
			this._recordUndoState(this.getSelection(), false);
			this._undoIndex -= 1;
			this._setRawHTML(this._undoStack[this._undoIndex]);
			const range = this._getRangeAndRemoveBookmark();
			if (range) this.setSelection(range);
			this._isInUndoState = true;
			this.fireEvent("undoStateChange", {
				canUndo: this._undoIndex !== 0,
				canRedo: true
			});
			this.fireEvent("input");
		}
		return this.focus();
	}
	redo() {
		const undoIndex = this._undoIndex;
		const undoStackLength = this._undoStackLength;
		if (undoIndex + 1 < undoStackLength && this._isInUndoState) {
			this._undoIndex += 1;
			this._setRawHTML(this._undoStack[this._undoIndex]);
			const range = this._getRangeAndRemoveBookmark();
			if (range) this.setSelection(range);
			this.fireEvent("undoStateChange", {
				canUndo: true,
				canRedo: undoIndex + 2 < undoStackLength
			});
			this.fireEvent("input");
		}
		return this.focus();
	}
	getRoot() {
		return this._root;
	}
	_getRawHTML() {
		return this._root.innerHTML;
	}
	_setRawHTML(html) {
		const root = this._root;
		root.innerHTML = html;
		let node = root;
		const child = node.firstChild;
		if (!child || child.nodeName === "BR") {
			const block = this.createDefaultBlock();
			if (child) node.replaceChild(block, child);
			else node.appendChild(block);
		} else while (node = getNextBlock(node, root)) fixCursor(node);
		this._ignoreChange = true;
		return this;
	}
	getHTML(withBookmark) {
		let range;
		let html = "";
		this.modifyDocument(() => {
			if (withBookmark) {
				range = this.getSelection();
				this._saveRangeToBookmark(range);
			}
			const resizeContainer = this._root.querySelector(".squire-image-resize-container");
			if (resizeContainer) resizeContainer.remove();
			html = this._getRawHTML().replace(/\u200B/g, "");
			if (resizeContainer) this._root.appendChild(resizeContainer);
			if (withBookmark) this._getRangeAndRemoveBookmark(range);
		});
		return html;
	}
	setHTML(html) {
		const frag = this._config.sanitizeToDOMFragment(html, this);
		const root = this._root;
		cleanTree(frag, this._config);
		cleanupBRs(frag, root, false);
		fixContainer(frag, root);
		let node = frag;
		let child = node.firstChild;
		if (!child || child.nodeName === "BR") {
			const block = this.createDefaultBlock();
			if (child) node.replaceChild(block, child);
			else node.appendChild(block);
		} else while (node = getNextBlock(node, root)) fixCursor(node);
		this._ignoreChange = true;
		while (child = root.lastChild) root.removeChild(child);
		root.appendChild(frag);
		this._undoIndex = -1;
		this._undoStack.length = 0;
		this._undoStackLength = 0;
		this._isInUndoState = false;
		const range = this._getRangeAndRemoveBookmark() || createRange(root.firstElementChild || root, 0);
		this.saveUndoState(range);
		this.setSelection(range);
		this._updatePath(range, true);
		return this;
	}
	/**
	* Insert HTML at the cursor location. If the selection is not collapsed
	* insertTreeFragmentIntoRange will delete the selection so that it is
	* replaced by the html being inserted.
	*/
	insertHTML(html, isPaste) {
		const config = this._config;
		let frag = config.sanitizeToDOMFragment(html, this);
		const range = this.getSelection();
		this.saveUndoState(range);
		try {
			const root = this._root;
			if (config.addLinks) this.addDetectedLinks(frag, frag);
			cleanTree(frag, this._config);
			cleanupBRs(frag, root, false);
			removeEmptyInlines(frag);
			frag.normalize();
			let node = frag;
			while (node = getNextBlock(node, frag)) fixCursor(node);
			let doInsert = true;
			if (isPaste) {
				const event = new CustomEvent("willPaste", {
					cancelable: true,
					detail: {
						html,
						fragment: frag
					}
				});
				this.fireEvent("willPaste", event);
				frag = event.detail.fragment;
				doInsert = !event.defaultPrevented;
			}
			if (doInsert) {
				insertTreeFragmentIntoRange(range, frag, root);
				range.collapse(false);
				moveRangeBoundaryOutOf(range, "A", root);
				this._ensureBottomLine();
			}
			this.setSelection(range);
			this._updatePath(range, true);
			if (isPaste) this.focus();
		} catch (error) {
			this._config.didError(error);
		}
		return this;
	}
	insertElement(el, range) {
		if (!range) range = this.getSelection();
		range.collapse(true);
		if (isInline(el)) {
			insertNodeInRange(range, el);
			range.setStartAfter(el);
		} else {
			const root = this._root;
			const startNode = getStartBlockOfRange(range, root);
			let splitNode = startNode || root;
			let nodeAfterSplit = null;
			while (splitNode !== root && !splitNode.nextSibling) splitNode = splitNode.parentNode;
			if (splitNode !== root) {
				const parent = splitNode.parentNode;
				nodeAfterSplit = split(parent, splitNode.nextSibling, root, root);
			}
			if (startNode && isEmptyBlock(startNode)) detach(startNode);
			root.insertBefore(el, nodeAfterSplit);
			const blankLine = this.createDefaultBlock();
			root.insertBefore(blankLine, nodeAfterSplit);
			range.setStart(blankLine, 0);
			range.setEnd(blankLine, 0);
			moveRangeBoundariesDownTree(range);
		}
		this.focus();
		this.setSelection(range);
		this._updatePath(range);
		return this;
	}
	insertImage(src, attributes) {
		const img = createElement("IMG", Object.assign({ src }, attributes));
		this.insertElement(img);
		return img;
	}
	insertPlainText(plainText, isPaste) {
		const range = this.getSelection();
		if (range.collapsed && getNearest(range.startContainer, this._root, "PRE")) {
			let doInsert = true;
			if (isPaste) {
				const event = new CustomEvent("willPaste", {
					cancelable: true,
					detail: { text: plainText }
				});
				this.fireEvent("willPaste", event);
				plainText = event.detail.text;
				doInsert = !event.defaultPrevented;
			}
			if (doInsert) {
				this.saveUndoState(range);
				const startContainer = range.startContainer;
				let offset = range.startOffset;
				let textNode;
				if (startContainer instanceof Text) textNode = startContainer;
				else {
					let nodeBeforeCursor = offset ? startContainer.childNodes[offset - 1] : null;
					if (nodeBeforeCursor instanceof Text) {
						textNode = nodeBeforeCursor;
						offset = textNode.length;
					} else {
						const text = document.createTextNode("");
						startContainer.insertBefore(text, startContainer.childNodes[offset]);
						textNode = text;
						offset = 0;
					}
				}
				textNode.insertData(offset, plainText);
				range.setStart(textNode, offset + plainText.length);
				range.collapse(true);
			}
			this.setSelection(range);
			return this;
		}
		const lines = plainText.split("\n");
		const config = this._config;
		const tag = config.blockTag;
		const attributes = config.blockAttributes;
		const closeBlock = "</" + tag + ">";
		let openBlock = "<" + tag;
		for (const attr in attributes) openBlock += " " + attr + "=\"" + escapeHTML(attributes[attr]) + "\"";
		openBlock += ">";
		for (let i = 0, l = lines.length; i < l; i += 1) {
			let line = lines[i];
			line = escapeHTML(line).replace(/ (?=(?: |$))/g, "&nbsp;");
			if (i) line = openBlock + (line || "<BR>") + closeBlock;
			lines[i] = line;
		}
		return this.insertHTML(lines.join(""), isPaste);
	}
	getSelectedText(range) {
		return getTextContentsOfRange(range || this.getSelection());
	}
	/**
	* Extracts the font-family and font-size (if any) of the element
	* holding the cursor. If there's a selection, returns an empty object.
	*/
	getFontInfo(range) {
		const fontInfo = {
			color: void 0,
			backgroundColor: void 0,
			fontFamily: void 0,
			fontSize: void 0
		};
		if (!range) range = this.getSelection();
		moveRangeBoundariesDownTree(range);
		let seenAttributes = 0;
		let element = range.commonAncestorContainer;
		if (range.collapsed || element instanceof Text) {
			if (element instanceof Text) element = element.parentNode;
			while (seenAttributes < 4 && element) {
				const style = element.style;
				if (style) {
					const color = style.color;
					if (!fontInfo.color && color) {
						fontInfo.color = color;
						seenAttributes += 1;
					}
					const backgroundColor = style.backgroundColor;
					if (!fontInfo.backgroundColor && backgroundColor) {
						fontInfo.backgroundColor = backgroundColor;
						seenAttributes += 1;
					}
					const fontFamily = style.fontFamily;
					if (!fontInfo.fontFamily && fontFamily) {
						fontInfo.fontFamily = fontFamily;
						seenAttributes += 1;
					}
					const fontSize = style.fontSize;
					if (!fontInfo.fontSize && fontSize) {
						fontInfo.fontSize = fontSize;
						seenAttributes += 1;
					}
				}
				element = element.parentNode;
			}
		}
		return fontInfo;
	}
	/**
	* Looks for matching tag and attributes, so won't work if <strong>
	* instead of <b> etc.
	*/
	hasFormat(tag, attributes, range) {
		tag = tag.toUpperCase();
		if (!attributes) attributes = {};
		if (!range) range = this.getSelection();
		if (!range.collapsed && range.startContainer instanceof Text && range.startOffset === range.startContainer.length && range.startContainer.nextSibling) range.setStartBefore(range.startContainer.nextSibling);
		if (!range.collapsed && range.endContainer instanceof Text && range.endOffset === 0 && range.endContainer.previousSibling) range.setEndAfter(range.endContainer.previousSibling);
		const root = this._root;
		const common = range.commonAncestorContainer;
		if (getNearest(common, root, tag, attributes)) return true;
		if (common instanceof Text) return false;
		const walker = new TreeIterator(common, SHOW_TEXT, (node2) => {
			return isNodeContainedInRange(range, node2, true);
		});
		let seenNode = false;
		let node;
		while (node = walker.nextNode()) {
			if (!getNearest(node, root, tag, attributes)) return false;
			seenNode = true;
		}
		return seenNode;
	}
	changeFormat(add, remove, range, partial) {
		if (!range) range = this.getSelection();
		this.saveUndoState(range);
		if (remove) range = this._removeFormat(remove.tag.toUpperCase(), remove.attributes || {}, range, partial);
		if (add) range = this._addFormat(add.tag.toUpperCase(), add.attributes || {}, range);
		this.setSelection(range);
		this._updatePath(range, true);
		return this.focus();
	}
	_addFormat(tag, attributes, range) {
		const root = this._root;
		if (range.collapsed) {
			const el = fixCursor(createElement(tag, attributes));
			insertNodeInRange(range, el);
			const focusNode = el.firstChild || el;
			const focusOffset = focusNode instanceof Text ? focusNode.length : 0;
			range.setStart(focusNode, focusOffset);
			range.collapse(true);
			let block = el;
			while (isInline(block)) block = block.parentNode;
			removeZWS(block, el);
		} else {
			const walker = new TreeIterator(range.commonAncestorContainer, SHOW_ELEMENT_OR_TEXT, (node) => {
				return (node instanceof Text || node.nodeName === "BR" || node.nodeName === "IMG") && isNodeContainedInRange(range, node, true);
			});
			let { startContainer, startOffset, endContainer, endOffset } = range;
			walker.currentNode = startContainer;
			if (!(startContainer instanceof Element) && !(startContainer instanceof Text) || !walker.filter(startContainer)) {
				const next = walker.nextNode();
				if (!next) return range;
				startContainer = next;
				startOffset = 0;
			}
			do {
				let node = walker.currentNode;
				if (!getNearest(node, root, tag, attributes)) {
					if (node === endContainer && node.length > endOffset) node.splitText(endOffset);
					if (node === startContainer && startOffset) {
						node = node.splitText(startOffset);
						if (endContainer === startContainer) {
							endContainer = node;
							endOffset -= startOffset;
						} else if (endContainer === startContainer.parentNode) endOffset += 1;
						startContainer = node;
						startOffset = 0;
					}
					const el = createElement(tag, attributes);
					replaceWith(node, el);
					el.appendChild(node);
				}
			} while (walker.nextNode());
			range = createRange(startContainer, startOffset, endContainer, endOffset);
		}
		return range;
	}
	_removeFormat(tag, attributes, range, partial) {
		this._saveRangeToBookmark(range);
		let fixer;
		if (range.collapsed) {
			if (cantFocusEmptyTextNodes) fixer = document.createTextNode(ZWS);
			else fixer = document.createTextNode("");
			insertNodeInRange(range, fixer);
		}
		let root = range.commonAncestorContainer;
		while (isInline(root)) root = root.parentNode;
		const startContainer = range.startContainer;
		const startOffset = range.startOffset;
		const endContainer = range.endContainer;
		const endOffset = range.endOffset;
		const toWrap = [];
		const examineNode = (node, exemplar) => {
			if (isNodeContainedInRange(range, node, false)) return;
			let child;
			let next;
			if (!isNodeContainedInRange(range, node, true)) {
				if (!(node instanceof HTMLInputElement) && (!(node instanceof Text) || node.data)) toWrap.push([exemplar, node]);
				return;
			}
			if (node instanceof Text) {
				if (node === endContainer && endOffset !== node.length) toWrap.push([exemplar, node.splitText(endOffset)]);
				if (node === startContainer && startOffset) {
					node.splitText(startOffset);
					toWrap.push([exemplar, node]);
				}
			} else for (child = node.firstChild; child; child = next) {
				next = child.nextSibling;
				examineNode(child, exemplar);
			}
		};
		const formatTags = Array.from(root.getElementsByTagName(tag)).filter((el) => {
			return isNodeContainedInRange(range, el, true) && hasTagAttributes(el, tag, attributes);
		});
		if (!partial) formatTags.forEach((node) => {
			examineNode(node, node);
		});
		toWrap.forEach(([el, node]) => {
			el = el.cloneNode(false);
			replaceWith(node, el);
			el.appendChild(node);
		});
		formatTags.forEach((el) => {
			replaceWith(el, empty(el));
		});
		if (cantFocusEmptyTextNodes && fixer) {
			fixer = fixer.parentNode;
			let block = fixer;
			while (block && isInline(block)) block = block.parentNode;
			if (block) removeZWS(block, fixer);
		}
		this._getRangeAndRemoveBookmark(range);
		if (fixer) range.collapse(false);
		mergeInlines(root, range);
		return range;
	}
	bold() {
		return this.changeFormat({ tag: "B" });
	}
	removeBold() {
		return this.changeFormat(null, { tag: "B" });
	}
	italic() {
		return this.changeFormat({ tag: "I" });
	}
	removeItalic() {
		return this.changeFormat(null, { tag: "I" });
	}
	underline() {
		return this.changeFormat({ tag: "U" });
	}
	removeUnderline() {
		return this.changeFormat(null, { tag: "U" });
	}
	strikethrough() {
		return this.changeFormat({ tag: "S" });
	}
	removeStrikethrough() {
		return this.changeFormat(null, { tag: "S" });
	}
	subscript() {
		return this.changeFormat({ tag: "SUB" }, { tag: "SUP" });
	}
	removeSubscript() {
		return this.changeFormat(null, { tag: "SUB" });
	}
	superscript() {
		return this.changeFormat({ tag: "SUP" }, { tag: "SUB" });
	}
	removeSuperscript() {
		return this.changeFormat(null, { tag: "SUP" });
	}
	makeLink(url, attributes) {
		const range = this.getSelection();
		if (range.collapsed) {
			let protocolEnd = url.indexOf(":") + 1;
			if (protocolEnd) while (url[protocolEnd] === "/") protocolEnd += 1;
			insertNodeInRange(range, document.createTextNode(url.slice(protocolEnd)));
		}
		attributes = Object.assign({ href: url }, this._config.tagAttributes.a, attributes);
		return this.changeFormat({
			tag: "A",
			attributes
		}, { tag: "A" }, range);
	}
	removeLink() {
		return this.changeFormat(null, { tag: "A" }, this.getSelection(), true);
	}
	addDetectedLinks(searchInNode, root) {
		const walker = new TreeIterator(searchInNode, SHOW_TEXT, (node2) => !getNearest(node2, root || this._root, "A"));
		const linkRegExp = this.linkRegExp;
		const defaultAttributes = this._config.tagAttributes.a;
		let node;
		while (node = walker.nextNode()) {
			const parent = node.parentNode;
			let data = node.data;
			let match;
			while (match = linkRegExp.exec(data)) {
				const index = match.index;
				const endIndex = index + match[0].length;
				if (index) parent.insertBefore(document.createTextNode(data.slice(0, index)), node);
				const child = createElement("A", Object.assign({ href: match[1] ? /^(?:ht|f)tps?:/i.test(match[1]) ? match[1] : "http://" + match[1] : "mailto:" + match[0] }, defaultAttributes));
				child.textContent = data.slice(index, endIndex);
				parent.insertBefore(child, node);
				node.data = data = data.slice(endIndex);
			}
		}
		return this;
	}
	setFontFace(name) {
		const className = this._config.classNames.fontFamily;
		return this.changeFormat(name ? {
			tag: "SPAN",
			attributes: {
				class: className,
				style: "font-family: " + name + ", sans-serif;"
			}
		} : null, {
			tag: "SPAN",
			attributes: { class: className }
		});
	}
	setFontSize(size) {
		const className = this._config.classNames.fontSize;
		return this.changeFormat(size ? {
			tag: "SPAN",
			attributes: {
				class: className,
				style: "font-size: " + (typeof size === "number" ? size + "px" : size)
			}
		} : null, {
			tag: "SPAN",
			attributes: { class: className }
		});
	}
	setTextColor(color) {
		const className = this._config.classNames.color;
		return this.changeFormat(color ? {
			tag: "SPAN",
			attributes: {
				class: className,
				style: "color:" + color
			}
		} : null, {
			tag: "SPAN",
			attributes: { class: className }
		});
	}
	setHighlightColor(color) {
		const className = this._config.classNames.highlight;
		return this.changeFormat(color ? {
			tag: "SPAN",
			attributes: {
				class: className,
				style: "background-color:" + color
			}
		} : null, {
			tag: "SPAN",
			attributes: { class: className }
		});
	}
	_ensureBottomLine() {
		const root = this._root;
		let last = root;
		do
			last = last.lastElementChild;
		while (last && isContainer(last));
		if (!last || !isBlock(last)) root.appendChild(this.createDefaultBlock());
	}
	createDefaultBlock(children) {
		const config = this._config;
		return fixCursor(createElement(config.blockTag, config.blockAttributes, children));
	}
	splitBlock(lineBreakOnly, range) {
		if (!range) range = this.getSelection();
		const root = this._root;
		let block;
		let parent;
		let node;
		let nodeAfterSplit;
		this._recordUndoState(range);
		this._removeZWS();
		this._getRangeAndRemoveBookmark(range);
		if (!range.collapsed) deleteContentsOfRange(range, root);
		if (this._config.addLinks) {
			moveRangeBoundariesDownTree(range);
			const textNode = range.startContainer;
			const offset2 = range.startOffset;
			setTimeout(() => {
				linkifyText(this, textNode, offset2);
			}, 0);
		}
		block = getStartBlockOfRange(range, root);
		if (block && (parent = getNearest(block, root, "PRE"))) {
			moveRangeBoundariesDownTree(range);
			node = range.startContainer;
			let offset2 = range.startOffset;
			if (!(node instanceof Text)) {
				node = document.createTextNode("");
				parent.insertBefore(node, parent.firstChild);
				offset2 = 0;
			}
			if (!lineBreakOnly && node instanceof Text && (node.data.charAt(offset2 - 1) === "\n" || rangeDoesStartAtBlockBoundary(range, root)) && (node.data.charAt(offset2) === "\n" || rangeDoesEndAtBlockBoundary(range, root))) {
				node.deleteData(offset2 && offset2 - 1, offset2 ? 2 : 1);
				nodeAfterSplit = split(node, offset2 && offset2 - 1, root, root);
				node = nodeAfterSplit.previousSibling;
				if (!node.textContent) detach(node);
				node = this.createDefaultBlock();
				nodeAfterSplit.parentNode.insertBefore(node, nodeAfterSplit);
				if (!nodeAfterSplit.textContent) detach(nodeAfterSplit);
				range.setStart(node, 0);
			} else {
				node.insertData(offset2, "\n");
				if (!node.nextSibling) parent.appendChild(createElement("BR"));
				if (node.length === offset2 + 1) range.setStartAfter(node);
				else range.setStart(node, offset2 + 1);
			}
			range.collapse(true);
			this.setSelection(range);
			this._updatePath(range, true);
			this._docWasChanged();
			return this;
		}
		if (!block || lineBreakOnly || /^T[HD]$/.test(block.nodeName)) {
			moveRangeBoundaryOutOf(range, "A", root);
			insertNodeInRange(range, createElement("BR"));
			range.collapse(false);
			this.setSelection(range);
			this._updatePath(range, true);
			return this;
		}
		if (parent = getNearest(block, root, "LI")) block = parent;
		if (isEmptyBlock(block)) {
			if (getNearest(block, root, "UL") || getNearest(block, root, "OL")) {
				this.decreaseListLevel(range);
				return this;
			} else if (getNearest(block, root, "BLOCKQUOTE")) {
				this.replaceWithBlankLine(range);
				return this;
			}
		}
		node = range.startContainer;
		const offset = range.startOffset;
		let splitTag = this.tagAfterSplit[block.nodeName];
		nodeAfterSplit = split(node, offset, block.parentNode, this._root);
		const config = this._config;
		let splitProperties = null;
		if (!splitTag) {
			splitTag = config.blockTag;
			splitProperties = config.blockAttributes;
		}
		if (!hasTagAttributes(nodeAfterSplit, splitTag, splitProperties)) {
			block = createElement(splitTag, splitProperties);
			if (nodeAfterSplit.dir) block.dir = nodeAfterSplit.dir;
			replaceWith(nodeAfterSplit, block);
			block.appendChild(empty(nodeAfterSplit));
			nodeAfterSplit = block;
		}
		removeZWS(block);
		removeEmptyInlines(block);
		fixCursor(block);
		while (nodeAfterSplit instanceof Element) {
			let child = nodeAfterSplit.firstChild;
			let next;
			if (nodeAfterSplit.nodeName === "A" && (!nodeAfterSplit.textContent || nodeAfterSplit.textContent === ZWS)) {
				child = document.createTextNode("");
				replaceWith(nodeAfterSplit, child);
				nodeAfterSplit = child;
				break;
			}
			while (child && child instanceof Text && !child.data) {
				next = child.nextSibling;
				if (!next || next.nodeName === "BR") break;
				detach(child);
				child = next;
			}
			if (!child || child.nodeName === "BR" || child instanceof Text) break;
			nodeAfterSplit = child;
		}
		range = createRange(nodeAfterSplit, 0);
		this.setSelection(range);
		this._updatePath(range, true);
		return this;
	}
	forEachBlock(fn, mutates, range) {
		if (!range) range = this.getSelection();
		if (mutates) this.saveUndoState(range);
		const root = this._root;
		let start = getStartBlockOfRange(range, root);
		const end = getEndBlockOfRange(range, root);
		if (start && end) do
			if (fn(start) || start === end) break;
		while (start = getNextBlock(start, root));
		if (mutates) {
			this.setSelection(range);
			this._updatePath(range, true);
		}
		return this;
	}
	modifyBlocks(modify, range) {
		if (!range) range = this.getSelection();
		this._recordUndoState(range, this._isInUndoState);
		const root = this._root;
		expandRangeToBlockBoundaries(range, root);
		moveRangeBoundariesUpTree(range, root, root, root);
		const frag = extractContentsOfRange(range, root, root);
		if (!range.collapsed) {
			let node = range.endContainer;
			if (node === root) range.collapse(false);
			else {
				while (node.parentNode !== root) node = node.parentNode;
				range.setStartBefore(node);
				range.collapse(true);
			}
		}
		insertNodeInRange(range, modify.call(this, frag));
		if (range.endOffset < range.endContainer.childNodes.length) mergeContainers(range.endContainer.childNodes[range.endOffset], root);
		mergeContainers(range.startContainer.childNodes[range.startOffset], root);
		this._getRangeAndRemoveBookmark(range);
		this.setSelection(range);
		this._updatePath(range, true);
		return this;
	}
	setTextAlignment(alignment) {
		this.forEachBlock((block) => {
			const className = block.className.split(/\s+/).filter((klass) => {
				return !!klass && !/^align/.test(klass);
			}).join(" ");
			if (alignment) {
				block.className = className + " align-" + alignment;
				block.style.textAlign = alignment;
			} else {
				block.className = className;
				block.style.textAlign = "";
			}
		}, true);
		return this.focus();
	}
	setTextDirection(direction) {
		this.forEachBlock((block) => {
			if (direction) block.dir = direction;
			else block.removeAttribute("dir");
		}, true);
		return this.focus();
	}
	_getListSelection(range, root) {
		let list = range.commonAncestorContainer;
		let startLi = range.startContainer;
		let endLi = range.endContainer;
		while (list && list !== root && !/^[OU]L$/.test(list.nodeName)) list = list.parentNode;
		if (!list || list === root) return null;
		if (startLi === list) startLi = startLi.childNodes[range.startOffset];
		if (endLi === list) endLi = endLi.childNodes[range.endOffset];
		while (startLi && startLi.parentNode !== list) startLi = startLi.parentNode;
		while (endLi && endLi.parentNode !== list) endLi = endLi.parentNode;
		return [
			list,
			startLi,
			endLi
		];
	}
	increaseListLevel(range) {
		if (!range) range = this.getSelection();
		const root = this._root;
		const listSelection = this._getListSelection(range, root);
		if (!listSelection) return this.focus();
		let [list, startLi, endLi] = listSelection;
		if (!startLi || startLi === list.firstChild) return this.focus();
		this._recordUndoState(range, this._isInUndoState);
		const type = list.nodeName;
		let newParent = startLi.previousSibling;
		let listAttrs;
		let next;
		if (newParent.nodeName !== type) {
			listAttrs = this._config.tagAttributes[type.toLowerCase()];
			newParent = createElement(type, listAttrs);
			list.insertBefore(newParent, startLi);
		}
		do {
			next = startLi === endLi ? null : startLi.nextSibling;
			newParent.appendChild(startLi);
		} while (startLi = next);
		next = newParent.nextSibling;
		if (next) mergeContainers(next, root);
		this._getRangeAndRemoveBookmark(range);
		this.setSelection(range);
		this._updatePath(range, true);
		return this.focus();
	}
	decreaseListLevel(range) {
		if (!range) range = this.getSelection();
		const root = this._root;
		const listSelection = this._getListSelection(range, root);
		if (!listSelection) return this.focus();
		let [list, startLi, endLi] = listSelection;
		if (!startLi) startLi = list.firstChild;
		if (!endLi) endLi = list.lastChild;
		this._recordUndoState(range, this._isInUndoState);
		let next;
		let insertBefore = null;
		if (startLi) {
			let newParent = list.parentNode;
			insertBefore = !endLi.nextSibling ? list.nextSibling : split(list, endLi.nextSibling, newParent, root);
			if (newParent !== root && newParent.nodeName === "LI") {
				newParent = newParent.parentNode;
				while (insertBefore) {
					next = insertBefore.nextSibling;
					endLi.appendChild(insertBefore);
					insertBefore = next;
				}
				insertBefore = list.parentNode.nextSibling;
			}
			const makeNotList = !/^[OU]L$/.test(newParent.nodeName);
			do {
				next = startLi === endLi ? null : startLi.nextSibling;
				list.removeChild(startLi);
				if (makeNotList && startLi.nodeName === "LI") startLi = this.createDefaultBlock([empty(startLi)]);
				newParent.insertBefore(startLi, insertBefore);
			} while (startLi = next);
		}
		if (!list.firstChild) detach(list);
		if (insertBefore) mergeContainers(insertBefore, root);
		this._getRangeAndRemoveBookmark(range);
		this.setSelection(range);
		this._updatePath(range, true);
		return this.focus();
	}
	_makeList(frag, type) {
		const walker = getBlockWalker(frag, this._root);
		const tagAttributes = this._config.tagAttributes;
		const listAttrs = tagAttributes[type.toLowerCase()];
		const listItemAttrs = tagAttributes.li;
		let node;
		while (node = walker.nextNode()) {
			if (node.parentNode instanceof HTMLLIElement) {
				node = node.parentNode;
				walker.currentNode = node.lastChild;
			}
			if (!(node instanceof HTMLLIElement)) {
				const newLi = createElement("LI", listItemAttrs);
				if (node.dir) newLi.dir = node.dir;
				const prev = node.previousSibling;
				if (prev && prev.nodeName === type) {
					prev.appendChild(newLi);
					detach(node);
				} else replaceWith(node, createElement(type, listAttrs, [newLi]));
				newLi.appendChild(empty(node));
				walker.currentNode = newLi;
			} else {
				node = node.parentNode;
				const tag = node.nodeName;
				if (tag !== type && /^[OU]L$/.test(tag)) replaceWith(node, createElement(type, listAttrs, [empty(node)]));
			}
		}
		return frag;
	}
	makeUnorderedList() {
		this.modifyBlocks((frag) => this._makeList(frag, "UL"));
		return this.focus();
	}
	makeOrderedList() {
		this.modifyBlocks((frag) => this._makeList(frag, "OL"));
		return this.focus();
	}
	removeList() {
		this.modifyBlocks((frag) => {
			const lists = frag.querySelectorAll("UL, OL");
			const items = frag.querySelectorAll("LI");
			const root = this._root;
			for (let i = 0, l = lists.length; i < l; i += 1) {
				const list = lists[i];
				const listFrag = empty(list);
				fixContainer(listFrag, root);
				replaceWith(list, listFrag);
			}
			for (let i = 0, l = items.length; i < l; i += 1) {
				const item = items[i];
				if (isBlock(item)) replaceWith(item, this.createDefaultBlock([empty(item)]));
				else {
					fixContainer(item, root);
					replaceWith(item, empty(item));
				}
			}
			return frag;
		});
		return this.focus();
	}
	increaseQuoteLevel(range) {
		this.modifyBlocks((frag) => createElement("BLOCKQUOTE", this._config.tagAttributes.blockquote, [frag]), range);
		return this.focus();
	}
	decreaseQuoteLevel(range) {
		this.modifyBlocks((frag) => {
			Array.from(frag.querySelectorAll("blockquote")).filter((el) => {
				return !getNearest(el.parentNode, frag, "BLOCKQUOTE");
			}).forEach((el) => {
				replaceWith(el, empty(el));
			});
			return frag;
		}, range);
		return this.focus();
	}
	removeQuote(range) {
		this.modifyBlocks((frag) => {
			Array.from(frag.querySelectorAll("blockquote")).forEach((el) => {
				replaceWith(el, empty(el));
			});
			return frag;
		}, range);
		return this.focus();
	}
	replaceWithBlankLine(range) {
		this.modifyBlocks(() => this.createDefaultBlock([createElement("INPUT", {
			id: this.startSelectionId,
			type: "hidden"
		}), createElement("INPUT", {
			id: this.endSelectionId,
			type: "hidden"
		})]), range);
		return this.focus();
	}
	code() {
		const range = this.getSelection();
		if (range.collapsed || isContainer(range.commonAncestorContainer)) {
			this.modifyBlocks((frag) => {
				const root = this._root;
				const output = document.createDocumentFragment();
				const blockWalker = getBlockWalker(frag, root);
				let node;
				while (node = blockWalker.nextNode()) {
					let nodes = node.querySelectorAll("BR");
					const brBreaksLine = [];
					let l = nodes.length;
					for (let i = 0; i < l; i += 1) brBreaksLine[i] = isLineBreak(nodes[i], false);
					while (l--) {
						const br = nodes[l];
						if (!brBreaksLine[l]) detach(br);
						else replaceWith(br, document.createTextNode("\n"));
					}
					nodes = node.querySelectorAll("CODE");
					l = nodes.length;
					while (l--) replaceWith(nodes[l], empty(nodes[l]));
					if (output.childNodes.length) output.appendChild(document.createTextNode("\n"));
					output.appendChild(empty(node));
				}
				const textWalker = new TreeIterator(output, SHOW_TEXT);
				while (node = textWalker.nextNode()) node.data = node.data.replace(/ /g, " ");
				output.normalize();
				return fixCursor(createElement("PRE", this._config.tagAttributes.pre, [output]));
			}, range);
			this.focus();
		} else this.changeFormat({
			tag: "CODE",
			attributes: this._config.tagAttributes.code
		}, null, range);
		return this;
	}
	removeCode() {
		const range = this.getSelection();
		const ancestor = range.commonAncestorContainer;
		if (getNearest(ancestor, this._root, "PRE")) {
			this.modifyBlocks((frag) => {
				const root = this._root;
				const pres = frag.querySelectorAll("PRE");
				let l = pres.length;
				while (l--) {
					const pre = pres[l];
					const walker = new TreeIterator(pre, SHOW_TEXT);
					let node;
					while (node = walker.nextNode()) {
						let value = node.data;
						value = value.replace(/ (?= )/g, "\xA0");
						const contents = document.createDocumentFragment();
						let index;
						while ((index = value.indexOf("\n")) > -1) {
							contents.appendChild(document.createTextNode(value.slice(0, index)));
							contents.appendChild(createElement("BR"));
							value = value.slice(index + 1);
						}
						node.parentNode.insertBefore(contents, node);
						node.data = value;
					}
					fixContainer(pre, root);
					replaceWith(pre, empty(pre));
				}
				return frag;
			}, range);
			this.focus();
		} else this.changeFormat(null, { tag: "CODE" }, range);
		return this;
	}
	toggleCode() {
		if (this.hasFormat("PRE") || this.hasFormat("CODE")) this.removeCode();
		else this.code();
		return this;
	}
	_removeFormatting(root, clean) {
		for (let node = root.firstChild, next; node; node = next) {
			next = node.nextSibling;
			if (isInline(node)) {
				if (node instanceof Text || node.nodeName === "BR" || node.nodeName === "IMG") {
					clean.appendChild(node);
					continue;
				}
			} else if (isBlock(node)) {
				clean.appendChild(this.createDefaultBlock([this._removeFormatting(node, document.createDocumentFragment())]));
				continue;
			}
			this._removeFormatting(node, clean);
		}
		return clean;
	}
	removeAllFormatting(range) {
		if (!range) range = this.getSelection();
		if (range.collapsed) return this.focus();
		const root = this._root;
		let stopNode = range.commonAncestorContainer;
		while (stopNode && !isBlock(stopNode)) stopNode = stopNode.parentNode;
		if (!stopNode) {
			expandRangeToBlockBoundaries(range, root);
			stopNode = root;
		}
		if (stopNode instanceof Text) return this.focus();
		this.saveUndoState(range);
		moveRangeBoundariesUpTree(range, stopNode, stopNode, root);
		const startContainer = range.startContainer;
		let startOffset = range.startOffset;
		const endContainer = range.endContainer;
		let endOffset = range.endOffset;
		const formattedNodes = document.createDocumentFragment();
		const cleanNodes = document.createDocumentFragment();
		const nodeAfterSplit = split(endContainer, endOffset, stopNode, root);
		let nodeInSplit = split(startContainer, startOffset, stopNode, root);
		let nextNode;
		while (nodeInSplit !== nodeAfterSplit) {
			nextNode = nodeInSplit.nextSibling;
			formattedNodes.appendChild(nodeInSplit);
			nodeInSplit = nextNode;
		}
		this._removeFormatting(formattedNodes, cleanNodes);
		cleanNodes.normalize();
		nodeInSplit = cleanNodes.firstChild;
		nextNode = cleanNodes.lastChild;
		if (nodeInSplit) {
			stopNode.insertBefore(cleanNodes, nodeAfterSplit);
			const childNodes = Array.from(stopNode.childNodes);
			startOffset = childNodes.indexOf(nodeInSplit);
			endOffset = nextNode ? childNodes.indexOf(nextNode) + 1 : 0;
		} else if (nodeAfterSplit) {
			startOffset = Array.from(stopNode.childNodes).indexOf(nodeAfterSplit);
			endOffset = startOffset;
		}
		range.setStart(stopNode, startOffset);
		range.setEnd(stopNode, endOffset);
		mergeInlines(stopNode, range);
		moveRangeBoundariesDownTree(range);
		this.setSelection(range);
		this._updatePath(range, true);
		return this.focus();
	}
};
var Squire_default = Squire;
// src/icons.ts
const SVG_PATHS = {
	bold: `<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>`,
	italic: `<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>`,
	underline: `<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/>`,
	strike: `<path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/>`,
	paragraph: `<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>`,
	h1: `<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/>`,
	h2: `<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>`,
	h3: `<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>`,
	bulletList: `<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>`,
	orderedList: `<path d="M11 5h10"/><path d="M11 12h10"/><path d="M11 19h10"/><path d="M4 4h1v5"/><path d="M4 9h2"/><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/>`,
	quote: `<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>`,
	code: `<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>`,
	hr: `<line x1="3" x2="21" y1="12" y2="12"/>`,
	link: `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
	unlink: `<path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" x2="8" y1="2" y2="5"/><line x1="2" x2="5" y1="8" y2="8"/><line x1="16" x2="16" y1="19" y2="22"/><line x1="19" x2="22" y1="16" y2="16"/>`,
	image: `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>`,
	alignLeft: `<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>`,
	alignCenter: `<line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/>`,
	alignRight: `<line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/>`,
	undo: `<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>`,
	redo: `<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>`,
	clear: `<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>`,
	search: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
	trash: `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>`,
	check: `<path d="M20 6 9 17l-5-5"/>`,
	x: `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,
	upload: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>`,
	moon: `<path d="M12 3a6.5 6.5 0 1 0 9 9 9 9 0 1 1-9-9"/>`,
	sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`,
	copy: `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`,
	text: `<path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/>`
};
/** Names of all built-in icons (each can be overridden). */
const ICON_NAMES = Object.freeze(Object.keys(SVG_PATHS));
const globalIcons = /* @__PURE__ */ new Map();
const iconListeners = /* @__PURE__ */ new Set();
/**
* Override built-in icons for every <vanilia-editor> on the page.
* Values are trusted markup strings (inline SVG, icon-font <i>, <img>, ...).
* Pass `null` / `undefined` for a name to restore its built-in icon.
*
*   setIcons({ bold: '<svg viewBox="0 0 256 256">...</svg>' });
*/
function setIcons(map = {}) {
	for (const [name, markup] of Object.entries(map)) if (markup == null || markup === "") globalIcons.delete(name);
	else globalIcons.set(name, String(markup));
	for (const listener of iconListeners) listener();
}
/** Subscribe to global icon changes; returns an unsubscribe function. */
function onIconsChange(listener) {
	iconListeners.add(listener);
	return () => {
		iconListeners.delete(listener);
	};
}
/**
* Render an icon as markup. Lookup order: per-editor `overrides` (Map),
* global `setIcons()` registry, built-in Lucide-compatible SVG.
* Every icon carries `data-icon` / `data-size` so editors can re-render it in place.
*/
function icon(name, size = 16, overrides) {
	const custom = overrides?.get(name) ?? globalIcons.get(name);
	if (custom != null) return `<span class="ve-icon ve-icon--custom" data-icon="${name}" data-size="${size}" aria-hidden="true">${custom}</span>`;
	return `<svg class="ve-icon" data-icon="${name}" data-size="${size}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${name in SVG_PATHS ? SVG_PATHS[name] : ""}</svg>`;
}
// src/sanitizer.ts
const ALLOWED_TAGS = /* @__PURE__ */ new Set([
	"P",
	"DIV",
	"BR",
	"HR",
	"H1",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6",
	"BLOCKQUOTE",
	"PRE",
	"CODE",
	"UL",
	"OL",
	"LI",
	"B",
	"STRONG",
	"I",
	"EM",
	"U",
	"S",
	"DEL",
	"SUB",
	"SUP",
	"MARK",
	"SPAN",
	"A",
	"IMG",
	"FIGURE",
	"FIGCAPTION",
	"TABLE",
	"THEAD",
	"TBODY",
	"TFOOT",
	"TR",
	"TH",
	"TD"
]);
const DROP_CONTENT_TAGS = /* @__PURE__ */ new Set([
	"SCRIPT",
	"STYLE",
	"NOSCRIPT",
	"IFRAME",
	"OBJECT",
	"EMBED",
	"TEMPLATE",
	"SVG",
	"MATH",
	"META",
	"LINK",
	"TITLE",
	"HEAD"
]);
const ALLOWED_ATTRS = {
	"*": /* @__PURE__ */ new Set([
		"dir",
		"class",
		"style"
	]),
	A: /* @__PURE__ */ new Set([
		"href",
		"title",
		"target",
		"rel"
	]),
	IMG: /* @__PURE__ */ new Set([
		"src",
		"alt",
		"title",
		"width",
		"height",
		"data-align",
		"data-width"
	]),
	TD: /* @__PURE__ */ new Set(["colspan", "rowspan"]),
	TH: /* @__PURE__ */ new Set([
		"colspan",
		"rowspan",
		"scope"
	]),
	OL: /* @__PURE__ */ new Set(["start"])
};
const ALLOWED_STYLE_PROPS = /* @__PURE__ */ new Set([
	"width",
	"max-width",
	"height",
	"text-align",
	"color",
	"background-color",
	"font-family",
	"font-size",
	"display",
	"margin-inline",
	"margin-left",
	"margin-right"
]);
const SAFE_LINK_PROTOCOLS = /^(https?:|mailto:|tel:|#|\/(?!\/))/i;
const SAFE_IMG_PROTOCOLS = /^(https?:|\/(?!\/)|blob:|data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,)/i;
/** Whether a URL is safe to keep in an `href` (`"link"`) or `src` (`"image"`). */
function isSafeUrl(url, kind = "link") {
	if (!url || typeof url !== "string") return false;
	const trimmed = url.trim().replace(/[\u0000-\u001F\u007F]+/g, "");
	return kind === "image" ? SAFE_IMG_PROTOCOLS.test(trimmed) : SAFE_LINK_PROTOCOLS.test(trimmed);
}
function sanitizeStyle(rawStyle) {
	if (!rawStyle) return "";
	const kept = [];
	for (const decl of rawStyle.split(";")) {
		const colon = decl.indexOf(":");
		if (colon === -1) continue;
		const prop = decl.slice(0, colon).trim().toLowerCase();
		const val = decl.slice(colon + 1).trim();
		if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
		if (!val || /url\s*\(|expression\s*\(|javascript:/i.test(val)) continue;
		kept.push(`${prop}: ${val}`);
	}
	return kept.join("; ");
}
function sanitizeNode(node, doc) {
	if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.nodeValue || "");
	if (!(node instanceof Element)) return null;
	const tag = node.nodeName.toUpperCase();
	if (DROP_CONTENT_TAGS.has(tag)) return null;
	if (!ALLOWED_TAGS.has(tag)) {
		const frag = doc.createDocumentFragment();
		for (const child of Array.from(node.childNodes)) {
			const cleanChild = sanitizeNode(child, doc);
			if (cleanChild) frag.appendChild(cleanChild);
		}
		return frag;
	}
	const el = doc.createElement(tag.toLowerCase());
	const globalAllowed = ALLOWED_ATTRS["*"];
	const tagAllowed = ALLOWED_ATTRS[tag];
	for (const attr of Array.from(node.attributes)) {
		const name = attr.name.toLowerCase();
		if (name.startsWith("on")) continue;
		if (!globalAllowed.has(name) && !(tagAllowed && tagAllowed.has(name))) continue;
		const val = attr.value;
		if (name === "href") {
			if (!isSafeUrl(val, "link")) continue;
			el.setAttribute("href", val.trim());
			continue;
		}
		if (name === "src") {
			if (!isSafeUrl(val, "image")) continue;
			el.setAttribute("src", val.trim());
			continue;
		}
		if (name === "target") {
			if (val === "_blank") {
				el.setAttribute("target", "_blank");
				el.setAttribute("rel", "noopener noreferrer");
			}
			continue;
		}
		if (name === "style") {
			const safe = sanitizeStyle(val);
			if (safe) el.setAttribute("style", safe);
			continue;
		}
		if (name === "class") {
			const safeClasses = val.split(/\s+/).filter((c) => /^align-(left|center|right|justify)$/.test(c));
			if (safeClasses.length) el.setAttribute("class", safeClasses.join(" "));
			continue;
		}
		if (name === "data-align") {
			if (/^(left|center|right)$/.test(val)) el.setAttribute("data-align", val);
			continue;
		}
		if (name === "width" || name === "height") {
			if (/^\d+(\.\d+)?(%|px)?$/.test(val.trim())) el.setAttribute(name, val.trim());
			continue;
		}
		el.setAttribute(name, val);
	}
	for (const child of Array.from(node.childNodes)) {
		const cleanChild = sanitizeNode(child, doc);
		if (cleanChild) el.appendChild(cleanChild);
	}
	return el;
}
/**
* Squire-compatible `sanitizeToDOMFragment(html, editor)` callback.
* Uses an inert <template> (never executes scripts or loads remote images while parsing).
*/
function sanitizeToDOMFragment(html, editor) {
	const doc = editor?.getRoot().ownerDocument ?? document;
	const tpl = doc.createElement("template");
	tpl.innerHTML = html || "";
	const out = doc.createDocumentFragment();
	for (const child of Array.from(tpl.content.childNodes)) {
		const clean = sanitizeNode(child, doc);
		if (clean) out.appendChild(clean);
	}
	return out;
}
/**
* Clean exported HTML (normalizes Squire's <b>/<i> -> <strong>/<em> and strips empty artifacts).
*/
function normalizeExportHTML(rawHtml) {
	const tpl = document.createElement("template");
	tpl.innerHTML = rawHtml || "";
	const renameTag = (el, newTag) => {
		const replacement = document.createElement(newTag);
		for (const attr of Array.from(el.attributes)) replacement.setAttribute(attr.name, attr.value);
		while (el.firstChild) replacement.appendChild(el.firstChild);
		el.replaceWith(replacement);
	};
	for (const b of Array.from(tpl.content.querySelectorAll("b"))) renameTag(b, "strong");
	for (const i of Array.from(tpl.content.querySelectorAll("i"))) renameTag(i, "em");
	for (const img of Array.from(tpl.content.querySelectorAll("img"))) img.removeAttribute("tabindex");
	return tpl.innerHTML.trim();
}
/**
* Lightweight zero-dependency HTML pretty printer for live preview inspection.
*/
function formatHTML(html) {
	if (!html) return "";
	const containerTags = /^(ul|ol|blockquote|table|thead|tbody|tfoot|tr|figure)$/i;
	const leafBlockTags = /^(p|h[1-6]|li|pre|hr|div|th|td|figcaption)$/i;
	const tokens = html.replace(/>\s+</g, "><").match(/<!--[\s\S]*?-->|<\/?[^>]+>|[^<]+/g);
	if (!tokens) return html;
	let indent = 0;
	const lines = [];
	let inPre = false;
	for (const token of tokens) if (token.startsWith("</")) {
		const name = token.slice(2, -1).trim();
		if (/^pre$/i.test(name)) inPre = false;
		if (containerTags.test(name)) {
			indent = Math.max(0, indent - 1);
			lines.push(`${"  ".repeat(indent)}${token}`);
		} else if (lines.length) lines[lines.length - 1] += token;
		else lines.push(token);
	} else if (token.startsWith("<")) {
		const match = token.match(/^<([a-z0-9-]+)/i);
		const name = match ? match[1] : "";
		const selfClosing = token.endsWith("/>") || /^(br|hr|img|input)$/i.test(name);
		if (/^pre$/i.test(name)) inPre = true;
		if (containerTags.test(name)) {
			lines.push(`${"  ".repeat(indent)}${token}`);
			if (!selfClosing) indent += 1;
		} else if (leafBlockTags.test(name)) lines.push(`${"  ".repeat(indent)}${token}`);
		else if (lines.length && !inPre) lines[lines.length - 1] += token;
		else lines.push(token);
	} else {
		const text = inPre ? token : token.replace(/\s+/g, " ");
		if (!inPre && !text.trim()) continue;
		if (lines.length) lines[lines.length - 1] += text;
		else lines.push(text);
	}
	return lines.join("\n");
}
// src/extensions/headings.ts
const BLOCK_SELECTOR = "p, div, h1, h2, h3, h4, h5, h6";
function convertFragmentBlocks(squire, frag, targetTag) {
	const doc = squire.getRoot().ownerDocument;
	const upperTarget = targetTag.toUpperCase();
	const blocks = Array.from(frag.children);
	if (blocks.length === 0) {
		const el = doc.createElement(targetTag);
		while (frag.firstChild) el.appendChild(frag.firstChild);
		frag.appendChild(el);
		return frag;
	}
	for (const child of blocks) {
		if (child.nodeName === "UL" || child.nodeName === "OL" || child.nodeName === "BLOCKQUOTE") continue;
		if (child instanceof HTMLElement && child.matches(BLOCK_SELECTOR)) {
			if (child.nodeName === upperTarget) continue;
			const next = doc.createElement(targetTag);
			if (child.dir) next.dir = child.dir;
			if (child.style.textAlign) next.style.textAlign = child.style.textAlign;
			while (child.firstChild) next.appendChild(child.firstChild);
			child.replaceWith(next);
		}
	}
	return frag;
}
function isHeadingActive(squire, level) {
	if (level) return squire.hasFormat(`H${level}`);
	return squire.hasFormat("H1") || squire.hasFormat("H2") || squire.hasFormat("H3");
}
function setParagraph(squire) {
	if (squire.hasFormat("UL") || squire.hasFormat("OL")) squire.removeList();
	if (squire.hasFormat("BLOCKQUOTE")) squire.removeQuote();
	if (squire.hasFormat("PRE")) squire.removeCode();
	squire.modifyBlocks((frag) => convertFragmentBlocks(squire, frag, "p"));
	squire.focus();
}
function toggleHeading(squire, level = 2) {
	const tag = `h${level}`;
	if (squire.hasFormat(tag.toUpperCase())) {
		setParagraph(squire);
		return;
	}
	if (squire.hasFormat("UL") || squire.hasFormat("OL")) squire.removeList();
	if (squire.hasFormat("PRE")) squire.removeCode();
	squire.modifyBlocks((frag) => convertFragmentBlocks(squire, frag, tag));
	squire.focus();
}
// src/extensions/formatting.ts
function isActive(squire, name, attrs = {}) {
	if (!squire) return false;
	switch (name) {
		case "bold": return squire.hasFormat("B") || squire.hasFormat("STRONG");
		case "italic": return squire.hasFormat("I") || squire.hasFormat("EM");
		case "underline": return squire.hasFormat("U");
		case "strike": return squire.hasFormat("S") || squire.hasFormat("DEL");
		case "code": return squire.hasFormat("CODE") || squire.hasFormat("PRE");
		case "subscript": return squire.hasFormat("SUB");
		case "superscript": return squire.hasFormat("SUP");
		case "link": return squire.hasFormat("A");
		case "bulletList": return squire.hasFormat("UL");
		case "orderedList": return squire.hasFormat("OL");
		case "blockquote": return squire.hasFormat("BLOCKQUOTE");
		case "heading": return isHeadingActive(squire, attrs.level);
		case "paragraph": return !isHeadingActive(squire) && !squire.hasFormat("UL") && !squire.hasFormat("OL") && !squire.hasFormat("BLOCKQUOTE") && !squire.hasFormat("PRE");
		default: return false;
	}
}
function getActiveState(squire) {
	return {
		bold: isActive(squire, "bold"),
		italic: isActive(squire, "italic"),
		underline: isActive(squire, "underline"),
		strike: isActive(squire, "strike"),
		code: isActive(squire, "code"),
		subscript: isActive(squire, "subscript"),
		superscript: isActive(squire, "superscript"),
		link: isActive(squire, "link"),
		bulletList: isActive(squire, "bulletList"),
		orderedList: isActive(squire, "orderedList"),
		blockquote: isActive(squire, "blockquote"),
		paragraph: isActive(squire, "paragraph"),
		h1: isActive(squire, "heading", { level: 1 }),
		h2: isActive(squire, "heading", { level: 2 }),
		h3: isActive(squire, "heading", { level: 3 })
	};
}
function execCommand(squire, command, arg) {
	if (!squire) return;
	switch (command) {
		case "bold":
			if (isActive(squire, "bold")) squire.removeBold();
			else squire.bold();
			break;
		case "italic":
			if (isActive(squire, "italic")) squire.removeItalic();
			else squire.italic();
			break;
		case "underline":
			if (isActive(squire, "underline")) squire.removeUnderline();
			else squire.underline();
			break;
		case "strike":
			if (isActive(squire, "strike")) squire.changeFormat(null, { tag: "S" });
			else squire.changeFormat({ tag: "S" }, null);
			break;
		case "code":
			squire.toggleCode();
			break;
		case "subscript":
			if (squire.hasFormat("SUB")) squire.changeFormat(null, { tag: "SUB" });
			else squire.changeFormat({ tag: "SUB" }, { tag: "SUP" });
			break;
		case "superscript":
			if (squire.hasFormat("SUP")) squire.changeFormat(null, { tag: "SUP" });
			else squire.changeFormat({ tag: "SUP" }, { tag: "SUB" });
			break;
		case "indent":
		case "outdent": {
			const path = squire.getPath();
			const inList = /(?:^|>)[OU]L/.test(path) && !/(?:^|>)BLOCKQUOTE/.test(path);
			if (command === "indent") {
				if (inList) squire.increaseListLevel();
				else squire.increaseQuoteLevel();
			} else if (inList) squire.decreaseListLevel();
			else squire.decreaseQuoteLevel();
			break;
		}
		case "paragraph":
			setParagraph(squire);
			break;
		case "h1":
			toggleHeading(squire, 1);
			break;
		case "h2":
			toggleHeading(squire, 2);
			break;
		case "h3":
			toggleHeading(squire, 3);
			break;
		case "bulletList":
			if (squire.hasFormat("UL")) squire.removeList();
			else squire.makeUnorderedList();
			break;
		case "orderedList":
			if (squire.hasFormat("OL")) squire.removeList();
			else squire.makeOrderedList();
			break;
		case "blockquote":
			if (squire.hasFormat("BLOCKQUOTE")) squire.decreaseQuoteLevel();
			else squire.increaseQuoteLevel();
			break;
		case "hr":
			squire.insertHTML("<hr><p><br></p>");
			break;
		case "alignLeft":
			squire.setTextAlignment("left");
			break;
		case "alignCenter":
			squire.setTextAlignment("center");
			break;
		case "alignRight":
			squire.setTextAlignment("right");
			break;
		case "clearFormatting":
			squire.removeAllFormatting();
			break;
		case "undo":
			squire.undo();
			break;
		case "redo":
			squire.redo();
			break;
		case "makeLink":
			if (arg) squire.makeLink(arg, {
				target: "_blank",
				rel: "noopener noreferrer"
			});
			break;
		case "removeLink": squire.removeLink();
	}
}
// src/labels.ts
const plural = (one, other) => (vars) => Number(vars.count) === 1 ? `${vars.count} ${one}` : `${vars.count} ${other}`;
/** Built-in English labels. */
const DEFAULT_LABELS = Object.freeze({
	bold: "Bold",
	italic: "Italic",
	underline: "Underline",
	strike: "Strikethrough",
	code: "Code",
	paragraph: "Paragraph",
	h1: "Heading 1",
	h2: "Heading 2",
	h3: "Heading 3",
	bulletList: "Bullet list",
	orderedList: "Numbered list",
	blockquote: "Quote",
	hr: "Horizontal rule",
	alignLeft: "Align left",
	alignCenter: "Align center",
	alignRight: "Align right",
	link: "Link",
	image: "Image",
	clearFormatting: "Clear formatting",
	undo: "Undo",
	redo: "Redo",
	find: "Find and replace",
	toolbar: "Formatting toolbar",
	bubbleMenu: "Text formatting",
	editor: "Rich text editor",
	placeholder: "Start writing, paste an image, or drop a photo here...",
	linkUrl: "Link URL",
	linkUrlPlaceholder: "https://example.com",
	removeLink: "Remove",
	cancel: "Cancel",
	apply: "Apply",
	chooseImageFile: "Choose image file...",
	orPasteUrl: "or paste URL",
	imageUrl: "Image URL",
	imageUrlPlaceholder: "https://...",
	altText: "Alt text (optional)",
	altTextPlaceholder: "Describe the image",
	insert: "Insert",
	imageOptions: "Image options",
	imageWidth: "Image width",
	imageAlignment: "Image alignment",
	widthPreset: "Width {width}",
	resizeImage: "Resize image ({handle})",
	imageSize: "{width} × {height} px · {percent}%",
	editAlt: "Edit alt text",
	altButton: "Alt",
	altInputPlaceholder: "Describe this image...",
	saveAlt: "Save alt text",
	deleteImage: "Delete image",
	findPlaceholder: "Find in document...",
	findLabel: "Find text",
	previousMatch: "Previous match",
	nextMatch: "Next match",
	replacePlaceholder: "Replace with...",
	replaceLabel: "Replace text",
	replace: "Replace",
	replaceAll: "All",
	close: "Close",
	matchCount: "{current} / {total}",
	wordCount: plural("word", "words"),
	imageCount: plural("image", "images"),
	uploading: "Uploading {name}...",
	uploadFailed: "Image upload failed",
	valueMissing: "Please fill out this field."
});
/** Names of all built-in labels. */
const LABEL_NAMES = Object.freeze(Object.keys(DEFAULT_LABELS));
const globalLabels = /* @__PURE__ */ new Map();
const labelListeners = /* @__PURE__ */ new Set();
/** Write label overrides into `target`; `null` / `""` deletes an entry. */
function mergeLabels(target, map) {
	for (const [name, value] of Object.entries(map)) if (value == null || value === "") target.delete(name);
	else target.set(name, typeof value === "function" ? value : String(value));
}
/**
* Override labels for every <vanilia-editor> on the page (mounted editors update).
*
*   setLabels({ bold: "Félkövér", wordCount: "{count} szó" });
*/
function setLabels(map = {}) {
	mergeLabels(globalLabels, map);
	for (const listener of labelListeners) listener();
}
/** Subscribe to global label changes; returns an unsubscribe function. */
function onLabelsChange(listener) {
	labelListeners.add(listener);
	return () => {
		labelListeners.delete(listener);
	};
}
/**
* Create a translator. Lookup order: `overrides`, global `setLabels()`, built-in English.
* Unknown names come back unchanged.
*/
function createTranslator(overrides) {
	return (name, vars = {}) => {
		const label = overrides?.get(name) ?? globalLabels.get(name) ?? DEFAULT_LABELS[name];
		if (label === void 0) return name;
		if (typeof label === "function") return label(vars);
		return label.replace(/\{(\w+)\}/g, (match, key) => key in vars ? String(vars[key]) : match);
	};
}
/** English translator used when an extension is created without one. */
const defaultTranslate = createTranslator();
const LABEL_ATTRS = [
	["data-ve-text", null],
	["data-ve-title", "title"],
	["data-ve-placeholder", "placeholder"],
	["data-ve-aria-label", "aria-label"]
];
/**
* Fill in text marked with label hooks under `root`:
* `data-ve-text="cancel"` sets the text, `data-ve-title`, `data-ve-placeholder` and
* `data-ve-aria-label` set those attributes. Re-run it after a label change.
*/
function applyLabels(root, t) {
	for (const [hook, attr] of LABEL_ATTRS) for (const el of root.querySelectorAll(`[${hook}]`)) {
		const text = t(el.getAttribute(hook));
		if (attr) el.setAttribute(attr, text);
		else el.textContent = text;
	}
}
// src/extensions/image-resize.ts
/**
* Custom TipTap-style Image Resize, Alignment, Alt-Text & Upload extension for Squire.
*
* Keeps all selection handles, live dimension badge, and floating toolbar OUTSIDE
* the `contenteditable` root so `getHTML()` stays 100% clean.
*/
const MIN_WIDTH = 48;
const HANDLES = [
	{
		pos: "nw",
		cursor: "nwse-resize"
	},
	{
		pos: "ne",
		cursor: "nesw-resize"
	},
	{
		pos: "se",
		cursor: "nwse-resize"
	},
	{
		pos: "sw",
		cursor: "nesw-resize"
	},
	{
		pos: "w",
		cursor: "ew-resize"
	},
	{
		pos: "e",
		cursor: "ew-resize"
	}
];
const WIDTH_PRESETS = [
	"25%",
	"50%",
	"75%",
	"100%"
];
function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
		reader.onerror = () => reject(reader.error || /* @__PURE__ */ new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}
function createImageResizeExtension({ squire, surface, overlayHost, editorToolbar, onChange, onSelectChange, getUploadHandler, onStatus, renderIcon = icon, t = defaultTranslate }) {
	if (squire._imageResizer && typeof squire._imageResizer.destroy === "function") squire._imageResizer.destroy();
	let selectedImg = null;
	let dragState = null;
	let altEditing = false;
	const box = document.createElement("div");
	box.className = "ve-img-selection";
	box.hidden = true;
	const dimBadge = document.createElement("div");
	dimBadge.className = "ve-img-badge";
	dimBadge.hidden = true;
	box.appendChild(dimBadge);
	for (const { pos, cursor } of HANDLES) {
		const h = document.createElement("button");
		h.type = "button";
		h.tabIndex = -1;
		h.className = `ve-img-handle ve-img-handle--${pos}`;
		h.dataset.handle = pos;
		h.style.cursor = cursor;
		h.setAttribute("aria-label", t("resizeImage", { handle: pos }));
		h.addEventListener("pointerdown", onHandlePointerDown);
		h.addEventListener("touchstart", preventTouchScroll, { passive: false });
		box.appendChild(h);
	}
	overlayHost.appendChild(box);
	const toolbar = document.createElement("div");
	toolbar.className = "ve-popover ve-img-toolbar";
	toolbar.setAttribute("popover", "manual");
	toolbar.setAttribute("role", "toolbar");
	toolbar.setAttribute("aria-label", t("imageOptions"));
	overlayHost.appendChild(toolbar);
	function renderToolbar() {
		if (!selectedImg) return;
		if (altEditing) {
			toolbar.innerHTML = `
        <form class="ve-img-alt-form">
          <input type="text" class="ve-input ve-input--sm" name="alt" placeholder="${escapeAttr$1(t("altInputPlaceholder"))}" value="${escapeAttr$1(selectedImg.getAttribute("alt") || "")}" />
          <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary" title="${escapeAttr$1(t("saveAlt"))}">${renderIcon("check", 14)}</button>
          <button type="button" class="ve-btn ve-btn--sm" data-action="cancel-alt" title="${escapeAttr$1(t("cancel"))}">${renderIcon("x", 14)}</button>
        </form>
      `;
			const form = toolbar.querySelector("form");
			const input = form.querySelector("input");
			form.addEventListener("submit", (e) => {
				e.preventDefault();
				if (!selectedImg) return;
				squire.saveUndoState();
				const val = input.value.trim();
				if (val) selectedImg.setAttribute("alt", val);
				else selectedImg.removeAttribute("alt");
				altEditing = false;
				renderToolbar();
				positionOverlay();
				onChange?.();
			});
			toolbar.querySelector("[data-action=\"cancel-alt\"]").addEventListener("click", () => {
				altEditing = false;
				renderToolbar();
				positionOverlay();
			});
			requestAnimationFrame(() => input.focus());
			return;
		}
		const currentAlign = selectedImg.getAttribute("data-align") || inferAlign(selectedImg);
		const currentStyleWidth = selectedImg.style.width || "";
		toolbar.innerHTML = `
      <div class="ve-btn-group" role="group" aria-label="${escapeAttr$1(t("imageWidth"))}">
        ${WIDTH_PRESETS.map((w) => `
          <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${currentStyleWidth === w ? "is-active" : ""}" data-width="${w}" title="${escapeAttr$1(t("widthPreset", { width: w }))}">${w}</button>
        `).join("")}
      </div>
      <span class="ve-sep"></span>
      <div class="ve-btn-group" role="group" aria-label="${escapeAttr$1(t("imageAlignment"))}">
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "left" ? "is-active" : ""}" data-align="left" title="${escapeAttr$1(t("alignLeft"))}">${renderIcon("alignLeft", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "center" ? "is-active" : ""}" data-align="center" title="${escapeAttr$1(t("alignCenter"))}">${renderIcon("alignCenter", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "right" ? "is-active" : ""}" data-align="right" title="${escapeAttr$1(t("alignRight"))}">${renderIcon("alignRight", 14)}</button>
      </div>
      <span class="ve-sep"></span>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${selectedImg.getAttribute("alt") ? "is-active" : ""}" data-action="edit-alt" title="${escapeAttr$1(t("editAlt"))}">${escapeAttr$1(t("altButton"))}</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--danger" data-action="delete" title="${escapeAttr$1(t("deleteImage"))}">${renderIcon("trash", 14)}</button>
    `;
	}
	toolbar.addEventListener("mousedown", (e) => {
		if (e.target.closest("input")) return;
		e.preventDefault();
	});
	toolbar.addEventListener("click", (e) => {
		const btn = e.target.closest("button");
		if (!btn || !selectedImg) return;
		if (btn.dataset.width) applyWidth(btn.dataset.width);
		else if (btn.dataset.align) applyAlignment(btn.dataset.align);
		else if (btn.dataset.action === "edit-alt") {
			altEditing = true;
			renderToolbar();
			positionOverlay();
		} else if (btn.dataset.action === "delete") deleteSelectedImage();
	});
	function inferAlign(img) {
		if (img.style.marginLeft === "auto" && img.style.marginRight === "auto") return "center";
		if (img.style.marginLeft === "auto") return "right";
		return "left";
	}
	function applyWidth(widthValue) {
		if (!selectedImg) return;
		squire.saveUndoState();
		selectedImg.style.width = widthValue;
		selectedImg.style.height = "auto";
		selectedImg.removeAttribute("width");
		selectedImg.removeAttribute("height");
		renderToolbar();
		positionOverlay();
		onChange?.();
	}
	function applyAlignment(align) {
		if (!selectedImg) return;
		squire.saveUndoState();
		selectedImg.setAttribute("data-align", align);
		selectedImg.style.display = "block";
		if (align === "center") {
			selectedImg.style.marginLeft = "auto";
			selectedImg.style.marginRight = "auto";
		} else if (align === "right") {
			selectedImg.style.marginLeft = "auto";
			selectedImg.style.marginRight = "0";
		} else {
			selectedImg.style.marginLeft = "0";
			selectedImg.style.marginRight = "auto";
		}
		renderToolbar();
		positionOverlay();
		onChange?.();
	}
	function deleteSelectedImage() {
		if (!selectedImg) return;
		const img = selectedImg;
		squire.saveUndoState();
		const parent = img.parentNode;
		deselect();
		img.remove();
		if (parent instanceof Element && parent !== surface && !parent.textContent && !parent.querySelector("img, br")) parent.appendChild(document.createElement("br"));
		squire.focus();
		onChange?.();
	}
	function selectImage(img) {
		if (!img || !surface.contains(img)) return;
		selectedImg = img;
		altEditing = false;
		box.hidden = false;
		renderToolbar();
		try {
			if (!toolbar.matches(":popover-open")) toolbar.showPopover();
		} catch {
			toolbar.hidden = false;
		}
		positionOverlay();
		requestAnimationFrame(() => {
			if (selectedImg) positionOverlay();
		});
		onSelectChange?.(selectedImg);
	}
	function deselect() {
		if (!selectedImg) return;
		endDrag({ commit: false });
		selectedImg = null;
		altEditing = false;
		box.hidden = true;
		dimBadge.hidden = true;
		try {
			if (toolbar.matches(":popover-open")) toolbar.hidePopover();
		} catch {
			toolbar.hidden = true;
		}
		onSelectChange?.(null);
	}
	function positionOverlay() {
		if (!selectedImg || !surface.contains(selectedImg)) {
			deselect();
			return;
		}
		const hostRect = overlayHost.getBoundingClientRect();
		const imgRect = selectedImg.getBoundingClientRect();
		box.style.top = `${imgRect.top - hostRect.top}px`;
		box.style.left = `${imgRect.left - hostRect.left}px`;
		box.style.width = `${imgRect.width}px`;
		box.style.height = `${imgRect.height}px`;
		const tbRect = toolbar.getBoundingClientRect();
		const gap = 8;
		const maxTop = Math.max(8, window.innerHeight - tbRect.height - 8);
		let top = imgRect.top - tbRect.height - gap;
		if (top < 8) {
			const below = imgRect.bottom + gap;
			top = below <= maxTop ? below : Math.max(8, Math.min(maxTop, imgRect.top + 8));
		} else if (top > maxTop) top = maxTop;
		let left = imgRect.left + imgRect.width / 2 - tbRect.width / 2;
		left = Math.max(8, Math.min(left, Math.max(8, window.innerWidth - tbRect.width - 8)));
		toolbar.style.top = `${Math.round(top)}px`;
		toolbar.style.left = `${Math.round(left)}px`;
	}
	function onHandlePointerDown(e) {
		if (!selectedImg) return;
		e.preventDefault();
		e.stopPropagation();
		const handle = e.currentTarget;
		const pos = handle.dataset.handle ?? "";
		const imgRect = selectedImg.getBoundingClientRect();
		const surfaceStyle = getComputedStyle(surface);
		const maxWidth = Math.max(MIN_WIDTH, surface.clientWidth - parseFloat(surfaceStyle.paddingLeft) - parseFloat(surfaceStyle.paddingRight));
		const ratio = selectedImg.naturalWidth && selectedImg.naturalHeight ? selectedImg.naturalWidth / selectedImg.naturalHeight : imgRect.width / (imgRect.height || 1);
		squire.saveUndoState();
		dragState = {
			handle,
			pos,
			pointerId: e.pointerId,
			startX: e.clientX,
			startY: e.clientY,
			startWidth: imgRect.width,
			startHeight: imgRect.height,
			maxWidth,
			ratio
		};
		overlayHost.classList.add("is-resizing");
		toolbar.style.visibility = "hidden";
		window.addEventListener("touchmove", preventTouchScroll, { passive: false });
		handle.setPointerCapture(e.pointerId);
		handle.addEventListener("pointermove", onHandlePointerMove);
		handle.addEventListener("pointerup", onHandlePointerUp);
		handle.addEventListener("pointercancel", onHandlePointerUp);
		dimBadge.hidden = false;
		updateBadge(imgRect.width, imgRect.height, maxWidth);
	}
	function onHandlePointerMove(e) {
		if (!dragState || !selectedImg) return;
		e.preventDefault();
		const dx = e.clientX - dragState.startX;
		const dy = e.clientY - dragState.startY;
		const { pos, startWidth, startHeight, maxWidth, ratio } = dragState;
		let nextWidth = startWidth;
		if (pos.includes("e")) nextWidth = startWidth + dx;
		else if (pos.includes("w")) nextWidth = startWidth - dx;
		else if (pos === "s") nextWidth = (startHeight + dy) * ratio;
		else if (pos === "n") nextWidth = (startHeight - dy) * ratio;
		if (pos === "se" || pos === "ne" || pos === "sw" || pos === "nw") {
			const xDelta = pos.includes("e") ? dx : -dx;
			const yDelta = pos.includes("s") ? dy : -dy;
			const wFromX = startWidth + xDelta;
			const wFromY = (startHeight + yDelta) * ratio;
			nextWidth = Math.abs(xDelta) >= Math.abs(yDelta * ratio) ? wFromX : wFromY;
		}
		nextWidth = Math.round(Math.max(MIN_WIDTH, Math.min(nextWidth, maxWidth)));
		const nextHeight = Math.round(nextWidth / ratio);
		selectedImg.style.width = `${nextWidth}px`;
		selectedImg.style.height = "auto";
		selectedImg.removeAttribute("width");
		selectedImg.removeAttribute("height");
		updateBadge(nextWidth, nextHeight, maxWidth);
		positionOverlay();
	}
	function preventTouchScroll(e) {
		e.preventDefault();
	}
	function endDrag({ commit = true } = {}) {
		if (!dragState) return;
		const { handle, pointerId } = dragState;
		try {
			handle.releasePointerCapture(pointerId);
		} catch {}
		handle.removeEventListener("pointermove", onHandlePointerMove);
		handle.removeEventListener("pointerup", onHandlePointerUp);
		handle.removeEventListener("pointercancel", onHandlePointerUp);
		window.removeEventListener("touchmove", preventTouchScroll);
		overlayHost.classList.remove("is-resizing");
		toolbar.style.visibility = "";
		dragState = null;
		dimBadge.hidden = true;
		if (commit) {
			renderToolbar();
			positionOverlay();
			onChange?.();
		}
	}
	function onHandlePointerUp() {
		endDrag({ commit: true });
	}
	function updateBadge(w, h, maxWidth) {
		const pct = Math.min(100, Math.round(w / maxWidth * 100));
		dimBadge.textContent = t("imageSize", {
			width: Math.round(w),
			height: Math.round(h),
			percent: pct
		});
	}
	function onSurfaceClick(e) {
		const img = e.target.closest("img");
		if (img && surface.contains(img)) {
			e.preventDefault();
			selectImage(img);
		} else if (selectedImg) deselect();
	}
	function onDocPointerDown(e) {
		if (!selectedImg) return;
		const path = e.composedPath();
		if (path.includes(selectedImg) || path.includes(box) || path.includes(toolbar)) return;
		if (editorToolbar && path.includes(editorToolbar)) {
			if (e.target?.closest("button[data-cmd^=align]")) return;
		}
		deselect();
	}
	function onDocKeyDown(e) {
		if (!selectedImg || altEditing) return;
		if (e.key === "Escape") {
			e.preventDefault();
			deselect();
			squire.focus();
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			deleteSelectedImage();
		} else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
			e.preventDefault();
			const img = selectedImg;
			const range = document.createRange();
			if (e.key === "ArrowLeft") range.setStartBefore(img);
			else range.setStartAfter(img);
			range.collapse(true);
			deselect();
			squire.setSelection(range).focus();
		}
	}
	async function insertImageFile(file) {
		if (!file || !file.type.startsWith("image/")) return null;
		onStatus?.(t("uploading", { name: file.name || "image" }));
		try {
			const uploader = getUploadHandler?.();
			const src = uploader ? await uploader(file) : await fileToDataUrl(file);
			if (!src || !isSafeUrl(src, "image")) throw new Error("Image URL rejected by sanitizer");
			const alt = (file.name || "").replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
			const img = squire.insertImage(src, {
				alt,
				style: "width: 75%; height: auto;"
			});
			onStatus?.("");
			onChange?.();
			if (img) {
				const selectNow = () => selectImage(img);
				if (img.complete) requestAnimationFrame(selectNow);
				else img.addEventListener("load", selectNow, { once: true });
			}
			return img;
		} catch (err) {
			onStatus?.(err instanceof Error && err.message || t("uploadFailed"));
			setTimeout(() => onStatus?.(""), 3e3);
			return null;
		}
	}
	function insertImageUrl(url, alt = "") {
		if (!isSafeUrl(url, "image")) return null;
		const img = squire.insertImage(url.trim(), {
			alt: alt.trim(),
			style: "width: 75%; height: auto;"
		});
		onChange?.();
		if (img) {
			const selectNow = () => selectImage(img);
			if (img.complete) requestAnimationFrame(selectNow);
			else img.addEventListener("load", selectNow, { once: true });
		}
		return img;
	}
	function onPasteImage(e) {
		const items = e.detail?.clipboardData?.items;
		if (!items) return;
		for (const item of items) if (item.type && item.type.startsWith("image/")) {
			const file = item.getAsFile();
			if (file) {
				insertImageFile(file);
				return;
			}
		}
	}
	function onDragOver(e) {
		if (!e.dataTransfer?.types?.includes("Files")) return;
		e.preventDefault();
		surface.classList.add("ve-drag-over");
	}
	function onDragLeave(e) {
		if (!surface.contains(e.relatedTarget)) surface.classList.remove("ve-drag-over");
	}
	function onDrop(e) {
		surface.classList.remove("ve-drag-over");
		const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"));
		if (!files.length) return;
		e.preventDefault();
		e.stopPropagation();
		deselect();
		for (const file of files) insertImageFile(file);
	}
	const onViewportChange = () => {
		if (selectedImg) positionOverlay();
	};
	const ro = new ResizeObserver(() => {
		if (selectedImg) positionOverlay();
	});
	ro.observe(surface);
	surface.addEventListener("click", onSurfaceClick);
	surface.addEventListener("dragover", onDragOver);
	surface.addEventListener("dragleave", onDragLeave);
	surface.addEventListener("drop", onDrop);
	squire.addEventListener("pasteImage", onPasteImage);
	document.addEventListener("pointerdown", onDocPointerDown, true);
	document.addEventListener("keydown", onDocKeyDown, true);
	window.addEventListener("scroll", onViewportChange, true);
	window.addEventListener("resize", onViewportChange);
	return {
		name: "imageResize",
		selectImage,
		deselect,
		applyAlignment,
		applyWidth,
		getAlignment: () => selectedImg ? selectedImg.getAttribute("data-align") || inferAlign(selectedImg) : null,
		insertImageFile,
		insertImageUrl,
		getSelectedImage: () => selectedImg,
		destroy() {
			deselect();
			ro.disconnect();
			surface.removeEventListener("click", onSurfaceClick);
			surface.removeEventListener("dragover", onDragOver);
			surface.removeEventListener("dragleave", onDragLeave);
			surface.removeEventListener("drop", onDrop);
			squire.removeEventListener("pasteImage", onPasteImage);
			document.removeEventListener("pointerdown", onDocPointerDown, true);
			document.removeEventListener("keydown", onDocKeyDown, true);
			window.removeEventListener("scroll", onViewportChange, true);
			window.removeEventListener("resize", onViewportChange);
			box.remove();
			toolbar.remove();
		}
	};
}
function escapeAttr$1(str) {
	return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// src/extensions/bubble-menu.ts
/**
* Floating selection toolbar powered by native Popover API (`popover="manual"`)
* and CSS Anchor Positioning (with automatic rect fallback).
*/
const SUPPORTS_ANCHOR = typeof CSS !== "undefined" && CSS.supports("anchor-name: --a");
let anchorCounter = 0;
/** Commands that open a popover or panel: the menu closes instead of following the selection. */
const OPENS_UI = /* @__PURE__ */ new Set([
	"link",
	"image",
	"find"
]);
function createBubbleMenuExtension({ squire, surface, overlayHost, onCommand, onOpenLink, isImageSelected, renderIcon = icon, label = "Text formatting", renderButtons, runCommand, syncButtons }) {
	const anchorName = `--ve-sel-anchor-${++anchorCounter}`;
	const anchor = document.createElement("div");
	anchor.className = "ve-virtual-anchor";
	if (SUPPORTS_ANCHOR) anchor.style.setProperty("anchor-name", anchorName);
	overlayHost.appendChild(anchor);
	const menu = document.createElement("div");
	menu.className = "ve-popover ve-bubble-menu";
	menu.setAttribute("popover", "manual");
	menu.setAttribute("role", "toolbar");
	menu.setAttribute("aria-label", label);
	if (SUPPORTS_ANCHOR) menu.style.setProperty("position-anchor", anchorName);
	const defaultButtons = () => `
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="bold" title="Bold (Ctrl+B)">${renderIcon("bold", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="italic" title="Italic (Ctrl+I)">${renderIcon("italic", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="underline" title="Underline (Ctrl+U)">${renderIcon("underline", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="strike" title="Strikethrough">${renderIcon("strike", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="code" title="Code">${renderIcon("code", 14)}</button>
    <span class="ve-sep"></span>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="link" title="Link (Ctrl+K)">${renderIcon("link", 14)}</button>
  `;
	let empty = false;
	function refresh() {
		const html = (renderButtons ?? defaultButtons)().trim();
		empty = !html;
		menu.innerHTML = html;
		if (empty) hide();
	}
	refresh();
	overlayHost.appendChild(menu);
	let visible = false;
	let rafId = 0;
	menu.addEventListener("mousedown", (e) => {
		e.preventDefault();
	});
	menu.addEventListener("click", (e) => {
		const btn = e.target.closest("button[data-cmd]");
		const cmd = btn?.dataset.cmd;
		if (!cmd || btn?.disabled) return;
		if (OPENS_UI.has(cmd)) hide();
		if (runCommand) runCommand(cmd);
		else if (cmd === "link") onOpenLink?.();
		else {
			execCommand(squire, cmd);
			onCommand?.();
		}
		if (OPENS_UI.has(cmd)) return;
		syncActive();
		scheduleUpdate();
	});
	function syncActive() {
		if (syncButtons) {
			syncButtons(menu);
			return;
		}
		const active = getActiveState(squire);
		for (const btn of menu.querySelectorAll("button[data-cmd]")) {
			const isOn = Boolean(active[btn.dataset.cmd]);
			btn.classList.toggle("is-active", isOn);
			btn.setAttribute("aria-pressed", String(isOn));
		}
	}
	function show() {
		if (!visible) {
			visible = true;
			try {
				if (!menu.matches(":popover-open")) menu.showPopover();
			} catch {
				menu.hidden = false;
			}
		}
	}
	function hide() {
		if (visible) {
			visible = false;
			try {
				if (menu.matches(":popover-open")) menu.hidePopover();
			} catch {
				menu.hidden = true;
			}
		}
	}
	function update() {
		if (empty || isImageSelected?.()) {
			hide();
			return;
		}
		const sel = window.getSelection();
		if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
			hide();
			return;
		}
		const range = sel.getRangeAt(0);
		if (!surface.contains(range.commonAncestorContainer)) {
			hide();
			return;
		}
		const text = sel.toString();
		if (!text || !text.trim()) {
			hide();
			return;
		}
		const rect = range.getBoundingClientRect();
		if (!rect || rect.width === 0 && rect.height === 0) {
			hide();
			return;
		}
		syncActive();
		if (SUPPORTS_ANCHOR) {
			anchor.style.top = `${rect.top}px`;
			anchor.style.left = `${rect.left}px`;
			anchor.style.width = `${Math.max(1, rect.width)}px`;
			anchor.style.height = `${Math.max(1, rect.height)}px`;
			show();
		} else {
			show();
			const menuRect = menu.getBoundingClientRect();
			let top = rect.top - menuRect.height - 8;
			if (top < 8) top = rect.bottom + 8;
			let left = rect.left + rect.width / 2 - menuRect.width / 2;
			left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));
			menu.style.top = `${Math.round(top)}px`;
			menu.style.left = `${Math.round(left)}px`;
		}
	}
	function scheduleUpdate() {
		cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(update);
	}
	const onBlur = () => hide();
	document.addEventListener("selectionchange", scheduleUpdate);
	window.addEventListener("scroll", scheduleUpdate, true);
	window.addEventListener("resize", scheduleUpdate);
	squire.addEventListener("blur", onBlur);
	return {
		name: "bubbleMenu",
		hide,
		update: scheduleUpdate,
		refresh() {
			refresh();
			if (visible) syncActive();
		},
		destroy() {
			cancelAnimationFrame(rafId);
			hide();
			document.removeEventListener("selectionchange", scheduleUpdate);
			window.removeEventListener("scroll", scheduleUpdate, true);
			window.removeEventListener("resize", scheduleUpdate);
			squire.removeEventListener("blur", onBlur);
			anchor.remove();
			menu.remove();
		}
	};
}
// src/extensions/find-replace.ts
/**
* Non-destructive Find & Replace extension powered by the native
* CSS Custom Highlight API (`CSS.highlights` + `::highlight(...)`).
* Highlights matches directly in the browser paint layer without mutating `contenteditable`.
*/
const SUPPORTS_HIGHLIGHTS = typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";
function createFindReplaceExtension({ surface, barSlot, squire, onChange, renderIcon = icon, t = defaultTranslate }) {
	const bar = document.createElement("div");
	bar.className = "ve-find-bar";
	bar.hidden = true;
	bar.innerHTML = `
    <div class="ve-find-row">
      <input type="search" class="ve-input ve-input--sm" data-find-input data-ve-placeholder="findPlaceholder" data-ve-aria-label="findLabel" />
      <span class="ve-find-count" data-find-count></span>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="prev" data-ve-title="previousMatch" data-ve-aria-label="previousMatch">↑</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="next" data-ve-title="nextMatch" data-ve-aria-label="nextMatch">↓</button>
      <input type="text" class="ve-input ve-input--sm" data-replace-input data-ve-placeholder="replacePlaceholder" data-ve-aria-label="replaceLabel" />
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="replace" data-ve-text="replace"></button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="replace-all" data-ve-text="replaceAll"></button>
      <button type="button" class="ve-btn ve-btn--sm" data-action="close" data-ve-title="close" data-ve-aria-label="close">${renderIcon("x", 14)}</button>
    </div>
  `;
	applyLabels(bar, t);
	barSlot.appendChild(bar);
	const findInput = bar.querySelector("[data-find-input]");
	const replaceInput = bar.querySelector("[data-replace-input]");
	const countEl = bar.querySelector("[data-find-count]");
	const zeroCount = () => t("matchCount", {
		current: 0,
		total: 0
	});
	countEl.textContent = zeroCount();
	let matches = [];
	let activeIndex = -1;
	function clearHighlights() {
		if (!SUPPORTS_HIGHLIGHTS) return;
		CSS.highlights.delete("ve-find");
		CSS.highlights.delete("ve-find-active");
	}
	function computeMatches() {
		clearHighlights();
		matches = [];
		const query = findInput.value;
		if (!query) {
			activeIndex = -1;
			countEl.textContent = zeroCount();
			return;
		}
		const needle = query.toLowerCase();
		const walker = document.createTreeWalker(surface, NodeFilter.SHOW_TEXT);
		let node;
		while (node = walker.nextNode()) {
			const haystack = (node.nodeValue || "").toLowerCase();
			let idx = 0;
			while ((idx = haystack.indexOf(needle, idx)) !== -1) {
				const range = new Range();
				range.setStart(node, idx);
				range.setEnd(node, idx + needle.length);
				matches.push(range);
				idx += needle.length;
			}
		}
		if (matches.length === 0) activeIndex = -1;
		else if (activeIndex < 0 || activeIndex >= matches.length) activeIndex = 0;
		paintHighlights();
	}
	function paintHighlights() {
		countEl.textContent = matches.length ? t("matchCount", {
			current: activeIndex + 1,
			total: matches.length
		}) : zeroCount();
		if (!SUPPORTS_HIGHLIGHTS || matches.length === 0) return;
		const all = new Highlight(...matches);
		CSS.highlights.set("ve-find", all);
		if (activeIndex >= 0 && matches[activeIndex]) {
			CSS.highlights.set("ve-find-active", new Highlight(matches[activeIndex]));
			const rect = matches[activeIndex].getBoundingClientRect();
			if (rect.top < 0 || rect.bottom > window.innerHeight) matches[activeIndex].startContainer.parentElement?.scrollIntoView({
				block: "nearest",
				behavior: "smooth"
			});
		}
	}
	function step(delta) {
		if (!matches.length) return;
		activeIndex = (activeIndex + delta + matches.length) % matches.length;
		paintHighlights();
	}
	function replaceCurrent() {
		if (activeIndex < 0 || !matches[activeIndex]) return;
		const replacement = replaceInput.value;
		squire.saveUndoState();
		const range = matches[activeIndex];
		range.deleteContents();
		if (replacement) range.insertNode(document.createTextNode(replacement));
		surface.normalize();
		onChange?.();
		computeMatches();
	}
	function replaceAll() {
		if (!matches.length) return;
		const replacement = replaceInput.value;
		squire.saveUndoState();
		for (let i = matches.length - 1; i >= 0; i -= 1) {
			const range = matches[i];
			range.deleteContents();
			if (replacement) range.insertNode(document.createTextNode(replacement));
		}
		surface.normalize();
		onChange?.();
		computeMatches();
	}
	function open() {
		bar.hidden = false;
		const selected = window.getSelection()?.toString().trim();
		if (selected && !selected.includes("\n")) findInput.value = selected;
		computeMatches();
		findInput.focus();
		findInput.select();
	}
	function close() {
		bar.hidden = true;
		clearHighlights();
		matches = [];
		activeIndex = -1;
		squire.focus();
	}
	function toggle() {
		if (bar.hidden) open();
		else close();
	}
	findInput.addEventListener("input", () => computeMatches());
	findInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			step(e.shiftKey ? -1 : 1);
		} else if (e.key === "Escape") {
			e.preventDefault();
			close();
		}
	});
	replaceInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			replaceCurrent();
		} else if (e.key === "Escape") {
			e.preventDefault();
			close();
		}
	});
	bar.addEventListener("click", (e) => {
		const btn = e.target.closest("button[data-action]");
		if (!btn) return;
		switch (btn.dataset.action) {
			case "prev":
				step(-1);
				break;
			case "next":
				step(1);
				break;
			case "replace":
				replaceCurrent();
				break;
			case "replace-all":
				replaceAll();
				break;
			case "close": close();
		}
	});
	const onEditorInput = () => {
		if (!bar.hidden && findInput.value) computeMatches();
	};
	squire.addEventListener("input", onEditorInput);
	return {
		name: "findReplace",
		open,
		close,
		toggle,
		destroy() {
			clearHighlights();
			squire.removeEventListener("input", onEditorInput);
			bar.remove();
		}
	};
}
// src/toolbar.ts
const BUILTIN_BUTTONS = Object.freeze({
	bold: {
		icon: "bold",
		label: "bold"
	},
	italic: {
		icon: "italic",
		label: "italic"
	},
	underline: {
		icon: "underline",
		label: "underline"
	},
	strike: {
		icon: "strike",
		label: "strike"
	},
	code: {
		icon: "code",
		label: "code"
	},
	paragraph: {
		icon: "paragraph",
		label: "paragraph"
	},
	h1: {
		icon: "h1",
		label: "h1"
	},
	h2: {
		icon: "h2",
		label: "h2"
	},
	h3: {
		icon: "h3",
		label: "h3"
	},
	bulletList: {
		icon: "bulletList",
		label: "bulletList"
	},
	orderedList: {
		icon: "orderedList",
		label: "orderedList"
	},
	blockquote: {
		icon: "quote",
		label: "blockquote"
	},
	hr: {
		icon: "hr",
		label: "hr"
	},
	alignLeft: {
		icon: "alignLeft",
		label: "alignLeft"
	},
	alignCenter: {
		icon: "alignCenter",
		label: "alignCenter"
	},
	alignRight: {
		icon: "alignRight",
		label: "alignRight"
	},
	link: {
		icon: "link",
		label: "link"
	},
	image: {
		icon: "image",
		label: "image"
	},
	clearFormatting: {
		icon: "clear",
		label: "clearFormatting"
	},
	undo: {
		icon: "undo",
		label: "undo"
	},
	redo: {
		icon: "redo",
		label: "redo"
	},
	find: {
		icon: "search",
		label: "find"
	}
});
/** Names of all built-in toolbar buttons. */
const BUTTON_NAMES = Object.freeze(Object.keys(BUILTIN_BUTTONS));
/** Built-in commands without a button (they run with `exec()` and shortcuts). */
const BUTTONLESS_COMMANDS = Object.freeze([
	"makeLink",
	"removeLink",
	"subscript",
	"superscript",
	"indent",
	"outdent"
]);
/** The default toolbar layout. */
const DEFAULT_TOOLBAR = Object.freeze(parseItems("bold italic underline strike code | paragraph h1 h2 h3 | bulletList orderedList blockquote hr | alignLeft alignCenter alignRight | link image clearFormatting | undo redo find"));
/** The default selection (bubble) menu layout. */
const DEFAULT_BUBBLE_MENU = Object.freeze(parseItems("bold italic underline strike code | link"));
/** Split a layout string (`"bold italic | link"`, commas allowed) into items. */
function parseItems(layout) {
	return layout.replace(/\|/g, " | ").split(/[\s,]+/).filter(Boolean);
}
/** Normalize a layout given as a string or an array. `null` means the default layout. */
function toItems(layout) {
	if (layout == null) return null;
	if (typeof layout === "string") {
		const trimmed = layout.trim();
		if (trimmed === "" || trimmed === "default") return null;
		if (trimmed === "none") return [];
		return parseItems(trimmed);
	}
	return layout.flatMap((item) => parseItems(String(item)));
}
const globalButtons = /* @__PURE__ */ new Map();
const buttonListeners = /* @__PURE__ */ new Set();
/**
* Register a custom button for every <vanilia-editor> on the page. Editors with
* the default layout show it in a group at the end of the toolbar; editors with a
* custom `toolbar` layout show it where its name appears.
*/
function defineButton(button) {
	globalButtons.set(validateButton(button).name, button);
	for (const listener of buttonListeners) listener();
}
/** Remove a button registered with `defineButton()`. */
function undefineButton(name) {
	if (globalButtons.delete(name)) for (const listener of buttonListeners) listener();
}
/** Buttons registered with `defineButton()`. */
function getDefinedButtons() {
	return globalButtons;
}
/** Subscribe to `defineButton()` / `undefineButton()`; returns an unsubscribe function. */
function onButtonsChange(listener) {
	buttonListeners.add(listener);
	return () => {
		buttonListeners.delete(listener);
	};
}
function validateButton(button) {
	if (!button || typeof button.name !== "string" || !/^[\w-]+$/.test(button.name)) throw new TypeError("Toolbar button needs a name made of letters, digits, _ or -");
	if (button.name in BUILTIN_BUTTONS || BUTTONLESS_COMMANDS.includes(button.name)) throw new TypeError(`"${button.name}" is a built-in command`);
	if (typeof button.run !== "function") throw new TypeError(`Toolbar button "${button.name}" needs a run() function`);
	return button;
}
// src/shortcuts.ts
/** The built-in shortcuts. */
const DEFAULT_SHORTCUTS = Object.freeze({
	bold: ["Mod+B"],
	italic: ["Mod+I"],
	underline: ["Mod+U"],
	strike: ["Mod+Shift+X", "Mod+Shift+7"],
	code: ["Mod+D"],
	subscript: ["Mod+Shift+5"],
	superscript: ["Mod+Shift+6"],
	bulletList: ["Mod+Shift+8"],
	orderedList: ["Mod+Shift+9"],
	outdent: ["Mod+["],
	indent: ["Mod+]"],
	link: ["Mod+K"],
	find: ["Mod+F"],
	undo: ["Mod+Z"],
	redo: ["Mod+Shift+Z", "Mod+Y"]
});
const globalShortcuts = /* @__PURE__ */ new Map();
const shortcutListeners = /* @__PURE__ */ new Set();
/** Write shortcut overrides into `target`; `null` deletes an entry, `false` stores "none". */
function mergeShortcuts(target, map) {
	for (const [name, value] of Object.entries(map)) if (value == null) target.delete(name);
	else if (value === false || value === "") target.set(name, []);
	else target.set(name, (typeof value === "string" ? [value] : [...value]).filter(Boolean));
}
/**
* Override shortcuts for every <vanilia-editor> on the page (mounted editors update).
*
*   setShortcuts({ bold: "Mod+Shift+B", find: false, h2: "Mod+Alt+2" });
*/
function setShortcuts(map = {}) {
	mergeShortcuts(globalShortcuts, map);
	for (const listener of shortcutListeners) listener();
}
/** Global overrides set with `setShortcuts()`. */
function getGlobalShortcuts() {
	return globalShortcuts;
}
/** Subscribe to `setShortcuts()`; returns an unsubscribe function. */
function onShortcutsChange(listener) {
	shortcutListeners.add(listener);
	return () => {
		shortcutListeners.delete(listener);
	};
}
const IS_MAC = typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform || "");
const MODIFIER_ORDER = [
	"Alt",
	"Ctrl",
	"Meta",
	"Shift"
];
/** Split `"Mod+Shift+X"` into platform modifiers and the key. `+` alone is a valid key. */
function parse(shortcut) {
	const parts = shortcut.trim().split(/\+(?!$)/);
	const key = parts.pop() ?? "";
	return {
		mods: new Set(parts.map((p) => {
			const m = p.trim();
			if (m === "Mod") return IS_MAC ? "Meta" : "Ctrl";
			if (m === "Cmd" || m === "Command") return "Meta";
			if (m === "Control") return "Ctrl";
			if (m === "Option") return "Alt";
			return m;
		})),
		key
	};
}
/**
* Squire key-handler names for a shortcut, e.g. `["Ctrl-Shift-x", "Ctrl-Shift-X"]`:
* modifiers in Squire's order, and both letter cases (Shift may or may not upper-case it).
*/
function squireKeys(shortcut) {
	const { mods, key } = parse(shortcut);
	const prefix = MODIFIER_ORDER.filter((m) => mods.has(m)).map((m) => `${m}-`).join("");
	const variants = key.length === 1 ? [key.toLowerCase(), key.toUpperCase()] : [key];
	return [...new Set(variants)].map((k) => prefix + k);
}
/** Format a shortcut for the current platform: `⇧⌘X` on macOS, `Ctrl+Shift+X` elsewhere. */
function formatShortcut(shortcut) {
	const { mods, key } = parse(shortcut);
	const label = key.length === 1 ? key.toUpperCase() : key;
	if (IS_MAC) {
		const symbols = {
			Ctrl: "⌃",
			Alt: "⌥",
			Shift: "⇧",
			Meta: "⌘"
		};
		return [
			"Ctrl",
			"Alt",
			"Shift",
			"Meta"
		].filter((m) => mods.has(m)).map((m) => symbols[m]).join("").concat(label);
	}
	return [...[
		"Ctrl",
		"Meta",
		"Alt",
		"Shift"
	].filter((m) => mods.has(m)), label].join("+");
}
/** `aria-keyshortcuts` value for a shortcut, e.g. `"Control+Shift+X"`. */
function ariaShortcut(shortcut) {
	const { mods, key } = parse(shortcut);
	const names = {
		Ctrl: "Control",
		Meta: "Meta",
		Alt: "Alt",
		Shift: "Shift"
	};
	const label = key.length === 1 ? key.toUpperCase() : key;
	return [...MODIFIER_ORDER.filter((m) => mods.has(m)).map((m) => names[m]), label].join("+");
}
/**
* Squire's own default key handlers that a removed or remapped shortcut must not fall back
* to. Keys the browser would also format natively (bold, italic, underline, undo, redo) are
* blocked; the others fall through to the browser (e.g. Ctrl+F opens the browser's find).
*/
const SQUIRE_DEFAULT_KEYS = Object.freeze(Object.values(DEFAULT_SHORTCUTS).flat());
/** Keys whose browser default would edit the content itself. */
const NATIVE_EDITING_KEYS = new Set([
	"Mod+B",
	"Mod+I",
	"Mod+U",
	"Mod+Z",
	"Mod+Y",
	"Mod+Shift+Z"
].flatMap(squireKeys));
// src/theme.ts
/**
* Typed access to the `--ve-*` CSS custom properties. CSS stays the source of
* truth: `setTheme()` and `editor.setTheme()` only write those properties.
*/
/** Theme tokens, camelCased: `accentContrast` is `--ve-accent-contrast`. */
const THEME_TOKENS = Object.freeze([
	"accent",
	"accentContrast",
	"accentSoft",
	"accentRing",
	"accentBorder",
	"accentHover",
	"danger",
	"dangerSoft",
	"bg",
	"surfaceBg",
	"chromeBg",
	"popoverBg",
	"hoverBg",
	"codeBg",
	"shadow",
	"border",
	"borderStrong",
	"text",
	"textMuted",
	"radius",
	"radiusSm",
	"minHeight",
	"maxHeight",
	"paddingX",
	"paddingY",
	"fontSize",
	"lineHeight",
	"fontSans",
	"fontMono",
	"highlightBg",
	"highlightActiveBg",
	"highlightActiveText",
	"iconSize",
	"iconSizeSm",
	"iconStroke"
]);
const TOKEN_SET = new Set(THEME_TOKENS);
/** The CSS custom property of a token: `tokenVar("accentSoft")` is `"--ve-accent-soft"`. */
function tokenVar(token) {
	return `--ve-${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}
/** Set or remove token properties on an element's inline style. */
function applyTokens(style, tokens) {
	for (const [token, value] of Object.entries(tokens)) {
		if (!TOKEN_SET.has(token)) {
			console.warn(`[vanilia-editor] unknown theme token "${token}"`);
			continue;
		}
		const prop = tokenVar(token);
		if (value == null || value === "") style.removeProperty(prop);
		else style.setProperty(prop, String(value));
	}
}
let globalRule = null;
/**
* Set tokens for every editor on the page. Writes one unlayered `:root` rule, so it
* beats the built-in defaults but loses to per-editor CSS and `editor.setTheme()`.
*
*   setTheme({ accent: "#e11d48", radius: "8px" });
*/
function setTheme(tokens = {}) {
	if (typeof document === "undefined") return;
	if (!globalRule) {
		const style = document.createElement("style");
		style.dataset.vaniliaTheme = "";
		style.textContent = ":root {}";
		document.head.append(style);
		globalRule = style.sheet.cssRules[0];
	}
	applyTokens(globalRule.style, tokens);
}
// src/vanilia-editor.ts
/** Built-in commands that a shortcut can run. */
const COMMANDS = /* @__PURE__ */ new Set([...BUTTON_NAMES, ...BUTTONLESS_COMMANDS]);
/**
* <vanilia-editor> — Form-Associated Custom Element (ElementInternals)
* powered by vendored Fastmail Squire + modular modern Web/CSS API extensions.
*/
const BaseHTMLElement = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
var VaniliaEditorElement = class extends BaseHTMLElement {
	static formAssociated = true;
	static observedAttributes = [
		"placeholder",
		"disabled",
		"required",
		"upload-url",
		"toolbar",
		"bubble-menu",
		"shortcuts"
	];
	/** Override icons for every editor on the page (same as the `setIcons` export). */
	static setIcons(map) {
		setIcons(map);
	}
	/** Names of all overridable icons. */
	static get iconNames() {
		return ICON_NAMES;
	}
	/** Override labels for every editor on the page (same as the `setLabels` export). */
	static setLabels(map) {
		setLabels(map);
	}
	/** Names of all labels. */
	static get labelNames() {
		return LABEL_NAMES;
	}
	/** Register a custom button for every editor on the page (same as the `defineButton` export). */
	static defineButton(button) {
		defineButton(button);
	}
	/** Remove a button registered with `defineButton()`. */
	static undefineButton(name) {
		undefineButton(name);
	}
	/** Names of the built-in toolbar buttons. */
	static get buttonNames() {
		return BUTTON_NAMES;
	}
	/** Override keyboard shortcuts for every editor on the page (same as the `setShortcuts` export). */
	static setShortcuts(map) {
		setShortcuts(map);
	}
	/** Set theme tokens for every editor on the page (same as the `setTheme` export). */
	static setTheme(tokens) {
		setTheme(tokens);
	}
	/** Names of all theme tokens. */
	static get themeTokens() {
		return THEME_TOKENS;
	}
	#iconOverrides = /* @__PURE__ */ new Map();
	#icon = (name, size) => icon(name, size, this.#iconOverrides);
	#labelOverrides = /* @__PURE__ */ new Map();
	#t = createTranslator(this.#labelOverrides);
	#buttons = /* @__PURE__ */ new Map();
	#shortcutOverrides = /* @__PURE__ */ new Map();
	#unsubscribers = [];
	#internals;
	#squire = null;
	#extensions = [];
	#imageResize = null;
	#bubbleMenu = null;
	#findReplace = null;
	#root = null;
	#toolbar = null;
	#surface = null;
	#overlayHost = null;
	#statusEl = null;
	#linkPopover = null;
	#imagePopover = null;
	#fileInput = null;
	#initialHTML = "";
	#pendingValue = null;
	#savedRange = null;
	#canUndo = false;
	#canRedo = false;
	#mounted = false;
	#waitingForParse = false;
	#uploadHandler = null;
	constructor() {
		super();
		this.#internals = this.attachInternals();
		this.#internals.role = "group";
	}
	/** Optional JS hook: `(file: File) => Promise<string>` returning an image URL */
	get onImageUpload() {
		return this.#uploadHandler;
	}
	set onImageUpload(fn) {
		this.#uploadHandler = typeof fn === "function" ? fn : null;
	}
	get value() {
		if (!this.#squire) return this.#pendingValue ?? this.getAttribute("value") ?? "";
		return this.getHTML();
	}
	set value(html) {
		const str = html == null ? "" : String(html);
		if (!this.#squire) {
			this.#pendingValue = str;
			return;
		}
		if (str === this.getHTML()) return;
		this.setHTML(str);
	}
	/**
	* Toolbar layout, reflected to the `toolbar` attribute. Reads back the layout in use;
	* set a string (`"bold italic | link"`), an array, `"none"`, or `null` for the default.
	*/
	get toolbar() {
		return this.#toolbarItems();
	}
	set toolbar(layout) {
		this.#reflectLayout("toolbar", layout);
	}
	/** Selection (bubble) menu layout, reflected to the `bubble-menu` attribute. Same values as `toolbar`. */
	get bubbleMenu() {
		return this.#bubbleItems();
	}
	set bubbleMenu(layout) {
		this.#reflectLayout("bubble-menu", layout);
	}
	/** Color scheme, reflected to the `theme` attribute: `"light"`, `"dark"` or `"auto"` (follow the page). */
	get theme() {
		const value = this.getAttribute("theme");
		return value === "light" || value === "dark" ? value : "auto";
	}
	set theme(scheme) {
		if (scheme === "light" || scheme === "dark") this.setAttribute("theme", scheme);
		else this.removeAttribute("theme");
	}
	/** The underlying Squire instance (advanced; `null` until the editor is connected). */
	get squire() {
		return this.#squire;
	}
	get form() {
		return this.#internals.form;
	}
	get validity() {
		return this.#internals.validity;
	}
	get validationMessage() {
		return this.#internals.validationMessage;
	}
	checkValidity() {
		return this.#internals.checkValidity();
	}
	reportValidity() {
		return this.#internals.reportValidity();
	}
	connectedCallback() {
		if (this.#mounted) {
			this.#syncFormState();
			return;
		}
		if (document.readyState === "loading") {
			if (!this.#waitingForParse) {
				this.#waitingForParse = true;
				document.addEventListener("DOMContentLoaded", () => {
					this.#waitingForParse = false;
					if (this.isConnected) this.connectedCallback();
				}, { once: true });
			}
			return;
		}
		for (const tpl of this.querySelectorAll(":scope > template[data-ve-icon]")) {
			const name = tpl.dataset.veIcon;
			if (name) this.#iconOverrides.set(name, tpl.innerHTML.trim());
			tpl.remove();
		}
		for (const tpl of this.querySelectorAll(":scope > template[data-ve-labels]")) {
			try {
				mergeLabels(this.#labelOverrides, JSON.parse(tpl.content.textContent || "{}"));
			} catch (err) {
				console.error("[vanilia-editor] invalid JSON in <template data-ve-labels>", err);
			}
			tpl.remove();
		}
		for (const tpl of this.querySelectorAll(":scope > template[data-ve-shortcuts]")) {
			try {
				mergeShortcuts(this.#shortcutOverrides, JSON.parse(tpl.content.textContent || "{}"));
			} catch (err) {
				console.error("[vanilia-editor] invalid JSON in <template data-ve-shortcuts>", err);
			}
			tpl.remove();
		}
		if (this.#pendingValue !== null) {
			this.#initialHTML = this.#pendingValue;
			this.#pendingValue = null;
		} else if (this.hasAttribute("value")) this.#initialHTML = this.getAttribute("value") || "";
		else {
			const tpl = this.querySelector(":scope > template");
			this.#initialHTML = tpl ? tpl.innerHTML.trim() : this.innerHTML.trim();
		}
		this.#buildDOM();
		this.#initEditor();
		this.#mounted = true;
		this.#unsubscribers = [
			onIconsChange(() => this.#refreshIcons()),
			onLabelsChange(() => this.#refreshLabels()),
			onButtonsChange(() => this.#renderButtons()),
			onShortcutsChange(() => this.#renderButtons())
		];
		this.#bindShortcuts();
		if (this.#initialHTML) this.setHTML(this.#initialHTML, { silent: true });
		this.#applyDisabled(this.hasAttribute("disabled"));
		this.#syncFormState();
		this.#syncToolbar();
	}
	disconnectedCallback() {
		if (this.#squire) this.#pendingValue = this.getHTML();
		this.#teardown();
	}
	attributeChangedCallback(name, _oldVal, newVal) {
		if (!this.#mounted) return;
		if (name === "placeholder") this.#syncPlaceholder();
		else if (name === "disabled") this.#applyDisabled(newVal !== null);
		else if (name === "required") this.#syncFormState();
		else if (name === "toolbar" || name === "bubble-menu" || name === "shortcuts") this.#renderButtons();
	}
	formDisabledCallback(disabled) {
		this.#applyDisabled(disabled);
	}
	formResetCallback() {
		this.setHTML(this.#initialHTML || "");
	}
	formStateRestoreCallback(state) {
		if (typeof state === "string") this.setHTML(state);
	}
	getHTML() {
		if (!this.#squire) return this.#pendingValue || "";
		const normalized = normalizeExportHTML(this.#squire.getHTML());
		if (normalized === "<p><br></p>" || normalized === "<p></p>" || normalized === "<div><br></div>") return "";
		return normalized;
	}
	getFormattedHTML() {
		return formatHTML(this.getHTML());
	}
	getText() {
		return (this.#surface?.textContent || "").trim();
	}
	setHTML(html, { silent = false } = {}) {
		if (!this.#squire) {
			this.#pendingValue = html || "";
			return;
		}
		this.#imageResize?.deselect();
		this.#squire.setHTML(html || "");
		this.#syncFormState();
		this.#syncToolbar();
		if (silent) this.#emitStateEvent();
		else this.#emitUpdate();
	}
	/**
	* Run a command, or the custom button of that name. `arg` is the URL for `makeLink`.
	*/
	exec(command, arg) {
		if (!this.#squire || this.hasAttribute("disabled")) return;
		const custom = this.#customButton(command);
		if (custom) {
			if (this.#safeCall(custom, "isEnabled") === false) return;
			custom.run(this);
			this.#syncToolbar();
			this.#emitStateEvent();
			return;
		}
		if (command === "link") {
			this.#openLinkPopover();
			return;
		}
		if (command === "image") {
			this.#openImagePopover();
			return;
		}
		if (command === "find") {
			this.#findReplace?.toggle();
			return;
		}
		if (command === "alignLeft" || command === "alignCenter" || command === "alignRight") {
			const align = command === "alignCenter" ? "center" : command === "alignRight" ? "right" : "left";
			const targetImg = this.#imageResize?.getSelectedImage() || this.#findImageOnlyBlock();
			if (targetImg) {
				if (!this.#imageResize?.getSelectedImage()) this.#imageResize?.selectImage(targetImg);
				this.#imageResize?.applyAlignment(align);
				this.#syncToolbar();
				return;
			}
		}
		execCommand(this.#squire, command, arg);
		this.#syncFormState();
		this.#syncToolbar();
		this.#emitUpdate();
	}
	isActive(name, attrs) {
		return isActive(this.#squire, name, attrs);
	}
	/**
	* Override icons for this editor only. Pass `null` for a name to fall back
	* to the global `setIcons()` registry / built-in icon.
	*/
	setIcons(map = {}) {
		for (const [name, markup] of Object.entries(map)) if (markup == null || markup === "") this.#iconOverrides.delete(name);
		else this.#iconOverrides.set(name, String(markup));
		this.#refreshIcons();
	}
	/**
	* Override labels for this editor only. Pass `null` for a name to fall back to the
	* global `setLabels()` registry / built-in English text.
	*/
	setLabels(map = {}) {
		mergeLabels(this.#labelOverrides, map);
		this.#refreshLabels();
	}
	/**
	* Override keyboard shortcuts for this editor, by command or button name: a combination
	* like `"Mod+Shift+B"`, several, `false` to remove them, or `null` to restore the default.
	*/
	setShortcuts(map = {}) {
		mergeShortcuts(this.#shortcutOverrides, map);
		this.#renderButtons();
	}
	/** The shortcuts in effect, by command or button name (`{ bold: ["Mod+B"], ... }`). */
	getShortcuts() {
		return Object.fromEntries(this.#effectiveShortcuts());
	}
	/** Set theme tokens on this editor (inline `--ve-*` properties). `null` removes one. */
	setTheme(tokens = {}) {
		applyTokens(this.style, tokens);
	}
	/**
	* Add a custom button to this editor. With the default layout it appears in a group
	* at the end of the toolbar; with a custom `toolbar` layout, where its name appears.
	* Adding a button with an existing name replaces it.
	*/
	addButton(button) {
		this.#buttons.set(validateButton(button).name, button);
		this.#renderButtons();
	}
	/** Remove a button added with `addButton()`. */
	removeButton(name) {
		if (this.#buttons.delete(name)) this.#renderButtons();
	}
	insertImage(url, alt = "") {
		return this.#imageResize?.insertImageUrl(url, alt) ?? null;
	}
	/** Insert HTML at the cursor (sanitized like pasted content), replacing the selection. */
	insertHTML(html) {
		if (!this.#squire) return;
		this.#squire.insertHTML(html);
		this.#afterChange();
	}
	/** Insert plain text at the cursor, replacing the selection. */
	insertText(text) {
		if (!this.#squire) return;
		this.#squire.insertPlainText(text, false);
		this.#afterChange();
	}
	/** The selected text (`""` when the selection is collapsed). */
	getSelectedText() {
		return this.#squire?.getSelectedText() ?? "";
	}
	focus() {
		this.#squire?.focus();
	}
	#buildDOM() {
		this.innerHTML = "";
		const root = document.createElement("div");
		root.className = "ve-root";
		root.setAttribute("data-ignore", "");
		root.innerHTML = `
      <div class="ve-toolbar" role="toolbar" data-ve-aria-label="toolbar"></div>

      <div class="ve-find-slot"></div>

      <div class="ve-stage">
        <div
          class="ve-surface"
          role="textbox"
          aria-multiline="true"
          data-ve-aria-label="editor"
        ></div>
      </div>

      <div class="ve-footer">
        <span class="ve-status" data-status></span>
        <span class="ve-metrics" data-metrics></span>
      </div>

      <input type="file" accept="image/*" hidden data-file-input />

      <div class="ve-popover ve-form-popover" popover="auto" data-link-popover>
        <form class="ve-popover-form" data-link-form>
          <label class="ve-field">
            <span data-ve-text="linkUrl"></span>
            <input type="url" class="ve-input" name="href" data-ve-placeholder="linkUrlPlaceholder" required />
          </label>
          <div class="ve-popover-actions">
            <button type="button" class="ve-btn ve-btn--sm ve-btn--danger ve-btn--text" data-remove-link data-ve-text="removeLink" hidden></button>
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover data-ve-text="cancel"></button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text" data-ve-text="apply"></button>
          </div>
        </form>
      </div>

      <div class="ve-popover ve-form-popover" popover="auto" data-image-popover>
        <form class="ve-popover-form" data-image-form>
          <div class="ve-upload-row">
            <button type="button" class="ve-btn ve-btn--text ve-btn--upload" data-pick-file>
              ${this.#icon("upload", 15)}
              <span data-ve-text="chooseImageFile"></span>
            </button>
          </div>
          <div class="ve-divider-label"><span data-ve-text="orPasteUrl"></span></div>
          <label class="ve-field">
            <span data-ve-text="imageUrl"></span>
            <input type="url" class="ve-input" name="src" data-ve-placeholder="imageUrlPlaceholder" required />
          </label>
          <label class="ve-field">
            <span data-ve-text="altText"></span>
            <input type="text" class="ve-input" name="alt" data-ve-placeholder="altTextPlaceholder" />
          </label>
          <div class="ve-popover-actions">
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover data-ve-text="cancel"></button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text" data-ve-text="insert"></button>
          </div>
        </form>
      </div>
    `;
		this.appendChild(root);
		this.#root = root;
		this.#toolbar = root.querySelector(".ve-toolbar");
		this.#surface = root.querySelector(".ve-surface");
		this.#overlayHost = root.querySelector(".ve-stage");
		this.#statusEl = root.querySelector("[data-status]");
		this.#linkPopover = root.querySelector("[data-link-popover]");
		this.#imagePopover = root.querySelector("[data-image-popover]");
		this.#fileInput = root.querySelector("[data-file-input]");
		applyLabels(root, this.#t);
		this.#syncPlaceholder();
		this.#renderToolbar();
		this.#bindUIEvents();
	}
	#initEditor() {
		const surface = this.#surface;
		const overlayHost = this.#overlayHost;
		const squire = new Squire_default(surface, {
			blockTag: "P",
			sanitizeToDOMFragment
		});
		this.#squire = squire;
		const onEditorMutate = () => {
			this.#syncFormState();
			this.#syncToolbar();
			this.#emitUpdate();
		};
		this.#imageResize = createImageResizeExtension({
			squire,
			surface,
			overlayHost,
			editorToolbar: this.#toolbar,
			onChange: onEditorMutate,
			onSelectChange: () => {
				this.#syncToolbar();
				this.#emitStateEvent();
			},
			getUploadHandler: () => this.#resolveUploadHandler(),
			renderIcon: this.#icon,
			t: this.#t,
			onStatus: (msg) => {
				if (this.#statusEl) this.#statusEl.textContent = msg || "";
			}
		});
		this.#bubbleMenu = createBubbleMenuExtension({
			squire,
			surface,
			overlayHost,
			onCommand: onEditorMutate,
			onOpenLink: () => this.#openLinkPopover(),
			isImageSelected: () => Boolean(this.#imageResize?.getSelectedImage()),
			renderIcon: this.#icon,
			label: this.#t("bubbleMenu"),
			renderButtons: () => this.#renderItems(this.#bubbleItems(), 14),
			runCommand: (name) => this.exec(name),
			syncButtons: (menu) => this.#syncButtons(menu)
		});
		this.#findReplace = createFindReplaceExtension({
			surface,
			barSlot: this.#root.querySelector(".ve-find-slot"),
			squire,
			onChange: onEditorMutate,
			renderIcon: this.#icon,
			t: this.#t
		});
		this.#extensions = [
			this.#imageResize,
			this.#bubbleMenu,
			this.#findReplace
		];
		this.#bindShortcuts();
		const onSelectionState = () => {
			this.#syncToolbar();
			this.#emitStateEvent();
		};
		squire.addEventListener("input", onEditorMutate);
		squire.addEventListener("pathChange", onSelectionState);
		squire.addEventListener("select", onSelectionState);
		squire.addEventListener("cursor", onSelectionState);
		squire.addEventListener("undoStateChange", (e) => {
			const detail = e.detail;
			this.#canUndo = Boolean(detail?.canUndo);
			this.#canRedo = Boolean(detail?.canRedo);
			onSelectionState();
		});
		squire.addEventListener("blur", () => {
			this.dispatchEvent(new Event("change", {
				bubbles: true,
				composed: true
			}));
		});
	}
	#bindUIEvents() {
		const toolbar = this.#toolbar;
		const linkPopover = this.#linkPopover;
		const imagePopover = this.#imagePopover;
		const fileInput = this.#fileInput;
		toolbar.addEventListener("mousedown", (e) => {
			if (e.target.closest("button")) e.preventDefault();
		});
		toolbar.addEventListener("click", (e) => {
			const btn = e.target.closest("button[data-cmd]");
			if (!btn || btn.disabled) return;
			this.exec(btn.dataset.cmd);
		});
		const linkForm = linkPopover.querySelector("[data-link-form]");
		const hrefInput = linkForm.querySelector("input[name=\"href\"]");
		const removeLinkBtn = linkPopover.querySelector("[data-remove-link]");
		linkForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const href = hrefInput.value.trim();
			if (!isSafeUrl(href, "link")) return;
			this.#hidePopover(linkPopover);
			this.#restoreSavedRange();
			this.exec("makeLink", href);
		});
		removeLinkBtn.addEventListener("click", () => {
			this.#hidePopover(linkPopover);
			this.#restoreSavedRange();
			this.exec("removeLink");
		});
		linkPopover.querySelector("[data-close-popover]").addEventListener("click", () => {
			this.#hidePopover(linkPopover);
			this.#restoreSavedRange();
		});
		const imageForm = imagePopover.querySelector("[data-image-form]");
		const srcInput = imageForm.querySelector("input[name=\"src\"]");
		const altInput = imageForm.querySelector("input[name=\"alt\"]");
		imageForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const src = srcInput.value.trim();
			const alt = altInput.value.trim();
			if (!isSafeUrl(src, "image")) return;
			this.#hidePopover(imagePopover);
			this.#restoreSavedRange();
			this.#imageResize?.insertImageUrl(src, alt);
			imageForm.reset();
		});
		imagePopover.querySelector("[data-pick-file]").addEventListener("click", () => {
			this.#hidePopover(imagePopover);
			fileInput.value = "";
			fileInput.click();
		});
		imagePopover.querySelector("[data-close-popover]").addEventListener("click", () => {
			this.#hidePopover(imagePopover);
			this.#restoreSavedRange();
		});
		fileInput.addEventListener("change", () => {
			const file = fileInput.files?.[0];
			if (!file) return;
			this.#restoreSavedRange();
			this.#imageResize?.insertImageFile(file);
		});
	}
	#resolveUploadHandler() {
		if (this.#uploadHandler) return this.#uploadHandler;
		const uploadUrl = this.getAttribute("upload-url");
		if (!uploadUrl) return null;
		return async (file) => {
			const resp = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type || "application/octet-stream" },
				body: file
			});
			if (!resp.ok) {
				const text = await resp.text().catch(() => "");
				throw new Error(`Upload failed (${resp.status})${text ? `: ${text}` : ""}`);
			}
			const data = await resp.json();
			if (typeof data?.url !== "string" || !data.url) throw new Error("Upload endpoint did not return { url }");
			return data.url;
		};
	}
	#openLinkPopover() {
		const popover = this.#linkPopover;
		if (!this.#squire || !popover) return;
		this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;
		const existingHref = this.#findSelectedLinkHref();
		const hrefInput = popover.querySelector("input[name=\"href\"]");
		const removeBtn = popover.querySelector("[data-remove-link]");
		hrefInput.value = existingHref || "";
		removeBtn.hidden = !existingHref;
		this.#showPopoverNearButton(popover, this.#toolbar?.querySelector("[data-cmd=\"link\"]") ?? null);
		requestAnimationFrame(() => {
			hrefInput.focus();
			hrefInput.select();
		});
	}
	#openImagePopover() {
		const popover = this.#imagePopover;
		if (!this.#squire || !popover) return;
		this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;
		const form = popover.querySelector("[data-image-form]");
		form.reset();
		this.#showPopoverNearButton(popover, this.#toolbar?.querySelector("[data-cmd=\"image\"]") ?? null);
		requestAnimationFrame(() => form.querySelector("input[name=\"src\"]")?.focus());
	}
	#findSelectedLinkHref() {
		const anchor = this.#selectionElement()?.closest("a");
		return anchor && this.#surface?.contains(anchor) ? anchor.getAttribute("href") || "" : "";
	}
	/** The element containing the selection (the parent element for a text node). */
	#selectionElement() {
		const node = this.#squire?.getSelection()?.commonAncestorContainer;
		if (!node) return null;
		return node instanceof Element ? node : node.parentElement;
	}
	#restoreSavedRange() {
		if (this.#savedRange && this.#squire) try {
			this.#squire.setSelection(this.#savedRange).focus();
		} catch {
			this.#squire.focus();
		}
		this.#savedRange = null;
	}
	#showPopoverNearButton(popoverEl, btnEl) {
		try {
			if (!popoverEl.matches(":popover-open")) popoverEl.showPopover();
		} catch {
			popoverEl.hidden = false;
		}
		const bRect = btnEl?.getClientRects().length ? btnEl.getBoundingClientRect() : this.#selectionRect();
		if (!bRect) return;
		const pRect = popoverEl.getBoundingClientRect();
		let top = bRect.bottom + 8;
		if (top + pRect.height > window.innerHeight - 8) top = Math.max(8, bRect.top - pRect.height - 8);
		let left = bRect.left;
		left = Math.max(8, Math.min(left, window.innerWidth - pRect.width - 8));
		popoverEl.style.top = `${Math.round(top)}px`;
		popoverEl.style.left = `${Math.round(left)}px`;
	}
	#selectionRect() {
		const range = this.#savedRange || this.#squire?.getSelection();
		const rects = range?.getClientRects();
		const rect = rects?.length ? rects[rects.length - 1] : range?.getBoundingClientRect();
		if (rect && (rect.width || rect.height)) return rect;
		return this.#surface?.getBoundingClientRect() || null;
	}
	#refreshIcons() {
		if (!this.#root) return;
		for (const el of this.#root.querySelectorAll("[data-icon]")) el.outerHTML = this.#icon(el.dataset.icon ?? "", Number(el.dataset.size) || 16);
	}
	#hidePopover(popoverEl) {
		try {
			if (popoverEl.matches(":popover-open")) popoverEl.hidePopover();
		} catch {
			popoverEl.hidden = true;
		}
	}
	#findImageOnlyBlock() {
		if (!this.#surface) return null;
		const block = this.#selectionElement()?.closest("p, div, figure");
		if (!block || block === this.#surface || !this.#surface.contains(block)) return null;
		const imgs = block.querySelectorAll("img");
		if (imgs.length === 1 && !(block.textContent || "").trim()) return imgs[0];
		return null;
	}
	#getActiveAlignment() {
		const imgAlign = this.#imageResize?.getAlignment();
		if (imgAlign) return imgAlign;
		if (!this.#surface) return null;
		const block = this.#selectionElement()?.closest("p, div, h1, h2, h3, h4, h5, h6, li, blockquote");
		if (!block || !this.#surface.contains(block)) return null;
		if (block.style.textAlign) return block.style.textAlign;
		if (block.classList.contains("align-center")) return "center";
		if (block.classList.contains("align-right")) return "right";
		if (block.classList.contains("align-left")) return "left";
		return null;
	}
	#getActiveState() {
		const activeAlign = this.#getActiveAlignment();
		return {
			...getActiveState(this.#squire),
			alignLeft: activeAlign === "left",
			alignCenter: activeAlign === "center",
			alignRight: activeAlign === "right"
		};
	}
	#reflectLayout(attr, layout) {
		if (layout == null) {
			this.removeAttribute(attr);
			return;
		}
		const value = typeof layout === "string" ? layout : layout.join(" ");
		this.setAttribute(attr, value.trim() === "" ? "none" : value);
	}
	/** The toolbar layout in use: the `toolbar` attribute, or the default plus custom buttons. */
	#toolbarItems() {
		const explicit = toItems(this.getAttribute("toolbar"));
		if (explicit) return explicit;
		const custom = [.../* @__PURE__ */ new Set([...getDefinedButtons().keys(), ...this.#buttons.keys()])];
		return custom.length ? [
			...DEFAULT_TOOLBAR,
			"|",
			...custom
		] : [...DEFAULT_TOOLBAR];
	}
	#bubbleItems() {
		return toItems(this.getAttribute("bubble-menu")) ?? [...DEFAULT_BUBBLE_MENU];
	}
	#customButton(name) {
		return this.#buttons.get(name) ?? getDefinedButtons().get(name);
	}
	/** Call a custom button's optional hook; errors are logged instead of breaking the editor. */
	#safeCall(button, hook) {
		try {
			return button[hook]?.(this);
		} catch (err) {
			console.error(`[vanilia-editor] ${hook}() of button "${button.name}" failed`, err);
			return;
		}
	}
	/** Markup for a layout: groups of buttons split by `|`, unknown names skipped. */
	#renderItems(items, size) {
		const groups = [[]];
		for (const item of items) if (item === "|") groups.push([]);
		else {
			const html = this.#renderButton(item, size);
			if (html) groups[groups.length - 1].push(html);
		}
		return groups.filter((group) => group.length).map((group) => `<div class="ve-btn-group">${group.join("")}</div>`).join(`<span class="ve-sep"></span>`);
	}
	#renderButton(name, size) {
		const small = size < 16 ? " ve-btn--sm" : "";
		const builtin = BUILTIN_BUTTONS[name];
		if (builtin) return this.#buttonMarkup({
			name,
			label: this.#t(builtin.label),
			shortcut: this.#shortcutFor(name),
			iconHTML: this.#icon(builtin.icon, size),
			className: `ve-btn${small}`
		});
		const custom = this.#customButton(name);
		if (!custom) return "";
		const iconHTML = !custom.icon ? "" : custom.icon.includes("<") ? `<span class="ve-icon ve-icon--custom" aria-hidden="true">${custom.icon}</span>` : this.#icon(custom.icon, size);
		const text = custom.text ? `<span class="ve-btn-text">${escapeAttr(custom.text)}</span>` : "";
		return this.#buttonMarkup({
			name,
			label: custom.label,
			shortcut: this.#shortcutFor(name),
			iconHTML: iconHTML + text,
			className: `ve-btn${small}${custom.text ? " ve-btn--text" : ""} ve-btn--custom`
		});
	}
	#buttonMarkup(b) {
		const title = b.shortcut ? `${b.label} (${formatShortcut(b.shortcut)})` : b.label;
		const keys = b.shortcut ? ` aria-keyshortcuts="${escapeAttr(ariaShortcut(b.shortcut))}"` : "";
		return `<button type="button" class="${b.className}" data-cmd="${escapeAttr(b.name)}" title="${escapeAttr(title)}" aria-label="${escapeAttr(b.label)}"${keys}>${b.iconHTML}</button>`;
	}
	#renderToolbar() {
		const toolbar = this.#toolbar;
		if (!toolbar) return;
		toolbar.innerHTML = this.#renderItems(this.#toolbarItems(), 16);
		toolbar.hidden = !toolbar.querySelector("button");
		this.#syncButtons(toolbar);
	}
	/** Re-render the toolbar and the selection menu (layout, label or button changes). */
	#renderButtons() {
		if (!this.#mounted) return;
		this.#renderToolbar();
		this.#bubbleMenu?.refresh();
		this.#bindShortcuts();
	}
	#boundKeys = [];
	/**
	* The shortcuts in effect, by command or button name. Lookup order: this editor's
	* overrides, `setShortcuts()`, a custom button's own `shortcut`, the built-in defaults.
	* Empty when the `shortcuts` attribute is `"none"`.
	*/
	#effectiveShortcuts() {
		const result = /* @__PURE__ */ new Map();
		if (this.getAttribute("shortcuts") === "none") return result;
		for (const [name, keys] of Object.entries(DEFAULT_SHORTCUTS)) result.set(name, [...keys]);
		const custom = new Map([...getDefinedButtons(), ...this.#buttons]);
		for (const [name, button] of custom) if (button.shortcut) result.set(name, typeof button.shortcut === "string" ? [button.shortcut] : [...button.shortcut]);
		for (const [name, keys] of getGlobalShortcuts()) result.set(name, [...keys]);
		for (const [name, keys] of this.#shortcutOverrides) result.set(name, [...keys]);
		for (const [name, keys] of result) if (!keys.length) result.delete(name);
		return result;
	}
	/** First shortcut of a command or button, for its tooltip. */
	#shortcutFor(name) {
		return this.#effectiveShortcuts().get(name)?.[0];
	}
	/**
	* Bind the shortcut map. Squire's own defaults are replaced first: keys the browser
	* would edit with (bold, undo, ...) are blocked, the rest fall through to the browser.
	*/
	#bindShortcuts() {
		const squire = this.#squire;
		if (!squire) return;
		const block = (_ed, event) => event.preventDefault();
		const reset = (key) => squire.setKeyHandler(key, NATIVE_EDITING_KEYS.has(key) ? block : null);
		for (const key of this.#boundKeys) reset(key);
		for (const key of SQUIRE_DEFAULT_KEYS.flatMap(squireKeys)) reset(key);
		this.#boundKeys = [];
		for (const [name, shortcuts] of this.#effectiveShortcuts()) {
			if (!this.#customButton(name) && !(name in DEFAULT_SHORTCUTS) && !COMMANDS.has(name)) continue;
			for (const key of shortcuts.flatMap(squireKeys)) {
				squire.setKeyHandler(key, (_ed, event) => {
					event.preventDefault();
					if (name === "find") this.#findReplace?.open();
					else this.exec(name);
				});
				this.#boundKeys.push(key);
			}
		}
	}
	/** Pressed and disabled state of the buttons in `container`. */
	#syncButtons(container) {
		const editorDisabled = this.hasAttribute("disabled") || this.matches(":disabled");
		const active = this.#squire ? this.#getActiveState() : null;
		for (const btn of container.querySelectorAll("button[data-cmd]")) {
			const cmd = btn.dataset.cmd ?? "";
			let isOn;
			let enabled = true;
			const custom = cmd in BUILTIN_BUTTONS ? void 0 : this.#customButton(cmd);
			if (custom) {
				isOn = custom.isActive ? Boolean(this.#safeCall(custom, "isActive")) : void 0;
				enabled = this.#safeCall(custom, "isEnabled") !== false;
			} else if (active && cmd in active) isOn = active[cmd];
			if (cmd === "undo") enabled = this.#canUndo;
			if (cmd === "redo") enabled = this.#canRedo;
			btn.disabled = editorDisabled || !enabled;
			if (isOn !== void 0) {
				btn.classList.toggle("is-active", isOn);
				btn.setAttribute("aria-pressed", String(isOn));
			}
		}
	}
	#syncPlaceholder() {
		if (this.#surface) this.#surface.dataset.placeholder = this.getAttribute("placeholder") || this.#t("placeholder");
	}
	#refreshLabels() {
		if (!this.#root) return;
		applyLabels(this.#root, this.#t);
		this.#syncPlaceholder();
		this.#renderButtons();
		this.#root.querySelector(".ve-bubble-menu")?.setAttribute("aria-label", this.#t("bubbleMenu"));
		this.#syncToolbar();
		this.#syncFormState();
	}
	#afterChange() {
		this.#syncFormState();
		this.#syncToolbar();
		this.#emitUpdate();
	}
	#syncToolbar() {
		if (!this.#toolbar || !this.#squire) return;
		this.#syncButtons(this.#toolbar);
		const text = this.getText();
		const hasImg = Boolean(this.#surface?.querySelector("img"));
		const isEmpty = !text && !hasImg;
		this.#surface?.toggleAttribute("data-empty", isEmpty);
		const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
		const metricsEl = this.#root?.querySelector("[data-metrics]");
		if (metricsEl) {
			const imgCount = this.#surface?.querySelectorAll("img").length || 0;
			const parts = [this.#t("wordCount", { count: words })];
			if (imgCount) parts.push(this.#t("imageCount", { count: imgCount }));
			metricsEl.textContent = parts.join(" · ");
		}
	}
	#syncFormState() {
		const html = this.getHTML();
		this.#internals.setFormValue(html, html);
		const isRequired = this.hasAttribute("required");
		const hasContent = Boolean(this.getText() || this.#surface?.querySelector("img"));
		if (isRequired && !hasContent) this.#internals.setValidity({ valueMissing: true }, this.#t("valueMissing"), this.#surface || void 0);
		else this.#internals.setValidity({});
	}
	#applyDisabled(disabled) {
		if (!this.#surface || !this.#toolbar) return;
		this.#surface.setAttribute("contenteditable", disabled ? "false" : "true");
		this.#root?.classList.toggle("is-disabled", disabled);
		for (const btn of this.#toolbar.querySelectorAll("button")) btn.disabled = disabled;
		if (!disabled) this.#syncButtons(this.#toolbar);
		if (disabled) this.#imageResize?.deselect();
	}
	#buildDetail() {
		const text = this.getText();
		const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
		const images = this.#surface?.querySelectorAll("img").length || 0;
		return {
			html: this.getHTML(),
			text,
			words,
			images,
			active: this.#getActiveState(),
			canUndo: this.#canUndo,
			canRedo: this.#canRedo
		};
	}
	#emitStateEvent() {
		const detail = this.#buildDetail();
		this.dispatchEvent(new CustomEvent("ve:update", {
			detail,
			bubbles: true,
			composed: true
		}));
		this.dispatchEvent(new CustomEvent("editorupdate", {
			detail,
			bubbles: true,
			composed: true
		}));
	}
	#emitUpdate() {
		this.dispatchEvent(new Event("input", {
			bubbles: true,
			composed: true
		}));
		this.#emitStateEvent();
	}
	#teardown() {
		for (const ext of this.#extensions) ext.destroy();
		this.#extensions = [];
		this.#imageResize = null;
		this.#bubbleMenu = null;
		this.#findReplace = null;
		this.#squire?.destroy();
		this.#squire = null;
		for (const unsubscribe of this.#unsubscribers) unsubscribe();
		this.#unsubscribers = [];
		this.#mounted = false;
	}
};
if (typeof customElements !== "undefined" && !customElements.get("vanilia-editor")) customElements.define("vanilia-editor", VaniliaEditorElement);
function escapeAttr(str) {
	return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export { BUTTON_NAMES, DEFAULT_BUBBLE_MENU, DEFAULT_LABELS, DEFAULT_SHORTCUTS, DEFAULT_TOOLBAR, ICON_NAMES, LABEL_NAMES, THEME_TOKENS, VaniliaEditorElement, createBubbleMenuExtension, createFindReplaceExtension, createImageResizeExtension, createTranslator, defineButton, formatHTML, formatShortcut, icon, isSafeUrl, normalizeExportHTML, sanitizeToDOMFragment, setIcons, setLabels, setShortcuts, setTheme, tokenVar, undefineButton };
