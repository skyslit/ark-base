import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/dashboard.scss';
import { Button, Col, Row } from "antd";
import Fade from "react-reveal/Fade";
import moment from 'moment';
import { DashboardAddIcon } from "../../auth/icons/global-icons";

export default createComponent((props) => {

    return (
        <Fade duration={700}>
            <div className="dashboard-wrapper">
                <Row style={{ background: "#F8F8F8" }} justify="center">
                    <Col className="dashboard-content-wrapper" span={22}>
                        <div className="dashboard-text-icon-wrapper" >
                            <div className="dashboard-date-text-wrapper">
                                <span className="date-text">{moment().format('dddd, DD MMMM YYYY')}</span>
                                <span className="dashboard-text">Dashboard</span>
                            </div>
                            <div className="dashboard-add-icon-wrapper">
                                <Button className="dashboard-add-icon-btn" type="text">
                                    <DashboardAddIcon style={{ fontSize: 22 }} />
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Fade>
    );
});