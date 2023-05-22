import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('find-user-email', (props) => {
    const { useModel } = props.use(Data);
    const userData = useModel("account");
    props.defineLogic(async (props) => {
        let hasUserUpdated: boolean = false;
        let user: any = null;
        await new Promise(async (operationComplete, error) => {
            const { email } = props.args.input;
            user = await userData.findOne({ email: email }).exec();
            if (user) {
                await user.save();
                hasUserUpdated = true;
                operationComplete(true);

            } else {
                error({ message: "User with email is not found" });
            }
        });
        return props.success({
            userUpdated: hasUserUpdated,
            message: "User with email is fetched sucessfully",
        },
            [user]);
    });
});