import React from "react";
import { Button, Input, Row, Col, Select, Space, Form, Spin } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const GeneralInfo = ({ onCancel }) => {
  const { Option } = Select;

  const [form] = Form.useForm();

  return (
    <Form
      key="new-notification-form"
      //onFinish={onFinish}
      form={form}
      name="general-info"
    >
      <div className="notification-content">
        <Row gutter={24}>
          <Col span={24}>
            <div className="delphi-input-group-wrapper">
              <div className="label">Frame name</div>
              <div className="delphi-input-wrapper delphi-input-group">
                <Form.Item name="name" noStyle>
                  <Input style={{ width: "100%" }} placeholder="Frame name" />
                </Form.Item>
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <div className="delphi-input-group-wrapper">
              <div className="label">Description</div>
              <div className="delphi-input-wrapper delphi-input-group">
                <Form.Item name="description" noStyle>
                  <TextArea
                    style={{ width: "100%" }}
                    placeholder="Description"
                  />
                </Form.Item>
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <div className="label">Frame refresh</div>
            <Form.Item name="frameRefresh">
              <Select
                allowClear
                style={{ width: "100%" }}
                placeholder="Select an option"
                suffixIcon={<CaretDownOutlined />}
                //onChange={(e) => onChangeEvent(e)}
                //name="triggerEvent"
              >
                <Option value="0" key={"0"}>
                  0
                </Option>
                <Option value="1" key={"1"}>
                  1
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default GeneralInfo;
