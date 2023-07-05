import React from "react";
import { createComponent } from "@skyslit/ark-frontend";
import { useFile } from '@skyslit/ark-frontend/build/dynamics-v2';
import { Input, Row, Col, Button, Tabs } from 'antd';
import { createSchema } from '@skyslit/ark-frontend/build/dynamics-v2';
import "./PropertyEditor.scss"
import type { TabsProps } from 'antd';

export const PropertySchema = createSchema({
    orgName: "",
})

export function PropertyRenderer() {


    const BasicInformation = ((props) => {

        const file = useFile();

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
                                    onChange={(e) => file.cms.updateKey("orgName", e.target.value)}
                                    value={(file.cms.content as any).orgName}
                                />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    })

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `Basic Information`,
            children: <BasicInformation />
        },
    ];

    return (
        <Row className="property-editor-row-wrapper">
            <Col span={24} className="property-editor-col-wrapper">
                <Tabs className="tab-wrapper" defaultActiveKey="1" tabPosition='left' items={items} />
            </Col>
        </Row>
    );
}