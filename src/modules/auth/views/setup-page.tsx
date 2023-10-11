import React from "react";
import { createComponent, Frontend, useArkReactServices } from "@skyslit/ark-frontend";
import '../styles/setup-page.scss';
import {
    Col,
    Row,
    Button,
    Divider,
    message,
    Spin,
} from "antd";
import DemoPlaceholder from "../assets/images/demo-placeholder.png"
import { LoadingOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { RightArrowIcon, AdminIcon, BlueTickIcon, BlankFileIcon } from "../icons/global-icons";

const DefaultState = (props) => {
    const { use } = useArkReactServices();
    const { useService, useContext } = use(Frontend);
    const history = useHistory();

    const { setCurrentState, demoItems, selectedItem, setSelectedItem, fetchDemoDataByProjectId, businessName } = props

    const deployDemoArchieveService = useService({ serviceId: "deploy-demo-archive" });
    const skipDemoArchieveService = useService({ serviceId: "skip-demo-archive" });

    const deployDemoArchieve = () => {
        if (selectedItem === "blank") {
            skipDemoArchieveService
                .invoke({},
                    { force: true })
                .then((res) => {
                    history.push("/");
                })
                .catch((e) => {
                    message.error(e.message)
                });
        } else {
            deployDemoArchieveService
                .invoke({
                    archiveId: selectedItem
                }, { force: true })
                .then((res) => {
                    history.push("/");
                })
                .catch((e) => {
                    message.error(e.message)
                });
        }

    }


    React.useEffect(() => {
        if (deployDemoArchieveService.isLoading) {
            setCurrentState("setup")
        }
    }, [deployDemoArchieveService.isLoading])

    const antIcon = (
        <LoadingOutlined style={{ fontSize: 30, color: "#4c91c9" }} spin />
    );

    React.useEffect(() => {
        if (demoItems.length > 0) {
            setSelectedItem(demoItems[0]._id)
        }
    }, [demoItems])

    if (fetchDemoDataByProjectId.isLoading) {
        return (
            <div
                style={{
                    backgroundColor: "#F8F8F8",
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
        <Row className="setup-page-row-wrapper" justify="center">
            <Col className="setup-page-col-wrapper" xs={22} sm={22} md={20} lg={20} xl={18}>
                <div className="header-wrapper">
                    <span className="name-text">{businessName ? businessName : null}</span>
                    <div style={{ gap: 12, display: "flex", alignItems: "center" }}>
                        <AdminIcon style={{ fontSize: 28 }} />
                        <span className="admin-text">Admin</span>
                    </div>
                </div>
                <div className="content-wrapper">
                    <div className="setup-heading-wrapper">
                        <span className="setup-text">Setup your new app</span>
                        <Divider />
                        <span className="choose-text">Choose a template</span>
                        <p className="description">Select a template from below and we will automatically pre-fill your app with appropriate sample datas; Or you could start blank.</p>
                    </div>
                    <div className="demo-items-wrapper">
                        {demoItems.map((item) => {
                            return (
                                <div key={item._id} className={selectedItem === item._id ? 'single-demo-item-wrapper-selected' : 'single-demo-item-wrapper'} onClick={(e) => { setSelectedItem(item._id) }}>
                                    <BlueTickIcon className="tick-icon" />
                                    <div style={{ height: "190px" }}>
                                        <img src={DemoPlaceholder} />
                                    </div>
                                    <span className="demo-name">{item.name}</span>
                                    <p>{item.description}</p>
                                </div>
                            )
                        })}
                        <div className={selectedItem === "blank" ? 'blank-demo-item-wrapper-selected' : 'blank-demo-item-wrapper'} onClick={(e) => { setSelectedItem("blank") }}>
                            <BlueTickIcon className="tick-icon" />
                            <div style={{ height: "190px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <BlankFileIcon style={{ fontSize: 35 }} />
                            </div>
                            <span className="demo-name">Start Blank</span>
                            <p>No sample data</p>
                        </div>
                    </div>
                </div>
                <div className="btn-wrapper"><Button disabled={!selectedItem || deployDemoArchieveService.isLoading} onClick={deployDemoArchieve}>Proceed<RightArrowIcon style={{ marginLeft: 15, color: !selectedItem ? "#b1b1b1" : undefined }} /></Button></div>
            </Col>
        </Row>
    )
}

const SetupState = (props) => {

    const { businessName } = props

    const [fakeState, setFakeState] = React.useState("Setting up..");
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    return (
        <div className="setup-page-wrapper">
            <div className="logo-section">
                <span className="name-text">{businessName ? businessName : null}</span>
            </div>
            <div className="middle-section">
                <h1>{fakeState}</h1>
                <p>Please wait for a few seconds while we setup your app</p>
            </div>
            <div className="bottom-section"><Spin indicator={antIcon} style={{ color: "#222222" }} /></div>
        </div>
    )
}

export default createComponent((props) => {
    const { useService, useContext } = props.use(Frontend);
    const [currentState, setCurrentState] = React.useState("default")
    const [demoItems, setDemoItems] = React.useState([])
    const [selectedItem, setSelectedItem] = React.useState()
    const [selectedItemDetails, setSelectedItemDetails] = React.useState()
    const { projectId } = props

    const context = useContext();

    const businessName = React.useMemo(() => {
        if (context?.response?.meta?.passThroughVariables) {
            try {
                return (
                    context.response.meta.passThroughVariables.BUSINESS_NAME
                );
            } catch (e) {
                console.error(e);
            }
        }
        return false;
    }, [context?.response?.meta?.passThroughVariables]);

    const fetchDemoDataByProjectId = useService({ serviceId: "fetchDemoDataByProjectId" });

    React.useEffect(() => {
        fetchDemoDataByProjectId
            .invoke({
                projectId: projectId
            }, { force: true })
            .then((res) => {
                setDemoItems(res.data)
            })
            .catch(() => { });
    }, [])

    React.useEffect(() => {
        if (selectedItem) {
            const item = demoItems.find((data: any) => {
                return data._id === selectedItem
            })
            setSelectedItemDetails(item)
        }
    }, [selectedItem])
    let state
    switch (currentState) {
        case "default":
            state = <DefaultState {...props} businessName={businessName} setCurrentState={setCurrentState} demoItems={demoItems} setSelectedItem={setSelectedItem} selectedItem={selectedItem} fetchDemoDataByProjectId={fetchDemoDataByProjectId} />
            break;
        case "setup":
            state = <SetupState {...props} currentState={currentState} businessName={businessName} />
            break;
        default:
            break;
    }
    return (
        <>
            {state}
        </>
    );
});