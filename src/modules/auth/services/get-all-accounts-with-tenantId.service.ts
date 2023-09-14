import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("get-all-accounts-with-tenantId", (props) => {
    const { useModel } = props.use(Data);
    const UserModel = useModel("account");

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });

    props.defineLogic(async (props) => {
        let user: any = null;
        await new Promise(async (operationComplete, error) => {
            user = await UserModel.find({
                tenantId: {
                    $exists: true
                }
            }).exec();
            operationComplete();
        });
        return props.success({ message: "Account Listed" }, user);
    });
});