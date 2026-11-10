import { data, pack, unpack, addLanguage, localeFile } from "../../model/data/datahandler.js";
import { setOf, civsOf } from "../../model/civsets.js";
import { toJson, availabilityOf, joinLines } from "../../model/updater.js";
import { check, expect, same, codes, keys } from "../helpers_test.js";

export function updaterTests() {
  const languages = codes();
  const written = pack(data).map(({ path, value }) => ({ path, value: JSON.parse(toJson(value)) }));
  const paths = written.map(({ path }) => path);
  check("update: the writer puts each language in its own file",
    same(paths, ["data.json", ...languages.slice(1).map(localeFile)]), paths.join(", "));
  check("update: the writer keeps every value", JSON.stringify(pack(readBack(written, languages)))
    === JSON.stringify(pack(data)));
  expect("update: availability is stored in its shortest form",
    keys().filter((key) => JSON.stringify(shortest(key)) !== JSON.stringify(data.availability[key])));
  expect("update: stored names are already tidy", languages.flatMap((code) => [
    ...Object.values(data.text[code].items), ...Object.values(data.text[code].civs),
  ].filter((name) => joinLines(name, data.languages[code]) !== name).map((name) => `${code}: ${name}`)));
}

function readBack(written, languages) {
  const again = unpack(written[0].value);
  for (const [i, { value }] of written.slice(1).entries()) {
    addLanguage(again, languages[i + 1], value);
  }
  return again;
}

const shortest = (key) => availabilityOf(new Set(civsOf(setOf(data.availability[key]))), data.civs);
