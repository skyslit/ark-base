import React from "react";
import { createComponent } from "@skyslit/ark-frontend";
import { Catalogue } from "@skyslit/ark-frontend/build/dynamics-v2";
import { useParams } from "react-router-dom";
import { Layout, Divider, Button } from "antd";
import Folder from "./components/item";
import { LogoutOutlined } from "@ant-design/icons";
import "./styles/index.scss";

const { Header } = Layout;

export const DataExplorerView = createComponent(() => {
  const params = useParams<any>();

  const path = React.useMemo(() => {
    return `/${params?.dynamics_path || ""}`;
  }, [params?.dynamics_path]);

  return (
    <Layout className="homepage-wrapper">
      <Header className="main-header">
        <span style={{ color: "white", fontWeight: "bold" }}>Skyslit</span>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingRight: 10,
              alignItems: "end",
            }}
          >
            <span style={{ color: "#FFFFFF", fontSize: 14 }}>John Doe</span>
            <span style={{ color: "#CCACED", fontSize: 12 }}>Admin</span>
          </div>
          <Divider type="vertical" />
          <div
            style={{
              paddingLeft: 10,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Button type="link">
              <LogoutOutlined />
              <span style={{ fontSize: 14 }}>Sign Out</span>
            </Button>
          </div>
        </div>
      </Header>
      <Catalogue path={path} basePath="/admin" />
    </Layout>
  );
});
