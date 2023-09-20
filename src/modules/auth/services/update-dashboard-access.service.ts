import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('update-dashboard-access', (props) => {
    const { useModel } = props.use(Data);
    const userData = useModel("account");
    props.defineLogic(async (props) => {
        let data: any = null;
        await new Promise(async (operationComplete, error) => {
            const { userId, haveAccess } = props.args.input;
            data = await userData.findOne({ _id: userId }).exec();
            if (data) {
                data.haveDashboardAccess = haveAccess
                await data.save()
            } else {
                return error({ message: "Account not found!" })
            }
            operationComplete(true)
        });
        return props.success({
            message: "Access updated fo user",
        }, data);
    });
});
