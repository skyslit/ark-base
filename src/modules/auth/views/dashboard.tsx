import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/dashboard.scss';
import { Col, Row } from "antd";
import Fade from "react-reveal/Fade";

export default createComponent((props) => {

    return (
        <Fade duration={700}>
            <div className="dashboard-wrapper">
                <Row style={{ background: "#F8F8F8" }} justify="center">
                    <Col className="dashboard-content-wrapper" xl={22} lg={16} md={16} sm={22} xs={22}>
                        <span className="date-text">Monday, 22 May 2023</span>
                        <span className="dashboard-text">Dashboard</span>
                    </Col>
                </Row>
            </div>
        </Fade>
    );
});