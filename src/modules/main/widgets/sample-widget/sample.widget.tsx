import React from "react";
import {
  EditorProp,
  WidgetProp,
  createWidget,
} from "../../toolkit/views/dashboard/dashboard-controller";
import { createSchema } from "@skyslit/ark-frontend/build/dynamics-v2";
import { useOptionsEditor } from "../../toolkit/views/dashboard";

const PreferenceSchema = createSchema({
  label: "",
});

function SettingsView(props: EditorProp) {
  const optionsApi = useOptionsEditor();
  return (
    <div>
      <input
        value={(optionsApi.cms.content as any).label}
        onChange={(e) =>
          optionsApi.cms.updateKey("label", e.currentTarget.value)
        }
      />
    </div>
  );
}

function Widget(props: WidgetProp) {
  return (
    <div style={{ backgroundColor: "#ccc", width: "100%", height: "100%" }}>
      {props?.preferences?.options?.label}
    </div>
  );
}

export default createWidget({
  title: "Sample Widget",
  description: "Sample description",
  supportedDashboardKeys: ["default"],
  defaultLayout: {
    i: null,
    x: 0,
    y: 0,
    h: 2,
    w: 4,
  },
  async getData(api) {
    return {
      message: "Response from API",
    };
  },
  Widget,
  OptionsEditor: SettingsView,
  optionSchema: PreferenceSchema,
});
