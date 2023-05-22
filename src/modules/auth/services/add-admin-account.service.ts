import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("add-admin-account", (props) => {
  const { useModel } = props.use(Data);
  const AddAdminModel = useModel("account");
  const GroupModel = useModel("group");
  const MemberModel = useModel("member-assignment");
  props.defineLogic(async (props) => {
    let newAdminAccount: any = null;
    let newGroup: any = null;
    let newMember: any = null;
    let findAccount: any = null;
    const { email, password } = props.args.input;
    await new Promise(async (operationComplete, error) => {
      const existingAccount = await AddAdminModel.findOne({
        email,
      }).exec();
      if (!existingAccount) {
        newAdminAccount = new AddAdminModel({
          name:"Super admin",
          email: email,
          password: password,
        });
        await newAdminAccount.save();
        
        newGroup = new GroupModel({
          groupTitle: "SUPER_ADMIN",
          count:1
        });
        await newGroup.save();

        newMember = new MemberModel({
        userId: newAdminAccount._id,
        groupId: newGroup._id
        });

        await newMember.save();

        findAccount = await AddAdminModel.findOne({
        _id:newAdminAccount._id
      }).exec();

      if(findAccount){
        findAccount.groupId = newGroup._id;
        await findAccount.save();
      }
        operationComplete(true);
      } else {
        error({ message: "Email already in use" });
      }
    });
    return props.success({ message: "Account Added Successfully" }, [
      newAdminAccount, newGroup,newMember,findAccount
    ]);
  });
});
