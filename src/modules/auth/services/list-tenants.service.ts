import { defineService, Data } from "@skyslit/ark-backend";
import async from "async";

export default defineService("list-tenants", (props) => {
    const { useModel, useFolderOperations } = props.use(Data);
    const { updateItemSecurity } = useFolderOperations();


    // props.defineRule((props) => {
    //     props.allowPolicy('SUPER_ADMIN')
    // });

    props.defineLogic(async (props) => {
        let tenants: any = null;
        const folderApi = useFolderOperations();

        const isSuperAdmin = props.args.user.policies?.includes("SUPER_ADMIN")
        const email = props.args.user.emailAddress
        await new Promise(async (operationComplete, error) => {
            const { currentDir, items } = await folderApi.fetchContent('default', '/tenants', false);

            if (!isSuperAdmin && Array.isArray(items)) {
                const foundItems = items.filter((item) =>
                    item.security &&
                    item.security.permissions &&
                    item.security.permissions.some((permission) => permission.userEmail === email)
                );
                tenants = foundItems
            } else {
                tenants = items
            }
            operationComplete(true)
        });
        return props.success({ message: "Tenants fetched" }, tenants);
    });
});