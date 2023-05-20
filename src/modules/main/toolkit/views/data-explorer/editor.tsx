import React from "react";
import { Layout, Row, Col, Input, Button } from "antd";
import FileIcon from "./icons/file-icon.png";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./styles/editor.scss";
import { useCatalogue, useFile } from "@skyslit/ark-frontend/build/dynamics-v2";
import { DefaultItemIcon, FolderItemIcon } from "./components/item";
import { Link } from "react-router-dom";

export default (props: any) => {
  const api = useCatalogue();
  const file = useFile();

  const Icon = React.useMemo(() => {
    if (api.currentCustomType?.icon) {
      return api.currentCustomType.icon;
    }

    return DefaultItemIcon;
  }, [api.currentCustomType]);

  return (
    <>
      <Layout.Header className="file-editor-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link to={api.getFullUrlFromPath(api?.currentDir?.parentPath)}>
            <ArrowLeftOutlined />
          </Link>
          <div style={{ marginLeft: 5 }}>
            <Icon style={{ fontSize: 25, width: 25, height: 25 }} />
          </div>
          <h5>{api?.currentDir?.name}</h5>
        </div>
        <div>
          <Button
            disabled={file.cms.hasChanged === false || file.loading}
            loading={file.loading}
            onClick={file.saveChanges}
            type="primary"
          >
            Save changes
          </Button>
        </div>
      </Layout.Header>
      {/* <Row className="file-editor-wrapper" justify="center">
                <Col span={12}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <h2>File</h2>
                        <label>Textfield</label>
                        <Input placeholder="Enter text" />
                        <label>Long Textfield</label>
                        <Input.TextArea
                            style={{ margin: "unset", marginTop: 10 }}
                            placeholder="Enter Text"
                            rows={4}
                            maxLength={133}
                        />
                    </div>
                </Col>
            </Row> */}
      {props.children}
    </>
  );
};
