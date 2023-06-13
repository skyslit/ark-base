import React from "react";
import { controller } from "@skyslit/ark-frontend/build/dynamics-v2";
import { Renderer, GridView } from "./base";
import FileEditorWrapper from "./views/data-explorer/editor";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

export function initialiseToolkit() {
  controller.registerUI("default", {
    Renderer,
    ItemGrid: GridView,
    FileEditorWrapper,
  });

  controller.defineType("binary", {
    name: "Binary File",
    toolkit: {
      Renderer() {
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button href="/" target="_blank" icon={<DownloadOutlined />}>
              Open or Download File
            </Button>
          </div>
        );
      },
    },
  });
}
