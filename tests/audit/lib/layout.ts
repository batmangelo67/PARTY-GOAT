import type { Page } from "@playwright/test";

export interface LayoutIssue {
  type: "overflow-x" | "small-target" | "clipped-text" | "small-text" | "low-contrast" | "offscreen-primary";
  detail: string;
}

const MIN_TARGET_PX = 44;
const MIN_TEXT_PX = 13;

// In-page checks for one screen. Kept generic so it runs on every screen the journeys reach.
export async function checkLayout(page: Page): Promise<LayoutIssue[]> {
  return page.evaluate(
    ({ minTarget, minText }) => {
      const issues: { type: string; detail: string }[] = [];
      const label = (el: Element) => (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 50);
      const visible = (el: Element) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0.05;
      };

      if (document.documentElement.scrollWidth > window.innerWidth + 1) {
        issues.push({ type: "overflow-x", detail: `page is ${document.documentElement.scrollWidth}px wide in a ${window.innerWidth}px viewport` });
      }
      for (const el of document.querySelectorAll("main, footer, header")) {
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "visible") {
          issues.push({ type: "overflow-x", detail: `<${el.tagName.toLowerCase()}> content ${el.scrollWidth}px > ${el.clientWidth}px` });
        }
      }

      const interactive = document.querySelectorAll("button, a[href], input, textarea, select, [role=switch], [role=checkbox], [role=radio]");
      for (const el of interactive) {
        if (!visible(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.height < minTarget - 0.5 || rect.width < minTarget - 0.5) {
          issues.push({ type: "small-target", detail: `"${label(el)}" ${Math.round(rect.width)}x${Math.round(rect.height)}` });
        }
      }

      const parseColor = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
      const luminance = ([r = 0, g = 0, b = 0]: number[]) => {
        const channel = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };
      const backgroundOf = (el: Element | null): number[] => {
        for (let node = el; node; node = node.parentElement) {
          const bg = parseColor(getComputedStyle(node).backgroundColor);
          if (bg.length >= 3 && (bg[3] ?? 1) > 0.5) return bg;
        }
        return parseColor(getComputedStyle(document.documentElement).backgroundColor);
      };

      const seen = new Set<string>();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent?.trim();
        const el = node.parentElement;
        if (!text || !el || !visible(el) || el.closest("[aria-hidden=true]")) continue;
        const style = getComputedStyle(el);
        const size = parseFloat(style.fontSize);
        const key = `${text.slice(0, 30)}|${size}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (size < minText) issues.push({ type: "small-text", detail: `"${text.slice(0, 40)}" at ${size}px` });

        const fg = parseColor(style.color);
        const bg = backgroundOf(el);
        const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a) as [number, number];
        const ratio = (l1 + 0.05) / (l2 + 0.05);
        const large = size >= 24 || (size >= 18.6 && Number(style.fontWeight) >= 700);
        const alpha = (fg[3] ?? 1) * Number(style.opacity);
        if (alpha > 0.5 && ratio < (large ? 3 : 4.5)) {
          issues.push({ type: "low-contrast", detail: `"${text.slice(0, 40)}" ratio ${ratio.toFixed(2)}` });
        }

        let box: Element | null = el;
        while (box && getComputedStyle(box).display === "inline") box = box.parentElement;
        if (box && box.scrollWidth > box.clientWidth + 1) {
          const boxStyle = getComputedStyle(box);
          if (boxStyle.overflow === "hidden" || boxStyle.textOverflow === "ellipsis" || boxStyle.overflowX === "hidden") {
            issues.push({ type: "clipped-text", detail: `"${text.slice(0, 50)}" (${box.scrollWidth}px in ${box.clientWidth}px)` });
          }
        }
      }

      const footerButtons = [...document.querySelectorAll("footer button")].filter(visible);
      for (const button of footerButtons) {
        const rect = button.getBoundingClientRect();
        if (rect.bottom > window.innerHeight + 1) issues.push({ type: "offscreen-primary", detail: `"${label(button)}" bottom ${Math.round(rect.bottom)} > ${window.innerHeight}` });
      }
      return issues;
    },
    { minTarget: MIN_TARGET_PX, minText: MIN_TEXT_PX },
  ) as Promise<LayoutIssue[]>;
}

// How long a screen is, in viewport heights, and how many controls it asks the player to consider.
export async function measureScreen(page: Page): Promise<{ controls: number; screens: number }> {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    const controls = main
      ? [...main.querySelectorAll("button, a[href], input, textarea, select")].filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length
      : 0;
    const screens = main ? Math.round((main.scrollHeight / Math.max(main.clientHeight, 1)) * 10) / 10 : 0;
    return { controls, screens };
  });
}
