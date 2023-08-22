import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-users-of-tenant-table-service", (props) => {
    const { useModel } = props.use(Data);
    const GroupModel = useModel("group");
    const UserModel = useModel("account");

    props.defineRule((props) => {
        props.allowPolicy('ADMIN')
    })

    props.defineLogic(async (props) => {
        const tenantId = props.args.user.tenantId;
        const group : any = await GroupModel.findOne({ groupTitle: tenantId }).exec();
        return props.table(UserModel.find({ groupId: group._id }));
    });
});