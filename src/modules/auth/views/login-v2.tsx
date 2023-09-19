import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import "../styles/login-page.scss";
import { Col, Row, Typography, Form, Button, Input, message, Card } from "antd";


export default createComponent((props) => {
    const { useService, useContext, useFolder } = props.use(Frontend);
    const context = useContext();

    const CheckForExistingEmailService = useService({ serviceId: "check-for-existing-email" });
    const loginService = useService({ serviceId: "user-login-v2-service" });


    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')

    const [currentState, setCurrentState] = React.useState('default')

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

    const _login = (data: any) => {
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

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: "#d7d7d7" }}>
            <Card title={currentState === "login" ? "Login" : currentState === "signUp" ? "Sign Up" : "Signup/Login"} style={{ width: 400 }}>
                <Input placeholder="Enter email" style={{ marginBottom: 16 }}
                    onChange={(e) => { setEmail(e.target.value) }}
                    value={email}
                    disabled={currentState === "login" || currentState === "signup"} />
                {currentState === "signUp" ? (
                    <>
                        <Input.Password placeholder="Enter Password" style={{ marginBottom: 16 }} onChange={(e) => { setPassword(e.target.value) }} />
                        <Input.Password placeholder="Confirm Password" style={{ marginBottom: 16 }} onChange={(e) => { setConfirmPassword(e.target.value) }} />
                        <Button type="primary" block disabled={!email} >
                            Sign Up
                        </Button>
                    </>
                ) : currentState === "login" ? (
                    <>
                        <Input.Password placeholder="Enter Password" style={{ marginBottom: 16 }} onChange={(e) => { setPassword(e.target.value) }} />
                        <Button type="primary" block disabled={!email || !password || loginService.isLoading} onClick={_login} >
                            {loginService.isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </>
                ) : (
                    <Button type="primary" block disabled={!email || CheckForExistingEmailService.isLoading} onClick={CheckForExistingEmail}>
                        Continue
                    </Button>
                )}
            </Card>
        </div>
    );
});