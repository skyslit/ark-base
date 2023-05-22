import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import { Col, Row, Typography, Form, Button, Input, message, Spin } from "antd";
import '../styles/admin-page.scss';
import Lottie from "react-lottie";
import AbstractBlue from "../assets/lottie-files/abstract-blue-and-yellow.json";
import { useHistory } from "react-router-dom";
import { LoadingOutlined } from '@ant-design/icons';
import { Helmet } from "react-helmet-async";
import Fade from "react-reveal/Fade";

export default createComponent((props) => {
  const formRef = React.useRef();
  const history = useHistory();
  const { useService } = props.use(Frontend);

  const addAdminAccountService = useService({ serviceId: "add-admin-account" });
  const addAdminAccount = (data: any) => {
    addAdminAccountService.invoke({
      email: data.email,
      password: data.password
    }, { force: true })
      .then((res) => {
        (formRef.current as any).resetFields();
        history.push("/auth/login");
      })
      .catch((e) => {
        message.error(e.message);
      })
  }


  const adminValidationService = useService({ serviceId: "admin-validation" });

  const hasUserLoaded = React.useMemo(() => {
    return adminValidationService.hasInitialized === true && adminValidationService.isLoading === false;
  }, [
    adminValidationService.hasInitialized,
    adminValidationService.isLoading,
  ]);
  const adminValidation = (data: any) => {
    adminValidationService.invoke(
      {
      },
      { force: true })
      .then((res) => {
        { res.data.length === 0 ? history.push("/create/admin") : history.push("/auth/login") }
      })
      .catch(() => {
      })
  }

  React.useEffect(() => {
    adminValidation()
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
        <title> Create | Admin </title>
      </Helmet>
      <Fade duration={700}>
        <div style={{ backgroundColor: "#232329", height: "100vh" }}>
          <Row style={{ height: "100%" }}>
            <Col span={24}>
              <div className="Super-admin-setup">
                <div className="Super-admin-setup-title">
                  <div className="Super-admin-setup-header">
                    <Typography className="admin-text">
                      Hi, there! Welcome to your application.
                    </Typography>
                  </div>
                </div>
                <div className="Super-admin-setup-login-content">
                  <div className="login-content">
                    <div className="content">
                      <div className="sub-content">
                        <div className="anmi-sm">
                          <Lottie
                            options={{
                              loop: true,
                              autoplay: true,
                              animationData: AbstractBlue,
                            }}
                            height={175}
                            width={190}
                          />
                        </div>
                        <div className="anmi-lg">
                          <Lottie
                            options={{
                              loop: true,
                              autoplay: true,
                              animationData: AbstractBlue,
                            }}
                            height={245}
                            width={273}
                          />
                        </div>
                      </div>
                      <div className="sub-content2">
                        <Typography className="text1">
                          Set up your application
                        </Typography>
                        <Typography className="text2">
                          Create a super admin account
                        </Typography>
                        <Typography className="text3">
                          This account can use the entire application without any
                          restrictions.
                        </Typography>
                      </div>
                    </div>
                    <div className="form-content">
                      <Form layout="vertical" name="add-account" onFinish={addAdminAccount} ref={formRef as any}>
                        <div className="admin-form">
                          <div className="form-items">
                            <Form.Item label="Email" name="email"
                              rules={[
                                {
                                  type: 'email',
                                  message: 'The input is not valid E-mail!',
                                },
                                {
                                  required: true,
                                  message: 'Please input your E-mail!',
                                },
                              ]}>
                              <Input disabled={addAdminAccountService.isLoading} className="input" placeholder="Email" />
                            </Form.Item>
                            <Form.Item label="Password" name="password"
                              rules={[
                                { required: true, message: "Please input your password!" },
                                {
                                  pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,100}$/,
                                  min: 8,
                                  message: "The password you entered dosen't meet the criteria",
                                }
                              ]}>
                              <Input.Password
                                className="input"
                                placeholder="Password"
                                style={{ color: "#FFFFFF" }}
                                disabled={addAdminAccountService.isLoading}
                              />
                            </Form.Item>
                            <Form.Item
                              label="Retype Password"
                              name="confirm-password"
                              rules={[
                                {
                                  required: true,
                                  message: "Please confirm your password",
                                },
                                ({ getFieldValue }) => ({
                                  validator(rule, value) {
                                    if (!value || getFieldValue("password") === value) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject(
                                      new Error(
                                        "The two passwords that you entered do not match!"
                                      )
                                    );
                                  },
                                }),
                              ]}
                            >
                              <Input.Password
                                className="input"
                                placeholder="Confirm password"
                                style={{ color: "#FFFFFF" }}
                              />
                            </Form.Item>
                          </div>
                          <>
                            <p style={{ color: "grey", marginBottom: "4em" }}> Passwords must have at least eight digits with one lowercase character, one uppercase character and one number</p>
                          </>
                          <div className="admin-create-button">
                            <Form.Item>
                              <Button type="primary" className="create-button" htmlType="submit" disabled={addAdminAccountService.isLoading}>
                                {addAdminAccountService.isLoading === true ? (
                                  <>
                                    Creating...
                                  </>
                                ) : (
                                  "Create account"
                                )}
                              </Button>
                            </Form.Item>
                          </div>
                        </div>
                      </Form>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Fade>
    </>
  );
});
