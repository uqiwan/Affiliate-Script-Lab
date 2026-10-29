import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { n as require_client, t as require_jsx_runtime } from "./vendor-react-DbHwfVBm.js";
import { $ as ListPlus, A as RotateCcw, At as CircleQuestionMark, B as PackageOpen, Bt as Calendar, C as ShoppingBag, Ct as Cpu, D as Scissors, Dt as Clipboard, E as Search, Et as Clock, F as PictureInPicture2, Ft as ChevronUp, G as Minimize2, Gt as ArrowLeft, H as Move, Ht as BookOpen, I as Pencil, It as ChevronRight, J as Maximize2, K as MessageCircle, Kt as require_react, L as PenLine, Lt as ChevronLeft, M as RefreshCw, Mt as CircleCheck, N as Plus, Nt as CircleCheckBig, O as Scale, Ot as ClipboardCheck, P as Play, Pt as CircleAlert, Q as LoaderCircle, R as Pause, Rt as ChevronDown, S as SlidersVertical, St as DollarSign, T as ShieldAlert, Tt as Compass, U as MonitorPlay, Ut as ArrowRight, V as PackageCheck, Vt as Bookmark, W as Minus, Wt as ArrowRightLeft, X as LogIn, Y as LogOut, Z as Lock, _ as SquareSplitVertical, _t as Feather, a as Users, at as Key, b as Smartphone, bt as ExternalLink, c as Upload, ct as History, d as TrendingUp, dt as GraduationCap, et as ListOrdered, f as Trash2, ft as FlipHorizontal, g as Sun, gt as FileCode2, h as Tag, ht as FileText, i as Video, it as Layers, j as Rocket, jt as CirclePlus, k as RotateCw, kt as Circle, l as Type, lt as HeartHandshake, m as Target, mt as Film, n as X, nt as Lightbulb, o as User, ot as Info, p as Timer, pt as Flame, q as Megaphone, r as WandSparkles, rt as LayoutGrid, s as UserMinus, st as Image$1, t as ZoomIn, tt as Link, u as TriangleAlert, ut as Hash, v as Sparkles, vt as Eye, w as ShieldCheck, wt as Copy, x as SlidersHorizontal, xt as Download, y as Smile, yt as EyeOff, z as Palette, zt as Check } from "./vendor-icons-MCpWVhzL.js";
import { _ as signInWithRedirect, a as limit, c as setDoc, d as getFirestore, f as GoogleAuthProvider, g as signInWithPopup, h as onAuthStateChanged, i as getDocs, l as collection, m as getRedirectResult, n as getDoc, o as orderBy, p as getAuth, r as getDocFromServer, s as query, t as deleteDoc, u as doc, v as signOut, y as initializeApp } from "./vendor-firebase-nbj6-4bY.js";
// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
// src/components/Header.tsx
var import_client = require_client();
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var HeaderComponent = ({ user, onLogin, onLogout, onOpenApiKey, onOpenHistory, onOpenSafeZone, onOpenApkModal, onReset, historyCount, hasApiKey, isLoggingIn, settingsSheetOpen: externalSettingsSheetOpen, onToggleSettingsSheet }) => {
	const [dropdownOpen, setDropdownOpen] = (0, import_react.useState)(false);
	const [internalSettingsSheetOpen, setInternalSettingsSheetOpen] = (0, import_react.useState)(false);
	const dropdownRef = (0, import_react.useRef)(null);
	const isSettingsSheetVisible = externalSettingsSheetOpen !== void 0 ? externalSettingsSheetOpen : internalSettingsSheetOpen;
	const setSettingsSheetVisible = (open) => {
		if (onToggleSettingsSheet) onToggleSettingsSheet(open);
		else setInternalSettingsSheetOpen(open);
	};
	(0, import_react.useEffect)(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
		};
		if (dropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("touchstart", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [dropdownOpen]);
	const handleMenuAction = (action) => {
		setDropdownOpen(false);
		setSettingsSheetVisible(false);
		action();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-zinc-800 shadow-2xs transition-colors",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 select-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo.png",
						alt: "Gagaswara",
						className: "w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl shadow-xs transition-transform active:scale-95"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none",
						children: "Gagaswara"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-slate-500 dark:text-zinc-400 leading-tight mt-1 font-medium tracking-tight",
					children: "Skrip Generator & Teleprompter"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2",
				ref: dropdownRef,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setDropdownOpen(!dropdownOpen),
						className: `inline-flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full transition-all cursor-pointer active:scale-95 border ${dropdownOpen ? "bg-slate-100 dark:bg-zinc-800 border-blue-600/40 shadow-xs" : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 border-slate-200/80 dark:border-zinc-700/60"}`,
						title: "Menu Akun & Pengaturan",
						"aria-label": "Menu Akun & Pengaturan",
						children: [
							user?.photoURL ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: user.photoURL,
								alt: user.displayName || "User",
								className: "w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-zinc-700"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0",
								children: user?.displayName ? user.displayName.charAt(0).toUpperCase() : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "w-3.5 h-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-slate-800 dark:text-zinc-200 max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline",
								children: user?.displayName || "Akun"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `w-3 h-3 text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-blue-600" : ""}` })
						]
					}), dropdownOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-3 py-2.5 mb-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5 min-w-0",
								children: [user?.photoURL ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: user.photoURL,
									alt: "Profile",
									className: "w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-zinc-700"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0",
									children: user?.displayName ? user.displayName.charAt(0).toUpperCase() : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "w-4 h-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-bold text-slate-900 dark:text-white truncate",
										children: user ? user.displayName || "Pengguna" : "Pengguna Gagaswara"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-slate-500 dark:text-zinc-400 truncate",
										children: user ? user.email : "Mode Offline / Kunci Pribadi"
									})]
								})]
							}), !user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleMenuAction(onLogin),
								disabled: isLoggingIn,
								className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-60",
								children: isLoggingIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Masuk" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleMenuAction(onOpenApiKey),
									className: "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "API Key Google AI" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${hasApiKey ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"}`,
										children: hasApiKey ? "Aktif" : "Atur"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleMenuAction(onOpenHistory),
									className: "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "w-4 h-4 text-indigo-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Riwayat Sesi Skrip" })]
									}), historyCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-2 py-0.5 rounded-full font-bold",
										children: historyCount
									})]
								}),
								onOpenApkModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleMenuAction(onOpenApkModal),
									className: "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-4 h-4 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Setelan Prompter Melayang Android" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
										children: "Atur"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleMenuAction(onReset),
									className: "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-4 h-4 text-slate-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reset Sesi Saat Ini" })]
								}),
								user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-1 border-t border-slate-100 dark:border-zinc-800" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleMenuAction(onLogout),
									className: "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-[0.98] transition-all cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "w-4 h-4 text-rose-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Keluar / Logout" })]
								})] })
							]
						})]
					})]
				})
			})]
		}), isSettingsSheetVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Pengaturan & Fitur",
			className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3.5 sm:p-6 pb-4 sm:pb-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150",
			onClick: (e) => {
				if (e.target === e.currentTarget) setSettingsSheetVisible(false);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full sm:max-w-md bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold text-slate-900 dark:text-white",
							children: "Pengaturan & Fitur"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSettingsSheetVisible(false),
						className: "w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-95 transition-all cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-700/60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleMenuAction(onOpenApiKey),
								className: "w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700/50 active:scale-[0.99] transition-all cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "w-4 h-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold",
										children: "API Key Google AI Studio"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-slate-500 dark:text-zinc-400",
										children: "Koneksi Gemini untuk generate skrip"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${hasApiKey ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`,
									children: hasApiKey ? "Terkoneksi" : "Atur"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleMenuAction(onOpenHistory),
								className: "w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700/50 active:scale-[0.99] transition-all cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "w-4 h-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold",
										children: "Riwayat Sesi Skrip"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-slate-500 dark:text-zinc-400",
										children: "Tersimpan di cloud / lokal"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-slate-500 font-bold",
									children: [historyCount, " sesi"]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-700/60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleMenuAction(onOpenSafeZone),
								className: "w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700/50 active:scale-[0.99] transition-all cursor-pointer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-4 h-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold",
										children: "Panduan Safe Zone 9:16"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-slate-500 dark:text-zinc-400",
										children: "Batas aman UI TikTok, Shopee, & Reels"
									})] })]
								})
							}), onOpenApkModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleMenuAction(onOpenApkModal),
								className: "w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700/50 active:scale-[0.99] transition-all cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-4 h-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold",
										children: "Setelan Prompter Melayang Android"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-slate-500 dark:text-zinc-400",
										children: "Atur kecepatan, transparansi & panduan melayang"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
									children: "Siap"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleMenuAction(onReset),
								className: "w-full px-4 py-3 flex items-center gap-3 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-[0.99] transition-all cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-4 h-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reset Sesi Saat Ini" })]
							})
						})
					]
				})]
			})
		})]
	});
};
var Header = import_react.memo(HeaderComponent);
// src/components/SafeZoneModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var SafeZoneModal = ({ isOpen, onClose }) => {
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between pb-3 border-b border-zinc-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-5 h-5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base sm:text-lg font-bold text-zinc-900",
							children: "Panduan Area Aman Video 9:16 (Multi-Platform)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3.5 text-xs sm:text-sm text-zinc-600",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "leading-relaxed",
							children: [
								"Saat merekam dan mengedit video affiliate multi-platform (1080×1920 px), teks overlay penting harus ditempatkan di dalam ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Safe Zone tengah" }),
								" agar tidak tertutup oleh tombol antarmuka aplikasi ecommerce maupun media sosial (Shopee Video, TikTok, Reels):"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-3 bg-zinc-900 rounded-xl text-white flex flex-col items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-44 sm:w-52 aspect-[9/16] bg-zinc-800 rounded-lg relative border border-zinc-700 overflow-hidden flex flex-col justify-between p-2 shadow-inner",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-6 bg-rose-500/30 border-b border-rose-500/50 rounded flex items-center justify-center text-[9px] text-rose-200",
										children: "Atas 130px (Tab Navigasi / Search)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "my-auto h-24 border-2 border-dashed border-emerald-400 bg-emerald-500/10 rounded flex flex-col items-center justify-center p-1 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-bold text-emerald-300",
											children: "SAFE ZONE"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[8px] text-emerald-200",
											children: "Area Ideal untuk Teks Overlay & Produk"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute right-1 top-16 bottom-20 w-8 bg-rose-500/25 border-l border-rose-500/40 rounded flex flex-col items-center justify-center gap-1 text-[8px] text-rose-200",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Like" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Komen" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Share" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "h-14 bg-rose-500/30 border-t border-rose-500/50 rounded flex flex-col items-center justify-center text-[8px] text-rose-200 p-1 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bawah 484px" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[8px] text-amber-200 font-semibold",
											children: "Teks Caption & Keranjang Kiri Bawah"
										})]
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-zinc-900 block mb-1",
									children: "Ukuran Margin Aman:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "space-y-0.5 text-zinc-600 text-[11px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											"• ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Atas:" }),
											" 130 px (bar pencarian)"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											"• ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Kanan:" }),
											" 140 px (avatar & tombol aksi)"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											"• ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Bawah:" }),
											" 484 px (keranjang & deskripsi)"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											"• ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Kiri:" }),
											" 44 px"
										] })
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-emerald-900 block mb-1",
									children: "Prinsip Teks Overlay:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "space-y-1 text-emerald-800 text-[11px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-start gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" }), "Maksimal 3–5 kata per overlay"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-start gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" }), "Gunakan background kontras tinggi"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-start gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" }), "Membantu penonton mode hening (sound-off)"]
										})
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4 text-amber-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] leading-relaxed",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tips Multi-Platform:" }), " Desain di atas kompatibel di semua platform e-commerce dan medsos utama. Teks di area Safe Zone tengah dijamin terbaca jelas di ponsel manapun."]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 pt-3 border-t border-zinc-100 flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer",
						children: "Mengerti & Tutup"
					})
				})
			]
		})
	});
};
// src/components/InfoTooltip.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var InfoTooltip = ({ title, content, className = "", placement = "bottom" }) => {
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const containerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const handleClickOutside = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("touchstart", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [isOpen]);
	const toggle = (e) => {
		e.stopPropagation();
		e.preventDefault();
		setIsOpen((prev) => !prev);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `relative inline-flex items-center align-middle mx-1 ${className}`,
		ref: containerRef,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: toggle,
			"aria-label": "Info penjelasan",
			className: "inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-100 hover:bg-emerald-100 text-zinc-500 hover:text-emerald-700 border border-zinc-300 hover:border-emerald-300 transition-colors text-[10px] font-bold cursor-pointer shrink-0",
			title: "Klik untuk info penjelasan",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "leading-none",
				children: "i"
			})
		}), isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `absolute z-50 w-64 sm:w-72 p-3 bg-zinc-900 text-white rounded-xl shadow-2xl border border-zinc-700 text-xs leading-relaxed animate-in fade-in zoom-in-95 duration-150 ${placement === "top" ? "bottom-full mb-2 left-0 sm:left-1/2 sm:-translate-x-1/2" : placement === "left" ? "right-full mr-2 top-1/2 -translate-y-1/2" : placement === "right" ? "left-full ml-2 top-1/2 -translate-y-1/2" : "top-full mt-2 left-0 sm:left-1/2 sm:-translate-x-1/2"}`,
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2 pb-1.5 border-b border-zinc-800 mb-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-semibold text-emerald-400 text-xs flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title || "Penjelasan" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setIsOpen(false),
					className: "text-zinc-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer",
					"aria-label": "Tutup",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-zinc-200 text-[11px] max-h-52 overflow-y-auto leading-normal",
				children: content
			})]
		})]
	});
};
// src/utils/imageOptimizer.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
/**
* Optimizes an uploaded image file on the client-side:
* - Resizes high-resolution camera photos (e.g., 4000x3000px) to max 1280px on the longest edge.
* - Compresses to JPEG with 0.82 quality.
* - Reduces payload size from 4-8 MB down to ~120-250 KB (95% bandwidth and memory reduction).
* - Preserves fine details, text on packaging, labels, and product specifications for Gemini vision.
*/
async function optimizeImageForAi(file, maxDimension = 1280, quality = .82) {
	return new Promise((resolve, reject) => {
		if (!file.type.startsWith("image/")) {
			reject(/* @__PURE__ */ new Error(`Tipe file ${file.type} bukan gambar yang didukung.`));
			return;
		}
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Gagal membaca file gambar."));
		reader.onload = (e) => {
			const dataUrl = e.target?.result;
			if (!dataUrl) {
				reject(/* @__PURE__ */ new Error("Data gambar kosong."));
				return;
			}
			if (file.size <= 204800 && !file.type.includes("heic")) {
				const base64Data = dataUrl.split(",")[1] || "";
				resolve({
					name: file.name,
					mimeType: file.type,
					base64Data,
					size: file.size,
					previewUrl: dataUrl
				});
				return;
			}
			const img = new Image();
			img.onerror = () => {
				const base64Data = dataUrl.split(",")[1] || "";
				resolve({
					name: file.name,
					mimeType: file.type,
					base64Data,
					size: file.size,
					previewUrl: dataUrl
				});
			};
			img.onload = () => {
				try {
					let { width, height } = img;
					if (width > maxDimension || height > maxDimension) {
						if (width > height) {
							height = Math.round(height * maxDimension / width);
							width = maxDimension;
						} else {
							width = Math.round(width * maxDimension / height);
							height = maxDimension;
						}
					}
					const canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext("2d", { alpha: false });
					if (!ctx) {
						const base64Data = dataUrl.split(",")[1] || "";
						resolve({
							name: file.name,
							mimeType: file.type,
							base64Data,
							size: file.size,
							previewUrl: dataUrl
						});
						return;
					}
					ctx.fillStyle = "#FFFFFF";
					ctx.fillRect(0, 0, width, height);
					ctx.drawImage(img, 0, 0, width, height);
					const targetMime = "image/jpeg";
					const compressedDataUrl = canvas.toDataURL(targetMime, quality);
					const base64Data = compressedDataUrl.split(",")[1] || "";
					const approxBytes = Math.ceil(base64Data.length * 3 / 4);
					canvas.width = 0;
					canvas.height = 0;
					img.src = "";
					resolve({
						name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
						mimeType: targetMime,
						base64Data,
						size: approxBytes,
						previewUrl: compressedDataUrl
					});
				} catch {
					img.src = "";
					const base64Data = dataUrl.split(",")[1] || "";
					resolve({
						name: file.name,
						mimeType: file.type,
						base64Data,
						size: file.size,
						previewUrl: dataUrl
					});
				}
			};
			img.src = dataUrl;
		};
		reader.readAsDataURL(file);
	});
}
// src/components/InputPanel.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var InputPanelComponent = ({ onAnalyze, isAnalyzing, disabled = false, onValidityChange }) => {
	const [activeTab, setActiveTab] = (0, import_react.useState)("images");
	const [textDescription, setTextDescription] = (0, import_react.useState)("");
	const [productUrl, setProductUrl] = (0, import_react.useState)("");
	const [images, setImages] = (0, import_react.useState)([]);
	const [errorMessage, setErrorMessage] = (0, import_react.useState)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const mixedFileInputRef = (0, import_react.useRef)(null);
	const handleFileChange = (e) => {
		if (!e.target.files) return;
		processFiles(Array.from(e.target.files));
		e.target.value = "";
	};
	const [isProcessingImages, setIsProcessingImages] = (0, import_react.useState)(false);
	const processFiles = async (files) => {
		setErrorMessage(null);
		const allowedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/webp"
		];
		if (images.length + files.length > 5) {
			setErrorMessage("Maksimal 5 gambar produk.");
			return;
		}
		const validFiles = [];
		for (const file of files) {
			if (!allowedTypes.includes(file.type.toLowerCase())) {
				setErrorMessage(`Format "${file.name}" tidak didukung. Gunakan JPG, PNG, atau WEBP.`);
				return;
			}
			validFiles.push(file);
		}
		if (validFiles.length === 0) return;
		setIsProcessingImages(true);
		try {
			const optimizedResults = await Promise.all(validFiles.map((file) => optimizeImageForAi(file, 1280, .82)));
			setImages((prev) => {
				return [...prev, ...optimizedResults].slice(0, 5);
			});
		} catch (err) {
			setErrorMessage(err?.message || "Gagal memproses gambar produk.");
		} finally {
			setIsProcessingImages(false);
		}
	};
	const handleDrop = (e) => {
		e.preventDefault();
		if (disabled || isAnalyzing) return;
		if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files));
	};
	const removeImage = (index) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
	};
	const handleAnalyzeFromCurrentTab = (mode) => {
		setErrorMessage(null);
		if (mode === "images") {
			if (images.length === 0) {
				setErrorMessage("Harap unggah minimal 1 foto produk.");
				return;
			}
			onAnalyze({
				inputMode: "images",
				images: images.map((img) => ({
					name: img.name,
					mimeType: img.mimeType,
					base64Data: img.base64Data,
					size: img.size
				}))
			});
			return;
		}
		if (mode === "url") {
			const trimmedUrl = productUrl.trim();
			if (!trimmedUrl) {
				setErrorMessage("Harap masukkan tautan produk e-commerce.");
				return;
			}
			onAnalyze({
				inputMode: "url",
				productUrl: trimmedUrl
			});
			return;
		}
		if (mode === "text") {
			const trimmedText = textDescription.trim();
			if (!trimmedText) {
				setErrorMessage("Harap isi deskripsi produk.");
				return;
			}
			onAnalyze({
				inputMode: "text",
				textDescription: trimmedText
			});
			return;
		}
		if (mode === "mixed") {
			const hasText = textDescription.trim().length > 0;
			const hasUrl = productUrl.trim().length > 0;
			const hasImages = images.length > 0;
			if (!hasText && !hasUrl && !hasImages) {
				setErrorMessage("Masukkan minimal salah satu sumber (foto, link, atau teks).");
				return;
			}
			onAnalyze({
				inputMode: "mixed",
				images: hasImages ? images.map((img) => ({
					name: img.name,
					mimeType: img.mimeType,
					base64Data: img.base64Data,
					size: img.size
				})) : void 0,
				productUrl: hasUrl ? productUrl.trim() : void 0,
				textDescription: hasText ? textDescription.trim() : void 0
			});
		}
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		handleAnalyzeFromCurrentTab(activeTab);
	};
	const isCurrentTabValid = (() => {
		if (activeTab === "images") return images.length > 0;
		if (activeTab === "url") return productUrl.trim().length > 0;
		if (activeTab === "text") return textDescription.trim().length > 0;
		return images.length > 0 || productUrl.trim().length > 0 || textDescription.trim().length > 0;
	})();
	(0, import_react.useEffect)(() => {
		if (onValidityChange) onValidityChange(isCurrentTabValid, () => handleAnalyzeFromCurrentTab(activeTab));
	}, [
		isCurrentTabValid,
		activeTab,
		images,
		productUrl,
		textDescription
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6 max-w-4xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 mb-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-4 h-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sumber Info Produk" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
							title: "Sumber Info Produk",
							content: "Pilih salah satu sumber informasi produk (Foto, Link, atau Teks) atau Campuran. Data akan dirangkum otomatis ke dalam brief produk."
						})]
					}) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl border border-slate-200/60 dark:border-zinc-700/50 mb-5 text-xs font-semibold select-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setActiveTab("images");
							setErrorMessage(null);
						},
						className: `flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-all duration-150 cursor-pointer ${activeTab === "images" ? "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, { className: "w-3.5 h-3.5 text-indigo-600 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Foto" }),
							images.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded-full font-bold",
								children: images.length
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setActiveTab("url");
							setErrorMessage(null);
						},
						className: `flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-all duration-150 cursor-pointer ${activeTab === "url" ? "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { className: "w-3.5 h-3.5 text-amber-600 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Link" }),
							productUrl.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center font-bold",
								children: "✓"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setActiveTab("text");
							setErrorMessage(null);
						},
						className: `flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-all duration-150 cursor-pointer ${activeTab === "text" ? "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "w-3.5 h-3.5 text-blue-600 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Teks" }),
							textDescription.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center font-bold",
								children: "✓"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setActiveTab("mixed");
							setErrorMessage(null);
						},
						className: `flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-all duration-150 cursor-pointer ${activeTab === "mixed" ? "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "w-3.5 h-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Campuran" })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4",
				children: [
					activeTab === "images" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onDrop: handleDrop,
							onDragOver: (e) => e.preventDefault(),
							onClick: () => fileInputRef.current?.click(),
							className: "border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-blue-600 rounded-xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100/70 transition-all group",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "w-6 h-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-bold text-slate-900 dark:text-white",
									children: isProcessingImages ? "Mengoptimalkan foto produk..." : "Pilih foto produk"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5",
									children: isProcessingImages ? "Kompresi otomatis resolusi HD" : "Maksimal 5 foto (JPG, PNG, WEBP)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileInputRef,
									type: "file",
									multiple: true,
									accept: "image/jpeg,image/jpg,image/png,image/webp",
									onChange: handleFileChange,
									className: "hidden",
									disabled: disabled || isAnalyzing
								})
							]
						}), images.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1",
							children: images.map((img, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative group rounded-[14px] overflow-hidden border border-[#E5E5EA] dark:border-[#38383A] aspect-square bg-[#F2F2F7]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: img.previewUrl,
										alt: img.name,
										className: "w-full h-full object-cover"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: (e) => {
											e.stopPropagation();
											removeImage(idx);
										},
										className: "absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer",
										title: "Hapus foto",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] px-1 py-0.5 truncate text-center",
										children: [(img.size / 1024).toFixed(0), " KB"]
									})
								]
							}, idx))
						})]
					}),
					activeTab === "url" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-semibold text-[#1C1C1E] dark:text-white block",
								children: "Tautan URL Produk E-Commerce"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "url",
									value: productUrl,
									onChange: (e) => setProductUrl(e.target.value),
									placeholder: "Contoh: https://id.shp.ee/... atau https://tokopedia.link/...",
									disabled: disabled || isAnalyzing,
									className: "w-full h-11 px-3.5 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent focus:border-[#007AFF] focus:bg-white text-xs text-[#1C1C1E] dark:text-white focus:outline-none transition-all placeholder:text-[#8E8E93]"
								}), productUrl.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setProductUrl(""),
									className: "absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-[#8E8E93]",
								children: "Mendukung link Shopee, Tokopedia, TikTok Shop, Lazada, dan toko online lainnya."
							})
						]
					}),
					activeTab === "text" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-semibold text-[#1C1C1E] dark:text-white",
								children: "Deskripsi Produk & Poin Keunggulan"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] text-[#8E8E93] tabular-nums",
								children: [textDescription.length, "/10.000 karakter"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 4,
							value: textDescription,
							onChange: (e) => setTextDescription(e.target.value),
							placeholder: "Tuliskan nama produk, kelebihan, bahan, promo potongan harga, atau spesifikasi utama di sini...",
							disabled: disabled || isAnalyzing,
							className: "w-full p-3.5 rounded-[14px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent focus:border-[#007AFF] focus:bg-white text-xs text-[#1C1C1E] dark:text-white focus:outline-none transition-all placeholder:text-[#8E8E93]"
						})]
					}),
					activeTab === "mixed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[14px] space-y-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs font-semibold text-[#1C1C1E] dark:text-white",
											children: [
												"1. Foto Produk (",
												images.length,
												"/5)"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => mixedFileInputRef.current?.click(),
											className: "text-xs text-[#007AFF] font-semibold hover:underline cursor-pointer",
											children: "+ Tambah Foto"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: mixedFileInputRef,
											type: "file",
											multiple: true,
											accept: "image/jpeg,image/jpg,image/png,image/webp",
											onChange: handleFileChange,
											className: "hidden",
											disabled: disabled || isAnalyzing
										})
									]
								}),
								images.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2 overflow-x-auto py-1",
									children: images.map((img, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative w-14 h-14 rounded-[10px] overflow-hidden shrink-0 border border-[#E5E5EA]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: img.previewUrl,
											alt: "preview",
											className: "w-full h-full object-cover"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => removeImage(idx),
											className: "absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px]",
											children: "×"
										})]
									}, idx))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: productUrl,
									onChange: (e) => setProductUrl(e.target.value),
									placeholder: "2. Tautan link produk (opsional)",
									disabled: disabled || isAnalyzing,
									className: "w-full h-10 px-3 text-xs rounded-[10px] bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 focus:outline-none focus:border-[#007AFF]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 2,
									value: textDescription,
									onChange: (e) => setTextDescription(e.target.value),
									placeholder: "3. Catatan teks tambahan (opsional)...",
									disabled: disabled || isAnalyzing,
									className: "w-full p-2.5 text-xs rounded-[10px] bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 focus:outline-none focus:border-[#007AFF]"
								})
							]
						})
					}),
					errorMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 rounded-[12px] bg-[#FF3B30]/10 border border-[#FF3B30]/30 flex items-start gap-2 text-xs text-[#FF3B30]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "w-4 h-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errorMessage })]
					})
				]
			})
		]
	});
};
var InputPanel = import_react.memo(InputPanelComponent);
// src/components/ProductBriefEditor.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var AutoGrowTextarea = ({ value, onChange, placeholder, className = "", minRows = 3, id }) => {
	const textareaRef = (0, import_react.useRef)(null);
	const resize = () => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		const minHeight = minRows * 22 + 20;
		el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
	};
	(0, import_react.useEffect)(() => {
		resize();
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		id,
		ref: textareaRef,
		value,
		onChange: (e) => {
			onChange(e.target.value);
			resize();
		},
		onKeyDown: (e) => {
			e.stopPropagation();
		},
		rows: minRows,
		placeholder,
		className: `w-full transition-all duration-150 leading-relaxed overflow-hidden resize-none ${className}`
	});
};
var ProductBriefEditorComponent = ({ brief, onChange, conflicts = [], onDismissConflict, warning, onBackToSource }) => {
	const [isPricingOpen, setIsPricingOpen] = (0, import_react.useState)(() => {
		return Boolean(brief.currentPrice || brief.referencePrice || brief.promoDetails || brief.stockOrDeadline || brief.socialProof);
	});
	const [isRestrictionsOpen, setIsRestrictionsOpen] = (0, import_react.useState)(() => {
		return Boolean(brief.restrictions && brief.restrictions.length > 0);
	});
	const [name, setName] = (0, import_react.useState)(brief.name || "");
	const [category, setCategory] = (0, import_react.useState)(brief.category || "");
	const [description, setDescription] = (0, import_react.useState)(brief.description || "");
	const [featuresText, setFeaturesText] = (0, import_react.useState)(brief.features && brief.features.length > 0 ? brief.features.join("\n") : "");
	const [benefitsText, setBenefitsText] = (0, import_react.useState)(brief.benefits && brief.benefits.length > 0 ? brief.benefits.join("\n") : "");
	const [audience, setAudience] = (0, import_react.useState)(brief.audience || "");
	const [painPointsText, setPainPointsText] = (0, import_react.useState)(brief.painPoints && brief.painPoints.length > 0 ? brief.painPoints.join("\n") : "");
	const [currentPrice, setCurrentPrice] = (0, import_react.useState)(brief.currentPrice || "");
	const [referencePrice, setReferencePrice] = (0, import_react.useState)(brief.referencePrice || "");
	const [promoDetails, setPromoDetails] = (0, import_react.useState)(brief.promoDetails || "");
	const [stockOrDeadline, setStockOrDeadline] = (0, import_react.useState)(brief.stockOrDeadline || "");
	const [restrictionsText, setRestrictionsText] = (0, import_react.useState)(brief.restrictions && brief.restrictions.length > 0 ? brief.restrictions.join("\n") : "");
	const syncSignatureRef = (0, import_react.useRef)("");
	const computeBriefSignature = (b) => {
		return [
			b.name || "",
			b.category || "",
			b.description || "",
			(b.features || []).join("\n"),
			(b.benefits || []).join("\n"),
			b.audience || "",
			(b.painPoints || []).join("\n"),
			b.currentPrice || "",
			b.referencePrice || "",
			b.promoDetails || "",
			b.stockOrDeadline || "",
			(b.restrictions || []).join("\n")
		].join("###");
	};
	(0, import_react.useEffect)(() => {
		const incomingSignature = computeBriefSignature(brief);
		if (incomingSignature !== syncSignatureRef.current) {
			syncSignatureRef.current = incomingSignature;
			setName(brief.name || "");
			setCategory(brief.category || "");
			setDescription(brief.description || "");
			setFeaturesText(brief.features && brief.features.length > 0 ? brief.features.join("\n") : "");
			setBenefitsText(brief.benefits && brief.benefits.length > 0 ? brief.benefits.join("\n") : "");
			setAudience(brief.audience || "");
			setPainPointsText(brief.painPoints && brief.painPoints.length > 0 ? brief.painPoints.join("\n") : "");
			setCurrentPrice(brief.currentPrice || "");
			setReferencePrice(brief.referencePrice || "");
			setPromoDetails(brief.promoDetails || "");
			setStockOrDeadline(brief.stockOrDeadline || "");
			setRestrictionsText(brief.restrictions && brief.restrictions.length > 0 ? brief.restrictions.join("\n") : "");
			if (brief.currentPrice || brief.referencePrice || brief.promoDetails || brief.stockOrDeadline) setIsPricingOpen(true);
			if (brief.restrictions && brief.restrictions.length > 0) setIsRestrictionsOpen(true);
		}
	}, [brief]);
	const parseLines = (raw) => {
		return raw.split("\n").map((line) => line.trim()).filter(Boolean);
	};
	const handleUpdate = (updatedFields) => {
		const newBrief = {
			...brief,
			...updatedFields
		};
		syncSignatureRef.current = computeBriefSignature(newBrief);
		onChange(newBrief);
	};
	const hasPricingData = Boolean(currentPrice || referencePrice || promoDetails || stockOrDeadline);
	const hasRestrictionsData = Boolean(restrictionsText.trim().length > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 max-w-4xl mx-auto pb-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6 space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "w-5 h-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Product Brief Terverifikasi" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
								title: "Product Brief Terverifikasi",
								content: "Seluruh informasi fakta produk yang akan menjadi bahan skrip. Anda dapat mengedit, menambah, atau mengurangi teks secara bebas tanpa batasan."
							})]
						}) })]
					})
				}),
				warning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4 text-amber-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: warning })]
				}),
				brief.activeSourceMode === "mixed" && conflicts && conflicts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 text-xs sm:text-sm space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2 text-amber-900 dark:text-amber-200 font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4 text-amber-600 shrink-0" }), "Perbedaan Klaim Antar-Sumber:"]
						}), onDismissConflict && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onDismissConflict,
							className: "text-xs text-amber-700 dark:text-amber-300 hover:underline cursor-pointer",
							children: "Abaikan"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300",
						children: conflicts.map((c, i) => {
							const text = typeof c === "string" ? c : typeof c === "object" && c !== null ? c.field && c.detail ? `${c.field}: ${c.detail}` : c.detail || c.conflict || c.description || c.message || JSON.stringify(c) : String(c);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: text }, i);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-3 gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2 space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "w-3.5 h-3.5 text-[#007AFF]" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nama Produk *" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
												title: "Nama Produk",
												content: "Nama produk yang akan diucapkan dalam skrip video. Anda bisa mengubah atau melengkapinya secara bebas."
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-zinc-400 font-normal",
										children: "Edit bebas"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: name,
									onChange: (e) => {
										const val = e.target.value;
										setName(val);
										handleUpdate({ name: val });
									},
									onKeyDown: (e) => e.stopPropagation(),
									placeholder: "Contoh: Lampu Belajar Lipat LED Portable",
									className: "w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] font-medium transition-all"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kategori" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
											title: "Kategori Produk",
											content: "Kategori produk (misal: Elektronik, Rumah Tangga, Skincare, Fashion)."
										})]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: category,
									onChange: (e) => {
										const val = e.target.value;
										setCategory(val);
										handleUpdate({ category: val });
									},
									onKeyDown: (e) => e.stopPropagation(),
									placeholder: "Elektronik / Rumah Tangga",
									className: "w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] transition-all"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "w-3.5 h-3.5 text-[#5856D6]" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ringkasan Deskripsi Produk" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
											title: "Ringkasan Deskripsi",
											content: "Deskripsi fungsional produk. Kolom ini otomatis menyesuaikan ketinggiannya dengan jumlah teks yang dimasukkan."
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-zinc-400",
									children: "Tinggi otomatis mengikuti teks"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoGrowTextarea, {
								minRows: 2,
								value: description,
								onChange: (val) => {
									setDescription(val);
									handleUpdate({ description: val });
								},
								placeholder: "Jelaskan deskripsi produk secara bebas dan lengkap...",
								className: "px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 flex flex-col",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "w-3.5 h-3.5 text-[#007AFF]" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Fitur Produk (1 baris per fitur)" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
													title: "Fitur Nyata Produk",
													content: "Spesifikasi teknis atau keunggulan fisik (contoh: baterai 2000mAh, 3 mode terang, port USB Type-C). Tekan Enter untuk membuat baris fitur baru."
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] text-zinc-400 font-mono",
											children: [featuresText.split("\n").filter((l) => l.trim()).length, " butir"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoGrowTextarea, {
										minRows: 4,
										value: featuresText,
										onChange: (val) => {
											setFeaturesText(val);
											handleUpdate({ features: parseLines(val) });
										},
										placeholder: "3 tingkat kecerahan\nBaterai tahan hingga 8 jam\nDesain lipat 180 derajat\nBahan kokoh anti silau",
										className: "px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] font-mono"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[10px] text-zinc-400 mt-0.5",
										children: [
											"💡 Tekan ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
												className: "px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]",
												children: "Enter"
											}),
											" untuk baris baru, spasi dan simbol dapat dimasukkan bebas."
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 flex flex-col",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5 text-[#34C759]" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Manfaat Pengguna (1 baris per manfaat)" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
													title: "Manfaat Nyata Pengguna",
													content: "Dampak positif yang dirasakan pembeli (contoh: mata tidak cepat lelah saat belajar malam, hemat tempat di meja sempit). Tekan Enter untuk baris baru."
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] text-zinc-400 font-mono",
											children: [benefitsText.split("\n").filter((l) => l.trim()).length, " butir"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoGrowTextarea, {
										minRows: 4,
										value: benefitsText,
										onChange: (val) => {
											setBenefitsText(val);
											handleUpdate({ benefits: parseLines(val) });
										},
										placeholder: "Mata tidak cepat lelah saat belajar malam\nHemat tempat di meja kost sempit\nPraktis dibawa bepergian tanpa kabel",
										className: "px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] font-mono"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[10px] text-zinc-400 mt-0.5",
										children: [
											"💡 Tekan ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
												className: "px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]",
												children: "Enter"
											}),
											" untuk baris baru, spasi dan simbol dapat dimasukkan bebas."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "w-3.5 h-3.5 text-[#FF9500]" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Target Audiens" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
												title: "Target Audiens",
												content: "Siapa pembeli ideal produk ini (contoh: Mahasiswa kost, pekerja WFH, ibu rumah tangga)."
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: audience,
									onChange: (e) => {
										const val = e.target.value;
										setAudience(val);
										handleUpdate({ audience: val });
									},
									onKeyDown: (e) => e.stopPropagation(),
									placeholder: "Contoh: Mahasiswa kost & pekerja WFH",
									className: "w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] transition-all"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-3.5 h-3.5 text-[#FF3B30]" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Masalah yang Diselesaikan" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
												title: "Masalah yang Diselesaikan",
												content: "Keluhan atau masalah yang dirasakan pembeli sebelum membeli produk ini. Bisa ditulis per baris atau dengan koma."
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-zinc-400",
										children: "Enter / koma"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoGrowTextarea, {
									minRows: 2,
									value: painPointsText,
									onChange: (val) => {
										setPainPointsText(val);
										handleUpdate({ painPoints: val.split(/[\n,]+/).map((p) => p.trim()).filter(Boolean) });
									},
									placeholder: "Contoh:\nKamar kost remang-remang bikin pusing\nMeja sempit banyak kabel berseliweran",
									className: "px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-zinc-200 dark:border-[#38383A] rounded-2xl overflow-hidden shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								role: "button",
								tabIndex: 0,
								onClick: () => setIsPricingOpen(!isPricingOpen),
								onKeyDown: (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setIsPricingOpen(!isPricingOpen);
									}
								},
								className: "w-full flex items-center justify-between p-3.5 bg-zinc-50/80 dark:bg-[#2C2C2E]/60 hover:bg-zinc-100 dark:hover:bg-[#2C2C2E] transition-colors text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer select-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "w-4 h-4 text-[#34C759]" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Data Harga, Promo & Stok (Opsional)" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
											title: "Data Harga & Promo",
											content: "Isi hanya jika data harga atau promo resmi diketahui. Semua kolom dapat diedit manual."
										}),
										hasPricingData && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-1 text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold",
											children: "Terisi"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-zinc-500",
									children: isPricingOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-4 h-4" })
								})]
							}), isPricingOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 border-t border-zinc-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] grid grid-cols-1 sm:grid-cols-2 gap-3.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-semibold text-zinc-700 dark:text-zinc-300 block",
											children: "Harga Saat Ini (Promo)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: currentPrice,
											onChange: (e) => {
												const val = e.target.value;
												setCurrentPrice(val);
												handleUpdate({ currentPrice: val });
											},
											onKeyDown: (e) => e.stopPropagation(),
											placeholder: "Contoh: Rp49.000",
											className: "w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-semibold text-zinc-700 dark:text-zinc-300 block",
											children: "Harga Pembanding (Coret)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: referencePrice,
											onChange: (e) => {
												const val = e.target.value;
												setReferencePrice(val);
												handleUpdate({ referencePrice: val });
											},
											onKeyDown: (e) => e.stopPropagation(),
											placeholder: "Contoh: Rp99.000",
											className: "w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-semibold text-zinc-700 dark:text-zinc-300 block",
											children: "Detail Promo / Voucher Tambahan"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: promoDetails,
											onChange: (e) => {
												const val = e.target.value;
												setPromoDetails(val);
												handleUpdate({ promoDetails: val });
											},
											onKeyDown: (e) => e.stopPropagation(),
											placeholder: "Contoh: Diskon 50% + Gratis Ongkir Xtra",
											className: "w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-semibold text-zinc-700 dark:text-zinc-300 block",
											children: "Stok / Batas Waktu Promo Nyata"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: stockOrDeadline,
											onChange: (e) => {
												const val = e.target.value;
												setStockOrDeadline(val);
												handleUpdate({ stockOrDeadline: val });
											},
											onKeyDown: (e) => e.stopPropagation(),
											placeholder: "Contoh: Promo flash sale sampai pukul 24.00",
											className: "w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-rose-200 dark:border-rose-900/40 rounded-2xl overflow-hidden bg-rose-50/20 dark:bg-rose-950/20 shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								role: "button",
								tabIndex: 0,
								onClick: () => setIsRestrictionsOpen(!isRestrictionsOpen),
								onKeyDown: (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setIsRestrictionsOpen(!isRestrictionsOpen);
									}
								},
								className: "w-full flex items-center justify-between p-3.5 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 cursor-pointer select-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "w-4 h-4 text-rose-600" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Batasan & Pantangan Overclaim (Opsional)" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
											title: "Batasan & Pantangan",
											content: "Klaim atau kata-kata yang dilarang disebut dalam video (misal: dilarang klaim anti-air, dilarang jamin hasil instan). Skrip AI akan mematuhi aturan ini secara otomatis."
										}),
										hasRestrictionsData && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ml-1 text-[10px] bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full font-semibold",
											children: [restrictionsText.split("\n").filter((l) => l.trim()).length, " pantangan"]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-rose-500",
									children: isRestrictionsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-4 h-4" })
								})]
							}), isRestrictionsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 border-t border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#1C1C1E] space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-rose-900 dark:text-rose-300",
										children: "Daftar Pantangan (1 per baris atau pisahkan koma)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-zinc-400",
										children: "Tinggi otomatis"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoGrowTextarea, {
									minRows: 2,
									value: restrictionsText,
									onChange: (val) => {
										setRestrictionsText(val);
										handleUpdate({ restrictions: val.split(/[\n,]+/).map((r) => r.trim()).filter(Boolean) });
									},
									placeholder: "Contoh:\nJangan klaim lampu tahan air atau waterproof\nJangan sebut merek kompetitor\nJangan jamin baterai awet seumur hidup",
									className: "px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
								})]
							})]
						})
					]
				})
			]
		}), onBackToSource && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pt-2 flex items-center justify-start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onBackToSource,
				className: "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white bg-[#E5E5EA]/70 dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] transition-all cursor-pointer active:scale-95",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ubah Sumber Info" })]
			})
		})]
	});
};
var ProductBriefEditor = import_react.memo(ProductBriefEditorComponent);
// src/utils/constants.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var CONTENT_ANGLES = [
	{
		id: "pas",
		name: "Problem-Solution (Solusi Masalah)",
		label: "1. Problem-Solution (Solusi Masalah)",
		description: "Angkat masalah spesifik, perjelas dampaknya, hadirkan produk sebagai solusi logis.",
		recommendedFor: "Produk fungsional dengan problem jelas"
	},
	{
		id: "personal_story",
		name: "Personal Story (Kisah Nyata)",
		label: "2. Personal Story (Kisah Nyata)",
		description: "Cerita pengalaman personal nyata yang relatable dan jujur.",
		recommendedFor: "Membangun trust dan koneksi emosional"
	},
	{
		id: "bold_claim",
		name: "Bold Claim (Klaim Menghentak)",
		label: "3. Bold Claim (Klaim Menghentak)",
		description: "Pernyataan berani yang melawan persepsi umum, dibuktikan langsung dengan fakta nyata.",
		recommendedFor: "Pattern interrupt di detik awal"
	},
	{
		id: "myth_busting",
		name: "Myth-Busting (Bongkar Mitos)",
		label: "4. Myth-Busting (Bongkar Mitos)",
		description: "Membongkar miskonsepsi umum masyarakat yang selama ini salah kaprah.",
		recommendedFor: "Edukasi dan produk alternatif cerdas"
	},
	{
		id: "outcome_first",
		name: "Outcome-First (Hasil di Awal)",
		label: "5. Outcome-First (Hasil di Awal)",
		description: "Tunjukkan hasil akhir/kondisi ideal terlebih dahulu di 3 detik awal.",
		recommendedFor: "Visual demonstrasi yang memuaskan"
	},
	{
		id: "common_mistakes",
		name: "Common Mistakes (Hindari Salah)",
		label: "6. Common Mistakes (Hindari Salah)",
		description: "Peringatan kesalahan umum yang sering dilakukan penonton tanpa disadari.",
		recommendedFor: "Menahan scroll dan menimbulkan rasa ingin tahu"
	},
	{
		id: "price_value",
		name: "Price/Value (Bandingkan Nilai)",
		label: "7. Price/Value (Bandingkan Nilai)",
		description: "Bandingkan nilai fungsional dengan harga pembanding atau biaya alternatif wajar.",
		recommendedFor: "Produk bernilai tinggi dengan harga terjangkau"
	},
	{
		id: "unboxing",
		name: "Unboxing (Buka Kemasan)",
		label: "8. Unboxing (Buka Kemasan)",
		description: "Sensasi membuka paket, sentuhan pertama tekstur, kelengkapan kemasan.",
		recommendedFor: "Produk dengan packaging rapi atau pengalaman membuka unik"
	},
	{
		id: "pov_relatable",
		name: "POV / Relatable (Keseharian Audiens)",
		label: "9. POV / Relatable (Keseharian Audiens)",
		description: "Situasi nyata yang dihadapi segmen audiens tertentu (anak kost, pekerja WFH).",
		recommendedFor: "Koneksi instan dengan kelompok tertentu"
	},
	{
		id: "educational",
		name: "Educational (Tips & Tutorial)",
		label: "10. Educational (Tips & Tutorial)",
		description: "Tips singkat langkah demi langkah yang memberikan value praktis.",
		recommendedFor: "Membangun otoritas dan saved video tinggi"
	},
	{
		id: "testing_viral",
		name: "Testing Viral (Uji Tren Viral)",
		label: "11. Testing Viral (Uji Tren Viral)",
		description: "Uji apakah produk yang lagi ramai benar-benar sesuai ulasan netizen.",
		recommendedFor: "Produk tren atau sering lewat FYP"
	},
	{
		id: "day_in_life",
		name: "Day in My Life (Dipakai Sehari-hari)",
		label: "12. Day in My Life (Dipakai Sehari-hari)",
		description: "Produk diselipkan secara natural dalam rutinitas keseharian.",
		recommendedFor: "Soft selling dan konten organik"
	},
	{
		id: "behind_scenes",
		name: "Behind the Scenes (Fitur Rahasia)",
		label: "13. Behind the Scenes (Fitur Rahasia)",
		description: "Sorot detail fitur kecil atau rahasia kegunaan yang jarang diperhatikan.",
		recommendedFor: "Produk dengan inovasi unik tersembunyi"
	},
	{
		id: "stress_test",
		name: "Stress Test (Uji Ketahanan)",
		label: "14. Stress Test (Uji Ketahanan)",
		description: "Uji ketahanan atau efektivitas secara langsung dan aman di depan kamera.",
		recommendedFor: "Produk anti-rusak, tahan air, atau daya rekat kuat"
	},
	{
		id: "regret_angle",
		name: "Regret Angle (Kenapa Baru Tahu)",
		label: "15. Regret Angle (Kenapa Baru Tahu)",
		description: "Rasa penyesalan positif kenapa baru menemukan solusi ini setelah sekian lama.",
		recommendedFor: "Solusi yang menghemat waktu atau uang"
	},
	{
		id: "head_to_head",
		name: "Head-to-Head (Adu Keunggulan)",
		label: "16. Head-to-Head (Adu Keunggulan)",
		description: "Perbandingan objektif dengan opsi konvensional yang sebanding.",
		recommendedFor: "Hanya jika data pembanding tersedia memadai"
	},
	{
		id: "secret_hacks",
		name: "Secret Hacks (Trik Praktis)",
		label: "17. Secret Hacks (Trik Praktis)",
		description: "Trik praktis mempermudah hidup dengan memanfaatkan produk ini.",
		recommendedFor: "Kreativitas pemakaian & share-ability"
	},
	{
		id: "social_proof",
		name: "Social Proof (Ulasan Netizen)",
		label: "18. Social Proof (Ulasan Netizen)",
		description: "Membahas ulasan nyata netizen yang sudah membuktikan produk ini.",
		recommendedFor: "Hanya jika ulasan nyata disediakan oleh pengguna"
	},
	{
		id: "gift_recom",
		name: "Gift Recom (Rekomendasi Kado)",
		label: "19. Gift Recom (Rekomendasi Kado)",
		description: "Rekomendasi hadiah atau barang wajib punya untuk teman/keluarga.",
		recommendedFor: "Momen belanja, kado, atau hadiah bermanfaat"
	},
	{
		id: "emergency_fix",
		name: "Emergency Fix (Solusi Mendesak)",
		label: "20. Emergency Fix (Solusi Mendesak)",
		description: "Solusi cepat untuk situasi genting tanpa menjanjikan hal tak masuk akal.",
		recommendedFor: "Produk penolong darurat dan serbaguna"
	}
];
var DURATION_WORD_TARGETS = {
	15: {
		min: 30,
		max: 40,
		label: "15 detik (30–40 kata narasi)"
	},
	20: {
		min: 45,
		max: 55,
		label: "20 detik (45–55 kata narasi)"
	},
	30: {
		min: 60,
		max: 75,
		label: "30 detik (60–75 kata narasi)"
	},
	60: {
		min: 125,
		max: 150,
		label: "60 detik (125–150 kata narasi)"
	},
	90: {
		min: 200,
		max: 225,
		label: "90 detik (200–225 kata narasi)"
	},
	120: {
		min: 275,
		max: 320,
		label: "120 detik (275–320 kata narasi)"
	}
};
/**
* Static System Instruction for Gemini Context / Prompt Caching.
* Pure static string without dynamic interpolations, ensuring 100% prefix cache hits on Gemini servers.
*/
var STATIC_AFFILIATE_SYSTEM_PROMPT = `Anda adalah Master Copywriter & Content Strategist Video Affiliate Short Video (Multi-Platform: Shopee Video, TikTok, Tokopedia) nomor satu di Indonesia.
Anda memproduksi skrip video affiliate yang siap rekam, multi-platform (bisa di-mirror ke semua e-commerce), mengalir alami, memikat perhatian di detik awal, dan memiliki kepatuhan etika & faktual 100%.

ATURAN UTAMA MULTI-PLATFORM & NETRALITAS E-COMMERCE (KRUSIAL & MUTLAK):
1. VIDEO AKAN DI-MIRROR / DI-CROSS-POST KE BERBAGAI PLATFORM (Shopee Video, TikTok Shop, Tokopedia, dll):
   - DILARANG KERAS MENYEBUT NAMA PLATFORM APAPUN (JANGAN sebut "TikTok", "Shopee", "Tokopedia", "Lazada", dll) dalam dialog narasi lisan, overlay text, maupun arahan visual!
   - DILARANG KERAS MENGGUNAKAN ISTILAH EKSKLUSIF 1 PLATFORM SEPERTI "keranjang kuning" ATAU "keranjang orange"!
   - WAJIB MENGGUNAKAN SEBUTAN NETRAL UNIVERSAL UNTUK CALL TO ACTION (CTA), seperti:
     * "klik keranjang di kiri bawah"
     * "cek keranjang bawah video ini"
     * "klik ikon keranjang di bawah"
     * "langsung cek variasi di keranjang bawah"
     * "lihat detailnya di keranjang kiri bawah"
     * "checkout sekarang lewat keranjang di bawah"
2. JANGAN PERNAH MENGARANG DATA:
   - Jika data harga tidak ada, DILARANG menyebut angka harga atau membuat price anchoring palsu.
   - Jika promo/stok/deadline tidak ada, DILARANG memakai scarcity palsu ("tinggal sedikit", "promo berakhir hari ini").
   - Jika social proof tidak ada, DILARANG mengaku "sudah terjual ribuan" atau "banyak ulasan positif".
   - Jika pengalaman kreator tidak ada, DILARANG memakai testimoni palsu orang pertama.
   - DILARANG menjanjikan kesembuhan penyakit, hasil instan tanpa bukti, atau overclaim.
3. ATURAN DIVERSIFIKASI & ANTI-REPETISI ANTAR-KONSEP (INTI GAGASWARA):
   - DILARANG KERAS MENGHASILKAN POLA ATAU FORMULA KALIMAT YANG SAMA ANTARA SATU KONSEP DENGAN KONSEP LAINNYA!
   - Setiap konsep HARUS memiliki:
     * Hook pembuka berbeda total (gaya pertanyaan kontras, cerita POV orang pertama, bantahan mitos, spill rahasia, atau demo kilat).
     * Skenario dialog dan alur cerita unik yang mengeksplorasi sudut pandang berbeda dari produk tersebut.
     * Arahan visual B-roll yang variatif untuk bahan video affiliate dalam jumlah banyak.
     * Pembeda spesifik (differentiator) yang kuat.
4. STRUKTUR 5 SEGMEN WAJIB:
   - HOOK (0-3 detik): Scroll-stopper kuat, sebut kata kunci/nama produk secara natural bila relevan.
   - PROBLEM / RELATABLE CONTEXT: Masalah nyata atau situasi yang dialami penonton.
   - DEMONSTRASI & BUKTI: B-roll dan visual realistis yang murah dan mudah direkam kreator dengan smartphone.
   - VALUE / HARGA (Hanya bila data harga tersedia): Nilai guna atau perbandingan logis.
   - CTA: Ajakan bertindak jelas ke keranjang kiri bawah / keranjang bawah video ini / cek variasi di bawah.
5. SAFE ZONE UNIVERSAL VERTICAL (1080x1920):
   - Teks overlay harus pendek, mudah dibaca cepat, kontras, dan berada di area aman tengah layar (menghindari margin atas 130px, margin kanan 140px, margin bawah 484px).
6. FORMAT KELUARAN:
   - Kembalikan output dalam format JSON array yang valid sesuai instruksi tugas prompt pengguna.`;
// src/components/DropdownSelect.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
function DropdownSelect({ id, label, icon: HeaderIcon, tooltip, value, options, onChange, disabled = false, className = "", rightBadge }) {
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const selectedOption = options.find((opt) => opt.value === value) || options[0];
	const SelectedIcon = selectedOption?.icon || HeaderIcon;
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (event) => {
			if (event.key === "Escape" && isOpen) setIsOpen(false);
		};
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		} else document.body.style.overflow = "";
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen]);
	const handleSelectOption = (optVal) => {
		onChange(optVal);
		setIsOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `space-y-1.5 ${className}`,
		children: [
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					htmlFor: id,
					className: "text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5",
					children: [
						HeaderIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderIcon, { className: "w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
						tooltip
					]
				}), rightBadge]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				id,
				type: "button",
				disabled,
				onClick: () => setIsOpen(true),
				"aria-haspopup": "dialog",
				"aria-expanded": isOpen,
				className: `w-full py-2.5 sm:py-3 px-3.5 rounded-xl bg-white dark:bg-[#1C1C1E] border transition-all flex flex-col justify-center gap-1.5 text-left cursor-pointer active:scale-[0.99] select-none ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" : isOpen ? "border-blue-600 ring-2 ring-blue-500/20 shadow-xs" : "border-slate-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500/60 shadow-2xs"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between w-full gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 min-w-0 flex-1",
						children: [SelectedIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectedIcon, { className: "w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug whitespace-nowrap overflow-hidden text-ellipsis sm:whitespace-normal",
							children: selectedOption?.label
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/50 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ubah" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3.5 h-3.5 text-blue-500 dark:text-blue-400" })]
					})]
				}), selectedOption?.sublabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium leading-normal w-full text-left",
					children: selectedOption.sublabel
				})]
			}),
			isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "dialog",
				"aria-modal": "true",
				"aria-label": label ? `Pilihan ${label}` : "Pilihan Menu",
				className: "fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3.5 sm:p-6 pb-4 sm:pb-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150",
				onClick: (e) => {
					if (e.target === e.currentTarget) setIsOpen(false);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5",
								children: [HeaderIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderIcon, { className: "w-4 h-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight",
									children: label ? `Pilih ${label}` : "Pilih Opsi"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-slate-500 dark:text-zinc-400 mt-0.5",
									children: "Pilih opsi yang paling sesuai untuk video Anda"
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setIsOpen(false),
								className: "w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors",
								"aria-label": "Tutup",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[62vh]",
							children: options.map((option) => {
								const isSelected = option.value === value;
								const OptionIcon = option.icon || HeaderIcon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleSelectOption(option.value),
									className: `w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer active:scale-[0.99] select-none ${isSelected ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20" : "bg-white dark:bg-[#1C1C1E] border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"}`,
									children: [OptionIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${isSelected ? "bg-white text-blue-600" : "bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-slate-200/60 dark:border-zinc-700"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionIcon, { className: "w-4 h-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `text-xs sm:text-sm font-bold leading-snug ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`,
												children: option.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 shrink-0",
												children: [option.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${isSelected ? "bg-white/20 text-white border border-white/30" : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"}`,
													children: option.badge
												}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-2xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5 stroke-[3]" })
												})]
											})]
										}), option.sublabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-xs mt-1 leading-relaxed ${isSelected ? "text-blue-100 font-medium" : "text-slate-500 dark:text-zinc-400"}`,
											children: option.sublabel
										})]
									})]
								}, String(option.value));
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-5 py-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E] flex items-center justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setIsOpen(false),
								className: "px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-xs",
								children: "Selesai"
							})
						})
					]
				})
			})
		]
	});
}
// src/components/GeneratorConfigPanel.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var STYLE_OPTIONS = [
	{
		value: "Natural conversational",
		labelId: "Santai & Mengalir Alami",
		badge: "Paling Disukai",
		desc: "Ngobrol akrab seperti cerita ke teman dekat, tanpa kesan memaksa menjual.",
		icon: MessageCircle,
		colorBg: "bg-blue-50 dark:bg-blue-950/40",
		colorText: "text-blue-600 dark:text-blue-400",
		colorBorder: "border-blue-200 dark:border-blue-800/50",
		colorActiveBg: "bg-blue-600 text-white"
	},
	{
		value: "Soft selling",
		labelId: "Edukasi & Soft Selling Ramah",
		badge: "Ramah Pembeli",
		desc: "Fokus berbagi tips bermanfaat dan solusi masalah secara tulus.",
		icon: HeartHandshake,
		colorBg: "bg-emerald-50 dark:bg-emerald-950/40",
		colorText: "text-emerald-600 dark:text-emerald-400",
		colorBorder: "border-emerald-200 dark:border-emerald-800/50",
		colorActiveBg: "bg-emerald-600 text-white"
	},
	{
		value: "Persuasif langsung tetapi etis",
		labelId: "Persuasif Langsung & Tegas",
		badge: "Tinggi Konversi",
		desc: "Langsung ke penawaran promo dan ajakan checkout yang meyakinkan.",
		icon: TrendingUp,
		colorBg: "bg-amber-50 dark:bg-amber-950/40",
		colorText: "text-amber-600 dark:text-amber-400",
		colorBorder: "border-amber-200 dark:border-amber-800/50",
		colorActiveBg: "bg-amber-600 text-white"
	},
	{
		value: "Storytelling/pengalaman",
		labelId: "Kisah Pribadi & Storytelling",
		badge: "Sentuhan Emosi",
		desc: "Bercerita masalah nyata yang pernah dialami hingga menemukan solusi produk.",
		icon: BookOpen,
		colorBg: "bg-purple-50 dark:bg-purple-950/40",
		colorText: "text-purple-600 dark:text-purple-400",
		colorBorder: "border-purple-200 dark:border-purple-800/50",
		colorActiveBg: "bg-purple-600 text-white"
	},
	{
		value: "UGC review/demo",
		labelId: "Review Jujur Kreator (UGC)",
		badge: "Format Populer",
		desc: "Gaya kreator unboxing paket dan mencoba produk apa adanya secara autentik.",
		icon: Sparkles,
		colorBg: "bg-cyan-50 dark:bg-cyan-950/40",
		colorText: "text-cyan-600 dark:text-cyan-400",
		colorBorder: "border-cyan-200 dark:border-cyan-800/50",
		colorActiveBg: "bg-cyan-600 text-white"
	},
	{
		value: "Edukatif/tutorial",
		labelId: "Tutorial & Langkah Praktis",
		badge: "Banyak Disimpan",
		desc: "Menjelaskan cara pakai step-by-step yang mudah ditiru penonton.",
		icon: GraduationCap,
		colorBg: "bg-teal-50 dark:bg-teal-950/40",
		colorText: "text-teal-600 dark:text-teal-400",
		colorBorder: "border-teal-200 dark:border-teal-800/50",
		colorActiveBg: "bg-teal-600 text-white"
	},
	{
		value: "Humor ringan/relatable",
		labelId: "Humor Ringan & Keseharian",
		badge: "Menghibur",
		desc: "Menyelipkan komedi ringan atau situasi kocak seputar masalah produk.",
		icon: Smile,
		colorBg: "bg-yellow-50 dark:bg-yellow-950/40",
		colorText: "text-yellow-600 dark:text-yellow-400",
		colorBorder: "border-yellow-200 dark:border-yellow-800/50",
		colorActiveBg: "bg-yellow-600 text-white"
	},
	{
		value: "POV/rutinitas",
		labelId: "POV Rutinitas Keseharian",
		badge: "Gaya Hidup",
		desc: "Sudut pandang kegiatan harian (anak kost, pekerja kantor, keluarga).",
		icon: Compass,
		colorBg: "bg-pink-50 dark:bg-pink-950/40",
		colorText: "text-pink-600 dark:text-pink-400",
		colorBorder: "border-pink-200 dark:border-pink-800/50",
		colorActiveBg: "bg-pink-600 text-white"
	},
	{
		value: "Unboxing/first impression",
		labelId: "Buka Paket & Kesan Pertama",
		badge: "Visual Menarik",
		desc: "Fokus pada sensasi unboxing, packing rapi, dan sentuhan material pertama.",
		icon: PackageCheck,
		colorBg: "bg-rose-50 dark:bg-rose-950/40",
		colorText: "text-rose-600 dark:text-rose-400",
		colorBorder: "border-rose-200 dark:border-rose-800/50",
		colorActiveBg: "bg-rose-600 text-white"
	},
	{
		value: "Komparasi/value",
		labelId: "Bandingkan Nilai & Hemat (Value)",
		badge: "Bukti Hemat",
		desc: "Menghitung hematnya belanja produk ini dibanding alternatif lain.",
		icon: Scale,
		colorBg: "bg-indigo-50 dark:bg-indigo-950/40",
		colorText: "text-indigo-600 dark:text-indigo-400",
		colorBorder: "border-indigo-200 dark:border-indigo-800/50",
		colorActiveBg: "bg-indigo-600 text-white"
	}
];
var DURATION_DROPDOWN_OPTIONS = [
	{
		value: 20,
		label: "20 Detik",
		sublabel: "~45-55 kata • Hook cepat & padat untuk TikTok/Shorts",
		badge: "Hook Cepat",
		icon: Timer
	},
	{
		value: 30,
		label: "30 Detik",
		sublabel: "~65-80 kata • Standar ideal TikTok, Reels & Shorts",
		badge: "Paling Populer",
		icon: Clock
	},
	{
		value: 60,
		label: "60 Detik",
		sublabel: "~130-160 kata • Pembahasan edukasi, manfaat & demo",
		badge: "Lengkap",
		icon: Clock
	},
	{
		value: 90,
		label: "90 Detik",
		sublabel: "~200-240 kata • Storytelling & pembuktian review autentik",
		badge: "Cerita & Bukti",
		icon: Timer
	},
	{
		value: 120,
		label: "120 Detik",
		sublabel: "~280-320 kata • Ulasan mendalam & tutorial langkah demi langkah",
		badge: "Mendalam",
		icon: Clock
	}
];
var SCRIPT_COUNT_DROPDOWN_OPTIONS = [
	{
		value: 2,
		label: "2 Variasi Skrip",
		sublabel: "2 naskah konsep berbeda untuk A/B testing cepat",
		icon: Hash
	},
	{
		value: 5,
		label: "5 Variasi Skrip",
		sublabel: "5 naskah konsep variatif dengan hook & sudut pandang berbeda",
		badge: "Rekomendasi",
		icon: ListOrdered
	},
	{
		value: 10,
		label: "10 Variasi Skrip",
		sublabel: "10 naskah konsep variatif untuk stok video harian",
		badge: "Stok Konten",
		icon: Hash
	},
	{
		value: 20,
		label: "20 Variasi Skrip",
		sublabel: "20 naskah konsep untuk kampanye affiliate berskala besar",
		icon: LayoutGrid
	},
	{
		value: 30,
		label: "30 Variasi Skrip",
		sublabel: "30 naskah konsep lengkap untuk kalender konten sebulan penuh",
		badge: "Maksimal",
		icon: Rocket
	}
];
var PERSONA_DROPDOWN_OPTIONS = [
	{
		value: "Auto",
		label: "Otomatis Sesuai Produk",
		sublabel: "AI menganalisis profil dan demografi pembeli paling ideal",
		badge: "Rekomendasi AI",
		icon: Sparkles
	},
	{
		value: "Mahasiswa/anak kost",
		label: "Mahasiswa & Anak Kost",
		sublabel: "Bahasa santai, ramah anggaran, praktis, dan anti-ribet",
		icon: GraduationCap
	},
	{
		value: "Pekerja kantor/Gen-Z",
		label: "Pekerja Kantor & Gen-Z",
		sublabel: "Relatable dengan dunia kerja, tren viral, dan efisiensi waktu",
		icon: User
	},
	{
		value: "Orang tua/rumah tangga",
		label: "Keluarga & Rumah Tangga",
		sublabel: "Kebutuhan harian rumah tangga, keamanan, dan manfaat keluarga",
		icon: Users
	},
	{
		value: "Profesional",
		label: "Profesional Bisnis",
		sublabel: "Fakta akurat, kredibilitas tinggi, dan solusi produktivitas",
		icon: Target
	},
	{
		value: "Pengguna pemula",
		label: "Pemula & Pengguna Baru",
		sublabel: "Penjelasan ramah, panduan mudah, tanpa istilah teknis rumit",
		icon: Smile
	},
	{
		value: "Custom",
		label: "+ Kustom Mandiri",
		sublabel: "Tuliskan target audiens spesifik Anda sendiri",
		icon: CirclePlus
	}
];
var INTENSITY_DROPDOWN_OPTIONS = [
	{
		value: "Soft",
		label: "Halus (Soft Selling)",
		sublabel: "Fokus edukasi & rekomendasi tulus tanpa kesan memaksa menjual",
		badge: "Edukasi",
		icon: Feather
	},
	{
		value: "Balanced",
		label: "Seimbang (Standar)",
		sublabel: "Kombinasi proporsional antara manfaat produk dan ajakan beli yang wajar",
		badge: "Standar Ideal",
		icon: Scale
	},
	{
		value: "Direct",
		label: "Tegas (Direct CTA)",
		sublabel: "Menekankan promo spesial, diskon potongan harga, dan ajakan pesan sekarang",
		badge: "Tinggi Konversi",
		icon: Megaphone
	}
];
var HOOK_DROPDOWN_OPTIONS = [
	{
		value: "Auto",
		label: "Otomatis (Paling Relevan)",
		sublabel: "AI memilih hook pembuka 3 detik yang paling pas untuk produk",
		badge: "Rekomendasi",
		icon: Sparkles
	},
	{
		value: "Bold claim berbukti",
		label: "Klaim Berani & Berbukti",
		sublabel: "Klaim hasil menonjol yang terbukti untuk menarik atensi instan",
		badge: "Perhatian Tinggi",
		icon: Flame
	},
	{
		value: "Pain-point callout",
		label: "Sorot Keluhan Audiens",
		sublabel: "Menyentuh masalah dan keresahan utama yang dialami penonton",
		icon: Target
	},
	{
		value: "Outcome-first",
		label: "Hasil Akhir di Awal Video",
		sublabel: "Langsung memperlihatkan kondisi akhir sebelum menjelaskan produk",
		icon: CircleCheck
	},
	{
		value: "Question/information gap",
		label: "Pertanyaan Rasa Ingin Tahu",
		sublabel: "Membuka dengan teka-teki yang memancing penonton bertahan sampai akhir",
		icon: CircleQuestionMark
	},
	{
		value: "Myth-busting",
		label: "Bongkar Mitos & Salah Kaprah",
		sublabel: "Membongkar pemahaman keliru di pasar dan menawarkan solusi nyata",
		icon: Lightbulb
	}
];
var DEMO_DROPDOWN_OPTIONS = [
	{
		value: "Auto",
		label: "Otomatis Sesuai Produk",
		sublabel: "AI memilih teknik demonstrasi visual yang paling meyakinkan",
		badge: "Rekomendasi",
		icon: Sparkles
	},
	{
		value: "Real-time / side-by-side",
		label: "Perbandingan Berdampingan",
		sublabel: "Visual komparasi langsung dua produk atau kondisi secara simultan",
		icon: ArrowRightLeft
	},
	{
		value: "Close-up / macro",
		label: "Sorot Detail Jarak Dekat",
		sublabel: "Sorot tekstur, jahitan, material, atau keaslian produk dari dekat",
		icon: ZoomIn
	},
	{
		value: "Unboxing & first touch",
		label: "Buka Kotak & Sentuhan Pertama",
		sublabel: "Momen membuka paket pesanan dan memperlihatkan kelengkapannya",
		icon: PackageOpen
	},
	{
		value: "Mini tutorial langkah demi langkah",
		label: "Tutorial Langkah demi Langkah",
		sublabel: "Cara pemakaian singkat yang mudah ditiru oleh penonton",
		icon: ListOrdered
	},
	{
		value: "Day-in-the-life rutinitas",
		label: "Dipakai di Keseharian",
		sublabel: "Memperlihatkan produk dalam aktivitas rutinitas sehari-hari",
		icon: Sun
	},
	{
		value: "Proof / test aman",
		label: "Uji Bukti & Ketahanan Nyata",
		sublabel: "Tes ketahanan, uji air, uji gesek, atau sertifikasi keamanan",
		icon: ShieldCheck
	},
	{
		value: "Before-after dengan bukti nyata",
		label: "Perubahan Sebelum vs Sesudah",
		sublabel: "Transisi nyata perbedaan sebelum dan setelah memakai produk",
		icon: SquareSplitVertical
	}
];
var CTA_DROPDOWN_OPTIONS = [
	{
		value: "Auto",
		label: "Otomatis Sesuai Gaya Skrip",
		sublabel: "AI menyesuaikan ajakan bertindak dengan intensitas dan gaya narasi",
		badge: "Rekomendasi",
		icon: Sparkles
	},
	{
		value: "Direct instruction (keranjang kiri bawah)",
		label: "Arahkan ke Keranjang Kiri Bawah",
		sublabel: "Instruksi langsung menekan ikon keranjang kuning/oranye untuk checkout",
		badge: "TikTok & Shopee",
		icon: ShoppingBag
	},
	{
		value: "Cek detail / pilihan variasi",
		label: "Ajak Cek Etalase & Pilihan Variasi",
		sublabel: "Mendorong penonton mengecek varian warna, ukuran, atau etalase",
		icon: Eye
	},
	{
		value: "Soft CTA (simpan video ini)",
		label: "Simpan & Bagikan Video",
		sublabel: "Ajakan menyimpan video atau membagikannya ke teman yang membutuhkan",
		icon: Bookmark
	},
	{
		value: "Price / value CTA",
		label: "Sorot Nilai Hemat & Promo",
		sublabel: "Menekankan promo potongan harga atau hemat ongkir hari ini",
		icon: Tag
	},
	{
		value: "Scarcity (hanya jika stok valid)",
		label: "Informasikan Stok Terbatas",
		sublabel: "Menekankan sisa stok yang menipis secara etis dan faktual",
		icon: CircleAlert
	},
	{
		value: "Deadline (hanya jika batas waktu valid)",
		label: "Informasikan Batas Waktu Promo",
		sublabel: "Mengingatkan batas waktu flash sale atau voucher diskon",
		icon: Calendar
	}
];
var PRONOUN_DROPDOWN_OPTIONS = [
	{
		value: "aku/saya",
		label: "Aku / Saya",
		sublabel: "Gaya personal, testimoni pengalaman, dan cerita akrab layaknya teman",
		badge: "Personal",
		icon: User
	},
	{
		value: "kamu",
		label: "Kamu / Kalian",
		sublabel: "Menyapa penonton secara langsung seperti sedang berbincang tatap muka",
		badge: "Interaktif",
		icon: Users
	},
	{
		value: "netral",
		label: "Netral",
		sublabel: "Fokus sepenuhnya pada spesifikasi dan keunggulan produk tanpa kata ganti",
		badge: "Objektif",
		icon: UserMinus
	}
];
var MinimalSwitch = ({ checked, onChange, id, label }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		id,
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		onClick: () => onChange(!checked),
		className: `relative inline-flex items-center h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${checked ? "bg-blue-600" : "bg-slate-200 dark:bg-zinc-700"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}` })
	});
};
var GeneratorConfigPanelComponent = ({ config, onChange, isGenerating, disabled, productBrief, onBackToBrief, user, hasApiKey, onRequireAuthOrKey }) => {
	const [showAdvanced, setShowAdvanced] = (0, import_react.useState)(false);
	const [showAngleLibrary, setShowAngleLibrary] = (0, import_react.useState)(false);
	const [isStyleSheetOpen, setIsStyleSheetOpen] = (0, import_react.useState)(false);
	const isAuthLocked = !user || !hasApiKey;
	const standardPersonaValues = PERSONA_DROPDOWN_OPTIONS.map((p) => p.value);
	const isCustomSelected = config.audiencePersona === "Custom" || !standardPersonaValues.includes(config.audiencePersona) && Boolean(config.audiencePersona);
	const [customPersonaValue, setCustomPersonaValue] = (0, import_react.useState)(isCustomSelected && config.audiencePersona !== "Custom" ? config.audiencePersona : "");
	(0, import_react.useEffect)(() => {
		if (isCustomSelected && config.audiencePersona !== "Custom") setCustomPersonaValue(config.audiencePersona);
	}, [config.audiencePersona, isCustomSelected]);
	const handleDurationSelect = (dur) => {
		onChange({
			...config,
			durationSeconds: dur
		});
	};
	const handleScriptCountChange = (val) => {
		const clamped = Math.max(1, Math.min(30, val));
		onChange({
			...config,
			scriptCount: clamped
		});
	};
	const toggleAngle = (angleLabel) => {
		const current = config.selectedAngles || [];
		const updated = current.includes(angleLabel) ? current.filter((a) => a !== angleLabel) : [...current, angleLabel];
		onChange({
			...config,
			angleMode: updated.length > 0 ? "manual" : "auto",
			selectedAngles: updated
		});
	};
	const currentStyleMeta = STYLE_OPTIONS.find((s) => s.value === config.style) || STYLE_OPTIONS[0];
	const currentPersonaOptions = import_react.useMemo(() => {
		return PERSONA_DROPDOWN_OPTIONS.map((opt) => {
			if (opt.value === "Custom") return {
				...opt,
				label: customPersonaValue ? `Kustom: ${customPersonaValue}` : "+ Kustom Mandiri",
				sublabel: customPersonaValue ? "Target audiens spesifik pilihan Anda" : "Tuliskan target audiens spesifik Anda sendiri"
			};
			return opt;
		});
	}, [customPersonaValue]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 max-w-4xl mx-auto pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Parameter Inti Skrip" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
								title: "Parameter Inti Skrip",
								content: "Pilih durasi, jumlah variasi konsep, dan karakter pembawaan narasi untuk video Anda."
							})]
						}) })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownSelect, {
							id: "select-duration",
							label: "Durasi Video",
							icon: Clock,
							value: config.durationSeconds,
							options: DURATION_DROPDOWN_OPTIONS,
							onChange: (val) => handleDurationSelect(val),
							disabled,
							rightBadge: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums",
								children: [config.durationSeconds, " Detik"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownSelect, {
							id: "select-script-count",
							label: "Jumlah Variasi Skrip",
							icon: Hash,
							value: config.scriptCount,
							options: SCRIPT_COUNT_DROPDOWN_OPTIONS,
							onChange: (val) => handleScriptCountChange(val),
							disabled,
							rightBadge: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums",
								children: [config.scriptCount, " Konsep"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-between",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "w-4 h-4 text-blue-600 dark:text-blue-400" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gaya Narasi" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
											title: "Gaya Narasi",
											content: "Pilih karakter penyampaian audio dan video agar sesuai dengan citra produk."
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								onClick: () => setIsStyleSheetOpen(true),
								className: "py-2.5 sm:py-3 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] flex flex-col justify-center gap-1.5 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500/60 transition-all cursor-pointer group select-none",
								role: "button",
								tabIndex: 0,
								onKeyDown: (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setIsStyleSheetOpen(true);
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between w-full gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(currentStyleMeta.icon, { className: "w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug whitespace-nowrap overflow-hidden text-ellipsis sm:whitespace-normal",
											children: currentStyleMeta.labelId
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/50 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ubah" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3.5 h-3.5 text-blue-500 dark:text-blue-400" })]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium leading-normal w-full text-left",
									children: currentStyleMeta.desc
								})]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownSelect, {
						id: "select-target-persona",
						label: "Target Audiens",
						icon: User,
						tooltip: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
							title: "Target Audiens",
							content: "Pilih persona penonton yang dituju agar gaya bahasa dan contoh masalah relevan dengan kehidupan mereka."
						}),
						value: isCustomSelected ? "Custom" : config.audiencePersona,
						options: currentPersonaOptions,
						onChange: (val) => {
							if (val === "Custom") onChange({
								...config,
								audiencePersona: customPersonaValue || "Custom"
							});
							else onChange({
								...config,
								audiencePersona: val
							});
						},
						disabled
					}), isCustomSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-1.5 animate-in fade-in duration-150",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1",
							children: "Tuliskan Target Audiens Kustom:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: customPersonaValue,
							onChange: (e) => {
								setCustomPersonaValue(e.target.value);
								onChange({
									...config,
									audiencePersona: e.target.value || "Custom"
								});
							},
							onKeyDown: (e) => e.stopPropagation(),
							placeholder: "Contoh: Ibu muda yang baru punya bayi, reseller pemula, dsb.",
							className: "w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none transition-all shadow-xs"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowAdvanced(!showAdvanced),
					className: "w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer select-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-900/40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm sm:text-base font-bold text-slate-900 dark:text-white",
							children: "Pengaturan Lanjutan"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-slate-500 dark:text-zinc-400",
							children: "Formula angle, intensitas jualan, hook, demo, dan CTA"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700",
						children: showAdvanced ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-4 h-4" })
					})]
				}), showAdvanced && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 border-t border-slate-100 dark:border-zinc-800 space-y-5 animate-in fade-in duration-200",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "w-4 h-4 text-purple-600 dark:text-purple-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Formula Sudut Pandang (Angle)" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowAngleLibrary(!showAngleLibrary),
									className: "px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200/80 dark:border-blue-900/60",
									children: showAngleLibrary ? "Tutup Pustaka" : "Buka 20 Formula Angle"
								})]
							}), showAngleLibrary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-850 rounded-xl border border-slate-200 dark:border-zinc-700",
								children: CONTENT_ANGLES.map((ang) => {
									const isSelected = config.selectedAngles.includes(ang.label) || config.selectedAngles.includes(ang.name);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => toggleAngle(ang.label),
										className: `text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between cursor-pointer border active:scale-95 ${isSelected ? "bg-blue-600 text-white font-semibold border-transparent shadow-xs" : "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white hover:bg-slate-50 border-slate-200 dark:border-zinc-700"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 pr-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `font-bold ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`,
												children: ang.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `text-[11px] leading-relaxed mt-0.5 ${isSelected ? "text-blue-100 font-medium" : "text-slate-500 dark:text-zinc-400"}`,
												children: ang.description
											})]
										}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 shrink-0 mt-0.5 ml-1 text-white stroke-[2.5]" })]
									}, ang.id);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownSelect, {
								id: "select-selling-intensity",
								label: "Intensitas Promosi",
								icon: Scale,
								value: config.sellingIntensity,
								options: INTENSITY_DROPDOWN_OPTIONS,
								onChange: (val) => onChange({
									...config,
									sellingIntensity: val
								}),
								disabled
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownSelect, {
									id: "select-hook-type",
									label: "Tipe Hook Pembuka",
									icon: Flame,
									value: config.hookType,
									options: HOOK_DROPDOWN_OPTIONS,
									onChange: (val) => onChange({
										...config,
										hookType: val
									}),
									disabled
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownSelect, {
									id: "select-demo-method",
									label: "Metode Demo Visual",
									icon: Eye,
									value: config.demoMethod,
									options: DEMO_DROPDOWN_OPTIONS,
									onChange: (val) => onChange({
										...config,
										demoMethod: val
									}),
									disabled
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownSelect, {
									id: "select-cta-type",
									label: "Ajakan Bertindak (CTA)",
									icon: ShoppingBag,
									value: config.ctaType,
									options: CTA_DROPDOWN_OPTIONS,
									onChange: (val) => onChange({
										...config,
										ctaType: val
									}),
									disabled
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownSelect, {
									id: "select-pronouns",
									label: "Panggilan Kata Ganti",
									icon: User,
									value: config.pronouns,
									options: PRONOUN_DROPDOWN_OPTIONS,
									onChange: (val) => onChange({
										...config,
										pronouns: val
									}),
									disabled
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "w-4 h-4 text-teal-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Strategi Harga Coret & Kuota Promo" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white dark:bg-[#1C1C1E] rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800 shadow-2xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "w-4 h-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs sm:text-sm font-bold text-slate-900 dark:text-white",
											children: "Perbandingan Harga Coret"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-slate-500 dark:text-zinc-400",
											children: "Sebutkan harga normal vs harga promo untuk menegaskan nilai hemat"
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinimalSwitch, {
										checked: Boolean(config.priceAnchoringEnabled),
										onChange: (checked) => onChange({
											...config,
											priceAnchoringEnabled: checked
										}),
										label: "Sorot Perbandingan Harga"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-4 h-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs sm:text-sm font-bold text-slate-900 dark:text-white",
											children: "Batas Waktu & Kuota Promo"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-slate-500 dark:text-zinc-400",
											children: "Dorong penonton checkout cepat jika promo memiliki kuota terbatas"
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinimalSwitch, {
										checked: Boolean(config.urgencyEnabled),
										onChange: (checked) => onChange({
											...config,
											urgencyEnabled: checked
										}),
										label: "Urgensi & Batas Promo"
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-4 h-4 text-indigo-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Instruksi Khusus untuk AI (Opsional)" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 2,
								value: config.extraInstructions || "",
								onChange: (e) => onChange({
									...config,
									extraInstructions: e.target.value
								}),
								onKeyDown: (e) => e.stopPropagation(),
								placeholder: "Contoh: Tekankan varian warna hitam matte, sebutkan gratis ongkir hari ini...",
								className: "w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 focus:border-blue-600 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none transition-all resize-none"
							})]
						})
					]
				})]
			}),
			isAuthLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs flex items-start gap-3 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-bold text-slate-900 dark:text-white",
							children: "Proteksi Generator Skrip Aktif"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]",
							children: "Harap masuk akun Google atau masukkan API Key Google AI Studio Anda terlebih dahulu untuk memulai pembuatan skrip."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onRequireAuthOrKey,
							className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 active:scale-95 transition-all cursor-pointer shadow-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Masuk / Atur API Key" })]
						})
					]
				})]
			}),
			onBackToBrief && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-1 flex items-center justify-start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onBackToBrief,
					className: "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 transition-all cursor-pointer active:scale-95 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kembali ke Brief Produk" })]
				})
			}),
			isStyleSheetOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Pilih Gaya Narasi",
				className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3.5 sm:p-6 pb-4 sm:pb-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150",
				onClick: (e) => {
					if (e.target === e.currentTarget) setIsStyleSheetOpen(false);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full sm:max-w-xl bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "w-4 h-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm sm:text-base font-bold text-slate-900 dark:text-white",
									children: "Pilih Gaya Narasi"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-slate-500 dark:text-zinc-400",
									children: "Pilih karakter pembawaan audio & video yang paling sesuai"
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setIsStyleSheetOpen(false),
								className: "w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors",
								"aria-label": "Tutup",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 overflow-y-auto space-y-2.5 flex-1 divide-y-0",
							children: STYLE_OPTIONS.map((st) => {
								const isSelected = config.style === st.value;
								const IconComp = st.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										onChange({
											...config,
											style: st.value
										});
										setIsStyleSheetOpen(false);
									},
									className: `w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer active:scale-[0.99] ${isSelected ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-white dark:bg-[#1C1C1E] border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${isSelected ? "bg-white text-blue-600" : `${st.colorBg} ${st.colorText}`}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComp, { className: "w-5 h-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `text-xs sm:text-sm font-bold leading-snug ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`,
												children: st.labelId
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 shrink-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${isSelected ? "bg-white/20 text-white border border-white/30" : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"}`,
													children: st.badge
												}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-2xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5 stroke-[3]" })
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-xs mt-1 leading-relaxed ${isSelected ? "text-blue-100 font-medium" : "text-slate-600 dark:text-zinc-400"}`,
											children: st.desc
										})]
									})]
								}, st.value);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-5 py-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E] flex items-center justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setIsStyleSheetOpen(false),
								className: "px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-xs",
								children: "Selesai"
							})
						})
					]
				})
			})
		]
	});
};
var GeneratorConfigPanel = import_react.memo(GeneratorConfigPanelComponent);
// src/utils/exportTxt.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
function formatScriptAsText(script, index) {
	const numStr = index !== void 0 ? `KONSEP #${index + 1}: ` : "";
	let txt = `============================================================\n`;
	txt += `${numStr}${script.title.toUpperCase()}\n`;
	txt += `============================================================\n`;
	txt += `• Angle: ${script.angle}\n`;
	txt += `• Target Persona: ${script.persona}\n`;
	txt += `• Tipe Hook: ${script.hookType}\n`;
	txt += `• Differentiator: ${script.differentiator}\n`;
	txt += `• Estimasi Durasi: ${script.estimatedDurationSeconds} detik\n`;
	txt += `• Jumlah Kata Narasi: ${script.spokenWordCount} kata (${script.durationStatus.toUpperCase()})\n`;
	if (script.triggers && script.triggers.length > 0) txt += `• Pemicu Psikologis: ${script.triggers.join(", ")}\n`;
	txt += `\n--- STRUKTUR DETAIL SEGMEN ---\n\n`;
	script.segments.forEach((seg) => {
		txt += `[${seg.timeRange}] - ${seg.segmentName}\n`;
		txt += `  Aksi Visual & B-roll : ${seg.visualDirection}\n`;
		txt += `  Dialog Narasi        : "${seg.spokenDialogue}"\n`;
		txt += `  Teks Overlay         : ${seg.overlayText || "-"}\n`;
		txt += `  Catatan Strategi     : ${seg.strategyNote || "-"}\n\n`;
	});
	txt += `--- NARASI / VOICEOVER SAJA (SIAP DIBACA) ---\n`;
	txt += `${script.voiceoverOnly}\n\n`;
	return txt;
}
function generateAllScriptsTxt(productBrief, config, scripts) {
	const dateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	let full = `AFFILIATE SCRIPT LAB - PAKET SKRIP LENGKAP (MULTI-PLATFORM)\n`;
	full += `Produk: ${productBrief.name || "Produk"}\n`;
	full += `Dibuat pada: ${dateStr}\n`;
	full += `============================================================\n\n`;
	scripts.forEach((script, idx) => {
		full += formatScriptAsText(script, idx);
		full += `\n\n`;
	});
	return full;
}
function generateAllVoiceoversTxt(productBrief, scripts) {
	const dateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	let full = `AFFILIATE SCRIPT LAB - KUMPULAN NARASI SUARA SAJA (VOICEOVER)\n`;
	full += `Produk: ${productBrief.name || "Produk"}\n`;
	full += `Tanggal: ${dateStr}\n`;
	full += `============================================================\n\n`;
	scripts.forEach((script, idx) => {
		full += `[KONSEP #${idx + 1}] ${script.title}\n`;
		full += `Angle: ${script.angle} | Durasi: ${script.estimatedDurationSeconds} detik (${script.spokenWordCount} kata)\n`;
		full += `------------------------------------------------------------\n`;
		full += `"${script.voiceoverOnly}"\n\n`;
	});
	return full;
}
function downloadScriptsTxtFile(productBrief, config, scripts) {
	const content = generateAllScriptsTxt(productBrief, config, scripts);
	const dateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	downloadBlob(content, `skrip-lengkap-${(productBrief.name || "produk").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30) || "produk"}-${dateStr}.txt`);
}
function downloadVoiceoversTxtFile(productBrief, scripts) {
	const content = generateAllVoiceoversTxt(productBrief, scripts);
	const dateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	downloadBlob(content, `narasi-saja-${(productBrief.name || "produk").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30) || "produk"}-${dateStr}.txt`);
}
function downloadBlob(content, filename) {
	const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
// src/utils/wordCount.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
/**
* Counts spoken words in a narrative dialogue string.
* Filters out punctuation and whitespace. Only dialogue words are counted.
*/
function countWords(text) {
	if (!text || typeof text !== "string") return 0;
	const cleaned = text.replace(/\[.*?\]/g, " ").replace(/\(.*?\)/g, " ").replace(/[\r\n\t]/g, " ").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'–—]/g, " ").trim();
	if (!cleaned) return 0;
	return cleaned.split(/\s+/).filter((w) => w.length > 0).length;
}
/**
* Evaluates duration status against target word count.
*/
function evaluateDurationStatus(wordCount, duration) {
	const target = DURATION_WORD_TARGETS[duration] || DURATION_WORD_TARGETS[30];
	const toleranceLower = Math.floor(target.min * .9);
	const toleranceUpper = Math.ceil(target.max * 1.1);
	if (wordCount < toleranceLower) return {
		status: "short",
		targetMin: target.min,
		targetMax: target.max,
		message: `Perlu diperpanjang (${wordCount} kata vs target ${target.min}–${target.max} kata)`
	};
	if (wordCount > toleranceUpper) return {
		status: "long",
		targetMin: target.min,
		targetMax: target.max,
		message: `Perlu dipersingkat (${wordCount} kata vs target ${target.min}–${target.max} kata)`
	};
	return {
		status: "ok",
		targetMin: target.min,
		targetMax: target.max,
		message: `Optimal (${wordCount} kata, target ${target.min}–${target.max} kata)`
	};
}
// src/utils/apiKeys.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
/**
* Daftar Model Keluarga Google yang didukung (Gemini, Google AI Studio)
* dengan rekomendasi utama model v3.8 Flash.
*/
var SUPPORTED_GOOGLE_MODELS = [
	{
		id: "gemini-3.1-flash-lite",
		name: "Gemini 3.1 Flash Lite",
		tag: "Bawaan Utama (Ultra Cepat ~600ms)",
		desc: "Model Google generasi terbaru tercepat, responsif, dan optimal untuk ekstraksi brief serta skrip video affiliate."
	},
	{
		id: "gemini-flash-lite-latest",
		name: "Gemini Flash Lite Latest",
		tag: "Alternatif Ke-2 (Stabil & Ringan)",
		desc: "Model berkecepatan tinggi dengan ketersediaan tinggi dan performa stabil tanpa antrean."
	},
	{
		id: "gemini-3.8-flash",
		name: "Gemini 3.8 Flash",
		tag: "Alternatif Ke-3 (Kapasitas Besar)",
		desc: "Model multimodal generasi terbaru dengan penalaran mendalam dan pemahaman visual yang kuat."
	}
];
var GEMINI_MODEL = "gemini-3.1-flash-lite";
/**
* Membersihkan string dari karakter tersembunyi Unicode, smart quotes,
* zero-width space, atau karakter non-ISO-8859-1 yang sering ikut ter-copy
* saat menyalin teks dari smartphone Android / keyboard clipboard.
*/
function sanitizeApiKeyString(raw) {
	if (!raw) return "";
	return raw.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\u00A0\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "").replace(/[\u201C\u201D\u2018\u2019`"']/g, "").replace(/[^\x20-\x7E\r\n\t]/g, "").trim();
}
/**
* Menjamin nilai header HTTP hanya berisi karakter ASCII printable murni (code point <= 127).
* Mencegah error fatal browser: "Failed to construct 'Headers': String contains non ISO-8859-1 code point."
*/
function safeHeaderValue(val) {
	if (!val) return "";
	return val.replace(/[\r\n\t]/g, " ").replace(/[^\x20-\x7E]/g, "").trim();
}
/**
* Membersihkan satu kunci Google secara presisi.
* Kunci Google hanya tersusun dari karakter alfanumerik, titik, strip, atau underscore.
*/
function cleanSingleKey(rawPart) {
	const sanitized = sanitizeApiKeyString(rawPart);
	const match = sanitized.match(/\b(AQ[a-zA-Z0-9._-]+|AIzaSy[a-zA-Z0-9_-]+|ya29\.[a-zA-Z0-9_-]+|[a-zA-Z0-9._-]{16,})\b/);
	if (match) return match[1].trim();
	return sanitized.replace(/[^a-zA-Z0-9._-]/g, "").trim();
}
/**
* Parsing multi API Key dari string teks (pemisah baris baru, koma, titik koma, atau spasi).
* Mendukung seluruh varian format keluarga Google saat ini maupun pembaruan masa depan:
* - Kunci Google AI Studio terbaru: AQ... / AQ.Ab8RN6... (titik, strip, alfanumerik)
* - Kunci standar Google Cloud: AIzaSy...
* - Token OAuth / Bearer: ya29...
* - Kunci kustom / format pembaruan Google masa depan
*/
function parseApiKeys(input) {
	if (!input) return [];
	const rawParts = sanitizeApiKeyString(input).split(/[\r\n,;|]+/);
	const keys = [];
	const seen = /* @__PURE__ */ new Set();
	for (const part of rawParts) {
		const cleaned = cleanSingleKey(part);
		if (cleaned.length >= 6 && !seen.has(cleaned)) {
			seen.add(cleaned);
			keys.push(cleaned);
		}
	}
	return keys;
}
// src/services/directGeminiService.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var CANDIDATE_MODELS = [
	"gemini-3.1-flash-lite",
	"gemini-flash-lite-latest",
	"gemini-3.8-flash",
	"gemini-flash-latest"
];
var DEFAULT_20_ANGLES = [
	"Problem-Solution (Solusi Masalah)",
	"Personal Story (Kisah Nyata)",
	"Bold Claim (Klaim Menghentak)",
	"Myth-Busting (Bongkar Mitos)",
	"Outcome-First (Hasil di Awal)",
	"Common Mistakes (Hindari Salah)",
	"Price/Value (Bandingkan Nilai)",
	"Social Proof (Bukti Sosial)",
	"Unboxing/ASMR (First Impression)",
	"Educational/How-To (Tutorial Cepat)",
	"Skeptic-to-Believer (Awalnya Ragu)",
	"Routine/Day in the Life (POV Rutinitas)",
	"Feature Deep-Dive (Bedah Fitur)",
	"Relatable Humor (Situasi Lucu)",
	"Urgency/Scarcity (Momen Terbatas)",
	"Before-After Transformation (Transformasi Nyata)",
	"Comparison vs Alternative (Adu Kualitas)",
	"Hidden Gem/Secret Hack (Trik Rahasia)",
	"Gift/Recommendation (Rekomendasi Hadiah)",
	"Behind the Scenes (Di Balik Layar)"
];
var directRotationIndex = 0;
var directQuotaTracker = /* @__PURE__ */ new Map();
/**
* Controlled parallel concurrency runner for mobile streaming batches
*/
async function runWithConcurrency(items, concurrency, fn) {
	const results = new Array(items.length);
	let currentIndex = 0;
	async function worker() {
		while (currentIndex < items.length) {
			const idx = currentIndex++;
			results[idx] = await fn(items[idx], idx);
		}
	}
	const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
	await Promise.all(workers);
	return results;
}
/**
* Sanitizes markdown JSON delimiters
*/
function cleanJsonString(raw) {
	let cleaned = raw.trim();
	if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
	else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
	if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
	return cleaned.trim();
}
/**
* Sanitizes platform-specific terms and neutralizes CTAs.
* Replaces 'keranjang kuning' with 'keranjang kiri bawah' or 'keranjang bawah video ini'.
*/
function sanitizeCrossPlatformText(text) {
	if (!text) return "";
	return text.replace(/keranjang\s+kuning/gi, "keranjang kiri bawah").replace(/klik\s+keranjang\s+kuning/gi, "klik keranjang kiri bawah").replace(/cek\s+keranjang\s+kuning/gi, "cek keranjang bawah video ini").replace(/checkout\s+di\s+keranjang\s+kuning/gi, "checkout di keranjang bawah").replace(/keranjang\s+orange/gi, "keranjang kiri bawah").replace(/keranjang\s+oranye/gi, "keranjang kiri bawah").replace(/\bdi\s+tiktok\s+shop\b/gi, "di keranjang bawah").replace(/\bdi\s+shopee\s+video\b/gi, "di keranjang bawah").replace(/\bdi\s+shopee\b/gi, "di keranjang bawah").replace(/\bke\s+shopee\b/gi, "ke keranjang bawah").replace(/\bdi\s+tiktok\b/gi, "di keranjang bawah").replace(/\bke\s+tiktok\b/gi, "ke keranjang bawah").replace(/\bdi\s+tokopedia\b/gi, "di keranjang bawah").replace(/\bke\s+tokopedia\b/gi, "ke keranjang bawah").replace(/\s+/g, " ").trim();
}
/**
* Executes a Gemini generateContent request directly against Google's public REST API.
* Completely client-side, zero backend server requirement, supports all Google AI Studio keys.
*/
async function callGeminiDirect(params) {
	const { contents, systemInstruction, preferredModel, responseMimeType = "application/json", temperature = .7, maxOutputTokens = 8192, apiKey, timeoutMs = 45e3 } = params;
	let rawKeys = [];
	if (apiKey) rawKeys = parseApiKeys(apiKey);
	if (rawKeys.length === 0 && typeof window !== "undefined") try {
		const stored = localStorage.getItem("affiliate_script_lab_api_key");
		if (stored) rawKeys = parseApiKeys(stored);
	} catch {}
	if (rawKeys.length === 0) {
		const err = /* @__PURE__ */ new Error("MISSING_MOBILE_API_KEY: API Key Google AI Studio belum diatur. Harap masukkan API Key Anda di menu profil/kunci kanan atas.");
		err.isMissingKey = true;
		err.status = 401;
		throw err;
	}
	const totalKeys = rawKeys.length;
	const startIdx = directRotationIndex++ % totalKeys;
	const orderedKeys = [];
	for (let i = 0; i < totalKeys; i++) {
		const idx = (startIdx + i) % totalKeys;
		orderedKeys.push({
			key: rawKeys[idx],
			index: idx
		});
	}
	const models = [...CANDIDATE_MODELS];
	if (preferredModel && models.includes(preferredModel)) {
		const pIdx = models.indexOf(preferredModel);
		if (pIdx > 0) {
			models.splice(pIdx, 1);
			models.unshift(preferredModel);
		}
	}
	const now = Date.now();
	let lastError;
	let exhaustedCount = 0;
	for (const { key: rawKey } of orderedKeys) {
		const cleanKey = cleanSingleKey(rawKey);
		if (!cleanKey || cleanKey.length < 6) continue;
		const cooldownUntil = directQuotaTracker.get(cleanKey);
		if (cooldownUntil && now < cooldownUntil && totalKeys > 1) {
			exhaustedCount++;
			continue;
		}
		for (const model of models) {
			let controller = null;
			let timer = null;
			try {
				controller = new AbortController();
				timer = setTimeout(() => controller?.abort(), timeoutMs);
				const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cleanKey)}`;
				const reqBody = { generationConfig: {
					temperature,
					maxOutputTokens
				} };
				if (responseMimeType) reqBody.generationConfig.responseMimeType = responseMimeType;
				if (model.includes("3.8") || model.includes("3.7") || model.includes("4-")) reqBody.generationConfig.thinkingConfig = { thinkingLevel: "LOW" };
				if (systemInstruction) reqBody.systemInstruction = { parts: [{ text: systemInstruction }] };
				if (typeof contents === "string") reqBody.contents = [{ parts: [{ text: contents }] }];
				else if (Array.isArray(contents)) reqBody.contents = [{ parts: contents }];
				else if (contents && contents.parts) reqBody.contents = [contents];
				else reqBody.contents = [{ parts: [{ text: JSON.stringify(contents) }] }];
				const headers = {
					"Content-Type": "application/json",
					"Accept": "application/json"
				};
				if (cleanKey.startsWith("ya29.")) headers["Authorization"] = `Bearer ${safeHeaderValue(cleanKey)}`;
				else headers["x-goog-api-key"] = safeHeaderValue(cleanKey);
				const res = await fetch(endpoint, {
					method: "POST",
					headers,
					body: JSON.stringify(reqBody),
					signal: controller.signal
				});
				clearTimeout(timer);
				if (!res.ok) {
					const errorMsg = (await res.json().catch(() => null))?.error?.message || `HTTP ${res.status} ${res.statusText || "Gagal memproses"}`;
					const err = new Error(errorMsg);
					err.status = res.status;
					throw err;
				}
				const text = ((await res.json())?.candidates?.[0])?.content?.parts?.[0]?.text || "";
				directQuotaTracker.delete(cleanKey);
				return text;
			} catch (err) {
				if (timer) clearTimeout(timer);
				lastError = err;
				const msg = err?.message || "";
				const isQuota = err?.status === 429 || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("Quota exceeded");
				const isKeyInvalid = err?.status === 400 && (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid") || msg.includes("PERMISSION_DENIED"));
				if (isQuota) {
					console.warn(`[DirectGemini] Kuota habis untuk model ${model}, mencoba model/kunci berikutnya`);
					continue;
				}
				if (isKeyInvalid) {
					console.warn(`[DirectGemini] Kunci tidak valid, beralih ke kunci berikutnya`);
					break;
				}
				continue;
			}
		}
	}
	if (exhaustedCount >= totalKeys && totalKeys > 0) {
		const quotaErr = /* @__PURE__ */ new Error("TOKEN_QUOTA_EXHAUSTED: Token/kuota dari seluruh API Key Google Anda telah mencapai batas. Harap ganti dengan API Key Google AI Studio baru yang masih memiliki kuota untuk melanjutkan.");
		quotaErr.isQuotaExhausted = true;
		quotaErr.status = 429;
		throw quotaErr;
	}
	throw lastError || /* @__PURE__ */ new Error("Gagal menghubungi Google AI Studio. Pastikan koneksi internet aktif.");
}
/**
* Streams tokens directly from Google Generative Language REST API using SSE (?alt=sse).
* Works directly in Android APK WebView or Web browser with zero server latency (TTFT 1-2s).
*/
async function callGeminiDirectStream(params) {
	const { contents, systemInstruction, preferredModel, responseMimeType = "application/json", temperature = .7, maxOutputTokens = 8192, apiKey, timeoutMs = 45e3, onChunk } = params;
	let rawKeys = [];
	if (apiKey) rawKeys = parseApiKeys(apiKey);
	if (rawKeys.length === 0 && typeof window !== "undefined") try {
		const stored = localStorage.getItem("affiliate_script_lab_api_key");
		if (stored) rawKeys = parseApiKeys(stored);
	} catch {}
	if (rawKeys.length === 0) {
		const err = /* @__PURE__ */ new Error("MISSING_MOBILE_API_KEY: API Key Google AI Studio belum diatur. Harap masukkan API Key Anda di menu profil/kunci kanan atas.");
		err.isMissingKey = true;
		err.status = 401;
		throw err;
	}
	const totalKeys = rawKeys.length;
	const startIdx = directRotationIndex++ % totalKeys;
	const orderedKeys = [];
	for (let i = 0; i < totalKeys; i++) {
		const idx = (startIdx + i) % totalKeys;
		orderedKeys.push({
			key: rawKeys[idx],
			index: idx
		});
	}
	const models = [...CANDIDATE_MODELS];
	if (preferredModel && models.includes(preferredModel)) {
		const pIdx = models.indexOf(preferredModel);
		if (pIdx > 0) {
			models.splice(pIdx, 1);
			models.unshift(preferredModel);
		}
	}
	const now = Date.now();
	let lastError;
	let exhaustedCount = 0;
	for (const { key: rawKey } of orderedKeys) {
		const cleanKey = cleanSingleKey(rawKey);
		if (!cleanKey || cleanKey.length < 6) continue;
		const cooldownUntil = directQuotaTracker.get(cleanKey);
		if (cooldownUntil && now < cooldownUntil && totalKeys > 1) {
			exhaustedCount++;
			continue;
		}
		for (const model of models) {
			let controller = null;
			let timer = null;
			try {
				controller = new AbortController();
				timer = setTimeout(() => controller?.abort(), timeoutMs);
				const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(cleanKey)}`;
				const reqBody = { generationConfig: {
					temperature,
					maxOutputTokens
				} };
				if (responseMimeType) reqBody.generationConfig.responseMimeType = responseMimeType;
				if (model.includes("3.8") || model.includes("3.7") || model.includes("4-")) reqBody.generationConfig.thinkingConfig = { thinkingLevel: "LOW" };
				if (systemInstruction) reqBody.systemInstruction = { parts: [{ text: systemInstruction }] };
				if (typeof contents === "string") reqBody.contents = [{ parts: [{ text: contents }] }];
				else if (Array.isArray(contents)) reqBody.contents = [{ parts: contents }];
				else if (contents && contents.parts) reqBody.contents = [contents];
				else reqBody.contents = [{ parts: [{ text: JSON.stringify(contents) }] }];
				const headers = {
					"Content-Type": "application/json",
					"Accept": "text/event-stream"
				};
				if (cleanKey.startsWith("ya29.")) headers["Authorization"] = `Bearer ${safeHeaderValue(cleanKey)}`;
				else headers["x-goog-api-key"] = safeHeaderValue(cleanKey);
				const res = await fetch(endpoint, {
					method: "POST",
					headers,
					body: JSON.stringify(reqBody),
					signal: controller.signal
				});
				clearTimeout(timer);
				if (!res.ok) {
					const errorMsg = (await res.json().catch(() => null))?.error?.message || `HTTP ${res.status} ${res.statusText || "Gagal memproses"}`;
					const err = new Error(errorMsg);
					err.status = res.status;
					throw err;
				}
				if (!res.body) throw new Error("ReadableStream tidak didukung di lingkungan ini.");
				const reader = res.body.getReader();
				const decoder = new TextDecoder("utf-8");
				let accumulated = "";
				let buffer = "";
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";
					for (const line of lines) {
						const trimmed = line.trim();
						if (!trimmed.startsWith("data:")) continue;
						const jsonStr = trimmed.slice(5).trim();
						if (!jsonStr) continue;
						try {
							const chunkText = JSON.parse(jsonStr)?.candidates?.[0]?.content?.parts?.[0]?.text || "";
							if (chunkText) {
								accumulated += chunkText;
								if (onChunk) try {
									onChunk(chunkText);
								} catch {}
							}
						} catch {}
					}
				}
				if (buffer.trim().startsWith("data:")) try {
					const chunkText = JSON.parse(buffer.trim().slice(5).trim())?.candidates?.[0]?.content?.parts?.[0]?.text || "";
					if (chunkText) {
						accumulated += chunkText;
						if (onChunk) onChunk(chunkText);
					}
				} catch {}
				directQuotaTracker.delete(cleanKey);
				return accumulated;
			} catch (err) {
				if (timer) clearTimeout(timer);
				lastError = err;
				const msg = err?.message || "";
				const isQuota = err?.status === 429 || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("Quota exceeded");
				const isKeyInvalid = err?.status === 400 && (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid") || msg.includes("PERMISSION_DENIED"));
				if (isQuota) continue;
				if (isKeyInvalid) break;
				continue;
			}
		}
	}
	if (exhaustedCount >= totalKeys && totalKeys > 0) {
		const quotaErr = /* @__PURE__ */ new Error("TOKEN_QUOTA_EXHAUSTED: Token/kuota dari seluruh API Key Google Anda telah mencapai batas. Harap ganti dengan API Key Google AI Studio baru yang masih memiliki kuota untuk melanjutkan.");
		quotaErr.isQuotaExhausted = true;
		quotaErr.status = 429;
		throw quotaErr;
	}
	throw lastError || /* @__PURE__ */ new Error("Gagal streaming dari Google AI Studio.");
}
/**
* Builds structured fallback script when network fails
*/
function buildDirectFallbackScript(productBrief, config, angle, index, targetWords) {
	const pName = productBrief.name || "Produk Ini";
	const features = productBrief.features?.length ? productBrief.features : [
		"material awet & kokoh",
		"desain ergonomis siap pakai",
		"kualitas teruji"
	];
	const benefits = productBrief.benefits?.length ? productBrief.benefits : ["mempermudah rutinitas harian", "menghemat waktu dan tenaga"];
	const painPoints = productBrief.painPoints?.length ? productBrief.painPoints : ["sering repot dengan cara konvensional"];
	const feature = features[(index - 1) % features.length];
	const benefit = benefits[(index - 1) % benefits.length];
	const pain = painPoints[(index - 1) % painPoints.length];
	const persona = config.audiencePersona && config.audiencePersona !== "Auto" ? config.audiencePersona : productBrief.audience || "Sahabat Kreator";
	const segments = [
		{
			timeRange: "0-3 detik",
			segmentName: "HOOK",
			visualDirection: `Tatap kamera mantap dengan gestur memegang ${pName} di depan lensa`,
			spokenDialogue: `Siapa di sini yang masih sering pusing pas ${pain}? Sini aku kasih tahu solusinya!`,
			overlayText: `Solusi Masalah Kamu 🛑`,
			strategyNote: "Pattern interrupt problem-agitation hook"
		},
		{
			timeRange: "3-8 detik",
			segmentName: "PROBLEM",
			visualDirection: `Perlihatkan gestur relate terhadap kerepotan saat ${pain}`,
			spokenDialogue: `Banyak yang belum sadar kalau cara lama itu makan banyak waktu dan tenaga.`,
			overlayText: `Stop Cara Lama ❌`,
			strategyNote: "Relatable context"
		},
		{
			timeRange: "8-20 detik",
			segmentName: "DEMO",
			visualDirection: `Close-up demonstrasi ${pName}, sorot fitur ${feature}`,
			spokenDialogue: `Kenalin ${pName}! Fitur ${feature}-nya ngebantu banget biar ${benefit} jadi cepat dan praktis.`,
			overlayText: `${feature} ✨`,
			strategyNote: "Visual proof"
		},
		{
			timeRange: "20-25 detik",
			segmentName: "VALUE",
			visualDirection: `Tunjukkan produk utuh dan hasil pemakaian yang memuaskan`,
			spokenDialogue: `Build quality-nya bagus dan awet dipakai harian. Beneran investasi kepraktisan buat kamu.`,
			overlayText: `Worth It Banget! 💯`,
			strategyNote: "Value reinforcement"
		},
		{
			timeRange: "25-30 detik",
			segmentName: "CTA",
			visualDirection: `Tunjuk santai ke sudut kiri bawah layar smartphone`,
			spokenDialogue: `Biar gak makin repot, langsung cek variasi di keranjang kiri bawah sekarang ya!`,
			overlayText: `Cek Keranjang Kiri Bawah ⬇️`,
			strategyNote: "Neutral multi-platform CTA"
		}
	];
	const voiceoverOnly = segments.map((s) => s.spokenDialogue).join(" ");
	const words = countWords(voiceoverOnly);
	return {
		id: `script-${Date.now()}-${index}`,
		title: `Konsep #${index}: ${angle}`,
		angle,
		persona,
		differentiator: `Pendekatan berbasis angle ${angle}`,
		hookType: config.hookType || "Auto",
		triggers: [
			"Pattern Interrupt",
			"Relatable Context",
			"Direct Solution",
			"Neutral CTA"
		],
		estimatedDurationSeconds: config.durationSeconds,
		spokenWordCount: words,
		durationStatus: evaluateDurationStatus(words, config.durationSeconds).status,
		segments,
		voiceoverOnly,
		qualityChecklist: [
			"Hook 3 detik pertama",
			"Fakta produk akurat",
			"Safe zone overlay",
			`Target kata ${targetWords.min}-${targetWords.max} kata`
		],
		warnings: []
	};
}
/**
* Direct Client-Side Product Extraction:
* Runs completely inside Android APK WebView / Browser directly with Google AI Studio.
*/
async function directExtractProduct(params) {
	const mode = params.inputMode || "mixed";
	const parts = [];
	if ((mode === "images" || mode === "mixed") && params.images && params.images.length > 0) {
		const selectedImages = params.images.slice(0, 3);
		for (const img of selectedImages) parts.push({ inlineData: {
			mimeType: img.mimeType,
			data: img.base64Data
		} });
	}
	let prompt = `Anda adalah sistem ekstraksi fakta produk untuk kreator TikTok & Affiliate e-commerce di Indonesia.
Tugas Anda: membaca informasi produk yang diberikan dan menyusun Product Brief terstruktur mendalam.

MODE EKSTRAKSI: ${mode.toUpperCase()}
`;
	if (mode === "images") prompt += `
PERHATIAN MODE FOTO (HANYA DARI GAMBAR PRODUK):
- Analisis gambar produk (${params.images?.length || 0} foto) secara menyeluruh.
- Ekstrak nama produk lengkap, merek/varian, kemasan, label, bentuk fisik, tombol, material, dan fitur nyata yang tampak.
- KARENA HANYA ADA 1 SUMBER (FOTO), FIELD 'conflicts' WAJIB BERUPA ARRAY KOSONG [].
`;
	else if (mode === "url") prompt += `
PERHATIAN MODE LINK / TAUTAN:
- Tautan produk: "${params.productUrl || ""}"
- Analisis produk berdasarkan tautan dan konteks nama/kategori e-commerce yang relevan.
- Uraikan fitur standar produk nyata tersebut, manfaat fungsional, persona audiens, dan pain points.
- KARENA HANYA ADA 1 SUMBER (LINK), FIELD 'conflicts' WAJIB BERUPA ARRAY KOSONG [].
`;
	else if (mode === "text") prompt += `
PERHATIAN MODE TEKS:
- Analisis deskripsi produk yang dimasukkan pengguna.
- KARENA HANYA ADA 1 SUMBER (TEKS), FIELD 'conflicts' WAJIB BERUPA ARRAY KOSONG [].
`;
	else prompt += `
PERHATIAN MODE CAMPURAN:
- Gabungkan informasi dari foto, link, dan teks. Catat perbedaan data di 'conflicts' jika ada.
`;
	prompt += `
ATURAN EKSTRAKSI FAKTA:
1. BACA SUMBER SECARA MENDALAM:
   - Identifikasi nama produk nyata, kategori spesifik, fungsi utama.
   - Field "features": WAJIB berisi minimal 4-6 butir fitur spesifik, material, ukuran, atau keunggulan fungsional.
   - Field "benefits": WAJIB berisi minimal 4-6 butir manfaat langsung bagi pengguna.
   - Field "painPoints": WAJIB berisi minimal 4-6 masalah/keluhan yang tuntas diselesaikan oleh produk.
   - Field "description": Ringkasan komprehensif informatif (3-5 kalimat).
2. FAKTUAL & ETIS:
   - Jangan karang angka harga jika tidak tertulis.
   - Jangan klaim medis/kesembuhan atau BPOM kecuali terbukti pada kemasan.

DATA SUMBER:
`;
	if (params.textDescription) prompt += `\n[Deskripsi Teks]:\n${params.textDescription}\n`;
	if (params.productUrl) prompt += `\n[Tautan Produk]: ${params.productUrl}\n`;
	if (params.images && params.images.length > 0) prompt += `\n[Foto Produk]: ${params.images.length} foto dilampirkan.\n`;
	prompt += `
FORMAT OUTPUT JSON (Kembalikan JSON murni tanpa markdown):
{
  "name": "Nama produk lengkap & jelas",
  "category": "Kategori produk e-commerce spesifik",
  "description": "Ringkasan deskripsi mendalam tentang produk, keunggulan, dan kegunaannya",
  "features": ["Fitur nyata 1 (spesifikasi fisik/material/ukuran)", "Fitur nyata 2", "Fitur nyata 3", "Fitur nyata 4", "Fitur nyata 5"],
  "benefits": ["Manfaat nyata 1 yang dirasakan pembeli", "Manfaat nyata 2", "Manfaat nyata 3", "Manfaat nyata 4"],
  "audience": "Persona target pembeli spesifik yang paling membutuhkan",
  "painPoints": ["Masalah nyata 1 yang dihadapi pembeli", "Masalah nyata 2", "Masalah nyata 3", "Masalah nyata 4"],
  "currentPrice": "Rp... (atau kosongkan jika tidak eksplisit)",
  "referencePrice": "Rp... (harga normal jika ada)",
  "promoDetails": "diskon/voucher (jika eksplisit)",
  "stockOrDeadline": "stok/tenggat waktu (jika eksplisit)",
  "socialProof": "ulasan atau bukti sosial nyata jika ada",
  "creatorExperience": "pengalaman pemakaian wajar",
  "restrictions": ["klaim overclaim atau batasan yang harus dihindari"],
  "conflicts": [],
  "notes": "catatan singkat proses ekstraksi fakta"
}`;
	parts.push({ text: prompt });
	const rawText = await callGeminiDirect({
		contents: parts,
		apiKey: params.apiKey,
		temperature: .2,
		responseMimeType: "application/json",
		maxOutputTokens: 1500
	});
	let parsed;
	try {
		parsed = JSON.parse(cleanJsonString(rawText));
	} catch {
		const match = rawText.match(/\{[\s\S]*\}/);
		if (match) try {
			parsed = JSON.parse(match[0]);
		} catch {}
		if (!parsed) parsed = {};
	}
	function toStringArray(arr) {
		if (!Array.isArray(arr)) return [];
		return arr.map((item) => {
			if (typeof item === "string") return item.trim();
			if (typeof item === "object" && item !== null) {
				if (item.field && item.detail) return `${item.field}: ${item.detail}`;
				return item.detail || item.description || item.message || JSON.stringify(item);
			}
			return String(item).trim();
		}).filter(Boolean);
	}
	let finalName = parsed.name && parsed.name !== "Produk Tanpa Nama" ? parsed.name : "";
	if (!finalName) {
		if (mode === "text" && params.textDescription) finalName = params.textDescription.split("\n")[0]?.slice(0, 80) || "Produk Pilihan Affiliate";
		else finalName = "Produk Pilihan Affiliate";
	}
	const rawFeatures = toStringArray(parsed.features);
	const rawBenefits = toStringArray(parsed.benefits);
	const rawPainPoints = toStringArray(parsed.painPoints);
	const cleanCategory = parsed.category || "Produk Affiliate";
	const cleanDescription = parsed.description || `${finalName} merupakan produk ${cleanCategory} dengan desain fungsional dan material berkualitas untuk menunjang aktivitas pengguna secara praktis.`;
	const finalFeatures = rawFeatures.length >= 3 ? rawFeatures : [
		`Desain ergonomis & material awet untuk pemakaian harian ${finalName}`,
		`Spesifikasi fungsional presisi yang langsung siap digunakan`,
		`Bentuk ringkas & portabel, hemat ruang penyimpanan`,
		`Fitur unggulan teruji untuk efisiensi aktivitas harian`,
		...rawFeatures
	].slice(0, 5);
	const finalBenefits = rawBenefits.length >= 3 ? rawBenefits : [
		`Mempermudah aktivitas harian tanpa membuang waktu dan tenaga`,
		`Memberikan solusi praktis dengan hasil pemakaian maksimal`,
		`Nyaman dan aman digunakan secara berulang untuk jangka panjang`,
		`Meningkatkan efisiensi kerja atau rutinitas pengguna`,
		...rawBenefits
	].slice(0, 5);
	const finalPainPoints = rawPainPoints.length >= 3 ? rawPainPoints : [
		`Sering repot atau lelah dengan peralatan konvensional`,
		`Kehabisan waktu karena cara lama yang memakan banyak tenaga`,
		`Khawatir barang cepat rusak atau tidak awet dipakai`,
		`Mencari produk berkualitas yang solutif dengan harga bersahabat`,
		...rawPainPoints
	].slice(0, 5);
	const finalAudience = parsed.audience && parsed.audience !== "Umum" ? parsed.audience : `Konsumen dan kreator cerdas yang membutuhkan solusi praktis dari ${finalName}`;
	const sources = [{
		field: "name",
		source: mode === "images" ? "image" : mode === "url" ? "url" : "user",
		confidence: "high"
	}, {
		field: "features",
		source: mode === "images" ? "image" : mode === "url" ? "url" : "user",
		confidence: "high"
	}];
	const conflicts = mode === "mixed" ? toStringArray(parsed.conflicts) : [];
	return {
		productBrief: {
			name: finalName,
			category: cleanCategory,
			description: cleanDescription,
			features: finalFeatures,
			benefits: finalBenefits,
			audience: finalAudience,
			painPoints: finalPainPoints,
			currentPrice: parsed.currentPrice || void 0,
			referencePrice: parsed.referencePrice || void 0,
			promoDetails: parsed.promoDetails || void 0,
			stockOrDeadline: parsed.stockOrDeadline || void 0,
			socialProof: parsed.socialProof || void 0,
			creatorExperience: parsed.creatorExperience || void 0,
			activeSourceMode: mode,
			restrictions: toStringArray(parsed.restrictions).length > 0 ? toStringArray(parsed.restrictions) : ["Hindari klaim medis tanpa izin", "Hindari menjanjikan hasil instan tanpa bukti"],
			sources,
			conflicts
		},
		conflictsFound: conflicts,
		warning: void 0
	};
}
/**
* Direct Client-Side Script Generation with Live Real-Time Token Streaming (TTFT 1-2s).
* Enables word-by-word streaming on Native Android APK (Capacitor) directly against Google AI Studio API.
*/
async function directGenerateScriptsStream(params) {
	const { productBrief, config, apiKey, onChunk, onScriptReady } = params;
	const targetWordsMap = {
		15: {
			min: 30,
			max: 40
		},
		20: {
			min: 45,
			max: 55
		},
		30: {
			min: 60,
			max: 75
		},
		60: {
			min: 125,
			max: 150
		},
		90: {
			min: 200,
			max: 225
		},
		120: {
			min: 275,
			max: 320
		}
	};
	const targetWords = targetWordsMap[config.durationSeconds] || targetWordsMap[30];
	const totalCount = Math.max(1, Math.min(30, config.scriptCount));
	const batchCounts = [];
	let remaining = totalCount;
	while (remaining > 0) {
		if (remaining <= 3) {
			batchCounts.push(remaining);
			break;
		}
		if (remaining === 4) {
			batchCounts.push(2, 2);
			break;
		}
		const size = 3;
		batchCounts.push(size);
		remaining -= size;
	}
	let currentStart = 1;
	const batchTasks = [];
	const sourceAngles = config.selectedAngles && config.selectedAngles.length > 0 ? config.selectedAngles : DEFAULT_20_ANGLES;
	for (let b = 0; b < batchCounts.length; b++) {
		const bCount = batchCounts[b];
		const assignedAngles = [];
		for (let i = 0; i < bCount; i++) {
			const aIdx = (currentStart - 1 + i) % sourceAngles.length;
			assignedAngles.push(sourceAngles[aIdx]);
		}
		batchTasks.push({
			batchNumber: b + 1,
			startIndex: currentStart,
			batchCount: bCount,
			assignedAngles
		});
		currentStart += bCount;
	}
	const processBatchTask = async (task, taskIdx) => {
		const endIndex = task.startIndex + task.batchCount - 1;
		const userPrompt = `TUGAS BATCH #${task.batchNumber}: Buat TEPAT ${task.batchCount} KONSEP SKRIP AFFILIATE SIAP REKAM.
Nomor konsep: Konsep #${task.startIndex} sampai #${endIndex}.

DATA PRODUK:
- Nama Produk: ${productBrief.name}
- Kategori: ${productBrief.category}
- Ringkasan: ${productBrief.description}
- Fitur: ${productBrief.features.join(", ")}
- Manfaat: ${productBrief.benefits.join(", ")}
- Target Persona: ${productBrief.audience}
- Pain Points: ${productBrief.painPoints.join(", ")}
- Harga: ${productBrief.currentPrice || "Tidak disebutkan"}

KONFIGURASI:
- Durasi: ${config.durationSeconds} detik (${targetWords.min}-${targetWords.max} kata lisan)
- Gaya: ${config.style}
- Pronoun: ${config.pronouns}
- Instruksi Tambahan: ${config.extraInstructions || "-"}

PENUGASAN ANGLE WAJIB:
${task.assignedAngles.map((ang, i) => `* Konsep #${task.startIndex + i}: Angle "${ang}"`).join("\n")}

FORMAT OUTPUT JSON (Array murni ${task.batchCount} objek):
[
  {
    "id": "skrip-${task.startIndex}",
    "title": "Konsep #${task.startIndex}: ${task.assignedAngles[0]}",
    "angle": "${task.assignedAngles[0]}",
    "persona": "${config.audiencePersona}",
    "differentiator": "Pembeda konsep",
    "hookType": "${config.hookType}",
    "triggers": ["Pattern Interrupt", "Relatable Problem", "Direct Solution"],
    "estimatedDurationSeconds": ${config.durationSeconds},
    "spokenWordCount": ${Math.round((targetWords.min + targetWords.max) / 2)},
    "durationStatus": "ok",
    "segments": [
      {
        "timeRange": "0-3 detik",
        "segmentName": "HOOK",
        "visualDirection": "Arahan visual kamera HP",
        "spokenDialogue": "Dialog pembuka memikat",
        "overlayText": "Teks safe zone",
        "strategyNote": "Catatan psikologi hook"
      },
      {
        "timeRange": "3-8 detik",
        "segmentName": "PROBLEM",
        "visualDirection": "Konteks masalah",
        "spokenDialogue": "Dialog relate masalah",
        "overlayText": "Teks masalah",
        "strategyNote": "Relatability"
      },
      {
        "timeRange": "8-20 detik",
        "segmentName": "DEMO",
        "visualDirection": "Demonstrasi produk",
        "spokenDialogue": "Penjelasan solusi natural",
        "overlayText": "Fitur produk",
        "strategyNote": "Bukti visual"
      },
      {
        "timeRange": "20-25 detik",
        "segmentName": "VALUE",
        "visualDirection": "Tunjukkan produk utuh",
        "spokenDialogue": "Penegasan nilai kegunaan",
        "overlayText": "Nilai guna",
        "strategyNote": "Value"
      },
      {
        "timeRange": "25-30 detik",
        "segmentName": "CTA",
        "visualDirection": "Tunjuk ke sudut kiri bawah",
        "spokenDialogue": "Langsung cek detailnya di keranjang kiri bawah sekarang ya!",
        "overlayText": "Cek Keranjang Kiri Bawah ⬇️",
        "strategyNote": "Neutral CTA"
      }
    ],
    "voiceoverOnly": "Gabungan dialog lisan",
    "qualityChecklist": ["Hook 3 detik pertama", "Safe zone overlay", "Durasi sesuai target"],
    "warnings": []
  }
]`;
		let accumulatedText = "";
		const emittedIndices = /* @__PURE__ */ new Set();
		const parseAndEmitScripts = (text) => {
			let rawScripts = [];
			try {
				rawScripts = JSON.parse(cleanJsonString(text));
			} catch {
				try {
					const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
					if (match) rawScripts = JSON.parse(match[0]);
				} catch {}
			}
			if (!Array.isArray(rawScripts) || rawScripts.length === 0) {
				const objects = [];
				let depth = 0;
				let inString = false;
				let escapeNext = false;
				let startIndex = -1;
				for (let i = 0; i < text.length; i++) {
					const char = text[i];
					if (escapeNext) {
						escapeNext = false;
						continue;
					}
					if (char === "\\" && inString) {
						escapeNext = true;
						continue;
					}
					if (char === "\"") {
						inString = !inString;
						continue;
					}
					if (!inString) {
						if (char === "{") {
							if (depth === 0) startIndex = i;
							depth++;
						} else if (char === "}") {
							depth--;
							if (depth === 0 && startIndex !== -1) {
								const candidate = text.slice(startIndex, i + 1);
								try {
									const parsed = JSON.parse(candidate);
									if (parsed && typeof parsed === "object") objects.push(parsed);
								} catch {}
								startIndex = -1;
							}
						}
					}
				}
				if (objects.length > 0) rawScripts = objects;
			}
			if (!Array.isArray(rawScripts)) return [];
			return rawScripts.map((s, idx) => {
				const itemIdx = task.startIndex + idx;
				const assignedAngle = task.assignedAngles[idx] || s.angle || "Problem-Solution";
				const rawSegments = Array.isArray(s.segments) ? s.segments : [];
				const segments = rawSegments.map((seg, sIdx) => ({
					timeRange: seg.timeRange || `${sIdx * 5}-${(sIdx + 1) * 5}s`,
					segmentName: seg.segmentName || (sIdx === 0 ? "HOOK" : sIdx === rawSegments.length - 1 ? "CTA" : "BODY"),
					visualDirection: sanitizeCrossPlatformText(seg.visualDirection) || "Tunjukkan produk ke kamera",
					spokenDialogue: sanitizeCrossPlatformText(seg.spokenDialogue) || "",
					overlayText: sanitizeCrossPlatformText(seg.overlayText) || "",
					strategyNote: seg.strategyNote || ""
				}));
				const compiledVoiceover = sanitizeCrossPlatformText(s.voiceoverOnly || segments.map((seg) => seg.spokenDialogue).filter(Boolean).join(" "));
				const actualWords = countWords(compiledVoiceover);
				const evalStatus = evaluateDurationStatus(actualWords, config.durationSeconds);
				return {
					id: s.id || `script-${Date.now()}-${itemIdx}`,
					title: sanitizeCrossPlatformText(s.title || `Konsep #${itemIdx}: ${assignedAngle}`),
					angle: assignedAngle,
					persona: s.persona || config.audiencePersona,
					differentiator: s.differentiator || `Pendekatan unik berbasis angle ${assignedAngle}`,
					hookType: s.hookType || config.hookType,
					triggers: Array.isArray(s.triggers) && s.triggers.length > 0 ? s.triggers : [
						"Pattern Interrupt",
						"Relatable Context",
						"Direct CTA"
					],
					estimatedDurationSeconds: config.durationSeconds,
					spokenWordCount: actualWords,
					durationStatus: evalStatus.status,
					segments,
					voiceoverOnly: compiledVoiceover,
					qualityChecklist: [
						"Hook 3 detik pertama",
						"Fakta produk akurat",
						"Safe zone overlay",
						`Target kata ${targetWords.min}-${targetWords.max} kata`
					],
					warnings: evalStatus.status !== "ok" ? [evalStatus.message] : []
				};
			});
		};
		try {
			accumulatedText = await callGeminiDirectStream({
				contents: userPrompt,
				systemInstruction: STATIC_AFFILIATE_SYSTEM_PROMPT,
				apiKey,
				temperature: .8,
				responseMimeType: "application/json",
				maxOutputTokens: 8192,
				onChunk: (chunk) => {
					accumulatedText += chunk;
					if (taskIdx === 0 && onChunk) onChunk(chunk);
					if (onScriptReady && chunk.includes("}") && accumulatedText.length > 80) parseAndEmitScripts(accumulatedText).forEach((script, idx) => {
						if (!emittedIndices.has(idx) && script.segments && script.segments.length >= 3) {
							emittedIndices.add(idx);
							onScriptReady(script);
						}
					});
				}
			});
			const batchScripts = parseAndEmitScripts(accumulatedText);
			const outputList = [];
			if (batchScripts.length === 0) task.assignedAngles.forEach((ang, idx) => {
				const fb = buildDirectFallbackScript(productBrief, config, ang, task.startIndex + idx, targetWords);
				if (onScriptReady && !emittedIndices.has(idx)) {
					emittedIndices.add(idx);
					onScriptReady(fb);
				}
				outputList.push(fb);
			});
			else batchScripts.forEach((script, idx) => {
				if (onScriptReady && !emittedIndices.has(idx)) {
					emittedIndices.add(idx);
					onScriptReady(script);
				}
				outputList.push(script);
			});
			return outputList;
		} catch (batchErr) {
			const msg = batchErr?.message || "";
			if (batchErr?.isQuotaExhausted || batchErr?.isMissingKey || msg.includes("TOKEN_QUOTA_EXHAUSTED") || msg.includes("429") || msg.includes("MISSING_MOBILE_API_KEY")) throw batchErr;
			console.warn(`[DirectGemini Stream Batch Error] Using fallback synthesis:`, msg);
			const fallbackList = [];
			task.assignedAngles.forEach((ang, idx) => {
				const fb = buildDirectFallbackScript(productBrief, config, ang, task.startIndex + idx, targetWords);
				if (onScriptReady && !emittedIndices.has(idx)) {
					emittedIndices.add(idx);
					onScriptReady(fb);
				}
				fallbackList.push(fb);
			});
			return fallbackList;
		}
	};
	let allScripts = [];
	if (batchTasks.length === 1) allScripts = await processBatchTask(batchTasks[0], 0);
	else {
		const results = await runWithConcurrency(batchTasks, Math.min(2, batchTasks.length), async (task, taskIdx) => processBatchTask(task, taskIdx));
		for (const r of results) if (Array.isArray(r)) allScripts.push(...r);
	}
	return {
		productBrief,
		scripts: allScripts.slice(0, totalCount)
	};
}
/**
* Direct Client-Side Script Refinement:
* Refines a single script directly with Google AI Studio.
*/
async function directRefineScript(params) {
	const { script, productBrief, config, refinementType, customInstruction, apiKey } = params;
	let refinementPrompt = "";
	switch (refinementType) {
		case "hook_stronger":
			refinementPrompt = "Buat Hook 3 detik pertama jauh lebih menghentak, scroll-stopping, dan memicu rasa penasaran tanpa overclaim.";
			break;
		case "more_natural":
			refinementPrompt = "Ubah gaya bahasa dialog agar lebih santai, mengalir seperti obrolan teman akrab, hapus kesan kaku atau bahasa brosur.";
			break;
		case "softer_selling":
			refinementPrompt = "Ubah pendekatan menjadi soft-selling, tonjolkan cerita dan nilai kegunaan sehari-hari, kurangi desakan jualan langsung.";
			break;
		case "more_concise":
			refinementPrompt = "Persingkat dialog agar lebih padat, hapus kata-kata mubazir, pastikan durasi tepat sasaran.";
			break;
		case "clearer_cta":
			refinementPrompt = "Buat Call to Action (CTA) di bagian akhir lebih jelas dan netral (gunakan \"keranjang kiri bawah\" atau \"keranjang bawah video ini\", DILARANG menyebut \"keranjang kuning\" atau nama platform).";
			break;
		case "change_angle":
			refinementPrompt = "Ganti angle dan konsep penyampaian menjadi sudut pandang berbeda yang belum dipakai sebelumnya.";
			break;
		default: refinementPrompt = customInstruction || "Sempurnakan skrip ini agar lebih engaging dan siap rekam.";
	}
	const userPrompt = `Anda adalah Master Copywriter TikTok Affiliate. Sempurnakan skrip berikut:
Instruksi Penyempurnaan: "${refinementPrompt}"

SKRIP SAAT INI:
${JSON.stringify(script, null, 2)}

DATA PRODUK:
- Nama: ${productBrief.name}
- Fitur: ${productBrief.features.join(", ")}
- Manfaat: ${productBrief.benefits.join(", ")}

ATURAN:
1. Tetap patuhi fakta produk.
2. DILARANG sebut nama platform atau kata "keranjang kuning". Wajib "keranjang kiri bawah".
3. Kembalikan SATU objek JSON skrip murni dengan format yang sama.`;
	try {
		const rawText = await callGeminiDirect({
			contents: userPrompt,
			apiKey,
			temperature: .7,
			responseMimeType: "application/json"
		});
		let parsed;
		try {
			parsed = JSON.parse(cleanJsonString(rawText));
		} catch {
			const match = rawText.match(/\{[\s\S]*\}/);
			if (match) parsed = JSON.parse(match[0]);
		}
		if (parsed && Array.isArray(parsed.segments)) {
			const segments = parsed.segments.map((seg) => ({
				...seg,
				visualDirection: sanitizeCrossPlatformText(seg.visualDirection),
				spokenDialogue: sanitizeCrossPlatformText(seg.spokenDialogue),
				overlayText: sanitizeCrossPlatformText(seg.overlayText)
			}));
			const voiceoverOnly = sanitizeCrossPlatformText(parsed.voiceoverOnly || segments.map((s) => s.spokenDialogue).join(" "));
			const actualWords = countWords(voiceoverOnly);
			const evalStatus = evaluateDurationStatus(actualWords, config.durationSeconds);
			return { script: {
				...script,
				...parsed,
				id: script.id,
				title: sanitizeCrossPlatformText(parsed.title || script.title),
				segments,
				voiceoverOnly,
				spokenWordCount: actualWords,
				durationStatus: evalStatus.status
			} };
		}
	} catch (err) {
		const msg = err?.message || "";
		if (err?.isQuotaExhausted || err?.isMissingKey || msg.includes("TOKEN_QUOTA_EXHAUSTED") || msg.includes("429")) throw err;
		console.warn("[DirectRefine] Refinement failed, returning original script:", msg);
	}
	return { script };
}
// src/components/ScriptCard.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
function getConceptDisplayTitle(index, script) {
	let angle = (script.angle || "").trim();
	angle = angle.replace(/^\d+[\.\)\-]\s*/, "").trim();
	if (!angle) {
		if (script.title && !script.title.toLowerCase().startsWith("konsep #")) angle = script.title.trim();
		else {
			const fallbackAngles = [
				"Problem-Solution (Solusi Masalah)",
				"Personal Story (Kisah Nyata)",
				"Bold Claim (Klaim Menghentak)",
				"Myth-Busting (Bongkar Mitos)",
				"Outcome-First (Hasil di Awal)",
				"Common Mistakes (Hindari Salah)",
				"Price/Value (Bandingkan Nilai)"
			];
			angle = fallbackAngles[index % fallbackAngles.length];
		}
	}
	return `Konsep #${index + 1}: ${angle}`;
}
function cleanDialogueText(text) {
	let cleaned = text.trim();
	if (cleaned.startsWith("\"") && cleaned.endsWith("\"") || cleaned.startsWith("“") && cleaned.endsWith("”")) cleaned = cleaned.slice(1, -1).trim();
	return cleaned;
}
var ScriptCardComponent = ({ script, index, totalScripts, showVisualDetails, onToggleVisualDetails, isVoiceoverOnly, onToggleVoiceoverOnly, onCopyText, onRegenerate, onRefine, isRefining, onOpenPrompter, onOpenFloatingPrompter, onUpdateScript }) => {
	const [showCardActions, setShowCardActions] = (0, import_react.useState)(false);
	const [showConceptInfo, setShowConceptInfo] = (0, import_react.useState)(false);
	const [internalShowVisual, setInternalShowVisual] = (0, import_react.useState)(false);
	const [showRefineMenu, setShowRefineMenu] = (0, import_react.useState)(false);
	const [selectedRefinement, setSelectedRefinement] = (0, import_react.useState)(null);
	const [customRefineText, setCustomRefineText] = (0, import_react.useState)("");
	const [isEditing, setIsEditing] = (0, import_react.useState)(false);
	const [editTab, setEditTab] = (0, import_react.useState)("voiceover");
	const [editTitle, setEditTitle] = (0, import_react.useState)(script.title);
	const [editPersona, setEditPersona] = (0, import_react.useState)(script.persona || "");
	const [editVoiceover, setEditVoiceover] = (0, import_react.useState)("");
	const [editSegments, setEditSegments] = (0, import_react.useState)([]);
	const textareaRef = import_react.useRef(null);
	(0, import_react.useEffect)(() => {
		setEditTitle(script.title);
		setEditPersona(script.persona || "");
		const initialVo = script.voiceoverOnly && script.voiceoverOnly.trim() || (script.segments && script.segments.length > 0 ? script.segments.map((s) => cleanDialogueText(s.spokenDialogue)).filter(Boolean).join("\n\n") : "");
		setEditVoiceover(initialVo);
		setEditSegments(script.segments && script.segments.length > 0 ? script.segments.map((s) => ({ ...s })) : [{
			timeRange: "0-3 detik",
			segmentName: "HOOK",
			visualDirection: "Tatap kamera santai memegang produk",
			spokenDialogue: initialVo,
			overlayText: "Solusi Praktis",
			strategyNote: "Scroll-stopping opening"
		}]);
	}, [script, isEditing]);
	(0, import_react.useEffect)(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.max(160, textareaRef.current.scrollHeight)}px`;
		}
	}, [
		isEditing,
		editVoiceover,
		editTab
	]);
	const currentShowVisual = showVisualDetails !== void 0 ? showVisualDetails : isVoiceoverOnly !== void 0 ? !isVoiceoverOnly : internalShowVisual;
	const handleToggleVisual = () => {
		if (onToggleVisualDetails) onToggleVisualDetails();
		else if (onToggleVoiceoverOnly) onToggleVoiceoverOnly();
		else setInternalShowVisual(!internalShowVisual);
	};
	const currentEditWords = (0, import_react.useMemo)(() => {
		if (editTab === "voiceover") return countWords(editVoiceover);
		return countWords(editSegments.map((s) => s.spokenDialogue).filter(Boolean).join(" "));
	}, [
		editTab,
		editVoiceover,
		editSegments
	]);
	const liveDurationStatus = (0, import_react.useMemo)(() => {
		const durSec = script.estimatedDurationSeconds || 30;
		return evaluateDurationStatus(currentEditWords, durSec);
	}, [currentEditWords, script.estimatedDurationSeconds]);
	const scriptParagraphs = (0, import_react.useMemo)(() => {
		if (script.voiceoverOnly && script.voiceoverOnly.trim()) return script.voiceoverOnly.split(/\n\s*\n+/).map((p) => cleanDialogueText(p)).filter(Boolean);
		if (script.segments && script.segments.length > 0) {
			const segDialogues = script.segments.map((seg) => seg.spokenDialogue ? cleanDialogueText(seg.spokenDialogue) : "").filter(Boolean);
			if (segDialogues.length > 0) return segDialogues;
		}
		return [];
	}, [script]);
	const handleCopyFull = () => {
		onCopyText(formatScriptAsText(script, index), getConceptDisplayTitle(index, script));
	};
	const handleCopyVoiceover = () => {
		onCopyText(scriptParagraphs.join("\n\n"), `Narasi ${getConceptDisplayTitle(index, script)}`);
	};
	const handleApplyRefine = () => {
		if (!selectedRefinement && !customRefineText.trim()) return;
		onRefine(script, selectedRefinement || "custom", customRefineText.trim() || void 0);
		setSelectedRefinement(null);
		setCustomRefineText("");
	};
	const canApplyRefine = Boolean(selectedRefinement || customRefineText.trim());
	const handleSaveEdit = () => {
		let finalVoiceover = "";
		let finalSegments = [];
		if (editTab === "voiceover") {
			finalVoiceover = sanitizeCrossPlatformText(editVoiceover.trim());
			const paragraphs = finalVoiceover.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
			if (paragraphs.length > 0) finalSegments = paragraphs.map((para, pIdx) => {
				const prevSeg = editSegments[pIdx] || editSegments[editSegments.length - 1];
				return {
					timeRange: prevSeg?.timeRange || `${pIdx * 8}-${(pIdx + 1) * 8}s`,
					segmentName: prevSeg?.segmentName || (pIdx === 0 ? "HOOK" : pIdx === paragraphs.length - 1 ? "CTA" : "BODY"),
					visualDirection: prevSeg?.visualDirection || "Tatap kamera santai memegang produk",
					spokenDialogue: para,
					overlayText: prevSeg?.overlayText || "",
					strategyNote: prevSeg?.strategyNote || "Dialog hasil edit manual"
				};
			});
			else finalSegments = [{
				timeRange: `0-${script.estimatedDurationSeconds || 30}s`,
				segmentName: "DIALOG",
				visualDirection: "Tampilkan produk ke kamera smartphone",
				spokenDialogue: finalVoiceover,
				overlayText: "",
				strategyNote: "Dialog hasil edit manual"
			}];
		} else {
			finalSegments = editSegments.map((s) => ({
				...s,
				visualDirection: sanitizeCrossPlatformText(s.visualDirection),
				spokenDialogue: sanitizeCrossPlatformText(s.spokenDialogue),
				overlayText: sanitizeCrossPlatformText(s.overlayText),
				strategyNote: s.strategyNote || ""
			}));
			finalVoiceover = finalSegments.map((s) => s.spokenDialogue).filter(Boolean).join("\n\n");
		}
		const words = countWords(finalVoiceover);
		const evalStatus = evaluateDurationStatus(words, script.estimatedDurationSeconds || 30);
		const updatedScript = {
			...script,
			title: editTitle.trim() || script.title,
			persona: editPersona.trim() || script.persona,
			segments: finalSegments,
			voiceoverOnly: finalVoiceover,
			spokenWordCount: words,
			durationStatus: evalStatus.status
		};
		if (onUpdateScript) onUpdateScript(updatedScript);
		setIsEditing(false);
	};
	const handleCancelEdit = () => {
		setEditTitle(script.title);
		setEditPersona(script.persona || "");
		setEditVoiceover(script.voiceoverOnly && script.voiceoverOnly.trim() || (script.segments && script.segments.length > 0 ? script.segments.map((s) => cleanDialogueText(s.spokenDialogue)).filter(Boolean).join("\n\n") : ""));
		setEditSegments(script.segments?.map((s) => ({ ...s })) || []);
		setIsEditing(false);
	};
	const handleSanitizeEditCta = () => {
		if (editTab === "voiceover") setEditVoiceover((prev) => sanitizeCrossPlatformText(prev));
		else setEditSegments((prev) => prev.map((s) => ({
			...s,
			spokenDialogue: sanitizeCrossPlatformText(s.spokenDialogue),
			overlayText: sanitizeCrossPlatformText(s.overlayText)
		})));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `bg-white dark:bg-[#1C1C1E] rounded-2xl border transition-all overflow-hidden ${isEditing ? "border-blue-600 shadow-sm ring-1 ring-blue-600/30" : "border-slate-200 dark:border-zinc-800 shadow-xs"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3.5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E] flex items-center justify-between gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2 min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-8 px-3 rounded-lg text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center shrink-0 shadow-2xs tracking-tight",
						children: getConceptDisplayTitle(index, script)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowCardActions(!showCardActions),
					className: `inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer border shrink-0 ${showCardActions ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-white dark:bg-[#1C1C1E] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95"}`,
					title: showCardActions ? "Tutup menu opsi konsep ini" : "Buka menu opsi konsep ini",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "w-3.5 h-3.5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: showCardActions ? "Tutup Menu" : "Menu Skrip" }),
						showCardActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-3 h-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3 h-3" })
					]
				})]
			}),
			showCardActions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3.5 bg-white dark:bg-[#1C1C1E] border-b border-slate-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setShowConceptInfo(!showConceptInfo),
								className: `inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${showConceptInfo ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-white dark:bg-[#1C1C1E] text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: `w-3.5 h-3.5 ${showConceptInfo ? "text-white" : "text-blue-600"}` }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Info Konsep" }),
									showConceptInfo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-3 h-3 text-white" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3 h-3 text-slate-400" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleCopyVoiceover,
								className: "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-[#1C1C1E] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 transition-all cursor-pointer border border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95",
								title: "Salin teks dialog narasi suara",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5 text-blue-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Salin Narasi" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleCopyFull,
								className: "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-[#1C1C1E] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 transition-all cursor-pointer border border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95",
								title: "Salin skrip visual + narasi lengkap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "w-3.5 h-3.5 text-indigo-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Salin Skrip" })]
							}),
							onOpenPrompter && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onOpenPrompter(script, index),
								className: "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer active:scale-95",
								title: `Buka Layar Teleprompter khusus ${getConceptDisplayTitle(index, script)}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "w-3.5 h-3.5 text-white" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Teleprompter" })]
							}),
							onOpenFloatingPrompter && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onOpenFloatingPrompter(script, index),
								className: "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition-all cursor-pointer active:scale-95",
								title: `Buka Mode Melayang khusus ${getConceptDisplayTitle(index, script)}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PictureInPicture2, { className: "w-3.5 h-3.5 text-amber-600 dark:text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prompter Melayang" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleToggleVisual,
								className: `inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${currentShowVisual ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" : "bg-white dark:bg-[#1C1C1E] text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: `w-3.5 h-3.5 ${currentShowVisual ? "text-white" : "text-emerald-600"}` }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentShowVisual ? "Tutup Visual" : "Arahan Visual" }),
									currentShowVisual ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-3 h-3 text-white" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3 h-3 text-slate-400" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setShowRefineMenu(!showRefineMenu),
								className: `inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${showRefineMenu ? "bg-purple-600 text-white border-purple-600 shadow-xs" : "bg-white dark:bg-[#1C1C1E] text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: `w-3.5 h-3.5 ${showRefineMenu ? "text-white" : "text-purple-600"}` }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sempurnakan AI" }),
									showRefineMenu ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-3 h-3 text-white" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3 h-3 text-slate-400" })
								]
							})
						]
					}),
					showConceptInfo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 space-y-2.5 animate-in fade-in duration-150 text-xs text-slate-700 dark:text-zinc-300 shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-slate-900 dark:text-white text-sm",
									children: script.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "w-3 h-3 text-purple-600 dark:text-purple-400" }), script.angle]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
									children: [
										script.spokenWordCount,
										" kata (",
										script.durationStatus === "ok" ? "Optimal" : script.durationStatus,
										")"
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-400",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-slate-900 dark:text-zinc-200",
										children: "Target Persona:"
									}),
									" ",
									script.persona
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-slate-900 dark:text-zinc-200",
										children: "Tipe Hook:"
									}),
									" ",
									script.hookType
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-slate-900 dark:text-zinc-200",
										children: "Durasi:"
									}),
									" ",
									script.estimatedDurationSeconds,
									" detik"
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-slate-900 dark:text-zinc-200",
										children: "Pembeda:"
									}),
									" ",
									script.differentiator
								] })
							]
						})]
					}),
					showRefineMenu && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150 shadow-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold text-slate-900 dark:text-white",
									children: "Penyesuaian AI Cepat:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onRegenerate(script),
									disabled: isRefining,
									className: "text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-3 h-3" }), " Buat Ulang"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: [
									{
										id: "hook_stronger",
										label: "Hook Lebih Kuat",
										icon: Clock
									},
									{
										id: "more_natural",
										label: "Lebih Natural",
										icon: Feather
									},
									{
										id: "softer_selling",
										label: "Lebih Soft Selling",
										icon: Sparkles
									},
									{
										id: "more_concise",
										label: "Lebih Ringkas",
										icon: Scissors
									},
									{
										id: "clearer_cta",
										label: "CTA Lebih Jelas",
										icon: Target
									},
									{
										id: "change_angle",
										label: "Ganti Angle",
										icon: RefreshCw
									}
								].map((opt) => {
									const isSelected = selectedRefinement === opt.id;
									const IconComp = opt.icon;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: isRefining,
										onClick: () => setSelectedRefinement(isSelected ? null : opt.id),
										className: `inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${isSelected ? "bg-purple-600 text-white border-purple-600 shadow-xs" : "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComp, { className: "w-3 h-3" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: opt.label }),
											isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3 h-3 ml-0.5" })
										]
									}, opt.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: customRefineText,
									onChange: (e) => setCustomRefineText(e.target.value),
									placeholder: "Instruksi khusus (misal: tekankan harga diskon)...",
									disabled: isRefining,
									className: "flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: isRefining || !canApplyRefine,
									onClick: handleApplyRefine,
									className: `h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${isRefining || !canApplyRefine ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer active:scale-95"}`,
									children: isRefining ? "Menerapkan..." : "Terapkan"
								})]
							})
						]
					})
				]
			}),
			isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 sm:p-6 space-y-4 bg-white dark:bg-[#1C1C1E]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-bold shadow-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mode Edit" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-blue-600 dark:text-blue-400",
								children: [
									currentEditWords,
									" kata • ",
									liveDurationStatus.message
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleSanitizeEditCta,
								className: "text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer ml-1",
								title: "Otomatis ganti sebutan keranjang kuning menjadi netral multi-platform",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Netralkan CTA" })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						ref: textareaRef,
						value: editVoiceover,
						onChange: (e) => setEditVoiceover(e.target.value),
						placeholder: "Tuliskan dialog narasi yang diucapkan langsung oleh kreator ke kamera...",
						className: "w-full text-zinc-800 dark:text-zinc-200 text-base sm:text-[17px] leading-relaxed sm:leading-loose font-normal bg-transparent border-0 focus:ring-0 focus:outline-none resize-none overflow-hidden p-0 selection:bg-emerald-100 dark:selection:bg-emerald-950"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5EA] dark:border-[#2C2C2E]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleCancelEdit,
							className: "h-9 px-4 rounded-[10px] text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors cursor-pointer",
							children: "Batal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleSaveEdit,
							className: "h-9 px-5 rounded-[10px] text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066D6] shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 stroke-[2.5]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Simpan Perubahan" })]
						})]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 sm:p-6 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 sm:space-y-5",
					children: [scriptParagraphs.map((paragraph, pIdx) => {
						const isLast = pIdx === scriptParagraphs.length - 1;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-zinc-800 dark:text-zinc-200 text-base sm:text-[17px] leading-relaxed sm:leading-loose font-normal selection:bg-emerald-100 dark:selection:bg-emerald-950",
							children: [paragraph, isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setIsEditing(true),
								className: "inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] transition-all cursor-pointer active:scale-90 ml-2.5 align-middle shadow-2xs border border-[#007AFF]/20",
								title: "Edit manual skrip ini",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "w-3.5 h-3.5" })
							})]
						}, pIdx);
					}), scriptParagraphs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-zinc-400 italic text-sm",
							children: "Skrip belum berisi dialog..."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setIsEditing(true),
							className: "inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] transition-all cursor-pointer active:scale-90 shadow-2xs border border-[#007AFF]/20",
							title: "Tulis skrip manual",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "w-3.5 h-3.5" })
						})]
					})]
				}), currentShowVisual && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h5", {
						className: "text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "w-3.5 h-3.5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Arahan Visual B-Roll & Safe Zone per Bagian" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2.5",
						children: script.segments.map((seg, sIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono bg-zinc-200/80 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300",
									children: [
										"Bagian ",
										sIdx + 1,
										" (",
										seg.timeRange,
										")"
									]
								}), seg.overlayText && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold",
									children: ["Overlay: ", seg.overlayText]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-zinc-600 dark:text-zinc-400 text-xs leading-normal",
								children: seg.visualDirection
							})]
						}, sIdx))
					})]
				})]
			})
		]
	});
};
var ScriptCard = import_react.memo(ScriptCardComponent);
// src/components/ManualCopyModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var ManualCopyModal = ({ isOpen, onClose, text, title = "Salin Teks Skrip" }) => {
	const textareaRef = (0, import_react.useRef)(null);
	const [copied, setCopied] = import_react.useState(false);
	if (!isOpen) return null;
	const handleSelectAndCopy = () => {
		if (textareaRef.current) {
			textareaRef.current.select();
			try {
				document.execCommand("copy");
				setCopied(true);
				setTimeout(() => setCopied(false), 2e3);
			} catch {}
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 p-5 space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-zinc-100 pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm sm:text-base font-bold text-zinc-900",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-zinc-500",
					children: [
						"Izin clipboard otomatis tidak diizinkan oleh peramban. Silakan tekan tombol di bawah atau tekan",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "px-1.5 py-0.5 rounded bg-zinc-100 border text-[10px] font-mono",
							children: "Ctrl+C"
						}),
						" /",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "px-1.5 py-0.5 rounded bg-zinc-100 border text-[10px] font-mono",
							children: "Cmd+C"
						}),
						" manual."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					ref: textareaRef,
					readOnly: true,
					value: text,
					rows: 10,
					onClick: (e) => e.target.select(),
					className: "w-full p-3 text-xs font-mono rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-end gap-2 pt-2 border-t border-zinc-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleSelectAndCopy,
						className: "px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer",
						children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: copied ? "Tersalin!" : "Pilih & Salin Semua" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer",
						children: "Tutup"
					})]
				})
			]
		})
	});
};
// src/components/ProcessingModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var CREATOR_TIPS = [
	{
		tag: "Hook 3 Detik",
		title: "Kunci Retensi Audiens FYP",
		text: "80% penonton scroll jika pembukaan membosankan. Skrip Anda diracik dengan hook kontras visual atau pertanyaan penasaran di 3 detik pertama.",
		accent: "from-amber-500 to-orange-500"
	},
	{
		tag: "B-Roll & Gestur",
		title: "Konversi Naik Hingga 2.4x",
		text: "Tunjukkan produk sedekat mungkin ke kamera saat menyebutkan masalah atau manfaat utama. Penonton ingin melihat detail nyata sebelum membeli.",
		accent: "from-blue-500 to-indigo-500"
	},
	{
		tag: "Safe Zone 9:16",
		title: "Teks Aman dari Tombol UI",
		text: "Semua arahan visual otomatis disesuaikan agar tidak tertutup tombol Love, Komentar di kanan, atau caption & keranjang di bagian bawah.",
		accent: "from-emerald-500 to-teal-500"
	},
	{
		tag: "Call to Action Natural",
		title: "Dorong Klik Keranjang Bawah",
		text: "CTA terbaik adalah yang memberikan alasan mendesak: promo kilat, stok menipis, atau tips klaim voucher gratis di keranjang kiri bawah.",
		accent: "from-purple-500 to-pink-500"
	},
	{
		tag: "Tempo Teleprompter",
		title: "Artikulasi Jelas & Mengalir",
		text: "Gunakan kecepatan 120–140 kata/menit pada Teleprompter bawaan agar suara terdengar santai, natural, dan mudah dipahami penonton.",
		accent: "from-teal-500 to-cyan-500"
	},
	{
		tag: "Formula Storytelling",
		title: "Formula Masalah - Solusi",
		text: "Mulai dari keluhan sehari-hari yang relatable, lalu perkenalkan produk sebagai penyelamat. Review autentik 3x lebih dipercaya daripada hard selling.",
		accent: "from-rose-500 to-red-500"
	}
];
var ProcessingModal = ({ isAnalyzing, isGenerating, activeInputMode = "images", config, productName }) => {
	const [currentStepIndex, setCurrentStepIndex] = (0, import_react.useState)(0);
	const [activeTipIndex, setActiveTipIndex] = (0, import_react.useState)(0);
	const [progressPercent, setProgressPercent] = (0, import_react.useState)(0);
	const [remainingSeconds, setRemainingSeconds] = (0, import_react.useState)(10);
	const [isFinishing, setIsFinishing] = (0, import_react.useState)(false);
	const startTimeRef = (0, import_react.useRef)(0);
	const activeTaskKeyRef = (0, import_react.useRef)(null);
	const finishTimeoutRef = (0, import_react.useRef)(null);
	const isVisible = isAnalyzing || isGenerating || isFinishing;
	const analyzingSteps = (0, import_react.useMemo)(() => [
		"Membaca & memindai sumber informasi produk...",
		"Mengekstrak spesifikasi, fitur nyata & material...",
		"Menganalisis target pembeli & masalah relevan...",
		"Menyusun Product Brief terverifikasi bebas klaim palsu..."
	], []);
	const generatingSteps = (0, import_react.useMemo)(() => [
		"Meracik Hook 3 detik pertama dengan scroll-stopper kuat...",
		"Menyusun dialog narasi persuasif & arahan visual B-roll...",
		"Menguji batas kata & kesesuaian Safe Zone 9:16 multi-platform...",
		"Memvalidasi diversifikasi angle & memfinalisasi skrip siap rekam..."
	], []);
	const steps = isAnalyzing ? analyzingSteps : generatingSteps;
	(0, import_react.useEffect)(() => {
		const currentTask = isAnalyzing ? "analyzing" : isGenerating ? "generating" : null;
		if (!currentTask) {
			if (activeTaskKeyRef.current && !isFinishing) {
				setIsFinishing(true);
				setProgressPercent(100);
				setCurrentStepIndex(steps.length - 1);
				setRemainingSeconds(0);
				finishTimeoutRef.current = setTimeout(() => {
					setIsFinishing(false);
					activeTaskKeyRef.current = null;
					setProgressPercent(0);
					setCurrentStepIndex(0);
				}, 550);
			}
			return;
		}
		if (activeTaskKeyRef.current !== currentTask) {
			activeTaskKeyRef.current = currentTask;
			startTimeRef.current = Date.now();
			setProgressPercent(2);
			setCurrentStepIndex(0);
			setIsFinishing(false);
		}
		const scriptCount = config?.scriptCount || 5;
		const expectedDurationMs = isAnalyzing ? 1e4 : Math.max(12e3, scriptCount * 2800 + 4e3);
		const ticker = setInterval(() => {
			const elapsed = Date.now() - startTimeRef.current;
			let pct = 0;
			if (elapsed < expectedDurationMs * .85) {
				const ratio = elapsed / (expectedDurationMs * .85);
				pct = Math.floor(2 + ratio * 83);
			} else if (elapsed < expectedDurationMs * 1.3) {
				const overtime = elapsed - expectedDurationMs * .85;
				const subRatio = Math.min(1, overtime / (expectedDurationMs * .45));
				pct = Math.floor(85 + subRatio * 9);
			} else {
				const creep = Math.min(4, Math.floor((elapsed - expectedDurationMs * 1.3) / 1e3));
				pct = Math.min(98, 94 + creep);
			}
			setProgressPercent(pct);
			if (pct >= 75) setCurrentStepIndex(3);
			else if (pct >= 50) setCurrentStepIndex(2);
			else if (pct >= 25) setCurrentStepIndex(1);
			else setCurrentStepIndex(0);
			const left = Math.max(1, Math.ceil((expectedDurationMs - elapsed) / 1e3));
			setRemainingSeconds(left);
		}, 200);
		return () => {
			clearInterval(ticker);
			if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
		};
	}, [
		isAnalyzing,
		isGenerating,
		config?.scriptCount,
		steps.length,
		isFinishing
	]);
	(0, import_react.useEffect)(() => {
		if (!isVisible) return;
		const tipTimer = setInterval(() => {
			setActiveTipIndex((prev) => (prev + 1) % CREATOR_TIPS.length);
		}, 4e3);
		return () => clearInterval(tipTimer);
	}, [isVisible]);
	if (!isVisible) return null;
	const currentTip = CREATOR_TIPS[activeTipIndex];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/60 animate-in fade-in duration-200",
		"aria-modal": "true",
		role: "dialog",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl max-w-lg w-full p-5 sm:p-7 text-center relative overflow-hidden transition-all animate-in zoom-in-95 duration-200",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 inset-x-0 h-1 bg-blue-600" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto w-20 h-20 sm:w-22 sm:h-22 mb-4 flex items-center justify-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-full bg-gradient-to-tr from-[#007AFF]/20 via-[#AF52DE]/20 to-[#34C759]/20 blur-md animate-pulse" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 rounded-full border-2 border-dashed border-[#007AFF]/40 dark:border-[#007AFF]/50 animate-spin",
							style: { animationDuration: "8s" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-2 rounded-full border border-dashed border-[#AF52DE]/35 dark:border-[#AF52DE]/45 animate-spin",
							style: {
								animationDuration: "12s",
								animationDirection: "reverse"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex flex-col items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.2),_inset_0_1px_1px_rgba(255,255,255,0.7)] text-white animate-ios-float ${progressPercent >= 100 ? "bg-gradient-to-b from-[#34C759] to-[#28A745]" : isAnalyzing ? "bg-gradient-to-b from-[#5B4DF8] via-[#4F46E5] to-[#007AFF]" : "bg-gradient-to-b from-[#007AFF] via-[#AF52DE] to-[#5856D6]"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[20px] pointer-events-none" }),
								progressPercent >= 100 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-8 h-8 filter drop-shadow stroke-[3]" }) : isAnalyzing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" }),
								progressPercent < 100 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-0.5 mt-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-1 h-1.5 bg-white/90 rounded-full animate-bounce",
											style: { animationDelay: "0ms" }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-1 h-2 bg-white/90 rounded-full animate-bounce",
											style: { animationDelay: "150ms" }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-1 h-1.5 bg-white/90 rounded-full animate-bounce",
											style: { animationDelay: "300ms" }
										})
									]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-1",
					children: progressPercent >= 100 ? "Selesai! Menyiapkan Tampilan..." : isAnalyzing ? "Menganalisis Sumber Produk" : "Membuat Konsep Skrip Siap Rekam"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-zinc-600 dark:text-zinc-300 mb-4 font-normal",
					children: isAnalyzing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Mengekstrak fakta akurat dari ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeInputMode === "images" ? "Foto Produk" : activeInputMode === "url" ? "Tautan E-Commerce" : activeInputMode === "text" ? "Deskripsi Teks" : "Campuran Sumber" }),
						" ",
						productName ? `(${productName})` : ""
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Meracik ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [config?.scriptCount || 5, " Konsep Video"] }),
						" durasi",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [config?.durationSeconds || 30, "s"] }),
						" (",
						config?.style || "Natural",
						")"
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 p-3 sm:p-3.5 mb-4 text-left shadow-xs space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-[11px] font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5 text-blue-600 dark:text-blue-400",
								children: [progressPercent >= 100 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-3.5 h-3.5 text-emerald-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin" }), progressPercent >= 100 ? "Proses Selesai" : "Progress Berjalan"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-slate-700 dark:text-slate-300 font-extrabold tabular-nums",
								children: [progressPercent, "%"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden relative",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-blue-600 h-full rounded-full transition-[width] duration-150 ease-linear",
								style: { width: `${Math.min(100, Math.max(2, progressPercent))}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-1.5 space-y-1.5",
							children: steps.map((stepText, idx) => {
								const isCompleted = idx < currentStepIndex || progressPercent >= 100;
								const isCurrent = idx === currentStepIndex && progressPercent < 100;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `flex items-start gap-2 text-xs transition-all duration-200 rounded-lg p-1.5 ${isCurrent ? "bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold" : isCompleted ? "text-slate-500 dark:text-slate-400 font-medium" : "text-slate-400 dark:text-zinc-600 font-normal"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-0.5 shrink-0",
										children: isCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4 text-emerald-500 stroke-[2.5]" }) : isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "relative w-4 h-4 flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-2.5 h-2.5 rounded-full bg-blue-600" })
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "w-3.5 h-3.5 text-slate-300 dark:text-zinc-700" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "leading-tight flex-1",
										children: stepText
									})]
								}, idx);
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 p-3 sm:p-3.5 mb-4 text-left shadow-xs relative overflow-hidden transition-all duration-300",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Tips Kreator FYP #", activeTipIndex + 1] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] text-zinc-400 dark:text-zinc-500 font-normal",
										children: [
											"(",
											currentTip.tag,
											")"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setActiveTipIndex((prev) => (prev - 1 + CREATOR_TIPS.length) % CREATOR_TIPS.length),
									className: "w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-black/10 transition-colors",
									title: "Tips sebelumnya",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "w-3 h-3" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setActiveTipIndex((prev) => (prev + 1) % CREATOR_TIPS.length),
									className: "w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-black/10 transition-colors",
									title: "Tips berikutnya",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-3 h-3" })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5",
							children: currentTip.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300 line-clamp-2",
							children: currentTip.text
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-center gap-1 mt-2",
							children: CREATOR_TIPS.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1 rounded-full transition-all duration-300 ${i === activeTipIndex ? "w-4 bg-amber-500" : "w-1 bg-zinc-300 dark:bg-zinc-600"}` }, i))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-300 font-medium",
					children: [
						progressPercent >= 100 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-ping" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3.5 h-3.5 text-zinc-400 shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: progressPercent >= 100 ? "Konsep siap ditampilkan!" : `Estimasi selesai: ~${remainingSeconds} detik lagi. Berjalan lancar & stabil.` })
					]
				})
			]
		})
	});
};
// src/components/HistoryModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var HistoryModal = ({ isOpen, onClose, history, onLoadSession, onDeleteSession, onClearHistory }) => {
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [selectedPreviewId, setSelectedPreviewId] = (0, import_react.useState)(null);
	if (!isOpen) return null;
	const filteredHistory = history.filter((item) => {
		if (!searchQuery.trim()) return true;
		const q = searchQuery.toLowerCase();
		return item.productName.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.scripts.some((s) => s.title.toLowerCase().includes(q) || s.angle.toLowerCase().includes(q));
	});
	const formatTimestamp = (ts) => {
		try {
			return new Date(ts).toLocaleDateString("id-ID", {
				day: "numeric",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		} catch {
			return "Baru saja";
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 animate-in fade-in duration-150",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] shadow-2xl border border-zinc-200 flex flex-col overflow-hidden",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 sm:p-5 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-sm sm:text-base font-bold text-zinc-900 flex items-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Riwayat Skrip" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200",
									children: [history.length, " Sesi"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
									title: "Riwayat Pembuatan Skrip",
									content: "Setiap kali Anda menekan 'Buat Skrip', sesi skrip dan brief produk otomatis diarsipkan di sini. Anda dapat memuatnya kembali ke workspace kapan saja."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-zinc-500",
							children: "Akses dan muat kembali skrip yang pernah dibuat sebelumnya"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer",
						"aria-label": "Tutup",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
					})]
				}),
				history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-3 border-b border-zinc-100 bg-white shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							placeholder: "Cari berdasarkan nama produk atau angle skrip...",
							className: "w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-y-auto p-3 sm:p-4 space-y-3",
					children: history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-12 px-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "w-6 h-6" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-bold text-zinc-800",
								children: "Belum Ada Riwayat Tersimpan"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-zinc-500 max-w-sm mx-auto",
								children: [
									"Setiap kali Anda menekan ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\"Buat Skrip\"" }),
									", paket skrip dan brief produk akan otomatis diarsipkan di sini agar bisa digunakan kembali kapan saja."
								]
							})]
						})]
					}) : filteredHistory.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center py-8 text-xs text-zinc-500",
						children: "Tidak ditemukan riwayat yang cocok dengan kata kunci pencarian."
					}) : filteredHistory.map((session) => {
						const isExpanded = selectedPreviewId === session.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3.5 rounded-xl border border-zinc-200 bg-white hover:border-emerald-300 transition-all space-y-2.5 shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1 flex-1 min-w-[200px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1",
											children: session.productName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] text-zinc-400 flex items-center gap-1 shrink-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3 h-3" }), formatTimestamp(session.timestamp)]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "px-1.5 py-0.5 rounded bg-zinc-100 font-medium",
												children: session.category || "Umum"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-emerald-700 font-semibold",
												children: [session.scripts.length, " Konsep Skrip"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [session.durationSeconds, " Detik"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate max-w-[140px]",
												children: session.config.style
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSelectedPreviewId(isExpanded ? null : session.id),
											className: "px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer",
											title: "Lihat daftar konsep skrip",
											children: isExpanded ? "Tutup" : "Lihat"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												onLoadSession(session);
												onClose();
											},
											className: "px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer flex items-center gap-1",
											title: "Buka kembali skrip ini di workspace",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Muat" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3 h-3" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => onDeleteSession(session.id),
											className: "p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer",
											title: "Hapus sesi ini dari riwayat",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5" })
										})
									]
								})]
							}), isExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 pt-2 border-t border-zinc-100 space-y-2 animate-in fade-in duration-150",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold text-zinc-700",
									children: "Konsep Skrip dalam Sesi Ini:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
									children: session.scripts.map((sc, scIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between font-bold text-zinc-800 text-[11px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Konsep #", scIdx + 1] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-emerald-700 font-semibold",
													children: sc.angle.split("/")[0]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-zinc-600 line-clamp-2",
												children: sc.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-zinc-500 italic line-clamp-2",
												children: [
													"\"",
													sc.voiceoverOnly.slice(0, 100),
													"...\""
												]
											})
										]
									}, sc.id || scIdx))
								})]
							})]
						}, session.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 sm:p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between shrink-0",
					children: [history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							if (window.confirm("Kosongkan semua riwayat skrip?")) onClearHistory();
						},
						className: "text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer",
						children: "Hapus Semua Riwayat"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-zinc-400",
						children: "Riwayat otomatis diperbarui"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer",
						children: "Tutup"
					})]
				})
			]
		})
	});
};
// src/components/ResetConfirmModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var ResetConfirmModal = ({ isOpen, onClose, onConfirm }) => {
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 sm:p-5 flex items-start justify-between border-b border-zinc-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm sm:text-base font-bold text-zinc-900",
							children: "Reset Formulir ke Awal?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-zinc-500",
							children: "Kembali ke Tahap 1 (Sumber Info Produk)"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 sm:p-5 space-y-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 leading-relaxed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4 text-amber-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Tindakan ini akan mengosongkan data input produk aktif dan menyetel ulang tahapan. Skrip yang sudah pernah Anda buat tetap aman tersimpan di menu ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Riwayat" }),
							"."
						] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 sm:p-5 pt-0 flex items-center justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer",
						children: "Batal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							onConfirm();
							onClose();
						},
						className: "px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ya, Reset Sekarang" })]
					})]
				})
			]
		})
	});
};
// src/utils/api.ts
var DEFAULT_CLOUD_BACKEND = "https://ais-pre-xyrq42lrknnt5nreynxqnd-639493826363.asia-east1.run.app";
/**
* Verifikasi API Key Google AI Studio langsung ke endpoint resmi Google.
* Bekerja langsung di APK Android native maupun Web tanpa perantara.
* Kebal dari error "Headers: String contains non ISO-8859-1 code point" karena menggunakan
* parameter URL murni dan sanitasi ketat.
*/
async function verifyGeminiKeyDirectly(key, _model) {
	try {
		const keys = parseApiKeys(key);
		if (keys.length === 0) return {
			valid: false,
			error: "Harap masukkan minimal satu API Key yang valid."
		};
		const firstKey = cleanSingleKey(keys[0]);
		if (!firstKey || firstKey.length < 6) return {
			valid: false,
			error: "Format API Key terlalu pendek atau tidak valid."
		};
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 6500);
		const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(firstKey)}`;
		const headers = { "Accept": "application/json" };
		if (firstKey.startsWith("ya29.")) headers["Authorization"] = `Bearer ${safeHeaderValue(firstKey)}`;
		const res = await fetch(endpoint, {
			method: "GET",
			headers,
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		if (res.ok) return { valid: true };
		if (res.status === 400 || res.status === 403) {
			const errMsg = (await res.json().catch(() => null))?.error?.message || "";
			if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid") || errMsg.includes("PERMISSION_DENIED") || errMsg.includes("not found")) return {
				valid: false,
				error: "API Key tidak valid atau ditolak oleh Google AI Studio. Pastikan Anda menyalin seluruh karakter kunci."
			};
		}
		if (res.status === 429) return { valid: true };
		return { valid: true };
	} catch (netErr) {
		console.warn("[verifyGeminiKeyDirectly] Offline or timeout (tolerated):", netErr);
		return { valid: true };
	}
}
/**
* Mendeteksi apakah aplikasi sedang berjalan di dalam Android APK / Capacitor Native WebView.
* HANYA bernilai true jika benar-benar berjalan di runtime native Android / bridge.
*/
function isMobileApp() {
	if (typeof window === "undefined") return false;
	const cap = window.Capacitor;
	const isCapacitorNative = Boolean(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
	const isAndroidBridge = Boolean(window.AndroidFloatingBridge);
	const isCapacitorScheme = window.location.protocol === "capacitor:" || window.location.protocol === "file:";
	return isCapacitorNative || isAndroidBridge || isCapacitorScheme;
}
/**
* Mengambil Base URL untuk panggilan API /api/*.
* Di Web browser biasa (desktop/mobile web/localhost), menggunakan relative path ''.
* Di APK Android native, mengarah ke server backend cloud AI Studio.
*/
function getApiBaseUrl() {
	if (typeof window === "undefined") return "";
	try {
		const customUrl = localStorage.getItem("affiliate_script_lab_backend_url");
		if (customUrl && customUrl.trim()) return customUrl.trim().replace(/\/+$/, "");
	} catch {}
	if (isMobileApp()) return DEFAULT_CLOUD_BACKEND.replace(/\/+$/, "");
	return "";
}
/**
* Menghasilkan URL lengkap untuk pemanggilan API.
*/
function apiUrl(endpoint) {
	const base = getApiBaseUrl();
	const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
	return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
}
/**
* Mem-parse respons JSON dengan aman. Mencegah error "Unexpected token < in JSON at position 0"
* apabila server mengembalikan halaman HTML (misalnya saat 404/500/offline).
*/
async function safeParseJsonResponse(response, actionLabel = "memproses permintaan") {
	const isJson = (response.headers.get("content-type") || "").includes("application/json");
	if (!response.ok) {
		if (isJson) try {
			const errorData = await response.json();
			const err = new Error(errorData.error || `Gagal ${actionLabel} (Kode status: ${response.status})`);
			err.status = response.status;
			err.isQuotaExhausted = response.status === 429 || Boolean(errorData.isQuotaExhausted) || Boolean(errorData.error && (errorData.error.includes("TOKEN_QUOTA_EXHAUSTED") || errorData.error.includes("429")));
			throw err;
		} catch (e) {
			if (e.message && !e.message.includes("JSON")) throw e;
		}
		const text = await response.text();
		if (text.includes("<!doctype html") || text.includes("<html")) throw new Error(`Server backend mengembalikan halaman HTML (${response.status}) alih-alih data JSON. Pastikan endpoint server backend aktif.`);
		const err = new Error(text || `Gagal ${actionLabel} (${response.status})`);
		err.status = response.status;
		err.isQuotaExhausted = response.status === 429;
		throw err;
	}
	if (!isJson) {
		const text = await response.text();
		if (text.includes("<!doctype html") || text.includes("<html")) throw new Error("Server backend mengembalikan respons HTML. Pastikan server backend sedang aktif dan dapat menerima permintaan API.");
		try {
			return JSON.parse(text);
		} catch {
			throw new Error(`Format data dari server tidak valid saat ${actionLabel}.`);
		}
	}
	return await response.json();
}
// src/components/ApiKeyModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var ApiKeyModal = ({ isOpen, onClose, currentApiKey, onSave, onDelete, selectedModel = GEMINI_MODEL, onSelectModel, isQuotaExhaustedAlert = false }) => {
	const [apiKeyInput, setApiKeyInput] = (0, import_react.useState)("");
	const [modelChoice, setModelChoice] = (0, import_react.useState)(selectedModel);
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [isTesting, setIsTesting] = (0, import_react.useState)(false);
	const [isDeleting, setIsDeleting] = (0, import_react.useState)(false);
	const [justPasted, setJustPasted] = (0, import_react.useState)(false);
	const [statusMessage, setStatusMessage] = (0, import_react.useState)({
		text: "",
		type: null
	});
	(0, import_react.useEffect)(() => {
		if (isOpen) {
			setApiKeyInput(currentApiKey);
			setModelChoice(selectedModel || "gemini-3.1-flash-lite");
			setStatusMessage({
				text: "",
				type: null
			});
		}
	}, [
		isOpen,
		currentApiKey,
		selectedModel
	]);
	const detectedKeys = (0, import_react.useMemo)(() => {
		return parseApiKeys(apiKeyInput);
	}, [apiKeyInput]);
	if (!isOpen) return null;
	const handlePasteFromClipboard = async () => {
		try {
			let clipText = "";
			if (typeof window !== "undefined" && window.AndroidFloatingBridge?.getClipboardText) clipText = window.AndroidFloatingBridge.getClipboardText();
			if (!clipText && typeof navigator !== "undefined" && navigator.clipboard?.readText) clipText = await navigator.clipboard.readText();
			if (clipText && clipText.trim()) {
				const cleanKey = clipText.trim();
				setApiKeyInput((prev) => {
					if (!prev.trim()) return cleanKey;
					if (prev.includes(cleanKey)) return prev;
					return `${prev.trim()}\n${cleanKey}`;
				});
				setJustPasted(true);
				setTimeout(() => setJustPasted(false), 2e3);
				setStatusMessage({
					text: "✓ Kunci berhasil ditambahkan dari clipboard.",
					type: "success"
				});
			} else setStatusMessage({
				text: "Clipboard kosong. Salin API Key terlebih dahulu.",
				type: "error"
			});
		} catch {
			setStatusMessage({
				text: "Tidak dapat mengakses clipboard otomatis. Silakan tempel manual.",
				type: "error"
			});
		}
	};
	const handleAddBackupKeySlot = () => {
		setApiKeyInput((prev) => {
			const trimmed = prev.trim();
			return trimmed ? `${trimmed}\n` : "";
		});
		setStatusMessage({
			text: "Silakan tempel atau ketik API Key cadangan di baris baru.",
			type: null
		});
	};
	const handleTestAndSave = async () => {
		if (detectedKeys.length === 0) {
			setStatusMessage({
				text: "Harap masukkan API Key terlebih dahulu.",
				type: "error"
			});
			return;
		}
		const sanitizedKeys = detectedKeys.map(cleanSingleKey).filter(Boolean);
		if (sanitizedKeys.length === 0) {
			setStatusMessage({
				text: "Format API Key tidak valid. Pastikan kunci disalin dengan benar.",
				type: "error"
			});
			return;
		}
		const cleanedApiKeyString = sanitizedKeys.join("\n");
		setIsTesting(true);
		setStatusMessage({
			text: `Menghubungi Google AI Studio & memverifikasi ${sanitizedKeys.length} kunci...`,
			type: null
		});
		try {
			const directVerification = await verifyGeminiKeyDirectly(cleanedApiKeyString, modelChoice);
			if (!directVerification.valid && directVerification.error) {
				setStatusMessage({
					text: directVerification.error,
					type: "error"
				});
				setIsTesting(false);
				return;
			}
			if (!isMobileApp()) try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 4e3);
				await fetch(apiUrl("/api/test-key"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						apiKey: cleanedApiKeyString,
						model: modelChoice
					}),
					signal: controller.signal
				});
				clearTimeout(timeoutId);
			} catch (backendErr) {
				console.warn("Backend ping notice (tolerated):", backendErr);
			}
			if (onSelectModel) onSelectModel(modelChoice);
			if (await onSave(cleanedApiKeyString, modelChoice)) {
				setStatusMessage({
					text: `✓ ${sanitizedKeys.length} API Key Google (${modelChoice}) terverifikasi & aktif!`,
					type: "success"
				});
				setTimeout(() => {
					onClose();
				}, 1e3);
			}
		} catch (err) {
			try {
				if (onSelectModel) onSelectModel(modelChoice);
				await onSave(cleanedApiKeyString, modelChoice);
				setStatusMessage({
					text: `✓ API Key Google berhasil disimpan!`,
					type: "success"
				});
				setTimeout(() => {
					onClose();
				}, 1e3);
			} catch {
				setStatusMessage({
					text: err.message || "Gagal menyimpan API Key.",
					type: "error"
				});
			}
		} finally {
			setIsTesting(false);
		}
	};
	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await onDelete();
			setApiKeyInput("");
			setStatusMessage({
				text: "API Key berhasil dihapus.",
				type: "success"
			});
		} catch {
			setStatusMessage({
				text: "Gagal menghapus API Key.",
				type: "error"
			});
		} finally {
			setIsDeleting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold text-zinc-900 leading-tight",
							children: "Pengaturan API Key & Model"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-zinc-400",
							children: "Google AI Studio (Dukungan Multi-Kunci)"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 space-y-3.5 text-xs overflow-y-auto",
					children: [
						isQuotaExhaustedAlert && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 flex items-start gap-2.5 shadow-2xs animate-pulse",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-rose-900 text-xs",
									children: "Perhatian: Kuota/Token API Key Habis"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-rose-700 leading-relaxed",
									children: "Token atau kuota dari API Key Google Anda saat ini telah habis. Silakan masukkan atau ganti dengan API Key Google baru di bawah ini agar proses pembuatan brief & skrip dapat berlanjut."
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "font-semibold text-zinc-700 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, { className: "w-3.5 h-3.5 text-blue-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Model AI Google" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-zinc-400 font-mono",
									children: SUPPORTED_GOOGLE_MODELS.find((m) => m.id === modelChoice)?.tag || ""
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: modelChoice,
									onChange: (e) => setModelChoice(e.target.value),
									className: "w-full appearance-none pl-3 pr-9 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer shadow-2xs transition-colors",
									children: SUPPORTED_GOOGLE_MODELS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: m.id,
										children: [
											m.name,
											" (",
											m.tag,
											")"
										]
									}, m.id))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-4 h-4 text-zinc-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "font-semibold text-zinc-700 flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "w-3.5 h-3.5 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "API Key Google AI Studio" })]
									}), detectedKeys.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200",
										children: [detectedKeys.length, " Kunci Terdeteksi"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: 3,
										value: apiKeyInput,
										onChange: (e) => setApiKeyInput(e.target.value),
										placeholder: "Tempel kunci Google AI Studio di sini (AQ..., AIzaSy..., dll). Mendukung format terbaru Google dan multi-kunci sekaligus (pisahkan baris baru).",
										disabled: isTesting || isDeleting,
										autoComplete: "off",
										spellCheck: false,
										style: {
											backgroundColor: "#FFFFFF",
											color: "#18181B",
											caretColor: "#D97706"
										},
										className: "w-full pr-14 pl-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs resize-none"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute right-2 top-2 flex items-center gap-0.5",
										children: [apiKeyInput && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setApiKeyInput(""),
											className: "p-1 text-zinc-400 hover:text-zinc-700 rounded-md cursor-pointer transition-colors",
											title: "Hapus teks",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowPassword(!showPassword),
											className: "p-1 text-zinc-400 hover:text-zinc-700 rounded-md cursor-pointer transition-colors",
											title: showPassword ? "Sembunyikan" : "Tampilkan",
											children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "w-3.5 h-3.5" })
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-1.5 pt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: handlePasteFromClipboard,
											disabled: isTesting || isDeleting,
											className: `py-1.5 px-2.5 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${justPasted ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"}`,
											children: justPasted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "w-3 h-3 text-white" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tersalin!" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clipboard, { className: "w-3 h-3 text-zinc-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tempel Clipboard" })] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: handleAddBackupKeySlot,
											disabled: isTesting || isDeleting,
											className: "py-1.5 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs",
											title: "Tambah baris baru untuk kunci aktif berikutnya",
											children: "+ Tambah Kunci Baru"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: "https://aistudio.google.com/app/apikey",
										target: "_blank",
										rel: "noopener noreferrer",
										className: "inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-amber-600 transition-colors font-medium ml-auto",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dapatkan API Key" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-3 h-3" })]
									})]
								})
							]
						}),
						detectedKeys.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-zinc-50 rounded-xl p-2.5 border border-zinc-200/80 space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] font-bold text-zinc-700 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Daftar Seluruh Kunci Aktif:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-emerald-600 font-bold",
										children: "Semua Aktif Bersamaan"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-1",
									children: detectedKeys.map((k, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2 text-[11px] bg-white px-2 py-1.5 rounded-lg border border-zinc-200",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-zinc-600 truncate max-w-[200px]",
											children: showPassword ? k : `${k.slice(0, 8)}...${k.slice(-4)}`
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200",
											children: ["Kunci Aktif #", idx + 1]
										})]
									}, idx))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] text-zinc-500 leading-normal pt-0.5",
									children: [
										"💡 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Multi-Key Aktif (Round-Robin):" }),
										" Seluruh ",
										detectedKeys.length,
										" kunci Anda aktif bersamaan dan bergantian otomatis untuk membagi beban kuota secara merata. Jika satu kunci mencapai batas, sistem langsung beralih ke kunci berikutnya tanpa terhenti."
									]
								})
							]
						}),
						statusMessage.text && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `p-2.5 rounded-xl text-xs flex items-center gap-2 ${statusMessage.type === "success" ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : statusMessage.type === "error" ? "bg-rose-50 text-rose-900 border border-rose-200" : "bg-zinc-100 text-zinc-700 border border-zinc-200"}`,
							children: [
								statusMessage.type === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "w-3.5 h-3.5 text-rose-600 shrink-0" }),
								statusMessage.type === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5 text-emerald-600 shrink-0" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: statusMessage.text
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-3.5 border-t border-zinc-100 flex items-center justify-between gap-2 bg-zinc-50/70 shrink-0",
					children: [currentApiKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleDelete,
						disabled: isDeleting || isTesting,
						className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isDeleting ? "Menghapus..." : "Hapus" })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer",
							children: "Batal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleTestAndSave,
							disabled: isTesting || !apiKeyInput.trim(),
							className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
							children: isTesting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Menguji..." })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5 stroke-[2.5]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Simpan & Aktifkan" })] })
						})]
					})]
				})
			]
		})
	});
};
// src/components/QuotaExhaustedModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var QuotaExhaustedModal = ({ isOpen, onClose, onOpenApiKeyModal, keyCount = 1 }) => {
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 animate-in fade-in duration-200",
		"aria-modal": "true",
		role: "dialog",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/50 overflow-hidden text-left relative animate-in zoom-in-95 duration-200",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-inner",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "w-6 h-6" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60",
							children: "Batas Kuota Tercapai (Error 429)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base sm:text-lg font-bold text-zinc-900 dark:text-white mt-1 leading-tight",
							children: "Token API Key Google Habis"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer",
						title: "Tutup dialog",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Token atau kuota pemakaian harian gratis dari",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-zinc-900 dark:text-white font-semibold",
								children: keyCount > 1 ? `seluruh ${keyCount} API Key Google` : "API Key Google"
							}),
							" ",
							"Anda saat ini telah habis dari Google AI Studio."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/40 rounded-2xl p-3.5 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Solusi Otomatis Multi-Key Gagaswara" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-amber-800 dark:text-amber-300/90 leading-normal",
								children: "Aplikasi mendukung rotasi multi-kunci otomatis. Anda dapat memasukkan beberapa API Key Google sekaligus. Jika satu kunci kehabisan token, sistem akan otomatis beralih menggunakan token kunci cadangan tanpa menghentikan pekerjaan Anda."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold text-zinc-700 dark:text-zinc-300",
								children: "Langkah untuk melanjutkan:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "list-disc list-inside space-y-1 pl-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Masukkan API Key baru atau cadangan di menu Pengaturan Kunci." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Atau buat API Key baru secara gratis di Google AI Studio (instan 1 menit)." })]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900/70 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							onClose();
							onOpenApiKeyModal();
						},
						className: "flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "w-4 h-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ganti / Tambah Kunci Sekarang" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "https://aistudio.google.com/app/apikey",
						target: "_blank",
						rel: "noopener noreferrer",
						className: "py-2.5 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Buat Kunci Gratis" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-3.5 h-3.5 text-zinc-400" })]
					})]
				})
			]
		})
	});
};
// src/components/AuthWarningModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var AuthWarningModal = ({ isOpen, onClose, user, hasApiKey, onLogin, onOpenApiKey }) => {
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 border-b border-zinc-100 flex items-center justify-between bg-amber-50/70",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "w-4 h-4 text-amber-700" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-bold text-zinc-900",
						children: "Proteksi Generator Skrip"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-zinc-500",
						children: "Perlu Autentikasi & API Key"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-5 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium",
						children: "Harap login dan atur API Key Google AI Studio Anda terlebih dahulu di menu profil (kanan atas)."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2.5 text-xs text-zinc-600",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-zinc-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-zinc-800",
									children: "1. Status Akun"
								})]
							}), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full",
								children: "Sudah Login"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full",
								children: "Belum Login"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-zinc-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-zinc-800",
									children: "2. Google AI Studio API Key"
								})]
							}), hasApiKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full",
								children: "Tersimpan"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full",
								children: "Belum Diatur"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-zinc-500 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Belum punya API Key?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "https://aistudio.google.com/app/apikey",
							target: "_blank",
							rel: "noopener noreferrer",
							className: "inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dapatkan gratis di Google AI Studio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-3 h-3" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-2 flex items-center justify-end gap-2 border-t border-zinc-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer",
							children: "Tutup"
						}), !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								onClose();
								onLogin();
							},
							className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Masuk dengan Google" })]
						}) : !hasApiKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								onClose();
								onOpenApiKey();
							},
							className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Atur API Key Sekarang" })]
						}) : null]
					})
				]
			})]
		})
	});
};
var firebase_applet_config_default = {
	projectId: "manuskrip-a2ed2",
	appId: "1:705363788623:web:cd984acc160fc62a4dfb3a",
	apiKey: "AIzaSyDOHeL-rfZm1zVtleJw4ASZ1vgYuoDfHxg",
	authDomain: "manuskrip-a2ed2.firebaseapp.com",
	firestoreDatabaseId: "ai-studio-affiliatescriptl-c80707c5-4f71-4323-8336-8cf1b11d8672",
	storageBucket: "manuskrip-a2ed2.firebasestorage.app",
	messagingSenderId: "705363788623",
	measurementId: "",
	oAuthClientId: "705363788623-sc8u8a8ii0mj7l7knqo573pnhkmjdrfp.apps.googleusercontent.com",
	recaptchaSiteKey: ""
};
// src/components/UnauthorizedDomainModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var UnauthorizedDomainModal = ({ isOpen, onClose, onUseLocalApiKey }) => {
	const [copied, setCopied] = (0, import_react.useState)(false);
	if (!isOpen) return null;
	const currentDomain = typeof window !== "undefined" ? window.location.hostname : "";
	const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebase_applet_config_default.projectId || "gen-lang-client-0665892309"}/authentication/settings`;
	const handleCopyDomain = async () => {
		if (!currentDomain) return;
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(currentDomain);
				setCopied(true);
				setTimeout(() => setCopied(false), 2500);
			}
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 overflow-hidden space-y-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 border-b border-zinc-100 flex items-center justify-between bg-amber-50/80",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "w-4 h-4 text-amber-700" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-bold text-zinc-900 leading-tight",
						children: "Domain Belum Diotorisasi di Firebase"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-zinc-500 font-mono",
						children: "auth/unauthorized-domain"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 sm:p-5 space-y-4 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-zinc-600 leading-relaxed",
						children: [
							"Google Sign-In memblokir permintaan login karena domain aplikasi saat ini belum ditambahkan ke daftar ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-zinc-800",
								children: "Authorized Domains"
							}),
							" di Firebase Authentication proyek Anda."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[11px] font-semibold text-zinc-700 block",
							children: "Domain Aplikasi Anda Saat Ini:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								readOnly: true,
								value: currentDomain,
								className: "flex-1 px-3 py-2 text-xs font-mono bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-800 select-all focus:outline-none"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleCopyDomain,
								className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-900 text-white transition-all cursor-pointer shrink-0",
								children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5 text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Disalin!" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Salin Domain" })] })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-bold text-zinc-800 text-[11px] flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Langkah Mengatasi di Firebase Console:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: firebaseSettingsUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold text-[11px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Buka Firebase Settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-3 h-3" })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "list-decimal pl-4 space-y-1 text-zinc-600 leading-normal text-[11px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Buka tautan Firebase Console Settings di atas." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Gulir ke bagian ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-zinc-700",
										children: "Authorized domains"
									}),
									"."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Klik tombol ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-zinc-700",
										children: "Add domain"
									}),
									" lalu tempel domain di atas."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Klik ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-zinc-700",
										children: "Save"
									}),
									", lalu coba login Google kembali."
								] })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-bold text-emerald-950 flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "w-3.5 h-3.5 text-emerald-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ingin langsung membuat skrip sekarang?" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-emerald-800 leading-relaxed text-[11px]",
							children: "Anda tidak perlu menunggu! Anda dapat langsung menggunakan aplikasi dengan memasukkan Google AI Studio API Key Anda secara lokal. Riwayat dan fitur generator akan langsung aktif."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-zinc-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer text-center",
							children: "Lanjut sebagai Tamu"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								onClose();
								onUseLocalApiKey();
							},
							className: "w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "w-3.5 h-3.5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gunakan dengan API Key Langsung" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5 ml-0.5" })
							]
						})]
					})
				]
			})]
		})
	});
};
// src/utils/prompterFormatter.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var BENEFIT_EMPHASIS_WORDS = /* @__PURE__ */ new Set([
	"GRATIS",
	"HEMAT",
	"ASLI",
	"ORIGINAL",
	"TERBUKTI",
	"PRAKTIS",
	"PREMIUM",
	"TERBAIK",
	"REKOMENDASI",
	"SOLUSI",
	"AMPUH",
	"WAJIB",
	"JUARA",
	"RAHASIA",
	"GAMPANG",
	"VIRAL",
	"FAVORIT",
	"AWET",
	"RINGAN",
	"NYAMAN",
	"CEPAT",
	"BERSIH",
	"MUDAH",
	"LANGSUNG",
	"BEDA",
	"KEREN",
	"MANTAP",
	"BAGUS",
	"OTENTIK",
	"GARANSI",
	"BERGARANSI",
	"AMAN",
	"BPOM",
	"HALAL"
]);
var PROMO_WORDS = /* @__PURE__ */ new Set([
	"DISKON",
	"PROMO",
	"MURAH",
	"CASHBACK",
	"POTONGAN",
	"ONGKIR",
	"VOUCHER",
	"FLASH",
	"SALE",
	"CUMA",
	"HANYA",
	"RP",
	"RIBU",
	"TERJANGKAU",
	"SPESIAL",
	"BONUS"
]);
var CTA_PHRASES = [
	"KLIK KERANJANG KUNING",
	"KERANJANG KUNING",
	"KERANJANG KIRI BAWAH",
	"CHECKOUT SEKARANG",
	"KLIK LINK DI BIO",
	"AMBIL PROMONYA",
	"JANGAN SAMPAI KEHABISAN",
	"STOK TERBATAS",
	"CO SEKARANG",
	"KLIK DI BAWAH",
	"BELI SEKARANG",
	"AMBIL SEKARANG"
];
/**
* Membersihkan elemen non-skrip seperti arahan visual, petunjuk kamera, dan label bagian.
*/
function cleanNonScriptDirectives(text) {
	let cleaned = text;
	cleaned = cleaned.replace(/\[\s*(jeda|pause)[^\]]*\]/gi, (match) => {
		return ` __PAUSE_DIRECTIVE_${match.replace(/[\[\]]/g, "").trim()}__ `;
	});
	cleaned = cleaned.replace(/\(\s*(jeda|pause)[^)]*\)/gi, (match) => {
		return ` __PAUSE_DIRECTIVE_${match.replace(/[()]/g, "").trim()}__ `;
	});
	cleaned = cleaned.replace(/\[\s*(visual|audio|musik|sfx|b-roll|scene|arahan|kamera|tampilan)[^\]]*\]/gi, " ");
	cleaned = cleaned.replace(/\(\s*(visual|audio|musik|sfx|b-roll|scene|arahan|kamera|tampilan)[^)]*\)/gi, " ");
	cleaned = cleaned.replace(/\[[^\]]{3,50}\]/g, " ");
	cleaned = cleaned.replace(/^(hook|problem|masalah|demo|solusi|value|nilai|cta|call to action|voiceover|narasi|dialog|skrip):\s*/gim, " ");
	cleaned = cleaned.replace(/\b(hook|problem|masalah|demo|solusi|value|cta|voiceover|narasi):\s*/gi, " ");
	cleaned = cleaned.replace(/^["'“‘]+|["'”’]+$/g, "").trim();
	cleaned = cleaned.replace(/[ \t]+/g, " ").trim();
	return cleaned;
}
/**
* Ekstrak kata-kata kunci produk untuk di-highlight
*/
function extractProductKeywords(productName) {
	if (!productName) return [];
	const stopWords = /* @__PURE__ */ new Set([
		"dan",
		"atau",
		"yang",
		"untuk",
		"dengan",
		"dari",
		"bisa",
		"buat",
		"pada",
		"ini",
		"itu"
	]);
	return productName.replace(/[^\w\s]/gi, " ").split(/\s+/).map((w) => w.trim().toUpperCase()).filter((w) => w.length >= 3 && !stopWords.has(w.toLowerCase()));
}
/**
* Memecah teks narasi menjadi baris-baris per kalimat secara cerdas.
*/
function splitIntoSentences(text) {
	const cleaned = cleanNonScriptDirectives(text);
	if (!cleaned) return [];
	const rawParts = cleaned.replace(/Rp\.\s*/gi, "Rp_").replace(/\bdll\./gi, "dll_").replace(/\bdsb\./gi, "dsb_").replace(/\bs\/d\b/gi, "s_d").replace(/\bno\./gi, "no_").split(/(?<=[.!?\n])\s+/);
	const sentences = [];
	for (const part of rawParts) {
		const restored = part.replace(/Rp_/g, "Rp. ").replace(/dll_/g, "dll.").replace(/dsb_/g, "dsb.").replace(/s_d/g, "s/d").replace(/no_/g, "no.").trim();
		if (restored.length > 0) sentences.push(restored);
	}
	return sentences;
}
/**
* Memformat kalimat tunggal dengan jeda intonasi (/ dan //) dan penekanan kata (UPPERCASE/Bold).
*/
function formatSentenceTokens(sentence, productKeywords = []) {
	let text = cleanNonScriptDirectives(sentence);
	const endsWithExclamation = text.endsWith("!");
	const endsWithQuestion = text.endsWith("?");
	text = text.replace(/[.!?]+$/, "").trim();
	text = text.replace(/\s*,\s*/g, " / ");
	const upperSentence = text.toUpperCase();
	for (const cta of CTA_PHRASES) if (upperSentence.includes(cta)) {
		const regex = new RegExp(cta.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
		text = text.replace(regex, cta);
	}
	const rawWords = text.split(/\s+/);
	const tokens = [];
	for (let i = 0; i < rawWords.length; i++) {
		const rawWord = rawWords[i];
		if (!rawWord) continue;
		if (rawWord.startsWith("__PAUSE_DIRECTIVE_") && rawWord.endsWith("__")) {
			tokens.push({
				text: "",
				type: "pause-long"
			});
			continue;
		}
		if (rawWord === "/") {
			tokens.push({
				text: "/",
				type: "pause-short"
			});
			continue;
		}
		if (rawWord.includes("/")) {
			const subParts = rawWord.split("/");
			for (let sIdx = 0; sIdx < subParts.length; sIdx++) {
				const sub = subParts[sIdx].trim();
				if (sub) tokens.push(classifyWordToken(sub, productKeywords));
				if (sIdx < subParts.length - 1) tokens.push({
					text: "/",
					type: "pause-short"
				});
			}
			continue;
		}
		tokens.push(classifyWordToken(rawWord, productKeywords));
	}
	if (tokens.length > 0) {
		const lastToken = tokens[tokens.length - 1];
		if (endsWithExclamation) lastToken.text = `${lastToken.text}!`;
		else if (endsWithQuestion) lastToken.text = `${lastToken.text}?`;
		else if (!/[.,!?]$/.test(lastToken.text)) lastToken.text = `${lastToken.text}.`;
		tokens.push({
			text: "//",
			type: "pause-long"
		});
	}
	return tokens;
}
function formatConceptDisplayParts(conceptNumber, title, angle) {
	let cleanTitle = (title || "").trim();
	const cleanAngle = (angle || "").trim();
	cleanTitle = cleanTitle.replace(new RegExp(`^konsep\\s*(?:#?\\s*${conceptNumber})?\\s*[:\\-–—]?\\s*`, "i"), "").trim();
	cleanTitle = cleanTitle.replace(/^konsep\s*#?\d+\s*[:\\-–—]?\s*/i, "").trim();
	if (!cleanTitle && cleanAngle) cleanTitle = cleanAngle;
	if (!cleanTitle) cleanTitle = "Skrip Affiliate";
	let line2 = cleanTitle;
	if (cleanAngle && cleanAngle.toLowerCase() !== cleanTitle.toLowerCase() && !cleanTitle.toLowerCase().includes(cleanAngle.toLowerCase())) line2 = `${cleanTitle} (${cleanAngle})`;
	return {
		line1: `KONSEP #${conceptNumber}`,
		line2
	};
}
function classifyWordToken(word, productKeywords) {
	const strippedWord = word.replace(/[^\w]/g, "").toUpperCase();
	const alphaOnly = word.replace(/[^a-zA-Z]/g, "");
	const isCapitalWord = alphaOnly.length >= 2 && alphaOnly === alphaOnly.toUpperCase();
	if ([
		"CHECKOUT",
		"KERANJANG",
		"KUNING",
		"BAWAH",
		"BELI",
		"PESAN",
		"CO",
		"ORDER"
	].includes(strippedWord)) return {
		text: word.toUpperCase(),
		type: "cta"
	};
	if (PROMO_WORDS.has(strippedWord) || strippedWord.startsWith("DISKON") || strippedWord.startsWith("PROMO") || strippedWord.startsWith("RP")) return {
		text: word.toUpperCase(),
		type: "promo"
	};
	if (BENEFIT_EMPHASIS_WORDS.has(strippedWord)) return {
		text: word.toUpperCase(),
		type: "emphasis"
	};
	if (productKeywords.includes(strippedWord) && strippedWord.length >= 3) return {
		text: word.toUpperCase(),
		type: "emphasis"
	};
	if (isCapitalWord) return {
		text: word,
		type: "emphasis"
	};
	return {
		text: word,
		type: "normal"
	};
}
/**
* Mengubah ScriptItem menjadi struktur PrompterConcept siap tayang di teleprompter
*/
function buildPrompterConcept(script, conceptNumber, productKeywords = []) {
	let dialogueBlocks = [];
	if (script.segments && script.segments.length > 0) {
		for (const seg of script.segments) if (seg.spokenDialogue && seg.spokenDialogue.trim()) dialogueBlocks.push(seg.spokenDialogue.trim());
	}
	if (dialogueBlocks.length === 0 && script.voiceoverOnly) dialogueBlocks = script.voiceoverOnly.split("\n").map((line) => line.trim()).filter(Boolean);
	const lines = splitIntoSentences(dialogueBlocks.join(" ")).map((sentence, sIdx) => ({
		id: `${script.id || conceptNumber}-line-${sIdx}`,
		rawText: sentence,
		tokens: formatSentenceTokens(sentence, productKeywords)
	}));
	return {
		id: script.id || `concept-${conceptNumber}`,
		conceptNumber,
		title: script.title || `Konsep #${conceptNumber}`,
		angle: script.angle || "Affiliate Script",
		estimatedDuration: script.estimatedDurationSeconds || 30,
		wordCount: script.spokenWordCount || 0,
		lines
	};
}
// src/utils/teleprompterPresets.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var SUBTITLE_PRESETS = [
	{
		id: "standard_read",
		name: "1. Standard Read (Normal)",
		shortLabel: "Standard",
		description: "Preset standar harian. Teks putih bersih, kata CAPITAL kuning cerah ber-outline hitam.",
		textColor: "#FFFFFF",
		highlightColor: "#FACC15",
		textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.95)",
		fontWeight: "400",
		lineHeight: "1.5"
	},
	{
		id: "large_text",
		name: "2. Large Text (Teks Besar)",
		shortLabel: "Teks Besar",
		description: "Keterbacaan tinggi jarak jauh. Huruf tebal putih dengan penekanan CAPITAL kuning terang.",
		textColor: "#FFFFFF",
		highlightColor: "#FEF08A",
		textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)",
		fontWeight: "700",
		lineHeight: "1.45"
	},
	{
		id: "high_contrast",
		name: "3. High Contrast (Kontras Tinggi)",
		shortLabel: "Kontras Tinggi",
		description: "Perbedaan visual tajam. Teks utama putih, kata penekanan CAPITAL cyan terang mencolok.",
		textColor: "#FFFFFF",
		highlightColor: "#22D3EE",
		textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)",
		fontWeight: "700",
		lineHeight: "1.45"
	},
	{
		id: "daylight_read",
		name: "4. Daylight Read (Mode Terang)",
		shortLabel: "Mode Terang",
		description: "Huruf tebal berpenekanan kuat. Kata CAPITAL oranye terang membedakan instruksi penting.",
		textColor: "#FFFFFF",
		highlightColor: "#FB923C",
		textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)",
		fontWeight: "700",
		lineHeight: "1.45"
	},
	{
		id: "eye_comfort",
		name: "5. Eye Comfort (Nyaman di Mata)",
		shortLabel: "Nyaman Mata",
		description: "Minimalis & sejuk untuk naskah panjang. Teks putih dengan aksen kata CAPITAL hijau mint lembut.",
		textColor: "#FFFFFF",
		highlightColor: "#6EE7B7",
		textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
		fontWeight: "400",
		lineHeight: "1.5"
	},
	{
		id: "wide_spacing",
		name: "6. Wide Spacing (Spasi Lebar)",
		shortLabel: "Spasi Lebar",
		description: "Jarak antarhuruf & baris lebih lega. Teks CAPITAL magenta terang penanda visual fokus.",
		textColor: "#FFFFFF",
		highlightColor: "#F472B6",
		textShadow: "1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 3px 6px rgba(0,0,0,0.95)",
		fontWeight: "600",
		letterSpacing: "0.06em",
		lineHeight: "1.65"
	},
	{
		id: "distance_max",
		name: "7. Distance Max (Jarak Jauh)",
		shortLabel: "Jarak Jauh",
		description: "Maksimal untuk membaca beberapa meter dari kamera. Huruf ekstra tebal & CAPITAL kuning tajam.",
		textColor: "#FFFFFF",
		highlightColor: "#FDE047",
		textShadow: "2.5px 2.5px 0 #000, -2.5px -2.5px 0 #000, 2.5px -2.5px 0 #000, -2.5px 2.5px 0 #000, 0 4px 8px rgba(0,0,0,1)",
		fontWeight: "800",
		lineHeight: "1.4"
	},
	{
		id: "line_focus",
		name: "8. Line Focus (Fokus Baris)",
		shortLabel: "Fokus Baris",
		description: "Membantu menjaga posisi bacaan naskah dengan highlight baris tenang & CAPITAL cyan terang.",
		textColor: "#FFFFFF",
		highlightColor: "#38BDF8",
		textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)",
		fontWeight: "600",
		lineHeight: "1.5",
		pillBg: "rgba(15, 23, 42, 0.65)",
		borderClass: "border-l-4 border-cyan-400 pl-3 py-1 rounded-r-xl shadow-lg"
	},
	{
		id: "speaker_mode",
		name: "9. Speaker Mode (Mode Pembicara)",
		shortLabel: "Pembicara",
		description: "Untuk presenter & kreator konten. Teks konsisten dengan penekanan CAPITAL oranye terang.",
		textColor: "#FFFFFF",
		highlightColor: "#FB923C",
		textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)",
		fontWeight: "600",
		lineHeight: "1.5"
	},
	{
		id: "studio_pro",
		name: "10. Studio Pro (Profesional)",
		shortLabel: "Studio Pro",
		description: "Standar produksi video profesional & studio. Teks putih konsisten dengan CAPITAL emas premium.",
		textColor: "#FFFFFF",
		highlightColor: "#EAB308",
		textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 8px rgba(0,0,0,0.95)",
		fontWeight: "700",
		lineHeight: "1.5"
	}
];
// src/utils/teleprompterPip.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
/**
* Checks if the current execution context is the top-level window.
* Browsers forbid documentPictureInPicture.requestWindow from within an iframe.
*/
function isTopLevelContext() {
	if (typeof window === "undefined") return false;
	try {
		return window.self === window.top;
	} catch {
		return false;
	}
}
function isDocumentPipSupported() {
	if (typeof window === "undefined") return false;
	if (!isTopLevelContext()) return false;
	return "documentPictureInPicture" in window && typeof window.documentPictureInPicture?.requestWindow === "function";
}
/**
* Opens a Document Picture-in-Picture window containing the element.
* Safely handles iframe constraints and returns null instead of throwing uncaught errors.
*/
async function openDocumentPip(contentElement, options) {
	if (!isDocumentPipSupported()) return null;
	try {
		const pipWindow = await window.documentPictureInPicture.requestWindow({
			width: options.width || 360,
			height: options.height || 420
		});
		if (!pipWindow || !pipWindow.document) return null;
		[...document.styleSheets].forEach((styleSheet) => {
			try {
				const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
				const style = pipWindow.document.createElement("style");
				style.textContent = cssRules;
				pipWindow.document.head.appendChild(style);
			} catch {
				if (styleSheet.href) {
					const link = pipWindow.document.createElement("link");
					link.rel = "stylesheet";
					link.href = styleSheet.href;
					pipWindow.document.head.appendChild(link);
				}
			}
		});
		pipWindow.document.body.style.margin = "0";
		pipWindow.document.body.style.padding = "0";
		pipWindow.document.body.style.overflow = "hidden";
		pipWindow.document.body.style.backgroundColor = "#000000";
		pipWindow.document.title = options.title || "Manuskrip Teleprompter";
		pipWindow.document.body.appendChild(contentElement);
		if (options.onClosed) pipWindow.addEventListener("pagehide", () => {
			options.onClosed?.();
		});
		return pipWindow;
	} catch (err) {
		console.warn("Document PiP request was not allowed or closed in current context:", err?.message || err);
		return null;
	}
}
// src/utils/teleprompterThemes.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var TELEPROMPTER_THEMES = {
	dark_pro: {
		id: "dark_pro",
		name: "Dark Pro",
		tagline: "Latar hitam, teks putih, penanda teks aktif kuning",
		backgroundColor: "#000000",
		textColor: "#FFFFFF",
		highlightColor: "#FACC15",
		secondaryTextColor: "#A1A1AA",
		cardBg: "#18181B",
		cardBorder: "#27272A",
		cardTextColor: "#FFFFFF",
		focusLineColor: "#FACC15",
		dockBg: "rgba(9, 9, 11, 0.96)",
		dockBorder: "#27272A",
		dockBtnBg: "#18181B",
		dockBtnText: "#E4E4E7",
		previewSwatch: {
			bg: "#000000",
			text: "#FFFFFF",
			highlight: "#FACC15"
		}
	},
	soft_comfort: {
		id: "soft_comfort",
		name: "Soft Comfort",
		tagline: "Latar hitam pekat kontras, kontrol tombol hijau segar",
		backgroundColor: "#000000",
		textColor: "#FAF9F6",
		highlightColor: "#22C55E",
		secondaryTextColor: "#9CA3AF",
		cardBg: "#0F172A",
		cardBorder: "#166534",
		cardTextColor: "#FAF9F6",
		focusLineColor: "#22C55E",
		dockBg: "rgba(0, 0, 0, 0.95)",
		dockBorder: "#15803D",
		dockBtnBg: "#14532D",
		dockBtnText: "#4ADE80",
		previewSwatch: {
			bg: "#000000",
			text: "#FAF9F6",
			highlight: "#22C55E"
		}
	},
	light_clean: {
		id: "light_clean",
		name: "Light Clean",
		tagline: "Latar putih, teks hitam, penanda teks aktif biru",
		backgroundColor: "#FFFFFF",
		textColor: "#18181B",
		highlightColor: "#2563EB",
		secondaryTextColor: "#52525B",
		cardBg: "#F4F4F5",
		cardBorder: "#E4E4E7",
		cardTextColor: "#18181B",
		focusLineColor: "#2563EB",
		dockBg: "rgba(244, 244, 245, 0.96)",
		dockBorder: "#E4E4E7",
		dockBtnBg: "#FFFFFF",
		dockBtnText: "#18181B",
		previewSwatch: {
			bg: "#FFFFFF",
			text: "#18181B",
			highlight: "#2563EB"
		}
	}
};
var THEME_STORAGE_KEY = "gagaswara_prompter_theme";
function getStoredPrompterTheme() {
	try {
		if (typeof localStorage !== "undefined") {
			const stored = localStorage.getItem(THEME_STORAGE_KEY);
			if (stored && TELEPROMPTER_THEMES[stored]) return TELEPROMPTER_THEMES[stored];
		}
	} catch {}
	return TELEPROMPTER_THEMES.dark_pro;
}
function saveStoredPrompterTheme(themeId) {
	const selected = TELEPROMPTER_THEMES[themeId] || TELEPROMPTER_THEMES.dark_pro;
	try {
		if (typeof localStorage !== "undefined") localStorage.setItem(THEME_STORAGE_KEY, selected.id);
	} catch {}
	return selected;
}
// src/utils/androidPrompterSettings.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var DEFAULT_ANDROID_PROMPTER_CONFIG = {
	speed: 3,
	fontSize: 18,
	opacity: 85,
	textColorHex: "#FFFFFF",
	presetId: "standard_read",
	themeId: "dark_pro",
	backgroundColorHex: "#000000",
	highlightColorHex: "#FACC15",
	rotation: 0,
	isMirrored: false,
	showFocusGuide: true,
	focusGuidePercent: 12,
	countdownSec: 3,
	windowWidth: 650,
	windowHeight: 720
};
var STORAGE_KEY = "gagaswara_android_prompter_settings";
function loadAndroidPrompterConfig() {
	let baseConfig = { ...DEFAULT_ANDROID_PROMPTER_CONFIG };
	if (typeof window !== "undefined" && window.AndroidFloatingBridge?.getSavedFloatingPrompterSettings) try {
		const nativeJson = window.AndroidFloatingBridge.getSavedFloatingPrompterSettings();
		if (nativeJson && typeof nativeJson === "string" && nativeJson.trim().length > 2) {
			const nativeParsed = JSON.parse(nativeJson);
			baseConfig = {
				...baseConfig,
				...nativeParsed
			};
		}
	} catch (e) {
		console.warn("Failed to parse native prompter settings:", e);
	}
	try {
		if (typeof localStorage !== "undefined") {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				baseConfig = {
					...baseConfig,
					...parsed
				};
			}
		}
	} catch (e) {
		console.warn("Failed to load Android prompter settings:", e);
	}
	const storedTheme = getStoredPrompterTheme();
	if (storedTheme) {
		baseConfig.themeId = storedTheme.id;
		baseConfig.backgroundColorHex = storedTheme.backgroundColor;
		baseConfig.highlightColorHex = storedTheme.highlightColor;
		baseConfig.textColorHex = storedTheme.textColor;
	}
	return baseConfig;
}
function saveAndroidPrompterConfig(config) {
	try {
		if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
	} catch (e) {
		console.warn("Failed to save Android prompter settings:", e);
	}
}
/**
* Memulai Teleprompter Melayang di Android native via AndroidFloatingBridge.
* Mengirimkan seluruh konfigurasi lengkap (kecepatan, font, opasitas, warna, preset, cermin, rotasi, fokus tatap mata, countdown).
*/
function launchAndroidFloatingPrompter(scriptText, overrides, structuredConcepts) {
	if (typeof window === "undefined") return false;
	const bridge = window.AndroidFloatingBridge;
	if (!bridge) return false;
	const config = {
		...loadAndroidPrompterConfig(),
		...overrides
	};
	saveAndroidPrompterConfig(config);
	const storedTheme = getStoredPrompterTheme();
	const activeTheme = config.themeId && TELEPROMPTER_THEMES[config.themeId] || storedTheme;
	try {
		const payload = {
			scriptText,
			conceptsJson: structuredConcepts ? JSON.stringify(structuredConcepts) : "",
			speed: config.speed,
			fontSize: config.fontSize,
			opacity: config.opacity,
			textColorHex: config.textColorHex || activeTheme.textColor,
			presetId: config.presetId || "standard_read",
			themeId: activeTheme.id,
			backgroundColorHex: config.backgroundColorHex || activeTheme.backgroundColor,
			highlightColorHex: config.highlightColorHex || activeTheme.highlightColor,
			rotation: config.rotation || 0,
			isMirrored: Boolean(config.isMirrored),
			showFocusGuide: Boolean(config.showFocusGuide),
			focusGuidePercent: config.focusGuidePercent,
			countdownSec: config.countdownSec,
			windowWidth: config.windowWidth,
			windowHeight: config.windowHeight
		};
		if (typeof bridge.startFloatingServiceWithJson === "function") {
			bridge.startFloatingServiceWithJson(JSON.stringify(payload));
			return true;
		} else if (typeof bridge.startFloatingServiceDetailed === "function") {
			bridge.startFloatingServiceDetailed(scriptText, config.speed, config.fontSize, config.opacity, payload.textColorHex, config.isMirrored, config.showFocusGuide, config.focusGuidePercent, config.countdownSec, config.windowWidth, config.windowHeight);
			return true;
		} else if (typeof bridge.startFloatingService === "function") {
			bridge.startFloatingService(scriptText, config.speed, config.fontSize);
			return true;
		}
	} catch (err) {
		console.error("Failed to launch Android floating prompter:", err);
	}
	return false;
}
/**
* Hentikan Foreground Service Teleprompter Melayang di Android native jika sedang aktif.
*/
function stopAndroidFloatingPrompter() {
	if (typeof window !== "undefined" && window.AndroidFloatingBridge) try {
		window.AndroidFloatingBridge.stopFloatingService?.();
	} catch (e) {
		console.warn("Failed to stop Android floating prompter:", e);
	}
}
/**
* Membuka pengaturan detail aplikasi di sistem Android (untuk izin khusus MIUI/HyperOS/ColorOS).
*/
function openAndroidAppDetails() {
	if (typeof window !== "undefined" && window.AndroidFloatingBridge) try {
		window.AndroidFloatingBridge.openAppDetailsSettings?.();
	} catch (e) {
		console.warn("Failed to open app details:", e);
	}
}
// src/components/TeleprompterModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var SPEED_CURVE$1 = [
	2.5,
	4.5,
	7.5,
	11,
	16,
	23,
	32,
	43,
	56,
	72
];
var TeleprompterModal = ({ isOpen, onClose, scripts, initialConceptIndex = -1, openToken = 0, productBrief, onOpenFloatingPrompter, theme: propTheme, onSelectTheme }) => {
	const [internalTheme, setInternalTheme] = (0, import_react.useState)(() => getStoredPrompterTheme());
	const activeTheme = propTheme || internalTheme;
	(0, import_react.useEffect)(() => {
		if (propTheme) setInternalTheme(propTheme);
		else setInternalTheme(getStoredPrompterTheme());
	}, [propTheme, isOpen]);
	const [isPlaying, setIsPlaying] = (0, import_react.useState)(false);
	const [isCountingDown, setIsCountingDown] = (0, import_react.useState)(false);
	const [countdownValue, setCountdownValue] = (0, import_react.useState)(3);
	const [countdownEnabled, setCountdownEnabled] = (0, import_react.useState)(true);
	const [countdownDuration, setCountdownDuration] = (0, import_react.useState)(3);
	const [speed, setSpeed] = (0, import_react.useState)(3);
	const [fontSize, setFontSize] = (0, import_react.useState)(24);
	const [opacity, setOpacity] = (0, import_react.useState)(95);
	const [isMirrored, setIsMirrored] = (0, import_react.useState)(false);
	const [rotation, setRotation] = (0, import_react.useState)(0);
	const [showFocusZone, setShowFocusZone] = (0, import_react.useState)(true);
	const [focusZonePosition, setFocusZonePosition] = (0, import_react.useState)(14);
	const [isFullscreen, setIsFullscreen] = (0, import_react.useState)(false);
	const [isMinimized, setIsMinimized] = (0, import_react.useState)(false);
	const [minimizedPos, setMinimizedPos] = (0, import_react.useState)(() => {
		if (typeof window !== "undefined") {
			const safeX = Math.max(12, window.innerWidth - 240);
			return {
				x: Math.min(safeX, 20),
				y: 84
			};
		}
		return {
			x: 16,
			y: 84
		};
	});
	const savedScrollTopRef = (0, import_react.useRef)(0);
	const isMinimizedDraggingRef = (0, import_react.useRef)(false);
	const dragOffsetRef = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const handleMinimizedPointerDown = (e) => {
		isMinimizedDraggingRef.current = true;
		dragOffsetRef.current = {
			x: e.clientX - minimizedPos.x,
			y: e.clientY - minimizedPos.y
		};
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
	};
	const handleMinimizedPointerMove = (e) => {
		if (!isMinimizedDraggingRef.current) return;
		const maxX = Math.max(5, window.innerWidth - 220);
		const maxY = Math.max(60, window.innerHeight - 100);
		const newX = Math.min(Math.max(5, e.clientX - dragOffsetRef.current.x), maxX);
		const newY = Math.min(Math.max(60, e.clientY - dragOffsetRef.current.y), maxY);
		setMinimizedPos({
			x: newX,
			y: newY
		});
	};
	const handleMinimizedPointerUp = (e) => {
		isMinimizedDraggingRef.current = false;
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {}
	};
	const handleMinimize = (0, import_react.useCallback)(() => {
		setIsPlaying(false);
		setIsCountingDown(false);
		if (scrollContainerRef.current) savedScrollTopRef.current = scrollContainerRef.current.scrollTop;
		if (typeof window !== "undefined") {
			const maxX = Math.max(10, window.innerWidth - 230);
			const maxY = Math.max(64, window.innerHeight - 120);
			setMinimizedPos((prev) => ({
				x: Math.min(Math.max(12, prev.x), maxX),
				y: Math.min(Math.max(64, prev.y), maxY)
			}));
		}
		setIsMinimized(true);
	}, []);
	const handleRestoreFromMinimize = (0, import_react.useCallback)(() => {
		setIsMinimized(false);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isMinimized && isOpen && savedScrollTopRef.current > 0) {
			const raf = requestAnimationFrame(() => {
				if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = savedScrollTopRef.current;
			});
			return () => cancelAnimationFrame(raf);
		}
	}, [isMinimized, isOpen]);
	const [horizontalAlignment, setHorizontalAlignment] = (0, import_react.useState)("center");
	const [selectedConceptIndex, setSelectedConceptIndex] = (0, import_react.useState)(initialConceptIndex);
	const [isSettingsOpen, setIsSettingsOpen] = (0, import_react.useState)(false);
	const [settingsTab, setSettingsTab] = (0, import_react.useState)("teks");
	const [activePresetId, setActivePresetId] = (0, import_react.useState)("standard_read");
	const [tapFeedback, setTapFeedback] = (0, import_react.useState)(null);
	const [screenSize, setScreenSize] = (0, import_react.useState)({
		width: typeof window !== "undefined" ? window.innerWidth : 360,
		height: typeof window !== "undefined" ? window.innerHeight : 640
	});
	(0, import_react.useEffect)(() => {
		const handleResize = () => {
			setScreenSize({
				width: window.innerWidth,
				height: window.innerHeight
			});
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	const rotationScale = import_react.useMemo(() => {
		if (rotation === 90 || rotation === 270) {
			const minDim = Math.min(screenSize.width, screenSize.height);
			const maxDim = Math.max(screenSize.width, screenSize.height);
			return Math.min(minDim / maxDim, 1);
		}
		return 1;
	}, [rotation, screenSize]);
	const scrollContainerRef = (0, import_react.useRef)(null);
	const modalContainerRef = (0, import_react.useRef)(null);
	const animationFrameRef = (0, import_react.useRef)(null);
	const lastTimeRef = (0, import_react.useRef)(null);
	const scrollAccumulatorRef = (0, import_react.useRef)(0);
	const isPlayingRef = (0, import_react.useRef)(isPlaying);
	(0, import_react.useEffect)(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);
	(0, import_react.useEffect)(() => {
		if (isOpen) {
			setIsMinimized(false);
			setSelectedConceptIndex(initialConceptIndex);
			setIsPlaying(false);
			setIsCountingDown(false);
			setIsSettingsOpen(false);
			scrollAccumulatorRef.current = 0;
			if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
		}
	}, [
		isOpen,
		initialConceptIndex,
		openToken
	]);
	const productKeywords = import_react.useMemo(() => {
		return extractProductKeywords(productBrief?.name);
	}, [productBrief?.name]);
	const prompterConcepts = import_react.useMemo(() => {
		return scripts.map((script, idx) => buildPrompterConcept(script, idx + 1, productKeywords));
	}, [scripts, productKeywords]);
	const activeConcepts = import_react.useMemo(() => {
		if (selectedConceptIndex >= 0 && selectedConceptIndex < prompterConcepts.length) return [prompterConcepts[selectedConceptIndex]];
		return prompterConcepts;
	}, [prompterConcepts, selectedConceptIndex]);
	const activePreset = import_react.useMemo(() => {
		return SUBTITLE_PRESETS.find((p) => p.id === activePresetId) || SUBTITLE_PRESETS[0];
	}, [activePresetId]);
	const pixelsPerSecond = SPEED_CURVE$1[Math.min(Math.max(1, speed), 10) - 1];
	const scrollStep = (0, import_react.useCallback)((timestamp) => {
		if (!lastTimeRef.current) lastTimeRef.current = timestamp;
		const deltaTime = timestamp - lastTimeRef.current;
		lastTimeRef.current = timestamp;
		if (isPlayingRef.current && scrollContainerRef.current) {
			const container = scrollContainerRef.current;
			const moveDistance = pixelsPerSecond * deltaTime / 1e3;
			scrollAccumulatorRef.current += moveDistance;
			if (scrollAccumulatorRef.current >= .5) {
				const delta = Math.floor(scrollAccumulatorRef.current);
				container.scrollTop += delta;
				scrollAccumulatorRef.current -= delta;
				const maxScroll = container.scrollHeight - container.clientHeight;
				if (container.scrollTop >= maxScroll - 2) {
					setIsPlaying(false);
					lastTimeRef.current = null;
					return;
				}
			}
		}
		if (isPlayingRef.current) animationFrameRef.current = requestAnimationFrame(scrollStep);
	}, [pixelsPerSecond]);
	(0, import_react.useEffect)(() => {
		if (isPlaying) {
			lastTimeRef.current = null;
			animationFrameRef.current = requestAnimationFrame(scrollStep);
		} else {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			lastTimeRef.current = null;
		}
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [isPlaying, scrollStep]);
	const triggerPlay = (0, import_react.useCallback)(() => {
		if (countdownEnabled) {
			setIsCountingDown(true);
			setCountdownValue(countdownDuration);
			const timer = setInterval(() => {
				setCountdownValue((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						setIsCountingDown(false);
						setIsPlaying(true);
						setTapFeedback("play");
						setTimeout(() => setTapFeedback(null), 500);
						return countdownDuration;
					}
					return prev - 1;
				});
			}, 900);
		} else {
			setIsPlaying(true);
			setTapFeedback("play");
			setTimeout(() => setTapFeedback(null), 500);
		}
	}, [countdownEnabled, countdownDuration]);
	const handleTogglePlay = (0, import_react.useCallback)(() => {
		if (isPlaying) {
			setIsPlaying(false);
			setTapFeedback("pause");
			setTimeout(() => setTapFeedback(null), 500);
		} else if (isCountingDown) {
			setIsCountingDown(false);
			setIsPlaying(true);
			setTapFeedback("play");
			setTimeout(() => setTapFeedback(null), 500);
		} else {
			triggerPlay();
			setIsSettingsOpen(false);
		}
	}, [
		isPlaying,
		isCountingDown,
		triggerPlay
	]);
	const handleScreenTap = (e) => {
		if (e.target.closest("button, input, select, .no-tap-toggle")) return;
		handleTogglePlay();
	};
	const handleReset = (0, import_react.useCallback)(() => {
		setIsPlaying(false);
		setIsCountingDown(false);
		scrollAccumulatorRef.current = 0;
		if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		const handleKeyDown = (e) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.code === "Space") {
				e.preventDefault();
				handleTogglePlay();
			} else if (e.key === "r" || e.key === "R") {
				e.preventDefault();
				handleReset();
			} else if (e.key === "Escape") {
				e.preventDefault();
				if (isSettingsOpen) setIsSettingsOpen(false);
				else if (isCountingDown) setIsCountingDown(false);
				else onClose();
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSpeed((prev) => Math.min(10, prev + 1));
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				setSpeed((prev) => Math.max(1, prev - 1));
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		isOpen,
		handleTogglePlay,
		handleReset,
		isCountingDown,
		onClose
	]);
	const handleToggleFullscreen = () => {
		if (!document.fullscreenElement) {
			modalContainerRef.current?.requestFullscreen().catch(() => {});
			setIsFullscreen(true);
		} else {
			document.exitFullscreen().catch(() => {});
			setIsFullscreen(false);
		}
	};
	const handleActivateFloating = async () => {
		const fullText = activeConcepts.map((c) => c.title + "\n\n" + c.lines.map((l) => l.rawText).join("\n")).join("\n\n---\n\n");
		if (typeof window !== "undefined" && window.AndroidFloatingBridge) {
			if (launchAndroidFloatingPrompter(fullText, {
				speed,
				fontSize,
				opacity,
				textColorHex: activePreset.textColor || "#FEF08A",
				presetId: activePresetId,
				themeId: activeTheme.id,
				backgroundColorHex: activeTheme.backgroundColor,
				highlightColorHex: activeTheme.highlightColor,
				rotation,
				isMirrored,
				showFocusGuide: showFocusZone,
				focusGuidePercent: focusZonePosition,
				countdownSec: countdownEnabled ? countdownDuration : 0
			}, activeConcepts)) {
				onClose();
				return;
			}
		}
		if (isDocumentPipSupported()) try {
			const containerClone = document.createElement("div");
			containerClone.style.padding = "14px";
			containerClone.style.color = activePreset.textColor;
			containerClone.style.fontSize = `${Math.max(12, fontSize)}px`;
			containerClone.style.fontFamily = "system-ui, -apple-system, sans-serif";
			containerClone.style.lineHeight = "1.45";
			containerClone.style.textShadow = activePreset.textShadow;
			containerClone.style.whiteSpace = "pre-wrap";
			containerClone.innerText = activeConcepts.map((c) => `=== ${c.title} ===\n\n` + c.lines.map((l) => l.rawText).join("\n")).join("\n\n------------------------\n\n");
			if (await openDocumentPip(containerClone, {
				width: 400,
				height: 480,
				title: "Manuskrip Teleprompter"
			})) return;
		} catch (err) {
			console.warn("PiP notice, falling back to in-app floating prompter:", err);
		}
		if (onOpenFloatingPrompter) {
			onOpenFloatingPrompter(selectedConceptIndex);
			onClose();
		}
	};
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [isMinimized && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			left: `${minimizedPos.x}px`,
			top: `${minimizedPos.y}px`,
			touchAction: "none"
		},
		className: "fixed z-[9999] flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-[#1C1C1E] text-white border border-zinc-700 shadow-2xl select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onPointerDown: handleMinimizedPointerDown,
				onPointerMove: handleMinimizedPointerMove,
				onPointerUp: handleMinimizedPointerUp,
				className: "p-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:bg-white/30 text-white cursor-grab active:cursor-grabbing touch-none select-none transition-all flex items-center justify-center shrink-0",
				title: "Tahan dan geser untuk memindahkan posisi teleprompter",
				"aria-label": "Geser posisi teleprompter",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Move, { className: "w-3.5 h-3.5 text-white/90" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "button",
				tabIndex: 0,
				onClick: handleRestoreFromMinimize,
				className: "flex items-center gap-2 cursor-pointer group pr-1 select-none",
				title: "Klik untuk membuka kembali ukuran semula",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-bold text-amber-300 tracking-wide group-hover:text-amber-200 transition-colors whitespace-nowrap",
					children: "teleprompter Gagaswara"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: handleRestoreFromMinimize,
				className: "p-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer shrink-0",
				title: "Buka kembali ukuran semula (pengaturan tersimpan penuh)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "w-3.5 h-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: (e) => {
					e.stopPropagation();
					setIsMinimized(false);
					onClose();
				},
				className: "p-1.5 rounded-[10px] bg-red-500/20 hover:bg-red-500 active:scale-95 text-red-300 hover:text-white transition-all cursor-pointer shrink-0",
				title: "Tutup Teleprompter",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: modalContainerRef,
		style: {
			display: isMinimized ? "none" : "flex",
			backgroundColor: activeTheme.id === "light_clean" ? `rgba(255, 255, 255, ${opacity / 100})` : `rgba(0, 0, 0, ${opacity / 100})`,
			color: activeTheme.textColor
		},
		className: "fixed inset-0 w-full h-[100dvh] max-h-[100dvh] z-50 flex flex-col font-sans select-none overflow-hidden transition-colors duration-200",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "fixed top-3 right-3 sm:top-5 sm:right-5 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-2xl border-2 border-white/40 transition-all active:scale-90 cursor-pointer",
				title: "Tutup Teleprompter (Esc)",
				"aria-label": "Tutup Teleprompter",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5 stroke-[2.5]" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: { background: `linear-gradient(90deg, transparent, ${activeTheme.highlightColor}44, transparent)` },
				className: "w-full h-1 shrink-0"
			}),
			showFocusZone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { top: `${focusZonePosition}%` },
				className: "pointer-events-none absolute left-0 right-0 z-20 -translate-y-1/2 flex items-center justify-between px-4 sm:px-12 transition-all duration-150",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						background: `linear-gradient(90deg, ${activeTheme.highlightColor}aa, ${activeTheme.highlightColor}, ${activeTheme.highlightColor}aa)`,
						boxShadow: `0 0 10px ${activeTheme.highlightColor}88`
					},
					className: "flex-1 h-0.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: {
						color: activeTheme.highlightColor,
						borderColor: `${activeTheme.highlightColor}66`
					},
					className: "text-xs font-mono font-bold bg-black/60 px-2 py-0.5 rounded border ml-2 drop-shadow-md",
					children: [focusZonePosition, "%"]
				})]
			}),
			isCountingDown && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onClick: (e) => {
					e.stopPropagation();
					setIsCountingDown(false);
					setIsPlaying(true);
				},
				className: "absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-150",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { color: activeTheme.highlightColor },
					className: "text-8xl sm:text-9xl font-black tracking-tight animate-bounce drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]",
					children: countdownValue
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm sm:text-base font-semibold text-zinc-300",
					children: "Teks segera bergulir... (Ketuk layar untuk langsung mulai)"
				})]
			}),
			tapFeedback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-out fade-out zoom-out duration-400",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						borderColor: activeTheme.highlightColor,
						color: activeTheme.highlightColor
					},
					className: "p-5 rounded-full bg-black/90 border shadow-2xl",
					children: tapFeedback === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-10 h-10 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "w-10 h-10 fill-current" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				onClick: handleScreenTap,
				ref: scrollContainerRef,
				style: {
					scrollBehavior: "auto",
					transform: rotation !== 0 ? `rotate(${rotation}deg) scale(${rotationScale})` : void 0,
					transformOrigin: "center center"
				},
				className: "flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 md:px-16 pt-2 pb-36 scrollbar-none transition-transform duration-200 cursor-pointer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						transform: isMirrored ? "scaleX(-1)" : void 0,
						transformOrigin: "center center"
					},
					className: `space-y-10 transition-all duration-200 ${horizontalAlignment === "left" ? "max-w-3xl ml-4 sm:ml-12" : horizontalAlignment === "right" ? "max-w-3xl mr-4 sm:mr-12 ml-auto" : "max-w-4xl mx-auto"}`,
					children: [activeConcepts.map((concept, cIdx) => {
						const parts = formatConceptDisplayParts(concept.conceptNumber, concept.title, concept.angle);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: `space-y-6 border-b border-zinc-800/40 pb-16 last:border-b-0 ${cIdx > 0 ? "mt-16 pt-10" : ""}`,
							children: [
								cIdx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full my-6 flex items-center justify-center select-none",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full border-t border-dashed border-white/20" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										backgroundColor: activeTheme.cardBg,
										borderColor: activeTheme.cardBorder,
										color: activeTheme.cardTextColor
									},
									className: "w-full my-4 p-4 sm:p-5 rounded-2xl border-2 shadow-xl flex items-start justify-between gap-4 select-none",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-3 flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: { backgroundColor: activeTheme.highlightColor },
											className: "w-3.5 h-3.5 rounded-full ring-4 ring-black/10 shrink-0 mt-1"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: { color: activeTheme.highlightColor },
												className: "text-xs sm:text-sm font-black tracking-wider uppercase leading-tight",
												children: parts.line1
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												style: { color: activeTheme.cardTextColor },
												className: "text-base sm:text-lg md:text-xl font-bold tracking-tight leading-snug mt-1 break-words",
												children: parts.line2
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											color: activeTheme.secondaryTextColor,
											backgroundColor: activeTheme.id === "light_clean" ? "#E4E4E7" : "#27272A",
											borderColor: activeTheme.cardBorder
										},
										className: "flex items-center gap-2 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border shrink-0 mt-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"±",
												concept.estimatedDuration,
												"s"
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "opacity-50",
												children: "·"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [concept.wordCount || 0, " kata"] })
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-6 sm:space-y-8",
									children: concept.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: `${fontSize}px`,
											lineHeight: activePreset.lineHeight || "1.45",
											letterSpacing: activePreset.letterSpacing || "normal",
											color: activeTheme.textColor,
											textShadow: activeTheme.id === "light_clean" ? "none" : activePreset.textShadow,
											fontWeight: activePreset.fontWeight,
											backgroundColor: activePreset.pillBg || "transparent"
										},
										className: `transition-all duration-150 tracking-wide ${activePreset.pillBg ? "p-3 rounded-2xl " + (activePreset.borderClass || "") : ""}`,
										children: line.tokens.map((token, tIdx) => {
											if (token.type === "emphasis" || token.type === "promo" || token.type === "cta") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: { color: activePreset.highlightColor },
												className: "font-black uppercase tracking-wider",
												children: [token.text, " "]
											}, tIdx);
											if (token.type === "pause-short") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: { color: activePreset.highlightColor },
												className: "font-bold mx-1.5 opacity-80 select-none",
												title: "Jeda Intonasi",
												children: ["/", " "]
											}, tIdx);
											if (token.type === "pause-long") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: { color: activePreset.highlightColor },
												className: "font-black mx-1.5 opacity-90 select-none",
												title: "Jeda Intonasi Panjang",
												children: ["//", " "]
											}, tIdx);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [token.text, " "] }, tIdx);
										})
									}, line.id))
								})
							]
						}, concept.id);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "h-96 flex flex-col items-center justify-center text-zinc-600 text-xs font-semibold gap-2 border-t border-zinc-900 pt-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "--- AKHIR SKRIP AFFILIATE ---" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleReset,
								className: "mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kembali ke Atas" })]
							})
						]
					})]
				})
			}),
			isSettingsOpen && !isPlaying && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-tap-toggle fixed right-3 sm:right-6 bottom-20 z-50 w-[75vw] max-w-[360px] sm:max-w-[400px] bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl space-y-3.5 text-xs text-zinc-200 animate-in slide-in-from-right-2 duration-150 max-h-[calc(100dvh-6.5rem)] overflow-y-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between pb-2 border-b border-zinc-700/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-amber-400 text-sm flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pengaturan Teleprompter" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setIsSettingsOpen(false),
							className: "p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/70 cursor-pointer transition-colors",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-700/80",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSettingsTab("teks"),
								className: `flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${settingsTab === "teks" ? "bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40" : "bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Teks" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSettingsTab("tema"),
								className: `flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${settingsTab === "tema" ? "bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40" : "bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tema" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSettingsTab("countdown"),
								className: `flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${settingsTab === "countdown" ? "bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40" : "bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Countdown" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSettingsTab("layar"),
								className: `flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${settingsTab === "layar" ? "bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40" : "bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Layar" })]
							})
						]
					}),
					settingsTab === "teks" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-zinc-300",
									children: "Ukuran Font (Mulai dari 7px):"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono font-bold text-amber-400",
									children: [fontSize, "px"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: "7",
								max: "64",
								value: fontSize,
								onChange: (e) => setFontSize(Number(e.target.value)),
								className: "w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-zinc-300 text-xs block",
								children: "Pilih 10 Gaya Subtitle Siap Rekam:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1",
								children: SUBTITLE_PRESETS.map((preset) => {
									const isSelected = preset.id === activePresetId;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setActivePresetId(preset.id),
										className: `flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${isSelected ? "bg-amber-500/20 border border-amber-500/60" : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2.5 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: preset.textColor,
													textShadow: preset.textShadow,
													fontWeight: preset.fontWeight
												},
												className: "text-sm px-2 py-0.5 rounded bg-black/70 border border-zinc-700 font-bold shrink-0",
												children: "Aa"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs font-bold text-white truncate",
												children: preset.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] text-zinc-400",
												children: preset.description
											})] })]
										}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-amber-400 shrink-0 ml-1" })]
									}, preset.id);
								})
							})]
						})]
					}),
					settingsTab === "tema" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-zinc-300",
									children: "Tema Warna Teleprompter:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-amber-400",
									children: activeTheme.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-3 gap-2 mt-2",
								children: Object.values(TELEPROMPTER_THEMES).map((t) => {
									const isSelected = activeTheme.id === t.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											const updated = saveStoredPrompterTheme(t.id);
											setInternalTheme(updated);
											if (onSelectTheme) onSelectTheme(t.id);
										},
										className: `p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${isSelected ? "bg-zinc-800 border-amber-500 shadow-md ring-1 ring-amber-500/50" : "bg-zinc-950/80 border-zinc-800 hover:border-zinc-700"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: { backgroundColor: t.previewSwatch.bg },
											className: "w-8 h-8 rounded-full border border-white/20 flex items-center justify-center relative shadow-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { color: t.previewSwatch.text },
												className: "text-[11px] font-black",
												children: "T"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { backgroundColor: t.previewSwatch.highlight },
												className: "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-1 ring-black"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `text-[11px] font-bold whitespace-nowrap ${isSelected ? "text-white" : "text-zinc-400"}`,
											children: t.name
										})]
									}, t.id);
								})
							})]
						})
					}),
					settingsTab === "countdown" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "w-4 h-4 text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-zinc-200 text-xs",
									children: "Hitung Mundur Sebelum Teks Jalan:"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								role: "switch",
								"aria-checked": countdownEnabled,
								onClick: () => setCountdownEnabled((e) => !e),
								title: countdownEnabled ? "Nonaktifkan Hitung Mundur" : "Aktifkan Hitung Mundur",
								className: `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${countdownEnabled ? "bg-amber-500" : "bg-zinc-700"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${countdownEnabled ? "translate-x-5" : "translate-x-0"}`
								})
							})]
						}), countdownEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 pt-2 border-t border-zinc-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-zinc-400 block font-medium",
								children: "Pilih Durasi Hitung Mundur:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-2",
								children: [
									3,
									5,
									10
								].map((sec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setCountdownDuration(sec),
									className: `flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${countdownDuration === sec ? "bg-amber-500 text-black border-amber-500 shadow-xs" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"}`,
									children: [sec, " Detik"]
								}, sec))
							})]
						})]
					}),
					settingsTab === "layar" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-zinc-300",
										children: "Transparansi Latar Belakang:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono font-bold text-amber-400",
										children: [opacity, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: "10",
									max: "100",
									value: opacity,
									onChange: (e) => setOpacity(Number(e.target.value)),
									className: "w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-zinc-300",
										children: "Garis Panduan Kamera:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono font-bold text-amber-400",
										children: [focusZonePosition, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 pt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										role: "switch",
										"aria-checked": showFocusZone,
										onClick: () => setShowFocusZone((z) => !z),
										title: showFocusZone ? "Nonaktifkan Garis Panduan" : "Aktifkan Garis Panduan",
										className: `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${showFocusZone ? "bg-amber-500" : "bg-zinc-700"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${showFocusZone ? "translate-x-5" : "translate-x-0"}`
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1 flex items-center min-w-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											min: "5",
											max: "75",
											value: focusZonePosition,
											disabled: !showFocusZone,
											onChange: (e) => setFocusZonePosition(Number(e.target.value)),
											className: `w-full h-1.5 rounded-lg accent-amber-500 transition-opacity cursor-pointer ${showFocusZone ? "bg-zinc-800 opacity-100" : "bg-zinc-800/40 opacity-40 cursor-not-allowed"}`
										})
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-2 border-t border-zinc-800 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlipHorizontal, { className: "w-3.5 h-3.5 text-zinc-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-zinc-300 font-semibold",
										children: "Mirror Kaca Teleprompter:"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "switch",
									"aria-checked": isMirrored,
									onClick: () => setIsMirrored((m) => !m),
									title: isMirrored ? "Nonaktifkan Mode Mirror" : "Aktifkan Mode Mirror",
									className: `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${isMirrored ? "bg-amber-500" : "bg-zinc-700"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isMirrored ? "translate-x-5" : "translate-x-0"}`
									})
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				style: {
					backgroundColor: activeTheme.dockBg,
					borderTopColor: activeTheme.dockBorder
				},
				className: `no-tap-toggle relative z-30 px-2 sm:px-4 py-2 border-t shrink-0 pb-[max(env(safe-area-inset-bottom),8px)] transition-all duration-200 ${isPlaying ? "opacity-35 hover:opacity-100 focus-within:opacity-100" : "opacity-100"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-5xl mx-auto flex items-center justify-between gap-1 sm:gap-2.5 w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-[clamp(2px,0.8vw,6px)] shrink-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setHorizontalAlignment((prev) => prev === "center" ? "left" : prev === "left" ? "right" : "center");
									},
									className: "w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-2xs",
									title: `Pengatur Posisi Geser Teleprompter (${horizontalAlignment === "center" ? "Tengah" : horizontalAlignment === "left" ? "Kiri" : "Kanan"})`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Move, { className: "w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] text-amber-400" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setRotation((prev) => (prev + 90) % 360);
									},
									className: "w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer relative shadow-2xs shrink-0",
									title: `Ubah Orientasi Rotasi Teleprompter (${rotation}°)`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] text-amber-400" }), rotation !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "absolute -top-1 -right-1 text-[8px] font-bold bg-amber-500 text-black px-1 rounded-full leading-tight",
										children: [rotation, "°"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleReset,
									className: "w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer shrink-0",
									title: "Kembalikan Teks ke Posisi Awal (Reset / R)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] text-zinc-400" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden md:flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setSelectedConceptIndex(-1);
											handleReset();
										},
										className: `px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedConceptIndex === -1 ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"}`,
										children: "Semua"
									}), prompterConcepts.slice(0, 4).map((c, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setSelectedConceptIndex(idx);
											handleReset();
										},
										className: `px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedConceptIndex === idx ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"}`,
										children: ["#", idx + 1]
									}, c.id))]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-[clamp(2px,0.8vw,6px)] justify-center shrink-1 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center h-[clamp(24px,6.8vw,34px)] bg-zinc-900 rounded-xl border border-zinc-700 p-0.5 shadow-2xs shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSpeed((prev) => Math.max(1, prev - 1)),
											disabled: speed <= 1,
											className: "w-[clamp(16px,4.5vw,22px)] h-full flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors",
											title: "Perlambat Kecepatan",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "w-[clamp(10px,3vw,14px)] h-[clamp(10px,3vw,14px)]" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono font-bold text-[clamp(9px,2.6vw,12px)] px-1 text-amber-400 min-w-[20px] text-center",
											title: "Kecepatan Gulir",
											children: [speed, "x"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSpeed((prev) => Math.min(10, prev + 1)),
											disabled: speed >= 10,
											className: "w-[clamp(16px,4.5vw,22px)] h-full flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors",
											title: "Percepat Kecepatan",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-[clamp(10px,3vw,14px)] h-[clamp(10px,3vw,14px)]" })
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleTogglePlay,
									className: "w-[clamp(28px,8vw,38px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl font-extrabold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/25 transition-all cursor-pointer active:scale-95 shrink-0",
									title: isPlaying ? "Jeda Teks" : "Mulai Teks",
									children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] fill-black" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] fill-black ml-0.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleActivateFloating,
									className: "w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer shadow-2xs shrink-0",
									title: "Buka Mode Melayang (PiP OS / Di Atas Aplikasi Lain)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PictureInPicture2, { className: "w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] text-amber-400" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-[clamp(2px,0.8vw,6px)] shrink-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setIsSettingsOpen((prev) => !prev),
									className: `w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl border transition-all cursor-pointer shadow-2xs ${isSettingsOpen ? "bg-amber-500 text-black border-amber-500" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"}`,
									title: "Menu Pengaturan (Teks, Hitung Mundur, Layar)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)]" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleToggleFullscreen,
									className: "hidden md:flex w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer",
									title: "Layar Penuh",
									children: isFullscreen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "w-4 h-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleMinimize,
									className: "w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-2xs",
									title: "Minimize Teleprompter (-)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)]" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: onClose,
									className: "w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-red-500/25 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/60 shadow-2xs transition-all cursor-pointer shrink-0",
									title: "Tutup Teleprompter (Esc)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] stroke-[2.5]" })
								})
							]
						})
					]
				})
			})
		]
	})] });
};
// src/components/FloatingTeleprompter.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var SPEED_CURVE = [
	2.5,
	4.5,
	7.5,
	11,
	16,
	23,
	32,
	43,
	56,
	72
];
var FloatingTeleprompter = ({ isOpen, onClose, onExpandToFull, scripts, conceptIndex = -1, openToken = 0, productBrief, onOpenPermissionGuide, theme: propTheme, onSelectTheme }) => {
	const [internalTheme, setInternalTheme] = (0, import_react.useState)(() => getStoredPrompterTheme());
	const activeTheme = propTheme || internalTheme;
	(0, import_react.useEffect)(() => {
		if (propTheme) setInternalTheme(propTheme);
		else setInternalTheme(getStoredPrompterTheme());
	}, [propTheme, isOpen]);
	const [position, setPosition] = (0, import_react.useState)({
		x: 16,
		y: 32
	});
	const [size, setSize] = (0, import_react.useState)({
		width: 340,
		height: 440
	});
	const [isMinimized, setIsMinimized] = (0, import_react.useState)(false);
	const savedScrollTopRef = (0, import_react.useRef)(0);
	const handleMinimize = (0, import_react.useCallback)(() => {
		setIsPlaying(false);
		setIsCountingDown(false);
		if (scrollContainerRef.current) savedScrollTopRef.current = scrollContainerRef.current.scrollTop;
		setIsMinimized(true);
	}, []);
	const handleRestoreFromMinimize = (0, import_react.useCallback)(() => {
		setIsMinimized(false);
	}, []);
	(0, import_react.useEffect)(() => {
		if (isOpen) {
			setIsMinimized(false);
			setIsPlaying(false);
			setIsCountingDown(false);
			setIsSettingsOpen(false);
		}
	}, [
		isOpen,
		conceptIndex,
		openToken
	]);
	(0, import_react.useEffect)(() => {
		if (!isMinimized && isOpen && savedScrollTopRef.current > 0) {
			const raf = requestAnimationFrame(() => {
				if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = savedScrollTopRef.current;
			});
			return () => cancelAnimationFrame(raf);
		}
	}, [isMinimized, isOpen]);
	const [opacity, setOpacity] = (0, import_react.useState)(85);
	const [isSettingsOpen, setIsSettingsOpen] = (0, import_react.useState)(false);
	const [settingsTab, setSettingsTab] = (0, import_react.useState)("teks");
	const [isPlaying, setIsPlaying] = (0, import_react.useState)(false);
	const [isCountingDown, setIsCountingDown] = (0, import_react.useState)(false);
	const [countdownValue, setCountdownValue] = (0, import_react.useState)(3);
	const [countdownEnabled, setCountdownEnabled] = (0, import_react.useState)(true);
	const [countdownDuration, setCountdownDuration] = (0, import_react.useState)(3);
	const [speed, setSpeed] = (0, import_react.useState)(3);
	const [fontSize, setFontSize] = (0, import_react.useState)(18);
	const [isMirrored, setIsMirrored] = (0, import_react.useState)(false);
	const [rotation, setRotation] = (0, import_react.useState)(0);
	const [selectedConceptIdx, setSelectedConceptIdx] = (0, import_react.useState)(conceptIndex);
	const rotScale = import_react.useMemo(() => {
		if (rotation === 90 || rotation === 270) {
			const vw = typeof window !== "undefined" ? window.innerWidth : 360;
			const vh = typeof window !== "undefined" ? window.innerHeight : 640;
			const maxAllowedW = Math.max(200, vw - 16);
			const maxAllowedH = Math.max(160, vh - 16);
			const scaleW = size.height > maxAllowedW ? maxAllowedW / size.height : 1;
			const scaleH = size.width > maxAllowedH ? maxAllowedH / size.width : 1;
			return Math.min(scaleW, scaleH, 1);
		}
		return 1;
	}, [rotation, size]);
	const dynamicBtnSize = Math.max(20, Math.min(32, Math.floor((size.width - 24) / 10.2)));
	const dynamicIconSize = Math.max(10, Math.min(16, Math.floor(dynamicBtnSize * .46)));
	const [activePresetId, setActivePresetId] = (0, import_react.useState)("standard_read");
	const [showFocusGuide, setShowFocusGuide] = (0, import_react.useState)(true);
	const [focusGuidePosition, setFocusGuidePosition] = (0, import_react.useState)(12);
	const [tapFeedback, setTapFeedback] = (0, import_react.useState)(null);
	const widgetRef = (0, import_react.useRef)(null);
	const scrollContainerRef = (0, import_react.useRef)(null);
	const isDraggingRef = (0, import_react.useRef)(false);
	const isResizingRef = (0, import_react.useRef)(false);
	const dragStartOffsetRef = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const resizeStartRef = (0, import_react.useRef)({
		startX: 0,
		startY: 0,
		startW: 0,
		startH: 0
	});
	const animationFrameRef = (0, import_react.useRef)(null);
	const lastTimeRef = (0, import_react.useRef)(null);
	const scrollAccumulatorRef = (0, import_react.useRef)(0);
	const isPlayingRef = (0, import_react.useRef)(isPlaying);
	(0, import_react.useEffect)(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);
	(0, import_react.useEffect)(() => {
		setSelectedConceptIdx(conceptIndex);
	}, [conceptIndex]);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		const clampToScreen = () => {
			const vw = typeof window !== "undefined" ? window.innerWidth : 360;
			const vh = typeof window !== "undefined" ? window.innerHeight : 640;
			const maxW = Math.max(200, vw - 16);
			const maxH = Math.max(160, vh - 16);
			setSize((prevSize) => {
				return {
					width: Math.min(Math.max(200, prevSize.width), maxW),
					height: Math.min(Math.max(160, prevSize.height), maxH)
				};
			});
			setPosition((prevPos) => {
				const curW = isMinimized ? 160 : Math.min(340, maxW);
				const curH = isMinimized ? 50 : Math.min(440, maxH);
				const maxX = Math.max(8, vw - curW - 8);
				const maxY = Math.max(8, vh - curH - 8);
				return {
					x: Math.min(Math.max(8, prevPos.x), maxX),
					y: Math.min(Math.max(8, prevPos.y), maxY)
				};
			});
		};
		window.addEventListener("resize", clampToScreen);
		window.addEventListener("orientationchange", clampToScreen);
		clampToScreen();
		return () => {
			window.removeEventListener("resize", clampToScreen);
			window.removeEventListener("orientationchange", clampToScreen);
		};
	}, [isOpen, isMinimized]);
	const productKeywords = import_react.useMemo(() => {
		return extractProductKeywords(productBrief?.name);
	}, [productBrief?.name]);
	const prompterConcepts = import_react.useMemo(() => {
		return scripts.map((script, idx) => buildPrompterConcept(script, idx + 1, productKeywords));
	}, [scripts, productKeywords]);
	const activeConcepts = import_react.useMemo(() => {
		if (selectedConceptIdx >= 0 && selectedConceptIdx < prompterConcepts.length) return [prompterConcepts[selectedConceptIdx]];
		return prompterConcepts;
	}, [prompterConcepts, selectedConceptIdx]);
	const activePreset = import_react.useMemo(() => {
		return SUBTITLE_PRESETS.find((p) => p.id === activePresetId) || SUBTITLE_PRESETS[0];
	}, [activePresetId]);
	const pixelsPerSecond = SPEED_CURVE[Math.min(Math.max(1, speed), 10) - 1];
	const scrollStep = (0, import_react.useCallback)((timestamp) => {
		if (!lastTimeRef.current) lastTimeRef.current = timestamp;
		const deltaTime = timestamp - lastTimeRef.current;
		lastTimeRef.current = timestamp;
		if (isPlayingRef.current && scrollContainerRef.current) {
			const container = scrollContainerRef.current;
			const moveDistance = pixelsPerSecond * deltaTime / 1e3;
			scrollAccumulatorRef.current += moveDistance;
			if (scrollAccumulatorRef.current >= .5) {
				const delta = Math.floor(scrollAccumulatorRef.current);
				container.scrollTop += delta;
				scrollAccumulatorRef.current -= delta;
				const maxScroll = container.scrollHeight - container.clientHeight;
				if (container.scrollTop >= maxScroll - 2) {
					setIsPlaying(false);
					lastTimeRef.current = null;
					return;
				}
			}
		}
		if (isPlayingRef.current) animationFrameRef.current = requestAnimationFrame(scrollStep);
	}, [pixelsPerSecond]);
	(0, import_react.useEffect)(() => {
		if (isPlaying) {
			lastTimeRef.current = null;
			animationFrameRef.current = requestAnimationFrame(scrollStep);
		} else {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			lastTimeRef.current = null;
		}
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [isPlaying, scrollStep]);
	const handlePointerDownDrag = (e) => {
		if (e.target.closest("button, input, select")) return;
		isDraggingRef.current = true;
		dragStartOffsetRef.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y
		};
		e.target.setPointerCapture(e.pointerId);
	};
	const handlePointerDownMoveButton = (e) => {
		isDraggingRef.current = true;
		dragStartOffsetRef.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y
		};
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
	};
	const handlePointerMoveDrag = (e) => {
		if (!isDraggingRef.current) return;
		const maxX = Math.max(5, window.innerWidth - (isMinimized ? 290 : size.width) - 5);
		const maxY = Math.max(5, window.innerHeight - (isMinimized ? 44 : size.height) - 5);
		const newX = Math.min(Math.max(5, e.clientX - dragStartOffsetRef.current.x), maxX);
		const newY = Math.min(Math.max(5, e.clientY - dragStartOffsetRef.current.y), maxY);
		setPosition({
			x: newX,
			y: newY
		});
	};
	const handlePointerUpDrag = (e) => {
		isDraggingRef.current = false;
		try {
			e.target.releasePointerCapture(e.pointerId);
		} catch {}
	};
	const handleCyclePosition = () => {
		const maxX = Math.max(5, window.innerWidth - size.width - 10);
		const maxY = Math.max(5, window.innerHeight - size.height - 10);
		const presets = [
			{
				x: Math.max(10, Math.floor((window.innerWidth - size.width) / 2)),
				y: 40
			},
			{
				x: Math.max(10, maxX - 10),
				y: 80
			},
			{
				x: 15,
				y: Math.max(20, Math.floor((window.innerHeight - size.height) / 2))
			},
			{
				x: Math.max(10, Math.floor((window.innerWidth - size.width) / 2)),
				y: Math.max(40, maxY - 50)
			}
		];
		setPosition((prev) => {
			const nextIdx = (presets.findIndex((p) => Math.abs(p.x - prev.x) < 40 && Math.abs(p.y - prev.y) < 40) + 1) % presets.length;
			return presets[nextIdx];
		});
	};
	const handlePointerDownResize = (e) => {
		e.stopPropagation();
		isResizingRef.current = true;
		resizeStartRef.current = {
			startX: e.clientX,
			startY: e.clientY,
			startW: size.width,
			startH: size.height
		};
		e.target.setPointerCapture(e.pointerId);
	};
	const handlePointerMoveResize = (e) => {
		if (!isResizingRef.current) return;
		const dx = e.clientX - resizeStartRef.current.startX;
		const dy = e.clientY - resizeStartRef.current.startY;
		const maxAvailableW = Math.max(200, window.innerWidth - position.x - 8);
		const maxAvailableH = Math.max(160, window.innerHeight - position.y - 8);
		const newW = Math.min(Math.max(200, resizeStartRef.current.startW + dx), maxAvailableW);
		const newH = Math.min(Math.max(160, resizeStartRef.current.startH + dy), maxAvailableH);
		setSize({
			width: newW,
			height: newH
		});
	};
	const handlePointerUpResize = (e) => {
		isResizingRef.current = false;
		try {
			e.target.releasePointerCapture(e.pointerId);
		} catch {}
	};
	const triggerPlay = () => {
		if (countdownEnabled) {
			setIsCountingDown(true);
			setCountdownValue(countdownDuration);
			const timer = setInterval(() => {
				setCountdownValue((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						setIsCountingDown(false);
						setIsPlaying(true);
						setTapFeedback("play");
						setTimeout(() => setTapFeedback(null), 500);
						return countdownDuration;
					}
					return prev - 1;
				});
			}, 900);
		} else {
			setIsPlaying(true);
			setTapFeedback("play");
			setTimeout(() => setTapFeedback(null), 500);
		}
	};
	const handleScreenTap = (e) => {
		if (e.target.closest("button, input, select, .no-tap-toggle")) return;
		if (isPlaying) {
			setIsPlaying(false);
			setTapFeedback("pause");
			setTimeout(() => setTapFeedback(null), 500);
		} else if (isCountingDown) {
			setIsCountingDown(false);
			setIsPlaying(true);
			setTapFeedback("play");
			setTimeout(() => setTapFeedback(null), 500);
		} else {
			triggerPlay();
			setIsSettingsOpen(false);
		}
	};
	const handleReset = () => {
		setIsPlaying(false);
		setIsCountingDown(false);
		scrollAccumulatorRef.current = 0;
		if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [isMinimized && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			left: `${position.x}px`,
			top: `${position.y}px`,
			touchAction: "none",
			transform: rotation !== 0 ? `rotate(${rotation}deg)` : void 0,
			transformOrigin: "center center"
		},
		className: "fixed z-[9999] flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-[#1C1C1E] text-white border border-zinc-700 shadow-2xl select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onPointerDown: handlePointerDownMoveButton,
				onPointerMove: handlePointerMoveDrag,
				onPointerUp: handlePointerUpDrag,
				className: "p-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:bg-white/30 text-white cursor-grab active:cursor-grabbing touch-none select-none transition-all flex items-center justify-center shrink-0",
				title: "Tahan dan geser untuk memindahkan posisi teleprompter",
				"aria-label": "Geser posisi teleprompter",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Move, { className: "w-3.5 h-3.5 text-white/90" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "button",
				tabIndex: 0,
				onClick: handleRestoreFromMinimize,
				className: "flex items-center gap-2 cursor-pointer group pr-1 select-none",
				title: "Klik untuk membuka kembali ukuran semula",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-bold text-amber-300 tracking-wide group-hover:text-amber-200 transition-colors whitespace-nowrap",
					children: "teleprompter Gagaswara"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: handleRestoreFromMinimize,
				className: "p-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer shrink-0",
				title: "Buka kembali ukuran semula (pengaturan tersimpan penuh)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "w-3.5 h-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: (e) => {
					e.stopPropagation();
					setIsMinimized(false);
					onClose();
				},
				className: "p-1.5 rounded-[10px] bg-red-500/20 hover:bg-red-500 active:scale-95 text-red-300 hover:text-white transition-all cursor-pointer shrink-0",
				title: "Tutup Teleprompter",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: widgetRef,
		style: {
			display: isMinimized ? "none" : "flex",
			left: `${position.x}px`,
			top: `${position.y}px`,
			width: `${size.width}px`,
			height: `${size.height}px`,
			backgroundColor: activeTheme.id === "light_clean" ? `rgba(255, 255, 255, ${opacity / 100})` : activeTheme.id === "soft_comfort" ? `rgba(24, 24, 27, ${opacity / 100})` : `rgba(0, 0, 0, ${opacity / 100})`,
			color: activeTheme.textColor,
			touchAction: "none",
			transform: rotation !== 0 ? `rotate(${rotation}deg) scale(${rotScale})` : void 0,
			transformOrigin: "center center"
		},
		className: "fixed z-[9999] flex flex-col rounded-2xl border border-zinc-700/80 shadow-2xl select-none overflow-hidden transition-all duration-200",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onPointerDown: handlePointerDownDrag,
				onPointerMove: handlePointerMoveDrag,
				onPointerUp: handlePointerUpDrag,
				className: "w-full h-2 bg-zinc-800/40 hover:bg-amber-500/40 cursor-grab active:cursor-grabbing transition-colors shrink-0 flex items-center justify-center group",
				title: "Pegang strip ini untuk menggeser posisi teleprompter di layar",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8 h-1 rounded-full bg-zinc-600 group-hover:bg-amber-400 transition-colors" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onClick: handleScreenTap,
				className: "relative flex-1 overflow-hidden cursor-pointer",
				children: [
					showFocusGuide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { top: `${focusGuidePosition}%` },
						className: "pointer-events-none absolute left-0 right-0 z-20 -translate-y-1/2 flex items-center justify-between px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								background: `linear-gradient(90deg, ${activeTheme.highlightColor}aa, ${activeTheme.highlightColor}, ${activeTheme.highlightColor}aa)`,
								boxShadow: `0 0 8px ${activeTheme.highlightColor}88`
							},
							className: "flex-1 h-0.5"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: { color: activeTheme.highlightColor },
							className: "text-[10px] font-mono font-bold pl-1.5 drop-shadow-md",
							children: [focusGuidePosition, "%"]
						})]
					}),
					tapFeedback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-out fade-out zoom-out duration-400",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								borderColor: activeTheme.highlightColor,
								color: activeTheme.highlightColor
							},
							className: "p-4 rounded-full bg-black/90 border shadow-2xl",
							children: tapFeedback === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-7 h-7 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "w-7 h-7 fill-current" })
						})
					}),
					isCountingDown && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: (e) => {
							e.stopPropagation();
							setIsCountingDown(false);
							setIsPlaying(true);
						},
						className: "absolute inset-0 z-40 bg-black/85 flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-150",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: { color: activeTheme.highlightColor },
							className: "text-7xl font-black animate-bounce drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]",
							children: countdownValue
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[11px] text-zinc-300",
							children: "Ketuk untuk langsung mulai"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: scrollContainerRef,
						className: "w-full h-full overflow-y-auto px-3 pt-1 pb-16 scroll-smooth select-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								transform: isMirrored ? "scaleX(-1)" : void 0,
								transformOrigin: "center center"
							},
							className: "transition-transform duration-200",
							children: [activeConcepts.map((concept, cIdx) => {
								const parts = formatConceptDisplayParts(concept.conceptNumber, concept.title, concept.angle);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `space-y-4 mb-10 ${cIdx > 0 ? "mt-16 pt-10 border-t border-dashed border-white/20" : ""}`,
									children: [
										cIdx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-full my-3 flex items-center justify-center select-none",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full border-t border-dashed border-white/20" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												backgroundColor: activeTheme.cardBg,
												borderColor: activeTheme.cardBorder,
												color: activeTheme.cardTextColor
											},
											className: "w-full my-3 p-3 rounded-xl border-2 shadow-md flex items-start justify-between gap-2.5 select-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start gap-2.5 min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: { backgroundColor: activeTheme.highlightColor },
													className: "w-2.5 h-2.5 rounded-full ring-2 ring-black/10 shrink-0 mt-1"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0 flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: { color: activeTheme.highlightColor },
														className: "text-[11px] font-black tracking-wider uppercase leading-tight",
														children: parts.line1
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
														style: { color: activeTheme.cardTextColor },
														className: "text-xs sm:text-sm font-bold tracking-tight leading-snug mt-0.5 break-words",
														children: parts.line2
													})]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													color: activeTheme.secondaryTextColor,
													backgroundColor: activeTheme.id === "light_clean" ? "#E4E4E7" : "#27272A",
													borderColor: activeTheme.cardBorder
												},
												className: "text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 mt-0.5",
												children: [
													"±",
													concept.estimatedDuration,
													"s"
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-4 sm:space-y-5",
											children: concept.lines.map((line, lIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: `${fontSize}px`,
													lineHeight: activePreset.lineHeight || "1.45",
													letterSpacing: activePreset.letterSpacing || "normal",
													color: activeTheme.textColor,
													textShadow: activeTheme.id === "light_clean" ? "none" : activePreset.textShadow,
													fontWeight: activePreset.fontWeight,
													backgroundColor: activePreset.pillBg || "transparent"
												},
												className: `transition-all duration-150 ${activePreset.pillBg ? "px-2.5 py-1 rounded-xl " + (activePreset.borderClass || "") : ""}`,
												children: line.tokens.map((token, tIdx) => {
													if (token.type === "emphasis" || token.type === "promo" || token.type === "cta") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														style: { color: activePreset.highlightColor },
														className: "font-black uppercase tracking-wider",
														children: [token.text, " "]
													}, tIdx);
													if (token.type === "pause-short") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														style: { color: activePreset.highlightColor },
														className: "font-bold mx-1 opacity-80 select-none",
														title: "Jeda Intonasi",
														children: ["/", " "]
													}, tIdx);
													if (token.type === "pause-long") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														style: { color: activePreset.highlightColor },
														className: "font-black mx-1.5 opacity-90 select-none",
														title: "Jeda Intonasi Panjang",
														children: ["//", " "]
													}, tIdx);
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [token.text, " "] }, tIdx);
												})
											}, line.id || lIdx))
										})
									]
								}, concept.id || cIdx);
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-44 flex items-center justify-center text-[10px] text-zinc-500 font-medium",
								children: "- Selesai Membaca -"
							})]
						})
					})
				]
			}),
			isSettingsOpen && !isPlaying && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-tap-toggle absolute bottom-16 right-2 z-40 w-[75vw] max-w-[340px] bg-zinc-900 border border-zinc-700 rounded-2xl p-3 shadow-2xl space-y-2.5 text-xs text-zinc-200 animate-in slide-in-from-right-2 duration-150 max-h-[75%] overflow-y-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between pb-1.5 border-b border-zinc-700/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-amber-400 text-xs flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pengaturan Teleprompter" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setIsSettingsOpen(false),
							className: "p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/70 cursor-pointer transition-colors",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-700/80",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSettingsTab("teks"),
								className: `flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs ${settingsTab === "teks" ? "bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40" : "bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Teks" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSettingsTab("tema"),
								className: `flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs ${settingsTab === "tema" ? "bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40" : "bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tema" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSettingsTab("countdown"),
								className: `flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs ${settingsTab === "countdown" ? "bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40" : "bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Countdown" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSettingsTab("layar"),
								className: `flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs ${settingsTab === "layar" ? "bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40" : "bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Layar" })]
							})
						]
					}),
					settingsTab === "teks" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-[11px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-zinc-400 font-semibold",
									children: "Ukuran Font (Mulai dari 7px):"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono font-bold text-amber-400",
									children: [fontSize, "px"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: "7",
									max: "48",
									value: fontSize,
									onChange: (e) => setFontSize(Number(e.target.value)),
									className: "w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-zinc-400 block font-medium",
								children: "Pilih 10 Gaya Subtitle Siap Rekam:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1",
								children: SUBTITLE_PRESETS.map((preset) => {
									const isSelected = preset.id === activePresetId;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setActivePresetId(preset.id),
										className: `flex items-center justify-between p-1.5 rounded-xl text-left transition-all cursor-pointer ${isSelected ? "bg-amber-500/20 border border-amber-500/60" : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: preset.textColor,
													textShadow: preset.textShadow,
													fontWeight: preset.fontWeight
												},
												className: "text-xs px-1.5 py-0.5 rounded bg-black/70 border border-zinc-700 font-bold shrink-0",
												children: "Aa"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-white truncate",
												children: preset.name
											})]
										}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5 text-amber-400 shrink-0" })]
									}, preset.id);
								})
							})]
						})]
					}),
					settingsTab === "tema" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-[11px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-zinc-300 font-semibold",
									children: "Tema Teleprompter:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-amber-400",
									children: activeTheme.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-3 gap-1.5 mt-1.5",
								children: Object.values(TELEPROMPTER_THEMES).map((t) => {
									const isSelected = activeTheme.id === t.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											const updated = saveStoredPrompterTheme(t.id);
											setInternalTheme(updated);
											if (onSelectTheme) onSelectTheme(t.id);
										},
										className: `p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${isSelected ? "bg-zinc-800 border-amber-500 shadow-md ring-1 ring-amber-500/50" : "bg-zinc-950/80 border-zinc-800 hover:border-zinc-700"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: { backgroundColor: t.previewSwatch.bg },
											className: "w-7 h-7 rounded-full border border-white/20 flex items-center justify-center relative shadow-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { color: t.previewSwatch.text },
												className: "text-[10px] font-black",
												children: "T"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { backgroundColor: t.previewSwatch.highlight },
												className: "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-1 ring-black"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `text-[10px] font-bold whitespace-nowrap ${isSelected ? "text-white" : "text-zinc-400"}`,
											children: t.name
										})]
									}, t.id);
								})
							})]
						})
					}),
					settingsTab === "countdown" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "w-3.5 h-3.5 text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-zinc-300 font-semibold",
									children: "Hitung Mundur (Countdown):"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								role: "switch",
								"aria-checked": countdownEnabled,
								onClick: () => setCountdownEnabled((e) => !e),
								title: countdownEnabled ? "Nonaktifkan Hitung Mundur" : "Aktifkan Hitung Mundur",
								className: `relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${countdownEnabled ? "bg-amber-500" : "bg-zinc-700"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${countdownEnabled ? "translate-x-5" : "translate-x-0"}`
								})
							})]
						}), countdownEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 pt-2 border-t border-zinc-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-zinc-400 block font-medium",
								children: "Pilih Durasi:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-1.5",
								children: [
									3,
									5,
									10
								].map((sec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setCountdownDuration(sec),
									className: `flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${countdownDuration === sec ? "bg-amber-500 text-black border-amber-500 shadow-xs" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"}`,
									children: [sec, " Detik"]
								}, sec))
							})]
						})]
					}),
					settingsTab === "layar" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-[11px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-zinc-400",
										children: "Transparansi Latar Belakang:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono font-bold text-amber-400",
										children: [opacity, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: "10",
									max: "100",
									value: opacity,
									onChange: (e) => setOpacity(Number(e.target.value)),
									className: "w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1 pt-1.5 border-t border-zinc-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-[11px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-zinc-400 font-semibold",
										children: "Garis Panduan Kamera:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono font-bold text-amber-400",
										children: [focusGuidePosition, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5 pt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										role: "switch",
										"aria-checked": showFocusGuide,
										onClick: () => setShowFocusGuide((g) => !g),
										title: showFocusGuide ? "Nonaktifkan Garis Panduan" : "Aktifkan Garis Panduan",
										className: `relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${showFocusGuide ? "bg-amber-500" : "bg-zinc-700"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${showFocusGuide ? "translate-x-5" : "translate-x-0"}`
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1 flex items-center min-w-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											min: "5",
											max: "75",
											value: focusGuidePosition,
											disabled: !showFocusGuide,
											onChange: (e) => setFocusGuidePosition(Number(e.target.value)),
											className: `w-full h-1.5 rounded-lg accent-amber-500 transition-opacity cursor-pointer ${showFocusGuide ? "bg-zinc-800 opacity-100" : "bg-zinc-800/40 opacity-40 cursor-not-allowed"}`
										})
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-1.5 border-t border-zinc-800 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlipHorizontal, { className: "w-3.5 h-3.5 text-zinc-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-zinc-400",
										children: "Mirror Kaca Teleprompter:"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "switch",
									"aria-checked": isMirrored,
									onClick: () => setIsMirrored((m) => !m),
									title: isMirrored ? "Nonaktifkan Mode Mirror" : "Aktifkan Mode Mirror",
									className: `relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${isMirrored ? "bg-amber-500" : "bg-zinc-700"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isMirrored ? "translate-x-5" : "translate-x-0"}`
									})
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onPointerDown: handlePointerDownDrag,
				onPointerMove: handlePointerMoveDrag,
				onPointerUp: handlePointerUpDrag,
				style: {
					backgroundColor: activeTheme.dockBg,
					borderTopColor: activeTheme.dockBorder,
					color: activeTheme.textColor
				},
				className: `no-tap-toggle w-full px-2 py-1.5 border-t shrink-0 transition-all duration-200 cursor-grab active:cursor-grabbing ${isPlaying ? "opacity-35 hover:opacity-100" : "opacity-100"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-1 w-full overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 shrink-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onPointerDown: handlePointerDownMoveButton,
									onPointerMove: handlePointerMoveDrag,
									onPointerUp: handlePointerUpDrag,
									onClick: handleCyclePosition,
									style: {
										width: `${dynamicBtnSize}px`,
										height: `${dynamicBtnSize}px`
									},
									className: "flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-grab active:cursor-grabbing shrink-0 shadow-2xs",
									title: "Pengatur Posisi (Geser Teleprompter: Tekan & Geser, atau Ketuk untuk Pindah Posisi)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Move, {
										style: {
											width: `${dynamicIconSize}px`,
											height: `${dynamicIconSize}px`
										},
										className: "text-amber-400"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setRotation((prev) => (prev + 90) % 360),
									style: {
										width: `${dynamicBtnSize}px`,
										height: `${dynamicBtnSize}px`
									},
									className: "flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 relative shadow-2xs",
									title: `Ubah Orientasi Rotasi Teleprompter (${rotation}°)`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, {
										style: {
											width: `${dynamicIconSize}px`,
											height: `${dynamicIconSize}px`
										},
										className: "text-amber-400"
									}), rotation !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "absolute -top-1 -right-1 text-[7px] font-bold bg-amber-500 text-black px-1 rounded-full leading-tight",
										children: [rotation, "°"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleReset,
									style: {
										width: `${dynamicBtnSize}px`,
										height: `${dynamicBtnSize}px`
									},
									className: "flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-2xs",
									title: "Kembalikan Teks ke Paling Atas (Reset)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { style: {
										width: `${dynamicIconSize}px`,
										height: `${dynamicIconSize}px`
									} })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 shrink-1 min-w-0 justify-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { height: `${dynamicBtnSize}px` },
									className: "flex items-center bg-zinc-900 rounded-xl border border-zinc-700 p-0.5 shadow-2xs shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSpeed((prev) => Math.max(1, prev - 1)),
											disabled: speed <= 1,
											style: { width: `${Math.round(dynamicBtnSize * .72)}px` },
											className: "h-full flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors",
											title: "Perlambat Kecepatan",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { style: {
												width: `${Math.max(9, Math.round(dynamicIconSize * .85))}px`,
												height: `${Math.max(9, Math.round(dynamicIconSize * .85))}px`
											} })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: { fontSize: `${Math.max(9, Math.round(dynamicBtnSize * .38))}px` },
											className: "font-mono font-bold px-1 text-amber-400 min-w-[18px] text-center",
											title: "Kecepatan Gulir",
											children: [speed, "x"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSpeed((prev) => Math.min(10, prev + 1)),
											disabled: speed >= 10,
											style: { width: `${Math.round(dynamicBtnSize * .72)}px` },
											className: "h-full flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors",
											title: "Percepat Kecepatan",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { style: {
												width: `${Math.max(9, Math.round(dynamicIconSize * .85))}px`,
												height: `${Math.max(9, Math.round(dynamicIconSize * .85))}px`
											} })
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										if (isPlaying) setIsPlaying(false);
										else triggerPlay();
									},
									style: {
										width: `${Math.round(dynamicBtnSize * 1.15)}px`,
										height: `${dynamicBtnSize}px`
									},
									className: "flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-md shadow-amber-500/25 transition-all cursor-pointer active:scale-95 shrink-0",
									title: isPlaying ? "Jeda Teks" : "Mulai Jalankan Teks",
									children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
										style: {
											width: `${dynamicIconSize}px`,
											height: `${dynamicIconSize}px`
										},
										className: "fill-black"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
										style: {
											width: `${dynamicIconSize}px`,
											height: `${dynamicIconSize}px`
										},
										className: "fill-black ml-0.5"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: onExpandToFull,
									style: {
										width: `${dynamicBtnSize}px`,
										height: `${dynamicBtnSize}px`
									},
									className: "flex items-center justify-center rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer shadow-2xs shrink-0",
									title: "Kembali ke Mode Teleprompter Layar Penuh (Full)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, {
										style: {
											width: `${dynamicIconSize}px`,
											height: `${dynamicIconSize}px`
										},
										className: "text-amber-400"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 shrink-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setIsSettingsOpen((prev) => !prev),
									style: {
										width: `${dynamicBtnSize}px`,
										height: `${dynamicBtnSize}px`
									},
									className: `flex items-center justify-center rounded-xl border transition-all cursor-pointer shadow-2xs ${isSettingsOpen ? "bg-amber-500 text-black border-amber-500" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"}`,
									title: "Menu Pengaturan (Teks, Hitung Mundur, Layar)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { style: {
										width: `${dynamicIconSize}px`,
										height: `${dynamicIconSize}px`
									} })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleMinimize,
									style: {
										width: `${dynamicBtnSize}px`,
										height: `${dynamicBtnSize}px`
									},
									className: "flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-2xs",
									title: "Minimize Teleprompter (-)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { style: {
										width: `${dynamicIconSize}px`,
										height: `${dynamicIconSize}px`
									} })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: onClose,
									style: {
										width: `${dynamicBtnSize}px`,
										height: `${dynamicBtnSize}px`
									},
									className: "flex items-center justify-center rounded-xl bg-red-500/25 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/60 shadow-2xs transition-all cursor-pointer shrink-0",
									title: "Tutup Teleprompter",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
										style: {
											width: `${dynamicIconSize}px`,
											height: `${dynamicIconSize}px`
										},
										className: "stroke-[2.5]"
									})
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onPointerDown: handlePointerDownResize,
				onPointerMove: handlePointerMoveResize,
				onPointerUp: handlePointerUpResize,
				className: "absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-50 flex items-end justify-end p-1 text-zinc-500 hover:text-amber-400 touch-none",
				title: "Geser sudut ini untuk memperbesar / memperkecil ukuran jendela",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 6 6",
					className: "w-3 h-3 fill-current",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "5",
							cy: "5",
							r: "0.8"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "3",
							cy: "5",
							r: "0.8"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "5",
							cy: "3",
							r: "0.8"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "1",
							cy: "5",
							r: "0.8"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "3",
							cy: "3",
							r: "0.8"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "5",
							cy: "1",
							r: "0.8"
						})
					]
				})
			})
		]
	})] });
};
// src/components/AndroidOverlayModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var AndroidOverlayModal = ({ isOpen, onClose, onStartFloatingWidget, sampleScriptText = "Halo sahabat kreator! Ini adalah tampilan teleprompter melayang di atas aplikasi lain (Kamera, TikTok, atau CapCut). Naskah akan bergulir otomatis sesuai kecepatan yang Anda tentukan di setelan." }) => {
	const [activeTab, setActiveTab] = (0, import_react.useState)("settings");
	const [isCopied, setIsCopied] = (0, import_react.useState)(false);
	const [isAndroidBridgeAvailable, setIsAndroidBridgeAvailable] = (0, import_react.useState)(false);
	const [hasOverlayPermission, setHasOverlayPermission] = (0, import_react.useState)(false);
	const [config, setConfig] = (0, import_react.useState)(() => loadAndroidPrompterConfig());
	const [themeDropdownOpen, setThemeDropdownOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined" && window.AndroidFloatingBridge) {
			setIsAndroidBridgeAvailable(true);
			try {
				const hasPerm = window.AndroidFloatingBridge.checkOverlayPermission?.();
				setHasOverlayPermission(Boolean(hasPerm));
			} catch {}
		}
	}, [isOpen]);
	const handleUpdateConfig = (newCfg) => {
		setConfig((prev) => {
			const updated = {
				...prev,
				...newCfg
			};
			saveAndroidPrompterConfig(updated);
			return updated;
		});
	};
	const buildCommand = `bash build-apk.sh`;
	const handleCopyCommand = () => {
		navigator.clipboard.writeText(buildCommand);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2e3);
	};
	const handleRequestAndroidPermission = () => {
		if (typeof window !== "undefined" && window.AndroidFloatingBridge) window.AndroidFloatingBridge.requestOverlayPermission();
		else {
			onStartFloatingWidget();
			onClose();
		}
	};
	const handleStartFloating = () => {
		if (isAndroidBridgeAvailable) {
			if (launchAndroidFloatingPrompter(sampleScriptText, config)) {
				onClose();
				return;
			}
		}
		onStartFloatingWidget();
		onClose();
	};
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 animate-in fade-in duration-150",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 shadow-2xl text-slate-900 dark:text-white overflow-hidden flex flex-col max-h-[92vh]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-5 h-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm sm:text-base font-bold text-slate-900 dark:text-white",
							children: "Setelan Teleprompter Melayang Android"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-slate-500 dark:text-zinc-400",
							children: "Konfigurasi tampilan prompter di atas aplikasi kamera & TikTok"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/50 px-4 sm:px-6 overflow-x-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveTab("settings"),
							className: `py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === "settings" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1. Setelan Prompter" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveTab("permission"),
							className: `py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === "permission" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2. Izin Layar Sistem" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveTab("apkGuide"),
							className: `py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === "apkGuide" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode2, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3. Panduan Build APK" })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs text-zinc-300",
					children: [
						activeTab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { backgroundColor: `rgba(0, 0, 0, ${config.opacity / 100})` },
									className: "relative rounded-2xl p-4 border border-zinc-700/80 shadow-lg space-y-2 overflow-hidden transition-all",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "w-full flex items-center justify-between pb-1 border-b border-white/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 text-[10px] text-amber-400 font-bold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pratinjau Prompter Melayang Android" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] text-zinc-400 font-mono",
												children: [
													config.speed,
													"x | ",
													config.fontSize,
													"sp | ",
													config.opacity,
													"%"
												]
											})]
										}),
										config.showFocusGuide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative py-1 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-0.5 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[9px] font-bold text-amber-300 font-mono",
												children: [config.focusGuidePercent, "% Lensa Kamera"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											style: {
												color: config.textColorHex,
												fontSize: `${config.fontSize}px`,
												transform: config.isMirrored ? "scaleX(-1)" : "none"
											},
											className: "leading-snug font-medium font-sans drop-shadow-sm transition-all",
											children: "\"Ini lampu meja lipat LED portable yang praktis banget. Desainnya ringkas dan adem di mata...\""
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "pt-2 flex items-center justify-between text-[10px] text-zinc-400 border-t border-white/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kontrol Lengkap (Speed +/-, Font, Play/Pause, ⚙️ Setelan)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-amber-400",
												children: "Siap Rekam"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-white flex items-center gap-1.5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kecepatan Gulir Otomatis:" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-amber-400 text-sm",
												children: [config.speed, "x"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleUpdateConfig({ speed: Math.max(1, config.speed - 1) }),
													className: "w-8 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 font-bold text-white text-sm flex items-center justify-center cursor-pointer",
													children: "-"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "range",
													min: "1",
													max: "10",
													value: config.speed,
													onChange: (e) => handleUpdateConfig({ speed: Number(e.target.value) }),
													className: "flex-1 accent-amber-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleUpdateConfig({ speed: Math.min(10, config.speed + 1) }),
													className: "w-8 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 font-bold text-white text-sm flex items-center justify-center cursor-pointer",
													children: "+"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-zinc-400",
											children: "Speed 1-3 sangat tenang & pas untuk rekaman natural. Speed 4-7 untuk tempo cepat."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold text-white flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, { className: "w-3.5 h-3.5 text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ukuran Huruf:" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-amber-400",
												children: [config.fontSize, "sp"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											min: "12",
											max: "34",
											value: config.fontSize,
											onChange: (e) => handleUpdateConfig({ fontSize: Number(e.target.value) }),
											className: "w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold text-white flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "w-3.5 h-3.5 text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Transparansi Latar:" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-amber-400",
												children: [config.opacity, "%"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											min: "20",
											max: "100",
											value: config.opacity,
											onChange: (e) => handleUpdateConfig({ opacity: Number(e.target.value) }),
											className: "w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-white flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "w-4 h-4 text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tema Teleprompter Melayang:" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-zinc-400 font-bold uppercase",
											children: "Pilihan"
										})]
									}), (() => {
										const currentThemeId = config.themeId || "dark_pro";
										const activeTheme = TELEPROMPTER_THEMES[currentThemeId] || TELEPROMPTER_THEMES.dark_pro;
										const themesList = Object.values(TELEPROMPTER_THEMES);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setThemeDropdownOpen(!themeDropdownOpen),
												className: "w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-[0.99]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2.5 min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														style: { backgroundColor: activeTheme.previewSwatch.bg },
														className: "w-6 h-6 rounded-full flex items-center justify-center border border-zinc-500 shadow-xs shrink-0 relative overflow-hidden",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															style: { color: activeTheme.previewSwatch.text },
															className: "text-[10px] font-black",
															children: "T"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															style: { backgroundColor: activeTheme.previewSwatch.highlight },
															className: "absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "min-w-0 text-left",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-xs font-bold text-white",
																children: activeTheme.name
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300",
																children: "Aktif"
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-[10px] text-zinc-400 truncate mt-0.5",
															children: activeTheme.tagline
														})]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-1.5 ${themeDropdownOpen ? "rotate-180 text-amber-400" : ""}` })]
											}), themeDropdownOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "pt-1.5 space-y-1 animate-in fade-in duration-150",
												children: themesList.map((t) => {
													const isSelected = currentThemeId === t.id;
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														onClick: () => {
															handleUpdateConfig({
																themeId: t.id,
																textColorHex: t.textColor,
																backgroundColorHex: t.backgroundColor,
																highlightColorHex: t.highlightColor
															});
															saveStoredPrompterTheme(t.id);
															setThemeDropdownOpen(false);
														},
														className: `w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${isSelected ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50" : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"}`,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-2 min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																style: { backgroundColor: t.previewSwatch.bg },
																className: "w-5 h-5 rounded-full flex items-center justify-center border border-zinc-500 shadow-xs shrink-0 relative overflow-hidden",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	style: { color: t.previewSwatch.text },
																	className: "text-[9px] font-bold",
																	children: "T"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	style: { backgroundColor: t.previewSwatch.highlight },
																	className: "absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ring-1 ring-white"
																})]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "min-w-0",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-xs font-semibold block",
																	children: t.name
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[9px] text-zinc-400 block truncate",
																	children: t.tagline
																})]
															})]
														}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-amber-400 shrink-0 stroke-[2.5]" })]
													}, t.id);
												})
											})]
										});
									})()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-3 gap-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => handleUpdateConfig({ showFocusGuide: !config.showFocusGuide }),
											className: `p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${config.showFocusGuide ? "bg-amber-500/20 border-amber-500/80 text-white" : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between font-bold text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Garis Tatap Mata" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: config.showFocusGuide ? "On" : "Off" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-zinc-400",
												children: "Menjaga tatapan fokus ke kamera"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => handleUpdateConfig({ isMirrored: !config.isMirrored }),
											className: `p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${config.isMirrored ? "bg-amber-500/20 border-amber-500/80 text-white" : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between font-bold text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mode Cermin (Mirror)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: config.isMirrored ? "On" : "Off" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-zinc-400",
												children: "Untuk teleprompter kaca rig"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												const nextSec = config.countdownSec === 3 ? 5 : config.countdownSec === 5 ? 0 : 3;
												handleUpdateConfig({ countdownSec: nextSec });
											},
											className: "p-3 rounded-xl border border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-750 text-left transition-all cursor-pointer space-y-1 text-white",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between font-bold text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Countdown" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-amber-400 font-mono",
													children: config.countdownSec > 0 ? `${config.countdownSec}s` : "Langsung"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-zinc-400",
												children: "Hitung mundur sebelum naskah jalan"
											})]
										})
									]
								})
							]
						}),
						activeTab === "permission" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 font-bold text-amber-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Izin: Menampilkan di Atas Aplikasi Lain (SYSTEM_ALERT_WINDOW)" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-amber-200/90 leading-relaxed",
									children: "Pada Android, aplikasi teleprompter membutuhkan izin khusus agar jendelanya bisa tetap terlihat melayang saat Anda membuka kamera bawaan ponsel, aplikasi TikTok, Shopee Video, atau CapCut."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-xs font-bold uppercase tracking-wider text-zinc-300",
									children: "Status Izin di Perangkat Anda:"
								}), isAndroidBridgeAvailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `w-2.5 h-2.5 rounded-full ${hasOverlayPermission ? "bg-emerald-400" : "bg-amber-400"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Status: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hasOverlayPermission ? "Izin Sudah Aktif ✓" : "Belum Diberikan" })] })]
										}),
										!hasOverlayPermission ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: handleRequestAndroidPermission,
											className: "px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all cursor-pointer",
											children: "Buka Pengaturan Izin Tampil di Atas Aplikasi Lain"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-emerald-400",
											children: "✓ Izin overlay sistem aktif. Saat Anda menekan \"Mulai Teleprompter Melayang\", aplikasi otomatis diminimalkan dan jendela prompter akan tetap aktif di atas kamera atau TikTok."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "pt-2 border-t border-zinc-700/60 space-y-2 text-[11px] text-zinc-400",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-zinc-300",
													children: "📱 Khusus Pengguna Xiaomi (MIUI/HyperOS), Vivo, Oppo, atau Realme:"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
													"Jika prompter hilang saat diminimalkan, aktifkan izin: ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "\"Tampilkan jendela pop-up saat berjalan di latar belakang\"" }),
													" pada Pengaturan Aplikasi."
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: openAndroidAppDetails,
													className: "px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-medium text-[11px] cursor-pointer",
													children: "Buka Info Aplikasi (Setelan Izin Latar Belakang)"
												})
											]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-zinc-400 leading-relaxed",
									children: [
										"Aplikasi saat ini diakses via peramban web. Di mode web, Anda dapat langsung menggunakan ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Widget Melayang Web" }),
										" atau Picture-in-Picture."
									]
								})]
							})]
						}),
						activeTab === "apkGuide" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200/80 dark:border-zinc-700 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode2, { className: "w-4 h-4" }), "Sistem Integrasi Native Otomatis:"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "text-xs text-slate-600 dark:text-zinc-300 space-y-1.5 list-disc list-inside",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "build-apk.sh" }),
											": Skrip otomatis dengan path absolut yang mendukung macOS dan Linux tanpa error path ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "./gradlew" }),
											"."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "scripts/patch-android.js" }),
											": Menjaga ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "FloatingPrompterService.java" }),
											", bridge ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "MainActivity.java" }),
											", dan izin AndroidManifest agar tidak pernah terhapus saat menjalankan ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "npx cap sync" }),
											" atau ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "cap add" }),
											"."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Foreground Service (Special Use)" }), ": Layanan latar belakang permanen dengan tipe resmi Android 14+ agar prompter tidak tertutup saat aplikasi diminimalkan."] })
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-bold text-slate-800 dark:text-zinc-200",
											children: "Perintah Kompilasi APK (Terminal):"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: handleCopyCommand,
											className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer",
											children: [isCopied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isCopied ? "Tersalin" : "Salin Perintah" })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
										className: "p-3 rounded-xl bg-slate-900 dark:bg-black border border-slate-800 dark:border-zinc-800 font-mono text-xs text-amber-400 overflow-x-auto leading-relaxed",
										children: buildCommand
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-slate-500 dark:text-zinc-400",
										children: [
											"File APK Debug akan tersimpan di:",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
												className: "text-slate-700 dark:text-zinc-300",
												children: "android/app/build/outputs/apk/debug/app-debug.apk"
											})
										]
									})
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer",
						children: "Tutup"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleStartFloating,
						className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-4 h-4 fill-slate-950" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mulai Teleprompter Melayang" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })
						]
					})]
				})
			]
		})
	});
};
// src/components/OverlayPermissionModal.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var OverlayPermissionModal = ({ isOpen, onClose, isAndroid, hasPermission, onRequestAndroidPermission, onLaunchPrompter }) => {
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 shadow-2xl text-slate-900 dark:text-white overflow-hidden flex flex-col animate-in zoom-in-95 duration-150",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-800/60",
							children: isAndroid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-5 h-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "w-5 h-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight",
							children: isAndroid ? "Izin Tampil di Atas Aplikasi Lain" : "Mode Teleprompter Melayang"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-500 dark:text-zinc-400 mt-0.5",
							children: isAndroid ? "Diperlukan untuk merekam dengan kamera/TikTok" : "Fitur siap digunakan"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors",
						"aria-label": "Tutup",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-5 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-zinc-300",
					children: isAndroid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "w-4 h-4 text-amber-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Izin Akses Khusus Android" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-amber-900/80 dark:text-amber-200/90 leading-relaxed",
							children: [
								"Agar jendela teleprompter Gagaswara dapat tetap melayang saat Anda membuka kamera HP, aplikasi TikTok, Shopee, atau CapCut, Android mewajibkan izin ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\"Tampil di atas aplikasi lain\"" }),
								"."
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-bold text-slate-900 dark:text-white",
							children: "Langkah Mudah Mengaktifkan:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
										children: "1"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px]",
										children: [
											"Tekan tombol ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Buka Pengaturan Android" }),
											" di bawah ini."
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
										children: "2"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px]",
										children: [
											"Temukan aplikasi ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Gagaswara" }),
											" dan aktifkan sakelar izin."
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
										children: "3"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px]",
										children: "Kembali ke aplikasi ini, dan teleprompter melayang akan langsung aktif!"
									})]
								})
							]
						})]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-4 h-4 text-blue-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mode Teleprompter Melayang Aktif" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-blue-900/80 dark:text-blue-200/90 leading-relaxed",
							children: "Pada versi peramban Web, jendela teleprompter dapat Anda geser (drag), perkecil/perbesar ukuran, atau gunakan tombol Picture-in-Picture (PiP)."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 space-y-1 text-[11px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold text-slate-900 dark:text-white flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-3.5 h-3.5 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Untuk Aplikasi Native Android:" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-slate-500 dark:text-zinc-400",
								children: "Pada file APK di smartphone Android, teleprompter dapat melayang secara permanen di atas aplikasi kamera atau TikTok saat merekam video."
							})]
						})
					})] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E] flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer",
						children: "Tutup"
					}), isAndroid ? hasPermission ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							onClose();
							onLaunchPrompter();
						},
						className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mulai Teleprompter Melayang" })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onRequestAndroidPermission,
						className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-4 h-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Buka Pengaturan Android" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							onClose();
							onLaunchPrompter();
						},
						className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-4 h-4 fill-white" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mulai Mode Melayang" })]
					})]
				})
			]
		})
	});
};
// src/components/FloatingBottomNav.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var FloatingBottomNavComponent = ({ currentStep, onStepChange, isBriefUnlocked, isBriefApproved, isConfigUnlocked, isScriptsUnlocked, scriptsCount, onAnalyze, isAnalyzing, isInputValid, onApproveBrief, isBriefValid, onGenerate, isGenerating, isAuthLocked = false, onRequireAuthOrKey, onOpenTeleprompter }) => {
	const getChevronStyle = (index) => {
		const slant = "5px";
		if (index === 0) return { clipPath: `polygon(0% 0%, calc(100% - ${slant}) 0%, 100% 50%, calc(100% - ${slant}) 100%, 0% 100%)` };
		if (index === 3) return { clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, ${slant} 50%)` };
		return { clipPath: `polygon(0% 0%, calc(100% - ${slant}) 0%, 100% 50%, calc(100% - ${slant}) 100%, 0% 100%, ${slant} 50%)` };
	};
	const handleStep1 = () => {
		if (currentStep === 1) {
			if (!isAnalyzing && isInputValid) onAnalyze();
		} else onStepChange(1);
	};
	const handleStep2 = () => {
		if (!isBriefUnlocked) return;
		if (currentStep === 2) {
			if (isBriefValid) onApproveBrief();
		} else onStepChange(2);
	};
	const handleStep3 = () => {
		if (!isConfigUnlocked) return;
		if (currentStep === 3) {
			if (isAuthLocked && onRequireAuthOrKey) {
				onRequireAuthOrKey();
				return;
			}
			if (!isGenerating) onGenerate();
		} else onStepChange(3);
	};
	const handleStep4 = () => {
		if (!isScriptsUnlocked) return;
		if (currentStep === 4) onOpenTeleprompter();
		else onStepChange(4);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed bottom-3 sm:bottom-4 inset-x-0 mx-auto max-w-lg px-3 sm:px-4 z-40 pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			"aria-label": "Tahapan Alur Gagaswara",
			className: "pointer-events-auto w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 shadow-xl rounded-2xl p-1.5 flex items-stretch gap-1.5 select-none",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleStep1,
					style: getChevronStyle(0),
					className: `flex-1 h-12 py-1 pl-2.5 pr-3.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 cursor-pointer rounded-l-xl ${currentStep === 1 ? isAnalyzing ? "bg-indigo-600 text-white shadow-xs cursor-wait" : !isInputValid ? "bg-indigo-600/70 text-white/90 shadow-xs" : "bg-indigo-600 text-white shadow-xs active:scale-95" : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 active:scale-95"}`,
					title: currentStep === 1 ? isInputValid ? "Klik untuk menganalisis dan menyiapkan brief" : "Harap isi sumber informasi produk terlebih dahulu" : "Kembali ke tahap Sumber Info Produk",
					children: [isAnalyzing && currentStep === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mb-0.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: `w-4 h-4 mb-0.5 ${currentStep === 1 && isInputValid ? "text-amber-300" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-bold tracking-tight",
						children: isAnalyzing && currentStep === 1 ? "Menganalisis" : "Analisis"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleStep2,
					disabled: !isBriefUnlocked,
					style: getChevronStyle(1),
					className: `flex-1 h-12 py-1 px-3.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 ${!isBriefUnlocked ? "bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-600 cursor-not-allowed" : currentStep === 2 ? "bg-emerald-600 text-white shadow-xs cursor-pointer active:scale-95" : isBriefApproved ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer active:scale-95" : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 cursor-pointer active:scale-95"}`,
					title: !isBriefUnlocked ? "Brief terkunci. Lakukan analisis sumber terlebih dahulu." : currentStep === 2 ? "Klik untuk menyetujui brief dan lanjut ke setelan" : "Lihat Product Brief",
					children: [isBriefApproved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 mb-0.5 text-emerald-300 stroke-[2.5]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "w-4 h-4 mb-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-bold tracking-tight",
						children: "Brief"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleStep3,
					disabled: !isConfigUnlocked,
					style: getChevronStyle(2),
					className: `flex-1 h-12 py-1 px-3 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 ${!isConfigUnlocked ? "bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-600 cursor-not-allowed" : currentStep === 3 ? isGenerating ? "bg-blue-600 text-white shadow-xs cursor-wait" : isAuthLocked ? "bg-amber-600 text-white shadow-xs cursor-pointer active:scale-95" : "bg-blue-600 text-white shadow-xs cursor-pointer active:scale-95" : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 cursor-pointer active:scale-95"}`,
					title: !isConfigUnlocked ? "Setelan terkunci. Selesaikan brief terlebih dahulu." : currentStep === 3 ? isAuthLocked ? "Login atau pasang API Key untuk membuat skrip" : "Klik untuk membuat konsep skrip video" : "Lihat Setelan Skrip",
					children: [isGenerating && currentStep === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mb-0.5" }) : isAuthLocked && currentStep === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "w-4 h-4 mb-0.5 text-white" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "w-4 h-4 mb-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-bold tracking-tight whitespace-nowrap",
						children: isGenerating && currentStep === 3 ? "Membuat..." : "Buat Skrip"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleStep4,
					disabled: !isScriptsUnlocked,
					style: getChevronStyle(3),
					className: `flex-1 h-12 py-1 pl-3.5 pr-2.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 rounded-r-xl ${!isScriptsUnlocked ? "bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-600 cursor-not-allowed" : currentStep === 4 ? "bg-amber-600 text-white shadow-xs cursor-pointer active:scale-95" : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 cursor-pointer active:scale-95"}`,
					title: !isScriptsUnlocked ? "Skrip belum dibuat. Selesaikan tahap buat skrip terlebih dahulu." : currentStep === 4 ? "Buka teleprompter layar penuh" : "Lihat Hasil Skrip",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "w-4 h-4 mb-0.5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-bold tracking-tight",
							children: "Prompter"
						}),
						scriptsCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute top-1 right-2 text-[9px] font-bold bg-white text-amber-700 rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 shadow-xs",
							children: scriptsCount
						})
					]
				})
			]
		})
	});
};
var FloatingBottomNav = import_react.memo(FloatingBottomNavComponent);
// src/firebase.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var app = initializeApp(firebase_applet_config_default);
var firestoreDbId = firebase_applet_config_default.firestoreDatabaseId;
var db = firestoreDbId && firestoreDbId !== "(default)" ? getFirestore(app, firestoreDbId) : getFirestore(app);
var auth = getAuth(app);
var googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
async function testFirestoreConnection() {
	try {
		await getDocFromServer(doc(db, "test", "connection"));
	} catch (error) {
		if (error instanceof Error && error.message.includes("the client is offline")) console.warn("Firestore offline / periksa konfigurasi Firebase.");
	}
}
function handleFirestoreError(error, operationType, path) {
	const errInfo = {
		error: error instanceof Error ? error.message : String(error),
		authInfo: {
			userId: auth.currentUser?.uid,
			email: auth.currentUser?.email,
			emailVerified: auth.currentUser?.emailVerified,
			isAnonymous: auth.currentUser?.isAnonymous
		},
		operationType,
		path
	};
	console.error("Firestore Error: ", JSON.stringify(errInfo));
	throw new Error(JSON.stringify(errInfo));
}
/**
* Recursively cleans an object for Firestore by omitting keys with undefined values,
* because Firestore setDoc/updateDoc throws an error on undefined values.
*/
function sanitizeForFirestore(data) {
	if (data === void 0) return null;
	if (data === null || typeof data !== "object") return data;
	if (Array.isArray(data)) return data.map((item) => sanitizeForFirestore(item)).filter((item) => item !== void 0);
	const cleanObj = {};
	for (const [key, value] of Object.entries(data)) if (value !== void 0) cleanObj[key] = sanitizeForFirestore(value);
	return cleanObj;
}
function isRunningInIframe() {
	try {
		return typeof window !== "undefined" && window.self !== window.top;
	} catch {
		return true;
	}
}
async function loginWithGoogle() {
	try {
		const res = await signInWithPopup(auth, googleProvider);
		try {
			const userRef = doc(db, "users", res.user.uid);
			const profileData = sanitizeForFirestore({
				userId: res.user.uid,
				email: res.user.email || "",
				displayName: res.user.displayName || "",
				photoURL: res.user.photoURL || "",
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			await setDoc(userRef, profileData, { merge: true });
		} catch (err) {
			console.error("Failed to sync user profile:", err);
		}
		return res.user;
	} catch (popupErr) {
		const msg = popupErr?.message || "";
		const code = popupErr?.code || "";
		console.warn("signInWithPopup failed:", code, msg);
		if (code === "auth/unauthorized-domain" || msg.includes("unauthorized-domain")) {
			const err = /* @__PURE__ */ new Error("Domain aplikasi belum diizinkan di Firebase Authentication. Buka Firebase Console > Authentication > Settings > Authorized domains dan tambahkan domain ini.");
			err.code = "auth/unauthorized-domain";
			throw err;
		}
		if (isRunningInIframe()) {
			if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || msg.includes("popup")) {
				const err = /* @__PURE__ */ new Error("Jendela popup login diblokir oleh browser di dalam frame pratinjau. Silakan buka aplikasi langsung di tab baru (pratinjau penuh) atau gunakan Mode Tamu.");
				err.code = "auth/popup-blocked";
				throw err;
			}
		}
		if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || msg.includes("missing initial state") || msg.includes("sessionStorage") || msg.includes("storage-partitioned")) {
			await signInWithRedirect(auth, googleProvider);
			throw new Error("Membuka autentikasi Google...");
		}
		throw popupErr;
	}
}
async function checkRedirectLogin() {
	try {
		const res = await getRedirectResult(auth);
		if (res && res.user) {
			try {
				const userRef = doc(db, "users", res.user.uid);
				const profileData = sanitizeForFirestore({
					userId: res.user.uid,
					email: res.user.email || "",
					displayName: res.user.displayName || "",
					photoURL: res.user.photoURL || "",
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				await setDoc(userRef, profileData, { merge: true });
			} catch (err) {
				console.error("Failed to sync user profile from redirect:", err);
			}
			return res.user;
		}
	} catch (err) {
		console.warn("checkRedirectLogin check:", err);
	}
	return null;
}
async function logoutUser() {
	await signOut(auth);
}
async function loadUserApiKey(userId) {
	const path = `users/${userId}/settings/gemini`;
	try {
		const snap = await getDoc(doc(db, "users", userId, "settings", "gemini"));
		if (snap.exists()) return snap.data().apiKey || "";
		return "";
	} catch (err) {
		handleFirestoreError(err, "get", path);
		return "";
	}
}
async function saveUserApiKey(userId, apiKey) {
	const path = `users/${userId}/settings/gemini`;
	try {
		const rawData = {
			userId,
			apiKey: (apiKey || "").trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await setDoc(doc(db, "users", userId, "settings", "gemini"), sanitizeForFirestore(rawData));
	} catch (err) {
		handleFirestoreError(err, "write", path);
	}
}
async function deleteUserApiKey(userId) {
	const path = `users/${userId}/settings/gemini`;
	try {
		await deleteDoc(doc(db, "users", userId, "settings", "gemini"));
	} catch (err) {
		handleFirestoreError(err, "delete", path);
	}
}
async function loadUserHistoryFromFirestore(userId) {
	const path = `users/${userId}/history`;
	try {
		const colRef = collection(db, "users", userId, "history");
		const q = query(colRef, orderBy("timestamp", "desc"), limit(30));
		const snap = await getDocs(q);
		const sessions = [];
		snap.forEach((d) => {
			sessions.push(d.data());
		});
		return sessions;
	} catch (err) {
		handleFirestoreError(err, "list", path);
		return [];
	}
}
async function saveSessionToFirestore(userId, session) {
	const path = `users/${userId}/history/${session.id}`;
	try {
		const rawData = {
			...session,
			userId,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await setDoc(doc(db, "users", userId, "history", session.id), sanitizeForFirestore(rawData));
	} catch (err) {
		handleFirestoreError(err, "write", path);
	}
}
async function deleteSessionFromFirestore(userId, sessionId) {
	const path = `users/${userId}/history/${sessionId}`;
	try {
		await deleteDoc(doc(db, "users", userId, "history", sessionId));
	} catch (err) {
		handleFirestoreError(err, "delete", path);
	}
}
testFirestoreConnection();
// src/services/aiClientService.ts
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
function buildSafeApiKeyHeader(apiKey) {
	if (!apiKey) return {};
	const keys = parseApiKeys(apiKey);
	if (keys.length === 0) return {};
	const safeVal = safeHeaderValue(keys.map(cleanSingleKey).filter(Boolean).join(","));
	return safeVal ? { "x-gemini-api-key": safeVal } : {};
}
/**
* Universal Extraction:
* In standalone Android APK (isMobileApp), connects directly to Google AI Studio REST API.
* In Web, calls server proxy with automatic client-side fallback if backend returns HTML (404/500).
*/
async function executeExtractProduct(params) {
	const apiKey = params.apiKey?.trim();
	if (isMobileApp() && apiKey) return await directExtractProduct(params);
	try {
		return await safeParseJsonResponse(await fetch(apiUrl("/api/extract-product"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...buildSafeApiKeyHeader(apiKey)
			},
			body: JSON.stringify({
				inputMode: params.inputMode,
				textDescription: params.textDescription,
				productUrl: params.productUrl,
				images: params.images,
				apiKey
			})
		}), "mengekstrak informasi produk");
	} catch (proxyErr) {
		const msg = proxyErr?.message || "";
		if (msg.includes("halaman HTML") || msg.includes("404") || msg.includes("Failed to fetch") || proxyErr?.status === 404 || proxyErr?.status === 502 || proxyErr?.status === 503) {
			console.info("[aiClientService] Proxy endpoint returned HTML/404, falling back to direct Google AI Studio API.");
			return await directExtractProduct(params);
		}
		throw proxyErr;
	}
}
/**
* Universal Real-Time Script Generation with Live Token Streaming:
* In standalone Android APK (isMobileApp), connects directly to Google AI Studio REST API (?alt=sse).
* In Web, connects to /api/generate-scripts-stream via SSE fetch reader with automatic client-side fallback.
*/
async function executeGenerateScriptsStream(params) {
	const apiKey = params.apiKey?.trim();
	if (isMobileApp() && apiKey) return await directGenerateScriptsStream({
		productBrief: params.productBrief,
		config: params.config,
		apiKey,
		onChunk: params.onChunk,
		onScriptReady: params.onScriptReady
	});
	try {
		const response = await fetch(apiUrl("/api/generate-scripts-stream"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Accept": "text/event-stream",
				...buildSafeApiKeyHeader(apiKey)
			},
			body: JSON.stringify({
				productBrief: params.productBrief,
				config: params.config,
				apiKey
			})
		});
		if (!response.ok) {
			const errJson = await response.json().catch(() => null);
			throw new Error(errJson?.error || `HTTP ${response.status}`);
		}
		if (!response.body) throw new Error("ReadableStream tidak tersedia.");
		const reader = response.body.getReader();
		const decoder = new TextDecoder("utf-8");
		let buffer = "";
		let finalScripts = [];
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			const events = buffer.split("\n\n");
			buffer = events.pop() || "";
			for (const ev of events) {
				const lines = ev.split("\n");
				let eventType = "message";
				let dataStr = "";
				for (const line of lines) if (line.startsWith("event:")) eventType = line.slice(6).trim();
				else if (line.startsWith("data:")) dataStr = line.slice(5).trim();
				if (!dataStr) continue;
				try {
					const parsed = JSON.parse(dataStr);
					if (eventType === "chunk" && parsed.text) params.onChunk(parsed.text);
					else if (eventType === "script" && parsed.script) params.onScriptReady(parsed.script);
					else if (eventType === "done" && parsed.scripts) finalScripts = parsed.scripts;
					else if (eventType === "error") {
						const err = new Error(parsed.error || "Kendala saat streaming skrip");
						if (parsed.isQuota) err.isQuotaExhausted = true;
						throw err;
					}
				} catch (e) {
					if (eventType === "error") throw e;
				}
			}
		}
		return {
			productBrief: params.productBrief,
			scripts: finalScripts
		};
	} catch (proxyErr) {
		const msg = proxyErr?.message || "";
		if (msg.includes("halaman HTML") || msg.includes("404") || msg.includes("Failed to fetch") || proxyErr?.status === 404 || proxyErr?.status === 502 || proxyErr?.status === 503) {
			console.info("[aiClientService] Proxy streaming returned HTML/404, falling back to direct Google AI Studio API.");
			return await directGenerateScriptsStream({
				productBrief: params.productBrief,
				config: params.config,
				apiKey,
				onChunk: params.onChunk,
				onScriptReady: params.onScriptReady
			});
		}
		throw proxyErr;
	}
}
/**
* Universal Script Refinement:
* In standalone Android APK (isMobileApp), connects directly to Google AI Studio REST API.
* In Web, calls server proxy with automatic client-side fallback.
*/
async function executeRefineScript(params) {
	const apiKey = params.apiKey?.trim();
	if (isMobileApp() && apiKey) return await directRefineScript(params);
	try {
		return await safeParseJsonResponse(await fetch(apiUrl("/api/refine-script"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...buildSafeApiKeyHeader(apiKey)
			},
			body: JSON.stringify({
				script: params.script,
				productBrief: params.productBrief,
				config: params.config,
				refinementType: params.refinementType,
				customInstruction: params.customInstruction,
				apiKey
			})
		}), "memperbaiki skrip");
	} catch (proxyErr) {
		const msg = proxyErr?.message || "";
		if (msg.includes("halaman HTML") || msg.includes("404") || msg.includes("Failed to fetch") || proxyErr?.status === 404 || proxyErr?.status === 502 || proxyErr?.status === 503) {
			console.info("[aiClientService] Proxy endpoint returned HTML/404, falling back to direct Google AI Studio API.");
			return await directRefineScript(params);
		}
		throw proxyErr;
	}
}
// src/App.tsx
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
var INITIAL_BRIEF = {
	name: "",
	category: "",
	description: "",
	features: [],
	benefits: [],
	audience: "Umum",
	painPoints: [],
	restrictions: [],
	sources: [],
	conflicts: []
};
var INITIAL_CONFIG = {
	scriptCount: 5,
	durationSeconds: 30,
	style: "Natural conversational",
	audiencePersona: "Auto",
	angleMode: "auto",
	selectedAngles: [],
	hookType: "Auto",
	demoMethod: "Auto",
	ctaType: "Auto",
	sellingIntensity: "Balanced",
	priceAnchoringEnabled: false,
	urgencyEnabled: false,
	pronouns: "aku/saya"
};
var HISTORY_STORAGE_KEY = "affiliate_script_lab_history";
var SAMPLE_HISTORY = [{
	id: "sample-session-1",
	timestamp: Date.now() - 72e5,
	productName: "Lampu Belajar Lipat LED Portable",
	category: "Elektronik & Rumah Tangga",
	scriptCount: 3,
	durationSeconds: 30,
	productBrief: {
		name: "Lampu Belajar Lipat LED Portable",
		category: "Elektronik & Rumah Tangga",
		description: "Lampu belajar meja lipat multifungsi dengan 3 mode pencahayaan dan baterai isi ulang USB-C.",
		features: [
			"3 tingkat kecerahan",
			"Baterai rechargeable 2000mAh",
			"Desain lipat 180 derajat",
			"Port USB Type-C"
		],
		benefits: [
			"Mata tidak cepat lelah saat membaca malam",
			"Hemat tempat di meja kost sempit",
			"Bisa dibawa bepergian"
		],
		audience: "Mahasiswa kost & pekerja WFH",
		painPoints: ["Lampu kamar terlalu remang", "Meja sempit butuh lampu ringkas"],
		currentPrice: "Rp49.000",
		referencePrice: "Rp99.000",
		promoDetails: "Diskon 50% + Voucher Toko",
		restrictions: ["Jangan klaim tahan air"],
		sources: [{
			field: "name",
			source: "user",
			confidence: "high"
		}],
		conflicts: []
	},
	config: {
		scriptCount: 3,
		durationSeconds: 30,
		style: "Natural conversational",
		audiencePersona: "Mahasiswa/anak kost",
		angleMode: "auto",
		selectedAngles: [],
		hookType: "Auto",
		demoMethod: "Auto",
		ctaType: "Auto",
		sellingIntensity: "Balanced",
		priceAnchoringEnabled: true,
		urgencyEnabled: false,
		pronouns: "aku/saya"
	},
	scripts: [{
		id: "sample-script-1",
		title: "Solusi Meja Kost Sempit Tetap Terang",
		angle: "Problem-Solution (PAS)",
		persona: "Mahasiswa kost",
		differentiator: "Menyorot kepraktisan lipat dan hemat tempat",
		hookType: "Pain-point callout",
		triggers: [
			"Pattern Interrupt",
			"Relatable Context",
			"Direct CTA"
		],
		estimatedDurationSeconds: 30,
		spokenWordCount: 68,
		durationStatus: "ok",
		segments: [
			{
				timeRange: "0-3 detik",
				segmentName: "HOOK",
				visualDirection: "Kamera menyorot meja belajar yang remang lalu lampu dinyalakan sentuh satu jari",
				spokenDialogue: "Siapa di sini yang kalau belajar malam di kost sering pusing gara-gara lampu kamar kurang terang?",
				overlayText: "Lampu Meja Lipat Anti Pusing",
				strategyNote: "Menangkap perhatian anak kost yang sering mengeluh mata lelah"
			},
			{
				timeRange: "4-12 detik",
				segmentName: "PROBLEM & DEMO",
				visualDirection: "Perlihatkan lampu dilipat rata lalu dibuka berdiri kokoh",
				spokenDialogue: "Ini lampu meja lipat LED yang praktis banget. Desainnya ringkas, ada 3 tingkat kecerahan yang adem di mata.",
				overlayText: "3 Tingkat Kecerahan",
				strategyNote: "Membuktikan portabilitas produk"
			},
			{
				timeRange: "13-22 detik",
				segmentName: "VALUE",
				visualDirection: "Perlihatkan port kabel USB-C sedang dicolok ke powerbank",
				spokenDialogue: "Baterainya isi ulang pakai USB-C, jadi aman pas mati lampu. Nggak perlu kabel melintang di meja sempit.",
				overlayText: "Baterai Isi Ulang USB-C",
				strategyNote: "Menghilangkan keberatan kabel berantakan"
			},
			{
				timeRange: "23-30 detik",
				segmentName: "CTA",
				visualDirection: "Tunjuk ke arah kiri bawah layar sambil memperlihatkan lampu menyala hangat",
				spokenDialogue: "Varian warna dan promonya langsung cek di keranjang kiri bawah sekarang ya.",
				overlayText: "Cek Keranjang Kiri Bawah",
				strategyNote: "CTA netral multi-platform"
			}
		],
		voiceoverOnly: "Siapa di sini yang kalau belajar malam di kost sering pusing gara-gara lampu kamar kurang terang? Ini lampu meja lipat LED yang praktis banget. Desainnya ringkas, ada 3 tingkat kecerahan yang adem di mata. Baterainya isi ulang pakai USB-C, jadi aman pas mati lampu. Nggak perlu kabel melintang di meja sempit. Varian warna dan promonya langsung cek di keranjang kiri bawah sekarang ya.",
		qualityChecklist: [
			"Hook kuat",
			"Batas kata sesuai",
			"CTA netral multi-platform"
		],
		warnings: []
	}, {
		id: "sample-script-2",
		title: "Review Jujur Lampu LED 40 Ribuan",
		angle: "UGC Honest Review",
		persona: "Pekerja WFH & Pelajar",
		differentiator: "Sudut pandang unboxing dan pembuktian baterai",
		hookType: "Bold claim",
		triggers: [
			"Curiosity Loop",
			"Demonstration Proof",
			"Soft CTA"
		],
		estimatedDurationSeconds: 30,
		spokenWordCount: 65,
		durationStatus: "ok",
		segments: [
			{
				timeRange: "0-3 detik",
				segmentName: "HOOK",
				visualDirection: "Pegang produk setinggi dada menghadap kamera",
				spokenDialogue: "Awalnya ragu ada lampu meja 40 ribuan yang beneran awet kayak gini.",
				overlayText: "Lampu LED Rp40 Ribuan?",
				strategyNote: "Pemicu rasa ingin tahu dengan angka harga"
			},
			{
				timeRange: "4-15 detik",
				segmentName: "BODY",
				visualDirection: "Sentuh tombol switch untuk mengganti warna putih hangat dan dingin",
				spokenDialogue: "Pas dicoba, cahayanya nggak bikin silau dan leher lampunya lentur bisa ditekuk sesuka kita.",
				overlayText: "Lentur & Fleksibel",
				strategyNote: "Demonstrasi fitur fisik"
			},
			{
				timeRange: "16-30 detik",
				segmentName: "CTA",
				visualDirection: "Arahkan telunjuk ke keranjang bawah",
				spokenDialogue: "Buat yang cari lampu meja awet buat kerja atau belajar, detailnya ada di keranjang kiri bawah.",
				overlayText: "Klik Keranjang Kiri Bawah",
				strategyNote: "Direct CTA"
			}
		],
		voiceoverOnly: "Awalnya ragu ada lampu meja 40 ribuan yang beneran awet kayak gini. Pas dicoba, cahayanya nggak bikin silau dan leher lampunya lentur bisa ditekuk sesuka kita. Buat yang cari lampu meja awet buat kerja atau belajar, detailnya ada di keranjang kiri bawah.",
		qualityChecklist: [
			"Hook kuat",
			"Batas kata sesuai",
			"CTA netral"
		],
		warnings: []
	}]
}];
function getFriendlyErrorMessage(err, fallbackMessage) {
	const msg = err?.message || "";
	if (err?.name === "AbortError" || msg.includes("timeout") || msg.includes("504")) return "Permintaan ke layanan AI melebihi batas waktu (timeout). Silakan periksa koneksi internet Anda atau coba kembali.";
	if (typeof navigator !== "undefined" && !navigator.onLine) return "Koneksi ke internet terputus. Pastikan perangkat Anda terhubung ke internet.";
	if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) return "Koneksi ke server terputus. Pastikan perangkat Anda terhubung ke internet dan coba kembali.";
	return msg || fallbackMessage;
}
function App() {
	const [productBrief, setProductBrief] = (0, import_react.useState)(INITIAL_BRIEF);
	const [config, setConfig] = (0, import_react.useState)(INITIAL_CONFIG);
	const [scripts, setScripts] = (0, import_react.useState)([]);
	const [resetKey, setResetKey] = (0, import_react.useState)(0);
	const [currentStep, setCurrentStep] = (0, import_react.useState)(1);
	const [isBriefApproved, setIsBriefApproved] = (0, import_react.useState)(false);
	const [showBulkActions, setShowBulkActions] = (0, import_react.useState)(false);
	const [isAnalyzing, setIsAnalyzing] = (0, import_react.useState)(false);
	const [isGenerating, setIsGenerating] = (0, import_react.useState)(false);
	const inFlightRequestRef = import_react.useRef(false);
	const [isRefining, setIsRefining] = (0, import_react.useState)(false);
	const [activeInputMode, setActiveInputMode] = (0, import_react.useState)("images");
	const [prompterTheme, setPrompterTheme] = (0, import_react.useState)(() => getStoredPrompterTheme());
	const handleSelectPrompterTheme = (themeId) => {
		const saved = saveStoredPrompterTheme(themeId);
		setPrompterTheme(saved);
		showToast(`Tema teleprompter diubah ke "${saved.name}"`, "info");
	};
	const [processingProgress, setProcessingProgress] = (0, import_react.useState)(15);
	const [processingStepIndex, setProcessingStepIndex] = (0, import_react.useState)(0);
	const [user, setUser] = (0, import_react.useState)(null);
	const [isLoggingIn, setIsLoggingIn] = (0, import_react.useState)(false);
	const [apiKeyModalOpen, setApiKeyModalOpen] = (0, import_react.useState)(false);
	const [quotaModalOpen, setQuotaModalOpen] = (0, import_react.useState)(false);
	const [isQuotaExhausted, setIsQuotaExhausted] = (0, import_react.useState)(false);
	const [authWarningModalOpen, setAuthWarningModalOpen] = (0, import_react.useState)(false);
	const [unauthorizedDomainModalOpen, setUnauthorizedDomainModalOpen] = (0, import_react.useState)(false);
	const [settingsSheetOpen, setSettingsSheetOpen] = (0, import_react.useState)(false);
	const [serverHasKey, setServerHasKey] = (0, import_react.useState)(false);
	const [apiKey, setApiKey] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("affiliate_script_lab_api_key") || "";
		} catch {
			return "";
		}
	});
	const [selectedModel, setSelectedModel] = (0, import_react.useState)(() => {
		try {
			const stored = localStorage.getItem("affiliate_script_lab_model");
			if (stored && [
				"gemini-3.8-flash",
				"gemini-3.7-flash",
				"gemini-3.6-flash"
			].includes(stored)) return stored;
			return "gemini-3.8-flash";
		} catch {
			return "gemini-3.8-flash";
		}
	});
	const activeUser = user || (apiKey ? {
		uid: "local-session",
		displayName: "Pengguna Mandiri",
		email: "Sesi API Key Lokal",
		photoURL: ""
	} : {
		uid: "guest-session",
		displayName: "Pengguna Tamu",
		email: "Sesi Tamu (Lokal)",
		photoURL: ""
	});
	(0, import_react.useEffect)(() => {
		fetch(apiUrl("/api/health")).then((res) => res.json()).then((data) => {
			if (data && data.hasApiKey) setServerHasKey(true);
		}).catch(() => {});
		checkRedirectLogin().then((redirectUser) => {
			if (redirectUser) {
				setUser(redirectUser);
				showToast(`Selamat datang kembali, ${redirectUser.displayName || "Pengguna"}!`, "success");
			}
		}).catch(() => {});
	}, []);
	(0, import_react.useEffect)(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setUser(currentUser);
			if (currentUser) try {
				const cloudKey = await loadUserApiKey(currentUser.uid);
				if (cloudKey) {
					setApiKey(cloudKey);
					localStorage.setItem("affiliate_script_lab_api_key", cloudKey);
				}
				const cloudHistory = await loadUserHistoryFromFirestore(currentUser.uid);
				if (cloudHistory && cloudHistory.length > 0) setHistory((prev) => {
					const merged = [...cloudHistory];
					prev.forEach((item) => {
						if (!merged.some((m) => m.id === item.id)) merged.push(item);
					});
					merged.sort((a, b) => b.timestamp - a.timestamp);
					return merged.slice(0, 30);
				});
			} catch (err) {
				console.warn("Error loading user data from Firestore:", err);
			}
		});
		return () => unsubscribe();
	}, []);
	const handleGoogleLogin = async () => {
		setIsLoggingIn(true);
		try {
			const loggedUser = await loginWithGoogle();
			showToast(`Selamat datang, ${loggedUser.displayName || "Pengguna"}!`, "success");
		} catch (err) {
			const errMsg = err?.message || "";
			const errCode = err?.code || "";
			if (errMsg.includes("Membuka autentikasi Google")) showToast("Membuka autentikasi akun Google...", "info");
			else if (errCode === "auth/unauthorized-domain" || errMsg.includes("unauthorized-domain")) setUnauthorizedDomainModalOpen(true);
			else if (!errMsg.includes("popup-closed-by-user")) showToast("Gagal masuk dengan Google: " + (errMsg || "Coba lagi"), "error");
		} finally {
			setIsLoggingIn(false);
		}
	};
	const handleGoogleLogout = async () => {
		try {
			if (user) await logoutUser();
			setUser(null);
			setApiKey("");
			localStorage.removeItem("affiliate_script_lab_api_key");
			showToast("Berhasil keluar dari akun.", "info");
		} catch {
			showToast("Gagal keluar dari akun.", "error");
		}
	};
	const handleSaveApiKey = async (newKey, model) => {
		const cleaned = parseApiKeys(newKey).map(cleanSingleKey).filter(Boolean).join("\n");
		setApiKey(cleaned);
		setIsQuotaExhausted(false);
		localStorage.setItem("affiliate_script_lab_api_key", cleaned);
		if (model) {
			setSelectedModel(model);
			localStorage.setItem("affiliate_script_lab_model", model);
		}
		if (user) try {
			await saveUserApiKey(user.uid, cleaned);
		} catch (err) {
			console.error("Failed to sync api key to Firestore:", err);
		}
		showToast("API Key & Model Google berhasil disimpan!", "success");
		return true;
	};
	const handleDeleteApiKey = async () => {
		setApiKey("");
		localStorage.removeItem("affiliate_script_lab_api_key");
		if (user) try {
			await deleteUserApiKey(user.uid);
		} catch (err) {
			console.error("Failed to delete api key from Firestore:", err);
		}
		showToast("API Key dihapus.", "info");
	};
	const [safeZoneOpen, setSafeZoneOpen] = (0, import_react.useState)(false);
	const [historyOpen, setHistoryOpen] = (0, import_react.useState)(false);
	const [resetConfirmOpen, setResetConfirmOpen] = (0, import_react.useState)(false);
	const [teleprompterState, setTeleprompterState] = (0, import_react.useState)({
		isOpen: false,
		initialConceptIndex: -1,
		openToken: 0
	});
	const handleOpenAllTeleprompter = () => {
		setFloatingPrompterState((prev) => ({
			...prev,
			isOpen: false,
			conceptIndex: -1
		}));
		stopAndroidFloatingPrompter();
		setTeleprompterState((prev) => ({
			isOpen: true,
			initialConceptIndex: -1,
			openToken: prev.openToken + 1
		}));
	};
	const handleOpenSingleTeleprompter = (_script, index) => {
		setFloatingPrompterState((prev) => ({
			...prev,
			isOpen: false,
			conceptIndex: -1
		}));
		stopAndroidFloatingPrompter();
		setTeleprompterState((prev) => ({
			isOpen: true,
			initialConceptIndex: index,
			openToken: prev.openToken + 1
		}));
	};
	(0, import_react.useEffect)(() => {
		window.__openFullPrompterFromNative = () => {
			setFloatingPrompterState((prev) => ({
				...prev,
				isOpen: false,
				conceptIndex: -1
			}));
			stopAndroidFloatingPrompter();
			setTeleprompterState((prev) => ({
				isOpen: true,
				initialConceptIndex: -1,
				openToken: prev.openToken + 1
			}));
		};
		return () => {
			delete window.__openFullPrompterFromNative;
		};
	}, []);
	const [floatingPrompterState, setFloatingPrompterState] = (0, import_react.useState)({
		isOpen: false,
		conceptIndex: -1,
		openToken: 0
	});
	const [androidOverlayModalOpen, setAndroidOverlayModalOpen] = (0, import_react.useState)(false);
	const [overlayPermissionModalOpen, setOverlayPermissionModalOpen] = (0, import_react.useState)(false);
	const [pendingFloatingData, setPendingFloatingData] = (0, import_react.useState)(null);
	const isAndroidBridge = typeof window !== "undefined" && Boolean(window.AndroidFloatingBridge);
	const checkAndroidOverlayPermission = () => {
		if (typeof window !== "undefined" && window.AndroidFloatingBridge?.checkOverlayPermission) try {
			return Boolean(window.AndroidFloatingBridge.checkOverlayPermission());
		} catch {
			return false;
		}
		return false;
	};
	const [hasAndroidOverlayPerm, setHasAndroidOverlayPerm] = (0, import_react.useState)(() => {
		return checkAndroidOverlayPermission();
	});
	const handleRequestOverlayPermission = () => {
		if (typeof window !== "undefined" && window.AndroidFloatingBridge?.requestOverlayPermission) try {
			window.AndroidFloatingBridge.requestOverlayPermission();
		} catch (e) {
			console.warn("Failed to call requestOverlayPermission:", e);
		}
	};
	const doLaunchNativeFloatingPrompter = (conceptIndex, scriptItem) => {
		const productKeywords = extractProductKeywords(productBrief?.name);
		if (conceptIndex !== void 0 && conceptIndex >= 0) {
			const targetScript = scripts[conceptIndex] || scriptItem;
			if (!targetScript) return;
			const targetConcept = buildPrompterConcept(targetScript, conceptIndex + 1, productKeywords);
			launchAndroidFloatingPrompter(`=== ${targetConcept.title} ===\n\n` + targetConcept.lines.map((l) => l.tokens.map((t) => t.text).join(" ")).join("\n"), {
				themeId: prompterTheme.id,
				backgroundColorHex: prompterTheme.backgroundColor,
				highlightColorHex: prompterTheme.highlightColor
			}, [targetConcept]);
		} else {
			const allConcepts = scripts.map((s, idx) => buildPrompterConcept(s, idx + 1, productKeywords));
			if (allConcepts.length > 0) launchAndroidFloatingPrompter(allConcepts.map((c) => `=== ${c.title} ===\n\n` + c.lines.map((l) => l.tokens.map((t) => t.text).join(" ")).join("\n")).join("\n\n---\n\n"), {
				themeId: prompterTheme.id,
				backgroundColorHex: prompterTheme.backgroundColor,
				highlightColorHex: prompterTheme.highlightColor
			}, allConcepts);
		}
	};
	const doLaunchWebFloatingPrompter = (conceptIndex) => {
		setFloatingPrompterState((prev) => ({
			isOpen: true,
			conceptIndex: conceptIndex !== void 0 ? conceptIndex : -1,
			openToken: prev.openToken + 1
		}));
	};
	const handleTriggerFloatingPrompter = (conceptIndex, scriptItem) => {
		setTeleprompterState((prev) => ({
			...prev,
			isOpen: false,
			initialConceptIndex: -1
		}));
		if (isAndroidBridge) {
			const hasPerm = checkAndroidOverlayPermission();
			setHasAndroidOverlayPerm(hasPerm);
			if (!hasPerm) {
				setPendingFloatingData({
					conceptIndex,
					script: scriptItem
				});
				setOverlayPermissionModalOpen(true);
				return;
			}
			doLaunchNativeFloatingPrompter(conceptIndex, scriptItem);
			return;
		}
		if (!(localStorage.getItem("gagaswara_overlay_web_guided") === "true")) {
			setPendingFloatingData({
				conceptIndex,
				script: scriptItem
			});
			setOverlayPermissionModalOpen(true);
			return;
		}
		doLaunchWebFloatingPrompter(conceptIndex);
	};
	(0, import_react.useEffect)(() => {
		const handleCheckPermOnResume = () => {
			if (isAndroidBridge) {
				const perm = checkAndroidOverlayPermission();
				setHasAndroidOverlayPerm(perm);
				if (perm && overlayPermissionModalOpen) {
					setOverlayPermissionModalOpen(false);
					doLaunchNativeFloatingPrompter(pendingFloatingData?.conceptIndex, pendingFloatingData?.script);
					setPendingFloatingData(null);
					showToast("Izin melayang aktif! Teleprompter siap.", "success");
				}
			}
		};
		window.addEventListener("focus", handleCheckPermOnResume);
		const handleVisChange = () => {
			if (document.visibilityState === "visible") handleCheckPermOnResume();
		};
		document.addEventListener("visibilitychange", handleVisChange);
		return () => {
			window.removeEventListener("focus", handleCheckPermOnResume);
			document.removeEventListener("visibilitychange", handleVisChange);
		};
	}, [
		isAndroidBridge,
		overlayPermissionModalOpen,
		pendingFloatingData,
		scripts,
		productBrief,
		prompterTheme
	]);
	const [manualCopy, setManualCopy] = (0, import_react.useState)({
		isOpen: false,
		text: "",
		title: ""
	});
	const [toastMessage, setToastMessage] = (0, import_react.useState)(null);
	const [globalError, setGlobalError] = (0, import_react.useState)(null);
	const [conflictsFound, setConflictsFound] = (0, import_react.useState)([]);
	const [extractWarning, setExtractWarning] = (0, import_react.useState)(void 0);
	const [isInputValid, setIsInputValid] = (0, import_react.useState)(false);
	const analyzeTriggerRef = import_react.useRef(null);
	const [history, setHistory] = (0, import_react.useState)(() => {
		try {
			const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed) && parsed.length > 0) return parsed;
			}
		} catch {}
		return SAMPLE_HISTORY;
	});
	const saveSessionToHistory = (newSession) => {
		setHistory((prev) => {
			const updated = [newSession, ...prev.filter((s) => s.id !== newSession.id)].slice(0, 30);
			try {
				localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
			} catch {}
			return updated;
		});
		if (user) saveSessionToFirestore(user.uid, newSession).catch((err) => console.warn("Failed to save session to Firestore:", err));
	};
	const handleDeleteHistorySession = (id) => {
		setHistory((prev) => {
			const updated = prev.filter((s) => s.id !== id);
			try {
				localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
			} catch {}
			return updated;
		});
		if (user) deleteSessionFromFirestore(user.uid, id).catch((err) => console.warn("Failed to delete session from Firestore:", err));
		showToast("Sesi riwayat berhasil dihapus.", "info");
	};
	const handleClearAllHistory = () => {
		setHistory([]);
		try {
			localStorage.removeItem(HISTORY_STORAGE_KEY);
		} catch {}
		showToast("Seluruh riwayat berhasil dikosongkan.", "info");
	};
	const [visualModes, setVisualModes] = (0, import_react.useState)({});
	const handleLoadSession = (session) => {
		setProductBrief(session.productBrief);
		setConfig(session.config);
		setScripts(session.scripts);
		setVisualModes({});
		setIsBriefApproved(true);
		setCurrentStep(4);
		setGlobalError(null);
		showToast(`Skrip "${session.productName}" berhasil dimuat dari riwayat!`, "success");
	};
	const isAllVisuals = scripts.length > 0 && scripts.every((_, idx) => Boolean(visualModes[idx]));
	const handleToggleAllVisuals = () => {
		const nextMode = !isAllVisuals;
		const updated = {};
		scripts.forEach((_, idx) => {
			updated[idx] = nextMode;
		});
		setVisualModes(updated);
		showToast(nextMode ? "Arahan visual ditampilkan untuk semua konsep" : "Arahan visual disembunyikan untuk semua konsep", "info");
	};
	const handleToggleSingleVisual = (index) => {
		setVisualModes((prev) => ({
			...prev,
			[index]: !prev[index]
		}));
	};
	const isBriefUnlocked = Boolean(productBrief.name || productBrief.description);
	const isConfigUnlocked = isBriefApproved;
	const isScriptsUnlocked = scripts.length > 0 || isGenerating;
	const showToast = (text, type = "success") => {
		setToastMessage({
			text,
			type
		});
		setTimeout(() => {
			setToastMessage(null);
		}, 3e3);
	};
	const handleCopyText = async (text, label) => {
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(text);
				showToast(`${label} disalin ke clipboard!`, "success");
			} else throw new Error("Clipboard API tidak tersedia");
		} catch {
			setManualCopy({
				isOpen: true,
				text,
				title: `Salin ${label}`
			});
		}
	};
	const handleCopyAllVoiceovers = () => {
		if (scripts.length === 0) return;
		const fullText = generateAllVoiceoversTxt(productBrief, scripts);
		handleCopyText(fullText, "Seluruh Narasi Suara");
	};
	const handleCopyAllScripts = () => {
		if (scripts.length === 0) return;
		const fullText = generateAllScriptsTxt(productBrief, config, scripts);
		handleCopyText(fullText, "Seluruh Paket Skrip Lengkap");
	};
	const handleDownloadVoiceoversTxt = () => {
		if (scripts.length === 0) return;
		try {
			downloadVoiceoversTxtFile(productBrief, scripts);
			showToast("File narasi .txt berhasil diunduh!", "success");
		} catch {
			showToast("Gagal mengunduh file narasi", "error");
		}
	};
	const handleDownloadScriptsTxt = () => {
		if (scripts.length === 0) return;
		try {
			downloadScriptsTxtFile(productBrief, config, scripts);
			showToast("File skrip lengkap .txt berhasil diunduh!", "success");
		} catch {
			showToast("Gagal mengunduh file skrip", "error");
		}
	};
	const handleAnalyzeInput = async (data) => {
		if (inFlightRequestRef.current) return;
		inFlightRequestRef.current = true;
		setActiveInputMode(data.inputMode);
		setIsAnalyzing(true);
		setGlobalError(null);
		setExtractWarning(void 0);
		setConflictsFound([]);
		try {
			const resData = await executeExtractProduct({
				...data,
				apiKey
			});
			const isSingle = data.inputMode !== "mixed";
			const rawConflicts = resData.conflictsFound || [];
			const finalConflicts = isSingle ? [] : rawConflicts.map((c) => {
				if (typeof c === "string") return c;
				if (typeof c === "object" && c !== null) {
					if (c.field && c.detail) return `${c.field}: ${c.detail}`;
					return c.detail || c.conflict || c.description || c.message || JSON.stringify(c);
				}
				return String(c);
			});
			const cleanBrief = {
				...resData.productBrief,
				conflicts: finalConflicts,
				activeSourceMode: data.inputMode,
				platform: data.inputMode === "url" || data.inputMode === "mixed" && Boolean(data.productUrl) ? resData.platform : void 0
			};
			setProductBrief(cleanBrief);
			setConflictsFound(finalConflicts);
			setExtractWarning(resData.warning);
			setCurrentStep(2);
			setIsBriefApproved(false);
			showToast(`Brief "${cleanBrief.name}" berhasil disiapkan!`, "success");
		} catch (err) {
			const msg = err?.message || "";
			if (Boolean(err?.isQuotaExhausted) || err?.status === 429 || msg.includes("TOKEN_QUOTA_EXHAUSTED") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("Quota exceeded")) {
				setIsQuotaExhausted(true);
				setQuotaModalOpen(true);
				showToast("Token API Key Google habis. Silakan ganti atau masukkan kunci baru.", "error");
			} else if (err?.message?.includes("MISSING_MOBILE_API_KEY")) {
				setApiKeyModalOpen(true);
				showToast("Harap masukkan API Key Google AI Studio Anda terlebih dahulu di APK.", "info");
			} else setGlobalError(getFriendlyErrorMessage(err, "Gagal memproses informasi produk."));
		} finally {
			setIsAnalyzing(false);
			inFlightRequestRef.current = false;
		}
	};
	const handleApproveBrief = () => {
		if (!productBrief.name) {
			setGlobalError("Harap lengkapi Nama Produk sebelum menyetujui brief.");
			return;
		}
		setIsBriefApproved(true);
		setCurrentStep(3);
		showToast("Brief disetujui! Lanjut mengatur skrip.", "success");
	};
	const handleGenerateScripts = async () => {
		if (inFlightRequestRef.current) return;
		if (!(serverHasKey || Boolean(apiKey && apiKey.trim()))) {
			setApiKeyModalOpen(true);
			showToast("Harap atur API Key Google AI Studio Anda terlebih dahulu untuk membuat skrip.", "info");
			return;
		}
		if (!productBrief.name && !productBrief.description) {
			setGlobalError("Harap lengkapi minimal Nama Produk sebelum membuat skrip.");
			return;
		}
		inFlightRequestRef.current = true;
		setIsGenerating(true);
		setGlobalError(null);
		setScripts([]);
		setCurrentStep(4);
		try {
			const resData = await executeGenerateScriptsStream({
				productBrief,
				config,
				apiKey,
				onChunk: () => {},
				onScriptReady: (newScript) => {
					setScripts((prev) => {
						if (prev.some((s) => s.id === newScript.id || s.title === newScript.title)) return prev;
						return [...prev, newScript];
					});
				}
			});
			const generatedScripts = resData.scripts && resData.scripts.length > 0 ? resData.scripts : [];
			setScripts(generatedScripts);
			setVisualModes({});
			const newSession = {
				id: `session-${Date.now()}`,
				timestamp: Date.now(),
				productName: productBrief.name || "Produk",
				category: productBrief.category || "Umum",
				scriptCount: generatedScripts.length,
				durationSeconds: config.durationSeconds,
				productBrief,
				config,
				scripts: generatedScripts
			};
			saveSessionToHistory(newSession);
			showToast(`${generatedScripts.length} skrip berhasil dibuat & disimpan ke riwayat!`, "success");
		} catch (err) {
			const msg = err?.message || "";
			if (Boolean(err?.isQuotaExhausted) || err?.status === 429 || msg.includes("TOKEN_QUOTA_EXHAUSTED") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("Quota exceeded")) {
				setIsQuotaExhausted(true);
				setQuotaModalOpen(true);
				showToast("Token API Key Google habis. Silakan ganti atau masukkan kunci baru.", "error");
			} else if (err?.message?.includes("MISSING_MOBILE_API_KEY")) {
				setApiKeyModalOpen(true);
				showToast("Harap masukkan API Key Google AI Studio Anda terlebih dahulu di APK.", "info");
			} else setGlobalError(getFriendlyErrorMessage(err, "Terjadi kesalahan saat memproduksi skrip."));
		} finally {
			setIsGenerating(false);
			inFlightRequestRef.current = false;
		}
	};
	const handleRegenerateScript = async (targetScript) => {
		await handleRefineScript(targetScript, "change_angle");
	};
	const handleRefineScript = async (targetScript, refinementType, customInstruction) => {
		setIsRefining(true);
		try {
			const resData = await executeRefineScript({
				script: targetScript,
				productBrief,
				config,
				refinementType,
				customInstruction,
				apiKey
			});
			const updatedList = scripts.map((s) => s.id === targetScript.id ? resData.script : s);
			setScripts(updatedList);
			saveSessionToHistory({
				id: `session-${Date.now()}`,
				timestamp: Date.now(),
				productName: productBrief.name || "Produk",
				category: productBrief.category || "Umum",
				scriptCount: updatedList.length,
				durationSeconds: config.durationSeconds,
				productBrief,
				config,
				scripts: updatedList
			});
			showToast("Skrip berhasil disempurnakan!", "success");
		} catch (err) {
			const msg = err?.message || "";
			if (Boolean(err?.isQuotaExhausted) || err?.status === 429 || msg.includes("TOKEN_QUOTA_EXHAUSTED") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("Quota exceeded")) {
				setIsQuotaExhausted(true);
				setQuotaModalOpen(true);
				showToast("Token API Key Google habis. Silakan ganti atau masukkan kunci baru.", "error");
			} else showToast(getFriendlyErrorMessage(err, "Gagal memproses perbaikan"), "error");
		} finally {
			setIsRefining(false);
		}
	};
	const handleUpdateScript = (updatedScript) => {
		setScripts((prev) => {
			const next = prev.map((s) => s.id === updatedScript.id ? updatedScript : s);
			saveSessionToHistory({
				id: `session-${Date.now()}`,
				timestamp: Date.now(),
				productName: productBrief.name || "Produk",
				category: productBrief.category || "Umum",
				scriptCount: next.length,
				durationSeconds: config.durationSeconds,
				productBrief,
				config,
				scripts: next
			});
			return next;
		});
		showToast(`Perubahan pada skrip "${updatedScript.title}" berhasil disimpan!`, "success");
	};
	const handleConfirmReset = () => {
		setProductBrief(INITIAL_BRIEF);
		setConfig(INITIAL_CONFIG);
		setScripts([]);
		setVisualModes({});
		setCurrentStep(1);
		setIsBriefApproved(false);
		setGlobalError(null);
		setConflictsFound([]);
		setExtractWarning(void 0);
		setIsInputValid(false);
		analyzeTriggerRef.current = null;
		setResetKey((prev) => prev + 1);
		showToast("Aplikasi berhasil di-reset ke awal.", "info");
	};
	Boolean(productBrief.name || scripts.length > 0);
	[
		{
			num: 1,
			label: "Sumber Info",
			fullLabel: "Sumber Info Produk",
			visible: true,
			completed: isBriefUnlocked
		},
		{
			num: 2,
			label: "Product Brief",
			fullLabel: "Product Brief Terverifikasi",
			visible: isBriefUnlocked,
			completed: isBriefApproved
		},
		{
			num: 3,
			label: "Pengaturan",
			fullLabel: "Pengaturan Generator",
			visible: isConfigUnlocked,
			completed: isScriptsUnlocked
		},
		{
			num: 4,
			label: "Skrip",
			fullLabel: "Skrip Siap Rekam",
			visible: isScriptsUnlocked,
			completed: isScriptsUnlocked
		}
	].filter((s) => s.visible);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-white flex flex-col font-sans transition-colors",
		children: [
			(isAnalyzing || isGenerating) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-[#007AFF] via-[#5856D6] to-[#34C759] animate-pulse shadow-xs" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				user: activeUser,
				onLogin: handleGoogleLogin,
				onLogout: handleGoogleLogout,
				onOpenApiKey: () => setApiKeyModalOpen(true),
				onOpenSafeZone: () => setSafeZoneOpen(true),
				onOpenHistory: () => setHistoryOpen(true),
				onOpenApkModal: () => setAndroidOverlayModalOpen(true),
				onReset: () => setResetConfirmOpen(true),
				historyCount: history.length,
				hasApiKey: Boolean(apiKey || serverHasKey),
				isLoggingIn,
				currentThemeId: prompterTheme.id,
				onSelectTheme: handleSelectPrompterTheme,
				settingsSheetOpen,
				onToggleSettingsSheet: setSettingsSheetOpen
			}),
			toastMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed top-16 sm:top-20 inset-x-0 mx-auto max-w-sm z-50 flex items-center justify-center pointer-events-none px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200",
					children: [
						toastMessage.type === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }),
						toastMessage.type === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "w-4 h-4 text-rose-600 dark:text-rose-400" }),
						toastMessage.type === "info" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-4 h-4 text-blue-600 dark:text-blue-400" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: toastMessage.text })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-5 pb-36 sm:pb-40",
				children: [globalError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: globalError })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setGlobalError(null),
						className: "text-xs font-semibold text-rose-700 hover:underline shrink-0 cursor-pointer",
						children: "Tutup"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						currentStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "animate-in fade-in duration-150",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputPanel, {
								onAnalyze: handleAnalyzeInput,
								isAnalyzing,
								disabled: isGenerating || isRefining,
								onValidityChange: (valid, trigger) => {
									setIsInputValid(valid);
									analyzeTriggerRef.current = trigger;
								}
							}, `input-panel-${resetKey}`)
						}),
						currentStep === 2 && isBriefUnlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "animate-in fade-in duration-150",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductBriefEditor, {
								brief: productBrief,
								onChange: setProductBrief,
								conflicts: conflictsFound,
								onDismissConflict: () => setConflictsFound([]),
								warning: extractWarning,
								onApprove: handleApproveBrief,
								onBackToSource: () => setCurrentStep(1)
							})
						}),
						currentStep === 3 && isConfigUnlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "animate-in fade-in duration-150",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeneratorConfigPanel, {
								config,
								onChange: setConfig,
								onGenerate: handleGenerateScripts,
								isGenerating,
								disabled: isAnalyzing,
								productBrief,
								onBackToBrief: () => setCurrentStep(2),
								user: activeUser,
								hasApiKey: Boolean(apiKey),
								onRequireAuthOrKey: () => setAuthWarningModalOpen(true)
							})
						}),
						currentStep === 4 && isScriptsUnlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "animate-in fade-in duration-150 space-y-3.5",
							children: [
								isGenerating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "sticky top-14 sm:top-16 z-30 py-1 transition-all duration-300",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mx-auto max-w-lg w-full bg-white dark:bg-[#1C1C1E] border border-blue-500/40 shadow-lg rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "relative flex h-2.5 w-2.5 shrink-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, {
													className: "w-3.5 h-3.5 text-blue-600 animate-bounce shrink-0",
													style: { animationDuration: "1.2s" }
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs",
													children: scripts.length === 0 ? "Sedang menulis konsep skrip pertama..." : `Sedang menulis skrip ke-${scripts.length + 1}...`
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center gap-1.5 shrink-0",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums",
												children: [
													scripts.length,
													" selesai • Sisa ",
													Math.max(0, config.scriptCount - scripts.length)
												]
											})
										})]
									})
								}),
								isGenerating && scripts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-white dark:bg-[#1C1C1E] rounded-2xl border border-dashed border-blue-300 dark:border-blue-700/50 p-8 text-center space-y-3 shadow-xs animate-pulse",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "w-6 h-6 animate-bounce" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-sm font-bold text-slate-900 dark:text-white",
										children: "Memulai Penulisan Skrip Affiliate"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1",
										children: "Gemini sedang merancang konsep video dengan hook scroll-stopper dan arahan visual B-roll. Setiap konsep yang selesai langsung tampil di bawah dan siap diedit manual!"
									})] })]
								}),
								isGenerating && scripts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-white dark:bg-[#1C1C1E] border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-medium shadow-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-4 h-4 animate-spin text-blue-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"Sedang meracik konsep berikutnya... (",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: scripts.length }),
											" dari ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: config.scriptCount }),
											" konsep siap)"
										] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold tracking-wider uppercase bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-xs shrink-0",
										children: "Live Stream"
									})]
								}),
								scripts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs p-4 sm:p-5 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-5 h-5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
													className: "text-sm sm:text-base font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5 tracking-tight",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [scripts.length, " Konsep Skrip Siap Rekam"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoTooltip, {
														title: "Hasil Skrip Siap Rekam",
														content: "Daftar konsep skrip video tersusun vertikal ke bawah dengan hook 3 detik, arahan visual B-roll, batas kata aman, dan ajakan bertindak (CTA) netral multi-platform."
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] text-slate-500 dark:text-zinc-400 font-medium",
													children: "Fokus pada skrip atau buka menu untuk opsi ekspor"
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setShowBulkActions(!showBulkActions),
											className: "inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-semibold bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white transition-all cursor-pointer border border-black/5 dark:border-white/10 shrink-0 active:scale-95",
											title: showBulkActions ? "Sembunyikan menu opsi massal" : "Buka menu opsi massal",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: showBulkActions ? "Tutup Opsi" : "Opsi Massal" }), showBulkActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-3.5 h-3.5 text-[#8E8E93]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3.5 h-3.5 text-[#8E8E93]" })]
										})]
									}), showBulkActions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3 pt-2 border-t border-[#F2F2F7] dark:border-[#2C2C2E] animate-in fade-in duration-200",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: handleToggleAllVisuals,
												className: `w-full flex items-center justify-between h-10 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${isAllVisuals ? "bg-[#34C759] text-white border-[#34C759] shadow-xs hover:bg-[#30B753]" : "bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white border-[#E5E5EA] dark:border-[#38383A]"}`,
												title: isAllVisuals ? "Sembunyikan arahan visual semua konsep" : "Tampilkan arahan visual semua konsep",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "w-4 h-4 text-[#34C759] dark:text-[#30D158]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Arahan visual untuk semua konsep" })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[11px] font-medium opacity-80",
													children: isAllVisuals ? "Aktif" : "Nonaktif"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-2.5 w-full",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: handleCopyAllVoiceovers,
													className: "w-full flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-xs font-semibold bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white border border-[#E5E5EA] dark:border-[#38383A] transition-all cursor-pointer active:scale-[0.99]",
													title: "Salin seluruh teks narasi suara saja",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5 text-[#007AFF]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Semua Narasi" })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: handleCopyAllScripts,
													className: "w-full flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-xs font-semibold bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white border border-[#E5E5EA] dark:border-[#38383A] transition-all cursor-pointer active:scale-[0.99]",
													title: "Salin seluruh skrip lengkap (visual + dialog + overlay)",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5 text-[#34C759]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Semua Skrip" })]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-2.5 w-full",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: handleDownloadVoiceoversTxt,
													className: "w-full flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-xs font-semibold bg-[#1C1C1E] dark:bg-[#2C2C2E] text-white hover:bg-black dark:hover:bg-[#38383A] border border-black/10 dark:border-white/10 transition-all cursor-pointer active:scale-[0.99] shadow-xs",
													title: "Unduh file .txt teks narasi suara saja",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-3.5 h-3.5 text-[#34C759]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unduh Narasi" })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: handleDownloadScriptsTxt,
													className: "w-full flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-xs font-semibold bg-[#1C1C1E] dark:bg-[#2C2C2E] text-white hover:bg-black dark:hover:bg-[#38383A] border border-black/10 dark:border-white/10 transition-all cursor-pointer active:scale-[0.99] shadow-xs",
													title: "Unduh file .txt naskah skrip lengkap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-3.5 h-3.5 text-[#007AFF]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unduh Skrip" })]
												})]
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-4",
									children: scripts.map((script, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScriptCard, {
										script,
										index: idx,
										totalScripts: scripts.length,
										showVisualDetails: Boolean(visualModes[idx]),
										onToggleVisualDetails: () => handleToggleSingleVisual(idx),
										onCopyText: handleCopyText,
										onRegenerate: handleRegenerateScript,
										onRefine: handleRefineScript,
										isRefining,
										onOpenPrompter: handleOpenSingleTeleprompter,
										onOpenFloatingPrompter: (_script, index) => {
											handleTriggerFloatingPrompter(index, _script);
										},
										onUpdateScript: handleUpdateScript
									}, script.id || idx))
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingBottomNav, {
				currentStep,
				onStepChange: (step) => setCurrentStep(step),
				isBriefUnlocked,
				isBriefApproved,
				isConfigUnlocked,
				isScriptsUnlocked,
				scriptsCount: scripts.length,
				onAnalyze: () => {
					if (analyzeTriggerRef.current) analyzeTriggerRef.current();
				},
				isAnalyzing,
				isInputValid,
				onApproveBrief: handleApproveBrief,
				isBriefValid: Boolean(productBrief.name),
				onBackToSource: () => setCurrentStep(1),
				onGenerate: handleGenerateScripts,
				isGenerating,
				scriptCount: config.scriptCount,
				durationSeconds: config.durationSeconds,
				isAuthLocked: !activeUser || !apiKey,
				onRequireAuthOrKey: () => setAuthWarningModalOpen(true),
				onBackToBrief: () => setCurrentStep(2),
				onOpenTeleprompter: handleOpenAllTeleprompter,
				onOpenFloatingPrompter: () => {
					handleTriggerFloatingPrompter();
				},
				onCopyAllScripts: handleCopyAllScripts,
				onOpenSettings: () => setSettingsSheetOpen(true)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SafeZoneModal, {
				isOpen: safeZoneOpen,
				onClose: () => setSafeZoneOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeleprompterModal, {
				isOpen: teleprompterState.isOpen,
				onClose: () => setTeleprompterState((prev) => ({
					...prev,
					isOpen: false
				})),
				scripts,
				initialConceptIndex: teleprompterState.initialConceptIndex,
				openToken: teleprompterState.openToken,
				productBrief,
				theme: prompterTheme,
				onSelectTheme: handleSelectPrompterTheme,
				onOpenFloatingPrompter: (idx) => {
					handleTriggerFloatingPrompter(idx);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverlayPermissionModal, {
				isOpen: overlayPermissionModalOpen,
				onClose: () => {
					setOverlayPermissionModalOpen(false);
					setPendingFloatingData(null);
				},
				isAndroid: isAndroidBridge,
				hasPermission: hasAndroidOverlayPerm,
				onRequestAndroidPermission: handleRequestOverlayPermission,
				onLaunchPrompter: () => {
					setOverlayPermissionModalOpen(false);
					if (isAndroidBridge) doLaunchNativeFloatingPrompter(pendingFloatingData?.conceptIndex, pendingFloatingData?.script);
					else {
						localStorage.setItem("gagaswara_overlay_web_guided", "true");
						doLaunchWebFloatingPrompter(pendingFloatingData?.conceptIndex);
					}
					setPendingFloatingData(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingTeleprompter, {
				isOpen: floatingPrompterState.isOpen,
				onClose: () => setFloatingPrompterState((prev) => ({
					...prev,
					isOpen: false,
					conceptIndex: -1
				})),
				onExpandToFull: () => {
					const idx = floatingPrompterState.conceptIndex;
					setFloatingPrompterState((prev) => ({
						...prev,
						isOpen: false,
						conceptIndex: -1
					}));
					stopAndroidFloatingPrompter();
					setTeleprompterState((prev) => ({
						isOpen: true,
						initialConceptIndex: idx,
						openToken: prev.openToken + 1
					}));
				},
				scripts,
				conceptIndex: floatingPrompterState.conceptIndex,
				openToken: floatingPrompterState.openToken,
				productBrief,
				theme: prompterTheme,
				onSelectTheme: handleSelectPrompterTheme,
				onOpenPermissionGuide: () => setAndroidOverlayModalOpen(true)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AndroidOverlayModal, {
				isOpen: androidOverlayModalOpen,
				onClose: () => setAndroidOverlayModalOpen(false),
				sampleScriptText: scripts.length > 0 ? scripts.map((s) => `=== ${s.title} ===\n\n` + (s.voiceoverOnly || s.segments.map((sg) => sg.spokenDialogue).join(" "))).join("\n\n---\n\n") : void 0,
				onStartFloatingWidget: () => {
					setAndroidOverlayModalOpen(false);
					setFloatingPrompterState((prev) => ({
						isOpen: true,
						conceptIndex: teleprompterState.initialConceptIndex ?? -1,
						openToken: prev.openToken + 1
					}));
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryModal, {
				isOpen: historyOpen,
				onClose: () => setHistoryOpen(false),
				history,
				onLoadSession: handleLoadSession,
				onDeleteSession: handleDeleteHistorySession,
				onClearHistory: handleClearAllHistory
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetConfirmModal, {
				isOpen: resetConfirmOpen,
				onClose: () => setResetConfirmOpen(false),
				onConfirm: handleConfirmReset
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualCopyModal, {
				isOpen: manualCopy.isOpen,
				onClose: () => setManualCopy({
					isOpen: false,
					text: "",
					title: ""
				}),
				text: manualCopy.text,
				title: manualCopy.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProcessingModal, {
				isAnalyzing,
				isGenerating: false,
				activeInputMode,
				config,
				productName: productBrief.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuotaExhaustedModal, {
				isOpen: quotaModalOpen,
				onClose: () => setQuotaModalOpen(false),
				onOpenApiKeyModal: () => {
					setQuotaModalOpen(false);
					setApiKeyModalOpen(true);
				},
				keyCount: parseApiKeys(apiKey).length || 1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiKeyModal, {
				isOpen: apiKeyModalOpen,
				onClose: () => {
					setApiKeyModalOpen(false);
					setIsQuotaExhausted(false);
				},
				currentApiKey: apiKey,
				onSave: handleSaveApiKey,
				onDelete: handleDeleteApiKey,
				selectedModel,
				onSelectModel: (m) => {
					setSelectedModel(m);
					localStorage.setItem("affiliate_script_lab_model", m);
				},
				isQuotaExhaustedAlert: isQuotaExhausted
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthWarningModal, {
				isOpen: authWarningModalOpen,
				onClose: () => setAuthWarningModalOpen(false),
				user: activeUser,
				hasApiKey: Boolean(apiKey),
				onLogin: handleGoogleLogin,
				onOpenApiKey: () => setApiKeyModalOpen(true)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnauthorizedDomainModal, {
				isOpen: unauthorizedDomainModalOpen,
				onClose: () => setUnauthorizedDomainModalOpen(false),
				onUseLocalApiKey: () => {
					setUnauthorizedDomainModalOpen(false);
					setApiKeyModalOpen(true);
				}
			})
		]
	});
}
// src/main.tsx
(0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}));
