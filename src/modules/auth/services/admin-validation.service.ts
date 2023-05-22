import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("admin-validation", (props) => {
    const { useModel } = props.use(Data);
    const UserModel = useModel("account");
    props.defineLogic(async (props) => {
        let user: any = null;
        await new Promise(async (operationComplete, error) => {
            user = await UserModel.find({}).exec();
            operationComplete();
        });
        return props.success({ message: "Account validated" }, user);
    });
});