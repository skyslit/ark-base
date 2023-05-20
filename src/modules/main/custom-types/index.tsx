import React from "react";
import {
  useFile,
  controller,
  FileEditor,
  createSchema,
} from "@skyslit/ark-frontend/build/dynamics-v2";
import { Button, Col, Input, Row } from "antd";

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
  // return (
  //     <div>
  //         <label>Title</label>
  //         <Input value={(file.cms.content as any).title} onChange={(e) => file.cms.updateKey('title', e.target.value)} />

  //         <label>Year</label>
  //         <Input value={(file.cms.content as any).year} onChange={(e) => file.cms.updateKey('year', e.target.value)} />

  //         <label>Univ</label>
  //         <Input value={(file.cms.content as any).univ} onChange={(e) => file.cms.updateKey('univ', e.target.value)} />
  //     </div>
  // )
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
