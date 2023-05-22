import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("get-user-by-id", (props) => {
  const { useModel } = props.use(Data);
  const AccountModel = useModel("account");
  props.defineLogic(async (props) => {
    let user: any = null;
    await new Promise(async (operationComplete, error) => {
      const { userId } = props.args.input;
      user = await AccountModel.find({ _id: userId }).exec();
      operationComplete();
    });
    return props.success({ message: "Users listed" }, user);
  });
});