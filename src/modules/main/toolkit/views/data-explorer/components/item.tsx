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
} from "antd";
import { Folder } from "../icons/global-icons";
import { Link } from "react-router-dom";
import FileIcon from "./../icons/file-icon.png";

const { TabPane } = Tabs;
const { Option } = Select;

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
                    document.execCommand("selectAll", false, null);
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
        visible={modalVisible}
        title={
          <span>
            <Folder /> New Folder
          </span>
        }
        onCancel={handleCloseModal}
        footer={[
          <div
            key="buttons"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button key="discard" onClick={handleCloseModal}>
              Discard
            </Button>
            <Button key="apply" type="primary">
              Apply
            </Button>
          </div>,
        ]}
      >
        <Tabs>
          <TabPane tab="Properties" key="properties">
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="textField">Text Field:</label>
              <Input
                id="textField"
                placeholder="Enter Text"
                style={{ marginTop: 10 }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="dropdown">Dropdown:</label>
              <Select
                placeholder="Select an option"
                style={{ width: "100%", marginTop: 10 }}
              >
                <Option value="option1">Option 1</Option>
                <Option value="option2">Option 2</Option>
                <Option value="option3">Option 3</Option>
              </Select>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="description">Long text:</label>
              <Input.TextArea
                placeholder="Description"
                rows={4}
                maxLength={133}
                style={{ marginTop: 10 }}
              />
            </div>
          </TabPane>

          <TabPane disabled tab="Permissions" key="permissions">
            {/* Permissions content goes here */}
          </TabPane>
          <TabPane disabled tab="Details" key="details">
            {/* Details content goes here */}
          </TabPane>
        </Tabs>
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
