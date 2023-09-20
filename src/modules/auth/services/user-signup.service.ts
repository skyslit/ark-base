import { defineService, Data } from "@skyslit/ark-backend";
import async from "async";

export default defineService("user-signup-v2", (props) => {
  const { useModel, useFolderOperations } = props.use(Data);
  const { addItem } = useFolderOperations();
  const UserModel = useModel("account");
  const MemberModel = useModel("member-assignment");
  const GroupModel = useModel("group");


  props.defineLogic(async (props) => {
    let newUser: any = null;
    let member: any = null;
    let tenantGroup: any = null;

    const { email, password, name } = props.args.input;

    await new Promise(async (operationComplete, error) => {

      const existingAccount = await UserModel.findOne({
        email,
      }).exec();

      // const group: any = await GroupModel.findOne({ groupTitle: `TENANT_${tenant_id}` }).exec();

      if (!existingAccount) {
        newUser = new UserModel({
          name: name,
          email: email,
          password: password,
          haveDashboardAccess: false
        });
        await newUser.save();

        // addItem('default', `/`, newUser.tenantId, 'folder', {}, { permissions: [{ type: 'user', policy: '', access: 'owner', userEmail: newUser.email }] }, undefined, undefined, 'supress')
        //   .then(() => addItem('default', `/${newUser.tenantId.toLowerCase()}`, "users", 'folder', {}, undefined, undefined, undefined, 'supress'))
        //   .then(() => addItem('default', `/${newUser.tenantId.toLowerCase()}`, "uploads", 'folder', {}, { permissions: [{ type: 'public', policy: '', access: 'read', userEmail: "" }] }, undefined, undefined, 'supress'))
        //   .then(() => addItem('default', `/${newUser.tenantId.toLowerCase()}`, "info", 'settings', {}, { permissions: [{ type: 'public', policy: '', access: 'read', userEmail: "" }] }, undefined, undefined, 'supress'))
      } else {
        return error({ message: "User already exists" })
      }

      // member = new MemberModel({
      //   userId: newUser._id,
      //   groupId: group._id
      // });
      // member.save()

      // group.count = group.count + 1;
      // await group.save();

      operationComplete(true);
    });
    return props.success({ message: "Account Added Successfully" },
      newUser);
  });
});