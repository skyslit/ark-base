import React from "react";
import { createComponent } from "@skyslit/ark-frontend";
import { Catalogue } from "@skyslit/ark-frontend/build/dynamics-v2";
import { useParams } from "react-router-dom";
import "./styles/index.scss";
import { PickerProvider } from "./picker";

export const DataExplorerView = createComponent((props) => {
  const params = useParams<any>();

  const path = React.useMemo(() => {
    return `/${params?.dynamics_path || ""}`;
  }, [params?.dynamics_path]);

  return (
    <PickerProvider>
      <Catalogue path={path} basePath="/app/files" />
    </PickerProvider>
  );
});
