import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-user-service", (props) => {
    const { useModel } = props.use(Data);
    const UserModel = useModel("account");

props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });

    props.defineLogic(async (props) => {
        let user: any = null;
        await new Promise(async (operationComplete, error) => {
            user = await UserModel.find({}).exec();
            operationComplete();
        });
        return props.success({ message: "Account Listed" }, user);
    });
});