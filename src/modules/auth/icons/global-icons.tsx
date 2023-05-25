import React from "react";
import Icon from "@ant-design/icons";

// @ts-ignore
import SiderFolder from "../icons/sider-folder.svg";
// @ts-ignore
import SiderAnalyticsChart from "../icons/sider-analytics-chart.svg";
// @ts-ignore
import SiderLeftChevron from "../icons/sider-left-chevron.svg";
// @ts-ignore
import SiderSettings from "../icons/sider-settings.svg";
// @ts-ignore
import DashboardAdd from "../icons/dashboard-add-icon.svg";
// @ts-ignore

export const SiderFolderIcon = (props: any) => {
    return <Icon component={SiderFolder} {...props} />;
};
export const SiderAnalyticsChartIcon = (props: any) => {
    return <Icon component={SiderAnalyticsChart} {...props} />;
};
export const SiderLeftChevronIcon = (props: any) => {
    return <Icon component={SiderLeftChevron} {...props} />;
};
export const SiderSettingsIcon = (props: any) => {
    return <Icon component={SiderSettings} {...props} />;
};
export const DashboardAddIcon = (props: any) => {
    return <Icon component={DashboardAdd} {...props} />;
};