import React from "react";
import Icon from "@ant-design/icons";

import FolderIcon from "./folder-icons.svg";
import ShortcutIcon from "./shortcut.svg";
import file from "./file-icon.svg";


export const Folder = (props: any) => {
  return <Icon component={FolderIcon} {...props} />;
};

export const Shortcut = (props: any) => {
  return <Icon component={ShortcutIcon} {...props} />;
};

export const FileIcon = (props: any) => {
  return <Icon component={file} {...props} />;
};
