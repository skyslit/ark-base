import { createEnvVariableResolver, useEnv } from "@skyslit/ark-core";
import axios from "axios";

export default createEnvVariableResolver({
  id: "webspace-resolver",
  test: () => {
    const TENANT_ID = useEnv("WS_CRED_SERVICE_TENANT_ID");
    const CLIENT_ID = useEnv("WS_CRED_SERVICE_CLIENT_ID");
    const CLIENT_SECRET = useEnv("WS_CRED_SERVICE_CLIENT_SECRET");

    return Boolean(TENANT_ID) && Boolean(CLIENT_ID) && Boolean(CLIENT_SECRET);
  },
  getValueByKeys: async (keys) => {
    let result: { [key: string]: string } = {};

    try {
      const COMPASS_SRV_URL = "https://compass-services.skyslit.com";

      const TENANT_ID = useEnv("WS_CRED_SERVICE_TENANT_ID");
      const CLIENT_ID = useEnv("WS_CRED_SERVICE_CLIENT_ID");
      const CLIENT_SECRET = useEnv("WS_CRED_SERVICE_CLIENT_SECRET");

      console.log(`Azure KeyVault initializing...`);

      const credentialIds = keys.map((k) => k.value);

      const res = await axios({
        method: "POST",
        baseURL: COMPASS_SRV_URL,
        url: "/api/v1/resolve-credentials",
        data: {
          tenantId: TENANT_ID,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          credentialIds,
        },
      });

      let resolvedValues: any[] = [];

      if (res.data) {
        resolvedValues = res.data.result || [];
      }

      result = keys.reduce((acc, key) => {
        const val = resolvedValues.find((r) => r.credId === key.value);
        if (val) {
          acc[key.original] = val.value;
          acc[String(key.original).replace("ws_cred___", "")] = val.value;
        }
        return acc;
      }, {});
    } catch (e) {
      if (e?.response?.data?.message) {
        console.error(e?.response?.data?.message);
      } else if (e?.message) {
        console.error(e?.message);
      } else {
        console.error(e);
      }
    }

    return result;
  },
});
