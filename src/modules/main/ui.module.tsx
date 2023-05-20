import { createModule } from "@skyslit/ark-core";
import { initialiseToolkit } from "./toolkit";
import { DataExplorerView } from "./toolkit/views/data-explorer";
import { Frontend } from "@skyslit/ark-frontend";
import { initialiseCustomTypes } from "./custom-types";

initialiseToolkit();
initialiseCustomTypes();

export default createModule(({ use }) => {
  console.log("ui.module.tsx file loaded");
  const { useComponent } = use(Frontend);

  useComponent("data-explorer", DataExplorerView);
});
