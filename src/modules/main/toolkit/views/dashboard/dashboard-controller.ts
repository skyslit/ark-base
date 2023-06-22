import React from "react";
import GridLayout from "react-grid-layout";

export type WidgetPreferences = {
  general: {
    label: string;
    description: string;
  };
  options: any;
  filtersAvailable: any;
};

export type GlobalServicesApi = {
  registerGlobalFilter: (globalKey: string, filter: any) => any;
  unregisterGlobalFilterForThisWidget: () => any;
};

export type WidgetApi<T> = {
  showBusyLayer: boolean;
  setShowBusyLayer: React.Dispatch<React.SetStateAction<boolean>>;
  data: T;
  hasInitialized: boolean;
  refreshData: (silent?: boolean, query?: any) => Promise<any>;
  configuration: WidgetConfiguration;
  runtimeVariablesRef: React.MutableRefObject<any>;
  plugin: Plugin;
  savePreferences?: (options?: any) => void;
};

export type EditorProp = {
  preferences: WidgetPreferences;
  setOptions: (opts: any) => void;
} & GlobalServicesApi;

export type WidgetProp = {} & EditorProp;

export type GetDataApi = {
  preferences: WidgetPreferences;
  runtimeVars: any;
  filterQuery?: any;
};
export type Plugin = {
  title: string;
  description: string;
  Widget: (props: WidgetProp) => JSX.Element;
  DataEditor?: (props: EditorProp) => JSX.Element;
  OptionsEditor?: (props: EditorProp) => JSX.Element;
  supportedDashboardKeys: string[];
  group?: string;
  preventMultiInstance?: boolean;
  defaultLayout?: Partial<GridLayout.Layout>;
  getData?: (api: GetDataApi) => Promise<any>;
  WidgetFilter?: (props: EditorProp) => JSX.Element;
  handleGlobalFilterChange?: (
    api: { preferences: WidgetPreferences } & GlobalServicesApi
  ) => Promise<void> | void;
  optionSchema?: () => any;
};

export type WidgetConfiguration = {
  id: string;
  widgetPluginKey: string;
  widgetSettings: any;
  label: string;
  layout?: Partial<GridLayout.Layout>;
  preferences?: WidgetPreferences;
};

type SystemContextKeys = "userId" | "orgId";

export class ExplorerController {
  static instance: ExplorerController;
  static getInstance() {
    if (!ExplorerController.instance) {
      ExplorerController.instance = new ExplorerController();
    }

    return ExplorerController.instance;
  }

  _explorerMode: string = "none";
  get explorerMode() {
    return this._explorerMode;
  }

  _systemData: any = {};
  setSystemData(key: SystemContextKeys, value: any) {
    this._systemData[key] = value;
  }
  getSystemData(key: SystemContextKeys) {
    return this._systemData[key];
  }

  _contextData: any = {};
  setContextData(key: string, value: any) {
    this._contextData[key] = value;
  }
  getContextData(key: string) {
    return this._contextData[key];
  }

  setExplorerMode(v: string) {
    this._explorerMode = v;
    console.log(`Selected explorer mode: ${v}`);
  }

  registeredPlugins: {
    [key: string]: Plugin;
  } = {};

  pluginKeys: { [key: string]: Array<string> } = {};

  syncPluginKeys() {
    this.pluginKeys = Object.keys(this.registeredPlugins).reduce((acc, key) => {
      let groupName = "General";
      if (this.registeredPlugins[key].group !== undefined) {
        // @ts-ignore
        groupName = this.registeredPlugins[key].group;
      }

      if (acc[groupName] === undefined) {
        acc[groupName] = [];
      }

      acc[groupName].push(key);

      return acc;
    }, {});
  }

  registerPlugin(key: string, plugin: Plugin) {
    if (this.registeredPlugins[key] !== undefined) {
      throw new Error(`Explorer plugin '${key}' is already registered`);
    }

    this.registeredPlugins[key] = plugin;
    this.syncPluginKeys();
  }

  /* -------------------------------------------------------------------------- */
  /*                                Bridge Begin                                */
  /* -------------------------------------------------------------------------- */

  callbacks = {};

  addEventListener(ev: string, cb: (...args: any[]) => any) {
    if (!this.callbacks[ev]) {
      this.callbacks[ev] = [];
    }

    this.callbacks[ev].push(cb);

    return () => {
      this.callbacks[ev] = this.callbacks[ev].filter((c) => c !== cb);
    };
  }

  emit(ev: string, ...args: any[]) {
    if (this.callbacks[ev]) {
      this.callbacks[ev].forEach((cb) => {
        try {
          cb && cb(...args);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Bridge End                                 */
  /* -------------------------------------------------------------------------- */
}

export function createWidget(widget: Plugin): Plugin {
  return widget;
}

export default ExplorerController.getInstance();
