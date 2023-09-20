import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import "../styles/login-page.scss";
import { Col, Row, Typography, Form, Button, Input, message, Card } from "antd";
import { useParams, useHistory } from "react-router-dom";

export default createComponent((props) => {
    const { useService, useContext, useFolder } = props.use(Frontend);
    const context = useContext();

    const CheckForExistingEmailService = useService({ serviceId: "check-for-existing-email" });
    const loginService = useService({ serviceId: "user-login-v2-service" });
    const signupService = useService({ serviceId: "user-signup-v2" });


    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [currentState, setCurrentState] = React.useState('default')
    const [isEmailValidated, seIsEmailValidated] = React.useState(true)

    const params: any = useParams()
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;
    const capitalLetterRegex = /[A-Z]/;

    const CheckForExistingEmail = () => {
        CheckForExistingEmailService
            .invoke({
                email
            })
            .then((res) => {
                if (res.data === true) {
                    setCurrentState("login")
                } else {
                    setCurrentState("signUp")
                }
            })
            .catch((e) => {
            })
    };

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
            .catch((e) => { });
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

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: "#d7d7d7" }}>
            <Card title={currentState === "login" ? "Login" : currentState === "signUp" ? "Sign Up" : "Signup/Login"} style={{ width: 400 }}>
                <Input placeholder="Enter email"
                    onChange={(e) => { setEmail(e.target.value) }}
                    value={email}
                    disabled={currentState === "login" || currentState === "signUp"} />
                <div style={{ height: 20 }}>
                    {!isEmailValidated ? (
                        <span style={{ color: "red" }}>Please enter a valid email address</span>
                    ) : null}
                </div>
                {currentState === "signUp" ? (
                    <>
                        <Input.Password placeholder="Enter Password" style={{ marginBottom: 20 }} onChange={(e) => { setPassword(e.target.value) }} />
                        <Input.Password placeholder="Confirm Password" style={{ marginBottom: 20 }} onChange={(e) => { setConfirmPassword(e.target.value) }} />
                        <Button type="primary" block disabled={!email || password !== confirmPassword} onClick={signUp}>
                            {signupService.isLoading ? "Signing Up..." : "Sign Up"}
                        </Button>
                    </>
                ) : currentState === "login" ? (
                    <>
                        <Input.Password placeholder="Enter Password" style={{ marginBottom: 20 }} onChange={(e) => { setPassword(e.target.value) }} />
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