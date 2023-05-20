import React from "react";
import { createReactApp, Frontend } from "@skyslit/ark-frontend";
import "antd/dist/antd.css";
import MainUIModule from "./modules/main/ui.module";

export default createReactApp(({ use, useModule }) => {
  const { useRouteConfig, useComponent } = use(Frontend);

  useModule("main", MainUIModule);

  useRouteConfig("default", () => [
    {
      path: "/admin/:dynamics_path*",
      hideInMenu: true,
      component: useComponent("main/data-explorer"),
    },
  ]);
});
