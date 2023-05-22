import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("delete-app", (props) => {
    const { useModel } = props.use(Data);
    const AppModel = useModel("app");
    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    props.defineLogic(async (props) => {
        await new Promise(async (operationComplete, error) => {
            const { appId } = props.args.input;
            const appItem = await AppModel.findOne({ _id: appId }).exec();
            if (appItem) {
                await appItem.remove();
                operationComplete();
            } else {
                error({ message: "Something wrong!" });
            }
        });
        return props.success({ itemDeleted: true }, []);
    });
});