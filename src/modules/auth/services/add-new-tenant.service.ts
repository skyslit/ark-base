import { defineService, Data } from "@skyslit/ark-backend";
import async from "async";

export default defineService("add-new-tenant", (props) => {
    const { useModel, useFolderOperations } = props.use(Data);
    const { addItem } = useFolderOperations();
    const UserModel = useModel("account");
    const MemberModel = useModel("member-assignment");
    const GroupModel = useModel("group");

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });

    props.defineLogic(async (props) => {
        let tenantGroup: any = null;

        const { tenantId } = props.args.input;
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
            addItem('default', `/`, "Tenants", 'folder', {}, {
                permissions: [
                    { type: 'public', policy: '', access: 'read', userEmail: "" },
                ],
            }, undefined, undefined, 'supress')
                .then(() => {
                    addItem('default', `/tenants`, newTenant, 'folder', {}, {}, undefined, undefined, 'supress').then(() => {
                        addItem('default', `/tenants/${newTenant.toLowerCase()}`, "global", 'folder', {}, {}, undefined, undefined, 'supress').then(() => {
                            addItem('default', `/tenants/${newTenant.toLowerCase()}/global`, "dashboards", 'folder', {}, {}, undefined, undefined, 'supress').then(() => {
                                addItem('default', `/tenants/${newTenant.toLowerCase()}/global/dashboards`, "default", 'dashboard', {}, {}, undefined, undefined, 'supress').then(() => {
                                    addItem('default', `/tenants/${newTenant.toLowerCase()}`, "info", 'settings', {}, {
                                        permissions: [
                                            { type: 'public', policy: '', access: 'read', userEmail: "" },
                                        ],
                                    }, undefined, undefined, 'supress').then(() => {
                                        addItem('default', `/tenants/${newTenant.toLowerCase()}`, "users", 'folder', {}, {}, undefined, undefined, 'supress').then(() => {
                                            addItem('default', `/tenants/${newTenant.toLowerCase()}`, "uploads", 'folder', {}, {
                                                permissions: [
                                                    { type: 'public', policy: '', access: 'read', userEmail: "" },
                                                ],
                                            }, undefined, undefined, 'supress')
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            tenantGroup = new GroupModel({
                groupTitle: `TENANT_${newTenant}`,
                count: 0,
                description: ""
            });
            await tenantGroup.save();
            operationComplete(true)
        });
        return props.success({ message: "Tenant Added Successfully" }, [tenantGroup]);
    });
});