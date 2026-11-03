/**
 * Minimalny, zależny wyłącznie od DOM (bez np. DOMPurify) sanitizer HTML.
 *
 * Po co to w ogóle: pole "description" w ExperienceForm pochodzi
 * z react-simple-wysiwyg i trafia bezpośrednio do
 * dangerouslySetInnerHTML w CVPreview (4 layouty x 1 miejsce).
 * Dopóki dane pochodzą wyłącznie z własnej edycji w edytorze WYSIWYG,
 * ryzyko jest niskie — ale ten sam string trafia też:
 *  - do localStorage jako część wariantu (możliwy import/eksport JSON),
 *  - w przyszłości do pola "description" może trafić wynik
 *    planowanej funkcji "Importuj PDF" / AI, czyli dane, których
 *    Ty nie wpisałeś ręcznie.
 * W obu przypadkach ktoś mógłby wstrzyknąć np. <img onerror=...>
 * albo <script>, uruchamiając dowolny JS w kontekście Twojej aplikacji
 * (XSS). Whitelist poniżej dopuszcza tylko tagi realnie generowane
 * przez react-simple-wysiwyg (pogrubienie, kursywa, listy, linki)
 * i usuwa wszystko inne — łącznie z atrybutami typu onClick, onerror itp.
 */

const ALLOWED_TAGS = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "P",
  "BR",
  "UL",
  "OL",
  "LI",
  "SPAN",
  "DIV",
  "A",
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  A: ["href", "target", "rel"],
};

function cleanNode(node: Node) {
  const children = Array.from(node.childNodes);

  for (const child of children) {
    if (child.nodeType === Node.COMMENT_NODE) {
      node.removeChild(child);
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      continue; // text nodes są bezpieczne, zostają
    }

    const el = child as HTMLElement;
    const tag = el.tagName;

    if (!ALLOWED_TAGS.has(tag)) {
      // "Unwrap": zamiast usuwać cały fragment, wyciągamy jego
      // zawartość na zewnątrz i usuwamy tylko sam (niedozwolony) tag.
      // Dzięki temu np. wklejony <div onclick=...>Tekst</div>
      // zostaje jako zwykłe "Tekst", a nie znika bez śladu.
      while (el.firstChild) node.insertBefore(el.firstChild, el);
      node.removeChild(el);
      continue;
    }

    // Usuń wszystkie atrybuty poza jawnie dozwolonymi dla danego tagu
    // (to eliminuje onClick, onerror, style z javascript:, itp.)
    const allowed = ALLOWED_ATTRS[tag] || [];
    Array.from(el.attributes).forEach((attr) => {
      if (!allowed.includes(attr.name.toLowerCase())) {
        el.removeAttribute(attr.name);
      }
    });

    if (tag === "A") {
      const href = el.getAttribute("href") || "";
      const isSafe = /^https?:\/\//i.test(href) || href.startsWith("mailto:");
      if (!isSafe) {
        el.removeAttribute("href");
      }
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }

    cleanNode(el);
  }
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  const template = document.createElement("template");
  template.innerHTML = html;
  cleanNode(template.content);
  return template.innerHTML;
}