import React from "react";
import Icon from "@ant-design/icons";

export default (props: any) => {
    return (
        <div style={{ height: props.style.height, width: props.style.width, position: 'relative' }}>
            <Icon component={props.component} style={{ width: '100%', height: '100%', fontSize: props.style.fontSize, color: props.style.color, display: 'block' }} />
            <div style={{ fontSize: Math.round(props.style.fontSize * 24 / 100), position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {props.icon}
            </div>
        </div>
    )
}
