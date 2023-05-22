import { createModule } from "@skyslit/ark-core";
import { initialiseToolkit } from "./toolkit";
import { DataExplorerView } from "./toolkit/views/data-explorer";
import { Frontend } from "@skyslit/ark-frontend";
import { initialiseCustomTypes } from "./custom-types";
import LoginPage from "../auth/views/login-page";
import AdminPage from "../auth/views/admin-page";
import SignUpPage from "../auth/views/sign-up-page";
import AccountRecoveryPage from "../auth/views/account-recovery-page";

initialiseToolkit();
initialiseCustomTypes();

export default createModule(({ use }) => {
  console.log("ui.module.tsx file loaded");
  const { useComponent } = use(Frontend);

  useComponent("data-explorer", DataExplorerView);
  useComponent("sign-up-page", SignUpPage);
  useComponent("login-page", LoginPage);
  useComponent("admin-page", AdminPage);
  useComponent("account-recovery-page", AccountRecoveryPage);
});
