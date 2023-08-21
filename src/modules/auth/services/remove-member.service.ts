import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('remove-member-service', (props) => {
    const { useModel } = props.use(Data);
    const MemberModel = useModel("member-assignment");
    const GroupModel = useModel("group")
    const AccountModel = useModel("account")

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
        props.allowPolicy('ADMIN')
    });

    props.defineLogic(async (props) => {
        let group
        await new Promise(async (operationComplete, error) => {
            const { userId, groupId } = props.args.input;
            const tenantId = props.args.user.tenantId;
            const accountItem = await MemberModel.findOne({ userId: userId }).exec();
            if (tenantId){
                 group = await GroupModel.findOne({ groupTitle: tenantId }).exec();
            }
            else{
                 group = await GroupModel.findOne({ _id: groupId }).exec();
            }

            if (accountItem) {
                await accountItem.remove();
                if (group) {
                    group.count = group.count - 1;
                    await AccountModel.updateOne({ _id: userId }, { $pull: { groupId: groupId } }).exec();
                    await group.save();
                    operationComplete(true);
                } else {
                    error({ message: "Try again" });
                }
            } else {
                error({ message: "Try again" });
            }
        });
        return props.success({ message: "Member removed" });
    });
});
