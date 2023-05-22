import React from "react";
import { createReactApp, Frontend, Routers } from "@skyslit/ark-frontend";
import "antd/dist/antd.css";
import MainUIModule from "./modules/main/ui.module";
import { Redirect } from "react-router-dom";

export default createReactApp(({ use, useModule }) => {
  const { useRouteConfig, useComponent, useLayout, configureAuth } = use(Frontend);

  configureAuth({
    defaultProtectedUrl: "/admin/:dynamics_path*",
    loginPageUrl: "/auth/login",
  });


  useComponent("protectedRoute", Routers.ProtectedRoute),
    useComponent("authRoute", Routers.AuthRoute),
    useModule("main", MainUIModule);

  useRouteConfig("default", () => [
    {
      path: "/create/admin",
      hideInMenu: true,
      component: useComponent("main/admin-page"),
      Route: useComponent("authRoute"),
    },
    {
      path: "/auth/login",
      hideInMenu: true,
      component: useComponent("main/login-page"),
      Route: useComponent("authRoute"),
    },
    {
      path: "/account/recovery",
      hideInMenu: true,
      component: useComponent("main/account-recovery-page"),
      Route: useComponent("authRoute"),
    },
    {
      path: "/admin/:dynamics_path*",
      hideInMenu: true,
      component: useComponent("main/data-explorer"),
      Route: useComponent("protectedRoute"),
    },
    {
      path: "/auth/account/register",
      hideInMenu: true,
      component: useComponent("main/sign-up-page"),
      Route: useComponent("authRoute"),
    },
    {
      path: "/",
      component: () => <Redirect to="/auth/login" />,
    },
  ]);
});
