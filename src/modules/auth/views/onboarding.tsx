import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/onboarding.scss';
import Fade from "react-reveal/Fade";
import { Col, Row } from "antd";
import Lottie from "react-lottie";
import OnboardingLottie from "../assets/lottie-files/onboarding-lottie.json";
import { SkyslitColorFullLogoIcon } from "../icons/global-icons";

export default createComponent((props) => {

    return (
        <Row className="onboarding-page-row-wrapper" justify="center">
            <Col className="onboarding-page-col-wrapper" xs={22} sm={22} md={20} lg={20} xl={18}>
                <div className="content-wrapper">
                    <div className="onboarding-heading-wrapper">
                        <Lottie isClickToPauseDisabled={true}
                            options={{
                                loop: true,
                                autoplay: true,
                                animationData: OnboardingLottie,
                            }}
                            height={186}
                            width={186}
                        />
                        <span className="onboarding-text">Welcome to</span>
                        <span className="choose-text">Lakshya Kerala</span>
                        <p className="description">You will need to login as Admin & setup few things before heading into your app.</p>
                    </div>

                    <div className="instruction-wrapper">
                        <span style={{ marginBottom: 8 }} className="instruction-text">Instructions:</span>
                        <div className="step-wrapper">
                            <div className="circle-wrapper">
                                1
                            </div>
                            <span className="instruction-text">Log into <a href="https://compass.skyslit.com/organisations" style={{ color: "#2762D1", marginLeft: 6, marginBottom: "unset" }} >Skyslit Compass.</a></span>
                        </div>

                        <div style={{ alignItems: "unset" }} className="step-wrapper">
                            <div className="circle-wrapper">
                                2
                            </div>

                            <div style={{ flexDirection: "column", display: 'flex', alignItems: "flex-start" }}>
                                <span className="instruction-text">Under <p style={{ color: "#1D1D1D", fontFamily: "Roboto-Medium", margin: "0px 6px" }} >‘Your Apps’,</p> select and open </span>
                                <span className="instruction-text">Lakshya Kerala to see its app dashboard.</span>
                            </div>
                        </div>
                        <div className="step-wrapper">
                            <div className="circle-wrapper">
                                3
                            </div>
                            <span className="instruction-text">Click on <p style={{ color: "#1D1D1D", fontFamily: "Roboto-Medium", marginLeft: 6, marginBottom: "unset" }} >‘Launch app as Admin’.</p></span>
                        </div>
                    </div>
                    <div className="icon-wrapper">
                        <SkyslitColorFullLogoIcon />
                    </div>
                </div>
            </Col>
        </Row>
    )
});