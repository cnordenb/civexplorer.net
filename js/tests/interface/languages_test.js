import { data } from "../../model/data/datahandler.js";
import { collator, civName, fill, nameOf } from "../../model/texts.js";
import { items } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import {
  check, expect, same, tidy, codes, visibleTexts, pick, reset, listed, labelOf, footerAsWide, footerHidden, NAMES,
} from "../helpers_test.js";

const NOTED = 3;
const LINKS = {
  sourceLink: ["source", () => data.source.url],
  updateLink: ["source", () => data.source.update.url],
  rulesLink: ["notice", () => data.source.rules.url],
  projectLink: ["notice", () => data.source.project.url],
};

export function languageTests(code) {
  reset();
  pick(code);
  reset();
  const text = data.text[code];

  const note = (name, offenders) => check(name, !offenders.length, `${code}: ${offenders.slice(0, NOTED).join("; ")}`);

  note("languages: the page's text is in the chosen language", [...document.querySelectorAll("[data-text]")]
    .filter((el) => el.textContent !== text.ui[el.dataset.text]).map((el) => el.dataset.text));
  note("languages: the tree is in the chosen language", items.filter((item) => labelOf(item).textContent
    !== nameOf(item) || nameOf(item) !== (item.group ? text.groups[item.key] : text.items[item.key]))
    .map((item) => item.key));
  note("languages: no placeholders are left in the text",
    visibleTexts(document.body).filter((value) => /[{}]/.test(value)));
  footerTexts(text, code);
  if (code === codes()[0]) footerOnce();
  civList(code);
  reset();
}

function footerTexts(text, code) {
  const notice = fill(data.source.notice, { rules: data.source.rules.name, project: data.source.project.name });
  check("languages: the footer names the game update in the chosen language", $("source").contains($("updateLink"))
    && $("updateLink").textContent === fill(text.ui.update, { number: data.source.update.number }), code);
  check("languages: the footer gives Microsoft's notice in English", tidy($("notice").textContent) === tidy(notice),
    code);
}

function footerOnce() {
  check("languages: the footer names the data's source", $("source").contains($("sourceLink"))
    && $("sourceLink").textContent === data.source.name);
  expect("languages: the footer's links lead where data.json says", Object.entries(LINKS)
    .filter(([id, [within, url]]) => !$(within).contains($(id)) || $(id).getAttribute("href") !== url())
    .map(([id]) => id));
  check("languages: Microsoft's notice is marked as English", $("notice").lang === "en");
  check(NAMES.footerWide, footerAsWide());
  check(NAMES.footerHidden, footerHidden());
}

function civList(code) {
  const names = new Set(data.civs.map(civName));
  const shown = listed();
  check("languages: the civilisations are named in the chosen language",
    shown.length > 0 && shown.every((name) => names.has(name)), code);
  check("languages: the civilisations are sorted in the chosen language's order",
    same(shown, [...shown].sort(collator.compare)), code);
}
