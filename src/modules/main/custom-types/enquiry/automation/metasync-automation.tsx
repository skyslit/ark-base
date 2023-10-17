import { Automators } from "@skyslit/ark-backend/build/dynamics-v2";

export const EnquiryMetaSyncAutomator =  Automators.createMetaSyncAutomator((api) => {
      api.updateMeta({
        name: api.file.name,
        email: api.file.email,
        username: api.file.username,
    });
  })
