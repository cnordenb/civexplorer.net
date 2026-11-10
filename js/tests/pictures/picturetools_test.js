import { screenPictures } from "../../view/pictures/pictures.js";
import { root } from "../helpers_test.js";

export const GRADES = { fhd: "sd", qhd: "sd", uhd: "4k", ultrawide: "4k" };
const SIZED = /\/backgrounds\/(fhd|qhd|uhd|ultrawide)\.webp$|_(sd|4k|x1|x2)\.webp$/;
const SCREENS = [
  [1920, 1080, 1], [1536, 864, 1.25], [1366, 768, 1], [1920, 1200, 1], [2560, 1440, 1], [1920, 1080, 2],
  [2560, 1080, 1], [3440, 1440, 1], [390, 844, 3], [844, 390, 3], [768, 1024, 2],
];
const PHONE_SIDE_PX = 720;
const ULTRAWIDE_RATIO = 2;
const QHD = [2560, 1440];
const FHD = [1920, 1080];
const PERCENT = 100;

export const grade = () => root.dataset.assets;

export const scale = () => (grade() === "4k" ? "x2" : "x1");

export const picture = (style, path) => at(style.backgroundImage, path);

export const at = (url, path) => url.endsWith(`/assets/images/${path}.webp")`);

export const graded = (value, base) => new RegExp(`/assets/images/${base}_(sd|4k|x1|x2)\\.webp"\\)`).test(value);

export const pictured = (el) => styles(el).some((style) => style.backgroundImage !== "none"
  || style.listStyleImage !== "none" || style.borderImageSource !== "none" || /url\(/.test(style.content)
  || /url\(/.test(style.cursor));

export const styles = (el) => [null, "::before", "::after", "::marker"].map((part) => getComputedStyle(el, part));

export const urlsOf = (style) => files([style.backgroundImage, style.borderImageSource, style.listStyleImage,
  style.content, style.cursor].join(" "));

const files = (value) => [...value.matchAll(/url\("([^"]+)"\)/g)].map(([, src]) => src);

export const misjudged = () => SCREENS.filter((sizes) => {
  const [{ background, assets }, wanted] = [screenPictures(...sizes), fitted(...sizes)];
  return background !== wanted || assets !== GRADES[wanted];
}).map(([wide, high, ratio]) => `a ${wide} by ${high} screen at ${ratio * PERCENT}% is misjudged`);

export function fitted(width = screen.width, height = screen.height, ratio = devicePixelRatio) {
  const [wide, high] = [width, height].map((side) => Math.round(side * ratio));
  if (width < PHONE_SIDE_PX || height < PHONE_SIDE_PX) return "fhd";
  if (wide / high > ULTRAWIDE_RATIO) return "ultrawide";
  if (beyond(wide, high, QHD)) return "uhd";
  return beyond(wide, high, FHD) ? "qhd" : "fhd";
}

const beyond = (wide, high, [most, tallest]) => wide > most || high > tallest;

export function fitting(src, background) {
  const [, board, sized] = SIZED.exec(src) ?? [];
  const sizes = GRADES[background] === "4k" ? ["4k", "x2"] : ["sd", "x1"];
  return board ? board === background : !sized || sizes.includes(sized);
}

export function withGrades(look) {
  const was = { background: root.dataset.background, assets: root.dataset.assets };
  try {
    return [...new Set(Object.entries(GRADES).flatMap(([background, assets]) => {
      Object.assign(root.dataset, { background, assets });
      return look(background);
    }))];
  } finally {
    Object.assign(root.dataset, was);
  }
}

export const fitBars = () => dispatchEvent(new Event("resize"));
