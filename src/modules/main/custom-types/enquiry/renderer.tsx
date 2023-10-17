import React from "react";
import { Input, Row, Col, Button, Tabs, Select, Menu, Grid, Form, Divider } from 'antd';
import "./styles/renderer.scss";
import { useFile } from '@skyslit/ark-frontend/build/dynamics-v2';

export function EnquiryRenderer() {
    const file: any = useFile();

    return (
        <Row className="basic-information-editor-row-wrapper" justify="center">
            <Col span={22} className="basic-information-editor-col-wrapper">
                <div className="basic-information-editor-wrapper">
                    <div className="content-wrapper">
                        <div className="input-wrapper">
                            <label>Name:</label>
                            <Input className="input" placeholder="Enter name"
                                onChange={(e) => file.cms.updateKey("name", e.target.value)}
                                value={(file.cms.content as any).name}
                            />
                        </div>
                        <div className="input-wrapper">
                            <label>Email:</label>
                            <Input className="input"
                                placeholder="Enter email"
                                value={file.cms.content.email}
                                onChange={(e) => file.cms.updateKey('email', e.target.value)}
                            />
                        </div>
                        <div className="input-wrapper">
                            <label>User name:</label>
                            <Input className="input"
                                placeholder="Enter username"
                                value={file.cms.content.username}
                                onChange={(e) => file.cms.updateKey('username', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Col>
        </Row>
    );
}