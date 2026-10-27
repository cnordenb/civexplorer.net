import { data, size, attempt, recall, nameOf, civFile, language } from "../datahandler.js";
import { items, include } from "../model.js";
import { $ } from "../stringbuilder.js";
import { setOpen } from "../nodetree.js";
import { options, setInclude, setSimple } from "../optionshandler.js";
import {
  root, check, expect, loaded, same, describe, rendered, everything, styles, keyDown, tap, type, reset, beside, edges,
  spans, need, pictures, simpleSpot, picturesOn, civLinks, simpleTicked, tabIcons, drawn, ui, box, fixtures, codes,
  pick, GRADES, grade, fitted, fitting, urlsOf, misjudged,
} from "./helpers.js";

const rows = { has: 50, lacks: 100 };

const at = (url, path) => url.endsWith(`/assets/images/${path}.webp")`);

const picture = (style, path) => at(style.backgroundImage, path);

const cut = (el) => !picture(getComputedStyle(el), `ui/buttons/button_${grade()}`)
  || getComputedStyle(el).backgroundSize !== "100% 300%"
  || styles(el).slice(1, 3).some((style) => style.display !== "none")
  || Math.abs(box(el).width * 50 / 290 - box(el).height) > 1;

const shaded = (el) => [el, ...el.querySelectorAll("*")].some((part) => getComputedStyle(part).textShadow !== "none");

const checked = (id) => $(id).getAttribute("aria-checked") === "true";

async function cornered(cancel, ok) {
  const [look, panel] = [getComputedStyle($("options"), "::backdrop"), getComputedStyle($("options"), "::before")];
  if (look.backgroundImage === "none") return [];
  const sheet = new Image();
  sheet.src = /url\("(.+)"\)/.exec(look.backgroundImage)[1];
  await loaded([sheet]);
  const width = parseFloat(look.backgroundSize);
  const height = width * sheet.naturalHeight / sheet.naturalWidth;
  const [, sign, shift] = /([+-]) ([\d.]+)px/.exec(look.backgroundPositionY) ?? [];
  const bottom = (innerHeight + height) / 2 + Number(sign + shift);
  const [across, down] = [(innerWidth + width) / 2 - ok.right, bottom - ok.bottom];
  const top = box($("languageButton")).top + parseFloat(panel.marginTop);
  const end = box($("settings")).bottom - parseFloat(panel.marginBottom);
  return [
    ...need(box($("optionsTitle")).bottom <= top && end <= cancel.top, "the panel is not between the title and Cancel"),
    ...need(across > 0 && Math.abs(across - down) < 0.5,
      `OK is ${Math.round(across)} from the parchment's right edge and ${Math.round(down)} from its bottom edge`),
  ];
}

function offParchment(style) {
  const [left, top, right, bottom] = ["--left", "--top", "--right", "--bottom"]
    .map((name) => Number(style.getPropertyValue(name)));
  const [w, h] = style.getPropertyValue("--ratio").split("/").map(Number);
  const wide = Math.max(innerWidth, innerHeight * w / h);
  const high = Math.max(innerHeight, innerWidth * h / w);

  const x = (share) => (innerWidth - wide) / 2 + wide * share;

  const y = (share) => (innerHeight - high) / 2 + high * share;

  $("content").scrollTop = 0;
  const clip = getComputedStyle($("content")).overflowY === "visible" ? Infinity : box($("content")).bottom;
  return [$("top"), $("content"), ...$("content").querySelectorAll(".pane, .foot")].filter(rendered).filter((el) => {
    const edge = box(el);
    return edge.left < x(left) - 0.5 || edge.right > x(right) + 0.5 || edge.top < y(top) - 0.5
      || Math.min(edge.bottom, clip) > y(bottom) + 0.5;
  }).map(describe);
}

function strayCursors() {
  const scale = grade() === "4k" ? "x2" : "x1";

  const wanted = (el) => `ui/cursors/cursor_${el.closest(".civs a, .foot a") ? "pointing" : "normal"}_${scale}`;

  return [root, document.body, ...everything()]
    .filter((el) => !getComputedStyle(el).cursor.includes(`/assets/images/${wanted(el)}.webp"`)).map(describe);
}

function wrongSizes() {
  const [was, shown] = [{ ...root.dataset }, [root, document.body, ...everything()]
    .filter((el) => styles(el).some((style) => urlsOf(style).length))];
  const wrong = Object.entries(GRADES).flatMap(([background, assets]) => {
    Object.assign(root.dataset, { background, assets });
    const used = shown.flatMap(styles).concat(getComputedStyle($("options"), "::backdrop")).flatMap(urlsOf);
    return [
      ...used.filter((src) => !fitting(src, background)).map((src) => `${src.split("/").pop()} with ${background}`),
      ...need(picture(getComputedStyle(document.body), `ui/backgrounds/${background}`), `no ${background}.webp`),
    ];
  });
  Object.assign(root.dataset, { background: was.background, assets: was.assets });
  return [...new Set(wrong)];
}

function pictureLooks() {
  const style = getComputedStyle(document.body);
  const [wanted, { background, assets }] = [fitted(), root.dataset];
  const button = getComputedStyle($("optionsButton"));
  expect("options: without Simple UI, the background, pictures and cursors suit the screen's resolution, each in one "
    + "size, the Options button and the tab show theirs, and the page fits the parchment", [
    ...need(background === wanted && assets === GRADES[wanted], `${background} and ${assets}, not ${wanted}`),
    ...misjudged(),
    ...need(picture(style, `ui/backgrounds/${wanted}`), `${style.backgroundImage.split("/").pop()}, not ${wanted}`),
    ...wrongSizes().slice(0, 3),
    ...offParchment(style).map((name) => `${name} is off the parchment`),
    ...strayCursors().slice(0, 3).map((name) => `${name} has the wrong cursor`),
    ...need(picture(button, `ui/buttons/options_${grade()}`), `${button.backgroundImage.split("/").pop()} on Options`),
    ...need(button.backgroundPosition.split(" ").every((part) => parseFloat(part) === 0), "Options is not at rest"),
    ...need(button.boxShadow === "rgb(238, 157, 5) 0px 0px 0px 2px", "Options has no ring"),
    ...need(tabIcons().map((link) => link.getAttribute("href")).join() === data.icons.favicon, "the tab has no icon"),
    ...need(root.scrollHeight <= innerHeight && root.scrollWidth <= innerWidth, "the page scrolls"),
    ...need(spans(), "the footer does not span the page"),
  ]);
}

function wrongBoxes() {
  const boxes = [...document.querySelectorAll(".box")].filter((el) => {
    const look = getComputedStyle(el);
    const state = el.parentElement.dataset.state;
    return !picture(look, `ui/checkboxes/checkboxes_${grade()}`) || look.backgroundSize !== "300% 300%"
      || parseFloat(look.backgroundPositionX) !== 0 || parseFloat(look.backgroundPositionY) !== (rows[state] ?? 0)
      || drawn(el) !== (state === "mixed" ? "black dash" : "");
  });
  const radios = [...$("views").querySelectorAll("input")].filter((input) => {
    const look = getComputedStyle(input);
    return !picture(look, `ui/checkboxes/radiobutton_${grade()}`) || look.backgroundSize !== "200% 200%"
      || parseFloat(look.backgroundPositionX) !== 0
      || parseFloat(look.backgroundPositionY) !== (input.checked ? 100 : 0);
  });
  const states = ["has", "lacks", "mixed"].filter((state) => !document.querySelector(`[data-state=${state}] > .box`));
  return [...boxes.map(describe), ...radios.map((input) => input.value), ...states.map((state) => `no ${state} box`)];
}

const cellIn = (names, name, side) => {
  const order = names.map((one) => `${one}.png`).sort();
  const [at, columns] = [order.indexOf(`${name}.png`), Math.ceil(Math.sqrt(order.length))];
  const rows = Math.ceil(order.length / columns);
  return { at, column: at % columns, row: Math.floor(at / columns), columns, rows, side };
};

const share = (part, of) => (of > 1 ? (part * 100) / (of - 1) : 0);

function offCell(icon, cell, path, grids) {
  const look = getComputedStyle(icon);
  const [x, y] = [look.backgroundPositionX, look.backgroundPositionY].map(parseFloat);
  grids.set(look.backgroundImage, cell);
  return cell.at < 0 || !picture(look, path) || look.backgroundRepeat !== "no-repeat"
    || look.backgroundOrigin !== "content-box" || look.backgroundClip !== "content-box"
    || look.backgroundSize !== `${cell.columns * 100}% ${cell.rows * 100}%`
    || Math.abs(x - share(cell.column, cell.columns)) > 0.01 || Math.abs(y - share(cell.row, cell.rows)) > 0.01;
}

const misfit = async (grids) => (await Promise.all([...grids].map(async ([url, { columns, rows, side }]) => {
  const atlas = Object.assign(new Image(), { src: /url\("(.+)"\)/.exec(url)?.[1] ?? "" });
  await atlas.decode().catch(() => null);
  const [wide, high] = [atlas.naturalWidth, atlas.naturalHeight];
  return wide === columns * side && high === rows * side ? [] : [`${url.split("/").pop()} is ${wide} by ${high}`];
}))).flat();

async function unpictured() {
  setInclude(true);
  const [outlines, grids] = [await edges(), new Map()];
  const wrong = items.filter((item) => {
    const own = item.group ? data.icons.groups[item.key] : data.pictures[item.key];
    const icon = item.node.querySelector(".node-icon");
    if (!own) return !!icon;
    const [look, path] = [icon && getComputedStyle(icon), `icons/nodes/${own.kind}/atlas/${own.kind}icon_atlas`];
    return !icon || offCell(icon, cellIn(data.icons.atlas[own.kind], own.picture, 48), path, grids)
      || icon.previousElementSibling !== item.node.querySelector(".box") || icon.nextElementSibling !== item.label
      || look.width !== "44px" || look.height !== "44px" || Math.abs(parseFloat(look.borderTopWidth) - 2) >= 1
      || look.borderTopStyle !== "solid"
      || look.borderTopColor !== (item.group ? "rgba(0, 0, 0, 0)" : outlines.get(`${own.kind} ${own.reach}`));
  }).map((item) => item.key);
  const links = [...$("civs").querySelectorAll("a")];
  const [scale, side] = grade() === "4k" ? ["x2", 104] : ["x1", 60];
  const civs = links.filter((link) => {
    const icon = link.querySelector(".civ-icon");
    return !icon || icon !== link.firstElementChild || offCell(icon, cellIn(data.civs.map(civFile),
      civFile(link.hash.slice(1)), side), `icons/civs/atlas/civicon_atlas_${scale}`, grids);
  }).map((link) => link.textContent);
  const atlases = await misfit(grids);
  setInclude(false);
  return [...wrong, ...civs, ...need(links.length, "no civilisation"), ...atlases,
    ...need(outlines.size === 9, "colour_key.csv")];
}

function findLooks() {
  const lens = () => getComputedStyle($("find").parentElement, "::after");

  const field = getComputedStyle($("find"));
  const breadth = box($("find")).width;
  const empty = at(field.borderImageSource, "ui/buttons/textfield_9slice") && field.borderImageSlice === "15 fill"
    && field.borderImageWidth === "15px" && /^repeat( repeat)?$/.test(field.borderImageRepeat)
    && !rendered($("clearFind")) && lens().content !== "none" && picture(lens(), "ui/buttons/search")
    && Math.abs(breadth - Math.min(325, $("find").closest(".find").clientWidth - 96)) < 1;
  type(nameOf(items.find((item) => !item.group)));
  const typed = rendered($("clearFind")) && lens().content === "none" && box($("find")).width === breadth && beside()
    && document.querySelector(".node.found") && getComputedStyle($("found")).textAlign === "right"
    && picture(getComputedStyle($("clearFind")), "ui/buttons/clear_search");
  type("qqqqzzzzqqqq");
  const lost = box($("find")).width === breadth && beside();
  $("clearFind").click();
  const cleared = lost && $("find").value === "" && !document.querySelector(".node.found") && !rendered($("clearFind"))
    && document.activeElement === $("find") && getComputedStyle($("find")).outlineStyle === "none";
  return { empty, typed, cleared };
}

const hover = (el, x, y) => el.dispatchEvent(new PointerEvent("pointermove", {
  bubbles: true, pointerType: "mouse", clientX: x, clientY: y,
}));

function tipLooks() {
  const [cx, cy] = [box(items[0].node).left + 5, box(items[0].node).top + 5];
  hover(items[0].node, cx, cy);
  const tip = box($("tip"));
  const reach = grade() === "4k" ? 48 : 32;
  const tipped = !$("tip").hidden && $("tip").textContent === ui().nodeTip
    && getComputedStyle($("tip")).backgroundColor === "rgb(215, 179, 148)"
    && tip.left >= 3.5 && tip.right <= innerWidth - 3.5
    && (Math.abs(tip.left - cx - reach) < 1 || Math.abs(tip.right - innerWidth + 4) < 1)
    && (Math.abs(tip.top - cy - reach) < 1 || Math.abs(tip.bottom - cy + 8) < 1);
  hover($("count"), 0, 0);
  $("optionsButton").click();
  hover($("include"), box($("include")).left + 5, box($("include")).top + 5);
  const hinted = !$("tip").hidden && $("tip").textContent === ui().includeHint && $("options").contains($("tip"))
    && box($("includeHint")).width <= 1 && $("include").getAttribute("aria-describedby") === "includeHint";
  $("tooltips").click();
  $("optionsOk").click();
  hover(items[0].node, cx, cy);
  const silent = $("tip").hidden && $("tooltips").getAttribute("aria-checked") === "false"
    && (recall("tooltips") === "false" || attempt(() => localStorage) === null);
  $("optionsButton").click();
  keyDown($("tooltips"), " ");
  $("optionsOk").click();
  return { tipped, hinted, silent: silent && $("tip").hidden && $("tooltips").getAttribute("aria-checked") === "true" };
}

function toolLooks() {
  const head = $("clear").parentElement.parentElement;
  const left = box(head).left + parseFloat(getComputedStyle(head).paddingLeft);
  const right = box(head).right - parseFloat(getComputedStyle(head).paddingRight);

  const shown = () => [...$("clear").parentElement.children].filter(rendered);

  const spots = (top = true) => shown().map((el) => [box(el).left, top ? box(el).top : 0, box(el).width, box(el).height]
    .map(Math.round).join()).join(" ");

  const fits = (caption) => caption.scrollWidth <= caption.clientWidth;

  const wrong = () => shown().flatMap((el) => [
    ...need(!cut(el), `${language}: ${describe(el)} is not the whole button picture`),
    ...need(fits(el.firstElementChild), `${language}: ${describe(el)} cuts its text`),
  ]);

  const showing = (ids, when) => need(same(shown().map((el) => el.id), ids), `${shown().map(describe)} ${when}`);

  const [idle, sideways] = [spots(), spots(false)];
  const [first, last] = shown();
  const problems = [
    ...showing(["clear", "expandAll"], "with every branch closed"), ...wrong(),
    ...need(Math.abs(box(first).left - left) < 1 && Math.abs(box(last).right - right) < 1
      && Math.abs(box(first).top - box(last).top) < 0.5 && Math.abs(box(first).width - box(last).width) < 0.5,
    `the buttons are at ${idle}, not side by side from ${Math.round(left)} to ${Math.round(right)}`),
  ];
  tap(items.find((item) => !item.group && !item.kids.length).node);
  setOpen(items.find((item) => item.twisty && item.parent), true);
  problems.push(...showing(["clear", "expandAll"], "with a mark, or a branch open inside a closed one"));
  $("expandAll").focus();
  $("expandAll").click();
  problems.push(...showing(["clear", "collapseAll"], "with branches open"), ...wrong(),
    ...need(spots() === idle, `opening moved the buttons from ${idle} to ${spots()}`),
    ...need(document.activeElement === $("collapseAll"), "Expand all did not hand focus to Collapse all"));
  $("collapseAll").click();
  problems.push(...need(document.activeElement === $("expandAll"), "Collapse all did not hand focus to Expand all"));
  for (const code of [...codes().slice(1), codes()[0]]) {
    pick(code);
    problems.push(...need(spots(false) === sideways, `${code}: the buttons are at ${spots()}`), ...wrong());
    $("expandAll").click();
    problems.push(...wrong());
    $("collapseAll").click();
  }
  return problems;
}

async function confirming() {
  const [start, other] = [language, codes().find((code) => code !== language)];

  const draft = () => {
    if (!$("options").open) $("optionsButton").click();
    $("include").click();
    $("languageButton").click();
    options().find((option) => option.dataset.language === other).click();
    return checked("include") && $("languageName").textContent === data.languages[other].name;
  };

  const asBefore = () => !include && language === start && !checked("include")
    && $("languageName").textContent === data.languages[start].name;

  const reopen = () => {
    $("optionsButton").click();
    return asBefore();
  };

  $("optionsButton").click();
  const buttons = [...$("optionsOk").parentElement.children].filter(rendered);
  const [form, [cancel, ok]] = [box($("optionsOk").parentElement), buttons.map(box)];
  const problems = [
    ...need(same(buttons.map((el) => el.id), ["optionsCancel", "optionsOk"]), `${buttons.map(describe)} in the window`),
    ...need(Math.abs(ok.right - form.right) < 1 && cancel.right <= ok.left && Math.abs(cancel.top - ok.top) < 0.5
      && Math.abs(cancel.width - ok.width) < 0.5, "Cancel and OK are not side by side on the right"),
    ...await cornered(cancel, ok),
    ...buttons.filter(cut).map((el) => `${describe(el)} is not the whole button picture`),
    ...[...document.querySelectorAll("button")].filter(shaded).map((el) => `${describe(el)} has a text shadow`),
    ...need(draft() && !include && language === start, "changes took effect before OK"),
  ];
  $("optionsCancel").click();
  problems.push(...need(reopen(), "Cancel did not throw the changes away"));
  draft();
  $("options").close();
  problems.push(...need(reopen(), "closing the window without OK did not throw the changes away"));
  draft();
  $("optionsOk").click();
  problems.push(...need(include && language === other && !$("options").open, "OK did not apply the changes and close"));
  setInclude(false);
  pick(start);
  return problems;
}

function simpleSwitch() {
  tap(items.find((item) => !item.group && size(item.set) > 0).node);
  $("optionsButton").click();
  const before = { pictures: pictures(), spot: simpleSpot(), basics: picturesOn() };
  before.basics &&= civLinks() === $("civs").children.length;
  $("simple").click();
  const waiting = simpleTicked(true) && same(pictures(), before.pictures) && simpleSpot() === before.spot;
  $("optionsOk").click();
  const title = [...document.querySelector("h1").children].filter(rendered).map((el) => el.textContent);
  const problems = [
    ...need(before.basics, "no pictures or links before ticking"),
    ...need(waiting, "ticking changed the page before OK, or moved the box"),
    ...need(simpleTicked(true), "the box is not ticked"),
    ...pictures().slice(0, 3).map((name) => `${name} is left`),
    ...need(civLinks() === 0, "links are left"),
    ...need(recall("simple") === "true" || attempt(() => localStorage) === null, "the choice is not remembered"),
    ...need(same(title, [ui().title]), "the title is short"),
  ];
  $("optionsButton").click();
  const spot = simpleSpot();
  $("simple").click();
  problems.push(
    ...need(simpleTicked(false), "the box is not unticked"),
    ...need(!pictures().length && !civLinks(), "unticking changed the page before OK"),
    ...need(simpleSpot() === spot, `unticking moved the box from ${spot} to ${simpleSpot()}`),
  );
  $("optionsOk").click();
  $("optionsButton").click();
  problems.push(
    ...need(same(pictures(), before.pictures), "not every image came back"),
    ...need(civLinks() === $("civs").children.length, "the links did not come back"),
  );
  return problems;
}

export async function pictureTests() {
  reset();
  setSimple(false);
  pictureLooks();
  const { partial, other } = fixtures();
  tap(partial.node);
  keyDown(other.node, "x");
  const boxes = wrongBoxes();
  reset();
  const icons = await unpictured();
  check("options: without Simple UI, every checkbox and radio button shows its picture from its sheet, empty, ticked, "
    + "crossed or chosen, every item and top-level group its icon between its box and name, outlined as "
    + "colour_key.csv says, and every civilisation its icon, each icon its cell of its atlas, which holds its folder's "
    + "pictures by file name, row by row", !boxes.length && !icons.length, [...boxes, ...icons].join(", "));
  const looks = { ...findLooks(), ...tipLooks() };
  check("options: without Simple UI, the Find box shows a search icon or a cross that clears it, and a tooltip "
    + "follows the mouse over the tree, and over Include with its description, unless Tooltips is unticked",
    Object.values(looks).every(Boolean), Object.entries(looks).map(([name, ok]) => `${name} ${ok}`).join(", "));
  reset();
  await document.fonts.ready;
  expect("options: without Simple UI, the tree's buttons are Clear and Expand all, which is Collapse all while a top "
    + "branch is open, side by side as wide as the pane, each the whole button picture, the same in every language",
    toolLooks());
  reset();
  expect("options: without Simple UI, Options has Cancel and OK side by side below its panel, as far from the "
    + "parchment's right edge as from its bottom edge, each the whole button picture, and no button's text has a "
    + "shadow; changes wait for OK, and Cancel or closing the window throws them away", await confirming());
  reset();
  expect("options: Simple UI takes away every image and civilisation link on OK, and unticking it gives them back on "
    + "OK, neither changing the page before OK nor moving its box", simpleSwitch());
  reset();
  setSimple(true);
}

