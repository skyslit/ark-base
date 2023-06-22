import dashboardController from "../toolkit/views/dashboard/dashboard-controller";
import sampleWidget from "./sample-widget/sample.widget";

export function initialiseWidgets() {
  dashboardController.registerPlugin("sample-widget", sampleWidget);
}
