import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("update-name-service", (props) => {
  const { useModel } = props.use(Data);
  const AccountModel = useModel("account");

  props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });

  props.defineLogic(async (props) => {
    let user: any = null;
    await new Promise(async (operationComplete, error) => {
      const { userId,name } = props.args.input;
      user = await AccountModel.findOne({ _id: userId}).exec();
      if (user) {
          user.name = name ? name : user.name;
        await user.save();
        operationComplete(true);
      } else {
        error({ message: "User with this id not found" });
      }
    });
    return props.success(
      {
        message: "Updated successfully",
      },[user],
    );
  });
});