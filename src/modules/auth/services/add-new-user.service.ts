import { defineService, Data } from "@skyslit/ark-backend";
import async from "async";

export default defineService("add-user", (props) => {
  const { useModel, useFolderOperations } = props.use(Data);
  const { addItem } = useFolderOperations();
  const UserModel = useModel("account");
  const MemberModel = useModel("member-assignment");
  const GroupModel = useModel("group");

  props.defineRule((props) => {
    props.allowPolicy('SUPER_ADMIN')
  });

  props.defineLogic(async (props) => {
    let newUser: any = null;
    let member: any = null;
    let tenantGroup: any = null;

    const { email, password, groupId, name, tenantId } = props.args.input;

    const tenantSlug = (tenantId) => {
      return encodeURIComponent(
        String(tenantId)
          .replace(/\W+(?!$)/g, "_")
          .toUpperCase()
          .replace(/\W$/, "")
      );
    };

    await new Promise(async (operationComplete, error) => {
      const existingAccount = await UserModel.findOne({
        email,
      }).exec();

      if (!existingAccount) {
        newUser = new UserModel({
          name: name,
          email: email,
          password: password,
          groupId: groupId,
          tenantId: tenantSlug(tenantId)
        });
        await newUser.save();

        if (newUser.tenantId) {
          tenantGroup = new GroupModel({
            groupTitle: newUser.tenantId,
            count: 0,
            description: ""
          });
          await tenantGroup.save();

          addItem('default', `/`, newUser.tenantId, 'folder', {}, { permissions: [{ type: 'user', policy: '', access: 'owner', userEmail: newUser.email }] }, undefined, undefined, 'supress')
            .then(() => addItem('default', `/${newUser.tenantId.toLowerCase()}`, "users", 'folder', {}, undefined, undefined, undefined, 'supress'))
            .then(() => addItem('default', `/${newUser.tenantId.toLowerCase()}`, "uploads", 'folder', {}, { permissions: [{ type: 'public', policy: '', access: 'read', userEmail: "" }] }, undefined, undefined, 'supress'))
            .then(() => addItem('default', `/${newUser.tenantId.toLowerCase()}`, "info", 'settings', {}, { permissions: [{ type: 'public', policy: '', access: 'read', userEmail: "" }] }, undefined, undefined, 'supress'))
        }

        async.forEach(groupId, (id, next) => {
          member = new MemberModel({
            userId: newUser._id,
            groupId: id
          });
          member.save()
          next();
        });
        async.forEach(groupId, async (id, next) => {
          const group = await GroupModel.findOne({
            _id: id
          });
          group.count = group.count + 1;
          await group.save();
          next();
        })
        operationComplete(true);

      } else {
        error({ message: "Email already in use" });
      }
    });
    return props.success({ message: "Account Added Successfully" },
      [newUser], [member]);
  });
});