import React from "react";
import {
  controller,
  createSchema,
  useCatalogue,
} from "@skyslit/ark-frontend/build/dynamics-v2";
import { Renderer, GridView } from "./base";
import FileEditorWrapper from "./views/data-explorer/editor";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import {
  FileEditor,
  generateFileLink,
} from "@skyslit/ark-frontend/build/dynamics-v2/widgets/catalogue";
import {
  DashboardEditor,
  DashboardFileContentSchema,
  DashboardView,
} from "./views/dashboard/index";
import dashboard from "./views/dashboard/explorer-controller";

export function initialiseToolkit() {
  controller.registerUI("default", {
    Renderer,
    ItemGrid: GridView,
    FileEditorWrapper,
  });

  dashboard.registerPlugin("test-view", {
    title: "Test View",
    description: "Test description",
    supportedDashboardKeys: ["default"],
    Widget(props) {
      return (
        <div style={{ backgroundColor: "gray", width: "100%", height: "100%" }}>
          Hello World
        </div>
      );
    },
    defaultLayout: {
      i: null,
      x: 0,
      y: 0,
      h: 2,
      w: 4,
    },
  });

  controller.defineType("dashboard", {
    name: "Dashboard",
    toolkit: {
      Renderer() {
        return (
          <FileEditor>
            <DashboardEditor />
          </FileEditor>
        );
      },
    },
    fileCollectionName: "dashboard",
    fileSchema: DashboardFileContentSchema,
  });

  controller.defineType("binary", {
    name: "Binary File",
    toolkit: {
      Renderer() {
        const api = useCatalogue();
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              href={generateFileLink(
                api?.currentDir?.path,
                "stream",
                api?.currentDir?.namespace
              )}
              target="_blank"
              icon={<DownloadOutlined />}
            >
              Open or Download File
            </Button>
            <p
              style={{ marginTop: 20 }}
            >{`Binary file "${api?.currentDir?.name}"`}</p>
          </div>
        );
      },
    },
  });
}
