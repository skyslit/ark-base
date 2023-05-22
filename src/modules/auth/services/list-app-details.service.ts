import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-app-details", (props) => {
    const { useModel } = props.use(Data);
    const AppModel = useModel("app");
    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    props.defineLogic(async (props) => {
        const {appId } = props.args.input;
        return props.table(AppModel.find({appId:appId}));
    });
});
