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
} from "antd";
import { useCatalogue, useFile } from "@skyslit/ark-frontend/build/dynamics-v2";
import { Link } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import Item from "./views/data-explorer/components/item";
import {
  DefaultItemIcon,
  FolderItemIcon,
} from "./views/data-explorer/components/item";
import Editor from "./views/data-explorer/editor";

const { Header, Content } = Layout;
const { Panel } = Collapse;

export function GridView() {
  const api = useCatalogue();

  if (!Array.isArray(api.items)) {
    return <div>Loading items...</div>;
  }

  return (
    <div style={{ width: "100%" }}>
      {api.items.map((item) => {
        return (
          <Item
            key={item.slug}
            item={item}
            title={item.slug}
            fullPath={api.getFullUrlFromPath(item.path)}
            onDelete={() => api.deleteItems([item.path])}
            namespace={api.namespace}
            onRename={(newName: any) => api.renameItem(item.path, newName)}
          />
        );
      })}
    </div>
  );
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
  const [newFolderModal, setNewFolderModal] = React.useState<boolean>(false);
  const [newFolderName, setnewFolderName] = React.useState("");
  const [selectedNewType, setSelectedNewType] = React.useState(null);
  const api = useCatalogue();

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
    return api.namespace.typesArray;
  }, [api.namespace.typesArray]);

  const readUnauthorized = React.useMemo(() => {
    return api?.dirLoading === false && api?.claims?.read === false;
  }, [api?.claims?.read, api?.dirLoading]);

  if (readUnauthorized === true) {
    return (
      <div style={{ marginTop: 56 }}>
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
        />
      </div>
    );
  }

  return (
    <>
      <Header className="second-header">
        <Row align="middle" style={{ width: "100%" }}>
          <Col flex={1}>
            <Breadcrumb separator=">">
              <Breadcrumb.Item>
                <Link to={api.basePath}>
                  <HomeOutlined />
                </Link>
              </Breadcrumb.Item>
              {paths.map((p) => (
                <Breadcrumb.Item key={p.folderName}>
                  <Link to={api.getFullUrlFromPath(p.fullPath)}>
                    {p.folderName}
                  </Link>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </Col>
          <Col>
            <Button onClick={() => setNewFolderModal(true)} type="primary">
              + New
            </Button>
          </Col>
        </Row>
      </Header>
      <Layout className="content-wrapper">
        <Content>
          <div className="list-folder-wrapper">
            <api.namespaceUI.ItemGrid />
          </div>
        </Content>
      </Layout>
      <Modal
        title="Add new item"
        visible={Boolean(newFolderModal)}
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
        width={1000}
      >
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="General" key="1">
            <div>
              {customTypes.map((type) => (
                <NewItem
                  key={type.id}
                  item={type}
                  selected={type.id === selectedNewType}
                  onClick={() => setSelectedNewType(type.id)}
                />
              ))}
            </div>
          </Panel>
        </Collapse>
        <Divider />
        <label>Name</label>
        <Input
          placeholder="e.g. my item"
          value={newFolderName}
          onChange={(e) => setnewFolderName(e.currentTarget.value)}
        />
      </Modal>
    </>
  );
}
