


import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('change-user-password', (props) => {
  const { useModel } = props.use(Data);
  const AccountModel = useModel("account");

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    
  props.defineLogic(async (props) => {
    let hasPasswordUpdated: boolean = false;
    let account: any = null;
    await new Promise(async (operationComplete, error) => {
      const { password, accountId } = props.args.input;
      account = await AccountModel.findOne({ _id: accountId }).exec();
      if (account) {
        account.password = password;
        await account.save();
        hasPasswordUpdated = true;
        operationComplete(true);
      } else {
        error({ message: "Try again" });
      }
    });
    return props.success({
      passwordUpdated: hasPasswordUpdated,
      message: "Password updated successfully",
    },
      [account]);
  });
});