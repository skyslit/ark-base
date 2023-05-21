import { Backend } from "@skyslit/ark-backend";
import { createModule } from "@skyslit/ark-core";

export default createModule(({ use }) => {
  const { enableDynamicsV2Services } = use(Backend);
  console.log("api.module.ts loaded");

  enableDynamicsV2Services();
});
