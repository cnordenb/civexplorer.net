import { subscribe } from "../model/model.js";
import { textsView, civsView, filtersView } from "./stringbuilder.js";
import { treeView } from "./treeview.js";
import { optionsView } from "./optionsview.js";

const parts = [textsView, optionsView, treeView, civsView, filtersView];

export const startPage = () => subscribe(page);

export const redraw = (reason) => draw(reason);

const draw = (change) => parts.forEach((part) => part.update(change));

const page = { update: draw };
