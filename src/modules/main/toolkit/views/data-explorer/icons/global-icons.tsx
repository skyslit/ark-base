import React from "react";
import Icon, { AudioOutlined, CameraOutlined, FileImageOutlined, FilePdfOutlined, VideoCameraOutlined } from "@ant-design/icons";

import FolderIcon from "./folder-icons.svg";
import ShortcutIcon from "./shortcut.svg";
import file from "./file-icon.svg";
import blackDownload from "./black-download-icon.svg";
import whiteDownload from "./white-download-icon.svg";
import discard from "./discard-icon.svg";
import BinaryFile from "./binary-file-icon.svg";
import SmartIcon from "./smart-icon";
import gridIcon from "./window_grid_icon.svg";
import listIcon from "./window_list_icon.svg";
import selectDownIcon from "./select-down-arrow-outlined.svg";


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

export const GridOutlined = (props: any) => {
  return <Icon component={gridIcon} {...props} />;
};

export const ListOutlined = (props: any) => {
  return <Icon component={listIcon} {...props} />;
};

export const DownArrowOutlined = (props: any) => {
  return <Icon component={selectDownIcon} {...props} />;
};

export const BinaryFileIcon = (props: any) => {
  const component = React.useMemo(() => {
    if (String(props?.item?.binaryMeta?.mimeType).startsWith('image/'))
      return (
        <SmartIcon icon={<FileImageOutlined />} component={BinaryFile} style={{ ...props.style, color: "#f3a968" }} />
      )
    if (String(props?.item?.binaryMeta?.mimeType).startsWith('application/'))
      return (
        <SmartIcon icon={<FilePdfOutlined />} component={BinaryFile} style={{ ...props.style, color: "#FFFFFF" }} />
      )
    if (String(props?.item?.binaryMeta?.mimeType).startsWith('video/'))
      return (
        <SmartIcon icon={<VideoCameraOutlined />} component={BinaryFile} style={{ ...props.style, color: "#FCD7D7" }} />
      )
    if (String(props?.item?.binaryMeta?.mimeType).startsWith('audio/'))
      return (
        <SmartIcon icon={<AudioOutlined />} component={BinaryFile} style={{ ...props.style, color: "#DED7FC" }} />
      )
    else
      return (
        <Icon component={BinaryFile} {...props} style={{ ...props.style, color: "white" }} />
      )
  }, [props?.item?.binaryMeta?.mimeType]);

  return component;
};