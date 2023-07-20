import React from "react";
import { Button } from "antd";
import "./binary-view.scss";
import { useCatalogue } from "@skyslit/ark-frontend/build/dynamics-v2";
import { DownloadOutlined } from "@ant-design/icons";
import {
  BlackDownloadIcon,
  DiscardIcon,
  WhiteDownloadIcon,
} from "../icons/global-icons";
import { generateFileLink } from "@skyslit/ark-frontend/build/dynamics-v2/widgets/catalogue";
import { useHistory } from "react-router-dom";

export default (props: any) => {
  const api = useCatalogue();
  const history = useHistory();

  return (
    <div className="binary-view-wrapper">
      <div className="header-download-section-wrapper">
        <div>
          <span className="file-name-text">{api?.currentDir?.name}</span>
        </div>
        <div className="btn-section">
          <Button
            className="header-download-btn"
            type="text"
            icon={<BlackDownloadIcon />}
            href={generateFileLink(
              api?.currentDir?.path,
              "download",
              api?.currentDir?.namespace
            )}
            target="_blank"
          >
            Download
          </Button>
          <Button
            className="header-discard-btn"
            type="text"
            onClick={() =>
              history.push(
                `${api.getFullUrlFromPath(api?.currentDir?.parentPath)}`
              )
            }
          >
            <DiscardIcon />
          </Button>
        </div>
      </div>
      <div className="binary-content-wrappper">
        <span className="preview-text">Preview not available</span>
        <span className="download-text">
          Please download this file and view it from your device
        </span>
        <Button
          className="download-btn"
          type="text"
          href={generateFileLink(
            api?.currentDir?.path,
            "download",
            api?.currentDir?.namespace
          )}
          target="_blank"
          icon={<WhiteDownloadIcon />}
        >
          Download
        </Button>
      </div>
    </div>
  );
};
