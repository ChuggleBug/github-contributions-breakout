import { n as e, t } from "./breakout-GHvxRYRs.js";
import { useEffect as n, useRef as r, useState as i } from "react";
import { jsx as a } from "react/jsx-runtime";
// lib/react/Breakout.tsx
function o(e) {
	let i = r(null), o = r(null);
	return n(() => {
		if (!i.current) return;
		let n = new t(e);
		return n.init(), o.current = n, () => {
			n.destroy(), o.current = null;
		};
	}, []), n(() => {
		e.store && o.current?.setStore(e.store);
	}, [e.store]), /* @__PURE__ */ a("canvas", {
		id: "breakout",
		ref: i
	});
}
// lib/react/useBreakoutStore.tsx
function s() {
	let [t, n] = i(0), [r, a] = i(e);
	return {
		secondsElapsed: t,
		setSecondsElapsed: n,
		state: r,
		setState: a
	};
}
export { o as Breakout, s as useBreakoutStore };

//# sourceMappingURL=react.js.map