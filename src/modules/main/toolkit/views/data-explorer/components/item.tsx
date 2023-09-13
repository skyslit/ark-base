import React from "react";
import {
  Typography,
  Dropdown,
  Button,
  Modal,
  Tabs,
  Input,
  Select,
  Menu,
  Spin,
  message,
  Divider,
  Table,
} from "antd";
import { Folder, Shortcut, FileIcon } from "../icons/global-icons";
import { Link } from "react-router-dom";
import {
  PropetriesProvider,
  useCatalogue,
  useProperties,
} from "@skyslit/ark-frontend/build/dynamics-v2";
import { CustomType } from "@skyslit/ark-frontend/build/dynamics-v2/core/controller";
import { EnterOutlined, PlusOutlined } from "@ant-design/icons";
import { ViewAsContext } from "../../../base";

const { TabPane } = Tabs;

const SecurityPolicy = () => {
  const propertiesApi = useProperties();

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (val, row, index) => {
        return (
          <Select
            style={{ width: "100%" }}
            value={val}
            onChange={(val) =>
              propertiesApi.cms.updateKey(
                `security.permissions.${index}.type`,
                val
              )
            }
          >
            <Select.Option value="user">User</Select.Option>
            <Select.Option value="policy">Policy</Select.Option>
            <Select.Option value="public">Public</Select.Option>
          </Select>
        );
      },
    },
    {
      title: "User",
      dataIndex: "userEmail",
      key: "userEmail",
      render: (val, row, index) => {
        if (row.type === "user") {
          return (
            <Input
              value={val}
              onChange={(e) =>
                propertiesApi.cms.updateKey(
                  `security.permissions.${index}.userEmail`,
                  e.currentTarget.value
                )
              }
            />
          );
        }

        return "N/A";
      },
    },
    {
      title: "Policy",
      dataIndex: "policy",
      key: "policy",
      render: (val, row, index) => {
        if (row.type === "policy") {
          return (
            <Input
              value={val}
              onChange={(e) =>
                propertiesApi.cms.updateKey(
                  `security.permissions.${index}.policy`,
                  e.currentTarget.value
                )
              }
            />
          );
        }

        return "N/A";
      },
    },
    {
      title: "Access",
      dataIndex: "access",
      key: "access",
      render: (val, row, index) => {
        return (
          <Select
            style={{ width: "100%" }}
            value={val}
            onChange={(val) =>
              propertiesApi.cms.updateKey(
                `security.permissions.${index}.access`,
                val
              )
            }
          >
            <Select.Option value="read">Read</Select.Option>
            <Select.Option value="write">Write</Select.Option>
            <Select.Option value="owner">Owner</Select.Option>
          </Select>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, __, i) => {
        return (
          <Button
            danger
            size="small"
            onClick={() => {
              Modal.confirm({
                title: "Remove Confirmation",
                okText: "Remove",
                okButtonProps: {
                  danger: true,
                },
                onOk: () => {
                  propertiesApi.cms.removeItemAt(`security.permissions`, i);
                },
              });
            }}
          >
            Remove
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <Button
          onClick={() =>
            propertiesApi.cms.pushItem(`security.permissions`, {
              type: "user",
              policy: "",
              userEmail: "",
              access: "read",
            })
          }
          style={{ padding: "unset", background: "transparent" }}
          className="secruity-add-btn"
          type="text"
        >
          <PlusOutlined style={{ fontSize: 16 }} />
        </Button>
      </div>
      <Table
        size="small"
        pagination={false}
        dataSource={(propertiesApi.cms.content as any).security.permissions}
        columns={columns}
      />
    </div>
  );
};

function PropertiesModal(props: {
  customType: CustomType;
  handleCloseModal: any;
}) {
  const propertiesApi = useProperties();
  const { customType, handleCloseModal } = props;

  const MetaEditor = React.useMemo(() => {
    if (customType?.metaEditor) {
      return customType.metaEditor;
    }

    return () => null;
  }, [customType]);

  return (
    <>
      <Tabs>
        <TabPane tab="Meta" key="meta">
          <MetaEditor />
        </TabPane>

        <TabPane tab="Security" key="security">
          <SecurityPolicy />
          {/* Permissions content goes here */}
        </TabPane>
      </Tabs>
      <Divider />
      <div
        key="buttons"
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: 18,
        }}
      >
        <Button onClick={handleCloseModal}>Discard</Button>
        <Button
          disabled={propertiesApi.cms.hasChanged === false}
          type="primary"
          onClick={() =>
            propertiesApi
              .saveChanges()
              .then(() => handleCloseModal())
              .catch((e) => {
                message.error(
                  e?.response?.data?.message
                    ? e?.response?.data?.message
                    : e.message
                );
              })
          }
        >
          Apply
        </Button>
      </div>
    </>
  );
}

export default (props: any) => {
  const { title, item, fullPath, onDelete, onRename, onCut, onCopyShortcut } =
    props;

  const { selected } = props;
  const api = useCatalogue();
  const [contextMenuVisible, setContextMenuVisible] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [renameMode, setRenameMode] = React.useState(false);
  const [renameSource, setRenameSource] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);

  const selectedView = React.useContext(ViewAsContext)


  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const customType = React.useMemo(() => {
    if (item?.type) {
      return props.namespace.types[item.type] || null;
    }

    return null;
  }, [item?.type]);


  const Icon = React.useMemo(() => {
    if (customType?.id === "folder") {
      return FolderItemIcon;
    }

    if (customType?.icon) {
      return customType.icon;
    }

    return DefaultItemIcon;
  }, [customType]);

  const rename = React.useCallback(
    (val) => {
      setIsRenaming(true);
      onRename(val)
        .then((res) => {
          setIsRenaming(false);
          setRenameMode(false);
        })
        .catch((e) => {
          setIsRenaming(false);
          setRenameMode(false);
          message.error(
            e?.response?.data?.message ? e.response.data.message : e.message
          );
        });
    },
    [onRename]
  );

  const isSymLink = React.useMemo(() => {
    if (item?.isSymLink === true) {
      return true;
    }

    return false;
  }, [item]);


  return (
    <>
      <Dropdown
        onVisibleChange={setContextMenuVisible}
        visible={contextMenuVisible}
        overlayClassName="folder-options"
        overlay={
          <Menu
            onClick={(e) => {
              setContextMenuVisible(false);
              switch (e.key) {
                case "new-tab": {
                  globalThis.window.open(fullPath, "_blank");
                  break;
                }
                case "delete": {
                  Modal.confirm({
                    title: `Do you want to delete the item '${item.name}'?`,
                    okText: "Delete",
                    okButtonProps: {
                      danger: true,
                    },
                    onOk: onDelete,
                  });
                  break;
                }
                case "rename": {
                  setIsRenaming(false);
                  setRenameMode(true);
                  setRenameSource(item.name);
                  document.execCommand("selectAll", false, undefined);
                  break;
                }
                case "properties": {
                  setTimeout(() => {
                    handleOpenModal();
                  }, 300);
                  break;
                }
                case "cut": {
                  onCut();
                  break;
                }
                case "copy-shortcut": {
                  onCopyShortcut();
                  break;
                }
              }
            }}
          >
            {api?.meta?.mode === "picker" ? null : (
              <Menu.Item key="new-tab">Open in new tab</Menu.Item>
            )}
            <Menu.Item key="rename">Rename</Menu.Item>
            <Menu.Item key="delete">Delete</Menu.Item>
            {api?.meta?.mode === "picker" ? null : (
              <>
                <Menu.Item key="properties" disabled={item?.isSymLink === true}>
                  Properties
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="cut">Cut</Menu.Item>
                <Menu.Item
                  key="copy-shortcut"
                  disabled={item?.isSymLink === true}
                >
                  Copy Shortcut
                </Menu.Item>
              </>
            )}
          </Menu>
        }
        trigger={["contextMenu"]}
        placement={"bottomRight"}
      >
        <div
          className={`${selectedView === "list" ? "folder-whole-wrapper-for-list-view" : "folder-whole-wrapper"}  ${contextMenuVisible || renameMode ? "menu-visible" : ""
            } ${selected === true ? "selected" : ""} `}
          onDoubleClick={() => {
            props.onDoubleClick && props.onDoubleClick(fullPath);
          }}
          onClick={props.onClick}
          style={{
            transform: renameMode ? "translateY(-16px)" : undefined,
            position: "relative",
          }}
        >
          <div
            title={title}
            // to={fullPath}
            className="folder-wrapper-for-list-view"
          >
            {isRenaming ? (
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <Spin />
              </div>
            ) : null}
            <div
              className="item-wrapper">
              <Icon
                className="folder-icon"
                // style={{ fontSize: 100, width: 100, height: 100 }}
                item={item}
              />
            </div>
            {isSymLink === true ? (
              <div
                style={{
                  position: "absolute",
                  bottom: 30,
                  right: 25,
                  color: "black",
                  fontSize: 20,
                }}
              >
                <Shortcut />
              </div>
            ) : null}
            {renameMode === true ? (
              <div style={{ width: "100px", position: "relative" }}>
                <div
                  onKeyDown={(e) => {
                    switch (e.key) {
                      case "Enter": {
                        e.preventDefault();
                        rename(e.currentTarget.innerText);
                        break;
                      }
                      case "Escape": {
                        setIsRenaming(false);
                        setRenameMode(false);
                        break;
                      }
                    }
                  }}
                  ref={(e) => {
                    if (e?.focus) {
                      e.focus();
                    }
                  }}
                  contentEditable={isRenaming === false}
                  onBlur={(e) => {
                    rename(e.currentTarget.innerText);
                  }}
                  style={{
                    textAlign: "center",
                    position: "absolute",
                    top: 0,
                    left: -28,
                    right: -28,
                    background: "#f5f5f5",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  {item.name}
                </div>
              </div>
            ) : (
              <Typography.Text ellipsis={true}>{item.name}</Typography.Text>
            )}

          </div>
          <div className="type-for-list-view">
            <span>{item.type}</span>
          </div>
        </div>
      </Dropdown>
      <Modal
        bodyStyle={{ padding: "0px 18px" }}
        visible={modalVisible}
        title={
          <span
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span>
              <Icon style={{ fontSize: 25, width: 25, height: 25 }} />
            </span>
            <span style={{ marginLeft: 8 }}>{item.name}</span>
          </span>
        }
        onCancel={handleCloseModal}
        destroyOnClose={true}
        footer={null}
      >
        <PropetriesProvider item={item}>
          <PropertiesModal
            customType={customType}
            handleCloseModal={handleCloseModal}
          />
        </PropetriesProvider>
      </Modal>
    </>
  );
};

export const DefaultItemIcon = (props: any) => {
  return <FileIcon {...props} />;
};

export const FolderItemIcon = (props: any) => {
  return <Folder {...props} />;
};
