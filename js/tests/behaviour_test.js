import { data } from "../model/datahandler.js";
import { ALL, size } from "../model/civsets.js";
import { fill, words, numbers, nameOf, plural, plain } from "../model/texts.js";
import { items, roots, state, lineOf, lineEnd, isUnitOrTech, mark } from "../model/model.js";
import { $, chipName } from "../view/stringbuilder.js";
import { isOpen, setOpen, shown, rowOf, LONG_PRESS_MS } from "../view/treeview.js";
import { chooseInclude } from "../controller/optionshandler.js";
import {
  root, check, expect, wait, same, keyDown, tap, type, reset, beside, listed, expected, below, drawn, marks, yellow,
  chainOf, fixtures, ownKeys, alternativesOf, byPath, nodeOf, twistyOf, dropsGreyed, openTo, flags, checkAll,
} from "./helpers_test.js";

const sameCivs = (item) => {
  const line = [item];
  while (line.at(-1).kids.length === 1 && !line.at(-1).kids[0].group) line.push(line.at(-1).kids[0]);
  return line.filter((each) => each.set === item.set);
};

const chipNames = () =>[...$("chips").querySelectorAll(".chip-name")].map((chip) => chip.textContent);

const fullName = (item) => fill(words.ui.full, { name: nameOf(item) });

function marking() {
  reset();
  const { partial, other, third } = fixtures();
  tap(nodeOf(partial));
  checkAll("marking: a click marks an item must have, and lists and counts the civilisations that have it, in order",
    { marked: partial.self === "has" && nodeOf(partial).getAttribute("aria-checked") === "true",
      listed: same(listed(), expected(partial.set)),
      counted: $("count").textContent === plural("compatible", size(partial.set)) });
  const label = fill(words.ui.clearHas, { name: chipName({ item: partial, mark: "has" }) });
  check("filters: a marked item gets a filter button", $("chips").children.length === 1
    && $("chips").querySelector(".chip-label").textContent === label);
  keyDown(nodeOf(other), "x");
  checkAll("marking: X marks an item must lack, and the civilisations that have it leave the list",
    { marked: other.self === "lacks", labelled: rowOf(other).lacking.textContent === words.ui.lacking,
      listed: same(listed(), expected(partial.set & ~other.set & ALL)) });
  const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
  nodeOf(third).dispatchEvent(menu);
  check("marking: the menu key marks an item must lack", third.self === "lacks" && menu.defaultPrevented);
  keyDown(nodeOf(partial), " ");
  check("marking: Space on a marked item clears it", partial.self === null);
}

function branches() {
  reset();
  const { branch, line, group, headed, lone, walled } = fixtures();
  openTo(branch);
  const inBranch = items.filter((item) => below(item, branch));
  const branchHidden = inBranch.every((item) => !shown(item));
  tap(nodeOf(branch));
  check("marking: marking a building marks and shows everything in it", branchHidden && state(branch) === "has"
    && inBranch.every((item) => (item.group || item.self === "has") && shown(item)));
  check("filters: a whole branch has one filter button", same(chipNames(), [fullName(branch)]));
  tap(nodeOf(branch.kids[0]));
  const legend = [...document.querySelectorAll(".legend [data-state]")];
  check("marking: a partly marked branch shows a white dash, must have a green tick and must lack a red cross",
    state(branch) === "mixed" && nodeOf(branch).getAttribute("aria-checked") === "mixed"
    && [nodeOf(branch), ...legend].every((el) => drawn(el.querySelector(".box")) === marks[el.dataset.state]),
    [nodeOf(branch), ...legend].map((el) => drawn(el.querySelector(".box"))).join(", "));
  $("clear").click();
  tap(nodeOf(line));
  const partLine = same(chipNames(), [nameOf(lineOf(line).findLast((item) => item.self === "has"))]);
  tap(nodeOf(lineEnd(line)));
  check("filters: a line has one filter button, named after its deepest must-have item",
    partLine && same(chipNames(), [nameOf(lineEnd(line))]));
  keyDown(nodeOf(lineEnd(line)), "x");
  $("chips").querySelector("[data-state=has]")?.click();
  check("filters: a line's filter button clears only its own kind of mark", lineOf(line)
    .every((item) => item.self === (item === lineEnd(line) ? "lacks" : null)));
  const named = [headed, lone].map((item) => {
    $("clear").click();
    tap(nodeOf(item));
    return chipNames();
  });
  $("clear").click();
  const walls = walled ? lineOf(walled) : [];
  if (walled) tap(nodeOf(walled));
  const alone = walled?.self === "has" && walled.kids[0].self === null;
  walls.forEach((item) => item.self === "has" || tap(nodeOf(item)));
  check("filters: a fully marked building at the top of a single line, like a line in a group of lines, is named "
    + "after its deepest item, not Full, and a building with nothing under it plainly; in a group of lines a mark "
    + "passes down only at the same count", same(named.flat(), [nameOf(lineEnd(headed)), nameOf(lone)]) && alone
    && same(chipNames(), [nameOf(walls.at(-1))]),
    walled ? [...named.flat(), ...chipNames()].join(", ") : "no line in a group marked lines in data.json");
  $("clear").click();
  $("collapseAll").click();
  const inGroup = items.filter((item) => below(item, group));
  const groupHidden = inGroup.every((item) => !shown(item));
  tap(nodeOf(group));
  checkAll("marking: marking a top-level group marks and shows everything in it, greying out nothing in it",
    { hidden: groupHidden, marked: state(group) === "has" && group.self === null, shown: inGroup.every(shown),
      ungreyed: inGroup.every((item) => !rowOf(item).entry.classList.contains("barred")) });
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
  tap(nodeOf(most));
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

async function gestures() {
  reset();
  const { third } = fixtures();
  const node = nodeOf(third);
  const box = node.getBoundingClientRect();
  const at = { bubbles: true, clientX: box.left + 5, clientY: box.top + 5 };
  const touch = { ...at, pointerId: 7, pointerType: "touch", button: 0 };
  node.dispatchEvent(new PointerEvent("pointerdown", touch));
  await wait(LONG_PRESS_MS + 100);
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

function lineTops() {
  reset();
  const { line } = fixtures();
  const chain = lineOf(line);
  const run = sameCivs(line);

  const only = (kind) => chain.every((item) => item.self === (run.includes(item) ? kind : null));

  tap(nodeOf(line));
  const marked = only("has") && nodeOf(line).getAttribute("aria-checked") === "true"
    && same(listed(), expected(run.reduce((s, item) => s & item.set, ALL)));
  tap(nodeOf(line));
  const cleared = chain.every((item) => item.self === null);
  keyDown(nodeOf(line), "x");
  const lacking = only("lacks") && same(listed(), expected(run.reduce((s, item) => s & ~item.set, ALL)));
  keyDown(nodeOf(line), "x");
  check("marking: marking the top of a line passes the mark down only to items with as many civilisations, must "
    + "have or must lack, and marking it again clears it", marked && cleared && lacking && run.length < chain.length
    && chain.every((item) => item.self === null),
    `${run.length}/${chain.length}, ${flags({ marked, cleared, lacking })}`);
  tap(nodeOf(lineEnd(line)));
  checkAll("marking: marking the last item of a line marks every item before it too, with one filter named after "
    + "the last, and lists the civs that have the last", { marked: chain.every((item) => item.self === "has"),
      filter: chipNames().join() === nameOf(lineEnd(line)), listed: same(listed(), expected(lineEnd(line).set)) });
}

function parents() {
  reset();
  const { branch, loose, without } = fixtures();
  const inside = items.filter((item) => !item.group && below(item, branch));
  inside.filter((item) => !item.kids.length).forEach((leaf) => tap(nodeOf(leaf)));
  checkAll("marking: must have passes up to the items before it but not to a building: marking everything at the "
    + "ends of a building marks all in it but the building, which shows a dash",
    { marked: inside.every((item) => item.self === "has") && inside.some((item) => item.kids.length),
      building: branch.self === null, dash: nodeOf(branch).getAttribute("aria-checked") === "mixed" });
  $("clear").click();
  keyDown(nodeOf(loose), "x");
  items.filter((item) => !item.group && below(item, loose)).forEach((item) => item.self === "has" || tap(nodeOf(item)));
  checkAll("marking: an item can be must lack while everything under it is must have",
    { lacks: loose.self === "lacks", listed: listed().length > 0 && same(listed(), expected(without(loose))) });
  $("clear").click();
}

function rivals() {
  reset();
  const { rival } = fixtures();
  const name = "marking: of two items where one excludes the other, must have on the one greys out the other and "
    + "everything in it but the one, which stays in sight, with the other's arrow still working, and must have on any "
    + "of those greys out the one; what is greyed out cannot be marked, and must lack greys out nothing";
  const other = rival?.rivals[0];
  if (!other) {
    check(name, false, "no item in data.json excludes another");
    return;
  }

  const side = (top, skip) => (top === skip ? [] : [top, ...top.kids.flatMap((kid) => side(kid, skip))]);

  const greys = () => items.filter((item) => nodeOf(item).ariaDisabled === "true");

  const blocks = (by) => {
    $("clear").click();
    tap(nodeOf(by));
    const greyed = same(greys(), [rival]);
    tap(nodeOf(rival));
    mark(rival, "has");
    mark(rival, "lacks");
    return greyed && rival.self === null;
  };

  const theirs = side(other, rival);
  openTo(rival);
  tap(nodeOf(rival));
  const first = shown(rival) && same(greys(), theirs) && theirs.slice(1).every((item) => !isOpen(item))
    && same(chipNames(), [chipName({ item: rival, mark: "has" })]) && same(listed(), expected(rival.set));
  twistyOf(other).click();
  const free = !isOpen(other) && twistyOf(other).ariaDisabled !== "true"
    && getComputedStyle(twistyOf(other)).pointerEvents !== "none";
  twistyOf(other).click();
  theirs.forEach((item) => tap(nodeOf(item)));
  const kept = free && isOpen(other) && rival.self === "has" && theirs.every((item) => !item.self);
  const back = [other, theirs.findLast((item) => !item.group && item.parent !== other)].every(blocks);
  $("clear").click();
  keyDown(nodeOf(rival), "x");
  keyDown(nodeOf(other), "x");
  check(name, first && kept && back && !greys().length && rival.self === "lacks" && state(other) === "lacks",
    `${flags({ first, kept, back })}, ${greys().length}, ${rival.self}, ${state(other)}`);
  reset();
}

function standIns() {
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

  const greyed = (each) => nodeOf(each).getAttribute("aria-disabled") === "true"
    && Number(getComputedStyle(nodeOf(each)).opacity) < 1;

  const inside = (top) => items.filter((each) => below(each, top)).map((each) => each.key);

  const shut = (each, by) => {
    setOpen(each, true);
    tap(nodeOf(by));
    const closed = !isOpen(each);
    tap(nodeOf(each));
    keyDown(nodeOf(each), "x");
    twistyOf(each)?.click();
    return closed && by.self === "has" && greyed(each) && !greyed(by) && !isOpen(each) && each.self === null;
  };

  [item, other].forEach(openTo);
  setOpen(item, true);
  const copy = items.find((each) => each.original && below(each, item) && !each.kids.length);
  if (copy) tap(nodeOf(copy));
  const one = copy?.original.self === "has" && !isOpen(other) && same(chipNames(), [nameOf(copy)]);
  $("clear").click();
  const first = shut(other, item);
  tap(nodeOf(item));
  const freed = item.self === null && !greyed(other);
  const second = shut(item, other);
  tap(nodeOf(other));
  const last = !greyed(item);
  chooseInclude(true);
  const rows = (top) => inside(top).filter((key) => ["common", "regional"].includes(data.pictures[key]?.reach));
  const own = ownKeys();
  const lent = (alt) => (isUnitOrTech(alt) ? [] : rows(alt).filter((key) => !own.has(key)));
  const copies = (top) => items.filter((each) => each.copy && !each.group && below(each, top)).map((each) => each.key);
  const replacing = items.filter((each) => each.replaces);
  const held = replacing.some((each) => copies(each).length) && replacing.every((each) => same(copies(each),
    each.alternatives.filter((alt) => [each.replaces].flat().includes(alt.key)).flatMap(lent)));
  const greys = () => items.filter((each) => nodeOf(each).ariaDisabled === "true").map((each) => each.key).sort();
  const exclusive = items.filter((each) => alternativesOf(each.key).length).every((each) => {
    $("clear").click();
    tap(nodeOf(each));
    const marked = items.filter((one) => one.self === "has").map((one) => one.key);
    const barred = [...new Set(marked.flatMap(alternativesOf))].filter((key) => !marked.includes(key)).sort();
    return same(greys().filter((key) => alternativesOf(key).length), barred);
  });
  chooseInclude(false);
  check(name, held && exclusive && one && first && freed && second && last,
    flags({ held, exclusive, one, first, freed, second, last }));
  reset();
}

function beyond() {
  chooseInclude(true);
  const item = items.find((each) => each.parent && isUnitOrTech(each.parent) && size(each.set & ~each.parent.set));
  const above = item?.parent;
  if (!item) return chooseInclude(false) ?? [true, true];
  openTo(item);
  tap(nodeOf(above));
  const alone = items.filter((each) => each.self).length === 1;
  $("clear").click();
  tap(nodeOf(item));
  keyDown(nodeOf(above), "x");
  const kept = alone && item.self === "has" && above.self === "lacks"
    && same(listed(), expected(item.set & ~above.set & ALL));
  chooseInclude(false);
  const lifted = byPath(above.path) || byPath(item.path)?.parent === byPath(above.parent.path);
  return [kept, lifted && byPath(item.path)?.self === "has"];
}

function lines() {
  reset();
  const { line, even, uneven } = fixtures();
  openTo(line);
  const closed = !isOpen(line);
  tap(nodeOf(line));
  check("marking: marking a unit or technology opens it to its first fork or its end, showing all marked with it",
    closed && lineOf(line).every((item) => shown(item) && (!twistyOf(item) || isOpen(item))));
  $("clear").click();
  const [run, lacking] = [sameCivs(even), sameCivs(uneven)];
  const before = lineOf(even).slice(0, lineOf(even).indexOf(even)).filter(isUnitOrTech);
  tap(nodeOf(even));
  const passed = run.length > 1 && before.length > 0 && [...before, ...run].every((item) => item.self === "has")
    && items.filter((item) => item.self && !item.original).length === before.length + run.length;
  $("clear").click();
  keyDown(nodeOf(uneven), "x");
  const lacked = lacking.every((item) => item.self === "lacks")
    && items.filter((item) => item.self && !item.original).length === lacking.length
    && same(listed(), expected(lacking.reduce((s, item) => s & ~item.set, ALL)));
  $("clear").click();
  const [kept, lifted] = beyond();
  check("marking: below the top of a line, a mark passes down only to items with the same civilisations, and only "
    + "must have passes up, to every item before it that all civilisations with it have, and must lack there keeps "
    + "it; a unique item left out leaves the rows under it in its place", passed && lacked && kept && lifted,
    `${run.length} passed, ${flags({ passed, lacked, kept, lifted })}`);
  $("clear").click();
}

function counts() {
  reset();
  const { partial, other, upgraded } = fixtures();

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
    return rowOf(item).count.textContent !== shownText || rowOf(item).civCount.textContent !== said;
  }).map(nameOf);

  expect("counts: a closed item shows its own number, then the number with everything under it", miscounted());
  check("counts: a closed line shows the civilisations with its first item, then with its last upgrade",
    rowOf(upgraded).count.textContent === range(size(upgraded.set), size(lineEnd(upgraded).set)));
  $("expandAll").click();
  expect("counts: open items show only their own number", miscounted());
  tap(nodeOf(partial));
  keyDown(nodeOf(other), "x");
  const open = miscounted();
  $("collapseAll").click();
  expect("counts: with filters, open and closed items count only the civilisations that fit",
    [...open, ...miscounted()]);
  $("clear").click();
}

function tree() {
  reset();
  $("expandAll").click();
  const expanded = items.every((item) => !twistyOf(item) || isOpen(item));
  $("collapseAll").click();
  const collapsed = items.every((item) => !isOpen(item));
  twistyOf(roots[0]).click();
  const opened = isOpen(roots[0]) && !rowOf(roots[0]).list.hidden;
  twistyOf(roots[0]).click();
  checkAll("tree: Expand all, Collapse all and each branch's arrow open and close branches",
    { expanded, collapsed, opened, closed: !isOpen(roots[0]) && rowOf(roots[0]).list.hidden });
  expect("tree: opening a branch also opens each only child below it, down to the first fork or the end", items
    .filter((item) => twistyOf(item)).filter((item) => {
      $("collapseAll").click();
      twistyOf(item).click();
      return items.some((each) => isOpen(each) !== chainOf(item).includes(each));
    }).map(nameOf));
  $("collapseAll").click();
}

function finding() {
  reset();
  const { partial, rival } = fixtures();
  type(nameOf(partial));
  const matches = items.filter((item) => plain(nameOf(item)).includes(plain(nameOf(partial))));
  const lit = nodeOf(partial).classList.contains("found") && matches.every((item) => shown(item))
    && items.every((item) => nodeOf(item).classList.contains("found") === matches.includes(item))
    && matches.every((item) => yellow(getComputedStyle(nodeOf(item)).backgroundColor))
    && $("found").textContent === plural("found", matches.length) && beside();
  const { dropped, detail } = dropsGreyed(rival);
  check("find: matches are highlighted in yellow and their number announced beside the box, with branches open down "
    + "to each, and a match drops out once a mark greys out its branch", lit && dropped,
    `${flags({ lit })}, ${detail}`);
  type("qqqqzzzzqqqq");
  const none = $("found").textContent === words.ui.noneFound && !document.querySelector(".found") && beside();
  type("");
  check("find: no match says none found beside the box, and an empty search clears the result",
    none && $("found").textContent === "");
  reset();
}

export async function behaviourTests() {
  [marking, branches, crowding].forEach((test) => test());
  await gestures();
  [lineTops, parents, rivals, standIns, lines, counts, tree, finding].forEach((test) => test());
}
