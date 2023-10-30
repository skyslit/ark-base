import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import "../styles/login-page.scss";
import { Typography, Button, Input, message, Spin } from "antd";
import { useHistory } from "react-router-dom";
import { RightArrowIcon, SkyslitColorFullLogoIcon } from "../icons/global-icons";
import { LoadingOutlined } from "@ant-design/icons";
import "../styles/loginv2.scss"
import CompanyLogo from "../assets/images/company-logo.png";
import { generateFileLink } from '@skyslit/ark-frontend/build/dynamics-v2/widgets/catalogue';

export default createComponent((props) => {
    const { useService, useContext, useFolder } = props.use(Frontend);
    const context = useContext();
    const history = useHistory()
    const { readFile } = useFolder();

    const CheckForExistingEmailService = useService({ serviceId: "check-for-existing-email" });
    const loginService = useService({ serviceId: "user-login-v2-service" });
    const signupService = useService({ serviceId: "user-signup-v2" });
    const adminValidationService = useService({ serviceId: "admin-validation" });

    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [passwordError, setPasswordError] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [currentState, setCurrentState] = React.useState('default')
    const [isEmailValidated, seIsEmailValidated] = React.useState(true)
    const [isClosing, setIsClosing] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [organisationDetails, setOrganisationDetails] = React.useState({});

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;


    const validatePassword = (value) => {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (!passwordRegex.test(value)) {
            setPasswordError(
                'Password must contain a minimum of 8 characters including one uppercase letter, one lowercase letter, and a number.'
            );
        } else {
            setPasswordError('');
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (currentState === "signUp") {
            validatePassword(newPassword);
        }
    };

    const urlSearchParams = new URLSearchParams(history.location.search);
    const redirectUrl = urlSearchParams.get('url');

    const CheckForExistingEmail = React.useCallback(() => {
        setIsClosing(true)
        CheckForExistingEmailService
            .invoke({
                email
            }, { force: true })
            .then((res) => {
                setTimeout(() => {
                    setIsClosing(false);
                    if (res.data === true) {
                        setCurrentState("login")
                    } else {
                        setCurrentState("signUp")
                    }
                }, 1000);
            })
            .catch((e) => {
                setIsClosing(true)
            });
    }, [email]);

    const _login = () => {
        setIsClosing(true)
        setIsLoading(true)
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
                    localStorage.removeItem('userEmail');
                    if (redirectUrl) {
                        window.location.href = redirectUrl
                    } else {
                        window.location.reload()
                    }
                    context.invoke({}, { force: true });
                    // history.push("/account/settings")
                }
            })
            .catch((e) => {
                message.error(e.message)
                setIsLoading(false)
            });
    };

    const signUp = (data: any) => {
        setIsClosing(true)
        signupService
            .invoke(
                {
                    email,
                    password,
                },
                { force: true }
            )
            .then((res) => {
                setTimeout(() => {
                    setIsClosing(false);
                    _login()
                }, 1000);
            })
            .catch((e) => {
                setIsClosing(true)
            });
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

    React.useEffect(() => {
        readFile(`/info`).then((res) => {
            setOrganisationDetails(res.meta.content)
        })
    }, [])

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
        <div className="login-wrapper">
            <div className='logo-icon-wrapper'>
                {/* <SkyslitColorFullLogoIcon style={{ fontSize: 33 }} /> */}
                {/* <img src={CompanyLogo} width={140}></img> */}
                <img src={generateFileLink(`${organisationDetails.marketinglogo}`)} style={{ width: "140px", objectFit: "contain" }} />
            </div>
            <div style={{ paddingBottom: currentState === "signUp" ? 25 : "" }} className="card-wrapper" >
                <h3 className="heading">{currentState === "login" ? "Sign in" : currentState === "signUp" ? "Create new account" : "Sign in"}</h3>
                <span className="signin-description">{currentState === "signUp" ? "Set a new password to finalise" : "Enter your email to login or sign up"}</span>
                <div style={{ marginTop: currentState === "signUp" || currentState === "login" ? 30 : 50 }} className="label-field-wrapper">
                    <div style={{ flexDirection: "column", display: 'flex' }}>
                        {currentState === "default" ? (
                            <>
                                <label>Your email</label>
                                <Input className="custom-input" placeholder="Enter your email address"
                                    autoFocus
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    value={email}
                                    onPressEnter={email && currentState === "default" && isEmailValidated ? CheckForExistingEmail : undefined}
                                    disabled={CheckForExistingEmailService.isLoading || isClosing}
                                />
                                <div style={{ height: 20 }}>
                                    {!isEmailValidated ? (
                                        <span className="email-validation-msg">Please enter a valid email address</span>
                                    ) : null}
                                </div>
                            </>
                        ) : null}
                        {currentState === "signUp" ? (
                            <>
                                <div className="email-change-wrapper">
                                    <div style={{ flexDirection: 'column', display: 'flex', gap: 5, width: 340 }}>
                                        <h5>Email:</h5>
                                        <Typography.Text className="email-text" ellipsis={true}>
                                            {email}
                                        </Typography.Text>
                                    </div>
                                    <Button className="change-btn" type="text" onClick={() => { setCurrentState("default") }}>Change</Button>
                                </div>
                                <Input.Password disabled={signupService.isLoading || isClosing} autoFocus placeholder="Enter your password" onChange={(e) => { handlePasswordChange(e) }} />
                                <span style={{ display: passwordError ? "inline" : "none" }} className="password-condition-text">Password must contain a minimum of 8 characters including one uppercase letter, one lower case letter and a number.</span>
                                <Input.Password style={{ marginTop: passwordError ? "unset" : 20 }} disabled={signupService.isLoading || isClosing}
                                    onPressEnter={email && currentState === "signUp" && password && confirmPassword && password === confirmPassword ? signUp : undefined}
                                    placeholder="Re-enter password" onChange={(e) => { setConfirmPassword(e.target.value) }} />
                                <span style={{ display: password !== confirmPassword && confirmPassword ? "inline" : "none" }} className="password-condition-text">Password does not match</span>

                            </>
                        ) : currentState === "login" ? (
                            <>
                                <div className="email-change-wrapper">
                                    <div className="email-text-wrapper">
                                        <h5>Email:</h5>
                                        <Typography.Text className="email-text" ellipsis={true}>
                                            {email}
                                        </Typography.Text>
                                    </div>
                                    <Button className="change-btn" type="text" onClick={() => { setCurrentState("default") }}>Change</Button>
                                </div>
                                <label>Password:</label>
                                <Input.Password disabled={loginService.isLoading}
                                    onPressEnter={email && currentState === "login" && password ? _login : undefined}
                                    autoFocus placeholder="Enter your password" style={{ marginBottom: 20 }} onChange={(e) => { setPassword(e.target.value) }} />
                            </>
                        ) : (
                            null
                        )}
                    </div>
                    <div className="continue-btn-wrapper">
                        {currentState === "signUp" ? (
                            signupService.isLoading || isClosing ? (
                                <LoadingOutlined style={{ fontSize: 30, color: "#222222" }} />
                            ) : (
                                <Button style={{ width: 198 }} className="continue-btn" type="text" block disabled={!email || password !== confirmPassword || !password || !confirmPassword || signupService.isLoading} onClick={signUp}>
                                    Create Account <RightArrowIcon style={{ marginLeft: 28 }} className="arrow-icon" />
                                </Button>
                            )
                        ) : currentState === "login" ? (
                            loginService.isLoading || isLoading ? (
                                <LoadingOutlined style={{ fontSize: 30, color: "#222222" }} />
                            ) : (
                                <Button className="continue-btn" type="text" block disabled={!email || !password || loginService.isLoading} onClick={_login} >
                                    Login <RightArrowIcon style={{ marginLeft: 28 }} className="arrow-icon" />
                                </Button>
                            )
                        ) : (
                            CheckForExistingEmailService.isLoading || isClosing ? (
                                <LoadingOutlined style={{ fontSize: 30, color: "#222222" }} />
                            ) : (
                                <Button className="continue-btn" type="text" block disabled={!email || CheckForExistingEmailService.isLoading || !isEmailValidated} onClick={CheckForExistingEmail}>
                                    Continue <RightArrowIcon className="arrow-icon" />
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </div>
            <div style={{ display: currentState !== "default" ? "none" : "flex" }} className="dont-have-account-wrapper">
                <h5>Don’t have an account?</h5>
                <h6>You can still enter your email, and we will guide you from there.</h6>
            </div>
        </div>
    );
});