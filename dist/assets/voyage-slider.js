/* Scoped multi-instance 3D perspective carousel & pointer parallax controller. */
(() => {
	"use strict";

	const lerp = (a, b, t) => a + (b - a) * t;
	const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
	const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

	class Raf {
		constructor() {
			this.callbacks = [];
			this.rafId = 0;
			this.loop = this.loop.bind(this);
		}
		start() {
			if (!this.rafId) this.rafId = requestAnimationFrame(this.loop);
		}
		stop() {
			if (this.rafId) {
				cancelAnimationFrame(this.rafId);
				this.rafId = 0;
			}
		}
		loop() {
			for (const entry of this.callbacks) entry.callback();
			this.rafId = this.callbacks.length ? requestAnimationFrame(this.loop) : 0;
		}
		add(callback) {
			this.callbacks.push({ callback });
			this.start();
		}
	}

	const raf = new Raf();

	function attachTilt(trigger, targets) {
		if (reduceMotion.matches || !finePointer.matches) return;

		let lerpAmount = 0.06;
		const rot = { cx: 0, cy: 0, tx: 0, ty: 0 };
		const bg = { cx: 0, cy: 0, tx: 0, ty: 0 };

		raf.add(() => {
			if (reduceMotion.matches) return;
			if (!trigger.hasAttribute("data-current")) {
				lerpAmount = 0.08;
				rot.tx = 0;
				rot.ty = 0;
				bg.tx = 0;
				bg.ty = 0;
			}
			rot.cx = lerp(rot.cx, rot.tx, lerpAmount);
			rot.cy = lerp(rot.cy, rot.ty, lerpAmount);
			bg.cx = lerp(bg.cx, bg.tx, lerpAmount);
			bg.cy = lerp(bg.cy, bg.ty, lerpAmount);

			for (const el of targets) {
				if (!el) continue;
				el.style.setProperty("--rotX", rot.cy.toFixed(2) + "deg");
				el.style.setProperty("--rotY", rot.cx.toFixed(2) + "deg");
				el.style.setProperty("--bgPosX", bg.cx.toFixed(2) + "%");
				el.style.setProperty("--bgPosY", bg.cy.toFixed(2) + "%");
			}
		});

		trigger.addEventListener("pointermove", (e) => {
			if (reduceMotion.matches || !trigger.hasAttribute("data-current")) return;
			lerpAmount = 0.1;
			const rect = trigger.getBoundingClientRect();
			const ox = (e.clientX - rect.left - rect.width * 0.5) / (Math.PI * 3);
			const oy = -(e.clientY - rect.top - rect.height * 0.5) / (Math.PI * 4);
			rot.tx = ox;
			rot.ty = oy;
			bg.tx = Math.max(-2.6, Math.min(2.6, -ox * 0.12));
			bg.ty = Math.max(-2.6, Math.min(2.6, oy * 0.12));
		});

		trigger.addEventListener("pointerleave", () => {
			lerpAmount = 0.06;
			rot.tx = 0;
			rot.ty = 0;
			bg.tx = 0;
			bg.ty = 0;
		});
	}

	document.querySelectorAll(".voyage-stage").forEach((stage) => {
		const slider = stage.querySelector(".voyage-slider");
		if (!slider) return;

		const slides = [...slider.querySelectorAll(".slide")];
		const infos = [...slider.querySelectorAll(".slide-info")];
		const bgs = [...stage.querySelectorAll(".slide__bg")];
		const dots = [...stage.querySelectorAll(".voyage-dot")];
		const prevBtn = slider.querySelector(".slider--btn__prev");
		const nextBtn = slider.querySelector(".slider--btn__next");

		if (slides.length < 3) return;

		slides.forEach((slide, i) => {
			const slideInner = slide.querySelector(".slide__inner");
			const infoInner = infos[i]?.querySelector(".slide-info__inner");
			const img = slide.querySelector("img");
			if (img && bgs[i]) bgs[i].style.backgroundImage = `url("${img.src}")`;
			attachTilt(slide, [slideInner, infoInner]);
		});

		function getRoleEls(attr) {
			return {
				slide: slider.querySelector(`.slide[${attr}]`),
				info: slider.querySelector(`.slide-info[${attr}]`),
				bg: stage.querySelector(`.slide__bg[${attr}]`)
			};
		}

		function syncDots() {
			const activeIdx = slides.findIndex((s) => s.hasAttribute("data-current"));
			dots.forEach((dot, i) => {
				dot.setAttribute("aria-current", String(i === activeIdx));
			});
		}

		function rotate(direction) {
			let current = getRoleEls("data-current");
			let previous = getRoleEls("data-previous");
			let next = getRoleEls("data-next");

			[current, previous, next].forEach((group) => {
				Object.values(group).forEach((el) => {
					if (!el) return;
					el.removeAttribute("data-current");
					el.removeAttribute("data-previous");
					el.removeAttribute("data-next");
				});
			});

			if (direction === 1) {
				const temp = current;
				current = next;
				next = previous;
				previous = temp;

				if (current.slide) current.slide.style.zIndex = "20";
				if (previous.slide) previous.slide.style.zIndex = "30";
				if (next.slide) next.slide.style.zIndex = "10";
			} else {
				const temp = current;
				current = previous;
				previous = next;
				next = temp;

				if (current.slide) current.slide.style.zIndex = "20";
				if (previous.slide) previous.slide.style.zIndex = "10";
				if (next.slide) next.slide.style.zIndex = "30";
			}

			Object.values(current).forEach((el) => el && el.setAttribute("data-current", ""));
			Object.values(previous).forEach((el) => el && el.setAttribute("data-previous", ""));
			Object.values(next).forEach((el) => el && el.setAttribute("data-next", ""));
			syncDots();
		}

		function stepInDirection(step) {
			const isRtl = document.body.getAttribute("dir") === "rtl";
			rotate(isRtl ? -step : step);
		}

		prevBtn?.addEventListener("click", () => stepInDirection(-1));
		nextBtn?.addEventListener("click", () => stepInDirection(1));

		slides.forEach((slide) => {
			slide.addEventListener("click", () => {
				if (slide.hasAttribute("data-next")) rotate(1);
				else if (slide.hasAttribute("data-previous")) rotate(-1);
			});
		});

		dots.forEach((dot, idx) => {
			dot.addEventListener("click", () => {
				const target = slides[idx];
				if (!target || target.hasAttribute("data-current")) return;
				if (target.hasAttribute("data-next")) rotate(1);
				else if (target.hasAttribute("data-previous")) rotate(-1);
			});
		});

		stage.addEventListener("keydown", (e) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				stepInDirection(-1);
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				stepInDirection(1);
			}
		});

		let touchX = null;
		stage.addEventListener("touchstart", (e) => {
			touchX = e.touches[0].clientX;
		}, { passive: true });
		stage.addEventListener("touchend", (e) => {
			if (touchX === null) return;
			const delta = e.changedTouches[0].clientX - touchX;
			if (Math.abs(delta) > 40) stepInDirection(delta < 0 ? 1 : -1);
			touchX = null;
		}, { passive: true });

		syncDots();
	});
})();
