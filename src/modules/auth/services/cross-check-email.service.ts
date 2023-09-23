import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('cross-check-email-service', (props) => {
    const { useModel } = props.use(Data);
    const AccountModel = useModel('account');
    const GroupModel = useModel('group');
    const AssignmentModel = useModel('member-assignment');

    // props.defineRule((props) => {
    //     props.allowPolicy('ADMIN');
    // });

    props.defineLogic(async (props) => {
        let userEmail: any = null;
        const { email, tenantId } = props.args.input;
        const tenant_id = tenantId.toUpperCase()

        await new Promise(async (operationComplete, error) => {

            userEmail = await AccountModel.findOne({ email: email }).exec();

            if (userEmail) {
                const group: any = await GroupModel.findOne({ groupTitle: `TENANT_${tenant_id}` }).exec();

                if (!group) {
                    const newGroup = new GroupModel({
                        groupTitle: `TENANT_${tenant_id}`,
                        count: 0,
                    });
                    await newGroup.save();
                }

                const existingMember = await AssignmentModel.findOne({
                    userId: userEmail._id,
                    groupId: group._id,
                }).exec();

                if (existingMember) {
                   return error({ message: "User is already a member of this group" });
                }
                    userEmail.groupId.push(group._id);
                    await userEmail.save();
    
                    group.count += 1;
                    await group.save();
    
                    const newDetails = new AssignmentModel({
                        userId: userEmail._id,
                        groupId: group._id,
                    });
                    await newDetails.save();
    
                    operationComplete(true);
            }
            else {
                error({ message: "Email doesn't exist" });
            }
        });

        return props.success({ message: 'Member successfully added', userEmail });
    });
});



