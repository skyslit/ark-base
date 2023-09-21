import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import "../styles/login-page.scss";
import { Col, Row, Typography, Form, Button, Input, message, Card, Spin } from "antd";
import { useParams, useHistory } from "react-router-dom";
import { LeftArrowIcon } from "../icons/global-icons";
import { LoadingOutlined } from "@ant-design/icons";


export default createComponent((props) => {
    const { useService, useContext, useFolder } = props.use(Frontend);
    const context = useContext();
    const history = useHistory()

    const CheckForExistingEmailService = useService({ serviceId: "check-for-existing-email" });
    const loginService = useService({ serviceId: "user-login-v2-service" });
    const signupService = useService({ serviceId: "user-signup-v2" });
    const adminValidationService = useService({ serviceId: "admin-validation" });

    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [currentState, setCurrentState] = React.useState('default')
    const [isEmailValidated, seIsEmailValidated] = React.useState(true)

    const params: any = useParams()
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;
    const capitalLetterRegex = /[A-Z]/;


    const CheckForExistingEmail = React.useCallback(() => {
        CheckForExistingEmailService
            .invoke({
                email
            }, { force: true })
            .then((res) => {
                if (res.data === true) {
                    setCurrentState("login")
                } else {
                    setCurrentState("signUp")
                }
            })
            .catch((e) => {
            });
    }, [email]);

    const _login = () => {
        loginService
            .invoke(
                {
                    email,
                    password,
                    search: location.search,
                },
                { force: true }
            )
            .then((res) => {
                if (res?.meta?.redirectUri) {
                    window.location.replace(res?.meta?.redirectUri);
                } else {
                    localStorage.removeItem('selectedTenant');
                    window.location.reload()
                    context.invoke({}, { force: true });
                    // history.push("/account/settings")
                }
            })
            .catch((e) => {
                message.error(e.message)
            });
    };

    const signUp = (data: any) => {
        signupService
            .invoke(
                {
                    email,
                    password,
                },
                { force: true }
            )
            .then((res) => {
                _login()
            })
            .catch((e) => { });
    };

    React.useEffect(() => {
        if (!emailRegex.test(email) && email) {
            seIsEmailValidated(false);
        } else {
            seIsEmailValidated(true);
        }

    }, [email])


    const hasUserLoaded = React.useMemo(() => {
        return (
            adminValidationService.hasInitialized === true &&
            adminValidationService.isLoading === false
        );
    }, [adminValidationService.hasInitialized, adminValidationService.isLoading]);

    const adminValidation = () => {
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: "#d7d7d7" }}>
            <Card title={currentState === "login" ? "Login" : currentState === "signUp" ? "Sign Up" : "Signup/Login"} style={{ width: 400 }}>
                {currentState !== "default" ? (
                    <div><Button style={{ paddingLeft: "unset" }} type="text" onClick={() => { setCurrentState("default") }}><LeftArrowIcon /></Button></div>
                ) : null}
                <Input placeholder="Enter email"
                    autoFocus
                    onChange={(e) => { setEmail(e.target.value) }}
                    value={email}
                    onPressEnter={email && currentState === "default" && isEmailValidated ? CheckForExistingEmail : undefined}
                    disabled={currentState === "login" || currentState === "signUp"} />
                <div style={{ height: 20 }}>
                    {!isEmailValidated ? (
                        <span style={{ color: "red" }}>Please enter a valid email address</span>
                    ) : null}
                </div>
                {currentState === "signUp" ? (
                    <>
                        <Input.Password autoFocus placeholder="Enter Password" style={{ marginBottom: 20 }} onChange={(e) => { setPassword(e.target.value) }} />
                        <Input.Password
                            onPressEnter={email && currentState === "signUp" && password && confirmPassword && password === confirmPassword ? signUp : undefined}
                            placeholder="Confirm Password" style={{ marginBottom: 20 }} onChange={(e) => { setConfirmPassword(e.target.value) }} />
                        <Button type="primary" block disabled={!email || password !== confirmPassword || !password || !confirmPassword || signupService.isLoading} onClick={signUp}>
                            {signupService.isLoading ? "Signing Up..." : "Sign Up"}
                        </Button>
                    </>
                ) : currentState === "login" ? (
                    <>
                        <Input.Password
                            onPressEnter={email && currentState === "login" && password ? _login : undefined}
                            autoFocus placeholder="Enter Password" style={{ marginBottom: 20 }} onChange={(e) => { setPassword(e.target.value) }} />
                        <Button type="primary" block disabled={!email || !password || loginService.isLoading} onClick={_login} >
                            {loginService.isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </>
                ) : (
                    <Button type="primary" block disabled={!email || CheckForExistingEmailService.isLoading || !isEmailValidated} onClick={CheckForExistingEmail}>
                        {CheckForExistingEmailService.isLoading ? (
                            "Please Wait..."
                        ) : (
                            "Continue"
                        )}
                    </Button>
                )}
            </Card>
        </div>
    );
});