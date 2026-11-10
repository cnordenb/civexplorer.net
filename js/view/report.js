import { data } from "../model/data/datahandler.js";
import { fill } from "../model/texts.js";
import { $, clone } from "./toolkit.js";

export const showUpdating = () => openReport(data.tools.updateTitle,
  fill(data.tools.updateLoading, { source: data.source.name }));

export function showUpdate({ messages, blocked, counts, files }) {
  messages.forEach(report);
  if (blocked) {
    setStatus(data.tools.updateBlocked);
    return;
  }
  if (!messages.length) report(data.tools.updateSame);
  setStatus(fill(data.tools.updateReady, counts));
  $("reportDownloads").replaceChildren(...files.map(downloadItem));
  $("reportDownloads").hidden = false;
}

function setStatus(text) {
  $("reportStatus").textContent = text;
}

function downloadItem({ path, json }) {
  const li = clone("downloadTemplate");
  const link = li.querySelector("a");
  link.href = URL.createObjectURL(new Blob([`${json}\n`], { type: "application/json" }));
  link.download = path.split("/").pop();
  link.textContent = fill(data.tools.download, { file: path });
  return li;
}

export function showUpdateFailed(error) {
  setStatus(fill(data.tools.updateFailed, { error: error.message }));
}

export function openReport(title, status) {
  $("reportTitle").textContent = title;
  setStatus(status);
  $("reportList").replaceChildren();
  $("reportDownloads").replaceChildren();
  $("reportDownloads").hidden = true;
  if (!$("report").open) $("report").showModal();
}

export function report(line) {
  const li = clone("reportTemplate");
  li.textContent = line;
  $("reportList").append(li);
}
