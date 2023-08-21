import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-all-tenants", (props) => {
  const { useModel } = props.use(Data);
  const UserModel = useModel("account");
  const GroupModel = useModel("group");

  props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    
  props.defineLogic(async (props) => {
    const group : any = await GroupModel.findOne({ groupTitle: "ADMIN" }).exec();
    return props.table(
      UserModel.find({
        tenantId: { $exists: true, $ne: "" },
        groupId: { $in: group._id }
      })
    );
  });
});