import { decorateMain } from "../../scripts/scripts.js";

import { loadSections } from "../../scripts/aem.js";

export async function loadFragment(path) {
  if (path && path.startsWith("/")) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement("main");
      main.innerHTML = await resp.text();

      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(
            elem.getAttribute(attr),
            new URL(path, window.location)
          ).href;
        });
      };
      resetAttributeBase("img", "src");
      resetAttributeBase("source", "srcset");

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  console.log(block);
  const link = block.querySelector("a");
  const path = link ? link.getAttribute("href") : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(":scope .section");
    if (fragmentSection) {
      block.closest(".section").classList.add(...fragmentSection.classList);
      block.closest(".fragment").replaceWith(...fragment.childNodes);
    }
  }
}
