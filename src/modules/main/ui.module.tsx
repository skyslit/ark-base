import { createModule } from "@skyslit/ark-core";
import { initialiseToolkit } from "./toolkit";
import { DataExplorerView } from "./toolkit/views/data-explorer";
import { Frontend } from "@skyslit/ark-frontend";
import { initialiseCustomTypes } from "./custom-types";
import SidebarLayout from "./layouts/sidebar";
import LoginPage from "../auth/views/login-page";
import AdminPage from "../auth/views/admin-page";
import SignUpPage from "../auth/views/sign-up-page";
import AccountRecoveryPage from "../auth/views/account-recovery-page";
import AccountSettingsPage from "../auth/views/account-settings-page";
import AllUsersPage from "../auth/views/all-users-page";
import UserDetails from "../auth/views/user-details-page";
import AllGroupsPage from "../auth/views/all-groups-page";
import GroupDetailsPage from "../auth/views/group-details-page";
import DashboardPage from "../auth/views/dashboard";
import LoginV2Page from "../auth/views/login-v2";
import WelcomePage from "../auth/views/welcome-page";
import UserAccountSettings from "../auth/views/user-account-settings";


import { initialiseWidgets } from "./widgets";

initialiseToolkit();
initialiseCustomTypes();
initialiseWidgets();

export default createModule(({ use }) => {
  console.log("ui.module.tsx file loaded");
  const { useComponent, useLayout } = use(Frontend);

  useLayout("sidebar", SidebarLayout);

  useComponent("data-explorer", DataExplorerView);
  useComponent("sign-up-page", SignUpPage);
  useComponent("login-page", LoginPage);
  useComponent("admin-page", AdminPage);
  useComponent("account-recovery-page", AccountRecoveryPage);
  useComponent("account-settings-page", AccountSettingsPage);
  useComponent("all-users-page", AllUsersPage);
  useComponent("user-details-page", UserDetails);
  useComponent("all-groups-page", AllGroupsPage);
  useComponent("group-details-page", GroupDetailsPage);
  useComponent("dashboard-page", DashboardPage)
  useComponent("login-page-v2", LoginV2Page)
  useComponent("welcome-page", WelcomePage)
  useComponent("user-account-settings", UserAccountSettings)
});
