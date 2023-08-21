import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("availability-check-of-tenantId", (props) => {
    const { useModel } = props.use(Data);
    const UserModel = useModel("account");
    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    props.defineLogic(async (props) => {
        const { tenantId } = props.args.input;
        const tenantSlug = (tenantId) => {
            return encodeURIComponent(
                String(tenantId)
                    .replace(/\W+(?!$)/g, "_")
                    .toUpperCase()
                    .replace(/\W$/, "")
            );
        };

        let isAvailable
        await new Promise(async (operationComplete, error) => {
            const existingTenantId = await UserModel.findOne({
                tenantId: tenantSlug(tenantId)
            }).exec();

            if (existingTenantId) {
                isAvailable = false
            } else {
                isAvailable = true
            }
            operationComplete(true)
        });
        return props.success({ message: "TenentId checked" }, isAvailable);
    });
});