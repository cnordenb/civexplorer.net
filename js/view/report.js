import { data } from "../model/datahandler.js";
import { fill } from "../model/texts.js";
import { $, clone } from "./stringbuilder.js";

export const showUpdating = () => openReport(data.tools.updateTitle,
  fill(data.tools.updateLoading, { source: data.source.name }));

export function showUpdate({ messages, fresh, files }) {
  const tools = data.tools;
  messages.forEach(report);
  if (!fresh) {
    $("reportStatus").textContent = tools.updateBlocked;
    return;
  }
  if (!messages.length) report(tools.updateSame);
  $("reportStatus").textContent = fill(tools.updateReady, {
    civs: fresh.civs.length,
    items: Object.keys(fresh.availability).length,
    languages: Object.keys(fresh.languages).length,
  });
  $("reportDownloads").replaceChildren(...files.map(({ path, json }) => {
    const li = clone("downloadTemplate");
    const link = li.querySelector("a");
    link.href = URL.createObjectURL(new Blob([`${json}\n`], { type: "application/json" }));
    link.download = path.split("/").pop();
    link.textContent = fill(tools.download, { file: path });
    return li;
  }));
  $("reportDownloads").hidden = false;
}

export function showUpdateFailed(error) {
  $("reportStatus").textContent = fill(data.tools.updateFailed, { error: error.message });
}

export function openReport(title, status) {
  $("reportTitle").textContent = title;
  $("reportStatus").textContent = status;
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
