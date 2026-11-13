/* Lightweight text splitter (chars + words) and touch toggle for Card Split Hovers. */
(() => {
	"use strict";

	document.querySelectorAll(".split-card-text [data-split]").forEach((el) => {
		const mode = el.dataset.split || "words";
		const raw = el.textContent.replace(/\s+/g, " ").trim();
		if (!raw) return;

		el.setAttribute("aria-label", raw);
		el.textContent = "";

		if (mode === "chars") {
			let charIndex = 0;
			raw.split(" ").forEach((word, wIdx, words) => {
				const wordWrap = document.createElement("span");
				wordWrap.style.whiteSpace = "nowrap";
				wordWrap.style.display = "inline-block";
				wordWrap.setAttribute("aria-hidden", "true");

				for (const ch of word) {
					const span = document.createElement("span");
					span.className = "char";
					span.style.setProperty("--char-index", String(charIndex++));
					span.textContent = ch;
					wordWrap.appendChild(span);
				}
				el.appendChild(wordWrap);
				if (wIdx < words.length - 1) {
					el.appendChild(document.createTextNode(" "));
					charIndex++;
				}
			});
		} else {
			const words = raw.split(" ");
			words.forEach((word, idx) => {
				const span = document.createElement("span");
				span.className = "word";
				span.setAttribute("aria-hidden", "true");
				span.style.setProperty("--word-index", String(idx));
				span.textContent = word;
				el.appendChild(span);
				if (idx < words.length - 1) {
					el.appendChild(document.createTextNode(" "));
				}
			});
		}
	});

	const cards = [...document.querySelectorAll(".split-card")];
	cards.forEach((card) => {
		card.addEventListener("click", () => {
			if (matchMedia("(hover: hover) and (pointer: fine)").matches) return;
			const wasOpen = card.classList.contains("is-open");
			cards.forEach((other) => other.classList.remove("is-open"));
			if (!wasOpen) card.classList.add("is-open");
		});
		card.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				card.classList.toggle("is-open");
			}
		});
	});
})();
