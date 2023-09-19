import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("check-for-existing-email", (props) => {
    const { useModel, useFolderOperations } = props.use(Data);
    const { updateItemSecurity } = useFolderOperations();
    const UserModel = useModel("account");

    props.defineLogic(async (props) => {
        let isUserExist: any = null;
        const { email } = props.args.input;

        await new Promise(async (operationComplete, error) => {
            const existingAccount = await UserModel.findOne({
                email,
            }).exec();
            if (existingAccount) {
                isUserExist = true
            } else {
                isUserExist = false
            }
            operationComplete(true)
        });
        return props.success({ message: "" }, isUserExist);
    });
});