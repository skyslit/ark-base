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
} from "antd";
import { Folder } from "../icons/global-icons";
import { Link } from "react-router-dom";
import FileIcon from "../icons/file-icon.png";
import {
  PropetriesProvider,
  useProperties,
} from "@skyslit/ark-frontend/build/dynamics-v2";
import { CustomType } from "@skyslit/ark-frontend/build/dynamics-v2/core/controller";

const { TabPane } = Tabs;

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
            propertiesApi.saveChanges().then(() => handleCloseModal())
          }
        >
          Apply
        </Button>
      </div>
    </>
  );
}

export default (props: any) => {
  const { title, item, fullPath, onDelete, onRename } = props;
  const [contextMenuVisible, setContextMenuVisible] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [renameMode, setRenameMode] = React.useState(false);
  const [renameSource, setRenameSource] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);

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
    if (customType.id === "folder") {
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
        .catch((e) =>
          message.error(
            e?.response?.data?.message ? e.response.data.message : e.message
          )
        );
    },
    [onRename]
  );

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
                  break;
                }
                case "properties": {
                  setTimeout(() => {
                    handleOpenModal();
                  }, 300);
                  break;
                }
              }
            }}
          >
            <Menu.Item key="new-tab">Open in new tab</Menu.Item>
            <Menu.Item key="rename">Rename</Menu.Item>
            <Menu.Item key="delete">Delete</Menu.Item>
            <Menu.Item key="properties">Properties</Menu.Item>
          </Menu>
        }
        trigger={["contextMenu"]}
        placement={"bottomRight"}
      >
        <Link
          title={title}
          to={fullPath}
          className={`folder-wrapper ${
            contextMenuVisible || renameMode ? "menu-visible" : ""
          }`}
          style={{
            transform: renameMode ? "translateY(-16px)" : undefined,
            position: "relative",
          }}
        >
          {isRenaming ? (
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <Spin />
            </div>
          ) : null}
          <div
            style={{
              width: 100,
              height: 100,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon style={{ fontSize: 100, width: 100, height: 100 }} />
          </div>
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
                    document.execCommand("selectAll", false, undefined);
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
        </Link>
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

export const DefaultItemIcon = () => {
  return <img src={FileIcon} style={{ height: 50 }} className="file-icon" />;
};

export const FolderItemIcon = (props: any) => {
  return <Folder {...props} />;
};
