import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('add-user-of-tenant-service', (props) => {

    const { useModel, useFolderOperations } = props.use(Data);
    const AccountModel = useModel('account')
    const GroupModel = useModel('group')
    const AssignmentModel = useModel('member-assignment')

    // props.defineRule((props) => {
    //     props.allowPolicy('ADMIN')
    // });

    props.defineLogic(async (props) => {
        let newUser: any = null;
        let member: any = null;
        let newGroup: any = null;
        // const tenantId = props.args.user.tenantId
        const { email, name, password, tenantId } = props.args.input;
        const tenant_id = tenantId.toUpperCase()
        await new Promise(async (operationComplete, error) => {
            const group: any = await GroupModel.findOne({ groupTitle: `TENANT_${tenant_id}` }).exec();

            if (!group) {
                newGroup = new GroupModel({
                    groupTitle: `TENANT_${tenant_id}`,
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
                    const newgroup: any = await GroupModel.findOne({ _id: newGroup._id }).exec();
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

            const folderApi = useFolderOperations();
            folderApi
                .addItem(
                    "default",
                    "/users",
                    email,
                    "folder",
                    {},
                    {
                        permissions: [
                            {
                                type: "user",
                                policy: "",
                                userEmail: email,
                                access: "owner",
                            },
                        ],
                    },
                    false,
                    undefined,
                    "supress",
                    true
                )
                .then((userRoot) => {
                    return folderApi.addItem(
                        "default",
                        userRoot.path,
                        'dashboards',
                        "folder",
                        {},
                        {
                            permissions: [],
                        },
                        false,
                        undefined,
                        "supress",
                        true
                    ).then(() => userRoot)
                })
                .then((userRoot) => folderApi.addItem(
                    "default",
                    userRoot.path,
                    'quick links',
                    "folder",
                    {},
                    {
                        permissions: [],
                    },
                    false,
                    undefined,
                    "supress",
                    true
                ))
                // .then(async (userRoot) => {
                //     if (tenantId) {
                //         const { currentDir, items } = await folderApi.fetchContent('default', userRoot.path, false);
                //         const containsTenantId = items.some(item => item.name === tenantId);
                //         if (!containsTenantId) {
                //             return folderApi.createShortcut('default', `/tenants/${tenantId.toLowerCase()}`, userRoot.path, tenantId);
                //         }
                //     }
                // })
                // folderApi.createShortcut()

            operationComplete(true);
        });

        return props.success({ message: 'User added successfully' },
            newUser);
    });
});