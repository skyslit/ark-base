import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('remove-user-of-tenant-service', (props) => {
    const { useModel } = props.use(Data);
    const MemberModel = useModel("member-assignment");
    const GroupModel = useModel("group")
    const AccountModel = useModel("account")

    // props.defineRule((props) => {
    //     props.allowPolicy('ADMIN')
    // });

    props.defineLogic(async (props) => {
        await new Promise(async (operationComplete, error) => {
            const { userId,tenantId } = props.args.input;
            const tenant_id = tenantId.toUpperCase()

            const accountItem = await MemberModel.findOne({ userId: userId }).exec();
            const group: any = await GroupModel.findOne({ groupTitle: `TENANT_${tenant_id}` }).exec();

            if (accountItem) {
                if (group) {
                    const groupId = group._id;
                    group.count = group.count - 1;
                    await AccountModel.updateOne({ _id: userId }, { $pull: { groupId: groupId } }).exec();
                    await group.save();
                    operationComplete(true);
                } else {
                    error({ message: "Try again" });
                }
                await accountItem.remove();
            } else {
                error({ message: "Try again" });
            }
        });
        return props.success({ message: "Member removed" });
    });
});
