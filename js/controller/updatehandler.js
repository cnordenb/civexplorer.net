import { fetchUpdate } from "../model/updater.js";
import { showUpdating, showUpdate, showUpdateFailed } from "../view/report.js";

export async function runUpdate() {
  showUpdating();
  try {
    showUpdate(await fetchUpdate());
  } catch (error) {
    showUpdateFailed(error);
  }
}
