
import { defineService, Data } from "@skyslit/ark-backend";
import { UserDocument } from "../types/user-type.ts";

export default defineService("change-password", (props) => {
  const { useModel } = props.use(Data);
  const AccountModel = useModel<UserDocument>("account");
  props.defineLogic(async (props) => {
    let user: UserDocument = {};
    await new Promise(async (operationComplete, error) => {
      const { newPassword, oldPassword } = props.args.input;
      const accountId = (props.args.user as any)._id;
      user = await AccountModel.findOne({ _id: accountId }).exec();
      user.verifyPassword(oldPassword, async (err: any, isMatch: any) => {
        if (err) {
          error(err);
        } else {
          if (isMatch === true) {
            if (user) {
              user.password = newPassword;
              await user.save();
              operationComplete(true);
            } else {
              error({ message: "Incorrect Password" });
            }
          } else {
            error({ message: " Passwords do not match" });
          }
        }
      });
    });
    return props.success({ message: "Password Updated Successfully" }, []);
  });
});