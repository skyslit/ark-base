import { createContext, useEnv, setDefaultEnv } from "@skyslit/ark-core";
import { Backend, Data } from "@skyslit/ark-backend";
import MainAPIModule from "../modules/main/api.module";
import webAppCreator from "../web.client";

setDefaultEnv({
  MONGO_CONNECTION_STRING: "mongodb://localhost:27017/dynamics-base",
  NODE_PORT: "3000",
});

export default createContext(({ use, useModule }) => {
  const { useDatabase } = use(Data);
  const { useServer, useRoute, useWebApp } = use(Backend);

  useDatabase("default", useEnv("MONGO_CONNECTION_STRING"));

  useModule("main", MainAPIModule);

  useRoute("get", "/*", useWebApp("web", webAppCreator).render());

  useServer({
    port: parseInt(useEnv("NODE_PORT")),
  });
});
