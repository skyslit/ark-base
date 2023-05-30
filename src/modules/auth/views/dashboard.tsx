import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/dashboard.scss';
import { Button, Col, Row, Drawer, Input } from "antd";
import Fade from "react-reveal/Fade";
import moment from 'moment';
import { DashboardAddIcon, LeftArrowIcon, PieDiagramIcon, SearchIcon } from "../../auth/icons/global-icons";
import { Helmet } from "react-helmet-async";

const Widget = createComponent((props) => {

    return (
        <>
            <div className="single-dashboard-content-box">
                <PieDiagramIcon className="pie-chart-icon" />
                <span className="heading-text">Monthly Comparison Chart</span>
                <span className="description-text">Shows the comparison between monthly budget and actual expense. Shows the comparison between monthly budget and actual expense.</span>
                <div className="add-dashboard-btn-wrapper">
                    <Button type="text" className="add-dashboard-btn">Add to dashboard</Button>
                </div>
            </div>

            <div className="single-dashboard-content-box">
                <PieDiagramIcon className="pie-chart-icon" />
                <span className="heading-text">Monthly Comparison Chart</span>
                <span className="description-text">Shows the comparison between monthly budget and actual expense. Shows the comparison between monthly budget and actual expense.</span>
                <div className="add-dashboard-btn-wrapper">
                    <Button type="text" className="add-dashboard-btn">Add to dashboard</Button>
                </div>
            </div>

            <div className="single-dashboard-content-box">
                <PieDiagramIcon className="pie-chart-icon" />
                <span className="heading-text">Monthly Comparison Chart</span>
                <span className="description-text">Shows the comparison between monthly budget and actual expense. Shows the comparison between monthly budget and actual expense.</span>
                <div className="add-dashboard-btn-wrapper">
                    <Button type="text" className="add-dashboard-btn">Add to dashboard</Button>
                </div>
            </div>

            <div className="single-dashboard-content-box">
                <PieDiagramIcon className="pie-chart-icon" />
                <span className="heading-text">Monthly Comparison Chart</span>
                <span className="description-text">Shows the comparison between monthly budget and actual expense. Shows the comparison between monthly budget and actual expense.</span>
                <div className="add-dashboard-btn-wrapper">
                    <Button type="text" className="add-dashboard-btn">Add to dashboard</Button>
                </div>
            </div>
        </>
    );
});

const DrawerContent = createComponent((props) => {

    return (
        <div style={{ display: "flex" }}>
            <div className="sider-whole-wrapper" >
                <div className="sider-content-wrapper">
                    <Button className="selected-sider-btn" type="text">Finance (5)</Button>
                    <Button className="sider-btn" type="text">Finance (1) </Button>
                </div>
            </div>
            <div className="drawer-main-content-wrapper">
                <Widget {...props} />
            </div>
        </div>
    );
});

export default createComponent((props) => {

    const [visible, setVisible] = React.useState(false);

    const showDrawer = () => {
        setVisible(true);
    };

    const hideDrawer = () => {
        setVisible(false);
    };

    return (
        <>
            <Helmet>
                <title> Dashboard </title>
            </Helmet>
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
                                    <Button onClick={showDrawer} className="dashboard-add-icon-btn" type="text">
                                        <DashboardAddIcon style={{ fontSize: 22 }} />
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <Drawer className="drawer-wrapper"
                    placement="right"
                    closable={false}
                    onClose={hideDrawer}
                    visible={visible}
                    title={[
                        <div className="header-wrapper">
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <Button onClick={hideDrawer} className="left-arrow-back-btn" type="text">
                                    <LeftArrowIcon style={{ color: "#2B2B2B", fontSize: 13 }} />
                                </Button>
                                <span className="widget-gallery-text">Widget Gallery</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                                <SearchIcon style={{ position: "absolute", zIndex: 100, left: 13, top: 12, fontSize: 13 }} />
                                <Input
                                    className='custom-select-solution-input'
                                    style={{ width: 283 }}
                                    placeholder="Search for widgets"
                                />
                            </div>
                        </div>
                    ]}
                >
                    <DrawerContent  {...props} />
                </Drawer>
            </Fade>
        </>

    );
});