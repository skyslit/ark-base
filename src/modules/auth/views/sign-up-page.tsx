import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/sign-up-page.scss';
import {
    Col,
    Row,
    Typography,
    Form,
    Button,
    Input,
    Divider,
    message,
} from "antd";
import SkyslitLogo from "../assets/images/skyslit.jpg";
import RecoveryImage from "../assets/images/recovery-image.png";
import { ArrowLeftOutlined, LoadingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Fade from "react-reveal/Fade";
import { Helmet } from "react-helmet-async";

export default createComponent((props) => {

    const [status, setStatus] = React.useState("registration");
    const { useService, useContext } = props.use(Frontend);
    const [verifyOtp, setVerifyOtp] = React.useState("");
    const [hash, setHash] = React.useState("");
    const [verifyemail, setVerifyEmail] = React.useState("");
    const [name, setName] = React.useState("");
    const context = useContext();
    const history = useHistory();


    const registrationService = useService({ serviceId: "registration-service" });

    const registration = (data) => {
        setVerifyEmail(data.email)
        setName(data.name)
        registrationService
            .invoke(
                {
                    email: data.email,
                },
                { force: true }
            )
            .then((res) => {
                setHash(res.data);
                setStatus("otp-verification")
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
                setStatus("register-service")
            })
            .catch((e) => {
            })
    }

    const registerUserService = useService({ serviceId: "register-user-service" });
    const registerUser = (data: any) => {
        registerUserService
            .invoke(
                {
                    name: name,
                    email: verifyemail,
                    otp: verifyOtp,
                    hash: hash,
                    password: data.password,
                },
                { force: true }
            )
            .then((res) => {
                history.push("/auth/login");
            })
            .catch((e) => {
            });
    };


    return (
        <>
            <Helmet>
                <title> Register | Account </title>
            </Helmet>
            <Fade duration={700}>
                <Row className="signup-page-row-wrapper">
                    <Col className="signup-page-col-wrapper">
                        {status === "registration" ? (
                            <div className="signup-page-wrapper">
                                <div className="signup-page-first-section">
                                    {/*  <img src={SkyslitLogo} style={{ width: 104 }} /> */}
                                    <Divider className="divider" />
                                    <div className="reset-password-text-div" >
                                        <Typography.Text className="register-password-text" >Register!</Typography.Text>
                                        <Typography.Text className="provide-section-text" >Provide your name,email id and a password</Typography.Text>
                                    </div>
                                    <div className="form-section" >
                                        <Form name="recovery" layout="vertical" onFinish={registration}>
                                            <Form.Item className="enter-name-formItem" name="name"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Please input your name!',
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Your Name" />
                                            </Form.Item>
                                            <Form.Item className="enter-email-formItem"
                                                name="email"
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
                                                <Input placeholder="johndoe@sample.com" />
                                            </Form.Item>
                                            <div style={{ color: "red", marginBottom: 15 }} >
                                                {registrationService.err ? registrationService.err.message : ""}
                                            </div>
                                        </Form>
                                    </div>
                                    <div className="next-btn-section">
                                        <Button form="recovery" htmlType="submit" className="next-button"
                                            disabled={registrationService.isLoading}>
                                            {registrationService.isLoading === true ? (
                                                <>
                                                    <LoadingOutlined style={{ marginRight: 5 }} />
                                                    Sending OTP...
                                                </>
                                            ) : (
                                                "Next"
                                            )}
                                        </Button>
                                    </div>
                                    <div className="login-btn-section">
                                        <Link to="/auth/login" className="login-button">Already a member? <b>Login</b> </Link>
                                    </div>
                                </div>

                                <div className="recovery-page-second-section">
                                    <img
                                        src={RecoveryImage}
                                        style={{ width: "100%", height: "100vh" }}
                                    />
                                </div>
                            </div>
                        ) : status === "otp-verification" ? (
                            <div className="register-state-wrapper">
                                <div className="register-state-first-section">
                                    {/*  <img src={SkyslitLogo} style={{ width: 104 }} /> */}
                                    <Divider className="divider" />
                                    <div className="back-btn-section">
                                        <button onClick={() => { setStatus("registration") }} className="otp-back-button">
                                            <ArrowLeftOutlined style={{ color: "#292929" }} />
                                        </button>
                                    </div>
                                    <div className="reset-password-text-div" >
                                        <Typography.Text className="reset-password-text" >Verify your email</Typography.Text>
                                    </div>
                                    <div className="form-section" >
                                        <span style={{ color: "#2F2F2F", fontSize: 14 }}>Enter the One-Time-Password (6-digit code) sent to <i>{verifyemail}</i></span>
                                        <Form name="recovery"
                                            layout="vertical"
                                            autoComplete="on"
                                            onFinish={otpVerification}
                                        >
                                            <Form.Item className="provide-email-text"
                                                name="otp">
                                                <Input autoComplete="off" type="number" placeholder="6-digit code" />
                                            </Form.Item>
                                            <div style={{ color: "red", marginBottom: 15 }} >
                                                {otpVerificationService.err ? otpVerificationService.err.message : ""}
                                            </div>
                                            <Form.Item className="reset-password-btn">
                                                <Button className="reset-button" type="primary"
                                                    htmlType="submit" disabled={otpVerificationService.isLoading}>
                                                    {otpVerificationService.isLoading === true ? (
                                                        <>
                                                            <LoadingOutlined style={{ marginRight: 5 }} />
                                                            Verifying OTP...
                                                        </>
                                                    ) : (
                                                        "Next"
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
                        ) : (
                            <div className="new-password-register-state-wrapper">
                                <div className="new-password-register-state-section">
                                    {/*   <img src={SkyslitLogo} style={{ width: 104 }} /> */}
                                    <Divider className="divider" />
                                    <div className="back-btn-section">
                                        <button onClick={() => { setStatus("otp-verification") }} className="password-back-button">                                        <ArrowLeftOutlined style={{ color: "#292929" }} />
                                        </button>
                                    </div>
                                    <div className="reset-password-text-div" >
                                        <Typography.Text className="reset-password-text">Create new password</Typography.Text>
                                    </div>
                                    <div className="form-section" >
                                        <Form name="create new password"
                                            name="basic"
                                            layout="vertical"
                                            initialValues={{ remember: true }}
                                            onFinish={registerUser}
                                        >
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
                                                <Input type="password" placeholder="Enter password" />
                                            </Form.Item>
                                            <Form.Item className="enter-email-formItem"
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
                                                <Input type="password" placeholder="Re-type password" />
                                            </Form.Item>
                                            <div style={{ color: "red", marginBottom: 15 }} >
                                                {registerUserService.err ? registerUserService.err.message : ""}
                                            </div>
                                            <span style={{ color: "#717171", fontSize: 12 }}>Passwords should have at least 8 characters including one uppercase character, one lowercase character & one number</span>
                                            <Form.Item className="reset-password-btn">
                                                <Button
                                                    className="reset-button" type="primary"
                                                    htmlType="submit" disabled={registerUserService.isLoading}>
                                                    {registerUserService.isLoading === true ? (
                                                        <>
                                                            <LoadingOutlined style={{ marginRight: 5 }} />
                                                            Registering...
                                                        </>
                                                    ) : (
                                                        "Register"
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
                        )}
                    </Col>
                </Row>
            </Fade>
        </>
    );
});