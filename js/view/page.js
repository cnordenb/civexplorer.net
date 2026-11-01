import { subscribe } from "../model/model.js";
import { textsView, civsView, filtersView } from "./stringbuilder.js";
import { treeView } from "./treeview.js";
import { optionsView } from "./optionsview.js";

const parts = [textsView, optionsView, treeView, civsView, filtersView];

const draw = (change) => parts.forEach((part) => part.update(change));

export const page = { update: draw };

export const redraw = (reason) => draw(reason);

export const startPage = () => subscribe(page);
