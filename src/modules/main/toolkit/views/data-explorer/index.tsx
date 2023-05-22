import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import { Catalogue } from "@skyslit/ark-frontend/build/dynamics-v2";
import { useParams } from "react-router-dom";
import { Layout, Divider, Button, message } from "antd";
import Folder from "./components/item";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import "./styles/index.scss";
import { Link, useLocation } from "react-router-dom";

const { Header, Sider } = Layout;

export const DataExplorerView = createComponent((props) => {
  const location = useLocation();

  const { useService, useContext } = props.use(Frontend);
  const context = useContext();

  const params = useParams<any>();

  const path = React.useMemo(() => {
    return `/${params?.dynamics_path || ""}`;
  }, [params?.dynamics_path]);

  const logoutService = useService({ serviceId: "user-logout" });
  const logoutUser = () => {
    logoutService
      .invoke()
      .then((res) => {})
      .catch((e) => {
        message.error("Try again!");
      })
      .finally(() => context.invoke(null, { force: true }));
  };

  const [collapsed, setCollapsed] = React.useState("open");

  const openSider = () => {
    setCollapsed("open");
  };

  const closeSider = () => {
    setCollapsed("close");
  };

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
            <span style={{ color: "#292929", fontSize: 14 }}>John Doe</span>
            <span style={{ color: "#6E6E6E", fontSize: 12 }}>Admin</span>
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
            <Button onClick={logoutUser} type="link">
              <LogoutOutlined />
              <span style={{ fontSize: 14, color: "#292929" }}>Sign Out</span>
            </Button>
          </div>
        </div>
      </Header>
      {/* <Layout>
        <Sider
          className={
            collapsed === "close" ? "sider-wrapper-collapsed" : "sider-wrapper"
          }
        >
          <div className="sider-content-wrapper">
            <div className="hamburger-button-wrapper">
              {collapsed === "close" ? (
                <button onClick={() => openSider()} className="hamburger-button">
                  <UserOutlined />
                </button>
              ) : (
                <button onClick={() => closeSider()} className="hamburger-button">
                  <UserOutlined />
                </button>
              )}
            </div>
            <div className="top-content-section">
              <div className="button-wrapper">
                <Link type="text"
                  to="/admin/dashboard"
                  className={`${location.pathname === "/admin/dashboard"
                    ? "selected-btn"
                    : "unselected-btn"
                    }`}
                >
                  <UserOutlined />
                  <span className="btn-text">Dashboard</span>
                </Link>
              </div>
              <div className="button-wrapper">
                <Link
                  type="text"
                  to="/admin/pipelines"
                  className={`${location.pathname === "/admin/pipelines"
                    ? "selected-btn"
                    : "unselected-btn"
                    }`}
                >
                  <UserOutlined />
                  <span className="btn-text">Pipeline Builder</span>
                </Link>
              </div>
            </div>
          </div>
        </Sider>
      </Layout> */}
      <Catalogue path={path} basePath="/admin" />
    </Layout>
  );
});
