import React from "react";
import { createReactApp, Frontend } from "@skyslit/ark-frontend";
import "antd/dist/antd.css";
import MainUIModule from "./modules/main/ui.module";

export default createReactApp(({ use, useModule }) => {
  const { useRouteConfig } = use(Frontend);

  useModule("main", MainUIModule);

  useRouteConfig("default", () => [
    {
      path: "*",
      hideInMenu: true,
      component: () => {
        return (
          <iframe
            src="https://skyslit-web.firebaseapp.com/research/ark/boilerplate"
            style={{
              width: "100vw",
              height: "100vh",
              border: "none",
            }}
          />
        );
      },
    },
  ]);
});
