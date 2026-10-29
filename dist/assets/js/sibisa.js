/* ==========================================================================
   SIBISA — shared interface behaviour
   --------------------------------------------------------------------------
   Navigation, theme, catalogue rendering, filters and page-specific views.
   The catalogue is rendered from window.PORTAL_DATA (portal-data.js) so the
   same records feed the home page and every catalogue route.
   ========================================================================== */
(function () {
	"use strict";

	var DATA = window.PORTAL_DATA || {};
	var topics = DATA.topics || [];
	var organizations = DATA.organizations || [];
	var datasets = DATA.datasets || [];
	var visualizations = DATA.visualizations || [];
	var infographics = DATA.infographics || [];
	var articles = DATA.articles || [];
	var publications = DATA.publications || [];
	var releases = DATA.releases || [];

	var THEME_KEY = "sibisa-theme";
	var html = document.documentElement;
	var body = document.body;

	/* ---------------------------------------------------------------------
	   Helpers
	   --------------------------------------------------------------------- */
	function $(selector, root) {
		return (root || document).querySelector(selector);
	}

	function $$(selector, root) {
		return Array.prototype.slice.call((root || document).querySelectorAll(selector));
	}

	function escapeHtml(value) {
		return String(value == null ? "" : value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}

	function normalize(value) {
		return String(value == null ? "" : value).toLowerCase().trim();
	}

	function slugify(value) {
		return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	}

	var iconPaths = {
		"search": '<circle cx="11" cy="11" r="7"></circle><path d="M16.5 16.5 21 21"></path>',
		"arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"></path>',
		"arrow-up": '<path d="M12 19V5M6 11l6-6 6 6"></path>',
		"chevron-down": '<path d="m6 9 6 6 6-6"></path>',
		"chevron-right": '<path d="m9 6 6 6-6 6"></path>',
		"chevron-left": '<path d="m15 6-6 6 6 6"></path>',
		"menu": '<path d="M4 7h16M4 12h16M4 17h16"></path>',
		"close": '<path d="M6 6l12 12M18 6 6 18"></path>',
		"sun": '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>',
		"moon": '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
		"database": '<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path>',
		"chart": '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path>',
		"image": '<rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9" r="1.5"></circle><path d="m21 15-5-5L5 21"></path>',
		"building": '<path d="M4 21V6l8-3 8 3v15"></path><path d="M9 21v-5h6v5M8 9h1M15 9h1M8 13h1M15 13h1"></path>',
		"bolt": '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"></path>',
		"road": '<path d="M4 21 8 3M20 21 16 3M12 4v3M12 11v3M12 18v3"></path>',
		"health": '<path d="M12 21s-8-4.6-8-10.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 3.8C20 16.4 12 21 12 21z"></path><path d="M12 9v4M10 11h4"></path>',
		"leaf": '<path d="M20 4C11 4 4 9 4 17c0 2 1 3 3 3 8 0 13-7 13-16z"></path><path d="M4 20c3-7 8-10 13-12"></path>',
		"anchor": '<circle cx="12" cy="5" r="2.5"></circle><path d="M12 8v13M5 13H3a9 9 0 0 0 18 0h-2M8 11h8"></path>',
		"landmark": '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10h18L12 4 3 10z"></path>',
		"education": '<path d="M22 9 12 4 2 9l10 5 10-5z"></path><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"></path>',
		"agriculture": '<path d="M12 21V9M12 13c-4 0-7-2-8-6 4 0 7 2 8 6zM12 9c4 0 7-2 8-6-4 0-7 2-8 6z"></path><path d="M5 21h14"></path>',
		"users": '<circle cx="9" cy="8" r="3"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3 3 0 0 1 0 5.8M17 14c2.3.6 4 2.7 4 5.2"></path>',
		"bus": '<rect x="4" y="4" width="16" height="13" rx="2"></rect><path d="M4 10h16M8 17v3M16 17v3M8 8h.01M16 8h.01"></path>',
		"calendar": '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
		"file": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path>',
		"download": '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"></path>',
		"external": '<path d="M14 3h7v7M21 3 10 14M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"></path>',
		"filter": '<path d="M4 5h16M7 12h10M10 19h4"></path>',
		"check": '<path d="m5 12 4 4L19 6"></path>',
		"info": '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path>',
		"map-pin": '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"></path><circle cx="12" cy="10" r="2.5"></circle>',
		"mail": '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path>',
		"phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"></path>',
		"clock": '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
		"shield": '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"></path><path d="m9 12 2 2 4-4"></path>',
		"grid": '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect>',
		"layers": '<path d="m12 2 9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5"></path>',
		"inbox": '<path d="M4 4h16v16H4z"></path><path d="M4 13h5l2 3h2l2-3h5"></path>'
	};

	function icon(name, className) {
		var path = iconPaths[name] || iconPaths.info;
		return '<svg class="icon ' + (className || "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + path + "</svg>";
	}

	function topic(slug) {
		return topics.find(function (item) { return item.slug === slug; }) || null;
	}

	function topicLabel(slug) {
		var item = topic(slug);
		return item ? item.label : slug;
	}

	function organization(slug) {
		return organizations.find(function (item) { return item.slug === slug; }) || null;
	}

	function orgName(slug) {
		var item = organization(slug);
		return item ? item.name : slug;
	}

	function orgShort(slug) {
		var item = organization(slug);
		return item ? item.short : slug;
	}

	function topicIcon(slug) {
		var item = topic(slug);
		return item ? item.icon : "database";
	}

	function formatDate(value, style) {
		if (!value) return "";
		var date = new Date(String(value) + "T00:00:00");
		if (isNaN(date.getTime())) return value;
		if (style === "short") {
			return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
		}
		return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
	}

	function dateParts(value) {
		var date = new Date(String(value) + "T00:00:00");
		if (isNaN(date.getTime())) return { day: "", month: "" };
		return {
			day: new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(date),
			month: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date)
		};
	}

	function formatLabel(formats) {
		return (formats || []).join(" · ");
	}

	function sortByDate(list, direction) {
		return list.slice().sort(function (a, b) {
			var aTime = new Date((a.updated || (a.year + "-01-01")) + "T00:00:00").getTime();
			var bTime = new Date((b.updated || (b.year + "-01-01")) + "T00:00:00").getTime();
			return direction === "asc" ? aTime - bTime : bTime - aTime;
		});
	}

	/* ---------------------------------------------------------------------
	   Theme
	   --------------------------------------------------------------------- */
	function applyTheme(mode, persist) {
		var theme = mode === "dark" ? "dark" : "light";
		html.setAttribute("data-theme", theme);
		var toggles = $$("[data-theme-toggle]");
		toggles.forEach(function (button) {
			var dark = theme === "dark";
			button.setAttribute("aria-pressed", dark ? "true" : "false");
			var label = dark ? "Ganti ke mode terang" : "Ganti ke mode gelap";
			button.setAttribute("aria-label", label);
			button.setAttribute("title", label);
		});
		var meta = $('meta[name="theme-color"]');
		if (meta) meta.setAttribute("content", theme === "dark" ? "#0a1421" : "#0d3b66");
		if (persist) {
			try { localStorage.setItem(THEME_KEY, theme); } catch (error) { /* storage unavailable */ }
		}
	}

	function initTheme() {
		var saved = null;
		try { saved = localStorage.getItem(THEME_KEY); } catch (error) { /* storage unavailable */ }
		if (saved !== "dark" && saved !== "light") {
			saved = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}
		applyTheme(saved, false);

		$$("[data-theme-toggle]").forEach(function (button) {
			button.addEventListener("click", function () {
				var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
				applyTheme(next, true);
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Header, navigation and mobile drawer
	   --------------------------------------------------------------------- */
	function initNavigation() {
		var nav = $("#primaryNav");
		var toggle = $("[data-nav-toggle]");
		var close = $("[data-nav-close]");
		var backdrop = $("[data-nav-backdrop]");
		var header = $(".site-header");
		var lastFocus = null;

		function openNav() {
			if (!nav || !toggle) return;
			lastFocus = document.activeElement;
			nav.classList.add("is-open");
			if (backdrop) backdrop.classList.add("is-open");
			toggle.setAttribute("aria-expanded", "true");
			body.classList.add("is-locked");
			var first = nav.querySelector("a, button");
			if (first) first.focus();
		}

		function closeNav() {
			if (!nav || !toggle) return;
			nav.classList.remove("is-open");
			if (backdrop) backdrop.classList.remove("is-open");
			toggle.setAttribute("aria-expanded", "false");
			body.classList.remove("is-locked");
			if (lastFocus && lastFocus.focus) lastFocus.focus();
		}

		if (toggle) {
			toggle.addEventListener("click", function () {
				if (nav && nav.classList.contains("is-open")) closeNav();
				else openNav();
			});
		}
		if (close) close.addEventListener("click", closeNav);
		if (backdrop) backdrop.addEventListener("click", closeNav);
		if (nav) {
			nav.addEventListener("click", function (event) {
				var link = event.target.closest("a");
				if (link) closeNav();
			});
		}

		document.addEventListener("keydown", function (event) {
			if (event.key === "Escape") {
				if (nav && nav.classList.contains("is-open")) closeNav();
				$$(".nav-dropdown.is-open").forEach(function (item) {
					item.classList.remove("is-open");
					var trigger = item.querySelector(".nav-trigger");
					if (trigger) trigger.setAttribute("aria-expanded", "false");
				});
			}
		});

		window.addEventListener("resize", function () {
			if (window.innerWidth > 1080 && nav && nav.classList.contains("is-open")) closeNav();
		});

		$$(".nav-trigger").forEach(function (trigger) {
			trigger.addEventListener("click", function (event) {
				event.preventDefault();
				var item = trigger.parentElement;
				var isOpen = item.classList.contains("is-open");
				$$(".nav-dropdown.is-open").forEach(function (other) {
					if (other !== item) {
						other.classList.remove("is-open");
						var otherTrigger = other.querySelector(".nav-trigger");
						if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
					}
				});
				item.classList.toggle("is-open", !isOpen);
				trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
			});
		});

		document.addEventListener("click", function (event) {
			if (!event.target.closest(".nav-dropdown")) {
				$$(".nav-dropdown.is-open").forEach(function (item) {
					item.classList.remove("is-open");
					var trigger = item.querySelector(".nav-trigger");
					if (trigger) trigger.setAttribute("aria-expanded", "false");
				});
			}
		});

		if (header) {
			var updateHeader = function () {
				header.classList.toggle("is-scrolled", window.scrollY > 8);
			};
			updateHeader();
			window.addEventListener("scroll", updateHeader, { passive: true });
		}

		var scrolltop = $("[data-scrolltop]");
		if (scrolltop) {
			var updateScrolltop = function () {
				scrolltop.classList.toggle("is-visible", window.scrollY > 420);
			};
			updateScrolltop();
			window.addEventListener("scroll", updateScrolltop, { passive: true });
			scrolltop.addEventListener("click", function () {
				window.scrollTo({ top: 0, behavior: "smooth" });
			});
		}

		markActiveNavigation();
	}

	function markActiveNavigation() {
		var path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
		var params = new URLSearchParams(window.location.search);
		var view = params.get("view");
		var active = "";

		if (/\/index\.html$/.test(path) || /\/$/.test(path)) active = "home";
		if (path.indexOf("/dashboards/aside") !== -1) {
			if (view === "visualisasi" || params.get("visualisasi")) active = "visualisasi";
			else if (view === "infografik" || params.get("infografis")) active = "infografik";
			else active = "dataset";
		}
		if (path.indexOf("/account/overview") !== -1) active = "organisasi";
		if (path.indexOf("/account/activity") !== -1) active = "publikasi";
		if (path.indexOf("/general/about") !== -1) active = "tentang";
		if (path.indexOf("/general/faq") !== -1) active = "faq";
		if (path.indexOf("/general/invoice") !== -1) active = "panduan";

		$$("[data-nav-match]").forEach(function (link) {
			var match = link.getAttribute("data-nav-match");
			var isActive = match === active;
			link.classList.toggle("is-active", isActive);
			if (isActive && link.tagName === "A") link.setAttribute("aria-current", "page");
			else link.removeAttribute("aria-current");
		});

		$$(".nav-dropdown").forEach(function (item) {
			var childActive = item.querySelector(".nav-link.is-active, .nav-panel__link.is-active");
			if (childActive) {
				var trigger = item.querySelector(".nav-trigger");
				if (trigger) trigger.classList.add("is-active");
			}
		});
	}

	function initDates() {
		$$("[data-current-date]").forEach(function (element) {
			element.textContent = new Intl.DateTimeFormat("id-ID", {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric"
			}).format(new Date());
		});
		$$("[data-current-year]").forEach(function (element) {
			element.textContent = String(new Date().getFullYear());
		});
	}

	/* ---------------------------------------------------------------------
	   Shared preview drawings for visualisations and infographics
	   --------------------------------------------------------------------- */
	function preview(kind) {
		var svg = '<svg class="chart-preview" viewBox="0 0 320 160" role="img" aria-label="Pratinjau visualisasi" preserveAspectRatio="xMidYMid meet">';
		svg += '<rect x="0" y="0" width="320" height="160" fill="transparent"></rect>';
		svg += '<path class="pv-grid" d="M34 28h250M34 62h250M34 96h250M34 130h250"></path>';
		svg += '<path class="pv-axis" d="M34 24v110h260"></path>';

		if (kind === "line") {
			svg += '<polyline class="pv-line" points="44,118 84,102 124,108 164,74 204,84 244,52 284,60"></polyline>';
			svg += '<circle class="pv-dot" cx="164" cy="74" r="3.5"></circle><circle class="pv-dot" cx="244" cy="52" r="3.5"></circle>';
		} else if (kind === "donut") {
			svg += '<circle class="pv-soft" cx="118" cy="82" r="42" stroke-width="18" fill="none" stroke="var(--brand-soft)"></circle>';
			svg += '<circle cx="118" cy="82" r="42" fill="none" stroke="var(--brand)" stroke-width="18" stroke-dasharray="132 132" stroke-linecap="butt" transform="rotate(-90 118 82)"></circle>';
			svg += '<circle cx="118" cy="82" r="42" fill="none" stroke="var(--accent)" stroke-width="18" stroke-dasharray="40 224" stroke-dashoffset="-132" transform="rotate(-90 118 82)"></circle>';
			svg += '<rect class="pv-soft-bar" x="186" y="50" width="94" height="7" rx="3.5"></rect><rect class="pv-soft-bar" x="186" y="68" width="72" height="7" rx="3.5"></rect><rect class="pv-soft-bar" x="186" y="86" width="84" height="7" rx="3.5"></rect><rect class="pv-soft-bar" x="186" y="104" width="58" height="7" rx="3.5"></rect>';
		} else if (kind === "radar") {
			svg += '<polygon class="pv-soft-fill" points="160,36 214,68 214,116 160,142 106,116 106,68"></polygon>';
			svg += '<polygon class="pv-line-fill" points="160,56 196,76 204,110 162,128 116,106 120,78"></polygon>';
			svg += '<path class="pv-spoke" d="M160 36v106M106 68l108 48M214 68 106 116"></path>';
		} else if (kind === "map") {
			svg += '<path class="pv-map" d="M64 50l44-18 52 22 42-12 34 35-15 44-51 14-52-12-35-30z"></path>';
			svg += '<circle class="pv-dot" cx="124" cy="80" r="4"></circle><circle class="pv-dot" cx="174" cy="65" r="4"></circle><circle class="pv-dot" cx="150" cy="113" r="4"></circle><circle class="pv-dot" cx="208" cy="93" r="4"></circle>';
			svg += '<circle class="pv-dot-ring" cx="174" cy="65" r="10"></circle>';
		} else if (kind === "poster") {
			svg += '<rect class="pv-poster" x="34" y="20" width="252" height="120" rx="5"></rect>';
			svg += '<rect x="34" y="20" width="7" height="120" fill="var(--brand)"></rect>';
			svg += '<rect class="pv-soft-bar" x="56" y="40" width="82" height="8" rx="4"></rect>';
			svg += '<rect class="pv-soft-bar" x="56" y="56" width="126" height="5" rx="2.5"></rect>';
			svg += '<rect class="pv-soft-bar" x="56" y="67" width="108" height="5" rx="2.5"></rect>';
			svg += '<rect class="pv-soft-bar" x="56" y="96" width="58" height="28" rx="4"></rect>';
			svg += '<rect class="pv-soft-bar" x="120" y="96" width="58" height="28" rx="4"></rect>';
			svg += '<rect class="pv-soft-bar" x="184" y="96" width="58" height="28" rx="4"></rect>';
			svg += '<circle cx="262" cy="44" r="12" fill="var(--accent)" opacity=".9"></circle>';
		} else {
			svg += '<rect class="pv-fill" x="52" y="82" width="24" height="50" rx="2"></rect>';
			svg += '<rect class="pv-fill" x="88" y="62" width="24" height="70" rx="2"></rect>';
			svg += '<rect class="pv-fill" x="124" y="92" width="24" height="40" rx="2"></rect>';
			svg += '<rect class="pv-fill" x="160" y="46" width="24" height="86" rx="2"></rect>';
			svg += '<rect class="pv-fill" x="196" y="70" width="24" height="62" rx="2"></rect>';
			svg += '<rect class="pv-fill" x="232" y="54" width="24" height="78" rx="2"></rect>';
		}
		svg += "</svg>";
		return svg;
	}

	/* ---------------------------------------------------------------------
	   Home page
	   --------------------------------------------------------------------- */
	function initHome() {
		var topicContainer = $("[data-home-topics]");
		if (topicContainer) {
			topicContainer.innerHTML = topics.map(function (item) {
				return '<a class="topic-card" href="dashboards/aside.html?topic=' + encodeURIComponent(item.slug) + '">' +
					'<span class="topic-card__icon">' + icon(item.icon || "database") + "</span>" +
					'<span class="topic-card__label">' + escapeHtml(item.label) + "</span>" +
					'<span class="topic-card__arrow">' + icon("chevron-right") + "</span>" +
					"</a>";
			}).join("");
		}

		var table = $("[data-latest-datasets]");
		if (table) {
			var latest = sortByDate(datasets, "desc").slice(0, 5);
			table.innerHTML = latest.map(function (item) {
				return "<tr>" +
					'<td><a class="data-table__title" href="dashboards/aside.html?dataset=' + encodeURIComponent(item.slug) + '">' + escapeHtml(item.title) + "</a>" +
					'<span class="data-table__desc">' + escapeHtml(item.description) + "</span></td>" +
					'<td class="hide-sm">' + escapeHtml(orgShort(item.org)) + "</td>" +
					'<td><span class="tag tag--brand">' + escapeHtml(topicLabel(item.topic)) + "</span></td>" +
					'<td class="hide-sm nowrap">' + escapeHtml(String(item.year)) + "</td>" +
					'<td class="data-table__arrow"><a class="link-arrow" href="dashboards/aside.html?dataset=' + encodeURIComponent(item.slug) + '">Detail ' + icon("chevron-right", "icon--sm") + "</a></td>" +
					"</tr>";
			}).join("");
		}

		var newsContainer = $("[data-home-news]");
		if (newsContainer) {
			newsContainer.innerHTML = articles.slice(0, 4).map(function (item) {
				var parts = dateParts(item.date);
				return '<article class="news-item">' +
					'<div class="news-item__date" aria-hidden="true"><span class="news-item__day">' + escapeHtml(parts.day) + '</span><span class="news-item__month">' + escapeHtml(parts.month) + "</span></div>" +
					'<div class="news-item__body"><h3 class="news-item__title"><a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + "</a></h3>" +
					'<div class="news-item__meta"><span>' + escapeHtml(item.author) + "</span><span>" + escapeHtml(formatDate(item.date, "short")) + "</span></div></div>" +
					"</article>";
			}).join("");
		}

		var pubContainer = $("[data-home-publications]");
		if (pubContainer) {
			pubContainer.innerHTML = publications.slice(0, 4).map(function (item) {
				return '<div class="pub-item">' +
					'<span class="pub-item__icon">' + icon("file") + "</span>" +
					'<div class="pub-item__body"><a class="pub-item__title" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + "</a>" +
					'<div class="pub-item__meta">' + escapeHtml(item.type) + " · " + escapeHtml(String(item.year)) + " · " + escapeHtml(orgShort(item.org)) + "</div></div>" +
					"</div>";
			}).join("");
		}
	}

	/* ---------------------------------------------------------------------
	   Catalogue
	   --------------------------------------------------------------------- */
	function initCatalog() {
		var app = $("#catalogApp");
		if (!app) return;

		var PAGE_SIZE = 6;
		var state = {};
		var searchTimer = null;

		function readState() {
			var params = new URLSearchParams(window.location.search);
			var view = params.get("view");
			state = {
				view: view === "visualisasi" ? "visualisasi" : view === "infografik" ? "infografik" : "dataset",
				q: params.get("q") || "",
				topic: params.get("topic") || "",
				org: params.get("org") || "",
				year: params.get("year") || "",
				sort: params.get("sort") || "terbaru",
				page: Math.max(1, parseInt(params.get("page") || "1", 10) || 1),
				dataset: params.get("dataset") || "",
				visualisasi: params.get("visualisasi") || "",
				infografis: params.get("infografis") || "",
				article: params.get("article") || ""
			};
		}

		function queryState(overrides) {
			var merged = Object.assign({}, state, overrides || {});
			var params = new URLSearchParams();
			if (merged.view && merged.view !== "dataset") params.set("view", merged.view);
			if (merged.q) params.set("q", merged.q);
			if (merged.topic) params.set("topic", merged.topic);
			if (merged.org) params.set("org", merged.org);
			if (merged.year) params.set("year", merged.year);
			if (merged.sort && merged.sort !== "terbaru") params.set("sort", merged.sort);
			if (merged.page && merged.page > 1) params.set("page", String(merged.page));
			if (merged.dataset) params.set("dataset", merged.dataset);
			if (merged.visualisasi) params.set("visualisasi", merged.visualisasi);
			if (merged.infografis) params.set("infografis", merged.infografis);
			if (merged.article) params.set("article", merged.article);
			return params;
		}

		function href(overrides) {
			var params = queryState(overrides);
			var query = params.toString();
			return "dashboards/aside.html" + (query ? "?" + query : "");
		}

		function absoluteHref(overrides) {
			return new URL(href(overrides), document.baseURI).href;
		}

		function push(overrides) {
			try {
				window.history.pushState(null, "", absoluteHref(overrides));
			} catch (error) {
				/* file:// and sandboxed contexts disallow pushState */
			}
		}

		function replace(overrides) {
			try {
				window.history.replaceState(null, "", absoluteHref(overrides));
			} catch (error) {
				/* file:// and sandboxed contexts disallow replaceState */
			}
		}

		function itemsForView() {
			if (state.view === "visualisasi") return visualizations;
			if (state.view === "infografik") return infographics;
			return datasets;
		}

		function itemLabel() {
			if (state.view === "visualisasi") return "visualisasi";
			if (state.view === "infografik") return "infografik";
			return "dataset";
		}

		function updatePageHead() {
			var title = "Katalog Data";
			var desc = "Telusuri dataset statistik sektoral Kabupaten Bima berdasarkan topik, organisasi, dan tahun data.";
			var crumb = "Katalog Data";
			var meta = '<span>' + icon("database") + " " + datasets.length + " dataset dalam katalog</span>" +
				'<span>' + icon("layers") + " " + topics.length + " topik data</span>";

			if (state.view === "visualisasi") {
				title = "Visualisasi Data";
				desc = "Kumpulan visualisasi data sektoral yang disajikan dalam bentuk grafik dan peta untuk memudahkan pemahaman.";
				crumb = "Visualisasi Data";
				meta = '<span>' + icon("chart") + " " + visualizations.length + " visualisasi</span><span>" + icon("layers") + " " + topics.length + " topik data</span>";
			} else if (state.view === "infografik") {
				title = "Infografik";
				desc = "Informasi data yang dikemas secara ringkas dan visual agar mudah dipahami oleh masyarakat.";
				crumb = "Infografik";
				meta = '<span>' + icon("image") + " " + infographics.length + " infografik</span><span>" + icon("layers") + " " + topics.length + " topik data</span>";
			}

			if (state.dataset) {
				var record = datasets.find(function (item) { return item.slug === state.dataset; });
				if (record) { title = "Detail Dataset"; desc = record.title; crumb = "Detail dataset"; }
			}
			if (state.visualisasi) {
				var visual = visualizations.find(function (item) { return item.slug === state.visualisasi; });
				if (visual) { title = "Detail Visualisasi"; desc = visual.title; crumb = "Detail visualisasi"; }
			}
			if (state.infografis) {
				var info = infographics.find(function (item) { return item.slug === state.infografis; });
				if (info) { title = "Detail Infografik"; desc = info.title; crumb = "Detail infografik"; }
			}
			if (state.article) {
				var article = articles.find(function (item) { return item.slug === state.article; });
				if (article) { title = "Artikel"; desc = article.title; crumb = "Artikel"; }
			}

			var titleEl = $("[data-page-title]");
			var descEl = $("[data-page-desc]");
			var crumbEl = $("[data-page-crumb]");
			var metaEl = $("[data-page-meta]");
			if (titleEl) titleEl.textContent = title;
			if (descEl) descEl.textContent = desc;
			if (crumbEl) crumbEl.textContent = crumb;
			if (metaEl) metaEl.innerHTML = meta;
			if (document.title.indexOf("SIBISA") !== -1) {
				document.title = (state.dataset || state.visualisasi || state.infografis || state.article ? desc + " — " : "") + title + " — SIBISA Kabupaten Bima";
			}
		}

		function tabs() {
			return '<div class="container"><nav class="catalog-tabs" aria-label="Jenis konten">' +
				'<a class="catalog-tab ' + (state.view === "dataset" ? "is-active" : "") + '" href="' + href({ view: "dataset", dataset: null, visualisasi: null, infografis: null, article: null, page: 1 }) + '" data-catalog-link>' + icon("database") + "Dataset</a>" +
				'<a class="catalog-tab ' + (state.view === "visualisasi" ? "is-active" : "") + '" href="' + href({ view: "visualisasi", dataset: null, visualisasi: null, infografis: null, article: null, page: 1 }) + '" data-catalog-link>' + icon("chart") + "Visualisasi</a>" +
				'<a class="catalog-tab ' + (state.view === "infografik" ? "is-active" : "") + '" href="' + href({ view: "infografik", dataset: null, visualisasi: null, infografis: null, article: null, page: 1 }) + '" data-catalog-link>' + icon("image") + "Infografik</a>" +
				"</nav></div>";
		}

		function topicCounts(items) {
			var counts = {};
			items.forEach(function (item) {
				counts[item.topic] = (counts[item.topic] || 0) + 1;
			});
			return counts;
		}

		function filtersPanel(items) {
			var counts = topicCounts(itemsForView());
			var years = Array.from(new Set(itemsForView().map(function (item) { return item.year; }))).sort(function (a, b) { return b - a; });
			var orgs = organizations.filter(function (org) {
				return itemsForView().some(function (item) { return item.org === org.slug; });
			});

			return '<aside class="filter-panel" data-filter-panel>' +
				'<div class="filter-panel__head"><span>Saring data</span><button class="btn btn--ghost btn--sm filter-panel__toggle" type="button" data-filter-toggle aria-expanded="false" aria-controls="filterBody">' + icon("filter", "icon--sm") + "Filter</button></div>" +
				'<div class="filter-panel__body" id="filterBody"><form data-filter-form>' +
				'<div class="filter-group"><label class="filter-group__title" for="catalogSearch">Kata kunci</label><div class="filter-search">' + icon("search") + '<input id="catalogSearch" type="search" name="q" value="' + escapeHtml(state.q) + '" placeholder="Cari ' + itemLabel() + '…" autocomplete="off" data-filter-q></div></div>' +
				'<div class="filter-group"><div class="filter-group__title">Topik</div><div class="filter-list">' +
				topics.map(function (item) {
					return '<label class="filter-check"><input type="checkbox" name="topic" value="' + escapeHtml(item.slug) + '"' + (state.topic === item.slug ? " checked" : "") + ' data-filter-topic><span>' + escapeHtml(item.label) + " <strong>" + (counts[item.slug] || 0) + "</strong></span></label>";
				}).join("") +
				"</div></div>" +
				'<div class="filter-group"><label class="filter-group__title" for="catalogOrg">Organisasi</label><select class="filter-select" id="catalogOrg" data-filter-org><option value="">Semua organisasi</option>' +
				orgs.map(function (org) {
					return '<option value="' + escapeHtml(org.slug) + '"' + (state.org === org.slug ? " selected" : "") + ">" + escapeHtml(org.short) + "</option>";
				}).join("") +
				"</select></div>" +
				'<div class="filter-group"><label class="filter-group__title" for="catalogYear">Tahun data</label><select class="filter-select" id="catalogYear" data-filter-year><option value="">Semua tahun</option>' +
				years.map(function (year) {
					return '<option value="' + year + '"' + (String(state.year) === String(year) ? " selected" : "") + ">" + year + "</option>";
				}).join("") +
				"</select></div>" +
				'<div class="filter-actions"><a class="btn btn--ghost btn--sm" href="' + href({ q: "", topic: "", org: "", year: "", page: 1 }) + '" data-catalog-link>Atur ulang</a><span class="text-muted" style="font-size:.73rem">' + items.length + " hasil</span></div>" +
				"</form></div></aside>";
		}

		function filteredItems() {
			var items = itemsForView().filter(function (item) {
				if (state.topic && item.topic !== state.topic) return false;
				if (state.org && item.org !== state.org) return false;
				if (state.year && String(item.year) !== String(state.year)) return false;
				return true;
			});

			var q = normalize(state.q);
			if (q) {
				items = items.filter(function (item) {
					var haystack = [
						item.title,
						item.description,
						orgName(item.org),
						orgShort(item.org),
						topicLabel(item.topic),
						String(item.year),
						formatLabel(item.formats)
					].join(" ");
					return normalize(haystack).indexOf(q) !== -1;
				});
			}

			if (state.sort === "terlama") return sortByDate(items, "asc");
			if (state.sort === "judul") {
				return items.slice().sort(function (a, b) {
					return a.title.localeCompare(b.title, "id");
				});
			}
			return sortByDate(items, "desc");
		}

		function datasetRow(item) {
			var detail = href({ dataset: item.slug });
			return '<article class="result-item"><div class="result-item__head"><div>' +
				'<h2 class="result-item__title"><a href="' + detail + '" data-catalog-link>' + escapeHtml(item.title) + "</a></h2>" +
				'<p class="result-item__desc">' + escapeHtml(item.description) + "</p>" +
				'<div class="result-item__meta">' +
				"<span>" + icon("building") + escapeHtml(orgName(item.org)) + "</span>" +
				"<span>" + icon("calendar") + "Tahun " + escapeHtml(String(item.year)) + "</span>" +
				"<span>" + icon("file") + escapeHtml(formatLabel(item.formats)) + "</span>" +
				'<span class="tag tag--brand">' + escapeHtml(topicLabel(item.topic)) + "</span>" +
				"</div></div>" +
				'<div class="result-item__action"><a class="btn btn--outline" href="' + detail + '" data-catalog-link>Lihat detail</a></div></div></article>';
		}

		function mediaCard(item) {
			var isVisual = state.view === "visualisasi";
			var detail = href(isVisual ? { visualisasi: item.slug } : { infografis: item.slug });
			return '<a class="media-card" href="' + detail + '" data-catalog-link>' +
				'<div class="media-card__preview"><span class="tag tag--brand media-card__badge">' + (isVisual ? "Visualisasi" : "Infografik") + "</span>" + preview(item.kind) + "</div>" +
				'<div class="media-card__body"><h2 class="media-card__title">' + escapeHtml(item.title) + "</h2>" +
				'<div class="media-card__meta"><span>' + icon("building") + escapeHtml(orgShort(item.org)) + "</span><span>" + icon("calendar") + escapeHtml(String(item.year)) + "</span><span>" + icon("layers") + escapeHtml(topicLabel(item.topic)) + "</span></div></div></a>";
		}

		function pagination(total, pages) {
			if (pages <= 1) {
				return '<div class="pagination"><span class="pagination__info">Menampilkan ' + total + " " + itemLabel() + "</span></div>";
			}
			var current = state.page;
			var prev = current <= 1
				? '<span class="page-btn is-disabled" aria-disabled="true" aria-label="Halaman sebelumnya">' + icon("chevron-left") + "</span>"
				: '<a class="page-btn" href="' + href({ page: current - 1 }) + '" data-catalog-link aria-label="Halaman sebelumnya">' + icon("chevron-left") + "</a>";
			var buttons = prev;
			for (var page = 1; page <= pages; page += 1) {
				buttons += '<a class="page-btn ' + (page === current ? "is-current" : "") + '" href="' + href({ page: page }) + '" data-catalog-link' + (page === current ? ' aria-current="page"' : "") + ">" + page + "</a>";
			}
			var next = current >= pages
				? '<span class="page-btn is-disabled" aria-disabled="true" aria-label="Halaman berikutnya">' + icon("chevron-right") + "</span>"
				: '<a class="page-btn" href="' + href({ page: current + 1 }) + '" data-catalog-link aria-label="Halaman berikutnya">' + icon("chevron-right") + "</a>";
			buttons += next;
			var start = (current - 1) * PAGE_SIZE + 1;
			var end = Math.min(current * PAGE_SIZE, total);
			return '<div class="pagination"><span class="pagination__info">Menampilkan ' + start + "–" + end + " dari " + total + " " + itemLabel() + '</span><div class="pagination__list">' + buttons + "</div></div>";
		}

		function resultsMarkup(items) {
			if (!items.length) {
				return '<div class="empty-state"><span class="empty-state__icon">' + icon("search") + "</span><h2>Tidak ada hasil</h2><p>Kata kunci atau filter yang dipilih belum menemukan data. Coba gunakan kata kunci lain atau atur ulang filter.</p>" +
					'<a class="btn btn--outline btn--sm" href="' + href({ q: "", topic: "", org: "", year: "", page: 1 }) + '" data-catalog-link>Atur ulang filter</a></div>';
			}

			var pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
			if (state.page > pages) {
				state.page = pages;
				replace({ page: pages });
			}
			var start = (state.page - 1) * PAGE_SIZE;
			var visible = items.slice(start, start + PAGE_SIZE);

			var list = state.view === "dataset"
				? '<div class="result-list">' + visible.map(datasetRow).join("") + "</div>"
				: '<div class="media-grid">' + visible.map(mediaCard).join("") + "</div>";

			return list + pagination(items.length, pages);
		}

		function listView() {
			var items = filteredItems();
			var start = (state.page - 1) * PAGE_SIZE;
			var visibleCount = Math.min(PAGE_SIZE, Math.max(0, items.length - start));
			var countText = items.length === 1 ? "1 " + itemLabel() : items.length + " " + itemLabel();
			var showing = items.length ? "Menampilkan " + visibleCount + " dari " + countText : "Tidak ada hasil";

			var toolbar = '<div class="catalog-toolbar"><span class="catalog-count">' + showing + '</span><label class="catalog-sort">Urutkan <select data-sort aria-label="Urutkan hasil">' +
				'<option value="terbaru"' + (state.sort === "terbaru" ? " selected" : "") + ">Terbaru</option>" +
				'<option value="terlama"' + (state.sort === "terlama" ? " selected" : "") + ">Terlama</option>" +
				'<option value="judul"' + (state.sort === "judul" ? " selected" : "") + ">Judul A–Z</option>" +
				"</select></label></div>";

			app.innerHTML = tabs() + '<div class="container"><div class="catalog-layout">' + filtersPanel(items) +
				'<div class="catalog-main" data-results>' + toolbar + resultsMarkup(items) + "</div></div></div>";
		}

		function detailMeta(record, type) {
			var rows = [
				["Organisasi", orgName(record.org)],
				["Topik", topicLabel(record.topic)],
				["Tahun data", String(record.year)],
				["Jenis konten", type]
			];
			if (record.updated) rows.push(["Diperbarui", formatDate(record.updated, "short")]);
			if (record.formats) rows.push(["Format", formatLabel(record.formats)]);
			if (record.frequency) rows.push(["Frekuensi", record.frequency]);
			if (record.license) rows.push(["Lisensi", record.license]);
			rows.push(["Sumber", "SIBISA Kabupaten Bima"]);
			return '<div class="meta-grid">' + rows.map(function (row) {
				return '<div class="meta-grid__item"><span class="meta-grid__label">' + escapeHtml(row[0]) + '</span><span class="meta-grid__value">' + escapeHtml(row[1]) + "</span></div>";
			}).join("") + "</div>";
		}

		function detailBack() {
			return '<a class="link-arrow detail__back" href="' + href({ dataset: null, visualisasi: null, infografis: null, article: null, page: 1 }) + '" data-catalog-link>' + icon("chevron-left", "icon--sm") + "Kembali ke katalog</a>";
		}

		function relatedItems(record, type) {
			var pool = type === "dataset" ? datasets : type === "visualisasi" ? visualizations : infographics;
			var related = pool.filter(function (item) { return item.topic === record.topic && item.slug !== record.slug; }).slice(0, 3);
			if (!related.length) return "";
			if (type === "dataset") {
				return '<section class="detail__section"><h2>Dataset terkait</h2><div class="result-list">' + related.map(datasetRow).join("") + "</div></section>";
			}
			return "";
		}

		function datasetDetail(record) {
			var body = '<div class="container"><div class="detail">' + detailBack() +
				'<header class="detail__header"><span class="tag tag--brand">Dataset</span><h1 class="detail__title">' + escapeHtml(record.title) + "</h1>" +
				'<p class="detail__lead">' + escapeHtml(record.description) + "</p>" +
				'<div class="detail__meta"><span>' + icon("building") + escapeHtml(orgName(record.org)) + "</span><span>" + icon("calendar") + "Diperbarui " + escapeHtml(formatDate(record.updated, "short")) + "</span><span>" + icon("file") + escapeHtml(formatLabel(record.formats)) + "</span></div></header>" +
				'<section class="detail__section"><h2>Metadata</h2>' + detailMeta(record, "Dataset") + "</section>" +
				'<section class="detail__section"><h2>Struktur data</h2><p>Kolom berikut merupakan struktur metadata dataset. Nilai dan berkas data lengkap tersedia melalui portal SIBISA.</p>' +
				'<div class="table-wrap"><table class="structure-table"><thead><tr><th>Kolom</th><th>Tipe</th><th>Keterangan</th></tr></thead><tbody>' +
				(record.columns || []).map(function (column) {
					return "<tr><td>" + escapeHtml(column.name) + "</td><td>" + escapeHtml(column.type) + "</td><td>" + escapeHtml(column.desc) + "</td></tr>";
				}).join("") +
				"</tbody></table></div></section>" +
				'<div class="notice">' + icon("info") + "<span>Berkas dataset dikelola oleh " + escapeHtml(orgName(record.org)) + " melalui SIBISA. Gunakan portal SIBISA untuk mengakses data lengkap dan metadata terbaru.</span></div>" +
				'<div class="detail-actions"><a class="btn btn--primary" href="https://sibisa.bimakab.go.id" target="_blank" rel="noopener">' + icon("external", "icon--sm") + "Buka SIBISA</a><a class=\"btn btn--outline\" href=\"" + href({ dataset: null }) + "\" data-catalog-link>Kembali ke katalog</a></div>" +
				relatedItems(record, "dataset") + "</div></div>";
			app.innerHTML = body;
		}

		function mediaDetail(record, type) {
			var isVisual = type === "visualisasi";
			var body = '<div class="container"><div class="detail">' + detailBack() +
				'<header class="detail__header"><span class="tag tag--brand">' + (isVisual ? "Visualisasi" : "Infografik") + "</span><h1 class=\"detail__title\">" + escapeHtml(record.title) + "</h1>" +
				'<p class="detail__lead">' + escapeHtml(record.description) + "</p>" +
				'<div class="detail__meta"><span>' + icon("building") + escapeHtml(orgName(record.org)) + "</span><span>" + icon("calendar") + "Tahun " + escapeHtml(String(record.year)) + "</span><span>" + icon("layers") + escapeHtml(topicLabel(record.topic)) + "</span></div></header>" +
				'<section class="detail__section"><div class="media-card__preview" style="border:1px solid var(--border);border-radius:var(--radius)">' + preview(record.kind) + "</div><p class=\"text-muted\" style=\"margin-top:10px;font-size:.8rem\">Pratinjau tata letak. Konten lengkap tersedia melalui kanal resmi SIBISA.</p></section>" +
				'<section class="detail__section"><h2>Metadata</h2>' + detailMeta(record, isVisual ? "Visualisasi" : "Infografik") + "</section>" +
				'<div class="notice">' + icon("info") + "<span>Konten ini dikelola oleh " + escapeHtml(orgName(record.org)) + ". Untuk memperoleh versi lengkap, silakan akses portal SIBISA Kabupaten Bima.</span></div>" +
				'<div class="detail-actions"><a class="btn btn--primary" href="https://sibisa.bimakab.go.id" target="_blank" rel="noopener">' + icon("external", "icon--sm") + "Buka SIBISA</a><a class=\"btn btn--outline\" href=\"" + href({ visualisasi: null, infografis: null }) + "\" data-catalog-link>Kembali ke katalog</a></div>" +
				"</div></div>";
			app.innerHTML = body;
		}

		function articleDetail(record) {
			var body = '<div class="container"><div class="detail">' +
				'<a class="link-arrow detail__back" href="index.html#kabar">' + icon("chevron-left", "icon--sm") + "Kembali ke beranda</a>" +
				'<header class="detail__header"><span class="tag tag--brand">Artikel</span><h1 class="detail__title">' + escapeHtml(record.title) + "</h1>" +
				'<div class="detail__meta"><span>' + icon("calendar") + escapeHtml(formatDate(record.date)) + "</span><span>" + icon("users") + escapeHtml(record.author) + "</span></div></header>" +
				'<section class="detail__section"><p class="detail__lead">' + escapeHtml(record.excerpt) + "</p>" +
				'<div class="notice" style="margin-top:18px">' + icon("info") + "<span>Artikel lengkap diterbitkan pada kanal resmi Pemerintah Kabupaten Bima.</span></div>" +
				'<div class="detail-actions"><a class="btn btn--primary" href="' + escapeHtml(record.url) + '" target="_blank" rel="noopener">' + icon("external", "icon--sm") + "Baca artikel lengkap</a></div></section></div></div>";
			app.innerHTML = body;
		}

		function notFound(message) {
			app.innerHTML = '<div class="container"><div class="empty-state" style="margin-block:48px"><span class="empty-state__icon">' + icon("inbox") + "</span><h2>Konten tidak ditemukan</h2><p>" + escapeHtml(message || "Halaman yang Anda cari tidak tersedia atau telah dipindahkan.") + '</p><a class="btn btn--outline" href="' + href({ dataset: null, visualisasi: null, infografis: null, article: null }) + '" data-catalog-link>Kembali ke katalog</a></div></div>';
		}

		function render() {
			readState();
			updatePageHead();
			markActiveNavigation();

			var pageHead = $(".page-head");
			var isDetail = !!(state.article || state.dataset || state.visualisasi || state.infografis);
			if (pageHead) pageHead.hidden = isDetail;

			if (state.article) {
				var article = articles.find(function (item) { return item.slug === state.article; });
				if (article) articleDetail(article);
				else notFound("Artikel yang Anda cari tidak tersedia.");
				return;
			}
			if (state.dataset) {
				var record = datasets.find(function (item) { return item.slug === state.dataset; });
				if (record) datasetDetail(record);
				else notFound("Dataset yang Anda cari tidak tersedia.");
				return;
			}
			if (state.visualisasi) {
				var visual = visualizations.find(function (item) { return item.slug === state.visualisasi; });
				if (visual) mediaDetail(visual, "visualisasi");
				else notFound("Visualisasi yang Anda cari tidak tersedia.");
				return;
			}
			if (state.infografis) {
				var info = infographics.find(function (item) { return item.slug === state.infografis; });
				if (info) mediaDetail(info, "infografik");
				else notFound("Infografik yang Anda cari tidak tersedia.");
				return;
			}
			listView();
		}

		function scrollToCatalog() {
			var head = $(".page-head");
			if (!head || head.hidden) {
				window.scrollTo({ top: 0, behavior: "auto" });
				return;
			}
			var top = Math.max(0, head.offsetTop - 1);
			window.scrollTo({ top: top, behavior: "auto" });
		}

		/* Events */
		app.addEventListener("click", function (event) {
			var link = event.target.closest("a[data-catalog-link]");
			if (!link) return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
			event.preventDefault();
			var url = new URL(link.getAttribute("href"), document.baseURI);
			try {
				window.history.pushState(null, "", url.href);
			} catch (error) {
				/* file:// and sandboxed contexts disallow pushState */
			}
			render();
			scrollToCatalog();
		});

		app.addEventListener("input", function (event) {
			var input = event.target.closest("[data-filter-q]");
			if (!input) return;
			state.q = input.value;
			state.page = 1;
			replace({ q: state.q, page: 1 });
			clearTimeout(searchTimer);
			searchTimer = setTimeout(function () {
				var results = $("[data-results]");
				if (!results) return;
				var items = filteredItems();
				var visibleCount = Math.min(PAGE_SIZE, Math.max(0, items.length - (state.page - 1) * PAGE_SIZE));
				var countText = items.length === 1 ? "1 " + itemLabel() : items.length + " " + itemLabel();
				results.querySelector(".catalog-count").textContent = items.length ? "Menampilkan " + visibleCount + " dari " + countText : "Tidak ada hasil";
				results.innerHTML = results.querySelector(".catalog-toolbar").outerHTML + resultsMarkup(items);
			}, 220);
		});

		app.addEventListener("change", function (event) {
			var topicInput = event.target.closest("[data-filter-topic]");
			var orgSelect = event.target.closest("[data-filter-org]");
			var yearSelect = event.target.closest("[data-filter-year]");
			var sortSelect = event.target.closest("[data-sort]");

			if (topicInput) {
				state.topic = topicInput.checked ? topicInput.value : "";
				state.page = 1;
				replace({ topic: state.topic, page: 1 });
				render();
				return;
			}
			if (orgSelect) {
				state.org = orgSelect.value;
				state.page = 1;
				replace({ org: state.org, page: 1 });
				render();
				return;
			}
			if (yearSelect) {
				state.year = yearSelect.value;
				state.page = 1;
				replace({ year: state.year, page: 1 });
				render();
				return;
			}
			if (sortSelect) {
				state.sort = sortSelect.value;
				state.page = 1;
				replace({ sort: state.sort, page: 1 });
				render();
			}
		});

		app.addEventListener("click", function (event) {
			var toggle = event.target.closest("[data-filter-toggle]");
			if (!toggle) return;
			var panel = toggle.closest(".filter-panel");
			if (!panel) return;
			var open = panel.classList.toggle("is-open");
			toggle.setAttribute("aria-expanded", open ? "true" : "false");
		});

		app.addEventListener("submit", function (event) {
			if (event.target.closest("[data-filter-form]")) event.preventDefault();
		});

		window.addEventListener("popstate", function () {
			render();
			scrollToCatalog();
		});

		render();
	}

	/* ---------------------------------------------------------------------
	   Organisation directory
	   --------------------------------------------------------------------- */
	function initOrganizations() {
		var app = $("[data-org-app]");
		if (!app) return;

		var search = $("[data-org-search]");
		var count = $("[data-org-count]");
		var list = $("[data-org-list]");

		function renderOrgList(query) {
			var q = normalize(query);
			var filtered = organizations.filter(function (org) {
				if (!q) return true;
				return normalize([org.name, org.short, org.description, org.role].join(" ")).indexOf(q) !== -1;
			});

			if (count) {
				count.textContent = filtered.length + " organisasi";
			}

			if (!filtered.length) {
				list.innerHTML = '<div class="empty-state"><span class="empty-state__icon">' + icon("search") + "</span><h2>Organisasi tidak ditemukan</h2><p>Coba gunakan nama atau singkatan organisasi yang lain.</p></div>";
				return;
			}

			list.innerHTML = filtered.map(function (org) {
				var total = datasets.filter(function (item) { return item.org === org.slug; }).length;
				var topicNames = Array.from(new Set(datasets.filter(function (item) { return item.org === org.slug; }).map(function (item) { return topicLabel(item.topic); }))).slice(0, 2);
				return '<div class="org-item"><span class="org-item__badge">' + escapeHtml(org.acronym) + "</span>" +
					'<div class="org-item__body"><div class="org-item__title"><a href="dashboards/aside.html?org=' + encodeURIComponent(org.slug) + '">' + escapeHtml(org.name) + "</a></div>" +
					'<div class="org-item__desc">' + escapeHtml(org.description) + (topicNames.length ? " · " + escapeHtml(topicNames.join(", ")) : "") + "</div></div>" +
					'<div class="org-item__count"><strong>' + total + "</strong><span>dataset</span></div>" +
					'<span class="tag tag--muted">' + escapeHtml(org.role) + "</span></div>";
			}).join("");
		}

		if (search) {
			search.addEventListener("input", function () {
				renderOrgList(search.value);
			});
		}
		renderOrgList("");
	}

	/* ---------------------------------------------------------------------
	   Publications and release schedule
	   --------------------------------------------------------------------- */
	function initPublications() {
		var app = $("[data-pub-app]");
		if (!app) return;

		var yearSelect = $("[data-pub-year]");
		var list = $("[data-pub-list]");

		function renderPublications() {
			var year = yearSelect ? yearSelect.value : "";
			var items = publications.filter(function (item) {
				return !year || String(item.year) === String(year);
			}).sort(function (a, b) { return b.year - a.year; });

			if (!items.length) {
				list.innerHTML = '<div class="empty-state"><span class="empty-state__icon">' + icon("file") + "</span><h2>Belum ada publikasi</h2><p>Publikasi untuk tahun yang dipilih belum tersedia.</p></div>";
				return;
			}

			list.innerHTML = items.map(function (item) {
				return '<div class="pub-item"><span class="pub-item__icon">' + icon("file") + "</span>" +
					'<div class="pub-item__body"><a class="pub-item__title" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + "</a>" +
					'<div class="pub-item__meta">' + escapeHtml(item.type) + " · " + escapeHtml(String(item.year)) + " · " + escapeHtml(orgShort(item.org)) + "</div>" +
					'<div class="pub-item__meta">' + escapeHtml(item.summary) + "</div></div>" +
					'<span class="tag tag--success">Terbit</span></div>';
			}).join("");
		}

		if (yearSelect) {
			yearSelect.addEventListener("change", renderPublications);
		}
		renderPublications();
	}

	function initReleases() {
		var table = $("[data-release-list]");
		if (!table) return;
		table.innerHTML = releases.map(function (item) {
			return "<tr><td><strong>" + escapeHtml(item.period) + "</strong></td><td>" + escapeHtml(item.month) + "</td><td>" + escapeHtml(item.focus) + "</td><td><span class=\"tag tag--brand\">Terjadwal</span></td></tr>";
		}).join("");
	}

	/* ---------------------------------------------------------------------
	   Boot
	   --------------------------------------------------------------------- */
	function init() {
		initTheme();
		initNavigation();
		initDates();
		initHome();
		initCatalog();
		initOrganizations();
		initPublications();
		initReleases();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
