import { attempt } from "./guard.js";

export const params = new URLSearchParams(location.search);

export const keepInAddress = (key, value) => attempt(() => {
  const search = new URLSearchParams(location.search);
  search.set(key, value);
  history.replaceState(history.state, "", `?${search}${location.hash}`);
});
