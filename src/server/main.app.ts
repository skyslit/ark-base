import {
  createContext,
  useEnv,
  setDefaultEnv,
  resolveEnvironmentVar,
  getRuntimeVars,
} from "@skyslit/ark-core";
import { Backend, Data, Security } from "@skyslit/ark-backend";
import MainAPIModule from "../modules/main/api.module";
import webAppCreator from "../web.client";
import webspaceCredentials from "../modules/main/toolkit/providers/webspace-credentials";

setDefaultEnv({
  MONGO_IMPORT_BIN_PATH: "mongoimport",
  MONGO_CONNECTION_STRING: "mongodb://localhost:27017/dynamics-base",
  NODE_PORT: "3000",
});

export default createContext(async ({ use, useModule, useDataFromContext }) => {
  await resolveEnvironmentVar([
    {
      resolver: webspaceCredentials,
      keys: Object.keys({ ...getRuntimeVars(), ...process.env }).filter((key) =>
        key.startsWith("ws_cred___")
      ),
    },
  ]);

  const { useDatabase, useModel } = use(Data);
  const { useServer, useRoute, useWebApp } = use(Backend);
  const { enableAuth } = use(Security);

  useDatabase("default", useEnv("MONGO_CONNECTION_STRING"));

  enableAuth({
    jwtSecretKey: "SECRET_123",
    enableExternalAuthServer: true,
    getInternalAppByAccessKeyId: async (key) => {
      // @ts-ignore
      const AppModel: any = useDataFromContext(
        "main/app",
        undefined,
        undefined,
        "model"
      );
      const app: any = await AppModel.findOne({ accessKeyId: key });
      return app;
    },
    deserializeUser: async (user) => {
      if (user && user?._id) {
        // @ts-ignore
        const AccountModel: any = useDataFromContext(
          "main/account",
          undefined,
          undefined,
          "model"
        );
        const GroupModel: any = useDataFromContext(
          "main/group",
          undefined,
          undefined,
          "model"
        );
        const userInfo: any = await AccountModel.findOne({
          _id: user._id,
        }).exec();

        if (!userInfo) {
          return user;
        }

        const groupInfo: any = await GroupModel.find({
          _id: { $in: userInfo.groupId },
        }).exec();
        let groups: any = [];

        if (groupInfo) {
          groups = groupInfo.map((group) => {
            return group.groupTitle;
          });
        }

        return {
          groupId: userInfo.groupId,
          _id: userInfo._id,
          name: userInfo.name,
          emailAddress: userInfo.email,
          haveDashboardAccess: userInfo.haveDashboardAccess,
          tenantId: userInfo.tenantId,
          password: undefined,
          policies: groups,
          deserialized: true,
        };
      }
      return user;
    },
    async blacklistToken(token, issuedAt) {
      // @ts-ignore
      const BlacklistedTokenModel: any = useDataFromContext(
        "main/blacklisted_token",
        undefined,
        undefined,
        "model"
      );
      await BlacklistedTokenModel.updateOne(
        {
          token,
        },
        {
          $set: {
            iat: issuedAt,
          },
        },
        { upsert: true }
      );

      console.log(`Blacklisted one token`);

      return true;
    },
    async isTokenBlacklisted(token) {
      // @ts-ignore
      const BlacklistedTokenModel: any = useDataFromContext(
        "main/blacklisted_token",
        undefined,
        undefined,
        "model"
      );
      const blacklistedToken = await BlacklistedTokenModel.findOne({ token });
      return Boolean(blacklistedToken);
    },
  });

  useModule("main", MainAPIModule);

  useRoute("get", "/*", useWebApp("web", webAppCreator).render());

  useServer({
    port: parseInt(useEnv("NODE_PORT")),
  });
});
