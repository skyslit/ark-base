import React from "react";
import {
  useFile,
  controller,
  FileEditor,
  createSchema,
  useProperties,
} from "@skyslit/ark-frontend/build/dynamics-v2";
import { Button, Col, Input, Row, Select } from "antd";
const { Option } = Select;

function ProductForm() {
  const file = useFile();
  return (
    <div>
      <label>Product Descrition</label>
      <Input
        value={(file.cms.content as any).productDescription}
        onChange={(e) =>
          file.cms.updateKey("productDescription", e.target.value)
        }
      />
    </div>
  );
}

function CertForm() {
  const file = useFile();
  return (
    <Row className="file-editor-wrapper" justify="center">
      <Col span={12}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>Certificate</h2>
          <label>Title</label>
          <Input
            value={(file.cms.content as any).title}
            onChange={(e) => file.cms.updateKey("title", e.target.value)}
          />

          <label>Year</label>
          <Input
            value={(file.cms.content as any).year}
            onChange={(e) => file.cms.updateKey("year", e.target.value)}
          />

          <label>Univ</label>
          <Input
            value={(file.cms.content as any).univ}
            onChange={(e) => file.cms.updateKey("univ", e.target.value)}
          />

          <label>Desc</label>
          <Input.TextArea
            value={(file.cms.content as any).desc}
            onChange={(e) => file.cms.updateKey("desc", e.target.value)}
            style={{ margin: "unset", marginTop: 10 }}
            placeholder="Enter description"
            rows={4}
          />
        </div>
      </Col>
    </Row>
  );
}

export function initialiseCustomTypes() {
  controller.defineType("product", {
    name: "Product",
    icon: (props: any) => (
      <div
        style={{
          width: props?.style?.width,
          height: props?.style?.height,
          backgroundColor: "#ccc",
        }}
      />
    ),
    toolkit: {
      Renderer: () => {
        return (
          <FileEditor>
            <ProductForm />
          </FileEditor>
        );
      },
    },
    fileSchema: createSchema({
      productDescription: "",
    }),
    fileCollectionName: "products",
  });

  controller.defineType("certificate", {
    name: "Certificate",
    icon: (props: any) => (
      <div
        style={{
          width: props?.style?.width,
          height: props?.style?.height,
          backgroundColor: "green",
        }}
      />
    ),
    propertiesSchema: createSchema({
      description: "default-desc",
    }),
    metaEditor: () => {
      const propertiesApi = useProperties();

      return (
        <>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="textField">Description:</label>
            <Input
              id="textField"
              placeholder="Enter Text"
              value={propertiesApi.cms.content.meta.description}
              onChange={(e) =>
                propertiesApi.cms.updateKey(
                  "meta.description",
                  e.currentTarget.value
                )
              }
              style={{ marginTop: 10 }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="dropdown">Dropdown:</label>
            <Select
              placeholder="Select an option"
              style={{ width: "100%", marginTop: 10 }}
            >
              <Option value="option1">Option 1</Option>
              <Option value="option2">Option 2</Option>
              <Option value="option3">Option 3</Option>
            </Select>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="description">Long text:</label>
            <Input.TextArea
              placeholder="Description"
              rows={4}
              maxLength={133}
              style={{ marginTop: 10 }}
            />
          </div>
        </>
      );
    },
    toolkit: {
      Renderer: () => {
        return (
          <FileEditor>
            <CertForm />
          </FileEditor>
        );
      },
    },
    fileSchema: createSchema({
      title: "",
      year: 2023,
      univ: "",
      desc: "",
    }),
    fileCollectionName: "certificates",
  });
}
