import React from "react";
import {
  Modal,
  Row,
  Col,
  Button,
  Typography,
  Collapse,
  Spin,
  message,
  Space,
  Tabs,
  Tooltip,
  Popover,
  Badge,
  Dropdown,
  Menu,
  Drawer,
} from "antd";
import { WidthProvider, Responsive } from "react-grid-layout";
import "../../../../../../node_modules/react-grid-layout/css/styles.css";
import "../../../../../../node_modules/react-resizable/css/styles.css";
import {
  Plugin,
  ExplorerController,
  WidgetApi,
  WidgetConfiguration,
  WidgetPreferences,
  EditorProp,
  GlobalServicesApi,
} from "./dashboard-controller";
import "./style.scss";
import {
  EditOutlined,
  WarningOutlined,
  DragOutlined,
  DeleteFilled,
  SyncOutlined,
  MoreOutlined,
  PlusOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Bridge } from "./Bridge";
import { cloneDeep } from "lodash";
import {
  compile,
  createSchema,
  useFile,
} from "@skyslit/ark-frontend/build/dynamics-v2";
import {
  ContentHook,
  Frontend,
  useArkReactServices,
} from "@skyslit/ark-frontend";
import { useHistory, useParams } from "react-router-dom";


const ResponsiveGridLayout = WidthProvider(Responsive);

// @ts-ignore
const WidgetContext = React.createContext<WidgetApi<any>>(null);

/* -------------------------------------------------------------------------- */
/*                             Infinity Generator                             */
/* -------------------------------------------------------------------------- */

function* infinite(): Generator<string, string, string> {
  let index = 0;

  while (true) {
    let timestamp = new Date().valueOf();
    index++;
    yield `${timestamp}:${index}`;
  }
}

const idGenerator = infinite();

class GridController extends React.Component<any, any> {
  render() {
    return (
      <ResponsiveGridLayout
        className="layout"
        isDraggable={this.props.isDraggable}
        isResizable={this.props.isResizable}
        layouts={this.props.layout}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        breakpoints={{ lg: 2400, md: 0, sm: 0, xs: 0, xxs: 0 }}
        rowHeight={100}
        margin={[24, 24]}
        draggableHandle=".__explorer-widget-dragger"
        onLayoutChange={this.props.onLayoutChange}
        width={this.props.width}
      >
        {this.props.children}
      </ResponsiveGridLayout>
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                              Explorer Context                              */
/* -------------------------------------------------------------------------- */

type ExplorerPropType = {
  widgets: any[];
  setWidgets: any;
  layoutData: any;
  setLayoutData: any;
  tenantId: string;
  dashboardKey?: string;
  engine?: ExplorerController;
  dashboardGlobalId?: string;
  dashboardUserId?: string;
  defaultWidgets?: WidgetConfiguration[];
  mode?: 'presenter' | 'editor'
};

// @ts-ignore
const ExplorerContext = React.createContext<ExplorerPropType>(null);

/* -------------------------------------------------------------------------- */
/*                           Dashboard Control Pane                           */
/* -------------------------------------------------------------------------- */

type DashboardControlPaneType = {
  addWidget: (widgetConf: WidgetConfiguration[]) => any;
  removeWidget: (widgetConf: WidgetConfiguration) => any;
  updateWidget: (widgetConf: WidgetConfiguration[]) => any;
  registerGlobalFilter: (
    widgetId: string,
    globalKey: string,
    filter: any
  ) => any;
  unregisterGlobalFilterForThisWidget: (
    widgetId: string,
    globalKey: string
  ) => any;
  getAllGlobalFiltersByWidgetId: (widgetId: string) => string[];
};

// @ts-ignore
const DashboardControlPane =
  React.createContext<DashboardControlPaneType>(null);

/* -------------------------------------------------------------------------- */
/*                                   Gallery                                  */
/* -------------------------------------------------------------------------- */

const GalleryItemV2 = (props: any) => {
  const [uiState, setUiState] = React.useState<"ready" | "adding" | "added">(
    "ready"
  );
  const { addWidget } = React.useContext(DashboardControlPane);
  const { widgetPackageId } = props;
  const { icon } = props;

  const plugin = React.useMemo(() => {
    return props.engine.registeredPlugins[widgetPackageId];
  }, [widgetPackageId, props.engine]);

  const handleAddWidget = React.useCallback(() => {
    setUiState("adding");
    let t = setTimeout(() => {
      clearTimeout(t);

      addWidget([
        {
          id: idGenerator.next().value,
          label: plugin.title,
          widgetPluginKey: widgetPackageId,
          widgetSettings: {},
          layout: plugin.defaultLayout,
        },
      ]);

      message.info("Widget added to dashboard");

      setUiState("added");
      t = setTimeout(() => {
        clearTimeout(t);
        setUiState("ready");
      }, 3000);
    }, 1000);
  }, [addWidget, plugin]);

  return (
    <div className="app-item">
      <div style={{ display: "flex", flexDirection: "row" }}>
        {icon ? icon : <AppstoreOutlined />}
        <div>
          <Typography.Text
            style={{
              maxWidth: 233,
              color: "#424242",
              fontSize: 12,
              marginLeft: 16,
            }}
            ellipsis={true}
          >
            {plugin.title}
          </Typography.Text>
          <Typography.Paragraph
            style={{
              maxWidth: 233,
              color: "#424242",
              fontSize: 12,
              marginLeft: 16,
              height: 57,
            }}
            ellipsis={{ rows: 3 }}
          >
            {plugin.description}
          </Typography.Paragraph>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <Button
          disabled={uiState === "adding" || uiState === "added"}
          onClick={handleAddWidget}
          size="small"
        >
          {uiState === "adding"
            ? "Adding..."
            : uiState === "added"
              ? "Added"
              : uiState === "ready"
                ? "Add to Dashboard"
                : ""}
        </Button>
      </div>
    </div>
  );
};

function GallerV2() {
  const { engine, dashboardKey } = React.useContext(ExplorerContext);
  const [selectedKey, setSelectedKey] = React.useState<string>(null as any);

  const items = React.useMemo(() => {
    return Object.keys(engine?.pluginKeys || {})
      .reduce<any>((acc, groupKey) => {
        let group = acc.find((g) => g.title === groupKey);

        if (group === undefined) {
          group = {
            key: groupKey,
            label: groupKey,
            items: [],
          };
          acc.push(group);
        }

        group.items.push(
          ...(engine?.pluginKeys[groupKey].filter((itemKey) => {
            return (
              engine.registeredPlugins[itemKey].supportedDashboardKeys.indexOf(
                // @ts-ignore
                dashboardKey
              ) > -1
            );
          }) || [])
        );

        return acc;
      }, [])
      .filter((group) => {
        return group.items.length > 0;
      });
  }, [dashboardKey]);

  const defaultSelectedKeys = React.useMemo(() => {
    if (items.length > 0) {
      return [items[0].key];
    }
    return [];
  }, []);

  React.useEffect(() => {
    if (Array.isArray(defaultSelectedKeys) && defaultSelectedKeys.length > 0) {
      setSelectedKey(defaultSelectedKeys[0]);
    }
  }, []);

  const selectedItems = React.useMemo(() => {
    return items.find((i) => i.key === selectedKey);
  }, [items, selectedKey]);

  return (
    <div
      className="explorer-gallery-v2"
      style={{ height: "100%", display: "flex", flexDirection: "row" }}
    >
      <div>
        <Menu
          style={{ width: 256 }}
          selectedKeys={[selectedKey as any]}
          onSelect={(e) => setSelectedKey(e?.key)}
          mode="inline"
          items={items}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            padding: "10px 28px",
            display: "grid",
            gridTemplateColumns: "auto auto auto",
            rowGap: 10,
            columnGap: 10,
          }}
        >
          {selectedItems
            ? selectedItems.items.map((widgetPackageId) => {
              return (
                <GalleryItemV2
                  key={widgetPackageId}
                  widgetPackageId={widgetPackageId}
                  engine={engine}
                />
              );
            })
            : null}
        </div>
      </div>
    </div>
  );
}

function WidgetBusy() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgb(42 47 51)",
        }}
      >
        <Spin />
      </div>
    </div>
  );
}

function WidgetRuntime(props: {
  contentConfiguration: WidgetConfiguration;
  editorProp: EditorProp;
  plugin: Plugin;
}) {
  const { contentConfiguration, plugin } = props;

  let component = React.useMemo(() => {
    let result: any = null;

    if (plugin) {
      const Widget = plugin.Widget;
      result = (
        <Widget
          {...props.editorProp}
          preferences={contentConfiguration.preferences as any}
        />
      );
    }

    return result;
  }, [plugin, contentConfiguration]);

  return component;
}

class WidgetBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    console.error(error);
    this.props.onError && this.props.onError();
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError === true || this.props.widgetCrashed === true) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#494949",
          }}
        >
          <WarningOutlined style={{ fontSize: 30, color: "orange" }} />
          <h4 style={{ marginTop: 12 }}>{`Widget Crashed`}</h4>
          <h5 style={{ marginTop: 0 }}>{this.props.widgetKey}</h5>
        </div>
      );
    }
    return this.props.children;
  }
}

const TestWidgetRendererContext = React.createContext<{
  configuration: WidgetConfiguration;
  bridge: Bridge;
}>(null as any);

export function TestWidgetRenderer(props: { width: number; height: number }) {
  const testRendererContext = React.useContext(TestWidgetRendererContext);

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#2c323a",
        width: props.width,
        height: props.height,
        transform: "translateZ(0)",
      }}
    >
      <WidgetContainer
        contentConfiguration={testRendererContext.configuration}
        onRemove={() => { }}
        savePreferencesToCloud={async () => { }}
        isTestMode={true}
        bridge={testRendererContext.bridge}
      />
    </div>
  );
}

type OptionsEditorApi = {
  cms: ReturnType<ContentHook>;
};

export function createWidgetOptionsEditor(): OptionsEditorApi {
  const { use } = useArkReactServices();
  const { useContent } = use(Frontend);

  const cms: ReturnType<ContentHook> = useContent({}) as any;

  return {
    cms,
  };
}

const OptionsEditorContext = React.createContext<OptionsEditorApi>(null as any);

export function useOptionsEditor() {
  return React.useContext(OptionsEditorContext);
}

function WidgetContainer(props: {
  contentConfiguration: WidgetConfiguration;
  savePreferencesToCloud: (widgetId: string, preferences: any) => Promise<any>;
  onRemove: (w: WidgetConfiguration) => void;
  isTestMode?: boolean;
  bridge?: Bridge;
}) {
  const optionsEditorApi = createWidgetOptionsEditor();
  const { contentConfiguration, savePreferencesToCloud } = props;
  const { engine, tenantId, mode } = React.useContext(ExplorerContext);
  const dashboardControlPane = React.useContext(DashboardControlPane);
  const [controlsActive, setControlsActive] = React.useState(true);
  const [showBusyLayer, setShowBusyLayer] = React.useState(false);
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [preferences, setPreferences] = React.useState<WidgetPreferences>(
    null as any
  );
  const [preferencesAttached, attachPreferences] = React.useState(false);
  const [preferencesSaving, setPreferencesSaving] = React.useState(false);
  const [widgetCrashed, setWidgetCrashed] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const runtimeVariables = React.useRef<any>({
    tenantId,
  });

  const _isTestMode = React.useMemo(
    () => (typeof props.isTestMode === "boolean" ? props.isTestMode : false),
    [props.isTestMode]
  );

  const plugin = React.useMemo(() => {
    return (engine as ExplorerController).registeredPlugins[
      contentConfiguration.widgetPluginKey
    ];
  }, [engine?.registeredPlugins, contentConfiguration.widgetPluginKey]);

  const preferenceSchema = React.useMemo(() => {
    return createSchema({
      general: createSchema({
        label: "",
        description: "",
      }),
      options: plugin?.optionSchema ? plugin?.optionSchema : createSchema({}),
      filtersAvailable: null,
    });
  }, [plugin?.optionSchema]);

  /**
   * Use this to attach preferences from the widget configuration
   */
  React.useEffect(() => {
    setPreferences(
      compile(preferenceSchema, contentConfiguration.preferences) as any
    );
    attachPreferences(true);
  }, [contentConfiguration, preferenceSchema]);

  React.useEffect(() => {
    optionsEditorApi.cms.setContent(preferences?.options);
  }, [preferences]);

  const effectivePreferencs = React.useMemo(() => {
    if (props.isTestMode === true) {
      return preferences;
    }

    return contentConfiguration.preferences;
  }, [props.isTestMode, preferences, contentConfiguration.preferences]);

  /**
   * Hook to auto refresh widget when preferences change
   */
  React.useEffect(() => {
    if (preferencesAttached === true) {
      refreshData(false);
    }
  }, [effectivePreferencs, preferencesAttached]);

  const handleError = React.useCallback(() => {
    // setControlsActive(false);
  }, []);

  const refreshData = React.useCallback(
    async (silent = false, query: any = { filters: [] }) => {
      if (preferencesAttached === false) {
        throw new Error(
          `Attempted to refresh data before attaching preferences`
        );
      }
      try {
        if (plugin.getData) {
          if (silent === false) {
            setShowBusyLayer(true);
          }

          const d = await Promise.resolve(
            plugin.getData({
              preferences,
              runtimeVars: runtimeVariables.current,
              filterQuery: query,
            })
          );
          setData(d);
          if (hasInitialized === false) {
            setHasInitialized(true);
          }
          if (silent === false) {
            await new Promise<void>((resolve) =>
              setTimeout(() => resolve(), 800)
            );
            setShowBusyLayer(false);
          }
        }
      } catch (e) {
        console.error(e);
        setWidgetCrashed(true);
        setShowBusyLayer(false);
      }
    },
    [
      hasInitialized,
      plugin,
      preferences,
      preferencesAttached,
      preferences?.options,
    ]
  );

  /**
   * Register bridge connectivity
   */
  React.useEffect(() => {
    if (props.bridge) {
      const unsub = props.bridge.addEventListener("refresh", () => {
        refreshData(true);
      });

      return unsub();
    }
  }, [refreshData]);

  const removeWidget = React.useCallback(() => {
    Modal.confirm({
      title: "Remove Widget",
      content: "Are you sure about removing this widget?",
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        if (props.onRemove) {
          return props.onRemove(contentConfiguration);
        }
      },
    });
  }, [props.onRemove, contentConfiguration]);

  const updateWidget = () => {
    setShowEditModal(true);
  };

  const closeEditModal = React.useCallback(() => {
    setShowEditModal(false);
  }, []);

  const globalServiceApi = React.useMemo<GlobalServicesApi>(() => {
    return {
      registerGlobalFilter: (globalKey, filter) => {
        return dashboardControlPane.registerGlobalFilter(
          props.contentConfiguration.id,
          globalKey,
          filter
        );
      },
      unregisterGlobalFilterForThisWidget: () => {
        const allGlobalFiltersRegisteredSoFar =
          dashboardControlPane.getAllGlobalFiltersByWidgetId(
            props.contentConfiguration.id
          );
        allGlobalFiltersRegisteredSoFar.forEach((globalKey) => {
          dashboardControlPane.unregisterGlobalFilterForThisWidget(
            props.contentConfiguration.id,
            globalKey
          );
        });
      },
    };
  }, []);

  /** This is a widget specific pub-sub mini-controller */
  React.useEffect(() => {
    if (hasInitialized) {
      if (plugin.handleGlobalFilterChange) {
        plugin.handleGlobalFilterChange({
          preferences: contentConfiguration.preferences as any,
          ...globalServiceApi,
        });
      }

      // @ts-ignore
      const unsubscribeGlobalFilterChange = engine.addEventListener(
        `on-global-filter-changed-${contentConfiguration.id}`,
        (payload: any) => {
          refreshData(false, payload);
        }
      );

      return () => {
        unsubscribeGlobalFilterChange();
      };
    }
  }, [refreshData, hasInitialized]);

  const savePreferences = React.useCallback(
    (options?: any) => {
      attachPreferences(false);

      Promise.resolve(true)
        .then(() =>
          savePreferencesToCloud(
            contentConfiguration.id,
            (() => {
              if (options) {
                return {
                  ...preferences,
                  options: {
                    ...preferences?.options,
                    ...options,
                  },
                };
              }
              return preferences;
            })()
          )
        )
        .then(() =>
          Promise.resolve<any>(
            plugin.handleGlobalFilterChange
              ? plugin.handleGlobalFilterChange({
                preferences,
                ...globalServiceApi,
              })
              : true
          )
        )
        .then(() => closeEditModal())
        .catch((err) => {
          console.error(err);
          /**
           * TODO: Handle error, may be show in notification or something?
           */
        });
    },
    [
      closeEditModal,
      refreshData,
      savePreferencesToCloud,
      preferences,
      globalServiceApi,
    ]
  );

  const widgetApi = React.useMemo<WidgetApi<any>>(() => {
    return {
      showBusyLayer,
      setShowBusyLayer,
      data,
      hasInitialized,
      refreshData,
      configuration: contentConfiguration,
      runtimeVariablesRef: runtimeVariables,
      plugin: plugin,
      savePreferences,
    };
  }, [
    showBusyLayer,
    hasInitialized,
    data,
    refreshData,
    contentConfiguration,
    plugin,
    savePreferences,
  ]);

  const editorProp = React.useMemo<EditorProp>(() => {
    return {
      preferences,
      setOptions: (opts) =>
        setPreferences((v) => {
          return compile(preferenceSchema, {
            ...v,
            options: { ...(v?.options || {}), ...opts },
          });
        }),
      ...globalServiceApi,
    };
  }, [preferences, globalServiceApi, preferenceSchema]);

  const dataEditor = React.useMemo(() => {
    if (plugin.DataEditor) {
      return <plugin.DataEditor {...editorProp} />;
    }
    return null;
  }, [editorProp]);

  const optionsEditor = React.useMemo(() => {
    if (plugin.OptionsEditor) {
      return <plugin.OptionsEditor {...editorProp} />;
    }
    return null;
  }, [editorProp]);

  const WidgetFilterEditor = React.useMemo(() => {
    if (plugin.WidgetFilter) {
      return <plugin.WidgetFilter {...editorProp} />;
    }
    return null;
  }, [editorProp]);

  return (
    <WidgetContext.Provider value={widgetApi}>
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          overflow: "auto",
        }}
        className="bg-neutral-85"
      >
        <Typography.Text
          ellipsis={true}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            fontFamily: "Almarose-Semibold",
            fontSize: 18,
            width: 200,
            color: "white",
            zIndex: 10,
          }}
        >
          {contentConfiguration.preferences?.options?.title || "Widget"}
        </Typography.Text>
        {_isTestMode === false ? (
          <div
            className="floating-control"
            style={{ display: controlsActive === true ? "flex" : "none" }}
          >
            {WidgetFilterEditor ? WidgetFilterEditor : null}
            <Dropdown
              overlay={
                <Menu className="widgetMenu text-neutral-2" theme="dark">
                  {
                    mode === 'editor' ? (
                      <Menu.Item
                        key={"edit"}
                        onClick={updateWidget}
                        icon={<EditOutlined />}
                      >
                        <span className="text-neutral-2">Edit</span>
                      </Menu.Item>
                    ) : null
                  }
                  <Menu.Item
                    key={"refresh"}
                    onClick={() => refreshData()}
                    icon={<SyncOutlined />}
                  >
                    <span className="text-neutral-2">Refresh</span>
                  </Menu.Item>
                  {
                    mode === 'editor' ? (
                      <Menu.Item
                        key={"delete"}
                        onClick={removeWidget}
                        icon={<DeleteFilled />}
                      >
                        <span className="text-neutral-2">Remove</span>
                      </Menu.Item>
                    ) : null
                  }
                </Menu>
              }
              placement="bottom"
              trigger={["click"]}
            >
              <Button
                type="ghost"
                className="widgetMenuBtn"
                style={{ color: "#A8B1BD", padding: "5px" }}
                icon={<MoreOutlined />}
              />
            </Dropdown>
            {
              mode === 'editor' ? (
                <Button type="ghost" className="__explorer-widget-dragger">
                  <Tooltip title="Drag">
                    <DragOutlined />
                  </Tooltip>
                </Button>
              ) : null
            }
          </div>
        ) : null}
        {showBusyLayer === true || preferencesAttached === false ? (
          <WidgetBusy />
        ) : null}
        <WidgetBoundary
          widgetCrashed={widgetCrashed}
          widgetKey={props.contentConfiguration.widgetPluginKey}
          onError={handleError}
        >
          <WidgetRuntime
            contentConfiguration={props.contentConfiguration}
            editorProp={editorProp}
            plugin={plugin}
          />
        </WidgetBoundary>
      </div>
      {_isTestMode === false ? (
        <Modal
          title="Configure Options"
          visible={showEditModal}
          width="800px"
          footer={false}
          bodyStyle={{ paddingTop: 0 }}
          closable={true}
          onCancel={closeEditModal}
        >
          <TestWidgetRendererContext.Provider
            value={{
              configuration: {
                ...contentConfiguration,
                preferences: {
                  ...preferences,
                  general: {
                    ...preferences?.general,
                  },
                  options: {
                    ...preferences?.options,
                  },
                },
              },
              bridge: null as any,
            }}
          >
            <OptionsEditorContext.Provider value={optionsEditorApi}>
              <div style={{ position: "relative" }}>
                {preferencesSaving === true ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      backgroundColor: "rgb(33 38 43 / 67%)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 100,
                    }}
                  >
                    <Spin />
                  </div>
                ) : null}
                <Row>
                  <Col xs={24}>
                    <Tabs defaultActiveKey="general">
                      {dataEditor ? (
                        <Tabs.TabPane tab="Data" key="data" tabKey="data">
                          {dataEditor}
                        </Tabs.TabPane>
                      ) : null}
                      {optionsEditor ? (
                        <Tabs.TabPane
                          tab="Options"
                          key="options"
                          tabKey="options"
                        >
                          {optionsEditor}
                        </Tabs.TabPane>
                      ) : null}
                    </Tabs>
                  </Col>
                </Row>
                <Row>
                  <Col xs={24}>
                    <Space size="small">
                      <Button
                        onClick={() =>
                          savePreferences(optionsEditorApi.cms?.content as any)
                        }
                        type="primary"
                      >
                        Update
                      </Button>
                      <Button type="text" onClick={closeEditModal}>
                        Hide
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </div>
            </OptionsEditorContext.Provider>
          </TestWidgetRendererContext.Provider>
        </Modal>
      ) : null}
    </WidgetContext.Provider>
  );
}

export function useExplorerWidget<T>() {
  return React.useContext<WidgetApi<T>>(WidgetContext);
}

function OnMountCallback(props: { onMount: (val: boolean) => void }) {
  React.useEffect(() => {
    const t = setTimeout(() => props.onMount && props.onMount(true), 250);
    return () => clearTimeout(t);
  }, []);

  return null;
}

type GlobalFilterRefMapType = {
  [globalFilterKey: string]: {
    filterSchema: any;
    widgetIds: string[];
  };
};

export function DashboardCore(props: ExplorerPropType) {
  const { dashboardGlobalId, dashboardUserId, dashboardKey, defaultWidgets, mode } =
    props;
  const { widgets, setWidgets, layoutData, setLayoutData } = props;
  // const [widgets, setWidgets] = React.useState<Array<WidgetConfiguration>>([]);
  const [galleryVisible, setGalleryVisible] = React.useState(false);
  // const [layoutData, setLayoutData] = React.useState(null);
  const [ready, setReady] = React.useState(true);
  const [wrapperWidth, setWrapperWidth] = React.useState(0);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [hasMounted, setHasMounted] = React.useState(false);
  const globalFilterMapRef = React.useRef<GlobalFilterRefMapType>({});

  const registerGlobalFilter = React.useCallback(
    (widgetId: string, globalFilterKey: string, filterSchema: any) => {
      let globalFilterRef = globalFilterMapRef.current[globalFilterKey];
      if (!globalFilterRef) {
        globalFilterRef = {
          filterSchema,
          widgetIds: [widgetId],
        };

        globalFilterMapRef.current[globalFilterKey] = globalFilterRef;
      } else {
        const widgetIdAlsoExists =
          globalFilterRef.widgetIds.indexOf(widgetId) > -1;
        if (!widgetIdAlsoExists)
          globalFilterMapRef.current[globalFilterKey].widgetIds.push(widgetId);
      }
    },
    []
  );

  const unregisterGlobalFilterForThisWidget = React.useCallback(
    (widgetId: string, globalFilterKey: string) => {
      let globalFilterRef = globalFilterMapRef.current[globalFilterKey];
      if (globalFilterRef) {
        const widgetIdIndex = globalFilterRef.widgetIds.indexOf(widgetId);
        if (widgetIdIndex > -1) {
          globalFilterRef.widgetIds.splice(widgetIdIndex, 1);
        }

        const shouldRemoveFromGlobalFilters =
          globalFilterRef.widgetIds.length < 1;
        if (shouldRemoveFromGlobalFilters) {
          delete globalFilterMapRef.current[globalFilterKey];
        }
      }
    },
    []
  );

  const getAllGlobalFiltersByWidgetId = React.useCallback(
    (widgetId: string) => {
      if (typeof globalFilterMapRef.current === "object") {
        return Object.keys(globalFilterMapRef.current).reduce(
          (acc, globalDashboardKey) => {
            let thisFilterBelongsToThisWidget = false;
            try {
              thisFilterBelongsToThisWidget =
                globalFilterMapRef.current[
                  globalDashboardKey
                ].widgetIds.indexOf(widgetId) > -1;
            } catch (e) {
              console.error(e);
              /** Do nothing */
            }

            if (thisFilterBelongsToThisWidget) {
              // @ts-ignore
              acc.push(globalDashboardKey);
            }
            return acc;
          },
          []
        );
      }

      return [];
    },
    []
  );

  const publishFilterAvailable = React.useCallback(
    (globalFilterKey: string, payload: any) => {
      let globalFilterRef = globalFilterMapRef.current[globalFilterKey];
      if (globalFilterRef) {
        globalFilterRef.widgetIds.forEach((widgetId) => {
          engine.emit(`on-global-filter-changed-${widgetId}`, payload);
        });
      }
    },
    []
  );

  const engine = React.useMemo(() => {
    if (props.engine === undefined) {
      return ExplorerController.getInstance();
    } else {
      return props.engine;
    }
  }, [props.engine]);

  const _dashboardKey = React.useMemo(() => {
    if (dashboardKey === undefined) {
      return "default";
    } else {
      return dashboardKey;
    }
  }, [dashboardKey]);

  const _dashboardGlobalId = React.useMemo(() => {
    if (dashboardGlobalId !== undefined) {
      return dashboardGlobalId;
    }
    return `dashboard:/${_dashboardKey}`;
  }, [dashboardGlobalId, _dashboardKey]);

  const _dashboardUserId = React.useMemo(() => {
    if (dashboardUserId) {
      return dashboardUserId;
    }

    return `${_dashboardGlobalId}`;
  }, [dashboardUserId, _dashboardGlobalId]);

  const context = React.useMemo<ExplorerPropType>(() => {
    return {
      dashboardGlobalId: _dashboardGlobalId,
      dashboardKey: _dashboardKey,
      dashboardUserId: _dashboardUserId,
      engine: engine,
      tenantId: props.tenantId,
      widgets: props.widgets,
      setWidgets: props.setWidgets,
      layoutData: props.layoutData,
      setLayoutData: props.layoutData,
      mode: mode
    };
  }, [
    _dashboardGlobalId,
    _dashboardKey,
    _dashboardUserId,
    engine,
    props?.widgets,
    props?.setWidgets,
    props?.layoutData,
    props?.layoutData,
    mode
  ]);

  const controlPane = React.useMemo<DashboardControlPaneType>(() => {
    return {
      addWidget: (widgetConf) => {
        setWidgets((w) => [...widgetConf, ...w]);
      },
      removeWidget: (widgetConf) => {
        setWidgets((w) => w.filter((w) => w.id !== widgetConf.id));
      },
      updateWidget: (widgetConf) => {
        setWidgets((w) => [...widgetConf, ...w]);
      },
      registerGlobalFilter,
      unregisterGlobalFilterForThisWidget,
      getAllGlobalFiltersByWidgetId,
    };
  }, [
    registerGlobalFilter,
    unregisterGlobalFilterForThisWidget,
    getAllGlobalFiltersByWidgetId,
    setWidgets,
  ]);

  const savePreferencesToCloud = React.useCallback(
    async (widgetId: string, preferences) => {
      try {
        /** Used to update the local copy of widgets */
        setWidgets((w) => {
          return w.map((w) => {
            if (w.id === widgetId) {
              return {
                ...w,
                preferences: {
                  ...cloneDeep(preferences),
                },
              };
            }
            return w;
          });
        });
      } catch (e) {
        console.error(e);
        message.error(`Dashboard changes not saved`);
      }
    },
    [setWidgets]
  );

  const saveLayout = React.useCallback(
    async (layout: any, widgets: any = undefined) => {
      try {
        const d: any = {
          layout,
        };

        if (Boolean(widgets)) {
          d.widgets = widgets;
        }

        setLayoutData(() => layout);
      } catch (e) {
        console.error(e);
        message.error(`Dashboard changes not saved`);
      }
    },
    [_dashboardKey, props.tenantId, setLayoutData]
  );

  /**
   * Bootstrap code
   */
  // React.useEffect(() => {
  //   fetchLayout()
  //     .then((layoutData) => {
  //       setLayoutData(layoutData);
  //       let savedWidgets: WidgetConfiguration[] = [];
  //       if (layoutData && Array.isArray(layoutData.widgets)) {
  //         savedWidgets = layoutData.widgets;

  //         controlPane.addWidget(savedWidgets);
  //       } else {
  //         controlPane.addWidget([
  //           ...(defaultWidgets || []).filter((w) => {
  //             const savedWidgetIndex = savedWidgets.findIndex(
  //               (i) => i.id === w.id,
  //             );
  //             return savedWidgetIndex < 0;
  //           }),
  //           ...savedWidgets,
  //         ]);
  //       }

  //       setReady(true);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // }, []);

  const showGallery = React.useCallback((val) => setGalleryVisible(true), []);
  const hideGallery = React.useCallback((val) => setGalleryVisible(false), []);

  const processedWidgets = React.useMemo(() => {
    if (layoutData) {
      return widgets.map((w) => {
        let widgetLayout = null;

        try {
          // @ts-ignore
          widgetLayout = layoutData.layout.find((l) => l.i === w.id);
        } catch (e) {
          // Do nothing
        }

        if (widgetLayout) {
          return {
            ...w,
            layout: widgetLayout,
          };
        }

        return w;
      });
    }

    return widgets;
  }, [widgets, layoutData]);

  React.useEffect(() => {
    if (hasMounted === true) {
      if (wrapperRef.current) {
        console.log(
          `Dashboard wrapper width: ${wrapperRef.current.clientWidth}`
        );
        setWrapperWidth(wrapperRef.current.clientWidth);
      }
    }
  }, [hasMounted]);

  if (ready === false) {
    return (
      <>
        <p>Connecting...</p>
      </>
    );
  }

  return (
      <ExplorerContext.Provider value={context}>
        <DashboardControlPane.Provider value={controlPane}>
          <div ref={wrapperRef} className="atlas-explorer">
            <OnMountCallback onMount={setHasMounted} />
            {wrapperWidth > 0 ? (
              <>
                <div>
                  <Row justify="space-between">
                    <Col></Col>
                    <Col>
                      <Space>
                        {/* <Popover
                        overlayStyle={{ width: '650px' }}
                        placement="bottomLeft"
                        overlayInnerStyle={{ padding: '0px 0px' }}
                        destroyTooltipOnHide={true}
                        content={
                          <GlobalFilterWrapper
                            globalFilterMapRef={globalFilterMapRef}
                            publishFilterAvailable={publishFilterAvailable}
                          />
                        }
                        trigger="click">
                        <Badge size="small" count={0}>
                          <Tooltip title="Filter">
                            <Button type="ghost" className="delphi-btn">
                              <FilterOutlined
                                style={{ color: '#8b97a7', fontSize: '16px' }}
                              />
                            </Button>
                          </Tooltip>
                        </Badge>
                      </Popover> */}
                        {
                          mode === 'editor' ? (
                            <Tooltip placement="topLeft" title="Add widget">
                              <Button
                                icon={<PlusOutlined />}
                                type="ghost"
                                onClick={showGallery}
                              />
                            </Tooltip>
                          ) : null
                        }
                      </Space>
                    </Col>
                  </Row>
                </div>
                <GridController
                  layout={layoutData}
                  width={wrapperWidth}
                  isDraggable={mode === 'editor'}
                  isResizable={mode === 'editor'}
                  onLayoutChange={(l, allLayouts) => {
                    saveLayout(allLayouts, widgets);
                  }}
                >
                  {processedWidgets.map((w) => {
                    return (
                      <div key={w.id} data-grid={w.layout}>
                        <WidgetContainer
                          contentConfiguration={w}
                          savePreferencesToCloud={savePreferencesToCloud}
                          onRemove={controlPane.removeWidget}
                        />
                      </div>
                    );
                  })}
                </GridController>
              </>
            ) : (
              <div style={{ marginLeft: 24, marginRight: 24 }}>
                <p>Starting up...</p>
              </div>
            )}
          </div>
          <Drawer
            width={1200}
            title="Widget Gallery"
            visible={galleryVisible}
            onClose={hideGallery}
            footer={null}
          >
            <GallerV2 />
          </Drawer>
        </DashboardControlPane.Provider>
      </ExplorerContext.Provider>
  );
}

export type DashboardFileContentType = {
  widgets: any[];
  layoutData: any;
};

export const DashboardFileContentSchema = createSchema({
  widgets: [],
  layoutData: {},
});

export function DashboardView(props: {
  dashboardFileContent: DashboardFileContentType;
  onChange: any;
  mode?: 'presenter' | 'editor'
}) {
  const { onChange, dashboardFileContent, mode } = props;

  const setWidgets = React.useCallback(
    (w: any) => {
      if (onChange) {
        onChange({
          ...dashboardFileContent,
          widgets: w(dashboardFileContent.widgets),
        });
      }
    },
    [onChange, dashboardFileContent]
  );

  const setLayoutData = React.useCallback(
    (ld) => {
      if (onChange) {
        onChange({
          ...dashboardFileContent,
          layoutData: ld(dashboardFileContent.layoutData),
        });
      }
    },
    [onChange, dashboardFileContent]
  );

  return (
    <DashboardCore
      tenantId="default"
      dashboardKey="default"
      widgets={dashboardFileContent.widgets}
      layoutData={dashboardFileContent.layoutData}
      setWidgets={setWidgets}
      setLayoutData={setLayoutData}
      mode={mode || 'editor'}
    />
  );
}

export function DashboardEditor() {
  const file = useFile();

  if (!file.cms.content) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardView
      dashboardFileContent={file.cms.content as any}
      onChange={(c) => {
        file.cms.runBatch(() => {
          file.cms.updateKey("widgets", c.widgets);
          file.cms.updateKey("layoutData", c.layoutData);
        });
      }}
    />
  );
}
