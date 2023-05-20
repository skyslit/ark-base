import { controller } from "@skyslit/ark-frontend/build/dynamics-v2";
import { Renderer, GridView } from "./base";
import FileEditorWrapper from "./views/data-explorer/editor";

export function initialiseToolkit() {
  controller.registerUI("default", {
    Renderer,
    ItemGrid: GridView,
    FileEditorWrapper,
  });
}
