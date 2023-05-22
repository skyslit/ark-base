import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('remove-member-service', (props) => {
    const { useModel } = props.use(Data);
    const MemberModel = useModel("member-assignment");
    const GroupModel = useModel("group")
    const AccountModel = useModel("account")

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });

    props.defineLogic(async (props) => {
        await new Promise(async (operationComplete, error) => {
            const { userId, groupId } = props.args.input;
            const accountItem = await MemberModel.findOne({ userId: userId }).exec();
            const group = await GroupModel.findOne({ _id: groupId }).exec();

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
