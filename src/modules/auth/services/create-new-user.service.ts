import { defineService, Data } from "@skyslit/ark-backend";
import async from "async";

export default defineService("create-user", (props) => {
    const { useModel, useFolderOperations } = props.use(Data);
    const { updateItemSecurity } = useFolderOperations();
    const UserModel = useModel("account");
    const MemberModel = useModel("member-assignment");
    const GroupModel = useModel("group");

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });

    props.defineLogic(async (props) => {
        let newUser: any = null;
        const { email, password, groupId, name, tenantId, isNewUser } = props.args.input;
        const tenantSlug = (tenantId) => {
            return encodeURIComponent(
                String(tenantId)
                    .replace(/\W+(?!$)/g, "_")
                    .toUpperCase()
                    .replace(/\W$/, "")
            );
        };

        const newTenant = tenantSlug(tenantId);

        await new Promise(async (operationComplete, error) => {
            if (isNewUser) {
                const existingAccount = await UserModel.findOne({
                    email,
                }).exec();

                if (!existingAccount) {
                    newUser = new UserModel({
                        name: name,
                        email: email,
                        password: password,
                        tenantId: newTenant,
                        haveDashboardAccess: true,
                    });
                    await newUser.save();

                    if (newUser.tenantId) {
                        updateItemSecurity('default', `/tenants/${newTenant.toLowerCase()}`, { permissions: [{ type: 'user', policy: '', access: 'owner', userEmail: newUser.email }] })
                    }
                    operationComplete(true);
                } else {
                    error({ message: "Email already in use" });
                }
            } else {
                const existingAccount: any = await UserModel.findOne({
                    email,
                }).exec();

                if (!existingAccount) {
                    return error({ message: "Cannot find user with the provided email" });
                }
                else {
                    updateItemSecurity('default', `/tenants/${newTenant.toLowerCase()}`, { permissions: [{ type: 'user', policy: '', access: 'owner', userEmail: existingAccount.email }] })
                    operationComplete(true);
                }
            }
        });
        return props.success({ message: "Account Added Successfully" }, [newUser]);
    });
});