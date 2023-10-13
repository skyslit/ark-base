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
import dashboard from "./views/dashboard/dashboard-controller";
import { PropertyRenderer, PropertySchema } from "../PropertyEditor";
import { SettingsRenderer, SettingsSchema } from "../settingsEditor";

import BinaryView from "./views/data-explorer/components/binary-view"
import { BinaryFileIcon } from "../toolkit/views/data-explorer/icons/global-icons"


export function initialiseToolkit() {
  controller.registerUI("default", {
    Renderer,
    ItemGrid: GridView,
    FileEditorWrapper,
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
        return (
          <BinaryView />
        );
      },
    },
    icon: BinaryFileIcon,
  });

  controller.defineType("property", {
    name: "Property",
    toolkit: {
      Renderer() {
        return (
          <FileEditor>
            <PropertyRenderer />
          </FileEditor>
        );
      },
    },
    fileCollectionName: "property",
    fileSchema: PropertySchema,
  });

  // controller.defineType("settings", {
  //   name: "Settings",
  //   toolkit: {
  //     Renderer() {
  //       return (
  //         <FileEditor>
  //           <SettingsRenderer />
  //         </FileEditor>
  //       );
  //     },
  //   },
  //   fileCollectionName: "settings",
  //   fileSchema: SettingsSchema,
  // });
}
