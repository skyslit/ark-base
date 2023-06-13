import React from "react";
import {
  Catalogue,
  CatalogueItemPickerProvider,
  useCatalogueItemPicker,
} from "@skyslit/ark-frontend/build/dynamics-v2/widgets/catalogue";
import { Modal } from "antd";
import { MemoryRouter, useParams } from "react-router-dom";

function Picker(props: any) {
  const picker = useCatalogueItemPicker();

  return (
    <Modal
      bodyStyle={{ padding: 0 }}
      destroyOnClose={true}
      open={picker.isPickerOpen}
      onCancel={picker.cancel}
      title="Choose file(s)"
      width={1000}
      footer={null}
    >
      <div className="homepage-wrapper" style={{ width: "100%", height: 450 }}>
        <Catalogue
          style={{ height: "100%" }}
          namespace="default"
          meta={{ mode: "picker" }}
        />
      </div>
    </Modal>
  );
}

export function PickerProvider(props: any) {
  return (
    <CatalogueItemPickerProvider>
      {props.children}
      <Picker />
    </CatalogueItemPickerProvider>
  );
}
