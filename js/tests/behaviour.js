import { ALL, data, fill, size, words, numbers, nameOf, plural, plain } from "../datahandler.js";
import { items, roots, state, lineOf, lineEnd, chipName, isUnitOrTech } from "../model.js";
import { $ } from "../stringbuilder.js";
import { isOpen, setOpen, shown } from "../nodetree.js";
import { setInclude } from "../optionshandler.js";
import {
  root, check, expect, wait, same, keyDown, tap, type, reset, beside, listed, expected, below, drawn, marks, yellow,
  chainOf, fixtures, ownKeys, alternativesOf, byPath,
} from "./helpers.js";

const sameCivs = (item) => {
  const line = [item];
  while (line.at(-1).kids.length === 1 && !line.at(-1).kids[0].group) line.push(line.at(-1).kids[0]);
  return line.filter((each) => each.set === item.set);
};

const chipNames = () =>[...$("chips").querySelectorAll(".chip-name")].map((chip) => chip.textContent);

const fullName = (item) => fill(words.ui.full, { name: nameOf(item) });

function marking({ partial, other, third }) {
  reset();
  tap(partial.node);
  check("marking: a click marks an item must have, and lists and counts the civilisations that have it, in order",
    partial.self === "has" && partial.node.getAttribute("aria-checked") === "true"
    && same(listed(), expected(partial.set)) && $("count").textContent === plural("compatible", size(partial.set)));
  const label = fill(words.ui.clearHas, { name: chipName(partial, "has") });
  check("filters: a marked item gets a filter button", $("chips").children.length === 1
    && $("chips").querySelector(".chip-label").textContent === label);
  keyDown(other.node, "x");
  check("marking: X marks an item must lack, and the civilisations that have it leave the list", other.self === "lacks"
    && other.lacking.textContent === words.ui.lacking && same(listed(), expected(partial.set & ~other.set & ALL)));
  const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
  third.node.dispatchEvent(menu);
  check("marking: the menu key marks an item must lack", third.self === "lacks" && menu.defaultPrevented);
  keyDown(partial.node, " ");
  check("marking: Space on a marked item clears it", partial.self === null);
}

function branches({ branch, line, group, headed, lone, walled }) {
  reset();
  for (let p = branch.parent; p; p = p.parent) setOpen(p, true);
  const inBranch = items.filter((item) => below(item, branch));
  const branchHidden = inBranch.every((item) => !shown(item));
  tap(branch.node);
  check("marking: marking a building marks and shows everything in it", branchHidden && state(branch) === "has"
    && inBranch.every((item) => (item.group || item.self === "has") && shown(item)));
  check("filters: a whole branch has one filter button", same(chipNames(), [fullName(branch)]));
  tap(branch.kids[0].node);
  const legend = [...document.querySelectorAll(".legend [data-state]")];
  check("marking: a partly marked branch shows a white dash, must have a green tick and must lack a red cross",
    state(branch) === "mixed" && branch.node.getAttribute("aria-checked") === "mixed"
    && [branch.node, ...legend].every((el) => drawn(el.querySelector(".box")) === marks[el.dataset.state]),
    [branch.node, ...legend].map((el) => drawn(el.querySelector(".box"))).join(", "));
  $("clear").click();
  tap(line.node);
  const partLine = same(chipNames(), [nameOf(lineOf(line).findLast((item) => item.self === "has"))]);
  tap(lineEnd(line).node);
  check("filters: a line has one filter button, named after its deepest must-have item",
    partLine && same(chipNames(), [nameOf(lineEnd(line))]));
  keyDown(lineEnd(line).node, "x");
  $("chips").querySelector("[data-state=has]")?.click();
  check("filters: a line's filter button clears only its own kind of mark", lineOf(line)
    .every((item) => item.self === (item === lineEnd(line) ? "lacks" : null)));
  const named = [headed, lone].map((item) => {
    $("clear").click();
    tap(item.node);
    return chipNames();
  });
  $("clear").click();
  const walls = walled ? lineOf(walled) : [];
  if (walled) tap(walled.node);
  const alone = walled?.self === "has" && walled.kids[0].self === null;
  walls.forEach((item) => item.self === "has" || tap(item.node));
  check("filters: a fully marked building at the top of a single line, like a line in a group of lines, is named "
    + "after its deepest item, not Full, and a building with nothing under it plainly; in a group of lines a mark "
    + "passes down only at the same count", same(named.flat(), [nameOf(lineEnd(headed)), nameOf(lone)]) && alone
    && same(chipNames(), [nameOf(walls.at(-1))]),
    walled ? [...named.flat(), ...chipNames()].join(", ") : "no line in a group marked lines in data.json");
  $("clear").click();
  $("collapseAll").click();
  const inGroup = items.filter((item) => below(item, group));
  const groupHidden = inGroup.every((item) => !shown(item));
  tap(group.node);
  check("marking: marking a top-level group marks and shows everything in it, greying out nothing in it",
    groupHidden && state(group) === "has" && group.self === null && inGroup.every(shown)
    && inGroup.every((item) => !item.entry.classList.contains("barred")));
}

function crowding() {
  reset();
  const box = (el) => el.getBoundingClientRect();
  const panes = document.querySelector(".panes");
  const [tree, civs] = panes.querySelectorAll(".pane");
  const places = () => [tree, civs].map((pane) => JSON.stringify(box(pane))).join();
  const before = places();
  $("expandAll").click();
  const most = items.filter((item) => !item.group && !item.kids.length)
    .reduce((best, item) => (size(item.set) > size(best.set) ? item : best));
  tap(most.node);
  const list = $("civScroll");
  const fixed = getComputedStyle(panes).display === "grid";

  const scrolls = (el) => el.scrollHeight > el.clientHeight + 1;

  const top = box(civs).top;
  list.scrollTop = 1e6;
  const problems = [
    ...(listed().length === size(most.set) ? [] : [`${listed().length} civilisations listed`]),
    ...(root.scrollHeight <= innerHeight && root.scrollWidth <= innerWidth
      ? [] : [`the page is ${root.scrollWidth} by ${root.scrollHeight}`]),
    ...[tree, civs].filter((pane) => box(pane.querySelector(".pane-head")).bottom > box(pane).bottom + 0.5)
      .map((pane) => `${pane.querySelector("h2").id} sticks out`),
    ...(box(tree).bottom <= box(civs).top + 0.5 || box(tree).right <= box(civs).left + 0.5
      ? [] : ["the panes overlap"]),
    ...(!scrolls(list) || (list.scrollTop > 0 && box(civs).top === top)
      ? [] : ["the list does not scroll in its pane"]),
    ...(!fixed || Math.abs(box(tree).height - box(civs).height) <= 0.5
      ? [] : [`panes of ${box(tree).height} and ${box(civs).height} pixels`]),
    ...(!fixed || places() === before ? [] : ["a pane moved or changed its size"]),
  ];
  list.scrollTop = 0;
  reset();
  expect("layout: with everything open and the most civilisations listed, the page does not scroll, the panes keep "
    + "their headers and do not overlap, the list scrolls in its pane, and the panes are the same height and keep "
    + "their size and place", problems);
}

async function gestures({ third }) {
  reset();
  const node = third.node;
  const box = node.getBoundingClientRect();
  const at = { bubbles: true, clientX: box.left + 5, clientY: box.top + 5 };
  const touch = { ...at, pointerId: 7, pointerType: "touch", button: 0 };
  node.dispatchEvent(new PointerEvent("pointerdown", touch));
  await wait(600);
  node.dispatchEvent(new PointerEvent("pointerup", touch));
  node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  const pressed = third.self === "lacks";
  const mouse = { ...at, pointerId: 8, pointerType: "mouse", button: 2 };
  node.dispatchEvent(new PointerEvent("pointerdown", mouse));
  node.dispatchEvent(new PointerEvent("pointerup", mouse));
  node.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2 }));
  check("marking: a long press marks an item must lack, and a right-click on it clears it",
    pressed && third.self === null);
}

function lineTops({ line }) {
  reset();
  const chain = lineOf(line);
  const run = sameCivs(line);

  const only = (kind) => chain.every((item) => item.self === (run.includes(item) ? kind : null));

  tap(line.node);
  const marked = only("has") && line.node.getAttribute("aria-checked") === "true"
    && same(listed(), expected(run.reduce((s, item) => s & item.set, ALL)));
  tap(line.node);
  const cleared = chain.every((item) => item.self === null);
  keyDown(line.node, "x");
  const lacking = only("lacks") && same(listed(), expected(run.reduce((s, item) => s & ~item.set, ALL)));
  keyDown(line.node, "x");
  check("marking: marking the top of a line passes the mark down only to items with as many civilisations, must "
    + "have or must lack, and marking it again clears it", marked && cleared && lacking && run.length < chain.length
    && chain.every((item) => item.self === null), `${run.length}/${chain.length}, ${marked}, ${cleared}, ${lacking}`);
  tap(lineEnd(line).node);
  check("marking: marking the last item of a line marks every item before it too, with one filter named after the "
    + "last, and lists the civs that have the last", chain.every((item) => item.self === "has")
    && chipNames().join() === nameOf(lineEnd(line)) && same(listed(), expected(lineEnd(line).set)));
}

function parents({ branch, loose, without }) {
  reset();
  const inside = items.filter((item) => !item.group && below(item, branch));
  inside.filter((item) => !item.kids.length).forEach((leaf) => tap(leaf.node));
  check("marking: must have passes up to the items before it but not to a building: marking everything at the ends "
    + "of a building marks all in it but the building, which shows a dash", inside.every((item) => item.self === "has")
    && inside.some((item) => item.kids.length) && branch.self === null
    && branch.node.getAttribute("aria-checked") === "mixed");
  $("clear").click();
  keyDown(loose.node, "x");
  items.filter((item) => !item.group && below(item, loose)).forEach((item) => item.self === "has" || tap(item.node));
  check("marking: an item can be must lack while everything under it is must have", loose.self === "lacks"
    && listed().length > 0 && same(listed(), expected(without(loose))));
  $("clear").click();
}

function rivals({ rival }) {
  reset();
  const name = "marking: of two items where one excludes the other, must have on the one greys out the other and "
    + "everything in it but the one, which stays in sight, with the other's arrow still working, and must have on any "
    + "of those greys out the one; what is greyed out cannot be marked, and must lack greys out nothing";
  const other = rival?.rivals[0];
  if (!other) {
    check(name, false, "no item in data.json excludes another");
    return;
  }

  const side = (top, skip) => (top === skip ? [] : [top, ...top.kids.flatMap((kid) => side(kid, skip))]);

  const greys = () => items.filter((item) => item.node.ariaDisabled === "true");

  const blocks = (by) => {
    $("clear").click();
    tap(by.node);
    const greyed = same(greys(), [rival]);
    tap(rival.node);
    return greyed && rival.self === null;
  };

  const theirs = side(other, rival);
  for (let p = rival.parent; p; p = p.parent) setOpen(p, true);
  tap(rival.node);
  const first = shown(rival) && same(greys(), theirs) && theirs.slice(1).every((item) => !isOpen(item))
    && same(chipNames(), [chipName(rival, "has")]) && same(listed(), expected(rival.set));
  other.twisty.click();
  const free = !isOpen(other) && other.twisty.ariaDisabled !== "true"
    && getComputedStyle(other.twisty).pointerEvents !== "none";
  other.twisty.click();
  theirs.forEach((item) => tap(item.node));
  const kept = free && isOpen(other) && rival.self === "has" && theirs.every((item) => !item.self);
  const back = [other, theirs.findLast((item) => !item.group && item.parent !== other)].every(blocks);
  $("clear").click();
  keyDown(rival.node, "x");
  keyDown(other.node, "x");
  check(name, first && kept && back && !greys().length && rival.self === "lacks" && state(other) === "lacks",
    `${first}, ${kept}, ${back}, ${greys().length}, ${rival.self}, ${state(other)}`);
  reset();
}

function standIns(sample) {
  reset();
  const name = "marking: an item that replaces others also holds everything in the buildings among them but "
    + "their unique items and groups, as the same items: marking one there marks both, with one filter, opening "
    + "nothing in the other; must have on one greys out every alternative, what it replaces and the other variants "
    + "of those, and closes it, and it cannot be marked or opened until cleared (Req. 37)";
  const item = items.find((each) => each.replaces && each.alternatives.length);
  const other = item?.alternatives[0];
  if (!other) {
    check(name, false, "no item in data.json replaces another");
    return;
  }

  const greyed = (each) => each.node.getAttribute("aria-disabled") === "true"
    && Number(getComputedStyle(each.node).opacity) < 1;

  const inside = (top) => items.filter((each) => below(each, top)).map((each) => each.key);

  const shut = (each, by) => {
    setOpen(each, true);
    tap(by.node);
    const closed = !isOpen(each);
    tap(each.node);
    keyDown(each.node, "x");
    each.twisty?.click();
    return closed && by.self === "has" && greyed(each) && !greyed(by) && !isOpen(each) && each.self === null;
  };

  for (const each of [item, other]) for (let p = each.parent; p; p = p.parent) setOpen(p, true);
  setOpen(item, true);
  const copy = items.find((each) => each.original && below(each, item) && !each.kids.length);
  if (copy) tap(copy.node);
  const one = copy?.original.self === "has" && !isOpen(other) && same(chipNames(), [nameOf(copy)]);
  $("clear").click();
  const first = shut(other, item);
  tap(item.node);
  const freed = item.self === null && !greyed(other);
  const second = shut(item, other);
  tap(other.node);
  const last = !greyed(item);
  setInclude(true);
  const rows = (top) => inside(top).filter((key) => ["common", "regional"].includes(data.pictures[key]?.reach));
  const own = ownKeys();
  const lent = (alt) => (isUnitOrTech(alt) ? [] : rows(alt).filter((key) => !own.has(key)));
  const copies = (top) => items.filter((each) => each.copy && !each.group && below(each, top)).map((each) => each.key);
  const replacing = items.filter((each) => each.replaces);
  const held = replacing.some((each) => copies(each).length) && replacing.every((each) => same(copies(each),
    each.alternatives.filter((alt) => [each.replaces].flat().includes(alt.key)).flatMap(lent)));
  const greys = () => items.filter((each) => each.node.ariaDisabled === "true").map((each) => each.key).sort();
  const exclusive = items.filter((each) => alternativesOf(each.key).length).every((each) => {
    $("clear").click();
    tap(each.node);
    const marked = items.filter((one) => one.self === "has").map((one) => one.key);
    const barred = [...new Set(marked.flatMap(alternativesOf))].filter((key) => !marked.includes(key)).sort();
    return same(greys().filter((key) => alternativesOf(key).length), barred);
  });
  setInclude(false);
  Object.assign(sample, fixtures());
  check(name, held && exclusive && one && first && freed && second && last,
    `${held}, ${exclusive}, ${one}, ${first}, ${freed}, ${second}`);
  reset();
}

function beyond() {
  setInclude(true);
  const item = items.find((each) => each.parent && isUnitOrTech(each.parent) && size(each.set & ~each.parent.set));
  const above = item?.parent;
  if (!item) return setInclude(false) ?? [true, true];
  for (let p = above; p; p = p.parent) setOpen(p, true);
  tap(above.node);
  const alone = items.filter((each) => each.self).length === 1;
  $("clear").click();
  tap(item.node);
  keyDown(above.node, "x");
  const kept = alone && item.self === "has" && above.self === "lacks"
    && same(listed(), expected(item.set & ~above.set & ALL));
  setInclude(false);
  const lifted = byPath(above.path) || byPath(item.path)?.parent === byPath(above.parent.path);
  return [kept, lifted && byPath(item.path)?.self === "has"];
}

function lines(sample) {
  const { line, even, uneven } = sample;
  reset();
  for (let p = line.parent; p; p = p.parent) setOpen(p, true);
  const closed = !isOpen(line);
  tap(line.node);
  check("marking: marking a unit or technology opens it to its first fork or its end, showing all marked with it",
    closed && lineOf(line).every((item) => shown(item) && (!item.twisty || isOpen(item))));
  $("clear").click();
  const [run, lacking] = [sameCivs(even), sameCivs(uneven)];
  const before = lineOf(even).slice(0, lineOf(even).indexOf(even)).filter(isUnitOrTech);
  tap(even.node);
  const passed = run.length > 1 && before.length > 0 && [...before, ...run].every((item) => item.self === "has")
    && items.filter((item) => item.self && !item.original).length === before.length + run.length;
  $("clear").click();
  keyDown(uneven.node, "x");
  const lacked = lacking.every((item) => item.self === "lacks")
    && items.filter((item) => item.self && !item.original).length === lacking.length
    && same(listed(), expected(lacking.reduce((s, item) => s & ~item.set, ALL)));
  $("clear").click();
  const [kept, lifted] = beyond();
  Object.assign(sample, fixtures());
  check("marking: below the top of a line, a mark passes down only to items with the same civilisations, and only "
    + "must have passes up, to every item before it that all civilisations with it have, and must lack there keeps "
    + "it; a unique item left out leaves the rows under it in its place", passed && lacked && kept && lifted,
    `${run.length} passed: ${passed}, ${lacked}, ${kept}, ${lifted}`);
  $("clear").click();
}

function counts({ partial, other, upgraded }) {
  reset();

  const fits = () => items.filter((item) => item.self)
    .reduce((m, item) => m & (item.self === "has" ? item.set : ~item.set), ALL);

  const range = (own, all) => fill(words.ui.range, { own: numbers.format(own), all: numbers.format(all) });

  const counted = (item) => {
    const own = size(fits() & (item.group ? item.all : item.set));
    const all = size(fits() & item.all);
    if (!item.parent && !own) return ["", ""];
    return !item.group && item.kids.length && !isOpen(item)
      ? [range(own, all), fill(words.ui.civRange, { own: plural("civCount", own), all: plural("civCount", all) })]
      : [numbers.format(own), plural("civCount", own)];
  };

  const miscounted = () => items.filter((item) => {
    const [shownText, said] = counted(item);
    return item.count.textContent !== shownText || item.civCount.textContent !== said;
  }).map(nameOf);

  expect("counts: a closed item shows its own number, then the number with everything under it", miscounted());
  check("counts: a closed line shows the civilisations with its first item, then with its last upgrade",
    upgraded.count.textContent === range(size(upgraded.set), size(lineEnd(upgraded).set)));
  $("expandAll").click();
  expect("counts: open items show only their own number", miscounted());
  tap(partial.node);
  keyDown(other.node, "x");
  const open = miscounted();
  $("collapseAll").click();
  expect("counts: with filters, open and closed items count only the civilisations that fit",
    [...open, ...miscounted()]);
  $("clear").click();
}

function tree() {
  reset();
  $("expandAll").click();
  const expanded = items.every((item) => !item.twisty || isOpen(item));
  $("collapseAll").click();
  const collapsed = items.every((item) => !isOpen(item));
  roots[0].twisty.click();
  const opened = isOpen(roots[0]) && !roots[0].list.hidden;
  roots[0].twisty.click();
  check("tree: Expand all, Collapse all and each branch's arrow open and close branches",
    expanded && collapsed && opened && !isOpen(roots[0]) && roots[0].list.hidden);
  expect("tree: opening a branch also opens each only child below it, down to the first fork or the end", items
    .filter((item) => item.twisty).filter((item) => {
      $("collapseAll").click();
      item.twisty.click();
      return items.some((each) => isOpen(each) !== chainOf(item).includes(each));
    }).map(nameOf));
  $("collapseAll").click();
}

function finding({ partial }) {
  reset();
  type(nameOf(partial));
  const matches = items.filter((item) => plain(nameOf(item)).includes(plain(nameOf(partial))));
  check("find: matches are highlighted in yellow and their number announced beside the box, with branches open down "
    + "to each", partial.node.classList.contains("found") && matches.every((item) => shown(item))
    && items.every((item) => item.node.classList.contains("found") === matches.includes(item))
    && matches.every((item) => yellow(getComputedStyle(item.node).backgroundColor))
    && $("found").textContent === plural("found", matches.length) && beside());
  type("qqqqzzzzqqqq");
  const none = $("found").textContent === words.ui.noneFound && !document.querySelector(".found") && beside();
  type("");
  check("find: no match says none found beside the box, and an empty search clears the result",
    none && $("found").textContent === "");
  reset();
}

export async function behaviourTests(sample) {
  marking(sample);
  branches(sample);
  crowding();
  await gestures(sample);
  lineTops(sample);
  parents(sample);
  rivals(sample);
  standIns(sample);
  lines(sample);
  counts(sample);
  tree();
  finding(sample);
}
