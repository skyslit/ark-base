import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("delete-group", (props) => {
    const { useModel } = props.use(Data);
    const GroupModel = useModel("group");
    const MemberModel = useModel("member-assignment");
    const AccountModel = useModel("account");


    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });

    props.defineLogic(async (props) => {
        await new Promise(async (operationComplete, error) => {
            const { groupId } = props.args.input;
            const groupItem = await GroupModel.findOne({ _id: groupId }).exec();
            await MemberModel.deleteMany({groupId : groupId}).exec();
            await AccountModel.updateMany({ groupId: groupId }, { $pull: { groupId: groupId } }).exec();
            if (groupItem) {
                await groupItem.remove();
                operationComplete();
            } else {
                error({ message: "Try again" });
            }
        });
        return props.success({ message: "Group deleted" });
    });
});
