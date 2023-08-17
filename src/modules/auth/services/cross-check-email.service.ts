import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('cross-check-email-service', (props) => {

    const { useModel } = props.use(Data);
    const AccountModel = useModel('account')
    const GroupModel = useModel('group')
    const AssignmentModel = useModel('member-assignment');

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
        props.allowPolicy('ADMIN')
    });

    props.defineLogic(async (props) => {
        let userEmail: any = null;
        let newGroup: any = null;
        let newDetails: any = null;
        const tenantId = props.args.user.tenantId;
        const { email } = props.args.input;
        await new Promise(async (operationComplete, error) => {
            userEmail = await AccountModel.findOne({ email: email }).exec();
            if (userEmail) {
                const group = await GroupModel.findOne({ groupTitle: tenantId }).exec();

                if (!group) {
                    newGroup = new GroupModel({
                        groupTitle: tenantId,
                    });
                    await newGroup.save();
                }

                const groupIdToAdd = group ? group._id : newGroup._id

                userEmail.groupId.push(groupIdToAdd);
                await userEmail.save();

                if (group) {
                    if (group.count) {
                        group.count = group.count + 1;
                    } else {
                        group.count = 1
                    }
                    await group.save();
                } else {
                    if (newUser._id) {
                        const group = await GroupModel.findOne({ _id: newGroup._id }).exec();
                        group.count = group.count + 1;
                        await group.save();
                    }
                }
                newDetails = new AssignmentModel({
                    userId: userEmail._id,
                    groupId: groupIdToAdd,
                });
                await newDetails.save();
                operationComplete();
            } else {
                error({ message: "Email didn't exist" });
            }
        });
        return props.success({ message: 'Email fetched' },
            userEmail);
    });
});