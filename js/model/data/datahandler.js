import { useCivs } from "../civsets.js";
import { recall } from "./storage.js";
import { params } from "./address.js";
export { SETTINGS, recall, remember, recallSetting, rememberSetting } from "./storage.js";
export { params, keepInAddress } from "./address.js";
export { attempt } from "./guard.js";

export let data = null;

export function useData(raw) {
  data = unpack(JSON.parse(raw));
  useCivs(data.civs);
}

export function unpack(file) {
  const first = firstLanguage(file);
  return { ...file, overrides: { [first]: file.overrides }, text: { [first]: file.text } };
}

export const loadLanguages = () => Promise.all(Object.keys(data.languages).map(loadLanguage));

export const loadLanguage = (code) => (hasLanguage(code)
  ? Promise.resolve()
  : load(localeFile(code)).then((raw) => addLanguage(data, code, JSON.parse(raw))));

export const load = (url) => new Promise((resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open("GET", url);
  request.onload = () => (request.status === 200 || (request.status === 0 && request.responseText)
    ? resolve(request.responseText)
    : reject(new Error(`${url} (${request.status})`)));
  request.onerror = () => reject(new Error(url));
  request.send();
});

export const localeFile = (code) => `locales/${code}.json`;

export function addLanguage(siteData, code, file) {
  siteData.overrides[code] = file.overrides;
  siteData.text[code] = file.text;
}

export const firstLanguage = (from = data) => Object.keys(from.languages)[0];

export const hasLanguage = (code) => !!data.text[code];

export function preferredLanguage() {
  const codes = Object.keys(data.languages);
  return [params.get("lng"), recall("language")].find((code) => codes.includes(code)) ?? firstLanguage();
}

export function startLanguage() {
  const code = preferredLanguage();
  return hasLanguage(code) ? code : firstLanguage();
}

export function pack(siteData) {
  const first = firstLanguage(siteData);
  const others = Object.keys(siteData.languages).filter((code) => code !== first);

  const ofLanguage = (key, code) => siteData[key][code] ?? {};

  const local = (code) => ({ overrides: ofLanguage("overrides", code), text: ofLanguage("text", code) });

  return [
    { path: "data.json", value: { ...siteData, ...local(first) } },
    ...others.map((code) => ({ path: localeFile(code), value: local(code) })),
  ];
}
