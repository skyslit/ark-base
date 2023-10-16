import { Automators } from "@skyslit/ark-backend/build/dynamics-v2";

export const EnquiryMetaSyncAutomator =  Automators.createMetaSyncAutomator((api) => {
    console.log("hh",api.file)
      api.updateMeta({
        name: api.file.name,
        email: api.file.email,
        username: api.file.username,
    });
  })
