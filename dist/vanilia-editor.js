/**
 * Vanilia (<vanilia-editor>) — single-file drop-in ES module.
 * Generated from src/ + static/vendor/squire.mjs via `node scripts/pack.mjs`.
 * Includes Fastmail Squire (MIT License, see static/vendor/SQUIRE-LICENSE.txt).
 */

// --- static/vendor/squire.mjs (MIT License, Fastmail) ---
const Squire = typeof document !== "undefined" ? (() => {
var gt=()=>!0,_=class{constructor(t,e,n){this.root=t,this.currentNode=t,this.nodeType=e,this.filter=n||gt}isAcceptableNode(t){let e=t.nodeType;return!!((e===Node.ELEMENT_NODE?1:e===Node.TEXT_NODE?4:0)&this.nodeType)&&this.filter(t)}nextNode(){let t=this.root,e=this.currentNode,n;for(;;){for(n=e.firstChild;!n&&e&&e!==t;)n=e.nextSibling,n||(e=e.parentNode);if(!n)return null;if(this.isAcceptableNode(n))return this.currentNode=n,n;e=n}}previousNode(){let t=this.root,e=this.currentNode,n;for(;;){if(e===t)return null;if(n=e.previousSibling,n)for(;e=n.lastChild;)n=e;else n=e.parentNode;if(!n)return null;if(this.isAcceptableNode(n))return this.currentNode=n,n;e=n}}previousPONode(){let t=this.root,e=this.currentNode,n;for(;;){for(n=e.lastChild;!n&&e&&e!==t;)n=e.previousSibling,n||(e=e.parentNode);if(!n)return null;if(this.isAcceptableNode(n))return this.currentNode=n,n;e=n}}};var ee=navigator.userAgent,fe=/Mac OS X/.test(ee),ue=/Windows NT/.test(ee),be=/iP(?:ad|hone|od)/.test(ee)||fe&&!!navigator.maxTouchPoints,Pt=/Android/.test(ee),We=/Gecko\//.test(ee),re=/Edge\//.test(ee),Nt=!re&&/WebKit\//.test(ee),y=fe||be?"Meta-":"Ctrl-",ie=Nt,ze="onbeforeinput"in document&&"inputType"in new InputEvent("input"),A=/[^ \t\r\n\u200B]/;var Tt=/^(?:#text|A(?:BBR|CRONYM)?|B(?:R|D[IO])?|C(?:ITE|ODE)|D(?:ATA|EL|FN)|EM|FONT|HR|I(?:FRAME|MG|NPUT|NS)?|KBD|Q|R(?:P|T|UBY)|S(?:AMP|MALL|PAN|TR(?:IKE|ONG)|U[BP])?|TIME|U|VAR|WBR)$/,_t=new Set(["BR","HR","IFRAME","IMG","INPUT"]),Ct=0,Re=1,Ke=2,$e=3,he=new WeakMap,me=()=>{he=new WeakMap},W=o=>_t.has(o.nodeName),ye=o=>{switch(o.nodeType){case 8:case 3:return Re;case 1:case 11:if(he.has(o))return he.get(o);break;default:return Ct}let t;return Array.from(o.childNodes).every(N)?Tt.test(o.nodeName)?t=Re:t=Ke:t=$e,he.set(o,t),t},N=o=>ye(o)===Re,F=o=>ye(o)===Ke,K=o=>ye(o)===$e;var h=(o,t,e)=>{let n=document.createElement(o);if(t instanceof Array&&(e=t,t=null),t)for(let i in t){let s=t[i];s!==void 0&&n.setAttribute(i,s)}return e&&e.forEach(i=>n.appendChild(i)),n},Oe=(o,t)=>W(o)||o.nodeType!==t.nodeType||o.nodeName!==t.nodeName?!1:o instanceof HTMLElement&&t instanceof HTMLElement?o.nodeName!=="A"&&o.className===t.className&&o.style.cssText===t.style.cssText:!0,pe=(o,t,e)=>{if(o.nodeName!==t)return!1;for(let n in e)if(!("getAttribute"in o)||o.getAttribute(n)!==e[n])return!1;return!0},g=(o,t,e,n)=>{for(;o&&o!==t;){if(pe(o,e,n))return o;o=o.parentNode}return null},ge=(o,t)=>{let e=o.childNodes;for(;t&&o instanceof Element;)o=e[t-1],e=o.childNodes,t=e.length;return o},Be=(o,t)=>{let e=o;if(e instanceof Element){let n=e.childNodes;if(t<n.length)e=n[t];else{for(;e&&!e.nextSibling;)e=e.parentNode;e&&(e=e.nextSibling)}}return e},L=o=>o instanceof Element||o instanceof DocumentFragment?o.childNodes.length:o instanceof CharacterData?o.length:0,T=o=>{let t=document.createDocumentFragment(),e=o.firstChild;for(;e;)t.appendChild(e),e=o.firstChild;return t},E=o=>{let t=o.parentNode;return t&&t.removeChild(o),o},k=(o,t)=>{let e=o.parentNode;e&&e.replaceChild(t,o)};var vt=o=>o instanceof Element?o.nodeName==="BR":A.test(o.data),te=(o,t)=>{let e=o.parentNode;for(;N(e);)e=e.parentNode;let n=new _(e,5,vt);return n.currentNode=o,!!n.nextNode()||t&&!n.previousNode()},le=(o,t)=>{let e=new _(o,4),n,i;for(;n=e.nextNode();)for(;(i=n.data.indexOf("\u200B"))>-1&&(!t||n.parentNode!==t);)if(n.length===1){let s=n,r=s.parentNode;for(;r&&(r.removeChild(s),e.currentNode=r,!(!N(r)||L(r)));)s=r,r=s.parentNode;break}else n.deleteData(i,1)};var xt=0,bt=1,Rt=2,Lt=3,z=(o,t,e)=>{let n=document.createRange();if(n.selectNode(t),e){let i=o.compareBoundaryPoints(Lt,n)>-1,s=o.compareBoundaryPoints(bt,n)<1;return!i&&!s}else{let i=o.compareBoundaryPoints(xt,n)<1,s=o.compareBoundaryPoints(Rt,n)>-1;return i&&s}},De=o=>o instanceof Text||o.nodeType===1&&!W(o),C=o=>{let{startContainer:t,startOffset:e,endContainer:n,endOffset:i}=o;for(;!(t instanceof Text);){let s=t.childNodes[e];if(!s||!De(s)){if(e&&(s=t.childNodes[e-1],s instanceof Text)){let r=s,l;for(;!r.length&&(l=r.previousSibling)&&l instanceof Text;)r.remove(),r=l;t=r,e=r.data.length}break}t=s,e=0}if(i)for(;!(n instanceof Text);){let s=n.childNodes[i-1];if(!s||!De(s)){if(s&&s.nodeName==="BR"&&!te(s,!1)){i-=1;continue}break}n=s,i=L(n)}else for(;!(n instanceof Text);){let s=n.firstChild;if(!s||!De(s))break;n=s}o.setStart(t,e),o.setEnd(n,i)},$=(o,t,e,n)=>{let i=o.startContainer,s=o.startOffset,r=o.endContainer,l=o.endOffset,a;for(t||(t=o.commonAncestorContainer),e||(e=t);!s&&i!==t&&i!==n;)a=i.parentNode,s=Array.from(a.childNodes).indexOf(i),i=a;for(;!(r===e||r===n||(r.nodeType!==3&&r.childNodes[l]&&r.childNodes[l].nodeName==="BR"&&!te(r.childNodes[l],!1)&&(l+=1),l!==L(r)));)a=r.parentNode,l=Array.from(a.childNodes).indexOf(r)+1,r=a;o.setStart(i,s),o.setEnd(r,l)},Ae=(o,t,e)=>{let n=g(o.endContainer,e,t);if(n&&(n=n.parentNode)){let i=o.cloneRange();$(i,n,n,e),i.endContainer===n&&(o.setStart(i.endContainer,i.endOffset),o.setEnd(i.endContainer,i.endOffset))}return o};var x=o=>{let t=null;if(o instanceof Text)return o;if(N(o)){let e=o.firstChild;if(ie)for(;e&&e instanceof Text&&!e.data;)o.removeChild(e),e=o.firstChild;e||(ie?t=document.createTextNode("\u200B"):t=document.createTextNode(""))}else if((o instanceof Element||o instanceof DocumentFragment)&&!o.querySelector("BR")&&!A.test(o.textContent||"")){t=h("BR");let e=o,n;for(;(n=e.lastElementChild)&&!N(n);)e=n;o=e,o instanceof HTMLElement&&o.contentEditable==="true"&&(o=h("DIV"),e.appendChild(o))}if(t)try{o.appendChild(t)}catch{}return o},B=(o,t)=>{let e=null;return/^(?:TABLE|TBODY|TR|TH|TD|P)/.test(o.nodeName)||(Array.from(o.childNodes).forEach(n=>{let i=n.nodeName==="BR";!i&&N(n)?(e||(e=h("DIV")),e.appendChild(n)):(i||e)&&(e||(e=h("DIV")),x(e),i?o.replaceChild(e,n):o.insertBefore(e,n),e=null),K(n)&&B(n,t)}),e&&o.appendChild(x(e))),o},I=(o,t,e,n)=>{if(!e.contains(o))throw new Error("split: stopNode does not contain node");if(o instanceof Text&&o!==e){if(typeof t!="number")throw new Error("Offset must be a number to split text node!");if(!o.parentNode)throw new Error("Cannot split text node with no parent!");return I(o.parentNode,o.splitText(t),e,n)}let i=typeof t=="number"?t<o.childNodes.length?o.childNodes[t]:null:t,s=o.parentNode;if(!s||o===e||!(o instanceof Element))return i;let r=o.cloneNode(!1);for(;i;){let l=i.nextSibling;r.appendChild(i),i=l}return o instanceof HTMLOListElement&&g(o,n,"BLOCKQUOTE")&&(r.start=(+o.start||1)+o.childNodes.length-1),x(o),x(r),s.insertBefore(r,o.nextSibling),I(s,r,e,n)},Ze=(o,t)=>{let e=o.childNodes,n=e.length,i=[];for(;n--;){let s=e[n],r=n?e[n-1]:null;if(r&&N(s)&&Oe(s,r))t.startContainer===s&&(t.startContainer=r,t.startOffset+=L(r)),t.endContainer===s&&(t.endContainer=r,t.endOffset+=L(r)),t.startContainer===o&&(t.startOffset>n?t.startOffset-=1:t.startOffset===n&&(t.startContainer=r,t.startOffset=L(r))),t.endContainer===o&&(t.endOffset>n?t.endOffset-=1:t.endOffset===n&&(t.endContainer=r,t.endOffset=L(r))),E(s),s instanceof Text?r.appendData(s.data):i.push(T(s));else if(s instanceof Element){let l;for(;l=i.pop();)s.appendChild(l);Ze(s,t)}}},ne=(o,t)=>{let e=o instanceof Text?o.parentNode:o;if(e instanceof Element){let n={startContainer:t.startContainer,startOffset:t.startOffset,endContainer:t.endContainer,endOffset:t.endOffset};Ze(e,n),t.setStart(n.startContainer,n.startOffset),t.setEnd(n.endContainer,n.endOffset)}},V=(o,t,e,n)=>{let i=t,s,r;for(;(s=i.parentNode)&&s!==n&&s instanceof Element&&s.childNodes.length===1;)i=s;E(i),r=o.childNodes.length;let l=o.lastChild;l&&l.nodeName==="BR"&&(o.removeChild(l),r-=1),o.appendChild(T(t)),e.setStart(o,r),e.collapse(!0),ne(o,e)},H=(o,t)=>{let e=o.previousSibling,n=o.firstChild,i=o.nodeName==="LI";if(!(i&&(!n||!/^[OU]L$/.test(n.nodeName)))){if(e&&Oe(e,o)){if(!K(e))if(i){let r=h("DIV");r.appendChild(T(e)),e.appendChild(r)}else return;E(o);let s=!K(o);e.appendChild(T(o)),s&&B(e,t),n&&H(n,t)}else if(i){let s=h("DIV");o.insertBefore(s,n),x(s)}}};var Ge={"font-weight":{regexp:/^bold|^700/i,replace(){return h("B")}},"font-style":{regexp:/^italic/i,replace(){return h("I")}},"font-family":{regexp:A,replace(o,t){let e=h("SPAN",{class:o.fontFamily});return e.style.fontFamily=t,e}},"font-size":{regexp:A,replace(o,t){let e=h("SPAN",{class:o.fontSize});return e.style.fontSize=t,e}},"text-decoration":{regexp:/^underline/i,replace(){return h("U")}}},kt=(o,t,e)=>{let n=o.style,i,s;for(let r in Ge){let l=Ge[r],a=n.getPropertyValue(r);if(a&&l.regexp.test(a)){let d=l.replace(e.classNames,a);if(d.nodeName===o.nodeName&&d.className===o.className)continue;s||(s=d),i&&i.appendChild(d),i=d,o.style.removeProperty(r)}}return s&&i&&(i.appendChild(T(o)),o.style.cssText?o.appendChild(s):k(o,s)),i||o},Ne=o=>(t,e)=>{let n=h(o),i=t.attributes;for(let s=0,r=i.length;s<r;s+=1){let l=i[s];n.setAttribute(l.name,l.value)}return e.replaceChild(n,t),n.appendChild(T(t)),n},yt={1:"10",2:"13",3:"16",4:"18",5:"24",6:"32",7:"48"},je={STRONG:Ne("B"),EM:Ne("I"),INS:Ne("U"),STRIKE:Ne("S"),SPAN:kt,FONT:(o,t,e)=>{let n=o,i=n.face,s=n.size,r=n.color,l=e.classNames,a,d,c,u,f;return i&&(a=h("SPAN",{class:l.fontFamily}),a.style.fontFamily=i,f=a,u=a),s&&(d=h("SPAN",{class:l.fontSize}),d.style.fontSize=yt[s]+"px",f||(f=d),u&&u.appendChild(d),u=d),r&&/^#?([\dA-F]{3}){1,2}$/i.test(r)&&(r.charAt(0)!=="#"&&(r="#"+r),c=h("SPAN",{class:l.color}),c.style.color=r,f||(f=c),u&&u.appendChild(c),u=c),(!f||!u)&&(f=u=h("SPAN")),t.replaceChild(f,n),u.appendChild(T(n)),u},TT:(o,t,e)=>{let n=h("SPAN",{class:e.classNames.fontFamily,style:'font-family:menlo,consolas,"courier new",monospace'});return t.replaceChild(n,o),n.appendChild(T(o)),n}},Qe=/^(?:A(?:DDRESS|RTICLE|SIDE|UDIO)?|BLOCKQUOTE|CAPTION|D(?:[DLT]|IV)|F(?:IGURE|IGCAPTION|OOTER)|H[1-6]|HEADER|L(?:ABEL|EGEND|I)|O(?:L|UTPUT)|P(?:RE)?|SECTION|T(?:ABLE|BODY|D|FOOT|H|HEAD|R)|COL(?:GROUP)?|UL)$/,Ot=/^(?:HEAD|META|STYLE)$/,Xe=(o,t,e,n)=>{let i=[],s=!1,r=!0,l;for(o.currentNode=t;l=e?o.nextNode():o.previousPONode();){let a=n.get(l);if(a!==void 0){s=a;break}if(l.nodeName==="IMG"||l instanceof Text&&A.test(l.data)){s=!0;break}if(!N(l)){r=!e||Qe.test(l.nodeName)&&!je[l.nodeName];break}i.push(l)}if(r)for(let a of i)n.set(a,s);return s},Ee=(o,t,e,n={before:new WeakMap,after:new WeakMap})=>{let i=o.childNodes,s=o;for(;N(s);)s=s.parentNode;let r=new _(s,5);for(let l=0,a=i.length;l<a;l+=1){let d=i[l],c=d.nodeName,u=je[c];if(d instanceof HTMLElement){let f=d.childNodes.length;if(u)d=u(d,o,t);else if(Ot.test(c)){o.removeChild(d),l-=1,a-=1;continue}else if(!Qe.test(c)&&!N(d)){l-=1,a+=f-1,o.replaceChild(T(d),d);continue}f&&Ee(d,t,e||c==="PRE",n)}else{if(d instanceof Text){let f=d.data,p=!A.test(f.charAt(0)),m=!A.test(f.charAt(f.length-1));if(e||!p&&!m)continue;if(p&&(f=f.replace(/^[ \t\r\n]+/g,Xe(r,d,!1,n.before)?" ":"")),m&&f&&(f=f.replace(/[ \t\r\n]+$/g,Xe(r,d,!0,n.after)?" ":"")),f){d.data=f;continue}}o.removeChild(d),l-=1,a-=1}}return o},Se=o=>{let t=o.childNodes,e=t.length;for(;e--;){let n=t[e];n instanceof Element&&!W(n)?(Se(n),N(n)&&!n.firstChild&&o.removeChild(n)):n instanceof Text&&!n.data&&o.removeChild(n)}},ae=(o,t,e)=>{let n=o.querySelectorAll("BR"),i=[],s=n.length;for(let r=0;r<s;r+=1)i[r]=te(n[r],e);for(;s--;){let r=n[s],l=r.parentNode;l&&(i[s]?N(l)||B(l,t):E(r))}},we=o=>o.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split('"').join("&quot;");var ce=(o,t)=>{let e=new _(t,1,F);return e.currentNode=o,e},U=(o,t)=>{let e=ce(o,t).previousNode();return e!==t?e:null},M=(o,t)=>{let e=ce(o,t).nextNode();return e!==t?e:null},de=o=>!o.textContent&&!o.querySelector("IMG");var v=(o,t)=>{let e=o.startContainer,n;if(N(e))n=U(e,t);else if(e!==t&&e instanceof HTMLElement&&F(e))n=e;else{let i=ge(e,o.startOffset);n=M(i,t)}return n&&z(o,n,!0)?n:null},Z=(o,t)=>{let e=o.endContainer,n;if(N(e))n=U(e,t);else if(e!==t&&e instanceof HTMLElement&&F(e))n=e;else{let i=Be(e,o.endOffset);if(!i||!t.contains(i)){i=t;let s;for(;s=i.lastChild;)i=s}n=U(i,t)}return n&&z(o,n,!0)?n:null},Ye=o=>o instanceof Text?A.test(o.data):o.nodeName==="IMG",j=(o,t)=>{let e=o.startContainer,n=o.startOffset,i;if(e instanceof Text){let l=e.data;for(let a=n;a>0;a-=1)if(l.charAt(a-1)!=="\u200B")return!1;i=e}else if(i=Be(e,n),i&&!t.contains(i)&&(i=null),!i&&(i=ge(e,n),i instanceof Text&&i.length))return!1;let s=v(o,t);if(!s)return!1;let r=new _(s,5,Ye);return r.currentNode=i,!r.previousNode()},G=(o,t)=>{let e=o.endContainer,n=o.endOffset,i;if(e instanceof Text){let l=e.data,a=l.length;for(let d=n;d<a;d+=1)if(l.charAt(d)!=="\u200B")return!1;i=e}else i=ge(e,n);let s=Z(o,t);if(!s)return!1;let r=new _(s,5,Ye);return r.currentNode=i,!r.nextNode()},Ie=(o,t)=>{let e=v(o,t),n=Z(o,t),i;e&&n&&(i=e.parentNode,o.setStart(i,Array.from(i.childNodes).indexOf(e)),i=n.parentNode,o.setEnd(i,Array.from(i.childNodes).indexOf(n)+1))};function Q(o,t,e,n){let i=document.createRange();return i.setStart(o,t),e&&typeof n=="number"?i.setEnd(e,n):i.setEnd(o,t),i}var X=(o,t)=>{let{startContainer:e,startOffset:n,endContainer:i,endOffset:s}=o,r;if(e instanceof Text){let a=e.parentNode;if(r=a.childNodes,n===e.length)n=Array.from(r).indexOf(e)+1,o.collapsed&&(i=a,s=n);else{if(n){let d=e.splitText(n);i===e?(s-=n,i=d):i===a&&(s+=1),e=d}n=Array.from(r).indexOf(e)}e=a}else r=e.childNodes;let l=r.length;n===l?e.appendChild(t):e.insertBefore(t,r[n]),e===i&&(s+=r.length-l),o.setStart(e,n),o.setEnd(i,s)},Me=(o,t,e)=>{let n=document.createDocumentFragment();if(o.collapsed)return n;t||(t=o.commonAncestorContainer),t instanceof Text&&(t=t.parentNode);let i=o.startContainer,s=o.startOffset,r=I(o.endContainer,o.endOffset,t,e),l=0,a=I(i,s,t,e);for(;a&&a!==r;){let d=a.nextSibling;n.appendChild(a),a=d}return a=r&&r.previousSibling,a&&a instanceof Text&&r instanceof Text&&(l=a.length,a.appendData(r.data),E(r),r=a),o.setStart(i,s),r?o.setEnd(r,l):o.setEnd(t,t.childNodes.length),x(t),n},Ve=(o,t,e)=>{o.currentNode=e;let n;for(;n=o[t]();){if(n instanceof Text||W(n))return n;if(!N(n))return null}return null},P=(o,t)=>{let e=v(o,t),n=Z(o,t),i=e!==n;e&&n&&(C(o),$(o,e,n,t));let s=Me(o,null,t);C(o),i&&(n=Z(o,t),e&&n&&e!==n&&V(e,n,o,t)),e&&x(e);let r=t.firstChild;(!r||r.nodeName==="BR")&&(x(t),t.firstChild&&o.selectNodeContents(t.firstChild)),o.collapse(!0);let l=o.startContainer,a=o.startOffset,d=new _(t,5),c=l,u=a;(!(c instanceof Text)||u===c.data.length)&&(c=Ve(d,"nextNode",c),u=0);let f=l,p=a-1;(!(f instanceof Text)||p===-1)&&(f=Ve(d,"previousPONode",c||(l instanceof Text?l:l.childNodes[a]||l)),f instanceof Text&&(p=f.data.length));let m=null,S=0;return c instanceof Text&&c.data.charAt(u)===" "&&j(o,t)?(m=c,S=u):f instanceof Text&&f.data.charAt(p)===" "&&(c instanceof Text&&c.data.charAt(u)===" "||G(o,t))&&(m=f,S=p),m&&m.replaceData(S,1,"\xA0"),o.setStart(l,a),o.collapse(!0),s},Je=(o,t,e)=>{let n=t.firstChild&&N(t.firstChild),i;for(B(t,e),i=t;i=M(i,e);)x(i);o.collapsed||P(o,e),C(o),o.collapse(!1);let s=g(o.endContainer,e,"BLOCKQUOTE")||e,r=v(o,e),l=null,a=M(t,t),d=!n&&!!r&&de(r);if(r&&a&&!d&&!g(a,t,"PRE")&&!g(a,t,"TABLE")){$(o,r,r,e),o.collapse(!0);let c=o.endContainer,u=o.endOffset;if(ae(r,e,!1),N(c)){let f=I(c,u,U(c,e)||e,e);c=f.parentNode,u=Array.from(c.childNodes).indexOf(f)}if(u!==L(c))for(l=document.createDocumentFragment();i=c.childNodes[u];)l.appendChild(i);V(c,a,o,e),c===e?o.setEnd(e,L(e)):(u=Array.from(c.parentNode.childNodes).indexOf(c)+1,c=c.parentNode,o.setEnd(c,u))}if(L(t)){d&&r&&(o.setEndBefore(r),o.collapse(!1),E(r)),s.contains(o.endContainer)||(e.contains(o.endContainer)||(o.setEnd(e,L(e)),o.collapse(!1)),s=g(o.endContainer,e,"BLOCKQUOTE")||e),$(o,s,s,e);let c=I(o.endContainer,o.endOffset,s,e),u=c?c.previousSibling:s.lastChild;s.insertBefore(t,c),c?o.setEndBefore(c):o.setEnd(s,L(s)),r=Z(o,e),C(o);let f=o.endContainer,p=o.endOffset;c&&K(c)&&H(c,e),c=u&&u.nextSibling,c&&K(c)&&H(c,e),o.setEnd(f,p)}if(l&&r){let c=o.cloneRange();x(l),V(r,l,c,e),o.setEnd(c.endContainer,c.endOffset)}C(o)};var Te=o=>{if(o.collapsed)return"";let t=o.startContainer,e=o.endContainer,n=new _(o.commonAncestorContainer,5,a=>z(o,a,!0));n.currentNode=t;let i=t,s="",r=!1,l;for((!(i instanceof Element)&&!(i instanceof Text)||!n.filter(i))&&(i=n.nextNode());i;)i instanceof Text?(l=i.data,l&&/\S/.test(l)&&(i===e&&(l=l.slice(0,o.endOffset)),i===t&&(l=l.slice(o.startOffset)),s+=l,r=!0)):(i.nodeName==="BR"||r&&!N(i))&&(s+=`
`,r=!1),i=n.nextNode();return s=s.replace(/ /g," "),s};var He=Array.prototype.indexOf,et=(o,t,e,n,i)=>{let s=i?"":Te(o),r=v(o,t),l=Z(o,t),a=o.commonAncestorContainer,d=t;r===l&&r?.contains(a)&&(d=r);let c;for(e?(c=P(o,t),a.isConnected||(a=o.commonAncestorContainer)):c=o.cloneContents();a&&!(a instanceof Element);)a=a.parentNode;for(;a&&a!==d;){let f=a.cloneNode(!1);f.appendChild(c),c=f,a=a.parentNode}let u;if(c.childNodes.length===1&&c.childNodes[0]instanceof Text)s=c.childNodes[0].data.replace(/ /g," "),u=void 0;else{let f=h("DIV");f.appendChild(c),u=f.innerHTML,n&&(u=n(u))}return i&&u!==void 0&&(s=i(u)),s===u&&(u=void 0),ue&&(s=s.replace(/\r?\n/g,`\r
`)),u&&(u="<!-- squire -->"+u),[s,u]},tt=(o,t,e,n,i,s,r)=>{let l=o.clipboardData;if(re||!l)return!1;let[a,d]=et(t,e,n,i,s);return o.preventDefault(),!r&&d&&l.setData("text/html",d),l.setData("text/plain",a),!0},nt=function(o){let t=this.getSelection(),e=this._root;if(t.collapsed){o.preventDefault();return}this.saveUndoState(t),tt(o,t,e,!0,this._config.willCutCopy,this._config.toPlainText,!1)||setTimeout(()=>{try{this._ensureBottomLine()}catch(i){this._config.didError(i)}},0),this.setSelection(t)},ot=function(o){tt(o,this.getSelection(),this._root,!1,this._config.willCutCopy,this._config.toPlainText,!1)},Pe=function(o){this._isShiftDown=o.shiftKey},it=function(o){let t=o.clipboardData,e=t?.items,n=this._isShiftDown||!!g(this.getSelection().commonAncestorContainer,this._root,"PRE"),i=!1,s=!1,r=null,l=null;if(e){let R=e.length;for(;R--;){let O=e[R],D=O.type;D==="text/html"?l=O:D==="text/plain"||D==="text/uri-list"?r=O:D==="text/rtf"?i=!0:/^image\/.*/.test(D)&&(s=!0)}if(s&&!(i&&l)&&!r){o.preventDefault(),this.fireEvent("pasteImage",{clipboardData:t});return}if(!re){o.preventDefault(),l&&(!n||!r)?l.getAsString(O=>{this.insertHTML(O,!0)}):r&&r.getAsString(O=>{let D=this.getSelection();if(!D.collapsed&&A.test(D.toString())){let J=this.linkRegExp.exec(O);if(!!J&&J[0].length===O.length){let pt=J[1]?/^(?:ht|f)tps?:/i.test(J[1])?J[1]:"http://"+J[1]:"mailto:"+J[0];this.makeLink(pt);return}}this.insertPlainText(O,!0)});return}}let a=t?.types;if(!re&&a&&(He.call(a,"text/html")>-1||!We&&He.call(a,"text/plain")>-1&&He.call(a,"text/rtf")<0)){o.preventDefault();let R;!n&&(R=t.getData("text/html"))?this.insertHTML(R,!0):((R=t.getData("text/plain"))||(R=t.getData("text/uri-list")))&&this.insertPlainText(R,!0);return}let d=document.body,c=this.getSelection(),u=c.startContainer,f=c.startOffset,p=c.endContainer,m=c.endOffset,S=h("DIV",{contenteditable:"true",style:"position:fixed; overflow:hidden; top:0; right:100%; width:1px; height:1px;"});d.appendChild(S),c.selectNodeContents(S),this.setSelection(c),setTimeout(()=>{try{let R="",O=S,D;for(;S=O;)O=S.nextSibling,E(S),D=S.firstChild,D&&D===S.lastChild&&D instanceof HTMLDivElement&&(S=D),R+=S.innerHTML;this.setSelection(Q(u,f,p,m)),R&&this.insertHTML(R,!0)}catch(R){this._config.didError(R)}},0)},st=function(){let o=this.getSelection();o&&!o.collapsed&&this._root.contains(o.commonAncestorContainer)?this._dragRange=o.cloneRange():this._dragRange=null},rt=function(){this._dragRange=null},Dt=(o,t,e)=>{let n=null,i=document;if(i.caretPositionFromPoint){let s=i.caretPositionFromPoint(o,t);s&&(n=document.createRange(),n.setStart(s.offsetNode,s.offset),n.collapse(!0))}else i.caretRangeFromPoint&&(n=i.caretRangeFromPoint(o,t));return n&&!e.contains(n.commonAncestorContainer)?null:n},At=(o,t)=>o.compareBoundaryPoints(Range.START_TO_START,t)>=0&&o.compareBoundaryPoints(Range.END_TO_END,t)<=0,lt=function(o){let t=o.dataTransfer;if(!t)return;let e=t.types,n=!1,i=!1;for(let c=0,u=e.length;c<u;c+=1)switch(e[c]){case"text/plain":n=!0;break;case"text/html":i=!0;break}if(!n&&!i)return;o.preventDefault();let s=this._root,r=Dt(o.clientX,o.clientY,s),l=this._dragRange;if(this._dragRange=null,!r)return;let a,d;if(l){if(At(r,l))return;this._recordUndoState(l,this._isInUndoState);let c=document.createComment("");r.insertNode(c),this._getRangeAndRemoveBookmark(l),[a,d]=et(l,s,t.dropEffect!=="copy",this._config.willCutCopy,this._config.toPlainText),c.replaceWith(h("INPUT",{id:this.startSelectionId,type:"hidden"}),h("INPUT",{id:this.endSelectionId,type:"hidden"})),this._getRangeAndRemoveBookmark(r),me()}else this.saveUndoState(r),i?d=t.getData("text/html"):a=t.getData("text/plain");this.setSelection(r),d!==void 0?this.insertHTML(d,!0):a!==void 0&&this.insertPlainText(a,!0)};var Fe=(o,t,e)=>{t.preventDefault(),o.splitBlock(t.shiftKey,e)};var oe=(o,t)=>{try{t||(t=o.getSelection());let e=t.startContainer;e instanceof Text&&(e=e.parentNode);let n=e;for(;N(n)&&(!n.textContent||n.textContent==="\u200B");)e=n,n=e.parentNode;e!==n&&(t.setStart(n,Array.from(n.childNodes).indexOf(e)),t.collapse(!0),n.removeChild(e),F(n)||(n=U(n,o._root)||o._root),x(n),C(t)),e===o._root&&(e=e.firstChild)&&e.nodeName==="BR"&&E(e),o._ensureBottomLine(),o.setSelection(t),o._updatePath(t,!0)}catch(e){o._config.didError(e)}},_e=(o,t)=>{let e;for(;(e=o.parentNode)&&!(e===t||e.isContentEditable);)o=e;E(o)},Ce=(o,t,e)=>{if(g(t,o._root,"A"))return;let n=t.data||"",i=Math.max(n.lastIndexOf(" ",e-1),n.lastIndexOf("\xA0",e-1))+1,s=n.slice(i,e),r=o.linkRegExp.exec(s);if(r){let l=o.getSelection();o._docWasChanged(),o._recordUndoState(l),o._getRangeAndRemoveBookmark(l);let a=i+r.index,d=a+r[0].length,c=l.startContainer===t,u=l.startOffset-d;a&&(t=t.splitText(a));let f=o._config.tagAttributes.a,p=h("A",Object.assign({href:r[1]?/^(?:ht|f)tps?:/i.test(r[1])?r[1]:"http://"+r[1]:"mailto:"+r[0]},f));p.textContent=n.slice(a,d),t.parentNode.insertBefore(p,t),t.data=n.slice(d),c&&(l.setStart(t,u),l.setEnd(t,u)),o.setSelection(l)}};var at=(o,t,e)=>{let n=o._root;if(o._removeZWS(),o.saveUndoState(e),!e.collapsed)t.preventDefault(),P(e,n),oe(o,e);else if(j(e,n)){t.preventDefault();let i=v(e,n);if(!i)return;let s=i;B(s.parentNode,n);let r=U(s,n);if(r){if(!r.isContentEditable){_e(r,n);return}for(V(r,s,e,n),s=r.parentNode;s!==n&&!s.nextSibling;)s=s.parentNode;s!==n&&(s=s.nextSibling)&&H(s,n),o.setSelection(e)}else if(s){if(g(s,n,"UL")||g(s,n,"OL")){o.decreaseListLevel(e);return}else if(g(s,n,"BLOCKQUOTE")){o.removeQuote(e);return}o.setSelection(e),o._updatePath(e,!0)}}else{C(e);let i=e.startContainer,s=e.startOffset,r=i.parentNode;i instanceof Text&&r instanceof HTMLAnchorElement&&s&&r.href.includes(i.data)?(i.deleteData(s-1,1),o.setSelection(e),o.removeLink(),t.preventDefault()):(o.setSelection(e),setTimeout(()=>{oe(o)},0))}};var ct=(o,t,e)=>{let n=o._root,i,s,r,l,a,d;if(o._removeZWS(),o.saveUndoState(e),!e.collapsed)t.preventDefault(),P(e,n),oe(o,e);else if(G(e,n)){if(t.preventDefault(),i=v(e,n),!i)return;if(B(i.parentNode,n),s=M(i,n),s){if(!s.isContentEditable){_e(s,n);return}for(V(i,s,e,n),s=i.parentNode;s!==n&&!s.nextSibling;)s=s.parentNode;s!==n&&(s=s.nextSibling)&&H(s,n),o.setSelection(e),o._updatePath(e,!0)}}else{if(r=e.cloneRange(),$(e,n,n,n),l=e.endContainer,a=e.endOffset,l instanceof Element&&(d=l.childNodes[a],d&&d.nodeName==="IMG")){t.preventDefault(),E(d),C(e),oe(o,e);return}o.setSelection(r),setTimeout(()=>{oe(o)},0)}};var dt=(o,t,e)=>{let n=o._root;if(o._removeZWS(),e.collapsed&&j(e,n)){let i=v(e,n),s;for(;s=i.parentNode;){if(s.nodeName==="UL"||s.nodeName==="OL"){t.preventDefault(),o.increaseListLevel(e);break}i=s}}},ft=(o,t,e)=>{let n=o._root;if(o._removeZWS(),e.collapsed&&j(e,n)){let i=e.startContainer;(g(i,n,"UL")||g(i,n,"OL"))&&(t.preventDefault(),o.decreaseListLevel(e))}};var ut=(o,t,e)=>{let n,i=o._root;if(o._recordUndoState(e),o._getRangeAndRemoveBookmark(e),!e.collapsed)P(e,i),o._ensureBottomLine(),o.setSelection(e),o._updatePath(e,!0);else if(G(e,i)){let s=v(e,i);if(s&&s.nodeName!=="PRE"){let r=s.textContent?.trimEnd().replace("\u200B","");if(r==="*"||r==="1."){t.preventDefault(),o.insertPlainText(" ",!1),o._docWasChanged(),o.saveUndoState(e);let l=new _(s,4),a;for(;a=l.nextNode();)E(a);r==="*"?o.makeUnorderedList():o.makeOrderedList();return}}}if(n=e.endContainer,e.endOffset===L(n))do if(n.nodeName==="A"){e.setStartAfter(n);break}while(!n.nextSibling&&(n=n.parentNode)&&n!==i);if(o._config.addLinks){let s=e.cloneRange();C(s);let r=s.startContainer,l=s.startOffset;setTimeout(()=>{Ce(o,r,l)},0)}o.setSelection(e)};var ht=function(o){if(o.defaultPrevented||o.isComposing)return;let t=o.key,e="",n=o.code;/^Digit\d$/.test(n)&&(t=n.slice(-1)),t!=="Backspace"&&t!=="Delete"&&(o.altKey&&(e+="Alt-"),o.ctrlKey&&(e+="Ctrl-"),o.metaKey&&(e+="Meta-"),o.shiftKey&&(e+="Shift-")),ue&&o.shiftKey&&t==="Delete"&&(e+="Shift-"),t=e+t;let i=this.getSelection(),s=this._keyHandlers[t];s?s(this,o,i):!i.collapsed&&!o.ctrlKey&&!o.metaKey&&t.length===1&&(this.saveUndoState(i),P(i,this._root),this._ensureBottomLine(),this.setSelection(i),this._updatePath(i,!0))},b={Backspace:at,Delete:ct,Tab:dt,"Shift-Tab":ft," ":ut,ArrowLeft(o){o._removeZWS()},ArrowRight(o,t,e){o._removeZWS();let n=o.getRoot();if(G(e,n)){C(e);let i=e.endContainer;do if(i.nodeName==="CODE"){let s=i.nextSibling;if(!(s instanceof Text)||s.length===0){let r=document.createTextNode("\xA0");i.parentNode.insertBefore(r,s),s=r}e.setStart(s,1),o.setSelection(e),t.preventDefault();break}while(!i.nextSibling&&(i=i.parentNode)&&i!==n)}}};ze||(b.Enter=Fe,b["Shift-Enter"]=Fe);!fe&&!be&&(b.PageUp=o=>{o.moveCursorToStart()},b.PageDown=o=>{o.moveCursorToEnd()});var se=(o,t)=>(t=t||null,(e,n)=>{n.preventDefault();let i=e.getSelection();e.hasFormat(o,null,i)?e.changeFormat(null,{tag:o},i):e.changeFormat({tag:o},t,i)});b[y+"b"]=se("B");b[y+"i"]=se("I");b[y+"u"]=se("U");b[y+"Shift-7"]=se("S");b[y+"Shift-5"]=se("SUB",{tag:"SUP"});b[y+"Shift-6"]=se("SUP",{tag:"SUB"});b[y+"Shift-8"]=(o,t)=>{t.preventDefault();let e=o.getPath();/(?:^|>)UL/.test(e)?o.removeList():o.makeUnorderedList()};b[y+"Shift-9"]=(o,t)=>{t.preventDefault();let e=o.getPath();/(?:^|>)OL/.test(e)?o.removeList():o.makeOrderedList()};b[y+"["]=(o,t)=>{t.preventDefault();let e=o.getPath();/(?:^|>)BLOCKQUOTE/.test(e)||!/(?:^|>)[OU]L/.test(e)?o.decreaseQuoteLevel():o.decreaseListLevel()};b[y+"]"]=(o,t)=>{t.preventDefault();let e=o.getPath();/(?:^|>)BLOCKQUOTE/.test(e)||!/(?:^|>)[OU]L/.test(e)?o.increaseQuoteLevel():o.increaseListLevel()};b[y+"d"]=(o,t)=>{t.preventDefault(),o.toggleCode()};b[y+"z"]=(o,t)=>{t.preventDefault(),o.undo()};b[y+"y"]=b[y+"Shift-z"]=b[y+"Shift-Z"]=(o,t)=>{t.preventDefault(),o.redo()};var qe=8,mt=40,Ue=1200,wt=[{pos:"nw",cursor:"nwse-resize"},{pos:"n",cursor:"ns-resize"},{pos:"ne",cursor:"nesw-resize"},{pos:"e",cursor:"ew-resize"},{pos:"se",cursor:"nwse-resize"},{pos:"s",cursor:"ns-resize"},{pos:"sw",cursor:"nesw-resize"},{pos:"w",cursor:"ew-resize"}],It={ArrowUp:(o,t,e)=>{let n=v(t,e);if(n){let i=U(n,e);i&&(t.selectNodeContents(i),t.collapse(!1),o.setSelection(t).focus())}},ArrowDown:(o,t,e)=>{let n=v(t,e);if(n){let i=M(n,e);i&&(t.selectNodeContents(i),t.collapse(!0),o.setSelection(t).focus())}},Delete:(o,t)=>{o.replaceWithBlankLine(t)},Backspace:(o,t)=>{o.replaceWithBlankLine(t)}},ve=class{constructor(t,e){this._currentImage=null;this._resizeContainer=null;this._handles=null;this._currentHandle=null;this._startX=0;this._startY=0;this._startWidth=0;this._startHeight=0;this._maxWidth=Ue;this._originalRatio=1;this._editor=e,this._root=t,document.addEventListener("click",this),e.addEventListener("drop",this)}destroy(){this._deselectImage(),this._editor.removeEventListener("drop",this),document.removeEventListener("click",this)}handleEvent(t){switch(t.type){case"click":this._onClick(t);break;case"pointerdown":this._onPointerDown(t);break;case"pointermove":this._onPointerMove(t);break;case"pointercancel":case"pointerup":this._onPointerUp(t);break;case"keydown":this._onKeyDown(t);break;case"drop":this._deselectImage();break}}_onClick(t){let e=t.target;e.nodeName==="IMG"&&this._root.contains(e)?(t.stopPropagation(),this._selectImage(e)):this._currentImage&&this._handles&&!this._handles.some(n=>n.element===e)&&this._deselectImage()}_deselectImage(){this._currentImage&&(document.removeEventListener("keydown",this,!0),this._currentHandle&&this._onPointerUp({preventDefault(){},target:this._currentHandle.element}),this._handles&&this._handles.forEach(({element:t})=>t.removeEventListener("pointerdown",this)),this._resizeContainer&&this._resizeContainer.remove(),this._currentImage.removeAttribute("tabindex"),this._handles=null,this._resizeContainer=null,this._currentImage=null)}_selectImage(t){if(this._currentImage===t)return;this._deselectImage(),this._root.blur();let e=wt.map(({pos:s,cursor:r})=>{let l=qe/2,a="";switch(s){case"nw":a=`left: -${l}px; top: -${l}px;`;break;case"n":a=`left: calc(50% - ${l}px); top: -${l}px;`;break;case"ne":a=`right: -${l}px; top: -${l}px;`;break;case"e":a=`right: -${l}px; top: calc(50% - ${l}px);`;break;case"se":a=`right: -${l}px; bottom: -${l}px;`;break;case"s":a=`left: calc(50% - ${l}px); bottom: -${l}px;`;break;case"sw":a=`left: -${l}px; bottom: -${l}px;`;break;case"w":a=`left: -${l}px; top: calc(50% - ${l}px);`;break}let d=h("div",{class:`squire-resize-handle squire-resize-handle-${s}`,style:`
                    position: absolute;
                    width: ${qe}px;
                    height: ${qe}px;
                    background: #0067b9;
                    border: 1px solid #fff;
                    cursor: ${r};
                    pointer-events: auto;
                    touch-action: none;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    ${a}
                `});return d.addEventListener("pointerdown",this),{element:d,cursor:r,position:s}}),n=h("div",{class:"squire-image-resize-container",style:"position: absolute; pointer-events: none; z-index: 1000;"},e.map(s=>s.element));this._currentImage=t,this._resizeContainer=n,this._handles=e,this._root.appendChild(this._resizeContainer);let i=t.naturalWidth;this._originalRatio=i/t.naturalHeight,this._maxWidth=Math.min(i*2,t.parentElement?t.parentElement.offsetWidth:Ue,Ue),this._positionResizeContainer(),t.tabIndex=-1,t.focus(),document.addEventListener("keydown",this,!0)}_positionResizeContainer(){let t=this._resizeContainer,e=this._root,n=this._currentImage;if(!t||!n)return;let i=e.getBoundingClientRect(),s=n.getBoundingClientRect(),r=s.top-i.top+e.scrollTop,l=s.left-i.left+e.scrollLeft,a=s.width,d=s.height;t.style.top=r+"px",t.style.left=l+"px",t.style.width=a+"px",t.style.height=d+"px"}_onPointerDown(t){if(this._currentHandle||!this._handles)return;let e=t.target,n=this._handles.find(r=>r.element===e)||null;if(!n)return;let i=this._currentImage;if(!i)return;t.preventDefault(),t.stopPropagation(),e.addEventListener("pointermove",this),e.addEventListener("pointerup",this),e.addEventListener("pointercancel",this),e.setPointerCapture(t.pointerId),this._currentHandle=n,this._startX=t.clientX,this._startY=t.clientY;let s=getComputedStyle(i);this._startWidth=parseFloat(s.width),this._startHeight=parseFloat(s.height),document.body.style.cursor=n.cursor}_onPointerMove(t){t.preventDefault();let e=this._currentHandle,n=this._currentImage;if(!e||!n)return;let i=t.clientX-this._startX,s=t.clientY-this._startY,r=this._maxWidth,l=this._originalRatio,a=this._startWidth,d=this._startHeight;switch(e.position){case"sw":case"nw":case"w":a-=2*i;break;case"se":case"ne":case"e":a+=2*i;break;case"n":d-=s,a=d*l;break;case"s":d+=s,a=d*l;break}a<mt?a=mt:a>r&&(a=r);let c=n.style;c.width=a+"px",c.height="auto",this._positionResizeContainer()}_onPointerUp(t){t.preventDefault();let e=t.target;e&&(e.removeEventListener("pointermove",this),e.removeEventListener("pointerup",this),e.removeEventListener("pointercancel",this)),this._currentHandle=null,document.body.style.cursor=""}_onKeyDown(t){t.preventDefault(),t.stopPropagation();let e=It[t.key];if(!e)return;let n=this._currentImage;if(!n)return;let i=this._editor,s=this._root;this._deselectImage();let r=i.getSelection();r.selectNode(n),e(i,r,s)}};var xe=class{constructor(t,e){this.customEvents=new Set(["pathChange","select","input","pasteImage","undoStateChange"]);this.startSelectionId="squire-selection-start";this.endSelectionId="squire-selection-end";this.linkRegExp=/\b(?:((?:(?:ht|f)tps?:\/\/|www\d{0,3}[.]|[a-z0-9][a-z0-9.\-]{0,252}[.][a-z]{2,}\/)(?:[^\s()<>]|\([^\s()<>]+\))+(?:[^\s?&`!()\[\]{};:'".,<>«»“”‘’]|\([^\s()<>]+\)))|([\w\-.%+]{1,64}@(?:[\w\-]+\.)+[a-z]{2,}\b(?:[?][^&?\s]+=[^\s?&`!()\[\]{};:'".,<>«»“”‘’]+(?:&[^&?\s]+=[^\s?&`!()\[\]{};:'".,<>«»“”‘’]+)*)?))/i;this.tagAfterSplit={DT:"DD",DD:"DT",LI:"LI",PRE:"PRE"};this._root=t,this._config=this._makeConfig(e),this._isFocused=!1,this._lastSelection=Q(t,0),this._willRestoreSelection=!1,this._mayHaveZWS=!1,this._lastAnchorNode=null,this._lastFocusNode=null,this._lastPathRange=null,this._path="",this._events=new Map,this._undoIndex=-1,this._undoStack=[],this._undoStackLength=0,this._isInUndoState=!1,this._ignoreChange=!1,this._ignoreAllChanges=!1,this.addEventListener("selectionchange",this._updatePathOnEvent),this.addEventListener("blur",this._enableRestoreSelection),this.addEventListener("mousedown",this._disableRestoreSelection),this.addEventListener("touchstart",this._disableRestoreSelection),this.addEventListener("focus",this._restoreSelection),this.addEventListener("blur",this._removeZWS),this._isShiftDown=!1,this.addEventListener("cut",nt),this.addEventListener("copy",ot),this.addEventListener("paste",it),this._dragRange=null,this.addEventListener("dragstart",st),this.addEventListener("dragend",rt),this.addEventListener("drop",lt),this.addEventListener("keydown",Pe),this.addEventListener("keyup",Pe),this.addEventListener("keydown",ht),this._keyHandlers=Object.create(b);let n=new MutationObserver(()=>this._docWasChanged());n.observe(t,{childList:!0,attributes:!0,characterData:!0,subtree:!0}),this._mutation=n,t.setAttribute("contenteditable","true"),this.addEventListener("beforeinput",this._beforeInput),this._imageResizer=new ve(t,this),this.setHTML("")}destroy(){this._events.forEach((t,e)=>{this.removeEventListener(e)}),this._mutation.disconnect(),this._imageResizer.destroy(),this._undoIndex=-1,this._undoStack=[],this._undoStackLength=0}_makeConfig(t){let e={blockTag:"DIV",blockAttributes:null,tagAttributes:{},classNames:{color:"color",fontFamily:"font",fontSize:"size",highlight:"highlight"},undo:{documentSizeThreshold:-1,undoLimit:-1},addLinks:!0,willCutCopy:null,toPlainText:null,sanitizeToDOMFragment:n=>{let i=DOMPurify.sanitize(n,{ALLOW_UNKNOWN_PROTOCOLS:!0,WHOLE_DOCUMENT:!1,RETURN_DOM:!0,RETURN_DOM_FRAGMENT:!0,FORCE_BODY:!1});return i?document.importNode(i,!0):document.createDocumentFragment()},didError:n=>console.log(n)};return t&&(Object.assign(e,t),e.blockTag=e.blockTag.toUpperCase()),e}setKeyHandler(t,e){return this._keyHandlers[t]=e,this}_beforeInput(t){switch(t.inputType){case"insertLineBreak":t.preventDefault(),this.splitBlock(!0);break;case"insertParagraph":t.preventDefault(),this.splitBlock(!1);break;case"insertOrderedList":t.preventDefault(),this.makeOrderedList();break;case"insertUnoderedList":t.preventDefault(),this.makeUnorderedList();break;case"historyUndo":t.preventDefault(),this.undo();break;case"historyRedo":t.preventDefault(),this.redo();break;case"formatBold":t.preventDefault(),this.bold();break;case"formatItalic":t.preventDefault(),this.italic();break;case"formatUnderline":t.preventDefault(),this.underline();break;case"formatStrikeThrough":t.preventDefault(),this.strikethrough();break;case"formatSuperscript":t.preventDefault(),this.superscript();break;case"formatSubscript":t.preventDefault(),this.subscript();break;case"formatJustifyFull":case"formatJustifyCenter":case"formatJustifyRight":case"formatJustifyLeft":{t.preventDefault();let e=t.inputType.slice(13).toLowerCase();e==="full"&&(e="justify"),this.setTextAlignment(e);break}case"formatRemove":t.preventDefault(),this.removeAllFormatting();break;case"formatSetBlockTextDirection":{t.preventDefault();let e=t.data;e==="null"&&(e=null),this.setTextDirection(e);break}case"formatBackColor":t.preventDefault(),this.setHighlightColor(t.data);break;case"formatFontColor":t.preventDefault(),this.setTextColor(t.data);break;case"formatFontName":t.preventDefault(),this.setFontFace(t.data);break}}handleEvent(t){this.fireEvent(t.type,t)}fireEvent(t,e){let n=this._events.get(t);if(/^(?:focus|blur)/.test(t)){let i=this._root===document.activeElement;if(t==="focus"){if(!i||this._isFocused)return this;this._isFocused=!0}else{if(i||!this._isFocused)return this;this._isFocused=!1}}if(n){let i=e instanceof Event?e:new CustomEvent(t,{detail:e});n=n.slice();for(let s of n)try{"handleEvent"in s?s.handleEvent(i):s.call(this,i)}catch(r){this._config.didError(r)}}return this}addEventListener(t,e){let n=this._events.get(t),i=this._root;return n||(n=[],this._events.set(t,n),this.customEvents.has(t)||(t==="selectionchange"&&(i=document),i.addEventListener(t,this,!0))),n.push(e),this}removeEventListener(t,e){let n=this._events.get(t),i=this._root;if(n){if(e){let s=n.length;for(;s--;)n[s]===e&&n.splice(s,1)}else n.length=0;n.length||(this._events.delete(t),this.customEvents.has(t)||(t==="selectionchange"&&(i=document),i.removeEventListener(t,this,!0)))}return this}focus(){return this._root.focus({preventScroll:!0}),this}blur(){return this._root.blur(),this}_enableRestoreSelection(){this._willRestoreSelection=!0}_disableRestoreSelection(){this._willRestoreSelection=!1}_restoreSelection(){this._willRestoreSelection&&this.setSelection(this._lastSelection)}_removeZWS(){this._mayHaveZWS&&(le(this._root),this._mayHaveZWS=!1)}_saveRangeToBookmark(t){let e=h("INPUT",{id:this.startSelectionId,type:"hidden"}),n=h("INPUT",{id:this.endSelectionId,type:"hidden"}),i;X(t,e),t.collapse(!1),X(t,n),e.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_PRECEDING&&(e.id=this.endSelectionId,n.id=this.startSelectionId,i=e,e=n,n=i),t.setStartAfter(e),t.setEndBefore(n)}_getRangeAndRemoveBookmark(t){let e=this._root,n=e.querySelectorAll("#"+this.startSelectionId),i=e.querySelectorAll("#"+this.endSelectionId),s=n[0],r=i[0];if(s&&r&&s.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING){let l=s.parentNode,a=r.parentNode,d=Array.from(l.childNodes).indexOf(s),c=Array.from(a.childNodes).indexOf(r);l===a&&(c-=1),s.remove(),r.remove(),t||(t=document.createRange()),t.setStart(l,d),t.setEnd(a,c),ne(l,t),l!==a&&ne(a,t),t.collapsed&&(l=t.startContainer,l instanceof Text&&(a=l.childNodes[t.startOffset],(!a||!(a instanceof Text))&&(a=l.childNodes[t.startOffset-1]),a&&a instanceof Text&&(t.setStart(a,0),t.collapse(!0))))}for(let l=0;l<n.length;l+=1)n[l].remove();for(let l=0;l<i.length;l+=1)i[l].remove();return t||null}getSelection(){let t=window.getSelection(),e=this._root,n=null;if(this._isFocused&&t&&t.rangeCount){n=t.getRangeAt(0).cloneRange();let i=n.startContainer,s=n.endContainer;i&&W(i)&&n.setStartBefore(i),s&&W(s)&&n.setEndBefore(s)}return n&&e.contains(n.commonAncestorContainer)?this._lastSelection=n:(n=this._lastSelection,document.contains(n.commonAncestorContainer)||(n=null)),n||(n=Q(e.firstElementChild||e,0)),n}setSelection(t){if(this._lastSelection=t,!this._isFocused)this._enableRestoreSelection();else{let e=window.getSelection();e&&("setBaseAndExtent"in Selection.prototype?e.setBaseAndExtent(t.startContainer,t.startOffset,t.endContainer,t.endOffset):(e.removeAllRanges(),e.addRange(t)))}return this}_moveCursorTo(t){let e=this._root,n=Q(e,t?0:e.childNodes.length);return C(n),this.setSelection(n),this}moveCursorToStart(){return this._moveCursorTo(!0)}moveCursorToEnd(){return this._moveCursorTo(!1)}getCursorPosition(){let t=this.getSelection(),e=t.getBoundingClientRect();if(e&&!e.top){this._ignoreChange=!0;let n=h("SPAN");n.textContent="\u200B",X(t,n),e=n.getBoundingClientRect();let i=n.parentNode;i.removeChild(n),ne(i,t)}return e}getPath(){return this._path}_updatePathOnEvent(){if(this._isFocused){let t=this._lastPathRange,e=this.getSelection();(!t||!t.commonAncestorContainer.isConnected||e.compareBoundaryPoints(0,t)!==0||e.compareBoundaryPoints(2,t)!==0)&&this._updatePath(e)}}_updatePath(t,e){this._lastPathRange=t.cloneRange();let n=t.startContainer,i=t.endContainer,s;(e||n!==this._lastAnchorNode||i!==this._lastFocusNode)&&(this._lastAnchorNode=n,this._lastFocusNode=i,s=n&&i?n===i?this._getPath(i):"(selection)":"",(this._path!==s||n!==i)&&(this._path=s,this.fireEvent("pathChange",{path:s}))),this.fireEvent(t.collapsed?"cursor":"select",{range:t})}_getPath(t){let e=this._root,n=this._config,i="";if(t&&t!==e){let s=t.parentNode;if(i=s?this._getPath(s):"",t instanceof HTMLElement){let r=t.id,l=t.classList,a=Array.from(l).sort(),d=t.dir,c=n.classNames;i+=(i?">":"")+t.nodeName,r&&(i+="#"+r),a.length&&(i+=".",i+=a.join(".")),d&&(i+="[dir="+d+"]"),l.contains(c.highlight)&&(i+="[backgroundColor="+t.style.backgroundColor.replace(/ /g,"")+"]"),l.contains(c.color)&&(i+="[color="+t.style.color.replace(/ /g,"")+"]"),l.contains(c.fontFamily)&&(i+="[fontFamily="+t.style.fontFamily.replace(/ /g,"")+"]"),l.contains(c.fontSize)&&(i+="[fontSize="+t.style.fontSize+"]")}}return i}modifyDocument(t){let e=this._mutation;return e&&(e.takeRecords().length&&this._docWasChanged(),e.disconnect()),this._ignoreAllChanges=!0,t(),this._ignoreAllChanges=!1,e&&(e.observe(this._root,{childList:!0,attributes:!0,characterData:!0,subtree:!0}),this._ignoreChange=!1),this}_docWasChanged(){if(me(),this._mayHaveZWS=!0,!this._ignoreAllChanges){if(this._ignoreChange){this._ignoreChange=!1;return}this._isInUndoState&&(this._isInUndoState=!1,this.fireEvent("undoStateChange",{canUndo:!0,canRedo:!1})),this.fireEvent("input")}}_recordUndoState(t,e){let n=this._isInUndoState;if(!n||e){let i=this._undoIndex+1,s=this._undoStack,r=this._config.undo,l=r.documentSizeThreshold,a=r.undoLimit;if(i<this._undoStackLength&&(s.length=this._undoStackLength=i),t&&this._saveRangeToBookmark(t),n)return this;let d=this._getRawHTML();e&&(i-=1),l>-1&&d.length*2>l&&a>-1&&i>a&&(s.splice(0,i-a),i=a,this._undoStackLength=a),s[i]=d,this._undoIndex=i,this._undoStackLength+=1,this._isInUndoState=!0}return this}saveUndoState(t){let e=!1;return t||(t=this.getSelection(),e=!0),this._recordUndoState(t,this._isInUndoState),this._getRangeAndRemoveBookmark(t),e&&this.setSelection(t),this}undo(){if(this._undoIndex!==0||!this._isInUndoState){this._recordUndoState(this.getSelection(),!1),this._undoIndex-=1,this._setRawHTML(this._undoStack[this._undoIndex]);let t=this._getRangeAndRemoveBookmark();t&&this.setSelection(t),this._isInUndoState=!0,this.fireEvent("undoStateChange",{canUndo:this._undoIndex!==0,canRedo:!0}),this.fireEvent("input")}return this.focus()}redo(){let t=this._undoIndex,e=this._undoStackLength;if(t+1<e&&this._isInUndoState){this._undoIndex+=1,this._setRawHTML(this._undoStack[this._undoIndex]);let n=this._getRangeAndRemoveBookmark();n&&this.setSelection(n),this.fireEvent("undoStateChange",{canUndo:!0,canRedo:t+2<e}),this.fireEvent("input")}return this.focus()}getRoot(){return this._root}_getRawHTML(){return this._root.innerHTML}_setRawHTML(t){let e=this._root;e.innerHTML=t;let n=e,i=n.firstChild;if(!i||i.nodeName==="BR"){let s=this.createDefaultBlock();i?n.replaceChild(s,i):n.appendChild(s)}else for(;n=M(n,e);)x(n);return this._ignoreChange=!0,this}getHTML(t){let e,n="";return this.modifyDocument(()=>{t&&(e=this.getSelection(),this._saveRangeToBookmark(e));let i=this._root.querySelector(".squire-image-resize-container");i&&i.remove(),n=this._getRawHTML().replace(/\u200B/g,""),i&&this._root.appendChild(i),t&&this._getRangeAndRemoveBookmark(e)}),n}setHTML(t){let e=this._config.sanitizeToDOMFragment(t,this),n=this._root;Ee(e,this._config),ae(e,n,!1),B(e,n);let i=e,s=i.firstChild;if(!s||s.nodeName==="BR"){let l=this.createDefaultBlock();s?i.replaceChild(l,s):i.appendChild(l)}else for(;i=M(i,n);)x(i);for(this._ignoreChange=!0;s=n.lastChild;)n.removeChild(s);n.appendChild(e),this._undoIndex=-1,this._undoStack.length=0,this._undoStackLength=0,this._isInUndoState=!1;let r=this._getRangeAndRemoveBookmark()||Q(n.firstElementChild||n,0);return this.saveUndoState(r),this.setSelection(r),this._updatePath(r,!0),this}insertHTML(t,e){let n=this._config,i=n.sanitizeToDOMFragment(t,this),s=this.getSelection();this.saveUndoState(s);try{let r=this._root;n.addLinks&&this.addDetectedLinks(i,i),Ee(i,this._config),ae(i,r,!1),Se(i),i.normalize();let l=i;for(;l=M(l,i);)x(l);let a=!0;if(e){let d=new CustomEvent("willPaste",{cancelable:!0,detail:{html:t,fragment:i}});this.fireEvent("willPaste",d),i=d.detail.fragment,a=!d.defaultPrevented}a&&(Je(s,i,r),s.collapse(!1),Ae(s,"A",r),this._ensureBottomLine()),this.setSelection(s),this._updatePath(s,!0),e&&this.focus()}catch(r){this._config.didError(r)}return this}insertElement(t,e){if(e||(e=this.getSelection()),e.collapse(!0),N(t))X(e,t),e.setStartAfter(t);else{let n=this._root,i=v(e,n),s=i||n,r=null;for(;s!==n&&!s.nextSibling;)s=s.parentNode;if(s!==n){let a=s.parentNode;r=I(a,s.nextSibling,n,n)}i&&de(i)&&E(i),n.insertBefore(t,r);let l=this.createDefaultBlock();n.insertBefore(l,r),e.setStart(l,0),e.setEnd(l,0),C(e)}return this.focus(),this.setSelection(e),this._updatePath(e),this}insertImage(t,e){let n=h("IMG",Object.assign({src:t},e));return this.insertElement(n),n}insertPlainText(t,e){let n=this.getSelection();if(n.collapsed&&g(n.startContainer,this._root,"PRE")){let c=!0;if(e){let u=new CustomEvent("willPaste",{cancelable:!0,detail:{text:t}});this.fireEvent("willPaste",u),t=u.detail.text,c=!u.defaultPrevented}if(c){this.saveUndoState(n);let u=n.startContainer,f=n.startOffset,p;if(u instanceof Text)p=u;else{let m=f?u.childNodes[f-1]:null;if(m instanceof Text)p=m,f=p.length;else{let S=document.createTextNode("");u.insertBefore(S,u.childNodes[f]),p=S,f=0}}p.insertData(f,t),n.setStart(p,f+t.length),n.collapse(!0)}return this.setSelection(n),this}let i=t.split(`
`),s=this._config,r=s.blockTag,l=s.blockAttributes,a="</"+r+">",d="<"+r;for(let c in l)d+=" "+c+'="'+we(l[c])+'"';d+=">";for(let c=0,u=i.length;c<u;c+=1){let f=i[c];f=we(f).replace(/ (?=(?: |$))/g,"&nbsp;"),c&&(f=d+(f||"<BR>")+a),i[c]=f}return this.insertHTML(i.join(""),e)}getSelectedText(t){return Te(t||this.getSelection())}getFontInfo(t){let e={color:void 0,backgroundColor:void 0,fontFamily:void 0,fontSize:void 0};t||(t=this.getSelection()),C(t);let n=0,i=t.commonAncestorContainer;if(t.collapsed||i instanceof Text)for(i instanceof Text&&(i=i.parentNode);n<4&&i;){let s=i.style;if(s){let r=s.color;!e.color&&r&&(e.color=r,n+=1);let l=s.backgroundColor;!e.backgroundColor&&l&&(e.backgroundColor=l,n+=1);let a=s.fontFamily;!e.fontFamily&&a&&(e.fontFamily=a,n+=1);let d=s.fontSize;!e.fontSize&&d&&(e.fontSize=d,n+=1)}i=i.parentNode}return e}hasFormat(t,e,n){t=t.toUpperCase(),e||(e={}),n||(n=this.getSelection()),!n.collapsed&&n.startContainer instanceof Text&&n.startOffset===n.startContainer.length&&n.startContainer.nextSibling&&n.setStartBefore(n.startContainer.nextSibling),!n.collapsed&&n.endContainer instanceof Text&&n.endOffset===0&&n.endContainer.previousSibling&&n.setEndAfter(n.endContainer.previousSibling);let i=this._root,s=n.commonAncestorContainer;if(g(s,i,t,e))return!0;if(s instanceof Text)return!1;let r=new _(s,4,d=>z(n,d,!0)),l=!1,a;for(;a=r.nextNode();){if(!g(a,i,t,e))return!1;l=!0}return l}changeFormat(t,e,n,i){return n||(n=this.getSelection()),this.saveUndoState(n),e&&(n=this._removeFormat(e.tag.toUpperCase(),e.attributes||{},n,i)),t&&(n=this._addFormat(t.tag.toUpperCase(),t.attributes||{},n)),this.setSelection(n),this._updatePath(n,!0),this.focus()}_addFormat(t,e,n){let i=this._root;if(n.collapsed){let s=x(h(t,e));X(n,s);let r=s.firstChild||s,l=r instanceof Text?r.length:0;n.setStart(r,l),n.collapse(!0);let a=s;for(;N(a);)a=a.parentNode;le(a,s)}else{let s=new _(n.commonAncestorContainer,5,c=>(c instanceof Text||c.nodeName==="BR"||c.nodeName==="IMG")&&z(n,c,!0)),{startContainer:r,startOffset:l,endContainer:a,endOffset:d}=n;if(s.currentNode=r,!(r instanceof Element)&&!(r instanceof Text)||!s.filter(r)){let c=s.nextNode();if(!c)return n;r=c,l=0}do{let c=s.currentNode;if(!g(c,i,t,e)){c===a&&c.length>d&&c.splitText(d),c===r&&l&&(c=c.splitText(l),a===r?(a=c,d-=l):a===r.parentNode&&(d+=1),r=c,l=0);let f=h(t,e);k(c,f),f.appendChild(c)}}while(s.nextNode());n=Q(r,l,a,d)}return n}_removeFormat(t,e,n,i){this._saveRangeToBookmark(n);let s;n.collapsed&&(ie?s=document.createTextNode("\u200B"):s=document.createTextNode(""),X(n,s));let r=n.commonAncestorContainer;for(;N(r);)r=r.parentNode;let l=n.startContainer,a=n.startOffset,d=n.endContainer,c=n.endOffset,u=[],f=(m,S)=>{if(z(n,m,!1))return;let R,O;if(!z(n,m,!0)){!(m instanceof HTMLInputElement)&&(!(m instanceof Text)||m.data)&&u.push([S,m]);return}if(m instanceof Text)m===d&&c!==m.length&&u.push([S,m.splitText(c)]),m===l&&a&&(m.splitText(a),u.push([S,m]));else for(R=m.firstChild;R;R=O)O=R.nextSibling,f(R,S)},p=Array.from(r.getElementsByTagName(t)).filter(m=>z(n,m,!0)&&pe(m,t,e));if(i||p.forEach(m=>{f(m,m)}),u.forEach(([m,S])=>{m=m.cloneNode(!1),k(S,m),m.appendChild(S)}),p.forEach(m=>{k(m,T(m))}),ie&&s){s=s.parentNode;let m=s;for(;m&&N(m);)m=m.parentNode;m&&le(m,s)}return this._getRangeAndRemoveBookmark(n),s&&n.collapse(!1),ne(r,n),n}bold(){return this.changeFormat({tag:"B"})}removeBold(){return this.changeFormat(null,{tag:"B"})}italic(){return this.changeFormat({tag:"I"})}removeItalic(){return this.changeFormat(null,{tag:"I"})}underline(){return this.changeFormat({tag:"U"})}removeUnderline(){return this.changeFormat(null,{tag:"U"})}strikethrough(){return this.changeFormat({tag:"S"})}removeStrikethrough(){return this.changeFormat(null,{tag:"S"})}subscript(){return this.changeFormat({tag:"SUB"},{tag:"SUP"})}removeSubscript(){return this.changeFormat(null,{tag:"SUB"})}superscript(){return this.changeFormat({tag:"SUP"},{tag:"SUB"})}removeSuperscript(){return this.changeFormat(null,{tag:"SUP"})}makeLink(t,e){let n=this.getSelection();if(n.collapsed){let i=t.indexOf(":")+1;if(i)for(;t[i]==="/";)i+=1;X(n,document.createTextNode(t.slice(i)))}return e=Object.assign({href:t},this._config.tagAttributes.a,e),this.changeFormat({tag:"A",attributes:e},{tag:"A"},n)}removeLink(){return this.changeFormat(null,{tag:"A"},this.getSelection(),!0)}addDetectedLinks(t,e){let n=new _(t,4,l=>!g(l,e||this._root,"A")),i=this.linkRegExp,s=this._config.tagAttributes.a,r;for(;r=n.nextNode();){let l=r.parentNode,a=r.data,d;for(;d=i.exec(a);){let c=d.index,u=c+d[0].length;c&&l.insertBefore(document.createTextNode(a.slice(0,c)),r);let f=h("A",Object.assign({href:d[1]?/^(?:ht|f)tps?:/i.test(d[1])?d[1]:"http://"+d[1]:"mailto:"+d[0]},s));f.textContent=a.slice(c,u),l.insertBefore(f,r),r.data=a=a.slice(u)}}return this}setFontFace(t){let e=this._config.classNames.fontFamily;return this.changeFormat(t?{tag:"SPAN",attributes:{class:e,style:"font-family: "+t+", sans-serif;"}}:null,{tag:"SPAN",attributes:{class:e}})}setFontSize(t){let e=this._config.classNames.fontSize;return this.changeFormat(t?{tag:"SPAN",attributes:{class:e,style:"font-size: "+(typeof t=="number"?t+"px":t)}}:null,{tag:"SPAN",attributes:{class:e}})}setTextColor(t){let e=this._config.classNames.color;return this.changeFormat(t?{tag:"SPAN",attributes:{class:e,style:"color:"+t}}:null,{tag:"SPAN",attributes:{class:e}})}setHighlightColor(t){let e=this._config.classNames.highlight;return this.changeFormat(t?{tag:"SPAN",attributes:{class:e,style:"background-color:"+t}}:null,{tag:"SPAN",attributes:{class:e}})}_ensureBottomLine(){let t=this._root,e=t;do e=e.lastElementChild;while(e&&K(e));(!e||!F(e))&&t.appendChild(this.createDefaultBlock())}createDefaultBlock(t){let e=this._config;return x(h(e.blockTag,e.blockAttributes,t))}splitBlock(t,e){e||(e=this.getSelection());let n=this._root,i,s,r,l;if(this._recordUndoState(e),this._removeZWS(),this._getRangeAndRemoveBookmark(e),e.collapsed||P(e,n),this._config.addLinks){C(e);let f=e.startContainer,p=e.startOffset;setTimeout(()=>{Ce(this,f,p)},0)}if(i=v(e,n),i&&(s=g(i,n,"PRE"))){C(e),r=e.startContainer;let f=e.startOffset;return r instanceof Text||(r=document.createTextNode(""),s.insertBefore(r,s.firstChild),f=0),!t&&r instanceof Text&&(r.data.charAt(f-1)===`
`||j(e,n))&&(r.data.charAt(f)===`
`||G(e,n))?(r.deleteData(f&&f-1,f?2:1),l=I(r,f&&f-1,n,n),r=l.previousSibling,r.textContent||E(r),r=this.createDefaultBlock(),l.parentNode.insertBefore(r,l),l.textContent||E(l),e.setStart(r,0)):(r.insertData(f,`
`),r.nextSibling||s.appendChild(h("BR")),r.length===f+1?e.setStartAfter(r):e.setStart(r,f+1)),e.collapse(!0),this.setSelection(e),this._updatePath(e,!0),this._docWasChanged(),this}if(!i||t||/^T[HD]$/.test(i.nodeName))return Ae(e,"A",n),X(e,h("BR")),e.collapse(!1),this.setSelection(e),this._updatePath(e,!0),this;if((s=g(i,n,"LI"))&&(i=s),de(i)){if(g(i,n,"UL")||g(i,n,"OL"))return this.decreaseListLevel(e),this;if(g(i,n,"BLOCKQUOTE"))return this.replaceWithBlankLine(e),this}r=e.startContainer;let a=e.startOffset,d=this.tagAfterSplit[i.nodeName];l=I(r,a,i.parentNode,this._root);let c=this._config,u=null;for(d||(d=c.blockTag,u=c.blockAttributes),pe(l,d,u)||(i=h(d,u),l.dir&&(i.dir=l.dir),k(l,i),i.appendChild(T(l)),l=i),le(i),Se(i),x(i);l instanceof Element;){let f=l.firstChild,p;if(l.nodeName==="A"&&(!l.textContent||l.textContent==="\u200B")){f=document.createTextNode(""),k(l,f),l=f;break}for(;f&&f instanceof Text&&!f.data&&(p=f.nextSibling,!(!p||p.nodeName==="BR"));)E(f),f=p;if(!f||f.nodeName==="BR"||f instanceof Text)break;l=f}return e=Q(l,0),this.setSelection(e),this._updatePath(e,!0),this}forEachBlock(t,e,n){n||(n=this.getSelection()),e&&this.saveUndoState(n);let i=this._root,s=v(n,i),r=Z(n,i);if(s&&r)do if(t(s)||s===r)break;while(s=M(s,i));return e&&(this.setSelection(n),this._updatePath(n,!0)),this}modifyBlocks(t,e){e||(e=this.getSelection()),this._recordUndoState(e,this._isInUndoState);let n=this._root;Ie(e,n),$(e,n,n,n);let i=Me(e,n,n);if(!e.collapsed){let s=e.endContainer;if(s===n)e.collapse(!1);else{for(;s.parentNode!==n;)s=s.parentNode;e.setStartBefore(s),e.collapse(!0)}}return X(e,t.call(this,i)),e.endOffset<e.endContainer.childNodes.length&&H(e.endContainer.childNodes[e.endOffset],n),H(e.startContainer.childNodes[e.startOffset],n),this._getRangeAndRemoveBookmark(e),this.setSelection(e),this._updatePath(e,!0),this}setTextAlignment(t){return this.forEachBlock(e=>{let n=e.className.split(/\s+/).filter(i=>!!i&&!/^align/.test(i)).join(" ");t?(e.className=n+" align-"+t,e.style.textAlign=t):(e.className=n,e.style.textAlign="")},!0),this.focus()}setTextDirection(t){return this.forEachBlock(e=>{t?e.dir=t:e.removeAttribute("dir")},!0),this.focus()}_getListSelection(t,e){let n=t.commonAncestorContainer,i=t.startContainer,s=t.endContainer;for(;n&&n!==e&&!/^[OU]L$/.test(n.nodeName);)n=n.parentNode;if(!n||n===e)return null;for(i===n&&(i=i.childNodes[t.startOffset]),s===n&&(s=s.childNodes[t.endOffset]);i&&i.parentNode!==n;)i=i.parentNode;for(;s&&s.parentNode!==n;)s=s.parentNode;return[n,i,s]}increaseListLevel(t){t||(t=this.getSelection());let e=this._root,n=this._getListSelection(t,e);if(!n)return this.focus();let[i,s,r]=n;if(!s||s===i.firstChild)return this.focus();this._recordUndoState(t,this._isInUndoState);let l=i.nodeName,a=s.previousSibling,d,c;a.nodeName!==l&&(d=this._config.tagAttributes[l.toLowerCase()],a=h(l,d),i.insertBefore(a,s));do c=s===r?null:s.nextSibling,a.appendChild(s);while(s=c);return c=a.nextSibling,c&&H(c,e),this._getRangeAndRemoveBookmark(t),this.setSelection(t),this._updatePath(t,!0),this.focus()}decreaseListLevel(t){t||(t=this.getSelection());let e=this._root,n=this._getListSelection(t,e);if(!n)return this.focus();let[i,s,r]=n;s||(s=i.firstChild),r||(r=i.lastChild),this._recordUndoState(t,this._isInUndoState);let l,a=null;if(s){let d=i.parentNode;if(a=r.nextSibling?I(i,r.nextSibling,d,e):i.nextSibling,d!==e&&d.nodeName==="LI"){for(d=d.parentNode;a;)l=a.nextSibling,r.appendChild(a),a=l;a=i.parentNode.nextSibling}let c=!/^[OU]L$/.test(d.nodeName);do l=s===r?null:s.nextSibling,i.removeChild(s),c&&s.nodeName==="LI"&&(s=this.createDefaultBlock([T(s)])),d.insertBefore(s,a);while(s=l)}return i.firstChild||E(i),a&&H(a,e),this._getRangeAndRemoveBookmark(t),this.setSelection(t),this._updatePath(t,!0),this.focus()}_makeList(t,e){let n=ce(t,this._root),i=this._config.tagAttributes,s=i[e.toLowerCase()],r=i.li,l;for(;l=n.nextNode();)if(l.parentNode instanceof HTMLLIElement&&(l=l.parentNode,n.currentNode=l.lastChild),l instanceof HTMLLIElement){l=l.parentNode;let a=l.nodeName;a!==e&&/^[OU]L$/.test(a)&&k(l,h(e,s,[T(l)]))}else{let a=h("LI",r);l.dir&&(a.dir=l.dir);let d=l.previousSibling;d&&d.nodeName===e?(d.appendChild(a),E(l)):k(l,h(e,s,[a])),a.appendChild(T(l)),n.currentNode=a}return t}makeUnorderedList(){return this.modifyBlocks(t=>this._makeList(t,"UL")),this.focus()}makeOrderedList(){return this.modifyBlocks(t=>this._makeList(t,"OL")),this.focus()}removeList(){return this.modifyBlocks(t=>{let e=t.querySelectorAll("UL, OL"),n=t.querySelectorAll("LI"),i=this._root;for(let s=0,r=e.length;s<r;s+=1){let l=e[s],a=T(l);B(a,i),k(l,a)}for(let s=0,r=n.length;s<r;s+=1){let l=n[s];F(l)?k(l,this.createDefaultBlock([T(l)])):(B(l,i),k(l,T(l)))}return t}),this.focus()}increaseQuoteLevel(t){return this.modifyBlocks(e=>h("BLOCKQUOTE",this._config.tagAttributes.blockquote,[e]),t),this.focus()}decreaseQuoteLevel(t){return this.modifyBlocks(e=>(Array.from(e.querySelectorAll("blockquote")).filter(n=>!g(n.parentNode,e,"BLOCKQUOTE")).forEach(n=>{k(n,T(n))}),e),t),this.focus()}removeQuote(t){return this.modifyBlocks(e=>(Array.from(e.querySelectorAll("blockquote")).forEach(n=>{k(n,T(n))}),e),t),this.focus()}replaceWithBlankLine(t){return this.modifyBlocks(()=>this.createDefaultBlock([h("INPUT",{id:this.startSelectionId,type:"hidden"}),h("INPUT",{id:this.endSelectionId,type:"hidden"})]),t),this.focus()}code(){let t=this.getSelection();return t.collapsed||K(t.commonAncestorContainer)?(this.modifyBlocks(e=>{let n=this._root,i=document.createDocumentFragment(),s=ce(e,n),r;for(;r=s.nextNode();){let a=r.querySelectorAll("BR"),d=[],c=a.length;for(let u=0;u<c;u+=1)d[u]=te(a[u],!1);for(;c--;){let u=a[c];d[c]?k(u,document.createTextNode(`
`)):E(u)}for(a=r.querySelectorAll("CODE"),c=a.length;c--;)k(a[c],T(a[c]));i.childNodes.length&&i.appendChild(document.createTextNode(`
`)),i.appendChild(T(r))}let l=new _(i,4);for(;r=l.nextNode();)r.data=r.data.replace(/ /g," ");return i.normalize(),x(h("PRE",this._config.tagAttributes.pre,[i]))},t),this.focus()):this.changeFormat({tag:"CODE",attributes:this._config.tagAttributes.code},null,t),this}removeCode(){let t=this.getSelection(),e=t.commonAncestorContainer;return g(e,this._root,"PRE")?(this.modifyBlocks(i=>{let s=this._root,r=i.querySelectorAll("PRE"),l=r.length;for(;l--;){let a=r[l],d=new _(a,4),c;for(;c=d.nextNode();){let u=c.data;u=u.replace(/ (?= )/g,"\xA0");let f=document.createDocumentFragment(),p;for(;(p=u.indexOf(`
`))>-1;)f.appendChild(document.createTextNode(u.slice(0,p))),f.appendChild(h("BR")),u=u.slice(p+1);c.parentNode.insertBefore(f,c),c.data=u}B(a,s),k(a,T(a))}return i},t),this.focus()):this.changeFormat(null,{tag:"CODE"},t),this}toggleCode(){return this.hasFormat("PRE")||this.hasFormat("CODE")?this.removeCode():this.code(),this}_removeFormatting(t,e){for(let n=t.firstChild,i;n;n=i){if(i=n.nextSibling,N(n)){if(n instanceof Text||n.nodeName==="BR"||n.nodeName==="IMG"){e.appendChild(n);continue}}else if(F(n)){e.appendChild(this.createDefaultBlock([this._removeFormatting(n,document.createDocumentFragment())]));continue}this._removeFormatting(n,e)}return e}removeAllFormatting(t){if(t||(t=this.getSelection()),t.collapsed)return this.focus();let e=this._root,n=t.commonAncestorContainer;for(;n&&!F(n);)n=n.parentNode;if(n||(Ie(t,e),n=e),n instanceof Text)return this.focus();this.saveUndoState(t),$(t,n,n,e);let i=t.startContainer,s=t.startOffset,r=t.endContainer,l=t.endOffset,a=document.createDocumentFragment(),d=document.createDocumentFragment(),c=I(r,l,n,e),u=I(i,s,n,e),f;for(;u!==c;)f=u.nextSibling,a.appendChild(u),u=f;if(this._removeFormatting(a,d),d.normalize(),u=d.firstChild,f=d.lastChild,u){n.insertBefore(d,c);let p=Array.from(n.childNodes);s=p.indexOf(u),l=f?p.indexOf(f)+1:0}else c&&(s=Array.from(n.childNodes).indexOf(c),l=s);return t.setStart(n,s),t.setEnd(n,l),ne(n,t),C(t),this.setSelection(t),this._updatePath(t,!0),this.focus()}};var ni=xe;
return ni;
})() : null;

// --- src/icons.js ---
const { icon } = (() => {
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
  text: `<path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/>`,
};

function icon(name, size = 16) {
  const path = SVG_PATHS[name] || "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
  return { icon };
})();

// --- src/sanitizer.js ---
const { isSafeUrl, sanitizeToDOMFragment, normalizeExportHTML, formatHTML } = (() => {
/**
 * Zero-dependency allowlist HTML sanitizer for Squire (`sanitizeToDOMFragment`)
 * and semantic HTML cleanup / pretty printing.
 */

const ALLOWED_TAGS = new Set([
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
  "TD",
]);

const DROP_CONTENT_TAGS = new Set([
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
  "HEAD",
]);

const ALLOWED_ATTRS = {
  "*": new Set(["dir", "class", "style"]),
  A: new Set(["href", "title", "target", "rel"]),
  IMG: new Set(["src", "alt", "title", "width", "height", "data-align", "data-width"]),
  TD: new Set(["colspan", "rowspan"]),
  TH: new Set(["colspan", "rowspan", "scope"]),
  OL: new Set(["start"]),
};

const ALLOWED_STYLE_PROPS = new Set([
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
  "margin-right",
]);

const SAFE_LINK_PROTOCOLS = /^(https?:|mailto:|tel:|#|\/(?!\/))/i;
const SAFE_IMG_PROTOCOLS = /^(https?:|\/(?!\/)|blob:|data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,)/i;

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
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(node.nodeValue || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tag = node.nodeName.toUpperCase();
  if (DROP_CONTENT_TAGS.has(tag)) {
    return null;
  }

  // Unwrap disallowed container elements while keeping safe text/children
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
      // Only allow our own alignment/editor classes, strip Word/Docs junk classes
      const safeClasses = val
        .split(/\s+/)
        .filter((c) => /^align-(left|center|right|justify)$/.test(c));
      if (safeClasses.length) el.setAttribute("class", safeClasses.join(" "));
      continue;
    }
    if (name === "data-align") {
      if (/^(left|center|right)$/.test(val)) el.setAttribute("data-align", val);
      continue;
    }
    if (name === "width" || name === "height") {
      if (/^\d+(\.\d+)?(%|px)?$/.test(val.trim())) {
        el.setAttribute(name, val.trim());
      }
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
  const doc = editor?._doc || document;
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
    for (const attr of Array.from(el.attributes)) {
      replacement.setAttribute(attr.name, attr.value);
    }
    while (el.firstChild) replacement.appendChild(el.firstChild);
    el.replaceWith(replacement);
  };

  for (const b of Array.from(tpl.content.querySelectorAll("b"))) {
    renameTag(b, "strong");
  }
  for (const i of Array.from(tpl.content.querySelectorAll("i"))) {
    renameTag(i, "em");
  }
  for (const img of Array.from(tpl.content.querySelectorAll("img"))) {
    img.removeAttribute("tabindex");
  }

  return tpl.innerHTML.trim();
}

/**
 * Lightweight zero-dependency HTML pretty printer for live preview inspection.
 */
function formatHTML(html) {
  if (!html) return "";
  const containerTags = /^(ul|ol|blockquote|table|thead|tbody|tfoot|tr|figure)$/i;
  const leafBlockTags = /^(p|h[1-6]|li|pre|hr|div|th|td|figcaption)$/i;
  const tokens = html
    .replace(/>\s+</g, "><")
    .match(/<!--[\s\S]*?-->|<\/?[^>]+>|[^<]+/g);
  if (!tokens) return html;

  let indent = 0;
  const lines = [];
  let inPre = false;

  for (const token of tokens) {
    if (token.startsWith("</")) {
      const name = token.slice(2, -1).trim();
      if (/^pre$/i.test(name)) inPre = false;
      if (containerTags.test(name)) {
        indent = Math.max(0, indent - 1);
        lines.push(`${"  ".repeat(indent)}${token}`);
      } else if (lines.length) {
        lines[lines.length - 1] += token;
      } else {
        lines.push(token);
      }
    } else if (token.startsWith("<")) {
      const match = token.match(/^<([a-z0-9-]+)/i);
      const name = match ? match[1] : "";
      const selfClosing = token.endsWith("/>") || /^(br|hr|img|input)$/i.test(name);
      if (/^pre$/i.test(name)) inPre = true;

      if (containerTags.test(name)) {
        lines.push(`${"  ".repeat(indent)}${token}`);
        if (!selfClosing) indent += 1;
      } else if (leafBlockTags.test(name)) {
        lines.push(`${"  ".repeat(indent)}${token}`);
      } else if (lines.length && !inPre) {
        lines[lines.length - 1] += token;
      } else {
        lines.push(token);
      }
    } else {
      const text = inPre ? token : token.replace(/\s+/g, " ");
      if (!inPre && !text.trim()) continue;
      if (lines.length) {
        lines[lines.length - 1] += text;
      } else {
        lines.push(text);
      }
    }
  }

  return lines.join("\n");
}
  return { isSafeUrl, sanitizeToDOMFragment, normalizeExportHTML, formatHTML };
})();

// --- src/extensions/headings.js ---
const { isHeadingActive, setParagraph, toggleHeading } = (() => {
/**
 * Headings extension for Squire (`toggleHeading(1|2|3)` and `setParagraph()`).
 */

const BLOCK_SELECTOR = "p, div, h1, h2, h3, h4, h5, h6";

function convertFragmentBlocks(squire, frag, targetTag) {
  const doc = squire._doc || document;
  const upperTarget = targetTag.toUpperCase();
  const blocks = Array.from(frag.children);

  if (blocks.length === 0) {
    const el = doc.createElement(targetTag);
    while (frag.firstChild) el.appendChild(frag.firstChild);
    frag.appendChild(el);
    return frag;
  }

  for (const child of blocks) {
    if (child.nodeName === "UL" || child.nodeName === "OL" || child.nodeName === "BLOCKQUOTE") {
      // Unwrap nested list/quote items if toggling heading directly on them
      continue;
    }
    if (child.matches && child.matches(BLOCK_SELECTOR)) {
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
  if (squire.hasFormat("UL") || squire.hasFormat("OL")) {
    squire.removeList();
  }
  if (squire.hasFormat("BLOCKQUOTE")) {
    squire.removeQuote();
  }
  if (squire.hasFormat("PRE")) {
    squire.removeCode();
  }
  squire.modifyBlocks((frag) => convertFragmentBlocks(squire, frag, "p"));
  squire.focus();
}

function toggleHeading(squire, level = 2) {
  const tag = `h${level}`;
  if (squire.hasFormat(tag.toUpperCase())) {
    setParagraph(squire);
    return;
  }
  if (squire.hasFormat("UL") || squire.hasFormat("OL")) {
    squire.removeList();
  }
  if (squire.hasFormat("PRE")) {
    squire.removeCode();
  }
  squire.modifyBlocks((frag) => convertFragmentBlocks(squire, frag, tag));
  squire.focus();
}
  return { isHeadingActive, setParagraph, toggleHeading };
})();

// --- src/extensions/formatting.js ---
const { isActive, getActiveState, execCommand } = (() => {
/**
 * TipTap-inspired command & active-state adapter on top of Squire.
 */

function isActive(squire, name, attrs = {}) {
  if (!squire) return false;
  switch (name) {
    case "bold":
      return squire.hasFormat("B") || squire.hasFormat("STRONG");
    case "italic":
      return squire.hasFormat("I") || squire.hasFormat("EM");
    case "underline":
      return squire.hasFormat("U");
    case "strike":
      return squire.hasFormat("S") || squire.hasFormat("DEL");
    case "code":
      return squire.hasFormat("CODE") || squire.hasFormat("PRE");
    case "link":
      return squire.hasFormat("A");
    case "bulletList":
      return squire.hasFormat("UL");
    case "orderedList":
      return squire.hasFormat("OL");
    case "blockquote":
      return squire.hasFormat("BLOCKQUOTE");
    case "heading":
      return isHeadingActive(squire, attrs.level);
    case "paragraph":
      return (
        !isHeadingActive(squire) &&
        !squire.hasFormat("UL") &&
        !squire.hasFormat("OL") &&
        !squire.hasFormat("BLOCKQUOTE") &&
        !squire.hasFormat("PRE")
      );
    default:
      return false;
  }
}

function getActiveState(squire) {
  return {
    bold: isActive(squire, "bold"),
    italic: isActive(squire, "italic"),
    underline: isActive(squire, "underline"),
    strike: isActive(squire, "strike"),
    code: isActive(squire, "code"),
    link: isActive(squire, "link"),
    bulletList: isActive(squire, "bulletList"),
    orderedList: isActive(squire, "orderedList"),
    blockquote: isActive(squire, "blockquote"),
    paragraph: isActive(squire, "paragraph"),
    h1: isActive(squire, "heading", { level: 1 }),
    h2: isActive(squire, "heading", { level: 2 }),
    h3: isActive(squire, "heading", { level: 3 }),
  };
}

function execCommand(squire, command, arg) {
  if (!squire) return;
  switch (command) {
    case "bold":
      isActive(squire, "bold") ? squire.removeBold() : squire.bold();
      break;
    case "italic":
      isActive(squire, "italic") ? squire.removeItalic() : squire.italic();
      break;
    case "underline":
      isActive(squire, "underline") ? squire.removeUnderline() : squire.underline();
      break;
    case "strike":
      isActive(squire, "strike")
        ? squire.changeFormat(null, { tag: "S" })
        : squire.changeFormat({ tag: "S" }, null);
      break;
    case "code":
      squire.toggleCode();
      break;
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
      squire.hasFormat("UL") ? squire.removeList() : squire.makeUnorderedList();
      break;
    case "orderedList":
      squire.hasFormat("OL") ? squire.removeList() : squire.makeOrderedList();
      break;
    case "blockquote":
      squire.hasFormat("BLOCKQUOTE") ? squire.decreaseQuoteLevel() : squire.increaseQuoteLevel();
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
      if (arg) squire.makeLink(arg, { target: "_blank", rel: "noopener noreferrer" });
      break;
    case "removeLink":
      squire.removeLink();
      break;
    default:
      break;
  }
}
  return { isActive, getActiveState, execCommand };
})();

// --- src/extensions/image-resize.js ---
const { createImageResizeExtension } = (() => {
/**
 * Custom TipTap-style Image Resize, Alignment, Alt-Text & Upload extension for Squire.
 *
 * Keeps all selection handles, live dimension badge, and floating toolbar OUTSIDE
 * the `contenteditable` root so `getHTML()` stays 100% clean.
 */

const MIN_WIDTH = 48;
const HANDLES = [
  { pos: "nw", cursor: "nwse-resize" },
  { pos: "ne", cursor: "nesw-resize" },
  { pos: "se", cursor: "nwse-resize" },
  { pos: "sw", cursor: "nesw-resize" },
  { pos: "w", cursor: "ew-resize" },
  { pos: "e", cursor: "ew-resize" },
];

const WIDTH_PRESETS = ["25%", "50%", "75%", "100%"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function createImageResizeExtension({
  squire,
  surface,
  overlayHost,
  editorToolbar,
  onChange,
  onSelectChange,
  getUploadHandler,
  onStatus,
}) {
  // Disable Squire's built-in DOM-polluting image resizer cleanly
  if (squire._imageResizer && typeof squire._imageResizer.destroy === "function") {
    squire._imageResizer.destroy();
  }

  let selectedImg = null;
  let dragState = null;
  let altEditing = false;

  // Selection box & handles (inside overlayHost, outside contenteditable)
  const box = document.createElement("div");
  box.className = "ve-img-selection";
  box.hidden = true;

  const dimBadge = document.createElement("div");
  dimBadge.className = "ve-img-badge";
  dimBadge.hidden = true;
  box.appendChild(dimBadge);

  const handleEls = new Map();
  for (const { pos, cursor } of HANDLES) {
    const h = document.createElement("button");
    h.type = "button";
    h.tabIndex = -1;
    h.className = `ve-img-handle ve-img-handle--${pos}`;
    h.dataset.handle = pos;
    h.style.cursor = cursor;
    h.setAttribute("aria-label", `Resize image (${pos})`);
    h.addEventListener("pointerdown", onHandlePointerDown);
    h.addEventListener("touchstart", preventTouchScroll, { passive: false });
    box.appendChild(h);
    handleEls.set(pos, h);
  }
  overlayHost.appendChild(box);

  // Floating image toolbar (native Popover API, top-layer)
  const toolbar = document.createElement("div");
  toolbar.className = "ve-popover ve-img-toolbar";
  toolbar.setAttribute("popover", "manual");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "Image options");
  overlayHost.appendChild(toolbar);

  function renderToolbar() {
    if (!selectedImg) return;

    if (altEditing) {
      toolbar.innerHTML = `
        <form class="ve-img-alt-form">
          <input type="text" class="ve-input ve-input--sm" name="alt" placeholder="Describe this image..." value="${escapeAttr(selectedImg.getAttribute("alt") || "")}" />
          <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary" title="Save alt text">${icon("check", 14)}</button>
          <button type="button" class="ve-btn ve-btn--sm" data-action="cancel-alt" title="Cancel">${icon("x", 14)}</button>
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
      toolbar.querySelector('[data-action="cancel-alt"]').addEventListener("click", () => {
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
      <div class="ve-btn-group" role="group" aria-label="Image width">
        ${WIDTH_PRESETS.map(
          (w) => `
          <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${currentStyleWidth === w ? "is-active" : ""}" data-width="${w}" title="Width ${w}">${w}</button>
        `,
        ).join("")}
      </div>
      <span class="ve-sep"></span>
      <div class="ve-btn-group" role="group" aria-label="Image alignment">
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "left" ? "is-active" : ""}" data-align="left" title="Align left">${icon("alignLeft", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "center" ? "is-active" : ""}" data-align="center" title="Align center">${icon("alignCenter", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "right" ? "is-active" : ""}" data-align="right" title="Align right">${icon("alignRight", 14)}</button>
      </div>
      <span class="ve-sep"></span>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${selectedImg.getAttribute("alt") ? "is-active" : ""}" data-action="edit-alt" title="Edit alt text">Alt</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--danger" data-action="delete" title="Delete image">${icon("trash", 14)}</button>
    `;
  }

  toolbar.addEventListener("mousedown", (e) => {
    // Allow focusing the alt input, prevent stealing focus on buttons
    if (e.target.closest("input")) return;
    e.preventDefault();
  });

  toolbar.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !selectedImg) return;

    if (btn.dataset.width) {
      applyWidth(btn.dataset.width);
    } else if (btn.dataset.align) {
      applyAlignment(btn.dataset.align);
    } else if (btn.dataset.action === "edit-alt") {
      altEditing = true;
      renderToolbar();
      positionOverlay();
    } else if (btn.dataset.action === "delete") {
      deleteSelectedImage();
    }
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
    // Ensure empty paragraph still has a <br> sentinel
    if (parent && parent !== surface && !parent.textContent && !parent.querySelector("img, br")) {
      parent.appendChild(document.createElement("br"));
    }
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

    // Position top-layer popover cleanly above image, below if near top edge, or clamped inside viewport
    const tbRect = toolbar.getBoundingClientRect();
    const gap = 8;
    const maxTop = Math.max(8, window.innerHeight - tbRect.height - 8);
    let top = imgRect.top - tbRect.height - gap;
    if (top < 8) {
      const below = imgRect.bottom + gap;
      top = below <= maxTop ? below : Math.max(8, Math.min(maxTop, imgRect.top + 8));
    } else if (top > maxTop) {
      top = maxTop;
    }
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
    const pos = handle.dataset.handle;
    const imgRect = selectedImg.getBoundingClientRect();
    const surfaceStyle = getComputedStyle(surface);
    const maxWidth = Math.max(
      MIN_WIDTH,
      surface.clientWidth - parseFloat(surfaceStyle.paddingLeft) - parseFloat(surfaceStyle.paddingRight),
    );
    const ratio =
      selectedImg.naturalWidth && selectedImg.naturalHeight
        ? selectedImg.naturalWidth / selectedImg.naturalHeight
        : imgRect.width / (imgRect.height || 1);

    // Record pre-resize state in Squire's undo stack so Ctrl+Z reverts the resize
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
      ratio,
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

    // Corner handles: respect whichever axis moved more noticeably
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
    } catch {
      // ignore if already released
    }
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
    const pct = Math.min(100, Math.round((w / maxWidth) * 100));
    dimBadge.textContent = `${Math.round(w)} × ${Math.round(h)} px · ${pct}%`;
  }

  // Click selection & outside dismissal
  function onSurfaceClick(e) {
    const img = e.target.closest("img");
    if (img && surface.contains(img)) {
      e.preventDefault();
      selectImage(img);
    } else if (selectedImg) {
      deselect();
    }
  }

  function onDocPointerDown(e) {
    if (!selectedImg) return;
    const path = e.composedPath ? e.composedPath() : [e.target];
    if (path.includes(selectedImg) || path.includes(box) || path.includes(toolbar)) return;
    // Keep image selected when clicking alignment controls in the main editor toolbar
    if (editorToolbar && path.includes(editorToolbar)) {
      const alignBtn = e.target?.closest?.("button[data-cmd^=align]");
      if (alignBtn) return;
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

  // Image upload / paste / drag-and-drop
  async function insertImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return null;
    onStatus?.(`Uploading ${file.name || "image"}...`);
    try {
      const uploader = getUploadHandler?.();
      const src = uploader ? await uploader(file) : await fileToDataUrl(file);
      if (!src || !isSafeUrl(src, "image")) {
        throw new Error("Image URL rejected by sanitizer");
      }
      const alt = (file.name || "").replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const img = squire.insertImage(src, { alt, style: "width: 75%; height: auto;" });
      onStatus?.("");
      onChange?.();
      if (img) {
        const selectNow = () => selectImage(img);
        if (img.complete) requestAnimationFrame(selectNow);
        else img.addEventListener("load", selectNow, { once: true });
      }
      return img;
    } catch (err) {
      onStatus?.(err?.message || "Image upload failed");
      setTimeout(() => onStatus?.(""), 3000);
      return null;
    }
  }

  function insertImageUrl(url, alt = "") {
    if (!isSafeUrl(url, "image")) return null;
    const img = squire.insertImage(url.trim(), { alt: alt.trim(), style: "width: 75%; height: auto;" });
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
    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          insertImageFile(file);
          return;
        }
      }
    }
  }

  function onDragOver(e) {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    surface.classList.add("ve-drag-over");
  }

  function onDragLeave(e) {
    if (!surface.contains(e.relatedTarget)) {
      surface.classList.remove("ve-drag-over");
    }
  }

  function onDrop(e) {
    surface.classList.remove("ve-drag-over");
    const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    e.preventDefault();
    e.stopPropagation();
    deselect();
    for (const file of files) {
      insertImageFile(file);
    }
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
    getAlignment: () => (selectedImg ? selectedImg.getAttribute("data-align") || inferAlign(selectedImg) : null),
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
    },
  };
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
  return { createImageResizeExtension };
})();

// --- src/extensions/bubble-menu.js ---
const { createBubbleMenuExtension } = (() => {
/**
 * Floating selection toolbar powered by native Popover API (`popover="manual"`)
 * and CSS Anchor Positioning (with automatic rect fallback).
 */

const SUPPORTS_ANCHOR = typeof CSS !== "undefined" && CSS.supports("anchor-name: --a");
let anchorCounter = 0;

function createBubbleMenuExtension({
  squire,
  surface,
  overlayHost,
  onCommand,
  onOpenLink,
  isImageSelected,
}) {
  const anchorName = `--ve-sel-anchor-${++anchorCounter}`;

  const anchor = document.createElement("div");
  anchor.className = "ve-virtual-anchor";
  if (SUPPORTS_ANCHOR) {
    anchor.style.setProperty("anchor-name", anchorName);
  }
  overlayHost.appendChild(anchor);

  const menu = document.createElement("div");
  menu.className = "ve-popover ve-bubble-menu";
  menu.setAttribute("popover", "manual");
  menu.setAttribute("role", "toolbar");
  menu.setAttribute("aria-label", "Text formatting");
  if (SUPPORTS_ANCHOR) {
    menu.style.setProperty("position-anchor", anchorName);
  }

  menu.innerHTML = `
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="bold" title="Bold (Ctrl+B)">${icon("bold", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="italic" title="Italic (Ctrl+I)">${icon("italic", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="underline" title="Underline (Ctrl+U)">${icon("underline", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="strike" title="Strikethrough">${icon("strike", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="code" title="Code">${icon("code", 14)}</button>
    <span class="ve-sep"></span>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="link" title="Link (Ctrl+K)">${icon("link", 14)}</button>
  `;
  overlayHost.appendChild(menu);

  let visible = false;
  let rafId = 0;

  menu.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  menu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cmd]");
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    if (cmd === "link") {
      hide();
      onOpenLink?.();
      return;
    }
    execCommand(squire, cmd);
    syncActive();
    onCommand?.();
    scheduleUpdate();
  });

  function syncActive() {
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
    if (isImageSelected?.()) {
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
    if (!rect || (rect.width === 0 && rect.height === 0)) {
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
    destroy() {
      cancelAnimationFrame(rafId);
      hide();
      document.removeEventListener("selectionchange", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
      squire.removeEventListener("blur", onBlur);
      anchor.remove();
      menu.remove();
    },
  };
}
  return { createBubbleMenuExtension };
})();

// --- src/extensions/find-replace.js ---
const { createFindReplaceExtension } = (() => {
/**
 * Non-destructive Find & Replace extension powered by the native
 * CSS Custom Highlight API (`CSS.highlights` + `::highlight(...)`).
 * Highlights matches directly in the browser paint layer without mutating `contenteditable`.
 */

const SUPPORTS_HIGHLIGHTS =
  typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";

function createFindReplaceExtension({ surface, barSlot, squire, onChange }) {
  const bar = document.createElement("div");
  bar.className = "ve-find-bar";
  bar.hidden = true;
  bar.innerHTML = `
    <div class="ve-find-row">
      <input type="search" class="ve-input ve-input--sm" data-find-input placeholder="Find in document..." aria-label="Find text" />
      <span class="ve-find-count" data-find-count>0 / 0</span>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="prev" title="Previous match">↑</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="next" title="Next match">↓</button>
      <input type="text" class="ve-input ve-input--sm" data-replace-input placeholder="Replace with..." aria-label="Replace text" />
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="replace">Replace</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="replace-all">All</button>
      <button type="button" class="ve-btn ve-btn--sm" data-action="close" title="Close (Esc)">${icon("x", 14)}</button>
    </div>
  `;
  barSlot.appendChild(bar);

  const findInput = bar.querySelector("[data-find-input]");
  const replaceInput = bar.querySelector("[data-replace-input]");
  const countEl = bar.querySelector("[data-find-count]");

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
      countEl.textContent = "0 / 0";
      return;
    }

    const needle = query.toLowerCase();
    const walker = document.createTreeWalker(surface, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
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

    if (matches.length === 0) {
      activeIndex = -1;
    } else if (activeIndex < 0 || activeIndex >= matches.length) {
      activeIndex = 0;
    }

    paintHighlights();
  }

  function paintHighlights() {
    countEl.textContent = matches.length ? `${activeIndex + 1} / ${matches.length}` : "0 / 0";
    if (!SUPPORTS_HIGHLIGHTS || matches.length === 0) return;

    const all = new Highlight(...matches);
    CSS.highlights.set("ve-find", all);
    if (activeIndex >= 0 && matches[activeIndex]) {
      CSS.highlights.set("ve-find-active", new Highlight(matches[activeIndex]));
      const rect = matches[activeIndex].getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        matches[activeIndex].startContainer.parentElement?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
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
    if (replacement) {
      range.insertNode(document.createTextNode(replacement));
    }
    surface.normalize();
    onChange?.();
    computeMatches();
  }

  function replaceAll() {
    if (!matches.length) return;
    const replacement = replaceInput.value;
    squire.saveUndoState();
    // Replace from end to start so earlier offsets remain valid
    for (let i = matches.length - 1; i >= 0; i -= 1) {
      const range = matches[i];
      range.deleteContents();
      if (replacement) {
        range.insertNode(document.createTextNode(replacement));
      }
    }
    surface.normalize();
    onChange?.();
    computeMatches();
  }

  function open() {
    bar.hidden = false;
    const selected = window.getSelection()?.toString().trim();
    if (selected && !selected.includes("\n")) {
      findInput.value = selected;
    }
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
    bar.hidden ? open() : close();
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
      case "close":
        close();
        break;
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
    },
  };
}
  return { createFindReplaceExtension };
})();

// --- src/vanilia-editor.js ---
const { VaniliaEditorElement } = (() => {
/**
 * <vanilia-editor> — Form-Associated Custom Element (ElementInternals)
 * powered by vendored Fastmail Squire + modular modern Web/CSS API extensions.
 */
const BaseHTMLElement = typeof HTMLElement !== "undefined" ? HTMLElement : class {};

class VaniliaEditorElement extends BaseHTMLElement {
  static formAssociated = true;
  static observedAttributes = ["placeholder", "disabled", "required", "upload-url"];

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
    if (!this.#squire) {
      return this.#pendingValue ?? this.getAttribute("value") ?? "";
    }
    return this.getHTML();
  }

  set value(html) {
    const str = html == null ? "" : String(html);
    if (!this.#squire) {
      this.#pendingValue = str;
      return;
    }
    this.setHTML(str);
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

    // Capture any declarative initial content before building the UI
    if (this.#pendingValue !== null) {
      this.#initialHTML = this.#pendingValue;
      this.#pendingValue = null;
    } else if (this.hasAttribute("value")) {
      this.#initialHTML = this.getAttribute("value") || "";
    } else {
      const tpl = this.querySelector(":scope > template");
      this.#initialHTML = tpl ? tpl.innerHTML.trim() : this.innerHTML.trim();
    }

    this.#buildDOM();
    this.#initEditor();
    this.#mounted = true;

    if (this.#initialHTML) {
      this.setHTML(this.#initialHTML, { silent: true });
    }
    this.#applyDisabled(this.hasAttribute("disabled"));
    this.#syncFormState();
    this.#syncToolbar();
  }

  disconnectedCallback() {
    // Preserve current content if element is moved/reparented in the DOM
    if (this.#squire) {
      this.#pendingValue = this.getHTML();
    }
    this.#teardown();
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    if (!this.#mounted) return;
    if (name === "placeholder" && this.#surface) {
      this.#surface.dataset.placeholder = newVal || "Start writing...";
    } else if (name === "disabled") {
      this.#applyDisabled(newVal !== null);
    } else if (name === "required") {
      this.#syncFormState();
    }
  }

  formDisabledCallback(disabled) {
    this.#applyDisabled(disabled);
  }

  formResetCallback() {
    this.setHTML(this.#initialHTML || "");
  }

  formStateRestoreCallback(state) {
    if (typeof state === "string") {
      this.setHTML(state);
    }
  }

  // ---- Public API ----

  getHTML() {
    if (!this.#squire) return this.#pendingValue || "";
    const normalized = normalizeExportHTML(this.#squire.getHTML());
    // Treat empty placeholder paragraph as empty string
    if (normalized === "<p><br></p>" || normalized === "<p></p>" || normalized === "<div><br></div>") {
      return "";
    }
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

  exec(command, arg) {
    if (!this.#squire || this.hasAttribute("disabled")) return;
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
        if (!this.#imageResize?.getSelectedImage()) {
          this.#imageResize?.selectImage(targetImg);
        }
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

  insertImage(url, alt = "") {
    return this.#imageResize?.insertImageUrl(url, alt);
  }

  focus() {
    this.#squire?.focus();
  }

  // ---- Internal Setup ----

  #buildDOM() {
    this.innerHTML = "";

    const root = document.createElement("div");
    root.className = "ve-root";
    // Keep hypermedia frameworks (e.g. Datastar) from scanning internal contenteditable mutations
    root.setAttribute("data-ignore", "");
    root.innerHTML = `
      <div class="ve-toolbar" role="toolbar" aria-label="Formatting toolbar">
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="bold" title="Bold (Ctrl+B)">${icon("bold")}</button>
          <button type="button" class="ve-btn" data-cmd="italic" title="Italic (Ctrl+I)">${icon("italic")}</button>
          <button type="button" class="ve-btn" data-cmd="underline" title="Underline (Ctrl+U)">${icon("underline")}</button>
          <button type="button" class="ve-btn" data-cmd="strike" title="Strikethrough (Ctrl+Shift+X)">${icon("strike")}</button>
          <button type="button" class="ve-btn" data-cmd="code" title="Code / Code Block">${icon("code")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="paragraph" title="Paragraph">${icon("paragraph")}</button>
          <button type="button" class="ve-btn" data-cmd="h1" title="Heading 1">${icon("h1")}</button>
          <button type="button" class="ve-btn" data-cmd="h2" title="Heading 2">${icon("h2")}</button>
          <button type="button" class="ve-btn" data-cmd="h3" title="Heading 3">${icon("h3")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="bulletList" title="Bullet list">${icon("bulletList")}</button>
          <button type="button" class="ve-btn" data-cmd="orderedList" title="Numbered list">${icon("orderedList")}</button>
          <button type="button" class="ve-btn" data-cmd="blockquote" title="Blockquote">${icon("quote")}</button>
          <button type="button" class="ve-btn" data-cmd="hr" title="Horizontal rule">${icon("hr")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="alignLeft" title="Align left">${icon("alignLeft")}</button>
          <button type="button" class="ve-btn" data-cmd="alignCenter" title="Align center">${icon("alignCenter")}</button>
          <button type="button" class="ve-btn" data-cmd="alignRight" title="Align right">${icon("alignRight")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="link" title="Insert or edit link (Ctrl+K)">${icon("link")}</button>
          <button type="button" class="ve-btn" data-cmd="image" title="Insert or upload image">${icon("image")}</button>
          <button type="button" class="ve-btn" data-cmd="clearFormatting" title="Clear formatting">${icon("clear")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="undo" title="Undo (Ctrl+Z)">${icon("undo")}</button>
          <button type="button" class="ve-btn" data-cmd="redo" title="Redo (Ctrl+Shift+Z)">${icon("redo")}</button>
          <button type="button" class="ve-btn" data-cmd="find" title="Find & Replace (Ctrl+F)">${icon("search")}</button>
        </div>
      </div>

      <div class="ve-find-slot"></div>

      <div class="ve-stage">
        <div
          class="ve-surface"
          role="textbox"
          aria-multiline="true"
          aria-label="Rich text editor"
          data-placeholder="${escapeAttr(this.getAttribute("placeholder") || "Start writing, paste an image, or drop a photo here...")}"
        ></div>
      </div>

      <div class="ve-footer">
        <span class="ve-status" data-status></span>
        <span class="ve-metrics" data-metrics>0 words</span>
      </div>

      <input type="file" accept="image/*" hidden data-file-input />

      <div class="ve-popover ve-form-popover" popover="auto" data-link-popover>
        <form class="ve-popover-form" data-link-form>
          <label class="ve-field">
            <span>Link URL</span>
            <input type="url" class="ve-input" name="href" placeholder="https://example.com" required />
          </label>
          <div class="ve-popover-actions">
            <button type="button" class="ve-btn ve-btn--sm ve-btn--danger ve-btn--text" data-remove-link hidden>Remove</button>
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover>Cancel</button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text">Apply</button>
          </div>
        </form>
      </div>

      <div class="ve-popover ve-form-popover" popover="auto" data-image-popover>
        <form class="ve-popover-form" data-image-form>
          <div class="ve-upload-row">
            <button type="button" class="ve-btn ve-btn--text ve-btn--upload" data-pick-file>
              ${icon("upload", 15)}
              <span>Choose image file...</span>
            </button>
          </div>
          <div class="ve-divider-label"><span>or paste URL</span></div>
          <label class="ve-field">
            <span>Image URL</span>
            <input type="url" class="ve-input" name="src" placeholder="https://..." required />
          </label>
          <label class="ve-field">
            <span>Alt text (optional)</span>
            <input type="text" class="ve-input" name="alt" placeholder="Describe the image" />
          </label>
          <div class="ve-popover-actions">
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover>Cancel</button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text">Insert</button>
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

    this.#bindUIEvents();
  }

  #initEditor() {
    this.#squire = new Squire(this.#surface, {
      blockTag: "P",
      sanitizeToDOMFragment,
    });

    const onEditorMutate = () => {
      this.#syncFormState();
      this.#syncToolbar();
      this.#emitUpdate();
    };

    // Custom TipTap-style Image Resize & Upload extension
    this.#imageResize = createImageResizeExtension({
      squire: this.#squire,
      surface: this.#surface,
      overlayHost: this.#overlayHost,
      editorToolbar: this.#toolbar,
      onChange: onEditorMutate,
      onSelectChange: () => {
        this.#syncToolbar();
        this.#emitStateEvent();
      },
      getUploadHandler: () => this.#resolveUploadHandler(),
      onStatus: (msg) => {
        if (this.#statusEl) this.#statusEl.textContent = msg || "";
      },
    });

    // Floating selection bubble toolbar (Popover + CSS Anchor Positioning)
    this.#bubbleMenu = createBubbleMenuExtension({
      squire: this.#squire,
      surface: this.#surface,
      overlayHost: this.#overlayHost,
      onCommand: onEditorMutate,
      onOpenLink: () => this.#openLinkPopover(),
      isImageSelected: () => Boolean(this.#imageResize?.getSelectedImage()),
    });

    // Non-destructive Find & Replace (CSS Custom Highlight API)
    this.#findReplace = createFindReplaceExtension({
      surface: this.#surface,
      barSlot: this.#root.querySelector(".ve-find-slot"),
      squire: this.#squire,
      onChange: onEditorMutate,
    });

    this.#extensions = [this.#imageResize, this.#bubbleMenu, this.#findReplace];

    // Extra keyboard shortcuts
    const mod = navigator.platform?.toLowerCase().includes("mac") ? "Meta" : "Ctrl";
    this.#squire.setKeyHandler(`${mod}-k`, (_ed, event) => {
      event.preventDefault();
      this.#openLinkPopover();
    });
    this.#squire.setKeyHandler(`${mod}-f`, (_ed, event) => {
      event.preventDefault();
      this.#findReplace?.open();
    });
    this.#squire.setKeyHandler(`${mod}-Shift-x`, (_ed, event) => {
      event.preventDefault();
      this.exec("strike");
    });

    const onSelectionState = () => {
      this.#syncToolbar();
      this.#emitStateEvent();
    };

    // Squire lifecycle events
    this.#squire.addEventListener("input", onEditorMutate);
    this.#squire.addEventListener("pathChange", onSelectionState);
    this.#squire.addEventListener("select", onSelectionState);
    this.#squire.addEventListener("cursor", onSelectionState);
    this.#squire.addEventListener("undoStateChange", (e) => {
      this.#canUndo = Boolean(e.detail?.canUndo);
      this.#canRedo = Boolean(e.detail?.canRedo);
      onSelectionState();
    });
    this.#squire.addEventListener("blur", () => {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }

  #bindUIEvents() {
    // Prevent toolbar button mousedown from stealing focus/selection from Squire
    this.#toolbar.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) e.preventDefault();
    });

    this.#toolbar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-cmd]");
      if (!btn || btn.disabled) return;
      this.exec(btn.dataset.cmd);
    });

    // Link popover handlers
    const linkForm = this.#linkPopover.querySelector("[data-link-form]");
    const removeLinkBtn = this.#linkPopover.querySelector("[data-remove-link]");

    linkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const href = linkForm.elements.href.value.trim();
      if (!isSafeUrl(href, "link")) return;
      this.#hidePopover(this.#linkPopover);
      this.#restoreSavedRange();
      this.exec("makeLink", href);
    });

    removeLinkBtn.addEventListener("click", () => {
      this.#hidePopover(this.#linkPopover);
      this.#restoreSavedRange();
      this.exec("removeLink");
    });

    this.#linkPopover.querySelector("[data-close-popover]").addEventListener("click", () => {
      this.#hidePopover(this.#linkPopover);
      this.#restoreSavedRange();
    });

    // Image popover handlers
    const imageForm = this.#imagePopover.querySelector("[data-image-form]");
    imageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const src = imageForm.elements.src.value.trim();
      const alt = imageForm.elements.alt.value.trim();
      if (!isSafeUrl(src, "image")) return;
      this.#hidePopover(this.#imagePopover);
      this.#restoreSavedRange();
      this.#imageResize?.insertImageUrl(src, alt);
      imageForm.reset();
    });

    this.#imagePopover.querySelector("[data-pick-file]").addEventListener("click", () => {
      this.#hidePopover(this.#imagePopover);
      this.#fileInput.value = "";
      this.#fileInput.click();
    });

    this.#imagePopover.querySelector("[data-close-popover]").addEventListener("click", () => {
      this.#hidePopover(this.#imagePopover);
      this.#restoreSavedRange();
    });

    this.#fileInput.addEventListener("change", () => {
      const file = this.#fileInput.files?.[0];
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
        body: file,
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Upload failed (${resp.status})${text ? `: ${text}` : ""}`);
      }
      const data = await resp.json();
      if (!data?.url) throw new Error("Upload endpoint did not return { url }");
      return data.url;
    };
  }

  #openLinkPopover() {
    if (!this.#squire) return;
    this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;

    const existingHref = this.#findSelectedLinkHref();
    const form = this.#linkPopover.querySelector("[data-link-form]");
    const removeBtn = this.#linkPopover.querySelector("[data-remove-link]");
    form.elements.href.value = existingHref || "";
    removeBtn.hidden = !existingHref;

    this.#showPopoverNearButton(this.#linkPopover, this.#toolbar.querySelector('[data-cmd="link"]'));
    requestAnimationFrame(() => {
      form.elements.href.focus();
      form.elements.href.select();
    });
  }

  #openImagePopover() {
    if (!this.#squire) return;
    this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;
    const form = this.#imagePopover.querySelector("[data-image-form]");
    form.reset();
    this.#showPopoverNearButton(this.#imagePopover, this.#toolbar.querySelector('[data-cmd="image"]'));
    requestAnimationFrame(() => form.elements.src.focus());
  }

  #findSelectedLinkHref() {
    const sel = this.#squire?.getSelection();
    if (!sel) return "";
    let node = sel.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const anchor = node?.closest?.("a");
    return anchor && this.#surface.contains(anchor) ? anchor.getAttribute("href") || "" : "";
  }

  #restoreSavedRange() {
    if (this.#savedRange && this.#squire) {
      try {
        this.#squire.setSelection(this.#savedRange).focus();
      } catch {
        this.#squire.focus();
      }
    }
    this.#savedRange = null;
  }

  #showPopoverNearButton(popoverEl, btnEl) {
    try {
      if (!popoverEl.matches(":popover-open")) popoverEl.showPopover();
    } catch {
      popoverEl.hidden = false;
    }
    if (!btnEl) return;
    const bRect = btnEl.getBoundingClientRect();
    const pRect = popoverEl.getBoundingClientRect();
    let top = bRect.bottom + 8;
    if (top + pRect.height > window.innerHeight - 8) {
      top = Math.max(8, bRect.top - pRect.height - 8);
    }
    let left = bRect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - pRect.width - 8));
    popoverEl.style.top = `${Math.round(top)}px`;
    popoverEl.style.left = `${Math.round(left)}px`;
  }

  #hidePopover(popoverEl) {
    try {
      if (popoverEl.matches(":popover-open")) popoverEl.hidePopover();
    } catch {
      popoverEl.hidden = true;
    }
  }

  #findImageOnlyBlock() {
    const sel = this.#squire?.getSelection();
    if (!sel || !this.#surface) return null;
    let node = sel.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const block = node?.closest?.("p, div, figure");
    if (!block || block === this.#surface || !this.#surface.contains(block)) return null;
    const imgs = block.querySelectorAll("img");
    if (imgs.length === 1 && !(block.textContent || "").trim()) {
      return imgs[0];
    }
    return null;
  }

  #getActiveAlignment() {
    const imgAlign = this.#imageResize?.getAlignment?.();
    if (imgAlign) return imgAlign;
    const sel = this.#squire?.getSelection();
    if (!sel || !this.#surface) return null;
    let node = sel.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const block = node?.closest?.("p, div, h1, h2, h3, h4, h5, h6, li, blockquote");
    if (!block || !this.#surface.contains(block)) return null;
    if (block.style.textAlign) return block.style.textAlign;
    if (block.classList.contains("align-center")) return "center";
    if (block.classList.contains("align-right")) return "right";
    if (block.classList.contains("align-left")) return "left";
    return null;
  }

  #syncToolbar() {
    if (!this.#toolbar || !this.#squire) return;
    const active = getActiveState(this.#squire);
    const activeAlign = this.#getActiveAlignment();
    active.alignLeft = activeAlign === "left";
    active.alignCenter = activeAlign === "center";
    active.alignRight = activeAlign === "right";
    for (const btn of this.#toolbar.querySelectorAll("button[data-cmd]")) {
      const cmd = btn.dataset.cmd;
      if (cmd in active) {
        btn.classList.toggle("is-active", active[cmd]);
        btn.setAttribute("aria-pressed", String(active[cmd]));
      }
      if (cmd === "undo") btn.disabled = !this.#canUndo || this.hasAttribute("disabled");
      if (cmd === "redo") btn.disabled = !this.#canRedo || this.hasAttribute("disabled");
    }

    // Update empty-state & word count
    const html = this.getHTML();
    const text = this.getText();
    const hasImg = Boolean(this.#surface?.querySelector("img"));
    const isEmpty = !text && !hasImg;
    this.#surface?.toggleAttribute("data-empty", isEmpty);

    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const metricsEl = this.#root?.querySelector("[data-metrics]");
    if (metricsEl) {
      const imgCount = this.#surface?.querySelectorAll("img").length || 0;
      const parts = [`${words} ${words === 1 ? "word" : "words"}`];
      if (imgCount) parts.push(`${imgCount} ${imgCount === 1 ? "image" : "images"}`);
      metricsEl.textContent = parts.join(" · ");
    }
    return html;
  }

  #syncFormState() {
    const html = this.getHTML();
    this.#internals.setFormValue(html, html);

    const isRequired = this.hasAttribute("required");
    const hasContent = Boolean(this.getText() || this.#surface?.querySelector("img"));
    if (isRequired && !hasContent) {
      this.#internals.setValidity(
        { valueMissing: true },
        "Please fill out this field.",
        this.#surface || undefined,
      );
    } else {
      this.#internals.setValidity({});
    }
  }

  #applyDisabled(disabled) {
    if (!this.#surface || !this.#toolbar) return;
    this.#surface.setAttribute("contenteditable", disabled ? "false" : "true");
    this.#root.classList.toggle("is-disabled", disabled);
    for (const btn of this.#toolbar.querySelectorAll("button")) {
      btn.disabled = disabled;
    }
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
      active: getActiveState(this.#squire),
      canUndo: this.#canUndo,
      canRedo: this.#canRedo,
    };
  }

  #emitStateEvent() {
    const detail = this.#buildDetail();
    this.dispatchEvent(new CustomEvent("ve:update", { detail, bubbles: true, composed: true }));
    this.dispatchEvent(new CustomEvent("editorupdate", { detail, bubbles: true, composed: true }));
  }

  #emitUpdate() {
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.#emitStateEvent();
  }

  #teardown() {
    for (const ext of this.#extensions) {
      ext?.destroy?.();
    }
    this.#extensions = [];
    this.#imageResize = null;
    this.#bubbleMenu = null;
    this.#findReplace = null;
    this.#squire?.destroy();
    this.#squire = null;
    this.#mounted = false;
  }
}

if (typeof customElements !== "undefined" && !customElements.get("vanilia-editor")) {
  customElements.define("vanilia-editor", VaniliaEditorElement);
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
  return { VaniliaEditorElement };
})();

export {
  VaniliaEditorElement,
  sanitizeToDOMFragment,
  normalizeExportHTML,
  formatHTML,
  isSafeUrl,
  createImageResizeExtension,
  createBubbleMenuExtension,
  createFindReplaceExtension,
};
