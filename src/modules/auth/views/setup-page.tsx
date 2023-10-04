import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
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


const DefaultState = (props) => {
    const { setCurrentState,demoItems,selectedItem,setSelectedItem } = props
    return (
        <div className="setup-page-wrapper">
            <div className="top-section">
                <h1 style={{marginBottom:80}}>Logo</h1>
                <p>Let’s finalise few things before we get into your new app</p>
                <h2>What does your app primarily do?</h2>
                <div style={{ width: "65%" }}>
                    <Select
                        style={{ width: "100%" }}
                        onChange={(value)=>{setSelectedItem(value)}}
                        value={selectedItem}
                        placeholder="Select"
                        options={demoItems.map((item) => ({
                            label: item.description,
                            value: item._id,
                        }))}
                    /><br />
                    <Checkbox style={{ marginTop: 32 }}>Pre-fill app with sample data</Checkbox>
                </div>
            </div>
            <div style={{ textAlign: "center" }} onClick={() => { setCurrentState("setup") }}><Button type="text">Proceed</Button></div>
        </div>
    )
}

const SetupState = () => {
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
    return (
        <div className="setup-page-wrapper">
            <div className="logo-section">
                <h1>Logo</h1>
            </div>
            <div className="middle-section">
                <h1>Setting up..</h1>
                <p>Please wait for a few seconds while we setup your app</p>
            </div>
            <div style={{ textAlign: "center" }}><Spin indicator={antIcon} style={{color:"#222222"}} /></div>
        </div>
    )
}

export default createComponent((props) => {
    const [currentState, setCurrentState] = React.useState("default")
    const { useService } = props.use(Frontend);
    const fetchDemoDataByProjectId = useService({ serviceId: "fetchDemoDataByProjectId" });
    const [demoItems, setDemoItems] = React.useState([])
    const [selectedItem, setSelectedItem] = React.useState()
    const [selectedItemDetails, setSelectedItemDetails] = React.useState()

    React.useEffect(() => {
        fetchDemoDataByProjectId
            .invoke({
                projectId : "6465b83c27be001224e57d8b"
            }, { force: true })
            .then((res) => {
                setDemoItems(res.data)
            })
            .catch(() => { });
    },[])

    React.useEffect(()=>{
        if(selectedItem){
          const item = demoItems.find((data:any)=>{
            return data._id === selectedItem
          })
          setSelectedItemDetails(item)
        }
    },[selectedItem])
    console.log("selectedItem",selectedItemDetails)
    let state
    switch (currentState) {
        case "default":
            state = <DefaultState {...props} setCurrentState={setCurrentState} demoItems={demoItems} setSelectedItem={setSelectedItem} selectedItem={selectedItem} />
            break;
        case "setup":
            state = <SetupState />
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