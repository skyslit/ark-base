import React from "react";
import { createComponent, Frontend, useArkReactServices } from "@skyslit/ark-frontend";
import '../styles/setup-page.scss';
import {
    Col,
    Row,
    Typography,
    Form,
    Button,
    Input,
    Divider,
    message,
    Select,
    Checkbox,
    Spin,
} from "antd";
import SkyslitLogo from "../assets/images/skyslit.jpg";
import RecoveryImage from "../assets/images/recovery-image.png";
import { ArrowLeftOutlined, LoadingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Fade from "react-reveal/Fade";
import { Helmet } from "react-helmet-async";
import { RightArrowIcon, DownArrowIcon } from "../icons/global-icons";


const DefaultState = (props) => {
    const { use } = useArkReactServices();
    const { useService } = use(Frontend);
    const history = useHistory();

    const { setCurrentState, demoItems, selectedItem, setSelectedItem } = props

    const deployDemoArchieveService = useService({ serviceId: "deploy-demo-archive" });

    const deployDemoArchieve = () => {
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

    React.useEffect(() => {
        if (deployDemoArchieveService.isLoading) {
            setCurrentState("setup")
        }
    }, [deployDemoArchieveService.isLoading])


    return (
        <div className="setup-page-wrapper">
            <div className="top-section">
                <h1 style={{ marginBottom: 80 }}>Logo</h1>
                <p>Let’s finalise few things before we get into your new app</p>
                <h2>What does your app primarily do?</h2>
                <div className="select-wrapper">
                    <Select
                        className="finalise-setup-select"
                        popupClassName="finalise-setup-popup"
                        suffixIcon={<DownArrowIcon />}
                        style={{ width: "100%" }}
                        onChange={(value) => { setSelectedItem(value) }}
                        value={selectedItem}
                        placeholder="Select"
                        options={demoItems.map((item) => ({
                            label: item.name || item.description,
                            value: item._id,
                        }))}
                    />
                    {/* <br />
                    <Checkbox style={{ marginTop: 32 }}>Pre-fill app with sample data</Checkbox> */}
                </div>
            </div>
            <div style={{ textAlign: "center" }} >
                <button disabled={!selectedItem || deployDemoArchieveService.isLoading} onClick={deployDemoArchieve}>Proceed<RightArrowIcon style={{ marginLeft: 15, color: !selectedItem ? "#b1b1b1" : undefined }} /></button></div>
        </div>
    )
}

const SetupState = (props) => {
    const [fakeState, setFakeState] = React.useState("Setting up..");
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    return (
        <div className="setup-page-wrapper">
            <div className="logo-section">
                <h1>Logo</h1>
            </div>
            <div className="middle-section">
                <h1>{fakeState}</h1>
                <p>Please wait for a few seconds while we setup your app</p>
            </div>
            <div style={{ textAlign: "center" }}><Spin indicator={antIcon} style={{ color: "#222222" }} /></div>
        </div>
    )
}

export default createComponent((props) => {
    const { useService } = props.use(Frontend);
    const [currentState, setCurrentState] = React.useState("default")
    const [demoItems, setDemoItems] = React.useState([])
    const [selectedItem, setSelectedItem] = React.useState()
    const [selectedItemDetails, setSelectedItemDetails] = React.useState()
    const { projectId } = props
    
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
            state = <DefaultState {...props} setCurrentState={setCurrentState} demoItems={demoItems} setSelectedItem={setSelectedItem} selectedItem={selectedItem} />
            break;
        case "setup":
            state = <SetupState {...props} currentState={currentState} />
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