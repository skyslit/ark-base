import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import "../styles/login-page.scss";
import { Col, Row, Typography, Form, Button, Input, message, Spin } from "antd";
import AuthenticationLogo from "../images/authentication-logo.png";
import RecoveryImage from "../assets/images/recovery-image.png";
import { useHistory, Link } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import Fade from "react-reveal/Fade";
import { Helmet } from "react-helmet-async";
import Favicon from "react-favicon";

export default createComponent((props) => {
  const { useService, useContext } = props.use(Frontend);
  const context = useContext();
  const history = useHistory();

  const adminValidationService = useService({ serviceId: "admin-validation" });

  const hasUserLoaded = React.useMemo(() => {
    return (
      adminValidationService.hasInitialized === true &&
      adminValidationService.isLoading === false
    );
  }, [adminValidationService.hasInitialized, adminValidationService.isLoading]);
  const adminValidation = (data: any) => {
    adminValidationService
      .invoke({}, { force: true })
      .then((res) => {
        {
          res.data.length === 0
            ? history.push("/create/admin")
            : history.push(`/auth/login${history.location.search}`);
        }
      })
      .catch(() => { });
  };
  const loginService = useService({ serviceId: "user-login-service" });
  const _login = (data: any) => {
    loginService
      .invoke(
        {
          email: data.email,
          password: data.password,
          search: location.search,
        },
        { force: true }
      )
      .then((res) => {
        if (res?.meta?.redirectUri) {
          window.location.replace(res?.meta?.redirectUri);
        } else {
          localStorage.removeItem('selectedTenant');
          context.invoke({}, { force: true });
          // history.push("/account/settings")
        }
      })
      .catch((e) => { });
  };

  React.useEffect(() => {
    adminValidation();
  }, []);

  const antIcon = (
    <LoadingOutlined style={{ fontSize: 30, color: "#4c91c9" }} spin />
  );
  if (hasUserLoaded === false) {
    return (
      <div
        style={{
          backgroundColor: "white",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin indicator={antIcon} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title> Login | Account </title>
      </Helmet>
      <Favicon iconSize={16} url={AuthenticationLogo} />
      <Fade duration={700}>
        <Row className="main-wrapper">
          <Col xs={24} sm={24} md={24} lg={12} xl={12} className="main-login">
            <div className="main-div">
              <div>
                <Form
                  className="main-form"
                  layout="vertical"
                  onFinish={_login}
                  name="email"
                >
                  <Typography.Text className="login-text">
                    Login
                  </Typography.Text>
                  <Typography className="sign-text">
                    Sign in to access this application
                  </Typography>
                  <Form.Item
                    name="email"
                    label="Your email"
                    rules={[
                      {
                        type: "email",
                        message: "The input is not valid E-mail!",
                      },
                      {
                        required: true,
                        message: "Please input your E-mail!",
                      },
                    ]}
                  >
                    <Input type="text" placeholder="Enter your email address" />
                  </Form.Item>
                  <Form.Item label="Your password" name="password">
                    <Input.Password
                      className="input"
                      placeholder="Enter your password"
                    />
                  </Form.Item>
                  <div style={{ color: "#D03535", height: 0, fontWeight: 500 }}>
                    {loginService.err ? loginService.err.message : ""}
                  </div>
                  {/* <div style={{ display: "flex", justifyContent: "end" }}>
                    <Link className="forgot-pass-btn" to="/account/recovery">
                      Forgot password?
                    </Link>
                  </div> */}
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={loginService.isLoading}
                    >
                      {loginService.isLoading === true ? (
                        <>Logging in ...</>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
              {/* <div
                className="dont-text"
                style={{ flexDirection: "row", display: "flex" }}
              >
                <Typography>Don’t have an account?</Typography>
                <Link to="/auth/account/register" className="register-link">
                  Register
                </Link>
              </div> */}
            </div>
          </Col>
          <Col className="main-right" xs={0} sm={0} md={0} lg={12} xl={12}>
            <img className="login-image" src={RecoveryImage} />
          </Col>
        </Row>
      </Fade>
    </>
  );
});