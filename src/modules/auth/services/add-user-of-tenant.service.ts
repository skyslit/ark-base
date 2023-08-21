import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('add-user-of-tenant-service', (props) => {

    const { useModel } = props.use(Data);
    const AccountModel = useModel('account')
    const GroupModel = useModel('group')
    const AssignmentModel = useModel('member-assignment')

    props.defineRule((props) => {
        props.allowPolicy('ADMIN')
    });

    props.defineLogic(async (props) => {
        let newUser: any = null;
        let member: any = null;
        let newGroup: any = null;
        const tenantId = props.args.user.tenantId
        const { email, name, password } = props.args.input;
        await new Promise(async (operationComplete, error) => {
            const group : any = await GroupModel.findOne({ groupTitle: tenantId }).exec();

            if (!group) {
                newGroup = new GroupModel({
                    groupTitle: tenantId,
                });
                await newGroup.save();
            }

            newUser = new AccountModel({
                email: email,
                name: name,
                password: password,
                groupId: group ? group._id : newGroup._id,
            });
            await newUser.save();

            if (group) {
                if (group.count) {
                    group.count = group.count + 1;
                } else {
                    group.count = 1
                }
                await group.save();
            } else {
                if (newUser._id) {
                    const newgroup : any = await GroupModel.findOne({ _id: newGroup._id }).exec();
                    if (newgroup.count) {
                        newgroup.count = newgroup.count + 1;
                    } else {
                        newgroup.count = 1
                    }
                    await newgroup.save();
                }
            }

            member = new AssignmentModel({
                userId: newUser._id,
                groupId: group ? group._id : newGroup._id
            });
            await member.save();

            operationComplete();
        });

        return props.success({ message: 'User added successfully' },
            newUser);
    });
});