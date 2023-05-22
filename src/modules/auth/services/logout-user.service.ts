import { defineService } from "@skyslit/ark-backend";

// Replace 'hello-service' with a unique service id (unique within the module)
export default defineService("user-logout", (props) => {
  props.defineLogic(async (props) => {
    await new Promise(async (operationComplete, error) => {
      props.logout();
      operationComplete(true);
    });
    return props.success({ message: "Successfully Logged out!" });
  });
});