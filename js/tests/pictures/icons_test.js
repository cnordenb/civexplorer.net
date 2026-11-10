import { data, load } from "../../model/data/datahandler.js";
import { civFile } from "../../model/icons.js";
import { items } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { chooseInclude } from "../../controller/optionshandler.js";
import {
  expect, describe, need, drawn, reset, fixtures, nodeOf, labelOf, mustHave, mustLack,
} from "../helpers_test.js";
import { picture, graded, scale } from "./picturetools_test.js";

const BOX_OFFSET = { has: 50, lacks: 100 };
const STATES = ["has", "lacks", "mixed"];
const ICON_CELL_PX = 48;
const CIV_CELL_PX = { x1: 60, x2: 104 };
const ICON_PX = 44;
const OUTLINE_PX = 2;
const OUTLINES = 9;
const NO_OUTLINE = "rgba(0, 0, 0, 0)";
const KINDS = { unit: "unit", building: "building", technology: "tech" };
const HEX = 16;
const HEX_PAIRS = [0, 2, 4];
const PERCENT = 100;
const NEAR = 0.01;

export async function iconTests() {
  boxTests();
  reset();
  chooseInclude(true);
  const outlines = await edges();
  if (outlines.size !== OUTLINES) throw new Error(`colour_key.csv gives ${outlines.size} outlines, not ${OUTLINES}`);
  const rows = items.map((item) => ({ item, own: ownPicture(item), icon: nodeOf(item).querySelector(".node-icon") }));
  expect("pictures: a row has an icon exactly when its item or group has a picture", rows
    .filter(({ own, icon }) => !own !== !icon).map(({ item, icon }) => `${item.key} has ${icon ? "an" : "no"} icon`));
  const icons = rows.filter(({ own, icon }) => own && icon).map(treeIcon);
  treeIconTests(icons, outlines);
  const civs = civIcons();
  civIconTests(civs);
  expect("pictures: every icon atlas is as large as its grid of cells", await misfit(atlases([...icons, ...civs])));
  chooseInclude(false);
}

function boxTests() {
  const { partial, other } = fixtures();
  mustHave(partial);
  mustLack(other);
  const missing = STATES.filter((state) => !document.querySelector(`[data-state=${state}] > .box`));
  if (missing.length) throw new Error(`the tree shows no ${missing.join(", ")} box to test`);
  expect("pictures: every checkbox shows its state's picture from the checkbox sheet",
    [...document.querySelectorAll(".box")].filter(offSprite).map(describe));
  expect("pictures: the Civ view's radio buttons show their pictures from their sheet",
    [...$("views").querySelectorAll("input")].filter(offRadio).map((input) => input.value));
}

function offSprite(el) {
  const look = getComputedStyle(el);
  const state = el.parentElement.dataset.state ?? (el.parentElement.matches("[aria-checked=true]") ? "has" : "");
  return !graded(look.backgroundImage, "ui/checkboxes/checkboxes") || look.backgroundSize !== "300% 300%"
    || parseFloat(look.backgroundPositionX) !== 0 || parseFloat(look.backgroundPositionY) !== (BOX_OFFSET[state] ?? 0)
    || drawn(el) !== (state === "mixed" ? "black dash" : "");
}

function offRadio(input) {
  const look = getComputedStyle(input);
  return !graded(look.backgroundImage, "ui/checkboxes/radiobutton") || look.backgroundSize !== "200% 200%"
    || parseFloat(look.backgroundPositionX) !== 0
    || parseFloat(look.backgroundPositionY) !== (input.checked ? PERCENT : 0);
}

async function edges() {
  const csv = await load(`${data.icons.nodes}colour_key.csv`);
  const [head, ...rows] = csv.trim().split(/\r?\n/).map((line) => line.trim().split(","));
  return new Map(rows.flatMap(([reach, ...colours]) => colours
    .map((code, i) => [`${KINDS[head[i + 1]]} ${reach}`, hex(code)])));
}

const hex = (code) => `rgb(${HEX_PAIRS.map((at) => parseInt(code.slice(at, at + 2), HEX)).join(", ")})`;

const ownPicture = (item) => (item.group ? data.icons.groups[item.key] : data.pictures[item.key]);

const treeIcon = ({ item, own, icon }) => ({
  item, own, icon, name: item.key, cell: cellIn(data.icons.atlas[own.kind], own.picture, ICON_CELL_PX),
  shows: (look) => picture(look, `icons/nodes/${own.kind}/atlas/${own.kind}icon_atlas`),
});

function treeIconTests(icons, outlines) {
  const look = ({ icon }) => getComputedStyle(icon);

  const outline = ({ item, own }) => (item.group ? NO_OUTLINE : outlines.get(`${own.kind} ${own.reach}`));

  expect("pictures: every tree icon shows its own cell of its atlas", icons.filter(offCell).map(({ name }) => name));
  expect("pictures: every tree icon sits between its checkbox and its name", icons.filter(({ item, icon }) => icon
    .previousElementSibling !== nodeOf(item).querySelector(".box") || icon.nextElementSibling !== labelOf(item))
    .map(({ name }) => name));
  expect(`pictures: every tree icon is ${ICON_PX} pixels square`, icons.filter((each) => !square(look(each)))
    .map((each) => `${each.name}: ${look(each).width} by ${look(each).height}`));
  expect("pictures: every tree icon has the outline colour_key.csv gives it", icons
    .filter((each) => !outlined(look(each), outline(each)))
    .map((each) => `${each.name}: ${look(each).borderTopStyle} ${look(each).borderTopColor}`));
}

const square = (look) => look.width === `${ICON_PX}px` && look.height === look.width;

const outlined = (look, colour) => Math.abs(parseFloat(look.borderTopWidth) - OUTLINE_PX) < 1
  && look.borderTopStyle === "solid" && look.borderTopColor === colour;

function civIcons() {
  const links = [...$("civs").querySelectorAll("a")];
  if (!links.length) throw new Error("no civilisation is listed to test its icon");
  const names = data.civs.map(civFile);
  return links.map((link) => ({
    link, name: link.textContent, icon: link.querySelector(".civ-icon"),
    cell: cellIn(names, civFile(link.hash.slice(1)), CIV_CELL_PX[scale()]),
    shows: (look) => graded(look.backgroundImage, "icons/civs/atlas/civicon_atlas"),
  }));
}

function civIconTests(civs) {
  expect("pictures: every civilisation link begins with its icon", civs
    .filter(({ link, icon }) => !icon || icon !== link.firstElementChild).map(({ name }) => name));
  expect("pictures: every civilisation's icon shows its own cell of the atlas", civs
    .filter(({ icon }) => icon).filter(offCell).map(({ name }) => name));
}

function cellIn(names, name, side) {
  const order = names.map((one) => `${one}.png`).sort();
  const [index, columns] = [order.indexOf(`${name}.png`), Math.ceil(Math.sqrt(order.length))];
  const rows = Math.ceil(order.length / columns);
  return { index, column: index % columns, row: Math.floor(index / columns), columns, rows, side };
}

function offCell({ icon, cell, shows }) {
  const look = getComputedStyle(icon);
  const [x, y] = [look.backgroundPositionX, look.backgroundPositionY].map(parseFloat);
  return cell.index < 0 || !shows(look) || look.backgroundRepeat !== "no-repeat"
    || look.backgroundOrigin !== "content-box" || look.backgroundClip !== "content-box"
    || look.backgroundSize !== `${cell.columns * PERCENT}% ${cell.rows * PERCENT}%`
    || Math.abs(x - share(cell.column, cell.columns)) > NEAR || Math.abs(y - share(cell.row, cell.rows)) > NEAR;
}

const share = (part, of) => (of > 1 ? (part * PERCENT) / (of - 1) : 0);

const atlases = (icons) => new Map(icons.filter(({ icon }) => icon)
  .map(({ icon, cell }) => [getComputedStyle(icon).backgroundImage, cell]).filter(([url]) => /url\(/.test(url)));

async function misfit(grids) {
  const sizes = await Promise.all([...grids].map(async ([url, { columns, rows, side }]) => {
    const atlas = Object.assign(new Image(), { src: /url\("(.+)"\)/.exec(url)?.[1] ?? "" });
    await atlas.decode().catch(() => null);
    const [wide, high] = [atlas.naturalWidth, atlas.naturalHeight];
    return need(wide === columns * side && high === rows * side, `${url.split("/").pop()} is ${wide} by ${high}`);
  }));
  return sizes.flat();
}
