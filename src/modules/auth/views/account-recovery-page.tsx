import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/account-recovery-page.scss';
import {
  Col,
  Row,
  Typography,
  Form,
  Button,
  Input,
  Divider,
  message
} from "antd";
import { ArrowLeftOutlined, LoadingOutlined } from "@ant-design/icons";
import SkyslitLogo from "../assets/images/skyslit.jpg";
import RecoveryImage from "../assets/images/recovery-image.png";
import RecoveryTick from "../images/recovery-success-tick.png";
import Fade from "react-reveal/Fade";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default createComponent((props) => {

  const formRef = React.useRef();
  const { useService } = props.use(Frontend);
  const [step, setStep] = React.useState("personal-info");
  const [verifyOtp, setVerifyOtp] = React.useState("");
  const [hash, setHash] = React.useState("");
  const [verifyemail, setVerifyEmail] = React.useState("");
  const [emailDisabled, setEmailDisabled] = React.useState(true);
  const [otpDisabled, setOtpDisabled] = React.useState(true);
  const [passwordDisabled, setPasswordDisabled] = React.useState(true);

  const sendCodeService = useService({ serviceId: "send-code" });
  const sendCode = (data) => {
    setVerifyEmail(data.email)
    sendCodeService
      .invoke(
        {
          email: data.email,
        },
        { force: true }
      )
      .then((res) => {
        setHash(res.data);
        setStep("send-code")
      })
      .catch((e) => {
      });
  };

  const otpVerificationService = useService({ serviceId: "otp-verification" });
  const otpVerification = (data) => {
    setVerifyOtp(data.otp)
    otpVerificationService
      .invoke(
        {
          otp: data.otp,
          hash: hash
        },
        { force: true })
      .then((res) => {
        setStep("create-new-password")
      })
      .catch((e) => {
      })
  }

  const updatePasswordService = useService({ serviceId: "update-password" });
  const updatePassword = (data: any) => {
    updatePasswordService
      .invoke(
        {
          email: verifyemail,
          otp: verifyOtp,
          hash: hash,
          password: data.password,
        },
        { force: true }
      )
      .then((res) => {
        setStep("recovery-success")
      })
      .catch((e) => {
        message.error(e.message);
      });
  };


  let currentView: any = null;
  switch (step) {
    case "personal-info": {
      currentView = (
        <div className="recovery-page-wrapper">
          <div className="recovery-page-first-section">
            {/*  <img src={SkyslitLogo} style={{ width: 104 }} /> */}
            <Divider className="divider" />
            <div className="back-btn-section">
              <Link
                to={`/auth/login`}
                style={{ cursor: "pointer", background: "none", border: "none" }}>
                <ArrowLeftOutlined style={{ color: "#292929" }} />
              </Link>
            </div>
            <div className="reset-password-text-div" >
              <Typography.Text className="reset-password-text" >Reset your password</Typography.Text>
            </div>
            <div className="recovery-form-section" >
              <Form name="recovery" onFinish={sendCode} layout="vertical" ref={formRef as any}
                onValuesChange={(changedFields, allFields) => {
                  if (
                    allFields.email !== "" &&
                    allFields.email !== undefined
                  ) {
                    setEmailDisabled(false);
                  } else {
                    setEmailDisabled(true);
                  }
                }}
              >
                <Form.Item className="provide-email-text"
                  name="email"
                  label="Provide your email that you used to sign into this account"
                  rules={[
                    {
                      type: 'email',
                      message: 'The input is not valid E-mail!',
                    },
                  ]}
                >
                  <Input placeholder="johndoe@sample.com" />
                </Form.Item>
                <div style={{ color: "#D03535", height: 0, fontWeight: 500 }} >
                  {sendCodeService.err ? sendCodeService.err.message : ""}
                </div>
                <Form.Item className="reset-password-btn">
                  <Button className="reset-button" htmlType="submit" type="primary"
                    disabled={sendCodeService.isLoading || emailDisabled}>
                    {sendCodeService.isLoading === true ? (
                      <>
                        <LoadingOutlined style={{ marginRight: 5 }} />
                        Sending OTP...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
          <div className="recovery-page-second-section">
            <img
              src={RecoveryImage}
              style={{ width: "100%", height: "100vh" }}
            />
          </div>
        </div>
      );
      break;
    }
    case "send-code": {
      currentView = (
        <div className="verification-state-wrapper">
          <div className="verification-state-first-section">
            {/*  <img src={SkyslitLogo} style={{ width: 104 }} /> */}
            <Divider className="divider" />
            <div className="back-btn-section">
              <Button
                style={{ cursor: "pointer", background: "none", border: "none", padding: "unset" }}
                onClick={() => setStep("personal-info")}
              >
                <ArrowLeftOutlined style={{ color: "#292929" }} />
              </Button>
            </div>
            <div className="reset-password-text-div" >
              <Typography.Text className="reset-password-text" >Verify your email</Typography.Text>
            </div>
            <div className="reset-form-section" >
              <span style={{ color: "#2F2F2F", fontSize: 14 }}>Enter the One-Time-Password (6-digit code) sent to <i>{verifyemail}</i></span>
              <Form name="recovery"
                layout="vertical"
                ref={formRef as any}
                onFinish={otpVerification}
                autoComplete="on"
                onValuesChange={(changedFields, allFields) => {
                  if (
                    allFields.otp !== "" &&
                    allFields.otp !== undefined
                  ) {
                    setOtpDisabled(false);
                  } else {
                    setOtpDisabled(true);
                  }
                }}
              >
                <Form.Item className="provide-email-text"
                  name="otp">
                  <Input autoComplete="off" type="number" placeholder="6-digit code" />
                </Form.Item>
                <div style={{ color: "red", transition: "color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)" }} >
                  {otpVerificationService.err ? otpVerificationService.err.message : ""}
                </div>
                <Form.Item className="reset-password-btn">
                  <Button className="reset-button" type="primary"
                    htmlType="submit" disabled={otpVerificationService.isLoading || otpDisabled}>
                    {otpVerificationService.isLoading === true ? (
                      <>
                        <LoadingOutlined style={{ marginRight: 5 }} />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
          <div className="recovery-page-second-section">
            <img
              src={RecoveryImage}
              style={{ width: "100%", height: "100vh" }}
            />
          </div>
        </div>
      );
      break;
    }
    case "create-new-password": {
      currentView = (
        <div className="new-password-state-wrapper">
          <div className="new-password-state-section">
            {/*   <img src={SkyslitLogo} style={{ width: 104 }} /> */}
            <Divider className="divider" />
            <div className="back-btn-section">
              <Link
                to={`/auth/login`}
                style={{ cursor: "pointer", background: "none", border: "none" }}>
                <ArrowLeftOutlined style={{ color: "#292929" }} />
              </Link>
            </div>
            <div className="reset-password-text-div" >
              <Typography.Text className="reset-password-text">Create new password</Typography.Text>
            </div>
            <div className="form-section" >
              <Form name="create new password"
                name="basic"
                onFinish={updatePassword}
                layout="vertical"
                initialValues={{ remember: true }}
                ref={formRef as any}
                onValuesChange={(changedFields, allFields) => {
                  if (
                    allFields.password !== "" &&
                    allFields.password !== undefined,
                    allFields.confirmPassword !== "" &&
                    allFields.confirmPassword !== undefined
                  ) {
                    setPasswordDisabled(false);
                  } else {
                    setPasswordDisabled(true);
                  }
                }}>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                    {
                      min: 8,
                      message: "The password you entered dosen't meet the criteria",
                    }
                  ]}
                  className="provide-password-text"
                >
                  <Input.Password className="password-input" disabled={updatePasswordService.isLoading} placeholder="Enter password" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  rules={[
                    { required: true, message: "Confirm new password" },
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
                  className="provide-retype-password-text">
                  <Input.Password className="password-input" disabled={updatePasswordService.isLoading} placeholder="Re-type password" />
                </Form.Item>
                <span style={{ color: "#717171", fontSize: 12 }}>Passwords should have at least 8 characters including one uppercase character, one lowercase character & one number</span>
                <Form.Item className="reset-password-btn">
                  <Button disabled={updatePasswordService.isLoading || passwordDisabled}
                    className="reset-button" type="primary"
                    htmlType="submit">
                    {updatePasswordService.isLoading === true ? (
                      <>
                        <LoadingOutlined style={{ marginRight: 5 }} />
                        Updating...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
          <div className="recovery-page-second-section">
            <img
              src={RecoveryImage}
              style={{ width: "100%", height: "100vh" }}
            />
          </div>
        </div>
      );
      break;
    }
    case "recovery-success": {
      currentView = (
        <div className="recovery-success-wrapper">
          <div className="recovery-success-state-section">
            {/* <img src={SkyslitLogo} style={{ width: 104 }} /> */}
            <Divider className="divider" />
            <div className="recovery-success-center-wrapper" >
              <div className="img-section" >
                <img src={RecoveryTick}></img>
              </div>
              <Typography.Text className="password-heading">You’re password has been changed successfully</Typography.Text>
              <div className="back-to-login-btn-section">
                <Link
                  className="back-to-login-btn"
                  to={`/auth/login`}>Back to login</Link>
              </div>
            </div>
          </div>
          <div className="recovery-page-second-section">
            <img
              src={RecoveryImage}
              style={{ width: "100%", height: "100vh" }}
            />
          </div>
        </div>
      );
      break;
    }
    default: {
      currentView = null;
    }
  }

  return (
    <>
      <Helmet>
        <title> Recovery | Account </title>
      </Helmet>
      <Fade duration={700}>
        <div>
          <Row>
            <Col span={24}>
              {currentView}
            </Col>
          </Row>
        </div>
      </Fade>
    </>
  );
});
