import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('email-otp-verification', (props) => {
    const { useModel } = props.use(Data);
    const AccountModel = useModel("account");
    props.defineLogic(async (props) => {
        let user: any = null;
        await new Promise(async (operationComplete, error) => {
            const { userId, email } = props.args.input;
            user = await AccountModel.findOne({ _id: userId }).exec();
            if (user) {
                user.email = email ? email : user.email;
                await user.save();
                operationComplete(true);
            } else {
                error({ message: "User with this id not found" });
            }
        });
        return props.success({ message: "Email changed successfully" }, [user]);
    });
});