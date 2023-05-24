import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import { Catalogue } from "@skyslit/ark-frontend/build/dynamics-v2";
import { Layout, Divider, Button, message, Modal } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import "../layouts/sidebar.scss";
import { Link, useLocation } from "react-router-dom";
import { SiderFolderIcon, SiderAnalyticsChartIcon, SiderLeftChevronIcon, SiderSettingsIcon } from "../../auth/icons/global-icons";
import { Content } from "antd/lib/layout/layout";
import NoSSR from "../../auth/reusables/NoSSR";
const { Header, Sider } = Layout;

const SiderLayout = createComponent((props) => {

    const location = useLocation();

    const { useService, useContext } = props.use(Frontend);
    const context = useContext();

    const [userDetails, setUserDetails] = React.useState([]);

    const listUserDetailsService = useService({ serviceId: "get-user-by-id" });
    const listUserDetails = () => {
        const userId = context.response.meta.currentUser._id;
        listUserDetailsService.invoke({
            userId
        }, { force: true })
            .then((res) => {
                setUserDetails(res.data[0])
            })
            .catch(() => {

            })
    }

    React.useEffect(() => {
        listUserDetails();
    }, []);

    const logoutService = useService({ serviceId: "user-logout" });
    const logoutUser = () => {
        logoutService
            .invoke()
            .then((res) => { })
            .catch((e) => {
                message.error("Try again!");
            })
            .finally(() => context.invoke(null, { force: true }));
    };

    const [collapsed, setCollapsed] = React.useState(
        window.localStorage.getItem("collapsed")
    );

    const openSider = () => {
        setCollapsed("open");
        window.localStorage.setItem("collapsed", "open");
    };

    const closeSider = () => {
        setCollapsed("close");
        window.localStorage.setItem("collapsed", "close");
    };

    return (
        <Layout className="homepage-wrapper">
            <Header className="main-header">
                <span style={{ color: "black", fontFamily: "Almarose-Bold" }}>Skyslit</span>
                <div className="username-signout-btn-wrapper">
                    <div className="username-role-wrapper">
                        <span className="username-text" >{userDetails?.name}</span>
                        <span className="role-text">{userDetails?.email}</span>
                    </div>
                    <Divider type="vertical" />
                    <div className="signout-btn-wrapper">
                        <Button type="link" className="signout-btn" onClick={() => {
                            Modal.confirm({
                                maskClosable: true,
                                title: 'Logout Confirmation',
                                content: ' Are you sure you want to logout?',
                                okText: "Logout",
                                onOk: () => {
                                    logoutUser()
                                }
                            })
                        }}>
                            <LogoutOutlined className="logout-antd-icon" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </Header>
            <Layout>
                <Sider
                    className={
                        collapsed === "close" ? "sider-wrapper-collapsed" : "sider-wrapper"
                    }
                >
                    <div className="sider-content-wrapper">
                        <div className="hamburger-button-wrapper">
                            {collapsed === "close" ? (
                                <button onClick={() => openSider()} className="hamburger-button">
                                    <SiderLeftChevronIcon style={{ fontSize: 12, display: "flex", rotate: "180deg" }} />
                                </button>
                            ) : (
                                <button onClick={() => closeSider()} className="hamburger-button">
                                    <SiderLeftChevronIcon style={{ fontSize: 12, display: "flex" }} />
                                </button>
                            )}
                        </div>
                        <span className="version-text">v1.0.1</span>
                        <div className="top-content-section">
                            <div className="button-wrapper">
                                <Link type="text"
                                    to="/admin/dashboard"
                                    className={`${location.pathname === "/admin/dashboard"
                                        ? "selected-btn"
                                        : "unselected-btn"
                                        }`}
                                >
                                    <SiderAnalyticsChartIcon style={{ fontSize: 18 }} />
                                    <span className="btn-text">Dashboard</span>
                                </Link>
                            </div>
                            <div className="button-wrapper">
                                <Link
                                    type="text"
                                    to="/admin/files"
                                    className={`${location.pathname === "/admin/files"
                                        ? "selected-btn"
                                        : "unselected-btn"
                                        }`}
                                >
                                    <SiderFolderIcon style={{ fontSize: 18 }} />
                                    <span className="btn-text">Files</span>
                                </Link>
                            </div>
                            <div className="button-wrapper">
                                <Link
                                    type="text"
                                    to="/admin/settings"
                                    className={`${location.pathname === "/admin/settings" || location.pathname.includes("/users") || location.pathname.includes("/groups")
                                        ? "selected-btn"
                                        : "unselected-btn"
                                        }`}
                                >
                                    <SiderSettingsIcon style={{ fontSize: 18 }} />
                                    <span className="btn-text">Settings</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Sider>
            </Layout>
            <Content style={{ marginLeft: collapsed === "close" ? 66 : 264 }}>
                {props.children}
            </Content>
        </Layout>
    );
});

export default createComponent((props) => {
    return (
        <NoSSR>
            <SiderLayout {...props} />
        </NoSSR>
    );
});
