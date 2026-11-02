import { data } from "./datahandler.js";

export const iconFile = ({ kind, picture }) => `${data.icons.nodes}${kind}/${picture}.png`;

export const civFile = (civ) => data.icons.names[civ] ?? civ.toLowerCase();

export const byFile = (a, b) => (`${a}.png` < `${b}.png` ? -1 : Number(`${a}.png` > `${b}.png`));
