import React from "react";
import { MetaStore } from "../../auth/reusables/meta-store";
import axios from "axios";

const store = new MetaStore(async (id) => {
  const res = await axios.post("/___service/main/get-user-by-id", {
    userId: id,
  });
  return res.data;
});

type WallTextPropType = {
  userId: string;
};
export const UserInfo = (props: WallTextPropType) => {
  const { userId } = props;
  const [meta, setMeta] = React.useState(null);
  React.useEffect(() => {
    store.resolveMeta(userId, (meta) => setMeta(meta));
  }, [userId]);
  if (meta) {
    return (
      <>
        <span style={{ fontSize: 15 }}>{meta.data[0] ? meta.data[0].name : ""}</span>
      </>
    );
  }
  return <span>{userId}</span>;
};
