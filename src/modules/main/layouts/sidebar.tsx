import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import {
  Catalogue,
  useCataloguePath,
} from "@skyslit/ark-frontend/build/dynamics-v2";
import { Layout, Divider, Button, message, Modal, Drawer } from "antd";
import { EnterOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import "../layouts/sidebar.scss";
import { Link, useLocation } from "react-router-dom";
import {
  SiderFolderIcon,
  SiderAnalyticsChartIcon,
  SiderLeftChevronIcon,
  SiderSettingsIcon,
  SiderShortcutFolderIcon,
  HamburgerMenuIcon,
  SiderUsersIcon,
} from "../../auth/icons/global-icons";
import { Content } from "antd/lib/layout/layout";
import NoSSR from "../../auth/reusables/NoSSR";
const { Header, Sider } = Layout;

const SiderLayout = createComponent((props) => {
  const { useService, useContext, useFolder } = props.use(Frontend);

  const location = useLocation();
  const context = useContext();
  const { usePath, readFile } = useFolder();

  const [organisationDetails, setOrganisationDetails] = React.useState();

  const emailAddress = context?.response?.meta?.currentUser?.emailAddress;
  const emailSlug = React.useMemo(() => {
    return encodeURIComponent(
      String(emailAddress)
        .replace(/\W+(?!$)/g, "-")
        .toLowerCase()
        .replace(/\W$/, "")
    );
  }, [emailAddress]);

  const userDashboardItems = usePath(
    "user-dashboard-items-ref",
    `/users/${emailSlug}/dashboards`,
    {
      useRedux: true,
    }
  );

  const systemDashboardItems = usePath(
    "system-dashboard-items-ref",
    "/dashboards",
    {
      useRedux: true,
    }
  );

  const userQuicklinkItems = usePath(
    "user-quick-link-items-ref",
    `/users/${emailSlug}/quick-links`,
    {
      useRedux: true,
    }
  );

  const systemQuicklinkItems = usePath(
    "system-quick-link-items-ref",
    "/quick-links",
    {
      useRedux: true,
    }
  );

  const isUserSuperAdmin = React.useMemo(() => {
    if (context?.response?.meta?.currentUser) {
      try {
        return (
          context.response.meta.currentUser.policies.indexOf("SUPER_ADMIN") > -1
        );
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  }, [context?.response?.meta?.currentUser]);

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

  const [collapsed, setCollapsed] = React.useState(
    window.localStorage.getItem("collapsed")
  );
  const [visible, setVisible] = React.useState(false);

  const openSider = () => {
    setCollapsed("open");
    window.localStorage.setItem("collapsed", "open");
  };

  const closeSider = () => {
    setCollapsed("close");
    window.localStorage.setItem("collapsed", "close");
  };

  const toggleHamburgerDrawer = () => {
    setVisible(!visible);
  };

  React.useEffect(() => {
    readFile("/info").then((res) => {
      setOrganisationDetails(res.meta.content);
    });
  }, []);

  return (
    <>
      <Layout className="homepage-wrapper">
        <Header className="main-header">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              onClick={() => toggleHamburgerDrawer()}
              type="text"
              className="hamburger-menu-btn"
            >
              <HamburgerMenuIcon className="hamburger-icon" />
            </Button>
            <span style={{ color: "black", fontFamily: "Almarose-Bold" }}>
              {organisationDetails?.orgName}
            </span>
          </div>
          <div className="username-signout-btn-wrapper">
            <div className="username-role-wrapper">
              <span className="username-text">
                {context?.response?.meta?.currentUser?.name}
              </span>
              <span className="role-text">
                {context?.response?.meta?.currentUser?.emailAddress}
              </span>
            </div>
            <Divider className="header-custom-divider" type="vertical" />
            <div className="signout-btn-wrapper">
              <Button
                type="link"
                className="signout-btn"
                onClick={() => {
                  Modal.confirm({
                    maskClosable: true,
                    title: "Logout Confirmation",
                    content: " Are you sure you want to logout?",
                    okText: "Logout",
                    onOk: () => {
                      logoutUser();
                    },
                  });
                }}
              >
                <LogoutOutlined className="logout-antd-icon" />
                Sign Out
              </Button>
            </div>
          </div>
        </Header>
        <Layout>
          <Sider
            className={
              collapsed === "close"
                ? "sider-wrapper-collapsed"
                : "sider-wrapper"
            }
          >
            <div className="sider-content-wrapper">
              <div className="hamburger-button-wrapper">
                {collapsed === "close" ? (
                  <button
                    onClick={() => openSider()}
                    className="hamburger-button"
                  >
                    <SiderLeftChevronIcon
                      style={{
                        fontSize: 12,
                        display: "flex",
                        rotate: "180deg",
                      }}
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => closeSider()}
                    className="hamburger-button"
                  >
                    <SiderLeftChevronIcon
                      style={{ fontSize: 12, display: "flex" }}
                    />
                  </button>
                )}
              </div>
              {/* <span className="version-text">v1.0.1</span> */}
              <div className="top-content-section">
                {Array.isArray(userDashboardItems?.response?.items)
                  ? userDashboardItems?.response?.items.map((item) => {
                      return (
                        <div key={item.slug} className="button-wrapper">
                          <Link
                            type="text"
                            to={`/app/viewport${
                              item.destinationPath || item.path
                            }`}
                            className={`${
                              location.pathname ===
                              `/app/viewport${
                                item.destinationPath || item.path
                              }`
                                ? "selected-btn"
                                : "unselected-btn"
                            }`}
                          >
                            <SiderAnalyticsChartIcon style={{ fontSize: 18 }} />
                            <span className="btn-text">{item.name}</span>
                          </Link>
                        </div>
                      );
                    })
                  : null}
                {Array.isArray(systemDashboardItems?.response?.items)
                  ? systemDashboardItems?.response?.items.map((item) => {
                      return (
                        <div key={item.slug} className="button-wrapper">
                          <Link
                            type="text"
                            to={`/app/viewport${
                              item.destinationPath || item.path
                            }`}
                            className={`${
                              location.pathname ===
                              `/app/viewport${
                                item.destinationPath || item.path
                              }`
                                ? "selected-btn"
                                : "unselected-btn"
                            }`}
                          >
                            <SiderAnalyticsChartIcon style={{ fontSize: 18 }} />
                            <span className="btn-text">{item.name}</span>
                          </Link>
                        </div>
                      );
                    })
                  : null}
                {userDashboardItems?.response?.items.length > 0 ||
                systemDashboardItems?.response?.items.length > 0 ? (
                  <Divider />
                ) : null}
                {Array.isArray(userQuicklinkItems?.response?.items)
                  ? userQuicklinkItems?.response?.items.map((item) => {
                      return (
                        <div key={item.slug} className="button-wrapper">
                          <Link
                            type="text"
                            to={`/app/files${
                              item.destinationPath || item.path
                            }`}
                            className={`${
                              location.pathname ===
                              `/app/files${item.destinationPath || item.path}`
                                ? "selected-btn"
                                : "unselected-btn"
                            }`}
                          >
                            <SiderShortcutFolderIcon style={{ fontSize: 19 }} />
                            <span className="btn-text">{item.name}</span>
                          </Link>
                        </div>
                      );
                    })
                  : null}
                {Array.isArray(systemQuicklinkItems?.response?.items)
                  ? systemQuicklinkItems?.response?.items.map((item) => {
                      return (
                        <div key={item.slug} className="button-wrapper">
                          <Link
                            type="text"
                            to={`/app/files${
                              item.destinationPath || item.path
                            }`}
                            className={`${
                              location.pathname ===
                              `/app/files${item.destinationPath || item.path}`
                                ? "selected-btn"
                                : "unselected-btn"
                            }`}
                          >
                            <SiderShortcutFolderIcon style={{ fontSize: 19 }} />
                            <span className="btn-text">{item.name}</span>
                          </Link>
                        </div>
                      );
                    })
                  : null}
                {userQuicklinkItems?.response?.items?.length > 0 ||
                systemQuicklinkItems?.response?.items?.length > 0 ? (
                  <Divider />
                ) : null}
                <div className="button-wrapper">
                  <Link
                    type="text"
                    to="/app/users"
                    className={`${
                      location.pathname === "/app/users" ||
                      location.pathname.includes("/app/users") ||
                      location.pathname.includes("/app/groups")
                        ? "selected-btn"
                        : "unselected-btn"
                    }`}
                  >
                    <SiderUsersIcon style={{ fontSize: 18 }} />
                    <span className="btn-text">Users & Groups</span>
                  </Link>
                </div>
                {isUserSuperAdmin === true ? (
                  <>
                    <div className="button-wrapper">
                      <Link
                        type="text"
                        to="/app/files/info"
                        className={`${
                          location.pathname === "/app/files/info"
                            ? "selected-btn"
                            : "unselected-btn"
                        }`}
                      >
                        <SiderSettingsIcon style={{ fontSize: 18 }} />
                        <span className="btn-text">Settings</span>
                      </Link>
                    </div>
                  </>
                ) : null}
                {isUserSuperAdmin === true ? (
                  <>
                    <div className="button-wrapper">
                      <Link
                        type="text"
                        to="/app/files"
                        className={`${
                          location.pathname === "/app/files"
                            ? "selected-btn"
                            : "unselected-btn"
                        }`}
                      >
                        <SiderFolderIcon style={{ fontSize: 18 }} />
                        <span className="btn-text">File Manager</span>
                      </Link>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </Sider>
          <Content
            style={{ marginTop: 56 }}
            className={
              collapsed === "close"
                ? "sidebar-content-wrapper-collapsed"
                : "sidebar-content-wrapper"
            }
          >
            {props.children}
          </Content>
        </Layout>
      </Layout>

      <Drawer
        className="hamburger-drawer-whole-wrapper"
        placement="left"
        onClose={toggleHamburgerDrawer}
        closable={false}
        visible={visible}
        width={"100%"}
        bodyStyle={{
          background: "#F8F8F8",
          padding: "unset",
          justifyContent: "space-between",
          display: "flex",
          flexDirection: "column",
          paddingBottom: 26,
        }}
      >
        <div className="hamburger-drawer-content-wrapper">
          <div className="sider-content-wrapper">
            <div className="top-content-section">
              {Array.isArray(userDashboardItems?.response?.items)
                ? userDashboardItems?.response?.items.map((item) => {
                    return (
                      <div key={item.slug} className="button-wrapper">
                        <Link
                          type="text"
                          to={`/app/viewport${
                            item.destinationPath || item.path
                          }`}
                          className={`${
                            location.pathname ===
                            `/app/viewport${item.destinationPath || item.path}`
                              ? "selected-btn"
                              : "unselected-btn"
                          }`}
                        >
                          <SiderShortcutFolderIcon style={{ fontSize: 19 }} />
                          <span className="btn-text">{item.name}</span>
                        </Link>
                      </div>
                    );
                  })
                : null}
              <div className="button-wrapper">
                <Link
                  type="text"
                  to="/app/users"
                  className={`${
                    location.pathname === "/app/users" ||
                    location.pathname.includes("/app/users") ||
                    location.pathname.includes("/app/groups")
                      ? "selected-btn"
                      : "unselected-btn"
                  }`}
                >
                  <SiderSettingsIcon style={{ fontSize: 18 }} />
                  <span className="btn-text">Users & Groups</span>
                </Link>
              </div>
              {isUserSuperAdmin === true ? (
                <>
                  <Divider style={{ margin: "10px 0" }} />
                  <div className="button-wrapper">
                    <Link
                      type="text"
                      to="/app/files"
                      className={`${
                        location.pathname === "/app/files"
                          ? "selected-btn"
                          : "unselected-btn"
                      }`}
                    >
                      <SiderFolderIcon style={{ fontSize: 18 }} />
                      <span className="btn-text">File Manager</span>
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: 12,
            color: "#9F9F9F",
            fontFamily: "Almarose-Medium",
            paddingLeft: 24,
          }}
        >
          v1.0.1
        </span>
      </Drawer>
    </>
  );
});

export default createComponent((props) => {
  return (
    <NoSSR>
      <SiderLayout {...props} />
    </NoSSR>
  );
});
