import { defineService, Data } from "@skyslit/ark-backend";
import async from "async"

export default defineService("delete-user-service", (props) => {
  const { useModel } = props.use(Data);
  const UserModel = useModel("account");
  const MemberModel = useModel("member-assignment");
  const GroupModel = useModel("group")

  props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    
  props.defineLogic(async (props) => {
    await new Promise(async (operationComplete, error) => {
      const { userId } = props.args.input;
      const accountItem = await UserModel.findOne({ _id: userId }).exec();

      const groups: any = await GroupModel.find({ _id: { $in: accountItem.groupId } }).exec();
      await MemberModel.deleteMany({ userId: userId }).exec();
      if (accountItem) {
        await accountItem.remove();
      } else {
        error({ message: "Try again" });
      }
      async.forEach(groups, async (group, next) => {
        const item = await GroupModel.findOne({
          _id: group._id
        });
        item.count = group.count - 1;
        await item.save();
        next();
      })
      operationComplete();

    });
    return props.success({ message: "User deleted" });
  });
});
