import React from "react";
import { createComponent } from "@skyslit/ark-frontend";
import { useFile } from '@skyslit/ark-frontend/build/dynamics-v2';
import { Input, Row, Col, Button, Tabs } from 'antd';
import { createSchema } from '@skyslit/ark-frontend/build/dynamics-v2';
import "./PropertyEditor.scss"
import type { TabsProps } from 'antd';

export const PropertySchema = createSchema({
    orgName: "",
    mobileNumber: 0,
})

export function PropertyRenderer() {
    const file = useFile();

    const BasicInformation = ((props) => {
        return (
            <Row className="basic-information-editor-row-wrapper" justify="center">
                <Col span={22} className="basic-information-editor-col-wrapper">
                    <div className="basic-information-editor-wrapper">
                        <div className="heading-wrapper">
                            <span className="heading-text">Basic Information</span>
                        </div>
                        <div className="content-wrapper">
                            <div className="input-wrapper">
                                <label>Business Name:</label>
                                <Input placeholder="Give a name for this app (Eg: John’s Online Store)"
                                    value={(file.cms.content as any).orgName}
                                    onChange={(e) => file.cms.updateKey("orgName", e.target.value)} />
                            </div>
                            <div className="input-wrapper">
                                <label>Contact Number:</label>
                                <Input
                                    value={(file.cms.content as any).mobileNumber}
                                    onChange={(e) => file.cms.updateKey("mobileNumber", e.target.value)} />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

        )
    })

    const PrivacyAndSecurity = ((props) => {
        return (
            <div>
            </div>
        )
    })

    const DataCollection = ((props) => {
        return (
            <div>
            </div>
        )
    })

    const UserManagement = ((props) => {
        return (
            <div>
            </div>
        )
    })

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `Basic Information`,
            children: <BasicInformation />
        },
        {
            key: '2',
            label: `Privacy & Security`,
            children: <PrivacyAndSecurity />,
        },
        {
            key: '3',
            label: `Data Collection`,
            children: <DataCollection />,
        },
        {
            key: '4',
            label: `User Management`,
            children: <UserManagement />,
        },
    ];

    return (
        <Row className="property-editor-row-wrapper">
            <Col span={24} className="property-editor-col-wrapper">
                <Tabs className="tab-wrapper" defaultActiveKey="1" tabPosition="left" items={items} />
            </Col>
        </Row>
    );
}