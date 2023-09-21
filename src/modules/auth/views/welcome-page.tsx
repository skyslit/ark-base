import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import "../styles/login-page.scss";
import { Col, Row, Typography, Form, Button, Input, message, Card, Modal } from "antd";
import { useParams, useHistory } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";

export default createComponent((props) => {
    const { useService, useContext, useFolder } = props.use(Frontend);

    const logoutService = useService({ serviceId: "user-logout" });

    const context = useContext()
    const history = useHistory()

    const logoutUser = () => {
        logoutService
            .invoke()
            .then((res) => { })
            .catch((e) => {
                message.error("Try again!");
            })
            .finally(() => context.invoke(null, { force: true }));
    };

    // React.useEffect(() => {
    //     localStorage.removeItem('selectedTenant');
    // }, [])
    return (
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <h2>This is your homepage</h2>
            {context?.response?.meta?.currentUser ? (
                <>
                <div>
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
                                    localStorage.removeItem('selectedTenant');
                                    logoutUser();
                                },
                            });
                        }}
                    >
                        <LogoutOutlined className="logout-antd-icon" />
                        Sign Out
                    </Button>
                </div>
                <div><Button type="link" onClick={()=>{history.push("/account-settings")}}>Go to account settings</Button></div>
                </>
            ) : null}
        </div>
    );
});