import { useCivs } from "./civsets.js";

export const params = new URLSearchParams(location.search);
export let data = null;

export const attempt = (action) => {
  try {
    return action();
  } catch (error) {
    if (error instanceof DOMException) return null;
    throw error;
  }
};

export const recall = (key) => attempt(() => localStorage.getItem(key));

export const remember = (key, value) => attempt(() => (value === null
  ? localStorage.removeItem(key)
  : localStorage.setItem(key, value)));

export const keepInAddress = (key, value) => attempt(() => {
  const search = new URLSearchParams(location.search);
  search.set(key, value);
  history.replaceState(history.state, "", `?${search}${location.hash}`);
});

export const load = (url) => new Promise((resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open("GET", url);
  request.onload = () => (request.status === 200 || (request.status === 0 && request.responseText)
    ? resolve(request.responseText)
    : reject(new Error(`${url} (${request.status})`)));
  request.onerror = () => reject(new Error(url));
  request.send();
});

export const treeKeys = (nodes, key) => nodes.flatMap((node) => [
  ...(node[key] ? [node[key]] : []), ...treeKeys(node.kids ?? [], key),
]);

export const localeFile = (code) => `locales/${code}.json`;

export const unpack = (file) => {
  const first = Object.keys(file.languages)[0];
  return { ...file, overrides: { [first]: file.overrides }, text: { [first]: file.text } };
};

export const addLanguage = (set, code, file) => {
  set.overrides[code] = file.overrides;
  set.text[code] = file.text;
};

export function useData(raw) {
  data = unpack(JSON.parse(raw));
  useCivs(data.civs);
}

export const loadLanguage = (code) => (data.text[code]
  ? Promise.resolve()
  : load(localeFile(code)).then((raw) => addLanguage(data, code, JSON.parse(raw))));

export const loadLanguages = () => Promise.all(Object.keys(data.languages).map(loadLanguage));

export function pack(set) {
  const [first, ...others] = Object.keys(set.languages);

  const own = (key, code) => set[key][code] ?? {};

  const local = (code) => ({ overrides: own("overrides", code), text: own("text", code) });

  return [
    { path: "data.json", value: { ...set, ...local(first) } },
    ...others.map((code) => ({ path: localeFile(code), value: local(code) })),
  ];
}

export function preferredLanguage() {
  const codes = Object.keys(data.languages);
  return [params.get("lng"), recall("language")].find((code) => codes.includes(code)) ?? codes[0];
}
