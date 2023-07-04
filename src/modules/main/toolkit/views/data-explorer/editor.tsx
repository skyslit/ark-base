import React from "react";
import { Layout, Button, message } from "antd";
import "./styles/editor.scss";
import { useCatalogue, useFile } from "@skyslit/ark-frontend/build/dynamics-v2";
import { DefaultItemIcon } from "./components/item";

export default (props: any) => {
  const api = useCatalogue();
  const file = useFile();

  const Icon = React.useMemo(() => {
    if (api.currentCustomType?.icon) {
      return api.currentCustomType.icon;
    }

    return DefaultItemIcon;
  }, [api.currentCustomType]);

  return (
    <>
      <Layout.Header className="file-editor-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex" }}>
            <Icon style={{ fontSize: 25, width: 25, height: 25 }} />
          </div>
          <h5>{api?.currentDir?.name}</h5>
        </div>
        <div>
          {api.claims.write === true ? (
            <Button
              disabled={file.cms.hasChanged === false || file.loading}
              loading={file.loading}
              onClick={() =>
                file.saveChanges().catch((e) => {
                  message.error(
                    e?.response?.data?.message
                      ? e?.response?.data?.message
                      : e.message
                  );
                })
              }
              type="primary"
            >
              Save changes
            </Button>
          ) : null}
        </div>
      </Layout.Header>
      {props.children}
    </>
  );
};
