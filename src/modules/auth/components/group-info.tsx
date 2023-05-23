import React from "react";
import { MetaStore } from "../../auth/reusables/meta-store";
import axios from "axios";
import { Typography } from "antd";

const store = new MetaStore(async (id) => {
  const res = await axios.post("/___service/main/get-group-by-id", {
    groupId: id,
  });
  return res.data;
});

type WallTextPropType = {
  groupId: string;
};
export const GroupInfo = (props: WallTextPropType) => {
  const { groupId } = props;
  const [meta, setMeta] = React.useState([]);
  React.useEffect(() => {
    store.resolveMeta(groupId, (meta) => setMeta(meta));
  }, [groupId]);

  const group = meta?.data
  if (group) {

    return (
      <>
        {group[0].map((item, index) => (
          <span style={{ fontWeight: 500, paddingRight: 5 }}>
            {item.groupTitle}<br />
          </span>
        ))}

      </>
    );
  }
  return <span>{groupId}</span>;
};