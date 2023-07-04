import React from "react";
import Icon from "@ant-design/icons";

import FolderIcon from "./folder-icons.svg";
import ShortcutIcon from "./shortcut.svg";
import file from "./file-icon.svg";
import blackDownload from "./black-download-icon.svg";
import whiteDownload from "./white-download-icon.svg";
import discard from "./discard-icon.svg";


export const Folder = (props: any) => {
  return <Icon component={FolderIcon} {...props} />;
};

export const Shortcut = (props: any) => {
  return <Icon component={ShortcutIcon} {...props} />;
};

export const FileIcon = (props: any) => {
  return <Icon component={file} {...props} />;
};

export const BlackDownloadIcon = (props: any) => {
  return <Icon component={blackDownload} {...props} />;
};

export const WhiteDownloadIcon = (props: any) => {
  return <Icon component={whiteDownload} {...props} />;
};

export const DiscardIcon = (props: any) => {
  return <Icon component={discard} {...props} />;
};