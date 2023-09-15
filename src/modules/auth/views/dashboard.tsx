import React, { useEffect } from "react";
import { createComponent, Frontend, useArkReactServices } from "@skyslit/ark-frontend";
import '../styles/dashboard.scss';
import { Button, Col, Row, Drawer, Input } from "antd";
import Fade from "react-reveal/Fade";
import moment from 'moment';
import { DashboardAddIcon, LeftArrowIcon, PieDiagramIcon, SearchIcon } from "../../auth/icons/global-icons";
import { Helmet } from "react-helmet-async";
import { DashboardView } from "../../main/toolkit/views/dashboard";
import { useParams, useHistory } from "react-router-dom";

const DashboardPresenter = (props: { dashboardFilePath: string }) => {
    const { use } = useArkReactServices();
    const { useFolder } = use(Frontend);
    const { readFile } = useFolder();
    const [dashboardContent, setDashboardContent] = React.useState();

    React.useEffect(() => {
        readFile(props.dashboardFilePath).then((res) => {
            setDashboardContent(res.meta.content)
        })
    }, []);

    if (!dashboardContent) {
        return (
            <div>Loading...</div>
        )
    }

    if (Object.keys(dashboardContent).length > 0) {
        return (
            <DashboardView
                mode="presenter"
                dashboardFileContent={dashboardContent}
                onChange={() => { }}
            />
        )
    }

    return null;
}
export default createComponent((props) => {
    const { dynamics_path } = useParams<any>();
    const history: any = useHistory()


    const navigateToEditor = React.useMemo(() => { 
        return `/app/files/${dynamics_path}`
    }, [dynamics_path])

    return (
        <>
            <Helmet>
                <title> Dashboard </title>
            </Helmet>
            <Fade duration={700}>
                <div className="dashboard-wrapper">
                    <div style={{ textAlign: "end", padding: 20 }}><Button onClick={() => { history.push(navigateToEditor) }}>Edit</Button></div>
                    <Row style={{ background: "#F8F8F8" }} justify="center">
                        <Col className="dashboard-content-wrapper" span={24}>
                            <DashboardPresenter key={dynamics_path} dashboardFilePath={`/${dynamics_path}`} />
                        </Col>
                    </Row>
                </div>
            </Fade>
        </>
    );
});