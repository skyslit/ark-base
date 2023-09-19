import React from "react";
import { createReactApp, Frontend, Routers } from "@skyslit/ark-frontend";
import "antd/dist/antd.css";
import MainUIModule from "./modules/main/ui.module";
import { Redirect } from "react-router-dom";
import "./modules/auth/assets/web-fonts/font.scss";

export default createReactApp(({ use, useModule }) => {
  const { useRouteConfig, useComponent, useLayout, configureAuth } =
    use(Frontend);

  configureAuth({
    defaultProtectedUrl: "/app/viewport/dashboards/default",
    loginPageUrl: "/auth/loginV2",
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
    // {
    //   path: "/auth/login",
    //   hideInMenu: true,
    //   component: useComponent("main/login-page"),
    //   Route: useComponent("authRoute"),
    // },
    {
      path: "/auth/loginV2",
      hideInMenu: true,
      component: useComponent("main/login-v2-page"),
      Route: useComponent("authRoute"),
    },
    {
      path: "/app/files/:dynamics_path*",
      hideInMenu: true,
      component: useComponent("main/data-explorer"),
      Route: useComponent("protectedRoute"),
      layout: useLayout("main/sidebar"), // Use the component address here
    },
    {
      path: "/app/users/all",
      hideInMenu: true,
      layout: useLayout("main/sidebar"),
      component: useComponent("main/all-users-page"),
      Route: useComponent("protectedRoute"),
    },
    {
      path: "/app/users/:id",
      hideInMenu: true,
      layout: useLayout("main/sidebar"),
      component: useComponent("main/user-details-page"),
      Route: useComponent("protectedRoute"),
    },
    {
      path: "/app/users",
      hideInMenu: true,
      layout: useLayout("main/sidebar"), // Use the component address here
      component: useComponent("main/account-settings-page"),
      Route: useComponent("protectedRoute"),
    },
    {
      path: "/app/groups/all",
      hideInMenu: true,
      layout: useLayout("main/sidebar"),
      component: useComponent("main/all-groups-page"),
      Route: useComponent("protectedRoute"),
    },
    {
      path: "/app/groups/:id",
      hideInMenu: true,
      layout: useLayout("main/sidebar"),
      component: useComponent("main/group-details-page"),
      Route: useComponent("protectedRoute"),
    },
    {
      path: "/app/viewport/:dynamics_path*",
      hideInMenu: true,
      layout: useLayout("main/sidebar"),
      component: useComponent("main/dashboard-page"),
      Route: useComponent("protectedRoute"),
    },
    {
      path: "/",
      component: () => <Redirect to="/auth/loginV2" />,
    },
  ]);
});
