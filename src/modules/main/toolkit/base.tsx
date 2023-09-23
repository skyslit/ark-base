import React from "react";
import {
  Breadcrumb,
  Button,
  Collapse,
  Input,
  Result,
  Modal,
  message,
  Layout,
  Row,
  Col,
  Divider,
  Typography,
  Dropdown,
  Menu,
  Space,
  Upload,
  Drawer,
  Tabs,
  TabsProps,
  Select,
  Table,
} from "antd";
import { useCatalogue, useFile } from "@skyslit/ark-frontend/build/dynamics-v2";
import { Link, useHistory } from "react-router-dom";
import { HomeOutlined, InboxOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import Item from "./views/data-explorer/components/item";
import {
  DefaultItemIcon,
  FolderItemIcon,
} from "./views/data-explorer/components/item";
import { useCatalogueItemPicker } from "@skyslit/ark-frontend/build/dynamics-v2/widgets/catalogue";
import "./base.scss";
import { Option } from "antd/lib/mentions";
import { DownArrowOutlined, GridOutlined, ListOutlined } from "./views/data-explorer/icons/global-icons";

export const ViewAsContext = React.createContext<any>(null);

const { Header, Content } = Layout;
const { Panel } = Collapse;


// const TableView = () => {

//   const dataSource = [
//     {
//       key: '1',
//       name: 'Mike',
//       age: 32,
//       address: '10 Downing Street',
//     },
//     {
//       key: '2',
//       name: 'John',
//       age: 42,
//       address: '10 Downing Street',
//     },
//   ];

//   const columns = [
//     {
//       title: 'Name',
//       dataIndex: 'name',
//       key: 'name',
//     },
//     {
//       title: 'Age',
//       dataIndex: 'age',
//       key: 'age',
//     },
//     {
//       title: 'Address',
//       dataIndex: 'address',
//       key: 'address',
//     },
//   ];

//   return (
//     <Table dataSource={dataSource} columns={columns} />
//   )
// }

export function GridView() {
  const api = useCatalogue();
  const picker = useCatalogueItemPicker();
  const history = useHistory();
  // const [selectedView, setSelectedView] = React.useState(
  //   window.localStorage.getItem("selectedView")
  // );

  if (!Array.isArray(api.items)) {
    return <div>Loading items...</div>;
  }

  // if (selectedView !== "table") {
    return (
      <div style={{ width: "100%" }}>
        {api.items.map((item) => {
          return (
            <Item
              onClick={() => {
                /** Select multiple items */
                // setSelectedPaths((paths) => {
                //   if (paths.indexOf(item.path) < 0) {
                //     return [...paths, item.path];
                //   }
                //   return paths;
                // });

                api.setSelectedItems([item]);
              }}
              onDoubleClick={(fullPath: string) => {
                if (api?.meta?.mode === "picker") {
                  const customType =
                    api.controller.namespaces[item.namespace].types[item.type];
                  const hasCustomRenderer = Boolean(
                    customType?.toolkit?.Renderer
                  );
                  let isAFile = Boolean(hasCustomRenderer);

                  if (isAFile === true) {
                    if (picker) {
                      picker.settle({
                        items: [item],
                      });
                    }
                    return;
                  }

                  api.setPath(item.path);
                } else {
                  history.push(fullPath);
                }
              }}
              selected={
                api.selectedItems.findIndex((i) => i.path === item.path) > -1
              }
              key={item.slug}
              item={item}
              title={item.slug}
              fullPath={api.getFullUrlFromPath(
                api.getDestinationPathFromItem(item)
              )}
              onDelete={() =>
                api.deleteItems([item.path]).catch((e) => {
                  message.error(
                    e?.response?.data?.message
                      ? e?.response?.data?.message
                      : e.message
                  );
                })
              }
              namespace={api.namespace}
              onRename={(newName: any) =>
                api.renameItem(item.path, item.parentPath, newName)
              }
              onCut={() =>
                api.setClipboard({
                  action: "cut",
                  meta: {
                    item,
                  },
                })
              }
              onCopyShortcut={() =>
                api.setClipboard({
                  action: "copy-shortcut",
                  meta: {
                    item,
                  },
                })
              }
            />
          );
        })}
      </div>
    );
  // } else {
  //   return (
  //     <TableView />
  //   )
  // }

}


function NewItem(props: any) {
  const { selected, onClick, item } = props;

  const Icon = React.useMemo(() => {
    if (item.id === "folder") {
      return FolderItemIcon;
    }

    if (item?.icon) {
      return item.icon;
    }

    return DefaultItemIcon;
  }, [item.icon]);

  return (
    <div
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        textAlign: "center",
        marginLeft: 10,
        marginBottom: 10,
        cursor: "pointer",
        userSelect: "none",
        display: "inline-block",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          backgroundColor: "transparent",
          border: "0px",
          outline: "1px solid",
          outlineColor: selected === false ? "transparent" : "green",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon style={{ fontSize: 50, width: 50, height: 50 }} />
      </div>
      <Typography.Text
        ellipsis={true}
        style={{ fontSize: 12, margin: 0, width: 50, textAlign: "center" }}
      >
        {item.name}
      </Typography.Text>
    </div>
  );
}

export function Renderer() {
  const [uploadModalVisible, setUploadModalVisible] =
    React.useState<boolean>(false);
  const [newFolderModal, setNewFolderModal] = React.useState<boolean>(false);
  const [newFolderName, setnewFolderName] = React.useState("");
  const [selectedNewType, setSelectedNewType] = React.useState(null);
  const [selectedView, setSelectedView] = React.useState(
    window.localStorage.getItem("selectedView")
  );

  const api = useCatalogue();
  const picker = useCatalogueItemPicker();

  const handleSelectView = (value) => {
    setSelectedView(value);
    localStorage.setItem('selectedView', value);
  };


  React.useEffect(() => {
    setnewFolderName("");
  }, [newFolderModal]);

  const paths = React.useMemo(() => {
    const parts = [...String(api.path).split("/").filter(Boolean)];
    const paths: any[] = [];
    parts.reduce((acc, item) => {
      const r = `${acc}${item}/`;
      paths.push({
        fullPath: r.slice(0, r.length === 1 ? r.length : r.length - 1),
        folderName: item,
      });
      return r;
    }, "");

    return paths;
  }, [api.path]);

  const customTypes = React.useMemo(() => {
    const allowedTypeIds = api?.currentCustomType?.allowedChildCustomTypes;
    let result = api.namespace.typesArray;

    if (Array.isArray(allowedTypeIds)) {
      result = result.filter((type) => {
        // @ts-ignore
        return allowedTypeIds.indexOf(type.id) > -1;
      });
    }

    return result;
  }, [api.namespace.typesArray, api.currentCustomType]);

  const readUnauthorized = React.useMemo(() => {
    return api?.dirLoading === false && api?.claims?.read === false;
  }, [api?.claims?.read, api?.dirLoading]);

  const accessMode = React.useMemo(() => {
    if (api?.claims?.owner === true) {
      return "Owner";
    } else if (api?.claims?.write === true) {
      return "Write";
    } else if (api?.claims?.read === true) {
      return "Read";
    } else {
      return "No Access";
    }
  }, [api.claims]);

  if (readUnauthorized === true) {
    return (
      <div style={{ marginTop: 56 }}>
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={[
            (() => {
              if (api.initialPath) {
                return (
                  <Button
                    onClick={() => api.setPath(api.initialPath)}
                    key="reset"
                  >
                    Go back to initial path
                  </Button>
                );
              }
              return null;
            })(),
          ].filter(Boolean)}
        />
      </div>
    );
  }


  const GeneralItems = ((props) => {

    return (
      <Row justify="center" >
        <Col span={24}>
          <div>
            {customTypes
              .filter((type) => {
                if (type.id === "binary") {
                  return false;
                }
                return true;
              })
              .map((type) => (
                <NewItem
                  key={type.id}
                  item={type}
                  selected={type.id === selectedNewType}
                  onClick={() => setSelectedNewType((type as any).id)}
                />
              ))}
          </div>
        </Col>
      </Row>
    )
  })

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `All`,
      children: <GeneralItems />
    },
  ];


  return (
    <ViewAsContext.Provider value={selectedView}>
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header style={{ flexShrink: 0 }} className="second-header">
          <Row align="middle" style={{ width: "100%" }}>
            <Col flex={1}>
              <Breadcrumb separator=">">
                {api?.meta?.mode === "picker" ? (
                  <Breadcrumb.Item onClick={() => api.setPath(`/`)}>
                    Root
                  </Breadcrumb.Item>
                ) : null}
                {paths.map((p) => {
                  if (api?.meta?.mode === "picker") {
                    return (
                      <Breadcrumb.Item
                        key={p.folderName} 
                        onClick={() => api.setPath(`/${p.fullPath}`)}
                      >
                        {p.folderName}
                      </Breadcrumb.Item>
                    );
                  }
                  return (
                    <Breadcrumb.Item key={p.folderName}>
                      <Link to={api.getFullUrlFromPath(p.fullPath)}>
                        {p.folderName}
                      </Link>
                    </Breadcrumb.Item>
                  );
                })}
              </Breadcrumb>
              <p
                style={{
                  margin: 0,
                  lineHeight: "10px",
                  paddingTop: 4,
                  fontSize: 12,
                  color: "#adadad",
                }}
              >
                Access: {accessMode}
              </p>
            </Col>

            <Col>
              <span style={{ fontSize: 13, color: "#2C2C2C", marginRight: 10 }}>View as:</span>
              <Select value={selectedView} style={{ width: 108 }} className="view-type-select"
                onChange={handleSelectView}
                suffixIcon={<DownArrowOutlined style={{ color: "#000000" }} />}
              >
                <Option value="grid">
                  <GridOutlined /> Grid
                </Option>
                <Option value="list">
                  <ListOutlined /> List
                </Option>
                <Option value="table">
                  <ListOutlined /> Table
                </Option>
              </Select>
              {api.claims.write === true ? (
                <Space style={{ marginLeft: 15 }}>
                  <Dropdown
                    trigger={["click"]}
                    overlay={
                      <Menu
                        onClick={(e) => {
                          switch (e.key) {
                            case "paste": {
                              api
                                .moveItem(
                                  api.clipboard.meta.item.path,
                                  api.currentDir.path,
                                  api.findNextUniqueName(
                                    api.clipboard.meta.item.name
                                  )
                                )
                                .catch((e) => {
                                  message.error(
                                    e?.response?.data?.message
                                      ? e?.response?.data?.message
                                      : e.message
                                  );
                                });
                              break;
                            }
                            case "paste-shortcut": {
                              api
                                .createShortcut(
                                  api.clipboard.meta.item.path,
                                  api.currentDir.path,
                                  api.findNextUniqueName(
                                    api.clipboard.meta.item.name
                                  )
                                )
                                .catch((e) => {
                                  message.error(
                                    e?.response?.data?.message
                                      ? e?.response?.data?.message
                                      : e.message
                                  );
                                });
                              break;
                            }
                          }
                        }}
                      >
                        <Menu.Item
                          disabled={api?.clipboard?.action !== "cut"}
                          key="paste"
                        >
                          Paste
                        </Menu.Item>
                        <Menu.Item
                          disabled={api?.clipboard?.action !== "copy-shortcut"}
                          key="paste-shortcut"
                        >
                          Paste Shortcut
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button>
                      <MoreOutlined />
                    </Button>
                  </Dropdown>
                  <Button
                    onClick={() => setUploadModalVisible(true)}
                    type="default"
                    icon={<PlusOutlined />}
                  >
                    Upload Files
                  </Button>
                  <Button
                    onClick={() => setNewFolderModal(true)}
                    type={api?.meta?.mode === "picker" ? "default" : "primary"}
                    icon={<PlusOutlined />}
                  >
                    Create
                  </Button>
                  {api?.meta?.mode === "picker" ? (
                    <Button
                      disabled={api.selectedItems.length < 1}
                      onClick={() => {
                        if (picker) {
                          picker.settle({
                            items: api.selectedItems,
                          });
                        }
                      }}
                      type={"primary"}
                    >
                      Choose this file
                    </Button>
                  ) : null}
                </Space>
              ) : null}
            </Col>
          </Row>
        </Header>
        <Layout className={selectedView === "list" ? "content-wrapper-for-list-view" : "content-wrapper"} style={{ flex: 1 }}>
          <Content>
            <div className="content-header-for-list-view">
              <div style={{ minWidth: 300 }}>
                <span style={{ color: "#121212", fontSize: 13, fontFamily: "Almarose-Semibold" }}>Item</span>
              </div>
              <div>
                <span style={{ color: "#121212", fontSize: 13, fontFamily: "Almarose-Semibold" }}>Type</span>
              </div>
            </div>
            <div className="list-folder-wrapper">
              <api.namespaceUI.ItemGrid />
            </div>
          </Content>
        </Layout>
        <Drawer
          title="Upload files"
          open={uploadModalVisible}
          getContainer={false}
          onClose={() => setUploadModalVisible(false)}
        >
          <div style={{ height: "50%" }}>
            <Upload.Dragger
              action={`/___service/main/powerserver___upload-files?namespace=default&parentPath=${api.path}`}
              multiple={true}
              maxCount={30}
              onChange={(info) => {
                if (info.event?.percent === 100) {
                  api.refresh(true);
                }
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload
              </p>
            </Upload.Dragger>
          </div>
        </Drawer>
        <Modal
          className="add-new-item-modal"
          title="Create New Item"
          open={Boolean(newFolderModal)}
          onCancel={() => setNewFolderModal(false)}
          okText="Create"
          onOk={() => {
            if (!newFolderName) {
              message.error("Name must not be empty");
              return;
            }
            if (!selectedNewType) {
              message.error("Please select the type");
              return;
            }
            return api
              .createItem(newFolderName, selectedNewType, {})
              .then(() => {
                setNewFolderModal(false);
                return true;
              })
              .catch((e) =>
                message.error(
                  e?.response?.data?.message
                    ? e?.response?.data?.message
                    : e.message
                )
              );
          }}
          width={1080}
          footer={[
            <div className="modal-footer-wrapper">
              <span className="footer-text">Filename:</span>
              <Input value={newFolderName}
                onChange={(e) => setnewFolderName(e.currentTarget.value)}
                className="footer-input" placeholder="Enter filename" />
              <Button className="footer-add-btn" type="text" onClick={() => {
                if (!newFolderName) {
                  message.error("Name must not be empty");
                  return;
                }
                if (!selectedNewType) {
                  message.error("Please select the type");
                  return;
                }
                return api
                  .createItem(newFolderName, selectedNewType, {})
                  .then(() => {
                    setNewFolderModal(false);
                    return true;
                  })
                  .catch((e) =>
                    message.error(
                      e?.response?.data?.message
                        ? e?.response?.data?.message
                        : e.message
                    )
                  );
              }}>Add</Button>
            </div>
          ]}
        >
          <div className="add-new-item-modal-wrapper">
            <Tabs className="tab-wrapper" defaultActiveKey="1" tabPosition='left' items={items} />
          </div>
        </Modal>
      </div>
    </ViewAsContext.Provider>
  );
}
